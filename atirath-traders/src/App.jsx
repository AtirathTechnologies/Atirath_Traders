import React, { useState, useEffect } from 'react';
import AOS from 'aos';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Leadership from './components/Leadership';
import Services from './components/Services';
import ServicesPage from './components/ServicesPage';
import ServiceDetailPage from './components/ServiceDetailPage';
import Feedback from './components/Feedback';
import Footer from './components/Footer';
import ProductPage from './components/ProductPage';
import AllProducts from './components/AllProducts';
import Blog from './components/Blog';
import BlogPost from './components/BlogPost';
import JoinUs from './components/Joinus';
import TermsPolicy from './components/TermsPolicy';
import TransportPage from './components/TransportPage';
import CartPage from './components/CartPage';
import MyOrders from './components/MyOrders';
import { SignIn, SignUp } from './components/AuthPages';
import IndianAgriRSSFeed from './components/IndianAgriRSSFeed';
import {
  auth,
  database,
  ref,
  set,
  update,
  onAuthStateChanged,
  signOut,
  getUserProfile,
  updateUserProfile,
  updateLastLogin,
  storeUserProfile,
  get,
  getAllUsers,
  submitQuote,
  mergeGuestCartWithUser,
  getGuestCartId,
  checkIsAdmin
} from './firebase';
import AdminLayout from './admin/AdminLayout';
import Dashboard from './admin/pages/Dashboard';
import Users from './admin/pages/Users';
import Products from './admin/pages/Products';
import Orders from './admin/pages/Orders';
import History from './admin/pages/History';
import { CartProvider } from './components/CartContext';

/* --------------------------------------------------------------------
   Dedicated page components
   -------------------------------------------------------------------- */
const HomePage = ({ onServiceClick, onViewAllClick }) => (
  <div id="home-page">
    <Hero />
    <About id="about" />
    <Leadership id="leadership" />
    <Services
      id="services"
      onServiceClick={onServiceClick}
      onViewAllClick={onViewAllClick}
    />
    <Feedback id="feedback" />
    <Footer id="contact" />
  </div>
);

const AboutPage = () => (
  <div>
    <About id="about" />
    <Footer id="contact" />
  </div>
);

const LeadershipPage = () => (
  <div>
    <Leadership id="leadership" />
    <Footer id="contact" />
  </div>
);

const ProductsPage = ({ onServiceClick, onViewAllClick }) => (
  <div>
    <Services
      id="services"
      onServiceClick={onServiceClick}
      onViewAllClick={onViewAllClick}
    />
    <Footer id="contact" />
  </div>
);

const ServicesPageComponent = () => (
  <div>
    <ServicesPage />
    <Footer id="contact" />
  </div>
);

const ServiceDetailPageComponent = () => (
  <div>
    <ServiceDetailPage />
    <Footer id="contact" />
  </div>
);

const BlogPage = () => (
  <div>
    <Blog id="blog" />
    <Footer id="contact" />
  </div>
);

const BlogPostComponent = () => (
  <div>
    <BlogPost />
    <Footer id="contact" />
  </div>
);

const JoinUsPage = () => (
  <div>
    <JoinUs />
    <Footer id="contact" />
  </div>
);

const FeedbackPage = () => (
  <div>
    <Feedback id="feedback" />
    <Footer id="contact" />
  </div>
);

const ContactPage = () => (
  <div>
    <Feedback id="feedback" />
    <Footer id="contact" />
  </div>
);

const TermsPolicyPage = () => (
  <div>
    <TermsPolicy />
    <Footer id="contact" />
  </div>
);

const TransportPageComponent = () => (
  <div>
    <TransportPage />
    <Footer id="contact" />
  </div>
);

const ProductPageComponent = ({ globalSearchQuery, onGlobalSearchClear, isAuthenticated, profile, onNewOrderSubmitted }) => (
  <div>
    <ProductPage
      globalSearchQuery={globalSearchQuery}
      onGlobalSearchClear={onGlobalSearchClear}
      isAuthenticated={isAuthenticated}
      profile={profile}
      onNewOrderSubmitted={onNewOrderSubmitted}
    />
    <Footer id="contact" />
  </div>
);

const AllProductsComponent = ({ onProductClick, onNavigate }) => (
  <div>
    <AllProducts
      onProductClick={onProductClick}
      onNavigate={onNavigate}
    />
    <Footer id="contact" />
  </div>
);

