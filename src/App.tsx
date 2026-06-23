import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Route, Routes, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useStore, Product } from "@/lib/store";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import AppLayout from "@/components/AppLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Marketplace from "./pages/Marketplace";
import ProductDetail from "./pages/ProductDetail";
import OrderPage from "./pages/OrderPage";
import Orders from "./pages/Orders";
import Payments from "./pages/Payments";
import Shipment from "./pages/Shipment";
import Chat from "./pages/Chat";
import ShastikaChatbot from "./pages/cocobot";
import Verification from "./pages/Verification";
import Profile from "./pages/Profile";
import AdminPanel from "./pages/AdminPanel";
import AdminDashboardNew from "./pages/AdminDashboardNew";
import AdminProducts from "./pages/AdminProducts";
import AdminUpdateProducts from "./pages/AdminUpdateProducts";
import Notifications from "./pages/Notifications";
import FarmerDashboard from "./pages/FarmerDashboard";
import FarmerAddProduct from "./pages/FarmerAddProduct";
import FarmerRequestsNew from "./pages/FarmerRequestsNew";
import FarmerPayments from "./pages/FarmerPayments";
import PaymentConfirmation from "./pages/PaymentConfirmation";
import WaitingForApproval from "./pages/WaitingForApproval";
import NotFound from "./pages/NotFound";
import AuthRedirectHandler from "./pages/AuthRedirectHandler";
import BuyerRFQ from "./pages/BuyerRFQ";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { t } = useTranslation();
  const { currentUser } = useStore();
  const { isLoading, isAccessDenied, denialReason } = useProtectedRoute();

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-pulse text-muted-foreground">{t('loading')}</div>
        </div>
      </AppLayout>
    );
  }

  if (isAccessDenied) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-destructive font-semibold mb-2">{denialReason}</p>
            <p className="text-muted-foreground text-sm">{t('redirect_login')}</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!currentUser) return <Navigate to="/" replace />;
  return <AppLayout>{children}</AppLayout>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser } = useStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 800);
    return () => clearTimeout(t);
  }, []);

  if (!ready) return (
    <AppLayout>
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    </AppLayout>
  );

  if (!currentUser || currentUser.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return <AppLayout>{children}</AppLayout>;
};

const StandaloneAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser } = useStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 800);
    return () => clearTimeout(t);
  }, []);

  if (!ready) return (
    <div className="flex items-center justify-center min-h-screen bg-[#064e3b]">
      <div className="animate-pulse text-green-200">Loading...</div>
    </div>
  );

  if (!currentUser || currentUser.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const FarmerRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser } = useStore();
  if (!currentUser || currentUser.role !== 'farmer') return <Navigate to="/dashboard" replace />;
  return <AppLayout>{children}</AppLayout>;
};

const App = () => {
  const { setProducts } = useStore();

  useEffect(() => {
    // Listen for live updates to the products collection
    const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
      const firestoreProducts: Record<string, any> = {};
      snapshot.docs.forEach((doc) => {
        firestoreProducts[doc.id] = doc.data();
      });

      // We merge firestore data over the default products, or just load them directly if they are entirely in firestore.
      // Assuming store.ts defaultProducts are the baseline:
      import('@/lib/store').then(({ PRODUCTS }) => {
        const mergedProducts = (PRODUCTS as unknown as Product[]).map(p => ({
          ...p,
          ...(firestoreProducts[p.id] || {})
        }));
        
        // Add any NEW products created by farmers that aren't in the default PRODUCTS list
        snapshot.docs.forEach((doc) => {
          if (!mergedProducts.some(mp => mp.id === doc.id)) {
            mergedProducts.push({ id: doc.id, ...doc.data() } as Product);
          }
        });

        setProducts(mergedProducts);
      });
    }, (error) => {
      console.error("Error listening to products collection:", error);
    });

    return () => unsubscribe();
  }, [setProducts]);

  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/__/auth/handler" element={<AuthRedirectHandler />} />
          <Route path="/waiting-for-approval" element={<WaitingForApproval />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
          <Route path="/product/:id" element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} />
          <Route path="/order/:id" element={<ProtectedRoute><OrderPage /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/payment-confirmation" element={<ProtectedRoute><PaymentConfirmation /></ProtectedRoute>} />
          <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
          <Route path="/shipment" element={<ProtectedRoute><Shipment /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/shastika-chatbot" element={<ProtectedRoute><ShastikaChatbot /></ProtectedRoute>} />
          <Route path="/verification" element={<ProtectedRoute><Verification /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/buyer/rfq" element={<ProtectedRoute><BuyerRFQ /></ProtectedRoute>} />
          <Route path="/farmer-dashboard" element={<FarmerRoute><FarmerDashboard /></FarmerRoute>} />
          <Route path="/farmer/add-product" element={<FarmerRoute><FarmerAddProduct /></FarmerRoute>} />
          <Route path="/farmer/requests" element={<FarmerRoute><FarmerRequestsNew /></FarmerRoute>} />
          <Route path="/farmer/payments" element={<FarmerRoute><FarmerPayments /></FarmerRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
          <Route path="/admin-dashboard" element={<StandaloneAdminRoute><AdminDashboardNew /></StandaloneAdminRoute>} />
          <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
          <Route path="/admin/update-products" element={<AdminRoute><AdminUpdateProducts /></AdminRoute>} />
          <Route path="/admin/add-product" element={<AdminRoute><FarmerAddProduct /></AdminRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;