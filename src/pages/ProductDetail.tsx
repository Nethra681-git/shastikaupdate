import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '@/lib/store';
import { useState } from 'react';
import { toast } from 'sonner';
import { ChevronLeft, Truck, Package, Globe, MessageCircle } from 'lucide-react';
import { openWhatsAppRandom, openWhatsAppDirect, ADMIN_LABELS } from '@/lib/whatsapp';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, currentUser, updateProductPrice, updateProductGrade, updateProductGradePrices } = useStore();
  const product = products.find(p => p.id === id);
  const isAdmin = currentUser?.role === 'admin';
  const isFarmer = currentUser?.role === 'farmer';
  const isInternational = currentUser?.userType === 'international';

  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [editDomPrice, setEditDomPrice] = useState(product?.domesticPrice || 0);
  const [editExpPrice, setEditExpPrice] = useState(product?.exportPrice || 0);
  const [editGrade, setEditGrade] = useState(product?.grade || '');
  const [editGradeAPrice, setEditGradeAPrice] = useState(product?.gradeAPrice || 0);
  const [editGradeBPrice, setEditGradeBPrice] = useState(product?.gradeBPrice || 0);

  const handleSavePrices = async () => {
    if (!product) return;
    await updateProductPrice(product.id, editDomPrice, editExpPrice);
    if (isAdmin && editGrade !== product.grade) {
      await updateProductGrade(product.id, editGrade);
    }
    if (isAdmin && (editGradeAPrice !== (product.gradeAPrice || 0) || editGradeBPrice !== (product.gradeBPrice || 0))) {
      await updateProductGradePrices(product.id, editGradeAPrice, editGradeBPrice);
    }
    setIsEditingPrice(false);
    toast.success("Details updated successfully");
  };

  if (!product) return <div className="text-center py-20 text-muted-foreground">Product not found</div>;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition">
          <ChevronLeft className="w-4 h-4" /> Back to Marketplace
        </button>
        <div className="glass-card rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
          <div className="h-72 md:h-96 product-showcase overflow-hidden relative rounded-3xl bg-gradient-to-br from-primary/5 via-background to-secondary/5">
            {/* Animated Background — Floating Orbs */}
            <div className="showcase-orb showcase-orb-1" />
            <div className="showcase-orb showcase-orb-2" />
            <div className="showcase-orb showcase-orb-3" />

            {/* Concentric Rings */}
            <div className="showcase-rings">
              <div className="showcase-ring showcase-ring-1" />
              <div className="showcase-ring showcase-ring-2" />
              <div className="showcase-ring showcase-ring-3" />
            </div>

            {/* Dot Grid Pattern */}
            <div className="showcase-dots" />

            {/* Floating Feature Tags */}
            <div className="absolute top-10 left-6 sm:left-12 z-20 animate-float pointer-events-none hidden sm:flex">
              <span className="bg-black/40 backdrop-blur-md border border-white/20 text-green-300 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider shadow-xl flex items-center gap-2">
                🌟 Premium Quality
              </span>
            </div>
            
            <div className="absolute bottom-16 right-6 sm:right-12 z-20 animate-float-delayed pointer-events-none hidden sm:flex">
              <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider shadow-xl flex items-center gap-2">
                ✈️ Export Grade
              </span>
            </div>

            {product.quantity > 0 && (
              <div className="absolute top-20 right-8 sm:right-16 z-20 animate-float pointer-events-none hidden md:flex" style={{ animationDelay: '1s' }}>
                <span className="bg-green-500/80 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider shadow-xl flex items-center gap-2">
                  ✅ Fresh Harvest
                </span>
              </div>
            )}

            {/* Product Image — object-contain with gentle float */}
            <img
              src={product.image}
              alt={product.name}
              width={640}
              height={640}
              className="w-full h-full object-contain p-6 drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative z-10 animate-float-gentle"
            />
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-foreground">{product.name}</h1>
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">{product.category}</span>
            </div>
            <p className="text-muted-foreground">{product.description}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-muted rounded-lg p-3 text-center"><Package className="w-5 h-5 mx-auto mb-1 text-primary" /><p className="text-xs text-muted-foreground">Packaging</p><p className="text-sm font-medium text-foreground">{product.packaging}</p></div>
              <div className="bg-muted rounded-lg p-3 text-center"><Truck className="w-5 h-5 mx-auto mb-1 text-primary" /><p className="text-xs text-muted-foreground">Shipping</p><p className="text-sm font-medium text-foreground">{product.shippingType}</p></div>
              <div className="bg-muted rounded-lg p-3 text-center"><Globe className="w-5 h-5 mx-auto mb-1 text-primary" /><p className="text-xs text-muted-foreground">Export</p><p className="text-sm font-medium text-foreground">{product.exportAvailable ? 'Available' : 'N/A'}</p></div>
              <div className="bg-muted rounded-lg p-3 text-center"><Package className="w-5 h-5 mx-auto mb-1 text-primary" /><p className="text-xs text-muted-foreground">Quantity</p><p className="text-sm font-medium text-foreground">{product.quantity.toLocaleString()} {product.unit}</p></div>
            </div>
            {!isFarmer && !isInternational && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-primary/5 rounded-xl border border-primary/10">
                {isEditingPrice && isAdmin ? (
                  <div className="flex flex-col gap-4 w-full">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                      <div>
                        <label className="text-xs text-muted-foreground font-bold mb-1 block">Domestic Price (₹)</label>
                        <input type="number" value={editDomPrice} onChange={e => setEditDomPrice(Number(e.target.value))} className="w-full bg-background border border-primary/20 rounded-lg px-3 py-2 text-foreground font-bold outline-none" />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground font-bold mb-1 block">Export Price (₹)</label>
                        <input type="number" value={editExpPrice} onChange={e => setEditExpPrice(Number(e.target.value))} className="w-full bg-background border border-primary/20 rounded-lg px-3 py-2 text-foreground font-bold outline-none" />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground font-bold mb-1 block">Product Grade</label>
                        <select value={editGrade} onChange={e => setEditGrade(e.target.value)} className="w-full bg-background border border-primary/20 rounded-lg px-3 py-2 text-foreground font-bold outline-none">
                          <option value="">None</option>
                          <option value="A">Grade A</option>
                          <option value="B">Grade B</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground font-bold mb-1 block">Grade A Price (₹)</label>
                        <input type="number" value={editGradeAPrice} onChange={e => setEditGradeAPrice(Number(e.target.value))} className="w-full bg-background border border-primary/20 rounded-lg px-3 py-2 text-foreground font-bold outline-none" />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground font-bold mb-1 block">Grade B Price (₹)</label>
                        <input type="number" value={editGradeBPrice} onChange={e => setEditGradeBPrice(Number(e.target.value))} className="w-full bg-background border border-primary/20 rounded-lg px-3 py-2 text-foreground font-bold outline-none" />
                      </div>
                    </div>
                    <div className="flex items-end gap-2 mt-2">
                      <button onClick={handleSavePrices} className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-bold transition">Save Changes</button>
                      <button onClick={() => setIsEditingPrice(false)} className="bg-secondary/20 hover:bg-secondary/30 text-foreground px-6 py-2 rounded-lg font-bold transition">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 w-full">
                    <div className="flex flex-wrap gap-8">
                      <div><span className="text-muted-foreground text-sm font-semibold block mb-1">Domestic Price</span> <span className="text-3xl font-black text-primary">₹{product.domesticPrice}<span className="text-lg font-medium text-primary/60">/{product.unit}</span></span></div>
                      <div><span className="text-muted-foreground text-sm font-semibold block mb-1">Export Price</span> <span className="text-3xl font-black text-secondary">₹{product.exportPrice}<span className="text-lg font-medium text-secondary/60">/{product.unit}</span></span></div>
                      
                      {product.gradeAPrice && product.gradeAPrice > 0 && (
                        <div><span className="text-muted-foreground text-sm font-semibold block mb-1">Grade A Price</span> <span className="text-3xl font-black text-accent">₹{product.gradeAPrice}<span className="text-lg font-medium text-accent/60">/{product.unit}</span></span></div>
                      )}
                      
                      {product.gradeBPrice && product.gradeBPrice > 0 && (
                        <div><span className="text-muted-foreground text-sm font-semibold block mb-1">Grade B Price</span> <span className="text-3xl font-black text-accent">₹{product.gradeBPrice}<span className="text-lg font-medium text-accent/60">/{product.unit}</span></span></div>
                      )}

                      {product.grade && (
                        <div><span className="text-muted-foreground text-sm font-semibold block mb-1">Assigned Grade</span> <span className="text-3xl font-black text-white/80">Grade {product.grade}</span></div>
                      )}
                    </div>
                    {isAdmin && (
                      <div className="mt-2">
                        <button onClick={() => setIsEditingPrice(true)} className="px-6 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg font-semibold transition">
                          Edit Prices & Details
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            {isInternational && !isFarmer && <p className="text-lg text-accent font-semibold">📩 Contact us for pricing — Request a Quote</p>}

            <div className="flex flex-wrap gap-3">
              {!isFarmer && !isAdmin && (
                <button onClick={() => navigate(`/order/${product.id}`)} className="gradient-primary text-primary-foreground px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                  {isInternational ? 'Request Quote' : 'Place Order'}
                </button>
              )}
              {!isAdmin && (
                <button onClick={() => openWhatsAppRandom(product.name)} className="flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                  <MessageCircle className="w-5 h-5" /> Chat on WhatsApp
                </button>
              )}
            </div>

            {/* WhatsApp Direct Contacts */}
            <div className="mt-8 p-6 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl border border-primary/10">
              <p className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-primary" /> Contact our team directly:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {ADMIN_LABELS.map((label, i) => (
                  <button key={i} onClick={() => openWhatsAppDirect(i, product.name)} className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-primary/20 bg-background hover:bg-primary/10 hover:border-primary/40 transition-all group">
                    <span className="text-2xl group-hover:scale-110 transition-transform">{['👨‍💼', '🛠️', '👔', '👑'][i]}</span>
                    <span className="text-xs font-bold text-foreground text-center">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
};

export default ProductDetail;
