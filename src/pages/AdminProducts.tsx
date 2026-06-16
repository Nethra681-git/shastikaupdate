import { useState } from "react";
import { useStore } from "@/lib/store";
import { AlertCircle, Edit2, Save, X, Package } from "lucide-react";
import { createRequest } from "@/lib/requestService";
import { useTranslation } from "react-i18next";

const AdminProducts = () => {
  const { t } = useTranslation();
  const { products, addProduct, updateProductPrice } = useStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newDomestic, setNewDomestic] = useState("");
  const [newExport, setNewExport] = useState("");
  const [newProductName, setNewProductName] = useState("");
  const [newProductCategory, setNewProductCategory] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const handleEditClick = (id: string, domestic: number, exp: number) => {
    setEditingId(id);
    setNewDomestic(domestic.toString());
    setNewExport(exp.toString());
  };

  const handleSavePrice = (id: string) => {
    const domestic = Number(newDomestic);
    const exportPrice = Number(newExport);

    if (!domestic || !exportPrice || domestic <= 0 || exportPrice <= 0) {
      alert(t('admin_valid_prices_error'));
      return;
    }

    updateProductPrice(id, domestic, exportPrice);
    alert(t('admin_price_updated_success'));
    setEditingId(null);
    setNewDomestic("");
    setNewExport("");
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName || !newProductCategory) {
      alert("❌ Please fill all fields");
      return;
    }
    // Note: Full product addition with all fields would be implemented in a more complete form
    alert("✅ Feature: Add complete product form with all fields");
    setShowAddForm(false);
  };

  const handleRequest = async (product: any) => {
    const quantity = prompt("Enter quantity to request:");

    if (!quantity) return;

    try {
      await createRequest({
        product_id: product.id,
        farmer_id: product.farmer_id,
        admin_id: "admin123", // replace with real user
        quantity: Number(quantity),
        message: "Stock iruka?"
      });

      alert("✅ Request sent to farmer!");
    } catch (error) {
      alert("❌ Error sending request: " + error);
    }
  };

  return (
    <div className="p-8 bg-gradient-to-br from-background to-muted/20 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">{t('admin_product_management_label')}</h1>
          <p className="text-muted-foreground">Update prices and manage inventory</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition font-medium"
        >
          ➕ Add Product
        </button>
      </div>

      {/* Add Product Form */}
      {showAddForm && (
        <div className="mb-8 p-6 bg-white rounded-xl border border-gray-200">
          <h2 className="text-xl font-bold mb-4">Add New Product</h2>
          <form onSubmit={handleAddProduct} className="space-y-4">
            <input
              type="text"
              placeholder="Product Name"
              value={newProductName}
              onChange={(e) => setNewProductName(e.target.value)}
              className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="text"
              placeholder="Category"
              value={newProductCategory}
              onChange={(e) => setNewProductCategory(e.target.value)}
              className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition font-medium"
              >
                Add
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-6 py-2 border border-input rounded-lg hover:bg-muted transition font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Product</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Category</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Farmer</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Domestic Price</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Export Price</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Stock</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt={p.name} className="w-12 h-12 object-cover rounded-lg" />
                      <span className="font-medium text-foreground">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{p.category}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{p.farmerName}</td>
                  <td className="px-6 py-4">
                    {editingId === p.id ? (
                      <input
                        type="number"
                        value={newDomestic}
                        onChange={(e) => setNewDomestic(e.target.value)}
                        className="w-28 px-3 py-1 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Price"
                      />
                    ) : (
                      <span className="font-bold text-primary">₹{p.domesticPrice}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingId === p.id ? (
                      <input
                        type="number"
                        value={newExport}
                        onChange={(e) => setNewExport(e.target.value)}
                        className="w-28 px-3 py-1 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Price"
                      />
                    ) : (
                      <span className="font-bold text-secondary">₹{p.exportPrice}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {p.quantity} {p.unit}
                  </td>
                  <td className="px-6 py-4">
                    {editingId === p.id ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSavePrice(p.id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                          title="Save"
                        >
                          <Save size={18} />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                          title="Cancel"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditClick(p.id, p.domesticPrice, p.exportPrice)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleRequest(p)}
                          className="px-3 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition font-medium flex items-center gap-2"
                          title="Request Stock"
                        >
                          <Package size={16} />
                          Request Stock
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Alert */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-3">
        <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
        <p className="text-sm text-blue-700">
          Click the <Edit2 className="inline w-4 h-4" /> icon to edit prices. Prices are updated in real-time across the marketplace.
        </p>
      </div>
    </div>
  );
}

export default AdminProducts;