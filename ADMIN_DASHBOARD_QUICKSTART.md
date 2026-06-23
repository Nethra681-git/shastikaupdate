# Admin Dashboard - Quick Start Guide

## 🚀 Quick Integration

### Step 1: Import the Component
```tsx
import AdminDashboard from '@/components/AdminDashboard';
```

### Step 2: Add to Your App
```tsx
function App() {
  return (
    <AdminDashboard />
  );
}
```

### Step 3: Or Use Routing
```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminDashboardPage from '@/pages/AdminDashboardPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<AdminDashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

---

## 📋 Features at a Glance

### ✅ Sidebar Navigation
- **Auto-collapse to 64px** when toggled
- **8 Navigation items**: Dashboard, Marketplace, Orders, RFQ, Payment, Shipment, Chat, Support
- **Active state highlighting** in green
- **User profile section** with logout

### ✅ Dashboard Header
- **Company branding** with tagline
- **Bell notifications** with indicator
- **Language switcher** (English/Hindi dropdown)
- **Green gradient background**

### ✅ Statistics Overview
- **4 metric cards**: Total Products, Verified Farmers, Active Orders, Total Revenue
- **Responsive grid**: 1-4 columns based on screen size
- **Color-coded icons** and backgrounds

### ✅ Product Listings
- **8 sample products** with real agricultural items
- **Status indicators**: In Stock, Out of Stock, Export Available
- **Action buttons**: Copy, Edit, Delete (appear on hover)
- **Product details**: Category, verification, description, price
- **Responsive grid**: 1-4 products per row

---

## 🎨 Theme Customization

### Change Primary Color
Replace all `green-*` classes with your color:

```tsx
// In AdminDashboard.tsx
// Change from:
className="bg-gradient-to-b from-green-900 to-green-950"
// To:
className="bg-gradient-to-b from-blue-900 to-blue-950"
```

### Update Product Data
Modify the `products` array:

```tsx
const products: Product[] = [
  {
    id: '1',
    name: 'Your Product Name',
    category: 'Category',
    price: 100,
    description: 'Description here',
    image: '🍌', // Use emoji or image URL
    inStock: true,
    verified: true,
    exportAvailable: true,
  },
];
```

### Add Navigation Items
Update the `navigationItems` array:

```tsx
const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'your-item', label: 'Your Item', icon: YourIcon },
];
```

---

## 🔧 Common Customizations

### 1. Change Company Name
Find this line in the Header:
```tsx
<h1 className="text-2xl font-bold text-white">
  Shastika GLOBAL - IMPEX PVT LTD
</h1>
```

### 2. Update Tagline
```tsx
<p className="text-sm text-green-100 mt-1">
  Your custom tagline here
</p>
```

### 3. Modify Statistics
Update values in the stats array:
```tsx
{
  title: 'Total Products',
  value: '100', // Change this
  icon: '📦',
}
```

### 4. Add/Remove Product Columns
Change the grid layout:
```tsx
// 3 columns instead of 4
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

---

## 📱 Responsive Behavior

| Screen | Sidebar | Stats | Products |
|--------|---------|-------|----------|
| Mobile | 64px collapsed | 1 col | 1 col |
| Tablet (768px) | Toggle | 2 col | 2 col |
| Desktop (1024px) | 256px expanded | 4 col | 4 col |

---

## 🎯 Key Components

### Sidebar Hook
```tsx
import { useSidebar } from '@/hooks/useSidebar';

const { isOpen, toggleSidebar } = useSidebar();
```

### Types Used
```tsx
interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  inStock: boolean;
  verified: boolean;
  exportAvailable: boolean;
}

interface StatCard {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  backgroundColor: string;
  iconBgColor: string;
}
```

---

## 🔌 Integration with Backend

### Fetch Real Products
```tsx
const [products, setProducts] = useState<Product[]>([]);

useEffect(() => {
  fetch('/api/products')
    .then(res => res.json())
    .then(data => setProducts(data));
}, []);
```

### Handle Navigation Clicks
```tsx
const handleNavigate = (itemId: string) => {
  switch(itemId) {
    case 'dashboard':
      navigate('/admin/dashboard');
      break;
    case 'marketplace':
      navigate('/admin/marketplace');
      break;
    // ... handle other items
  }
};
```

### Connect Action Buttons
```tsx
// For edit button
const handleEdit = (productId: string) => {
  navigate(`/admin/product/${productId}/edit`);
};

// For delete button
const handleDelete = (productId: string) => {
  fetch(`/api/products/${productId}`, { method: 'DELETE' })
    .then(() => refetchProducts());
};
```

---

## 🌐 i18n Integration

### Use with react-i18next
```tsx
import { useTranslation } from 'react-i18next';

const AdminDashboard = () => {
  const { t } = useTranslation();
  
  return (
    <>
      <h1>{t('admin.title')}</h1>
      {/* Update all text with translations */}
    </>
  );
};
```

---

## ✨ Styling Tips

### Change Hover Effects
```tsx
// Original
hover:border-green-500 hover:shadow-lg

// Custom
hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-500/50
```

### Update Text Colors
```tsx
// Header text
text-white → text-green-50

// Secondary text
text-green-100 → text-green-200

// Labels
text-green-200 → text-green-300
```

### Modify Button Styles
```tsx
// Original
bg-green-600 hover:bg-green-700

// Custom
bg-emerald-500 hover:bg-emerald-600 active:scale-95
```

---

## 🚨 Troubleshooting

### Sidebar not toggling smoothly
✓ Check if Tailwind duration classes are working
✓ Verify transform properties are not being overridden

### Products not displaying
✓ Ensure lucide-react icons are installed
✓ Check browser console for errors

### Colors look wrong
✓ Clear .next or build folder
✓ Verify tailwind.config.ts includes component paths
✓ Check browser cache (Ctrl+Shift+Delete)

### Responsive layout breaking
✓ Verify viewport meta tag exists
✓ Test with browser DevTools responsive mode
✓ Check for CSS conflicts

---

## 📚 File Locations

```
src/
├── components/AdminDashboard.tsx      # Main component
├── pages/AdminDashboardPage.tsx        # Page wrapper
└── hooks/useSidebar.ts                 # Sidebar state
```

---

## 🎓 Next Steps

1. **Connect to Backend**: Replace mock data with real API calls
2. **Add Filtering**: Filter products by category, stock status
3. **Implement Search**: Add product search functionality
4. **Add Analytics**: Include sales charts and metrics
5. **Enhance Security**: Add role-based access control
6. **Mobile Optimization**: Test and refine mobile experience
7. **Performance**: Add lazy loading for product images
8. **Notifications**: Integrate real-time notifications

---

## 📖 For More Information

See [ADMIN_DASHBOARD_DOCUMENTATION.md](./ADMIN_DASHBOARD_DOCUMENTATION.md) for:
- Detailed component structure
- All customization options
- API integration examples
- Performance optimization tips

---

**Happy building! 🌱**
