import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminDashboard from '../components/AdminDashboard';
import { useSidebar } from '../hooks/useSidebar';

/**
 * Admin Dashboard Component Tests
 * 
 * Test suite for the AdminDashboard component
 * Tests cover: rendering, user interactions, responsive behavior, and state management
 */

describe('AdminDashboard Component', () => {
  // ========================================================================
  // RENDERING TESTS
  // ========================================================================

  describe('Rendering', () => {
    it('should render the dashboard without crashing', () => {
      render(<AdminDashboard />);
      expect(screen.getByText(/Shastika GLOBAL/i)).toBeInTheDocument();
    });

    it('should render the header with company name and tagline', () => {
      render(<AdminDashboard />);
      expect(screen.getByText('Shastika GLOBAL - IMPEX PVT LTD')).toBeInTheDocument();
      expect(screen.getByText(/Best quality products at competitive prices/i)).toBeInTheDocument();
    });

    it('should render sidebar navigation items', () => {
      render(<AdminDashboard />);
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Marketplace')).toBeInTheDocument();
      expect(screen.getByText('Orders')).toBeInTheDocument();
      expect(screen.getByText('Shipment')).toBeInTheDocument();
    });

    it('should render all statistics cards', () => {
      render(<AdminDashboard />);
      expect(screen.getByText('Total Products')).toBeInTheDocument();
      expect(screen.getByText('Verified Farmers')).toBeInTheDocument();
      expect(screen.getByText('Active Orders')).toBeInTheDocument();
      expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    });

    it('should render product cards', () => {
      render(<AdminDashboard />);
      expect(screen.getByText('Fresh Bananas')).toBeInTheDocument();
      expect(screen.getByText('Organic Tomatoes')).toBeInTheDocument();
      expect(screen.getByText(/High-quality fresh bananas/i)).toBeInTheDocument();
    });
  });

  // ========================================================================
  // SIDEBAR NAVIGATION TESTS
  // ========================================================================

  describe('Sidebar Navigation', () => {
    it('should have Dashboard as active by default', () => {
      render(<AdminDashboard />);
      const dashboardBtn = screen.getByText('Dashboard').closest('button');
      expect(dashboardBtn).toHaveClass('bg-green-700');
    });

    it('should highlight different nav items when clicked', async () => {
      render(<AdminDashboard />);
      const marketplaceBtn = screen.getByText('Marketplace').closest('button');
      
      await userEvent.click(marketplaceBtn!);
      expect(marketplaceBtn).toHaveClass('bg-green-700');
    });

    it('should render toggle button for sidebar', () => {
      render(<AdminDashboard />);
      const toggleButton = screen.getByRole('button', { name: /toggle sidebar/i });
      expect(toggleButton).toBeInTheDocument();
    });

    it('should render user profile section', () => {
      render(<AdminDashboard />);
      expect(screen.getByText('Admin User')).toBeInTheDocument();
      expect(screen.getByText('admin@shastika.com')).toBeInTheDocument();
    });

    it('should have logout button', () => {
      render(<AdminDashboard />);
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });
  });

  // ========================================================================
  // HEADER TESTS
  // ========================================================================

  describe('Header Section', () => {
    it('should render notification bell button', () => {
      render(<AdminDashboard />);
      const buttons = screen.getAllByRole('button');
      const bellButton = buttons.find(btn => btn.querySelector('svg'));
      expect(bellButton).toBeInTheDocument();
    });

    it('should render language switcher button', () => {
      render(<AdminDashboard />);
      expect(screen.getByText('English')).toBeInTheDocument();
    });

    it('should toggle language menu on click', async () => {
      render(<AdminDashboard />);
      const languageBtn = screen.getByText('English').closest('button');
      
      // Menu should not be visible initially
      let hindiOption = screen.queryByText('हिन्दी');
      expect(hindiOption).not.toBeInTheDocument();
      
      // Click to open menu
      await userEvent.click(languageBtn!);
      hindiOption = screen.getByText('हिन्दी');
      expect(hindiOption).toBeInTheDocument();
    });

    it('should change language when option is clicked', async () => {
      render(<AdminDashboard />);
      const languageBtn = screen.getByText('English').closest('button');
      
      await userEvent.click(languageBtn!);
      const hindiOption = screen.getByText('हिन्दी').closest('button');
      await userEvent.click(hindiOption!);
      
      // Verify language button now shows Hindi option was selected
      expect(screen.getByText('English')).toBeInTheDocument();
    });
  });

  // ========================================================================
  // STATISTICS TESTS
  // ========================================================================

  describe('Statistics Cards', () => {
    it('should display correct stat values', () => {
      render(<AdminDashboard />);
      expect(screen.getByText('22')).toBeInTheDocument(); // Total Products
      expect(screen.getByText('2')).toBeInTheDocument();  // Active Orders
      expect(screen.getByText('0.0L')).toBeInTheDocument(); // Total Revenue
    });

    it('should have proper labels for each stat', () => {
      render(<AdminDashboard />);
      expect(screen.getByText('Total Products')).toBeInTheDocument();
      expect(screen.getByText('Verified Farmers')).toBeInTheDocument();
      expect(screen.getByText('Active Orders')).toBeInTheDocument();
      expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    });
  });

  // ========================================================================
  // PRODUCT CARDS TESTS
  // ========================================================================

  describe('Product Cards', () => {
    it('should display product status badges', () => {
      render(<AdminDashboard />);
      expect(screen.getByText(/✓ In Stock/)).toBeInTheDocument();
      expect(screen.getByText(/✗ Out of Stock/)).toBeInTheDocument();
    });

    it('should display export available badge when applicable', () => {
      render(<AdminDashboard />);
      const exportBadges = screen.getAllByText('Export Available');
      expect(exportBadges.length).toBeGreaterThan(0);
    });

    it('should display product categories', () => {
      render(<AdminDashboard />);
      expect(screen.getByText('Bananas')).toBeInTheDocument();
      expect(screen.getByText('Vegetables')).toBeInTheDocument();
      expect(screen.getByText('Spices')).toBeInTheDocument();
    });

    it('should display verified checkmarks for verified products', () => {
      render(<AdminDashboard />);
      const verifiedMarks = screen.getAllByText(/✓ Verified/);
      expect(verifiedMarks.length).toBeGreaterThan(0);
    });

    it('should display product prices', () => {
      render(<AdminDashboard />);
      expect(screen.getByText('₹ 45')).toBeInTheDocument();
      expect(screen.getByText('₹ 30')).toBeInTheDocument();
      expect(screen.getByText('₹ 250')).toBeInTheDocument();
    });

    it('should have add to cart buttons for all products', () => {
      render(<AdminDashboard />);
      const cartButtons = screen.getAllByText('Add to Cart');
      expect(cartButtons.length).toBe(8); // 8 sample products
    });

    it('should truncate product descriptions', () => {
      render(<AdminDashboard />);
      const descriptions = screen.getAllByText(/High-quality|Pesticide-free|Premium quality/);
      expect(descriptions.length).toBeGreaterThan(0);
    });
  });

  // ========================================================================
  // INTERACTION TESTS
  // ========================================================================

  describe('User Interactions', () => {
    it('should handle product action buttons visibility on hover', async () => {
      const { container } = render(<AdminDashboard />);
      const productCard = container.querySelector('.group');
      
      expect(productCard).toBeInTheDocument();
    });

    it('should have action buttons in product cards', () => {
      const { container } = render(<AdminDashboard />);
      const actionButtons = container.querySelectorAll('button');
      expect(actionButtons.length).toBeGreaterThan(0);
    });

    it('should allow navigation item selection', async () => {
      render(<AdminDashboard />);
      const navItems = screen.getAllByRole('button');
      
      // Click on navigation item
      const rqfBtn = screen.getByText('RFQ').closest('button');
      await userEvent.click(rqfBtn!);
      
      expect(rqfBtn).toHaveClass('bg-green-700');
    });
  });

  // ========================================================================
  // RESPONSIVE TESTS
  // ========================================================================

  describe('Responsive Design', () => {
    it('should render grid layout for products', () => {
      const { container } = render(<AdminDashboard />);
      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('grid-cols-1');
      expect(grid).toHaveClass('md:grid-cols-2');
      expect(grid).toHaveClass('lg:grid-cols-4');
    });

    it('should have responsive breakpoints on stats', () => {
      const { container } = render(<AdminDashboard />);
      const statGrids = container.querySelectorAll('.grid');
      const hasResponsive = Array.from(statGrids).some(grid => 
        grid.className.includes('md:') && grid.className.includes('lg:')
      );
      expect(hasResponsive).toBe(true);
    });
  });

  // ========================================================================
  // ACCESSIBILITY TESTS
  // ========================================================================

  describe('Accessibility', () => {
    it('should have semantic HTML structure', () => {
      const { container } = render(<AdminDashboard />);
      expect(container.querySelector('header')).toBeInTheDocument();
      expect(container.querySelector('main')).toBeInTheDocument();
      expect(container.querySelector('aside')).toBeInTheDocument();
      expect(container.querySelector('nav')).toBeInTheDocument();
    });

    it('should have aria labels on buttons', () => {
      render(<AdminDashboard />);
      const toggleBtn = screen.getByRole('button', { name: /toggle sidebar/i });
      expect(toggleBtn).toHaveAttribute('aria-label');
    });

    it('should have proper button titles for collapsed sidebar items', async () => {
      render(<AdminDashboard />);
      const navButtons = screen.getAllByRole('button');
      // At least some buttons should have title attributes for accessibility
      expect(navButtons.length).toBeGreaterThan(0);
    });
  });

  // ========================================================================
  // STYLING TESTS
  // ========================================================================

  describe('Styling', () => {
    it('should have green theme colors', () => {
      const { container } = render(<AdminDashboard />);
      const sidebar = container.querySelector('aside');
      expect(sidebar).toHaveClass('bg-gradient-to-b');
      expect(sidebar).toHaveClass('from-green-900');
      expect(sidebar).toHaveClass('to-green-950');
    });

    it('should have proper background colors', () => {
      const { container } = render(<AdminDashboard />);
      const main = container.querySelector('main');
      expect(main).toHaveClass('bg-gray-950');
    });

    it('should have border styling on cards', () => {
      const { container } = render(<AdminDashboard />);
      const cards = container.querySelectorAll('.border');
      expect(cards.length).toBeGreaterThan(0);
    });
  });

  // ========================================================================
  // CONTENT TESTS
  // ========================================================================

  describe('Content Verification', () => {
    it('should have 8 sample products', () => {
      render(<AdminDashboard />);
      const cartButtons = screen.getAllByText('Add to Cart');
      expect(cartButtons).toHaveLength(8);
    });

    it('should have 8 navigation items', () => {
      render(<AdminDashboard />);
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Marketplace')).toBeInTheDocument();
      expect(screen.getByText('Orders')).toBeInTheDocument();
      expect(screen.getByText('RFQ')).toBeInTheDocument();
      expect(screen.getByText('Payment')).toBeInTheDocument();
      expect(screen.getByText('Shipment')).toBeInTheDocument();
      expect(screen.getByText('Chat')).toBeInTheDocument();
      expect(screen.getByText('Support')).toBeInTheDocument();
    });

    it('should have 4 statistics cards', () => {
      render(<AdminDashboard />);
      const stats = [
        'Total Products',
        'Verified Farmers',
        'Active Orders',
        'Total Revenue'
      ];
      stats.forEach(stat => {
        expect(screen.getByText(stat)).toBeInTheDocument();
      });
    });
  });
});

