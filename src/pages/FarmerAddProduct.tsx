import { useState } from 'react';
import { useStore } from '@/lib/store';
import { useTranslation } from 'react-i18next';
import { UploadCloud, CheckCircle2, Package } from 'lucide-react';

const FarmerAddProduct = () => {
  const { t } = useTranslation();
  const { currentUser, products, addProduct, addNotification } = useStore();
  
  const [formData, setFormData] = useState({
    cropName: '',
    variety: '',
    quantity: '',
    unit: 'KG',
    harvestDate: '',
    grade: 'A',
    shippingType: 'Sea Way / Air Way',
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageBase64, setImageBase64] = useState<string>('');
  
  const farmerProducts = products.filter(p => p.farmerName === currentUser?.name);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Convert to base64 for preview and local storage
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cropName || !formData.variety || !formData.quantity || !formData.harvestDate) {
      alert("Please fill all required fields");
      return;
    }
    
    // Default premium placeholder if no image uploaded
    const defaultImage = "https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&w=400&q=80";

    const newProduct = {
      id: `prod-${Date.now()}`,
      name: formData.cropName,
      category: formData.variety, // Using category for variety
      description: formData.variety,
      image: imageBase64 || defaultImage,
      farmerName: currentUser?.name || 'Farmer',
      location: currentUser?.country || 'India',
      domesticPrice: 0, 
      exportPrice: 0,
      quantity: Number(formData.quantity),
      unit: formData.unit.toLowerCase(),
      shippingType: formData.shippingType,
      exportAvailable: true,
      packaging: 'Standard Packaging',
      // Store additional custom fields
      harvestDate: formData.harvestDate,
      grade: formData.grade,
      status: 'Active'
    };

    try {
      await addProduct(newProduct as any);
      addNotification({
        id: `n${Date.now()}`,
        title: 'Product Added',
        message: `${formData.cropName} has been successfully added to your list.`,
        timestamp: new Date().toLocaleString(),
        read: false,
        targetRoles: ['farmer', 'admin'],
      });
      
      // Reset form
      setFormData({
        cropName: '',
        variety: '',
        quantity: '',
        unit: 'KG',
        harvestDate: '',
        grade: 'A',
        shippingType: 'Sea Way / Air Way',
      });
      setImageFile(null);
      setImageBase64('');
      alert("Product added successfully!");
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Failed to add product");
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Add New Product</h1>
        <p className="text-muted-foreground">List your fresh harvest on the marketplace</p>
      </div>

      <div className="bg-[#0A1F13] border border-green-900/30 p-8 rounded-3xl shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Row 1: Crop Name & Variety */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-green-100 mb-2">Crop Name *</label>
              <input 
                type="text" 
                value={formData.cropName}
                onChange={e => setFormData({...formData, cropName: e.target.value})}
                className="w-full px-4 py-3 bg-[#0F2E1D] border border-green-900/50 rounded-xl text-green-50 focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all outline-none"
                placeholder="e.g. Cavendish Banana"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-green-100 mb-2">Variety *</label>
              <input 
                type="text" 
                value={formData.variety}
                onChange={e => setFormData({...formData, variety: e.target.value})}
                className="w-full px-4 py-3 bg-[#0F2E1D] border border-green-900/50 rounded-xl text-green-50 focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all outline-none"
                placeholder="e.g. Export Grade"
                required
              />
            </div>
          </div>

          {/* Row 2: Quantity, Unit, Harvest Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-green-100 mb-2">Quantity Available *</label>
              <input 
                type="number" 
                min="1"
                value={formData.quantity}
                onChange={e => setFormData({...formData, quantity: e.target.value})}
                className="w-full px-4 py-3 bg-[#0F2E1D] border border-green-900/50 rounded-xl text-green-50 focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all outline-none"
                placeholder="e.g. 500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-green-100 mb-2">Unit</label>
              <select 
                value={formData.unit}
                onChange={e => setFormData({...formData, unit: e.target.value})}
                className="w-full px-4 py-3 bg-[#0F2E1D] border border-green-900/50 rounded-xl text-green-50 focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all outline-none cursor-pointer"
              >
                <option value="KG">KG</option>
                <option value="MT">MT</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-green-100 mb-2">Harvest Date *</label>
              <input 
                type="date" 
                value={formData.harvestDate}
                onChange={e => setFormData({...formData, harvestDate: e.target.value})}
                className="w-full px-4 py-3 bg-[#0F2E1D] border border-green-900/50 rounded-xl text-green-50 focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all outline-none"
                required
              />
            </div>
          </div>

          {/* Row 3: Grade & Shipping */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-green-100 mb-2">Grade</label>
              <select 
                value={formData.grade}
                onChange={e => setFormData({...formData, grade: e.target.value})}
                className="w-full px-4 py-3 bg-[#0F2E1D] border border-green-900/50 rounded-xl text-green-50 focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all outline-none cursor-pointer"
              >
                <option value="A">Grade A (Export Quality)</option>
                <option value="B">Grade B (Premium Domestic)</option>
                <option value="C">Grade C (Standard)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-green-100 mb-2">Shipping Options</label>
              <select 
                value={formData.shippingType}
                onChange={e => setFormData({...formData, shippingType: e.target.value})}
                className="w-full px-4 py-3 bg-[#0F2E1D] border border-green-900/50 rounded-xl text-green-50 focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all outline-none cursor-pointer"
              >
                <option value="Sea Way / Air Way">Sea Way / Air Way</option>
                <option value="Sea Way">Sea Way Only</option>
                <option value="Air Way">Air Way Only</option>
                <option value="Domestic Transport">Domestic Transport</option>
              </select>
            </div>
          </div>
          
          {/* Row 4: Photo Upload Full Width */}
          <div>
            <label className="block text-sm font-semibold text-green-100 mb-2">Photo Upload</label>
            <div className="mt-1 flex justify-center px-6 pt-10 pb-10 border-2 border-dashed border-green-500/50 rounded-2xl bg-[#0F2E1D]/50 hover:bg-[#0F2E1D] transition-colors cursor-pointer relative min-h-[160px] items-center">
              <input 
                type="file" 
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="space-y-3 text-center">
                {imageBase64 ? (
                  <img src={imageBase64} alt="Preview" className="h-32 w-auto mx-auto rounded-lg shadow-md object-cover border border-green-500/30" />
                ) : (
                  <>
                    <UploadCloud className="mx-auto h-12 w-12 text-green-500/70" />
                    <div className="flex flex-col text-sm text-green-200/70 justify-center">
                      <span className="font-bold text-green-400">
                        Click to upload a photo
                      </span>
                      <p className="mt-1">or drag and drop here</p>
                    </div>
                    <p className="text-xs text-green-200/40">PNG, JPG up to 5MB</p>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <button type="submit" className="w-full bg-green-600 hover:bg-green-500 text-white font-bold px-8 py-4 rounded-xl mt-8 shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all">
            List Product on Marketplace
          </button>
        </form>
      </div>

      <div className="pt-6">
        <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
          <Package className="w-6 h-6 text-primary" /> My Listed Products
        </h2>
        
        {farmerProducts.length === 0 ? (
          <div className="premium-card rounded-2xl p-12 text-center">
            <p className="text-lg text-muted-foreground">No products listed yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {farmerProducts.map((p: any) => (
              <div key={p.id} className="product-card flex flex-col h-full bg-card group relative">
                <div className="h-48 overflow-hidden relative">
                  <img 
                    src={p.image} 
                    alt={p.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  />
                  <div className="absolute top-3 right-3 flex flex-col gap-2">
                    <span className="badge-stock shadow-lg bg-green-500/90 text-white px-3 py-1 rounded-full text-xs font-bold border border-green-400">
                      <CheckCircle2 className="w-3 h-3 inline mr-1" />
                      {p.status || 'Active'}
                    </span>
                    {p.grade && (
                      <span className="shadow-lg bg-blue-500/90 text-white px-3 py-1 rounded-full text-xs font-bold border border-blue-400">
                        Grade {p.grade}
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col relative z-10 bg-gradient-to-b from-card/80 to-card">
                  <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{p.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{p.description}</p>
                  
                  <div className="mt-auto space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Quantity:</span>
                      <span className="font-semibold text-foreground">{p.quantity?.toLocaleString()} {p.unit}</span>
                    </div>
                    {p.harvestDate && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Harvest Date:</span>
                        <span className="font-semibold text-foreground">{p.harvestDate}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmerAddProduct;
