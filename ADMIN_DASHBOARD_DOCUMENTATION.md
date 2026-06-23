# Admin Dashboard - Documentation

## Overview
A professional agricultural marketplace admin dashboard built with React, TypeScript, and Tailwind CSS. Features a dark green theme optimized for managing agricultural products, orders, and business metrics.

## File Structure
```
src/
├── components/
│   └── AdminDashboard.tsx          # Main dashboard component
├── pages/
│   └── AdminDashboardPage.tsx       # Dashboard page wrapper
└── hooks/
    └── useSidebar.ts               # Sidebar state management hook
```

## Features

### 1. **Collapsible Sidebar Navigation**
- **Width**: 64px when collapsed, 256px when expanded
- **Navigation Items**: Dashboard, Marketplace, Orders, RFQ, Payment, Shipment, Chat, Support
- **Active State**: Highlighted in green (green-700)
- **Background**: Dark green gradient (green-900 to green-950)
- **User Profile Section**: Shows email and logout button at the bottom
- **Smooth Animations**: CSS transitions for all state changes

### 2. **Header Section**
- **Background**: Green gradient (green-800 to green-700)
- **Branding**: Company title and tagline
- **Components**:
  - Notification bell with red indicator dot
  - Language switcher dropdown (English/Hindi)
  - Responsive spacing

### 3. **Statistics Cards**
Grid of 4 statistics (responsive: 1 col mobile → 4 col desktop):
1. **Total Products**: 22 with 📦 icon
2. **Verified Farmers**: 0 with 👨‍🌾 icon  
3. **Active Orders**: 2 with 🛒 icon (blue background)
4. **Total Revenue**: 0.0L with 📈 icon

**Card Features**:
- Green gradient background (green-800 to green-900) or blue for orders
- Border in green-700 with hover effect
- Large 3xl numeric values
- Small label text above value
- Colored icon circle on the right

### 4. **Product Cards Grid**
- **Layout**: 4 columns on desktop, 2 on tablet, 1 on mobile
- **Responsive**: Uses Tailwind grid system with md: and lg: breakpoints
- **Cards Per Row**: Automatically adjusts based on screen size

#### Card Structure:

**Top Section (Image Area)**:
- Status badges with icons:
  - ✓ In Stock (green-600)
  - ✗ Out of Stock (red-600)
  - Export Available (blue-600)
- Large product emoji (🍌, 🍅, etc.)
- Stacked action icons (hidden by default, appear on hover):
  - Copy icon (blue button)
  - Edit icon (green button)
  - Delete icon (red button)

**Bottom Section (Product Info)**:
- Category badge in green-700
- Verified checkmark (✓) in green-400
- Product name in bold white
- Description in green-100 (truncated to 2 lines)
- Price in green-400 with ₹ symbol
- "Add to Cart" button in green-600

### 5. **Interactions**

| Interaction | Behavior |
|-------------|----------|
| Sidebar Toggle | Smooth width transition, icon changes |
| Nav Items Hover | Background color change with transition |
| Card Hover | Border color brightens, shadow appears |
| Action Icons | Hidden by default, appear on card hover |
| Language Menu | Dropdown with smooth appearance |
| Active Navigation | Highlighted in green-700 |

## Color Palette

| Element | Color | Hex Code |
|---------|-------|----------|
| Primary Green | green-800/700 | #1f2937 / #374151 |
| Dark BG | green-950 | #064e3b |
| Borders | green-700 | #15803d |
| Hover Borders | green-500 | #22c55e |
| Text Primary | white | #ffffff |
| Text Secondary | green-100/200 | #dcfce7 / #bbf7d0 |
| Accent Blue | blue-600 | #2563eb |
| Alert Red | red-600 | #dc2626 |
| Background | gray-950 | #030712 |
| Card BG | gray-900 | #111827 |

## Usage

### Import and Use
```tsx
import AdminDashboard from '@/components/AdminDashboard';

export default function App() {
  return <AdminDashboard />;
}
```

### Or Use the Page Wrapper
```tsx
import AdminDashboardPage from '@/pages/AdminDashboardPage';

// In your router configuration
{
  path: '/admin',
  element: <AdminDashboardPage />
}
```

## Customization

