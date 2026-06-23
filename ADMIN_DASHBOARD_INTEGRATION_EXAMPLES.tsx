/**
 * Admin Dashboard Integration Examples
 * 
 * This file shows various ways to integrate the AdminDashboard component
 * into your existing React application.
 */

// ============================================================================
// EXAMPLE 1: Simple Integration into App.tsx
// ============================================================================

import AdminDashboard from '@/components/AdminDashboard';

export function AppExample1() {
  return (
    <div>
      <AdminDashboard />
    </div>
  );
}

// ============================================================================
// EXAMPLE 2: With React Router Integration
// ============================================================================

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminDashboardPage from '@/pages/AdminDashboardPage';

export function AppWithRouting() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div>Home Page</div>} />
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}

// ============================================================================
// EXAMPLE 3: Protected Admin Routes with Role-Based Access
// ============================================================================

import { useAuth } from '@/hooks/useAuth'; // Hypothetical auth hook

interface ProtectedRouteProps {
  requiredRole?: string;
}

function AdminRoute({ requiredRole = 'admin' }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!user || user.role !== requiredRole) return <div>Access Denied</div>;

  return <AdminDashboardPage />;
}

export function AppWithProtectedRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<AdminRoute />} />
      </Routes>
    </BrowserRouter>
  );
}

// ============================================================================
// EXAMPLE 4: Admin Dashboard with Dynamic Product Data
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Menu, X, LayoutDashboard, ShoppingCart, Package, FileText, CreditCard, Truck, MessageSquare, HelpCircle, LogOut, Globe, Copy, Edit2, Trash2, Bell, ChevronDown } from 'lucide-react';
import { useSidebar } from '@/hooks/useSidebar';

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

export function AdminDashboardWithAPI() {
  const { isOpen, toggleSidebar } = useSidebar();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div className="text-white">Loading dashboard...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Sidebar and other components would go here */}
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold text-white mb-6">Products</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <div key={product.id} className="bg-gray-900 border border-green-700 rounded-lg p-4">
              <h3 className="text-white font-bold">{product.name}</h3>
              <p className="text-green-400">₹ {product.price}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

// ============================================================================
// EXAMPLE 5: Extending AdminDashboard with Custom Hooks
// ============================================================================

import { useCallback } from 'react';

// Custom hook for handling product actions
export function useProductActions() {
  const handleCopy = useCallback((productId: string) => {
    console.log('Copying product:', productId);
    navigator.clipboard.writeText(productId);
  }, []);

  const handleEdit = useCallback((productId: string) => {
    console.log('Editing product:', productId);
    // Navigate to edit page or open modal
  }, []);

  const handleDelete = useCallback(async (productId: string) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await fetch(`/api/products/${productId}`, { method: 'DELETE' });
      console.log('Product deleted');
    } catch (error) {
      console.error('Delete failed:', error);
    }
  }, []);

  return { handleCopy, handleEdit, handleDelete };
}

// ============================================================================
// EXAMPLE 6: Admin Dashboard with Context API for State Management
// ============================================================================

import React, { createContext, useContext, ReactNode } from 'react';

interface AdminContextType {
  selectedLanguage: string;
  setSelectedLanguage: (lang: string) => void;
  activeNav: string;
  setActiveNav: (nav: string) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [selectedLanguage, setSelectedLanguage] = React.useState('en');
  const [activeNav, setActiveNav] = React.useState('dashboard');

  const value: AdminContextType = {
    selectedLanguage,
    setSelectedLanguage,
    activeNav,
    setActiveNav,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
}

// ============================================================================
// EXAMPLE 7: Navigation with Query Parameters
// ============================================================================

import { useSearchParams } from 'react-router-dom';

export function AdminDashboardWithParams() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeNav = searchParams.get('tab') || 'dashboard';

  const handleNavigation = (tab: string) => {
    setSearchParams({ tab });
  };

  return (
    <div>
      {/* Navigation would use activeNav state */}
      <AdminDashboard />
    </div>
  );
}

// ============================================================================
// EXAMPLE 8: Admin Dashboard with Modal for Product Management
// ============================================================================

export function AdminDashboardWithModals() {
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  const handleSave = async (updatedProduct: Product) => {
    try {
      const response = await fetch(`/api/products/${updatedProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct),
      });
      if (response.ok) {
        setIsEditModalOpen(false);
        // Refresh products list
      }
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  return (
    <div>
      {/* Modal would be rendered here */}
      {isEditModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-gray-900 p-6 rounded-lg max-w-md w-full">
            <h2 className="text-white text-lg font-bold mb-4">Edit Product</h2>
            <input
              type="text"
              defaultValue={selectedProduct.name}
              className="w-full bg-gray-800 text-white px-3 py-2 rounded mb-4"
            />
            <button
              onClick={() => handleSave({ ...selectedProduct, name: 'Updated Name' })}
              className="w-full bg-green-600 text-white py-2 rounded"
            >
              Save
            </button>
          </div>
        </div>
      )}
      <AdminDashboard />
    </div>
  );
}

// ============================================================================
// EXAMPLE 9: Admin Dashboard with Real-time Updates via WebSocket
// ============================================================================

export function AdminDashboardWithWebSocket() {
  const [products, setProducts] = React.useState<Product[]>([]);

  React.useEffect(() => {
    const ws = new WebSocket('wss://your-server.com/admin/products');

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'product-update') {
        setProducts((prev) =>
          prev.map((p) => (p.id === data.product.id ? data.product : p))
        );
      }
    };

    return () => ws.close();
  }, []);

  return <AdminDashboard />;
}

// ============================================================================
// EXAMPLE 10: Complete App Structure
// ============================================================================

export function CompleteAppStructure() {
  return (
    <AdminProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<div>Home</div>} />
          <Route path="/auth/login" element={<div>Login</div>} />
          <Route path="/admin/*" element={<AdminRoutes />} />
        </Routes>
      </BrowserRouter>
    </AdminProvider>
  );
}

function AdminRoutes() {
  return (
    <Routes>
      <Route index element={<AdminDashboardPage />} />
      <Route path="dashboard" element={<AdminDashboardPage />} />
      <Route path="marketplace" element={<div>Marketplace</div>} />
      <Route path="orders" element={<div>Orders</div>} />
      <Route path="product/:id/edit" element={<div>Edit Product</div>} />
    </Routes>
  );
}

// ============================================================================
// EXAMPLE 11: Admin Dashboard with Analytics
// ============================================================================

export interface DashboardStats {
  totalProducts: number;
  verifiedFarmers: number;
  activeOrders: number;
  totalRevenue: number;
  recentActivity: string[];
}

export function AdminDashboardWithAnalytics() {
  const [stats, setStats] = React.useState<DashboardStats | null>(null);

  React.useEffect(() => {
    const fetchStats = async () => {
      const response = await fetch('/api/admin/stats');
      const data = await response.json();
      setStats(data);
    };

    fetchStats();
    // Refresh stats every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (!stats) return <div>Loading stats...</div>;

  return <AdminDashboard />;
}

// ============================================================================
// EXPORT for documentation
// ============================================================================

export default {
  AppExample1,
  AppWithRouting,
  AppWithProtectedRoutes,
  AdminDashboardWithAPI,
  useProductActions,
  AdminProvider,
  useAdmin,
  AdminDashboardWithParams,
  AdminDashboardWithModals,
  AdminDashboardWithWebSocket,
  CompleteAppStructure,
  AdminDashboardWithAnalytics,
};
