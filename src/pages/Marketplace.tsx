import { useNavigate } from "react-router-dom";
import { useStore } from "@/lib/store";
import { useTranslation } from "react-i18next";
import { Package, Users, ShoppingCart, TrendingUp, MapPin, Truck, Badge, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

const Marketplace = () => {
  const { t } = useTranslation();
  const { products, currentUser, addOrder, addNotification } = useStore();
  const navigate = useNavigate();
  const isAdmin = currentUser?.role === 'admin';
  const isFarmer = currentUser?.role === 'farmer';
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [selectedQuantity, setSelectedQuantity] = useState<{ [key: string]: number }>({});
  const [showQuantityModal, setShowQuantityModal] = useState<string | null>(null);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const { deleteProduct, updateProductExportStatus, updateProductGrade, updateProductStock } = useStore();

  // Map product IDs to translation keys
  const productNameMap: Record<string, string> = {
    'cavendish-banana': 'product_cavendishBanana',
    'red-banana': 'product_redBanana',
    'nendran-banana': 'product_nendranBanana',
    'baby-banana': 'product_babyBanana',
    'tender-coconut': 'product_tenderCoconut',
    'green-coconut': 'product_greenCoconut',
    'husked-coconut': 'product_huskedCoconut',
    'semi-husked-coconut': 'product_semiHuskedCoconut',
    'dehusked-coconut': 'product_dehuskedCoconut',
    'watermelon': 'product_watermelon',
    'black-watermelon': 'product_blackDiamondWatermelon',
    'yellow-pumpkin': 'product_yellowPumpkin',
    'white-pumpkin': 'product_whitePumpkin',
    'yellow-cucumber': 'product_yellowCucumber',
    'tomato': 'product_tomato',
  };

  const getProductName = (productId: string, defaultName: string) => {
    const key = productNameMap[productId];
    return key ? t(key) : defaultName;
  };

  // Map locations to translation keys
  const locationMap: Record<string, string> = {
    'Tamil Nadu, India': 'location_tamilnadu',
    'Kerala, India': 'location_kerala',
    'Karnataka, India': 'location_karnataka',
    'Andhra Pradesh, India': 'location_andhra',
    'Coimbatore, India': 'location_coimbatore',
    'Pollachi, India': 'location_pollachi',
    'Thanjavur, India': 'location_thanjavur',
    'Gujarat, India': 'location_gujarat',
    'Maharashtra, India': 'location_maharashtra',
  };

  const getLocation = (location: string) => {
    // Check if translation key exists, otherwise returnoriginal
    const key = locationMap[location];
    const translated = key ? t(key) : location;
    return translated !== key ? translated : location;
  };

  // Map farmer names to translation keys
  const farmerNameMap: Record<string, string> = {
    'Raju Farms': 'farmer_rajuFarms',
    'Kumar Plantations': 'farmer_kumarPlantations',
    'Anand Farms': 'farmer_anandFarms',
    'Lakshmi Farms': 'farmer_laksmiFarms',
    'Selvam Estate': 'farmer_selvamEstate',
    'Murugan Farms': 'farmer_muruganFarms',
    'Palani Estates': 'farmer_palaniEstates',
    'Vijay Farms': 'farmer_vijayFarms',
    'Siva Coconuts': 'farmer_sivaCoconuts',
    'Ganesh Agro': 'farmer_ganeshAgro',
    'Prakash Farms': 'farmer_prakashFarms',
    'Deepa Agri': 'farmer_deepaAgri',
    'Ramesh Farms': 'farmer_rameshFarms',
    'Sundar Farms': 'farmer_sundarFarms',
  };

  const getFarmerName = (farmerName: string) => {
    const key = farmerNameMap[farmerName];
    return key ? t(key) : farmerName;
  };

  // Map product descriptions to translation keys
  const descriptionMap: Record<string, string> = {
    'Premium quality Cavendish bananas ideal for international export. Known for consistent size, taste and extended shelf life.': 'desc_cavendishBanana',
    'Sweet red bananas with creamy texture. High demand in Middle East and European markets.': 'desc_redBanana',
    'Large cooking banana popular for chips and traditional dishes.': 'desc_nendranBanana',
    'Small sweet bananas, perfect for snacking and gourmet applications.': 'desc_babyBanana',
    'Fresh tender coconuts with natural water & soft kernel - export quality.': 'desc_tenderCoconut',
    'Green coconuts rich in water content, ideal for juice and cooking.': 'desc_greenCoconut',
    'Fully husked mature coconuts for copra and oil extraction.': 'desc_huskedCoconut',
    'Semi husked coconuts retaining protective layers for longer shelf life.': 'desc_semiHuskedCoconut',
    'Completely dehusked and polished coconuts ready for retail markets.': 'desc_dehuskedCoconut',
    'Large sweet watermelons, juicy and refreshing for summer export demand.': 'desc_watermelon',
    'Premium Black Diamond variety – export grade organic, naturally grown.': 'desc_blackDiamondWatermelon',
    'Bright yellow pumpkins rich in nutrients. Used in soups and curries.': 'desc_yellowPumpkin',
    'Ash gourd / white pumpkin known for medicinal and culinary uses.': 'desc_whitePumpkin',
    'Yellow organic cucumbers – hygienic processing, excellent shelf life.': 'desc_yellowCucumber',
    'Fresh vine-ripened tomatoes for cooking and processing.': 'desc_tomato',
  };

  const getDescription = (description: string) => {
    const key = descriptionMap[description];
    return key ? t(key) : description;
  };

  // Calculate statistics
  const stats = {
    totalProducts: products.length,
    verifiedFarmers: new Set(products.map(p => p.farmerName)).size,
    activeOrders: 248,
    totalRevenue: `${(products.reduce((sum, p) => sum + (p.quantity * p.domesticPrice), 0) / 100000).toFixed(1)}L`,
  };

  const handleImageError = (productId: string) => {
    setImageErrors(prev => new Set(prev).add(productId));
  };

  const handleBuyNow = (product: any) => {
    if (!currentUser) {
      alert(t('login_to_place_orders') || "Please login to place orders");
      navigate("/");
      return;
    }

    if (isFarmer) {
      alert(t('farmers_cannot_place_orders') || "Farmers cannot place orders");
      return;
    }

    setShowQuantityModal(product.id);
    setSelectedQuantity(prev => ({
      ...prev,
      [product.id]: 1
    }));
  };

  const createOrder = (product: any, quantity: number) => {
    if (!currentUser) return;

    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const price = product.domesticPrice;
    const total = price * quantity;

    const newOrder = {
      id: orderId,
      productId: product.id,
      productName: product.name,
      quantity,
      price,
      total,
      buyerId: currentUser.id,
      buyerName: currentUser.name,
      buyerEmail: currentUser.email,
      buyerPhone: currentUser.phone,
      farmerName: product.farmerName,
      paymentMethod: 'upi' as const,
      shipmentStatus: 'placed' as const,
      shippingMethod: (product.exportAvailable ? 'sea' : 'air') as 'sea' | 'air',
      destinationCountry: currentUser.country,
      orderDate: new Date().toLocaleDateString(),
      marketType: (currentUser.userType === 'international' ? 'international' : 'domestic') as 'domestic' | 'international',
      farmerAcceptStatus: 'pending' as const,
      paymentCompleted: false,
    };

    addOrder(newOrder);

    // Notify admin
    addNotification({
      id: `n${Date.now()}`,
      title: '🛒 ' + t('order_placed'),
      message: `${currentUser.name} ` + t('order_placed_desc') + ` ${quantity} ` + t('unit') + ` ` + product.name + ` ₹${total.toLocaleString()}`,
      timestamp: new Date().toLocaleString(),
      read: false,
      targetRoles: ['admin', 'farmer'],
    });

    setShowQuantityModal(null);
    setSelectedQuantity({});

    // Redirect to payments
    setTimeout(() => {
      alert(`✅ ` + t('order_placed') + `! ` + t('order_id') + `: ${orderId}\n` + t('loading') + `...`);
      navigate('/payments');
    }, 300);
  };

  const handleDeleteConfirm = async () => {
    if (productToDelete) {
      await deleteProduct(productToDelete);
      setProductToDelete(null);
      toast.success("Product deleted successfully");
    }
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

  const ProductCard = ({ product }: { product: any }) => {
    const hasImageError = imageErrors.has(product.id);
    const quantity = selectedQuantity[product.id] || 1;
    
    return (
      <div className="premium-card group overflow-hidden flex flex-col transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
        {/* Product Image Container */}
        <div className="relative w-full h-56 sm:h-64 bg-gradient-to-br from-primary/5 via-background to-secondary/5 overflow-hidden flex items-center justify-center">
          {hasImageError ? (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5">
              <Package className="w-12 h-12 text-muted-foreground/50" />
            </div>
          ) : (
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              onError={() => handleImageError(product.id)}
              className="w-full h-full object-contain p-4 drop-shadow-lg group-hover:scale-105 transition-transform duration-300"
            />
          )}
          
          {/* Stock Badges */}
          <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5 z-10 pointer-events-none">
            {product.quantity > 0 && (
              <div className="bg-black/60 backdrop-blur-md border border-white/10 text-green-400 px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-widest uppercase shadow-xl flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_5px_rgba(74,222,128,0.8)]"></span>
                {t('in_stock') || 'IN STOCK'}
              </div>
            )}
            {product.exportAvailable && (
              <div className="bg-black/60 backdrop-blur-md border border-white/10 text-blue-400 px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-widest uppercase shadow-xl flex items-center gap-1.5">
                🌍 {t('export_available') || 'EXPORT'}
              </div>
            )}
          </div>

          {/* Delete Button */}
          {(isAdmin || (isFarmer && product.farmerName === currentUser?.name)) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setProductToDelete(product.id);
              }}
              className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition shadow-lg z-10"
              title="Delete Product"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {/* Category Badge Bottom Left */}
          <div className="absolute bottom-3 left-3">
            <span className="inline-block bg-gradient-to-r from-primary to-secondary text-white px-3 py-1.5 rounded-full text-xs font-bold">
              {t(`category_${product.category.toLowerCase()}`) || product.category}
            </span>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-5 flex-1 flex flex-col gap-4">
          {/* Product Name */}
          <div>
            <h3 className="text-lg font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
              {getProductName(product.id, product.name)}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {getDescription(product.description)}
            </p>
          </div>

          {/* Admin / Farmer Management Options */}
          {(isAdmin || (isFarmer && product.farmerName === currentUser?.name)) && (
            <div className="flex flex-col gap-3 mt-3 mb-2 pt-3 border-t border-primary/10">
              {/* Export Available Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-muted-foreground">Export Available</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={product.exportAvailable}
                    onChange={async (e) => {
                      e.stopPropagation();
                      await updateProductExportStatus(product.id, e.target.checked);
                      toast.success("Export status updated");
                    }}
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-sm"></div>
                </label>
              </div>

              {/* In Stock Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-muted-foreground">In Stock</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={product.quantity > 0}
                    onChange={async (e) => {
                      e.stopPropagation();
                      await updateProductStock(product.id, e.target.checked ? 10000 : 0);
                      toast.success("Stock status updated");
                    }}
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-sm"></div>
                </label>
              </div>
            </div>
          )}



          {/* Pricing Section */}
          {!isFarmer && !isAdmin && (
            <div className="border-t border-primary/10 pt-3 mt-auto">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-primary/5 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground font-medium mb-1">{t('domestic_price')}</p>
                  <p className="text-lg font-bold text-primary">₹{product.domesticPrice}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t('per_kg')}</p>
                </div>
                <div className="bg-secondary/5 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground font-medium mb-1">{t('export_price')}</p>
                  <p className="text-lg font-bold text-secondary">₹{product.exportPrice}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t('per_kg')}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => navigate(`/product/${product.id}`)}
              className="flex-1 btn-primary py-2.5 text-sm font-semibold rounded-lg transition-all duration-200"
            >
              {t('view_details')} →
            </button>
            {!isFarmer && !isAdmin && (
              <button
                onClick={() => handleBuyNow(product)}
                className="flex-1 btn-secondary py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-1"
              >
                <ShoppingCart className="w-4 h-4" /> {t('buy_now')}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen bg-background">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Hero Header Section */}
        <div className="mb-12">
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-4xl">🌾</div>
                  <h1 className="text-4xl sm:text-5xl font-bold text-foreground">
                    {t('premium_marketplace')}
                  </h1>
                </div>
                <p className="text-base sm:text-lg text-muted-foreground max-w-3xl leading-relaxed">
                  {t('export_grade_produce')}
                </p>
              </div>
              {isAdmin && (
                <button
                  onClick={() => navigate("/admin/add-product")}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 sm:px-8 py-3 rounded-lg font-bold text-sm sm:text-base whitespace-nowrap shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_20px_rgba(34,197,94,0.5)] transform hover:-translate-y-1 transition-all flex items-center gap-2"
                >
                  ➕ Add Product
                </button>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={Package}
              label={t('total_products')}
              value={stats.totalProducts}
              color="bg-gradient-to-br from-primary to-primary/70"
            />
            <StatCard
              icon={Users}
              label={t('verified_farmers')}
              value={stats.verifiedFarmers}
              color="bg-gradient-to-br from-secondary to-secondary/70"
            />
            <StatCard
              icon={ShoppingCart}
              label={t('active_orders')}
              value={stats.activeOrders}
              color="bg-gradient-to-br from-blue-500 to-blue-600"
            />
            <StatCard
              icon={TrendingUp}
              label={t('total_revenue')}
              value={stats.totalRevenue}
              color="bg-gradient-to-br from-green-500 to-green-600"
            />
          </div>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-7xl mb-6">📭</div>
            <h2 className="text-3xl font-bold text-foreground mb-3">{t('no_products')}</h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-md">
              {t('no_products_desc')}
            </p>
            {isAdmin && (
              <button
                onClick={() => navigate("/admin/add-product")}
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-xl font-bold shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_20px_rgba(34,197,94,0.5)] transform hover:-translate-y-1 transition-all flex items-center gap-2"
              >
                ➕ Add First Product
              </button>
            )}
          </div>
        )}
      </div>

      {/* Quantity Selection Modal */}
      {showQuantityModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="premium-card rounded-2xl p-8 max-w-sm w-full space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">{t('select_language_desc')}</h2>
              <p className="text-muted-foreground">{t('quantity')}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">
                  {t('quantity')} ({t('unit')})
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedQuantity(prev => ({
                      ...prev,
                      [showQuantityModal]: Math.max(1, (prev[showQuantityModal] || 1) - 1)
                    }))}
                    className="btn-secondary px-4 py-2 rounded-lg"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={selectedQuantity[showQuantityModal] || 1}
                    onChange={(e) => setSelectedQuantity(prev => ({
                      ...prev,
                      [showQuantityModal]: Math.max(1, parseInt(e.target.value) || 1)
                    }))}
                    className="flex-1 bg-background border border-primary/30 rounded-lg px-4 py-2 text-center font-semibold text-foreground"
                    min="1"
                  />
                  <button
                    onClick={() => setSelectedQuantity(prev => ({
                      ...prev,
                      [showQuantityModal]: (prev[showQuantityModal] || 1) + 1
                    }))}
                    className="btn-secondary px-4 py-2 rounded-lg"
                  >
                    +
                  </button>
                </div>
              </div>

              {products.find(p => p.id === showQuantityModal) && (
                <div className="bg-primary/10 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-muted-foreground">{t('price')}: {t('per_unit')}:</span>
                    <span className="font-semibold text-primary">₹{products.find(p => p.id === showQuantityModal)?.domesticPrice}</span>
                  </div>
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-bold text-foreground">{t('total_amount')}:</span>
                    <span className="font-bold text-primary">
                      ₹{((products.find(p => p.id === showQuantityModal)?.domesticPrice || 0) * (selectedQuantity[showQuantityModal] || 1)).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowQuantityModal(null)}
                className="flex-1 btn-secondary py-3 rounded-lg font-semibold"
              >
                {t('cancel')}
              </button>
              <button
                onClick={() => {
                  const product = products.find(p => p.id === showQuantityModal);
                  if (product) {
                    createOrder(product, selectedQuantity[showQuantityModal] || 1);
                  }
                }}
                className="flex-1 btn-primary py-3 rounded-lg font-semibold"
              >
                {t('button_submit')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-fade-in">
          <div className="premium-card bg-[#0F2E1D] border border-red-500/20 rounded-2xl p-8 max-w-sm w-full space-y-6 shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Delete Product</h2>
            <p className="text-gray-300 text-sm">
              Are you sure you want to delete this product? This action cannot be undone.
            </p>
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setProductToDelete(null)}
                className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-3 rounded-xl font-bold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-bold transition shadow-[0_0_15px_rgba(239,68,68,0.3)]"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketplace;
