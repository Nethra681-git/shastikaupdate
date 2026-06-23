import AdminDashboard from '../components/AdminDashboard';

/**
 * Admin Dashboard Page
 * 
 * Features:
 * - Collapsible sidebar navigation (64px when collapsed, 256px when expanded)
 * - Green gradient header with company branding
 * - Language switcher (English/Hindi)
 * - Dashboard statistics overview (4 cards)
 * - Product listings grid (responsive: 1-4 columns based on screen size)
 * - Product action buttons (copy, edit, delete)
 * - Hover effects and smooth transitions
 * 
 * Theme: Dark green agricultural marketplace
 * Colors: Green-700 to Green-950 with blue and red accents
 * Icons: Lucide React icons
 */

const AdminDashboardPage = () => {
  return (
    <div className="w-full">
      <AdminDashboard />
    </div>
  );
};

export default AdminDashboardPage;