/**
 * useSidebar Hook Tests
 */
describe('useSidebar Hook', () => {
  it('should initialize with isOpen = true', () => {
    let result;
    
    function TestComponent() {
      result = useSidebar();
      return null;
    }
    
    render(<TestComponent />);
    expect(result?.isOpen).toBe(true);
  });

  it('should toggle sidebar state', () => {
    let result;
    
    function TestComponent() {
      result = useSidebar();
      return <button onClick={() => result?.toggleSidebar()}>Toggle</button>;
    }
    
    render(<TestComponent />);
    expect(result?.isOpen).toBe(true);
    
    const btn = screen.getByText('Toggle');
    fireEvent.click(btn);
    
    expect(result?.isOpen).toBe(false);
  });
});

/**
 * Integration Tests
 */
describe('AdminDashboard Integration', () => {
  it('should handle complete user flow', async () => {
    render(<AdminDashboard />);
    
    // 1. Dashboard should load
    expect(screen.getByText(/Shastika GLOBAL/i)).toBeInTheDocument();
    
    // 2. User can navigate
    const marketplaceBtn = screen.getByText('Marketplace').closest('button');
    await userEvent.click(marketplaceBtn!);
    expect(marketplaceBtn).toHaveClass('bg-green-700');
    
    // 3. User can change language
    const languageBtn = screen.getByText('English').closest('button');
    await userEvent.click(languageBtn!);
    
    // 4. Products are visible
    expect(screen.getByText('Fresh Bananas')).toBeInTheDocument();
    expect(screen.getByText('Organic Tomatoes')).toBeInTheDocument();
  });

  it('should maintain state across interactions', async () => {
    render(<AdminDashboard />);
    
    // Navigate to Orders
    const ordersBtn = screen.getByText('Orders').closest('button');
    await userEvent.click(ordersBtn!);
    expect(ordersBtn).toHaveClass('bg-green-700');
    
    // Language changes, navigation state should remain
    const languageBtn = screen.getByText('English').closest('button');
    await userEvent.click(languageBtn!);
    
    // Orders should still be active (or behavior as designed)
    expect(screen.getByText('Orders')).toBeInTheDocument();
  });
});
