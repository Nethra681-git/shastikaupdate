import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { collection, getDocs, onSnapshot, addDoc, serverTimestamp, query } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, auth, storage } from "@/lib/firebase";
import { Send, Paperclip, X, FileText, Download, Image as ImageIcon, Search, MessageSquare } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────
interface User {
  id: string;
  name: string;
  email: string;
  role: "farmer" | "buyer" | "admin";
}

interface AttachmentData {
  attachmentUrl: string;
  attachmentType: string;
  attachmentName: string;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: any;
  participants: string[];
  attachmentUrl?: string;
  attachmentType?: string;
  attachmentName?: string;
}

interface PendingFile {
  file: File;
  preview?: string;
  type: "image" | "document";
}

// ─── Constants ───────────────────────────────────────────────
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

// ─── Image Compression ──────────────────────────────────────
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
            const compressed = new File([blob], file.name, { type: file.type, lastModified: Date.now() });
            resolve(compressed);
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

// ─── Upload to Firebase Storage ──────────────────────────────
async function uploadFile(file: File, chatId: string): Promise<AttachmentData> {
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

// ─── Attachment Renderer ─────────────────────────────────────
function AttachmentBubble({ msg, isSent }: { msg: ChatMessage; isSent: boolean }) {
  if (!msg.attachmentUrl) return null;

  if (msg.attachmentType === "image") {
    return (
      <div className="chat-attachment-thumbnail mt-2 max-w-[240px]">
        <a href={msg.attachmentUrl} target="_blank" rel="noopener noreferrer">
          <img
            src={msg.attachmentUrl}
            alt={msg.attachmentName || "image"}
            className="w-full h-auto rounded-xl object-cover"
            loading="lazy"
          />
        </a>
        {msg.attachmentName && (
          <p className={`text-xs mt-1 px-1 truncate ${isSent ? "text-white/70" : "text-muted-foreground"}`}>
            {msg.attachmentName}
          </p>
        )}
      </div>
    );
  }

  return (
    <a
      href={msg.attachmentUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="chat-attachment-doc flex items-center gap-3 mt-2 max-w-[240px] no-underline"
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
        <FileText className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${isSent ? "text-white" : "text-foreground"}`}>
          {msg.attachmentName || "Document"}
        </p>
        <p className={`text-xs ${isSent ? "text-white/60" : "text-muted-foreground"}`}>
          Tap to download
        </p>
      </div>
      <Download className={`w-4 h-4 flex-shrink-0 ${isSent ? "text-white/70" : "text-primary"}`} />
    </a>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function ChatPage() {
  const [searchParams] = useSearchParams();
  const userIdParam = searchParams.get("userId");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState<string>("");
  const [lastMessages, setLastMessages] = useState<{ [key: string]: ChatMessage }>({});
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [uploadProgress, setUploadProgress] = useState(false);

  // Auto-scroll
  const scrollToBottom = useCallback(() => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  // ─── Auth ──────────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUserId(user.uid);
        setCurrentUserName(user.displayName || "Admin");
      } else {
        setCurrentUserId("demo-admin");
      }
    });
    return () => unsubscribe();
  }, []);

  // ─── Fetch Users ───────────────────────────────────────────
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        let snapshot;
        try {
          snapshot = await getDocs(collection(db, "users"));
        } catch {
          try {
            snapshot = await getDocs(collection(db, "Users"));
          } catch {
            snapshot = await getDocs(collection(db, "customers"));
          }
        }

        const usersList: User[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          usersList.push({
            id: doc.id,
            name: data.name || "Unknown User",
            email: data.email || "no-email@example.com",
            role: data.role || "buyer",
          });
        });
        setUsers(usersList);
      } catch (error) {
        console.error("❌ Error loading users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // ─── Auto-select from URL ─────────────────────────────────
  useEffect(() => {
    if (userIdParam && users.length > 0) {
      const user = users.find((u) => u.id === userIdParam);
      if (user) setSelectedUser(user);
    }
  }, [userIdParam, users]);

  // ─── Filter Users ──────────────────────────────────────────
  useEffect(() => {
    let filtered = users.filter((u) => u.id !== currentUserId);
    const currentUser = users.find((u) => u.id === currentUserId);
    if (currentUser?.role && currentUser.role !== "admin") {
      filtered = filtered.filter((u) => u.role === "admin");
    }
    if (search.trim()) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.name?.toLowerCase().includes(s) ||
          u.role?.toLowerCase().includes(s) ||
          u.email?.toLowerCase().includes(s)
      );
    }
    setFilteredUsers(filtered);
  }, [users, search, currentUserId]);

  // ─── Last Messages Tracker ────────────────────────────────
  useEffect(() => {
    if (!currentUserId) return;
    const unsubscribe = onSnapshot(query(collection(db, "messages")), (snapshot) => {
      const lastMsgs: { [key: string]: ChatMessage } = {};
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.participants?.includes(currentUserId)) {
          const otherUserId = data.participants.find((id: string) => id !== currentUserId);
          if (otherUserId) {
            const existing = lastMsgs[otherUserId];
            const timestamp = data.timestamp?.toDate?.() || new Date(0);
            const existingTime = existing?.timestamp?.toDate?.() || new Date(0);
            if (!existing || timestamp > existingTime) {
              lastMsgs[otherUserId] = {
                id: doc.id,
                senderId: data.senderId,
                senderName: data.senderName,
                message: data.message,
                timestamp: data.timestamp,
                participants: data.participants,
                attachmentUrl: data.attachmentUrl,
                attachmentType: data.attachmentType,
                attachmentName: data.attachmentName,
              };
            }
          }
        }
      });
      setLastMessages(lastMsgs);
    });
    return () => unsubscribe();
  }, [currentUserId]);

  // ─── Messages Listener ────────────────────────────────────
  useEffect(() => {
    if (!selectedUser || !currentUserId) return;
    const unsubscribe = onSnapshot(query(collection(db, "messages")), (snapshot) => {
      const msgs: ChatMessage[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (
          data.participants?.includes(currentUserId) &&
          data.participants?.includes(selectedUser.id)
        ) {
          msgs.push({
            id: doc.id,
            senderId: data.senderId,
            senderName: data.senderName || "Unknown",
            message: data.message,
            timestamp: data.timestamp,
            participants: data.participants,
            attachmentUrl: data.attachmentUrl,
            attachmentType: data.attachmentType,
            attachmentName: data.attachmentName,
          });
        }
      });
      msgs.sort((a, b) => {
        const timeA = a.timestamp?.toDate?.() || new Date(0);
        const timeB = b.timestamp?.toDate?.() || new Date(0);
        return timeA - timeB;
      });
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, [selectedUser, currentUserId]);

  // ─── File Handling ─────────────────────────────────────────
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = MAX_FILES - pendingFiles.length;
    const selected = files.slice(0, remaining);

    const newPending: PendingFile[] = selected
      .filter((f) => {
        if (f.size > MAX_FILE_SIZE) {
          alert(`${f.name} is too large (max 5MB)`);
          return false;
        }
        if (!ALLOWED_TYPES.includes(f.type)) {
          alert(`${f.name} is not a supported file type`);
          return false;
        }
        return true;
      })
      .map((f) => ({
        file: f,
        preview: f.type.startsWith("image/") ? URL.createObjectURL(f) : undefined,
        type: f.type.startsWith("image/") ? "image" as const : "document" as const,
      }));

    setPendingFiles((prev) => [...prev, ...newPending]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removePendingFile = (index: number) => {
    setPendingFiles((prev) => {
      const updated = [...prev];
      if (updated[index].preview) URL.revokeObjectURL(updated[index].preview!);
      updated.splice(index, 1);
      return updated;
    });
  };

  // ─── Send Message ─────────────────────────────────────────
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!messageText.trim() && pendingFiles.length === 0) || !selectedUser || !currentUserId) return;

    setSending(true);
    setUploadProgress(pendingFiles.length > 0);

    try {
      const chatId = [currentUserId, selectedUser.id].sort().join("_");

      // Upload attachments in parallel
      if (pendingFiles.length > 0) {
        const uploads = await Promise.all(
          pendingFiles.map((pf) => uploadFile(pf.file, chatId))
        );

        // Send one message per attachment
        for (const attachment of uploads) {
          await addDoc(collection(db, "messages"), {
            senderId: currentUserId,
            senderName: currentUserName,
            receiverId: selectedUser.id,
            message: messageText || "",
            timestamp: serverTimestamp(),
            participants: [currentUserId, selectedUser.id],
            attachmentUrl: attachment.attachmentUrl,
            attachmentType: attachment.attachmentType,
            attachmentName: attachment.attachmentName,
          });
        }

        // Clean up previews
        pendingFiles.forEach((pf) => { if (pf.preview) URL.revokeObjectURL(pf.preview); });
        setPendingFiles([]);
      } else {
        // Text-only message
        await addDoc(collection(db, "messages"), {
          senderId: currentUserId,
          senderName: currentUserName,
          receiverId: selectedUser.id,
          message: messageText,
          timestamp: serverTimestamp(),
          participants: [currentUserId, selectedUser.id],
        });
      }

      setMessageText("");
    } catch (error) {
      console.error("❌ Send error:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setSending(false);
      setUploadProgress(false);
    }
  };

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════
  return (
    <div className="flex h-[calc(100vh-6rem)] rounded-2xl overflow-hidden" style={{
      background: "linear-gradient(135deg, rgba(15, 46, 29, 0.95) 0%, rgba(10, 35, 22, 0.98) 100%)",
      border: "1px solid rgba(212, 175, 55, 0.1)",
      boxShadow: "0 0 40px rgba(0,0,0,0.3), 0 0 80px rgba(212, 175, 55, 0.04)",
    }}>

      {/* ═══════════ SIDEBAR ═══════════ */}
      <div className="w-[340px] flex flex-col chat-glass-panel border-r border-primary/10">
        {/* Sidebar Header */}
        <div className="p-5 chat-glass-header">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Messages</h2>
              <p className="text-xs text-muted-foreground">
                {users.length > 0 ? `${filteredUsers.length} contacts` : "Loading..."}
              </p>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm chat-glass-input text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
            />
          </div>
        </div>

        {/* Sidebar Users List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground gap-2">
              <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
              <span className="text-sm">Loading contacts...</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground gap-2">
              <Search className="w-6 h-6 opacity-40" />
              <span className="text-sm">{search ? `No results for "${search}"` : "No contacts found"}</span>
            </div>
          ) : (
            filteredUsers.map((user) => {
              const lastMsg = lastMessages[user.id];
              const lastTime = lastMsg?.timestamp?.toDate?.() || null;
              const timeStr = lastTime
                ? lastTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                : "";
              const preview = lastMsg?.attachmentType === "image"
                ? "📷 Photo"
                : lastMsg?.attachmentType === "document"
                  ? "📄 Document"
                  : lastMsg?.message?.substring(0, 40) || "No messages yet";
              const isSelected = selectedUser?.id === user.id;

              return (
                <button
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`w-full px-4 py-3.5 text-left chat-sidebar-item ${isSelected ? "active" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-md ${
                        user.role === "farmer"
                          ? "bg-gradient-to-br from-green-500 to-green-700"
                          : user.role === "buyer"
                            ? "bg-gradient-to-br from-blue-500 to-blue-700"
                            : "bg-gradient-to-br from-purple-500 to-purple-700"
                      }`}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-semibold text-foreground text-sm truncate">{user.name}</span>
                        {timeStr && <span className="text-[10px] text-muted-foreground ml-2 flex-shrink-0">{timeStr}</span>}
                      </div>
                      <p className="text-xs text-muted-foreground truncate mb-1.5">{preview}</p>
                      <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        user.role === "farmer"
                          ? "bg-green-500/15 text-green-400"
                          : user.role === "buyer"
                            ? "bg-blue-500/15 text-blue-400"
                            : "bg-purple-500/15 text-purple-400"
                      }`}>
                        {user.role.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ═══════════ CHAT WINDOW ═══════════ */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="px-6 py-4 chat-glass-header flex items-center gap-4">
              <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-md ${
                selectedUser.role === "farmer"
                  ? "bg-gradient-to-br from-green-500 to-green-700"
                  : selectedUser.role === "buyer"
                    ? "bg-gradient-to-br from-blue-500 to-blue-700"
                    : "bg-gradient-to-br from-purple-500 to-purple-700"
              }`}>
                {selectedUser.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground text-base truncate">{selectedUser.name}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    selectedUser.role === "farmer"
                      ? "bg-green-500/15 text-green-400"
                      : selectedUser.role === "buyer"
                        ? "bg-blue-500/15 text-blue-400"
                        : "bg-purple-500/15 text-purple-400"
                  }`}>
                    {selectedUser.role.toUpperCase()}
                  </span>
                  <span className="text-xs text-muted-foreground truncate">{selectedUser.email}</span>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div
              className="flex-1 overflow-y-auto px-6 py-4 space-y-3"
              style={{
                background: "linear-gradient(180deg, rgba(15, 46, 29, 0.3) 0%, rgba(10, 35, 22, 0.5) 100%)",
              }}
            >
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <MessageSquare className="w-8 h-8 text-primary/40" />
                  </div>
                  <p className="text-sm">No messages yet — say hello! 👋</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isSent = msg.senderId === currentUserId;
                  return (
                    <div
                      key={msg.id}
                      className={`flex message-animate ${isSent ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-xs lg:max-w-sm px-4 py-2.5 break-words ${
                        isSent ? "chat-bubble-sent" : "chat-bubble-received"
                      }`}>
                        {msg.message && <p className="text-sm leading-relaxed">{msg.message}</p>}
                        <AttachmentBubble msg={msg} isSent={isSent} />
                        <p className={`text-[10px] mt-1.5 ${isSent ? "text-white/60" : "text-muted-foreground"}`}>
                          {msg.timestamp
                            ? new Date(msg.timestamp.toDate?.() || msg.timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : ""}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Pending Files Preview */}
            {pendingFiles.length > 0 && (
              <div className="px-6 py-3 flex gap-2 overflow-x-auto border-t border-primary/10" style={{
                background: "rgba(15, 46, 29, 0.8)",
                backdropFilter: "blur(12px)",
              }}>
                {pendingFiles.map((pf, idx) => (
                  <div key={idx} className="relative flex-shrink-0 attachment-preview-card p-2">
                    {pf.type === "image" && pf.preview ? (
                      <img src={pf.preview} alt="" className="w-16 h-16 rounded-lg object-cover" />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-primary/10 flex flex-col items-center justify-center gap-1">
                        <FileText className="w-5 h-5 text-primary" />
                        <span className="text-[8px] text-muted-foreground truncate max-w-[56px]">
                          {pf.file.name.split(".").pop()?.toUpperCase()}
                        </span>
                      </div>
                    )}
                    <button
                      onClick={() => removePendingFile(idx)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition shadow-md"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Input Area */}
            <form onSubmit={handleSend} className="px-6 py-4 chat-glass-header border-t border-primary/10" style={{ borderBottom: "none" }}>
              {uploadProgress && (
                <div className="mb-3 flex items-center gap-2 text-xs text-primary">
                  <div className="w-4 h-4 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                  Uploading attachments...
                </div>
              )}
              <div className="flex items-center gap-3">
                {/* Attachment Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={pendingFiles.length >= MAX_FILES || sending}
                  className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 hover:bg-primary/15 text-muted-foreground hover:text-primary disabled:opacity-30"
                  title={`Attach files (${pendingFiles.length}/${MAX_FILES})`}
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {/* Message Input */}
                <div className="flex-1 chat-glass-input rounded-xl">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type a message..."
                    disabled={sending}
                    className="w-full px-4 py-2.5 bg-transparent border-none text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-0"
                  />
                </div>

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={sending || (!messageText.trim() && pendingFiles.length === 0)}
                  className="flex-shrink-0 w-10 h-10 rounded-xl chat-send-btn flex items-center justify-center text-white"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </>
        ) : (
          /* No conversation selected */
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-4" style={{
            background: "linear-gradient(180deg, rgba(15, 46, 29, 0.3) 0%, rgba(10, 35, 22, 0.5) 100%)",
          }}>
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center" style={{
              boxShadow: "0 0 40px rgba(34, 197, 94, 0.1)",
            }}>
              <MessageSquare className="w-10 h-10 text-primary/40" />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-foreground/70 mb-1">Select a conversation</p>
              <p className="text-sm text-muted-foreground/60">Choose a contact to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
