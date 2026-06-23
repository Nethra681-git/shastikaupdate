import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { useStore, type ShipmentStatus } from '@/lib/store';
import { useTranslation } from 'react-i18next';
import { Package, Cog, Truck, MapPin, Home, CheckCircle, Clock, AlertCircle, Check, Loader2 } from 'lucide-react';

const TRACKER_STEPS = [
  { id: 'placed', label: 'Order Confirmed' },
  { id: 'packing', label: 'Packing' },
  { id: 'container_stuffing', label: 'Container Stuffing' },
  { id: 'customs_clearance', label: 'Customs Clearance' },
  { id: 'vessel_departure', label: 'Vessel Departure' },
  { id: 'arrival', label: 'Arrival' },
  { id: 'delivered', label: 'Delivery' }
];

const getStepIndex = (status: string) => {
  switch (status) {
    case 'placed': return 0;
    case 'processing': case 'packing': return 1;
    case 'container_stuffing': return 2;
    case 'customs_clearance': return 3;
    case 'shipped': case 'vessel_departure': return 4;
    case 'transit': case 'arrival': return 5;
    case 'out_for_delivery': case 'delivered': return 6;
    default: return 0;
  }
};

// ✅ Helper: Firestore Timestamp / string / null → readable date string
const formatDate = (value: any): string => {
  if (!value) return '—';
  // Firestore Timestamp object
  if (value?.toDate) return value.toDate().toLocaleDateString();
  // Already a string
  if (typeof value === 'string') return value;
  // JS Date or number
  try { return new Date(value).toLocaleDateString(); } catch { return '—'; }
};

