import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '@/lib/store';
import LanguageSelector from './LanguageSelector';
import LanguageSwitcher from './LanguageSwitcher';
import { LayoutDashboard, ShoppingBag, ClipboardList, CreditCard, Truck, MessageCircle, Bot, ShieldCheck, User, LogOut, Bell, ChevronLeft, Menu, X, Leaf, PlusCircle } from 'lucide-react';
import logo from '@/assets/logo.webp';

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, setCurrentUser, notifications } = useStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const unread = notifications.filter(n => !n.read && (currentUser?.role ? n.targetRoles.includes(currentUser.role) : false)).length;

  const handleLogout = () => { setCurrentUser(null); navigate('/'); };

  const navItems = [
    { path: '/dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { path: '/marketplace', label: t('marketplace'), icon: ShoppingBag },
    { path: '/orders', label: t('orders'), icon: ClipboardList },
    { path: '/payments', label: t('payment'), icon: CreditCard },
    { path: '/shipment', label: t('shipment'), icon: Truck },
    { path: '/chat', label: t('chat'), icon: MessageCircle },

    { path: '/shastika-chatbot', label: 'Shastika Chatbot 🥥', icon: Leaf },
    { path: '/verification', label: t('verification'), icon: ShieldCheck },
    { path: '/profile', label: t('profile'), icon: User },
  ];

  const items = currentUser?.role === 'admin'
    ? [...navItems, { path: '/admin', label: t('admin'), icon: ShieldCheck }]
    : currentUser?.role === 'farmer'
    ? [
        ...navItems,
        { path: '/farmer/add-product', label: t('add_product', 'Add Product'), icon: PlusCircle },
        { path: '/farmer/requests', label: t('purchase_requests', 'Purchase Requests'), icon: ClipboardList },
        { path: '/farmer/payments', label: t('payment_status', 'Payment Status'), icon: CreditCard },
      ]
    : currentUser?.role === 'buyer'
    ? [
        ...navItems,
        { path: '/buyer/rfq', label: t('rfq', 'RFQ'), icon: ClipboardList },
      ]
    : navItems;

  return (
    <div className="flex w-full h-screen bg-background">
      {/* Sidebar - Premium dark green gradient */}
      <aside className={`fixed left-0 top-0 h-screen w-64 sidebar-gradient text-sidebar-foreground flex flex-col shrink-0 z-40 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} shadow-2xl md:shadow-xl`}>
        <div className="p-5 flex items-center justify-between border-b border-sidebar-border/30 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Shastika Logo" className="h-6 w-6" />
            <div>
              <p className="text-white font-bold text-[13px] leading-tight">{t('shastika')} GLOBAL</p>
              <p className="text-green-300 text-[10px]">IMPEX PVT LTD</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden p-1 hover:bg-white/10 rounded-lg transition">
            <X className="w-5 h-5 text-white/80" />
          </button>
        </div>
        <nav className="flex-1 p-3 space-y-[2px] overflow-y-auto">
          {items.map(item => {
            const active = location.pathname === item.path;
            return (
              <button key={item.path} onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 ${active 
                  ? 'bg-accent text-accent-foreground shadow-md scale-[1.02]' 
                  : 'text-white/75 hover:text-white hover:bg-white/10'}`}>
                <item.icon className="w-[18px] h-[18px] shrink-0" />
                <span className="truncate">{item.label}</span>
                {item.path === '/chat' && unread > 0 && <span className="ml-auto bg-red-500 text-white text-[10px] rounded-full px-2 py-0.5 font-bold">{unread}</span>}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-sidebar-border/30 backdrop-blur-xl bg-black/20 sticky bottom-0 shrink-0 mt-auto">
          <div className="flex items-center gap-2 px-2 py-2 rounded-lg mb-2 bg-white/5">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-accent-foreground text-xs font-bold flex-shrink-0">{currentUser?.name?.[0] || 'U'}</div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-white truncate">{currentUser?.name}</p>
              <p className="text-[11px] text-white/60 capitalize">{currentUser?.role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-[13px] text-white/75 hover:bg-white/10 hover:text-white transition-all font-medium">
            <LogOut className="w-[18px] h-[18px]" /> <span>{t('logout')}</span>
          </button>
        </div>
      </aside>
      
      {/* Mobile overlay */}
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/40 md:hidden z-30 backdrop-blur-sm" />}
      
      <main className="flex-1 flex flex-col w-full md:ml-64 overflow-y-auto">
        <header className="sticky top-0 z-20 h-16 border-b border-border/50 bg-card/95 backdrop-blur-sm flex items-center justify-between px-6 shrink-0 shadow-sm">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden p-2 hover:bg-muted rounded-lg transition">
              <Menu className="w-5 h-5 text-muted-foreground" />
            </button>
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition hidden sm:flex group">
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> {t('back')}
            </button>
          </div>
          <div className="flex items-center gap-3 sm:gap-6">
            <LanguageSwitcher className="relative z-50" />
            <button onClick={() => navigate('/notifications')} className="relative p-2 hover:bg-muted rounded-lg transition">
              <Bell className="w-5 h-5 text-muted-foreground hover:text-primary transition" />
              {unread > 0 && <span className="absolute top-1 right-1 w-5 h-5 bg-accent text-accent-foreground text-[10px] font-bold rounded-full flex items-center justify-center">{unread}</span>}
            </button>
            <span className="text-sm text-muted-foreground capitalize hidden sm:inline font-medium">{currentUser?.role} {t('dashboard')}</span>
          </div>
        </header>
        <div className="flex-1 p-6 md:p-8 w-full">{children}</div>
      </main>
    </div>
  );
};

export default AppLayout;
