import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { 
  Menu, LayoutDashboard, ShoppingBag, ClipboardList, 
  FileText, CreditCard, Truck, MessageCircle, HelpCircle, 
  LogOut, Copy, Edit, Trash2, ShoppingCart, Globe, Bell
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const sidebarItems = [
  { name: 'Dashboard', icon: LayoutDashboard },
  { name: 'Marketplace', icon: ShoppingBag },
  { name: 'Orders', icon: ClipboardList },
  { name: 'RFQ', icon: FileText },
  { name: 'Payment', icon: CreditCard },
  { name: 'Shipment', icon: Truck },
  { name: 'Chat', icon: MessageCircle },
  { name: 'Support', icon: HelpCircle },
];

const mockProducts = [
  {
    id: 1,
    name: 'Fresh Cavendish Bananas',
    category: 'Bananas',
    desc: 'High-quality organic Cavendish bananas, export grade.',
    price: '450.00',
    emoji: '🍌',
    inStock: true,
    verified: true,
    exportAvailable: true
  },
  {
    id: 2,
    name: 'Alphonso Mangoes',
    category: 'Mangoes',
    desc: 'Premium quality authentic Alphonso mangoes directly from farms.',
    price: '1200.00',
    emoji: '🥭',
    inStock: true,
    verified: true,
    exportAvailable: true
  },
  {
    id: 3,
    name: 'Organic Rice (Basmati)',
    category: 'Grains',
    desc: 'Long grain aromatic Basmati rice, aged perfectly.',
    price: '150.00',
    emoji: '🍚',
    inStock: false,
    verified: true,
    exportAvailable: false
  },
  {
    id: 4,
    name: 'Fresh Coconuts',
    category: 'Coconuts',
    desc: 'Tender coconuts with sweet water and thick meat.',
    price: '40.00',
    emoji: '🥥',
    inStock: true,
    verified: true,
    exportAvailable: true
  }
];

export default function AdminDashboardNew() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [activeItem, setActiveItem] = useState('Dashboard');
  const navigate = useNavigate();
  const { products } = useStore();

  return (
    <div className="flex h-screen bg-[#064e3b] text-white font-sans overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarExpanded ? 'w-64' : 'w-16'
        } bg-gradient-to-b from-green-900 to-green-950 flex flex-col transition-all duration-300 ease-in-out border-r border-green-800 shadow-2xl relative z-20 shrink-0`}
      >
        <div className="h-16 flex items-center justify-center border-b border-green-800/50">
          <button 
            onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
            className="p-2 rounded-lg hover:bg-green-800/50 text-green-100 transition-colors"
          >
            <Menu size={24} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 space-y-1 scrollbar-hide">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.name;
            return (
              <button
                key={item.name}
                onClick={() => {
                  if (item.name === 'Chat') navigate('/chat');
                  else setActiveItem(item.name);
                }}
                className={`w-full flex items-center px-4 py-3 transition-colors ${
                  isActive 
                    ? 'bg-green-700/50 text-green-300 border-l-4 border-green-400' 
                    : 'text-green-100 hover:bg-green-800/40 hover:text-white border-l-4 border-transparent'
                }`}
                title={!isSidebarExpanded ? item.name : undefined}
              >
                <div className="flex items-center justify-center w-8 shrink-0">
                  <Icon size={20} className={isActive ? 'text-green-400' : 'text-green-200'} />
                </div>
                {isSidebarExpanded && (
                  <span className="ml-3 font-medium whitespace-nowrap overflow-hidden transition-opacity">
                    {item.name}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <div className="p-4 border-t border-green-800/50">
          <div className={`flex items-center ${!isSidebarExpanded && 'justify-center'} mb-4`}>
            <div className="w-8 h-8 rounded-full bg-green-700 flex items-center justify-center shrink-0 border border-green-500">
              <span className="text-sm font-bold text-white">A</span>
            </div>
            {isSidebarExpanded && (
              <div className="ml-3 overflow-hidden">
                <p className="text-sm font-semibold text-white truncate">Admin User</p>
                <p className="text-xs text-green-300 truncate">admin@shastika.com</p>
              </div>
            )}
          </div>
          <button 
            onClick={() => navigate('/')}
            className={`w-full flex items-center ${isSidebarExpanded ? 'px-4' : 'justify-center px-0'} py-2 rounded-lg text-green-200 hover:bg-red-500/20 hover:text-red-400 transition-colors`}
            title={!isSidebarExpanded ? 'Logout' : undefined}
          >
            <div className="flex items-center justify-center w-8 shrink-0">
              <LogOut size={20} />
            </div>
            {isSidebarExpanded && <span className="ml-3 font-medium whitespace-nowrap">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-gradient-to-br from-[#064e3b] to-[#022c22]">
        
        {/* Header */}
        <header className="h-16 bg-gradient-to-r from-green-800 to-green-700 shadow-md flex items-center justify-between px-6 shrink-0 z-10 border-b border-green-600/30">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-white tracking-wide">Shastika GLOBAL - IMPEX PVT LTD</h1>
            <p className="text-xs text-green-200 hidden sm:block">Best quality products at competitive prices, reliable delivery.</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-full hover:bg-green-600/50 transition-colors text-green-100">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-900/40 border border-green-600 hover:bg-green-600/40 transition-colors text-sm font-medium text-white">
              <Globe size={16} />
              EN
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 scrollbar-thin scrollbar-thumb-green-700 scrollbar-track-transparent">
          
          {/* Statistics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-green-800 to-green-900 border border-green-700 hover:border-green-500 p-6 rounded-2xl shadow-lg hover:shadow-green-500/20 transition-all duration-300 group">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold text-green-200 uppercase tracking-wider mb-2">Total Products</p>
                  <p className="text-3xl font-bold text-white">{products.length}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-700/50 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  📦
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-800 to-green-900 border border-green-700 hover:border-green-500 p-6 rounded-2xl shadow-lg hover:shadow-green-500/20 transition-all duration-300 group">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold text-green-200 uppercase tracking-wider mb-2">Verified Farmers</p>
                  <p className="text-3xl font-bold text-white">0</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-700/50 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  👨‍🌾
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-800 to-green-900 border border-green-700 hover:border-blue-500 p-6 rounded-2xl shadow-lg hover:shadow-blue-500/20 transition-all duration-300 group relative overflow-hidden">
              <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <p className="text-sm font-semibold text-green-200 uppercase tracking-wider mb-2">Active Orders</p>
                  <p className="text-3xl font-bold text-white">2</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-600/80 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                  🛒
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-800 to-green-900 border border-green-700 hover:border-green-500 p-6 rounded-2xl shadow-lg hover:shadow-green-500/20 transition-all duration-300 group">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold text-green-200 uppercase tracking-wider mb-2">Total Revenue</p>
                  <p className="text-3xl font-bold text-white">0.0L</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-700/50 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  📈
                </div>
              </div>
            </div>
          </div>

          {/* Product Grid Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Product Listings</h2>
              <button className="px-4 py-2 bg-[#10b981] hover:bg-[#059669] text-white rounded-lg font-medium transition-colors shadow-lg shadow-green-600/30">
                + Add New Product
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <div key={product.id} className="bg-gradient-to-b from-green-800/80 to-green-900/80 backdrop-blur-sm border border-green-700 hover:border-green-500 rounded-2xl overflow-hidden shadow-xl hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)] hover:shadow-green-900/50 transition-all duration-300 group flex flex-col">
                  
                  {/* Top Section */}
                  <div className="relative p-6 flex flex-col items-center justify-center bg-green-900/50 min-h-[160px] border-b border-green-800">
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      <span className={`px-2 py-1 text-[10px] font-bold rounded-md uppercase tracking-wider ${
                        product.quantity > 0 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {product.quantity > 0 ? '✓ In Stock' : '✗ Out of Stock'}
                      </span>
                      {product.exportAvailable && (
                        <span className="px-2 py-1 text-[10px] font-bold rounded-md uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30 self-start">
                          Export Available
                        </span>
                      )}
                    </div>

                    <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 duration-300">
                      <button className="p-1.5 bg-[#064e3b] text-blue-400 rounded-md hover:bg-blue-500 hover:text-white transition-colors border border-green-700 hover:border-blue-500" title="Copy ID">
                        <Copy size={14} />
                      </button>
                      <button className="p-1.5 bg-[#064e3b] text-green-400 rounded-md hover:bg-green-500 hover:text-white transition-colors border border-green-700 hover:border-green-500" title="Edit">
                        <Edit size={14} />
                      </button>
                      <button className="p-1.5 bg-[#064e3b] text-red-400 rounded-md hover:bg-red-500 hover:text-white transition-colors border border-green-700 hover:border-red-500" title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="text-7xl drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform duration-500">
                      {product.image ? <img src={product.image} alt={product.name} className="w-20 h-20 object-cover rounded-full shadow-lg" /> : '📦'}
                    </div>
                  </div>

                  {/* Bottom Section */}
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-green-700 text-green-200">
                        {product.category}
                      </span>
                      {product.verified && (
                        <span className="text-xs font-bold text-green-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                          Verified
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-white mb-1 line-clamp-1 group-hover:text-green-300 transition-colors">
                      {product.name}
                    </h3>
                    
                    <p className="text-sm text-green-100/70 mb-4 line-clamp-2 min-h-[40px]">
                      {product.desc}
                    </p>

                    <div className="mt-auto flex flex-col gap-3 pt-4 border-t border-green-800">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-green-200">Domestic Price:</span>
                        <span className="font-bold text-[#10b981]">₹{product.domesticPrice}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-green-200">Grade / Export Price:</span>
                        <span className="font-bold text-[#10b981]">₹{product.exportPrice || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-green-200 uppercase font-bold tracking-wider">In Stock</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked={product.quantity > 0} />
                          <div className="w-9 h-5 bg-green-900 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
