import React, { useState } from 'react';
import {
  Menu,
  X,
  LayoutDashboard,
  ShoppingCart,
  Package,
  FileText,
  CreditCard,
  Truck,
  MessageSquare,
  HelpCircle,
  LogOut,
  Globe,
  Copy,
  Edit2,
  Trash2,
  Bell,
  ChevronDown,
} from 'lucide-react';
import { useSidebar } from '../hooks/useSidebar';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  inStock: boolean;
  verified: boolean;
  exportAvailable: boolean;
}

interface StatCard {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  backgroundColor: string;
  iconBgColor: string;
}

const AdminDashboard: React.FC = () => {
  const { isOpen, toggleSidebar } = useSidebar();
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  // Mock data
  const products: Product[] = [
    {
      id: '1',
      name: 'Fresh Bananas',
      category: 'Bananas',
      price: 45,
      description: 'High-quality fresh bananas from Kerala, perfect for wholesale and retail.',
      image: '🍌',
      inStock: true,
      verified: true,
      exportAvailable: true,
    },
    {
      id: '2',
      name: 'Organic Tomatoes',
      category: 'Vegetables',
      price: 30,
      description: 'Pesticide-free tomatoes grown in organic farms.',
      image: '🍅',
      inStock: true,
      verified: true,
      exportAvailable: false,
    },
    {
      id: '3',
      name: 'Spice Mix',
      category: 'Spices',
      price: 250,
      description: 'Premium quality spice blend for commercial use.',
      image: '🌶️',
      inStock: false,
      verified: true,
      exportAvailable: true,
    },
    {
      id: '4',
      name: 'Coconut Oil',
      category: 'Oils',
      price: 180,
      description: 'Cold-pressed virgin coconut oil with high purity.',
      image: '🥥',
      inStock: true,
      verified: true,
      exportAvailable: true,
    },
    {
      id: '5',
      name: 'Mango Pulp',
      category: 'Fruits',
      price: 120,
      description: 'Fresh mango pulp for food processing industry.',
      image: '🥭',
      inStock: true,
      verified: true,
      exportAvailable: true,
    },
    {
      id: '6',
      name: 'Rice - Basmati',
      category: 'Grains',
      price: 85,
      description: 'Long-grain basmati rice with excellent aroma.',
      image: '🌾',
      inStock: true,
      verified: true,
      exportAvailable: true,
    },
    {
      id: '7',
      name: 'Garlic Bulbs',
      category: 'Vegetables',
      price: 60,
      description: 'Fresh garlic bulbs from certified farms.',
      image: '🧄',
      inStock: true,
      verified: false,
      exportAvailable: false,
    },
    {
      id: '8',
      name: 'Honey - Raw',
      category: 'Honey',
      price: 300,
      description: 'Pure raw honey with no additives.',
      image: '🍯',
      inStock: true,
      verified: true,
      exportAvailable: true,
    },
  ];

  const stats: StatCard[] = [
    {
      title: 'Total Products',
      value: '22',
      icon: '📦',
      backgroundColor: 'bg-gradient-to-br from-green-800 to-green-900',
      iconBgColor: 'bg-green-700',
    },
    {
      title: 'Verified Farmers',
      value: '0',
      icon: '👨‍🌾',
      backgroundColor: 'bg-gradient-to-br from-green-800 to-green-900',
      iconBgColor: 'bg-green-700',
    },
    {
      title: 'Active Orders',
      value: '2',
      icon: '🛒',
      backgroundColor: 'bg-gradient-to-br from-blue-800 to-blue-900',
      iconBgColor: 'bg-blue-700',
    },
    {
      title: 'Total Revenue',
      value: '0.0L',
      icon: '📈',
      backgroundColor: 'bg-gradient-to-br from-green-800 to-green-900',
      iconBgColor: 'bg-green-700',
    },
  ];

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'marketplace', label: 'Marketplace', icon: ShoppingCart },
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'rfq', label: 'RFQ', icon: FileText },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'shipment', label: 'Shipment', icon: Truck },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'support', label: 'Support', icon: HelpCircle },
  ];

  const [activeNav, setActiveNav] = useState('dashboard');

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-green-900 to-green-950 border-r border-green-700 transition-all duration-300 z-40 ${
          isOpen ? 'w-64' : 'w-16'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-green-700">
          {isOpen && (
            <h1 className="text-lg font-bold text-white">Shastika</h1>
          )}
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-green-800 rounded-lg transition-colors"
            aria-label="Toggle sidebar"
          >
            {isOpen ? (
              <X className="w-5 h-5 text-green-100" />
            ) : (
              <Menu className="w-5 h-5 text-green-100" />
            )}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-green-700 text-white'
                    : 'text-green-100 hover:bg-green-800'
                }`}
                title={!isOpen ? item.label : ''}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {isOpen && <span className="text-sm">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* User Profile Section */}
        <div className="border-t border-green-700 p-4 space-y-2">
          {isOpen && (
            <div className="text-sm">
              <p className="text-white font-medium">Admin User</p>
              <p className="text-green-200 text-xs">admin@shastika.com</p>
            </div>
          )}
          <button className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors">
            <LogOut className="w-4 h-4" />
            {isOpen && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${isOpen ? 'ml-64' : 'ml-16'}`}>
        {/* Header */}
        <header className="bg-gradient-to-r from-green-800 to-green-700 border-b border-green-600 sticky top-0 z-30">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">
                Shastika GLOBAL - IMPEX PVT LTD
              </h1>
              <p className="text-sm text-green-100 mt-1">
                Best quality products at competitive prices, reliable delivery.
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="p-2 hover:bg-green-700 rounded-lg transition-colors relative">
                <Bell className="w-5 h-5 text-white" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Language Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                  className="flex items-center gap-2 px-3 py-2 bg-green-700 hover:bg-green-600 rounded-lg transition-colors text-white"
                >
                  <Globe className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {selectedLanguage === 'en' ? 'English' : 'हिन्दी'}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {showLanguageMenu && (
                  <div className="absolute right-0 mt-2 w-32 bg-gray-900 border border-green-700 rounded-lg shadow-lg z-50">
                    <button
                      onClick={() => {
                        setSelectedLanguage('en');
                        setShowLanguageMenu(false);
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-green-700 ${
                        selectedLanguage === 'en' ? 'bg-green-700' : ''
                      } transition-colors`}
                    >
                      <span className="text-white text-sm">English</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedLanguage('hi');
                        setShowLanguageMenu(false);
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-green-700 ${
                        selectedLanguage === 'hi' ? 'bg-green-700' : ''
                      } transition-colors`}
                    >
                      <span className="text-white text-sm">हिन्दी</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6 space-y-8">
          {/* Statistics Section */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">Dashboard Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat) => (
                <div
                  key={stat.title}
                  className={`${stat.backgroundColor} border border-green-700 rounded-lg p-6 hover:border-green-500 transition-colors`}
                >
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-green-200 text-sm mb-2">{stat.title}</p>
                      <p className="text-3xl font-bold text-white">{stat.value}</p>
                    </div>
                    <div className={`${stat.iconBgColor} rounded-full p-3 text-2xl`}>
                      {stat.icon}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Products Section */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">Product Listings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-gray-900 border border-green-700 rounded-lg overflow-hidden hover:border-green-500 transition-colors hover:shadow-lg hover:shadow-green-700/20"
                >
                  {/* Product Image Area */}
                  <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 p-8 flex items-center justify-center min-h-48 group">
                    {/* Status Badges */}
                    <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded ${
                          product.inStock
                            ? 'bg-green-600 text-white'
                            : 'bg-red-600 text-white'
                        }`}
                      >
                        {product.inStock ? '✓ In Stock' : '✗ Out of Stock'}
                      </span>
                      {product.exportAvailable && (
                        <span className="text-xs font-semibold px-2 py-1 rounded bg-blue-600 text-white">
                          Export Available
                        </span>
                      )}
                    </div>

                    {/* Product Image/Emoji */}
                    <div className="text-6xl text-center">{product.image}</div>

                    {/* Action Icons */}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors">
                        <Copy className="w-4 h-4" />
                      </button>
                      <button className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4 space-y-3">
                    {/* Category Badge */}
                    <div>
                      <span className="inline-block bg-green-700 text-white text-xs font-semibold px-2 py-1 rounded">
                        {product.category}
                      </span>
                      {product.verified && (
                        <span className="ml-2 text-green-400 text-sm">✓ Verified</span>
                      )}
                    </div>

                    {/* Product Name */}
                    <h3 className="text-white font-bold text-sm">{product.name}</h3>

                    {/* Description */}
                    <p className="text-green-100 text-xs line-clamp-2">
                      {product.description}
                    </p>

                    {/* Price */}
                    <div className="pt-2 border-t border-green-700">
                      <p className="text-green-400 font-bold text-lg">
                        ₹ {product.price}
                      </p>
                    </div>

                    {/* Action Button */}
                    <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm font-medium">
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