/* --------------------------------------------------------------------
   Router Wrapper
   -------------------------------------------------------------------- */
const RouterWrapper = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Auto scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  /* ---------- Global search state ---------- */
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  
  /* ---------- Auth State ---------- */
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuthForm, setShowAuthForm] = useState(null);
  const [preFilledEmail, setPreFilledEmail] = useState('');
  const [showProfileUpdateSuccess, setShowProfileUpdateSuccess] = useState(false);
  
  /* ---------- New Orders Count ---------- */
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [viewedOrders, setViewedOrders] = useState(new Set());
  
  /* ---------- Loading States ---------- */
  const [initialAuthCheckDone, setInitialAuthCheckDone] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [adminCheckDone, setAdminCheckDone] = useState(false);
  
  /* ---------- AOS ---------- */
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);
  
  /* ---------- Load viewed orders from localStorage ---------- */
  useEffect(() => {
    const storedViewedOrders = localStorage.getItem('viewedOrders');
    if (storedViewedOrders) {
      try {
        const parsed = JSON.parse(storedViewedOrders);
        setViewedOrders(new Set(parsed));
      } catch (error) {
        console.error('Error parsing viewed orders:', error);
      }
    }
  }, []);
  
  /* ---------- Save viewed orders to localStorage ---------- */
  useEffect(() => {
    if (viewedOrders.size > 0) {
      localStorage.setItem('viewedOrders', JSON.stringify([...viewedOrders]));
    }
  }, [viewedOrders]);
  
  /* ---------- Handle guest cart migration ---------- */
  const migrateGuestCartOnLogin = async (userId) => {
    try {
      const guestCartId = getGuestCartId();
      if (guestCartId) {
        console.log('🔄 Migrating guest cart to user cart...');
        const result = await mergeGuestCartWithUser(guestCartId, userId);
        
        if (result.success) {
          console.log('✅ Guest cart migrated successfully:', {
            itemsMigrated: result.mergedItems.length,
            newCartId: result.cartId
          });
        }
      }
    } catch (error) {
      console.error('❌ Error migrating guest cart:', error);
    }
  };
  
  /* ---------- Firebase auth listener with immediate admin redirect ---------- */
  useEffect(() => {
    console.log('🔐 Setting up Firebase auth listener...');
    let isMounted = true;
  
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('🔄 Auth state changed:', user ? 'User logged in' : 'User logged out');
      
      if (!isMounted) return;
      
      if (user) {
        try {
          // First set basic user data immediately
          const basicUserData = {
            uid: user.uid,
            name: user.displayName || 'User',
            email: user.email || '',
            photoURL: user.photoURL || '',
          };
          
          setCurrentUser(basicUserData);
          setIsAuthenticated(true);
          
          // Check admin status IMMEDIATELY
          const adminStatus = await checkIsAdmin(user.uid, user.email);
          setIsAdminUser(adminStatus);
          setAdminCheckDone(true);
          
          // If admin and not on admin page, redirect IMMEDIATELY
          if (adminStatus && !location.pathname.startsWith('/admin') && showAuthForm === null) {
            console.log('👑 Admin detected, redirecting to admin panel immediately');
            navigate('/admin', { replace: true });
          }
          
          // Migrate guest cart in background
          migrateGuestCartOnLogin(user.uid).catch(console.error);
          
          // Fetch full profile in background
          setTimeout(async () => {
            if (!isMounted) return;
            
            try {
              let userData = await getUserProfile(user.uid);
              
              if (userData) {
                const completeUserData = {
                  uid: user.uid,
                  name: userData.name || user.displayName || 'User',
                  email: userData.email || user.email || '',
                  phone: userData.phone || '',
                  countryCode: userData.countryCode || '+91',
                  country: userData.country || 'India',
                  state: userData.state || '',
                  city: userData.city || '',
                  pincode: userData.pincode || '',
                  location: userData.location || '',
                  photoURL: userData.photoURL || user.photoURL || '',
                  createdAt: userData.createdAt || user.metadata.creationTime || new Date().toISOString(),
                  lastLogin: new Date().toISOString(),
                  userKey: userData.userKey || '',
                  userNumber: userData.userNumber || null,
                  accountStatus: userData.accountStatus || 'active',
                  emailVerified: userData.emailVerified || false,
                  phoneVerified: userData.phoneVerified || false,
                  orderCount: userData.orderCount || 0,
                  totalSpent: userData.totalSpent || 0,
                  lastOrderDate: userData.lastOrderDate || null,
                  userType: userData.userType || 'user',
                  ...(userData.userType === 'vendor' && {
                    gstNo: userData.gstNo || '',
                    registeredBy: userData.registeredBy || '',
                    vendorStatus: userData.vendorStatus || 'pending',
                    vendorApproved: userData.vendorApproved || false
                  })
                };
                
                if (isMounted) {
                  setCurrentUser(completeUserData);
                  await updateLastLogin(user.uid);
                }
                
                console.log('✅ Background user data updated');
              } else {
                // Create new user profile if doesn't exist
                const newUserData = {
                  uid: user.uid,
                  name: user.displayName || 'User',
                  email: user.email || '',
                  phone: '',
                  countryCode: '+91',
                  country: 'India',
                  state: '',
                  city: '',
                  pincode: '',
                  location: '',
                  photoURL: user.photoURL || '',
                  createdAt: user.metadata.creationTime || new Date().toISOString(),
                  lastLogin: new Date().toISOString(),
                  accountStatus: 'active',
                  emailVerified: user.emailVerified || false,
                  phoneVerified: false,
                  orderCount: 0,
                  totalSpent: 0,
                  lastOrderDate: null,
                  userType: 'user'
                };
                
                await storeUserProfile(newUserData);
                console.log('✅ New user profile created in background');
              }
            } catch (error) {
              console.error('❌ Error in background profile fetch:', error);
            } finally {
              if (isMounted) {
                setInitialAuthCheckDone(true);
              }
            }
          }, 100);
          
        } catch (error) {
          console.error('❌ Error in auth listener:', error);
          if (isMounted) {
            setCurrentUser({
              uid: user.uid,
              name: user.displayName || 'User',
              email: user.email || '',
            });
            setIsAuthenticated(true);
            setAdminCheckDone(true);
            setInitialAuthCheckDone(true);
          }
        }
      } else {
        console.log('👤 User signed out');
        if (isMounted) {
          setIsAuthenticated(false);
          setCurrentUser(null);
          setIsAdminUser(false);
          setNewOrdersCount(0);
          setViewedOrders(new Set());
          setAdminCheckDone(true);
          setInitialAuthCheckDone(true);
        }
      }
    });
  
    return () => {
      console.log('🔒 Cleaning up auth listener');
      isMounted = false;
      unsubscribe();
    };
  }, [navigate, location.pathname, showAuthForm]);
  
  /* ---------- Handle initial route based on admin status ---------- */
  useEffect(() => {
    // Only run after admin check is done
    if (!adminCheckDone) return;
    
    // Don't redirect if auth form is open
    if (showAuthForm) return;
    
    // If we're already on admin route, no need to redirect
    if (location.pathname.startsWith('/admin')) return;
    
    // If user is admin and on home page, redirect immediately
    if (isAdminUser && location.pathname === '/') {
      console.log('👑 Admin on home page, redirecting to admin panel');
      navigate('/admin', { replace: true });
    }
  }, [adminCheckDone, isAdminUser, location.pathname, showAuthForm, navigate]);
  
  /* ---------- Fetch user's orders count ---------- */
  const fetchUserOrdersCount = async (userId, email) => {
    if (!userId && !email) return;
    
    try {
      const ordersRef = ref(database, 'quotes');
      const snapshot = await get(ordersRef);
      
      if (snapshot.exists()) {
        const allOrders = snapshot.val();
        let userOrders = [];
        
        Object.keys(allOrders).forEach(key => {
          const order = allOrders[key];
          if (order.userId === userId || order.email === email) {
            userOrders.push({
              id: key,
              ...order
            });
          }
        });
        
        const newOrders = userOrders.filter(order => !viewedOrders.has(order.id));
        setNewOrdersCount(newOrders.length);
        
        console.log('📦 User orders:', {
          total: userOrders.length,
          new: newOrders.length
        });
      } else {
        setNewOrdersCount(0);
      }
    } catch (error) {
      console.error('Error fetching orders count:', error);
      setNewOrdersCount(0);
    }
  };
  
  /* ---------- Update orders count when user changes ---------- */
  useEffect(() => {
    if (currentUser && !isAdminUser) { // Only fetch orders for non-admin users
      fetchUserOrdersCount(currentUser.uid, currentUser.email);
      
      const intervalId = setInterval(() => {
        fetchUserOrdersCount(currentUser.uid, currentUser.email);
      }, 30000);
      
      return () => clearInterval(intervalId);
    }
  }, [currentUser, viewedOrders, isAdminUser]);
  
  /* ---------- Handle order viewed ---------- */
  const handleOrderViewed = (orderIds) => {
    const newViewed = new Set([...viewedOrders, ...orderIds]);
    setViewedOrders(newViewed);
    setNewOrdersCount(prev => Math.max(0, prev - orderIds.length));
  };
  
  /* ---------- Handle new order submitted ---------- */
  const handleNewOrderSubmitted = () => {
    if (currentUser && !isAdminUser) {
      setTimeout(() => {
        fetchUserOrdersCount(currentUser.uid, currentUser.email);
      }, 2000);
    }
  };
  
  /* ---------- Profile Update Handler ---------- */
  const handleProfileUpdate = async (updatedUserData) => {
    if (!currentUser || !currentUser.uid) {
      console.error('No user or UID found');
      alert('Please sign in to update your profile');
      return false;
    }
    try {
      console.log('💾 Updating profile for user:', {
        uid: currentUser.uid,
        data: updatedUserData
      });
      
      const success = await updateUserProfile(currentUser.uid, updatedUserData);
      
      if (!success) {
        alert('Failed to update profile in database');
        return false;
      }
      
      const updatedData = await getUserProfile(currentUser.uid);
      
      if (updatedData) {
        setCurrentUser(prev => ({
          ...prev,
          ...updatedData,
          uid: prev.uid
        }));
        
        setShowProfileUpdateSuccess(true);
        setTimeout(() => setShowProfileUpdateSuccess(false), 3000);
        
        console.log('✅ Profile updated successfully');
        return true;
      } else {
        setCurrentUser(prev => ({
          ...prev,
          ...updatedUserData
        }));
        
        setShowProfileUpdateSuccess(true);
        setTimeout(() => setShowProfileUpdateSuccess(false), 3000);
        return true;
      }
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      alert('Error updating profile. Please try again.');
      throw error;
    }
  };
  
  /* ---------- Navigation helpers ---------- */
  const goTo = (path) => {
    console.log('Navigating to:', path);
    navigate(path);
  };
  
  const goToProduct = (type) => {
    console.log('Going to product:', type);
    goTo(`/product/${type}`);
  };
  
  const goToAllProducts = () => {
    console.log('Going to all products');
    goTo('/all-products');
  };
  
  const goToHome = () => goTo('/');
  const goToAbout = () => goTo('/about');
  const goToLeadership = () => goTo('/leadership');
  const goToProducts = () => goTo('/products');
  const goToServices = () => goTo('/services');
  const goToServiceDetail = (id) => goTo(`/service-detail/${id}`);
  const goToBlog = () => goTo('/blog');
  const goToJoinUs = () => goTo('/join-us');
  const goToFeedback = () => goTo('/feedback');
  const goToContact = () => goTo('/contact');
  const goToTermsPolicy = () => goTo('/terms-policy');
  const goToTransport = () => goTo('/transport');
  const goToCart = () => goTo('/cart');
  const goToMyOrders = () => {
    console.log('🚀 Navigating to My Orders');
    goTo('/my-orders');
  };
  
  const handleServiceClick = (type, options = {}) => {
    console.log('Service clicked:', type, options);
    goToProduct(type);
  };
  
  const handleViewAllClick = () => {
    console.log('View All clicked');
    goToAllProducts();
  };
  
  const handleServiceDetailClick = (id) => goToServiceDetail(id);
  
  /* ---------- Global search handlers ---------- */
  const handleGlobalSearchChange = (query) => {
    setGlobalSearchQuery(query);
  };
  
  const handleGlobalSearchClear = () => {
    setGlobalSearchQuery('');
  };
  
  /* ---------- Auth handlers ---------- */
  const openAuth = (type = 'signin', email = '') => {
    console.log('🔓 Opening auth form:', type, 'with email:', email);
    setShowAuthForm(type);
    if (email) {
      setPreFilledEmail(email);
    }
  };
  
  const closeAuth = () => {
    console.log('🔒 Closing auth form');
    setShowAuthForm(null);
    setPreFilledEmail('');
  };
  
  const handleSignIn = async (userData) => {
    try {
      console.log('🔐 Handling sign in for user:', userData.email);
      
      const immediateUserData = {
        uid: userData.uid,
        name: userData.name || 'User',
        email: userData.email || '',
      };
      
      setIsAuthenticated(true);
      setCurrentUser(immediateUserData);
      
      // Check admin status immediately
      const adminStatus = await checkIsAdmin(userData.uid, userData.email);
      setIsAdminUser(adminStatus);
      
      closeAuth();
      
      if (adminStatus) {
        console.log('👑 Admin signed in, redirecting to admin panel immediately');
        navigate('/admin', { replace: true });
      } else {
        alert(`🎉 Welcome back, ${immediateUserData.name}!`);
        goTo('/');
        migrateGuestCartOnLogin(userData.uid).catch(console.error);
      }
      
      console.log('✅ Sign in completed successfully');
      
    } catch (error) {
      console.error('❌ Error in sign in handler:', error);
      alert('Error signing in. Please try again.');
    }
  };
  
  const handleSignUp = async (userData, email) => {
    try {
      console.log('📝 Handling sign up for:', email);
      alert('🎊 Account created successfully! Please sign in to continue.');
      closeAuth();
      console.log('✅ Sign up completed successfully');
    } catch (error) {
      console.error('❌ Error in sign up handler:', error);
      alert('Error during sign up. Please try again.');
    }
  };
  
  const handleSignOut = async () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      try {
        console.log('👋 Signing out user:', currentUser?.email);
        await signOut(auth);
        setIsAuthenticated(false);
        setCurrentUser(null);
        setIsAdminUser(false);
        setNewOrdersCount(0);
        setViewedOrders(new Set());
        setAdminCheckDone(true);
        alert('Signed out successfully.');
        goTo('/');
      } catch (e) {
        console.error('❌ Sign-out error:', e);
        alert('Sign-out error. Please try again.');
      }
    }
  };
  
  /* ---------- Navbar navigation handler ---------- */
  const handleNavbarNavigation = (section) => {
    console.log('📍 NAVIGATION CALLED WITH SECTION:', section);
    
    switch(section) {
      case 'home':
        goToHome();
        break;
      case 'about':
        goToAbout();
        break;
      case 'leadership':
        goToLeadership();
        break;
      case 'products':
        goToProducts();
        break;
      case 'services':
        goToServices();
        break;
      case 'transport':
        goToTransport();
        break;
      case 'blog':
        goToBlog();
        break;
      case 'join-us':
        goToJoinUs();
        break;
      case 'feedback':
        goToFeedback();
        break;
      case 'contact':
        goToContact();
        break;
      case 'terms-policy':
        goToTermsPolicy();
        break;
      case 'cart':
        goToCart();
        break;
      case 'myorders':
        console.log('🎯 MY ORDERS CLICKED - Navigating to /my-orders');
        goToMyOrders();
        break;
      case 'profile':
        console.log('Profile navigation handled in navbar dropdown');
        break;
      case 'signout':
        handleSignOut();
        break;
      default:
        goToHome();
    }
  };
  
  /* ---------- Check if current page is product page ---------- */
  const isProductPage = () => {
    return location.pathname.startsWith('/product/');
  };
  
  /* ---------- Auth overlay ---------- */
  const renderAuthOverlay = () => {
    if (!showAuthForm) return null;
    console.log('🎨 Rendering auth overlay:', showAuthForm);
    return (
      <div className="auth-overlay-video">
        {showAuthForm === 'signin' ? (
          <SignIn
            onNavigate={(type, email) => {
              console.log('🔄 Navigating auth to:', type, 'with email:', email);
              if (email) {
                setPreFilledEmail(email);
              }
              setShowAuthForm(type);
            }}
            onSignIn={handleSignIn}
            onClose={closeAuth}
            preFilledEmail={preFilledEmail}
          />
        ) : (
          <SignUp
            onNavigate={(type, email) => {
              console.log('🔄 Navigating auth to:', type, 'with email:', email);
              if (email) {
                setPreFilledEmail(email);
              }
              setShowAuthForm(type);
            }}
            onSignUp={handleSignUp}
            onClose={closeAuth}
          />
        )}
      </div>
    );
  };
  
  /* ---------- Profile Update Success Message ---------- */
  const renderProfileUpdateSuccess = () => {
    if (!showProfileUpdateSuccess) return null;
    
    return (
      <div className="profile-update-success">
        <div className="profile-update-success-content">
          <div className="profile-update-success-icon">✓</div>
          <div className="profile-update-success-text">
            Profile updated successfully! Data saved to Firebase.
          </div>
        </div>
      </div>
    );
  };
  
  // Show loading only if initial auth check not done
  if (!initialAuthCheckDone) {
    return (
      <div className="initial-loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }
  
  const showRSS = location.pathname === '/' && !showAuthForm && !isAdminUser;
  
  console.log('🏠 Rendering App with state:', {
    isAuthenticated,
    isAdminUser,
    currentUser: currentUser ? {
      name: currentUser.name,
      email: currentUser.email,
      userType: currentUser.userType
    } : null,
    showAuthForm,
    path: location.pathname,
    initialAuthCheckDone
  });
  
  return (
    <CartProvider>
      <div className={`App ${showAuthForm ? 'auth-overlay-active' : ''}`}>
        <Navbar
          currentPath={location.pathname}
          onNavigate={handleNavbarNavigation}
          onAuthNavigate={openAuth}
          isAuthenticated={isAuthenticated}
          currentUser={currentUser}
          onSignOut={handleSignOut}
          globalSearchQuery={globalSearchQuery}
          onGlobalSearchChange={handleGlobalSearchChange}
          onGlobalSearchClear={handleGlobalSearchClear}
          onProfileUpdate={handleProfileUpdate}
          isProductPage={isProductPage()}
          newOrdersCount={newOrdersCount}
          onOrderViewed={handleOrderViewed}
        />
        
        {showRSS && <IndianAgriRSSFeed />}
        {renderAuthOverlay()}
        {renderProfileUpdateSuccess()}
        
        {/* Page Content */}
        {!showAuthForm && (
          <div className="page-content">
            <Routes>
              {/* Home Route */}
              <Route
                path="/"
                element={
                  <HomePage
                    onServiceClick={handleServiceClick}
                    onViewAllClick={handleViewAllClick}
                  />
                }
              />
            
              {/* Main Pages */}
              <Route path="/about" element={<AboutPage />} />
              <Route path="/leadership" element={<LeadershipPage />} />
              <Route
                path="/products"
                element={
                  <ProductsPage
                    onServiceClick={handleServiceClick}
                    onViewAllClick={handleViewAllClick}
                  />
                }
              />
            
              {/* Services Pages */}
              <Route path="/services" element={<ServicesPageComponent />} />
              <Route path="/service-detail/:id" element={<ServiceDetailPageComponent />} />
            
              {/* Blog Pages */}
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:id" element={<BlogPostComponent />} />
            
              {/* Transport Page */}
              <Route path="/transport" element={<TransportPageComponent />} />
            
              {/* Other Pages */}
              <Route path="/join-us" element={<JoinUsPage />} />
              <Route path="/feedback" element={<FeedbackPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/terms-policy" element={<TermsPolicyPage />} />
              
              {/* Cart Page */}
              <Route path="/cart" element={<CartPage />} />
              
              {/* MY ORDERS PAGE */}
              <Route
                path="/my-orders"
                element={
                  <MyOrders 
                    user={currentUser} 
                    isAuthenticated={isAuthenticated} 
                  />
                }
              />
              
              {/* Product Pages */}
              <Route
                path="/product/:type"
                element={
                  <ProductPageComponent
                    globalSearchQuery={globalSearchQuery}
                    onGlobalSearchClear={handleGlobalSearchClear}
                    isAuthenticated={isAuthenticated}
                    profile={currentUser}
                    onNewOrderSubmitted={handleNewOrderSubmitted}
                  />
                }
              />
              
              <Route
                path="/all-products"
                element={
                  <AllProductsComponent
                    onProductClick={handleServiceClick}
                    onNavigate={handleNavbarNavigation}
                  />
                }
              />
            
              {/* ADMIN PANEL ROUTES */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="users" element={<Users />} />
                <Route path="products" element={<Products />} />
                <Route path="orders" element={<Orders />} />
                <Route path="history" element={<History />} />
              </Route>
              
              {/* 404 Fallback */}
              <Route
                path="*"
                element={
                  <HomePage
                    onServiceClick={handleServiceClick}
                    onViewAllClick={handleViewAllClick}
                  />
                }
              />
            </Routes>
          </div>
        )}
      </div>
    </CartProvider>
  );
};

/* --------------------------------------------------------------------
   Root App
   -------------------------------------------------------------------- */
function App() {
  console.log('🚀 Starting ATIRATH Application...');
  
  return (
    <BrowserRouter>
      <RouterWrapper />
    </BrowserRouter>
  );
}

export default App;