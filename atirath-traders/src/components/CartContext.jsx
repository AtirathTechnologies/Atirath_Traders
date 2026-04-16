import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { database, ref, get, set, onValue, remove } from '../firebase';
import { onAuthStateChanged, getAuth } from 'firebase/auth';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART':
      console.log("🛒 REDUCER: Adding to cart", action.payload);
      console.log("💰 REDUCER: Packing cost received:", action.payload.totalPackingCost);
      
      const existingItemIndex = state.items.findIndex(item => 
        item.id === action.payload.id && 
        item.brandId === action.payload.brandId &&
        item.selectedGrade === action.payload.selectedGrade &&
        item.selectedPacking === action.payload.selectedPacking
      );
      
      if (existingItemIndex !== -1) {
        const updatedItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { 
                ...item, 
                quantity: item.quantity + (action.payload.quantity || 1),
                // 🔥 FIXED: Update packing cost when quantity changes
                totalPackingCost: (parseFloat(item.totalPackingCost) || 0) + (parseFloat(action.payload.totalPackingCost) || 0)
              }
            : item
        );
        return {
          ...state,
          items: updatedItems,
        };
      }
      
      // 🔥 CRITICAL: Force packing cost values
      const newItem = { 
        ...action.payload, 
        quantity: action.payload.quantity || 1,
        addedAt: new Date().toISOString(),
        cartItemId: `${action.payload.id}_${action.payload.brandId || 'nobrand'}_${action.payload.selectedGrade || 'nograde'}_${Date.now()}`,
        cartCurrency: action.payload.cartCurrency || 'INR',
        cartCurrencySymbol: action.payload.cartCurrencySymbol || '₹',
        cartBaseCurrency: action.payload.cartBaseCurrency,
        cartBaseValue: action.payload.cartBaseValue,
        // 🔥 CRITICAL: Force store packing cost at TOP level
        packingPricePerKg: parseFloat(action.payload.packingPricePerKg) || 0,
        totalPackingCost: parseFloat(action.payload.totalPackingCost) || 0
      };
      
      const newItems = [...state.items, newItem];
      console.log("✅ Item added to cart with packing cost:", newItem.totalPackingCost);
      console.log("✅ Item details:", { 
        name: newItem.name, 
        packingCost: newItem.totalPackingCost,
        packingPricePerKg: newItem.packingPricePerKg 
      });
      
      return {
        ...state,
        items: newItems,
      };
      
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.cartItemId === action.payload.cartItemId
            ? { 
                ...item, 
                quantity: action.payload.quantity,
                // 🔥 FIXED: Update packing cost proportionally
                totalPackingCost: item.packingPricePerKg && item.selectedQuantity
                  ? item.packingPricePerKg * parseInt(item.selectedQuantity) * action.payload.quantity
                  : item.totalPackingCost
              }
            : item
        ).filter(item => item.quantity > 0),
      };
      
    case 'REMOVE_FROM_CART':
      const filteredItems = state.items.filter(item => item.cartItemId !== action.payload.cartItemId);
      return {
        ...state,
        items: filteredItems,
      };
      
    case 'CLEAR_CART':
      return { ...state, items: [] };
      
    case 'LOAD_CART':
      console.log("📦 Loading cart items:", action.payload);
      // 🔥 FIXED: Ensure packing cost is preserved when loading
      const processedItems = (action.payload || []).map(item => ({
        ...item,
        totalPackingCost: parseFloat(item.totalPackingCost) || 0,
        packingPricePerKg: parseFloat(item.packingPricePerKg) || 0
      }));
      return { ...state, items: processedItems };
      
    case 'SET_USER':
      return { ...state, user: action.payload };
      
    case 'SET_CHECKOUT_PRODUCTS':
      return { ...state, checkoutProducts: action.payload };
      
    default:
      return state;
  }
};

