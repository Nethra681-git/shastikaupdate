import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react';
import { useStore, Order } from '@/lib/store';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface OrdersTabProps {
  onRequiresPIN: () => void;
}

export default function OrdersTab({ onRequiresPIN }: OrdersTabProps) {
  const { orders: storeOrders } = useStore();
  const [orders, setOrders] = useState<Order[]>(storeOrders);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');

  // Real-time listener for orders
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'orders'),
      (snapshot) => {
        const fetchedOrders = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Order[];
        setOrders(fetchedOrders);
      },
      (error) => console.error('Error fetching orders:', error)
    );

    return () => unsubscribe();
  }, []);

  const filteredOrders = orders.filter((order) => {
    if (selectedFilter === 'all') return true;
    return order.farmerAcceptStatus === selectedFilter;
  });

  const pendingOrders = orders.filter((o) => o.farmerAcceptStatus === 'pending');

  const handleApproveOrder = async (orderId: string) => {
    onRequiresPIN();
    setIsUpdating(orderId);

    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { farmerAcceptStatus: 'accepted' });
      setOrders(orders.map((o) => o.id === orderId ? { ...o, farmerAcceptStatus: 'accepted' } : o));
    } catch (error) {
      console.error('Error approving order:', error);
    } finally {
      setIsUpdating(null);
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    onRequiresPIN();
    setIsUpdating(orderId);

    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { farmerAcceptStatus: 'rejected' });
      setOrders(orders.map((o) => o.id === orderId ? { ...o, farmerAcceptStatus: 'rejected' } : o));
    } catch (error) {
      console.error('Error rejecting order:', error);
    } finally {
      setIsUpdating(null);
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === 'accepted') return <CheckCircle className="w-4 h-4 text-emerald-400" />;
    if (status === 'rejected') return <XCircle className="w-4 h-4 text-red-400" />;
    return <Clock className="w-4 h-4 text-yellow-400" />;
  };

  const getStatusColor = (status: string) => {
    if (status === 'accepted') return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    if (status === 'rejected') return 'bg-red-500/20 text-red-400 border-red-500/30';
    return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
  };

  const getPaymentStatusColor = (paid: boolean) => {
    return paid ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4 border border-slate-700/30 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Total Orders</p>
              <p className="text-2xl font-bold text-white">{orders.length}</p>
            </div>
            <Package className="w-6 h-6 text-slate-600" />
          </div>
        </div>
        <div className="glass-card p-4 border border-slate-700/30 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Pending Farmer Acceptance</p>
              <p className="text-2xl font-bold text-yellow-400">{pendingOrders.length}</p>
            </div>
            <Clock className="w-6 h-6 text-yellow-600" />
          </div>
        </div>
        <div className="glass-card p-4 border border-slate-700/30 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Accepted</p>
              <p className="text-2xl font-bold text-emerald-400">
                {orders.filter((o) => o.farmerAcceptStatus === 'accepted').length}
              </p>
            </div>
            <CheckCircle className="w-6 h-6 text-emerald-600" />
          </div>
        </div>
        <div className="glass-card p-4 border border-slate-700/30 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Total Value</p>
              <p className="text-2xl font-bold text-cyan-400">
                ₹{orders.reduce((sum, o) => sum + o.total, 0).toLocaleString()}
              </p>
            </div>
            <TrendingUp className="w-6 h-6 text-cyan-600" />
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'pending', 'accepted', 'rejected'].map((filter) => (
          <button
            key={filter}
            onClick={() => setSelectedFilter(filter as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedFilter === filter
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 bg-slate-800/30 rounded-xl border border-slate-700/30">
            <p className="text-slate-400">No orders found</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="glass-card p-4 border border-slate-700/50 rounded-lg hover:bg-slate-800/40 transition-all"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Order Details */}
                <div>
                  <p className="text-xs text-slate-400">Order ID</p>
                  <p className="text-sm font-mono text-slate-300">{order.id.slice(0, 8)}...</p>
                  <p className="text-sm font-medium text-white mt-2">{order.productName}</p>
                  <p className="text-xs text-slate-400">Qty: {order.quantity}</p>
                </div>

                {/* Buyer & Farmer Info */}
                <div>
                  <div className="mb-3">
                    <p className="text-xs text-slate-400">Buyer</p>
                    <p className="text-sm text-white">{order.buyerName}</p>
                    <p className="text-xs text-slate-400">{order.buyerEmail}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Farmer</p>
                    <p className="text-sm text-white">{order.farmerName}</p>
                  </div>
                </div>

                {/* Status & Price */}
                <div className="flex flex-col items-start lg:items-end gap-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(order.farmerAcceptStatus)}
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(order.farmerAcceptStatus)}`}
                    >
                      {order.farmerAcceptStatus.charAt(0).toUpperCase() + order.farmerAcceptStatus.slice(1)}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium border ${getPaymentStatusColor(order.paymentCompleted)}`}
                  >
                    {order.paymentCompleted ? '✓ Paid' : '⏳ Pending Payment'}
                  </span>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Total</p>
                    <p className="text-lg font-bold text-emerald-400">₹{order.total.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Actions for Pending Orders */}
              {order.farmerAcceptStatus === 'pending' && (
                <div className="mt-4 flex gap-2 pt-4 border-t border-slate-700/30">
                  <button
                    onClick={() => handleApproveOrder(order.id)}
                    disabled={isUpdating === order.id}
                    className="flex-1 px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isUpdating === order.id ? (
                      <div className="w-4 h-4 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    Approve Order
                  </button>
                  <button
                    onClick={() => handleRejectOrder(order.id)}
                    disabled={isUpdating === order.id}
                    className="flex-1 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isUpdating === order.id ? (
                      <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    Reject Order
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Re-export Package icon for use in summary cards
import { Package } from 'lucide-react';
