import { Link, Outlet, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useState, useEffect } from "react";
import { FiMenu, FiX, FiLogOut, FiHome, FiUsers, FiPackage, FiShoppingBag } from "react-icons/fi";
import './admin.css'

export default function AdminLayout() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Check if mobile/tablet on mount and resize
  useEffect(() => {
    const checkScreenSize = () => {
      // Mobile: 0-767px, Tablet: 768-991px, Desktop: 992px+
      const isTabletOrMobile = window.innerWidth <= 991;
      setIsMobileOrTablet(isTabletOrMobile);
      
      if (isTabletOrMobile) {
        // On mobile/tablet, sidebar starts closed
        setSidebarOpen(false);
        setSidebarCollapsed(false);
      } else {
        // On desktop, sidebar starts open
        setSidebarOpen(true);
        setSidebarCollapsed(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
      window.location.reload();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const toggleSidebar = () => {
    if (isMobileOrTablet) {
      // On mobile/tablet, toggle the slide-in/slide-out
      setSidebarOpen(!sidebarOpen);
    } else {
      // On desktop, toggle between collapsed and expanded
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  // Close sidebar when clicking on mobile/tablet overlay
  const handleOverlayClick = () => {
    if (isMobileOrTablet && sidebarOpen) {
      setSidebarOpen(false);
    }
  };

  // Close sidebar on route change on mobile/tablet
  useEffect(() => {
    if (isMobileOrTablet) {
      setSidebarOpen(false);
    }
  }, [navigate, isMobileOrTablet]);

  // Determine sidebar class based on device and state
  const getSidebarClass = () => {
    if (isMobileOrTablet) {
      return sidebarOpen ? 'open' : 'closed';
    } else {
      return sidebarCollapsed ? 'closed' : 'open';
    }
  };

  // Determine content class based on device and state
  const getContentClass = () => {
    if (isMobileOrTablet) {
      return sidebarOpen ? 'sidebar-open' : 'sidebar-closed';
    } else {
      return sidebarCollapsed ? 'sidebar-closed' : 'sidebar-open';
    }
  };

  return (
    <div className="admin-container">
      {/* Overlay for mobile/tablet when sidebar is open */}
      {isMobileOrTablet && sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={handleOverlayClick}
        />
      )}

      {/* Mobile/Tablet Header - only visible on mobile/tablet */}
      {isMobileOrTablet && (
        <div className="mobile-header">
          <h1>Admin Panel</h1>
          <button 
            className="mobile-header-toggle"
            onClick={toggleSidebar}
            title={sidebarOpen ? "Close Menu" : "Open Menu"}
            aria-label={sidebarOpen ? "Close Menu" : "Open Menu"}
          >
            {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>
      )}

      <aside className={`admin-sidebar ${getSidebarClass()}`}>
        {/* Sidebar Header - ADDED "Admin Panel" text back */}
        <div className="sidebar-header">
          <h2>Admin Panel</h2> {/* Added "Admin Panel" text back */}
        </div>

        <div className="sidebar-nav">
          <Link 
            to="/admin" 
            onClick={() => isMobileOrTablet && setSidebarOpen(false)}
            className={({ isActive }) => isActive ? 'active' : ''}
          >
            <FiHome />
            <span>Dashboard</span>
          </Link>
          <Link 
            to="/admin/users" 
            onClick={() => isMobileOrTablet && setSidebarOpen(false)}
            className={({ isActive }) => isActive ? 'active' : ''}
          >
            <FiUsers />
            <span>Users</span>
          </Link>
          <Link 
            to="/admin/products" 
            onClick={() => isMobileOrTablet && setSidebarOpen(false)}
            className={({ isActive }) => isActive ? 'active' : ''}
          >
            <FiPackage />
            <span>Products</span>
          </Link>
          <Link 
            to="/admin/orders" 
            onClick={() => isMobileOrTablet && setSidebarOpen(false)}
            className={({ isActive }) => isActive ? 'active' : ''}
          >
            <FiShoppingBag />
            <span>Orders</span>
          </Link>
          {/* REMOVED Settings link */}
        </div>

        <button 
          onClick={handleLogout} 
          className="admin-logout-btn"
          aria-label="Logout"
        >
          <FiLogOut />
          <span>Logout</span>
        </button>
      </aside>

      <main 
        className={`admin-content ${getContentClass()}`}
        onClick={() => isMobileOrTablet && sidebarOpen && setSidebarOpen(false)}
      >
        <Outlet />
      </main>
    </div>
  );
}