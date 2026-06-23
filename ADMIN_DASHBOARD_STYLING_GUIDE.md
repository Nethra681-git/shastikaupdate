# Admin Dashboard - Styling & Customization Guide

## Overview
This guide explains all the Tailwind CSS classes used in the AdminDashboard and how to customize them.

## Tailwind CSS Classes Reference

### Layout & Spacing

| Class | Purpose | Current Usage |
|-------|---------|---|
| `min-h-screen` | Full viewport height | Container wrapper |
| `flex` | Flexbox layout | Main container, navigation items |
| `gap-*` | Spacing between flex/grid items | Gaps in navigation, products |
| `p-*` | Padding | Cards, sections, sidebar |
| `px-*` | Horizontal padding | Buttons, input fields |
| `py-*` | Vertical padding | Buttons, nav items |
| `space-y-*` | Vertical spacing between children | Navigation list, product info |

### Grid System

```tsx
// Product grid responsive
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

// Breaking down:
grid              // Enable CSS Grid
grid-cols-1       // 1 column on mobile
md:grid-cols-2    // 2 columns on tablets (768px+)
lg:grid-cols-4    // 4 columns on desktop (1024px+)
gap-4             // 1rem (16px) gap between items
```

### Color System

#### Green Theme
```css
/* Shades used in the project */
from-green-900    /* #064e3b - Dark sidebar background */
to-green-950      /* #052e16 - Darkest green */
from-green-800    /* #1f7f59 - Header gradient start */
to-green-700      /* #15803d - Header gradient end */
green-700         /* #15803d - Borders, active states */
green-600         /* #16a34a - Action buttons, badges */
green-500         /* #22c55e - Hover states */
green-400         /* #4ade80 - Price text, accents */
green-200         /* #bbf7d0 - Secondary text */
green-100         /* #dcfce7 - Descriptions, hints */
```

#### Other Colors
```css
gray-950          /* #030712 - Main background */
gray-900          /* #111827 - Card backgrounds */
gray-800          /* #1f2937 - Hover states */
blue-600          /* #2563eb - Secondary actions */
blue-700          /* #1d4ed8 - Blue hover */
red-600           /* #dc2626 - Delete/alert */
red-400           /* #f87171 - Red text */
white             /* #ffffff - Primary text */
```

### Border Styling

```tsx
// Border classes
border              // 1px solid border
border-green-700    // Green borders
border-b            // Bottom border only
border-t            // Top border only
border-r            // Right border only

// Hover effects
hover:border-green-500  // Brighter green on hover
hover:shadow-lg          // Add shadow on hover
hover:shadow-green-700/20 // Shadow with opacity
```

### Typography

```tsx
// Font sizes
text-2xl    // 1.5rem (24px) - Header title
text-xl     // 1.25rem (20px) - Section titles
text-lg     // 1.125rem (18px) - Product price
text-sm     // 0.875rem (14px) - Labels, nav items
text-xs     // 0.75rem (12px) - Badges, small text

// Font weights
font-bold   // 700 - Headers, labels
font-semibold // 600 - Emphasis text
font-medium // 500 - Regular labels

// Text colors
text-white      // Primary text
text-green-100  // Secondary text (lighter)
text-green-200  // Hints, descriptions
text-green-400  // Accents, prices
text-red-400    // Error/alert text
```

### Interactive Elements

#### Buttons & Hover States
```tsx
// Base button style
hover:bg-green-700  // Background color change
transition-colors   // Smooth color transition
hover:shadow-lg      // Add shadow effect

// State-specific
active:scale-95     // Shrink on click
focus:outline-none  // Remove default outline
focus:ring-2        // Custom focus ring
```

#### Transitions & Animations
```tsx
transition-all       // Animate all properties
transition-colors    // Animate color changes only
transition-opacity   // Animate opacity changes
duration-300        // 300ms animation duration
duration-500        // 500ms animation duration
```

### Responsive Breakpoints

```tsx
// Tailwind breakpoints
sm     // 640px
md     // 768px  (tablet)
lg     // 1024px (desktop)
xl     // 1280px (large desktop)
2xl    // 1536px (extra large)

// Usage in AdminDashboard
md:grid-cols-2      // 2 columns on tablet+
lg:grid-cols-4      // 4 columns on desktop+
```

