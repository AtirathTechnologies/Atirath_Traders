import React, { useState, useEffect } from 'react';
import { Menu, X, User, LogOut, UserCircle, Search, Users, Briefcase, Edit, Save, X as CloseIcon } from 'lucide-react';
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
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(null);
  const [saving, setSaving] = useState(false);

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
      });
    }
  }, [currentUser]);

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
      }
      if (
        mobileMenuOpen &&
        !e.target.closest('.mobile-menu') &&
        !e.target.closest('#menu-btn')
      ) {
        setMobileMenuOpen(false);
        setIsEditing(false);
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
  };

  const auth = (type) => {
    onAuthNavigate(type);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setIsEditing(false);
  };

  const signOut = () => {
    onSignOut();
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    setIsEditing(false);
  };

  const toggleUser = (e) => {
    e.stopPropagation();
    setUserDropdownOpen((v) => !v);
    setIsEditing(false);
  };

  /* ---------- Edit Profile Handlers ---------- */
  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (currentUser) {
      setEditedUser({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        location: currentUser.location || '',
      });
    }
  };

  const handleSaveProfile = async () => {
    if (!editedUser?.name.trim()) {
      alert('Please enter your name');
      return;
    }

    setSaving(true);
    try {
      if (onProfileUpdate) {
        await onProfileUpdate(editedUser);
      }
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Error updating profile. Please try again.');
      console.error('Profile update error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEditedUser(prev => ({
      ...prev,
      [field]: value
    }));
  };

  /* ---------- Join Us handler ---------- */
  const handleJoinUs = () => {
    navigate('/join-us');
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setIsEditing(false);
  };

  /* ---------- Services handler ---------- */
  const handleServices = () => {
    navigate('/services');
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setIsEditing(false);
  };

  // Get initials for avatar
  const getInitials = (name) => {
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

  return (
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
                {currentUser?.name?.split(' ')[0] || 'User'}
              </button>

              {userDropdownOpen && (
                <div className="dropdown-menu show position-absolute end-0 mt-1 profile-dropdown-card" style={{ minWidth: '320px', maxWidth: '350px', fontSize: '0.8rem' }}>
                  {/* Profile Header */}
                  <div className="profile-dropdown-header p-2 border-bottom">
                    <div className="d-flex align-items-center gap-2">
                      <div className="avatar-circle-small">
                        <span className="avatar-initials-small">{getInitials(currentUser?.name || 'User')}</span>
                      </div>
                      <div className="flex-grow-1">
                        <div className="fw-bold text-white text-xs-compact">{currentUser?.name}</div>
                        <div className="text-muted text-xxs">{currentUser?.email}</div>
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
                            placeholder="Enter your phone"
                            style={{ fontSize: '0.75rem', padding: '0.3rem 0.5rem' }}
                          />
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
                          <span className="profile-info-value text-xs-compact">{currentUser?.name}</span>
                        </div>
                        <div className="profile-info-item">
                          <span className="profile-info-label text-xxs">Email:</span>
                          <span className="profile-info-value text-xs-compact">{currentUser?.email}</span>
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
                          disabled={saving}
                          style={{ fontSize: '0.7rem', padding: '0.3rem 0.4rem' }}
                        >
                          <CloseIcon className="w-3 h-3" />
                          Cancel
                        </button>
                        <button 
                          className="btn btn-primary btn-sm flex-fill d-flex align-items-center justify-content-center gap-1" 
                          onClick={handleSaveProfile}
                          disabled={saving}
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
                          className="btn btn-outline-light btn-sm flex-fill d-flex align-items-center justify-content-center gap-1"
                          onClick={() => {
                            handleNavigation('profile');
                            setUserDropdownOpen(false);
                          }}
                          style={{ fontSize: '0.7rem', padding: '0.3rem 0.4rem' }}
                        >
                          <UserCircle className="w-3 h-3" />
                          Profile
                        </button>
                        <button 
                          className="btn btn-primary btn-sm flex-fill d-flex align-items-center justify-content-center gap-1" 
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
        <button
          id="menu-btn"
          className="d-md-none btn p-1 accent border-0 ms-1"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu className="w-4 h-4" />
        </button>
      </nav>

      {/* ---------- MOBILE MENU ---------- */}
      <div className={`mobile-menu glass ${mobileMenuOpen ? 'visible' : ''}`}>
        <button
          className="btn position-absolute top-0 end-0 m-3 p-2 text-white"
          onClick={() => setMobileMenuOpen(false)}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="d-flex flex-column align-items-center gap-3 w-100 pt-5">
          {/* Mobile Search */}
          {showSearch && (
            <div className="w-100 px-3 mb-3">
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
            className="btn btn-link text-white text-decoration-none hover-accent fs-5 border-0"
            onClick={() => handleNavigation('home')}
          >
            Home
          </button>
          <button 
            className="btn btn-link text-white text-decoration-none hover-accent fs-5 border-0"
            onClick={() => handleNavigation('about')}
          >
            About Us
          </button>
          <button 
            className="btn btn-link text-white text-decoration-none hover-accent fs-5 border-0"
            onClick={() => handleNavigation('leadership')}
          >
            Leadership
          </button>
          <button 
            className="btn btn-link text-white text-decoration-none hover-accent fs-5 border-0"
            onClick={() => handleNavigation('products')}
          >
            Products
          </button>
          <button 
            className="btn btn-link text-white text-decoration-none hover-accent fs-5 border-0"
            onClick={handleServices}
          >
            Services
          </button>
          <button 
            className="btn btn-link text-white text-decoration-none hover-accent fs-5 border-0"
            onClick={() => handleNavigation('blog')}
          >
            Blog
          </button>
          <button 
            className="btn btn-link text-white text-decoration-none hover-accent fs-5 border-0"
            onClick={() => handleNavigation('feedback')}
          >
            Feedback
          </button>
          <button 
            className="btn btn-link text-white text-decoration-none hover-accent fs-5 border-0"
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
              <div className="profile-mobile-card p-3 mb-3 rounded">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="avatar-circle-small">
                    <span className="avatar-initials-small">{getInitials(currentUser?.name || 'User')}</span>
                  </div>
                  <div className="flex-grow-1">
                    <div className="fw-bold text-white">{currentUser?.name}</div>
                    <div className="text-muted small">{currentUser?.email}</div>
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
                    <div className="profile-edit-grid-mobile">
                      <div className="form-group-sm">
                        <label className="profile-info-label">Full Name:</label>
                        <input
                          type="text"
                          className="form-control search-bar-transparent"
                          value={editedUser?.name || ''}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div className="form-group-sm">
                        <label className="profile-info-label">Email:</label>
                        <input
                          type="email"
                          className="form-control search-bar-transparent"
                          value={editedUser?.email || ''}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="Enter your email"
                        />
                      </div>
                      <div className="form-group-sm">
                        <label className="profile-info-label">Phone:</label>
                        <input
                          type="tel"
                          className="form-control search-bar-transparent"
                          value={editedUser?.phone || ''}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder="Enter your phone number"
                        />
                      </div>
                      <div className="form-group-sm">
                        <label className="profile-info-label">Location:</label>
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
                      <span className="profile-info-label">Member Since:</span>
                      <span className="profile-info-value">{getMemberSince()}</span>
                    </div>
                    <div className="profile-info-item">
                      <span className="profile-info-label">Status:</span>
                      <span className="status-badge-small">Certified</span>
                    </div>
                    {currentUser?.phone && (
                      <div className="profile-info-item">
                        <span className="profile-info-label">Phone:</span>
                        <span className="profile-info-value">{currentUser.phone}</span>
                      </div>
                    )}
                    {currentUser?.location && (
                      <div className="profile-info-item">
                        <span className="profile-info-label">Location:</span>
                        <span className="profile-info-value">{currentUser.location}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="text-center text-muted small mb-3">
                  <div>Global Reach, Local Impact</div>
                  <div>Serving customers across 42 countries</div>
                </div>

                {isEditing ? (
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-outline-light btn-sm flex-fill d-flex align-items-center justify-content-center gap-1"
                      onClick={handleCancelEdit}
                      disabled={saving}
                    >
                      <CloseIcon className="w-4 h-4" />
                      Cancel
                    </button>
                    <button 
                      className="btn btn-primary btn-sm flex-fill d-flex align-items-center justify-content-center gap-1" 
                      onClick={handleSaveProfile}
                      disabled={saving}
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
                      className="btn btn-outline-light btn-sm flex-fill d-flex align-items-center justify-content-center gap-1"
                      onClick={() => {
                        handleNavigation('profile');
                        setMobileMenuOpen(false);
                      }}
                    >
                      <UserCircle className="w-4 h-4" />
                      My Profile
                    </button>
                    <button 
                      className="btn btn-primary btn-sm flex-fill d-flex align-items-center justify-content-center gap-1" 
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

      {/* Overlay */}
      {mobileMenuOpen && (
        <div className="overlay active d-md-none" onClick={() => setMobileMenuOpen(false)}></div>
      )}
    </>
  );
};

export default Navbar;