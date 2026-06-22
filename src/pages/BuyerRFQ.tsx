import { useState } from 'react';
import { useStore, RFQ } from '@/lib/store';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { ShoppingBag, Calendar, MapPin, PackageOpen, Plus, ClipboardList } from 'lucide-react';
import { generateId } from '@/lib/utils'; // Assuming this exists or I'll just use Date.now().toString()

const BuyerRFQ = () => {
  const { t } = useTranslation();
  const { currentUser, products, rfqs, submitRFQ } = useStore();
  
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('MT');
  const [destinationCountry, setDestinationCountry] = useState('');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const myRfqs = rfqs.filter(r => r.buyerId === currentUser?.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName || !quantity || !destinationCountry || !expectedDeliveryDate) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const newRfq: RFQ = {
        id: Date.now().toString(),
        buyerId: currentUser?.id || '',
        productName,
        quantity: Number(quantity),
        unit,
        destinationCountry,
        expectedDeliveryDate,
        additionalNotes,
        status: 'pending',
        submittedAt: new Date().toISOString()
      };

      await submitRFQ(newRfq);
      toast.success("RFQ submitted successfully");
      
      // Reset form
      setProductName('');
      setQuantity('');
      setUnit('MT');
      setDestinationCountry('');
      setExpectedDeliveryDate('');
      setAdditionalNotes('');
    } catch (error) {
      console.error(error);
      toast.error('Failed to submit RFQ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <span className="bg-yellow-500/20 text-yellow-600 px-2 py-1 rounded-full text-xs font-semibold border border-yellow-500/30">Pending</span>;
      case 'replied': return <span className="bg-green-500/20 text-green-600 px-2 py-1 rounded-full text-xs font-semibold border border-green-500/30">Replied</span>;
      case 'closed': return <span className="bg-gray-500/20 text-gray-600 px-2 py-1 rounded-full text-xs font-semibold border border-gray-500/30">Closed</span>;
      default: return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <ClipboardList className="w-8 h-8 text-primary" />
          Request for Quotation (RFQ)
        </h1>
        <p className="text-muted-foreground">Submit a bulk inquiry and get customized pricing based on your destination and quantity.</p>
      </div>

      {/* RFQ Form */}
      <div className="bg-card border border-border shadow-sm rounded-xl overflow-hidden">
        <div className="p-6 bg-primary/5 border-b border-border/50">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            New Request
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Product Name */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <PackageOpen className="w-4 h-4 text-primary" />
                Product Name *
              </label>
              <select 
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full p-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 transition-all outline-none"
                required
              >
                <option value="">Select a product from marketplace...</option>
                {Array.from(new Set(products.map(p => p.name))).map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>

            {/* Quantity and Unit */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-primary" />
                Quantity *
              </label>
              <div className="flex gap-2">
                <input 
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="e.g. 500"
                  className="flex-1 p-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 transition-all outline-none"
                  required
                />
                <select 
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-32 p-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 transition-all outline-none"
                >
                  <option value="KG">KG</option>
                  <option value="MT">MT</option>
                  <option value="Tonnes">Tonnes</option>
                </select>
              </div>
            </div>

            {/* Destination Country */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                Destination Country *
              </label>
              <input 
                type="text"
                value={destinationCountry}
                onChange={(e) => setDestinationCountry(e.target.value)}
                placeholder="e.g. United Arab Emirates"
                className="w-full p-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 transition-all outline-none"
                required
              />
            </div>

            {/* Expected Delivery Date */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                Expected Delivery Date *
              </label>
              <input 
                type="date"
                value={expectedDeliveryDate}
                onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                className="w-full p-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 transition-all outline-none"
                required
              />
            </div>
            
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">
              Additional Notes (Packaging preferences, certifications required, etc.)
            </label>
            <textarea 
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="Enter any specific requirements..."
              className="w-full p-3 rounded-lg border border-border bg-background min-h-[100px] focus:ring-2 focus:ring-primary/50 transition-all outline-none"
            />
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full md:w-auto px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-70 flex items-center justify-center"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </div>

      {/* RFQ History */}
      <div className="bg-card border border-border shadow-sm rounded-xl overflow-hidden">
        <div className="p-6 border-b border-border/50 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">My RFQ History</h2>
        </div>
        
        <div className="overflow-x-auto">
          {myRfqs.length > 0 ? (
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                <tr>
                  <th className="px-6 py-4 font-medium">Product</th>
                  <th className="px-6 py-4 font-medium">Quantity</th>
                  <th className="px-6 py-4 font-medium">Country</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {myRfqs.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()).map(rfq => (
                  <tr key={rfq.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-semibold text-foreground">{rfq.productName}</td>
                    <td className="px-6 py-4">{rfq.quantity} {rfq.unit}</td>
                    <td className="px-6 py-4 text-muted-foreground">{rfq.destinationCountry}</td>
                    <td className="px-6 py-4 text-muted-foreground">{new Date(rfq.submittedAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">{getStatusBadge(rfq.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No RFQ submitted yet</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default BuyerRFQ;
