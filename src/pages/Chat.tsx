import React, { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { 
  initSocket, 
  registerUserLogin, 
  onMessageReceive, 
  onOnlineUsersUpdate, 
  sendMessage as sendSocketMessage,
  ChatUser,
  disconnectSocket
} from '@/lib/socketService';
import { 
  subscribeToConversations, 
  subscribeToMessages, 
  sendMessage as sendFirestoreMessage,
  getChatUsers,
  Conversation
} from '@/lib/messageService';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatWindow from '@/components/chat/ChatWindow';

export interface PendingFile {
  file: File;
  preview?: string;
  type: "image" | "document";
}

const MAX_FILES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const COMPRESSION_QUALITY = 0.7;
const MAX_IMAGE_WIDTH = 1200;
const ALLOWED_TYPES = [
  "image/jpeg", "image/png", "image/gif", "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

function compressImage(file: File): Promise<File> {
  return new Promise((resolve) => {
    if (!file.type.startsWith("image/")) {
      resolve(file);
      return;
    }

    const img = new window.Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width <= MAX_IMAGE_WIDTH) {
        resolve(file);
        return;
      }
      const ratio = MAX_IMAGE_WIDTH / width;
      width = MAX_IMAGE_WIDTH;
      height = Math.round(height * ratio);

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(new File([blob], file.name, { type: file.type, lastModified: Date.now() }));
          } else {
            resolve(file);
          }
        },
        file.type,
        COMPRESSION_QUALITY
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
    img.src = url;
  });
}

async function uploadFile(file: File, chatId: string) {
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `chat-attachments/${chatId}/${timestamp}_${safeName}`;
  const storageRef = ref(storage, path);

  const processedFile = file.type.startsWith("image/") ? await compressImage(file) : file;
  await uploadBytes(storageRef, processedFile);
  const url = await getDownloadURL(storageRef);

  return {
    attachmentUrl: url,
    attachmentType: file.type.startsWith("image/") ? "image" : "document",
    attachmentName: file.name,
  };
}

