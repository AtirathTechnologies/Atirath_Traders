import React, { useState } from 'react';
import { X } from 'lucide-react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile,
  sendPasswordResetEmail 
} from 'firebase/auth';
import { storeUserProfile, auth, getUserProfile } from '../firebase';

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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const ADMIN_EMAIL = "admin@atirath.com"; 
  const ADMIN_PASSWORD = "Admin@123";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // 1️⃣ HARD-CODED ADMIN LOGIN
    if (formData.email === ADMIN_EMAIL && formData.password === ADMIN_PASSWORD) {
      console.log("Admin login: success");
      setSignInSuccess(true);
      setTimeout(() => {
        window.location.href = "/admin";
      }, 1500);
      return;
    }

    // 2️⃣ NORMAL USER LOGIN (FIREBASE)
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const user = userCredential.user;
      console.log('🔵 User authenticated:', user.uid);
      
      // Fetch user profile from Firebase
      const userDB = await getUserProfile(user.uid);
      
      console.log('📊 User data from Firebase:', userDB);

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
        totalSpent: userDB?.totalSpent || 0
      };

      console.log('✅ Final user data for app:', userData);
      
      // Update last login timestamp
      const { updateLastLogin } = await import('../firebase');
      await updateLastLogin(user.uid);

      setSignInSuccess(true);
      setTimeout(() => {
        onSignIn(userData);
        onClose();
      }, 1500);

    } catch (err) {
      console.error("Firebase login failed:", err);
      
      // More specific error messages
      if (err.code === 'auth/user-not-found') {
        alert("No account found with this email. Please sign up first.");
      } else if (err.code === 'auth/wrong-password') {
        alert("Incorrect password. Please try again or use Forgot Password.");
      } else if (err.code === 'auth/too-many-requests') {
        alert("Too many failed attempts. Please try again later or reset your password.");
      } else {
        alert("Invalid email or password.");
      }
      
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (!formData.email) {
      setShowForgotPassword(true);
      return;
    }
    // Show forgot password modal with pre-filled email
    setShowForgotPassword(true);
  };

  const handleBackFromForgotPassword = () => {
    setShowForgotPassword(false);
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
                  Welcome back! Redirecting to home page...
                </p>
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
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-control search-bar-transparent"
                  placeholder="Enter your password"
                  required
                />
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

// SignUp component with DEBUGGING and FIXED data storage
const SignUp = ({ onNavigate, onSignUp, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    countryCode: '+91', // Default to India
    phone: '',
    country: 'India',
    state: '',
    city: '',
    pincode: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for phone number based on country
    if (name === 'phone') {
      const selectedCountry = countries.find(c => c.code === formData.countryCode);
      let numericValue = value.replace(/\D/g, '');
      
      // Apply max length based on country
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
      // When country code changes, reset phone number
      const selectedCountry = countries.find(c => c.code === value);
      setFormData(prev => ({
        ...prev,
        countryCode: value,
        country: selectedCountry ? selectedCountry.name : 'India',
        phone: '' // Reset phone number
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setDebugInfo('');

    console.log('📝 Form Data at submit:', formData);

    // Validate phone number
    if (!validatePhone()) {
      const selectedCountry = countries.find(c => c.code === formData.countryCode);
      alert(`Please enter a valid phone number for ${selectedCountry.name}. Example: ${selectedCountry.placeholder}`);
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
    if (!formData.state.trim()) {
      alert('Please enter your state/province');
      return;
    }
    if (!formData.city.trim()) {
      alert('Please enter your city/town');
      return;
    }
    if (!formData.country.trim()) {
      alert('Please select your country');
      return;
    }

    setLoading(true);
    setDebugInfo('Starting signup process...');

    try {
      // 1. Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      const user = userCredential.user;

      console.log('✅ User created in Auth:', user.uid);
      setDebugInfo(`User created in Auth: ${user.uid}`);

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
        lastOrderDate: null
      };

      console.log('💾 Full user data prepared for Firebase:');
      console.log('- Name:', userData.name);
      console.log('- Email:', userData.email);
      console.log('- Phone:', userData.phone);
      console.log('- Country:', userData.country);
      console.log('- State:', userData.state);
      console.log('- City:', userData.city);
      console.log('- Pincode:', userData.pincode);
      console.log('- Location:', userData.location);
      
      setDebugInfo(`Preparing to store: ${userData.name}, ${userData.email}, Phone: ${userData.phone}, State: ${userData.state}, City: ${userData.city}, Pincode: ${userData.pincode}`);
      
      // 4. Store COMPLETE user profile in Firebase Realtime Database
      const storeResult = await storeUserProfile(userData);
      
      if (!storeResult.success) {
        console.error('❌ Failed to store user data:', storeResult.error);
        setDebugInfo(`Storage failed: ${storeResult.error}`);
        alert('Account created but failed to save profile data. Please update your profile later.');
      } else {
        console.log('✅ User data stored successfully in Realtime DB:', storeResult);
        setDebugInfo(`Storage successful! UserKey: ${storeResult.userKey}, UserNumber: ${storeResult.userNumber}`);
        
        // Verify the data was stored
        setTimeout(async () => {
          const verifyData = await getUserProfile(user.uid);
          console.log('🔍 Verification - Retrieved user data from Firebase:', verifyData);
          
          if (verifyData) {
            console.log('✅ Phone stored:', verifyData.phone);
            console.log('✅ State stored:', verifyData.state);
            console.log('✅ City stored:', verifyData.city);
            console.log('✅ Pincode stored:', verifyData.pincode);
            console.log('✅ Country stored:', verifyData.country);
            console.log('✅ Location stored:', verifyData.location);
            
            if (!verifyData.phone || !verifyData.state || !verifyData.city || !verifyData.pincode) {
              console.warn('⚠️ Some fields are missing in the retrieved data!');
              setDebugInfo(`Warning: Some fields missing. Phone: ${verifyData.phone || 'empty'}, State: ${verifyData.state || 'empty'}, City: ${verifyData.city || 'empty'}, Pincode: ${verifyData.pincode || 'empty'}`);
            }
          } else {
            console.log('❌ No data found in verification');
            setDebugInfo('Verification failed: No data found');
          }
        }, 2000);
      }
      
      // 5. Show success message
      setSignUpSuccess(true);
      
      // 6. Wait 2 seconds then redirect to sign in
      setTimeout(() => {
        setLoading(false);
        // Navigate to sign in with pre-filled email
        onNavigate('signin', formData.email);
      }, 2000);

    } catch (error) {
      console.error('❌ Sign up error:', error);
      setDebugInfo(`Error: ${error.message}`);
      
      let errorMessage = 'Sign up failed. Please try again.';

      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please sign in instead.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use a stronger password.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection.';
      }

      alert(errorMessage);
      setLoading(false);
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
                <h3 className="text-white mb-3">Account Created Successfully!</h3>
                <p className="text-white opacity-80 mb-4">
                  Your account has been created and ALL data saved to Firebase. You will be redirected to sign in...
                </p>
                <div className="database-sync-status mb-3">
                  <span className="database-icon">✅</span>
                  <span>All data saved to Firebase Realtime Database</span>
                </div>
                <div className="data-stored-list mb-4">
                  <div className="text-white opacity-80 mb-2" style={{ fontSize: '0.9rem' }}>Data stored includes:</div>
                  <div className="d-flex flex-wrap gap-2 justify-content-center">
                    <span className="badge bg-success">Name: {formData.name}</span>
                    <span className="badge bg-success">Email: {formData.email}</span>
                    <span className="badge bg-success">Phone: {formData.countryCode}{formData.phone}</span>
                    <span className="badge bg-success">Country: {formData.country}</span>
                    <span className="badge bg-success">State: {formData.state}</span>
                    <span className="badge bg-success">City: {formData.city}</span>
                    <span className="badge bg-success">Pincode: {formData.pincode}</span>
                  </div>
                </div>
                {debugInfo && (
                  <div className="debug-info mt-3 p-2 rounded" style={{ background: 'rgba(0,0,0,0.3)', fontSize: '0.8rem' }}>
                    <div className="text-white">Debug: {debugInfo}</div>
                  </div>
                )}
                <div className="spinner-border text-accent" role="status">
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
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label fw-semibold">Full Name <span className="text-danger">*</span></label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-control search-bar-transparent"
                  placeholder="Enter your full name"
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
                  <br />
                  Current: {formData.countryCode}{formData.phone}
                </small>
              </div>
              
              {/* Country Selection */}
              <div className="form-group">
                <label className="form-label fw-semibold">Country <span className="text-danger">*</span></label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="form-control search-bar-transparent"
                  required
                >
                  <option value="">Select Country</option>
                  <option value="India">India</option>
                  <option value="Oman">Oman</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="United States">United States</option>
                  <option value="UAE">UAE</option>
                  <option value="Australia">Australia</option>
                  <option value="Canada">Canada</option>
                  <option value="Germany">Germany</option>
                  <option value="France">France</option>
                  <option value="Singapore">Singapore</option>
                  <option value="Japan">Japan</option>
                  <option value="China">China</option>
                  <option value="Other">Other</option>
                </select>
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
                <small className="text-sm opacity-80 d-block mt-1">
                  Current: {formData.state || 'Not set'}
                </small>
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
                <small className="text-sm opacity-80 d-block mt-1">
                  Current: {formData.city || 'Not set'}
                </small>
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
                  Must be 4-10 digits. Current: {formData.pincode || 'Not set'}
                </small>
              </div>
              
              <div className="form-group">
                <label className="form-label fw-semibold">Password <span className="text-danger">*</span></label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-control search-bar-transparent"
                  placeholder="Create a strong password"
                  required
                />
                <small className="text-sm opacity-80 d-block mt-1">Must be 8+ chars with uppercase, lowercase, number & special char</small>
              </div>

              {/* Password Strength Indicator */}
              <div className="password-criteria mt-2 p-3 rounded" style={{ background: 'rgba(255,255,255,0.1)', fontSize: '0.8rem' }}>
                <div className="mb-2 text-white" style={{ fontSize: '0.75rem' }}>Password Requirements:</div>
                {criteria.map((c, i) => (
                  <div key={i} className="d-flex align-items-center gap-2 mb-1">
                    <span style={{ color: c.test ? '#28a745' : '#dc3545' }}>
                      {c.test ? '✓' : '✗'}
                    </span>
                    <span style={{ color: c.test ? '#ccc' : '#aaa' }}>{c.label}</span>
                  </div>
                ))}
              </div>

              <div className="form-group">
                <label className="form-label fw-semibold">Confirm Password <span className="text-danger">*</span></label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="form-control search-bar-transparent"
                  placeholder="Confirm your password"
                  required
                />
              </div>
              
              {/* Debug Info */}
              {debugInfo && (
                <div className="debug-info mt-3 p-2 rounded" style={{ background: 'rgba(0,0,0,0.3)', fontSize: '0.8rem' }}>
                  <div className="text-white">Debug: {debugInfo}</div>
                </div>
              )}
              
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
                className="btn btn-primary-transparent w-100 py-3 fw-semibold mt-3"
                disabled={loading || !passwordValid || formData.password !== formData.confirmPassword || !validatePhone() || !formData.name || !formData.email || !formData.state || !formData.city || !formData.pincode || !formData.country}
                title={(!passwordValid || formData.password !== formData.confirmPassword || !validatePhone() || !formData.name || !formData.email || !formData.state || !formData.city || !formData.pincode || !formData.country) ? "Please fill all required fields correctly" : ""}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Creating Account...
                  </>
                ) : (
                  'Sign Up'
                )}
              </button>
              
              <div className="mt-3 text-center" style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>
                By signing up, you agree to our Terms & Conditions
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export { SignIn, SignUp };