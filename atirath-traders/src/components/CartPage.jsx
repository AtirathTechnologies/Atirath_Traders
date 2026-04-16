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
  ShoppingBag,
  Package
} from 'lucide-react';
import CheckoutModal from './CheckoutModal';
import { database, ref, get } from '../firebase';
import '../styles/form.css';

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
  
  const [completeProfile, setCompleteProfile] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  const [currencyRates, setCurrencyRates] = useState({});
  const [currencySymbols, setCurrencySymbols] = useState({});

  useEffect(() => {
    console.log("📦 Cart items:", items.map(i => ({ 
      name: i.name, 
      packingCost: i.totalPackingCost,
      isRice: i.isRice,
      packPrice: i.price?.packPrice
    })));
  }, [items]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) {
        setCompleteProfile(null);
        return;
      }

      setIsLoadingProfile(true);
      try {
        const usersRef = ref(database, 'users');
        const usersSnapshot = await get(usersRef);
        
        let userData = null;
        if (usersSnapshot.exists()) {
          const users = usersSnapshot.val();
          const foundUser = Object.values(users).find(
            u => u.email === user.email || u.uid === user.uid
          );
          if (foundUser) userData = foundUser;
        }

        if (!userData) {
          const vendorsRef = ref(database, 'vendors');
          const vendorsSnapshot = await get(vendorsRef);
          if (vendorsSnapshot.exists()) {
            const vendors = vendorsSnapshot.val();
            const foundVendor = Object.values(vendors).find(
              v => v.email === user.email || v.uid === user.uid
            );
            if (foundVendor) userData = foundVendor;
          }
        }

        setCompleteProfile({
          uid: user.uid,
          name: user.displayName || userData?.name || "",
          email: user.email || "",
          phone: userData?.phone || user.phoneNumber || "",
          country: userData?.country || "India",
          state: userData?.state || "",
          city: userData?.city || "",
          pincode: userData?.pincode || "",
          ...(userData || {})
        });
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setCompleteProfile({
          uid: user.uid,
          name: user.displayName || "",
          email: user.email || "",
          phone: user.phoneNumber || "",
          country: "India",
        });
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  useEffect(() => {
    const fetchCurrencyData = async () => {
      try {
        const [ratesSnap, symbolsSnap] = await Promise.all([
          get(ref(database, 'currency/rates')),
          get(ref(database, 'currency/symbols'))
        ]);
        setCurrencyRates(ratesSnap.exists() ? ratesSnap.val() : { USD: 1 });
        setCurrencySymbols(symbolsSnap.exists() ? symbolsSnap.val() : { USD: '$' });
      } catch (error) {
        console.error('Error fetching currency data:', error);
        setCurrencyRates({ USD: 1 });
        setCurrencySymbols({ USD: '$' });
      }
    };
    fetchCurrencyData();
  }, []);

  const handleBack = () => navigate(-1);
  const handleHome = () => navigate('/');
  const handleContinueShopping = () => navigate('/products');

  const handleQuantityChange = (cartItemId, delta) => {
    const item = items.find(item => item.cartItemId === cartItemId);
    if (item) {
      const newQty = Math.max(1, item.quantity + delta);
      updateQuantity(cartItemId, newQty);
    }
  };

  const getCurrencySymbol = (item) => {
    if (item.isRice || item.selectedGrade || item.category === 'rice') return '₹';
    if (item.price_usd_per_carton || item.fob_price_usd || item["Ex-Mill_usd"]) return '$';
    return item.cartCurrencySymbol || '₹';
  };

  const getUnitPrice = (item) => {
    const currencySymbol = getCurrencySymbol(item);
    
    if (item.isRice && item.price?.packPrice && item.selectedQuantity) {
      const packPrice = parseFloat(item.price.packPrice);
      const packSize = item.selectedQuantity;
      const packUnit = item.quantityUnit || 'kg';
      return `${currencySymbol}${packPrice.toFixed(2)} / ${packSize}${packUnit}`;
    }
    
    if (item.selectedGrade && item.selectedGradePrice) {
      return `${currencySymbol}${parseFloat(item.selectedGradePrice).toFixed(2)} / kg`;
    }
    
    if (item.price?.display) return item.price.display;
    if (item.price_usd_per_carton) return `$${parseFloat(item.price_usd_per_carton).toFixed(2)} / carton`;
    if (item.fob_price_usd) return `$${parseFloat(item.fob_price_usd).toFixed(2)} FOB`;
    if (item["Ex-Mill_usd"]) return `$${parseFloat(item["Ex-Mill_usd"]).toFixed(2)} EX-MILL`;
    
    return 'Contact for Price';
  };

  const getItemProductPrice = (item) => {
    const currencySymbol = getCurrencySymbol(item);
    
    if (item.isRice && item.price?.packPrice) {
      const packPrice = parseFloat(item.price.packPrice);
      const numberOfPacks = item.quantity || 1;
      const total = packPrice * numberOfPacks;
      return {
        value: total.toFixed(2),
        display: `${currencySymbol}${total.toFixed(2)}`
      };
    }
    
    if (item.selectedGrade && item.selectedGradePrice && item.selectedQuantity) {
      const pricePerKg = parseFloat(item.selectedGradePrice);
      const packSize = parseFloat(item.selectedQuantity);
      const numberOfPacks = item.quantity || 1;
      const total = pricePerKg * packSize * numberOfPacks;
      return {
        value: total.toFixed(2),
        display: `${currencySymbol}${total.toFixed(2)}`
      };
    }
    
    if (item.price?.value) {
      const total = parseFloat(item.price.value) * (item.quantity || 1);
      return {
        value: total.toFixed(2),
        display: `${currencySymbol}${total.toFixed(2)}`
      };
    }
    
    if (item.price_usd_per_carton) {
      const total = parseFloat(item.price_usd_per_carton) * (item.quantity || 1);
      return {
        value: total.toFixed(2),
        display: `$${total.toFixed(2)}`
      };
    }
    
    return { value: '0.00', display: `${currencySymbol}0.00` };
  };

  const getPackingCost = (item) => {
    if (!item.isRice) return null;
    
    let packingCost = 0;
    if (item.totalPackingCost !== undefined && parseFloat(item.totalPackingCost) > 0) {
      packingCost = parseFloat(item.totalPackingCost);
    } else if (item.selectedConfig?.totalPackingCost !== undefined) {
      packingCost = parseFloat(item.selectedConfig.totalPackingCost);
    }
    
    if (packingCost > 0) {
      const packingPerKg = item.packingPricePerKg || item.selectedConfig?.packingPricePerKg || 0;
      const packSize = item.selectedQuantity || 1;
      return {
        value: packingCost.toFixed(2),
        display: `₹${packingCost.toFixed(2)}`,
        breakdown: packingPerKg > 0 ? `₹${packingPerKg.toFixed(2)}/kg × ${packSize}kg` : ''
      };
    }
    return null;
  };

  const calculateProductTotal = () => {
    let total = 0;
    items.forEach(item => {
      const productPrice = getItemProductPrice(item);
      total += parseFloat(productPrice.value);
    });
    return total;
  };

  const calculateTotalPackingCost = () => {
    let total = 0;
    items.forEach(item => {
      const packing = getPackingCost(item);
      if (packing) total += parseFloat(packing.value);
    });
    return total;
  };

  const calculateSubtotal = () => {
    return (calculateProductTotal() + calculateTotalPackingCost()).toFixed(2);
  };

  const calculateFinalTotal = () => calculateSubtotal();

  const productTotal = calculateProductTotal();
  const packingTotal = calculateTotalPackingCost();
  const subtotal = calculateSubtotal();
  const finalTotal = calculateFinalTotal();

  const handleCartCheckout = () => {
    if (items.length === 0) {
      alert('Your cart is empty!');
      return;
    }

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
      packingPricePerKg: item.packingPricePerKg,
      totalPackingCost: item.totalPackingCost,
      price_usd_per_carton: item.price_usd_per_carton,
      fob_price_usd: item.fob_price_usd,
      "Ex-Mill_usd": item["Ex-Mill_usd"],
      cartCurrency: item.cartCurrency,
      cartCurrencySymbol: item.cartCurrencySymbol
    }));

    setCheckoutProductsLocal(productsForCheckout);
    if (setCheckoutProducts) setCheckoutProducts(productsForCheckout);
    setIsCheckoutModalOpen(true);
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) clearCart();
  };

  const handleGuestCheckout = () => {
    if (items.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    if (window.confirm('Continue as guest? Your cart will only be saved on this device.')) {
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

  const cartCurrencySymbol = '₹';

  if (items.length === 0) {
    return (
      <>
        <div className="cart-page cart-page-empty">
          <div className="cart-container">
            <div className="cart-header-actions">
              <button onClick={handleBack} className="cart-back-btn"><ArrowLeft size={20} /> Back</button>
              <button onClick={handleHome} className="cart-home-btn"><Home size={20} /> Home</button>
            </div>
            <div className="cart-empty-state">
              <ShoppingCart size={80} className="cart-empty-icon" />
              <h1 className="cart-empty-title">Your Cart is Empty</h1>
              <p className="cart-empty-message">Looks like you haven't added any products yet.</p>
              <button onClick={handleContinueShopping} className="cart-browse-btn">Browse Products</button>
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
          selectedCurrency="INR"
        />
      </>
    );
  }

  return (
    <>
      <div className="cart-page">
        <div className="cart-container">
          <div className="cart-header-actions">
            <button onClick={handleBack} className="cart-back-btn"><ArrowLeft size={20} /> Back</button>
            <button onClick={handleClearCart} className="cart-clear-btn">Clear Cart</button>
          </div>

          <div className="cart-layout">
            {/* Cart Items */}
            <div className="cart-items-section">
              <div className="cart-items-list">
                {items.map((item, index) => {
                  const unitPrice = getUnitPrice(item);
                  const packingCost = getPackingCost(item);
                  const productPrice = getItemProductPrice(item);
                  const packSize = item.selectedQuantity || 1;
                  const packUnit = item.quantityUnit || 'kg';
                  const currencySymbol = getCurrencySymbol(item);
                  
                  return (
                    <div key={item.cartItemId} className="cart-item">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="cart-item-image"
                        onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&auto=format&fit=crop&q=60'} 
                      />
                      
                      <div className="cart-item-details">
                        <div className="cart-item-name">{item.name}</div>
                        {item.selectedGradeDisplay && (
                          <div className="cart-item-grade">Grade: {item.selectedGradeDisplay}</div>
                        )}
                        <div className="cart-item-company">{item.companyName}</div>
                        {item.selectedPacking && <div className="cart-item-packing">Packing: {item.selectedPacking}</div>}
                        <div className="cart-item-unit-price">{unitPrice}</div>
                        
                        {packingCost && parseFloat(packingCost.value) > 0 && (
                          <div className="cart-item-packing-cost">
                            <div className="packing-cost-row">
                              <span className="packing-cost-label">Packing Cost:</span>
                              <span className="packing-cost-value">{packingCost.display}</span>
                            </div>
                            {packingCost.breakdown && <div className="packing-cost-breakdown">{packingCost.breakdown}</div>}
                          </div>
                        )}
                      </div>

                      <div className="cart-item-actions">
                        <div className="cart-quantity-controls">
                          <button onClick={() => handleQuantityChange(item.cartItemId, -1)} className="cart-qty-btn"><Minus size={16} /></button>
                          <span className="cart-qty-display">{item.quantity}</span>
                          <button onClick={() => handleQuantityChange(item.cartItemId, 1)} className="cart-qty-btn"><Plus size={16} /></button>
                        </div>

                        <div className="cart-item-total">
                          <div className="cart-item-total-price">{productPrice.display}</div>
                          <div className="cart-item-quantity-detail">{item.quantity} × {packSize}{packUnit}</div>
                          {packingCost && parseFloat(packingCost.value) > 0 && (
                            <div className="cart-item-packing-badge">+ {packingCost.display}</div>
                          )}
                        </div>

                        <button onClick={() => removeFromCart(item.cartItemId)} className="cart-remove-btn">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="cart-continue-shopping">
                <button onClick={handleContinueShopping} className="cart-continue-btn">Continue Shopping</button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="cart-summary-section">
              <h2 className="cart-summary-title">Order Summary</h2>
              
              <div className="cart-summary-items">
                {items.map(item => {
                  const productPrice = getItemProductPrice(item);
                  const packingCost = getPackingCost(item);
                  const packSize = item.selectedQuantity || 1;
                  const packUnit = item.quantityUnit || 'kg';
                  const unitPrice = getUnitPrice(item);
                  
                  return (
                    <div key={item.cartItemId} className="cart-summary-item">
                      <div className="cart-summary-item-info">
                        <div className="cart-summary-item-name">{item.name}</div>
                        {item.selectedGradeDisplay && <div className="cart-summary-item-grade">Grade: {item.selectedGradeDisplay}</div>}
                        <div className="cart-summary-item-meta">{item.quantity} × {packSize}{packUnit} @ {unitPrice}</div>
                        {item.selectedPacking && <div className="cart-summary-item-packing">Packing: {item.selectedPacking}</div>}
                      </div>
                      <div className="cart-summary-item-price">{productPrice.display}</div>
                      {packingCost && parseFloat(packingCost.value) > 0 && (
                        <div className="cart-summary-packing-row">
                          <span>Packing Cost:</span>
                          <span>{packingCost.display}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="cart-summary-totals">
                <div className="summary-row">
                  <span>Products Total</span>
                  <span>{cartCurrencySymbol}{productTotal.toFixed(2)}</span>
                </div>
                {packingTotal > 0 && (
                  <div className="summary-row packing-row">
                    <span>Packing Cost</span>
                    <span>+ {cartCurrencySymbol}{packingTotal.toFixed(2)}</span>
                  </div>
                )}
                <div className="summary-row subtotal-row">
                  <span>Subtotal</span>
                  <span>{cartCurrencySymbol}{subtotal}</span>
                </div>
                <div className="summary-row shipping-row">
                  <span>Shipping</span>
                  <span className="shipping-note">Calculated at checkout</span>
                </div>
                <div className="summary-row total-row">
                  <span>Total</span>
                  <span>{cartCurrencySymbol}{finalTotal}</span>
                </div>
              </div>

              <div className="cart-checkout-action">
                {user ? (
                  <button 
                    onClick={handleCartCheckout} 
                    disabled={isProcessing || isLoadingProfile} 
                    className="cart-checkout-btn"
                  >
                    {isProcessing ? 'Processing...' : isLoadingProfile ? 'Loading...' : <><ShoppingBag size={20} /> Checkout</>}
                  </button>
                ) : (
                  <button 
                    onClick={handleGuestCheckout} 
                    disabled={isProcessing} 
                    className="cart-guest-checkout-btn"
                  >
                    {isProcessing ? 'Processing...' : 'Guest Checkout'}
                  </button>
                )}
              </div>
            </div>
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
        selectedCurrency="INR"
      />
    </>
  );
};

export default CartPage;