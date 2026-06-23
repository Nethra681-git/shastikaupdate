# Admin Panel - Quick Start Guide

## ⚡ 5-Minute Setup

### Step 1: Import the Component
```tsx
import { AdminPanel } from '@/components/AdminPanel';
import '@/components/AdminPanel/admin.css';
```

### Step 2: Add to Your Route
```tsx
import { AdminPanel } from '@/components/AdminPanel';
import { useNavigate } from 'react-router-dom';

export default function AdminRoute() {
  const navigate = useNavigate();

  return (
    <AdminPanel 
      onLogout={() => {
        // Clear auth state
        navigate('/login');
      }}
    />
  );
}
```

### Step 3: Protect the Route
```tsx
import { useStore } from '@/lib/store';

function ProtectedAdminRoute() {
  const { currentUser } = useStore();

  if (!currentUser || currentUser.role !== 'admin') {
    return <Navigate to="/login" />;
  }

  return <AdminRoute />;
}
```

## 🎯 Key Features Quick Reference

### Users Tab ✨
- **Filter by role**: Buyers, Farmers, All
- **Actions**: Approve, Reject, Disable, Message
- **View details**: Click user card to see full profile

### Orders Tab 📦
- **Dashboard**: View summary metrics
- **Filter**: All, Pending, Accepted, Rejected
- **PIN-Protected**: Approve/Reject requires 4-digit PIN
- **Real-time**: Updates instantly from Firestore

### Shipments Tab 🚢
- **6 Stages**: Order Placed → Delivered
- **Progress Bar**: Visual tracking
- **Tracking Info**: Edit tracking number and link
- **Search**: Find by Order ID, Product, or Buyer

### Notifications Tab 🔔
- **Real-time**: Updates as they arrive
- **Mark Read**: Click to mark as read
- **Filter**: By target role
- **Bulk Actions**: Mark all as read

## 🔑 PIN Management

### Default PIN
```
1234
```

### How PIN Protection Works
1. User clicks sensitive action (Approve/Reject)
2. PIN verification modal appears
3. User enters 4-digit PIN
4. Action proceeds if correct
5. Invalid PIN shows error

### Change PIN
1. Click ⚙️ icon in header
2. Enter current PIN
3. Enter new PIN
4. Confirm new PIN
5. PIN is updated in localStorage

**Note**: In production, implement backend PIN verification!

## 🗄️ Firestore Setup

### Required Collections

Create these collections in Firestore:

#### 1. Users
```javascript
// Document ID: user's unique ID
{
  name: "John Doe",
  email: "john@example.com",
  phone: "+1234567890",
  country: "USA",
  role: "admin", // or "buyer" | "farmer"
  status: "approved", // pending, approved, rejected, disabled
  userType: "domestic", // or "international"
  companyName: "Company Inc",
  verified: true
}
```

#### 2. Orders
```javascript
// Document ID: order's unique ID
{
  productId: "prod123",
  productName: "Fresh Bananas",
  quantity: 100,
  price: 45,
  total: 4500,
  buyerId: "buyer123",
  buyerName: "Jane Smith",
  buyerEmail: "jane@example.com",
  buyerPhone: "+1234567890",
  farmerName: "Farmer John",
  shipmentStatus: "placed",
  farmerAcceptStatus: "pending", // pending, accepted, rejected
  paymentCompleted: false,
  trackingNumber: "TRK123456",
  trackingLink: "https://tracking.example.com/TRK123456",
  destinationCountry: "USA",
  orderDate: "2024-01-15T10:30:00Z",
  marketType: "international" // or "domestic"
}
```

#### 3. Notifications
```javascript
// Document ID: notification's unique ID
{
  title: "New Order Received",
  message: "Order #12345 from Jane Smith",
  timestamp: "2024-01-15T10:30:00Z",
  read: false,
  targetRoles: ["admin", "farmer"] // Can be [], or specific roles
}
```

## 🎨 Custom Styling

### Change Primary Color
Replace all occurrences of `emerald` with your color:
```tsx
// From:
'bg-emerald-500/20 text-emerald-400'

// To:
'bg-blue-500/20 text-blue-400'
```

### Modify Card Style
Edit in `admin.css`:
```css
.glass-card {
  @apply backdrop-blur-xl bg-slate-900/40;
  /* Adjust opacity/blur as needed */
}
```

## 🔒 Security Best Practices

### 1. PIN Storage (Current - Demo Only)
```tsx
// Currently stored in localStorage
localStorage.getItem('adminPIN')
localStorage.setItem('adminPIN', newPIN)
```

### 2. For Production ⚠️
Implement backend verification:
```tsx
// Call backend API
const verified = await verifyAdminPIN(enteredPIN);

// Backend should:
// - Hash PIN with bcrypt
// - Compare safely
// - Implement rate limiting
// - Log attempts
```

### 3. Access Control
Verify admin role:
```tsx
if (!currentUser || currentUser.role !== 'admin') {
  // Show access denied screen
}
```

## 📱 Responsive Behavior

The Admin Panel is fully responsive:

- **Mobile**: Single column, stacked navigation
- **Tablet**: 2-column grid, side navigation
- **Desktop**: Multi-column, full layout

No additional configuration needed!

## 🔍 Troubleshooting

### Issue: "Access Denied" screen
**Solution**: 
- Verify `currentUser.role === 'admin'`
- Check user in Firestore has `role: "admin"`

### Issue: Data not loading
**Solution**:
- Check Firestore permissions
- Verify collection names are correct
- Check browser console for errors

### Issue: Real-time updates not working
**Solution**:
- Check Firestore listeners are active
- Verify Firestore rules allow reads
- Check network connection

### Issue: PIN verification fails
**Solution**:
- Default PIN is `1234`
- Check localStorage for saved PIN
- Clear localStorage and try default

## 📊 Real-time Updates

All data updates in real-time using Firestore listeners:

```tsx
useEffect(() => {
  const unsubscribe = onSnapshot(
    collection(db, 'users'),
    (snapshot) => {
      // Data automatically updates
    }
  );
  return () => unsubscribe();
}, []);
```

**Note**: Listeners are cleaned up when component unmounts.

## 🎯 Next Steps

1. ✅ Set up Firestore collections
2. ✅ Create admin user in database
3. ✅ Login with admin account
4. ✅ Test each tab
5. ✅ Customize colors/styling
6. ✅ Implement backend PIN verification
7. ✅ Deploy to production

## 📚 Full Documentation

See [ADMIN_PANEL_DOCUMENTATION.md](./ADMIN_PANEL_DOCUMENTATION.md) for:
- Complete feature overview
- File structure
- API reference
- Configuration guide
- Debugging tips

## 💬 Quick Reference

| Feature | Location | Shortcut |
|---------|----------|----------|
| Change PIN | Header ⚙️ icon | Alt+P |
| Logout | Header 🚪 icon | Alt+L |
| Users Tab | Top navigation | - |
| View User Details | Click user card | - |
| Approve Order | Orders → Action buttons | PIN required |
| Edit Tracking | Shipments → ✏️ icon | - |
| Mark Notification Read | Click notification | - |

---

**Ready to go? Start managing your marketplace! 🚀**
