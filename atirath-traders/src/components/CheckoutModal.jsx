// components/CheckoutModal.jsx
import React, { useState, useEffect, useRef } from "react";
import ThankYouPopup from "../components/ThankYouPopup";
import { submitQuote } from "../firebase";
import {
  transportData,
  getPackingUnit,
  getTransportPrice,
  getUnitType,
  ricePackingOptions,
  getQuantityOptionsForProduct,
  getQuantityUnit
} from "../data/ProductData";
import { ShoppingBag, Package, Plus, Minus, X, Check } from 'lucide-react';
import "../styles/form.css";

const CheckoutModal = ({ 
  isOpen, 
  onClose, 
  products, 
  profile, 
  onOrderSubmitted,
  currencyRates,
  currencySymbols,
  selectedCurrency: propSelectedCurrency
}) => {
  // State declarations
  const [cifRequired, setCifRequired] = useState("No");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [showThankYou, setShowThankYou] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totalPrice, setTotalPrice] = useState("0.00");
  const [brandingRequired, setBrandingRequired] = useState("No");
  const [shippingCost, setShippingCost] = useState("0.00");
  const [insuranceCost, setInsuranceCost] = useState("0.00");
  const [taxes, setTaxes] = useState("0.00");
  const [brandingCost, setBrandingCost] = useState("0.00");
  const [transportCost, setTransportCost] = useState("0.00");
  const [submitError, setSubmitError] = useState("");

  // Currency states
  const [selectedCurrency, setSelectedCurrency] = useState(propSelectedCurrency || 'INR');
  const [availableCurrencies, setAvailableCurrencies] = useState([]);

  // State for cart products and configurations
  const [cartProducts, setCartProducts] = useState([]);
  const [cartProductConfigs, setCartProductConfigs] = useState({});

  // Order quantity state
  const [productOrderQuantities, setProductOrderQuantities] = useState({});

  // ============================================
  // TRANSPORT MODULE
  // ============================================
  const [transportType, setTransportType] = useState("");
  
  // Road Transport Fields
  const [pickupLocation, setPickupLocation] = useState({
    city: "",
    state: "",
    country: ""
  });
  const [deliveryLocation, setDeliveryLocation] = useState({
    city: "",
    state: "",
    country: ""
  });
  const [vehicleType, setVehicleType] = useState("");

  // Air Transport Fields
  const [airportOfLoading, setAirportOfLoading] = useState({
    country: "",
    airportName: ""
  });
  const [airportOfDestination, setAirportOfDestination] = useState({
    country: "",
    airportName: ""
  });

  // Ocean Transport Fields
  const [portOfLoading, setPortOfLoading] = useState({
    country: "",
    state: "",
    portName: ""
  });
  const [portOfDestination, setPortOfDestination] = useState({
    country: "",
    state: "",
    portName: ""
  });
  
  const [transportPrice, setTransportPrice] = useState("0-0");

  // Profile fields
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");

  // Auto-fill tracking
  const [hasAutoFilled, setHasAutoFilled] = useState(false);
  const [autoFillAttempted, setAutoFillAttempted] = useState(false);

  const modalRef = useRef(null);
  const formContainerRef = useRef(null);
  const estimateContainerRef = useRef(null);

  // Constants
  const countryOptions = [
    { value: "+91", flag: "🇮🇳", name: "India", length: 10, currency: "INR" },
    { value: "+968", flag: "🇴🇲", name: "Oman", length: 8, currency: "OMR" },
    { value: "+44", flag: "🇬🇧", name: "United Kingdom", length: 10, currency: "GBP" },
    { value: "+1", flag: "🇺🇸", name: "USA", length: 10, currency: "USD" },
    { value: "+971", flag: "🇦🇪", name: "UAE", length: 9, currency: "AED" },
    { value: "+61", flag: "🇦🇺", name: "Australia", length: 9, currency: "AUD" },
    { value: "+98", flag: "🇮🇷", name: "Iran", length: 10, currency: "IRR" },
    { value: "+66", flag: "🇹🇭", name: "Thailand", length: 9, currency: "THB" },
    { value: "+90", flag: "🇹🇷", name: "Turkey", length: 10, currency: "TRY" },
  ];

  const vehicleOptions = [
    { value: "truck", label: "Truck" },
    { value: "container_truck", label: "Container Truck" },
    { value: "mini_truck", label: "Mini Truck" }
  ];

  // Initialize available currencies from props
  useEffect(() => {
    if (currencyRates && Object.keys(currencyRates).length > 0) {
      const currencies = Object.keys(currencyRates).map(code => ({
        code,
        rate: currencyRates[code],
        symbol: currencySymbols[code] || code
      }));
      setAvailableCurrencies(currencies);
    }
  }, [currencyRates, currencySymbols]);

  // Update selected currency when prop changes
  useEffect(() => {
    if (propSelectedCurrency) {
      setSelectedCurrency(propSelectedCurrency);
    }
  }, [propSelectedCurrency]);

  // Convert currency using Firebase rates
  const convertCurrency = (amount, fromCurrency, toCurrency) => {
    if (!amount && amount !== 0) return 0;
    if (fromCurrency === toCurrency) return amount;
    if (!currencyRates[fromCurrency] || !currencyRates[toCurrency]) return amount;

    const amountInUSD = fromCurrency === 'USD' 
      ? amount 
      : amount / currencyRates[fromCurrency];
    
    return amountInUSD * currencyRates[toCurrency];
  };

  // ============================================
  // ANALYZE PRODUCT DATA WITH PROPER CONVERSION
  // ============================================
  const analyzeProductData = (product) => {
    if (!product) return {};
    console.log("📦 Raw Product Data in Checkout:", product);

    const firebaseData = product.firebaseProductData || product;

    let priceValue = 0;
    let currencyDetected = "USD";
    let priceDisplay = "";
    let minPrice = 0;
    let maxPrice = 0;
    let isRange = false;
    let priceType = 'unknown';
    let unit = 'unit';
    let baseValue = 0;
    let baseCurrency = 'USD';
    let isRice = false;

    // Check if it's a rice product
    if (product.isRice || 
        product.productType === 'rice' ||
        firebaseData.categoryId === 'rice' ||
        firebaseData.name?.toLowerCase().includes('rice') ||
        firebaseData.companyName?.toLowerCase().includes('siea')) {
      isRice = true;
      unit = 'kg';
    }

    // Check for FOB USD price (Nut Walker)
    if (firebaseData.fob_price_usd !== undefined) {
      baseValue = firebaseData.fob_price_usd;
      baseCurrency = "USD";
      priceType = 'FOB';
      unit = 'carton';
      
      // Convert to selected currency
      priceValue = convertCurrency(baseValue, 'USD', selectedCurrency);
      currencyDetected = selectedCurrency;
      
      const symbol = currencySymbols[selectedCurrency] || (selectedCurrency === 'INR' ? '₹' : '$');
      priceDisplay = `${symbol}${priceValue.toFixed(2)} FOB / carton`;
    }
    // Check for Ex-Mill_usd (Akil Drinks)
    else if (firebaseData["Ex-Mill_usd"] !== undefined) {
      baseValue = firebaseData["Ex-Mill_usd"];
      baseCurrency = "USD";
      priceType = 'EX-MILL';
      unit = 'carton';
      
      // Convert to selected currency
      priceValue = convertCurrency(baseValue, 'USD', selectedCurrency);
      currencyDetected = selectedCurrency;
      
      const symbol = currencySymbols[selectedCurrency] || (selectedCurrency === 'INR' ? '₹' : '$');
      priceDisplay = `${symbol}${priceValue.toFixed(2)} EX-MILL / carton`;
    }
    // Check for price_usd_per_carton (Heritage)
    else if (firebaseData.price_usd_per_carton !== undefined) {
      baseValue = firebaseData.price_usd_per_carton;
      baseCurrency = "USD";
      priceType = 'carton';
      unit = 'carton';
      
      // Convert to selected currency
      priceValue = convertCurrency(baseValue, 'USD', selectedCurrency);
      currencyDetected = selectedCurrency;
      
      const symbol = currencySymbols[selectedCurrency] || (selectedCurrency === 'INR' ? '₹' : '$');
      priceDisplay = `${symbol}${priceValue.toFixed(2)} / carton`;
    }
    // Check for INR prices (rice products)
    else if (firebaseData.price && typeof firebaseData.price === 'object') {
      if (firebaseData.price.min !== undefined && firebaseData.price.max !== undefined) {
        minPrice = firebaseData.price.min / 100;
        maxPrice = firebaseData.price.max / 100;
        baseValue = (minPrice + maxPrice) / 2;
        baseCurrency = "INR";
        priceType = 'rice';
        unit = 'kg';
        
        if (selectedCurrency === 'INR') {
          priceValue = baseValue;
          const symbol = currencySymbols[selectedCurrency] || '₹';
          priceDisplay = `${symbol}${minPrice.toFixed(2)} - ${symbol}${maxPrice.toFixed(2)} / kg`;
        } else {
          const convertedMin = convertCurrency(minPrice, 'INR', selectedCurrency);
          const convertedMax = convertCurrency(maxPrice, 'INR', selectedCurrency);
          priceValue = (convertedMin + convertedMax) / 2;
          const symbol = currencySymbols[selectedCurrency] || (selectedCurrency === 'USD' ? '$' : selectedCurrency);
          priceDisplay = `${symbol}${convertedMin.toFixed(2)} - ${symbol}${convertedMax.toFixed(2)} / kg`;
        }
        currencyDetected = selectedCurrency;
        isRange = true;
      }
    }
    // Check for grades with prices (rice grades)
    else if (firebaseData.grades && Array.isArray(firebaseData.grades) && firebaseData.grades.length > 0) {
      const selectedGrade = firebaseData.selectedGrade || product.selectedGrade;
      const grade = firebaseData.grades.find(g => g.grade === selectedGrade || g.name === selectedGrade);
      
      if (grade && grade.price_inr) {
        baseValue = parseFloat(grade.price_inr);
        baseCurrency = "INR";
        priceType = 'rice';
        unit = 'kg';
        
        if (selectedCurrency === 'INR') {
          priceValue = baseValue;
          const symbol = currencySymbols[selectedCurrency] || '₹';
          priceDisplay = `${symbol}${priceValue.toFixed(2)} / kg`;
        } else {
          priceValue = convertCurrency(baseValue, 'INR', selectedCurrency);
          const symbol = currencySymbols[selectedCurrency] || (selectedCurrency === 'USD' ? '$' : selectedCurrency);
          priceDisplay = `${symbol}${priceValue.toFixed(2)} / kg`;
        }
        currencyDetected = selectedCurrency;
      }
    }
    // Check if product already has price object with base values
    else if (product.price && typeof product.price === 'object') {
      if (product.price.baseValue && product.price.baseCurrency) {
        baseValue = product.price.baseValue;
        baseCurrency = product.price.baseCurrency;
        priceType = product.price.type || 'unknown';
        unit = isRice ? 'kg' : (product.price.unit || 'unit');
        
        priceValue = convertCurrency(baseValue, baseCurrency, selectedCurrency);
        currencyDetected = selectedCurrency;
        
        const symbol = currencySymbols[selectedCurrency] || (selectedCurrency === 'INR' ? '₹' : '$');
        
        if (priceType === 'FOB') {
          priceDisplay = `${symbol}${priceValue.toFixed(2)} FOB / ${unit}`;
        } else if (priceType === 'EX-MILL') {
          priceDisplay = `${symbol}${priceValue.toFixed(2)} EX-MILL / ${unit}`;
        } else if (priceType === 'rice' || isRice) {
          priceDisplay = `${symbol}${priceValue.toFixed(2)} / kg`;
        } else {
          priceDisplay = `${symbol}${priceValue.toFixed(2)} / ${unit}`;
        }
      } else if (product.price.display) {
        priceDisplay = product.price.display;
        priceValue = product.price.value || 0;
        unit = isRice ? 'kg' : (product.price.unit || 'unit');
      }
    }

    let origin = firebaseData.origin ||
      firebaseData.Origin ||
      firebaseData.country_of_origin ||
      "India";

    let packagingInfo = "";
    if (firebaseData.packaging) {
      if (typeof firebaseData.packaging === 'object') {
        if (firebaseData.packaging.type) {
          packagingInfo = firebaseData.packaging.type;
        } else if (firebaseData.packaging.units_per_carton) {
          packagingInfo = `${firebaseData.packaging.units_per_carton} units per carton`;
          if (firebaseData.packaging.unit_weight_g) {
            packagingInfo += ` (${firebaseData.packaging.unit_weight_g}g each)`;
          }
        }
      } else if (typeof firebaseData.packaging === 'string') {
        packagingInfo = firebaseData.packaging;
      }
    } else if (firebaseData.pack_type) {
      packagingInfo = firebaseData.pack_type;
    }

    const productType = getProductType(firebaseData);

    let productImage = firebaseData.image ||
      firebaseData.imageUrl ||
      firebaseData.productImage ||
      firebaseData.localImage ||
      product.image ||
      "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&auto=format&fit=crop&q=60";

    return {
      priceValue,
      minPrice,
      maxPrice,
      isRange,
      currency: selectedCurrency,
      priceDisplay,
      origin,
      packagingInfo,
      productType,
      productImage,
      firebaseData: firebaseData,
      priceType,
      unit,
      baseValue,
      baseCurrency,
      isRice
    };
  };

  // ============================================
  // GET PRODUCT TYPE
  // ============================================
  const getProductType = (product) => {
    if (!product) return 'default';

    if (product.category) {
      return product.category.toLowerCase();
    }

    const productName = product.name?.toLowerCase() || '';
    const companyName = product.companyName?.toLowerCase() || '';

    if (companyName.includes('siea')) {
      return 'rice';
    }

    if (companyName.includes('heritage')) {
      if (productName.includes('rice')) return 'rice';
      if (productName.includes('dal') || productName.includes('lentil')) return 'pulses';
      if (productName.includes('spice')) return 'spices';
      if (productName.includes('tea')) return 'tea';
      return 'default';
    }

    if (companyName.includes('nut walker')) {
      return 'dryfruits';
    }

    if (companyName.includes('akil drinks')) {
      return 'beverages';
    }

    if (productName.includes('oil') || productName.includes('sunflower') || productName.includes('olive')) {
      return 'oil';
    }
    if (productName.includes('dal') || productName.includes('lentil') || productName.includes('pulse')) {
      return 'pulses';
    }
    if (productName.includes('spice') || productName.includes('turmeric') || productName.includes('chilli')) {
      return 'spices';
    }
    if (productName.includes('tea') || productName.includes('green tea') || productName.includes('black tea')) {
      return 'tea';
    }
    if (productName.includes('almond') || productName.includes('cashew') || productName.includes('dry fruit')) {
      return 'dryfruits';
    }
    if (productName.includes('juice') || productName.includes('drink') || productName.includes('beverage')) {
      return 'beverages';
    }

    return 'default';
  };

  // ============================================
  // GET QUANTITY OPTIONS
  // ============================================
  const getQuantityOptionsForProductFromData = (product) => {
    if (!product) return [];
    return getQuantityOptionsForProduct(product);
  };

  // ============================================
  // GET QUANTITY UNIT
  // ============================================
  const getQuantityUnitFromData = (product) => {
    return getQuantityUnit(product);
  };

  // ============================================
  // GET PACKING OPTIONS
  // ============================================
  const getPackingOptionsForProduct = (product) => {
    if (!product) return [];
    
    const analysis = analyzeProductData(product);
    const isRice = analysis.productType === 'rice' || 
                   product?.name?.toLowerCase().includes('rice') ||
                   product?.companyName?.toLowerCase().includes('siea');
    
    if (isRice) {
      return ricePackingOptions.map(option => ({
        value: option.value,
        price: option.price || "0"
      }));
    }
    
    if (product?.pack_type) {
      return [
        { value: product.pack_type, price: "0" }
      ];
    }
    
    if (product?.packaging) {
      if (typeof product.packaging === 'string') {
        return [
          { value: product.packaging, price: "0" }
        ];
      }
      if (typeof product.packaging === 'object') {
        if (product.packaging.type) {
          return [
            { value: product.packaging.type, price: "0" }
          ];
        }
        if (product.packaging.units_per_carton) {
          const display = product.packaging.unit_weight_ml 
            ? `${product.packaging.units_per_carton} × ${product.packaging.unit_weight_ml} ml`
            : product.packaging.unit_weight_g
              ? `${product.packaging.units_per_carton} × ${product.packaging.unit_weight_g} g`
              : `${product.packaging.units_per_carton} units/carton`;
          return [
            { value: display, price: "0" }
          ];
        }
      }
    }
    
    return [];
  };

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================
  const getPricePerUnit = (productId) => {
    const config = cartProductConfigs[productId] || {};
    const product = cartProducts.find(p => p.id === productId);
    if (!product) return 0;

    if (product.selectedGradePrice) {
      const gradePriceInr = parseFloat(product.selectedGradePrice);
      return convertCurrency(gradePriceInr, 'INR', selectedCurrency);
    }

    const analysis = analyzeProductData(product);
    return analysis.priceValue;
  };

  const getQuantityUnit = (product) => {
    return getQuantityUnitFromData(product);
  };

  const getSelectedQuantityDisplay = (cartItemId) => {
    const product = cartProducts.find(p => (p.cartItemId || p.id) === cartItemId);
    if (!product) return "Not selected";
    
    const config = cartProductConfigs[product.id] || {};
    const analysis = analyzeProductData(product);
    
    if (product.selectedQuantity) {
      if (product.selectedQuantity === "custom") {
        return `${config.customQuantity || product.customQuantity || 'Custom'} ${analysis.unit}`;
      } else {
        return `${product.selectedQuantity} ${analysis.unit}`;
      }
    }
    
    if (config.quantity === "custom") {
      return `${config.customQuantity || 0} ${analysis.unit}`;
    } else {
      return `${config.quantity} ${analysis.unit}`;
    }
  };

  const getCurrencySymbol = () => {
    return currencySymbols[selectedCurrency] || 
           (selectedCurrency === 'INR' ? '₹' : 
            selectedCurrency === 'USD' ? '$' : selectedCurrency);
  };

  const getCurrentCountry = () => countryOptions.find((opt) => opt.value === countryCode);

  const formatNumber = (num) => {
    const number = parseFloat(num);
    if (isNaN(number)) return "0.00";
    return number.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // ============================================
  // CALCULATION FUNCTIONS
  // ============================================
  const calculateCartTotal = () => {
    let total = 0;

    cartProducts.forEach(cartProduct => {
      const config = cartProductConfigs[cartProduct.id] || {};
      const orderQuantity = productOrderQuantities[cartProduct.cartItemId || cartProduct.id] || 1;
      
      let pricePerUnit = getPricePerUnit(cartProduct.id);
      const analysis = analyzeProductData(cartProduct);
      
      let packageQuantity = 1;
      if (cartProduct.selectedQuantity) {
        if (cartProduct.selectedQuantity === "custom") {
          packageQuantity = parseFloat(config.customQuantity) || 1;
        } else {
          packageQuantity = parseFloat(cartProduct.selectedQuantity) || 1;
        }
      } else if (config.quantity) {
        if (config.quantity === "custom") {
          packageQuantity = parseFloat(config.customQuantity) || 1;
        } else {
          packageQuantity = parseFloat(config.quantity) || 1;
        }
      }

      let productSubtotal = pricePerUnit * packageQuantity * orderQuantity;
      total += productSubtotal;
    });

    let brandingCostValue = 0;
    if (brandingRequired === "Yes") {
      const baseBrandingCost = 35;
      brandingCostValue = convertCurrency(baseBrandingCost, 'INR', selectedCurrency) * cartProducts.length;
      total += brandingCostValue;
    }
    setBrandingCost(brandingCostValue.toFixed(2));

    const transportCostValue = calculateTransportCost();
    total += transportCostValue;
    setTransportCost(transportCostValue.toFixed(2));

    if (cifRequired === "Yes") {
      const shippingCostValue = calculateShippingCost(total);
      const insuranceCostValue = calculateInsuranceCost(total);
      const taxesValue = calculateTaxes(total);

      total += shippingCostValue + insuranceCostValue + taxesValue;

      setShippingCost(shippingCostValue.toFixed(2));
      setInsuranceCost(insuranceCostValue.toFixed(2));
      setTaxes(taxesValue.toFixed(2));
    } else {
      setShippingCost("0.00");
      setInsuranceCost("0.00");
      setTaxes("0.00");
    }

    setTotalPrice(total.toFixed(2));
  };

  const calculateTransportCost = () => {
    if (!transportType) return 0;

    const totalQuantity = cartProducts.reduce((sum, prod) => {
      const config = cartProductConfigs[prod.id] || {};
      const orderQuantity = productOrderQuantities[prod.cartItemId || prod.id] || 1;
      
      let packageQuantity = 1;
      if (prod.selectedQuantity) {
        packageQuantity = parseFloat(prod.selectedQuantity) || 1;
      } else if (config.quantity) {
        packageQuantity = parseFloat(config.quantity) || 1;
      }
      
      return sum + (packageQuantity * orderQuantity);
    }, 0);

    if (totalQuantity <= 0) return 0;

    const baseRates = {
      road: 5,
      air: 50,
      ocean: 15
    };

    const ratePerUnit = baseRates[transportType] || 0;
    const convertedRate = convertCurrency(ratePerUnit, 'INR', selectedCurrency);
    return totalQuantity * convertedRate;
  };

  const calculateShippingCost = (subtotal) => {
    if (cifRequired !== "Yes") return 0;
    return Math.max(subtotal * 0.02, subtotal * 0.01);
  };

  const calculateInsuranceCost = (subtotal) => {
    if (cifRequired !== "Yes") return 0;
    return subtotal * 0.005;
  };

  const calculateTaxes = (subtotal) => {
    if (cifRequired !== "Yes") return 0;
    return subtotal * 0.03;
  };

  const getDisplayPrices = () => {
    const selectedCurrencySymbol = getCurrencySymbol();
    
    let subtotal = 0;
    cartProducts.forEach(prod => {
      const config = cartProductConfigs[prod.id] || {};
      const orderQuantity = productOrderQuantities[prod.cartItemId || prod.id] || 1;
      
      let pricePerUnit = getPricePerUnit(prod.id);
      const analysis = analyzeProductData(prod);
      
      let packageQuantity = 1;
      if (prod.selectedQuantity) {
        packageQuantity = parseFloat(prod.selectedQuantity) || 1;
      } else if (config.quantity) {
        packageQuantity = parseFloat(config.quantity) || 1;
      }
      
      subtotal += pricePerUnit * packageQuantity * orderQuantity;
    });

    const formattedSubtotal = `${selectedCurrencySymbol}${formatNumber(subtotal)}`;
    
    let brandingCostFormatted = "Not Required";
    if (brandingRequired === "Yes") {
      let brandingValue = parseFloat(brandingCost);
      brandingCostFormatted = `${selectedCurrencySymbol}${formatNumber(brandingValue)}`;
    }
    
    let transportCostFormatted = "Not Required";
    if (transportType) {
      let transportValue = parseFloat(transportCost);
      transportCostFormatted = `${selectedCurrencySymbol}${formatNumber(transportValue)}`;
    }
    
    let shippingCostFormatted = "Not Required";
    let insuranceCostFormatted = "Not Required";
    let taxesFormatted = "Not Required";
    
    if (cifRequired === "Yes") {
      shippingCostFormatted = `${selectedCurrencySymbol}${formatNumber(shippingCost)}`;
      insuranceCostFormatted = `${selectedCurrencySymbol}${formatNumber(insuranceCost)}`;
      taxesFormatted = `${selectedCurrencySymbol}${formatNumber(taxes)}`;
    }
    
    const finalTotalFormatted = `${selectedCurrencySymbol}${formatNumber(totalPrice)}`;

    return {
      originalPrice: formattedSubtotal,
      itemCount: `${cartProducts.length} products`,
      brandingCost: brandingCostFormatted,
      transportCost: transportCostFormatted,
      shippingCost: shippingCostFormatted,
      insuranceCost: insuranceCostFormatted,
      taxes: taxesFormatted,
      finalTotalPrice: finalTotalFormatted
    };
  };

  // ============================================
  // VALIDATION FUNCTIONS
  // ============================================
  const validatePhoneNumber = (number, code) => {
    const selectedCountry = countryOptions.find((opt) => opt.value === code);
    const expectedLength = selectedCountry?.length || 10;

    if (!number) {
      setPhoneError("Phone number is required");
      return false;
    } else if (number.length !== expectedLength) {
      setPhoneError(`Phone number must be ${expectedLength} digits`);
      return false;
    } else if (!/^\d+$/.test(number)) {
      setPhoneError("Phone number must contain only digits");
      return false;
    } else {
      setPhoneError("");
      return true;
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError("Email is required");
      return false;
    } else if (!emailRegex.test(email)) {
      setEmailError("Invalid email format");
      return false;
    } else {
      setEmailError("");
      return true;
    }
  };

  // ============================================
  // HANDLER FUNCTIONS
  // ============================================
  const handleCountryChange = (e) => {
    const newCode = e.target.value;
    setCountryCode(newCode);

    const selectedCountry = countryOptions.find(opt => opt.value === newCode);
    if (selectedCountry && selectedCountry.currency) {
      setSelectedCurrency(selectedCountry.currency);
    }

    validatePhoneNumber(phoneNumber, newCode);
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setPhoneNumber(value);
    validatePhoneNumber(value, countryCode);
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    validateEmail(value);
  };

  const handleFullNameChange = (e) => {
    setFullName(e.target.value);
  };

  const handleCountryNameChange = (e) => {
    const newCountry = e.target.value;
    setCountry(newCountry);
    
    if (newCountry && newCountry.toLowerCase() !== 'india' && transportType === 'road') {
      setTransportType('');
    }
  };

  const handleStateChangeInput = (e) => {
    setState(e.target.value);
  };

  const handleCityChange = (e) => {
    setCity(e.target.value);
  };

  const handlePincodeChange = (e) => {
    setPincode(e.target.value);
  };

  const handleCifChange = (e) => {
    setCifRequired(e.target.value);
  };

  const handleCurrencyChange = (e) => {
    setSelectedCurrency(e.target.value);
  };

  const handleBrandingChange = (e) => {
    setBrandingRequired(e.target.value);
  };

  const handleTransportTypeChange = (e) => {
    setTransportType(e.target.value);
  };

  const handlePickupLocationChange = (field, value) => {
    setPickupLocation(prev => ({ ...prev, [field]: value }));
  };

  const handleDeliveryLocationChange = (field, value) => {
    setDeliveryLocation(prev => ({ ...prev, [field]: value }));
  };

  const handleAirportLoadingChange = (field, value) => {
    setAirportOfLoading(prev => ({ ...prev, [field]: value }));
  };

  const handleAirportDestinationChange = (field, value) => {
    setAirportOfDestination(prev => ({ ...prev, [field]: value }));
  };

  const handlePortOfLoadingChange = (field, value) => {
    setPortOfLoading(prev => ({ ...prev, [field]: value }));
  };

  const handlePortOfDestinationChange = (field, value) => {
    setPortOfDestination(prev => ({ ...prev, [field]: value }));
  };

  const handleIncreaseOrderQuantity = (cartItemId) => {
    setProductOrderQuantities(prev => ({
      ...prev,
      [cartItemId]: (prev[cartItemId] || 1) + 1
    }));
  };

  const handleDecreaseOrderQuantity = (cartItemId) => {
    setProductOrderQuantities(prev => ({
      ...prev,
      [cartItemId]: Math.max(1, (prev[cartItemId] || 1) - 1)
    }));
  };

  const handleCartProductQuantityChange = (productId, value) => {
    setCartProductConfigs(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        quantity: value,
        customQuantity: value === "custom" ? "" : prev[productId]?.customQuantity
      }
    }));
  };

  const handleCustomQuantityChange = (productId, value) => {
    setCartProductConfigs(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        customQuantity: value
      }
    }));
  };

  const handleAutoFillFromProfile = () => {
    if (!profile) {
      console.log("❌ No profile data available");
      return;
    }

    console.log("📋 Profile data for auto-fill:", profile);

    const newFullName = profile.name || profile.displayName || profile.fullName || "";
    const newEmail = profile.email || "";
    const newCountry = profile.country || "";
    const newState = profile.state || "";
    const newCity = profile.city || "";
    const newPincode = profile.pincode || "";

    setFullName(newFullName);
    setEmail(newEmail);
    setCountry(newCountry);
    setState(newState);
    setCity(newCity);
    setPincode(newPincode);

    const phoneFromProfile = profile.phone || 
                            profile.phoneNumber || 
                            profile.mobile || 
                            profile.contact || 
                            profile.tel || 
                            profile.telephone;
    
    if (phoneFromProfile) {
      const phoneStr = phoneFromProfile.toString().trim();
      
      let foundCountryCode = "+91";
      let phoneWithoutCode = phoneStr;
      
      if (phoneStr.startsWith('+91')) {
        foundCountryCode = '+91';
        phoneWithoutCode = phoneStr.replace('+91', '');
      }
      else if (phoneStr.startsWith('91') && phoneStr.length > 10) {
        foundCountryCode = '+91';
        phoneWithoutCode = phoneStr.substring(2);
      }
      else if (phoneStr.startsWith('0')) {
        foundCountryCode = '+91';
        phoneWithoutCode = phoneStr.substring(1);
      }
      else if (phoneStr.startsWith('+968')) {
        foundCountryCode = '+968';
        phoneWithoutCode = phoneStr.replace('+968', '');
      }
      else if (phoneStr.startsWith('968') && phoneStr.length > 10) {
        foundCountryCode = '+968';
        phoneWithoutCode = phoneStr.substring(3);
      }
      else if (phoneStr.startsWith('+44')) {
        foundCountryCode = '+44';
        phoneWithoutCode = phoneStr.replace('+44', '');
      }
      else if (phoneStr.startsWith('44') && phoneStr.length > 10) {
        foundCountryCode = '+44';
        phoneWithoutCode = phoneStr.substring(2);
      }
      else if (phoneStr.startsWith('+1')) {
        foundCountryCode = '+1';
        phoneWithoutCode = phoneStr.replace('+1', '');
      }
      else if (phoneStr.startsWith('1') && phoneStr.length > 10) {
        foundCountryCode = '+1';
        phoneWithoutCode = phoneStr.substring(1);
      }
      else if (phoneStr.startsWith('+971')) {
        foundCountryCode = '+971';
        phoneWithoutCode = phoneStr.replace('+971', '');
      }
      else if (phoneStr.startsWith('971') && phoneStr.length > 10) {
        foundCountryCode = '+971';
        phoneWithoutCode = phoneStr.substring(3);
      }
      else if (phoneStr.startsWith('+61')) {
        foundCountryCode = '+61';
        phoneWithoutCode = phoneStr.replace('+61', '');
      }
      else if (phoneStr.startsWith('61') && phoneStr.length > 10) {
        foundCountryCode = '+61';
        phoneWithoutCode = phoneStr.substring(2);
      }
      else if (/^\d+$/.test(phoneStr)) {
        if (phoneStr.length === 10) {
          foundCountryCode = '+91';
          phoneWithoutCode = phoneStr;
        }
        else if (phoneStr.length === 12 && phoneStr.startsWith('91')) {
          foundCountryCode = '+91';
          phoneWithoutCode = phoneStr.substring(2);
        }
        else if (phoneStr.length === 11 && phoneStr.startsWith('0')) {
          foundCountryCode = '+91';
          phoneWithoutCode = phoneStr.substring(1);
        }
        else {
          foundCountryCode = '+91';
          phoneWithoutCode = phoneStr;
        }
      }
      
      phoneWithoutCode = phoneWithoutCode.replace(/\D/g, '');
      
      if (phoneWithoutCode.length > 10) {
        phoneWithoutCode = phoneWithoutCode.slice(-10);
      }
      
      setCountryCode(foundCountryCode);
      setPhoneNumber(phoneWithoutCode);
      
      const selectedCountry = countryOptions.find(opt => opt.value === foundCountryCode);
      if (selectedCountry && selectedCountry.currency) {
        setSelectedCurrency(selectedCountry.currency);
      }
    } else {
      setCountryCode("+91");
      setPhoneNumber("");
    }

    setPhoneError("");
    setEmailError("");
    
    setHasAutoFilled(true);
    setAutoFillAttempted(true);
    
    console.log("✅ Auto-fill completed successfully");
  };

  const shouldShowRoadTransport = () => {
    if (!country) return true;
    return country.toLowerCase() === 'india';
  };

  // ============================================
  // USE EFFECTS
  // ============================================
  useEffect(() => {
    if (isOpen && products && products.length > 0) {
      console.log("🛒 Products received in CheckoutModal:", products);
      
      const processedProducts = products.map(product => {
        const analysis = analyzeProductData(product);
        
        const processedProduct = {
          ...product,
          id: product.id || product.productId,
          cartItemId: product.cartItemId || `${product.id}_${product.brandId || 'nobrand'}_${product.selectedGrade || 'nograde'}_${Date.now()}`,
          name: product.name || analysis.firebaseData?.name || `Product ${product.id}`,
          price: analysis.priceValue,
          minPrice: analysis.minPrice,
          maxPrice: analysis.maxPrice,
          isRange: analysis.isRange,
          quantity: product.quantity || 1,
          image: analysis.productImage,
          companyName: product.companyName || analysis.firebaseData?.companyName || 'Unknown Company',
          brandName: product.brandName || analysis.firebaseData?.brandName || 'General',
          brandId: product.brandId || null,
          companyId: product.companyId || null,
          category: product.category || analysis.productType,
          origin: analysis.origin,
          packagingInfo: analysis.packagingInfo,
          productCurrency: selectedCurrency,
          productType: analysis.productType,
          firebaseData: analysis.firebaseData || product.firebaseProductData || product,
          priceType: analysis.priceType,
          unit: analysis.unit,
          isRice: analysis.isRice,
          
          selectedGrade: product.selectedGrade || product.selectedConfig?.grade || null,
          selectedGradePrice: product.selectedGradePrice || product.selectedConfig?.gradePrice || null,
          selectedGradeDisplay: product.selectedGradeDisplay || product.selectedConfig?.gradeDisplay || product.selectedGrade || null,
          selectedPacking: product.selectedPacking || product.selectedConfig?.packing || null,
          selectedQuantity: product.selectedQuantity || product.selectedConfig?.quantity || null,
          quantityUnit: analysis.unit || 'kg',
        };
        
        return processedProduct;
      });
      
      console.log("✅ Processed cart products:", processedProducts.map(p => ({
        name: p.name,
        priceType: p.priceType,
        unit: p.unit,
        price: p.price
      })));
      
      setCartProducts(processedProducts);

      const initialConfigs = {};
      
      processedProducts.forEach((prod) => {
        const analysis = analyzeProductData(prod);
        const quantityOptions = getQuantityOptionsForProductFromData(prod);
        
        initialConfigs[prod.id] = {
          grade: prod.selectedGrade || null,
          gradePrice: prod.selectedGradePrice || null,
          gradeDisplay: prod.selectedGradeDisplay || prod.selectedGrade || null,
          packing: prod.selectedPacking || null,
          quantity: prod.selectedQuantity || null,
          customQuantity: "",
          quantityOptions: quantityOptions,
          unit: analysis.unit,
          productPriceDisplay: analysis.priceDisplay,
          minPrice: analysis.minPrice,
          maxPrice: analysis.maxPrice,
          displayGrade: prod.selectedGradeDisplay || prod.selectedGrade || null,
          displayGradePrice: prod.selectedGradePrice || null,
          displayPacking: prod.selectedPacking || null,
          displayQuantity: prod.selectedQuantity || null,
          displayQuantityUnit: analysis.unit || 'kg'
        };
      });
      
      setCartProductConfigs(initialConfigs);

      const initialOrderQuantities = {};
      processedProducts.forEach((prod) => {
        initialOrderQuantities[prod.cartItemId || prod.id] = 1;
      });
      setProductOrderQuantities(initialOrderQuantities);
    }
  }, [isOpen, products]);

  useEffect(() => {
    if (isOpen) {
      console.log("🔍 Checkout Modal Opened - Profile:", profile);
      
      setHasAutoFilled(false);
      setAutoFillAttempted(false);
      
      setPhoneError("");
      setEmailError("");
      
      if (profile) {
        console.log("🚀 Triggering auto-fill from profile on modal open...");
        setTimeout(() => {
          handleAutoFillFromProfile();
        }, 100);
      } else {
        console.log("⚠️ No profile data available for auto-fill");
      }
    }
  }, [isOpen, profile]);

  useEffect(() => {
    calculateCartTotal();
  }, [cartProducts, cartProductConfigs, productOrderQuantities, cifRequired, selectedCurrency, brandingRequired, transportType]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // ============================================
  // 🔥 FIXED: SUBMIT HANDLER with proper ThankYouPopup
  // ============================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    console.log("🔄 Starting checkout form submission...");

    // Validation checks
    if (!fullName || !email || !country || !state || !city || !pincode || !cifRequired || !brandingRequired || !selectedCurrency || !transportType) {
      alert("Please fill all required fields");
      return;
    }

    if (transportType === 'road') {
      if (!pickupLocation.city || !pickupLocation.state || !pickupLocation.country ||
          !deliveryLocation.city || !deliveryLocation.state || !deliveryLocation.country) {
        alert("Please fill all pickup and delivery location fields for road transport.");
        return;
      }
    } else if (transportType === 'air') {
      if (!airportOfLoading.country || !airportOfLoading.airportName ||
          !airportOfDestination.country || !airportOfDestination.airportName) {
        alert("Please fill all airport loading and destination fields for air freight.");
        return;
      }
    } else if (transportType === 'ocean') {
      if (!portOfLoading.country || !portOfLoading.state || !portOfLoading.portName ||
          !portOfDestination.country || !portOfDestination.state || !portOfDestination.portName) {
        alert("Please fill all port loading and destination fields for ocean freight.");
        return;
      }
    }

    if (cartProducts.length === 0) {
      alert("Please add products to your cart before checkout.");
      setSubmitError("No products in cart");
      return;
    }

    const isPhoneValid = validatePhoneNumber(phoneNumber, countryCode);
    const isEmailValid = validateEmail(email);

    if (!isPhoneValid || !isEmailValid) {
      alert("Please enter valid phone number and email address.");
      return;
    }

    const fullPhoneNumber = `${countryCode}${phoneNumber}`;
    const displayPrices = getDisplayPrices();
    const currencySymbol = getCurrencySymbol();

    const cartItemsDetails = cartProducts.map(cartProduct => {
      const config = cartProductConfigs[cartProduct.id] || {};
      const orderQuantity = productOrderQuantities[cartProduct.cartItemId || cartProduct.id] || 1;
      const analysis = analyzeProductData(cartProduct);
      
      let quantityDisplay = "";
      let actualQuantity = 0;
      let actualUnit = "";
      
      let packageQuantity = 1;
      if (cartProduct.selectedQuantity) {
        packageQuantity = parseFloat(cartProduct.selectedQuantity) || 1;
      } else if (config.quantity) {
        packageQuantity = parseFloat(config.quantity) || 1;
      }
      
      quantityDisplay = `${packageQuantity} ${analysis.unit}`;
      actualQuantity = packageQuantity * orderQuantity;
      actualUnit = analysis.unit;

      let pricePerUnit = getPricePerUnit(cartProduct.id);
      
      const itemDetails = {
        productId: cartProduct.id,
        cartItemId: cartProduct.cartItemId,
        name: cartProduct.name,
        brandName: cartProduct.brandName || 'General',
        companyName: cartProduct.companyName,
        pricePerUnit: pricePerUnit,
        priceDisplay: `${currencySymbol}${pricePerUnit.toFixed(2)}/${analysis.unit}`,
        orderQuantity: orderQuantity,
        quantityDisplay: quantityDisplay,
        actualQuantity: actualQuantity,
        actualUnit: actualUnit,
        image: cartProduct.image,
        grade: cartProduct.selectedGradeDisplay || cartProduct.selectedGrade || "Standard",
        packing: cartProduct.selectedPacking || "Standard",
        origin: analysis.origin,
        packagingInfo: analysis.packagingInfo,
        productCurrency: selectedCurrency,
        productType: analysis.productType,
        priceType: analysis.priceType,
        unit: analysis.unit,
        
        selectedGrade: cartProduct.selectedGrade || null,
        selectedGradePrice: cartProduct.selectedGradePrice || null,
        selectedGradeDisplay: cartProduct.selectedGradeDisplay || null,
        selectedPacking: cartProduct.selectedPacking || null,
        selectedQuantity: cartProduct.selectedQuantity || null,
        quantityUnit: analysis.unit,
        isRice: cartProduct.isRice || false,
      };
      
      return itemDetails;
    });

    const totalQuantity = cartProducts.reduce((sum, prod) => {
      const orderQuantity = productOrderQuantities[prod.cartItemId || prod.id] || 1;
      const analysis = analyzeProductData(prod);
      let packageQuantity = parseFloat(prod.selectedQuantity) || 1;
      return sum + (packageQuantity * orderQuantity);
    }, 0);

    const subtotal = cartProducts.reduce((sum, prod) => {
      const orderQuantity = productOrderQuantities[prod.cartItemId || prod.id] || 1;
      
      let pricePerUnit = getPricePerUnit(prod.id);
      const analysis = analyzeProductData(prod);
      
      let packageQuantity = parseFloat(prod.selectedQuantity) || 1;
      
      return sum + (pricePerUnit * packageQuantity * orderQuantity);
    }, 0);

    let transportDetails = {};
    if (transportType === 'road') {
      transportDetails = {
        transportType: 'road',
        pickupLocation,
        deliveryLocation,
        vehicleType
      };
    } else if (transportType === 'air') {
      transportDetails = {
        transportType: 'air',
        airportOfLoading,
        airportOfDestination
      };
    } else if (transportType === 'ocean') {
      transportDetails = {
        transportType: 'ocean',
        portOfLoading,
        portOfDestination
      };
    }

    const quoteData = {
      name: fullName,
      email: email,
      phone: fullPhoneNumber,
      country: country,
      state: state,
      city: city,
      pincode: pincode,
      cartItems: cartItemsDetails,
      itemCount: cartProducts.length,
      totalQuantity: totalQuantity,
      subtotal: subtotal,
      cifRequired: cifRequired,
      brandingRequired: brandingRequired,
      currency: selectedCurrency,
      currencySymbol: currencySymbol,
      transportDetails,
      transportCost: transportCost,
      priceBreakdown: {
        note: "This is an estimated bill. Final pricing may vary.",
        originalPrice: `Original Price: ${currencySymbol}${formatNumber(subtotal)}`,
        itemCount: `${cartProducts.length} items in cart`,
        totalQuantity: `Total Quantity: ${totalQuantity} units`,
        transportTypeLine: `Transport Type: ${transportType.toUpperCase()}`,
        transportCostLine: `Transport Cost: ${displayPrices.transportCost}`,
        ...(brandingRequired === "Yes" && {
          brandingCostLine: `Branding/Custom Printing: ${displayPrices.brandingCost}`
        }),
        ...(cifRequired === "Yes" && {
          shippingCostLine: `Shipping Cost: ${displayPrices.shippingCost}`,
          insuranceCostLine: `Insurance Cost: ${displayPrices.insuranceCost}`,
          taxesLine: `Taxes & Duties: ${displayPrices.taxes}`
        }),
        finalTotalLine: `Final Total: ${displayPrices.finalTotalPrice}`
      },
      additionalInfo: additionalInfo || "",
      userId: profile?.uid || "guest",
      userEmail: profile?.email || email,
      timestamp: Date.now(),
      date: new Date().toISOString(),
      readableDate: new Date().toLocaleString(),
      productType: "multiple",
      status: "new",
      source: "cart_checkout",
      isNew: true,
      hasAutoFilled: hasAutoFilled,
      profileUsed: !!profile,
      isCartOrder: true,
      
      selectedCurrency: selectedCurrency,
      currencyRates: currencyRates,
      currencySymbols: currencySymbols
    };

    console.log("📝 Checkout Quote Data:", quoteData);

    setIsSubmitting(true);
    try {
      console.log("📤 Submitting to Firebase...");
      const quoteId = await submitQuote(quoteData);
      console.log('✅ Quote submitted successfully with ID:', quoteId);

      let transportMessage = "";
      if (transportType === 'road') {
        transportMessage = `- Transport: Road
- Pickup: ${pickupLocation.city}, ${pickupLocation.state}, ${pickupLocation.country}
- Delivery: ${deliveryLocation.city}, ${deliveryLocation.state}, ${deliveryLocation.country}
${vehicleType ? `- Vehicle: ${vehicleType}` : ''}`;
      } else if (transportType === 'air') {
        transportMessage = `- Transport: Air Freight
- Airport of Loading: ${airportOfLoading.airportName}, ${airportOfLoading.country}
- Airport of Destination: ${airportOfDestination.airportName}, ${airportOfDestination.country}`;
      } else if (transportType === 'ocean') {
        transportMessage = `- Transport: Ocean Freight
- Port of Loading: ${portOfLoading.portName}, ${portOfLoading.state}, ${portOfLoading.country}
- Port of Destination: ${portOfDestination.portName}, ${portOfDestination.state}, ${portOfDestination.country}`;
      }

      const message = `Hello! I want a quote for ${cartProducts.length} items from my cart:
- Name: ${fullName}
- Email: ${email}
- Phone: ${fullPhoneNumber}
- Country: ${country}
- State: ${state}
- City: ${city}
- Pincode: ${pincode}
Items in Cart:
${cartProducts.map((prod, index) => {
        const orderQuantity = productOrderQuantities[prod.cartItemId || prod.id] || 1;
        const analysis = analyzeProductData(prod);
        
        let pricePerUnit = getPricePerUnit(prod.id);
        
        let packageQuantity = parseFloat(prod.selectedQuantity) || 1;
        const productTotal = pricePerUnit * packageQuantity * orderQuantity;
        const priceDisplay = `${currencySymbol}${productTotal.toFixed(2)}`;
        
        const brandInfo = prod.brandName && prod.brandName !== 'General' ? ` (Brand: ${prod.brandName})` : '';
        const gradeInfo = prod.selectedGradeDisplay ? ` (Grade: ${prod.selectedGradeDisplay})` : '';
        
        return `${index + 1}. ${prod.name}${brandInfo}${gradeInfo} (${prod.companyName}) - ${packageQuantity}${analysis.unit} x ${orderQuantity} = ${priceDisplay}`;
      }).join('\n')}
${transportMessage}
- CIF Required: ${cifRequired}
- Brand Required: ${brandingRequired}
- Selected Currency: ${selectedCurrency}
- Estimated Bill:
  • Original Price: ${displayPrices.originalPrice}
  • Items: ${cartProducts.length} products
  ${brandingRequired === "Yes" ? `• Branding/Custom Printing: ${displayPrices.brandingCost}` : ""}
  • Transport Cost: ${displayPrices.transportCost}
  ${cifRequired === "Yes" ? `• Shipping Cost: ${displayPrices.shippingCost}` : ""}
  ${cifRequired === "Yes" ? `• Insurance Cost: ${displayPrices.insuranceCost}` : ""}
  ${cifRequired === "Yes" ? `• Taxes & Duties: ${displayPrices.taxes}` : ""}
  • Final Total: ${displayPrices.finalTotalPrice}
${additionalInfo ? `- Additional Info: ${additionalInfo}` : ""}
Thank you!`;

      console.log("📱 WhatsApp Message Created");
      window.open(
        `https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
        "_blank"
      );

      const successMsg = `✅ Order #${quoteId.substring(0, 8)} submitted successfully! Check "My Orders" for details.`;
      alert(successMsg);
      console.log(successMsg);

      // 🔥 FIXED: Show ThankYouPopup after successful submission
      setShowThankYou(true);
      
      if (onOrderSubmitted) {
        onOrderSubmitted(quoteId);
      }

      // Don't reset form immediately - let ThankYouPopup show first
      // resetForm(); // Remove this from here

    } catch (err) {
      console.error("❌ Error submitting form:", err);
      const errorMsg = err.message || "Something went wrong while submitting your quote. Please try again.";
      alert(errorMsg);
      setSubmitError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🔥 FIXED: Handle ThankYouPopup close
  const handleThankYouClose = () => {
    setShowThankYou(false);
    // Reset form and close modal after ThankYouPopup closes
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setCifRequired("No");
    setBrandingRequired("No");
    setAdditionalInfo("");
    setShippingCost("0.00");
    setInsuranceCost("0.00");
    setTaxes("0.00");
    setBrandingCost("0.00");
    setTransportCost("0.00");
    setTotalPrice("0.00");
    
    setTransportType("");
    setPickupLocation({ city: "", state: "", country: "" });
    setDeliveryLocation({ city: "", state: "", country: "" });
    setVehicleType("");
    setAirportOfLoading({ country: "", airportName: "" });
    setAirportOfDestination({ country: "", airportName: "" });
    setPortOfLoading({ country: "", state: "", portName: "" });
    setPortOfDestination({ country: "", state: "", portName: "" });
    setTransportPrice("0-0");
    
    setSubmitError("");
    setCartProducts([]);
    setCartProductConfigs({});
    setProductOrderQuantities({});

    setFullName("");
    setEmail("");
    setPhoneNumber("");
    setCountryCode("+91");
    setCountry("");
    setState("");
    setCity("");
    setPincode("");
    setPhoneError("");
    setEmailError("");
    setHasAutoFilled(false);
    setAutoFillAttempted(false);
  };

  const handleClose = () => {
    // If ThankYouPopup is showing, don't close immediately
    if (showThankYou) {
      return;
    }
    resetForm();
    setShowThankYou(false);
    onClose();
  };

  if (!isOpen) return null;

  const currencySymbol = getCurrencySymbol();
  const displayPrices = getDisplayPrices();
  const showRoad = shouldShowRoadTransport();

  const cartSubtotal = cartProducts.reduce((sum, prod) => {
    const orderQuantity = productOrderQuantities[prod.cartItemId || prod.id] || 1;
    
    let pricePerUnit = getPricePerUnit(prod.id);
    const analysis = analyzeProductData(prod);
    
    let packageQuantity = parseFloat(prod.selectedQuantity) || 1;
    
    return sum + (pricePerUnit * packageQuantity * orderQuantity);
  }, 0);

  const cartTotalItems = cartProducts.reduce((sum, prod) => {
    const orderQuantity = productOrderQuantities[prod.cartItemId || prod.id] || 1;
    const analysis = analyzeProductData(prod);
    let packageQuantity = parseFloat(prod.selectedQuantity) || 1;
    return sum + (packageQuantity * orderQuantity);
  }, 0);

  return (
    <>
      <div className="buy-modal-overlay checkout-modal">
        <div className="buy-modal-container" ref={modalRef}>
          <button className="buy-modal-close-btn" onClick={handleClose} aria-label="Close modal">
            &times;
          </button>

          <div className="buy-modal-header">
            <h2 className="buy-modal-title">
              Checkout ({cartProducts.length} Items) - {selectedCurrency}
            </h2>
            <p className="buy-modal-subtitle">
              Fill out the form below to get a quote for {cartProducts.length} items
            </p>

            <div className="product-type-info">
              <small>🎁 Multiple Products Order</small>
            </div>
          </div>

          <div className="buy-modal-body">
            <div className="modal-layout">
              <div className="form-section-container" ref={formContainerRef}>
                <form onSubmit={handleSubmit}>
                  {profile && !hasAutoFilled && (
                    <div className="auto-fill-section">
                      <button
                        type="button"
                        className="auto-fill-btn"
                        onClick={handleAutoFillFromProfile}
                      >
                        🔄 Auto-fill from Profile
                      </button>
                      <small className="auto-fill-note">
                        Click to auto-fill your information from your profile.
                      </small>
                    </div>
                  )}

                  {submitError && (
                    <div className="submit-error-section">
                      <div className="error-message alert-error">
                        ⚠️ {submitError}
                      </div>
                    </div>
                  )}

                  <section className="form-section">
                    <h3 className="section-title">
                      <Package size={20} style={{ marginRight: '8px' }} />
                      Selected Products ({selectedCurrency})
                    </h3>

                    {availableCurrencies.length > 1 && (
                      <div className="form-group mb-3">
                        <label className="form-label">Display Currency</label>
                        <select
                          value={selectedCurrency}
                          onChange={handleCurrencyChange}
                          className="form-select"
                        >
                          {availableCurrencies.map(curr => (
                            <option key={curr.code} value={curr.code}>
                              {curr.symbol} {curr.code}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="standard-products-display">
                      {cartProducts.map((cartProduct, index) => {
                        const config = cartProductConfigs[cartProduct.id] || {};
                        const orderQuantity = productOrderQuantities[cartProduct.cartItemId || cartProduct.id] || 1;
                        const analysis = analyzeProductData(cartProduct);
                        const productImage = cartProduct.image || analysis.productImage;
                        
                        let pricePerUnit = getPricePerUnit(cartProduct.id);
                        
                        let packageQuantity = 1;
                        if (cartProduct.selectedQuantity) {
                          if (cartProduct.selectedQuantity === "custom") {
                            packageQuantity = parseFloat(config.customQuantity) || 1;
                          } else {
                            packageQuantity = parseFloat(cartProduct.selectedQuantity) || 1;
                          }
                        }
                        
                        // 🔥 FIXED: Calculate product subtotal with order quantity
                        const productSubtotal = pricePerUnit * packageQuantity * orderQuantity;

                        const displayGrade = cartProduct.selectedGradeDisplay || cartProduct.selectedGrade || null;
                        const displayGradePrice = cartProduct.selectedGradePrice || null;
                        const displayPacking = cartProduct.selectedPacking || null;
                        const displayQuantity = cartProduct.selectedQuantity || null;

                        const isRiceProduct = cartProduct.isRice || 
                                             cartProduct.companyName?.toLowerCase().includes('siea') ||
                                             cartProduct.name?.toLowerCase().includes('rice');

                        return (
                          <div key={cartProduct.cartItemId || cartProduct.id} className="standard-product-item">
                            <div className="standard-product-image">
                              <div className="order-quantity-buttons">
                                <button
                                  type="button"
                                  className="order-quantity-btn"
                                  onClick={() => handleDecreaseOrderQuantity(cartProduct.cartItemId || cartProduct.id)}
                                >
                                  <Minus size={16} />
                                </button>
                                <span className="order-quantity-display">{orderQuantity}</span>
                                <button
                                  type="button"
                                  className="order-quantity-btn"
                                  onClick={() => handleIncreaseOrderQuantity(cartProduct.cartItemId || cartProduct.id)}
                                >
                                  <Plus size={16} />
                                </button>
                              </div>
                              <img
                                src={productImage}
                                alt={cartProduct.name}
                                onError={(e) => {
                                  e.target.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&auto=format&fit=crop&q=60';
                                }}
                              />
                              <div className="product-badge">
                                {cartProduct.companyName === 'Nut Walker' ? '🥜 Dry Fruits' :
                                 cartProduct.companyName === 'Heritage' ? '🌾 Heritage' :
                                 cartProduct.companyName === 'Akil Drinks' ? '🥤 Beverages' :
                                 cartProduct.companyName === 'SIEA' ? '🍚 Rice' : 
                                 isRiceProduct ? '🍚 Rice' : '⭐ Premium'}
                              </div>
                            </div>

                            <div className="standard-product-details">
                              <div className="standard-product-header">
                                <h4 className="standard-product-name">{cartProduct.name}</h4>
                                <span className="standard-product-brand">{cartProduct.companyName}</span>
                                
                                {cartProduct.brandName && cartProduct.brandName !== 'General' && (
                                  <span className="standard-product-brand-name">
                                    Brand: {cartProduct.brandName}
                                  </span>
                                )}
                                
                                {analysis.origin && (
                                  <span className="standard-product-origin">Origin: {analysis.origin}</span>
                                )}
                              </div>

                              <div className="standard-product-price-section">
                                <div className="standard-price-display">
                                  {/* 🔥 FIXED: Show price with proper unit */}
                                  <span className="standard-price-amount">{analysis.priceDisplay}</span>
                                  <span className="standard-price-unit">each</span>
                                </div>
                                
                                <div className="standard-config-display">
                                  {displayGrade && (
                                    <div className="config-row readonly-config">
                                      <span className="config-label">Selected Grade:</span>
                                      <span className="config-value-readonly">
                                        {displayGrade} - {currencySymbol}{displayGradePrice || pricePerUnit}/{analysis.unit}
                                      </span>
                                    </div>
                                  )}

                                  {displayPacking && (
                                    <div className="config-row readonly-config">
                                      <span className="config-label">Selected Packing:</span>
                                      <span className="config-value-readonly">
                                        {displayPacking}
                                      </span>
                                    </div>
                                  )}

                                  {displayQuantity && (
                                    <div className="config-row readonly-config">
                                      <span className="config-label">Selected Quantity:</span>
                                      <span className="config-value-readonly">
                                        {displayQuantity} {analysis.unit}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                <div className="standard-total-price">
                                  <span className="total-label">
                                    Total ({orderQuantity} × {displayQuantity || packageQuantity} {analysis.unit}):
                                  </span>
                                  <span className="total-amount">
                                    {currencySymbol}{productSubtotal.toFixed(2)}
                                  </span>
                                </div>
                              </div>

                              <div className="standard-product-meta">
                                {analysis.packagingInfo && (
                                  <div className="meta-item">
                                    <span className="meta-label">Packaging:</span>
                                    <span className="meta-value">{analysis.packagingInfo}</span>
                                  </div>
                                )}
                                {cartProduct.brandName && cartProduct.brandName !== 'General' && (
                                  <div className="meta-item">
                                    <span className="meta-label">Brand:</span>
                                    <span className="meta-value">{cartProduct.brandName}</span>
                                  </div>
                                )}
                                <div className="meta-item">
                                  <span className="meta-label">Order Qty:</span>
                                  <span className="meta-value">{orderQuantity} units</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      <div className="cart-summary-standard">
                        <div className="summary-row">
                          <span className="summary-label">Total Items:</span>
                          <span className="summary-value">{cartProducts.length}</span>
                        </div>
                        <div className="summary-row">
                          <span className="summary-label">Total Quantity:</span>
                          <span className="summary-value">{cartTotalItems} units</span>
                        </div>
                        <div className="summary-row total">
                          <span className="summary-label">Subtotal:</span>
                          <span className="summary-value">{currencySymbol}{cartSubtotal.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="form-section">
                    <h3 className="section-title">Contact Information</h3>

                    <div className="form-group">
                      <label className="form-label">Full Name *</label>
                      <input
                        type="text"
                        placeholder="Enter your full name"
                        value={fullName}
                        onChange={handleFullNameChange}
                        required
                        className="form-input"
                      />
                      {hasAutoFilled && (
                        <div className="profile-autofill-note">
                          <small>✓ Auto-filled from profile</small>
                        </div>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Email Address *</label>
                      <input
                        type="email"
                        placeholder="your.email@example.com"
                        value={email}
                        onChange={handleEmailChange}
                        required
                        className="form-input"
                      />
                      {hasAutoFilled && (
                        <div className="profile-autofill-note">
                          <small>✓ Auto-filled from profile</small>
                        </div>
                      )}
                      {emailError && <div className="error-message">{emailError}</div>}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Country *</label>
                      <input
                        type="text"
                        placeholder="Enter your country (e.g., India, USA, UAE)"
                        value={country}
                        onChange={handleCountryNameChange}
                        required
                        className="form-input"
                      />
                      {hasAutoFilled && (
                        <div className="profile-autofill-note">
                          <small>✓ Auto-filled from profile</small>
                        </div>
                      )}
                      <small className="form-text text-muted d-block mt-1">
                        Enter your country name
                      </small>
                    </div>

                    <div className="form-group">
                      <label className="form-label">State/Province *</label>
                      <input
                        type="text"
                        placeholder="Enter your state/province"
                        value={state}
                        onChange={handleStateChangeInput}
                        required
                        className="form-input"
                      />
                      {hasAutoFilled && (
                        <div className="profile-autofill-note">
                          <small>✓ Auto-filled from profile</small>
                        </div>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label">City/Town *</label>
                      <input
                        type="text"
                        placeholder="Enter your city/town"
                        value={city}
                        onChange={handleCityChange}
                        required
                        className="form-input"
                      />
                      {hasAutoFilled && (
                        <div className="profile-autofill-note">
                          <small>✓ Auto-filled from profile</small>
                        </div>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Pincode/ZIP *</label>
                      <input
                        type="text"
                        placeholder="Enter your pincode/ZIP"
                        value={pincode}
                        onChange={handlePincodeChange}
                        required
                        className="form-input"
                      />
                      {hasAutoFilled && (
                        <div className="profile-autofill-note">
                          <small>✓ Auto-filled from profile</small>
                        </div>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Phone Number *</label>
                      <div className="phone-input-group">
                        <select
                          value={countryCode}
                          onChange={handleCountryChange}
                          className="country-code-select"
                        >
                          {countryOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.flag} {option.value} ({option.name})
                            </option>
                          ))}
                        </select>
                        <input
                          type="tel"
                          placeholder={`Phone number (${getCurrentCountry()?.length || 10} digits)`}
                          value={phoneNumber}
                          onChange={handlePhoneChange}
                          maxLength={getCurrentCountry()?.length || 10}
                          required
                          className="form-input phone-input"
                        />
                      </div>
                      {hasAutoFilled && (
                        <div className="profile-autofill-note">
                          <small>✓ Auto-filled from profile</small>
                        </div>
                      )}
                      {phoneError && <div className="error-message">{phoneError}</div>}
                    </div>

                    {hasAutoFilled && (
                      <div className="auto-fill-confirmation">
                        <Check size={18} />
                        <span>Profile data has been auto-filled successfully!</span>
                      </div>
                    )}
                  </section>

                  <section className="form-section">
                    <h3 className="section-title">Transport Details</h3>

                    <div className="form-group">
                      <label className="form-label">Select Transport Type *</label>
                      <select 
                        value={transportType} 
                        onChange={handleTransportTypeChange} 
                        required 
                        className="form-select"
                      >
                        <option value="">Select Transport Type</option>
                        {showRoad && <option value="road">🚛 Road Transport</option>}
                        <option value="air">✈️ Air Freight</option>
                        <option value="ocean">🚢 Ocean Freight</option>
                      </select>
                      {!showRoad && country && (
                        <small className="transport-note">
                          ⚡ Road transport is only available for India. Showing international options.
                        </small>
                      )}
                    </div>

                    {transportType === 'road' && (
                      <>
                        <div className="form-group">
                          <label className="form-label">Pickup Location *</label>
                          <div className="transport-location-group">
                            <input
                              type="text"
                              placeholder="City"
                              value={pickupLocation.city}
                              onChange={(e) => handlePickupLocationChange('city', e.target.value)}
                              className="form-input"
                              required
                            />
                            <input
                              type="text"
                              placeholder="State"
                              value={pickupLocation.state}
                              onChange={(e) => handlePickupLocationChange('state', e.target.value)}
                              className="form-input"
                              required
                            />
                            <input
                              type="text"
                              placeholder="Country"
                              value={pickupLocation.country}
                              onChange={(e) => handlePickupLocationChange('country', e.target.value)}
                              className="form-input"
                              required
                            />
                          </div>
                        </div>

                        <div className="form-group">
                          <label className="form-label">Delivery Location *</label>
                          <div className="transport-location-group">
                            <input
                              type="text"
                              placeholder="City"
                              value={deliveryLocation.city}
                              onChange={(e) => handleDeliveryLocationChange('city', e.target.value)}
                              className="form-input"
                              required
                            />
                            <input
                              type="text"
                              placeholder="State"
                              value={deliveryLocation.state}
                              onChange={(e) => handleDeliveryLocationChange('state', e.target.value)}
                              className="form-input"
                              required
                            />
                            <input
                              type="text"
                              placeholder="Country"
                              value={deliveryLocation.country}
                              onChange={(e) => handleDeliveryLocationChange('country', e.target.value)}
                              className="form-input"
                              required
                            />
                          </div>
                        </div>

                        <div className="form-group">
                          <label className="form-label">Vehicle Type (Optional)</label>
                          <select 
                            value={vehicleType} 
                            onChange={(e) => setVehicleType(e.target.value)} 
                            className="form-select"
                          >
                            <option value="">Select Vehicle Type (Optional)</option>
                            {vehicleOptions.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}

                    {transportType === 'air' && (
                      <>
                        <div className="form-group">
                          <label className="form-label">Airport of Loading *</label>
                          <div className="airport-group">
                            <input
                              type="text"
                              placeholder="Country"
                              value={airportOfLoading.country}
                              onChange={(e) => handleAirportLoadingChange('country', e.target.value)}
                              className="form-input"
                              required
                            />
                            <input
                              type="text"
                              placeholder="Airport Name"
                              value={airportOfLoading.airportName}
                              onChange={(e) => handleAirportLoadingChange('airportName', e.target.value)}
                              className="form-input"
                              required
                            />
                          </div>
                        </div>

                        <div className="form-group">
                          <label className="form-label">Airport of Destination *</label>
                          <div className="airport-group">
                            <input
                              type="text"
                              placeholder="Country"
                              value={airportOfDestination.country}
                              onChange={(e) => handleAirportDestinationChange('country', e.target.value)}
                              className="form-input"
                              required
                            />
                            <input
                              type="text"
                              placeholder="Airport Name"
                              value={airportOfDestination.airportName}
                              onChange={(e) => handleAirportDestinationChange('airportName', e.target.value)}
                              className="form-input"
                              required
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {transportType === 'ocean' && (
                      <>
                        <div className="form-group">
                          <label className="form-label">Port of Loading *</label>
                          <div className="transport-selection-group">
                            <div className="transport-row">
                              <div className="transport-column">
                                <label className="form-label">Country</label>
                                <input
                                  type="text"
                                  placeholder="Enter country"
                                  value={portOfLoading.country}
                                  onChange={(e) => handlePortOfLoadingChange('country', e.target.value)}
                                  className="form-input"
                                  required
                                />
                              </div>
                              <div className="transport-column">
                                <label className="form-label">State</label>
                                <input
                                  type="text"
                                  placeholder="Enter state"
                                  value={portOfLoading.state}
                                  onChange={(e) => handlePortOfLoadingChange('state', e.target.value)}
                                  className="form-input"
                                  required
                                />
                              </div>
                              <div className="transport-column">
                                <label className="form-label">Port Name</label>
                                <input
                                  type="text"
                                  placeholder="Enter port name"
                                  value={portOfLoading.portName}
                                  onChange={(e) => handlePortOfLoadingChange('portName', e.target.value)}
                                  className="form-input"
                                  required
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="form-group">
                          <label className="form-label">Port of Destination *</label>
                          <div className="transport-selection-group">
                            <div className="transport-row">
                              <div className="transport-column">
                                <label className="form-label">Country</label>
                                <input
                                  type="text"
                                  placeholder="Enter country"
                                  value={portOfDestination.country}
                                  onChange={(e) => handlePortOfDestinationChange('country', e.target.value)}
                                  className="form-input"
                                  required
                                />
                              </div>
                              <div className="transport-column">
                                <label className="form-label">State</label>
                                <input
                                  type="text"
                                  placeholder="Enter state"
                                  value={portOfDestination.state}
                                  onChange={(e) => handlePortOfDestinationChange('state', e.target.value)}
                                  className="form-input"
                                  required
                                />
                              </div>
                              <div className="transport-column">
                                <label className="form-label">Port Name</label>
                                <input
                                  type="text"
                                  placeholder="Enter port name"
                                  value={portOfDestination.portName}
                                  onChange={(e) => handlePortOfDestinationChange('portName', e.target.value)}
                                  className="form-input"
                                  required
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {transportType && (
                      <div className="transport-price-info">
                        <small>
                          Transport Cost Estimate: {displayPrices.transportCost}
                          {transportType === 'road' && ' (Road transport - address to address)'}
                          {transportType === 'air' && ' (Air freight - airport to airport)'}
                          {transportType === 'ocean' && ' (Ocean freight - port to port)'}
                        </small>
                      </div>
                    )}
                  </section>

                  <section className="form-section">
                    <h3 className="section-title">Order Requirements</h3>

                    <div className="form-group">
                      <label className="form-label">CIF Required (If Any) *</label>
                      <select value={cifRequired} onChange={handleCifChange} required className="form-select">
                        <option value="">Select Option</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                      <div className="cif-info">
                        <small>CIF includes shipping and insurance costs to your destination</small>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Brand Required (If Any) *</label>
                      <select value={brandingRequired} onChange={handleBrandingChange} required className="form-select">
                        <option value="">Select Option</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                      <div className="branding-info">
                        <small>Add your logo/branding to the packaging - Additional charge: {currencySymbol}35 per order</small>
                        {brandingRequired === "Yes" && (
                          <div className="branding-cost-preview">
                            <small>Branding/custom printing cost: {displayPrices.brandingCost}</small>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Additional Information</label>
                      <textarea
                        placeholder="Enter any additional information here"
                        value={additionalInfo}
                        onChange={(e) => setAdditionalInfo(e.target.value)}
                        className="form-textarea"
                        rows="4"
                      />
                    </div>
                  </section>

                  <div className="form-actions">
                    <button type="submit" className="submit-btn" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <span className="btn-loading">
                          <span className="btn-spinner"></span>
                          Submitting...
                        </span>
                      ) : (
                        `Order Now (${cartProducts.length} Items)`
                      )}
                    </button>

                    <button type="button" onClick={handleClose} className="cancel-btn">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>

              <div className="estimate-section-container" ref={estimateContainerRef}>
                <div className="price-breakdown-section">
                  <h4 className="price-breakdown-title">
                    Cart Summary ({cartProducts.length} Items) - {selectedCurrency}
                  </h4>

                  <div className="estimate-note">
                    <small>This is an estimated bill. Final pricing may vary.</small>
                  </div>

                  <div className="price-breakdown-grid">
                    <div className="price-item">
                      <span className="price-label">Items in Cart:</span>
                      <span className="price-value">{cartProducts.length} products</span>
                    </div>

                    <div className="price-item">
                      <span className="price-label">Total Quantity:</span>
                      <span className="price-value">{cartTotalItems} units</span>
                    </div>

                    {transportType && (
                      <div className="price-item transport-summary">
                        <span className="price-label">Transport Type:</span>
                        <span className="price-value">
                          {transportType === 'road' ? '🚛 Road' : 
                           transportType === 'air' ? '✈️ Air' : '🚢 Ocean'}
                        </span>
                      </div>
                    )}

                    {transportType === 'road' && pickupLocation.city && (
                      <div className="price-item">
                        <span className="price-label">Route:</span>
                        <span className="price-value">
                          {pickupLocation.city} → {deliveryLocation.city}
                        </span>
                      </div>
                    )}

                    {transportType === 'air' && airportOfLoading.airportName && (
                      <div className="price-item">
                        <span className="price-label">Route:</span>
                        <span className="price-value">
                          {airportOfLoading.airportName} → {airportOfDestination.airportName}
                        </span>
                      </div>
                    )}

                    {transportType === 'ocean' && portOfLoading.portName && (
                      <div className="price-item">
                        <span className="price-label">Route:</span>
                        <span className="price-value">
                          {portOfLoading.portName} → {portOfDestination.portName}
                        </span>
                      </div>
                    )}

                    <div className="price-item">
                      <span className="price-label">Cart Subtotal:</span>
                      <span className="price-value">{displayPrices.originalPrice}</span>
                    </div>

                    {brandingRequired === "Yes" && (
                      <div className="price-item branding-costs">
                        <span className="price-label">Branding/Custom Printing:</span>
                        <span className="price-value">{displayPrices.brandingCost}</span>
                      </div>
                    )}

                    {transportType && (
                      <div className="price-item transport-costs">
                        <span className="price-label">Transport Cost:</span>
                        <span className="price-value">{displayPrices.transportCost}</span>
                      </div>
                    )}

                    {cifRequired === "Yes" && (
                      <>
                        <div className="price-item">
                          <span className="price-label">Shipping Cost:</span>
                          <span className="price-value">{displayPrices.shippingCost}</span>
                        </div>
                        <div className="price-item">
                          <span className="price-label">Insurance Cost:</span>
                          <span className="price-value">{displayPrices.insuranceCost}</span>
                        </div>
                        <div className="price-item">
                          <span className="price-label">Taxes & Duties:</span>
                          <span className="price-value">{displayPrices.taxes}</span>
                        </div>
                      </>
                    )}

                    <div className="price-item final-total">
                      <span className="price-label">Final Total:</span>
                      <span className="price-value">{displayPrices.finalTotalPrice}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🔥 FIXED: ThankYouPopup with proper handler */}
      <ThankYouPopup 
        isOpen={showThankYou} 
        onClose={handleThankYouClose} 
      />
    </>
  );
};

export default CheckoutModal;