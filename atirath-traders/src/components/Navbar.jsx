import React, { useState, useEffect, useRef } from 'react';
import {
  Menu, X, User, LogOut, Search, Users,
  Briefcase, Edit, Save, X as CloseIcon, Camera, Truck,
  Home, Info, Users as UsersIcon, Package, Wrench, FileText,
  MessageCircle, Shield, Phone, ShoppingBag, PhoneCall,
  MapPin, Globe, Flag, Building, Clock, RefreshCw, Pause, CheckCircle, XCircle,
  ChevronDown, ShoppingCart, Minus, Plus, Trash2
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from './CartContext';

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
  newOrdersCount,
  onOrderViewed,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { getTotalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const userDropdownRef = useRef(null);
  const profileButtonRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const moreDropdownRef = useRef(null);
  const moreButtonRef = useRef(null);
  
  // Enhanced responsive states
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const [deviceType, setDeviceType] = useState('desktop');
  const [isMobileView, setIsMobileView] = useState(false);
  
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      
      if (width < 768) {
        setDeviceType('mobile');
        setIsMobileView(true);
      } else if (width >= 768 && width < 1024) {
        setDeviceType('tablet');
        setIsMobileView(true);
      } else {
        setDeviceType('desktop');
        setIsMobileView(false);
      }
      
      if (width >= 1024) {
        setMobileMenuOpen(false);
      }
    };
  
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  if (location.pathname.startsWith("/admin")) return null;
  
  const isProductsGridView = isProductPage;
  const isOnProductPage = location.pathname.startsWith('/product/');
  const showSearch = isOnProductPage && isProductsGridView;
  
  useEffect(() => {
    setLocalSearchQuery(globalSearchQuery || '');
  }, [globalSearchQuery, location.pathname]);
  
  useEffect(() => {
    if (currentUser) {
      let countryCode = currentUser.countryCode || '+91';
      if (currentUser.phone) {
        const phoneStr = currentUser.phone.toString();
        if (phoneStr.startsWith('+968')) countryCode = '+968';
        else if (phoneStr.startsWith('+44')) countryCode = '+44';
        else if (phoneStr.startsWith('+1')) countryCode = '+1';
        else if (phoneStr.startsWith('+971')) countryCode = '+971';
        else if (phoneStr.startsWith('+61')) countryCode = '+61';
        else if (phoneStr.startsWith('+91')) countryCode = '+91';
      }
      
      let phoneNumber = currentUser.phone || '';
      if (phoneNumber && countryCode) {
        phoneNumber = phoneNumber.replace(countryCode, '');
      }
      
      setEditedUser({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: phoneNumber,
        countryCode: countryCode,
        country: currentUser.country || 'India',
        state: currentUser.state || '',
        city: currentUser.city || '',
        pincode: currentUser.pincode || '',
        location: currentUser.location || '',
        photoURL: currentUser.photoURL || '',
        uid: currentUser.uid || '',
      });
    } else {
      setEditedUser(null);
    }
  }, [currentUser]);
  
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
  
  const countryNames = [
    'India', 'Oman', 'United Kingdom', 'United States', 'UAE',
    'Australia', 'Canada', 'Germany', 'France', 'Singapore',
    'Japan', 'China', 'Other'
  ];
  
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
  
  const handlePhoneCall = () => {
    window.open('tel:+917396007479', '_self');
  };
  
  const handleWhatsAppCall = () => {
    window.open('https://wa.me/+917396007479', '_blank');
  };
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownOpen &&
          userDropdownRef.current &&
          !userDropdownRef.current.contains(event.target) &&
          profileButtonRef.current &&
          !profileButtonRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
      
      if (mobileMenuOpen &&
          mobileMenuRef.current &&
          !mobileMenuRef.current.contains(event.target) &&
          !event.target.closest('#menu-btn')) {
        setMobileMenuOpen(false);
      }
      
      if (moreDropdownOpen &&
          moreDropdownRef.current &&
          !moreDropdownRef.current.contains(event.target) &&
          moreButtonRef.current &&
          !moreButtonRef.current.contains(event.target)) {
        setMoreDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [userDropdownOpen, mobileMenuOpen, moreDropdownOpen]);
  
  const handleNavigation = (section) => {
    onNavigate(section);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setMoreDropdownOpen(false);
    setIsEditing(false);
    setPhoneError('');
  };
  
  const auth = (type) => {
    onAuthNavigate(type);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setMoreDropdownOpen(false);
    setIsEditing(false);
    setPhoneError('');
  };
  
  const signOut = () => {
    onSignOut();
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    setMoreDropdownOpen(false);
    setIsEditing(false);
    setPhoneError('');
  };
  
  const toggleUser = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setUserDropdownOpen((prev) => !prev);
    setIsEditing(false);
    setPhoneError('');
    setMoreDropdownOpen(false);
  };
  
  const toggleMoreDropdown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setMoreDropdownOpen((prev) => !prev);
    setUserDropdownOpen(false);
  };
  
  const handleTermsPolicy = () => {
    navigate('/terms-policy');
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setMoreDropdownOpen(false);
    setIsEditing(false);
    setPhoneError('');
  };
  
  const handleEditProfile = () => {
    setIsEditing(true);
    setPhoneError('');
  };
  
  const handleCancelEdit = () => {
    setIsEditing(false);
    setPhoneError('');
    if (currentUser) {
      let countryCode = currentUser.countryCode || '+91';
      let phoneNumber = currentUser.phone || '';
      
      if (phoneNumber && countryCode) {
        phoneNumber = phoneNumber.replace(countryCode, '');
      }
      
      setEditedUser({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: phoneNumber,
        countryCode: countryCode,
        country: currentUser.country || 'India',
        state: currentUser.state || '',
        city: currentUser.city || '',
        pincode: currentUser.pincode || '',
        location: currentUser.location || '',
        photoURL: currentUser.photoURL || '',
      });
    }
  };
  
  const validatePhoneNumber = (phone, countryCode = '+91') => {
    if (!phone) {
      setPhoneError('Phone number is required');
      return false;
    }
    
    const cleanPhone = phone.replace(/\D/g, '');
    const selectedCountry = countries.find(c => c.code === countryCode);
    
    if (!selectedCountry) {
      setPhoneError('Please select a valid country');
      return false;
    }
    
    if (!selectedCountry.pattern.test(cleanPhone)) {
      setPhoneError(`Invalid ${selectedCountry.name} phone number format`);
      return false;
    }
    
    setPhoneError('');
    return true;
  };
  
  const handlePhoneChange = (value, countryCode) => {
    const selectedCountry = countries.find(c => c.code === countryCode);
    let formattedValue = value.replace(/\D/g, '');
    
    if (selectedCountry) {
      if (selectedCountry.code === '+91') formattedValue = formattedValue.slice(0, 10);
      else if (selectedCountry.code === '+968') formattedValue = formattedValue.slice(0, 8);
      else if (selectedCountry.code === '+44') formattedValue = formattedValue.slice(0, 11);
      else if (selectedCountry.code === '+1') formattedValue = formattedValue.slice(0, 10);
      else if (selectedCountry.code === '+971') formattedValue = formattedValue.slice(0, 9);
      else if (selectedCountry.code === '+61') formattedValue = formattedValue.slice(0, 9);
      else formattedValue = formattedValue.slice(0, 15);
    }
    
    setEditedUser(prev => ({
      ...prev,
      phone: formattedValue
    }));
    
    validatePhoneNumber(formattedValue, countryCode);
  };
  
  const handleSaveProfile = async () => {
    if (!editedUser?.name.trim()) {
      alert('Please enter your name');
      return;
    }
    
    const fullPhoneNumber = editedUser.countryCode + editedUser.phone;
    
    if (!validatePhoneNumber(editedUser.phone, editedUser.countryCode)) {
      alert('Please fix the phone number error before saving');
      return;
    }
    
    if (editedUser.pincode && !/^\d{4,10}$/.test(editedUser.pincode)) {
      alert('Please enter a valid pincode (4-10 digits)');
      return;
    }
    
    setSaving(true);
    try {
      const userDataForFirebase = {
        ...editedUser,
        phone: fullPhoneNumber,
        uid: currentUser.uid
      };
      
      if (onProfileUpdate) {
        await onProfileUpdate(userDataForFirebase);
      }
      
      setEditedUser(prev => ({
        ...prev,
        phone: editedUser.phone
      }));
      
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
      handlePhoneChange(value, editedUser?.countryCode || '+91');
    } else if (field === 'countryCode') {
      const selectedCountry = countries.find(c => c.code === value);
      setEditedUser(prev => ({
        ...prev,
        [field]: value,
        country: selectedCountry ? selectedCountry.name : prev.country
      }));
    } else {
      setEditedUser(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };
  
  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPEG, PNG, etc.)');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('Image size should be less than 2MB');
      return;
    }
    setUploadingPhoto(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const photoURL = e.target.result;
          const updatedUserData = {
            ...editedUser,
            photoURL: photoURL
          };
          setEditedUser(updatedUserData);
          if (isEditing) {
            alert('Photo will be saved when you click Save Profile.');
          }
          else if (currentUser && onProfileUpdate) {
            await onProfileUpdate(updatedUserData);
            alert('Profile photo updated successfully!');
          }
          setUploadingPhoto(false);
        } catch (error) {
          console.error('Photo processing error:', error);
          alert('Error processing image. Please try again.');
          setUploadingPhoto(false);
        }
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
  
  const handleRemovePhoto = async () => {
    if (!currentUser) return;
    try {
      const updatedUserData = {
        ...editedUser,
        photoURL: ''
      };
      setEditedUser(updatedUserData);
      if (!isEditing && onProfileUpdate) {
        await onProfileUpdate(updatedUserData);
        alert('Profile photo removed successfully!');
      }
    } catch (error) {
      console.error('Photo removal error:', error);
      alert('Error removing photo. Please try again.');
    }
  };
  
  const handleJoinUs = () => {
    navigate('/join-us');
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setMoreDropdownOpen(false);
    setIsEditing(false);
    setPhoneError('');
  };
  
  const handleServices = () => {
    navigate('/services');
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setMoreDropdownOpen(false);
    setIsEditing(false);
    setPhoneError('');
  };
  
  const handleTransport = () => {
    navigate('/transport');
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setMoreDropdownOpen(false);
    setIsEditing(false);
    setPhoneError('');
  };
  
  const handleLeadership = () => {
    navigate('/leadership');
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setMoreDropdownOpen(false);
    setIsEditing(false);
    setPhoneError('');
  };
  
  const handleBlog = () => {
    navigate('/blog');
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setMoreDropdownOpen(false);
    setIsEditing(false);
    setPhoneError('');
  };
  
  const handleCartClick = () => {
    navigate('/cart');
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setMoreDropdownOpen(false);
    setIsEditing(false);
    setPhoneError('');
  };

  // Handle My Orders click
  const handleMyOrdersClick = () => {
    console.log('📦 My Orders clicked - Navigating to /my-orders');
    navigate('/my-orders');
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setMoreDropdownOpen(false);
    setIsEditing(false);
    setPhoneError('');
  };
  
  const getInitials = (name) => {
    if (!name || typeof name !== 'string') return 'U';
    const names = name.trim().split(' ');
    return names
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  const getMemberSince = () => {
    if (!currentUser?.createdAt) return 'N/A';
    try {
      return new Date(currentUser.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'N/A';
    }
  };
  
  const getUserNameInitials = () => {
    if (!currentUser?.name) return 'U';
    return getInitials(currentUser.name);
  };
  
  const getCountryFlag = (country) => {
    const flags = {
      'India': '🇮🇳',
      'Oman': '🇴🇲',
      'United Kingdom': '🇬🇧',
      'United States': '🇺🇸',
      'UAE': '🇦🇪',
      'Australia': '🇦🇺',
      'Canada': '🇨🇦',
      'Germany': '🇩🇪',
      'France': '🇫🇷',
      'Singapore': '🇸🇬',
      'Japan': '🇯🇵',
      'China': '🇨🇳'
    };
    return flags[country] || '🌍';
  };
  
  const renderUserAvatar = (user, size = 'small', isInEditMode = false) => {
    const avatarClass = size === 'small' ? 'avatar-circle-small' :
                       size === 'large' ? 'avatar-circle-large' : 'avatar-circle';
    const initialsClass = size === 'small' ? 'avatar-initials-small' :
                         size === 'large' ? 'avatar-initials-large' : 'avatar-initials';
    const hasValidPhoto = user?.photoURL && user.photoURL.startsWith('data:image');
    
    if (hasValidPhoto) {
      return (
        <div className={`${avatarClass} avatar-with-photo`}>
          <img
            src={user.photoURL}
            alt={`${user.name}'s profile`}
            className="avatar-photo"
            onError={(e) => {
              e.target.style.display = 'none';
              const parent = e.target.parentElement;
              const fallback = document.createElement('div');
              fallback.className = initialsClass;
              fallback.textContent = getInitials(user?.name);
              parent.appendChild(fallback);
            }}
          />
          {!isInEditMode && (
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
        {!isInEditMode && (
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
  
  const renderNavbarButton = () => {
    if (!isAuthenticated || !currentUser) return null;
    const hasValidPhoto = currentUser?.photoURL && currentUser.photoURL.startsWith('data:image');
    
    return (
      <button
        ref={profileButtonRef}
        className="navbar-profile-btn"
        onClick={toggleUser}
        style={{
          background: 'transparent',
          border: 'none',
          width: '44px',
          height: '44px',
          minWidth: '44px',
          minHeight: '44px',
          overflow: 'hidden',
          borderRadius: '6px',
          position: 'relative',
          cursor: 'pointer',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
          zIndex: 1002
        }}
      >
        {hasValidPhoto ? (
          <img
            src={currentUser.photoURL}
            alt="Profile"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'block'
            }}
            onError={(e) => {
              e.target.style.display = 'none';
              const parent = e.target.parentElement;
              const fallback = document.createElement('div');
              fallback.style.cssText = `
                width: 100%;
                height: 100%;
                border-radius: 4px;
                background: linear-gradient(135deg, #8FB3E2, #31487A);
                color: white;
                font-size: 1.1rem;
                font-weight: bold;
                display: flex;
                align-items: center;
                justify-content: center;
              `;
              fallback.textContent = getUserNameInitials();
              parent.appendChild(fallback);
            }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '4px',
              background: 'linear-gradient(135deg, #8FB3E2, #31487A)',
              color: 'white',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {getUserNameInitials()}
          </div>
        )}
      </button>
    );
  };
  
  const renderMobileNavbarButton = () => {
    if (!isAuthenticated || !currentUser) return null;
    const hasValidPhoto = currentUser?.photoURL && currentUser.photoURL.startsWith('data:image');
    let buttonSize, fontSize;
    
    if (windowWidth < 400) {
      buttonSize = '32px';
      fontSize = '0.8rem';
    } else if (windowWidth < 768) {
      buttonSize = '36px';
      fontSize = '0.9rem';
    } else {
      buttonSize = '40px';
      fontSize = '1rem';
    }
    
    return (
      <button
        className="navbar-profile-btn"
        onClick={toggleUser}
        style={{
          background: 'transparent',
          border: 'none',
          width: buttonSize,
          height: buttonSize,
          minWidth: buttonSize,
          minHeight: buttonSize,
          overflow: 'hidden',
          borderRadius: '6px',
          position: 'relative',
          cursor: 'pointer',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
          zIndex: 1002
        }}
      >
        {hasValidPhoto ? (
          <img
            src={currentUser.photoURL}
            alt="Profile"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'block'
            }}
            onError={(e) => {
              e.target.style.display = 'none';
              const parent = e.target.parentElement;
              const fallback = document.createElement('div');
              fallback.style.cssText = `
                width: 100%;
                height: 100%;
                border-radius: 4px;
                background: linear-gradient(135deg, #8FB3E2, #31487A);
                color: white;
                font-size: ${fontSize};
                font-weight: bold;
                display: flex;
                align-items: center;
                justify-content: center;
              `;
              fallback.textContent = getUserNameInitials();
              parent.appendChild(fallback);
            }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '4px',
              background: 'linear-gradient(135deg, #8FB3E2, #31487A)',
              color: 'white',
              fontSize: fontSize,
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {getUserNameInitials()}
          </div>
        )}
      </button>
    );
  };
  
  const renderProfileEditSection = () => (
    <div className="p-3 border-bottom">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="text-accent mb-0 fw-bold" style={{ fontSize: '0.9rem' }}>EDIT PROFILE</h6>
        <button
          className="btn btn-sm btn-outline-light"
          onClick={handleCancelEdit}
          style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}
        >
          <CloseIcon className="w-3 h-3 me-1" />
          Cancel
        </button>
      </div>
      
      <div className="photo-upload-section mb-3">
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
            <div className="text-sm text-muted mb-2" style={{ fontSize: '0.75rem' }}>Profile Photo</div>
            <div className="d-flex gap-2 flex-wrap">
              <label
                htmlFor="photo-upload"
                className="btn btn-outline-accent btn-sm"
                style={{ fontSize: '0.75rem', padding: '0.4rem 0.6rem' }}
                disabled={uploadingPhoto}
              >
                <Camera className="w-3 h-3 me-1" />
                {uploadingPhoto ? 'Uploading...' : (editedUser?.photoURL ? 'Change Photo' : 'Upload Photo')}
              </label>
              {editedUser?.photoURL && (
                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={handleRemovePhoto}
                  style={{ fontSize: '0.75rem', padding: '0.4rem 0.6rem' }}
                  disabled={uploadingPhoto}
                >
                  <X className="w-3 h-3 me-1" />
                  Remove
                </button>
              )}
            </div>
            <div className="text-muted mt-2" style={{ fontSize: '0.7rem' }}>
              Recommended: Square image, max 2MB
            </div>
          </div>
        </div>
      </div>
      
      <div className="profile-edit-grid" style={{
        display: 'grid',
        gridTemplateColumns: windowWidth < 480 ? '1fr' : '1fr 1fr',
        gap: '10px'
      }}>
        <div className="form-group-sm">
          <label className="profile-info-label" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '3px' }}>Full Name:</label>
          <input
            type="text"
            className="form-control"
            value={editedUser?.name || ''}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter your full name"
            style={{
              fontSize: '0.75rem',
              padding: '0.3rem 0.5rem',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(143, 179, 226, 0.3)',
              color: 'white',
              borderRadius: '4px'
            }}
          />
        </div>
        
        <div className="form-group-sm">
          <label className="profile-info-label" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '3px' }}>Email:</label>
          <input
            type="email"
            className="form-control"
            value={editedUser?.email || ''}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="Enter your email"
            style={{
              fontSize: '0.75rem',
              padding: '0.3rem 0.5rem',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(143, 179, 226, 0.3)',
              color: 'white',
              borderRadius: '4px'
            }}
          />
        </div>
        
        <div className="form-group-sm">
          <label className="profile-info-label" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '3px' }}>Country Code:</label>
          <select
            className="form-control"
            value={editedUser?.countryCode || '+91'}
            onChange={(e) => handleInputChange('countryCode', e.target.value)}
            style={{
              fontSize: '0.75rem',
              padding: '0.3rem 0.5rem',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(143, 179, 226, 0.3)',
              color: 'white',
              borderRadius: '4px'
            }}
          >
            {countries.map((country) => (
              <option key={country.code} value={country.code}>
                {country.flag} {country.name} ({country.code})
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group-sm">
          <label className="profile-info-label" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '3px' }}>Phone Number:</label>
          <input
            type="tel"
            className="form-control"
            value={editedUser?.phone || ''}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="Enter phone number"
            style={{
              fontSize: '0.75rem',
              padding: '0.3rem 0.5rem',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(143, 179, 226, 0.3)',
              color: 'white',
              borderRadius: '4px'
            }}
          />
          {phoneError && (
            <div className="text-danger mt-1" style={{ fontSize: '0.7rem' }}>{phoneError}</div>
          )}
        </div>
        
        <div className="form-group-sm">
          <label className="profile-info-label" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '3px' }}>Country:</label>
          <select
            className="form-control"
            value={editedUser?.country || 'India'}
            onChange={(e) => handleInputChange('country', e.target.value)}
            style={{
              fontSize: '0.75rem',
              padding: '0.3rem 0.5rem',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(143, 179, 226, 0.3)',
              color: 'white',
              borderRadius: '4px'
            }}
          >
            {countryNames.map((countryName) => (
              <option key={countryName} value={countryName}>{countryName}</option>
            ))}
          </select>
        </div>
        
        <div className="form-group-sm">
          <label className="profile-info-label" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '3px' }}>State/Province:</label>
          <input
            type="text"
            className="form-control"
            value={editedUser?.state || ''}
            onChange={(e) => handleInputChange('state', e.target.value)}
            placeholder="Enter state"
            style={{
              fontSize: '0.75rem',
              padding: '0.3rem 0.5rem',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(143, 179, 226, 0.3)',
              color: 'white',
              borderRadius: '4px'
            }}
          />
        </div>
        
        <div className="form-group-sm">
          <label className="profile-info-label" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '3px' }}>City/Town:</label>
          <input
            type="text"
            className="form-control"
            value={editedUser?.city || ''}
            onChange={(e) => handleInputChange('city', e.target.value)}
            placeholder="Enter city"
            style={{
              fontSize: '0.75rem',
              padding: '0.3rem 0.5rem',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(143, 179, 226, 0.3)',
              color: 'white',
              borderRadius: '4px'
            }}
          />
        </div>
        
        <div className="form-group-sm">
          <label className="profile-info-label" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '3px' }}>Pincode/ZIP:</label>
          <input
            type="text"
            className="form-control"
            value={editedUser?.pincode || ''}
            onChange={(e) => handleInputChange('pincode', e.target.value)}
            placeholder="Enter pincode"
            style={{
              fontSize: '0.75rem',
              padding: '0.3rem 0.5rem',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(143, 179, 226, 0.3)',
              color: 'white',
              borderRadius: '4px'
            }}
          />
        </div>
      </div>
      
      <div className="mt-4">
        <button
          className="btn btn-primary w-100 d-flex align-items-center justify-content-center"
          onClick={handleSaveProfile}
          disabled={saving || phoneError || uploadingPhoto}
          style={{
            fontSize: '0.8rem',
            padding: '0.5rem',
            background: '#8FB3E2',
            border: 'none',
            borderRadius: '6px',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          {saving ? (
            <>
              <div className="spinner-border spinner-border-sm me-2" role="status"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 me-2" />
              Save Profile
            </>
          )}
        </button>
      </div>
    </div>
  );
  
  const renderProfileDisplaySection = () => {
    return (
      <div className="p-3 border-bottom">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="text-accent mb-0 fw-bold" style={{ fontSize: '0.9rem' }}>ACCOUNT INFORMATION</h6>
          <button
            className="btn btn-sm btn-outline-accent"
            onClick={handleEditProfile}
            style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}
          >
            <Edit className="w-3 h-3 me-1" />
            Edit
          </button>
        </div>
        <div className="profile-info-grid" style={{
          display: 'grid',
          gridTemplateColumns: windowWidth < 480 ? '1fr' : '1fr 1fr',
          gap: '10px'
        }}>
          <div className="profile-info-item">
            <span className="profile-info-label" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '2px', color: '#8FB3E2' }}>Full Name:</span>
            <span className="profile-info-value" style={{ fontSize: '0.8rem', fontWeight: '500', color: 'white' }}>{currentUser?.name || 'Not set'}</span>
          </div>
          <div className="profile-info-item">
            <span className="profile-info-label" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '2px', color: '#8FB3E2' }}>Email:</span>
            <span className="profile-info-value" style={{ fontSize: '0.8rem', fontWeight: '500', color: 'white' }}>{currentUser?.email || 'Not set'}</span>
          </div>
          <div className="profile-info-item">
            <span className="profile-info-label" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '2px', color: '#8FB3E2' }}>Phone:</span>
            <span className="profile-info-value" style={{ fontSize: '0.8rem', fontWeight: '500', color: 'white' }}>
              {currentUser?.phone || 'Not set'}
            </span>
          </div>
          <div className="profile-info-item">
            <span className="profile-info-label" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '2px', color: '#8FB3E2' }}>Country:</span>
            <span className="profile-info-value" style={{ fontSize: '0.8rem', fontWeight: '500', color: 'white' }}>
              {getCountryFlag(currentUser?.country)} {currentUser?.country || 'Not set'}
            </span>
          </div>
          <div className="profile-info-item">
            <span className="profile-info-label" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '2px', color: '#8FB3E2' }}>State:</span>
            <span className="profile-info-value" style={{ fontSize: '0.8rem', fontWeight: '500', color: 'white' }}>{currentUser?.state || 'Not set'}</span>
          </div>
          <div className="profile-info-item">
            <span className="profile-info-label" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '2px', color: '#8FB3E2' }}>City:</span>
            <span className="profile-info-value" style={{ fontSize: '0.8rem', fontWeight: '500', color: 'white' }}>{currentUser?.city || 'Not set'}</span>
          </div>
          <div className="profile-info-item">
            <span className="profile-info-label" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '2px', color: '#8FB3E2' }}>Pincode:</span>
            <span className="profile-info-value" style={{ fontSize: '0.8rem', fontWeight: '500', color: 'white' }}>{currentUser?.pincode || 'Not set'}</span>
          </div>
          <div className="profile-info-item">
            <span className="profile-info-label" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '2px', color: '#8FB3E2' }}>Member Since:</span>
            <span className="profile-info-value" style={{ fontSize: '0.8rem', fontWeight: '500', color: 'white' }}>{getMemberSince()}</span>
          </div>
        </div>
      </div>
    );
  };
  
  // More Dropdown (without My Orders - moved to main nav)
  const renderMoreDropdown = () => {
    if (!moreDropdownOpen) return null;
    
    const dropdownItems = [
      { icon: Info, label: 'About Us', onClick: () => handleNavigation('about') },
      { icon: Users, label: 'Join Us', onClick: handleJoinUs },
      { icon: UsersIcon, label: 'Leadership', onClick: handleLeadership },
      { icon: Wrench, label: 'Services', onClick: handleServices },
      { icon: FileText, label: 'Blog', onClick: handleBlog },
      { icon: Shield, label: 'Terms & Policy', onClick: handleTermsPolicy },
      { icon: Truck, label: 'Transport', onClick: handleTransport },
      // My Orders removed from here - now in main nav
    ];
    
    return (
      <div
        ref={moreDropdownRef}
        className="more-dropdown-card"
        style={{
          position: 'absolute',
          top: '100%',
          right: '0',
          minWidth: '180px',
          zIndex: 1100,
          background: 'rgba(30, 30, 40, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(143, 179, 226, 0.2)',
          borderRadius: '8px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          animation: 'fadeIn 0.2s ease-out',
          marginTop: '8px'
        }}
      >
        <div className="py-2">
          {dropdownItems.map(({ icon: Icon, label, onClick }) => (
            <button
              key={label}
              className="more-dropdown-item"
              onClick={onClick}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: 'transparent',
                border: 'none',
                color: 'white',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = 'rgba(143, 179, 226, 0.1)';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>
    );
  };
  
  const renderProfileDropdown = () => {
    if (!userDropdownOpen) return null;
    
    const dropdownWidth = windowWidth < 480 ? '95%' : (windowWidth < 768 ? '90%' : '350px');
    const dropdownMaxWidth = windowWidth < 480 ? '350px' : '400px';
    
    return (
      <div
        ref={userDropdownRef}
        className="profile-dropdown-card"
        style={{
          position: 'fixed',
          top: windowWidth < 480 ? '50px' : (windowWidth < 768 ? '54px' : '60px'),
          right: windowWidth < 480 ? '2.5%' : '10px',
          width: dropdownWidth,
          maxWidth: dropdownMaxWidth,
          fontSize: '0.8rem',
          zIndex: 1100,
          background: 'rgba(30, 30, 40, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(143, 179, 226, 0.2)',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          animation: 'fadeIn 0.2s ease-out',
          marginTop: '8px'
        }}
      >
        <div className="profile-dropdown-header p-3 border-bottom">
          <div className="d-flex align-items-center gap-3">
            {renderUserAvatar(currentUser, 'small', isEditing)}
            <div className="flex-grow-1">
              <div className="fw-bold text-white" style={{ fontSize: '1rem' }}>{currentUser?.name || 'User'}</div>
              <div className="text-muted" style={{ fontSize: '0.75rem' }}>{currentUser?.email || ''}</div>
            </div>
          </div>
        </div>
        
        {isEditing ? renderProfileEditSection() : renderProfileDisplaySection()}
        
        {!isEditing && (
          <div className="p-3">
            {/* My Orders button in profile dropdown */}
            <button
              className="btn w-100 d-flex align-items-center justify-content-center mb-2"
              onClick={handleMyOrdersClick}
              style={{
                fontSize: '0.8rem',
                padding: '0.5rem',
                background: '#8FB3E2',
                border: 'none',
                borderRadius: '6px',
                color: 'white',
                cursor: 'pointer',
                marginBottom: '8px'
              }}
            >
              <ShoppingBag className="w-4 h-4 me-2" />
              My Orders {newOrdersCount > 0 && `(${newOrdersCount} new)`}
            </button>
            
            <button
              className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center"
              onClick={signOut}
              style={{
                fontSize: '0.8rem',
                padding: '0.5rem',
                borderColor: '#f44336',
                color: '#f44336',
                background: 'transparent',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              <LogOut className="w-4 h-4 me-2" />
              Sign Out
            </button>
          </div>
        )}
      </div>
    );
  };
  
  // Mobile Menu (with My Orders)
  const renderMobileMenu = () => {
    if (!mobileMenuOpen) return null;
    
    const mobileLinks = [
      { icon: Home, label: 'Home', onClick: () => handleNavigation('home') },
      { icon: Info, label: 'About Us', onClick: () => handleNavigation('about') },
      { icon: Package, label: 'Products', onClick: () => handleNavigation('products') },
      { icon: Phone, label: 'Contact', onClick: () => handleNavigation('contact') },
      // My Orders in mobile menu
      { icon: ShoppingBag, label: 'My Orders', onClick: handleMyOrdersClick, highlight: true },
      { icon: UsersIcon, label: 'Leadership', onClick: handleLeadership },
      { icon: Wrench, label: 'Services', onClick: handleServices },
      { icon: FileText, label: 'Blog', onClick: handleBlog },
      { icon: Shield, label: 'Terms & Policy', onClick: handleTermsPolicy },
      { icon: Truck, label: 'Transport', onClick: handleTransport },
      { icon: ShoppingCart, label: 'Cart', onClick: handleCartClick },
    ];
    
    const menuWidth = windowWidth < 480 ? '90%' : (windowWidth < 768 ? '85%' : '350px');
    
    return (
      <div
        ref={mobileMenuRef}
        className="mobile-menu-overlay"
        onClick={(e) => {
          if (e.target.className === 'mobile-menu-overlay' || e.target.closest('.mobile-menu-overlay')) {
            setMobileMenuOpen(false);
          }
        }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1300,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'flex-end',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          animation: 'fadeIn 0.3s ease'
        }}
      >
        <div
          className="mobile-menu-content"
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundColor: 'rgba(30, 30, 40, 0.95)',
            backdropFilter: 'blur(20px)',
            borderLeft: '1px solid rgba(143, 179, 226, 0.2)',
            width: menuWidth,
            height: '100%',
            overflowY: 'auto',
            animation: 'slideInRight 0.3s ease'
          }}
        >
          <div className="mobile-menu-header p-3" style={{
            borderBottom: '1px solid rgba(143, 179, 226, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            background: 'rgba(0, 0, 0, 0.2)'
          }}>
            <button
              className="btn p-1"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                color: '#8FB3E2',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="mobile-menu-body p-3">
            {isAuthenticated && currentUser && (
              <div className="mb-4 p-3 rounded" style={{
                background: 'rgba(143, 179, 226, 0.1)',
                border: '1px solid rgba(143, 179, 226, 0.2)'
              }}>
                <div className="d-flex align-items-center gap-3 mb-2">
                  {renderUserAvatar(currentUser, 'small')}
                  <div>
                    <div className="fw-bold text-white" style={{ fontSize: '0.9rem' }}>{currentUser.name}</div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>{currentUser.email}</div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mb-4">
              <h6 className="text-accent mb-3" style={{
                fontSize: '0.9rem',
                fontWeight: 'bold',
                color: '#8FB3E2',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                Navigation
              </h6>
              <div className="d-flex flex-column gap-2">
                {mobileLinks.map(({ icon: Icon, label, onClick, highlight }) => (
                  <button
                    key={label}
                    className="mobile-menu-link"
                    onClick={onClick}
                    style={{
                      fontSize: '0.95rem',
                      padding: '0.85rem 1rem',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      background: highlight ? 'rgba(143, 179, 226, 0.2)' : 'transparent',
                      border: highlight ? '1px solid #8FB3E2' : 'none',
                      color: highlight ? '#8FB3E2' : 'white',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      cursor: 'pointer',
                      borderRadius: '6px',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.backgroundColor = highlight ? 'rgba(143, 179, 226, 0.3)' : 'rgba(143, 179, 226, 0.1)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.backgroundColor = highlight ? 'rgba(143, 179, 226, 0.2)' : 'transparent';
                    }}
                  >
                    <Icon className="w-5 h-5" style={{ color: highlight ? '#8FB3E2' : '#8FB3E2' }} />
                    {label}
                    {highlight && newOrdersCount > 0 && (
                      <span className="badge" style={{
                        background: '#ff0000',
                        color: 'white',
                        borderRadius: '12px',
                        padding: '2px 8px',
                        fontSize: '0.7rem',
                        marginLeft: 'auto'
                      }}>
                        {newOrdersCount} new
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-4">
              <button
                className="btn w-100"
                onClick={handleJoinUs}
                style={{
                  background: 'linear-gradient(135deg, #28a745, #20c997)',
                  border: 'none',
                  fontWeight: '600',
                  fontSize: '0.95rem',
                  padding: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'transform 0.2s'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'scale(1.02)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'scale(1)';
                }}
              >
                <Users className="w-5 h-5" />
                Join Us
              </button>
            </div>
            
            {!isAuthenticated && (
              <div className="mb-4">
                <h6 className="text-accent mb-3" style={{
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  color: '#8FB3E2',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  Account
                </h6>
                <div className="d-flex flex-column gap-2">
                  <button
                    className="btn w-100"
                    onClick={() => auth('signin')}
                    style={{
                      fontSize: '0.95rem',
                      padding: '0.85rem',
                      background: 'transparent',
                      border: '1px solid rgba(143, 179, 226, 0.5)',
                      borderRadius: '8px',
                      color: '#8FB3E2',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.backgroundColor = 'rgba(143, 179, 226, 0.1)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                    }}
                  >
                    <User className="w-5 h-5 me-2" />
                    Sign In
                  </button>
                  <button
                    className="btn w-100"
                    onClick={() => auth('signup')}
                    style={{
                      fontSize: '0.95rem',
                      padding: '0.85rem',
                      background: '#8FB3E2',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.backgroundColor = '#7a9fd1';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.backgroundColor = '#8FB3E2';
                    }}
                  >
                    <User className="w-5 h-5 me-2" />
                    Sign Up
                  </button>
                </div>
              </div>
            )}
            
            {isAuthenticated && (
              <div className="mb-4">
                <button
                  className="btn w-100"
                  onClick={signOut}
                  style={{
                    fontSize: '0.95rem',
                    padding: '0.85rem',
                    background: 'transparent',
                    border: '1px solid #f44336',
                    borderRadius: '8px',
                    color: '#f44336',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = 'rgba(244, 67, 54, 0.1)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                  }}
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </div>
            )}
            
            <div className="mt-4 pt-4 border-top" style={{ borderColor: 'rgba(143, 179, 226, 0.2)' }}>
              <h6 className="text-accent mb-3" style={{
                fontSize: '0.9rem',
                fontWeight: 'bold',
                color: '#8FB3E2',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                Contact Us
              </h6>
              <div className="d-flex flex-column gap-2">
                <button
                  className="btn w-100"
                  onClick={handlePhoneCall}
                  style={{
                    fontSize: '0.95rem',
                    padding: '0.85rem',
                    background: 'transparent',
                    border: '1px solid #8FB3E2',
                    borderRadius: '8px',
                    color: '#8FB3E2',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = 'rgba(143, 179, 226, 0.1)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                  }}
                >
                  <PhoneCall className="w-5 h-5 me-2" />
                  Call Now
                </button>
                <button
                  className="btn w-100"
                  onClick={handleWhatsAppCall}
                  style={{
                    fontSize: '0.95rem',
                    padding: '0.85rem',
                    background: 'transparent',
                    border: '1px solid #28a745',
                    borderRadius: '8px',
                    color: '#28a745',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = 'rgba(40, 167, 69, 0.1)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                  }}
                >
                  <MessageCircle className="w-5 h-5 me-2" />
                  WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  const renderDesktopView = () => {
    if (isMobileView) return null;
    
    const desktopLinks = [
      { icon: Home, label: 'Home', onClick: () => handleNavigation('home') },
      { icon: Package, label: 'Products', onClick: () => handleNavigation('products') },
      { icon: Phone, label: 'Contact', onClick: () => handleNavigation('contact') },
      // ADDED: My Orders button next to Contact
      { icon: ShoppingBag, label: 'My Orders', onClick: handleMyOrdersClick, highlight: true },
    ];
    
    const navbarHeight = windowWidth < 1200 ? '58px' : '60px';
    const fontSize = windowWidth < 1200 ? '0.9rem' : '0.95rem';
    const logoHeight = windowWidth < 1200 ? '40px' : '42px';
    const companyNameSize = windowWidth < 1200 ? '1rem' : '1.1rem';
    const companySubtitleSize = windowWidth < 1200 ? '0.85rem' : '0.9rem';
    const taglineSize = windowWidth < 1200 ? '0.7rem' : '0.75rem';
    
    return (
      <nav className="navbar glass" style={{
        display: 'flex',
        alignItems: 'center',
        padding: windowWidth < 1200 ? '0 0.8rem' : '0 1rem',
        height: navbarHeight,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: 'rgba(30, 30, 40, 0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(143, 179, 226, 0.2)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
          marginRight: windowWidth < 1200 ? '0.8rem' : '1rem'
        }}>
          <div style={{ marginRight: windowWidth < 1200 ? '0.4rem' : '0.5rem' }}>
            <img src="/img/icon2.png" alt="Logo" style={{ height: logoHeight }} />
          </div>
          <div>
            <div className="fw-bold mb-0" style={{
              fontSize: companyNameSize,
              lineHeight: '1.1',
              color: '#8FB3E2'
            }}>
              ATIRATH TRADERS
            </div>
            <div className="fw-bold mb-0" style={{
              fontSize: companySubtitleSize,
              lineHeight: '1.1',
              color: '#8FB3E2'
            }}>
              INDIA PVT.LTD
            </div>
            <div style={{
              fontSize: taglineSize,
              lineHeight: '1.1',
              color: 'white',
              opacity: '0.8'
            }}>
              Diverse Businesses, One Vision
            </div>
          </div>
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          flexGrow: 1,
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          {desktopLinks.map(({ icon: Icon, label, onClick, highlight }) => (
            <button
              key={label}
              className="nav-link-btn"
              onClick={onClick}
              style={{
                fontSize: fontSize,
                padding: windowWidth < 1200 ? '0.5rem 0.7rem' : '0.6rem 0.8rem',
                background: highlight ? 'rgba(143, 179, 226, 0.2)' : 'transparent',
                border: highlight ? '1px solid #8FB3E2' : 'none',
                borderRadius: '6px',
                color: highlight ? '#8FB3E2' : 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all 0.2s',
                margin: '0 2px'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = highlight ? 'rgba(143, 179, 226, 0.3)' : 'rgba(143, 179, 226, 0.1)';
                if (!highlight) e.target.style.color = '#8FB3E2';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = highlight ? 'rgba(143, 179, 226, 0.2)' : 'transparent';
                if (!highlight) e.target.style.color = 'white';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <Icon className="w-4 h-4" />
              {label}
              {highlight && newOrdersCount > 0 && (
                <span className="badge" style={{
                  background: '#ff0000',
                  color: 'white',
                  borderRadius: '12px',
                  padding: '2px 6px',
                  fontSize: '0.7rem',
                  marginLeft: '4px'
                }}>
                  {newOrdersCount}
                </span>
              )}
            </button>
          ))}
          
          <div style={{ position: 'relative' }}>
            <button
              ref={moreButtonRef}
              className="nav-link-btn"
              onClick={toggleMoreDropdown}
              style={{
                fontSize: fontSize,
                padding: windowWidth < 1200 ? '0.5rem 0.7rem' : '0.6rem 0.8rem',
                background: 'transparent',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.target.style.color = '#8FB3E2';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseOut={(e) => {
                e.target.style.color = 'white';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              More
              <ChevronDown className="w-4 h-4" />
            </button>
            {renderMoreDropdown()}
          </div>
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: showSearch ? '10px' : '20px',
          flexShrink: 0,
          marginLeft: 'auto'
        }}>
          {/* Cart Icon */}
          <button
            className="cart-icon-btn"
            onClick={handleCartClick}
            style={{
              position: 'relative',
              background: 'transparent',
              border: 'none',
              width: '44px',
              height: '44px',
              borderRadius: '6px',
              cursor: 'pointer',
              color: 'white',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = '#8FB3E2';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <ShoppingCart className="w-6 h-6" />
            {getTotalItems() > 0 && (
              <span 
                className="cart-badge"
                style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-5px',
                  background: '#ff0000',
                  color: 'white',
                  borderRadius: '50%',
                  width: '22px',
                  height: '22px',
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid white',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
                  textShadow: '1px 1px 1px rgba(0,0,0,0.5)',
                  zIndex: 1001
                }}
              >
                {getTotalItems() > 99 ? '99+' : getTotalItems()}
              </span>
            )}
          </button>
          
          {showSearch && (
            <div style={{
              minWidth: windowWidth < 1200 ? '160px' : '180px',
              flexShrink: 1,
              marginRight: windowWidth < 1200 ? '0.4rem' : '0.5rem'
            }}>
              <form onSubmit={handleSearchSubmit} style={{ position: 'relative', width: '100%' }}>
                <input
                  type="text"
                  className="search-bar"
                  placeholder="Search products..."
                  value={localSearchQuery}
                  onChange={handleSearchChange}
                  style={{
                    fontSize: windowWidth < 1200 ? '0.85rem' : '0.9rem',
                    height: windowWidth < 1200 ? '36px' : '38px',
                    width: '100%',
                    padding: windowWidth < 1200 ? '0.4rem 1.8rem 0.4rem 0.7rem' : '0.5rem 2rem 0.5rem 0.75rem',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(143, 179, 226, 0.3)',
                    borderRadius: '6px',
                    color: 'white'
                  }}
                />
                {localSearchQuery ? (
                  <button
                    type="button"
                    className="search-clear-btn"
                    onClick={handleSearchClear}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      color: '#8FB3E2',
                      cursor: 'pointer'
                    }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : (
                  <Search className="w-4 h-4" style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#8FB3E2'
                  }} />
                )}
              </form>
            </div>
          )}
          
          {isAuthenticated ? (
            <div className="user-dropdown" style={{ position: 'relative' }}>
              {renderNavbarButton()}
              {renderProfileDropdown()}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <button
                className="auth-btn"
                onClick={() => auth('signin')}
                style={{
                  fontSize: windowWidth < 1200 ? '0.85rem' : '0.9rem',
                  padding: windowWidth < 1200 ? '0.45rem 0.7rem' : '0.5rem 0.8rem',
                  height: windowWidth < 1200 ? '36px' : '38px',
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                  borderRadius: '6px',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                Sign In
              </button>
              <button
                className="auth-btn"
                onClick={() => auth('signup')}
                style={{
                  fontSize: windowWidth < 1200 ? '0.85rem' : '0.9rem',
                  padding: windowWidth < 1200 ? '0.45rem 0.7rem' : '0.5rem 0.8rem',
                  height: windowWidth < 1200 ? '36px' : '38px',
                  background: '#8FB3E2',
                  border: 'none',
                  borderRadius: '6px',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#7a9fd1';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = '#8FB3E2';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </nav>
    );
  };
  
  const renderMobileView = () => {
    if (!isMobileView) return null;
    
    if (windowWidth >= 768) {
      return (
        <nav className="navbar glass" style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0 0.6rem',
          height: '58px',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          background: 'rgba(30, 30, 40, 0.8)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(143, 179, 226, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0, marginRight: '0.6rem' }}>
            <div style={{ marginRight: '0.4rem' }}>
              <img src="/img/icon2.png" alt="Logo" style={{ height: '40px' }} />
            </div>
            <div>
              <div className="fw-bold mb-0" style={{
                fontSize: '0.9rem',
                lineHeight: '1.1',
                color: '#8FB3E2'
              }}>
                ATIRATH TRADERS
              </div>
              <div className="fw-bold mb-0" style={{
                fontSize: '0.75rem',
                lineHeight: '1.1',
                color: '#8FB3E2'
              }}>
                INDIA PVT.LTD
              </div>
              <div style={{
                fontSize: '0.65rem',
                lineHeight: '1.1',
                color: 'white',
                opacity: '0.8'
              }}>
                Diverse Businesses, One Vision
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
            {/* Cart Icon for Tablet */}
            <button
              className="cart-icon-btn"
              onClick={handleCartClick}
              style={{
                position: 'relative',
                background: 'transparent',
                border: 'none',
                width: '40px',
                height: '40px',
                borderRadius: '6px',
                cursor: 'pointer',
                color: '#8FB3E2',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.color = '#8FB3E2';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.color = '#8FB3E2';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <ShoppingCart className="w-5 h-5" />
              {getTotalItems() > 0 && (
                <span 
                  className="cart-badge"
                  style={{
                    position: 'absolute',
                    top: '-5px',
                    right: '-5px',
                    background: '#ff0000',
                    color: 'white',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid white',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
                    textShadow: '1px 1px 1px rgba(0,0,0,0.5)',
                    zIndex: 1001
                  }}
                >
                  {getTotalItems() > 99 ? '99+' : getTotalItems()}
                </span>
              )}
            </button>
            
            {showSearch && (
              <div style={{
                flex: 1,
                minWidth: '160px',
                maxWidth: '200px',
                marginRight: '0.6rem'
              }}>
                <form onSubmit={handleSearchSubmit} style={{ position: 'relative', width: '100%' }}>
                  <input
                    type="text"
                    className="search-bar"
                    placeholder="Search products..."
                    value={localSearchQuery}
                    onChange={handleSearchChange}
                    style={{
                      fontSize: '0.85rem',
                      height: '36px',
                      width: '100%',
                      padding: '0.4rem 1.8rem 0.4rem 0.6rem',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(143, 179, 226, 0.3)',
                      borderRadius: '6px',
                      color: 'white'
                    }}
                  />
                  {localSearchQuery ? (
                    <button
                      type="button"
                      className="search-clear-btn"
                      onClick={handleSearchClear}
                      style={{
                        position: 'absolute',
                        right: '6px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: 'none',
                        color: '#8FB3E2',
                        cursor: 'pointer'
                      }}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <Search className="w-3.5 h-3.5" style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#8FB3E2'
                    }} />
                  )}
                </form>
              </div>
            )}
            
            {!isAuthenticated && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '0.6rem' }}>
                <button
                  className="auth-btn"
                  onClick={() => auth('signin')}
                  style={{
                    fontSize: '0.8rem',
                    padding: '0.4rem 0.6rem',
                    height: '36px',
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.5)',
                    borderRadius: '6px',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                >
                  Sign In
                </button>
                <button
                  className="auth-btn"
                  onClick={() => auth('signup')}
                  style={{
                    fontSize: '0.8rem',
                    padding: '0.4rem 0.6rem',
                    height: '36px',
                    background: '#8FB3E2',
                    border: 'none',
                    borderRadius: '6px',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                >
                  Sign Up
                </button>
              </div>
            )}
            
            {isAuthenticated && (
              <div style={{ marginRight: '0.6rem' }}>
                {renderMobileNavbarButton()}
              </div>
            )}
            
            <button
              id="menu-btn"
              onClick={() => setMobileMenuOpen(true)}
              style={{
                minWidth: '40px',
                minHeight: '40px',
                width: '40px',
                height: '40px',
                background: 'transparent',
                border: 'none',
                color: '#8FB3E2',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Menu className="w-5.5 h-5.5" />
            </button>
          </div>
        </nav>
      );
    }
    
    const isVerySmall = windowWidth < 400;
    const isSmall = windowWidth < 480;
    
    const navbarHeight = isVerySmall ? '50px' : (isSmall ? '54px' : '56px');
    const logoHeight = isVerySmall ? '30px' : (isSmall ? '34px' : '36px');
    const companyNameSize = isVerySmall ? '0.65rem' : (isSmall ? '0.75rem' : '0.8rem');
    const companySubtitleSize = isVerySmall ? '0.5rem' : (isSmall ? '0.6rem' : '0.65rem');
    const taglineSize = isVerySmall ? '0.4rem' : (isSmall ? '0.45rem' : '0.5rem');
    
    return (
      <nav className="navbar glass" style={{
        display: 'flex',
        alignItems: 'center',
        padding: isVerySmall ? '0 0.3rem' : (isSmall ? '0 0.4rem' : '0 0.5rem'),
        height: navbarHeight,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: 'rgba(30, 30, 40, 0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(143, 179, 226, 0.2)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
          marginRight: isVerySmall ? '0.3rem' : (isSmall ? '0.4rem' : '0.5rem'),
          maxWidth: '45%'
        }}>
          <div style={{ marginRight: isVerySmall ? '0.2rem' : (isSmall ? '0.3rem' : '0.4rem') }}>
            <img src="/img/icon2.png" alt="Logo" style={{ height: logoHeight }} />
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div className="fw-bold mb-0" style={{
              fontSize: companyNameSize,
              lineHeight: '1.1',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              color: '#8FB3E2'
            }}>
              ATIRATH TRADERS
            </div>
            <div className="fw-bold mb-0" style={{
              fontSize: companySubtitleSize,
              lineHeight: '1.1',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              color: '#8FB3E2'
            }}>
              INDIA PVT.LTD
            </div>
            {!isVerySmall && (
              <div style={{
                fontSize: taglineSize,
                lineHeight: '1.1',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                color: 'white',
                opacity: '0.8'
              }}>
                Diverse Businesses, One Vision
              </div>
            )}
          </div>
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: isVerySmall ? '4px' : (isSmall ? '5px' : '6px'),
          marginLeft: 'auto',
          flexShrink: 0
        }}>
          {/* Cart Icon for Mobile */}
          <button
            className="cart-icon-btn"
            onClick={handleCartClick}
            style={{
              position: 'relative',
              background: 'transparent',
              border: 'none',
              width: isVerySmall ? '32px' : (isSmall ? '36px' : '38px'),
              height: isVerySmall ? '32px' : (isSmall ? '36px' : '38px'),
              borderRadius: '6px',
              cursor: 'pointer',
              color: '#8FB3E2',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = '#8FB3E2';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = '#8FB3E2';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <ShoppingCart className={isVerySmall ? "w-4 h-4" : (isSmall ? "w-4.5 h-4.5" : "w-5 h-5")} />
            {getTotalItems() > 0 && (
              <span 
                className="cart-badge"
                style={{
                  position: 'absolute',
                  top: isVerySmall ? '-4px' : '-5px',
                  right: isVerySmall ? '-4px' : '-5px',
                  background: '#ff0000',
                  color: 'white',
                  borderRadius: '50%',
                  width: isVerySmall ? '18px' : '20px',
                  height: isVerySmall ? '18px' : '20px',
                  fontSize: isVerySmall ? '0.65rem' : '0.7rem',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid white',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
                  textShadow: '1px 1px 1px rgba(0,0,0,0.5)',
                  zIndex: 1001
                }}
              >
                {getTotalItems() > 99 ? '99+' : getTotalItems()}
              </span>
            )}
          </button>
          
          {showSearch && (
            <div style={{
              flex: 1,
              minWidth: isVerySmall ? '70px' : (isSmall ? '90px' : '100px'),
              maxWidth: isVerySmall ? '90px' : (isSmall ? '120px' : '140px'),
              marginRight: isVerySmall ? '0.3rem' : (isSmall ? '0.4rem' : '0.5rem'),
              display: 'flex',
              alignItems: 'center'
            }}>
              <form onSubmit={handleSearchSubmit} style={{ position: 'relative', width: '100%' }}>
                {isVerySmall ? (
                  <button
                    type="button"
                    onClick={() => {}}
                    style={{
                      width: '100%',
                      height: '30px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(143, 179, 226, 0.3)',
                      borderRadius: '6px',
                      color: '#8FB3E2',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Search className="w-3 h-3" />
                  </button>
                ) : (
                  <input
                    type="text"
                    className="search-bar"
                    placeholder="Search..."
                    value={localSearchQuery}
                    onChange={handleSearchChange}
                    style={{
                      fontSize: isSmall ? '0.7rem' : '0.75rem',
                      height: isSmall ? '32px' : '34px',
                      width: '100%',
                      padding: isSmall ? '0.3rem 1.5rem 0.3rem 0.45rem' : '0.35rem 1.6rem 0.35rem 0.5rem',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(143, 179, 226, 0.3)',
                      borderRadius: '6px',
                      color: 'white'
                    }}
                  />
                )}
                {!isVerySmall && localSearchQuery && (
                  <button
                    type="button"
                    className="search-clear-btn"
                    onClick={handleSearchClear}
                    style={{
                      position: 'absolute',
                      right: '4px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      color: '#8FB3E2',
                      cursor: 'pointer'
                    }}
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </form>
            </div>
          )}
          
          {isAuthenticated && (
            <div style={{ marginRight: isVerySmall ? '0.3rem' : (isSmall ? '0.4rem' : '0.5rem') }}>
              {renderMobileNavbarButton()}
            </div>
          )}
          
          <button
            id="menu-btn"
            onClick={() => setMobileMenuOpen(true)}
            style={{
              minWidth: isVerySmall ? '34px' : (isSmall ? '36px' : '38px'),
              minHeight: isVerySmall ? '34px' : (isSmall ? '36px' : '38px'),
              width: isVerySmall ? '34px' : (isSmall ? '36px' : '38px'),
              height: isVerySmall ? '34px' : (isSmall ? '36px' : '38px'),
              background: 'transparent',
              border: 'none',
              color: '#8FB3E2',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Menu className={isVerySmall ? "w-4 h-4" : (isSmall ? "w-4.5 h-4.5" : "w-5 h-5")} />
          </button>
        </div>
      </nav>
    );
  };
  
  return (
    <>
      {renderDesktopView()}
      {renderMobileView()}
      {renderMobileMenu()}
      {isAuthenticated && userDropdownOpen && renderProfileDropdown()}
      
      <style>{`
        .cart-badge {
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(255, 0, 0, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(255, 0, 0, 0);
          }
        }
        
        .cart-icon-btn:hover .cart-badge {
          transform: scale(1.1);
          transition: transform 0.2s;
        }
      `}</style>
    </>
  );
};

export default Navbar;