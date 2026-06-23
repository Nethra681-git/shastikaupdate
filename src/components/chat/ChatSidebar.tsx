import React from 'react';
import { Search } from 'lucide-react';

interface ChatSidebarProps {
  conversations: any[];
  search: string;
  setSearch: (s: string) => void;
  selectedConversation: any | null;
  setSelectedConversation: (c: any) => void;
  onlineUsers: any[];
}

export default function ChatSidebar({
  conversations,
  search,
  setSearch,
  selectedConversation,
  setSelectedConversation,
  onlineUsers
}: ChatSidebarProps) {
  
  const filtered = conversations.filter(c => 
    c.userName?.toLowerCase().includes(search.toLowerCase()) || 
    c.userRole?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full md:w-80 flex flex-col h-full border-r border-white/10 bg-black/20">
      <div className="p-4 border-b border-white/10">
        <h2 className="text-xl font-bold text-white mb-4">Messages</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
        {filtered.length === 0 ? (
          <div className="p-4 text-center text-white/50 text-sm">No conversations found</div>
        ) : (
          filtered.map((conv) => {
            const isOnline = onlineUsers.some(u => u.userId === conv.userId);
            const isSelected = selectedConversation?.userId === conv.userId;
            const initial = conv.userName?.charAt(0)?.toUpperCase() || '?';
            
            return (
              <button
                key={conv.userId}
                onClick={() => setSelectedConversation(conv)}
                className={`w-full p-4 flex items-start gap-3 transition-colors text-left border-b border-white/5 ${
                  isSelected ? 'bg-white/10' : 'hover:bg-white/5'
                }`}
              >
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {initial}
                  </div>
                  {isOnline && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-[#0f2e1d] rounded-full"></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-semibold text-white text-sm truncate">{conv.userName}</h3>
                    <span className="text-[10px] text-white/40 shrink-0 ml-2">
                      {conv.lastMessageTime ? new Date(conv.lastMessageTime?.seconds ? conv.lastMessageTime.seconds * 1000 : conv.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-white/60 truncate mr-2">
                      {conv.lastMessage || 'No messages yet'}
                    </p>
                    {conv.unreadCount > 0 && (
                      <span className="shrink-0 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="mt-1">
                    <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-white/10 text-white/70">
                      {conv.userRole}
                    </span>
                  </div>
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  );
}
