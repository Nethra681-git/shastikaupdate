import { useState, useEffect } from 'react';
import { X, Bell, Trash2 } from 'lucide-react';
import { useStore, Notification } from '@/lib/store';
import { collection, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function NotificationsTab() {
  const { notifications: storeNotifications } = useStore();
  const [notifications, setNotifications] = useState<Notification[]>(storeNotifications);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  // Real-time listener for notifications
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'notifications'),
      (snapshot) => {
        const fetchedNotifications = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Notification[];
        setNotifications(fetchedNotifications);
      },
      (error) => console.error('Error fetching notifications:', error)
    );

    return () => unsubscribe();
  }, []);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const notifRef = doc(db, 'notifications', notificationId);
      await updateDoc(notifRef, { read: true });
      setNotifications(
        notifications.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    setIsDeletingId(notificationId);
    try {
      await deleteDoc(doc(db, 'notifications', notificationId));
      setNotifications(notifications.filter((n) => n.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    } finally {
      setIsDeletingId(null);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getRoleColors = (roles: string[]) => {
    return roles.map((role) => {
      const colorMap: Record<string, string> = {
        admin: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        farmer: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        buyer: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      };
      return colorMap[role] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    });
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">System Notifications</h2>
          {unreadCount > 0 && (
            <p className="text-sm text-slate-400 mt-1">
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-12 bg-slate-800/30 rounded-xl border border-slate-700/30">
            <Bell className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No notifications yet</p>
          </div>
        ) : (
          notifications
            .sort(
              (a, b) =>
                new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            )
            .map((notification) => (
              <div
                key={notification.id}
                onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                className={`glass-card p-4 border rounded-lg transition-all cursor-pointer ${
                  notification.read
                    ? 'bg-slate-800/20 border-slate-700/30 opacity-75'
                    : 'border-emerald-500/50 bg-emerald-500/10 hover:bg-emerald-500/15'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Notification Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-white break-words">
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <span className="flex-shrink-0 w-2 h-2 rounded-full bg-emerald-400" />
                      )}
                    </div>
                    <p className="text-sm text-slate-300 mb-2">{notification.message}</p>
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="text-xs text-slate-500">
                        {formatTime(notification.timestamp)}
                      </span>
                      {notification.targetRoles && notification.targetRoles.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {notification.targetRoles.map((role, idx) => (
                            <span
                              key={idx}
                              className={`px-2 py-0.5 rounded text-xs font-medium border ${getRoleColors([role])[0]}`}
                            >
                              {role.charAt(0).toUpperCase() + role.slice(1)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!notification.read && (
                      <div className="w-2 h-2 rounded-full bg-emerald-400" title="Unread" />
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNotification(notification.id);
                      }}
                      disabled={isDeletingId === notification.id}
                      className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-slate-400 hover:text-red-400 disabled:opacity-50"
                      title="Delete"
                    >
                      {isDeletingId === notification.id ? (
                        <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))
        )}
      </div>

      {/* Bulk Actions */}
      {unreadCount > 0 && (
        <div className="flex gap-2">
          <button
            onClick={() => {
              notifications
                .filter((n) => !n.read)
                .forEach((n) => handleMarkAsRead(n.id));
            }}
            className="flex-1 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg font-medium transition-colors"
          >
            Mark All as Read
          </button>
        </div>
      )}
    </div>
  );
}
