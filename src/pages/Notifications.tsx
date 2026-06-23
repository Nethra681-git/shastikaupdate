import { useStore } from '@/lib/store';
import { ShoppingCart, DollarSign, Package, ClipboardList, CheckCircle2, Bell, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const getNotificationIcon = (title: string) => {
  const t = title.toLowerCase();
  if (t.includes('order')) return <ShoppingCart className="w-5 h-5 text-blue-500" />;
  if (t.includes('payment')) return <DollarSign className="w-5 h-5 text-green-500" />;
  if (t.includes('shipment')) return <Package className="w-5 h-5 text-purple-500" />;
  if (t.includes('purchase request')) return <ClipboardList className="w-5 h-5 text-orange-500" />;
  if (t.includes('rfq')) return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
  return <Bell className="w-5 h-5 text-primary" />;
};

const Notifications = () => {
  const { currentUser, notifications, markNotificationRead } = useStore();
  const getSafeTime = (ts: string) => {
    const time = new Date(ts).getTime();
    return isNaN(time) ? 0 : time;
  };

  const myNotifs = notifications
    .filter(n => currentUser?.role ? n.targetRoles.includes(currentUser.role) : false)
    .sort((a, b) => getSafeTime(b.timestamp) - getSafeTime(a.timestamp));

  const hasUnread = myNotifs.some(n => !n.read);

  const markAllAsRead = () => {
    myNotifs.forEach(n => {
      if (!n.read) markNotificationRead(n.id);
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      
      <div className="flex items-center justify-between border-b border-border/50 pb-4">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Bell className="w-8 h-8 text-primary" />
          Notifications
        </h1>
        {myNotifs.length > 0 && hasUnread && (
          <button 
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary font-medium rounded-lg transition-colors text-sm"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all as read
          </button>
        )}
      </div>

      {myNotifs.length === 0 ? (
        <div className="text-center py-24 bg-card border border-border shadow-sm rounded-xl">
          <Bell className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-20" />
          <p className="text-xl text-muted-foreground font-medium">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {myNotifs.map(n => (
            <div 
              key={n.id} 
              onClick={() => markNotificationRead(n.id)} 
              className={`flex items-start gap-4 bg-card border shadow-sm rounded-xl p-5 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md ${
                !n.read ? 'border-primary/50 bg-primary/5' : 'border-border/50 opacity-80'
              }`}
            >
              <div className={`p-3 rounded-full flex-shrink-0 ${!n.read ? 'bg-background shadow-sm' : 'bg-muted'}`}>
                {getNotificationIcon(n.title)}
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <p className={`text-base ${!n.read ? 'font-bold text-foreground' : 'font-medium text-muted-foreground'}`}>
                  {n.title}
                </p>
                <p className={`text-sm mt-1 line-clamp-2 ${!n.read ? 'text-foreground/90' : 'text-muted-foreground'}`}>
                  {n.message}
                </p>
                <p className="text-xs text-muted-foreground mt-2 font-medium flex items-center gap-1">
                  {(() => {
                    const date = new Date(n.timestamp);
                    return isNaN(date.getTime()) ? n.timestamp : formatDistanceToNow(date, { addSuffix: true });
                  })()}
                </p>
              </div>
              {!n.read && (
                <div className="w-2.5 h-2.5 rounded-full bg-primary flex-shrink-0 mt-3" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