### Position & Display

```tsx
fixed             // Fixed positioning (sidebar, header)
absolute          // Absolute positioning (badges, icons)
sticky            // Sticky positioning (header)
z-*               // Z-index stacking
  z-30            // Header above content
  z-40            // Sidebar above others
  z-50            // Dropdowns above everything

hidden            // Display: none
flex              // Display: flex
grid              // Display: grid
opacity-*         // Opacity levels
  opacity-0       // Invisible (hidden)
  opacity-100     // Fully visible
```

### Transforms

```tsx
transform           // Enable transforms
translate-*         // Move element
scale-*             // Scale element
rotate-*            // Rotate element
-translate-y-1/2    // Vertical center (divide by 2)
-translate-x-1/2    // Horizontal center (divide by 2)
```

---

## Component-Specific Styling

### Sidebar

```tsx
// Sidebar container
aside className="... w-64 md:w-16 transition-all duration-300"
     // w-64 = width on desktop (256px)
     // md:w-16 = width on tablet (64px)
     // transition-all = smooth width change
     // duration-300 = 300ms animation

// Sidebar background
bg-gradient-to-b from-green-900 to-green-950
// Gradient from top (from) to bottom (to)
// Using green-900 (#064e3b) at top
// Using green-950 (#052e16) at bottom

// Navigation items
hover:bg-green-800 text-green-100
// Light green text by default
// Darker green background on hover
```

### Header

```tsx
// Header container
bg-gradient-to-r from-green-800 to-green-700
// Gradient from left (to-r) to right
// Creates horizontal gradient effect

// Sticky header
sticky top-0 z-30
// Stays at top when scrolling
// Above main content (z-30)
```

### Statistics Cards

```tsx
// Card gradient
bg-gradient-to-br from-green-800 to-green-900
// Diagonal gradient (top-right to bottom-left)
// "to-br" = to bottom-right

// Card borders
border border-green-700 hover:border-green-500
// 1px solid green-700 border
// Changes to green-500 on hover

// Icon background circle
bg-green-700 rounded-full p-3
// Green background
// Circular shape
// Padding inside for sizing
```

### Product Cards

```tsx
// Card container
bg-gray-900 border border-green-700
// Dark gray background
// Green border

// Image area
bg-gradient-to-br from-gray-800 to-gray-900
// Subtle gray gradient background
// Creates contrast with content

// Badges
bg-green-600 text-white    // In Stock
bg-red-600 text-white      // Out of Stock
bg-blue-600 text-white     // Export Available

// Action buttons (appear on hover)
opacity-0 group-hover:opacity-100
// Hidden by default (opacity-0)
// Shows on parent hover (group-hover)

// Action button icons
bg-blue-600   // Copy button
bg-green-600  // Edit button
bg-red-600    // Delete button
```

---

## Customization Examples

### Change Primary Color

**From Green to Blue:**
```tsx
// Sidebar background
from-green-900 to-green-950  →  from-blue-900 to-blue-950

// Header gradient
from-green-800 to-green-700  →  from-blue-800 to-blue-700

// Borders
border-green-700  →  border-blue-700
hover:border-green-500  →  hover:border-blue-500

// Active states
bg-green-700  →  bg-blue-700
```

### Change to Dark Theme (Further)

```tsx
// Darken backgrounds
gray-950  →  black
gray-900  →  gray-950
```

### Add More Rounded Corners

```tsx
// Original
rounded-lg  // 0.5rem (8px)

// More rounded
rounded-2xl  // 1rem (16px)
rounded-full  // Circular
```

### Increase Animation Speed

```tsx
// Original
duration-300  // 300ms

// Faster
duration-100  // 100ms

// Slower
duration-500  // 500ms
```

### Make Cards Larger/Smaller

```tsx
// Gap between cards (original)
gap-4  // 1rem (16px)

// Larger gap
gap-6  // 1.5rem (24px)
gap-8  // 2rem (32px)

// Smaller gap
gap-2  // 0.5rem (8px)
```

---

