# Admin Panel - Complete Documentation

## 🎯 Overview

A comprehensive, production-ready Admin Panel frontend for the Shastika agricultural marketplace built with React, TypeScript, Tailwind CSS, and Firebase Firestore. Features include real-time data synchronization, PIN-protected security, and a complete management dashboard.

## 📋 Features

### 🔐 Security
- **Admin-only Access**: Automatic access control verification
- **PIN Protection**: 4-digit PIN verification for sensitive actions
- **PIN Management**: Change PIN modal with verification
- **Access Denial**: Beautiful redirect screen for unauthorized access

### 👥 Users Management (Users Tab)
- Real-time user list from Firestore
- Role-based filtering (All, Buyers, Farmers)
- User status management (Pending, Approved, Rejected, Disabled)
- Batch action buttons:
  - ✅ **Approve**: Mark pending users as approved
  - ❌ **Reject**: Reject pending users
  - 🚫 **Disable**: Disable active users
  - 💬 **Message**: Open messaging interface
- User detail modal with complete profile information
- Status badges with visual indicators

### 📦 Orders Management (Orders Tab)
- Real-time order list with live updates
- Order summary dashboard:
  - Total orders count
  - Pending farmer acceptance count
  - Accepted orders count
  - Total revenue value
- PIN-protected order approval/rejection
- Order filtering by status
- Detailed order information:
  - Product details
  - Buyer and farmer information
  - Payment status
  - Order total

### 🚢 Shipment Tracking (Shipments Tab)
- 6-stage shipment tracking:
  1. 📦 Order Placed
  2. ⚙️ Processing
  3. 🚢 Shipped
  4. 🗺️ In Transit
  5. 🏠 Out for Delivery
  6. ✅ Delivered
- Visual progress bar
- Click to update stages
- Inline tracking number and link editing
- Copy-to-clipboard tracking numbers
- Search functionality by Order ID, Product, or Buyer

### 🔔 Notifications (Notifications Tab)
- Real-time notification system
- Unread notification count
- Mark as read functionality
- Delete notifications
- Role-based targeting display
- Formatted timestamps (Just now, 1h ago, etc.)
- Bulk "Mark All as Read" action

### 💰 Revenue Dashboard (Revenue Tab)
- Placeholder for future analytics
- Preview of coming features

### 🎨 UI/UX Features
- **Glass-morphism Design**: Modern, frosted glass card effects
- **Gradient Backgrounds**: Premium gradient themes
- **Smooth Animations**: Fade-in effects and transitions
- **Real-time Updates**: Firestore listeners for live data
- **Responsive Design**: Mobile-first, fully responsive layout
- **Dark Theme**: Eye-friendly dark mode with gradient accents
- **Loading States**: Visual feedback during operations

## 📁 File Structure

```
src/components/AdminPanel/
├── index.tsx                          # Main AdminPanel component
├── admin.css                          # Animations and styles
├── exports.ts                         # Barrel export file
│
├── tabs/
│   ├── UsersTab.tsx                   # Users management
│   ├── OrdersTab.tsx                  # Orders management
│   ├── ShipmentsTab.tsx               # Shipment tracking
│   ├── NotificationsTab.tsx           # Notifications list
│   └── RevenueTab.tsx                 # Revenue dashboard (placeholder)
│
└── modals/
    ├── PINVerificationModal.tsx       # PIN verification UI
    ├── ChangePINModal.tsx             # Change PIN flow
    └── UserDetailModal.tsx            # User profile details
```

## 🚀 Quick Start

### Installation

1. **Import CSS animations**:
```tsx
import '@/components/AdminPanel/admin.css';
```

2. **Import and use the component**:
```tsx
import { AdminPanel } from '@/components/AdminPanel';

export default function AdminRoute() {
  return (
    <AdminPanel 
      onLogout={() => {
        // Handle logout
      }}
    />
  );
}
```

3. **Add to your routing**:
```tsx
import { AdminPanel } from '@/components/AdminPanel';

const routes = [
  {
    path: '/admin',
    element: <AdminPanel onLogout={handleLogout} />,
    protected: true, // Requires admin role
  },
];
```

## 🔧 Configuration

### PIN Management

Default PIN: `1234` (stored in localStorage for demo)

To change PIN storage in production:
1. Update `PINVerificationModal.tsx` - line ~70
2. Update `ChangePINModal.tsx` - line ~80
3. Implement backend verification instead of localStorage

### Firestore Collections

The Admin Panel reads from these collections:

```
Firestore
├── users/
│   ├── {userId}
│   │   ├── id: string
│   │   ├── name: string
│   │   ├── email: string
│   │   ├── phone: string
│   │   ├── country: string
│   │   ├── role: 'admin' | 'buyer' | 'farmer'
│   │   ├── status: 'pending' | 'approved' | 'rejected' | 'disabled'
│   │   ├── userType: 'domestic' | 'international'
│   │   ├── companyName?: string
│   │   └── verified: boolean
│
├── orders/
│   ├── {orderId}
│   │   ├── id: string
│   │   ├── productId: string
│   │   ├── productName: string
│   │   ├── quantity: number
│   │   ├── price: number
│   │   ├── total: number
│   │   ├── buyerId: string
│   │   ├── buyerName: string
│   │   ├── buyerEmail: string
│   │   ├── buyerPhone: string
│   │   ├── farmerName: string
│   │   ├── shipmentStatus: string
│   │   ├── farmerAcceptStatus: 'pending' | 'accepted' | 'rejected'
│   │   ├── paymentCompleted: boolean
│   │   ├── trackingNumber?: string
│   │   ├── trackingLink?: string
│   │   ├── destinationCountry: string
│   │   ├── orderDate: string
│   │   └── marketType: 'domestic' | 'international'
│
└── notifications/
    ├── {notificationId}
    │   ├── id: string
    │   ├── title: string
    │   ├── message: string
    │   ├── timestamp: string
    │   ├── read: boolean
    │   └── targetRoles: string[]
```