// 🔥 FIXED: Clean cart item function - FORCE PRESERVE ALL FIELDS
const cleanCartItem = (item) => {
  if (!item) return null;
  
  console.log("🧹 Cleaning cart item:", item.name, "Packing cost:", item.totalPackingCost);
  
  return {
    id: item.id || '',
    productId: item.productId || item.id || '',
    cartItemId: item.cartItemId || '',
    name: item.name || '',
    quantity: item.quantity || 1,
    addedAt: item.addedAt || new Date().toISOString(),
    
    brandId: item.brandId || null,
    brandName: item.brandName || 'General',
    companyId: item.companyId || null,
    companyName: item.companyName || '',
    
    image: item.image || null,
    category: item.category || '',
    categoryId: item.categoryId || '',
    
    // Store price info
    price: item.price || null,
    price_usd_per_carton: item.price_usd_per_carton || null,
    fob_price_usd: item.fob_price_usd || null,
    "Ex-Mill_usd": item["Ex-Mill_usd"] || null,
    
    selectedGrade: item.selectedGrade || null,
    selectedGradePrice: item.selectedGradePrice || null,
    selectedGradeDisplay: item.selectedGradeDisplay || item.selectedGrade || null,
    selectedPacking: item.selectedPacking || null,
    selectedQuantity: item.selectedQuantity || null,
    quantityUnit: item.quantityUnit || 'kg',
    isRice: item.isRice || false,
    
    origin: item.origin || null,
    packaging: item.packaging || null,
    pack_type: item.pack_type || null,
    shelf_life: item.shelf_life || null,
    
    cartCurrency: item.cartCurrency || 'INR',
    cartCurrencySymbol: item.cartCurrencySymbol || '₹',
    cartBaseCurrency: item.cartBaseCurrency,
    cartBaseValue: item.cartBaseValue,
    
    // 🔥 CRITICAL: Force preserve packing cost at TOP level
    packingPricePerKg: parseFloat(item.packingPricePerKg) || 0,
    totalPackingCost: parseFloat(item.totalPackingCost) || 0,
    
    // Also preserve selectedConfig for backup
    selectedConfig: item.selectedConfig || null
  };
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { 
    items: [], 
    user: null,
    cartId: null,
    checkoutProducts: []
  });
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const getGuestCartId = () => {
    let cartId = localStorage.getItem('guestCartId');
    if (!cartId) {
      cartId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('guestCartId', cartId);
      console.log("🆕 Created new guest cart ID:", cartId);
    }
    return cartId;
  };

  const getCartId = () => {
    if (state.user) {
      return `user_${state.user.uid}`;
    }
    return getGuestCartId();
  };

  // 🔥 FIXED: Save cart to Firebase with ALL fields
  const saveCartToFirebase = async () => {
    if (isSaving) {
      console.log("⏳ Already saving, skipping...");
      return false;
    }
    
    try {
      setIsSaving(true);
      const cartId = getCartId();
      const cartRef = ref(database, `carts/${cartId}`);
      
      const cleanedItems = state.items.map(item => cleanCartItem(item)).filter(item => item !== null);
      
      console.log(`💾 Saving cart to Firebase: ${cartId} with ${cleanedItems.length} items`);
      console.log("📦 Items with packing cost:", cleanedItems.map(i => ({ 
        name: i.name, 
        packingCost: i.totalPackingCost,
        packingPricePerKg: i.packingPricePerKg
      })));
      
      const cartData = {
        cartId: cartId,
        isGuest: !state.user,
        updatedAt: new Date().toISOString(),
        items: cleanedItems
      };
      
      if (state.user) {
        cartData.userId = state.user.uid;
      }
      
      // 🔥 IMPORTANT: Use set() to completely replace the cart data
      await set(cartRef, cartData);
      
      // Also save to localStorage as backup
      localStorage.setItem('cart_backup', JSON.stringify(cleanedItems));
      localStorage.setItem('lastCartSync', new Date().toISOString());
      
      console.log(`✅ Successfully saved ${cleanedItems.length} items to Firebase`);
      setIsSaving(false);
      return true;
    } catch (error) {
      console.error('❌ Error saving cart to Firebase:', error);
      setIsSaving(false);
      return false;
    }
  };

  // Remove single item from cart
  const removeFromCart = async (cartItemId) => {
    console.log("🗑️ Removing item:", cartItemId);
    
    dispatch({ type: 'REMOVE_FROM_CART', payload: { cartItemId } });
    
    const updatedItems = state.items.filter(item => item.cartItemId !== cartItemId);
    
    try {
      const cartId = getCartId();
      const cartRef = ref(database, `carts/${cartId}`);
      
      const cleanedItems = updatedItems.map(item => cleanCartItem(item)).filter(item => item !== null);
      
      const cartData = {
        cartId: cartId,
        isGuest: !state.user,
        updatedAt: new Date().toISOString(),
        items: cleanedItems
      };
      
      if (state.user) {
        cartData.userId = state.user.uid;
      }
      
      await set(cartRef, cartData);
      
      localStorage.setItem('cart_backup', JSON.stringify(cleanedItems));
      
      console.log(`✅ Item removed and Firebase updated. Now ${cleanedItems.length} items`);
    } catch (error) {
      console.error('❌ Error removing from Firebase:', error);
    }
  };

  // Clear cart completely
  const clearCart = async () => {
    console.log("🗑️ Clearing entire cart...");
    
    dispatch({ type: 'CLEAR_CART' });
    
    try {
      const cartId = getCartId();
      const cartRef = ref(database, `carts/${cartId}`);
      
      await set(cartRef, {
        cartId: cartId,
        isGuest: !state.user,
        updatedAt: new Date().toISOString(),
        items: []
      });
      
      localStorage.removeItem('cart_backup');
      localStorage.removeItem('lastCartSync');
      
      console.log("✅ Cart cleared from Firebase");
    } catch (error) {
      console.error('❌ Error clearing cart from Firebase:', error);
    }
  };

  // 🔥 FIXED: Load cart from Firebase with proper parsing
  const loadCartFromFirebase = async () => {
    try {
      const cartId = getCartId();
      const cartRef = ref(database, `carts/${cartId}`);
      
      console.log(`📂 Loading cart from Firebase: ${cartId}`);
      const snapshot = await get(cartRef);
      
      if (snapshot.exists()) {
        const cartData = snapshot.val();
        const cartItems = cartData.items || [];
        console.log(`✅ Loaded ${cartItems.length} items from Firebase`);
        console.log("📦 Loaded items with packing cost:", cartItems.map(i => ({ 
          name: i.name, 
          packingCost: i.totalPackingCost,
          hasPackingCost: i.totalPackingCost ? true : false
        })));
        
        // Ensure all items have proper fields
        const processedItems = cartItems.map(item => ({
          ...item,
          totalPackingCost: parseFloat(item.totalPackingCost) || 0,
          packingPricePerKg: parseFloat(item.packingPricePerKg) || 0,
          cartCurrency: item.cartCurrency || 'INR',
          cartCurrencySymbol: item.cartCurrencySymbol || '₹'
        }));
        
        dispatch({ type: 'LOAD_CART', payload: processedItems });
        localStorage.setItem('cart_backup', JSON.stringify(processedItems));
        return processedItems;
      } else {
        console.log('⚠️ No cart found in Firebase');
        
        const localCart = localStorage.getItem('cart_backup');
        if (localCart) {
          try {
            const parsedCart = JSON.parse(localCart);
            console.log(`📦 Loaded ${parsedCart.length} items from localStorage`);
            console.log("📦 Local items with packing cost:", parsedCart.map(i => ({ 
              name: i.name, 
              packingCost: i.totalPackingCost 
            })));
            
            // Ensure local items have proper fields
            const processedItems = parsedCart.map(item => ({
              ...item,
              totalPackingCost: parseFloat(item.totalPackingCost) || 0,
              packingPricePerKg: parseFloat(item.packingPricePerKg) || 0,
              cartCurrency: item.cartCurrency || 'INR',
              cartCurrencySymbol: item.cartCurrencySymbol || '₹'
            }));
            
            dispatch({ type: 'LOAD_CART', payload: processedItems });
            
            setTimeout(() => {
              saveCartToFirebase();
            }, 100);
            
            return processedItems;
          } catch (e) {
            console.error('Error parsing localStorage cart:', e);
          }
        }
        
        dispatch({ type: 'LOAD_CART', payload: [] });
        return [];
      }
    } catch (error) {
      console.error('❌ Error loading cart from Firebase:', error);
      
      const savedCart = localStorage.getItem('cart_backup');
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          console.log(`📦 Fallback: Loaded ${parsedCart.length} items from localStorage`);
          
          // Ensure fallback items have proper fields
          const processedItems = parsedCart.map(item => ({
            ...item,
            totalPackingCost: parseFloat(item.totalPackingCost) || 0,
            packingPricePerKg: parseFloat(item.packingPricePerKg) || 0,
            cartCurrency: item.cartCurrency || 'INR',
            cartCurrencySymbol: item.cartCurrencySymbol || '₹'
          }));
          
          dispatch({ type: 'LOAD_CART', payload: processedItems });
          return processedItems;
        } catch (e) {
          console.error('Error parsing localStorage cart:', e);
        }
      }
      
      dispatch({ type: 'LOAD_CART', payload: [] });
      return [];
    }
  };

  // Real-time cart updates
  useEffect(() => {
    if (state.user || localStorage.getItem('guestCartId')) {
      const cartId = getCartId();
      const cartRef = ref(database, `carts/${cartId}`);
      
      const unsubscribe = onValue(cartRef, (snapshot) => {
        if (snapshot.exists() && !isSaving) {
          const cartData = snapshot.val();
          const cartItems = cartData.items || [];
          const currentItems = state.items;
          
          if (JSON.stringify(currentItems) !== JSON.stringify(cartItems)) {
            console.log('🔄 Real-time cart update from Firebase');
            
            // Ensure items have proper fields
            const processedItems = cartItems.map(item => ({
              ...item,
              totalPackingCost: parseFloat(item.totalPackingCost) || 0,
              packingPricePerKg: parseFloat(item.packingPricePerKg) || 0,
              cartCurrency: item.cartCurrency || 'INR',
              cartCurrencySymbol: item.cartCurrencySymbol || '₹'
            }));
            
            dispatch({ type: 'LOAD_CART', payload: processedItems });
          }
        }
      });
      
      return () => unsubscribe();
    }
  }, [state.user]);

  // Auth state listener
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('🔐 Auth state changed:', user ? user.uid : 'logged out');
      
      if (user) {
        const oldCartId = localStorage.getItem('guestCartId');
        dispatch({ type: 'SET_USER', payload: user });
        
        if (oldCartId) {
          await migrateGuestCartToUser(user.uid, oldCartId);
        } else {
          await loadCartFromFirebase();
        }
      } else {
        dispatch({ type: 'SET_USER', payload: null });
        await loadCartFromFirebase();
      }
    });

    return () => unsubscribe();
  }, []);

  // 🔥 FIXED: Migrate guest cart to user cart with packing cost preserved
  const migrateGuestCartToUser = async (userId, guestCartId) => {
    try {
      const guestCartRef = ref(database, `carts/${guestCartId}`);
      const userCartRef = ref(database, `carts/user_${userId}`);
      
      console.log(`🔄 Migrating cart from ${guestCartId} to user_${userId}`);
      
      const guestSnapshot = await get(guestCartRef);
      const userSnapshot = await get(userCartRef);
      
      let mergedItems = [];
      
      if (guestSnapshot.exists()) {
        const guestCart = guestSnapshot.val();
        mergedItems = guestCart.items || [];
        console.log(`📦 Guest cart has ${mergedItems.length} items`);
      }
      
      if (userSnapshot.exists()) {
        const userCart = userSnapshot.val();
        const userItems = userCart.items || [];
        console.log(`👤 User cart has ${userItems.length} items`);
        
        userItems.forEach(userItem => {
          const existingIndex = mergedItems.findIndex(item => 
            item.cartItemId === userItem.cartItemId
          );
          
          if (existingIndex !== -1) {
            mergedItems[existingIndex].quantity += userItem.quantity;
            // 🔥 FIXED: Merge packing costs
            mergedItems[existingIndex].totalPackingCost = 
              (parseFloat(mergedItems[existingIndex].totalPackingCost) || 0) + 
              (parseFloat(userItem.totalPackingCost) || 0);
          } else {
            mergedItems.push(userItem);
          }
        });
      }
      
      // Ensure all items have proper fields
      const cleanedItems = mergedItems.map(item => cleanCartItem(item)).filter(item => item !== null);
      
      if (cleanedItems.length > 0) {
        const userCartData = {
          cartId: `user_${userId}`,
          isGuest: false,
          updatedAt: new Date().toISOString(),
          items: cleanedItems
        };
        
        if (userId) {
          userCartData.userId = userId;
        }
        
        await set(userCartRef, userCartData);
        
        await remove(guestCartRef);
        
        localStorage.removeItem('guestCartId');
        localStorage.setItem('cart_backup', JSON.stringify(cleanedItems));
        
        dispatch({ type: 'LOAD_CART', payload: cleanedItems });
        console.log('✅ Cart migration complete!', cleanedItems);
      } else {
        await loadCartFromFirebase();
      }
    } catch (error) {
      console.error('❌ Error migrating cart:', error);
      await loadCartFromFirebase();
    }
  };

  // Initial load
  useEffect(() => {
    if (!isInitialized) {
      loadCartFromFirebase().then(() => {
        setIsInitialized(true);
      });
    }
  }, []);

  // Save to Firebase on every cart change (with debounce)
  useEffect(() => {
    if (isInitialized && !isSaving) {
      const timeoutId = setTimeout(() => {
        saveCartToFirebase();
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [state.items, isInitialized]);

  // ============================================
  // ADD TO CART FUNCTION - Stores packing cost
  // ============================================
  const addToCart = (product) => {
    console.log("📦 Adding to cart with selected configuration:", product);
    console.log("💰 Packing cost in addToCart:", product.totalPackingCost);
    
    const cartItemId = `${product.id}_${product.brandId || 'nobrand'}_${product.selectedGrade || 'nograde'}_${Date.now()}`;
    
    const itemToAdd = {
      id: product.id || '',
      productId: product.id || '',
      cartItemId: cartItemId,
      name: product.name || 'Unknown Product',
      quantity: 1,
      addedAt: new Date().toISOString(),
      
      brandId: product.brandId || null,
      brandName: product.brandName || 'General',
      companyId: product.companyId || null,
      companyName: product.companyName || '',
      
      // Store price info
      price: product.price || null,
      price_usd_per_carton: product.price_usd_per_carton,
      fob_price_usd: product.fob_price_usd,
      "Ex-Mill_usd": product["Ex-Mill_usd"],
      
      image: product.image || null,
      category: product.category || '',
      categoryId: product.categoryId || '',
      
      selectedGrade: product.selectedGrade || null,
      selectedGradePrice: product.selectedGradePrice || null,
      selectedGradeDisplay: product.selectedGradeDisplay || product.selectedGrade || null,
      selectedPacking: product.selectedPacking || null,
      selectedQuantity: product.selectedQuantity || null,
      quantityUnit: product.quantityUnit || 'kg',
      isRice: product.isRice || false,
      
      origin: product.origin || null,
      packaging: product.packaging || null,
      pack_type: product.pack_type || null,
      shelf_life: product.shelf_life || null,
      
      cartCurrency: product.cartCurrency || 'INR',
      cartCurrencySymbol: product.cartCurrencySymbol || '₹',
      cartBaseCurrency: product.cartBaseCurrency,
      cartBaseValue: product.cartBaseValue,
      
      // 🔥 CRITICAL: Store packing cost at TOP level
      packingPricePerKg: parseFloat(product.packingPricePerKg) || 0,
      totalPackingCost: parseFloat(product.totalPackingCost) || 0,
      
      // Also store selectedConfig for backup
      selectedConfig: product.selectedConfig || null
    };
    
    console.log("✅ Added to cart with price:", itemToAdd.price, "Packing cost:", itemToAdd.totalPackingCost);
    
    dispatch({ type: 'ADD_TO_CART', payload: itemToAdd });
  };

  const updateQuantity = (cartItemId, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { cartItemId, quantity } });
  };

  const setCheckoutProducts = (products) => {
    dispatch({ type: 'SET_CHECKOUT_PRODUCTS', payload: products });
  };

  const getTotalItems = () => state.items.reduce((sum, item) => sum + (item.quantity || 1), 0);

  const getTotalPrice = () => {
    let total = 0;
    state.items.forEach(item => {
      if (item.price?.value) {
        total += parseFloat(item.price.value) * (item.quantity || 1);
      } else if (item.selectedGradePrice) {
        const pricePerKg = parseFloat(item.selectedGradePrice);
        const packageSize = parseFloat(item.selectedQuantity) || 1;
        total += pricePerKg * packageSize * (item.quantity || 1);
      }
      // Add packing cost to total
      if (item.totalPackingCost) {
        total += parseFloat(item.totalPackingCost);
      }
    });
    return total.toFixed(2);
  };

  const getCartItems = () => state.items;

  return (
    <CartContext.Provider value={{
      items: state.items,
      user: state.user,
      checkoutProducts: state.checkoutProducts,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      getTotalItems,
      getTotalPrice,
      loadCartFromFirebase,
      saveCartToFirebase,
      setCheckoutProducts,
      getCartItems
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};