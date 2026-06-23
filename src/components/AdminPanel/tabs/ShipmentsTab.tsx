import { useState, useEffect } from 'react';
import { Package, Cog, Ship, MapPin, Home, CheckCircle, Edit2, Save, X, Copy, ExternalLink } from 'lucide-react';
import { useStore, Order } from '@/lib/store';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type ShipmentStage = 'placed' | 'processing' | 'shipped' | 'transit' | 'out_for_delivery' | 'delivered';

const SHIPMENT_STAGES: { id: ShipmentStage; label: string; icon: React.ReactNode }[] = [
  { id: 'placed', label: 'Order Placed', icon: '📦' },
  { id: 'processing', label: 'Processing', icon: '⚙️' },
  { id: 'shipped', label: 'Shipped', icon: '🚢' },
  { id: 'transit', label: 'In Transit', icon: '🗺️' },
  { id: 'out_for_delivery', label: 'Out for Delivery', icon: '🏠' },
  { id: 'delivered', label: 'Delivered', icon: '✅' },
];

interface EditingTrackingInfo {
  orderId: string;
  trackingNumber: string;
  trackingLink: string;
}

export default function ShipmentsTab() {
  const { orders: storeOrders } = useStore();
  const [orders, setOrders] = useState<Order[]>(storeOrders);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [editingTracking, setEditingTracking] = useState<EditingTrackingInfo | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredOrders = orders.filter((order) =>
    order.id.includes(searchTerm) ||
    order.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.buyerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStageIndex = (stage: string) => {
    return SHIPMENT_STAGES.findIndex((s) => s.id === stage);
  };

  const handleUpdateStage = async (orderId: string, newStage: ShipmentStage) => {
    setIsUpdating(orderId);
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { shipmentStatus: newStage });
      setOrders(orders.map((o) => (o.id === orderId ? { ...o, shipmentStatus: newStage } : o)));
    } catch (error) {
      console.error('Error updating shipment status:', error);
    } finally {
      setIsUpdating(null);
    }
  };

  const handleUpdateTracking = async () => {
    if (!editingTracking) return;

    setIsUpdating(editingTracking.orderId);
    try {
      const orderRef = doc(db, 'orders', editingTracking.orderId);
      await updateDoc(orderRef, {
        trackingNumber: editingTracking.trackingNumber,
        trackingLink: editingTracking.trackingLink,
      });

      setOrders(
        orders.map((o) =>
          o.id === editingTracking.orderId
            ? {
                ...o,
                trackingNumber: editingTracking.trackingNumber,
                trackingLink: editingTracking.trackingLink,
              }
            : o
        )
      );
      setEditingTracking(null);
    } catch (error) {
      console.error('Error updating tracking info:', error);
    } finally {
      setIsUpdating(null);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <input
          type="text"
          placeholder="Search by Order ID, Product, or Buyer name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
        />
      </div>

      {/* Shipments List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 bg-slate-800/30 rounded-xl border border-slate-700/30">
            <p className="text-slate-400">No shipments found</p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const currentStageIndex = getStageIndex(order.shipmentStatus as string);
            const isCompleted = order.shipmentStatus === 'delivered';

            return (
              <div
                key={order.id}
                className="glass-card p-6 border border-slate-700/50 rounded-lg hover:bg-slate-800/40 transition-all space-y-4"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <p className="text-xs text-slate-400">Order ID</p>
                    <p className="text-sm font-mono text-slate-300 font-semibold">{order.id}</p>
                    <p className="text-sm text-white">{order.productName}</p>
                    <p className="text-xs text-slate-400">{order.buyerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Destination</p>
                    <p className="text-sm font-semibold text-white">{order.destinationCountry}</p>
                    <p className="text-xs text-slate-400">Qty: {order.quantity}</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-300">Shipment Progress</p>
                  <div className="grid grid-cols-6 gap-1 md:gap-2">
                    {SHIPMENT_STAGES.map((stage, index) => (
                      <div key={stage.id} className="flex flex-col items-center gap-1">
                        <button
                          onClick={() =>
                            !isCompleted &&
                            handleUpdateStage(order.id, stage.id as ShipmentStage)
                          }
                          disabled={isCompleted || isUpdating === order.id}
                          className={`w-full px-2 py-2 rounded-lg text-xs font-medium transition-all flex flex-col items-center justify-center gap-1 ${
                            index <= currentStageIndex
                              ? 'bg-emerald-500/30 text-emerald-400 border border-emerald-500/50 hover:bg-emerald-500/40'
                              : 'bg-slate-800/50 text-slate-500 border border-slate-700/30 hover:bg-slate-800/70'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          <span className="text-lg">{stage.icon}</span>
                          <span className="hidden sm:inline text-xs">{stage.label.split(' ')[0]}</span>
                        </button>
                        {index < SHIPMENT_STAGES.length - 1 && (
                          <div
                            className={`h-1 w-full rounded-full ${
                              index < currentStageIndex ? 'bg-emerald-500/50' : 'bg-slate-700/30'
                            }`}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Current Stage */}
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                  <p className="text-xs text-slate-400">Current Stage</p>
                  <p className="text-sm font-semibold text-emerald-400">
                    {SHIPMENT_STAGES[currentStageIndex]?.label || 'Unknown'}
                  </p>
                </div>

                {/* Tracking Information */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">Tracking Information</p>
                    {!editingTracking || editingTracking.orderId !== order.id ? (
                      <button
                        onClick={() =>
                          setEditingTracking({
                            orderId: order.id,
                            trackingNumber: order.trackingNumber || '',
                            trackingLink: order.trackingLink || '',
                          })
                        }
                        className="p-1 hover:bg-slate-700 rounded transition-colors text-slate-400 hover:text-slate-200"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    ) : null}
                  </div>

                  {editingTracking && editingTracking.orderId === order.id ? (
                    <div className="space-y-3 bg-slate-800/50 p-3 rounded-lg border border-slate-700/30">
                      <div>
                        <label className="text-xs text-slate-400">Tracking Number</label>
                        <input
                          type="text"
                          value={editingTracking.trackingNumber}
                          onChange={(e) =>
                            setEditingTracking({
                              ...editingTracking,
                              trackingNumber: e.target.value,
                            })
                          }
                          placeholder="Enter tracking number"
                          className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400">Tracking Link</label>
                        <input
                          type="url"
                          value={editingTracking.trackingLink}
                          onChange={(e) =>
                            setEditingTracking({
                              ...editingTracking,
                              trackingLink: e.target.value,
                            })
                          }
                          placeholder="https://..."
                          className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors mt-1"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleUpdateTracking}
                          disabled={isUpdating === order.id}
                          className="flex-1 px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                        >
                          <Save className="w-3 h-3" />
                          Save
                        </button>
                        <button
                          onClick={() => setEditingTracking(null)}
                          className="flex-1 px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded text-sm font-medium transition-colors flex items-center justify-center gap-1"
                        >
                          <X className="w-3 h-3" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {order.trackingNumber ? (
                        <div className="flex items-center justify-between p-2 bg-slate-800/30 rounded border border-slate-700/30">
                          <div>
                            <p className="text-xs text-slate-400">Number</p>
                            <p className="text-sm text-white font-mono">{order.trackingNumber}</p>
                          </div>
                          <button
                            onClick={() => copyToClipboard(order.trackingNumber!, order.id)}
                            className="p-2 hover:bg-slate-700 rounded transition-colors text-slate-400 hover:text-slate-200"
                          >
                            {copiedId === order.id ? (
                              <CheckCircle className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 italic">No tracking number set</p>
                      )}

                      {order.trackingLink ? (
                        <a
                          href={order.trackingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-2 bg-blue-500/10 hover:bg-blue-500/20 rounded border border-blue-500/30 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4 text-blue-400" />
                          <span className="text-sm text-blue-400 truncate">{order.trackingLink}</span>
                        </a>
                      ) : (
                        <p className="text-xs text-slate-500 italic">No tracking link set</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
