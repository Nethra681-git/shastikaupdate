import { useStore } from '@/lib/store';
import { useTranslation } from 'react-i18next';
import { CreditCard, IndianRupee, Clock, CheckCircle2 } from 'lucide-react';

const FarmerPayments = () => {
  const { t } = useTranslation();
  const { currentUser, products, orders, payments } = useStore();

  // Get orders belonging to this farmer
  const farmerOrders = orders.filter(o =>
    products.some(p => p.id === o.productId && p.farmerName === currentUser?.name)
  );

  // Map orders and payments to a unified payment list
  const paymentList = farmerOrders.map(order => {
    const payment = payments.find(p => p.orderId === order.id);
    let statusLabel = 'Pending';
    let statusColor = 'yellow';
    let amount = order.total;
    let date = order.orderDate;

    if (payment) {
      if (payment.status === 'approved') {
        statusLabel = 'Paid';
        statusColor = 'green';
      } else if (payment.status === 'pending') {
        statusLabel = 'Processing';
        statusColor = 'blue';
      }
      // If rejected/failed, it remains pending for the farmer to get paid
      date = payment.timestamp.split(',')[0]; // simple date extraction
    }

    return {
      id: order.id,
      productName: order.productName,
      amount,
      date,
      status: statusLabel,
      color: statusColor,
    };
  });

  const totalReceived = paymentList
    .filter(p => p.status === 'Paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPending = paymentList
    .filter(p => p.status === 'Pending' || p.status === 'Processing')
    .reduce((sum, p) => sum + p.amount, 0);

  const getStatusBadge = (status: string, color: string) => {
    const colorClasses: Record<string, string> = {
      green: 'bg-green-100 text-green-800 border-green-200',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
    };
    const classes = colorClasses[color] || colorClasses.yellow;
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${classes}`}>
        {status}
      </span>
    );
  };

  const StatCard = ({ icon: Icon, label, value, gradient }: any) => (
    <div className={`p-6 rounded-2xl flex items-center gap-4 text-white shadow-lg ${gradient}`}>
      <div className="bg-white/20 p-4 rounded-xl flex items-center justify-center">
        <Icon className="w-8 h-8" />
      </div>
      <div>
        <p className="text-sm font-medium text-white/80">{label}</p>
        <p className="text-3xl font-bold">₹{value.toLocaleString()}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
          <CreditCard className="w-8 h-8 text-primary" /> Payment Status
        </h1>
        <p className="text-muted-foreground">Track your received and pending payments</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard 
          icon={CheckCircle2} 
          label="Total Received" 
          value={totalReceived} 
          gradient="bg-gradient-to-br from-green-500 to-green-600"
        />
        <StatCard 
          icon={Clock} 
          label="Total Pending" 
          value={totalPending} 
          gradient="bg-gradient-to-br from-yellow-500 to-yellow-600"
        />
      </div>

      <div className="pt-4">
        <h2 className="text-2xl font-bold text-foreground mb-6">Payment History</h2>
        
        {paymentList.length === 0 ? (
          <div className="premium-card rounded-2xl p-12 text-center">
            <IndianRupee className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-xl font-medium text-muted-foreground">No payments yet</p>
          </div>
        ) : (
          <div className="premium-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="text-left p-5 text-muted-foreground font-semibold">Product Name</th>
                    <th className="text-right p-5 text-muted-foreground font-semibold">Amount</th>
                    <th className="text-left p-5 text-muted-foreground font-semibold">Date</th>
                    <th className="text-center p-5 text-muted-foreground font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paymentList.map((payment, idx) => (
                    <tr key={idx} className="hover:bg-background/50 transition">
                      <td className="p-5 font-semibold text-foreground text-base">{payment.productName}</td>
                      <td className="p-5 text-right font-bold text-primary text-base">₹{payment.amount.toLocaleString()}</td>
                      <td className="p-5 text-muted-foreground">{payment.date}</td>
                      <td className="p-5 text-center">
                        {getStatusBadge(payment.status, payment.color)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmerPayments;
