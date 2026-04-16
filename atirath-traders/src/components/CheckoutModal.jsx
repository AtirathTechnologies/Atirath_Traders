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
  const [brandingCost, setBrandingCost] = useState("0.00");
  const [transportCost, setTransportCost] = useState("0.00");
  const [submitError, setSubmitError] = useState("");
  const [totalPackingCost, setTotalPackingCost] = useState("0.00");

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
  // ANALYZE PRODUCT DATA WITH PROPER PRICE EXTRACTION
  // ============================================
  const analyzeProductData = (product) => {
    if (!product) return {};
    console.log("📦 Raw Product Data in Checkout:", product);

    let priceValue = 0;
    let currencyDetected = selectedCurrency;
    let priceDisplay = "";
    let minPrice = 0;
    let maxPrice = 0;
    let isRange = false;
    let priceType = 'unknown';
    let unit = 'unit';
    let baseValue = 0;
    let baseCurrency = 'USD';
    let isRice = false;
    let isPerPack = false;
    let packSize = null;

    // Check if it's a rice product
    if (product.isRice ||
      product.productType === 'rice' ||
      product.categoryId === 'rice' ||
      product.name?.toLowerCase().includes('rice') ||
      product.companyName?.toLowerCase().includes('siea')) {
      isRice = true;
      unit = 'pack';
      isPerPack = true;
      packSize = product.selectedQuantity ? parseFloat(product.selectedQuantity) : null;
    }

    // Extract product price
    if (product.price && product.price.value !== undefined && product.price.value !== null) {
      baseValue = parseFloat(product.price.value);
      baseCurrency = product.price.currency || (isRice ? 'INR' : 'USD');
      priceType = product.price.type || (isRice ? 'rice_pack' : 'fixed');
      priceValue = convertCurrency(baseValue, baseCurrency, selectedCurrency);
      currencyDetected = selectedCurrency;

      const symbol = currencySymbols[selectedCurrency] || (selectedCurrency === 'INR' ? '₹' : '$');
      if (isRice && packSize) {
        const displayPack = `${packSize}kg`;
        priceDisplay = `${symbol}${priceValue.toFixed(2)} / ${displayPack}`;
        unit = `${packSize}kg`;
      } else if (priceType === 'FOB') {
        priceDisplay = `${symbol}${priceValue.toFixed(2)} FOB / ${unit}`;
      } else if (priceType === 'EX-MILL') {
        priceDisplay = `${symbol}${priceValue.toFixed(2)} EX-MILL / ${unit}`;
      } else {
        priceDisplay = `${symbol}${priceValue.toFixed(2)} / ${unit}`;
      }
    } else if (product.price && product.price.packPrice !== undefined) {
      baseValue = parseFloat(product.price.packPrice);
      baseCurrency = product.price.currency || 'INR';
      priceType = 'rice_pack';
      priceValue = convertCurrency(baseValue, baseCurrency, selectedCurrency);
      currencyDetected = selectedCurrency;
      const symbol = currencySymbols[selectedCurrency] || '₹';
      const quantityLabel = product.selectedQuantityLabel || (packSize ? `${packSize}kg` : 'pack');
      priceDisplay = `${symbol}${priceValue.toFixed(2)} / ${quantityLabel}`;
      if (packSize) unit = quantityLabel;
    } else if (product.fob_price_usd !== undefined) {
      baseValue = product.fob_price_usd;
      baseCurrency = "USD";
      priceType = 'FOB';
      unit = 'carton';
      priceValue = convertCurrency(baseValue, 'USD', selectedCurrency);
      const symbol = currencySymbols[selectedCurrency] || (selectedCurrency === 'INR' ? '₹' : '$');
      priceDisplay = `${symbol}${priceValue.toFixed(2)} FOB / carton`;
    } else if (product["Ex-Mill_usd"] !== undefined) {
      baseValue = product["Ex-Mill_usd"];
      baseCurrency = "USD";
      priceType = 'EX-MILL';
      unit = 'carton';
      priceValue = convertCurrency(baseValue, 'USD', selectedCurrency);
      const symbol = currencySymbols[selectedCurrency] || (selectedCurrency === 'INR' ? '₹' : '$');
      priceDisplay = `${symbol}${priceValue.toFixed(2)} EX-MILL / carton`;
    } else if (product.price_usd_per_carton !== undefined) {
      baseValue = product.price_usd_per_carton;
      baseCurrency = "USD";
      priceType = 'carton';
      unit = 'carton';
      priceValue = convertCurrency(baseValue, 'USD', selectedCurrency);
      const symbol = currencySymbols[selectedCurrency] || (selectedCurrency === 'INR' ? '₹' : '$');
      priceDisplay = `${symbol}${priceValue.toFixed(2)} / carton`;
    } else if (product.price && product.price.display) {
      priceDisplay = product.price.display;
      priceValue = parseFloat(product.price.value) || 0;
      unit = isRice ? 'pack' : (product.price.unit || 'unit');
    } else if (product.grades && Array.isArray(product.grades) && product.grades.length > 0) {
      const selectedGrade = product.selectedGrade || product.selectedConfig?.grade;
      const grade = product.grades.find(g => g.grade === selectedGrade || g.name === selectedGrade);
      if (grade && grade.price_inr) {
        baseValue = parseFloat(grade.price_inr);
        baseCurrency = "INR";
        priceType = 'rice';
        unit = 'kg';
        priceValue = convertCurrency(baseValue, 'INR', selectedCurrency);
        const symbol = currencySymbols[selectedCurrency] || '₹';
        priceDisplay = `${symbol}${priceValue.toFixed(2)} / kg`;
        isPerPack = false;
      }
    }

    let origin = product.origin ||
      product.firebaseData?.origin ||
      "India";

    let packagingInfo = "";
    if (product.packaging) {
      if (typeof product.packaging === 'object') {
        if (product.packaging.type) {
          packagingInfo = product.packaging.type;
        } else if (product.packaging.units_per_carton) {
          packagingInfo = `${product.packaging.units_per_carton} units per carton`;
          if (product.packaging.unit_weight_g) {
            packagingInfo += ` (${product.packaging.unit_weight_g}g each)`;
          }
        }
      } else if (typeof product.packaging === 'string') {
        packagingInfo = product.packaging;
      }
    } else if (product.pack_type) {
      packagingInfo = product.pack_type;
    }

    const productType = getProductType(product);

    let productImage = product.image ||
      product.firebaseData?.image ||
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
      firebaseData: product.firebaseData || product,
      priceType,
      unit,
      baseValue,
      baseCurrency,
      isRice,
      isPerPack,
      packSize
    };
  };

  // ============================================
  // GET PRODUCT TYPE
  // ============================================
  const getProductType = (product) => {
    if (!product) return 'default';
    if (product.category) return product.category.toLowerCase();
    const productName = product.name?.toLowerCase() || '';
    const companyName = product.companyName?.toLowerCase() || '';
    if (companyName.includes('siea')) return 'rice';
    if (companyName.includes('heritage')) {
      if (productName.includes('rice')) return 'rice';
      if (productName.includes('dal') || productName.includes('lentil')) return 'pulses';
      if (productName.includes('spice')) return 'spices';
      if (productName.includes('tea')) return 'tea';
      return 'default';
    }
    if (companyName.includes('nut walker')) return 'dryfruits';
    if (companyName.includes('akil drinks')) return 'beverages';
    if (productName.includes('oil') || productName.includes('sunflower') || productName.includes('olive')) return 'oil';
    if (productName.includes('dal') || productName.includes('lentil') || productName.includes('pulse')) return 'pulses';
    if (productName.includes('spice') || productName.includes('turmeric') || productName.includes('chilli')) return 'spices';
    if (productName.includes('tea') || productName.includes('green tea') || productName.includes('black tea')) return 'tea';
    if (productName.includes('almond') || productName.includes('cashew') || productName.includes('dry fruit')) return 'dryfruits';
    if (productName.includes('juice') || productName.includes('drink') || productName.includes('beverage')) return 'beverages';
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
    const isRice = analysis.isRice;
    if (isRice) {
      return ricePackingOptions.map(option => ({
        value: option.value,
        price: option.price || "0"
      }));
    }
    if (product?.pack_type) return [{ value: product.pack_type, price: "0" }];
    if (product?.packaging) {
      if (typeof product.packaging === 'string') return [{ value: product.packaging, price: "0" }];
      if (typeof product.packaging === 'object') {
        if (product.packaging.type) return [{ value: product.packaging.type, price: "0" }];
        if (product.packaging.units_per_carton) {
          const display = product.packaging.unit_weight_ml
            ? `${product.packaging.units_per_carton} × ${product.packaging.unit_weight_ml} ml`
            : product.packaging.unit_weight_g
              ? `${product.packaging.units_per_carton} × ${product.packaging.unit_weight_g} g`
              : `${product.packaging.units_per_carton} units/carton`;
          return [{ value: display, price: "0" }];
        }
      }
    }
    return [];
  };

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================
  const getPricePerUnit = (productId) => {
    const product = cartProducts.find(p => p.id === productId);
    if (!product) return 0;
    const analysis = analyzeProductData(product);
    return analysis.priceValue;
  };

  const getSelectedQuantityDisplay = (cartItemId) => {
    const product = cartProducts.find(p => (p.cartItemId || p.id) === cartItemId);
    if (!product) return "Not selected";
    const analysis = analyzeProductData(product);
    if (product.selectedQuantityLabel) return product.selectedQuantityLabel;
    if (product.selectedQuantity) {
      if (product.selectedQuantity === "custom") return `Custom ${analysis.unit}`;
      return `${product.selectedQuantity} ${analysis.unit}`;
    }
    return `1 ${analysis.unit}`;
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
  // CALCULATION FUNCTIONS (NO CIF)
  // ============================================
  const calculateTransportCost = () => {
    if (!transportType) return 0;

    const totalQuantity = cartProducts.reduce((sum, prod) => {
      const orderQuantity = productOrderQuantities[prod.cartItemId || prod.id] || 1;
      let packageQuantity = 1;
      if (prod.selectedQuantity) {
        packageQuantity = parseFloat(prod.selectedQuantity) || 1;
      }
      return sum + (packageQuantity * orderQuantity);
    }, 0);

    if (totalQuantity <= 0) return 0;

    const baseRates = { road: 5, air: 50, ocean: 15 };
    const ratePerUnit = baseRates[transportType] || 0;
    const convertedRate = convertCurrency(ratePerUnit, 'INR', selectedCurrency);
    return totalQuantity * convertedRate;
  };

  // ============================================
  // CALCULATE TOTALS (NO CIF)
  // ============================================
  const calculateCartTotal = () => {
    let productTotal = 0;
    let packingTotal = 0;

    cartProducts.forEach(cartProduct => {
      const orderQuantity = productOrderQuantities[cartProduct.cartItemId || cartProduct.id] || 1;
      const analysis = analyzeProductData(cartProduct);
      let productSubtotal = analysis.priceValue * orderQuantity;
      productTotal += productSubtotal;

      if (cartProduct.totalPackingCost) {
        const packingCostInr = parseFloat(cartProduct.totalPackingCost);
        const packingCostConverted = convertCurrency(packingCostInr, 'INR', selectedCurrency);
        packingTotal += packingCostConverted;
      }
    });

    setTotalPackingCost(packingTotal.toFixed(2));

    let brandingCostValue = 0;
    if (brandingRequired === "Yes") {
      const baseBrandingCost = 35;
      brandingCostValue = convertCurrency(baseBrandingCost, 'INR', selectedCurrency) * cartProducts.length;
      productTotal += brandingCostValue;
    }
    setBrandingCost(brandingCostValue.toFixed(2));

    const transportCostValue = calculateTransportCost();
    productTotal += transportCostValue;
    setTransportCost(transportCostValue.toFixed(2));

    const finalTotal = productTotal + packingTotal;
    setTotalPrice(finalTotal.toFixed(2));
  };

  const getDisplayPrices = () => {
    const selectedCurrencySymbol = getCurrencySymbol();

    let productSubtotal = 0;
    let packingTotal = 0;

    cartProducts.forEach(prod => {
      const orderQuantity = productOrderQuantities[prod.cartItemId || prod.id] || 1;
      const analysis = analyzeProductData(prod);
      productSubtotal += analysis.priceValue * orderQuantity;
      if (prod.totalPackingCost) {
        const packingCostInr = parseFloat(prod.totalPackingCost);
        const packingCostConverted = convertCurrency(packingCostInr, 'INR', selectedCurrency);
        packingTotal += packingCostConverted;
      }
    });

    const subtotalWithPacking = productSubtotal + packingTotal;

    const formattedProductSubtotal = `${selectedCurrencySymbol}${formatNumber(productSubtotal)}`;
    const formattedPackingTotal = packingTotal > 0 ? `${selectedCurrencySymbol}${formatNumber(packingTotal)}` : "Not Required";
    const formattedSubtotalWithPacking = `${selectedCurrencySymbol}${formatNumber(subtotalWithPacking)}`;

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

    const finalTotalFormatted = `${selectedCurrencySymbol}${formatNumber(totalPrice)}`;

    return {
      productSubtotal: formattedProductSubtotal,
      packingTotal: formattedPackingTotal,
      subtotalWithPacking: formattedSubtotalWithPacking,
      itemCount: `${cartProducts.length} products`,
      brandingCost: brandingCostFormatted,
      transportCost: transportCostFormatted,
      finalTotalPrice: finalTotalFormatted
    };
  };

  // ============================================
  // VALIDATION FUNCTIONS
  // ============================================
  const validatePhoneNumber = (number, code) => {
    const selectedCountry = countryOptions.find((opt) => opt.value === code);
    const expectedLength = selectedCountry?.length || 10;
    if (!number) { setPhoneError("Phone number is required"); return false; }
    if (number.length !== expectedLength) { setPhoneError(`Phone number must be ${expectedLength} digits`); return false; }
    if (!/^\d+$/.test(number)) { setPhoneError("Phone number must contain only digits"); return false; }
    setPhoneError(""); return true;
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) { setEmailError("Email is required"); return false; }
    if (!emailRegex.test(email)) { setEmailError("Invalid email format"); return false; }
    setEmailError(""); return true;
  };

  // ============================================
  // HANDLER FUNCTIONS
  // ============================================
  const handleCountryChange = (e) => {
    const newCode = e.target.value;
    setCountryCode(newCode);
    const selectedCountry = countryOptions.find(opt => opt.value === newCode);
    if (selectedCountry && selectedCountry.currency) setSelectedCurrency(selectedCountry.currency);
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

  const handleFullNameChange = (e) => setFullName(e.target.value);
  const handleCountryNameChange = (e) => setCountry(e.target.value);
  const handleStateChangeInput = (e) => setState(e.target.value);
  const handleCityChange = (e) => setCity(e.target.value);
  const handlePincodeChange = (e) => setPincode(e.target.value);
  const handleCurrencyChange = (e) => setSelectedCurrency(e.target.value);
  const handleBrandingChange = (e) => setBrandingRequired(e.target.value);
  const handleTransportTypeChange = (e) => setTransportType(e.target.value);

  const handlePickupLocationChange = (field, value) => setPickupLocation(prev => ({ ...prev, [field]: value }));
  const handleDeliveryLocationChange = (field, value) => setDeliveryLocation(prev => ({ ...prev, [field]: value }));
  const handleAirportLoadingChange = (field, value) => setAirportOfLoading(prev => ({ ...prev, [field]: value }));
  const handleAirportDestinationChange = (field, value) => setAirportOfDestination(prev => ({ ...prev, [field]: value }));
  const handlePortOfLoadingChange = (field, value) => setPortOfLoading(prev => ({ ...prev, [field]: value }));
  const handlePortOfDestinationChange = (field, value) => setPortOfDestination(prev => ({ ...prev, [field]: value }));

  const handleIncreaseOrderQuantity = (cartItemId) => {
    setProductOrderQuantities(prev => ({ ...prev, [cartItemId]: (prev[cartItemId] || 1) + 1 }));
  };

  const handleDecreaseOrderQuantity = (cartItemId) => {
    setProductOrderQuantities(prev => ({ ...prev, [cartItemId]: Math.max(1, (prev[cartItemId] || 1) - 1) }));
  };

  const handleAutoFillFromProfile = () => {
    if (!profile) return;
    setFullName(profile.name || profile.displayName || "");
    setEmail(profile.email || "");
    setCountry(profile.country || "");
    setState(profile.state || "");
    setCity(profile.city || "");
    setPincode(profile.pincode || "");
    const phoneFromProfile = profile.phone || profile.phoneNumber || profile.mobile;
    if (phoneFromProfile) {
      let phoneStr = phoneFromProfile.toString().trim();
      let foundCode = "+91";
      let phoneDigits = phoneStr;
      if (phoneStr.startsWith('+')) {
        const match = phoneStr.match(/^(\+\d+)(.*)/);
        if (match) { foundCode = match[1]; phoneDigits = match[2]; }
      }
      phoneDigits = phoneDigits.replace(/\D/g, '');
      if (phoneDigits.length > 10) phoneDigits = phoneDigits.slice(-10);
      setCountryCode(foundCode);
      setPhoneNumber(phoneDigits);
      const selectedCountry = countryOptions.find(opt => opt.value === foundCode);
      if (selectedCountry && selectedCountry.currency) setSelectedCurrency(selectedCountry.currency);
    } else {
      setCountryCode("+91");
      setPhoneNumber("");
    }
    setPhoneError("");
    setEmailError("");
    setHasAutoFilled(true);
    setAutoFillAttempted(true);
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
      const processedProducts = products.map(product => ({
        ...product,
        id: product.id || product.productId,
        cartItemId: product.cartItemId || `${product.id}_${product.brandId || 'nobrand'}_${product.selectedGrade || 'nograde'}_${Date.now()}`,
        name: product.name || `Product ${product.id}`,
        image: product.image,
        companyName: product.companyName || 'Unknown Company',
        brandName: product.brandName || 'General',
        selectedQuantity: product.selectedQuantity,
        selectedQuantityLabel: product.selectedQuantityLabel,
        quantityUnit: product.quantityUnit || 'kg',
        totalPackingCost: product.totalPackingCost,
        packingPricePerKg: product.packingPricePerKg,
        isRice: product.isRice,
        price: product.price
      }));
      setCartProducts(processedProducts);
      const initialConfigs = {};
      processedProducts.forEach(prod => {
        initialConfigs[prod.id] = { quantityOptions: getQuantityOptionsForProductFromData(prod) };
      });
      setCartProductConfigs(initialConfigs);
      const initialOrderQuantities = {};
      processedProducts.forEach(prod => { initialOrderQuantities[prod.cartItemId || prod.id] = 1; });
      setProductOrderQuantities(initialOrderQuantities);
    }
  }, [isOpen, products]);

  useEffect(() => {
    if (isOpen && profile && !hasAutoFilled) {
      setTimeout(() => handleAutoFillFromProfile(), 100);
    }
  }, [isOpen, profile]);

  useEffect(() => {
    calculateCartTotal();
  }, [cartProducts, cartProductConfigs, productOrderQuantities, selectedCurrency, brandingRequired, transportType]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) handleClose();
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
  // SUBMIT HANDLER (NO CIF)
  // ============================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    if (!fullName || !email || !country || !state || !city || !pincode || !brandingRequired || !selectedCurrency || !transportType) {
      alert("Please fill all required fields");
      return;
    }
    if (transportType === 'road' && (!pickupLocation.city || !pickupLocation.state || !pickupLocation.country || !deliveryLocation.city || !deliveryLocation.state || !deliveryLocation.country)) {
      alert("Please fill all pickup and delivery location fields for road transport.");
      return;
    }
    if (transportType === 'air' && (!airportOfLoading.country || !airportOfLoading.airportName || !airportOfDestination.country || !airportOfDestination.airportName)) {
      alert("Please fill all airport loading and destination fields for air freight.");
      return;
    }
    if (transportType === 'ocean' && (!portOfLoading.country || !portOfLoading.state || !portOfLoading.portName || !portOfDestination.country || !portOfDestination.state || !portOfDestination.portName)) {
      alert("Please fill all port loading and destination fields for ocean freight.");
      return;
    }
    if (!validatePhoneNumber(phoneNumber, countryCode) || !validateEmail(email)) {
      alert("Please enter valid phone number and email address.");
      return;
    }

    const fullPhoneNumber = `${countryCode}${phoneNumber}`;
    const displayPrices = getDisplayPrices();
    const currencySymbol = getCurrencySymbol();

    const cartItemsDetails = cartProducts.map(cartProduct => {
      const orderQuantity = productOrderQuantities[cartProduct.cartItemId || cartProduct.id] || 1;
      const analysis = analyzeProductData(cartProduct);
      const productSubtotal = analysis.priceValue * orderQuantity;
      const packingCost = cartProduct.totalPackingCost ? convertCurrency(parseFloat(cartProduct.totalPackingCost), 'INR', selectedCurrency) : 0;
      const displayQuantityLabel = cartProduct.selectedQuantityLabel || (analysis.packSize ? `${analysis.packSize}kg` : `${cartProduct.selectedQuantity || 1}${analysis.unit}`);
      return {
        productId: cartProduct.id,
        name: cartProduct.name,
        brandName: cartProduct.brandName,
        companyName: cartProduct.companyName,
        pricePerUnit: analysis.priceValue,
        priceDisplay: analysis.priceDisplay,
        orderQuantity,
        quantityDisplay: `${displayQuantityLabel}`,
        actualQuantity: (analysis.isPerPack ? 1 : (analysis.packSize || 1)) * orderQuantity,
        actualUnit: analysis.isPerPack ? 'pack' : analysis.unit,
        image: cartProduct.image,
        grade: cartProduct.selectedGradeDisplay || "Standard",
        packing: cartProduct.selectedPacking || "Standard",
        origin: analysis.origin,
        packagingInfo: analysis.packagingInfo,
        productType: analysis.productType,
        selectedQuantity: cartProduct.selectedQuantity,
        quantityUnit: analysis.unit,
        isRice: analysis.isRice,
        packingPricePerKg: cartProduct.packingPricePerKg,
        totalPackingCost: packingCost
      };
    });

    const totalQuantity = cartProducts.reduce((sum, prod) => {
      const orderQuantity = productOrderQuantities[prod.cartItemId || prod.id] || 1;
      return sum + orderQuantity;
    }, 0);

    const productSubtotal = cartProducts.reduce((sum, prod) => {
      const orderQuantity = productOrderQuantities[prod.cartItemId || prod.id] || 1;
      const analysis = analyzeProductData(prod);
      return sum + (analysis.priceValue * orderQuantity);
    }, 0);

    const packingTotal = cartProducts.reduce((sum, prod) => {
      if (prod.totalPackingCost) return sum + convertCurrency(parseFloat(prod.totalPackingCost), 'INR', selectedCurrency);
      return sum;
    }, 0);

    let transportDetails = {};
    if (transportType === 'road') transportDetails = { transportType: 'road', pickupLocation, deliveryLocation, vehicleType };
    else if (transportType === 'air') transportDetails = { transportType: 'air', airportOfLoading, airportOfDestination };
    else if (transportType === 'ocean') transportDetails = { transportType: 'ocean', portOfLoading, portOfDestination };

    const quoteData = {
      name: fullName, email, phone: fullPhoneNumber, country, state, city, pincode,
      cartItems: cartItemsDetails, itemCount: cartProducts.length, totalQuantity,
      productSubtotal, packingTotal, subtotal: productSubtotal + packingTotal,
      brandingRequired, currency: selectedCurrency, currencySymbol,
      transportDetails, transportCost: parseFloat(transportCost),
      priceBreakdown: {
        note: "This is an estimated bill. Final pricing may vary.",
        originalPrice: `Products: ${currencySymbol}${formatNumber(productSubtotal)}`,
        ...(packingTotal > 0 && { packingCost: `Packing Cost: ${currencySymbol}${formatNumber(packingTotal)}` }),
        subtotalWithPacking: `Subtotal (inc. Packing): ${currencySymbol}${formatNumber(productSubtotal + packingTotal)}`,
        itemCount: `${cartProducts.length} items in cart`,
        totalQuantity: `Total Quantity: ${totalQuantity} units`,
        transportTypeLine: `Transport Type: ${transportType.toUpperCase()}`,
        transportCostLine: `Transport Cost: ${displayPrices.transportCost}`,
        ...(brandingRequired === "Yes" && { brandingCostLine: `Branding/Custom Printing: ${displayPrices.brandingCost}` }),
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
      hasAutoFilled, profileUsed: !!profile, isCartOrder: true,
      selectedCurrency, currencyRates, currencySymbols
    };

    setIsSubmitting(true);
    try {
      const quoteId = await submitQuote(quoteData);
      let transportMessage = "";
      if (transportType === 'road') transportMessage = `- Transport: Road\n- Pickup: ${pickupLocation.city}, ${pickupLocation.state}, ${pickupLocation.country}\n- Delivery: ${deliveryLocation.city}, ${deliveryLocation.state}, ${deliveryLocation.country}\n${vehicleType ? `- Vehicle: ${vehicleType}` : ''}`;
      else if (transportType === 'air') transportMessage = `- Transport: Air Freight\n- Airport of Loading: ${airportOfLoading.airportName}, ${airportOfLoading.country}\n- Airport of Destination: ${airportOfDestination.airportName}, ${airportOfDestination.country}`;
      else if (transportType === 'ocean') transportMessage = `- Transport: Ocean Freight\n- Port of Loading: ${portOfLoading.portName}, ${portOfLoading.state}, ${portOfLoading.country}\n- Port of Destination: ${portOfDestination.portName}, ${portOfDestination.state}, ${portOfDestination.country}`;

      const packingCostMessage = packingTotal > 0 ? `\n- Packing Cost: ${currencySymbol}${formatNumber(packingTotal)}` : "";

      const message = `Hello! I want a quote for ${cartProducts.length} items from my cart:\n- Name: ${fullName}\n- Email: ${email}\n- Phone: ${fullPhoneNumber}\n- Country: ${country}\n- State: ${state}\n- City: ${city}\n- Pincode: ${pincode}\nItems in Cart:\n${cartProducts.map((prod, idx) => {
        const orderQty = productOrderQuantities[prod.cartItemId || prod.id] || 1;
        const analysis = analyzeProductData(prod);
        const productTotal = analysis.priceValue * orderQty;
        const displayQtyLabel = prod.selectedQuantityLabel || (analysis.packSize ? `${analysis.packSize}kg` : `${prod.selectedQuantity || 1}${analysis.unit}`);
        const brandInfo = prod.brandName && prod.brandName !== 'General' ? ` (Brand: ${prod.brandName})` : '';
        const gradeInfo = prod.selectedGradeDisplay ? ` (Grade: ${prod.selectedGradeDisplay})` : '';
        const packingInfo = prod.selectedPacking ? ` - ${prod.selectedPacking}` : '';
        const itemPackingCost = prod.totalPackingCost ? ` + Packing: ${currencySymbol}${convertCurrency(parseFloat(prod.totalPackingCost), 'INR', selectedCurrency).toFixed(2)}` : '';
        return `${idx + 1}. ${prod.name}${brandInfo}${gradeInfo} (${prod.companyName})${packingInfo} - ${displayQtyLabel} x ${orderQty} = ${currencySymbol}${productTotal.toFixed(2)}${itemPackingCost}`;
      }).join('\n')}\n${transportMessage}${packingCostMessage}\n- Brand Required: ${brandingRequired}\n- Selected Currency: ${selectedCurrency}\n- Estimated Bill:\n  • Products Total: ${displayPrices.productSubtotal}\n  ${packingTotal > 0 ? `• Packing Cost: ${displayPrices.packingTotal}` : ''}\n  • Subtotal (inc. Packing): ${displayPrices.subtotalWithPacking}\n  • Items: ${cartProducts.length} products\n  ${brandingRequired === "Yes" ? `• Branding/Custom Printing: ${displayPrices.brandingCost}` : ""}\n  • Transport Cost: ${displayPrices.transportCost}\n  • Final Total: ${displayPrices.finalTotalPrice}\n${additionalInfo ? `- Additional Info: ${additionalInfo}` : ""}\nThank you!`;
      window.open(`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
      alert(`✅ Quote #${quoteId.substring(0, 8)} submitted successfully! Check "My Orders" for details.`);
      setShowThankYou(true);
      if (onOrderSubmitted) onOrderSubmitted(quoteId);
    } catch (err) {
      console.error(err);
      alert(err.message || "Something went wrong. Please try again.");
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleThankYouClose = () => {
    setShowThankYou(false);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setBrandingRequired("No"); setAdditionalInfo("");
    setBrandingCost("0.00"); setTransportCost("0.00");
    setTotalPrice("0.00"); setTotalPackingCost("0.00");
    setTransportType("");
    setPickupLocation({ city: "", state: "", country: "" });
    setDeliveryLocation({ city: "", state: "", country: "" });
    setVehicleType("");
    setAirportOfLoading({ country: "", airportName: "" });
    setAirportOfDestination({ country: "", airportName: "" });
    setPortOfLoading({ country: "", state: "", portName: "" });
    setPortOfDestination({ country: "", state: "", portName: "" });
    setSubmitError("");
    setCartProducts([]);
    setCartProductConfigs({});
    setProductOrderQuantities({});
    setFullName(""); setEmail(""); setPhoneNumber(""); setCountryCode("+91");
    setCountry(""); setState(""); setCity(""); setPincode("");
    setPhoneError(""); setEmailError("");
    setHasAutoFilled(false); setAutoFillAttempted(false);
  };

  const handleClose = () => {
    if (showThankYou) return;
    resetForm();
    setShowThankYou(false);
    onClose();
  };

  if (!isOpen) return null;

  const currencySymbol = getCurrencySymbol();
  const displayPrices = getDisplayPrices();
  const showRoad = shouldShowRoadTransport();

  const cartProductSubtotal = cartProducts.reduce((sum, prod) => {
    const orderQty = productOrderQuantities[prod.cartItemId || prod.id] || 1;
    const analysis = analyzeProductData(prod);
    return sum + (analysis.priceValue * orderQty);
  }, 0);

  const cartPackingTotal = cartProducts.reduce((sum, prod) => {
    if (prod.totalPackingCost) return sum + convertCurrency(parseFloat(prod.totalPackingCost), 'INR', selectedCurrency);
    return sum;
  }, 0);

  const cartSubtotalWithPacking = cartProductSubtotal + cartPackingTotal;
  const cartTotalItems = cartProducts.reduce((sum, prod) => {
    const orderQty = productOrderQuantities[prod.cartItemId || prod.id] || 1;
    return sum + orderQty;
  }, 0);

  return (
    <>
      <div className="buy-modal-overlay checkout-modal">
        <div className="buy-modal-container" ref={modalRef}>
          <button className="buy-modal-close-btn" onClick={handleClose}>&times;</button>
          <div className="buy-modal-header">
            <h2 className="buy-modal-title">Checkout ({cartProducts.length} Items) - {selectedCurrency}</h2>
            <p className="buy-modal-subtitle">Fill out the form below to get a quote for {cartProducts.length} items</p>
            <div className="product-type-info"><small>🎁 Multiple Products Order</small></div>
          </div>
          <div className="buy-modal-body">
            <div className="modal-layout">
              <div className="form-section-container" ref={formContainerRef}>
                <form onSubmit={handleSubmit}>
                  {profile && !hasAutoFilled && <div className="auto-fill-section"><button type="button" className="auto-fill-btn" onClick={handleAutoFillFromProfile}>🔄 Auto-fill from Profile</button><small className="auto-fill-note">Click to auto-fill your information from your profile.</small></div>}
                  {submitError && <div className="submit-error-section"><div className="error-message alert-error">⚠️ {submitError}</div></div>}

                  <section className="form-section">
                    <h3 className="section-title"><Package size={20} className="section-title-icon" /> Selected Products ({selectedCurrency})</h3>
                    {availableCurrencies.length > 1 && <div className="form-group mb-3"><label className="form-label">Display Currency</label><select value={selectedCurrency} onChange={handleCurrencyChange} className="form-select">{availableCurrencies.map(curr => <option key={curr.code} value={curr.code}>{curr.symbol} {curr.code}</option>)}</select></div>}

                    <div className="standard-products-display">
                      {cartProducts.map((cartProduct, idx) => {
                        const orderQuantity = productOrderQuantities[cartProduct.cartItemId || cartProduct.id] || 1;
                        const analysis = analyzeProductData(cartProduct);
                        const productSubtotal = analysis.priceValue * orderQuantity;
                        const packingCost = cartProduct.totalPackingCost ? convertCurrency(parseFloat(cartProduct.totalPackingCost), 'INR', selectedCurrency) : 0;
                        const displayQuantityLabel = cartProduct.selectedQuantityLabel || (analysis.packSize ? `${analysis.packSize}kg` : `${cartProduct.selectedQuantity || 1}${analysis.unit}`);
                        const isRiceProduct = analysis.isRice;
                        return (
                          <div key={cartProduct.cartItemId || cartProduct.id} className="standard-product-item">
                            <div className="standard-product-image">
                              <div className="order-quantity-buttons">
                                <button type="button" className="order-quantity-btn" onClick={() => handleDecreaseOrderQuantity(cartProduct.cartItemId || cartProduct.id)}><Minus size={16} /></button>
                                <span className="order-quantity-display">{orderQuantity}</span>
                                <button type="button" className="order-quantity-btn" onClick={() => handleIncreaseOrderQuantity(cartProduct.cartItemId || cartProduct.id)}><Plus size={16} /></button>
                              </div>
                              <img src={cartProduct.image} alt={cartProduct.name} onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&auto=format&fit=crop&q=60'} />
                              <div className="product-badge">{cartProduct.companyName === 'Nut Walker' ? '🥜 Dry Fruits' : cartProduct.companyName === 'Heritage' ? '🌾 Heritage' : cartProduct.companyName === 'Akil Drinks' ? '🥤 Beverages' : cartProduct.companyName === 'SIEA' ? '🍚 Rice' : isRiceProduct ? '🍚 Rice' : '⭐ Premium'}</div>
                            </div>
                            <div className="standard-product-details">
                              <div className="standard-product-header">
                                <h4 className="standard-product-name">{cartProduct.name}</h4>
                                <span className="standard-product-brand">{cartProduct.companyName}</span>
                                {cartProduct.brandName && cartProduct.brandName !== 'General' && <span className="standard-product-brand-name">Brand: {cartProduct.brandName}</span>}
                                {analysis.origin && <span className="standard-product-origin">Origin: {analysis.origin}</span>}
                              </div>
                              <div className="standard-product-price-section">
                                <div className="standard-price-display"><span className="standard-price-amount">{analysis.priceDisplay}</span><span className="standard-price-unit">each</span></div>
                                <div className="standard-config-display">
                                  {cartProduct.selectedGradeDisplay && <div className="config-row readonly-config"><span className="config-label">Selected Grade:</span><span className="config-value-readonly">{cartProduct.selectedGradeDisplay} - {currencySymbol}{cartProduct.selectedGradePrice || analysis.priceValue}/{analysis.unit}</span></div>}
                                  {cartProduct.selectedPacking && <div className="config-row readonly-config"><span className="config-label">Selected Packing:</span><span className="config-value-readonly">{cartProduct.selectedPacking}</span></div>}
                                  {cartProduct.selectedQuantity && <div className="config-row readonly-config"><span className="config-label">Selected Quantity:</span><span className="config-value-readonly">{displayQuantityLabel}</span></div>}
                                </div>
                                {packingCost > 0 && (
                                  <div className="packing-cost-display checkout-packing-cost">
                                    <span className="packing-cost-label">Packing Cost: </span>
                                    <span className="packing-cost-value">{currencySymbol}{packingCost.toFixed(2)}</span>
                                    {cartProduct.packingPricePerKg && <span className="packing-cost-note">({cartProduct.packingPricePerKg}/kg × {displayQuantityLabel})</span>}
                                  </div>
                                )}
                                <div className="standard-total-price"><span className="total-label">Product Total ({orderQuantity} × {displayQuantityLabel}):</span><span className="total-amount">{currencySymbol}{productSubtotal.toFixed(2)}</span></div>
                                {packingCost > 0 && <div className="standard-total-price item-total-with-packing"><span className="total-label">Item Total (inc. Packing):</span><span className="total-amount">{currencySymbol}{(productSubtotal + packingCost).toFixed(2)}</span></div>}
                              </div>
                              <div className="standard-product-meta">
                                {analysis.packagingInfo && <div className="meta-item"><span className="meta-label">Packaging:</span><span className="meta-value">{analysis.packagingInfo}</span></div>}
                                {cartProduct.brandName && cartProduct.brandName !== 'General' && <div className="meta-item"><span className="meta-label">Brand:</span><span className="meta-value">{cartProduct.brandName}</span></div>}
                                <div className="meta-item"><span className="meta-label">Order Qty:</span><span className="meta-value">{orderQuantity} units</span></div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div className="cart-summary-standard">
                        <div className="summary-row"><span className="summary-label">Total Items:</span><span className="summary-value">{cartProducts.length}</span></div>
                        <div className="summary-row"><span className="summary-label">Total Quantity:</span><span className="summary-value">{cartTotalItems} units</span></div>
                        <div className="summary-row"><span className="summary-label">Products Subtotal:</span><span className="summary-value">{currencySymbol}{cartProductSubtotal.toFixed(2)}</span></div>
                        {cartPackingTotal > 0 && <div className="summary-row packing-summary"><span className="summary-label">Total Packing Cost:</span><span className="summary-value">+ {currencySymbol}{cartPackingTotal.toFixed(2)}</span></div>}
                        <div className="summary-row total"><span className="summary-label">Subtotal (inc. Packing):</span><span className="summary-value">{currencySymbol}{cartSubtotalWithPacking.toFixed(2)}</span></div>
                      </div>
                    </div>
                  </section>

                  <section className="form-section">
                    <h3 className="section-title">Contact Information</h3>
                    <div className="form-group"><label className="form-label">Full Name *</label><input type="text" placeholder="Enter your full name" value={fullName} onChange={handleFullNameChange} required className="form-input" />{hasAutoFilled && <div className="profile-autofill-note"><small>✓ Auto-filled from profile</small></div>}</div>
                    <div className="form-group"><label className="form-label">Email Address *</label><input type="email" placeholder="your.email@example.com" value={email} onChange={handleEmailChange} required className="form-input" />{hasAutoFilled && <div className="profile-autofill-note"><small>✓ Auto-filled from profile</small></div>}{emailError && <div className="error-message">{emailError}</div>}</div>
                    <div className="form-group"><label className="form-label">Country *</label><input type="text" placeholder="Enter your country (e.g., India, USA, UAE)" value={country} onChange={handleCountryNameChange} required className="form-input" />{hasAutoFilled && <div className="profile-autofill-note"><small>✓ Auto-filled from profile</small></div>}<small className="form-text text-muted d-block mt-1">Enter your country name</small></div>
                    <div className="form-group"><label className="form-label">State/Province *</label><input type="text" placeholder="Enter your state/province" value={state} onChange={handleStateChangeInput} required className="form-input" />{hasAutoFilled && <div className="profile-autofill-note"><small>✓ Auto-filled from profile</small></div>}</div>
                    <div className="form-group"><label className="form-label">City/Town *</label><input type="text" placeholder="Enter your city/town" value={city} onChange={handleCityChange} required className="form-input" />{hasAutoFilled && <div className="profile-autofill-note"><small>✓ Auto-filled from profile</small></div>}</div>
                    <div className="form-group"><label className="form-label">Pincode/ZIP *</label><input type="text" placeholder="Enter your pincode/ZIP" value={pincode} onChange={handlePincodeChange} required className="form-input" />{hasAutoFilled && <div className="profile-autofill-note"><small>✓ Auto-filled from profile</small></div>}</div>
                    <div className="form-group"><label className="form-label">Phone Number *</label><div className="phone-input-group"><select value={countryCode} onChange={handleCountryChange} className="country-code-select">{countryOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.flag} {opt.value} ({opt.name})</option>)}</select><input type="tel" placeholder={`Phone number (${getCurrentCountry()?.length || 10} digits)`} value={phoneNumber} onChange={handlePhoneChange} maxLength={getCurrentCountry()?.length || 10} required className="form-input phone-input" /></div>{hasAutoFilled && <div className="profile-autofill-note"><small>✓ Auto-filled from profile</small></div>}{phoneError && <div className="error-message">{phoneError}</div>}</div>
                    {hasAutoFilled && <div className="auto-fill-confirmation"><Check size={18} /><span>Profile data has been auto-filled successfully!</span></div>}
                  </section>

                  <section className="form-section">
                    <h3 className="section-title">Transport Details</h3>
                    <div className="form-group"><label className="form-label">Select Transport Type *</label><select value={transportType} onChange={handleTransportTypeChange} required className="form-select"><option value="">Select Transport Type</option>{showRoad && <option value="road">🚛 Road Transport</option>}<option value="air">✈️ Air Freight</option><option value="ocean">🚢 Ocean Freight</option></select>{!showRoad && country && <small className="transport-note">⚡ Road transport is only available for India. Showing international options.</small>}</div>
                    {transportType === 'road' && (<><div className="form-group"><label className="form-label">Pickup Location *</label><div className="transport-location-group"><input type="text" placeholder="City" value={pickupLocation.city} onChange={(e) => handlePickupLocationChange('city', e.target.value)} className="form-input" required /><input type="text" placeholder="State" value={pickupLocation.state} onChange={(e) => handlePickupLocationChange('state', e.target.value)} className="form-input" required /><input type="text" placeholder="Country" value={pickupLocation.country} onChange={(e) => handlePickupLocationChange('country', e.target.value)} className="form-input" required /></div></div><div className="form-group"><label className="form-label">Delivery Location *</label><div className="transport-location-group"><input type="text" placeholder="City" value={deliveryLocation.city} onChange={(e) => handleDeliveryLocationChange('city', e.target.value)} className="form-input" required /><input type="text" placeholder="State" value={deliveryLocation.state} onChange={(e) => handleDeliveryLocationChange('state', e.target.value)} className="form-input" required /><input type="text" placeholder="Country" value={deliveryLocation.country} onChange={(e) => handleDeliveryLocationChange('country', e.target.value)} className="form-input" required /></div></div><div className="form-group"><label className="form-label">Vehicle Type (Optional)</label><select value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} className="form-select"><option value="">Select Vehicle Type (Optional)</option>{vehicleOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select></div></>)}
                    {transportType === 'air' && (<><div className="form-group"><label className="form-label">Airport of Loading *</label><div className="airport-group"><input type="text" placeholder="Country" value={airportOfLoading.country} onChange={(e) => handleAirportLoadingChange('country', e.target.value)} className="form-input" required /><input type="text" placeholder="Airport Name" value={airportOfLoading.airportName} onChange={(e) => handleAirportLoadingChange('airportName', e.target.value)} className="form-input" required /></div></div><div className="form-group"><label className="form-label">Airport of Destination *</label><div className="airport-group"><input type="text" placeholder="Country" value={airportOfDestination.country} onChange={(e) => handleAirportDestinationChange('country', e.target.value)} className="form-input" required /><input type="text" placeholder="Airport Name" value={airportOfDestination.airportName} onChange={(e) => handleAirportDestinationChange('airportName', e.target.value)} className="form-input" required /></div></div></>)}
                    {transportType === 'ocean' && (<><div className="form-group"><label className="form-label">Port of Loading *</label><div className="transport-selection-group"><div className="transport-row"><div className="transport-column"><label className="form-label">Country</label><input type="text" placeholder="Enter country" value={portOfLoading.country} onChange={(e) => handlePortOfLoadingChange('country', e.target.value)} className="form-input" required /></div><div className="transport-column"><label className="form-label">State</label><input type="text" placeholder="Enter state" value={portOfLoading.state} onChange={(e) => handlePortOfLoadingChange('state', e.target.value)} className="form-input" required /></div><div className="transport-column"><label className="form-label">Port Name</label><input type="text" placeholder="Enter port name" value={portOfLoading.portName} onChange={(e) => handlePortOfLoadingChange('portName', e.target.value)} className="form-input" required /></div></div></div></div><div className="form-group"><label className="form-label">Port of Destination *</label><div className="transport-selection-group"><div className="transport-row"><div className="transport-column"><label className="form-label">Country</label><input type="text" placeholder="Enter country" value={portOfDestination.country} onChange={(e) => handlePortOfDestinationChange('country', e.target.value)} className="form-input" required /></div><div className="transport-column"><label className="form-label">State</label><input type="text" placeholder="Enter state" value={portOfDestination.state} onChange={(e) => handlePortOfDestinationChange('state', e.target.value)} className="form-input" required /></div><div className="transport-column"><label className="form-label">Port Name</label><input type="text" placeholder="Enter port name" value={portOfDestination.portName} onChange={(e) => handlePortOfDestinationChange('portName', e.target.value)} className="form-input" required /></div></div></div></div></>)}
                    {transportType && <div className="transport-price-info"><small>Transport Cost Estimate: {displayPrices.transportCost}{transportType === 'road' && ' (Road transport - address to address)'}{transportType === 'air' && ' (Air freight - airport to airport)'}{transportType === 'ocean' && ' (Ocean freight - port to port)'}</small></div>}
                  </section>

                  <section className="form-section">
                    <h3 className="section-title">Order Requirements</h3>
                    <div className="form-group"><label className="form-label">Brand Required (If Any) *</label><select value={brandingRequired} onChange={handleBrandingChange} required className="form-select"><option value="No">No</option><option value="Yes">Yes</option></select><div className="branding-info"><small>Add your logo/branding to the packaging - Additional charge: {currencySymbol}35 per order</small>{brandingRequired === "Yes" && <div className="branding-cost-preview"><small>Branding/custom printing cost: {displayPrices.brandingCost}</small></div>}</div></div>
                    <div className="form-group"><label className="form-label">Additional Information</label><textarea placeholder="Enter any additional information here" value={additionalInfo} onChange={(e) => setAdditionalInfo(e.target.value)} className="form-textarea" rows="4" /></div>
                  </section>

                  <div className="form-actions">
                    <button type="submit" className="submit-btn" disabled={isSubmitting}>
                      {isSubmitting ? <span className="btn-loading"><span className="btn-spinner"></span> Submitting...</span> : `Request Quote(Include CIF)`}
                    </button>
                    <button type="button" onClick={handleClose} className="cancel-btn">Cancel</button>
                  </div>
                </form>
              </div>

              <div className="estimate-section-container" ref={estimateContainerRef}>
                <div className="price-breakdown-section">
                  <h4 className="price-breakdown-title">Cart Summary ({cartProducts.length} Items) - {selectedCurrency}</h4>
                  <div className="estimate-note"><small>This is an estimated bill. Final pricing may vary.</small></div>
                  <div className="price-breakdown-grid">
                    <div className="price-item"><span className="price-label">Items in Cart:</span><span className="price-value">{cartProducts.length} products</span></div>
                    <div className="price-item"><span className="price-label">Total Quantity:</span><span className="price-value">{cartTotalItems} units</span></div>
                    {transportType && <div className="price-item transport-summary"><span className="price-label">Transport Type:</span><span className="price-value">{transportType === 'road' ? '🚛 Road' : transportType === 'air' ? '✈️ Air' : '🚢 Ocean'}</span></div>}
                    {transportType === 'road' && pickupLocation.city && <div className="price-item"><span className="price-label">Route:</span><span className="price-value">{pickupLocation.city} → {deliveryLocation.city}</span></div>}
                    {transportType === 'air' && airportOfLoading.airportName && <div className="price-item"><span className="price-label">Route:</span><span className="price-value">{airportOfLoading.airportName} → {airportOfDestination.airportName}</span></div>}
                    {transportType === 'ocean' && portOfLoading.portName && <div className="price-item"><span className="price-label">Route:</span><span className="price-value">{portOfLoading.portName} → {portOfDestination.portName}</span></div>}
                    <div className="price-item"><span className="price-label">Products Subtotal:</span><span className="price-value">{displayPrices.productSubtotal}</span></div>
                    {displayPrices.packingTotal !== "Not Required" && <div className="price-item packing-cost-item"><span className="price-label">Packing Cost:</span><span className="price-value price-value-orange">{displayPrices.packingTotal}</span></div>}
                    {displayPrices.packingTotal !== "Not Required" && <div className="price-item"><span className="price-label">Subtotal (inc. Packing):</span><span className="price-value">{displayPrices.subtotalWithPacking}</span></div>}
                    {brandingRequired === "Yes" && <div className="price-item branding-costs"><span className="price-label">Branding/Custom Printing:</span><span className="price-value">{displayPrices.brandingCost}</span></div>}
                    {transportType && <div className="price-item transport-costs"><span className="price-label">Transport Cost:</span><span className="price-value">{displayPrices.transportCost}</span></div>}
                    <div className="price-item final-total"><span className="price-label">Final Total:</span><span className="price-value">{displayPrices.finalTotalPrice}</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ThankYouPopup isOpen={showThankYou} onClose={handleThankYouClose} />
    </>
  );
};

export default CheckoutModal;