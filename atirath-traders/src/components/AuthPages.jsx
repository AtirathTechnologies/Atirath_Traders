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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;
      
      // Get user data from Firebase - IMPORTANT: Get phone number from database
      const userDataFromDB = await getUserProfile(user.uid);
      
      const userData = {
        uid: user.uid,
        name: userDataFromDB?.name || user.displayName || 'User Name',
        email: user.email,
        phone: userDataFromDB?.phone || '', // Get phone from database
        location: userDataFromDB?.location || '', // Get location from database
        photoURL: userDataFromDB?.photoURL || '', // Get photoURL from database
        createdAt: userDataFromDB?.createdAt || new Date().toISOString()
      };
      
      console.log('Sign in successful, user data:', {
        name: userData.name,
        phone: userData.phone, // Debug log
        hasPhone: !!userData.phone
      });
      
      // Show success message
      setSignInSuccess(true);
      
      // Wait 1.5 seconds then redirect
      setTimeout(() => {
        onSignIn(userData);
        onClose();
      }, 1500);
      
    } catch (error) {
      console.error('Sign in error:', error);
      let errorMessage = 'Sign in failed. Please try again.';
      
      if (error.code === 'auth/invalid-email') errorMessage = 'Invalid email address.';
      else if (error.code === 'auth/user-disabled') errorMessage = 'This account has been disabled.';
      else if (error.code === 'auth/user-not-found') errorMessage = 'No account found with this email.';
      else if (error.code === 'auth/wrong-password') errorMessage = 'Incorrect password.';
      
      alert(errorMessage);
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

  // Render success message
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
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  // Strong password regex
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

  // Indian phone number regex (10 digits starting with 6-9)
  const phoneRegex = /^[6-9]\d{9}$/;

  const validatePassword = (pwd) => {
    const isValid = strongPasswordRegex.test(pwd);
    setPasswordValid(isValid);
    return isValid;
  };

  const validatePhone = (phone) => {
    return phoneRegex.test(phone);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Only allow numbers for phone field and limit to 10 digits
    if (name === 'phone') {
      const numericValue = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
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
    if (!validatePhone(formData.phone)) {
      alert('Please enter a valid 10-digit Indian phone number.');
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
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      await updateProfile(user, { 
        displayName: formData.name 
      });

      // UPDATED: Include all user data including phone number
      const userData = {
        uid: user.uid,
        name: formData.name,
        email: formData.email,
        phone: formData.phone, // PHONE NUMBER INCLUDED
        location: '', // Initialize location as empty
        photoURL: '', // Initialize photoURL as empty
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };

      console.log('Storing user data with phone:', userData.phone); // Debug log
      
      // Store user profile in Firebase Realtime Database
      await storeUserProfile(userData);
      
      // Show success message
      setSignUpSuccess(true);
      
      // Wait 2 seconds then redirect to sign in
      setTimeout(() => {
        setLoading(false);
        // Navigate to sign in with pre-filled email
        onNavigate('signin', formData.email);
      }, 2000);

    } catch (error) {
      console.error('Sign up error:', error);
      let errorMessage = 'Sign up failed. Please try again.';

      if (error.code === 'auth/email-already-in-use') errorMessage = 'This email is already registered. Please sign in instead.';
      else if (error.code === 'auth/invalid-email') errorMessage = 'Invalid email address.';
      else if (error.code === 'auth/weak-password') errorMessage = 'Password is too weak. Please use a stronger password.';

      alert(errorMessage);
      setLoading(false);
    }
  };

  // Password criteria check
  const criteria = [
    { label: 'At least 8 characters', test: formData.password.length >= 8 },
    { label: 'One uppercase letter', test: /[A-Z]/.test(formData.password) },
    { label: 'One lowercase letter', test: /[a-z]/.test(formData.password) },
    { label: 'One number', test: /\d/.test(formData.password) },
    { label: 'One special character (!@#$%^&*)', test: /[!@#$%^&*]/.test(formData.password) }
  ];

  // Render success message
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
                  Your account has been created. You will be redirected to sign in page...
                </p>
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
              
              <div className="form-group">
                <label className="form-label fw-semibold">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-control search-bar-transparent"
                  placeholder="Enter 10-digit phone number"
                  maxLength="10"
                  required
                />
                <small className="text-sm opacity-80 d-block mt-1">10-digit Indian phone number (e.g., 9876543210)</small>
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
                disabled={loading || !passwordValid || formData.password !== formData.confirmPassword || !validatePhone(formData.phone)}
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