### Adding New Products
Modify the `products` array in the component:

```tsx
const products: Product[] = [
  {
    id: '1',
    name: 'Fresh Bananas',
    category: 'Bananas',
    price: 45,
    description: 'Product description',
    image: '🍌',
    inStock: true,
    verified: true,
    exportAvailable: true,
  },
  // Add more products...
];
```

### Modifying Statistics
Update the `stats` array to change dashboard overview cards:

```tsx
const stats: StatCard[] = [
  {
    title: 'Total Products',
    value: '22',
    icon: '📦',
    backgroundColor: 'bg-gradient-to-br from-green-800 to-green-900',
    iconBgColor: 'bg-green-700',
  },
  // Add or modify stats...
];
```

### Adding Navigation Items
Update the `navigationItems` array:

```tsx
const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'marketplace', label: 'Marketplace', icon: ShoppingCart },
  // Add more items...
];
```

### Changing Colors
The component uses Tailwind CSS classes. To modify colors:

1. **Primary Green**: Replace `green-800`, `green-700`, etc. with your desired color
2. **Backgrounds**: Change `gray-950`, `gray-900` to your theme colors
3. **Accents**: Replace `blue-600` for secondary actions
4. **Alerts**: Change `red-600` for delete/out-of-stock states

### Responsive Breakpoints
Current layout:
- **Mobile**: 1 column for products
- **Tablet (md)**: 2 columns
- **Desktop (lg)**: 4 columns

Modify in the product grid:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
```

## Dependencies

### Required
- React 18+
- TypeScript
- Tailwind CSS
- lucide-react (for icons)

### Already Included in Project
- All UI components use native HTML/Tailwind
- No additional UI library dependencies needed beyond lucide-react

## Component Props

The `AdminDashboard` component accepts no props by default. All data is stored internally. To make it data-driven:

```tsx
interface AdminDashboardProps {
  products?: Product[];
  stats?: StatCard[];
  navigationItems?: NavigationItem[];
  onNavigate?: (itemId: string) => void;
}
```

## Accessibility Features

- ✓ Semantic HTML structure
- ✓ Aria labels on toggle buttons
- ✓ Keyboard-friendly navigation
- ✓ Clear focus states (can be enhanced)
- ✓ Color contrast meets WCAG standards

## Performance Considerations

- Component uses React hooks for state management
- Tailwind CSS provides optimized styling
- No unnecessary re-renders with proper hook usage
- Smooth 300ms transitions for sidebar animation

## Integration with i18n

The component has a language switcher. To integrate with your i18n system:

```tsx
import { useTranslation } from 'react-i18next';

const AdminDashboard = () => {
  const { t, i18n } = useTranslation();
  
  const navigationItems = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    // Use translations for all labels
  ];
};
```

## Future Enhancements

- [ ] Connect to backend API for real product data
- [ ] Add filtering and search functionality
- [ ] Implement pagination for product grid
- [ ] Add product editing modal
- [ ] Integrate with Razorpay payment status
- [ ] Add real-time notifications
- [ ] Implement dark/light mode toggle
- [ ] Add export functionality (CSV, PDF)
- [ ] Create analytics charts
- [ ] Add multi-language support via i18n

## Screenshots/Layout

### Desktop View
- Sidebar: 256px (expanded)
- Stats: 4 columns in a row
- Products: 4 columns per row
- Full header with all controls

### Tablet View
- Sidebar: Can be toggled to 64px
- Stats: 2 columns
- Products: 2 columns per row
- Header with compact spacing

### Mobile View
- Sidebar: Collapsed to 64px or hidden
- Stats: 1 column
- Products: 1 column
- Stacked header elements

## Troubleshooting

### Icons not showing
- Ensure lucide-react is installed: `npm install lucide-react`

### Colors not applying
- Verify tailwind.config.ts includes the component path
- Clear Tailwind cache: Delete .next or dist folder

### Sidebar animation stuttering
- Check browser hardware acceleration settings
- Verify GPU acceleration is enabled in Tailwind

### Responsive grid not working
- Ensure viewport meta tag in HTML: `<meta name="viewport" content="width=device-width, initial-scale=1">`

## Support
For issues or questions, check the project documentation or create an issue in the repository.
