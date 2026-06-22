import { create } from 'zustand';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { PRODUCTS } from '@/assets/products';

export type UserRole = 'farmer' | 'buyer' | 'admin';
export type UserStatus = 'pending' | 'approved' | 'rejected' | 'disabled';
export type UserType = 'domestic' | 'international';
export type ShipmentStatus = 'placed' | 'packing' | 'container_stuffing' | 'customs_clearance' | 'vessel_departure' | 'arrival' | 'delivered' | 'processing' | 'shipped' | 'transit' | 'out_for_delivery';
export type PaymentMethod = 'upi';
export type PaymentStatus = 'pending' | 'approved' | 'rejected' | 'failed';
export type OrderAcceptStatus = 'pending' | 'accepted' | 'rejected';

export interface RFQ {
  id: string;
  buyerId: string;
  productName: string;
  quantity: number;
  unit: string;
  destinationCountry: string;
  expectedDeliveryDate: string;
  additionalNotes: string;
  status: 'pending' | 'replied' | 'closed';
  submittedAt: string;
}

export interface Payment {
  id: string;
  orderId: string;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  amount: number;
  method: PaymentMethod;
  transactionId: string;
  utrNumber: string;
  bankName: string;
  status: PaymentStatus;
  timestamp: string;
  adminNote: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  role: UserRole;
  status: UserStatus;
  userType: UserType;
  companyName?: string;
  verified: boolean;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string;
  farmerName: string;
  location: string;
  domesticPrice: number;
  exportPrice: number;
  quantity: number;
  unit: string;
  shippingType: string;
  exportAvailable: boolean;
  packaging: string;
}

export interface Order {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  farmerName: string;
  paymentMethod: PaymentMethod;
  shipmentStatus: ShipmentStatus;
  shippingMethod: 'sea' | 'air';
  destinationCountry: string;
  orderDate: string;
  marketType: 'domestic' | 'international';
  farmerAcceptStatus: OrderAcceptStatus;
  paymentCompleted: boolean;
  trackingNumber?: string;
  trackingLink?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  targetRoles: UserRole[];
}

interface AppState {
  currentUser: User | null;
  users: User[];
  products: Product[];
  setProducts: (products: Product[]) => void;
  orders: Order[];
  payments: Payment[];
  messages: ChatMessage[];
  notifications: Notification[];
  rfqs: RFQ[];
  setCurrentUser: (user: User | null) => void;
  addUser: (user: User) => void;
  updateUserStatus: (userId: string, status: UserStatus) => void;
  addOrder: (order: Order) => void;
  addPayment: (p: Payment) => void;
  updatePaymentStatus: (paymentId: string, status: PaymentStatus, note?: string) => void;
  updateShipmentStatus: (orderId: string, status: ShipmentStatus) => void;
  updateProductPrice: (productId: string, domestic: number, exportPrice: number) => Promise<void>;
  updateProductStock: (productId: string, quantity: number) => void;
  updateOrderFarmerStatus: (orderId: string, status: OrderAcceptStatus) => void;
  markOrderPaymentComplete: (orderId: string) => void;
  updateTrackingInfo: (orderId: string, trackingNumber: string, trackingLink: string) => void;
  addMessage: (msg: ChatMessage) => void;
  addNotification: (n: Notification) => void;
  markNotificationRead: (id: string) => void;
  addProduct: (product: Product) => Promise<void>;
  setProducts: (products: Product[]) => void;
  deleteProduct: (productId: string) => Promise<void>;
  updateProductExportStatus: (productId: string, exportAvailable: boolean) => Promise<void>;
  submitRFQ: (rfq: RFQ) => Promise<void>;
}

const defaultProducts: Product[] = PRODUCTS as any;

export const loadProducts = async () => {
  const snapshot = await getDocs(collection(db, "products"));

  const firestoreData: Record<string, any> = {};
  snapshot.docs.forEach(doc => {
    firestoreData[doc.id] = doc.data();
  });

  return defaultProducts.map(p => ({
    ...p,
    ...(firestoreData[p.id] || {})
  }));
};

