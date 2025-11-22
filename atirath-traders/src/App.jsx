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
import { SignIn, SignUp } from './components/AuthPages';
import IndianAgriRSSFeed from './components/IndianAgriRSSFeed';
import {
  auth,
  database,
  ref,
  update,
  onAuthStateChanged,
  signOut,
} from './firebase';

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

  /* ---------- auth ---------- */
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuthForm, setShowAuthForm] = useState(null);
  const [preFilledEmail, setPreFilledEmail] = useState('');

  /* ---------- AOS ---------- */
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  /* ---------- Firebase auth listener ---------- */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthenticated(true);
        setCurrentUser({
          uid: user.uid,
          name: user.displayName || 'User',
          email: user.email,
          phone: user.phoneNumber || '',
          location: '',
          photoURL: user.photoURL || '', // Add photoURL
          createdAt: user.metadata.creationTime || new Date().toISOString(),
        });
        try {
          await update(ref(database, `users/${user.uid}`), {
            lastLogin: new Date().toISOString(),
          });
        } catch (e) {
          console.error('last-login update error', e);
        }
      } else {
        setIsAuthenticated(false);
        setCurrentUser(null);
      }
    });
    return unsubscribe;
  }, []);

  /* ---------- Profile Update Handler ---------- */
  const handleProfileUpdate = async (updatedUserData) => {
    if (!currentUser) return;

    try {
      // Update Firebase user profile
      await update(ref(database, `users/${currentUser.uid}`), {
        name: updatedUserData.name,
        email: updatedUserData.email,
        phone: updatedUserData.phone,
        location: updatedUserData.location,
        photoURL: updatedUserData.photoURL, // Add photoURL
        updatedAt: new Date().toISOString(),
      });

      // Update local state
      setCurrentUser(prev => ({
        ...prev,
        ...updatedUserData
      }));

      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
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
  const goToProfile = () => {
    // Profile is now handled in navbar dropdown
    console.log('Profile navigation handled in navbar dropdown');
  };

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
  const openAuth = (type = 'signin') => setShowAuthForm(type);
  const closeAuth = () => {
    setShowAuthForm(null);
    setPreFilledEmail('');
  };

  const handleSignIn = (user) => {
    setIsAuthenticated(true);
    setCurrentUser({
      ...user,
      createdAt: user.createdAt || new Date().toISOString(),
    });
    closeAuth();
    setTimeout(() => {
      alert(`🎉 Welcome back, ${user.name}!`);
      goTo('/');
    }, 100);
  };

  const handleSignUp = (user, email) => {
    setPreFilledEmail(email);
    setTimeout(() => {
      alert(`🎊 Welcome ${user.name}! Please sign in to continue.`);
      setShowAuthForm('signin');
    }, 100);
  };

  const handleSignOut = async () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      try {
        await signOut(auth);
        setIsAuthenticated(false);
        setCurrentUser(null);
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
        // Profile is now handled in dropdown, just close menus
        console.log('Profile handled in navbar dropdown');
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
            onNavigate={setShowAuthForm}
            onSignIn={handleSignIn}
            onClose={closeAuth}
            preFilledEmail={preFilledEmail}
          />
        ) : (
          <SignUp
            onNavigate={setShowAuthForm}
            onSignUp={handleSignUp}
            onClose={closeAuth}
          />
        )}
      </div>
    );
  };

  const showRSS = location.pathname === '/' && !showAuthForm;

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
      />

      {showRSS && <IndianAgriRSSFeed />}

      {renderAuthOverlay()}

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