import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from './CartContext';
import { 
  ShoppingCart, 
  Minus, 
  Plus, 
  Trash2, 
  ArrowLeft, 
  Check,
  Home,
  RefreshCw,
  User,
  LogIn,
  ShoppingBag
} from 'lucide-react';
import CheckoutModal from './CheckoutModal';
import { database, ref, get } from '../firebase';

const CartPage = () => {
  const navigate = useNavigate();
  const { 
    items, 
    removeFromCart, 
    updateQuantity, 
    getTotalItems, 
    clearCart,
    user,
    loadCartFromFirebase,
    setCheckoutProducts
  } = useCart();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [cartStatus, setCartStatus] = useState('local');
  const [lastSynced, setLastSynced] = useState(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [checkoutProducts, setCheckoutProductsLocal] = useState([]);
  
  // State for complete user profile from database
  const [completeProfile, setCompleteProfile] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // Currency states from Firebase
  const [currencyRates, setCurrencyRates] = useState({});
  const [currencySymbols, setCurrencySymbols] = useState({});

  // Fetch complete user data from Firebase when user changes
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) {
        setCompleteProfile(null);
        return;
      }

      console.log("👤 Firebase Auth User:", user);
      setIsLoadingProfile(true);

      try {
        // Try to find user in 'users' node first
        const usersRef = ref(database, 'users');
        const usersSnapshot = await get(usersRef);
        
        let userData = null;
        
        if (usersSnapshot.exists()) {
          const users = usersSnapshot.val();
          // Find user by email or uid
          const foundUser = Object.values(users).find(
            u => u.email === user.email || u.uid === user.uid
          );
          
          if (foundUser) {
            console.log("📋 Found user in 'users' node:", foundUser);
            userData = foundUser;
          }
        }

        // If not found in users, try vendors node
        if (!userData) {
          const vendorsRef = ref(database, 'vendors');
          const vendorsSnapshot = await get(vendorsRef);
          
          if (vendorsSnapshot.exists()) {
            const vendors = vendorsSnapshot.val();
            const foundVendor = Object.values(vendors).find(
              v => v.email === user.email || v.uid === user.uid
            );
            
            if (foundVendor) {
              console.log("📋 Found user in 'vendors' node:", foundVendor);
              userData = foundVendor;
            }
          }
        }

        // Create complete profile object
        const profileData = {
          // From Firebase Auth
          uid: user.uid,
          name: user.displayName || userData?.name || "",
          email: user.email || "",
          
          // From database (users/vendors node)
          phone: userData?.phone || user.phoneNumber || "",
          country: userData?.country || "India",
          state: userData?.state || "",
          city: userData?.city || "",
          pincode: userData?.pincode || "",
          
          // Store the entire userData for reference
          ...(userData || {})
        };

        console.log("✅ Complete profile created:", profileData);
        setCompleteProfile(profileData);
      } catch (error) {
        console.error("❌ Error fetching user profile:", error);
        
        // Fallback to basic auth data
        setCompleteProfile({
          uid: user.uid,
          name: user.displayName || "",
          email: user.email || "",
          phone: user.phoneNumber || "",
          country: "India",
          state: "",
          city: "",
          pincode: ""
        });
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  // Fetch currency data from Firebase
  useEffect(() => {
    const fetchCurrencyData = async () => {
      try {
        const [ratesSnap, symbolsSnap] = await Promise.all([
          get(ref(database, 'currency/rates')),
          get(ref(database, 'currency/symbols'))
        ]);

        const rates = ratesSnap.exists() ? ratesSnap.val() : { USD: 1 };
        const symbols = symbolsSnap.exists() ? symbolsSnap.val() : { USD: '$' };

        console.log('💰 Cart page currency rates:', rates);
        console.log('💰 Cart page currency symbols:', symbols);

        setCurrencyRates(rates);
        setCurrencySymbols(symbols);
      } catch (error) {
        console.error('Error fetching currency data:', error);
        setCurrencyRates({ USD: 1 });
        setCurrencySymbols({ USD: '$' });
      }
    };

    fetchCurrencyData();
  }, []);

  useEffect(() => {
    const checkCartStatus = () => {
      const cartId = user ? `user_${user.uid}` : localStorage.getItem('guestCartId');
      if (cartId) {
        setCartStatus('synced');
        setLastSynced(new Date().toLocaleTimeString());
      }
    };
    
    checkCartStatus();
  }, [user]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleHome = () => {
    navigate('/');
  };

  const handleQuantityChange = (cartItemId, delta) => {
    const item = items.find(item => item.cartItemId === cartItemId);
    if (item) {
      const newQty = Math.max(1, item.quantity + delta);
      updateQuantity(cartItemId, newQty);
    }
  };

  // ============================================
  // Get correct currency symbol based on cart item
  // ============================================
  const getCurrencySymbol = (item) => {
    // For rice products, always use ₹
    if (item.isRice || item.selectedGrade || item.category === 'rice') {
      return '₹';
    }
    
    // For USD products
    if (item.price_usd_per_carton || item.fob_price_usd || item["Ex-Mill_usd"]) {
      return '$';
    }
    
    // Use the stored cart currency if available
    if (item.cartCurrencySymbol) {
      return item.cartCurrencySymbol;
    }
    
    // Default fallback
    return '₹';
  };

  // ============================================
  // Get the correct unit price with grade
  // ============================================
  const getUnitPrice = (item) => {
    const currencySymbol = getCurrencySymbol(item);
    
    // 🔥 FIXED: If item has selected grade with price, use that directly
    if (item.selectedGrade && item.selectedGradePrice) {
      return `${currencySymbol}${parseFloat(item.selectedGradePrice).toFixed(2)} / kg`;
    }
    
    // Check if price object exists with grade price
    if (item.price && item.price.selectedGradePrice) {
      return `${currencySymbol}${parseFloat(item.price.selectedGradePrice).toFixed(2)} / kg`;
    }
    
    // If it's a rice product with range
    if (item.isRice && item.price && item.price.min && item.price.max) {
      return `${currencySymbol}${item.price.min.toFixed(2)} - ${currencySymbol}${item.price.max.toFixed(2)} / kg`;
    }
    
    // If it has display value
    if (item.price && item.price.display) {
      return item.price.display;
    }
    
    // If it has value
    if (item.price && item.price.value) {
      return `${currencySymbol}${item.price.value.toFixed(2)} / ${item.price.unit || 'kg'}`;
    }
    
    // Fallback to original price fields
    if (item.price_usd_per_carton) {
      return `$${parseFloat(item.price_usd_per_carton).toFixed(2)} / carton`;
    }
    
    if (item.fob_price_usd) {
      return `$${parseFloat(item.fob_price_usd).toFixed(2)} FOB`;
    }
    
    if (item["Ex-Mill_usd"]) {
      return `$${parseFloat(item["Ex-Mill_usd"]).toFixed(2)} EX-MILL`;
    }
    
    return 'Contact for Price';
  };

  // ============================================
  // 🔥 FIXED: Get item total price with correct calculation
  // ============================================
  const getItemTotalPrice = (item) => {
    const currencySymbol = getCurrencySymbol(item);
    
    // 🔥 CRITICAL FIX: If item has selected grade with price, use that for calculation
    if (item.selectedGrade && item.selectedGradePrice) {
      const pricePerKg = parseFloat(item.selectedGradePrice);
      const packageSize = parseFloat(item.selectedQuantity) || 1;
      const numberOfPackages = item.quantity || 1;
      // Simple multiplication: price × quantity
      const total = pricePerKg * packageSize * numberOfPackages;
      
      console.log('💰 Grade price calculation:', {
        grade: item.selectedGrade,
        pricePerKg,
        packageSize,
        numberOfPackages,
        total
      });
      
      return {
        value: total.toFixed(2),
        isRange: false,
        currency: currencySymbol,
        display: `${currencySymbol}${total.toFixed(2)}`,
        breakdown: `${pricePerKg} × ${packageSize}kg × ${numberOfPackages}`
      };
    }
    
    // Check if price object exists with converted value
    if (item.price && item.price.value) {
      const priceValue = parseFloat(item.price.value);
      const numberOfPackages = item.quantity || 1;
      const total = priceValue * numberOfPackages;
      
      return {
        value: total.toFixed(2),
        isRange: false,
        currency: currencySymbol,
        display: `${currencySymbol}${total.toFixed(2)}`
      };
    }
    
    // Rice product with range
    if (item.isRice && item.price && item.price.min && item.price.max) {
      const avgPrice = (parseFloat(item.price.min) + parseFloat(item.price.max)) / 2;
      const packageSize = parseFloat(item.selectedQuantity) || 1;
      const numberOfPackages = item.quantity || 1;
      const total = avgPrice * packageSize * numberOfPackages;
      
      return {
        min: (parseFloat(item.price.min) * packageSize * numberOfPackages).toFixed(2),
        max: (parseFloat(item.price.max) * packageSize * numberOfPackages).toFixed(2),
        isRange: true,
        currency: currencySymbol,
        value: total.toFixed(2)
      };
    }
    
    // Fallback to original price fields
    if (item.price_usd_per_carton !== undefined) {
      const priceValue = parseFloat(item.price_usd_per_carton);
      const numberOfPackages = item.quantity || 1;
      const total = priceValue * numberOfPackages;
      
      return {
        value: total.toFixed(2),
        isRange: false,
        currency: '$',
        display: `$${total.toFixed(2)}`
      };
    }
    
    if (item.fob_price_usd !== undefined) {
      const priceValue = parseFloat(item.fob_price_usd);
      const numberOfPackages = item.quantity || 1;
      const total = priceValue * numberOfPackages;
      
      return {
        value: total.toFixed(2),
        isRange: false,
        currency: '$',
        display: `$${total.toFixed(2)}`
      };
    }
    
    if (item["Ex-Mill_usd"] !== undefined) {
      const priceValue = parseFloat(item["Ex-Mill_usd"]);
      const numberOfPackages = item.quantity || 1;
      const total = priceValue * numberOfPackages;
      
      return {
        value: total.toFixed(2),
        isRange: false,
        currency: '$',
        display: `$${total.toFixed(2)}`
      };
    }
    
    return {
      value: '0.00',
      isRange: false,
      currency: currencySymbol,
      display: `${currencySymbol}0.00`
    };
  };

  // ============================================
  // 🔥 FIXED: Calculate total cart price correctly
  // ============================================
  const calculateTotalPrice = () => {
    let total = 0;
    items.forEach(item => {
      // 🔥 CRITICAL FIX: If item has selected grade with price, use that
      if (item.selectedGrade && item.selectedGradePrice) {
        const pricePerKg = parseFloat(item.selectedGradePrice);
        const packageSize = parseFloat(item.selectedQuantity) || 1;
        const numberOfPackages = item.quantity || 1;
        total += pricePerKg * packageSize * numberOfPackages;
      }
      // If price object exists
      else if (item.price && item.price.value) {
        total += parseFloat(item.price.value) * (item.quantity || 1);
      }
      // Rice product with range (use average)
      else if (item.isRice && item.price && item.price.min && item.price.max) {
        const avgPrice = (parseFloat(item.price.min) + parseFloat(item.price.max)) / 2;
        const packageSize = parseFloat(item.selectedQuantity) || 1;
        const numberOfPackages = item.quantity || 1;
        total += avgPrice * packageSize * numberOfPackages;
      }
      // Fallback to original price fields
      else if (item.price_usd_per_carton) {
        total += parseFloat(item.price_usd_per_carton) * (item.quantity || 1);
      } else if (item.fob_price_usd) {
        total += parseFloat(item.fob_price_usd) * (item.quantity || 1);
      } else if (item["Ex-Mill_usd"]) {
        total += parseFloat(item["Ex-Mill_usd"]) * (item.quantity || 1);
      }
    });
    return total.toFixed(2);
  };

  // ============================================
  // Calculate tax (10%)
  // ============================================
  const calculateTax = (subtotal) => {
    return (parseFloat(subtotal) * 0.1).toFixed(2);
  };

  // ============================================
  // Calculate final total
  // ============================================
  const calculateFinalTotal = (subtotal, tax) => {
    return (parseFloat(subtotal) + parseFloat(tax)).toFixed(2);
  };

  // ============================================
  // Get display name with grade
  // ============================================
  const getProductDisplayName = (item) => {
    if (item.selectedGradeDisplay) {
      return (
        <>
          <div style={{ fontWeight: 'bold' }}>{item.name}</div>
          <div style={{ color: '#10b981', fontSize: '0.9rem', marginTop: '4px' }}>
            Grade: {item.selectedGradeDisplay}
          </div>
        </>
      );
    }
    if (item.selectedGrade) {
      return (
        <>
          <div style={{ fontWeight: 'bold' }}>{item.name}</div>
          <div style={{ color: '#10b981', fontSize: '0.9rem', marginTop: '4px' }}>
            Grade: {item.selectedGrade}
          </div>
        </>
      );
    }
    return <div>{item.name}</div>;
  };

  // ============================================
  // Get package display
  // ============================================
  const getPackageDisplay = (item) => {
    const packageSize = item.selectedQuantity || 1;
    const packageUnit = item.quantityUnit || 'kg';
    return `${packageSize}${packageUnit}`;
  };

  const handleCartCheckout = () => {
    if (items.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    console.log("🛒 Preparing products for checkout from cart:", items);

    const productsForCheckout = items.map(item => ({
      ...item,
      name: item.name || `Product ${item.id}`,
      price: item.price,
      quantity: item.quantity,
      image: item.image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&auto=format&fit=crop&q=60',
      companyName: item.companyName || 'Unknown Company',
      brandName: item.brandName || 'General',
      unit: item.unit || 'unit',
      category: item.category || 'General',
      selectedGrade: item.selectedGrade,
      selectedGradePrice: item.selectedGradePrice,
      selectedGradeDisplay: item.selectedGradeDisplay,
      selectedPacking: item.selectedPacking,
      selectedQuantity: item.selectedQuantity,
      quantityUnit: item.quantityUnit,
      isRice: item.isRice,
      price_usd_per_carton: item.price_usd_per_carton,
      fob_price_usd: item.fob_price_usd,
      "Ex-Mill_usd": item["Ex-Mill_usd"],
      cartCurrency: item.cartCurrency,
      cartCurrencySymbol: item.cartCurrencySymbol
    }));

    setCheckoutProductsLocal(productsForCheckout);
    if (setCheckoutProducts) {
      setCheckoutProducts(productsForCheckout);
    }
    
    // Open checkout modal
    setIsCheckoutModalOpen(true);
  };

  const handleContinueShopping = () => {
    navigate('/products');
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      clearCart();
    }
  };

  const handleSyncCart = async () => {
    setIsSyncing(true);
    try {
      await loadCartFromFirebase();
      setCartStatus('synced');
      setLastSynced(new Date().toLocaleTimeString());
      const message = document.createElement('div');
      message.textContent = 'Cart synced successfully!';
      message.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
      `;
      document.body.appendChild(message);
      setTimeout(() => message.remove(), 3000);
    } catch (error) {
      setCartStatus('error');
      alert('Error syncing cart: ' + error.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLoginToSaveCart = () => {
    navigate('/login', { 
      state: { 
        from: '/cart',
        message: 'Login to save your cart and access it from any device!' 
      } 
    });
  };

  const handleGuestCheckout = () => {
    if (items.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    if (window.confirm('You can checkout as a guest, but your cart will only be saved on this device. Login to save your cart permanently. Continue as guest?')) {
      handleCartCheckout();
    }
  };

  const handleCheckoutModalClose = () => {
    setIsCheckoutModalOpen(false);
    setCheckoutProductsLocal([]);
  };

  const handleOrderSubmitted = () => {
    clearCart();
    setIsCheckoutModalOpen(false);
    setCheckoutProductsLocal([]);
  };

  const subtotal = calculateTotalPrice();
  const tax = calculateTax(subtotal);
  const finalTotal = calculateFinalTotal(subtotal, tax);

  if (items.length === 0) {
    return (
      <>
        <div className="cart-page" style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: 'white',
          paddingTop: '80px',
          width: '100%',
          overflowX: 'hidden'
        }}>
          <div className="container" style={{ 
            maxWidth: '1200px', 
            margin: '0 auto', 
            padding: '2rem 1rem',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '2rem',
              gap: '1rem'
            }}>
              <button
                onClick={handleBack}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#8FB3E2',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  padding: '0.5rem'
                }}
              >
                <ArrowLeft size={20} />
                <span className="back-text">Back</span>
              </button>
              
              <button
                onClick={handleHome}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#8FB3E2',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  padding: '0.5rem'
                }}
              >
                <Home size={20} />
                <span className="home-text">Home</span>
              </button>
            </div>

            <div style={{
              textAlign: 'center',
              padding: '4rem 1rem',
              background: 'rgba(30, 41, 59, 0.5)',
              borderRadius: '16px',
              border: '2px solid rgba(64, 150, 226, 0.2)',
              marginTop: '2rem',
              width: '100%',
              boxSizing: 'border-box'
            }}>
              <ShoppingCart size={80} style={{ margin: '0 auto 1.5rem', color: '#475569', opacity: 0.7 }} />
              <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', marginBottom: '1rem', color: '#f1f5f9' }}>Your Cart is Empty</h1>
              <p style={{ fontSize: 'clamp(1rem, 4vw, 1.1rem)', color: '#cbd5e0', marginBottom: '1rem', maxWidth: '500px', margin: '0 auto' }}>
                Looks like you haven't added any products to your cart yet.
              </p>
              
              <button
                onClick={handleContinueShopping}
                style={{
                  background: 'linear-gradient(135deg, #8FB3E2 0%, #4096e2 100%)',
                  border: 'none',
                  color: 'white',
                  padding: '1rem 2rem',
                  borderRadius: '10px',
                  fontSize: 'clamp(1rem, 4vw, 1.1rem)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  marginTop: '1.5rem',
                  width: 'auto',
                  maxWidth: '100%'
                }}
                onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
              >
                Browse Products
              </button>
            </div>
          </div>
        </div>

        <CheckoutModal
          isOpen={isCheckoutModalOpen}
          onClose={handleCheckoutModalClose}
          products={checkoutProducts}
          profile={completeProfile}
          onOrderSubmitted={handleOrderSubmitted}
          currencyRates={currencyRates}
          currencySymbols={currencySymbols}
          selectedCurrency={items[0]?.cartCurrency || 'INR'}
        />
      </>
    );
  }

  // Determine the primary currency for the cart
  const cartCurrency = 'INR'; // Force INR for rice products
  const cartCurrencySymbol = '₹';

  return (
    <>
      <div className="cart-page" style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: 'white',
        paddingTop: '80px',
        width: '100%',
        overflowX: 'hidden'
      }}>
        <div className="container" style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '2rem 1rem',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          {/* Header Section */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '2rem',
            gap: '1rem'
          }}>
            <div style={{ 
              display: 'flex', 
              gap: '0.5rem', 
              alignItems: 'center',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={handleBack}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#8FB3E2',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  padding: '0.5rem'
                }}
              >
                <ArrowLeft size={18} />
                <span className="back-text">Back</span>
              </button>
            </div>

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={handleClearCart}
                style={{
                  background: 'none',
                  border: '1px solid #ef4444',
                  color: '#ef4444',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap'
                }}
                onMouseOver={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.1)'}
                onMouseOut={(e) => e.target.style.background = 'none'}
              >
                Clear
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: '2rem'
          }}>
            {/* Cart Items List */}
            <div style={{ 
              flex: '1 1 500px',
              minWidth: '280px'
            }}>
              <div style={{
                background: 'rgba(30, 41, 59, 0.6)',
                borderRadius: '12px',
                border: '1px solid rgba(64, 150, 226, 0.3)',
                overflow: 'hidden'
              }}>
                {items.map((item, index) => {
                  const totalPrice = getItemTotalPrice(item);
                  const unitPrice = getUnitPrice(item);
                  const packageSize = item.selectedQuantity || 1;
                  const packageUnit = item.quantityUnit || 'kg';
                  const currencySymbol = getCurrencySymbol(item);
                  
                  return (
                    <div key={item.cartItemId || item.id} style={{
                      display: 'flex',
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      alignItems: 'flex-start',
                      padding: '1rem',
                      borderBottom: index < items.length - 1 ? '1px solid rgba(64, 150, 226, 0.2)' : 'none',
                      gap: '1rem',
                      transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(30, 41, 59, 0.8)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        style={{ 
                          width: '80px', 
                          height: '80px', 
                          objectFit: 'cover', 
                          borderRadius: '8px',
                          border: '2px solid rgba(64, 150, 226, 0.3)',
                          flexShrink: 0
                        }} 
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&auto=format&fit=crop&q=60';
                        }}
                      />
                      
                      <div style={{ 
                        flex: '1 1 200px',
                        minWidth: '150px'
                      }}>
                        <div style={{ margin: '0 0 0.25rem' }}>
                          <div style={{ fontWeight: 'bold', fontSize: '1rem', color: 'white' }}>
                            {item.name}
                          </div>
                          {item.selectedGradeDisplay && (
                            <div style={{ 
                              color: '#10b981', 
                              fontSize: '0.9rem', 
                              marginTop: '2px',
                              fontWeight: '500'
                            }}>
                              Grade: {item.selectedGradeDisplay}
                            </div>
                          )}
                          {item.selectedGrade && !item.selectedGradeDisplay && (
                            <div style={{ 
                              color: '#10b981', 
                              fontSize: '0.9rem', 
                              marginTop: '2px',
                              fontWeight: '500'
                            }}>
                              Grade: {item.selectedGrade}
                            </div>
                          )}
                        </div>
                        
                        <p style={{ margin: '0 0 0.25rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                          {item.companyName}
                        </p>
                        
                        {item.selectedPacking && (
                          <p style={{ margin: '0 0 0.25rem', color: '#60a5fa', fontSize: '0.85rem' }}>
                            {item.selectedPacking}
                          </p>
                        )}
                        
                        <p style={{ margin: '0 0 0.25rem', color: '#10b981', fontSize: '0.95rem', fontWeight: 'bold' }}>
                          {unitPrice}
                        </p>
                        
                        {/* GREEN TICK AND SYNCED TEXT REMOVED - No longer displayed */}
                      </div>

                      <div style={{ 
                        display: 'flex',
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        gap: '0.75rem',
                        marginLeft: 'auto'
                      }}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.5rem', 
                          background: 'rgba(15, 23, 42, 0.5)', 
                          padding: '0.25rem', 
                          borderRadius: '6px'
                        }}>
                          <button 
                            onClick={() => handleQuantityChange(item.cartItemId, -1)}
                            style={{
                              background: 'none',
                              border: '1px solid #4096e2',
                              color: 'white',
                              width: '32px',
                              height: '32px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => e.target.style.background = 'rgba(64, 150, 226, 0.2)'}
                            onMouseOut={(e) => e.target.style.background = 'none'}
                          >
                            <Minus size={16} />
                          </button>
                          <span style={{ 
                            fontWeight: 'bold', 
                            minWidth: '24px', 
                            textAlign: 'center',
                            fontSize: '1rem',
                            color: 'white'
                          }}>
                            {item.quantity}
                          </span>
                          <button 
                            onClick={() => handleQuantityChange(item.cartItemId, 1)}
                            style={{
                              background: 'none',
                              border: '1px solid #4096e2',
                              color: 'white',
                              width: '32px',
                              height: '32px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => e.target.style.background = 'rgba(64, 150, 226, 0.2)'}
                            onMouseOut={(e) => e.target.style.background = 'none'}
                          >
                            <Plus size={16} />
                          </button>
                        </div>

                        <div style={{ textAlign: 'right', minWidth: '90px' }}>
                          {totalPrice.isRange ? (
                            <>
                              <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#10b981' }}>
                                {currencySymbol}{totalPrice.min}
                              </div>
                              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                                {item.quantity} × {packageSize}{packageUnit}
                              </div>
                            </>
                          ) : (
                            <>
                              <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#10b981' }}>
                                {totalPrice.display || `${currencySymbol}${totalPrice.value}`}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                {item.quantity} × {packageSize}{packageUnit}
                              </div>
                            </>
                          )}
                        </div>

                        <button 
                          onClick={() => removeFromCart(item.cartItemId)}
                          style={{
                            background: 'none',
                            border: '1px solid #ef4444',
                            color: '#ef4444',
                            width: '36px',
                            height: '36px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s',
                            flexShrink: 0
                          }}
                          onMouseOver={(e) => {
                            e.target.style.background = 'rgba(239, 68, 68, 0.1)';
                          }}
                          onMouseOut={(e) => {
                            e.target.style.background = 'none';
                          }}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                <button
                  onClick={handleContinueShopping}
                  style={{
                    background: 'none',
                    border: '2px solid #8FB3E2',
                    color: '#8FB3E2',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    width: '100%',
                    maxWidth: '300px'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = 'rgba(143, 179, 226, 0.1)';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = 'none';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  Continue Shopping
                </button>
              </div>
            </div>

            {/* Order Summary */}
            <div style={{ 
              flex: '0 0 300px',
              width: '100%',
              background: 'rgba(30, 41, 59, 0.6)',
              borderRadius: '12px',
              border: '1px solid rgba(64, 150, 226, 0.3)',
              padding: '1.5rem',
              height: 'fit-content',
              position: 'sticky',
              top: '100px',
              alignSelf: 'flex-start'
            }}>
              <h2 style={{ margin: '0 0 1.5rem', color: '#f1f5f9', fontSize: '1.3rem' }}>Order Summary</h2>
              
              <div style={{ marginBottom: '1.5rem', maxHeight: '300px', overflowY: 'auto' }}>
                {items.map(item => {
                  const unitPrice = getUnitPrice(item);
                  const packageSize = item.selectedQuantity || 1;
                  const packageUnit = item.quantityUnit || 'kg';
                  const currencySymbol = getCurrencySymbol(item);
                  const gradePrice = item.selectedGradePrice ? parseFloat(item.selectedGradePrice) : null;
                  
                  return (
                    <div key={item.cartItemId || item.id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '0.75rem',
                      paddingBottom: '0.75rem',
                      borderBottom: '1px solid rgba(64, 150, 226, 0.1)',
                      gap: '0.5rem'
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: 'white', fontSize: '0.9rem' }}>
                          {item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name}
                          {item.selectedGradeDisplay && (
                            <span style={{ color: '#10b981', marginLeft: '4px', fontSize: '0.8rem' }}>
                              ({item.selectedGradeDisplay})
                            </span>
                          )}
                          {item.selectedGrade && !item.selectedGradeDisplay && (
                            <span style={{ color: '#10b981', marginLeft: '4px', fontSize: '0.8rem' }}>
                              ({item.selectedGrade})
                            </span>
                          )}
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                          {item.quantity} × {packageSize}{packageUnit}
                          {gradePrice && (
                            <span style={{ color: '#10b981', marginLeft: '4px' }}>
                              @ {currencySymbol}{gradePrice}/kg
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{ color: '#10b981', fontWeight: '500', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                        {currencySymbol}{gradePrice ? (gradePrice * packageSize * item.quantity).toFixed(2) : (parseFloat(item.price?.value || 0) * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ borderTop: '2px solid rgba(64, 150, 226, 0.3)', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                  <span style={{ color: '#cbd5e0' }}>Subtotal</span>
                  <span style={{ color: 'white', fontWeight: '500' }}>{cartCurrencySymbol}{subtotal}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                  <span style={{ color: '#cbd5e0' }}>Shipping</span>
                  <span style={{ color: '#10b981', fontSize: '0.85rem' }}>Calculated at checkout</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                  <span style={{ color: '#cbd5e0' }}>Tax (10%)</span>
                  <span style={{ color: 'white', fontWeight: '500' }}>{cartCurrencySymbol}{tax}</span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginTop: '1rem',
                  paddingTop: '1rem',
                  borderTop: '2px solid rgba(64, 150, 226, 0.3)',
                  fontSize: '1.1rem'
                }}>
                  <span style={{ color: '#f1f5f9', fontWeight: 'bold' }}>Total</span>
                  <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '1.2rem' }}>
                    {cartCurrencySymbol}{finalTotal}
                  </span>
                </div>
              </div>

              {/* Checkout Buttons */}
              <div style={{ marginTop: '1.5rem' }}>
                {user ? (
                  <button
                    onClick={handleCartCheckout}
                    disabled={isProcessing || isLoadingProfile}
                    style={{
                      background: isProcessing || isLoadingProfile
                        ? '#6b7280' 
                        : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      border: 'none',
                      color: 'white',
                      padding: '1rem',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: (isProcessing || isLoadingProfile) ? 'not-allowed' : 'pointer',
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.3s'
                    }}
                    onMouseOver={(e) => {
                      if (!isProcessing && !isLoadingProfile) {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 5px 15px rgba(16, 185, 129, 0.3)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!isProcessing && !isLoadingProfile) {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                      }
                    }}
                  >
                    {isProcessing ? (
                      <>
                        <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                        Processing...
                      </>
                    ) : isLoadingProfile ? (
                      <>
                        <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                        Loading...
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={20} />
                        Checkout
                      </>
                    )}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleGuestCheckout}
                      disabled={isProcessing}
                      style={{
                        background: isProcessing 
                          ? '#6b7280' 
                          : 'linear-gradient(135deg, #8FB3E2 0%, #4096e2 100%)',
                        border: 'none',
                        color: 'white',
                        padding: '1rem',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: isProcessing ? 'not-allowed' : 'pointer',
                        width: '100%',
                        transition: 'all 0.3s'
                      }}
                      onMouseOver={(e) => {
                        if (!isProcessing) {
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 5px 15px rgba(64, 150, 226, 0.3)';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (!isProcessing) {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = 'none';
                        }
                      }}
                    >
                      {isProcessing ? 'Processing...' : 'Guest Checkout'}
                    </button>
                    
                    {/* LOGIN BUTTON REMOVED - No longer displayed for guest users */}
                  </>
                )}
              </div>

              {/* SECURE CHECKOUT MESSAGE REMOVED - No longer displayed */}
            </div>
          </div>
        </div>

        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          .spinning {
            animation: spin 1s linear infinite;
          }
          
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          
          .spinner-border {
            display: inline-block;
            width: 1rem;
            height: 1rem;
            vertical-align: text-bottom;
            border: 0.2em solid currentColor;
            border-right-color: transparent;
            border-radius: 50%;
            animation: spinner-border .75s linear infinite;
          }
          
          @keyframes spinner-border {
            to { transform: rotate(360deg); }
          }

          @media (max-width: 992px) {
            .cart-page .container {
              padding: 1.5rem 1rem;
            }
            
            .back-text, .home-text {
              display: inline;
            }
          }

          @media (max-width: 768px) {
            .cart-page {
              padding-top: 70px;
            }
            
            .back-text, .home-text {
              display: inline;
            }
          }

          @media (max-width: 480px) {
            .cart-page {
              padding-top: 60px;
            }
            
            .back-text, .home-text {
              display: none;
            }
            
            .cart-page .container {
              padding: 1rem 0.75rem;
            }
          }

          img {
            max-width: 100%;
            height: auto;
          }

          @media (max-width: 768px) {
            div[style*="position: sticky"] {
              position: static;
            }
          }
        `}</style>
      </div>

      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={handleCheckoutModalClose}
        products={checkoutProducts}
        profile={completeProfile}
        onOrderSubmitted={handleOrderSubmitted}
        currencyRates={currencyRates}
        currencySymbols={currencySymbols}
        selectedCurrency="INR"
      />
    </>
  );
};

export default CartPage;