## 💡 Usage Examples

### Accessing Specific Tabs Programmatically

```tsx
import { useState } from 'react';
import { AdminPanel } from '@/components/AdminPanel';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('users');

  // Tabs: 'users', 'orders', 'shipments', 'notifications', 'revenue'
  
  return <AdminPanel onLogout={() => {}} />;
}
```

### Triggering PIN Verification from Outside

```tsx
const adminPanel = useRef<any>(null);

const handleSensitiveAction = () => {
  // Trigger PIN modal from within AdminPanel
  // (Internal state management)
};
```

### Real-time Data Integration

All tabs use Firebase's `onSnapshot` for real-time updates:

```tsx
useEffect(() => {
  const unsubscribe = onSnapshot(
    collection(db, 'users'),
    (snapshot) => {
      const users = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(users);
    }
  );
  
  return () => unsubscribe();
}, []);
```

## 🎨 Styling & Customization

### Colors & Themes

Current color scheme:
- **Primary**: Emerald (Approve, Success)
- **Accent**: Cyan (Info, Links)
- **Alert**: Red (Delete, Reject)
- **Warning**: Yellow (Pending)
- **Dark**: Slate-900 to Slate-950

### Glass-Morphism Effect

```css
.glass-card {
  @apply backdrop-blur-xl bg-slate-900/40;
}
```

### Animations

Available animations:
- `animate-fade-in` - Page transitions
- `animate-pulse-soft` - Status updates
- `transition-all` - Smooth transitions

### Customizing Colors

Replace color classes:
```tsx
// Example: Change emerald to blue
'bg-emerald-500/20' → 'bg-blue-500/20'
'text-emerald-400' → 'text-blue-400'
'border-emerald-500/30' → 'border-blue-500/30'
```

## 🔐 Security Considerations

### PIN Verification
- Currently uses localStorage (demo only)
- **Production**: Should use:
  - Backend API for PIN verification
  - Secure hashing (bcrypt)
  - Rate limiting on attempts
  - Session management

### Access Control
```tsx
// Check user role before rendering
if (!currentUser || currentUser.role !== 'admin') {
  return <AccessDenied />;
}
```

### Data Protection
- Only admin users can see sensitive data
- All mutations require PIN verification
- Real-time listeners only update authorized data

## ⚡ Performance Optimization

### Real-time Listeners
- Automatically unsubscribe on component unmount
- Efficient state updates with React hooks
- Debounced search (implement if needed)

### Rendering Optimization
```tsx
// Tab content only renders active tab
{activeTab === 'users' && <UsersTab />}
{activeTab === 'orders' && <OrdersTab />}
// ... etc
```

### Bundle Size
- No external UI library (using native HTML + Tailwind)
- Minimal dependencies (only Firestore, Zustand, lucide-react)
- Tree-shakeable components

## 🐛 Debugging

### Common Issues

**1. Real-time updates not working**
- Check Firestore permissions
- Verify collection names match exactly
- Check browser console for errors

**2. PIN not working**
- Default PIN is `1234`
- Check localStorage in DevTools
- Verify PIN modal is triggering

**3. Access denied on load**
- Verify `currentUser.role === 'admin'`
- Check user data in Firestore
- Verify `setCurrentUser()` is called on login

### Debug Mode

Enable verbose logging:
```tsx
// In each tab component
useEffect(() => {
  console.log('Tab mounted:', tabName);
  return () => console.log('Tab unmounted:', tabName);
}, []);
```

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 640px (1 column layout)
- **Tablet**: 640px - 1024px (2 columns)
- **Desktop**: > 1024px (Full layout)

### Mobile Optimizations
- Sidebar may need drawer implementation
- Touch-friendly button sizes (44px minimum)
- Swipe gestures for tabs

## 🚢 Deployment

### Environment Variables
```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
```

### Build
```bash
npm run build
# Builds to dist/
```

### Performance Checklist
- [ ] Firestore indexes optimized
- [ ] Real-time listeners only on active tabs
- [ ] Images optimized and lazy-loaded
- [ ] CSS minified (automatic with Vite)
- [ ] Tree-shaking enabled

## 📚 API Reference

### AdminPanel Props

```tsx
interface AdminPanelProps {
  onLogout?: () => void;  // Called when user clicks logout
}
```

### Tabs Props

```tsx
interface TabProps {
  onRequiresPIN?: () => void;  // Called when PIN verification needed
}
```

## 🤝 Contributing

To extend the Admin Panel:

1. **Add new tab**:
   - Create file in `tabs/` folder
   - Import in main `index.tsx`
   - Add to tabs array

2. **Add new modal**:
   - Create file in `modals/` folder
   - Import in main component
   - Add state for open/close

3. **Add new action**:
   - Follow PIN verification pattern
   - Add Firestore update call
   - Update local state

## 📝 License

Part of the Shastika agricultural marketplace project.

## 🆘 Support

For issues or questions:
1. Check Firestore permissions
2. Verify data structure matches types
3. Check browser console for errors
4. Review Firestore rules

---

**Built with ❤️ for Shastika Marketplace**
