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
import JoinUs from './components/JoinUs';
import TermsPolicy from './components/TermsPolicy';
import TransportPage from './components/TransportPage';
import { SignIn, SignUp } from './components/AuthPages';
import IndianAgriRSSFeed from './components/IndianAgriRSSFeed';
import {
  auth,
  database,
  ref,
  update,
  onAuthStateChanged,
  signOut,
  getUserProfile,
  updateUserProfile,
  updateLastLogin,
  checkUserExists,
  submitQuote,
  get
} from './firebase';

/* --------------------------------------------------------------------
   Dedicated page components - NO CHANGES NEEDED
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
   Router Wrapper - UPDATED WITH SUCCESS FLOW
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

  /* ---------- auth ---------- */
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuthForm, setShowAuthForm] = useState(null);
  const [preFilledEmail, setPreFilledEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showProfileUpdateSuccess, setShowProfileUpdateSuccess] = useState(false);
  
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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsLoading(true);
      
      if (user) {
        setIsAuthenticated(true);
        
        try {
          // Get user data from Realtime Database to include phone number and location
          let userData = await getUserProfile(user.uid);
          
          // If user doesn't exist in database yet, create basic profile
          if (!userData) {
            console.log('User not found in database, creating basic profile...');
            userData = {
              uid: user.uid,
              name: user.displayName || 'User',
              email: user.email,
              phone: '',
              location: '',
              photoURL: '',
              createdAt: user.metadata.creationTime || new Date().toISOString(),
              lastLogin: new Date().toISOString()
            };
            
            // Store the new user profile in database
            await update(ref(database, 'users/' + user.uid), userData);
          } else {
            // Ensure uid is included
            userData.uid = user.uid;
          }
          
          // Update last login
          await updateLastLogin(user.uid);
          
          // Set current user with all data
          setCurrentUser({
            uid: user.uid,
            name: userData.name || user.displayName || 'User',
            email: user.email,
            phone: userData.phone || '',
            location: userData.location || '',
            photoURL: userData.photoURL || '',
            createdAt: userData.createdAt || user.metadata.creationTime || new Date().toISOString(),
            lastLogin: userData.lastLogin || new Date().toISOString()
          });
          
          console.log('User authenticated with phone:', {
            uid: user.uid,
            name: userData.name,
            email: user.email,
            phone: userData.phone,
            hasPhoto: !!userData.photoURL
          });
          
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Fallback to basic user data
          setCurrentUser({
            uid: user.uid,
            name: user.displayName || 'User',
            email: user.email,
            phone: '',
            location: '',
            photoURL: '',
            createdAt: user.metadata.creationTime || new Date().toISOString(),
            lastLogin: new Date().toISOString()
          });
        }
      } else {
        setIsAuthenticated(false);
        setCurrentUser(null);
        setNewOrdersCount(0);
        setViewedOrders(new Set());
      }
      
      setIsLoading(false);
    });
    
    return unsubscribe;
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
        
        // Filter orders by user ID or email
        Object.keys(allOrders).forEach(key => {
          const order = allOrders[key];
          if (order.userId === userId || order.email === email) {
            userOrders.push({
              id: key,
              ...order
            });
          }
        });
        
        // Count new orders (not viewed yet)
        const newOrders = userOrders.filter(order => !viewedOrders.has(order.id));
        setNewOrdersCount(newOrders.length);
        
        console.log('Total user orders:', userOrders.length);
        console.log('New orders count:', newOrders.length);
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
      
      // Set up interval to check for new orders every 30 seconds
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
    
    // Update new orders count immediately
    setNewOrdersCount(prev => Math.max(0, prev - orderIds.length));
  };

  /* ---------- Handle new order submitted ---------- */
  const handleNewOrderSubmitted = () => {
    if (currentUser) {
      // Refresh orders count when new order is submitted
      setTimeout(() => {
        fetchUserOrdersCount(currentUser.uid, currentUser.email);
      }, 2000); // Wait 2 seconds for Firebase to update
    }
  };

  /* ---------- Profile Update Handler ---------- */
  const handleProfileUpdate = async (updatedUserData) => {
    if (!currentUser || !currentUser.uid) {
      console.error('No user or UID found');
      return false;
    }

    try {
      console.log('Updating profile for user:', currentUser.uid, updatedUserData);
      
      // Update Firebase user profile
      const updatedData = await updateUserProfile(currentUser.uid, updatedUserData);
      
      // Update local state with the response from Firebase
      setCurrentUser(prev => ({
        ...prev,
        ...updatedData,
        uid: prev.uid
      }));
      
      // Show success message
      setShowProfileUpdateSuccess(true);
      setTimeout(() => setShowProfileUpdateSuccess(false), 3000);
      
      console.log('Profile updated successfully:', {
        name: updatedData.name,
        phone: updatedData.phone,
        hasPhoto: !!updatedData.photoURL
      });
      
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
      throw error;
    }
  };

  /* ---------- navigation helpers ---------- */
  const goTo = (path) => navigate(path);
  const goToProduct = (type) => goTo(`/product/${type}`);
  const goToAllProducts = () => goTo('/all-products');
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

  const handleServiceClick = (type) => goToProduct(type);
  const handleViewAllClick = () => goToAllProducts();
  const handleServiceDetailClick = (id) => goToServiceDetail(id);

  /* ---------- Global search handlers ---------- */
  const handleGlobalSearchChange = (query) => {
    setGlobalSearchQuery(query);
  };

  const handleGlobalSearchClear = () => {
    setGlobalSearchQuery('');
  };

  /* ---------- auth handlers ---------- */
  const openAuth = (type = 'signin', email = '') => {
    setShowAuthForm(type);
    if (email) {
      setPreFilledEmail(email);
    }
  };
  
  const closeAuth = () => {
    setShowAuthForm(null);
    setPreFilledEmail('');
  };

  const handleSignIn = async (userData) => {
    try {
      // Get fresh data from Firebase including phone number
      const freshUserData = await getUserProfile(userData.uid);
      
      setIsAuthenticated(true);
      setCurrentUser({
        uid: userData.uid,
        name: freshUserData?.name || userData.name,
        email: userData.email,
        phone: freshUserData?.phone || userData.phone || '',
        location: freshUserData?.location || userData.location || '',
        photoURL: freshUserData?.photoURL || userData.photoURL || '',
        createdAt: freshUserData?.createdAt || userData.createdAt,
        lastLogin: new Date().toISOString()
      });
      
      closeAuth();
      
      // Show success alert
      alert(`🎉 Welcome back, ${userData.name}!`);
      goTo('/');
      
    } catch (error) {
      console.error('Error in sign in handler:', error);
    }
  };

  const handleSignUp = async (userData, email) => {
    try {
      // Don't sign in automatically after sign up
      // Just store the data and redirect to sign in
      setPreFilledEmail(email);
      
      // Show success message and redirect to sign in
      setTimeout(() => {
        openAuth('signin', email);
      }, 100);
      
    } catch (error) {
      console.error('Error in sign up handler:', error);
      // Fallback to original behavior
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
        await signOut(auth);
        setIsAuthenticated(false);
        setCurrentUser(null);
        setNewOrdersCount(0);
        setViewedOrders(new Set());
        alert('Signed out successfully.');
        goTo('/');
      } catch (e) {
        console.error(e);
        alert('Sign-out error. Please try again.');
      }
    }
  };

  /* ---------- Navbar navigation handler ---------- */
  const handleNavbarNavigation = (section) => {
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

  /* ---------- auth overlay ---------- */
  const renderAuthOverlay = () => {
    if (!showAuthForm) return null;
    return (
      <div className="auth-overlay-video">
        {showAuthForm === 'signin' ? (
          <SignIn
            onNavigate={(type, email) => {
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
  if (isLoading) {
    return (
      <div className="App loading">
        <div className="d-flex justify-content-center align-items-center vh-100">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

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

            {/* Product Pages */}
            <Route
              path="/product/:type"
              element={
                <ProductPage 
                  fromAllProducts={true}
                  globalSearchQuery={globalSearchQuery}
                  onGlobalSearchClear={handleGlobalSearchClear}
                  isAuthenticated={isAuthenticated}
                  profile={currentUser}
                  onOrderSubmitted={handleNewOrderSubmitted}
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
  return (
    <BrowserRouter>
      <RouterWrapper />
    </BrowserRouter>
  );
}

export default App;