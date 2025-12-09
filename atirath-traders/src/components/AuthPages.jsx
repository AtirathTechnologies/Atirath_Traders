import React, { useState } from 'react';
import { X } from 'lucide-react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile 
} from 'firebase/auth';
import { storeUserProfile, auth, getUserProfile } from '../firebase';

const SignIn = ({ onNavigate, onSignIn, onClose, preFilledEmail = '' }) => {
  const [formData, setFormData] = useState({
    email: preFilledEmail,
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [signInSuccess, setSignInSuccess] = useState(false);

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
        userNumber: userDB?.userNumber || null
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
      alert("Invalid email or password.");
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (!formData.email) {
      alert('Please enter your email address first to reset your password.');
      return;
    }
    alert(`Password reset link has been sent to ${formData.email}. Please check your email.`);
  };

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

  // Country data with codes and validation patterns
  const countries = [
    { name: 'India', code: '+91', flag: '🇮🇳', pattern: /^[6-9]\d{9}$/, placeholder: '9876543210' },
    { name: 'Oman', code: '+968', flag: '🇴🇲', pattern: /^[9]\d{7}$/, placeholder: '9XXXXXXX' },
    { name: 'United Kingdom', code: '+44', flag: '🇬🇧', pattern: /^[1-9]\d{9,10}$/, placeholder: '20XXXXXXXXX' }
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

    // Validate phone number
    if (!validatePhone()) {
      const selectedCountry = countries.find(c => c.code === formData.countryCode);
      alert(`Please enter a valid phone number for ${selectedCountry.name}.`);
      return;
    }

    // Validate pincode
    if (formData.pincode && !/^\d{4,10}$/.test(formData.pincode)) {
      alert('Please enter a valid pincode (4-10 digits).');
      return;
    }

    // Validate password strength
    if (!validatePassword(formData.password)) {
      alert('Password does not meet strength requirements.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    setLoading(true);

    try {
      // 1. Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      const user = userCredential.user;

      console.log('✅ User created in Auth:', user.uid);

      // 2. Update user profile in Auth
      await updateProfile(user, { 
        displayName: formData.name 
      });

      // 3. Prepare complete user data for Realtime Database
      const userData = {
        uid: user.uid,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        countryCode: formData.countryCode,
        country: formData.country,
        state: formData.state,
        city: formData.city,
        pincode: formData.pincode,
        location: `${formData.city}, ${formData.state}, ${formData.country}`,
        photoURL: '',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        accountStatus: 'active',
        emailVerified: false,
        phoneVerified: false,
        orderCount: 0,
        totalSpent: 0,
        lastOrderDate: null
      };

      console.log('💾 Attempting to store user data in Firebase Realtime Database:', userData);
      
      // 4. Store user profile in Firebase Realtime Database
      const storeResult = await storeUserProfile(userData);
      
      if (!storeResult.success) {
        console.error('❌ Failed to store user data:', storeResult.error);
        alert('Account created but failed to save profile data. Please update your profile later.');
      } else {
        console.log('✅ User data stored successfully in Realtime DB:', storeResult);
        
        // Verify the data was stored
        setTimeout(async () => {
          const verifyData = await getUserProfile(user.uid);
          console.log('🔍 Verification - Retrieved user data:', verifyData);
        }, 1000);
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
      let errorMessage = 'Sign up failed. Please try again.';

      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please sign in instead.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use a stronger password.';
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
                  Your account has been created and data saved to Firebase. You will be redirected to sign in...
                </p>
                <div className="database-sync-status mb-3">
                  <span className="database-icon">✅</span>
                  <span>Data saved to Firebase Realtime Database</span>
                </div>
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
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label fw-semibold">Full Name</label>
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
                <label className="form-label fw-semibold">Email Address</label>
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
                <label className="form-label fw-semibold">Phone Number</label>
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
                  {selectedCountry ? `Valid ${selectedCountry.name} number format required` : 'Enter valid phone number'}
                </small>
              </div>
              
              {/* Country Selection */}
              <div className="form-group">
                <label className="form-label fw-semibold">Country</label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="form-control search-bar-transparent"
                  required
                >
                  <option value="India">India</option>
                  <option value="Oman">Oman</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              {/* State */}
              <div className="form-group">
                <label className="form-label fw-semibold">State/Province</label>
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
                <label className="form-label fw-semibold">City/Town</label>
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
                <label className="form-label fw-semibold">Pincode/ZIP Code</label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  className="form-control search-bar-transparent"
                  placeholder="Enter your pincode or ZIP code"
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
                  placeholder="Create a strong password"
                  required
                />
                <small className="text-sm opacity-80 d-block mt-1">Must be 8+ chars with uppercase, lowercase, number & special char</small>
              </div>

              {/* Password Strength Indicator */}
              <div className="password-criteria mt-2 p-3 rounded" style={{ background: 'rgba(255,255,255,0.1)', fontSize: '0.8rem' }}>
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
                <label className="form-label fw-semibold">Confirm Password</label>
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
                className="btn btn-primary-transparent w-100 py-3 fw-semibold"
                disabled={loading || !passwordValid || formData.password !== formData.confirmPassword || !validatePhone()}
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
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export { SignIn, SignUp };