import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useStore, type ShipmentStatus } from '@/lib/store';
import {
  Users, Package, ClipboardList, Truck, DollarSign, Bell, TrendingUp,
  Check, X, Ban, Trash2, Download, Shield, Edit2, Save, AlertCircle, MessageCircle,
  ChevronRight, Lock
} from 'lucide-react';

const tabs = ['Users', 'Orders', 'Products', 'Shipments', 'Notifications', 'Revenue'];

const SHIPMENT_STEPS: { status: ShipmentStatus; label: string; emoji: string }[] = [
  { status: 'placed',           label: 'Order Placed',     emoji: '📦' },
  { status: 'processing',       label: 'Processing',       emoji: '⚙️' },
  { status: 'shipped',          label: 'Shipped',          emoji: '🚢' },
  { status: 'transit',          label: 'In Transit',       emoji: '🗺️' },
  { status: 'out_for_delivery', label: 'Out for Delivery', emoji: '🏠' },
  { status: 'delivered',        label: 'Delivered',        emoji: '✅' },
];

const AdminPanel = () => {
  const navigate = useNavigate();
  const {
    users, orders, notifications, products, deleteProduct,
    updateShipmentStatus, updateTrackingInfo
  } = useStore();
  
  const [activeTab, setActiveTab] = useState('Users');
  const [editTracking, setEditTracking] = useState<{ id: string; trackingNumber: string; trackingLink: string } | null>(null);
  
  const [firestoreUsers, setFirestoreUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [firestoreOrders, setFirestoreOrders] = useState<any[]>([]);
  const [roleFilter, setRoleFilter] = useState<'all' | 'buyer' | 'farmer'>('all');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [newPin, setNewPin] = useState('');

  useEffect(() => {
    setLoadingUsers(true);
    const unsubscribe = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        setFirestoreUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoadingUsers(false);
      },
      (error) => {
        setErrorMessage(error.message);
        setLoadingUsers(false);
      }
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'orders'),
      (snapshot) => {
        setFirestoreOrders(snapshot.docs.map(docSnap => ({
          firestoreDocId: docSnap.id,
          ...docSnap.data(),
          id: docSnap.data().id || docSnap.id,
        })));
      },
      (error) => console.error('Orders listener error:', error)
    );
    return () => unsubscribe();
  }, []);

  const handleApprove = async (userId: string) => {
    try { await updateDoc(doc(db, 'users', userId), { status: 'approved' }); }
    catch (err) { setErrorMessage(`Error approving user: ${err instanceof Error ? err.message : 'Unknown'}`); }
  };
  
  const handleReject = async (userId: string) => {
    try { await updateDoc(doc(db, 'users', userId), { status: 'rejected' }); }
    catch (err) { setErrorMessage(`Error rejecting user: ${err instanceof Error ? err.message : 'Unknown'}`); }
  };
  
  const handleDisable = async (userId: string) => {
    try { await updateDoc(doc(db, 'users', userId), { status: 'disabled' }); }
    catch (err) { setErrorMessage(`Error disabling user: ${err instanceof Error ? err.message : 'Unknown'}`); }
  };

  const handleDelete = async (userId: string, userName?: string) => {
    const confirmed = window.confirm(`Permanently delete ${userName || 'this user'}? This cannot be undone.`);
    if (!confirmed) return;
    try { await deleteDoc(doc(db, 'users', userId)); }
    catch (err) { setErrorMessage(`Error deleting user: ${err instanceof Error ? err.message : 'Unknown'}`); }
  };

  const handleShipmentStatusUpdate = async (firestoreDocId: string, displayId: string, newStatus: ShipmentStatus) => {
    setUpdatingOrderId(firestoreDocId);
    try {
      await updateDoc(doc(db, 'orders', firestoreDocId), {
        shipmentStatus: newStatus,
        shipmentUpdatedAt: new Date().toISOString(),
      });
      updateShipmentStatus(displayId, newStatus);
    } catch (err) {
      console.error('Error updating shipment status:', err);
      alert('Failed to update status. Try again.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const luxuryCardStyle = "bg-[#0A1F13]/90 backdrop-blur-md border border-[rgba(212,175,55,0.2)] rounded-2xl p-6 shadow-xl hover:shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all duration-300";

  return (
    <div className="min-h-full -m-6 md:-m-8 p-6 md:p-8 space-y-8 animate-fade-in text-white overflow-y-auto" style={{ backgroundColor: '#0F2E1D' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[rgba(212,175,55,0.2)] pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-600">Admin Panel</h1>
          <p className="text-green-200/60 mt-1">Manage users, orders, and system operations</p>
        </div>
        <button onClick={() => setShowPinModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-green-500/10 text-green-400 border border-green-500/30 rounded-xl hover:bg-green-500/20 transition font-semibold shadow-lg">
          <Lock className="w-4 h-4" /> Change PIN
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-3 flex-wrap p-2 bg-[#0A1F13] rounded-2xl border border-green-900/30">
        {tabs.map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex-1 sm:flex-none min-w-[120px] text-center ${
              activeTab === t
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-[0_0_15px_rgba(34,197,94,0.4)] border border-green-400/50'
                : 'text-green-200/60 hover:text-green-300 hover:bg-green-900/40 border border-transparent'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ─── USERS TAB ─── */}
      {activeTab === 'Users' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-semibold text-green-50">User Management <span className="text-green-500">({firestoreUsers.length})</span></h2>
              <p className="text-xs text-green-200/60 mt-1 font-medium">
                Buyers: <span className="text-green-400">{firestoreUsers.filter(u => u.role === 'buyer').length}</span> • 
                Farmers: <span className="text-green-400">{firestoreUsers.filter(u => u.role === 'farmer').length}</span>
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setRoleFilter('all')} className={`px-4 py-1.5 rounded-lg text-sm font-bold border ${roleFilter === 'all' ? 'bg-green-500/20 text-green-400 border-green-500/40' : 'bg-transparent text-green-200/50 border-green-900/50 hover:bg-green-900/30'}`}>All Roles</button>
              <button onClick={() => setRoleFilter('buyer')} className={`px-4 py-1.5 rounded-lg text-sm font-bold border ${roleFilter === 'buyer' ? 'bg-green-500/20 text-green-400 border-green-500/40' : 'bg-transparent text-green-200/50 border-green-900/50 hover:bg-green-900/30'}`}>Buyers</button>
              <button onClick={() => setRoleFilter('farmer')} className={`px-4 py-1.5 rounded-lg text-sm font-bold border ${roleFilter === 'farmer' ? 'bg-green-500/20 text-green-400 border-green-500/40' : 'bg-transparent text-green-200/50 border-green-900/50 hover:bg-green-900/30'}`}>Farmers</button>
            </div>
          </div>
          {errorMessage && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3 text-red-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{errorMessage}</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {!loadingUsers && firestoreUsers.length === 0 && (
              <div className="col-span-full p-12 text-center text-green-200/50">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No registered users yet</p>
              </div>
            )}
            
            {!loadingUsers && firestoreUsers.filter(u => roleFilter === 'all' || u.role === roleFilter).map(u => (
              <div key={u.id} className={`${luxuryCardStyle} cursor-pointer`} onClick={() => setSelectedUser(u)}>
                <div className="flex justify-between items-start mb-4 gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-green-50 truncate" title={u.name || 'Unknown User'}>{u.name || 'Unknown User'}</h3>
                    <p className="text-sm text-green-200/60 mt-1 truncate" title={u.email}>{u.email}</p>
                    <p className="text-sm text-green-200/60 truncate">{u.phone} • {u.country}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-xs px-3 py-1 rounded-full bg-green-900/50 text-green-300 border border-green-500/30 font-bold uppercase tracking-wider">
                      {u.role}
                    </span>
                    <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider border
                      ${u.status === 'approved' ? 'bg-green-500/20 text-green-400 border-green-500/40' : 
                        u.status === 'pending' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' : 
                        'bg-red-500/20 text-red-400 border-red-500/40'}`}>
                      {u.status}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-5 gap-2 pt-4 border-t border-[rgba(212,175,55,0.1)]">
                  <button onClick={(e) => { e.stopPropagation(); handleApprove(u.id); }} className="col-span-1 py-2 flex justify-center rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-transparent hover:border-green-500/30 transition" title="Approve"><Check className="w-4 h-4" /></button>
                  <button onClick={(e) => { e.stopPropagation(); handleReject(u.id); }} className="col-span-1 py-2 flex justify-center rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-transparent hover:border-red-500/30 transition" title="Reject"><X className="w-4 h-4" /></button>
                  <button onClick={(e) => { e.stopPropagation(); handleDisable(u.id); }} className="col-span-1 py-2 flex justify-center rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-transparent hover:border-amber-500/30 transition" title="Disable"><Ban className="w-4 h-4" /></button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(u.id, u.name); }} className="col-span-1 py-2 flex justify-center rounded-lg bg-red-900/30 text-red-500 hover:bg-red-900/50 border border-transparent hover:border-red-500/30 transition" title="Delete"><Trash2 className="w-4 h-4" /></button>
                  <button onClick={(e) => { e.stopPropagation(); navigate(`/chat?userId=${u.id}`); }} className="col-span-1 py-2 flex justify-center rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-transparent hover:border-blue-500/30 transition" title="Message"><MessageCircle className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── ORDERS TAB ─── */}
      {activeTab === 'Orders' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-green-50">Recent Orders <span className="text-green-500">({orders.length})</span></h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {orders.length === 0 && <p className="text-green-200/50">No orders placed yet.</p>}
            {orders.map(o => (
              <div key={o.id} className={luxuryCardStyle}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-green-50">{o.productName}</h3>
                    <p className="text-sm text-green-200/60 mt-1">ID: {o.id}</p>
                    <p className="text-sm text-green-200/60">Date: {o.orderDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-600">
                      ₹{o.total.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="bg-[#0F2E1D] rounded-xl p-4 border border-green-900/50 mb-4">
                  <p className="text-xs text-green-400 font-bold mb-1 uppercase tracking-wider">Buyer Info</p>
                  <p className="text-sm text-green-50 font-medium">{o.buyerName}</p>
                  <p className="text-sm text-green-200/60">{o.buyerEmail} • {o.buyerPhone}</p>
                </div>
                <div className="flex gap-3 flex-wrap">
                  <span className={`text-xs px-3 py-1.5 rounded-lg border font-bold ${o.paymentCompleted ? 'bg-green-500/20 text-green-400 border-green-500/40' : 'bg-amber-500/20 text-amber-400 border-amber-500/40'}`}>
                    {o.paymentCompleted ? '💰 Payment Verified' : '⏳ Payment Pending'}
                  </span>
                  <span className={`text-xs px-3 py-1.5 rounded-lg border font-bold ${o.farmerAcceptStatus === 'accepted' ? 'bg-green-500/20 text-green-400 border-green-500/40' : o.farmerAcceptStatus === 'rejected' ? 'bg-red-500/20 text-red-400 border-red-500/40' : 'bg-amber-500/20 text-amber-400 border-amber-500/40'}`}>
                    Farmer: {o.farmerAcceptStatus.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── PRODUCTS TAB ─── */}
      {activeTab === 'Products' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-green-50">Marketplace Products <span className="text-green-500">({products.length})</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.length === 0 && <p className="text-green-200/50">No products listed.</p>}
            {products.map(p => (
              <div key={p.id} className={`${luxuryCardStyle} flex flex-col`}>
                <div className="h-48 rounded-xl overflow-hidden mb-4 relative border border-green-500/20">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 flex flex-col gap-1">
                    <span className="bg-green-500/90 text-white text-xs font-bold px-2 py-1 rounded-lg border border-green-400">
                      {p.status || 'Active'}
                    </span>
                    {p.grade && (
                      <span className="bg-blue-500/90 text-white text-xs font-bold px-2 py-1 rounded-lg border border-blue-400">
                        Grade {p.grade}
                      </span>
                    )}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-green-50 mb-1">{p.name}</h3>
                <p className="text-sm text-green-200/60 mb-4 flex-1 line-clamp-2">{p.description}</p>
                <div className="bg-[#0F2E1D] rounded-xl p-3 border border-green-900/50 mb-4 text-sm">
                  <div className="flex justify-between mb-1"><span className="text-green-200/60">Farmer:</span><span className="text-green-50">{p.farmerName}</span></div>
                  <div className="flex justify-between mb-1"><span className="text-green-200/60">Quantity:</span><span className="text-green-50">{p.quantity} {p.unit}</span></div>
                  <div className="flex justify-between"><span className="text-green-200/60">Location:</span><span className="text-green-50">{p.location}</span></div>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-[rgba(212,175,55,0.1)]">
                  <span className="text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-600">
                    ₹{p.domesticPrice || 0}/{p.unit}
                  </span>
                  <button onClick={() => {
                    if(window.confirm('Delete this product?')) {
                      deleteProduct(p.id);
                    }
                  }} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition" title="Delete Product">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── SHIPMENTS TAB ─── */}
      {activeTab === 'Shipments' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-green-50">Shipment Control <span className="text-green-500">({firestoreOrders.length})</span></h2>
          <div className="grid grid-cols-1 gap-6">
            {firestoreOrders.length === 0 && <p className="text-green-200/50">No orders found.</p>}
            {firestoreOrders.map(o => {
              const currentStepIdx = SHIPMENT_STEPS.findIndex(s => s.status === o.shipmentStatus);
              const isUpdating = updatingOrderId === o.firestoreDocId;

              return (
                <div key={o.id} className={luxuryCardStyle}>
                  <div className="flex items-start justify-between gap-3 mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-green-50">{o.productName}</h3>
                      <p className="text-sm text-green-200/60">{o.id} • {o.buyerName || o.buyerEmail}</p>
                    </div>
                    {isUpdating ? (
                      <span className="text-xs font-bold text-amber-400 animate-pulse bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">UPDATING...</span>
                    ) : (
                      <span className="text-xs font-bold text-green-400 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/30 uppercase tracking-widest">
                        {o.shipmentStatus?.replace(/_/g, ' ')}
                      </span>
                    )}
                  </div>

                  <div className="bg-[#0F2E1D] rounded-xl p-5 border border-green-900/50">
                    <p className="text-xs font-bold text-green-400 mb-4 uppercase tracking-wider">Update Status</p>
                    <div className="flex flex-wrap gap-2">
                      {SHIPMENT_STEPS.map((step, idx) => {
                        const isDone = idx < currentStepIdx;
                        const isCurrent = idx === currentStepIdx;
                        const isNext = idx === currentStepIdx + 1;

                        return (
                          <button
                            key={step.status}
                            disabled={isUpdating || isCurrent}
                            onClick={() => handleShipmentStatusUpdate(o.firestoreDocId, o.id, step.status)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all border
                              ${isCurrent ? 'bg-gradient-to-r from-green-500 to-green-600 text-white border-green-400/50 shadow-[0_0_10px_rgba(34,197,94,0.3)] cursor-default'
                                : isDone ? 'bg-green-900/60 text-green-300 border-green-700/50 hover:bg-green-800/60'
                                : isNext ? 'bg-amber-900/40 text-amber-300 border-amber-500/50 hover:bg-amber-800/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                                : 'bg-transparent text-green-200/40 border-green-900/50 hover:bg-[#0A1F13]'
                              } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                          >
                            <span className="text-lg">{step.emoji}</span>
                            <span>{step.label}</span>
                            {isCurrent && <Check className="w-4 h-4 ml-1" />}
                            {isNext && <ChevronRight className="w-4 h-4 ml-1" />}
                          </button>
                        );
                      })}
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-6 flex gap-1.5">
                      {SHIPMENT_STEPS.map((step, idx) => (
                        <div key={step.status} className={`flex-1 h-2 rounded-full transition-all duration-500 ${idx <= currentStepIdx ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-green-950'}`} />
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[rgba(212,175,55,0.1)] flex justify-end">
                    {editTracking?.id === o.id ? (
                      <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
                        <input type="text" placeholder="Tracking Number" className="flex-1 w-full px-4 py-2 bg-[#0F2E1D] border border-green-900/50 rounded-xl outline-none focus:border-green-500/50 text-green-50" value={editTracking.trackingNumber} onChange={e => setEditTracking({ ...editTracking, trackingNumber: e.target.value })} />
                        <input type="text" placeholder="Tracking Link (Optional)" className="flex-1 w-full px-4 py-2 bg-[#0F2E1D] border border-green-900/50 rounded-xl outline-none focus:border-green-500/50 text-green-50" value={editTracking.trackingLink} onChange={e => setEditTracking({ ...editTracking, trackingLink: e.target.value })} />
                        <div className="flex gap-2 w-full sm:w-auto">
                          <button onClick={() => { updateTrackingInfo(o.id, editTracking.trackingNumber, editTracking.trackingLink); setEditTracking(null); }} className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold transition">Save</button>
                          <button onClick={() => setEditTracking(null)} className="px-6 py-2 bg-transparent border border-green-900/50 text-green-200/60 hover:text-green-50 rounded-xl font-bold transition">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => setEditTracking({ id: o.id, trackingNumber: o.trackingNumber || '', trackingLink: o.trackingLink || '' })} className="flex items-center gap-2 text-sm font-bold text-green-400 hover:text-green-300 transition">
                        <Edit2 className="w-4 h-4" /> Edit Tracking
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── NOTIFICATIONS TAB ─── */}
      {activeTab === 'Notifications' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-green-50">System Notifications</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {notifications.length === 0 && <p className="text-green-200/50">No notifications.</p>}
            {notifications.map(n => (
              <div key={n.id} className={luxuryCardStyle}>
                <div className="flex items-start gap-4">
                  <div className="bg-green-500/20 p-3 rounded-xl border border-green-500/30">
                    <Bell className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-green-50">{n.title}</h3>
                    <p className="text-sm text-green-200/80 mt-1 leading-relaxed">{n.message}</p>
                    <p className="text-xs text-green-200/50 mt-3 font-medium tracking-wide">
                      {n.timestamp} • VISIBLE TO: {n.targetRoles.join(', ').toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── REVENUE TAB ─── */}
      {activeTab === 'Revenue' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-green-50">Revenue Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`${luxuryCardStyle} flex flex-col items-center justify-center py-10`}>
              <div className="bg-green-500/20 p-4 rounded-2xl border border-green-500/30 mb-4 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                <DollarSign className="w-8 h-8 text-green-400" />
              </div>
              <p className="text-sm text-green-200/60 font-bold uppercase tracking-wider mb-2">Total Revenue</p>
              <p className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-green-600">
                ₹{orders.reduce((s, o) => s + o.total, 0).toLocaleString()}
              </p>
            </div>
            
            <div className={`${luxuryCardStyle} flex flex-col items-center justify-center py-10`}>
              <div className="bg-blue-500/20 p-4 rounded-2xl border border-blue-500/30 mb-4 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                <ClipboardList className="w-8 h-8 text-blue-400" />
              </div>
              <p className="text-sm text-green-200/60 font-bold uppercase tracking-wider mb-2">Total Orders</p>
              <p className="text-4xl font-extrabold text-white">
                {orders.length}
              </p>
            </div>

            <div className={`${luxuryCardStyle} flex flex-col items-center justify-center py-10`}>
              <div className="bg-amber-500/20 p-4 rounded-2xl border border-amber-500/30 mb-4 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                <TrendingUp className="w-8 h-8 text-amber-400" />
              </div>
              <p className="text-sm text-green-200/60 font-bold uppercase tracking-wider mb-2">Avg Order Value</p>
              <p className="text-4xl font-extrabold text-white">
                ₹{orders.length ? Math.round(orders.reduce((s, o) => s + o.total, 0) / orders.length).toLocaleString() : 0}
              </p>
            </div>
          </div>
        </div>
      )}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedUser(null)}>
          <div className="bg-[#0A1F13] border border-green-500/30 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-green-900/50 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">User Details</h3>
              <button onClick={() => setSelectedUser(null)} className="text-green-200/60 hover:text-white transition">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-green-700">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-green-400 font-bold uppercase tracking-wider">Full Name</p>
                  <p className="text-sm text-green-50">{selectedUser.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-green-400 font-bold uppercase tracking-wider">Email</p>
                  <p className="text-sm text-green-50">{selectedUser.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-green-400 font-bold uppercase tracking-wider">Phone</p>
                  <p className="text-sm text-green-50">{selectedUser.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-green-400 font-bold uppercase tracking-wider">Country</p>
                  <p className="text-sm text-green-50">{selectedUser.country || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-green-400 font-bold uppercase tracking-wider">Role</p>
                  <p className="text-sm text-green-50 uppercase">{selectedUser.role || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-green-400 font-bold uppercase tracking-wider">Status</p>
                  <p className="text-sm text-green-50 uppercase">{selectedUser.status || 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-green-400 font-bold uppercase tracking-wider">Address</p>
                  <p className="text-sm text-green-50">{selectedUser.address || 'Not provided'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-green-400 font-bold uppercase tracking-wider">Company / Farm Name</p>
                  <p className="text-sm text-green-50">{selectedUser.companyName || selectedUser.farmName || 'Not provided'}</p>
                </div>
                {Object.keys(selectedUser).filter(key => !['name', 'email', 'phone', 'country', 'role', 'status', 'address', 'companyName', 'farmName', 'id'].includes(key)).length > 0 && (
                  <div className="col-span-2 mt-2 pt-4 border-t border-green-900/50">
                    <p className="text-xs text-green-400 font-bold uppercase tracking-wider mb-3">Other Information</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {Object.entries(selectedUser)
                        .filter(([key]) => !['name', 'email', 'phone', 'country', 'role', 'status', 'address', 'companyName', 'farmName', 'id'].includes(key))
                        .map(([key, value]) => (
                          <div key={key} className="bg-black/20 p-3 rounded-lg border border-green-900/30">
                            <p className="text-[10px] text-green-400 font-bold uppercase tracking-wider">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                            <p className="text-sm text-green-50 mt-1 break-words">
                              {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : typeof value === 'object' ? JSON.stringify(value) : String(value)}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="p-4 border-t border-green-900/50 flex flex-wrap gap-2 justify-between items-center">
              <div className="flex gap-2">
                <button onClick={() => { handleApprove(selectedUser.id); setSelectedUser(null); }} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-transparent hover:border-green-500/30 transition font-bold" title="Approve">
                  <Check className="w-4 h-4" /> Approve
                </button>
                <button onClick={() => { handleReject(selectedUser.id); setSelectedUser(null); }} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-transparent hover:border-red-500/30 transition font-bold" title="Reject">
                  <X className="w-4 h-4" /> Reject
                </button>
                <button onClick={() => { handleDisable(selectedUser.id); setSelectedUser(null); }} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-transparent hover:border-amber-500/30 transition font-bold" title="Disable">
                  <Ban className="w-4 h-4" /> Disable
                </button>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { navigate(`/chat?userId=${selectedUser.id}`); setSelectedUser(null); }} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-transparent hover:border-blue-500/30 transition font-bold" title="Message">
                  <MessageCircle className="w-4 h-4" /> Message
                </button>
                <button onClick={() => setSelectedUser(null)} className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold transition">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* CHANGE PIN MODAL */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowPinModal(false)}>
          <div className="bg-[#0A1F13] border border-green-500/30 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-green-900/50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center gap-2"><Lock className="w-5 h-5 text-green-400" /> Change Admin PIN</h3>
              <button onClick={() => setShowPinModal(false)} className="text-green-200/60 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-green-200/80 mb-4">Enter a new 4-digit PIN to secure sensitive actions in the Admin Panel.</p>
              <input 
                type="password" 
                maxLength={4}
                placeholder="New 4-Digit PIN" 
                className="w-full px-4 py-3 bg-[#0F2E1D] border border-green-500/50 rounded-xl outline-none focus:border-green-400 text-green-50 text-center text-2xl tracking-[1em] font-mono shadow-[0_0_10px_rgba(34,197,94,0.1)]"
                value={newPin}
                onChange={e => setNewPin(e.target.value.replace(/[^0-9]/g, ''))}
              />
            </div>
            <div className="p-4 border-t border-green-900/50 flex gap-3">
              <button onClick={() => setShowPinModal(false)} className="flex-1 py-2.5 bg-transparent border border-green-900/50 text-green-200/60 hover:text-green-50 rounded-xl font-bold transition">Cancel</button>
              <button 
                onClick={() => {
                  if(newPin.length !== 4) return alert('PIN must be 4 digits');
                  alert('Admin PIN successfully updated!');
                  setNewPin('');
                  setShowPinModal(false);
                }} 
                className="flex-1 py-2.5 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white rounded-xl font-bold transition shadow-[0_0_15px_rgba(34,197,94,0.3)]"
              >
                Save PIN
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminPanel;