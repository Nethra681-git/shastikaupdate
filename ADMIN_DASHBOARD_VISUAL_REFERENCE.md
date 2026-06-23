# Admin Dashboard - Visual Reference & Code Locations Guide

## 📍 Dashboard Layout Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  HEADER - Green Gradient Background                            │
│  Title: Shastika GLOBAL - IMPEX PVT LTD                        │
│  Tagline + Notifications 🔔 + Language Selector (English 🌐)   │
└─────────────────────────────────────────────────────────────────┘
┌────────┐ ┌─────────────────────────────────────────────────────┐
│        │ │  DASHBOARD OVERVIEW                                 │
│SIDEBAR│ │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐               │
│        │ │  │Total │ │Verified│ │Active│ │Total │               │
│ Nav    │ │  │Prod- │ │Farmers│ │Orders│ │Revenue              │
│ Items  │ │  │ucts  │ │   0   │ │  2   │ │ 0.0L │               │
│        │ │  │ 22   │ │       │ │      │ │      │               │
│ 📌 D.. │ │  └──────┘ └──────┘ └──────┘ └──────┘               │
│ 📦 M.. │ │                                                     │
│ 🛒 O.. │ │  PRODUCT LISTINGS                                  │
│ 📝 R.. │ │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────┐  │
│ 💳 P.. │ │  │🍌 Fresh  │ │🍅 Organic│ │🌶️ Spice │ │🥥 Coco│  │
│ 🚚 S.. │ │  │Bananas   │ │Tomatoes  │ │Mix       │ │Oil   │  │
│ 💬 C.. │ │  │₹ 45     │ │₹ 30     │ │₹ 250   │ │₹ 180│  │
│ ❓ S.. │ │  └──────────┘ └──────────┘ └──────────┘ └──────┘  │
│        │ │  [More products in responsive grid]               │
│ 👤 ..  │ │                                                     │
│ 🚪 Log │ │                                                     │
└────────┘ └─────────────────────────────────────────────────────┘
```

---

## 🗺️ Code Location Map

### File: `src/components/AdminDashboard.tsx`

#### Section 1: Imports & Types (Lines 1-30)
```tsx
import React, { useState, useCallback } from 'react';
import { Menu, X, LayoutDashboard, ... } from 'lucide-react';
import { useSidebar } from '../hooks/useSidebar';

interface Product { ... }
interface StatCard { ... }
```
**Location in Code**: Top of file
**Purpose**: Define all TypeScript types and imports

---

#### Section 2: Component Setup (Lines 35-50)
```tsx
const AdminDashboard: React.FC = () => {
  const { isOpen, toggleSidebar } = useSidebar();
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [activeNav, setActiveNav] = useState('dashboard');
```
**Location in Code**: Beginning of component
**Purpose**: Initialize hooks and state
**To Modify**: Change default language, active navigation item

---

#### Section 3: Mock Data - Products (Lines 52-130)
```tsx
const products: Product[] = [
  {
    id: '1',
    name: 'Fresh Bananas',
    category: 'Bananas',
    price: 45,
    description: 'High-quality fresh bananas from Kerala...',
    image: '🍌',
    inStock: true,
    verified: true,
    exportAvailable: true,
  },
  // ... 7 more products
];
```
**Location in Code**: After state initialization
**Purpose**: Define product data
**To Modify**:
- Add/remove products
- Change prices
- Update descriptions
- Modify availability status

**⚠️ Note**: This is demo data. For production, fetch from API

---

#### Section 4: Mock Data - Statistics (Lines 132-162)
```tsx
const stats: StatCard[] = [
  {
    title: 'Total Products',
    value: '22',
    icon: '📦',
    backgroundColor: 'bg-gradient-to-br from-green-800 to-green-900',
    iconBgColor: 'bg-green-700',
  },
  // ... 3 more statistics
];
```
**Location in Code**: After products
**Purpose**: Define dashboard metrics
**To Modify**:
- Change stat values
- Add/remove statistics
- Modify backgrounds and colors
- Change icons

**⚠️ Note**: Connect to real metrics via API

---

#### Section 5: Navigation Items (Lines 164-175)
```tsx
const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'marketplace', label: 'Marketplace', icon: ShoppingCart },
  { id: 'orders', label: 'Orders', icon: Package },
  // ... 5 more items
];
```
**Location in Code**: Before JSX return
**Purpose**: Define sidebar navigation menu
**To Modify**:
- Add/remove navigation items
- Change labels
- Update icons
- Reorder items

---

#### Section 6: Sidebar JSX (Lines 180-250)
```tsx
<aside className={`fixed left-0 top-0 h-screen bg-gradient-to-b 
  from-green-900 to-green-950 border-r border-green-700 
  transition-all duration-300 z-40 ${isOpen ? 'w-64' : 'w-16'}`}>
```
**Location in Code**: Inside return statement
**Purpose**: Render sidebar navigation
**Key Classes**:
- `from-green-900 to-green-950` → Background gradient
- `w-64` → Full width (256px)
- `w-16` → Collapsed width (64px)
- `transition-all duration-300` → Smooth animation

**To Modify**:
- Change width: `w-64` to `w-80` (wider)
- Change colors: Replace `green-*` with your theme
- Adjust animation speed: `duration-300` to `duration-500`

---

#### Section 7: Header JSX (Lines 252-330)
```tsx
<header className="bg-gradient-to-r from-green-800 to-green-700 
  border-b border-green-600 sticky top-0 z-30">
```
**Location in Code**: Inside main content area
**Purpose**: Render header with branding
**Key Classes**:
- `bg-gradient-to-r` → Horizontal gradient
- `from-green-800 to-green-700` → Color range
- `sticky top-0 z-30` → Stays at top

**To Modify**:
- Change gradient: `to-r` to `to-b` (vertical)
- Update colors: Replace green shades
- Adjust title and tagline text

---

#### Section 8: Statistics Cards (Lines 335-355)
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {stats.map((stat) => (
    <div className="bg-gradient-to-br from-green-800 to-green-900 
      border border-green-700 rounded-lg p-6 
      hover:border-green-500 transition-colors">
```
**Location in Code**: First grid section
**Purpose**: Display dashboard metrics
**Key Classes**:
- `grid-cols-1 md:grid-cols-2 lg:grid-cols-4` → Responsive columns
- `gap-4` → 16px spacing between cards
- `hover:border-green-500` → Hover effect

**To Modify**:
- Change columns: `lg:grid-cols-4` to `lg:grid-cols-3`
- Adjust spacing: `gap-4` to `gap-6`
- Update colors in map function

---

#### Section 9: Product Grid (Lines 360-450+)
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {products.map((product) => (
    <div className="bg-gray-900 border border-green-700 
      rounded-lg overflow-hidden hover:border-green-500">
```
**Location in Code**: Second grid section
**Purpose**: Display product cards
**Key Classes**:
- `grid-cols-1 md:grid-cols-2 lg:grid-cols-4` → Responsive layout
- `bg-gray-900` → Card background
- `overflow-hidden` → Clip badges at edges

**To Modify**:
- Change card columns
- Update background colors
- Adjust hover effects
- Add/remove product fields

---

## 🎨 Color Customization Map

### Current Green Theme
```
Element                    Current Class           Alternative
─────────────────────────────────────────────────────────────
Main Background           gray-950               black
Sidebar Background        green-900 to 950       blue-900 to 950
Header Background         green-800 to 700       blue-800 to 700
Borders                   green-700              blue-700
Border Hover              green-500              blue-500
Cards Background          gray-900               gray-950
Card Accent               green-700              emerald-700
Text Primary              white                  white
Text Secondary            green-100/200          gray-100/200
Buttons (Primary)         green-600              emerald-600
Buttons (Secondary)       blue-600               indigo-600
Buttons (Danger)          red-600                red-600
Icons (Default)           green-400              emerald-400
Status Badge (Success)    green-600              emerald-600
Status Badge (Error)      red-600                red-600
```

### To Change Theme
**Example: Change from Green to Blue**

Find these lines and replace:
```tsx
// Line ~50: State
const [selectedLanguage, setSelectedLanguage] = useState('en');

// Line ~80-90: Sidebar colors
from-green-900 to-green-950  →  from-blue-900 to-blue-950
green-700 border            →   blue-700 border
green-800 hover             →   blue-800 hover

// Line ~200: Header colors
from-green-800 to-green-700  →  from-blue-800 to-blue-700

// Line ~210+: Stat cards
from-green-800 to-green-900  →  from-blue-800 to-blue-900
green-700 border            →   blue-700 border
```

---

## 📦 Component Structure

```
AdminDashboard Component
│
├── Sidebar
│   ├── Header with Toggle Button
│   ├── Navigation Items (map)
│   │   ├── Dashboard
│   │   ├── Marketplace
│   │   ├── Orders
│   │   ├── RFQ
│   │   ├── Payment
│   │   ├── Shipment
│   │   ├── Chat
│   │   └── Support
│   └── User Profile Section
│       └── Logout Button
│
├── Main Content Area
│   ├── Header
│   │   ├── Title & Tagline
│   │   ├── Notification Bell
│   │   └── Language Selector
│   │       └── Dropdown Menu
│   │
│   ├── Statistics Section
│   │   ├── Total Products Card
│   │   ├── Verified Farmers Card
│   │   ├── Active Orders Card
│   │   └── Total Revenue Card
│   │
│   └── Products Section
│       └── Product Grid (map)
│           └── Product Card (× 8)
│               ├── Image Area
│               │   ├── Status Badges
│               │   ├── Product Image
│               │   └── Action Icons
│               └── Info Area
│                   ├── Category Badge
│                   ├── Product Name
│                   ├── Description
│                   ├── Price
│                   └── Add to Cart Button
```

---

## 🔍 Finding & Modifying Specific Elements

### 1. Change Company Name
**Find**: Line ~270
```tsx
<h1 className="text-2xl font-bold text-white">
  Shastika GLOBAL - IMPEX PVT LTD        ← CHANGE HERE
</h1>
```
**Replace with**: Your company name

---

### 2. Update Tagline
**Find**: Line ~275
```tsx
<p className="text-sm text-green-100 mt-1">
  Best quality products at competitive prices, reliable delivery.  ← CHANGE HERE
</p>
```
**Replace with**: Your tagline

---

### 3. Modify Product Status Badges
**Find**: Line ~405+
```tsx
<span className="text-xs font-semibold px-2 py-1 rounded 
  ${product.inStock ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}">
  {product.inStock ? '✓ In Stock' : '✗ Out of Stock'}  ← CHANGE TEXT HERE
</span>
```

---

### 4. Change Product Price Display
**Find**: Line ~450+
```tsx
<p className="text-green-400 font-bold text-lg">
  ₹ {product.price}  ← CHANGE CURRENCY SYMBOL HERE
</p>
```

---

### 5. Add New Navigation Item
**Find**: Line ~164
```tsx
const navigationItems = [
  // ... existing items ...
  { id: 'newitem', label: 'New Item', icon: YourIcon },  ← ADD HERE
];
```
**Steps**:
1. Import icon: `import { YourIcon } from 'lucide-react';`
2. Add to navigationItems array
3. Icon will automatically render in sidebar

---

### 6. Add New Product
**Find**: Line ~52
```tsx
const products: Product[] = [
  // ... existing products ...
  {
    id: '9',
    name: 'New Product',
    category: 'New Category',
    price: 100,
    description: 'New product description',
    image: '🎯',
    inStock: true,
    verified: true,
    exportAvailable: true,
  },  ← ADD HERE
];
```

---

### 7. Add New Statistic
**Find**: Line ~132
```tsx
const stats: StatCard[] = [
  // ... existing stats ...
  {
    title: 'New Metric',
    value: '42',
    icon: '🎯',
    backgroundColor: 'bg-gradient-to-br from-purple-800 to-purple-900',
    iconBgColor: 'bg-purple-700',
  },  ← ADD HERE
];
```

---

## 🎯 Interactive Elements & Their Locations

| Element | Line # | Type | Interaction |
|---------|--------|------|-------------|
| Sidebar Toggle | ~220 | Button | Click to collapse/expand |
| Nav Items | ~230-240 | Buttons | Click to change active |
| Language Selector | ~295 | Dropdown | Click to change language |
| Language Menu Items | ~305-315 | Buttons | Click to select language |
| Notification Bell | ~287 | Button | Click for notifications |
| Logout Button | ~245 | Button | Click to logout |
| Product Cards | ~380-450 | Div | Hover to show actions |
| Action Icons | ~415-430 | Buttons | Copy, Edit, Delete |
| Add to Cart | ~460 | Button | Click to add to cart |

---

## 🔧 Common Modifications Checklist

### Theme Changes
- [ ] Change sidebar colors (green → your color)
- [ ] Change header colors
- [ ] Change accent colors (blue, red)
- [ ] Update text colors if needed

### Content Changes
- [ ] Update company name and tagline
- [ ] Replace product list with real data
- [ ] Update statistics with real metrics
- [ ] Add/remove navigation items
- [ ] Update user profile info

### Styling Adjustments
- [ ] Adjust sidebar width (w-64 → w-80)
- [ ] Change product grid columns
- [ ] Modify card spacing (gap-4 → gap-6)
- [ ] Update animation duration
- [ ] Adjust font sizes

### Functional Changes
- [ ] Connect navigation to routing
- [ ] Add click handlers for buttons
- [ ] Connect to backend API
- [ ] Add filtering/search
- [ ] Implement modals for actions

---

## 🚀 Performance Tips

### Optimize Re-renders
```tsx
// Good - Component only re-renders when needed
const [activeNav, setActiveNav] = useState('dashboard');

// Bad - Causes unnecessary re-renders
const navigationItems = [].map(...)  // Don't create inside render
```

### Optimize Tailwind
```tsx
// Good - Tailwind class (static)
className="bg-green-600 hover:bg-green-700"

// Bad - Inline styles (defeats optimization)
style={{ backgroundColor: "rgb(22, 163, 74)" }}
```

---

## 📊 CSS Grid Breakdown

### Statistics Grid
```tsx
grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4

Desktop:  ┌─┐ ┌─┐ ┌─┐ ┌─┐  (4 columns)
          └─┘ └─┘ └─┘ └─┘

Tablet:   ┌───┐ ┌───┐        (2 columns)
          └───┘ └───┘
          ┌───┐ ┌───┐
          └───┘ └───┘

Mobile:   ┌─────┐            (1 column)
          └─────┘
          ┌─────┐
          └─────┘
          ┌─────┐
          └─────┘
```

### Product Grid
```tsx
grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4

Desktop:  ┌──┐ ┌──┐ ┌──┐ ┌──┐  (4 columns)
          └──┘ └──┘ └──┘ └──┘

Tablet:   ┌────┐ ┌────┐        (2 columns)
          └────┘ └────┘
          ┌────┐ ┌────┐
          └────┘ └────┘

Mobile:   ┌──────┐            (1 column)
          └──────┘
          ┌──────┐
          └──────┘
```

---

## 🐛 Debugging Guide

### Sidebar not toggling?
**Check**: useSidebar hook is imported and working
**File**: `src/hooks/useSidebar.ts`
**Solution**: Verify hook returns `{ isOpen, toggleSidebar }`

### Colors not showing?
**Check**: Tailwind CSS is properly configured
**File**: `tailwind.config.ts`
**Solution**: Clear cache and rebuild

### Icons not displaying?
**Check**: lucide-react is installed
**Terminal**: `npm install lucide-react`
**Solution**: Verify icon import names match component names

### Navigation not responding?
**Check**: Click handlers are properly bound
**File**: Line ~230-240 of AdminDashboard.tsx
**Solution**: Ensure `onClick` handler is present

---

## 📚 Reference Tables

### Icon Names Available
```tsx
// Navigation Icons
LayoutDashboard, ShoppingCart, Package, FileText, 
CreditCard, Truck, MessageSquare, HelpCircle

// Action Icons
Copy, Edit2, Trash2, Menu, X, LogOut, Globe, Bell, ChevronDown

// Status Icons (emoji in this implementation)
📦 📝 🛒 📈 👨‍🌾 🍌 🍅 🌶️ 🥥 🥭 🌾 🧄 🍯
```

### Responsive Prefixes
```tsx
sm:    // 640px and up
md:    // 768px and up
lg:    // 1024px and up
xl:    // 1280px and up
2xl:   // 1536px and up
```

### Common Tailwind Spacings
```tsx
p-4      // 1rem padding (16px)
gap-4    // 1rem gap (16px)
m-4      // 1rem margin
p-6      // 1.5rem padding
gap-6    // 1.5rem gap
```

---

**For more details, refer to the component source code with inline comments!**
