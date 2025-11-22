import React, { useState, useEffect } from 'react';
import { Menu, X, User, LogOut, UserCircle, Search, Users, Briefcase, Edit, Save, X as CloseIcon, Camera } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Navbar = ({
  currentPath,
  onNavigate,
  onAuthNavigate,
  isAuthenticated,
  currentUser,
  onSignOut,
  globalSearchQuery,
  onGlobalSearchChange,
  onGlobalSearchClear,
  onProfileUpdate,
  isProductPage = false,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const showSearch = location.pathname.startsWith('/product/');

  /* ---------- Sync local search with global search ---------- */
  useEffect(() => {
    setLocalSearchQuery(globalSearchQuery || '');
  }, [globalSearchQuery, location.pathname]);

  /* ---------- Initialize edited user when currentUser changes ---------- */
  useEffect(() => {
    if (currentUser) {
      setEditedUser({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        location: currentUser.location || '',
        photoURL: currentUser.photoURL || '',
      });
    }
  }, [currentUser]);

  /* ---------- Reset editing state when user signs out ---------- */
  useEffect(() => {
    if (!isAuthenticated) {
      setIsEditing(false);
      setUserDropdownOpen(false);
      setEditedUser(null);
      setPhoneError('');
    }
  }, [isAuthenticated]);

  /* ---------- Phone number validation - FIXED TO 10 DIGITS ---------- */
  const validatePhoneNumber = (phone) => {
    if (!phone) return true; // Empty phone is allowed
    
    // Remove all non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Always require exactly 10 digits
    if (cleanPhone.length !== 10) {
      setPhoneError('Phone number must be exactly 10 digits');
      return false;
    }
    
    setPhoneError('');
    return true;
  };

  /* ---------- Handle phone number input with validation ---------- */
  const handlePhoneChange = (value) => {
    // Allow only digits and limit to 10 characters
    const formattedValue = value.replace(/\D/g, '').slice(0, 10);
    
    setEditedUser(prev => ({
      ...prev,
      phone: formattedValue
    }));
    
    // Validate phone number
    validatePhoneNumber(formattedValue);
  };

  /* ---------- Photo Upload Handler - FIXED TO SHOW "UPLOAD PHOTO" ---------- */
  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPEG, PNG, etc.)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setUploadingPhoto(true);

    try {
      // Convert image to base64 for storage
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        const photoURL = e.target.result;
        
        // Update the edited user with new photo
        setEditedUser(prev => ({
          ...prev,
          photoURL: photoURL
        }));

        // If not in edit mode, save immediately
        if (!isEditing && currentUser) {
          const updatedUser = {
            ...currentUser,
            photoURL: photoURL
          };
          
          if (onProfileUpdate) {
            await onProfileUpdate(updatedUser);
          }
          alert('Profile photo updated successfully!');
        }
        
        setUploadingPhoto(false);
      };
      
      reader.onerror = () => {
        alert('Error reading image file');
        setUploadingPhoto(false);
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Photo upload error:', error);
      alert('Error uploading photo. Please try again.');
      setUploadingPhoto(false);
    }
  };

  /* ---------- Remove Photo Handler ---------- */
  const handleRemovePhoto = async () => {
    if (!currentUser) return;

    try {
      setEditedUser(prev => ({
        ...prev,
        photoURL: ''
      }));

      // If not in edit mode, save immediately
      if (!isEditing) {
        const updatedUser = {
          ...currentUser,
          photoURL: ''
        };
        
        if (onProfileUpdate) {
          await onProfileUpdate(updatedUser);
        }
        alert('Profile photo removed successfully!');
      }
    } catch (error) {
      console.error('Photo removal error:', error);
      alert('Error removing photo. Please try again.');
    }
  };

  /* ---------- Search functionality ---------- */
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setLocalSearchQuery(query);
    onGlobalSearchChange(query);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };

  const handleSearchClear = () => {
    setLocalSearchQuery('');
    onGlobalSearchClear();
  };

  /* ---------- Close dropdown / mobile menu on outside click ---------- */
  useEffect(() => {
    const handler = (e) => {
      if (userDropdownOpen && !e.target.closest('.user-dropdown')) {
        setUserDropdownOpen(false);
        setIsEditing(false);
        setPhoneError('');
      }
      if (
        mobileMenuOpen &&
        !e.target.closest('.mobile-menu') &&
        !e.target.closest('#menu-btn')
      ) {
        setMobileMenuOpen(false);
        setIsEditing(false);
        setPhoneError('');
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [userDropdownOpen, mobileMenuOpen]);

  /* ---------- Navigation handlers ---------- */
  const handleNavigation = (section) => {
    onNavigate(section);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setIsEditing(false);
    setPhoneError('');
  };

  const auth = (type) => {
    onAuthNavigate(type);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setIsEditing(false);
    setPhoneError('');
  };

  const signOut = () => {
    onSignOut();
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    setIsEditing(false);
    setPhoneError('');
  };

  const toggleUser = (e) => {
    e.stopPropagation();
    setUserDropdownOpen((v) => !v);
    setIsEditing(false);
    setPhoneError('');
  };

  /* ---------- Terms & Policy Handler ---------- */
  const handleTermsPolicy = () => {
    navigate('/terms-policy');
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setIsEditing(false);
    setPhoneError('');
  };

  /* ---------- Edit Profile Handlers ---------- */
  const handleEditProfile = () => {
    setIsEditing(true);
    setPhoneError('');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setPhoneError('');
    if (currentUser) {
      setEditedUser({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        location: currentUser.location || '',
        photoURL: currentUser.photoURL || '',
      });
    }
  };

  const handleSaveProfile = async () => {
    if (!editedUser?.name.trim()) {
      alert('Please enter your name');
      return;
    }

    // Validate phone number before saving
    if (editedUser.phone && !validatePhoneNumber(editedUser.phone)) {
      alert('Please fix the phone number error before saving');
      return;
    }

    setSaving(true);
    try {
      if (onProfileUpdate) {
        await onProfileUpdate(editedUser);
      }
      setIsEditing(false);
      setPhoneError('');
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Error updating profile. Please try again.');
      console.error('Profile update error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field === 'phone') {
      handlePhoneChange(value);
    } else {
      setEditedUser(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  /* ---------- Join Us handler ---------- */
  const handleJoinUs = () => {
    navigate('/join-us');
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setIsEditing(false);
    setPhoneError('');
  };

  /* ---------- Services handler ---------- */
  const handleServices = () => {
    navigate('/services');
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setIsEditing(false);
    setPhoneError('');
  };

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Format member since date
  const getMemberSince = () => {
    if (!currentUser?.createdAt) return 'N/A';
    return new Date(currentUser.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get user's first name and last name initials for display
  const getUserNameInitials = () => {
    if (!currentUser?.name) return 'U';
    const names = currentUser.name.split(' ');
    if (names.length === 1) return names[0][0].toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  };

  // Render user avatar with photo or initials - UPDATED WITH PROPER PHOTO UPLOAD LABELS
  const renderUserAvatar = (user, size = 'small', showUploadLabel = false) => {
    const avatarClass = size === 'small' ? 'avatar-circle-small' : 
                       size === 'large' ? 'avatar-circle-large' : 'avatar-circle';
    const initialsClass = size === 'small' ? 'avatar-initials-small' : 
                         size === 'large' ? 'avatar-initials-large' : 'avatar-initials';
    
    if (user?.photoURL) {
      return (
        <div className={`${avatarClass} avatar-with-photo`}>
          <img 
            src={user.photoURL} 
            alt={`${user.name}'s profile`}
            className="avatar-photo"
            onError={(e) => {
              // If image fails to load, fall back to initials
              e.target.style.display = 'none';
              const parent = e.target.parentElement;
              const fallback = document.createElement('div');
              fallback.className = initialsClass;
              fallback.textContent = getInitials(user?.name);
              parent.appendChild(fallback);
            }}
          />
          {/* Photo upload overlay - Only show when not in edit mode */}
          {!isEditing && (
            <label 
              htmlFor={size === 'large' ? 'photo-upload-mobile' : 'photo-upload'} 
              className="photo-upload-overlay"
              title="Change photo"
            >
              <Camera className="w-4 h-4" />
            </label>
          )}
        </div>
      );
    }
    
    return (
      <div className={avatarClass}>
        <span className={initialsClass}>{getInitials(user?.name)}</span>
        {/* Photo upload overlay - Only show when not in edit mode */}
        {!isEditing && (
          <label 
            htmlFor={size === 'large' ? 'photo-upload-mobile' : 'photo-upload'} 
            className="photo-upload-overlay"
            title="Upload photo"
          >
            <Camera className="w-4 h-4" />
          </label>
        )}
      </div>
    );
  };

  // Render product page navbar (minimal)
  const renderProductPageNavbar = () => (
    <>
      {/* ---------- DESKTOP NAVBAR FOR PRODUCT PAGES ---------- */}
      <nav className="glass d-flex align-items-center px-2 py-1 fixed-top w-100 z-3 navbar" style={{ minHeight: '50px' }}>
        {/* ---- LEFT: LOGO + COMPANY ---- */}
        <div className="d-flex align-items-center flex-shrink-0 me-2">
          <div className="nav-logo nav-logo-compact">
            <img src="/img/icon2.png" alt="Logo" className="logo-img" style={{ height: '32px' }} />
          </div>
          <div className="ms-1">
            <div className="fw-bold accent mb-0 company-name-compact no-wrap">
              ATIRATH TRADERS INDIA PVT.LTD
            </div>
            <div className="opacity-75 company-tagline-compact no-wrap">
              Diverse Businesses, One Vision
            </div>
          </div>
        </div>

        {/* ---- CENTER: NAV LINKS FOR PRODUCT PAGES ---- */}
        <div className="d-none d-md-flex align-items-center nav-links-compact flex-grow-1 justify-content-center">
          <button 
            className="btn btn-link text-white text-decoration-none hover-accent nav-link-btn border-0 no-wrap"
            onClick={() => handleNavigation('home')}
          >
            Home
          </button>
          <button 
            className="btn btn-link text-white text-decoration-none hover-accent nav-link-btn border-0 no-wrap"
            onClick={() => handleNavigation('products')}
          >
            Products
          </button>
          <button 
            className="btn btn-link text-white text-decoration-none hover-accent nav-link-btn border-0 no-wrap"
            onClick={() => handleNavigation('contact')}
          >
            Contact
          </button>
        </div>

        {/* ---- RIGHT: SEARCH + AUTH FOR PRODUCT PAGES ---- */}
        <div className="d-none d-md-flex align-items-center gap-1 flex-shrink-0 ms-auto">
          {/* Search (always show on product pages) */}
          <div className="search-compact me-1">
            <form onSubmit={handleSearchSubmit} className="position-relative">
              <input
                type="text"
                className="form-control search-bar"
                placeholder="Search products..."
                value={localSearchQuery}
                onChange={handleSearchChange}
              />
              {localSearchQuery ? (
                <button
                  type="button"
                  className="btn btn-link position-absolute end-0 top-50 translate-middle-y text-muted p-0"
                  onClick={handleSearchClear}
                  style={{ right: '6px' }}
                >
                  <X className="w-3 h-3" />
                </button>
              ) : (
                <Search className="w-3 h-3 position-absolute end-0 top-50 translate-middle-y text-muted" style={{ right: '8px' }} />
              )}
            </form>
          </div>

          {/* Auth Buttons */}
          {isAuthenticated ? (
            <div className="user-dropdown position-relative">
              <button
                className="btn btn-primary auth-btn d-flex align-items-center gap-1 no-wrap"
                onClick={toggleUser}
              >
                <User className="w-3 h-3" />
                {getUserNameInitials()}
              </button>

              {userDropdownOpen && (
                <div className="dropdown-menu show position-absolute end-0 mt-1 profile-dropdown-card" style={{ minWidth: '320px', maxWidth: '350px', fontSize: '0.8rem' }}>
                  {/* Profile Header */}
                  <div className="profile-dropdown-header p-2 border-bottom">
                    <div className="d-flex align-items-center gap-2">
                      {renderUserAvatar(currentUser, 'small')}
                      <div className="flex-grow-1">
                        <div className="fw-bold text-white text-xs-compact">{currentUser?.name || 'User'}</div>
                        <div className="text-muted text-xxs">{currentUser?.email || ''}</div>
                      </div>
                      {!isEditing && (
                        <button
                          className="btn btn-outline-accent btn-sm d-flex align-items-center gap-1"
                          onClick={handleEditProfile}
                          style={{ fontSize: '0.7rem', padding: '0.2rem 0.4rem' }}
                        >
                          <Edit className="w-3 h-3" />
                          Edit
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Account Information */}
                  {isEditing ? (
                    <div className="p-2 border-bottom">
                      <h6 className="text-accent mb-1 fw-bold text-xs-compact">EDIT PROFILE</h6>
                      
                      {/* Photo Upload Section */}
                      <div className="photo-upload-section">
                        <div className="d-flex align-items-center gap-3 mb-2">
                          <div className="position-relative">
                            {renderUserAvatar(editedUser, 'medium', true)}
                            <input
                              id="photo-upload"
                              type="file"
                              accept="image/*"
                              onChange={handlePhotoUpload}
                              className="d-none"
                              disabled={uploadingPhoto}
                            />
                          </div>
                          <div className="flex-grow-1">
                            <div className="text-sm text-muted mb-2">Profile Photo</div>
                            <div className="d-flex gap-2 flex-wrap">
                              <label 
                                htmlFor="photo-upload" 
                                className="btn btn-outline-accent btn-sm d-flex align-items-center gap-1"
                                style={{ fontSize: '0.75rem', padding: '0.4rem 0.6rem' }}
                              >
                                <Camera className="w-3 h-3" />
                                {editedUser?.photoURL ? 'Change Photo' : 'Upload Photo'}
                              </label>
                              {editedUser?.photoURL && (
                                <button
                                  className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1"
                                  onClick={handleRemovePhoto}
                                  style={{ fontSize: '0.75rem', padding: '0.4rem 0.6rem' }}
                                >
                                  <X className="w-3 h-3" />
                                  Remove
                                </button>
                              )}
                            </div>
                            <div className="text-muted text-xxs mt-2">
                              Recommended: Square image, max 5MB
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="profile-edit-grid">
                        <div className="form-group-sm">
                          <label className="profile-info-label text-xxs">Full Name:</label>
                          <input
                            type="text"
                            className="form-control search-bar-transparent"
                            value={editedUser?.name || ''}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            placeholder="Enter your full name"
                            style={{ fontSize: '0.75rem', padding: '0.3rem 0.5rem' }}
                          />
                        </div>
                        <div className="form-group-sm">
                          <label className="profile-info-label text-xxs">Email:</label>
                          <input
                            type="email"
                            className="form-control search-bar-transparent"
                            value={editedUser?.email || ''}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            placeholder="Enter your email"
                            style={{ fontSize: '0.75rem', padding: '0.3rem 0.5rem' }}
                          />
                        </div>
                        <div className="form-group-sm">
                          <label className="profile-info-label text-xxs">Phone:</label>
                          <input
                            type="tel"
                            className="form-control search-bar-transparent"
                            value={editedUser?.phone || ''}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            placeholder="Enter 10-digit phone number"
                            style={{ fontSize: '0.75rem', padding: '0.3rem 0.5rem' }}
                            maxLength={10}
                          />
                          {phoneError && (
                            <div className="text-danger text-xxs mt-1">{phoneError}</div>
                          )}
                          <div className="text-muted text-xxs mt-1">
                            Phone number must be exactly 10 digits
                          </div>
                        </div>
                        <div className="form-group-sm">
                          <label className="profile-info-label text-xxs">Location:</label>
                          <input
                            type="text"
                            className="form-control search-bar-transparent"
                            value={editedUser?.location || ''}
                            onChange={(e) => handleInputChange('location', e.target.value)}
                            placeholder="Enter your location"
                            style={{ fontSize: '0.75rem', padding: '0.3rem 0.5rem' }}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2 border-bottom">
                      <h6 className="text-accent mb-1 fw-bold text-xs-compact">ACCOUNT INFORMATION</h6>
                      <div className="profile-info-grid">
                        <div className="profile-info-item">
                          <span className="profile-info-label text-xxs">Full Name:</span>
                          <span className="profile-info-value text-xs-compact">{currentUser?.name || 'Not set'}</span>
                        </div>
                        <div className="profile-info-item">
                          <span className="profile-info-label text-xxs">Email:</span>
                          <span className="profile-info-value text-xs-compact">{currentUser?.email || 'Not set'}</span>
                        </div>
                        {currentUser?.phone && (
                          <div className="profile-info-item">
                            <span className="profile-info-label text-xxs">Phone:</span>
                            <span className="profile-info-value text-xs-compact">{currentUser.phone}</span>
                          </div>
                        )}
                        {currentUser?.location && (
                          <div className="profile-info-item">
                            <span className="profile-info-label text-xxs">Location:</span>
                            <span className="profile-info-value text-xs-compact">{currentUser.location}</span>
                          </div>
                        )}
                        <div className="profile-info-item">
                          <span className="profile-info-label text-xxs">Member Since:</span>
                          <span className="profile-info-value text-xs-compact">{getMemberSince()}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Account Status */}
                  <div className="p-2 border-bottom">
                    <h6 className="text-accent mb-1 fw-bold text-xs-compact">ACCOUNT STATUS</h6>
                    <div className="profile-info-item">
                      <span className="profile-info-label text-xxs">Status:</span>
                      <span className="status-badge-small" style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem' }}>Certified</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="p-2">
                    {isEditing ? (
                      <div className="d-flex gap-1">
                        <button
                          className="btn btn-outline-light btn-sm flex-fill d-flex align-items-center justify-content-center gap-1"
                          onClick={handleCancelEdit}
                          disabled={saving || uploadingPhoto}
                          style={{ fontSize: '0.7rem', padding: '0.3rem 0.4rem' }}
                        >
                          <CloseIcon className="w-3 h-3" />
                          Cancel
                        </button>
                        <button 
                          className="btn btn-primary btn-sm flex-fill d-flex align-items-center justify-content-center gap-1" 
                          onClick={handleSaveProfile}
                          disabled={saving || phoneError || uploadingPhoto}
                          style={{ fontSize: '0.7rem', padding: '0.3rem 0.4rem' }}
                        >
                          {saving ? (
                            <>
                              <div className="spinner-border spinner-border-sm me-1" role="status"></div>
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="w-3 h-3" />
                              Save
                            </>
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="d-flex gap-1">
                        <button 
                          className="btn btn-primary btn-sm w-100 d-flex align-items-center justify-content-center gap-1" 
                          onClick={signOut}
                          style={{ fontSize: '0.7rem', padding: '0.3rem 0.4rem' }}
                        >
                          <LogOut className="w-3 h-3" />
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="d-flex align-items-center auth-buttons-compact">
              <button
                className="btn btn-outline-light auth-btn no-wrap"
                onClick={() => auth('signin')}
              >
                Sign In
              </button>
              <button
                className="btn btn-primary auth-btn no-wrap"
                onClick={() => auth('signup')}
              >
                Sign Up
              </button>
            </div>
          )}
        </div>

        {/* ---- MOBILE TOGGLE ---- */}
        <div className="d-md-none d-flex align-items-center gap-1 ms-auto">
          {/* Mobile Profile Button - Always visible when authenticated */}
          {isAuthenticated && (
            <button
              className="btn btn-primary auth-btn d-flex align-items-center gap-1 no-wrap"
              onClick={toggleUser}
            >
              <User className="w-3 h-3" />
              {getUserNameInitials()}
            </button>
          )}
          
          <button
            id="menu-btn"
            className="btn p-1 accent border-0"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* ---------- MOBILE MENU FOR PRODUCT PAGES ---------- */}
      <div className={`mobile-menu glass ${mobileMenuOpen ? 'visible' : ''}`}>
        <button
          className="btn position-absolute top-0 end-0 m-3 p-2 text-white"
          onClick={() => setMobileMenuOpen(false)}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="d-flex flex-column align-items-center gap-3 w-100 pt-5 px-3">
          {/* Mobile Search */}
          <div className="w-100 mb-3">
            <form onSubmit={handleSearchSubmit} className="position-relative">
              <input
                type="text"
                className="form-control search-bar w-100"
                placeholder="Search products..."
                value={localSearchQuery}
                onChange={handleSearchChange}
                style={{ fontSize: '0.9rem', height: '42px', paddingRight: '35px' }}
              />
              {localSearchQuery ? (
                <button
                  type="button"
                  className="btn btn-link position-absolute end-0 top-50 translate-middle-y text-muted p-0"
                  onClick={handleSearchClear}
                  style={{ right: '10px' }}
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <Search className="w-4 h-4 position-absolute end-0 top-50 translate-middle-y text-muted" style={{ right: '12px' }} />
              )}
            </form>
          </div>

          <button 
            className="btn btn-link text-white text-decoration-none hover-accent fs-5 border-0 w-100 text-center"
            onClick={() => handleNavigation('home')}
          >
            Home
          </button>
          <button 
            className="btn btn-link text-white text-decoration-none hover-accent fs-5 border-0 w-100 text-center"
            onClick={() => handleNavigation('products')}
          >
            Products
          </button>
          <button 
            className="btn btn-link text-white text-decoration-none hover-accent fs-5 border-0 w-100 text-center"
            onClick={() => handleNavigation('contact')}
          >
            Contact
          </button>

          {isAuthenticated ? (
            <div className="w-100 mt-3">
              {/* Mobile Profile Card */}
              <div className="profile-mobile-card p-3 mb-3 rounded w-100">
                <div className="d-flex align-items-center gap-3 mb-3">
                  {renderUserAvatar(currentUser, 'medium')}
                  <div className="flex-grow-1">
                    <div className="fw-bold text-white">{currentUser?.name || 'User'}</div>
                    <div className="text-white small">{currentUser?.email || ''}</div>
                  </div>
                  {!isEditing && (
                    <button
                      className="btn btn-outline-accent btn-sm d-flex align-items-center gap-1"
                      onClick={handleEditProfile}
                      style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                    >
                      <Edit className="w-3 h-3" />
                      Edit
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <div className="mb-3">
                    <h6 className="text-accent mb-2 fw-bold">EDIT PROFILE</h6>
                    
                    {/* Photo Upload Section - Mobile */}
                    <div className="photo-upload-section">
                      <div className="d-flex align-items-center gap-3 mb-2">
                        <div className="position-relative">
                          {renderUserAvatar(editedUser, 'large', true)}
                          <input
                            id="photo-upload-mobile"
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="d-none"
                            disabled={uploadingPhoto}
                          />
                        </div>
                        <div className="flex-grow-1">
                          <div className="text-sm text-white mb-2">Profile Photo</div>
                          <div className="d-flex gap-2 flex-wrap">
                            <label 
                              htmlFor="photo-upload-mobile" 
                              className="btn btn-outline-accent btn-sm d-flex align-items-center gap-1"
                            >
                              <Camera className="w-4 h-4" />
                              {editedUser?.photoURL ? 'Change Photo' : 'Upload Photo'}
                            </label>
                            {editedUser?.photoURL && (
                              <button
                                className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1"
                                onClick={handleRemovePhoto}
                              >
                                <X className="w-4 h-4" />
                                Remove
                              </button>
                            )}
                          </div>
                          <div className="text-white small mt-2">
                            Recommended: Square image, max 5MB
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="profile-edit-grid-mobile">
                      <div className="form-group-sm">
                        <label className="profile-info-label text-white">Full Name:</label>
                        <input
                          type="text"
                          className="form-control search-bar-transparent"
                          value={editedUser?.name || ''}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div className="form-group-sm">
                        <label className="profile-info-label text-white">Email:</label>
                        <input
                          type="email"
                          className="form-control search-bar-transparent"
                          value={editedUser?.email || ''}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="Enter your email"
                        />
                      </div>
                      <div className="form-group-sm">
                        <label className="profile-info-label text-white">Phone:</label>
                        <input
                          type="tel"
                          className="form-control search-bar-transparent"
                          value={editedUser?.phone || ''}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder="Enter 10-digit phone number"
                          maxLength={10}
                        />
                        {phoneError && (
                          <div className="text-danger small mt-1">{phoneError}</div>
                        )}
                        <div className="text-white small mt-1">
                          Phone number must be exactly 10 digits
                        </div>
                      </div>
                      <div className="form-group-sm">
                        <label className="profile-info-label text-white">Location:</label>
                        <input
                          type="text"
                          className="form-control search-bar-transparent"
                          value={editedUser?.location || ''}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          placeholder="Enter your location"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="profile-info-grid-mobile mb-3">
                    <div className="profile-info-item">
                      <span className="profile-info-label text-white">Member Since:</span>
                      <span className="profile-info-value text-white">{getMemberSince()}</span>
                    </div>
                    <div className="profile-info-item">
                      <span className="profile-info-label text-white">Status:</span>
                      <span className="status-badge-small">Certified</span>
                    </div>
                    {currentUser?.phone && (
                      <div className="profile-info-item">
                        <span className="profile-info-label text-white">Phone:</span>
                        <span className="profile-info-value text-white">{currentUser.phone}</span>
                      </div>
                    )}
                    {currentUser?.location && (
                      <div className="profile-info-item">
                        <span className="profile-info-label text-white">Location:</span>
                        <span className="profile-info-value text-white">{currentUser.location}</span>
                      </div>
                    )}
                  </div>
                )}

                {isEditing ? (
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-outline-light btn-sm flex-fill d-flex align-items-center justify-content-center gap-1"
                      onClick={handleCancelEdit}
                      disabled={saving || uploadingPhoto}
                    >
                      <CloseIcon className="w-4 h-4" />
                      Cancel
                    </button>
                    <button 
                      className="btn btn-primary btn-sm flex-fill d-flex align-items-center justify-content-center gap-1" 
                      onClick={handleSaveProfile}
                      disabled={saving || phoneError || uploadingPhoto}
                    >
                      {saving ? (
                        <>
                          <div className="spinner-border spinner-border-sm me-1" role="status"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Save
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="d-flex gap-2">
                    <button 
                      className="btn btn-primary btn-sm w-100 d-flex align-items-center justify-content-center gap-1" 
                      onClick={signOut}
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <button className="btn btn-outline-light w-100 py-2 text-sm border-0" onClick={() => auth('signin')}>
                Sign In
              </button>
              <button className="btn btn-primary w-100 py-2 mt-2 text-sm border-0" onClick={() => auth('signup')}>
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );

  // Render full navbar for non-product pages
  const renderFullNavbar = () => (
    <>
      {/* ---------- DESKTOP NAVBAR – ULTRA COMPACT SINGLE ROW ---------- */}
      <nav className="glass d-flex align-items-center px-2 py-1 fixed-top w-100 z-3 navbar" style={{ minHeight: '50px' }}>
        {/* ---- LEFT: LOGO + COMPANY ---- */}
        <div className="d-flex align-items-center flex-shrink-0 me-2">
          <div className="nav-logo nav-logo-compact">
            <img src="/img/icon2.png" alt="Logo" className="logo-img" style={{ height: '32px' }} />
          </div>
          <div className="ms-1">
            <div className="fw-bold accent mb-0 company-name-compact no-wrap">
              ATIRATH TRADERS INDIA PVT.LTD
            </div>
            <div className="opacity-75 company-tagline-compact no-wrap">
              Diverse Businesses, One Vision
            </div>
          </div>
        </div>

        {/* ---- CENTER: NAV LINKS ---- */}
        <div className="d-none d-md-flex align-items-center nav-links-compact flex-grow-1 justify-content-center">
          <button 
            className="btn btn-link text-white text-decoration-none hover-accent nav-link-btn border-0 no-wrap"
            onClick={() => handleNavigation('home')}
          >
            Home
          </button>
          <button 
            className="btn btn-link text-white text-decoration-none hover-accent nav-link-btn border-0 no-wrap"
            onClick={() => handleNavigation('about')}
          >
            About Us
          </button>
          <button 
            className="btn btn-link text-white text-decoration-none hover-accent nav-link-btn border-0 no-wrap"
            onClick={() => handleNavigation('leadership')}
          >
            Leadership
          </button>
          <button 
            className="btn btn-link text-white text-decoration-none hover-accent nav-link-btn border-0 no-wrap"
            onClick={() => handleNavigation('products')}
          >
            Products
          </button>
          <button 
            className="btn btn-link text-white text-decoration-none hover-accent nav-link-btn border-0 no-wrap"
            onClick={handleServices}
          >
            Services
          </button>
          <button 
            className="btn btn-link text-white text-decoration-none hover-accent nav-link-btn border-0 no-wrap"
            onClick={() => handleNavigation('blog')}
          >
            Blog
          </button>
          <button 
            className="btn btn-link text-white text-decoration-none hover-accent nav-link-btn border-0 no-wrap"
            onClick={() => handleNavigation('feedback')}
          >
            Feedback
          </button>
          <button 
            className="btn btn-link text-white text-decoration-none hover-accent nav-link-btn border-0 no-wrap"
            onClick={handleTermsPolicy}
          >
            Terms & Policy
          </button>
          <button 
            className="btn btn-link text-white text-decoration-none hover-accent nav-link-btn border-0 no-wrap"
            onClick={() => handleNavigation('contact')}
          >
            Contact
          </button>
        </div>

        {/* ---- RIGHT: SEARCH + AUTH ---- */}
        <div className="d-none d-md-flex align-items-center gap-1 flex-shrink-0 ms-auto">
          {/* Search (only on product pages) */}
          {showSearch && (
            <div className="search-compact me-1">
              <form onSubmit={handleSearchSubmit} className="position-relative">
                <input
                  type="text"
                  className="form-control search-bar"
                  placeholder="Search..."
                  value={localSearchQuery}
                  onChange={handleSearchChange}
                />
                {localSearchQuery ? (
                  <button
                    type="button"
                    className="btn btn-link position-absolute end-0 top-50 translate-middle-y text-muted p-0"
                    onClick={handleSearchClear}
                    style={{ right: '6px' }}
                  >
                    <X className="w-3 h-3" />
                  </button>
                ) : (
                  <Search className="w-3 h-3 position-absolute end-0 top-50 translate-middle-y text-muted" style={{ right: '8px' }} />
                )}
              </form>
            </div>
          )}

          {/* Join Us Button */}
          <button
            className="btn btn-success join-btn-compact d-flex align-items-center gap-1 me-1 no-wrap"
            style={{ 
              background: 'linear-gradient(135deg, #28a745, #20c997)',
              border: 'none',
              fontWeight: '600'
            }}
            onClick={handleJoinUs}
          >
            <Users className="w-3 h-3" />
            Join Us
          </button>

          {/* Auth Buttons */}
          {isAuthenticated ? (
            <div className="user-dropdown position-relative">
              <button
                className="btn btn-primary auth-btn d-flex align-items-center gap-1 no-wrap"
                onClick={toggleUser}
              >
                <User className="w-3 h-3" />
                {getUserNameInitials()}
              </button>

              {userDropdownOpen && (
                <div className="dropdown-menu show position-absolute end-0 mt-1 profile-dropdown-card" style={{ minWidth: '320px', maxWidth: '350px', fontSize: '0.8rem' }}>
                  {/* Profile Header */}
                  <div className="profile-dropdown-header p-2 border-bottom">
                    <div className="d-flex align-items-center gap-2">
                      {renderUserAvatar(currentUser, 'small')}
                      <div className="flex-grow-1">
                        <div className="fw-bold text-white text-xs-compact">{currentUser?.name || 'User'}</div>
                        <div className="text-muted text-xxs">{currentUser?.email || ''}</div>
                      </div>
                      {!isEditing && (
                        <button
                          className="btn btn-outline-accent btn-sm d-flex align-items-center gap-1"
                          onClick={handleEditProfile}
                          style={{ fontSize: '0.7rem', padding: '0.2rem 0.4rem' }}
                        >
                          <Edit className="w-3 h-3" />
                          Edit
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Account Information */}
                  {isEditing ? (
                    <div className="p-2 border-bottom">
                      <h6 className="text-accent mb-1 fw-bold text-xs-compact">EDIT PROFILE</h6>
                      
                      {/* Photo Upload Section - FIXED: Shows "Upload Photo" button */}
                      <div className="photo-upload-section">
                        <div className="d-flex align-items-center gap-3 mb-2">
                          <div className="position-relative">
                            {renderUserAvatar(editedUser, 'medium', true)}
                            <input
                              id="photo-upload"
                              type="file"
                              accept="image/*"
                              onChange={handlePhotoUpload}
                              className="d-none"
                              disabled={uploadingPhoto}
                            />
                          </div>
                          <div className="flex-grow-1">
                            <div className="text-sm text-muted mb-2">Profile Photo</div>
                            <div className="d-flex gap-2 flex-wrap">
                              <label 
                                htmlFor="photo-upload" 
                                className="btn btn-outline-accent btn-sm d-flex align-items-center gap-1"
                                style={{ fontSize: '0.75rem', padding: '0.4rem 0.6rem' }}
                              >
                                <Camera className="w-3 h-3" />
                                {editedUser?.photoURL ? 'Change Photo' : 'Upload Photo'}
                              </label>
                              {editedUser?.photoURL && (
                                <button
                                  className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1"
                                  onClick={handleRemovePhoto}
                                  style={{ fontSize: '0.75rem', padding: '0.4rem 0.6rem' }}
                                >
                                  <X className="w-3 h-3" />
                                  Remove
                                </button>
                              )}
                            </div>
                            <div className="text-muted text-xxs mt-2">
                              Recommended: Square image, max 5MB
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="profile-edit-grid">
                        <div className="form-group-sm">
                          <label className="profile-info-label text-xxs">Full Name:</label>
                          <input
                            type="text"
                            className="form-control search-bar-transparent"
                            value={editedUser?.name || ''}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            placeholder="Enter your full name"
                            style={{ fontSize: '0.75rem', padding: '0.3rem 0.5rem' }}
                          />
                        </div>
                        <div className="form-group-sm">
                          <label className="profile-info-label text-xxs">Email:</label>
                          <input
                            type="email"
                            className="form-control search-bar-transparent"
                            value={editedUser?.email || ''}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            placeholder="Enter your email"
                            style={{ fontSize: '0.75rem', padding: '0.3rem 0.5rem' }}
                          />
                        </div>
                        <div className="form-group-sm">
                          <label className="profile-info-label text-xxs">Phone:</label>
                          <input
                            type="tel"
                            className="form-control search-bar-transparent"
                            value={editedUser?.phone || ''}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            placeholder="Enter 10-digit phone number"
                            style={{ fontSize: '0.75rem', padding: '0.3rem 0.5rem' }}
                            maxLength={10}
                          />
                          {phoneError && (
                            <div className="text-danger text-xxs mt-1">{phoneError}</div>
                          )}
                          <div className="text-muted text-xxs mt-1">
                            Phone number must be exactly 10 digits
                          </div>
                        </div>
                        <div className="form-group-sm">
                          <label className="profile-info-label text-xxs">Location:</label>
                          <input
                            type="text"
                            className="form-control search-bar-transparent"
                            value={editedUser?.location || ''}
                            onChange={(e) => handleInputChange('location', e.target.value)}
                            placeholder="Enter your location"
                            style={{ fontSize: '0.75rem', padding: '0.3rem 0.5rem' }}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2 border-bottom">
                      <h6 className="text-accent mb-1 fw-bold text-xs-compact">ACCOUNT INFORMATION</h6>
                      <div className="profile-info-grid">
                        <div className="profile-info-item">
                          <span className="profile-info-label text-xxs">Full Name:</span>
                          <span className="profile-info-value text-xs-compact">{currentUser?.name || 'Not set'}</span>
                        </div>
                        <div className="profile-info-item">
                          <span className="profile-info-label text-xxs">Email:</span>
                          <span className="profile-info-value text-xs-compact">{currentUser?.email || 'Not set'}</span>
                        </div>
                        {currentUser?.phone && (
                          <div className="profile-info-item">
                            <span className="profile-info-label text-xxs">Phone:</span>
                            <span className="profile-info-value text-xs-compact">{currentUser.phone}</span>
                          </div>
                        )}
                        {currentUser?.location && (
                          <div className="profile-info-item">
                            <span className="profile-info-label text-xxs">Location:</span>
                            <span className="profile-info-value text-xs-compact">{currentUser.location}</span>
                          </div>
                        )}
                        <div className="profile-info-item">
                          <span className="profile-info-label text-xxs">Member Since:</span>
                          <span className="profile-info-value text-xs-compact">{getMemberSince()}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Account Status */}
                  <div className="p-2 border-bottom">
                    <h6 className="text-accent mb-1 fw-bold text-xs-compact">ACCOUNT STATUS</h6>
                    <div className="profile-info-item">
                      <span className="profile-info-label text-xxs">Status:</span>
                      <span className="status-badge-small" style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem' }}>Certified</span>
                    </div>
                  </div>

                  {/* Global Reach Info */}
                  <div className="p-2 border-bottom">
                    <div className="text-center">
                      <div className="text-accent fw-bold mb-1 text-xs-compact">Global Reach, Local Impact</div>
                      <div className="text-muted text-xxs">Serving customers across 42 countries</div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="p-2">
                    {isEditing ? (
                      <div className="d-flex gap-1">
                        <button
                          className="btn btn-outline-light btn-sm flex-fill d-flex align-items-center justify-content-center gap-1"
                          onClick={handleCancelEdit}
                          disabled={saving || uploadingPhoto}
                          style={{ fontSize: '0.7rem', padding: '0.3rem 0.4rem' }}
                        >
                          <CloseIcon className="w-3 h-3" />
                          Cancel
                        </button>
                        <button 
                          className="btn btn-primary btn-sm flex-fill d-flex align-items-center justify-content-center gap-1" 
                          onClick={handleSaveProfile}
                          disabled={saving || phoneError || uploadingPhoto}
                          style={{ fontSize: '0.7rem', padding: '0.3rem 0.4rem' }}
                        >
                          {saving ? (
                            <>
                              <div className="spinner-border spinner-border-sm me-1" role="status"></div>
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="w-3 h-3" />
                              Save
                            </>
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="d-flex gap-1">
                        <button 
                          className="btn btn-primary btn-sm w-100 d-flex align-items-center justify-content-center gap-1" 
                          onClick={signOut}
                          style={{ fontSize: '0.7rem', padding: '0.3rem 0.4rem' }}
                        >
                          <LogOut className="w-3 h-3" />
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="d-flex align-items-center auth-buttons-compact">
              <button
                className="btn btn-outline-light auth-btn no-wrap"
                onClick={() => auth('signin')}
              >
                Sign In
              </button>
              <button
                className="btn btn-primary auth-btn no-wrap"
                onClick={() => auth('signup')}
              >
                Sign Up
              </button>
            </div>
          )}
        </div>

        {/* ---- MOBILE TOGGLE ---- */}
        <div className="d-md-none d-flex align-items-center gap-1 ms-auto">
          {/* Mobile Profile Button - Always visible when authenticated */}
          {isAuthenticated && (
            <button
              className="btn btn-primary auth-btn d-flex align-items-center gap-1 no-wrap"
              onClick={toggleUser}
            >
              <User className="w-3 h-3" />
              {getUserNameInitials()}
            </button>
          )}
          
          <button
            id="menu-btn"
            className="btn p-1 accent border-0"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* ---------- MOBILE MENU ---------- */}
      <div className={`mobile-menu glass ${mobileMenuOpen ? 'visible' : ''}`}>
        <button
          className="btn position-absolute top-0 end-0 m-3 p-2 text-white"
          onClick={() => setMobileMenuOpen(false)}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="d-flex flex-column align-items-center gap-3 w-100 pt-5 px-3">
          {/* Mobile Search */}
          {showSearch && (
            <div className="w-100 mb-3">
              <form onSubmit={handleSearchSubmit} className="position-relative">
                <input
                  type="text"
                  className="form-control search-bar w-100"
                  placeholder="Search products..."
                  value={localSearchQuery}
                  onChange={handleSearchChange}
                  style={{ fontSize: '0.9rem', height: '42px', paddingRight: '35px' }}
                />
                {localSearchQuery ? (
                  <button
                    type="button"
                    className="btn btn-link position-absolute end-0 top-50 translate-middle-y text-muted p-0"
                    onClick={handleSearchClear}
                    style={{ right: '10px' }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : (
                  <Search className="w-4 h-4 position-absolute end-0 top-50 translate-middle-y text-muted" style={{ right: '12px' }} />
                )}
              </form>
            </div>
          )}

          <button 
            className="btn btn-link text-white text-decoration-none hover-accent fs-5 border-0 w-100 text-center"
            onClick={() => handleNavigation('home')}
          >
            Home
          </button>
          <button 
            className="btn btn-link text-white text-decoration-none hover-accent fs-5 border-0 w-100 text-center"
            onClick={() => handleNavigation('about')}
          >
            About Us
          </button>
          <button 
            className="btn btn-link text-white text-decoration-none hover-accent fs-5 border-0 w-100 text-center"
            onClick={() => handleNavigation('leadership')}
          >
            Leadership
          </button>
          <button 
            className="btn btn-link text-white text-decoration-none hover-accent fs-5 border-0 w-100 text-center"
            onClick={() => handleNavigation('products')}
          >
            Products
          </button>
          <button 
            className="btn btn-link text-white text-decoration-none hover-accent fs-5 border-0 w-100 text-center"
            onClick={handleServices}
          >
            Services
          </button>
          <button 
            className="btn btn-link text-white text-decoration-none hover-accent fs-5 border-0 w-100 text-center"
            onClick={() => handleNavigation('blog')}
          >
            Blog
          </button>
          <button 
            className="btn btn-link text-white text-decoration-none hover-accent fs-5 border-0 w-100 text-center"
            onClick={() => handleNavigation('feedback')}
          >
            Feedback
          </button>
          <button 
            className="btn btn-link text-white text-decoration-none hover-accent fs-5 border-0 w-100 text-center"
            onClick={handleTermsPolicy}
          >
            Terms & Policy
          </button>
          <button 
            className="btn btn-link text-white text-decoration-none hover-accent fs-5 border-0 w-100 text-center"
            onClick={() => handleNavigation('contact')}
          >
            Contact
          </button>

          {/* Join Us Button - Mobile */}
          <button
            className="btn btn-success w-100 py-2 mt-2 d-flex align-items-center justify-content-center gap-2 text-sm border-0"
            style={{ 
              background: 'linear-gradient(135deg, #28a745, #20c997)',
              border: 'none',
              fontWeight: '600'
            }}
            onClick={handleJoinUs}
          >
            <Users className="w-4 h-4" />
            Join Us
          </button>

          {isAuthenticated ? (
            <div className="w-100 mt-3">
              {/* Mobile Profile Card */}
              <div className="profile-mobile-card p-3 mb-3 rounded w-100">
                <div className="d-flex align-items-center gap-3 mb-3">
                  {renderUserAvatar(currentUser, 'medium')}
                  <div className="flex-grow-1">
                    <div className="fw-bold text-white">{currentUser?.name || 'User'}</div>
                    <div className="text-white small">{currentUser?.email || ''}</div>
                  </div>
                  {!isEditing && (
                    <button
                      className="btn btn-outline-accent btn-sm d-flex align-items-center gap-1"
                      onClick={handleEditProfile}
                      style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                    >
                      <Edit className="w-3 h-3" />
                      Edit
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <div className="mb-3">
                    <h6 className="text-accent mb-2 fw-bold">EDIT PROFILE</h6>
                    
                    {/* Photo Upload Section - Mobile - FIXED: Shows "Upload Photo" button */}
                    <div className="photo-upload-section">
                      <div className="d-flex align-items-center gap-3 mb-2">
                        <div className="position-relative">
                          {renderUserAvatar(editedUser, 'large', true)}
                          <input
                            id="photo-upload-mobile"
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="d-none"
                            disabled={uploadingPhoto}
                          />
                        </div>
                        <div className="flex-grow-1">
                          <div className="text-sm text-white mb-2">Profile Photo</div>
                          <div className="d-flex gap-2 flex-wrap">
                            <label 
                              htmlFor="photo-upload-mobile" 
                              className="btn btn-outline-accent btn-sm d-flex align-items-center gap-1"
                            >
                              <Camera className="w-4 h-4" />
                              {editedUser?.photoURL ? 'Change Photo' : 'Upload Photo'}
                            </label>
                            {editedUser?.photoURL && (
                              <button
                                className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1"
                                onClick={handleRemovePhoto}
                              >
                                <X className="w-4 h-4" />
                                Remove
                              </button>
                            )}
                          </div>
                          <div className="text-white small mt-2">
                            Recommended: Square image, max 5MB
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="profile-edit-grid-mobile">
                      <div className="form-group-sm">
                        <label className="profile-info-label text-white">Full Name:</label>
                        <input
                          type="text"
                          className="form-control search-bar-transparent"
                          value={editedUser?.name || ''}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div className="form-group-sm">
                        <label className="profile-info-label text-white">Email:</label>
                        <input
                          type="email"
                          className="form-control search-bar-transparent"
                          value={editedUser?.email || ''}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="Enter your email"
                        />
                      </div>
                      <div className="form-group-sm">
                        <label className="profile-info-label text-white">Phone:</label>
                        <input
                          type="tel"
                          className="form-control search-bar-transparent"
                          value={editedUser?.phone || ''}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder="Enter 10-digit phone number"
                          maxLength={10}
                        />
                        {phoneError && (
                          <div className="text-danger small mt-1">{phoneError}</div>
                        )}
                        <div className="text-white small mt-1">
                          Phone number must be exactly 10 digits
                        </div>
                      </div>
                      <div className="form-group-sm">
                        <label className="profile-info-label text-white">Location:</label>
                        <input
                          type="text"
                          className="form-control search-bar-transparent"
                          value={editedUser?.location || ''}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          placeholder="Enter your location"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="profile-info-grid-mobile mb-3">
                    <div className="profile-info-item">
                      <span className="profile-info-label text-white">Member Since:</span>
                      <span className="profile-info-value text-white">{getMemberSince()}</span>
                    </div>
                    <div className="profile-info-item">
                      <span className="profile-info-label text-white">Status:</span>
                      <span className="status-badge-small">Certified</span>
                    </div>
                    {currentUser?.phone && (
                      <div className="profile-info-item">
                        <span className="profile-info-label text-white">Phone:</span>
                        <span className="profile-info-value text-white">{currentUser.phone}</span>
                      </div>
                    )}
                    {currentUser?.location && (
                      <div className="profile-info-item">
                        <span className="profile-info-label text-white">Location:</span>
                        <span className="profile-info-value text-white">{currentUser.location}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="text-center text-white small mb-3">
                  <div>Global Reach, Local Impact</div>
                  <div>Serving customers across 42 countries</div>
                </div>

                {isEditing ? (
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-outline-light btn-sm flex-fill d-flex align-items-center justify-content-center gap-1"
                      onClick={handleCancelEdit}
                      disabled={saving || uploadingPhoto}
                    >
                      <CloseIcon className="w-4 h-4" />
                      Cancel
                    </button>
                    <button 
                      className="btn btn-primary btn-sm flex-fill d-flex align-items-center justify-content-center gap-1" 
                      onClick={handleSaveProfile}
                      disabled={saving || phoneError || uploadingPhoto}
                    >
                      {saving ? (
                        <>
                          <div className="spinner-border spinner-border-sm me-1" role="status"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Save
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="d-flex gap-2">
                    <button 
                      className="btn btn-primary btn-sm w-100 d-flex align-items-center justify-content-center gap-1" 
                      onClick={signOut}
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <button className="btn btn-outline-light w-100 py-2 text-sm border-0" onClick={() => auth('signin')}>
                Sign In
              </button>
              <button className="btn btn-primary w-100 py-2 mt-2 text-sm border-0" onClick={() => auth('signup')}>
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );

  return (
    <>
      {isProductPage ? renderProductPageNavbar() : renderFullNavbar()}

      {/* Overlay */}
      {mobileMenuOpen && (
        <div className="overlay active d-md-none" onClick={() => setMobileMenuOpen(false)}></div>
      )}
    </>
  );
};

export default Navbar;