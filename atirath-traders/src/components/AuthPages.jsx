// AuthPage.jsx
import React, { useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile,
  signOut
} from 'firebase/auth';
import { storeUserOrVendorProfile, auth, getUserProfile, updateLastLogin, checkIsAdmin } from '../firebase';

// Import ForgotPassword component
import ForgotPassword from './ForgotPassword';

const SignIn = ({ onNavigate, onSignIn, onClose, preFilledEmail = '' }) => {
  const [formData, setFormData] = useState({
    email: preFilledEmail,
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [signInSuccess, setSignInSuccess] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const user = userCredential.user;
      console.log('🔵 User authenticated:', user.uid);
      setDebugInfo(`User authenticated: ${user.uid}`);
      
      // Check if user is admin (from admin node in Realtime Database)
      console.log('🔄 Checking if user is admin...');
      const isAdmin = await checkIsAdmin(user.uid, user.email);
      
      if (isAdmin) {
        console.log('👑 Admin user detected, redirecting to admin panel...');
        setDebugInfo('Admin user detected, redirecting to admin panel');
        
        setSignInSuccess(true);
        
        // Create minimal admin data
        const adminData = {
          uid: user.uid,
          name: 'Admin',
          email: user.email,
          userType: 'admin'
        };
        
        // Call onSignIn to update parent state
        onSignIn(adminData);
        
        setTimeout(() => {
          window.location.href = "/admin";
        }, 1500);
        
        return;
      }
      
      // Fetch user profile from Firebase for regular users/vendors
      console.log('🔄 Fetching user profile from Firebase...');
      const userDB = await getUserProfile(user.uid);
      
      if (userDB) {
        console.log('📊 User data from Firebase:', userDB);
        console.log('🔍 User Type:', userDB.userType);
        
        if (userDB.userType === 'vendor') {
          console.log('- GST No:', userDB.gstNo);
          console.log('- Vendor Status:', userDB.vendorStatus);
          console.log('- Vendor Approved:', userDB.vendorApproved);
        }
        
        setDebugInfo(`User type: ${userDB.userType || 'user'}`);
      } else {
        console.log('❌ No user data found in Firebase');
        setDebugInfo('No user data found in Firebase database');
      }

      const userData = {
        uid: user.uid,
        name: userDB?.name || user.displayName || "User",
        email: user.email,
        phone: userDB?.phone || "",
        countryCode: userDB?.countryCode || "+91",
        country: userDB?.country || "",
        state: userDB?.state || "",
        city: userDB?.city || "",
        pincode: userDB?.pincode || "",
        location: userDB?.location || "",
        photoURL: userDB?.photoURL || "",
        createdAt: userDB?.createdAt || new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        userKey: userDB?.userKey || '',
        userNumber: userDB?.userNumber || null,
        accountStatus: userDB?.accountStatus || 'active',
        emailVerified: userDB?.emailVerified || false,
        phoneVerified: userDB?.phoneVerified || false,
        orderCount: userDB?.orderCount || 0,
        totalSpent: userDB?.totalSpent || 0,
        userType: userDB?.userType || 'user',
        // Vendor specific fields
        ...(userDB?.userType === 'vendor' && {
          gstNo: userDB?.gstNo || '',
          registeredBy: userDB?.registeredBy || '',
          vendorStatus: userDB?.vendorStatus || 'active',
          vendorApproved: userDB?.vendorApproved || true,
          vendorKey: userDB?.vendorKey || '',
          vendorNumber: userDB?.vendorNumber || null
        })
      };

      console.log('✅ Final user data for app:');
      console.log('- User Type:', userData.userType);
      
      if (userData.userType === 'vendor') {
        console.log('- Vendor Status:', userData.vendorStatus);
        console.log('- Vendor Approved:', userData.vendorApproved);
      }
      
      // Update last login timestamp
      await updateLastLogin(user.uid);

      setSignInSuccess(true);
      
      // Call onSignIn immediately to update parent state
      onSignIn(userData);
      
      setTimeout(() => {
        onClose();
      }, 1500);

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
              <button 
                className="back-button btn btn-link p-0 text-decoration-none" 
                onClick={handleBackFromForgotPassword} 
                title="Back to Sign In"
                type="button"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="auth-logo-center">
                <div className="auth-logo">
                  <img src="/img/icon2.png" alt="ATIRATH GROUP Logo" className="logo-img" />
                </div>
              </div>
              <div style={{ width: '40px' }}></div>
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
              <div className="auth-logo-center">
                <div className="auth-logo">
                  <img src="/img/icon2.png" alt="ATIRATH GROUP Logo" className="logo-img" />
                </div>
              </div>
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
        
        /* Fix for text visibility in inputs */
        .form-control.search-bar-transparent,
        .form-control.search-bar-transparent:focus,
        .form-control.search-bar-transparent:hover {
          color: white !important;
          background: rgba(255, 255, 255, 0.08) !important;
          border: 1px solid rgba(143, 179, 226, 0.3) !important;
        }
        
        /* Placeholder color */
        .form-control.search-bar-transparent::placeholder {
          color: rgba(255, 255, 255, 0.6) !important;
          opacity: 1;
        }
        
        /* For autofill background */
        .form-control.search-bar-transparent:-webkit-autofill,
        .form-control.search-bar-transparent:-webkit-autofill:hover,
        .form-control.search-bar-transparent:-webkit-autofill:focus {
          -webkit-text-fill-color: white !important;
          -webkit-box-shadow: 0 0 0px 1000px rgba(255, 255, 255, 0.08) inset !important;
          transition: background-color 5000s ease-in-out 0s;
        }
        
        /* For text input types */
        input[type="text"].search-bar-transparent,
        input[type="email"].search-bar-transparent,
        input[type="password"].search-bar-transparent,
        input[type="tel"].search-bar-transparent {
          color: white !important;
        }
        
        /* For select elements */
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
            <button className="back-button btn btn-link p-0 text-decoration-none" onClick={onClose} title="Close" type="button">
              <X className="w-6 h-6" />
            </button>
            <div className="auth-logo-center">
              <div className="auth-logo">
                <img src="/img/icon2.png" alt="ATIRATH GROUP Logo" className="logo-img" />
              </div>
            </div>
            <div style={{ width: '40px' }}></div>
          </div>
          
          <div className="auth-form-content">
            <h2 className="auth-form-title">Sign In</h2>
            
            <form onSubmit={handleSubmit}>
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

// SignUp component remains exactly the same as before
const SignUp = ({ onNavigate, onSignUp, onClose }) => {
  const [userType, setUserType] = useState('user');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    countryCode: '+91',
    phone: '',
    country: '',
    state: '',
    city: '',
    pincode: '',
    password: '',
    confirmPassword: '',
    gstNo: '',
    registeredBy: '', // Empty by default - user must select
    executives: [
      'Varsha',
      'Rakesh', 
      'B.Srikanth Goud',
      'D.Sunil Goud',
      'M.Raju',
      'Praveen Rathod',
      'M.Nikhil'
    ]
  });
  const [loading, setLoading] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Country data with codes and validation patterns
  const countries = [
    { name: 'India', code: '+91', flag: '🇮🇳', pattern: /^[6-9]\d{9}$/, placeholder: '9876543210' },
    { name: 'Oman', code: '+968', flag: '🇴🇲', pattern: /^[9]\d{7}$/, placeholder: '9XXXXXXX' },
    { name: 'United Kingdom', code: '+44', flag: '🇬🇧', pattern: /^[1-9]\d{9,10}$/, placeholder: '20XXXXXXXXX' },
    { name: 'United States', code: '+1', flag: '🇺🇸', pattern: /^\d{10}$/, placeholder: '1234567890' },
    { name: 'UAE', code: '+971', flag: '🇦🇪', pattern: /^[5]\d{8}$/, placeholder: '5XXXXXXXX' },
    { name: 'Australia', code: '+61', flag: '🇦🇺', pattern: /^[4]\d{8}$/, placeholder: '4XXXXXXXX' },
    { name: 'Canada', code: '+1', flag: '🇨🇦', pattern: /^\d{10}$/, placeholder: '1234567890' },
    { name: 'Germany', code: '+49', flag: '🇩🇪', pattern: /^\d{10,11}$/, placeholder: 'XXXXXXXXXX' },
    { name: 'France', code: '+33', flag: '🇫🇷', pattern: /^\d{9}$/, placeholder: 'XXXXXXXXX' },
    { name: 'Singapore', code: '+65', flag: '🇸🇬', pattern: /^\d{8}$/, placeholder: 'XXXXXXXX' },
    { name: 'Japan', code: '+81', flag: '🇯🇵', pattern: /^\d{9,10}$/, placeholder: 'XXXXXXXXX' },
    { name: 'China', code: '+86', flag: '🇨🇳', pattern: /^\d{11}$/, placeholder: 'XXXXXXXXXXX' }
  ];

  // Strong password regex
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

  const validatePassword = (pwd) => {
    const isValid = strongPasswordRegex.test(pwd);
    setPasswordValid(isValid);
    return isValid;
  };

  const validatePhone = () => {
    const selectedCountry = countries.find(c => c.code === formData.countryCode);
    if (!selectedCountry || !formData.phone) return false;
    return selectedCountry.pattern.test(formData.phone);
  };

  const validateGST = () => {
    if (userType !== 'vendor') return true;
    // Basic GST validation for India
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstRegex.test(formData.gstNo.toUpperCase());
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      const selectedCountry = countries.find(c => c.code === formData.countryCode);
      let numericValue = value.replace(/\D/g, '');
      
      if (selectedCountry) {
        if (selectedCountry.code === '+91') numericValue = numericValue.slice(0, 10);
        else if (selectedCountry.code === '+968') numericValue = numericValue.slice(0, 8);
        else if (selectedCountry.code === '+44') numericValue = numericValue.slice(0, 11);
        else if (selectedCountry.code === '+1') numericValue = numericValue.slice(0, 10);
        else if (selectedCountry.code === '+971') numericValue = numericValue.slice(0, 9);
        else if (selectedCountry.code === '+61') numericValue = numericValue.slice(0, 9);
        else numericValue = numericValue.slice(0, 15);
      }
      
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
    } else if (name === 'countryCode') {
      const selectedCountry = countries.find(c => c.code === value);
      setFormData(prev => ({
        ...prev,
        countryCode: value,
        // Don't auto-set country name anymore - user will type it
        phone: ''
      }));
    } else if (name === 'gstNo') {
      setFormData(prev => ({
        ...prev,
        [name]: value.toUpperCase()
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    if (name === 'password') {
      validatePassword(value);
    }
  };

  const handleUserTypeChange = (type) => {
    setUserType(type);
    if (type === 'user') {
      setFormData(prev => ({
        ...prev,
        gstNo: '',
        registeredBy: '' // Clear registeredBy when switching to user
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setDebugInfo(`Starting ${userType} signup process...`);
    console.log(`🚀 ${userType} SignUp form submitted`);

    // Log all form data
    console.log('📝 Form Data at submit:');
    console.log('- User Type:', userType);
    console.log('- Name:', formData.name);
    console.log('- Email:', formData.email);
    console.log('- Country Code:', formData.countryCode);
    console.log('- Phone:', formData.phone);
    console.log('- Country:', formData.country);
    console.log('- State:', formData.state);
    console.log('- City:', formData.city);
    console.log('- Pincode:', formData.pincode);
    
    if (userType === 'vendor') {
      console.log('- GST No:', formData.gstNo);
      console.log('- Registered By:', formData.registeredBy);
    }

    // Validate phone number
    if (!validatePhone()) {
      const selectedCountry = countries.find(c => c.code === formData.countryCode);
      alert(`Please enter a valid phone number for ${selectedCountry.name}. Example: ${selectedCountry.placeholder}`);
      return;
    }

    // Validate GST for vendors
    if (userType === 'vendor' && !validateGST()) {
      alert('Please enter a valid GST number (15 characters, format: 22AAAAA0000A1Z5).');
      return;
    }

    // Validate pincode
    if (!formData.pincode || !/^\d{4,10}$/.test(formData.pincode)) {
      alert('Please enter a valid pincode (4-10 digits).');
      return;
    }

    // Validate password strength
    if (!validatePassword(formData.password)) {
      alert('Password must contain: 8+ characters, uppercase, lowercase, number & special character (!@#$%^&*)');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    // Validate all required fields
    if (!formData.name.trim()) {
      alert('Please enter your full name');
      return;
    }
    if (!formData.email.trim()) {
      alert('Please enter your email address');
      return;
    }
    if (!formData.country.trim()) {
      alert('Please enter your country');
      return;
    }
    if (!formData.state.trim()) {
      alert('Please enter your state/province');
      return;
    }
    if (!formData.city.trim()) {
      alert('Please enter your city/town');
      return;
    }

    // Additional validation for vendors
    if (userType === 'vendor') {
      if (!formData.gstNo.trim()) {
        alert('Please enter GST number for vendor registration');
        return;
      }
      if (!formData.registeredBy) {
        alert('Please select the executive who registered you');
        return;
      }
    }

    setLoading(true);

    try {
      // 1. Create user in Firebase Authentication
      console.log(`🔐 Creating ${userType} in Firebase Auth...`);
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      const user = userCredential.user;

      console.log(`✅ ${userType} created in Auth:`, user.uid);

      // 2. Update user profile in Auth
      await updateProfile(user, { 
        displayName: formData.name 
      });

      // 3. Prepare complete user data for Realtime Database
      const fullPhoneNumber = formData.countryCode + formData.phone;
      const location = `${formData.city}, ${formData.state}, ${formData.country}`;
      
      const userData = {
        uid: user.uid,
        name: formData.name,
        email: formData.email,
        phone: fullPhoneNumber,
        countryCode: formData.countryCode,
        country: formData.country,
        state: formData.state,
        city: formData.city,
        pincode: formData.pincode,
        location: location,
        photoURL: '',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        accountStatus: 'active',
        emailVerified: false,
        phoneVerified: false,
        orderCount: 0,
        totalSpent: 0,
        lastOrderDate: null,
        userType: userType,
        ...(userType === 'vendor' && {
          gstNo: formData.gstNo.toUpperCase(),
          registeredBy: formData.registeredBy,
          vendorStatus: 'active', // Changed from 'pending' to 'active'
          vendorApproved: true,    // Changed from false to true
          approvedAt: new Date().toISOString(),
          approvedBy: 'system'
        })
      };

      // 4. Store user/vendor profile in appropriate collection
      console.log('📤 Calling storeUserOrVendorProfile function...');
      const storeResult = await storeUserOrVendorProfile(userData);
      
      if (!storeResult.success) {
        console.error('❌ Failed to store user data:', storeResult.error);
        
        // Store minimal data in local storage as fallback
        localStorage.setItem('temp_user_data', JSON.stringify({
          uid: user.uid,
          name: formData.name,
          email: formData.email,
          phone: fullPhoneNumber,
          userType: userType
        }));
        
        setSignUpSuccess(true);
        setLoading(false);
        
        return;
      } else {
        console.log('✅ User data stored successfully:', storeResult);
        
        setSignUpSuccess(true);
        setLoading(false);
      }

      // 5. Sign out the user after signup
      console.log('🔒 Signing out user after signup...');
      await signOut(auth);
      console.log('✅ User signed out successfully');

    } catch (error) {
      console.error(`❌ ${userType} sign up error:`, error);
      setLoading(false);
      
      let errorMessage = 'Sign up failed. Please try again.';

      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please sign in instead.';
        onNavigate('signin', formData.email);
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use a stronger password.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection.';
      }

      alert(errorMessage);
    }
  };

  // Get selected country details
  const selectedCountry = countries.find(c => c.code === formData.countryCode);

  // Password criteria check
  const criteria = [
    { label: 'At least 8 characters', test: formData.password.length >= 8 },
    { label: 'One uppercase letter', test: /[A-Z]/.test(formData.password) },
    { label: 'One lowercase letter', test: /[a-z]/.test(formData.password) },
    { label: 'One number', test: /\d/.test(formData.password) },
    { label: 'One special character (!@#$%^&*)', test: /[!@#$%^&*]/.test(formData.password) }
  ];

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Success state
  if (signUpSuccess) {
    return (
      <div className="auth-form-with-video">
        <div className="auth-video-background">
          <video autoPlay muted loop playsInline className="auth-background-video">
            <source src="/img/signup.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="auth-video-overlay"></div>
        </div>
        
        <div className="auth-form-container-transparent">
          <div className="auth-form-transparent">
            <div className="auth-form-header">
              <button 
                className="back-button btn btn-link p-0 text-decoration-none" 
                onClick={onClose}
                title="Close"
                type="button"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="auth-logo-center">
                <div className="auth-logo">
                  <img src="/img/icon2.png" alt="ATIRATH GROUP Logo" className="logo-img" />
                </div>
              </div>
              <div style={{ width: '40px' }}></div>
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
                
                <h3 className="text-white mb-3">{userType === 'vendor' ? 'Vendor Registration Successful!' : 'Account Created Successfully!'}</h3>
                <p className="text-white opacity-80 mb-4">
                  Your {userType === 'vendor' ? 'vendor' : 'account'} has been created successfully.
                  <br />
                  Please sign in with your email and password.
                </p>
                
                <div className="d-flex flex-column gap-3 mt-4">
                  <button
                    className="btn btn-primary-transparent"
                    onClick={() => {
                      onNavigate('signin', formData.email);
                    }}
                  >
                    <span className="me-2">👉</span>
                    Go to Sign In
                  </button>
                  
                  <button
                    className="btn btn-outline-light"
                    onClick={onClose}
                  >
                    Back to Home
                  </button>
                </div>
                
                <p className="text-white opacity-60 mt-4" style={{ fontSize: '0.8rem' }}>
                  Please sign in with your email: <strong>{formData.email}</strong>
                </p>
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
        
        /* Fix for text visibility in inputs - UPDATED */
        .form-control.search-bar-transparent,
        .form-control.search-bar-transparent:focus,
        .form-control.search-bar-transparent:hover {
          color: white !important;
          background: rgba(255, 255, 255, 0.08) !important;
          border: 1px solid rgba(143, 179, 226, 0.3) !important;
        }
        
        /* Placeholder color */
        .form-control.search-bar-transparent::placeholder {
          color: rgba(255, 255, 255, 0.6) !important;
          opacity: 1;
        }
        
        /* For autofill background */
        .form-control.search-bar-transparent:-webkit-autofill,
        .form-control.search-bar-transparent:-webkit-autofill:hover,
        .form-control.search-bar-transparent:-webkit-autofill:focus {
          -webkit-text-fill-color: white !important;
          -webkit-box-shadow: 0 0 0px 1000px rgba(255, 255, 255, 0.08) inset !important;
          transition: background-color 5000s ease-in-out 0s;
        }
        
        /* For all input types */
        input[type="text"].search-bar-transparent,
        input[type="email"].search-bar-transparent,
        input[type="password"].search-bar-transparent,
        input[type="tel"].search-bar-transparent,
        input[type="number"].search-bar-transparent {
          color: white !important;
        }
        
        /* For select elements */
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
        
        /* For GST number input specifically */
        input[name="gstNo"].search-bar-transparent {
          text-transform: uppercase;
          color: white !important;
        }
        
        /* For phone number input */
        input[name="phone"].search-bar-transparent {
          color: white !important;
        }
        
        /* For pincode input */
        input[name="pincode"].search-bar-transparent {
          color: white !important;
        }
        
        /* For name input */
        input[name="name"].search-bar-transparent {
          color: white !important;
        }
        
        /* For email input */
        input[name="email"].search-bar-transparent {
          color: white !important;
        }
        
        /* User Type Selection */
        .user-type-selector {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 25px;
          border: 1px solid rgba(143, 179, 226, 0.1);
        }
        
        .user-type-btn {
          flex: 1;
          padding: 20px 15px;
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }
        
        .user-type-btn:hover {
          background: rgba(143, 179, 226, 0.1);
          border-color: rgba(143, 179, 226, 0.3);
          transform: translateY(-2px);
        }
        
        .user-type-btn.active {
          background: rgba(143, 179, 226, 0.15);
          border-color: #8FB3E2;
          box-shadow: 0 4px 15px rgba(143, 179, 226, 0.2);
        }
        
        .user-type-btn.vendor.active {
          background: rgba(40, 167, 69, 0.15);
          border-color: #28a745;
          box-shadow: 0 4px 15px rgba(40, 167, 69, 0.2);
        }
        
        .user-type-icon {
          font-size: 2rem;
        }
        
        .user-type-text {
          font-size: 1rem;
          font-weight: 500;
        }
        
        /* Vendor specific fields */
        .vendor-field {
          background: rgba(40, 167, 69, 0.05);
          padding: 15px;
          border-radius: 8px;
          border-left: 3px solid #28a745;
          margin-bottom: 20px;
        }
        
        /* Password criteria */
        .password-criteria {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 15px;
          margin-top: 10px;
          margin-bottom: 15px;
        }
        
        .criteria-icon.valid {
          color: #28a745;
        }
        
        .criteria-icon.invalid {
          color: #dc3545;
        }
        
        .criteria-label.valid {
          color: #ccc;
        }
        
        .criteria-label.invalid {
          color: #aaa;
        }
        
        /* Vendor button */
        .btn-vendor {
          background: linear-gradient(135deg, #28a745, #20c997);
          border: none;
          color: white;
          border-radius: 8px;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        
        .btn-vendor:hover:not(:disabled) {
          background: linear-gradient(135deg, #218838, #1ba87e);
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
        }
        
        .btn-vendor:disabled {
          background: rgba(40, 167, 69, 0.3);
          color: rgba(255, 255, 255, 0.5);
          cursor: not-allowed;
        }
        
        /* Agreement text */
        .agreement-text {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.6);
          margin-top: 15px;
        }
        
        .agreement-text a {
          text-decoration: none;
          transition: color 0.2s;
          color: #8FB3E2;
        }
        
        .agreement-text a:hover {
          color: #7a9fd1;
          text-decoration: underline;
        }
        
        /* Phone input container */
        .phone-input-container {
          display: flex;
          gap: 10px;
          margin-bottom: 5px;
        }
        
        .country-code-selector {
          flex: 0 0 140px;
        }
        
        .country-code-select {
          min-width: 140px;
          appearance: none;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%238FB3E2' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 10px center;
          background-size: 16px;
          padding-right: 35px;
        }
        
        .phone-number-input {
          flex: 1;
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
          .phone-input-container {
            flex-direction: column;
            gap: 10px;
          }
          
          .country-code-selector {
            flex: 0 0 auto;
            width: 100%;
          }
          
          .country-code-select {
            width: 100%;
          }
          
          .user-type-btn {
            padding: 15px 10px;
          }
          
          .user-type-icon {
            font-size: 1.5rem;
          }
          
          .user-type-text {
            font-size: 0.9rem;
          }
        }
      `}</style>
      
      <div className="auth-video-background">
        <video autoPlay muted loop playsInline className="auth-background-video">
          <source src="/img/signup.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="auth-video-overlay"></div>
      </div>
      
      <div className="auth-form-container-transparent">
        <div className="auth-form-transparent signup-form-compact">
          <div className="auth-form-header">
            <button className="back-button btn btn-link p-0 text-decoration-none" onClick={onClose} title="Close" type="button">
              <X className="w-6 h-6" />
            </button>
            <div className="auth-logo-center">
              <div className="auth-logo">
                <img src="/img/icon2.png" alt="ATIRATH GROUP Logo" className="logo-img" />
              </div>
            </div>
            <div style={{ width: '40px' }}></div>
          </div>
          
          <div className="auth-form-content">
            <h2 className="auth-form-title signup-title">Sign Up</h2>
            <p className="text-white opacity-80 mb-4" style={{ fontSize: '0.9rem' }}>
              Fill in all fields to create your account. All data will be saved securely.
            </p>
            
            {/* User Type Selection */}
            <div className="user-type-selector">
              <div className="text-white mb-2" style={{ fontSize: '0.9rem', fontWeight: '500' }}>
                Select Account Type:
              </div>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className={`user-type-btn ${userType === 'user' ? 'active' : ''}`}
                  onClick={() => handleUserTypeChange('user')}
                >
                  <div className="user-type-icon">👤</div>
                  <div className="user-type-text">User</div>
                </button>
                <button
                  type="button"
                  className={`user-type-btn ${userType === 'vendor' ? 'active vendor' : ''}`}
                  onClick={() => handleUserTypeChange('vendor')}
                >
                  <div className="user-type-icon">🏢</div>
                  <div className="user-type-text">Vendor</div>
                </button>
              </div>
              <div className="text-sm opacity-80 mt-2">
                {userType === 'user' 
                  ? 'Register as a regular user to browse and purchase products.' 
                  : 'Register as a vendor to sell products through our platform.'}
              </div>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label fw-semibold">
                  {userType === 'vendor' ? 'Vendor/Business Name' : 'Full Name'} <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-control search-bar-transparent"
                  placeholder={userType === 'vendor' ? "Enter vendor/business name" : "Enter your full name"}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label fw-semibold">Email Address <span className="text-danger">*</span></label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-control search-bar-transparent"
                  placeholder="Enter your email"
                  required
                />
              </div>
              
              {/* Phone Number with Country Code */}
              <div className="form-group">
                <label className="form-label fw-semibold">Phone Number <span className="text-danger">*</span></label>
                <div className="phone-input-container">
                  <div className="country-code-selector">
                    <select
                      name="countryCode"
                      value={formData.countryCode}
                      onChange={handleChange}
                      className="form-control search-bar-transparent country-code-select"
                    >
                      {countries.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.flag} {country.name} ({country.code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="form-control search-bar-transparent phone-number-input"
                    placeholder={selectedCountry?.placeholder || "Phone number"}
                    required
                  />
                </div>
                <small className="text-sm opacity-80 d-block mt-1">
                  {selectedCountry ? `Valid ${selectedCountry.name} number format required. Example: ${selectedCountry.placeholder}` : 'Enter valid phone number'}
                </small>
              </div>
              
              {/* GST Number Field (Vendor only) */}
              {userType === 'vendor' && (
                <div className="vendor-field">
                  <label className="form-label fw-semibold">GST Number <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    name="gstNo"
                    value={formData.gstNo}
                    onChange={handleChange}
                    className="form-control search-bar-transparent"
                    placeholder="Enter GST Number (15 characters)"
                    required
                    style={{ textTransform: 'uppercase' }}
                  />
                  <small className="text-sm opacity-80 d-block mt-1">
                    Format: 22AAAAA0000A1Z5 (15 characters, alphanumeric)
                  </small>
                </div>
              )}
              
              {/* Country Selection - UPDATED: Changed from dropdown to text input */}
              <div className="form-group">
                <label className="form-label fw-semibold">Country <span className="text-danger">*</span></label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="form-control search-bar-transparent"
                  placeholder="Enter your country (e.g., India, USA, UAE)"
                  required
                />
                <small className="text-sm opacity-80 d-block mt-1">
                  Enter your country name (e.g., India, United States, UAE)
                </small>
              </div>
              
              {/* State */}
              <div className="form-group">
                <label className="form-label fw-semibold">State/Province <span className="text-danger">*</span></label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="form-control search-bar-transparent"
                  placeholder="Enter your state or province"
                  required
                />
              </div>
              
              {/* City */}
              <div className="form-group">
                <label className="form-label fw-semibold">City/Town <span className="text-danger">*</span></label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="form-control search-bar-transparent"
                  placeholder="Enter your city or town"
                  required
                />
              </div>
              
              {/* Pincode */}
              <div className="form-group">
                <label className="form-label fw-semibold">Pincode/ZIP Code <span className="text-danger">*</span></label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  className="form-control search-bar-transparent"
                  placeholder="Enter your pincode or ZIP code"
                  required
                />
                <small className="text-sm opacity-80 d-block mt-1">
                  Must be 4-10 digits.
                </small>
              </div>
              
              {/* Registered By Field (Vendor only) */}
              {userType === 'vendor' && (
                <div className="vendor-field">
                  <label className="form-label fw-semibold">Registered By Executive <span className="text-danger">*</span></label>
                  <select
                    name="registeredBy"
                    value={formData.registeredBy}
                    onChange={handleChange}
                    className="form-control search-bar-transparent"
                    required
                  >
                    <option value="">Select Executive</option>
                    {formData.executives.map((executive) => (
                      <option key={executive} value={executive.toLowerCase()}>
                        {executive}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="form-group">
                <label className="form-label fw-semibold">Password <span className="text-danger">*</span></label>
                <div className="password-input-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="form-control search-bar-transparent"
                    placeholder="Create a strong password"
                    required
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

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="password-criteria">
                  <div className="mb-2 text-white" style={{ fontSize: '0.75rem' }}>Password Requirements:</div>
                  {criteria.map((c, i) => (
                    <div key={i} className="d-flex align-items-center gap-2 mb-1">
                      <span className={`criteria-icon ${c.test ? 'valid' : 'invalid'}`}>
                        {c.test ? '✓' : '✗'}
                      </span>
                      <span className={`criteria-label ${c.test ? 'valid' : 'invalid'}`}>{c.label}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="form-group">
                <label className="form-label fw-semibold">Confirm Password <span className="text-danger">*</span></label>
                <div className="password-input-container">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="form-control search-bar-transparent"
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={toggleConfirmPasswordVisibility}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <div className="auth-links-container">
                <div>
                  <span className="text-sm opacity-80">Already have an account? </span>
                  <button className="btn btn-link accent p-0 text-decoration-none" onClick={() => onNavigate('signin')} type="button">
                    Sign In
                  </button>
                </div>
              </div>
              
              <button
                type="submit"
                className={`btn w-100 py-3 fw-semibold mt-3 ${userType === 'vendor' ? 'btn-vendor' : 'btn-primary-transparent'}`}
                disabled={loading || !passwordValid || formData.password !== formData.confirmPassword || !validatePhone() || !formData.name || !formData.email || !formData.state || !formData.city || !formData.pincode || !formData.country || (userType === 'vendor' && (!formData.gstNo || !validateGST() || !formData.registeredBy))}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    {userType === 'vendor' ? 'Registering Vendor...' : 'Creating Account...'}
                  </>
                ) : (
                  userType === 'vendor' ? 'Register as Vendor' : 'Sign Up'
                )}
              </button>
              
              <div className="mt-3 text-center agreement-text">
                By signing up, you agree to our <a href="/terms-policy" target="_blank" className="text-accent">Terms & Conditions</a> and <a href="/terms-policy" target="_blank" className="text-accent">Privacy Policy</a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export { SignIn, SignUp };