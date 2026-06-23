import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { Lock, Users, Package, Truck, Bell, TrendingUp, LogOut, Settings, X } from 'lucide-react';
import UsersTab from './tabs/UsersTab';
import OrdersTab from './tabs/OrdersTab';
import ShipmentsTab from './tabs/ShipmentsTab';
import NotificationsTab from './tabs/NotificationsTab';
import RevenueTab from './tabs/RevenueTab';
import PINVerificationModal from './modals/PINVerificationModal';
import ChangePINModal from './modals/ChangePINModal';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type TabType = 'users' | 'orders' | 'shipments' | 'notifications' | 'revenue';

interface AdminPanelProps {
  onLogout?: () => void;
}

export default function AdminPanel({ onLogout }: AdminPanelProps) {
  const { currentUser } = useStore();
  const [activeTab, setActiveTab] = useState<TabType>('users');
  const [isPINModalOpen, setIsPINModalOpen] = useState(false);
  const [isChangePINOpen, setIsChangePINOpen] = useState(false);
  const [adminPIN, setAdminPIN] = useState('');
  const [showAccessDenied, setShowAccessDenied] = useState(false);

  // Security Check
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      setShowAccessDenied(true);
    }
  }, [currentUser]);

  // Load notifications and users in real-time
  useEffect(() => {
    const store = useStore.getState();

    // Listen to notifications
    const unsubscribeNotifications = onSnapshot(
      collection(db, 'notifications'),
      (snapshot) => {
        const notifications = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as any[];
        // Update store with notifications
      },
      (error) => console.error('Error listening to notifications:', error)
    );

    // Listen to users
    const unsubscribeUsers = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        const users = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as any[];
        // Update store with users
      },
      (error) => console.error('Error listening to users:', error)
    );

    return () => {
      unsubscribeNotifications();
      unsubscribeUsers();
    };
  }, []);

  if (showAccessDenied) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/20 rounded-full">
            <Lock className="w-10 h-10 text-red-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Access Denied</h1>
            <p className="text-slate-400">
              {currentUser ? 'You do not have permission to access this area. Admin access required.' : 'Please log in to continue.'}
            </p>
          </div>
          <button
            onClick={onLogout}
            className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== 'admin') {
    return null;
  }

  const tabs = [
    { id: 'users' as const, label: 'Users', icon: Users },
    { id: 'orders' as const, label: 'Orders', icon: Package },
    { id: 'shipments' as const, label: 'Shipments', icon: Truck },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
    { id: 'revenue' as const, label: 'Revenue', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-900/80 border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Admin Panel
              </h1>
              <p className="text-sm text-slate-400">Shastika Marketplace Management</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsChangePINOpen(true)}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-slate-200"
                title="Change Security PIN"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={onLogout}
                className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-slate-400 hover:text-red-400"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === id
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/25'
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 border border-slate-700/30'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in">
          {activeTab === 'users' && <UsersTab onRequiresPIN={() => setIsPINModalOpen(true)} />}
          {activeTab === 'orders' && <OrdersTab onRequiresPIN={() => setIsPINModalOpen(true)} />}
          {activeTab === 'shipments' && <ShipmentsTab />}
          {activeTab === 'notifications' && <NotificationsTab />}
          {activeTab === 'revenue' && <RevenueTab />}
        </div>
      </main>

      {/* Modals */}
      {isPINModalOpen && (
        <PINVerificationModal
          isOpen={isPINModalOpen}
          onClose={() => setIsPINModalOpen(false)}
          onSuccess={(pin) => {
            setAdminPIN(pin);
            setIsPINModalOpen(false);
          }}
        />
      )}

      {isChangePINOpen && (
        <ChangePINModal
          isOpen={isChangePINOpen}
          onClose={() => setIsChangePINOpen(false)}
          currentPIN={adminPIN}
          onPINChanged={(newPIN) => {
            setAdminPIN(newPIN);
            setIsChangePINOpen(false);
          }}
        />
      )}
    </div>
  );
}
