import { useMemo } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, Users } from 'lucide-react';
import { Conversation, ChatUser } from '@/lib/socketService';
import { cn } from '@/lib/utils';

interface ChatSidebarProps {
  conversations: Conversation[];
  onlineUsers: ChatUser[];
  selectedConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  loading?: boolean;
}

export const ChatSidebar = ({
  conversations,
  onlineUsers,
  selectedConversation,
  onSelectConversation,
  searchQuery,
  onSearchChange,
  loading = false,
}: ChatSidebarProps) => {
  // Filter conversations based on search query
  const filteredConversations = useMemo(() => {
    return conversations.filter((conv) =>
      conv.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.userRole.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [conversations, searchQuery]);

  // Check if a user is online
  const isUserOnline = (userId: string): boolean => {
    return onlineUsers.some((u) => u.userId === userId);
  };

  return (
    <div className="flex flex-col h-full chat-glass-panel">
      {/* Header — Glassmorphism */}
      <div className="p-5 chat-glass-header">
        <h2 className="text-lg font-bold text-foreground mb-4">Messages</h2>

        {/* Search Bar — Glass Effect */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
          <input
            type="text"
            placeholder="Search users..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm chat-glass-input text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground gap-2">
            <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
            <span className="text-sm">Loading conversations...</span>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground gap-2">
            <Users className="h-6 w-6 opacity-40" />
            <span className="text-sm">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </span>
          </div>
        ) : (
          <div>
            {filteredConversations.map((conversation) => {
              const online = isUserOnline(conversation.userId);
              const isSelected =
                selectedConversation?.userId === conversation.userId;

              return (
                <button
                  key={conversation.userId}
                  onClick={() => onSelectConversation(conversation)}
                  className={cn(
                    'w-full px-4 py-3.5 text-left chat-sidebar-item',
                    isSelected && 'active'
                  )}
                >
                  {/* Conversation Item */}
                  <div className="flex items-start gap-3">
                    {/* Avatar with Online Indicator */}
                    <div className="relative mt-0.5 flex-shrink-0">
                      <Avatar className="h-11 w-11 shadow-md">
                        <AvatarFallback className={cn(
                          "font-bold text-sm text-white",
                          conversation.userRole === 'farmer'
                            ? "bg-gradient-to-br from-green-500 to-green-700"
                            : conversation.userRole === 'buyer'
                              ? "bg-gradient-to-br from-blue-500 to-blue-700"
                              : "bg-gradient-to-br from-purple-500 to-purple-700"
                        )}>
                          {conversation.userName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {/* Online Badge with pulse */}
                      {online && (
                        <div className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-green-500 rounded-full border-2 border-background online-pulse" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Name and Role */}
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-semibold text-sm text-foreground truncate">
                          {conversation.userName}
                        </span>
                        <span className={cn(
                          "inline-block text-[10px] px-2 py-0.5 rounded-full font-bold",
                          conversation.userRole === 'farmer'
                            ? "bg-green-500/15 text-green-400"
                            : conversation.userRole === 'buyer'
                              ? "bg-blue-500/15 text-blue-400"
                              : "bg-purple-500/15 text-purple-400"
                        )}>
                          {conversation.userRole.toUpperCase()}
                        </span>
                        {conversation.unreadCount > 0 && (
                          <span className="ml-auto flex-shrink-0 w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center shadow-md" style={{
                            boxShadow: "0 0 10px rgba(34, 197, 94, 0.4)",
                          }}>
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>

                      {/* Last Message */}
                      <p className="text-xs text-muted-foreground truncate mb-1">
                        {conversation.lastMessage || 'No messages yet'}
                      </p>

                      {/* Timestamp */}
                      {conversation.lastMessageTime && (
                        <span className="text-[10px] text-muted-foreground/60">
                          {formatTime(conversation.lastMessageTime)}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Format timestamp for display
 */
function formatTime(
  timestamp: any
): string {
  if (!timestamp) return '';

  // Handle Firestore Timestamp
  if (timestamp.toDate) {
    timestamp = timestamp.toDate();
  }

  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}
