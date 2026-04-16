// SignIn.jsx - Always Fresh Form (No Saved Credentials)
import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { 
  signInWithEmailAndPassword, 
  updateProfile,
  signOut
} from 'firebase/auth';
import { auth, getUserProfile, updateLastLogin, checkIsAdmin, getUserProfileByEmail } from '../firebase';
import ForgotPassword from './ForgotPassword';

const SignIn = ({ onNavigate, onSignIn, onClose, preFilledEmail = '', key }) => {
  // ALWAYS start with empty form - ignore any preFilledEmail
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [signInSuccess, setSignInSuccess] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Reset form to empty whenever component mounts or key changes
  useEffect(() => {
    // Force empty fields - no saved data, no pre-filled email
    setFormData({
      email: '',
      password: ''
    });
    setLoading(false);
    setSignInSuccess(false);
    setShowForgotPassword(false);
    setDebugInfo('');
    setShowPassword(false);
  }, [key]); // Only depend on key, ignore preFilledEmail

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setDebugInfo('Starting sign in process...');

    try {
      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const user = userCredential.user;
      console.log('🔵 User authenticated:', user.uid);
      setDebugInfo(`User authenticated: ${user.uid}`);
      
      // Check if user is admin
      const isAdmin = await checkIsAdmin(user.uid, user.email);
      
      if (isAdmin) {
        setDebugInfo('Admin user detected, redirecting to admin panel');
        setSignInSuccess(true);
        
        const adminData = {
          uid: user.uid,
          name: 'Admin',
          email: user.email,
          userType: 'admin'
        };
        
        onSignIn(adminData);
        
        setTimeout(() => {
          window.location.href = "/admin";
        }, 1500);
        
        return;
      }
      
      // IMPORTANT: Fetch user profile from Firebase Realtime Database
      console.log('🔄 Fetching user profile from Firebase...');
      
      // Try to get profile by UID first
      let userDB = await getUserProfile(user.uid);
      
      // If not found by UID, try by email
      if (!userDB) {
        console.log('⚠️ User not found by UID, trying by email...');
        userDB = await getUserProfileByEmail(user.email);
      }
      
      if (userDB) {
        console.log('📊 User data from Firebase:', userDB);
        setDebugInfo(`User type: ${userDB.userType || 'user'}`);
        
        // Build complete user data
        const userData = {
          uid: user.uid,
          name: userDB.name || user.displayName || formData.name || "User",
          email: user.email,
          phone: userDB.phone || "",
          countryCode: userDB.countryCode || "+91",
          country: userDB.country || "",
          state: userDB.state || "",
          city: userDB.city || "",
          pincode: userDB.pincode || "",
          location: userDB.location || "",
          photoURL: userDB.photoURL || "",
          createdAt: userDB.createdAt || new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          userKey: userDB.userKey || userDB.vendorKey || '',
          userNumber: userDB.userNumber || userDB.vendorNumber || null,
          accountStatus: userDB.accountStatus || 'active',
          emailVerified: userDB.emailVerified || false,
          phoneVerified: userDB.phoneVerified || false,
          orderCount: userDB.orderCount || 0,
          totalSpent: userDB.totalSpent || 0,
          userType: userDB.userType || 'user',
          // Vendor specific fields
          ...(userDB.userType === 'vendor' && {
            gstNo: userDB.gstNo || '',
            registeredBy: userDB.registeredBy || '',
            vendorStatus: userDB.vendorStatus || 'active',
            vendorApproved: userDB.vendorApproved || true,
            vendorKey: userDB.vendorKey || ''
          })
        };
        
        console.log('✅ Final user data:', userData);
        
        // Update last login timestamp
        await updateLastLogin(user.uid);
        
        setSignInSuccess(true);
        onSignIn(userData);
        
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        // If no profile exists in database, create a basic one
        console.log('⚠️ No user profile found in database, creating basic profile...');
        
        const basicUserData = {
          uid: user.uid,
          name: user.displayName || "User",
          email: user.email,
          phone: "",
          countryCode: "+91",
          country: "",
          state: "",
          city: "",
          pincode: "",
          location: "",
          photoURL: user.photoURL || "",
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          accountStatus: "active",
          emailVerified: user.emailVerified || false,
          phoneVerified: false,
          orderCount: 0,
          totalSpent: 0,
          userType: 'user'
        };
        
        setDebugInfo('No existing profile found, using basic profile');
        
        setSignInSuccess(true);
        onSignIn(basicUserData);
        
        setTimeout(() => {
          onClose();
        }, 1500);
      }

    } catch (err) {
      console.error("Firebase login failed:", err);
      setDebugInfo(`Login failed: ${err.code} - ${err.message}`);
      
      if (err.code === 'auth/user-not-found') {
        alert("No account found with this email. Please sign up first.");
      } else if (err.code === 'auth/wrong-password') {
        alert("Incorrect password. Please try again or use Forgot Password.");
      } else if (err.code === 'auth/too-many-requests') {
        alert("Too many failed attempts. Please try again later or reset your password.");
      } else {
        alert(`Login failed: ${err.message}`);
      }
      
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setShowForgotPassword(true);
  };

  const handleBackFromForgotPassword = () => {
    setShowForgotPassword(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Render Forgot Password component
  if (showForgotPassword) {
    return (
      <div className="auth-form-with-video">
        <div className="auth-video-background">
          <video autoPlay muted loop playsInline className="auth-background-video">
            <source src="/img/signin.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="auth-video-overlay"></div>
        </div>
        
        <div className="auth-form-container-transparent">
          <div className="auth-form-transparent">
            <div className="auth-form-header">
              <div style={{ width: '40px' }}></div>
              <div className="auth-logo-center">
                <div className="auth-logo">
                  <img src="/img/icon2.png" alt="ATIRATH GROUP Logo" className="logo-img" />
                </div>
              </div>
              <button 
                className="close-button btn btn-link p-0 text-decoration-none" 
                onClick={onClose} 
                title="Close"
                type="button"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="auth-form-content">
              <ForgotPassword 
                preFilledEmail={formData.email}
                onSuccess={() => {
                  alert('Password reset email sent! Please check your inbox.');
                  setShowForgotPassword(false);
                }}
                onBack={handleBackFromForgotPassword}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (signInSuccess) {
    return (
      <div className="auth-form-with-video">
        <div className="auth-video-background">
          <video autoPlay muted loop playsInline className="auth-background-video">
            <source src="/img/signin.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="auth-video-overlay"></div>
        </div>
        
        <div className="auth-form-container-transparent">
          <div className="auth-form-transparent">
            <div className="auth-form-header">
              <div style={{ width: '40px' }}></div>
              <div className="auth-logo-center">
                <div className="auth-logo">
                  <img src="/img/icon2.png" alt="ATIRATH GROUP Logo" className="logo-img" />
                </div>
              </div>
              <button 
                className="close-button btn btn-link p-0 text-decoration-none" 
                onClick={onClose} 
                title="Close"
                type="button"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="auth-form-content">
              <div className="text-center py-5">
                <div className="mb-4">
                  <div className="success-checkmark">
                    <div className="check-icon">
                      <span className="icon-line line-tip"></span>
                      <span className="icon-line line-long"></span>
                      <div className="icon-circle"></div>
                      <div className="icon-fix"></div>
                    </div>
                  </div>
                </div>
                <h3 className="text-white mb-3">Sign In Successful!</h3>
                <p className="text-white opacity-80">
                  Welcome back! Redirecting...
                </p>
                {debugInfo && (
                  <div className="debug-info mt-3 p-2 rounded" style={{ background: 'rgba(0,0,0,0.3)', fontSize: '0.8rem' }}>
                    <div className="text-white">Debug: {debugInfo}</div>
                  </div>
                )}
                <div className="spinner-border text-accent mt-4" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-form-with-video">
      <style>{`
        .password-input-container {
          position: relative;
        }
        
        .password-toggle-btn {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          background: transparent;
          border: none;
          color: #8FB3E2;
          cursor: pointer;
          padding: 5px;
          z-index: 10;
        }
        
        .password-toggle-btn:hover {
          color: #7a9fd1;
        }
        
        .form-control.search-bar-transparent {
          padding-right: 40px !important;
        }
        
        .form-control.search-bar-transparent,
        .form-control.search-bar-transparent:focus,
        .form-control.search-bar-transparent:hover {
          color: white !important;
          background: rgba(255, 255, 255, 0.08) !important;
          border: 1px solid rgba(143, 179, 226, 0.3) !important;
        }
        
        .form-control.search-bar-transparent::placeholder {
          color: rgba(255, 255, 255, 0.6) !important;
          opacity: 1;
        }
        
        .form-control.search-bar-transparent:-webkit-autofill,
        .form-control.search-bar-transparent:-webkit-autofill:hover,
        .form-control.search-bar-transparent:-webkit-autofill:focus {
          -webkit-text-fill-color: white !important;
          -webkit-box-shadow: 0 0 0px 1000px rgba(255, 255, 255, 0.08) inset !important;
          transition: background-color 5000s ease-in-out 0s;
        }
        
        input[type="text"].search-bar-transparent,
        input[type="email"].search-bar-transparent,
        input[type="password"].search-bar-transparent,
        input[type="tel"].search-bar-transparent {
          color: white !important;
        }
        
        select.search-bar-transparent {
          color: white !important;
          background: rgba(255, 255, 255, 0.08) !important;
          border: 1px solid rgba(143, 179, 226, 0.3) !important;
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
        }
        
        select.search-bar-transparent option {
          color: #333 !important;
          background: white !important;
        }
        
        .close-button {
          color: #8FB3E2 !important;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(143, 179, 226, 0.3);
        }
        
        .close-button:hover {
          color: white !important;
          background: rgba(143, 179, 226, 0.2);
          transform: scale(1.1);
          border-color: #8FB3E2;
        }
        
        .close-button .w-6.h-6 {
          width: 20px;
          height: 20px;
        }
        
        .auth-form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding: 0 5px;
        }
        
        .auth-logo-center {
          flex: 1;
          display: flex;
          justify-content: center;
        }
      `}</style>
      
      <div className="auth-video-background">
        <video autoPlay muted loop playsInline className="auth-background-video">
          <source src="/img/signin.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="auth-video-overlay"></div>
      </div>
      
      <div className="auth-form-container-transparent">
        <div className="auth-form-transparent">
          <div className="auth-form-header">
            <div style={{ width: '40px' }}></div>
            <div className="auth-logo-center">
              <div className="auth-logo">
                <img src="/img/icon2.png" alt="ATIRATH GROUP Logo" className="logo-img" />
              </div>
            </div>
            <button 
              className="close-button btn btn-link p-0 text-decoration-none" 
              onClick={onClose} 
              title="Close"
              type="button"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="auth-form-content">
            <h2 className="auth-form-title">Sign In</h2>
            
            <form onSubmit={handleSubmit} autoComplete="off">
              <div className="form-group">
                <label className="form-label fw-semibold">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-control search-bar-transparent"
                  placeholder="Enter your email"
                  required
                  autoComplete="off"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label fw-semibold">Password</label>
                <div className="password-input-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="form-control search-bar-transparent"
                    placeholder="Enter your password"
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <div className="auth-links-container">
                <div>
                  <span className="text-sm opacity-80">Don't have an account? </span>
                  <button type="button" className="btn btn-link accent p-0 text-decoration-none" onClick={() => onNavigate('signup')}>
                    Sign Up
                  </button>
                </div>
                <button type="button" className="btn btn-link p-0 text-decoration-none forgot-password-link" onClick={handleForgotPassword}>
                  Forgot Password?
                </button>
              </div>
              
              <button type="submit" className="btn btn-primary-transparent w-100 py-3 fw-semibold" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;