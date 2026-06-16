import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useStore, type ShipmentStatus } from '@/lib/store';
import { useTranslation } from 'react-i18next';
import { Package, Cog, Truck, MapPin, Home, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const ShipmentSteps = ({ t }: { t: any }) => [
  { status: 'placed' as ShipmentStatus, label: t('shipment_status_placed'), icon: Package },
  { status: 'processing' as ShipmentStatus, label: t('shipment_status_processing'), icon: Cog },
  { status: 'shipped' as ShipmentStatus, label: t('shipment_status_shipped'), icon: Truck },
  { status: 'transit' as ShipmentStatus, label: t('shipment_status_transit'), icon: MapPin },
  { status: 'out_for_delivery' as ShipmentStatus, label: t('shipment_status_out_for_delivery'), icon: Home },
  { status: 'delivered' as ShipmentStatus, label: t('shipment_status_delivered'), icon: CheckCircle },
];

const statusIndex = (s: ShipmentStatus, steps: any[]) => steps.findIndex(st => st.status === s);

const AdminUpdateProducts = () => {
  // Dummy data for demonstration (replace with actual logic as needed)
  const [products, setProducts] = useState<any[]>([]);
  const [prices, setPrices] = useState<{ [key: string]: { domestic?: string; export?: string } }>({});
  const { t } = useTranslation();

  // Example: Fetch products (replace with actual fetch logic)
  useEffect(() => {
    setProducts([
      { id: '1', name: 'Product A', domesticPrice: 100, exportPrice: 120 },
      { id: '2', name: 'Product B', domesticPrice: 200, exportPrice: 220 },
    ]);
  }, []);

  const handleChange = (id: string, type: 'domestic' | 'export', value: string) => {
    setPrices(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [type]: value,
      },
    }));
  };

  const handleUpdate = (id: string, product: any) => {
    // Implement update logic here
    alert(`Update ${product.name} with Domestic: ${prices[id]?.domestic}, Export: ${prices[id]?.export}`);
  };

  return (
    <div className="w-full min-h-screen bg-background">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-2">
            💰 Update Product Prices
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage domestic and export prices for all products
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {products.map((p) => (
            <div
              key={p.id}
              className="premium-card p-6 space-y-4"
            >
              {/* Product Name */}
              <h3 className="text-xl font-bold text-foreground">
                {p.name}
              </h3>

              {/* Current Prices */}
              <div className="space-y-2 border-t border-primary/15 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Current Domestic:</span>
                  <span className="font-bold text-primary">₹{p.domesticPrice}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Current Export:</span>
                  <span className="font-bold text-secondary">₹{p.exportPrice}</span>
                </div>
              </div>

              {/* Input Fields */}
              <div className="space-y-3 border-t border-primary/15 pt-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-2">
                    New Domestic Price
                  </label>
                  <input
                    type="number"
                    placeholder="Enter domestic price"
                    value={prices[p.id]?.domestic || ""}
                    onChange={(e) =>
                      handleChange(p.id, "domestic", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-primary/30 rounded-lg bg-background/50 text-foreground placeholder-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-2">
                    New Export Price
                  </label>
                  <input
                    type="number"
                    placeholder="Enter export price"
                    value={prices[p.id]?.export || ""}
                    onChange={(e) =>
                      handleChange(p.id, "export", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-primary/30 rounded-lg bg-background/50 text-foreground placeholder-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <button
                  className="mt-4 px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/80 transition"
                  onClick={() => handleUpdate(p.id, p)}
                >
                  Update Price
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminUpdateProducts;
