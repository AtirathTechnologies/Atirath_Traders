import React, { useState, useEffect } from 'react';
import {
  Menu, X, User, LogOut, Search, Users,
  Briefcase, Edit, Save, X as CloseIcon, Camera, Truck,
  Home, Info, Users as UsersIcon, Package, Wrench, FileText,
  MessageCircle, Shield, Phone, ShoppingBag, PhoneCall, PhoneIncoming
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

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
  newOrdersCount = 0,
  onOrderViewed,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileProfileOpen, setMobileProfileOpen] = useState(false);
  const [ordersPopupOpen, setOrdersPopupOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [hasNewOrders, setHasNewOrders] = useState(false);
  const [removedOrders, setRemovedOrders] = useState(() => {
    // Load removed orders from localStorage on initial render
    if (typeof window !== 'undefined' && currentUser?.uid) {
      const stored = localStorage.getItem(`removedOrders_${currentUser.uid}`);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    }
    return new Set();
  });
  const [viewedOrders, setViewedOrders] = useState(() => {
    // Load viewed orders from localStorage on initial render
    if (typeof window !== 'undefined' && currentUser?.uid) {
      const stored = localStorage.getItem(`viewedOrders_${currentUser.uid}`);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    }
    return new Set();
  });

  const showSearch = location.pathname.startsWith('/product/');
  const isIndividualProductPage = location.pathname.startsWith('/product/');

  /* ---------- Save removed orders to localStorage ---------- */
  const saveRemovedOrdersToStorage = (orderIds) => {
    if (typeof window !== 'undefined' && currentUser?.uid) {
      const updatedRemovedOrders = new Set([...removedOrders, ...orderIds]);
      localStorage.setItem(
        `removedOrders_${currentUser.uid}`,
        JSON.stringify([...updatedRemovedOrders])
      );
      setRemovedOrders(updatedRemovedOrders);
    }
  };

  /* ---------- Save viewed orders to localStorage ---------- */
  const saveViewedOrdersToStorage = (orderIds) => {
    if (typeof window !== 'undefined' && currentUser?.uid) {
      const updatedViewedOrders = new Set([...viewedOrders, ...orderIds]);
      localStorage.setItem(
        `viewedOrders_${currentUser.uid}`,
        JSON.stringify([...updatedViewedOrders])
      );
      setViewedOrders(updatedViewedOrders);
    }
  };

  /* ---------- Track new orders for blinking ---------- */
  useEffect(() => {
    if (newOrdersCount > 0) {
      // Only set hasNewOrders if there are orders that haven't been viewed
      const hasUnviewedOrders = orders.some(order => !viewedOrders.has(order.id));
      if (hasUnviewedOrders) {
        setHasNewOrders(true);
      }
    } else {
      setHasNewOrders(false);
    }
  }, [newOrdersCount, orders, viewedOrders]);

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
      // Load removed and viewed orders for this user
      if (typeof window !== 'undefined') {
        const storedRemoved = localStorage.getItem(`removedOrders_${currentUser.uid}`);
        const storedViewed = localStorage.getItem(`viewedOrders_${currentUser.uid}`);
        if (storedRemoved) {
          setRemovedOrders(new Set(JSON.parse(storedRemoved)));
        }
        if (storedViewed) {
          setViewedOrders(new Set(JSON.parse(storedViewed)));
        }
      }
    } else {
      setEditedUser(null);
    }
  }, [currentUser]);

  /* ---------- Reset editing state when user signs out ---------- */
  useEffect(() => {
    if (!isAuthenticated) {
      setIsEditing(false);
      setUserDropdownOpen(false);
      setMobileProfileOpen(false);
      setEditedUser(null);
      setPhoneError('');
      setHasNewOrders(false);
      // Don't clear removedOrders on signout, keep them in localStorage
    }
  }, [isAuthenticated]);

  /* ---------- Clear removed orders on sign out ---------- */
  useEffect(() => {
    if (!isAuthenticated && typeof window !== 'undefined') {
      // Clear removed orders from localStorage when user signs out
      localStorage.removeItem(`removedOrders_${currentUser?.uid}`);
      localStorage.removeItem(`viewedOrders_${currentUser?.uid}`);
      setRemovedOrders(new Set());
      setViewedOrders(new Set());
    }
  }, [isAuthenticated, currentUser?.uid]);

  /* ---------- Phone number validation ---------- */
  const validatePhoneNumber = (phone) => {
    if (!phone) return true;
   
    const cleanPhone = phone.replace(/\D/g, '');
   
    if (cleanPhone.length !== 10) {
      setPhoneError('Phone number must be exactly 10 digits');
      return false;
    }
   
    setPhoneError('');
    return true;
  };

  /* ---------- Handle phone number input ---------- */
  const handlePhoneChange = (value) => {
    const formattedValue = value.replace(/\D/g, '').slice(0, 10);
   
    setEditedUser(prev => ({
      ...prev,
      phone: formattedValue
    }));
   
    validatePhoneNumber(formattedValue);
  };

  /* ---------- Photo Upload Handler ---------- */
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

  /* ---------- Remove Photo Handler ---------- */
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

  /* ---------- Fetch orders from Firebase ---------- */
  const fetchOrders = async () => {
    if (!currentUser || (!currentUser.email && !currentUser.uid)) {
      console.log('No user info found for fetching orders');
      return;
    }
   
    setLoadingOrders(true);
    try {
      const { database, ref, get, query, orderByChild, equalTo } = await import('../firebase');
     
      const ordersRef = ref(database, 'quotes');
     
      // Try to query by userId first (more secure)
      let userOrdersQuery;
      if (currentUser.uid) {
        userOrdersQuery = query(
          ordersRef,
          orderByChild('userId'),
          equalTo(currentUser.uid)
        );
      } else {
        // Fallback to email
        userOrdersQuery = query(
          ordersRef,
          orderByChild('email'),
          equalTo(currentUser.email)
        );
      }
     
      const snapshot = await get(userOrdersQuery);
      if (snapshot.exists()) {
        const ordersData = snapshot.val();
        const ordersArray = Object.keys(ordersData).map(key => ({
          id: key,
          ...ordersData[key]
        })).sort((a, b) => b.timestamp - a.timestamp);
       
        // Filter out removed orders
        const filteredOrders = ordersArray.filter(order => !removedOrders.has(order.id));
        setOrders(filteredOrders);
        console.log('Fetched orders:', filteredOrders.length, 'Removed:', removedOrders.size);
      } else {
        setOrders([]);
        console.log('No orders found for user');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Fallback: get all and filter client-side
      try {
        const { database, ref, get } = await import('../firebase');
        const ordersRef = ref(database, 'quotes');
        const snapshot = await get(ordersRef);
        if (snapshot.exists()) {
          const allOrders = snapshot.val();
          const filteredOrders = Object.keys(allOrders)
            .filter(key => {
              const order = allOrders[key];
              return (order.userId === currentUser.uid ||
                     order.email === currentUser.email) &&
                     !removedOrders.has(key);
            })
            .map(key => ({
              id: key,
              ...allOrders[key]
            }))
            .sort((a, b) => b.timestamp - a.timestamp);
         
          setOrders(filteredOrders);
        }
      } catch (fallbackError) {
        console.error('Fallback query failed:', fallbackError);
        setOrders([]);
      }
    } finally {
      setLoadingOrders(false);
    }
  };

  /* ---------- Open orders popup ---------- */
  const handleOrdersClick = async () => {
    if (!isAuthenticated) {
      alert('Please sign in to view your orders');
      onAuthNavigate('signin');
      return;
    }
   
    setOrdersPopupOpen(true);
    await fetchOrders();
   
    // Mark ALL current orders as viewed when popup opens
    if (orders.length > 0) {
      const orderIds = orders.map(order => order.id);
      saveViewedOrdersToStorage(orderIds);
      // Notify parent that orders have been viewed
      if (onOrderViewed) {
        onOrderViewed(orderIds);
      }
    }
    // Reset local new orders flag
    setHasNewOrders(false);
  };

  /* ---------- Close orders popup ---------- */
  const closeOrdersPopup = () => {
    setOrdersPopupOpen(false);
  };

  /* ---------- Remove Order Handler ---------- */
  const handleRemoveOrder = (orderId, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to remove this order from view?')) {
      // Save to localStorage
      saveRemovedOrdersToStorage([orderId]);
      // Also remove from current orders array
      setOrders(prev => prev.filter(order => order.id !== orderId));
      // Remove from viewed orders as well
      const updatedViewedOrders = new Set(viewedOrders);
      updatedViewedOrders.delete(orderId);
      setViewedOrders(updatedViewedOrders);
      if (typeof window !== 'undefined' && currentUser?.uid) {
        localStorage.setItem(
          `viewedOrders_${currentUser.uid}`,
          JSON.stringify([...updatedViewedOrders])
        );
      }
      alert('Order removed successfully!');
    }
  };

  /* ---------- Phone Call Handler ---------- */
  const handlePhoneCall = () => {
    window.open('tel:+917396007479', '_self');
  };

  /* ---------- WhatsApp Call Handler ---------- */
  const handleWhatsAppCall = () => {
    window.open('https://wa.me/+917396007479', '_blank');
  };

  /* ---------- Close dropdown / mobile menu on outside click ---------- */
  useEffect(() => {
    const handler = (e) => {
      if (userDropdownOpen && !e.target.closest('.user-dropdown')) {
        setUserDropdownOpen(false);
        setIsEditing(false);
        setPhoneError('');
      }
      if (mobileProfileOpen && !e.target.closest('.mobile-profile-popup') && !e.target.closest('.navbar-profile-btn')) {
        setMobileProfileOpen(false);
        setIsEditing(false);
        setPhoneError('');
      }
      if (ordersPopupOpen && !e.target.closest('.orders-popup-content')) {
        closeOrdersPopup();
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
  }, [userDropdownOpen, mobileMenuOpen, mobileProfileOpen, ordersPopupOpen]);

  /* ---------- Navigation handlers ---------- */
  const handleNavigation = (section) => {
    onNavigate(section);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setMobileProfileOpen(false);
    closeOrdersPopup();
    setIsEditing(false);
    setPhoneError('');
  };

  const auth = (type) => {
    onAuthNavigate(type);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setMobileProfileOpen(false);
    closeOrdersPopup();
    setIsEditing(false);
    setPhoneError('');
  };

  const signOut = () => {
    onSignOut();
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    setMobileProfileOpen(false);
    closeOrdersPopup();
    setIsEditing(false);
    setPhoneError('');
  };

  const toggleUser = (e) => {
    e.stopPropagation();
    setUserDropdownOpen((v) => !v);
    setIsEditing(false);
    setPhoneError('');
  };

  /* ---------- Toggle Mobile Profile Popup ---------- */
  const toggleMobileProfile = (e) => {
    e.stopPropagation();
    setMobileProfileOpen((v) => !v);
    setIsEditing(false);
    setPhoneError('');
  };

  /* ---------- Terms & Policy Handler ---------- */
  const handleTermsPolicy = () => {
    navigate('/terms-policy');
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setMobileProfileOpen(false);
    closeOrdersPopup();
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
    setMobileProfileOpen(false);
    closeOrdersPopup();
    setIsEditing(false);
    setPhoneError('');
  };

  /* ---------- Services handler ---------- */
  const handleServices = () => {
    navigate('/services');
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setMobileProfileOpen(false);
    closeOrdersPopup();
    setIsEditing(false);
    setPhoneError('');
  };

  /* ---------- Transport handler ---------- */
  const handleTransport = () => {
    navigate('/transport');
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setMobileProfileOpen(false);
    closeOrdersPopup();
    setIsEditing(false);
    setPhoneError('');
  };

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name || typeof name !== 'string') return 'U';
    const names = name.trim().split(' ');
    return names
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Format member since date
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

  // Get user's initials for display in navbar button
  const getUserNameInitials = () => {
    if (!currentUser?.name) return 'U';
    return getInitials(currentUser.name);
  };

  // Render user avatar with photo or initials (for dropdown/mobile)
  const renderUserAvatar = (user, size = 'small', isInEditMode = false) => {
    const avatarClass = size === 'small' ? 'avatar-circle-small' :
                       size === 'large' ? 'avatar-circle-large' : 'avatar-circle';
    const initialsClass = size === 'small' ? 'avatar-initials-small' :
                         size === 'large' ? 'avatar-initials-large' : 'avatar-initials';
   
    // Check if user has a valid photoURL
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

  // Render navbar button - Show rectangular profile image filling entire container
  const renderNavbarButton = () => {
    if (!isAuthenticated || !currentUser) return null;
    const hasValidPhoto = currentUser?.photoURL && currentUser.photoURL.startsWith('data:image');
   
    return (
      <button
        className="btn btn-primary auth-btn d-flex align-items-center justify-content-center p-0 navbar-profile-btn"
        onClick={toggleUser}
        style={{
          background: 'transparent',
          border: 'none',
          width: '48px',
          height: '48px',
          minWidth: '48px',
          minHeight: '48px',
          overflow: 'hidden',
          borderRadius: '6px',
          position: 'relative',
          cursor: 'pointer',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
        }}
      >
        {hasValidPhoto ? (
          // Show rectangular image filling the entire container
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
              // Fallback to initials if image fails to load
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
          // Show initials in a rectangular box
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

  // Render mobile navbar button (smaller)
  const renderMobileNavbarButton = () => {
    if (!isAuthenticated || !currentUser) return null;
    const hasValidPhoto = currentUser?.photoURL && currentUser.photoURL.startsWith('data:image');
   
    return (
      <button
        className="btn btn-primary auth-btn d-flex align-items-center justify-content-center p-0 navbar-profile-btn"
        onClick={toggleMobileProfile}
        style={{
          background: 'transparent',
          border: 'none',
          width: '42px',
          height: '42px',
          minWidth: '42px',
          minHeight: '42px',
          overflow: 'hidden',
          borderRadius: '6px',
          position: 'relative',
          cursor: 'pointer',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
        }}
      >
        {hasValidPhoto ? (
          // Show rectangular image filling the entire container
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
              // Fallback to initials if image fails to load
              e.target.style.display = 'none';
              const parent = e.target.parentElement;
              const fallback = document.createElement('div');
              fallback.style.cssText = `
                width: 100%;
                height: 100%;
                border-radius: 4px;
                background: linear-gradient(135deg, #8FB3E2, #31487A);
                color: white;
                font-size: 1rem;
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
          // Show initials in a rectangular box
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '4px',
              background: 'linear-gradient(135deg, #8FB3E2, #31487A)',
              color: 'white',
              fontSize: '1rem',
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

  // Render orders button with notification badge - ONLY BAG ICON (no text)
  const renderOrdersButton = (isMobile = false) => {
    const buttonClass = isMobile ?
      "btn btn-link text-white text-decoration-none hover-accent fs-5 border-0 d-flex align-items-center justify-content-center" :
      "btn btn-outline-light orders-btn-compact d-flex align-items-center justify-content-center p-1 me-1";
   
    const buttonStyle = isMobile ? {
      width: '100%',
      padding: '0.5rem 0'
    } : {
      borderColor: 'rgba(143, 179, 226, 0.5)',
      color: '#8FB3E2',
      fontWeight: '600',
      width: '44px',
      height: '44px',
      minWidth: '44px',
      minHeight: '44px',
      padding: '0',
      borderRadius: '6px'
    };
    
    // Check if there are any unviewed orders (not removed and not viewed)
    const hasUnviewedOrders = orders.some(order => 
      !removedOrders.has(order.id) && !viewedOrders.has(order.id)
    );
    const showDot = hasUnviewedOrders && orders.length > 0;
    
    return (
      <button
        className={buttonClass}
        onClick={handleOrdersClick}
        style={buttonStyle}
        title="My Orders"
      >
        <div className="position-relative d-flex align-items-center justify-content-center">
          <ShoppingBag className="w-5 h-5" />
          {showDot && (
            <span className="orders-badge orders-dot-badge">
              •
            </span>
          )}
        </div>
      </button>
    );
  };

  // Render orders popup with updated UI
  const renderOrdersPopup = () => (
    <div className={`orders-popup-overlay ${ordersPopupOpen ? 'active' : ''}`} onClick={closeOrdersPopup}>
      <div className="orders-popup-content" onClick={(e) => e.stopPropagation()}>
        <div className="orders-popup-header">
          <h3 className="orders-popup-title">
            <ShoppingBag className="w-5 h-5 me-2" />
            My Orders
          </h3>
          <button className="orders-popup-close" onClick={closeOrdersPopup}>
            <X className="w-5 h-5" />
          </button>
        </div>
       
        <div className="orders-popup-body">
          {loadingOrders ? (
            <div className="loading-orders">
              <div className="spinner-border spinner-border-sm text-accent" role="status"></div>
              <span>Loading your orders...</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="no-orders">
              <ShoppingBag className="w-16 h-16 text-muted mb-3" />
              <h5>No Orders Yet</h5>
              <p className="text-muted">You haven't placed any orders yet.</p>
              <button
                className="btn btn-primary mt-2"
                onClick={() => {
                  closeOrdersPopup();
                  onNavigate('products');
                }}
              >
                Browse Products
              </button>
            </div>
          ) : (
            <div className="orders-list">
              {orders
                .filter(order => !removedOrders.has(order.id))
                .map((order) => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <div className="order-id">
                      <strong>Order ID:</strong> {order.id.substring(0, 8)}...
                    </div>
                    <div className="order-status-success">
                      <span className="status-badge-success">
                        ✅ SUCCESSFUL
                      </span>
                    </div>
                    <div className="order-date">
                      {new Date(order.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                 
                  <div className="order-info">
                    <div className="order-product">
                      <strong>Product:</strong> {order.product || 'N/A'}
                    </div>
                    {order.variety && (
                      <div className="order-variety">
                        <strong>Variety:</strong> {order.variety}
                      </div>
                    )}
                    <div className="order-quantity">
                      <strong>Quantity:</strong> {order.quantity || 'N/A'}
                    </div>
                    <div className="order-grade">
                      <strong>Grade:</strong> {order.grade || 'N/A'}
                    </div>
                    <div className="order-packing">
                      <strong>Packing:</strong> {order.packing || 'N/A'}
                    </div>
                    {order.state && (
                      <div className="order-state">
                        <strong>State/Destination:</strong> {order.state}
                      </div>
                    )}
                    <div className="order-price">
                      <strong>Total:</strong> {order.displayValues?.finalTotal || order.priceBreakdown?.finalTotal || 'Calculating...'}
                    </div>
                  </div>
                 
                  <div className="order-actions">
                    <div className="d-flex justify-content-between align-items-center w-100">
                      <div className="d-flex gap-2">
                        {/* Remove Order Button */}
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={(e) => handleRemoveOrder(order.id, e)}
                          title="Remove Order"
                        >
                          <X className="w-4 h-4 me-1" />
                          Remove Order
                        </button>
                      </div>
                      <div className="d-flex gap-2">
                        {/* Phone Call Button */}
                        <button
                          className="btn btn-sm btn-outline-primary d-flex align-items-center"
                          onClick={handlePhoneCall}
                          title="Call +91 7396007479"
                        >
                          <PhoneCall className="w-4 h-4 me-1" />
                          Call
                        </button>
                        {/* WhatsApp Call Button */}
                        <button
                          className="btn btn-sm btn-success d-flex align-items-center"
                          onClick={handleWhatsAppCall}
                          title="WhatsApp Call +91 7396007479"
                        >
                          <PhoneIncoming className="w-4 h-4 me-1" />
                          WhatsApp Call
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Render product page navbar (minimal) - ONLY FOR INDIVIDUAL PRODUCT PAGES
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
            <Home className="w-3 h-3 me-1" />
            Home
          </button>
          <button
            className="btn btn-link text-white text-decoration-none hover-accent nav-link-btn border-0 no-wrap"
            onClick={() => handleNavigation('products')}
          >
            <Package className="w-3 h-3 me-1" />
            Products
          </button>
          <button
            className="btn btn-link text-white text-decoration-none hover-accent nav-link-btn border-0 no-wrap"
            onClick={handleTransport}
          >
            <Truck className="w-3 h-3 me-1" />
            Transport
          </button>
          <button
            className="btn btn-link text-white text-decoration-none hover-accent nav-link-btn border-0 no-wrap"
            onClick={() => handleNavigation('contact')}
          >
            <Phone className="w-3 h-3 me-1" />
            Contact
          </button>
        </div>
        {/* ---- RIGHT: SEARCH + AUTH FOR PRODUCT PAGES ---- */}
        <div className="d-none d-md-flex align-items-center gap-1 flex-shrink-0 ms-auto">
          {/* Search (only show on individual product pages, not all-products) */}
          {showSearch && (
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
          {/* Orders Button with Notification Badge - Only show if authenticated - Bag icon only */}
          {isAuthenticated && renderOrdersButton()}
          {/* Auth Buttons */}
          {isAuthenticated ? (
            <div className="user-dropdown position-relative">
              {renderNavbarButton()}
              {userDropdownOpen && (
                <div className="dropdown-menu show position-absolute end-0 mt-1 profile-dropdown-card" style={{ minWidth: '320px', maxWidth: '350px', fontSize: '0.8rem' }}>
                  {/* Profile Header */}
                  <div className="profile-dropdown-header p-2 border-bottom">
                    <div className="d-flex align-items-center gap-2">
                      {renderUserAvatar(currentUser, 'small', isEditing)}
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
                                disabled={uploadingPhoto}
                              >
                                <Camera className="w-3 h-3" />
                                {uploadingPhoto ? 'Uploading...' : (editedUser?.photoURL ? 'Change Photo' : 'Upload Photo')}
                              </label>
                              {editedUser?.photoURL && (
                                <button
                                  className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1"
                                  onClick={handleRemovePhoto}
                                  style={{ fontSize: '0.75rem', padding: '0.4rem 0.6rem' }}
                                  disabled={uploadingPhoto}
                                >
                                  <X className="w-3 h-3" />
                                  Remove
                                </button>
                              )}
                            </div>
                            <div className="text-muted text-xxs mt-2">
                              Recommended: Square image, max 2MB
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
                        <div className="profile-info-item">
                          <span className="profile-info-label text-xxs">Phone:</span>
                          <span className="profile-info-value text-xs-compact">{currentUser?.phone || 'Not set'}</span>
                        </div>
                        <div className="profile-info-item">
                          <span className="profile-info-label text-xxs">Location:</span>
                          <span className="profile-info-value text-xs-compact">{currentUser?.location || 'Not set'}</span>
                        </div>
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
        {/* ---- MOBILE TOGGLE - Profile on RIGHT, Menu on LEFT ---- */}
        <div className="d-md-none d-flex align-items-center gap-1 ms-auto">
          {/* Menu Button - Now on LEFT side */}
          <button
            id="menu-btn"
            className="btn p-1 accent border-0"
            onClick={() => setMobileMenuOpen(true)}
            style={{ marginRight: '10px' }}
          >
            <Menu className="w-4 h-4" />
          </button>
         
          {/* Mobile Profile Button - Now on RIGHT side */}
          {isAuthenticated && renderMobileNavbarButton()}
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
          {/* Mobile Search (only show on individual product pages, not all-products) */}
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
            <Home className="w-4 h-4 me-2" />
            Home
          </button>
          <button
            className="btn btn-link text-white text-decoration-none hover-accent fs-5 border-0 w-100 text-center"
            onClick={() => handleNavigation('products')}
          >
            <Package className="w-4 h-4 me-2" />
            Products
          </button>
          <button
            className="btn btn-link text-white text-decoration-none hover-accent fs-5 border-0 w-100 text-center"
            onClick={handleTransport}
          >
            <Truck className="w-4 h-4 me-2" />
            Transport
          </button>
          <button
            className="btn btn-link text-white text-decoration-none hover-accent fs-5 border-0 w-100 text-center"
            onClick={() => handleNavigation('contact')}
          >
            <Phone className="w-4 h-4 me-2" />
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
          {/* Orders Button with Notification Badge - Mobile - Bag icon only */}
          {isAuthenticated && renderOrdersButton(true)}
          {/* Auth Buttons (only show if not authenticated) */}
          {!isAuthenticated && (
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
      {/* Render Orders Popup */}
      {renderOrdersPopup()}
    </>
  );

  // Render full navbar for non-product pages AND all-products page
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
            <Home className="w-3 h-3 me-1" />
            Home
          </button>
          <button
            className="btn btn-link text-white text-decoration-none hover-accent nav-link-btn border-0 no-wrap"
            onClick={() => handleNavigation('about')}
          >
            <Info className="w-3 h-3 me-1" />
            About Us
          </button>
          <button
            className="btn btn-link text-white text-decoration-none hover-accent nav-link-btn border-0 no-wrap"
            onClick={() => handleNavigation('leadership')}
          >
            <UsersIcon className="w-3 h-3 me-1" />
            Leadership
          </button>
          <button
            className="btn btn-link text-white text-decoration-none hover-accent nav-link-btn border-0 no-wrap"
            onClick={() => handleNavigation('products')}
          >
            <Package className="w-3 h-3 me-1" />
            Products
          </button>
          <button
            className="btn btn-link text-white text-decoration-none hover-accent nav-link-btn border-0 no-wrap"
            onClick={handleServices}
          >
            <Wrench className="w-3 h-3 me-1" />
            Services
          </button>
          <button
            className="btn btn-link text-white text-decoration-none hover-accent nav-link-btn border-0 no-wrap"
            onClick={() => handleNavigation('blog')}
          >
            <FileText className="w-3 h-3 me-1" />
            Blog
          </button>
          <button
            className="btn btn-link text-white text-decoration-none hover-accent nav-link-btn border-0 no-wrap"
            onClick={handleTermsPolicy}
          >
            <Shield className="w-3 h-3 me-1" />
            Terms & Policy
          </button>
          <button
            className="btn btn-link text-white text-decoration-none hover-accent nav-link-btn border-0 no-wrap"
            onClick={() => handleNavigation('contact')}
          >
            <Phone className="w-3 h-3 me-1" />
            Contact
          </button>
        </div>
        {/* ---- RIGHT: SEARCH + AUTH ---- */}
        <div className="d-none d-md-flex align-items-center gap-1 flex-shrink-0 ms-auto">
          {/* Search (only on individual product pages, not all-products) */}
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
          {/* Orders Button with Notification Badge - Only show if authenticated - Bag icon only */}
          {isAuthenticated && renderOrdersButton()}
          {/* Auth Buttons */}
          {isAuthenticated ? (
            <div className="user-dropdown position-relative">
              {renderNavbarButton()}
              {userDropdownOpen && (
                <div className="dropdown-menu show position-absolute end-0 mt-1 profile-dropdown-card" style={{ minWidth: '320px', maxWidth: '350px', fontSize: '0.8rem' }}>
                  {/* Profile Header */}
                  <div className="profile-dropdown-header p-2 border-bottom">
                    <div className="d-flex align-items-center gap-2">
                      {renderUserAvatar(currentUser, 'small', isEditing)}
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
                                disabled={uploadingPhoto}
                              >
                                <Camera className="w-3 h-3" />
                                {uploadingPhoto ? 'Uploading...' : (editedUser?.photoURL ? 'Change Photo' : 'Upload Photo')}
                              </label>
                              {editedUser?.photoURL && (
                                <button
                                  className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1"
                                  onClick={handleRemovePhoto}
                                  style={{ fontSize: '0.75rem', padding: '0.4rem 0.6rem' }}
                                  disabled={uploadingPhoto}
                                >
                                  <X className="w-3 h-3" />
                                  Remove
                                </button>
                              )}
                            </div>
                            <div className="text-muted text-xxs mt-2">
                              Recommended: Square image, max 2MB
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
                        <div className="profile-info-item">
                          <span className="profile-info-label text-xxs">Phone:</span>
                          <span className="profile-info-value text-xs-compact">{currentUser?.phone || 'Not set'}</span>
                        </div>
                        <div className="profile-info-item">
                          <span className="profile-info-label text-xxs">Location:</span>
                          <span className="profile-info-value text-xs-compact">{currentUser?.location || 'Not set'}</span>
                        </div>
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
        {/* ---- MOBILE TOGGLE - Profile on RIGHT, Menu on LEFT ---- */}
        <div className="d-md-none d-flex align-items-center gap-1 ms-auto">
          {/* Menu Button - Now on LEFT side */}
          <button
            id="menu-btn"
            className="btn p-1 accent border-0"
            onClick={() => setMobileMenuOpen(true)}
            style={{ marginRight: '10px' }}
          >
            <Menu className="w-4 h-4" />
          </button>
         
          {/* Mobile Profile Button - Now on RIGHT side */}
          {isAuthenticated && renderMobileNavbarButton()}
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
          {/* Mobile Search (only show on individual product pages, not all-products) */}
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
            <Home className="w-4 h-4 me-2" />
            Home
          </button>
          <button
            className="btn btn-link text-white text-decoration-none hover-accent fs-5 border-0 w-100 text-center"
            onClick={() => handleNavigation('about')}
          >
            <Info className="w-4 h-4 me-2" />
            About Us
          </button>
          <button
            className="btn btn-link text-white text-decoration-none hover-accent fs-5 border-0 w-100 text-center"
            onClick={() => handleNavigation('leadership')}
          >
            <UsersIcon className="w-4 h-4 me-2" />
            Leadership
          </button>
          <button
            className="btn btn-link text-white text-decoration-none hover-accent fs-5 border-0 w-100 text-center"
            onClick={() => handleNavigation('products')}
          >
            <Package className="w-4 h-4 me-2" />
            Products
          </button>
          <button
            className="btn btn-link text-white text-decoration-none hover-accent fs-5 border-0 w-100 text-center"
            onClick={handleServices}
          >
            <Wrench className="w-4 h-4 me-2" />
            Services
          </button>
          <button
            className="btn btn-link text-white text-decoration-none hover-accent fs-5 border-0 w-100 text-center"
            onClick={() => handleNavigation('blog')}
          >
            <FileText className="w-4 h-4 me-2" />
            Blog
          </button>
          <button
            className="btn btn-link text-white text-decoration-none hover-accent fs-5 border-0 w-100 text-center"
            onClick={handleTermsPolicy}
          >
            <Shield className="w-4 h-4 me-2" />
            Terms & Policy
          </button>
          <button
            className="btn btn-link text-white text-decoration-none hover-accent fs-5 border-0 w-100 text-center"
            onClick={() => handleNavigation('contact')}
          >
            <Phone className="w-4 h-4 me-2" />
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
          {/* Orders Button with Notification Badge - Mobile - Bag icon only */}
          {isAuthenticated && renderOrdersButton(true)}
          {/* Auth Buttons (only show if not authenticated) */}
          {!isAuthenticated && (
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
      {/* Render Orders Popup */}
      {renderOrdersPopup()}
    </>
  );

  return (
    <>
      {/* Use full navbar for all-products page and home page, use minimal navbar only for individual product pages */}
      {isIndividualProductPage ? renderProductPageNavbar() : renderFullNavbar()}
      {/* Mobile Profile Popup */}
      {mobileProfileOpen && (
        <div className={`mobile-profile-popup ${mobileProfileOpen ? 'visible' : ''}`}>
          <div className="mobile-profile-popup-content">
            {/* Close Button */}
            <button
              className="btn position-absolute top-0 end-0 m-2 p-1 text-white"
              onClick={() => setMobileProfileOpen(false)}
              style={{ zIndex: 10 }}
            >
              <X className="w-5 h-5" />
            </button>
            {/* Profile Content */}
            <div className="d-flex flex-column align-items-center w-100 pt-4 px-3">
              {/* Profile Avatar */}
              <div className="position-relative mb-3">
                {renderUserAvatar(currentUser, 'large', isEditing)}
                <input
                  id="photo-upload-mobile-popup"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="d-none"
                  disabled={uploadingPhoto}
                />
              </div>
              {/* User Info */}
              <div className="text-center mb-3">
                <div className="fw-bold text-white fs-5">{currentUser?.name || 'User'}</div>
                <div className="text-white small">{currentUser?.email || ''}</div>
              </div>
              {/* Edit/Save Buttons */}
              <div className="d-flex gap-2 mb-3">
                {!isEditing ? (
                  <button
                    className="btn btn-outline-accent btn-sm d-flex align-items-center gap-1"
                    onClick={handleEditProfile}
                  >
                    <Edit className="w-4 h-4" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-outline-light btn-sm d-flex align-items-center gap-1"
                      onClick={handleCancelEdit}
                      disabled={saving || uploadingPhoto}
                    >
                      <CloseIcon className="w-4 h-4" />
                      Cancel
                    </button>
                    <button
                      className="btn btn-primary btn-sm d-flex align-items-center gap-1"
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
                )}
              </div>
              {/* Profile Information */}
              <div className="w-100">
                {isEditing ? (
                  <div className="mb-3">
                    <h6 className="text-accent mb-2 fw-bold">EDIT PROFILE</h6>
                   
                    {/* Photo Upload Section */}
                    <div className="photo-upload-section mb-3">
                      <div className="d-flex align-items-center gap-3">
                        <div className="flex-grow-1">
                          <div className="text-sm text-white mb-2">Profile Photo</div>
                          <div className="d-flex gap-2 flex-wrap">
                            <label
                              htmlFor="photo-upload-mobile-popup"
                              className="btn btn-outline-accent btn-sm d-flex align-items-center gap-1"
                              disabled={uploadingPhoto}
                            >
                              <Camera className="w-4 h-4" />
                              {uploadingPhoto ? 'Uploading...' : (editedUser?.photoURL ? 'Change Photo' : 'Upload Photo')}
                            </label>
                            {editedUser?.photoURL && (
                              <button
                                className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1"
                                onClick={handleRemovePhoto}
                                disabled={uploadingPhoto}
                              >
                                <X className="w-4 h-4" />
                                Remove
                              </button>
                            )}
                          </div>
                          <div className="text-white small mt-2">
                            Recommended: Square image, max 2MB
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Edit Form */}
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
                      <span className="profile-info-label text-white">Full Name:</span>
                      <span className="profile-info-value text-white">{currentUser?.name || 'Not set'}</span>
                    </div>
                    <div className="profile-info-item">
                      <span className="profile-info-label text-white">Email:</span>
                      <span className="profile-info-value text-white">{currentUser?.email || 'Not set'}</span>
                    </div>
                    <div className="profile-info-item">
                      <span className="profile-info-label text-white">Phone:</span>
                      <span className="profile-info-value text-white">{currentUser?.phone || 'Not set'}</span>
                    </div>
                    <div className="profile-info-item">
                      <span className="profile-info-label text-white">Location:</span>
                      <span className="profile-info-value text-white">{currentUser?.location || 'Not set'}</span>
                    </div>
                    <div className="profile-info-item">
                      <span className="profile-info-label text-white">Member Since:</span>
                      <span className="profile-info-value text-white">{getMemberSince()}</span>
                    </div>
                    <div className="profile-info-item">
                      <span className="profile-info-label text-white">Status:</span>
                      <span className="status-badge-small">Certified</span>
                    </div>
                  </div>
                )}
                {/* Global Reach Info */}
                <div className="text-center text-white small mb-3">
                  <div className="text-accent fw-bold">Global Reach, Local Impact</div>
                  <div>Serving customers across 42 countries</div>
                </div>
                {/* Sign Out Button */}
                <button
                  className="btn btn-primary w-100 py-2 d-flex align-items-center justify-content-center gap-2"
                  onClick={signOut}
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Overlay */}
      {(mobileMenuOpen || mobileProfileOpen || ordersPopupOpen) && (
        <div className="overlay active d-md-none" onClick={() => {
          setMobileMenuOpen(false);
          setMobileProfileOpen(false);
          closeOrdersPopup();
        }}></div>
      )}
      {/* Inline styles for orders popup */}
      <style jsx>{`
        .orders-dot-badge {
          position: absolute;
          top: -2px;
          right: -2px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #dc3545;
          color: #dc3545;
          font-size: 12px;
          line-height: 1;
          font-weight: bold;
          animation: blink 1s infinite;
        }
        
        .order-status-success {
          display: flex;
          align-items: center;
        }
        
        .status-badge-success {
          background: rgba(40, 167, 69, 0.2);
          color: #28a745;
          padding: 0.25rem 0.75rem;
          border-radius: 1rem;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          border: 1px solid rgba(40, 167, 69, 0.3);
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
        }
        
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </>
  );
};

export default Navbar;