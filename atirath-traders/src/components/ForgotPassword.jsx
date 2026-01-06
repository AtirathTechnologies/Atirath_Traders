import React, { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import { ArrowLeft } from 'lucide-react';

const ForgotPassword = ({ preFilledEmail = '', onSuccess, onBack }) => {
  const [email, setEmail] = useState(preFilledEmail);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('✅ Password reset email sent! Check your inbox and follow the link.');
      setLoading(false);
      
      // Notify parent component on success
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
    } catch (err) {
      console.error('Password reset error:', err);
      setLoading(false);
      
      if (err.code === 'auth/user-not-found') {
        setError('❌ No account found with this email address.');
      } else if (err.code === 'auth/invalid-email') {
        setError('❌ Invalid email format.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('❌ Too many attempts. Please try again later.');
      } else {
        setError('❌ Failed to send reset email. Please try again.');
      }
    }
  };

  // Inline styles
  const styles = {
    container: {
      maxWidth: '500px',
      margin: '0 auto',
      padding: '20px'
    },
    companyInfo: {
      textAlign: 'center',
      marginBottom: '30px'
    },
    logo: {
      marginBottom: '20px'
    },
    logoImg: {
      width: '80px',
      height: '80px',
      objectFit: 'contain',
      borderRadius: '8px'
    },
    companyTitle: {
      color: 'white',
      fontSize: '1.5rem',
      fontWeight: '600',
      marginBottom: '8px'
    },
    companySubtitle: {
      fontSize: '0.9rem',
      color: 'rgba(255, 255, 255, 0.8)'
    },
    form: {
      width: '100%'
    },
    formGroup: {
      marginBottom: '24px'
    },
    formLabel: {
      color: 'white',
      fontWeight: '600',
      marginBottom: '8px',
      display: 'block'
    },
    formInput: {
      width: '100%',
      padding: '12px 16px',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '8px',
      color: 'white',
      fontSize: '1rem',
      transition: 'all 0.3s ease'
    },
    formInputFocus: {
      outline: 'none',
      borderColor: '#28a745',
      boxShadow: '0 0 0 2px rgba(40, 167, 69, 0.25)'
    },
    alert: {
      padding: '16px',
      borderRadius: '8px',
      marginBottom: '20px',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      color: 'white'
    },
    alertSuccess: {
      borderLeft: '4px solid #28a745'
    },
    alertDanger: {
      borderLeft: '4px solid #dc3545'
    },
    alertTitle: {
      fontWeight: '600',
      marginBottom: '8px'
    },
    instructionsList: {
      paddingLeft: '20px',
      marginBottom: '0',
      marginTop: '8px'
    },
    instructionsListItem: {
      marginBottom: '4px',
      fontSize: '0.9rem',
      color: 'rgba(255, 255, 255, 0.8)'
    },
    submitButton: {
      width: '100%',
      padding: '14px',
      backgroundColor: 'rgba(40, 167, 69, 0.9)',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontWeight: '600',
      fontSize: '1rem',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      marginBottom: '12px'
    },
    submitButtonDisabled: {
      opacity: '0.6',
      cursor: 'not-allowed'
    },
    backButton: {
      width: '100%',
      padding: '12px',
      color: '#6c757d',
      backgroundColor: 'transparent',
      border: 'none',
      textDecoration: 'none',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'color 0.2s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '0.9rem'
    },
    instructionsBox: {
      marginTop: '24px',
      padding: '16px',
      borderRadius: '8px',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderLeft: '4px solid #28a745'
    },
    instructionsTitle: {
      color: '#28a745',
      fontWeight: '600',
      marginBottom: '8px',
      fontSize: '0.9rem'
    },
    instructionsListSmall: {
      paddingLeft: '20px',
      marginBottom: '0'
    },
    instructionsListItemSmall: {
      marginBottom: '4px',
      fontSize: '0.8rem',
      color: 'rgba(255, 255, 255, 0.8)'
    },
    spinner: {
      display: 'inline-block',
      width: '14px',
      height: '14px',
      border: '2px solid rgba(255, 255, 255, 0.3)',
      borderTopColor: 'white',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      marginRight: '8px'
    }
  };

  // Add keyframes style
  const keyframesStyle = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;

  return (
    <>
      <style>{keyframesStyle}</style>
      <div style={styles.container}>
        <h2 className="auth-form-title text-center mb-4" style={{ color: 'white', marginBottom: '30px' }}>
          Reset Your Password
        </h2>
        
        <div style={styles.companyInfo}>
          <div style={styles.logo}>
            <img 
              src="/img/icon2.png" 
              alt="ATIRATH Traders Indian Pvt.Ltd Logo" 
              style={styles.logoImg}
            />
          </div>
          <h3 style={styles.companyTitle}>ATIRATH Traders Indian Pvt.Ltd</h3>
          <p style={styles.companySubtitle}>Enter your email to reset your password</p>
        </div>
        
        <form onSubmit={handleReset} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.formInput}
              placeholder="Enter your registered email"
              required
              autoFocus
              onFocus={(e) => {
                e.target.style.outline = 'none';
                e.target.style.borderColor = '#28a745';
                e.target.style.boxShadow = '0 0 0 2px rgba(40, 167, 69, 0.25)';
              }}
              onBlur={(e) => {
                e.target.style.outline = 'none';
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
          
          {message && (
            <div style={{ ...styles.alert, ...styles.alertSuccess }} role="alert">
              {message}
              <div style={{ marginTop: '8px' }}>
                <strong style={styles.alertTitle}>Next Steps:</strong>
                <ol style={styles.instructionsList}>
                  <li style={styles.instructionsListItem}>Check your email inbox (and spam folder)</li>
                  <li style={styles.instructionsListItem}>Click the "Reset Password" link in the email</li>
                  <li style={styles.instructionsListItem}>Set a new password on the Firebase page</li>
                  <li style={styles.instructionsListItem}>Return here and sign in with your new password</li>
                </ol>
              </div>
            </div>
          )}
          
          {error && (
            <div style={{ ...styles.alert, ...styles.alertDanger }} role="alert">
              {error}
            </div>
          )}
          
          <button 
            type="submit" 
            style={{
              ...styles.submitButton,
              ...(loading || !email ? styles.submitButtonDisabled : {})
            }}
            disabled={loading || !email}
            onMouseEnter={(e) => {
              if (!loading && email) {
                e.target.style.backgroundColor = 'rgba(40, 167, 69, 1)';
                e.target.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading && email) {
                e.target.style.backgroundColor = 'rgba(40, 167, 69, 0.9)';
                e.target.style.transform = 'translateY(0)';
              }
            }}
          >
            {loading ? (
              <>
                <span style={styles.spinner}></span>
                Sending Reset Link...
              </>
            ) : (
              'Send Reset Email'
            )}
          </button>
          
          <button 
            type="button" 
            style={styles.backButton}
            onClick={onBack}
            onMouseEnter={(e) => (e.target.style.color = 'white')}
            onMouseLeave={(e) => (e.target.style.color = '#6c757d')}
          >
            <ArrowLeft style={{ width: '16px', height: '16px', marginRight: '8px' }} />
            Back to Sign In
          </button>
        </form>
        
        <div style={styles.instructionsBox}>
          <h6 style={styles.instructionsTitle}>How it works:</h6>
          <ul style={styles.instructionsListSmall}>
            <li style={styles.instructionsListItemSmall}>You'll receive an email from Firebase</li>
            <li style={styles.instructionsListItemSmall}>The link expires in 1 hour for security</li>
            <li style={styles.instructionsListItemSmall}>After resetting, your new password will be stored securely in Firebase</li>
            <li style={styles.instructionsListItemSmall}>Use your new password to sign in</li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;