export const useStore = create<AppState>((set) => ({
  currentUser: null,
  users: [],
  products: defaultProducts,
  setProducts: (products) => set({ products }),
  orders: [],
  payments: [],
  messages: [],
  notifications: [],
  rfqs: [],
  setCurrentUser: (user) => set({ currentUser: user }),
  addUser: (user) => set((s) => ({ users: [...s.users, user] })),
  updateUserStatus: (userId, status) => set((s) => ({ users: s.users.map(u => u.id === userId ? { ...u, status } : u) })),
  addOrder: async (order) => {
    // Add to Firestore
    await addDoc(collection(db, "orders"), order);
    set((s) => ({ orders: [...s.orders, order] }));
  },
  addPayment: (p) => set((s) => ({ payments: [...s.payments, p] })),
  updatePaymentStatus: (paymentId, status, note) => set((s) => ({
    payments: s.payments.map(p => p.id === paymentId ? { ...p, status, adminNote: note || p.adminNote } : p)
  })),
  updateShipmentStatus: (orderId, status) => set((s) => ({ orders: s.orders.map(o => o.id === orderId ? { ...o, shipmentStatus: status } : o) })),
  updateProductPrice: async (productId, domestic, exportPrice) => {
    try {
      // First update in Firebase
      const { doc, updateDoc } = await import('firebase/firestore');
      const productRef = doc(db, "products", productId);
      await updateDoc(productRef, { domesticPrice: domestic, exportPrice: exportPrice });
      
      // Then update local state for real-time reflection
      set((s) => ({ products: s.products.map(p => p.id === productId ? { ...p, domesticPrice: domestic, exportPrice } : p) }));
    } catch (error) {
      console.error("Error updating price in database:", error);
      throw error;
    }
  },
  updateProductStock: (productId, quantity) => set((s) => ({ products: s.products.map(p => p.id === productId ? { ...p, quantity } : p) })),
  addProduct: async (p) => {
    await addDoc(collection(db, "products"), p);
    set((s) => ({ products: [...s.products, { ...p, id: p.id || Date.now().toString() }] }));
  },
  deleteProduct: async (productId) => {
    try {
      const { doc, deleteDoc } = await import('firebase/firestore');
      await deleteDoc(doc(db, "products", productId));
    } catch (e) {
      console.warn("Product might not be in Firestore, removing locally", e);
    }
    set((s) => ({ products: s.products.filter(p => p.id !== productId) }));
  },
  updateProductExportStatus: async (productId, exportAvailable) => {
    try {
      const { doc, updateDoc } = await import('firebase/firestore');
      const productRef = doc(db, "products", productId);
      await updateDoc(productRef, { exportAvailable });
    } catch (e) {
      console.warn("Error updating export status in db", e);
    }
    set((s) => ({ products: s.products.map(p => p.id === productId ? { ...p, exportAvailable } : p) }));
  },
  updateOrderFarmerStatus: (orderId, status) => set((s) => ({ orders: s.orders.map(o => o.id === orderId ? { ...o, farmerAcceptStatus: status } : o) })),
  markOrderPaymentComplete: (orderId) => set((s) => ({ orders: s.orders.map(o => o.id === orderId ? { ...o, paymentCompleted: true } : o) })),
  updateTrackingInfo: (orderId, trackingNumber, trackingLink) => set((s) => ({ orders: s.orders.map(o => o.id === orderId ? { ...o, trackingNumber, trackingLink } : o) })),
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  addNotification: (n) => set((s) => ({ notifications: [...s.notifications, n] })),
  markNotificationRead: (id) => set((s) => ({ notifications: s.notifications.map(n => n.id === id ? { ...n, read: true } : n) })),
  submitRFQ: async (rfq) => {
    await addDoc(collection(db, "rfqs"), rfq);
    set((s) => ({ rfqs: [...s.rfqs, rfq] }));
  },
}));