export default function Chat() {
  const { currentUser } = useStore();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<ChatUser[]>([]);
  const [allUsers, setAllUsers] = useState<Conversation[]>([]);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [uploadProgress, setUploadProgress] = useState(false);

  // Init Socket
  useEffect(() => {
    if (!currentUser) return;
    
    let isMounted = true;
    const setupSocket = async () => {
      const socket = await initSocket();
      if (!isMounted) return;
      
      registerUserLogin({
        userId: currentUser.id,
        role: currentUser.role,
        name: currentUser.name,
        email: currentUser.email
      });

      const unsubOnline = onOnlineUsersUpdate((users) => {
        setOnlineUsers(users);
      });

      const unsubMsg = onMessageReceive((msg) => {
        // If message is for currently selected conversation, append it
        setMessages(prev => {
          // Prevent duplicates if also coming from Firestore
          if (prev.some(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      });

      return () => {
        if (unsubOnline) unsubOnline();
        if (unsubMsg) unsubMsg();
      };
    };

    const cleanupPromise = setupSocket();
    
    return () => {
      isMounted = false;
      cleanupPromise.then(cleanup => {
        if (cleanup) cleanup();
      });
      disconnectSocket();
    };
  }, [currentUser]);

  // Init Firestore subscriptions
  useEffect(() => {
    if (!currentUser) return;

    // Load all users first to populate the list immediately
    getChatUsers(currentUser.id, currentUser.role as any).then((users) => {
      const formattedUsers = users.map(u => ({
        userId: u.id,
        userName: u.name,
        userRole: u.role,
        lastMessage: "",
        lastMessageTime: null,
        lastMessageSender: "",
        participants: [currentUser.id, u.id],
        unreadCount: 0
      }));
      setAllUsers(formattedUsers);
    });

    const unsubConv = subscribeToConversations(
      currentUser.id, 
      currentUser.role as any, 
      (convs) => setConversations(convs)
    );

    return () => {
      if (unsubConv) unsubConv();
    };
  }, [currentUser]);

  // Merge conversations with allUsers
  const displayConversations = React.useMemo(() => {
    const merged = [...conversations];
    allUsers.forEach(user => {
      if (!merged.some(c => c.userId === user.userId)) {
        merged.push(user);
      }
    });
    return merged;
  }, [conversations, allUsers]);

  // Load messages for selected conversation
  useEffect(() => {
    if (!currentUser || !selectedConversation) {
      setMessages([]);
      return;
    }

    const unsubMsgs = subscribeToMessages(
      currentUser.id,
      (msgs) => {
        setMessages(msgs);
      },
      selectedConversation.userId
    );

    return () => {
      if (unsubMsgs) unsubMsgs();
    };
  }, [currentUser, selectedConversation]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!messageText.trim() && pendingFiles.length === 0) || !currentUser || !selectedConversation) return;

    const text = messageText.trim();
    setMessageText("");
    setSending(true);
    setUploadProgress(pendingFiles.length > 0);

    try {
      const chatId = [currentUser.id, selectedConversation.userId].sort().join("_");
      
      if (pendingFiles.length > 0) {
        const uploads = await Promise.all(
          pendingFiles.map((pf) => uploadFile(pf.file, chatId))
        );

        for (const attachment of uploads) {
          sendSocketMessage({
            senderUserId: currentUser.id,
            receiverUserId: selectedConversation.userId,
            message: text || "",
            senderName: currentUser.name,
            senderRole: currentUser.role,
            attachmentUrl: attachment.attachmentUrl,
            attachmentType: attachment.attachmentType,
            attachmentName: attachment.attachmentName,
          });

          await sendFirestoreMessage(
            currentUser.id,
            currentUser.name,
            selectedConversation.userId,
            text || "",
            attachment.attachmentUrl,
            attachment.attachmentType,
            attachment.attachmentName
          );
        }

        pendingFiles.forEach((pf) => { if (pf.preview) URL.revokeObjectURL(pf.preview); });
        setPendingFiles([]);
      } else {
        // 1. Send via Socket for speed
        sendSocketMessage({
          senderUserId: currentUser.id,
          receiverUserId: selectedConversation.userId,
          message: text,
          senderName: currentUser.name,
          senderRole: currentUser.role
        });

        // 2. Save to Firestore for persistence
        await sendFirestoreMessage(
          currentUser.id,
          currentUser.name,
          selectedConversation.userId,
          text
        );
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
      setUploadProgress(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="p-4 md:p-8 h-[calc(100vh-4rem)] bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80)' }}>
      <div className="h-[calc(100vh-8rem)] w-full max-w-6xl mx-auto bg-card/60 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-white/10 flex">
        
        {/* Mobile: hide sidebar if conversation is selected */}
        <div className={`h-full w-full md:w-80 shrink-0 ${selectedConversation ? 'hidden md:block' : 'block'}`}>
          <ChatSidebar 
            conversations={displayConversations}
            search={search}
            setSearch={setSearch}
            selectedConversation={selectedConversation}
            setSelectedConversation={setSelectedConversation}
            onlineUsers={onlineUsers}
          />
        </div>

        {/* Mobile: hide window if no conversation is selected */}
        <div className={`h-full flex-1 ${!selectedConversation ? 'hidden md:block' : 'block'}`}>
          {selectedConversation ? (<ChatWindow 
              currentUserId={currentUser.id}
              selectedConversation={selectedConversation}
              setSelectedConversation={setSelectedConversation}
              messages={messages}
              messageText={messageText}
              setMessageText={setMessageText}
              handleSend={handleSend}
              sending={sending}
              onlineUsers={onlineUsers}
              pendingFiles={pendingFiles}
              setPendingFiles={setPendingFiles}
              uploadProgress={uploadProgress}
              ALLOWED_TYPES={ALLOWED_TYPES}
              MAX_FILES={MAX_FILES}
              MAX_FILE_SIZE={MAX_FILE_SIZE}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-foreground/40 bg-black/10">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 opacity-50 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-white">Select a conversation to start messaging</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
