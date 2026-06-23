import React, { useRef, useEffect } from 'react';
import { Send, ArrowLeft, MoreVertical } from 'lucide-react';
import { ChatMessage } from '@/lib/socketService';

interface ChatWindowProps {
  currentUserId: string;
  selectedConversation: any;
  setSelectedConversation: (c: any | null) => void;
  messages: any[];
  messageText: string;
  setMessageText: (s: string) => void;
  handleSend: (e: React.FormEvent) => void;
  sending: boolean;
  onlineUsers: any[];
  pendingFiles: any[];
  setPendingFiles: React.Dispatch<React.SetStateAction<any[]>>;
  uploadProgress: boolean;
  ALLOWED_TYPES: string[];
  MAX_FILES: number;
  MAX_FILE_SIZE: number;
}

const EMOJIS = ['😀', '😂', '😍', '🙏', '👍', '❤️', '🔥', '🎉', '✅', '✨', '👋', '🙌', '💯', '😊', '🤔'];

function AttachmentBubble({ msg, isSent }: { msg: any; isSent: boolean }) {
  if (!msg.attachmentUrl) return null;

  if (msg.attachmentType === "image") {
    return (
      <div className="mt-2 max-w-[240px]">
        <a href={msg.attachmentUrl} target="_blank" rel="noopener noreferrer">
          <img
            src={msg.attachmentUrl}
            alt={msg.attachmentName || "image"}
            className="w-full h-auto rounded-xl object-cover border border-white/10"
            loading="lazy"
          />
        </a>
        {msg.attachmentName && (
          <p className={`text-[10px] mt-1 px-1 truncate ${isSent ? "text-green-200" : "text-white/40"}`}>
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
      className="flex items-center gap-3 mt-2 max-w-[240px] no-underline bg-black/20 p-2 rounded-lg border border-white/5 hover:bg-black/30 transition-colors"
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
        <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-medium truncate ${isSent ? "text-white" : "text-white/90"}`}>
          {msg.attachmentName || "Document"}
        </p>
        <p className={`text-[9px] ${isSent ? "text-green-200" : "text-white/40"}`}>
          Tap to download
        </p>
      </div>
    </a>
  );
}

export default function ChatWindow({
  currentUserId,
  selectedConversation,
  setSelectedConversation,
  messages,
  messageText,
  setMessageText,
  handleSend,
  sending,
  onlineUsers = [],
  pendingFiles = [],
  setPendingFiles,
  uploadProgress = false,
  ALLOWED_TYPES = [
    "image/jpeg", "image/png", "image/gif", "image/webp",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  MAX_FILES = 5,
  MAX_FILE_SIZE = 5 * 1024 * 1024
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showEmojis, setShowEmojis] = React.useState(false);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages, pendingFiles]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = MAX_FILES - pendingFiles.length;
    const selected = files.slice(0, remaining);

    const newPending = selected
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
        type: f.type.startsWith("image/") ? "image" : "document",
      }));

    setPendingFiles((prev) => [...prev, ...newPending]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removePendingFile = (index: number) => {
    setPendingFiles((prev) => {
      const updated = [...prev];
      if (updated[index].preview) URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  const isOnline = onlineUsers.some(u => u.userId === selectedConversation.userId);
  const initial = selectedConversation.userName?.charAt(0)?.toUpperCase() || '?';

  return (
    <div className="flex-1 flex flex-col h-full bg-black/10">
      {/* Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-white/10 bg-white/5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSelectedConversation(null)}
            className="md:hidden p-2 rounded-full hover:bg-white/10 text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-white font-bold shadow-md">
              {initial}
            </div>
            {isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#0f2e1d] rounded-full"></div>
            )}
          </div>
          
          <div>
            <h3 className="font-semibold text-white text-sm">{selectedConversation.userName}</h3>
            <p className="text-[10px] text-white/60">
              {isOnline ? 'Online' : 'Offline'} • <span className="uppercase">{selectedConversation.userRole}</span>
            </p>
          </div>
        </div>
        
        <button className="p-2 rounded-full hover:bg-white/10 text-white/70 transition-colors">
          <MoreVertical size={20} />
        </button>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-white/40 text-sm">
            No messages yet. Say hello!
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isSent = msg.sender_id === currentUserId || msg.senderId === currentUserId;
            const text = msg.message;
            const time = msg.timestamp || msg.created_at;
            const timeStr = time ? new Date(time?.seconds ? time.seconds * 1000 : time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

            return (
              <div key={msg.id || idx} className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] px-4 py-2 rounded-2xl shadow-sm ${
                  isSent 
                    ? 'bg-green-600 text-white rounded-tr-sm' 
                    : 'bg-white/10 text-white rounded-tl-sm border border-white/5'
                }`}>
                  {text && <p className="text-sm break-words whitespace-pre-wrap">{text}</p>}
                  <AttachmentBubble msg={msg} isSent={isSent} />
                  <p className={`text-[10px] text-right mt-1 ${isSent ? 'text-green-200' : 'text-white/40'}`}>
                    {timeStr}
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
        <div className="px-4 py-3 flex gap-2 overflow-x-auto border-t border-white/10 bg-black/40 backdrop-blur-md">
          {pendingFiles.map((pf, idx) => (
            <div key={idx} className="relative flex-shrink-0 p-1 bg-white/5 rounded-lg border border-white/10">
              {pf.type === "image" && pf.preview ? (
                <img src={pf.preview} alt="" className="w-14 h-14 rounded-md object-cover" />
              ) : (
                <div className="w-14 h-14 rounded-md bg-white/5 flex flex-col items-center justify-center gap-1">
                  <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span className="text-[8px] text-white/50 truncate max-w-[48px]">
                    {pf.file.name.split(".").pop()?.toUpperCase()}
                  </span>
                </div>
              )}
              <button
                onClick={() => removePendingFile(idx)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition shadow-md"
                type="button"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-4 bg-white/5 backdrop-blur-md border-t border-white/10 relative">
        {uploadProgress && (
          <div className="absolute -top-6 left-4 text-[10px] text-green-400 flex items-center gap-1">
            <svg className="animate-spin w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Uploading attachments...
          </div>
        )}
        
        {showEmojis && (
          <div className="absolute bottom-[calc(100%+10px)] left-4 bg-black/80 backdrop-blur-xl border border-white/10 p-3 rounded-2xl shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2">
            <div className="grid grid-cols-5 gap-2">
              {EMOJIS.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    setMessageText(messageText + emoji);
                    setShowEmojis(false);
                  }}
                  className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-lg text-lg transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); handleSend(e); setShowEmojis(false); }} className="flex items-end gap-2">
          
          <button
            type="button"
            onClick={() => setShowEmojis(!showEmojis)}
            className="p-3 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-colors flex-shrink-0 mb-0.5"
            title="Add emoji"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={pendingFiles.length >= MAX_FILES || sending}
            className="p-3 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-colors flex-shrink-0 disabled:opacity-30 mb-0.5"
            title={`Attach files (${pendingFiles.length}/${MAX_FILES})`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={ALLOWED_TYPES.join(",")}
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="flex-1 relative">
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type a message..."
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-green-500/50 resize-none min-h-[44px] max-h-32 scrollbar-hide"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                  setShowEmojis(false);
                }
              }}
            />
          </div>
          <button
            type="submit"
            disabled={( !messageText.trim() && pendingFiles.length === 0 ) || sending}
            className="p-3 rounded-xl bg-green-600 hover:bg-green-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex-shrink-0 mb-0.5"
          >
            <Send size={20} className={sending ? "animate-pulse" : ""} />
          </button>
        </form>
      </div>
    </div>
  );
}
