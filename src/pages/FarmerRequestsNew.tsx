import { useStore } from '@/lib/store';
import { useTranslation } from 'react-i18next';
import { Check, X, ClipboardList } from 'lucide-react';

const FarmerRequestsNew = () => {
  const { t } = useTranslation();
  const { currentUser, products, orders, updateOrderFarmerStatus, addNotification } = useStore();

  const farmerOrders = orders.filter(o =>
    products.some(p => p.id === o.productId && p.farmerName === currentUser?.name)
  );

  const handleAccept = (orderId: string, productName: string, buyerName: string) => {
    updateOrderFarmerStatus(orderId, 'accepted');
    addNotification({
      id: `n${Date.now()}`,
      title: 'Farmer Accepted Order',
      message: `${currentUser?.name} accepted order for ${productName} from ${buyerName}`,
      timestamp: new Date().toLocaleString(),
      read: false,
      targetRoles: ['admin', 'buyer'],
    });
  };

  const handleReject = (orderId: string, productName: string, buyerName: string) => {
    updateOrderFarmerStatus(orderId, 'rejected');
    addNotification({
      id: `n${Date.now()}`,
      title: 'Farmer Rejected Order',
      message: `${currentUser?.name} rejected order for ${productName} from ${buyerName}`,
      timestamp: new Date().toLocaleString(),
      read: false,
      targetRoles: ['admin', 'buyer'],
    });
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
                    onClick={() => handleAccept(order.id, order.productName, order.buyerName)}
                    className="flex-1 sm:flex-none px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold transition flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Check className="w-5 h-5" /> Accept
                  </button>
                  <button
                    onClick={() => handleReject(order.id, order.productName, order.buyerName)}
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
    </div>
  );
};

export default FarmerRequestsNew;