## Responsive Design Modifications

### Make More Mobile-Friendly

```tsx
// Original product grid
grid-cols-1 md:grid-cols-2 lg:grid-cols-4

// More mobile-friendly (fewer columns on desktop)
grid-cols-1 sm:grid-cols-2 md:grid-cols-3

// Very mobile-focused
grid-cols-1 lg:grid-cols-3 2xl:grid-cols-4
```

### Adjust Sidebar Width

```tsx
// Original
w-64 (256px)  // Desktop
w-16 (64px)   // Collapsed

// Wider sidebar
w-80 (320px)  // Desktop
w-20 (80px)   // Collapsed

// Narrower sidebar
w-56 (224px)  // Desktop
w-12 (48px)   // Collapsed
```

---

## Advanced Styling Techniques

### Custom Hover Effects

```tsx
// Combine multiple hover effects
hover:bg-green-700
hover:shadow-xl
hover:shadow-green-500/50
hover:-translate-y-1
transition-all
duration-300

// Creates: color change + shadow + lift effect
```

### Gradient Text

```tsx
// Gradient text (requires custom CSS)
bg-gradient-to-r from-green-400 to-blue-500
bg-clip-text
text-transparent

// Creates gradient text effect
```

### Glass-morphism Effect

```tsx
// Blurred, semi-transparent background
backdrop-blur-md
bg-white/30
border border-white/20

// Modern frosted glass look
```

### Neon Glow Effect

```tsx
// Glowing border
border-2
border-green-500
shadow-lg
shadow-green-500/50

// Creates neon-like effect
```

---

## Performance Tips

### Minimize Re-renders
```tsx
// Use CSS instead of JavaScript for animations
transition-all duration-300
// Better than: useState + setTimeout

// Use CSS for hover states
hover:bg-green-700
// Better than: onMouseEnter/onMouseLeave
```

### Optimize Tailwind Output
```tsx
// In tailwind.config.ts
content: [
  "./pages/**/*.{ts,tsx}",
  "./components/**/*.{ts,tsx}",
  "./src/**/*.{ts,tsx}"  // Include all component files
]
```

### Use CSS Classes Instead of Inline Styles
```tsx
// Good
className="bg-green-600 hover:bg-green-700"

// Avoid
style={{ backgroundColor: "rgb(22, 163, 74)" }}
```

---

## Troubleshooting Common Issues

### Colors not applying?
1. ✓ Clear `.next` or `dist` folder
2. ✓ Rebuild CSS: `npm run dev`
3. ✓ Check `tailwind.config.ts` includes component paths
4. ✓ Verify class names are spelled correctly

### Transitions not smooth?
1. ✓ Add `transition-all` or specific transition
2. ✓ Set `duration-*` for timing
3. ✓ Check for conflicting CSS

### Responsive breakpoints not working?
1. ✓ Use `md:` prefix (not `@md`)
2. ✓ Test with DevTools responsive mode
3. ✓ Check viewport meta tag exists

### Shadows appearing wrong?
1. ✓ Use `shadow-lg` with `shadow-green-700/50`
2. ✓ Opacity value (50, 30, etc.) controls intensity
3. ✓ Parent must allow overflow

---

## Resources

- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Color Palette](https://tailwindcss.com/docs/customizing-colors)
- [Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [Transitions & Animations](https://tailwindcss.com/docs/transition-property)

---

## Quick Class Reference

```tsx
// Common spacing
p-4   // Padding: 1rem (16px)
m-4   // Margin: 1rem (16px)
gap-4 // Gap: 1rem (16px)

// Common sizes
w-full   // Width: 100%
h-screen // Height: 100vh
max-w-md // Max-width: 448px

// Common backgrounds
bg-gray-900  // Dark background
bg-green-600 // Green button
bg-white     // White (rare in this design)

// Common text
text-white    // White text
text-sm       // Small text
font-bold     // Bold text

// Common effects
rounded-lg    // Rounded corners (8px)
shadow-lg     // Large shadow
opacity-50    // 50% opacity
```

---

**For more advanced customization, consult the [Tailwind CSS documentation](https://tailwindcss.com) or the main component file.**
