import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Phone, Video, MoreVertical, MessageSquare } from 'lucide-react';
import { ChatMessage, Conversation, ChatUser } from '@/lib/socketService';
import { cn } from '@/lib/utils';

interface ChatWindowProps {
  conversation: Conversation | null;
  messages: ChatMessage[];
  onlineUsers: ChatUser[];
  currentUserId: string;
  currentUserName: string;
  messageInput: string;
  onMessageInputChange: (message: string) => void;
  onSendMessage: () => void;
  sending?: boolean;
  loading?: boolean;
}

export const ChatWindow = ({
  conversation,
  messages,
  onlineUsers,
  currentUserId,
  currentUserName,
  messageInput,
  onMessageInputChange,
  onSendMessage,
  sending = false,
  loading = false,
}: ChatWindowProps) => {
  const { t } = useTranslation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (autoScroll) {
      scrollToBottom();
    }
  }, [messages, autoScroll]);

  // Handle scroll manually to detect if user scrolled up
  const handleScroll = (event: any) => {
    const element = event.target;
    const isAtBottom =
      element.scrollHeight - element.scrollTop - element.clientHeight < 100;
    setAutoScroll(isAtBottom);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Check if user is online
  const isUserOnline = (userId: string): boolean => {
    return onlineUsers.some((u) => u.userId === userId);
  };

  // Handle send message on Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (messageInput.trim() && !sending) {
        onSendMessage();
      }
    }
  };

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-full" style={{
        background: "linear-gradient(180deg, rgba(15, 46, 29, 0.3) 0%, rgba(10, 35, 22, 0.5) 100%)",
      }}>
        <div className="text-center">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5" style={{
            boxShadow: "0 0 40px rgba(34, 197, 94, 0.1)",
          }}>
            <MessageSquare className="w-10 h-10 text-primary/40" />
          </div>
          <h3 className="text-lg font-semibold text-foreground/70 mb-1">
            {t('chat_select_conversation_placeholder')}
          </h3>
          <p className="text-sm text-muted-foreground/60">
            Choose a user from the sidebar to begin
          </p>
        </div>
      </div>
    );
  }

  const online = isUserOnline(conversation.userId);

  return (
    <div className="flex flex-col h-full overflow-hidden rounded-3xl bg-[rgba(15,46,29,0.65)] border border-white/10 shadow-2xl">
      {/* Chat Header — Glassmorphism */}
      <div className="flex items-center justify-between px-6 py-4 chat-glass-header">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-11 w-11 shadow-md">
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-white font-bold">
                {conversation.userName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {/* Online indicator with pulse */}
            {online && (
              <div className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-green-500 rounded-full border-2 border-background online-pulse" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-foreground truncate">{conversation.userName}</h2>
              <span className="inline-block text-[10px] px-2 py-0.5 rounded-full font-bold bg-primary/15 text-primary">
                {conversation.userRole.toUpperCase()}
              </span>
            </div>
            <div className="text-xs mt-0.5">
              {online ? (
                <span className="text-green-400 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 bg-green-400 rounded-full" />
                  Active now
                </span>
              ) : (
                <span className="text-muted-foreground/60">Offline</span>
              )}
            </div>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-1">
          {[Phone, Video, MoreVertical].map((Icon, i) => (
            <button
              key={i}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-all duration-200"
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>
      </div>

      {/* Messages Area — Glass Background */}
      <div
        className="flex-1 overflow-y-auto px-6 py-5 space-y-3 bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.08),transparent_36%),rgba(15,46,29,0.45)]"
        ref={messagesContainerRef as any}
        onScroll={handleScroll}
        style={{
          backgroundBlendMode: 'overlay',
        }}
      >
        {loading ? (
          <div className="flex items-center justify-center h-24">
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-5 h-5 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
              <span className="text-sm">Loading messages...</span>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageSquare className="w-7 h-7 text-primary/40" />
            </div>
            <p className="text-sm">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isCurrentUserMessage = message.senderId === currentUserId;
            const showAvatar =
              index === 0 ||
              messages[index - 1].senderId !== message.senderId;

            return (
              <div
                key={message.id}
                className={cn(
                  'flex gap-3 items-end mb-1 message-animate',
                  isCurrentUserMessage && 'flex-row-reverse gap-3'
                )}
              >
                {/* Avatar */}
                {showAvatar ? (
                  <Avatar className="h-8 w-8 flex-shrink-0 shadow-md">
                    <AvatarFallback className={cn(
                      "text-xs font-bold text-white",
                      isCurrentUserMessage
                        ? "bg-gradient-to-br from-primary to-primary/60"
                        : "bg-gradient-to-br from-blue-500 to-blue-700"
                    )}>
                      {message.senderName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="h-8 w-8 flex-shrink-0" />
                )}

                {/* Message Bubble — Premium Glass */}
                <div
                  className={cn(
                    'max-w-xs lg:max-w-md px-4 py-2.5 break-words',
                    isCurrentUserMessage
                      ? 'chat-bubble-sent'
                      : 'chat-bubble-received'
                  )}
                >
                  <p className="text-sm leading-relaxed">{message.message}</p>
                  <p
                    className={cn(
                      'text-[10px] mt-1.5',
                      isCurrentUserMessage ? 'text-white/60' : 'text-muted-foreground'
                    )}
                  >
                    {formatMessageTime(message.timestamp)}
                  </p>
                </div>

                {/* Read Status */}
                {isCurrentUserMessage && message.read && (
                  <span className="text-xs text-primary">✓✓</span>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Area — Glassmorphism */}
      <div className="px-6 py-4 chat-glass-header" style={{ borderBottom: "none", borderTop: "1px solid rgba(34, 197, 94, 0.1)" }}>
        <div className="flex items-center gap-3">
          <div className="flex-1 chat-glass-input rounded-xl">
            <input
              type="text"
              placeholder="Type a message..."
              value={messageInput}
              onChange={(e) => onMessageInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={sending}
              className="w-full px-4 py-2.5 bg-transparent border-none text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-0"
            />
          </div>
          <button
            onClick={onSendMessage}
            disabled={!messageInput.trim() || sending}
            className="flex-shrink-0 w-10 h-10 rounded-xl chat-send-btn flex items-center justify-center text-white"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Format message timestamp for display
 */
function formatMessageTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();

  // Same day - show time only
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // Different day - show date and time
  return date.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