const Shipment = () => {
  const { t } = useTranslation();
  const { currentUser } = useStore();
  const isAdmin = currentUser?.role === 'admin';

  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const uid = auth.currentUser?.uid ?? currentUser?.uid ?? null;
  const email = auth.currentUser?.email ?? currentUser?.email ?? null;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'orders'));
        const fetched = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAllOrders(fetched);
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const myOrders = isAdmin
    ? allOrders
    : allOrders.filter(o => o.buyerId === uid || o.buyerEmail === email);

  const stats = {
    totalShipments: myOrders.length,
    inTransit: myOrders.filter(o =>
      ['processing', 'shipped', 'transit', 'out_for_delivery'].includes(o.shipmentStatus)
    ).length,
    delivered: myOrders.filter(o => o.shipmentStatus === 'delivered').length,
    pending: myOrders.filter(o => o.shipmentStatus === 'placed').length,
  };

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <div className="premium-card p-6 flex items-center gap-4 hover:shadow-lg transition-all duration-300">
      <div className={`${color} p-4 rounded-xl flex items-center justify-center`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground font-medium">{label}</p>
        <p className="text-2xl font-bold text-foreground">{value}</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in">
        {!isAdmin && (
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">{t('shipment_tracking')}</h1>
            <p className="text-muted-foreground">{t('shipment_monitor_realtime')}</p>
          </div>
        )}
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="premium-card rounded-2xl p-8 animate-pulse">
              <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">

      {/* Header */}
      <div>
        {!isAdmin && (
          <>
            <h1 className="text-4xl font-bold text-foreground mb-2">{t('shipment_tracking')}</h1>
            <p className="text-muted-foreground">{t('shipment_monitor_realtime')}</p>
          </>
        )}
        <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span>UID: <span className="font-mono font-semibold text-foreground">{uid ?? '—'}</span></span>
          <span>Email: <span className="font-semibold text-foreground">{email ?? '—'}</span></span>
        </div>
      </div>

      {/* Stats */}
      {myOrders.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Truck} label={t('total_shipments')} value={stats.totalShipments} color="bg-gradient-to-br from-primary to-primary/70" />
          <StatCard icon={Clock} label={t('transit')} value={stats.inTransit} color="bg-gradient-to-br from-yellow-500 to-yellow-600" />
          <StatCard icon={CheckCircle} label={t('delivered')} value={stats.delivered} color="bg-gradient-to-br from-green-500 to-green-600" />
          <StatCard icon={AlertCircle} label={t('pending')} value={stats.pending} color="bg-gradient-to-br from-blue-500 to-blue-600" />
        </div>
      )}

      {/* Orders */}
      {myOrders.length === 0 ? (
        <div className="premium-card rounded-2xl p-16 text-center space-y-3">
          <p className="text-lg text-muted-foreground">{t('no_shipments')}</p>
          {!isAdmin && (
            <p className="text-xs text-muted-foreground/60">
              Logged in as: {email ?? '—'} | Total orders in DB: {allOrders.length}
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {myOrders.map(order => {
            const currentIdx = getStepIndex(order.shipmentStatus);
            const progressPercent = Math.round((currentIdx / (TRACKER_STEPS.length - 1)) * 100);
            return (
              <div
                key={order.id}
                className="premium-card rounded-2xl p-8 space-y-8 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start justify-between gap-4 flex-col md:flex-row">
                  <div className="flex-1">
                    <p className="text-2xl font-bold text-foreground">{order.productName}</p>
                    <p className="text-muted-foreground mt-1">
                      {t('order_id')}:{' '}
                      <span className="font-mono font-bold text-foreground">{order.id}</span>
                    </p>
                    <p className="text-muted-foreground mt-1">
                      {t('shipping')}:{' '}
                      {order.shippingMethod === 'sea' ? t('shipment_sea_way') : t('shipment_air_way')} ◆{' '}
                      {t('market_type')}:{' '}
                      {order.marketType === 'export' ? t('shipment_export') : t('shipment_domestic')}
                    </p>

                    {(order.trackingNumber || order.trackingLink) ? (
                      <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
                        <p className="text-sm font-semibold text-foreground mb-2">
                          {t('shipment_tracking_details')}
                        </p>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs bg-background px-3 py-1.5 rounded border border-primary/20">
                            {order.trackingNumber || 'N/A'}
                          </span>
                          {order.trackingLink && (
                            <a
                              href={order.trackingLink}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 bg-primary/15 text-primary rounded font-medium text-sm hover:bg-primary/25 transition"
                            >
                              {t('shipment_view_details')}
                            </a>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">{t('shipment_no_tracking')}</p>
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="inline-block px-4 py-2 rounded-full text-sm font-semibold bg-primary/10 text-primary capitalize">
                      {t(order.shipmentStatus) || order.shipmentStatus?.replace(/_/g, ' ')}
                    </span>
                    {order.shipmentUpdatedAt && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {/* ✅ Fixed: Timestamp safe format */}
                        Updated: {formatDate(order.shipmentUpdatedAt)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Progress Tracking Bar */}
                <div className="pt-4 border-t border-border/50">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold text-foreground">Overall Progress</span>
                    <span className="text-sm font-bold text-primary">{progressPercent}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 mb-8 overflow-hidden">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-1000" 
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  <div className="relative">
                    {/* Background track line */}
                    <div className="absolute top-5 left-4 right-4 h-1 bg-muted rounded-full" />
                    
                    {/* Active track line */}
                    <div 
                      className="absolute top-5 left-4 h-1 bg-primary transition-all duration-1000 rounded-full" 
                      style={{ width: `calc(${progressPercent}% - 2rem)` }}
                    />

                    <div className="flex items-start justify-between relative z-10 overflow-x-auto pb-4 custom-scrollbar">
                      {TRACKER_STEPS.map((step, i) => {
                        const isCompleted = i < currentIdx;
                        const isCurrent = i === currentIdx;
                        const isFuture = i > currentIdx;

                        return (
                          <div key={step.id} className="flex flex-col items-center relative flex-1 min-w-[100px] px-1">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center border-[3px] transition-all bg-background z-10 ${
                                isCompleted
                                  ? 'border-green-500 text-green-500'
                                  : isCurrent
                                  ? 'border-orange-500 text-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.3)]'
                                  : 'border-muted-foreground/30 text-muted-foreground/30'
                              }`}
                            >
                              {isCompleted ? (
                                <Check className="w-5 h-5 stroke-[3]" />
                              ) : isCurrent ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
                              )}
                            </div>
                            
                            <p
                              className={`text-xs mt-3 text-center font-bold whitespace-nowrap ${
                                isCompleted ? 'text-green-600 dark:text-green-500' : isCurrent ? 'text-orange-600 dark:text-orange-500' : 'text-muted-foreground'
                              }`}
                            >
                              {step.label}
                            </p>
                            
                            {/* Simple Date Logic */}
                            {(isCompleted || isCurrent) && (
                              <p className="text-[10px] text-muted-foreground mt-1 text-center font-medium">
                                {i === 0 ? formatDate(order.orderDate || order.createdAt) : isCurrent ? formatDate(order.shipmentUpdatedAt) : 'Completed'}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Order details grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg border border-border">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">{t('quantity')}</p>
                    <p className="text-lg font-bold text-foreground">
                      {order.quantity} {t('units')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">{t('order_date')}</p>
                    <p className="text-lg font-bold text-foreground">
                      {/* ✅ Fixed: was crashing because createdAt is a Firestore Timestamp */}
                      {order.orderDate ? formatDate(order.orderDate) : formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">{t('amount')}</p>
                    <p className="text-lg font-bold text-primary">
                      ₹{Number(order.total || order.amount || 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">{t('country')}</p>
                    <p className="text-lg font-bold text-foreground">
                      {order.destinationCountry || order.country || 'India'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Shipment;