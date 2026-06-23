import { useState } from 'react';
import { useStore } from '@/lib/store';
import { useTranslation } from 'react-i18next';
import { Check, X, ClipboardList } from 'lucide-react';

const FarmerRequestsNew = () => {
  const { t } = useTranslation();
  const { currentUser, products, orders, updateOrderFarmerStatus, addNotification } = useStore();

  const farmerOrders = orders.filter(o =>
    products.some(p => p.id === o.productId && p.farmerName === currentUser?.name)
  );

  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');
  const [pendingAction, setPendingAction] = useState<{ id: string, name: string, buyer: string, type: 'accept' | 'reject' } | null>(null);

  const executePendingAction = () => {
    if (!pendingAction) return;
    if (pin !== '1234') {
      alert('Incorrect PIN! Please try again.');
      return;
    }

    if (pendingAction.type === 'accept') {
      updateOrderFarmerStatus(pendingAction.id, 'accepted');
      addNotification({
        id: `n${Date.now()}`,
        title: 'Farmer Accepted Order',
        message: `${currentUser?.name} accepted order for ${pendingAction.name} from ${pendingAction.buyer}`,
        timestamp: new Date().toLocaleString(),
        read: false,
        targetRoles: ['admin', 'buyer'],
      });
    } else {
      updateOrderFarmerStatus(pendingAction.id, 'rejected');
      addNotification({
        id: `n${Date.now()}`,
        title: 'Farmer Rejected Order',
        message: `${currentUser?.name} rejected order for ${pendingAction.name} from ${pendingAction.buyer}`,
        timestamp: new Date().toLocaleString(),
        read: false,
        targetRoles: ['admin', 'buyer'],
      });
    }
    
    setShowPinModal(false);
    setPin('');
    setPendingAction(null);
  };

  const handleActionClick = (orderId: string, productName: string, buyerName: string, type: 'accept' | 'reject') => {
    setPendingAction({ id: orderId, name: productName, buyer: buyerName, type });
    setShowPinModal(true);
  };



  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'accepted':
        return <span className="bg-green-100 text-green-800 border border-green-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Accepted</span>;
      case 'rejected':
        return <span className="bg-red-100 text-red-800 border border-red-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Rejected</span>;
      default:
        return <span className="bg-blue-100 text-blue-800 border border-blue-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">New</span>;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
          <ClipboardList className="w-8 h-8 text-primary" /> Purchase Requests
        </h1>
        <p className="text-muted-foreground">Manage incoming purchase requests from buyers</p>
      </div>

      {farmerOrders.length === 0 ? (
        <div className="premium-card rounded-2xl p-12 text-center">
          <ClipboardList className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-xl font-medium text-muted-foreground">No purchase requests yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {farmerOrders.map(order => (
            <div key={order.id} className="premium-card p-6 rounded-2xl flex flex-col sm:flex-row gap-6 justify-between items-center hover:shadow-lg transition-all duration-300">
              <div className="flex-1 w-full space-y-2">
                <div className="flex justify-between items-start">
                  <p className="text-xl font-bold text-foreground">{order.productName}</p>
                  {getStatusBadge(order.farmerAcceptStatus)}
                </div>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Buyer: </span>
                    <span className="font-semibold text-foreground">{order.buyerName}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Date: </span>
                    <span className="font-semibold text-foreground">{order.orderDate}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Quantity: </span>
                    <span className="font-semibold text-foreground">{order.quantity} units</span>
                  </div>
                </div>
              </div>
              
              {order.farmerAcceptStatus === 'pending' && (
                <div className="flex sm:flex-col gap-3 w-full sm:w-auto shrink-0">
                  <button
                    onClick={() => handleActionClick(order.id, order.productName, order.buyerName, 'accept')}
                    className="flex-1 sm:flex-none px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold transition flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Check className="w-5 h-5" /> Accept
                  </button>
                  <button
                    onClick={() => handleActionClick(order.id, order.productName, order.buyerName, 'reject')}
                    className="flex-1 sm:flex-none px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold transition flex items-center justify-center gap-2 shadow-sm"
                  >
                    <X className="w-5 h-5" /> Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* PIN Verification Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowPinModal(false)}>
          <div className="bg-card border border-border/50 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-border/50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-foreground">Security PIN Required</h3>
              <button onClick={() => setShowPinModal(false)} className="text-muted-foreground hover:text-foreground transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 text-center">
              <p className="text-sm text-muted-foreground mb-6">
                Please enter your 4-digit PIN to confirm you want to {pendingAction?.type} this order. <br />
                <span className="text-xs text-primary font-semibold">(Default PIN: 1234)</span>
              </p>
              <input 
                type="password" 
                maxLength={4}
                autoFocus
                placeholder="••••" 
                className="w-full px-4 py-4 bg-background border border-primary/30 rounded-xl outline-none focus:border-primary text-foreground text-center text-3xl tracking-[1em] font-mono shadow-[0_0_15px_rgba(34,197,94,0.1)] transition-all"
                value={pin}
                onChange={e => setPin(e.target.value.replace(/[^0-9]/g, ''))}
                onKeyDown={e => { if (e.key === 'Enter') executePendingAction(); }}
              />
            </div>
            <div className="p-4 border-t border-border/50 flex gap-3">
              <button onClick={() => setShowPinModal(false)} className="flex-1 py-3 bg-secondary/10 hover:bg-secondary/20 text-foreground rounded-xl font-bold transition">Cancel</button>
              <button 
                onClick={executePendingAction} 
                className={`flex-1 py-3 text-white rounded-xl font-bold transition shadow-lg ${pendingAction?.type === 'accept' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerRequestsNew;
