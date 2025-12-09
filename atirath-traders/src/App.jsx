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
  submitQuote
} from './firebase';
import AdminLayout from './admin/AdminLayout';
import Dashboard from './admin/pages/Dashboard';
import Users from './admin/pages/Users';
import Products from './admin/pages/Products';
import Orders from './admin/pages/Orders';

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

const AboutPage = () => <About id="about" />;
const LeadershipPage = () => <Leadership id="leadership" />;
const ProductsPage = ({ onServiceClick, onViewAllClick }) => (
  <Services 
    id="services" 
    onServiceClick={onServiceClick}
    onViewAllClick={onViewAllClick}
  />
);
const ServicesPageComponent = () => <ServicesPage />;
const BlogPage = () => <Blog id="blog" />;
const JoinUsPage = () => <JoinUs />;
const FeedbackPage = () => <Feedback id="feedback" />;
const ContactPage = () => (
  <div>
    <Feedback id="feedback" />
    <Footer id="contact" />
  </div>
);
const TermsPolicyPage = () => <TermsPolicy />;
const TransportPageComponent = () => <TransportPage />;

/* --------------------------------------------------------------------
   Router Wrapper - UPDATED WITH FIXED NAVIGATION
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
  const [isLoading, setIsLoading] = useState(true);
  const [showProfileUpdateSuccess, setShowProfileUpdateSuccess] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  
  /* ---------- New Orders Count ---------- */
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [viewedOrders, setViewedOrders] = useState(new Set());

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

  /* ---------- Firebase auth listener ---------- */
  useEffect(() => {
    console.log('🔐 Setting up Firebase auth listener...');
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('🔄 Auth state changed:', user ? 'User logged in' : 'User logged out');
      setAuthLoading(true);
      
      if (user) {
        try {
          console.log('👤 User authenticated:', {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName
          });
          
          let userData = await getUserProfile(user.uid);
          
          console.log('📊 Fetched user data from Firebase:', userData);
          
          if (!userData) {
            console.log('⚠️ User not found in database, creating profile...');
            
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
              lastOrderDate: null
            };
            
            console.log('💾 Storing new user profile in Firebase:', newUserData);
            
            const storeResult = await storeUserProfile(newUserData);
            
            if (storeResult.success) {
              console.log('✅ New user profile stored successfully:', storeResult);
              userData = await getUserProfile(user.uid);
            } else {
              console.error('❌ Failed to store user profile:', storeResult.error);
              userData = newUserData;
            }
          }
          
          if (userData) {
            console.log('✅ User data ready for app:', userData);
            
            await updateLastLogin(user.uid);
            
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
              lastOrderDate: userData.lastOrderDate || null
            };
            
            setCurrentUser(completeUserData);
            setIsAuthenticated(true);
            
            console.log('🎉 User authenticated with full data:', {
              name: completeUserData.name,
              email: completeUserData.email,
              phone: completeUserData.phone,
              country: completeUserData.country,
              state: completeUserData.state,
              city: completeUserData.city,
              pincode: completeUserData.pincode,
              hasPhoto: !!completeUserData.photoURL
            });
          } else {
            console.log('⚠️ Using fallback user data');
            setCurrentUser({
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
              lastLogin: new Date().toISOString()
            });
            setIsAuthenticated(true);
          }
          
        } catch (error) {
          console.error('❌ Error in auth listener:', error);
          setCurrentUser({
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
            lastLogin: new Date().toISOString()
          });
          setIsAuthenticated(true);
        }
      } else {
        console.log('👤 User signed out');
        setIsAuthenticated(false);
        setCurrentUser(null);
        setNewOrdersCount(0);
        setViewedOrders(new Set());
      }
      
      setAuthLoading(false);
    });
    
    return () => {
      console.log('🔒 Cleaning up auth listener');
      unsubscribe();
    };
  }, []);

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
    if (currentUser) {
      fetchUserOrdersCount(currentUser.uid, currentUser.email);
      
      const intervalId = setInterval(() => {
        fetchUserOrdersCount(currentUser.uid, currentUser.email);
      }, 30000);
      
      return () => clearInterval(intervalId);
    }
  }, [currentUser, viewedOrders]);

  /* ---------- Handle order viewed ---------- */
  const handleOrderViewed = (orderIds) => {
    const newViewed = new Set([...viewedOrders, ...orderIds]);
    setViewedOrders(newViewed);
    
    setNewOrdersCount(prev => Math.max(0, prev - orderIds.length));
  };

  /* ---------- Handle new order submitted ---------- */
  const handleNewOrderSubmitted = () => {
    if (currentUser) {
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
        
        console.log('✅ Profile updated successfully:', {
          name: updatedData.name,
          phone: updatedData.phone,
          country: updatedData.country,
          state: updatedData.state,
          city: updatedData.city,
          pincode: updatedData.pincode,
          hasPhoto: !!updatedData.photoURL
        });
        
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

  /* ---------- Navigation helpers - FIXED ---------- */
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

  // Fixed: Properly handle service clicks
  const handleServiceClick = (type, options = {}) => {
    console.log('Service clicked:', type, options);
    goToProduct(type);
  };

  // Fixed: Properly handle view all click
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
      
      const freshUserData = await getUserProfile(userData.uid);
      
      let userProfileData;
      if (freshUserData) {
        console.log('📊 Fresh user data from Firebase:', freshUserData);
        userProfileData = {
          uid: userData.uid,
          name: freshUserData.name || userData.name || 'User',
          email: freshUserData.email || userData.email || '',
          phone: freshUserData.phone || userData.phone || '',
          countryCode: freshUserData.countryCode || userData.countryCode || '+91',
          country: freshUserData.country || userData.country || 'India',
          state: freshUserData.state || userData.state || '',
          city: freshUserData.city || userData.city || '',
          pincode: freshUserData.pincode || userData.pincode || '',
          location: freshUserData.location || userData.location || '',
          photoURL: freshUserData.photoURL || userData.photoURL || '',
          createdAt: freshUserData.createdAt || userData.createdAt,
          lastLogin: new Date().toISOString(),
          userKey: freshUserData.userKey || '',
          userNumber: freshUserData.userNumber || null,
          accountStatus: freshUserData.accountStatus || 'active'
        };
      } else {
        console.log('⚠️ No fresh data, using provided data');
        userProfileData = {
          uid: userData.uid,
          name: userData.name || 'User',
          email: userData.email || '',
          phone: userData.phone || '',
          countryCode: userData.countryCode || '+91',
          country: userData.country || 'India',
          state: userData.state || '',
          city: userData.city || '',
          pincode: userData.pincode || '',
          location: userData.location || '',
          photoURL: userData.photoURL || '',
          createdAt: userData.createdAt,
          lastLogin: new Date().toISOString()
        };
      }
      
      console.log('✅ Final user data for app state:', userProfileData);
      
      setIsAuthenticated(true);
      setCurrentUser(userProfileData);
      
      await updateLastLogin(userData.uid);
      
      closeAuth();
      
      alert(`🎉 Welcome back, ${userProfileData.name}!`);
      goTo('/');
      
    } catch (error) {
      console.error('❌ Error in sign in handler:', error);
      alert('Error signing in. Please try again.');
    }
  };

  const handleSignUp = async (userData, email) => {
    try {
      console.log('📝 Handling sign up for:', email);
      
      // Store user data in Firebase
      if (userData.uid) {
        const userProfile = {
          uid: userData.uid,
          name: userData.name || 'User',
          email: userData.email || '',
          phone: userData.phone || '',
          countryCode: userData.countryCode || '+91',
          country: userData.country || 'India',
          state: userData.state || '',
          city: userData.city || '',
          pincode: userData.pincode || '',
          location: userData.location || '',
          photoURL: userData.photoURL || '',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          accountStatus: 'active',
          emailVerified: false,
          phoneVerified: false,
          orderCount: 0,
          totalSpent: 0
        };
        
        const storeResult = await storeUserProfile(userProfile);
        
        if (storeResult.success) {
          console.log('✅ User profile stored successfully');
          
          // Set current user immediately
          setIsAuthenticated(true);
          setCurrentUser(userProfile);
          
          setPreFilledEmail(email);
          
          closeAuth();
          
          alert(`🎊 Welcome ${userData.name}! Your account has been created successfully.`);
          goTo('/');
        } else {
          throw new Error('Failed to store user profile');
        }
      }
      
    } catch (error) {
      console.error('❌ Error in sign up handler:', error);
      setPreFilledEmail(email);
      setTimeout(() => {
        alert(`🎊 Welcome ${userData.name}! Please sign in to continue.`);
        setShowAuthForm('signin');
      }, 100);
    }
  };

  const handleSignOut = async () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      try {
        console.log('👋 Signing out user:', currentUser?.email);
        await signOut(auth);
        setIsAuthenticated(false);
        setCurrentUser(null);
        setNewOrdersCount(0);
        setViewedOrders(new Set());
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
    console.log('📍 Navigating to:', section);
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
    return location.pathname.startsWith('/product/') || location.pathname === '/all-products';
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
          <div className="profile-update-success-icon">
            ✓
          </div>
          <div className="profile-update-success-text">
            Profile updated successfully! Data saved to Firebase.
          </div>
        </div>
      </div>
    );
  };

  const showRSS = location.pathname === '/' && !showAuthForm;

  // Show loading spinner while checking authentication
  if (authLoading) {
    console.log('⏳ Showing auth loading state');
    return (
      <div className="App loading">
        <div className="d-flex justify-content-center align-items-center vh-100">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <div className="ms-3">Loading user data from Firebase...</div>
        </div>
      </div>
    );
  }

  console.log('🏠 Rendering App with state:', {
    isAuthenticated,
    currentUser: currentUser ? {
      name: currentUser.name,
      email: currentUser.email,
      country: currentUser.country,
      state: currentUser.state,
      city: currentUser.city,
      pincode: currentUser.pincode,
      hasData: !!currentUser.phone || !!currentUser.country || !!currentUser.state
    } : null,
    showAuthForm,
    path: location.pathname
  });

  return (
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

      {/* === ALL PAGE CONTENT WRAPPED IN .page-content === */}
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
            <Route path="/service-detail/:id" element={<ServiceDetailPage />} />
            
            {/* Blog Pages */}
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:id" element={<BlogPost />} />
            
            {/* Transport Page */}
            <Route path="/transport" element={<TransportPageComponent />} />
            
            {/* Other Pages */}
            <Route path="/join-us" element={<JoinUsPage />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/terms-policy" element={<TermsPolicyPage />} />

            {/* Product Pages - FIXED: Removed duplicate props */}
            <Route
              path="/product/:type"
              element={
                <ProductPage 
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
                <AllProducts
                  onProductClick={handleServiceClick}
                  onNavigate={handleNavbarNavigation}
                />
              }
            />
            
            {/* ADMIN PANEL ROUTES */}
            <Route path="/admin" element={<AdminLayout/>}>
              <Route index element={<Dashboard/>} />
              <Route path="users" element={<Users/>} />
              <Route path="products" element={<Products/>} />
              <Route path="orders" element={<Orders/>} />
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