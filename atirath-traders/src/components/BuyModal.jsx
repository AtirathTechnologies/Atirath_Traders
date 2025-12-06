import React, { useState, useEffect, useRef } from "react";
import ThankYouPopup from "../components/ThankYouPopup";
import { submitQuote } from "../firebase";
import { 
  varietyGrades, 
  gradePrices, 
  getPackingOptions, 
  getQuantityOptions, 
  transportData,
  getPackingUnit,
  getAvailableGrades,
  stateOptions,
  getPortOptions,
  getTransportPrice,
  getUnitType
} from "../data/ProductData";

const BuyModal = ({ isOpen, onClose, product, profile, onOrderSubmitted }) => {
  // State declarations
  const [grade, setGrade] = useState("");
  const [packing, setPacking] = useState("");
  const [quantity, setQuantity] = useState("");
  const [cifRequired, setCifRequired] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [showThankYou, setShowThankYou] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gradePrice, setGradePrice] = useState("0.00");
  const [packingPrice, setPackingPrice] = useState("0.00");
  const [quantityPrice, setQuantityPrice] = useState("0.00");
  const [totalPrice, setTotalPrice] = useState("0.00");
  const [currency, setCurrency] = useState("INR");
  const [brandingRequired, setBrandingRequired] = useState("");
  const [shippingCost, setShippingCost] = useState("0.00");
  const [insuranceCost, setInsuranceCost] = useState("0.00");
  const [taxes, setTaxes] = useState("0.00");
  const [exchangeRates, setExchangeRates] = useState({});
  const [isLoadingRates, setIsLoadingRates] = useState(false);
  const [baseProductPrice, setBaseProductPrice] = useState("0.00");
  const [customQuantity, setCustomQuantity] = useState("");
  const [brandingCost, setBrandingCost] = useState("0.00");
  const [transportCost, setTransportCost] = useState("0.00");
  
  // New state for transport selection
  const [selectedState, setSelectedState] = useState("");
  const [selectedPort, setSelectedPort] = useState("");
  const [portOptions, setPortOptions] = useState([]);
  const [transportPrice, setTransportPrice] = useState("0-0");
  
  const modalRef = useRef(null);
  const formContainerRef = useRef(null);
  const estimateContainerRef = useRef(null);

  // Constants
  const countryOptions = [
    { value: "+91", flag: "🇮🇳", name: "India", length: 10, currency: "INR" },
    { value: "+1", flag: "🇺🇸", name: "USA", length: 10, currency: "USD" },
    { value: "+44", flag: "🇬🇧", name: "UK", length: 10, currency: "GBP" },
    { value: "+971", flag: "🇦🇪", name: "UAE", length: 9, currency: "AED" },
    { value: "+61", flag: "🇦🇺", name: "Australia", length: 9, currency: "AUD" },
    { value: "+98", flag: "🇮🇷", name: "Iran", length: 10, currency: "IRR" },
  ];

  const currencyOptions = [
    { value: "INR", symbol: "₹", name: "Indian Rupee" },
    { value: "USD", symbol: "$", name: "US Dollar" },
    { value: "EUR", symbol: "€", name: "Euro" },
    { value: "GBP", symbol: "£", name: "British Pound" },
    { value: "AED", symbol: "د.إ", name: "UAE Dirham" },
    { value: "SAR", symbol: "﷼", name: "Saudi Riyal" },
    { value: "CAD", symbol: "C$", name: "Canadian Dollar" },
    { value: "AUD", symbol: "A$", name: "Australian Dollar" },
    { value: "JPY", symbol: "¥", name: "Japanese Yen" },
    { value: "CNY", symbol: "¥", name: "Chinese Yuan" }
  ];

  // Extract base price from product price string and convert to number
  const extractBasePrice = (priceString) => {
    if (!priceString) return 0;
    
    try {
      const priceMatch = priceString.match(/(\d+(?:,\d+)*(?:\.\d+)?)/);
      if (priceMatch) {
        const priceValue = parseFloat(priceMatch[1].replace(/,/g, ''));
        return priceValue;
      }
      
      return 0;
    } catch (error) {
      console.error('Error extracting price:', error);
      return 0;
    }
  };

  // Get quantity options based on product type
  const getQuantityOptionsForProduct = () => {
    const productType = getProductType();
    const productName = product?.name?.toLowerCase() || '';
    return getQuantityOptions(productType, productName);
  };

  // Product-specific packing options
  const getPackingOptionsForProduct = () => {
    const productType = getProductType();
    const productName = product?.name?.toLowerCase() || '';
    return getPackingOptions(productType, productName);
  };

  // Helper functions
  const getCurrencySymbol = () => {
    const selectedCurrency = currencyOptions.find(curr => curr.value === currency);
    return selectedCurrency ? selectedCurrency.symbol : "₹";
  };

  const getCurrentCountry = () => countryOptions.find((opt) => opt.value === countryCode);

  // IMPROVED PRODUCT TYPE DETECTION
  const getProductType = () => {
    if (!product) return 'default';
    
    if (product.category) {
      return product.category;
    }
    
    const productName = product.name?.toLowerCase() || '';
    
    if (productName.includes('oil') || 
        productName.includes('sunflower') || 
        productName.includes('olive') || 
        productName.includes('coconut') ||
        productName.includes('mustard') ||
        productName.includes('groundnut') ||
        productName.includes('soybean') ||
        productName.includes('palm')) {
      return 'oil';
    }
    
    if (productName.includes('rice') || 
        productName.includes('basmati') || 
        product.variety) {
      return 'rice';
    }
    
    if (productName.includes('dal') || 
        productName.includes('chana') || 
        productName.includes('moong') || 
        productName.includes('masoor') ||
        productName.includes('urad') ||
        productName.includes('toor') ||
        productName.includes('lentil') ||
        productName.includes('bean') ||
        productName.includes('pulse')) {
      return 'pulses';
    }
    
    if (productName.includes('spice') || 
        productName.includes('turmeric') || 
        productName.includes('chilli') || 
        productName.includes('pepper') ||
        productName.includes('cumin') ||
        productName.includes('coriander') ||
        productName.includes('cardamom') ||
        productName.includes('clove') ||
        productName.includes('cinnamon')) {
      return 'spices';
    }
    
    if (productName.includes('tea') || 
        productName.includes('green tea') || 
        productName.includes('black tea') || 
        productName.includes('oolong') ||
        productName.includes('chai')) {
      return 'tea';
    }
    
    if (productName.includes('almond') || 
        productName.includes('cashew') || 
        productName.includes('raisin') || 
        productName.includes('walnut') ||
        productName.includes('pistachio') ||
        productName.includes('dry fruit') ||
        productName.includes('nut')) {
      return 'dryfruits';
    }
    
    if (productName.includes('cement') || 
        productName.includes('steel') || 
        productName.includes('brick') || 
        productName.includes('construction') ||
        productName.includes('tmt') ||
        productName.includes('rod') ||
        productName.includes('sand') ||
        productName.includes('gravel') ||
        productName.includes('concrete') ||
        productName.includes('block') ||
        productName.includes('wood') ||
        productName.includes('pipe') ||
        productName.includes('tile') ||
        productName.includes('wire') ||
        productName.includes('marble') ||
        productName.includes('paint') ||
        productName.includes('window') ||
        productName.includes('glass') ||
        productName.includes('aggregate') ||
        productName.includes('aluminum') ||
        productName.includes('roof') ||
        productName.includes('bitumen') ||
        productName.includes('hardware') ||
        productName.includes('plywood') ||
        productName.includes('door') ||
        productName.includes('putty') ||
        productName.includes('insulation') ||
        productName.includes('ceiling')) {
      return 'construction';
    }
    
    if (productName.includes('apple') || 
        productName.includes('banana') || 
        productName.includes('orange') || 
        productName.includes('mango') ||
        productName.includes('fruit')) {
      return 'fruits';
    }
    
    if (productName.includes('vegetable') || 
        productName.includes('potato') || 
        productName.includes('tomato') || 
        productName.includes('onion') ||
        productName.includes('carrot') ||
        productName.includes('spinach')) {
      return 'vegetables';
    }
    
    if (productName.includes('juice') || 
        productName.includes('soda') || 
        productName.includes('drink') || 
        productName.includes('beverage')) {
      return 'beverages';
    }
    
    if (productName.includes('phone') || 
        productName.includes('laptop') || 
        productName.includes('tablet') || 
        productName.includes('gadget') ||
        productName.includes('electronic')) {
      return 'gadgets';
    }
    
    if (productName.includes('shirt') || 
        productName.includes('dress') || 
        productName.includes('pants') || 
        productName.includes('jeans') ||
        productName.includes('clothing') ||
        productName.includes('apparel')) {
      return 'clothing';
    }
    
    if (productName.includes('chocolate') || 
        productName.includes('cocoa') || 
        productName.includes('dark chocolate') || 
        productName.includes('milk chocolate')) {
      return 'chocolate';
    }
    
    if (productName.includes('perfume') || 
        productName.includes('fragrance') || 
        productName.includes('cologne') || 
        productName.includes('scent')) {
      return 'perfume';
    }
    
    if (productName.includes('flower') || 
        productName.includes('rose') || 
        productName.includes('lily') || 
        productName.includes('tulip') ||
        productName.includes('orchid') ||
        productName.includes('bouquet')) {
      return 'flowers';
    }
    
    return 'default';
  };

  // Get available grades using the imported function
  const getAvailableGradesForProduct = () => {
    const productType = getProductType();
    return getAvailableGrades(productType, product);
  };

  // Calculate shipping cost based on quantity and product type
  const calculateShippingCost = (quantityValue, productType, productValue, customQty = null) => {
    if (!quantityValue) return 0;
    
    let actualQuantity = 0;
    
    if (quantityValue === "custom") {
      actualQuantity = parseFloat(customQty) || parseFloat(customQuantity) || 0;
    } else {
      const quantityOptionsList = getQuantityOptionsForProduct();
      const selectedQuantity = quantityOptionsList.find(q => q.value === quantityValue);
      if (!selectedQuantity) return 0;
      actualQuantity = selectedQuantity.actualQuantity;
    }
    
    if (actualQuantity <= 0) return 0;
    
    let baseRate = 0;
    
    const shippingRates = {
      oil: 1.5,
      rice: 2.5,
      pulses: 2,
      spices: 3,
      dryfruits: 3.5,
      tea: 4,
      construction: 1,
      fruits: 5,
      vegetables: 4.5,
      beverages: 0.8,
      gadgets: 50,
      clothing: 20,
      chocolate: 2.5,
      perfume: 30,
      flowers: 1,
      default: 2
    };
    
    baseRate = shippingRates[productType] || shippingRates.default;
    return Math.max(actualQuantity * baseRate, productValue * 0.02);
  };

  // Calculate insurance cost
  const calculateInsuranceCost = (productValue) => {
    return productValue * 0.005;
  };

  // Calculate taxes and duties
  const calculateTaxes = (subtotal) => {
    return subtotal * 0.03;
  };

  // Calculate branding cost
  const calculateBrandingCost = (brandingRequiredValue) => {
    if (brandingRequiredValue === "Yes") {
      return 35;
    }
    return 0;
  };

  // Calculate transport cost
  const calculateTransportCost = (quantityValue, transportPriceRange, unitType, customQty = null) => {
    if (!quantityValue || !transportPriceRange || transportPriceRange === "0-0") {
      return 0;
    }
    
    let actualQuantity = 0;
    
    if (quantityValue === "custom") {
      actualQuantity = parseFloat(customQty) || parseFloat(customQuantity) || 0;
    } else {
      const quantityOptionsList = getQuantityOptionsForProduct();
      const selectedQuantity = quantityOptionsList.find(q => q.value === quantityValue);
      if (!selectedQuantity) return 0;
      actualQuantity = selectedQuantity.actualQuantity;
    }
    
    if (actualQuantity <= 0) return 0;
    
    const [minPrice, maxPrice] = transportPriceRange.split('-').map(price => parseFloat(price.trim()));
    
    if (isNaN(minPrice) || isNaN(maxPrice)) return 0;
    
    const averagePrice = (minPrice + maxPrice) / 2;
    
    return actualQuantity * averagePrice;
  };

  // Format number with commas
  const formatNumber = (num) => {
    return parseFloat(num).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Convert INR to selected currency
  const convertToCurrency = (inrAmount) => {
    if (currency === 'INR') return parseFloat(inrAmount);
    
    const exchangeRates = {
      USD: 0.012,
      EUR: 0.011,
      GBP: 0.0095,
      AED: 0.044,
      SAR: 0.045,
      CAD: 0.016,
      AUD: 0.018,
      JPY: 1.8,
      CNY: 0.087,
      IRR: 504.5
    };
    
    const rate = exchangeRates[currency] || 1;
    return parseFloat(inrAmount) * rate;
  };

  // Convert from selected currency back to INR for database storage
  const convertFromCurrency = (amount, fromCurrency) => {
    if (fromCurrency === 'INR') return parseFloat(amount);
    
    const exchangeRates = {
      USD: 83.33,
      EUR: 90.91,
      GBP: 105.26,
      AED: 22.73,
      SAR: 22.22,
      CAD: 62.5,
      AUD: 55.56,
      JPY: 0.556,
      CNY: 11.49,
      IRR: 0.00198
    };
    
    const rate = exchangeRates[fromCurrency] || 1;
    return parseFloat(amount) / rate;
  };

  // Get price per unit based on product type
  const getPricePerUnit = () => {
    const productType = getProductType();
    const basePrice = parseFloat(baseProductPrice);
    
    if (productType === 'rice') {
      return basePrice / 100;
    }
    
    if (productType === 'construction') {
      const productName = product?.name?.toLowerCase() || '';
      
      if (productName.includes('cement')) {
        return basePrice / 50;
      }
      
      if (productName.includes('sand') || productName.includes('gravel') || productName.includes('aggregate')) {
        return basePrice / 1000;
      }
      
      return basePrice;
    }
    
    return basePrice;
  };

  // Calculate quantity price based on selected quantity and unit
  const calculateQuantityPrice = (quantityValue, gradeMultiplier, customQty = null) => {
    const pricePerUnit = getPricePerUnit();
    const productType = getProductType();
    
    let actualQuantity = 0;
    
    if (quantityValue === "custom") {
      actualQuantity = parseFloat(customQty) || parseFloat(customQuantity) || 0;
    } else {
      const quantityOptionsList = getQuantityOptionsForProduct();
      const selectedQuantity = quantityOptionsList.find(q => q.value === quantityValue);
      if (!selectedQuantity) return 0;
      actualQuantity = selectedQuantity.actualQuantity;
    }
    
    if (actualQuantity <= 0) return 0;
    
    if (productType === 'rice') {
      return actualQuantity * pricePerUnit * gradeMultiplier;
    }
    
    if (productType === 'construction') {
      return actualQuantity * pricePerUnit * gradeMultiplier;
    }
    
    return actualQuantity * pricePerUnit * gradeMultiplier;
  };

  // Price calculation
  const calculatePrices = () => {
    let gradePriceValue = 0;
    let packingPriceValue = 0;
    let quantityPriceValue = 0;
    let shippingCostValue = 0;
    let insuranceCostValue = 0;
    let taxesValue = 0;
    let brandingCostValue = 0;
    let transportCostValue = 0;

    const pricePerUnit = getPricePerUnit();

    let gradeMultiplier = 1;
    if (grade) {
      const availableGrades = getAvailableGradesForProduct();
      const selectedGrade = availableGrades.find(g => g.value === grade);
      if (selectedGrade) {
        gradeMultiplier = parseFloat(selectedGrade.price);
      }
    }

    gradePriceValue = pricePerUnit * gradeMultiplier;

    if (packing) {
      const selectedPacking = getPackingOptionsForProduct().find(p => p.value === packing);
      if (selectedPacking) {
        packingPriceValue = parseFloat(selectedPacking.price);
      }
    }

    quantityPriceValue = calculateQuantityPrice(quantity, gradeMultiplier);

    brandingCostValue = calculateBrandingCost(brandingRequired);

    const productType = getProductType();
    const productName = product?.name?.toLowerCase() || '';
    const unitType = getUnitType(productType, productName);
    transportCostValue = calculateTransportCost(quantity, transportPrice, unitType, customQuantity);

    if (cifRequired === "Yes") {
      shippingCostValue = calculateShippingCost(quantity, productType, quantityPriceValue, customQuantity);
      insuranceCostValue = calculateInsuranceCost(quantityPriceValue);
      taxesValue = calculateTaxes(quantityPriceValue + packingPriceValue + brandingCostValue + transportCostValue);
    }

    const subtotal = quantityPriceValue + packingPriceValue + brandingCostValue + shippingCostValue + insuranceCostValue + taxesValue + transportCostValue;

    setGradePrice(convertToCurrency(gradePriceValue).toFixed(2));
    setPackingPrice(convertToCurrency(packingPriceValue).toFixed(2));
    setQuantityPrice(convertToCurrency(quantityPriceValue).toFixed(2));
    setShippingCost(convertToCurrency(shippingCostValue).toFixed(2));
    setInsuranceCost(convertToCurrency(insuranceCostValue).toFixed(2));
    setTaxes(convertToCurrency(taxesValue).toFixed(2));
    setBrandingCost(convertToCurrency(brandingCostValue).toFixed(2));
    setTransportCost(convertToCurrency(transportCostValue).toFixed(2));
    setTotalPrice(convertToCurrency(subtotal).toFixed(2));
  };

  // Get prices for display
  const getDisplayPrices = () => {
    const subtotal = parseFloat(totalPrice);
    const finalTotalPrice = subtotal;

    return {
      gradePrice: gradePrice,
      packingPrice: packingPrice,
      quantityPrice: quantityPrice,
      shippingCost: shippingCost,
      insuranceCost: insuranceCost,
      taxes: taxes,
      brandingCost: brandingCost,
      transportCost: transportCost,
      totalPrice: totalPrice,
      finalTotalPrice: finalTotalPrice.toFixed(2),
      baseProductPrice: convertToCurrency(getPricePerUnit()).toFixed(2)
    };
  };

  // Get exchange rate info for display
  const getExchangeRateInfo = () => {
    if (currency === 'INR') return null;
    
    const exchangeRates = {
      USD: { rate: "0.012", example: "₹100 = $1.20" },
      EUR: { rate: "0.011", example: "₹100 = €1.10" },
      GBP: { rate: "0.0095", example: "₹100 = £0.95" },
      AED: { rate: "0.044", example: "₹100 = د.إ4.40" },
      SAR: { rate: "0.045", example: "₹100 = ﷼4.50" },
      CAD: { rate: "0.016", example: "₹100 = C$1.60" },
      AUD: { rate: "0.018", example: "₹100 = A$1.80" },
      JPY: { rate: "1.8", example: "₹100 = ¥180" },
      CNY: { rate: "0.087", example: "₹100 = ¥8.70" },
      IRR: { rate: "504.5", example: "₹100 = ﷼50,450" }
    };
    
    return exchangeRates[currency] || null;
  };

  // FIXED: Validation functions - Skip validation for profile fields
  const validatePhoneNumber = (number, code, isFromProfile = false) => {
    // If field is read-only (auto-filled from profile), skip validation
    if (isFromProfile) {
      setPhoneError("");
      return true;
    }
    
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

  const validateEmail = (email, isFromProfile = false) => {
    // If field is read-only (auto-filled from profile), skip validation
    if (isFromProfile) {
      setEmailError("");
      return true;
    }
    
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

  // Event handlers
  const handleCountryChange = (e) => {
    if (!profile) {
      const newCode = e.target.value;
      setCountryCode(newCode);
      validatePhoneNumber(phoneNumber, newCode, false);
      
      const selectedCountry = countryOptions.find(opt => opt.value === newCode);
      if (selectedCountry && selectedCountry.currency) {
        setCurrency(selectedCountry.currency);
      }
    }
  };

  const handlePhoneChange = (e) => {
    if (!profile) {
      const value = e.target.value.replace(/\D/g, "");
      setPhoneNumber(value);
      validatePhoneNumber(value, countryCode, false);
    }
  };

  const handleEmailChange = (e) => {
    if (!profile) {
      const value = e.target.value;
      setEmail(value);
      validateEmail(value, false);
    }
  };

  const handleFullNameChange = (e) => {
    if (!profile) {
      setFullName(e.target.value);
    }
  };

  const handleQuantityChange = (e) => {
    const value = e.target.value;
    setQuantity(value);
    if (value !== "custom") {
      setCustomQuantity("");
    }
  };

  const handleCustomQuantityChange = (e) => {
    const value = e.target.value;
    setCustomQuantity(value);
    
    if (value && !isNaN(value) && parseFloat(value) > 0) {
      const pricePerUnit = getPricePerUnit();
      const gradeMultiplier = grade ? parseFloat(getAvailableGradesForProduct().find(g => g.value === grade)?.price || 1) : 1;
      const calculatedPrice = parseFloat(value) * pricePerUnit * gradeMultiplier;
      setQuantityPrice(convertToCurrency(calculatedPrice).toFixed(2));
    } else {
      setQuantityPrice("0.00");
    }
  };

  const handleGradeChange = (e) => {
    setGrade(e.target.value);
  };

  const handlePackingChange = (e) => {
    setPacking(e.target.value);
  };

  const handleCifChange = (e) => {
    setCifRequired(e.target.value);
  };

  const handleCurrencyChange = (e) => {
    setCurrency(e.target.value);
  };

  const handleBrandingChange = (e) => {
    setBrandingRequired(e.target.value);
  };

  // New handlers for state and port selection
  const handleStateChange = (e) => {
    const state = e.target.value;
    setSelectedState(state);
    setSelectedPort("");
    setPortOptions(getPortOptions(state));
    
    if (state) {
      const productType = getProductType();
      const productName = product?.name?.toLowerCase() || '';
      const unitType = getUnitType(productType, productName);
      setTransportPrice(getTransportPrice(state, "", unitType));
    } else {
      setTransportPrice("0-0");
    }
  };

  const handlePortChange = (e) => {
    const port = e.target.value;
    setSelectedPort(port);
    
    if (selectedState && port) {
      const productType = getProductType();
      const productName = product?.name?.toLowerCase() || '';
      const unitType = getUnitType(productType, productName);
      setTransportPrice(getTransportPrice(selectedState, port, unitType));
    }
  };

  // Helper function to get quantity unit for custom input placeholder
  const getQuantityUnit = () => {
    const productType = getProductType();
    const productName = product?.name?.toLowerCase() || '';
    
    if (productType === 'construction') {
      if (productName.includes('cement')) {
        return "Bags (50kg each)";
      } else if (productName.includes('steel') || productName.includes('rod') || productName.includes('tmt')) {
        return "Kg or Bundles";
      } else if (productName.includes('brick')) {
        return "Pieces";
      } else if (productName.includes('sand') || productName.includes('gravel') || productName.includes('aggregate')) {
        return "Kg, Tons or Truck Loads";
      } else if (productName.includes('concrete') && productName.includes('block')) {
        return "Blocks";
      } else if (productName.includes('wood') || productName.includes('timber') || productName.includes('plywood')) {
        return "Sq Ft or Cubic Feet";
      } else if (productName.includes('pipe')) {
        return "Meters or Pieces";
      } else if (productName.includes('tile')) {
        return "Sq Ft or Boxes";
      } else if (productName.includes('wire')) {
        return "Meters or Coils";
      } else if (productName.includes('marble') || productName.includes('slab')) {
        return "Pieces or Sq Ft";
      } else if (productName.includes('paint')) {
        return "Liters or Buckets";
      } else if (productName.includes('window') || productName.includes('glass')) {
        return "Pieces or Sq Ft";
      }
      return "Units";
    }
    
    const unitMap = {
      oil: "Liters",
      rice: "Kg",
      pulses: "Kg",
      spices: "Kg",
      dryfruits: "Kg",
      tea: "Kg",
      fruits: "Kg",
      vegetables: "Kg",
      chocolate: "Kg",
      construction: "Units",
      beverages: "Bottles",
      gadgets: "Pieces",
      clothing: "Pieces",
      perfume: "Bottles",
      flowers: "Stems",
      default: "Units"
    };
    return unitMap[productType] || "Units";
  };

  // FIXED: Auto-fill form with profile data - Don't validate initially
  useEffect(() => {
    if (isOpen && profile) {
      const nameValue = profile.name || "";
      setFullName(nameValue);
      setEmail(profile.email || "");
      
      if (profile.phone) {
        const cleanedPhone = profile.phone.replace(/\s+/g, "").replace(/[^+\d]/g, "");
        const matchedCountry = countryOptions.find((opt) => cleanedPhone.startsWith(opt.value));
        
        if (matchedCountry) {
          setCountryCode(matchedCountry.value);
          const phoneWithoutCode = cleanedPhone.replace(matchedCountry.value, "");
          setPhoneNumber(phoneWithoutCode);
          if (matchedCountry.currency) {
            setCurrency(matchedCountry.currency);
          }
          // Don't validate immediately for profile fields
          setPhoneError("");
        } else {
          // Default to India if no country code found
          setCountryCode("+91");
          setPhoneNumber(cleanedPhone.replace(/^\+/, ""));
          setPhoneError("");
        }
      } else {
        // If no phone in profile, set default India
        setCountryCode("+91");
        setPhoneNumber("");
        setPhoneError("");
      }
      
      // Clear email error for profile fields
      setEmailError("");
    }
  }, [isOpen, profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!quantity || !packing || !grade || !fullName || !cifRequired || !brandingRequired) {
      alert("Please fill all required fields.");
      return;
    }
    
    if (grade === "") {
      alert("Please select a grade.");
      return;
    }

    if (cifRequired === "") {
      alert("Please select if CIF is required.");
      return;
    }

    if (brandingRequired === "") {
      alert("Please select if branding is required.");
      return;
    }

    if (!currency) {
      alert("Please select a currency.");
      return;
    }
    
    if (quantity === "custom" && (!customQuantity || parseFloat(customQuantity) <= 0)) {
      alert("Please enter a valid custom quantity.");
      return;
    }
    
    // Use isFromProfile parameter to skip validation for profile fields
    const isFromProfile = !!profile;
    const isPhoneValid = validatePhoneNumber(phoneNumber, countryCode, isFromProfile);
    const isEmailValid = validateEmail(email, isFromProfile);

    if (!isPhoneValid || !isEmailValid) {
      if (!isPhoneValid) alert("Please enter a valid phone number.");
      if (!isEmailValid) alert("Please enter a valid email address.");
      return;
    }

    const fullPhoneNumber = `${countryCode}${phoneNumber}`;
    const quantityOptions = getQuantityOptionsForProduct();
    const selectedQuantityOption = quantityOptions.find(opt => opt.value === quantity);
    
    let quantityDisplay = "";
    let actualQuantity = 0;
    let actualUnit = "";
    
    if (quantity === "custom") {
      quantityDisplay = `${customQuantity} ${getQuantityUnit()}`;
      actualQuantity = parseFloat(customQuantity);
      actualUnit = getQuantityUnit();
    } else {
      quantityDisplay = selectedQuantityOption ? selectedQuantityOption.label : `${quantity} ${getQuantityUnit()}`;
      actualQuantity = selectedQuantityOption ? selectedQuantityOption.actualQuantity : parseFloat(quantity);
      actualUnit = selectedQuantityOption ? selectedQuantityOption.actualUnit : getQuantityUnit();
    }

    const displayPrices = getDisplayPrices();
    const currencySymbol = getCurrencySymbol();
    const exchangeInfo = getExchangeRateInfo();
    const packingUnit = getPackingUnit(packing);
    
    // Get state and port labels
    const stateLabel = selectedState ? stateOptions.find(s => s.value === selectedState)?.label || selectedState : "";
    const portLabel = selectedPort ? portOptions.find(p => p.value === selectedPort)?.label || selectedPort : "";

    // Calculate actual INR values for database
    const baseProductPriceINR = convertFromCurrency(displayPrices.baseProductPrice, currency);
    const gradePriceINR = convertFromCurrency(displayPrices.gradePrice, currency);
    const packingPriceINR = convertFromCurrency(displayPrices.packingPrice, currency);
    const quantityPriceINR = convertFromCurrency(displayPrices.quantityPrice, currency);
    const brandingCostINR = convertFromCurrency(displayPrices.brandingCost, currency);
    const transportCostINR = convertFromCurrency(displayPrices.transportCost, currency);
    const shippingCostINR = cifRequired === "Yes" ? convertFromCurrency(displayPrices.shippingCost, currency) : 0;
    const insuranceCostINR = cifRequired === "Yes" ? convertFromCurrency(displayPrices.insuranceCost, currency) : 0;
    const taxesINR = cifRequired === "Yes" ? convertFromCurrency(displayPrices.taxes, currency) : 0;
    const totalINR = convertFromCurrency(displayPrices.finalTotalPrice, currency);

    // Prepare the quote data
    const quoteData = {
      // Basic Information
      name: fullName,
      email: email,
      phone: fullPhoneNumber,
      
      // Product Information
      product: product?.name || "",
      variety: product?.variety || "",
      brand: product?.brand || "",
      grade: grade,
      packing: packing,
      quantity: quantityDisplay,
      actualQuantity: actualQuantity,
      actualUnit: actualUnit,
      
      // Requirements
      cifRequired: cifRequired,
      brandingRequired: brandingRequired,
      currency: currency,
      
      // Transport Information
      state: stateLabel,
      port: portLabel,
      transportPrice: `₹${transportPrice} per ${getUnitType(getProductType(), product?.name?.toLowerCase() || '')}`,
      
      // Price Breakdown
      priceBreakdown: {
        note: "This is an estimated bill. Final pricing may vary based on actual costs and market conditions.",
        
        ...(transportPrice !== "0-0" && {
          transportPriceLine: `Transport Price: ₹${transportPrice} per ${getUnitType(getProductType(), product?.name?.toLowerCase() || '')}`
        }),
        
        baseProductPrice: `Base Product Price: ₹${baseProductPriceINR.toFixed(2)}/unit`,
        gradePrice: `Grade Price: ₹${gradePriceINR.toFixed(2)}/unit`,
        packingPrice: `Packing Price: ₹${packingPriceINR.toFixed(2)}/${packingUnit}`,
        quantityPrice: `Quantity Price: ₹${quantityPriceINR.toFixed(2)}`,
        
        ...(brandingRequired === "Yes" && {
          brandingCostLine: `Branding/Custom Printing: ₹${brandingCostINR.toFixed(2)}`
        }),
        
        ...(transportPrice !== "0-0" && {
          transportCostLine: `Transport Cost: ₹${transportCostINR.toFixed(2)}`
        }),
        
        ...(currency !== 'INR' && exchangeInfo && {
          currencyNote: `All prices converted from INR to ${currency}. ${exchangeInfo.example}`
        })
      },
      
      calculatedValues: {
        baseProductPriceINR: baseProductPriceINR,
        gradePriceINR: gradePriceINR,
        packingPriceINR: packingPriceINR,
        quantityPriceINR: quantityPriceINR,
        brandingCostINR: brandingCostINR,
        transportCostINR: transportCostINR,
        shippingCostINR: shippingCostINR,
        insuranceCostINR: insuranceCostINR,
        taxesINR: taxesINR,
        totalINR: totalINR
      },
      
      displayValues: {
        baseProductPrice: `${currencySymbol}${formatNumber(displayPrices.baseProductPrice)}/unit`,
        gradePrice: `${currencySymbol}${formatNumber(displayPrices.gradePrice)}/unit`,
        packingPrice: `${currencySymbol}${formatNumber(displayPrices.packingPrice)}/${packingUnit}`,
        quantityPrice: `${currencySymbol}${formatNumber(displayPrices.quantityPrice)}`,
        brandingCost: brandingRequired === "Yes" ? `${currencySymbol}${formatNumber(displayPrices.brandingCost)}` : "Not Required",
        transportCost: transportPrice !== "0-0" ? `${currencySymbol}${formatNumber(displayPrices.transportCost)}` : "Not Required",
        shippingCost: cifRequired === "Yes" ? `${currencySymbol}${formatNumber(displayPrices.shippingCost)}` : "Not Required",
        insuranceCost: cifRequired === "Yes" ? `${currencySymbol}${formatNumber(displayPrices.insuranceCost)}` : "Not Required",
        taxes: cifRequired === "Yes" ? `${currencySymbol}${formatNumber(displayPrices.taxes)}` : "Not Required",
        subtotal: `${currencySymbol}${formatNumber(displayPrices.totalPrice)}`,
        finalTotal: `${currencySymbol}${formatNumber(displayPrices.finalTotalPrice)}`
      },
      
      additionalInfo: additionalInfo || "",
      
      userId: profile?.uid || "guest",
      timestamp: Date.now(),
      date: new Date().toLocaleString(),
      productType: getProductType(),
      status: "new",
      source: "website",
      isNew: true  // Add this flag to identify new orders
    };

    setIsSubmitting(true);

    try {
      // Submit to Firebase
      const quoteId = await submitQuote(quoteData);
      console.log('Quote submitted successfully with ID:', quoteId);
      
      // Create WhatsApp message
      const message = `Hello! I want a quote for:
- Name: ${fullName}
- Email: ${email}
- Phone: ${fullPhoneNumber}
- Product: ${product?.name || ""}
- Variety: ${product?.variety || ""}
- Brand: ${product?.brand || ""}
- Grade: ${grade}
- Packing: ${packing}
- Quantity: ${quantityDisplay}
- CIF Required: ${cifRequired}
- Brand Required: ${brandingRequired}
- Currency: ${currency}
${stateLabel ? `- State: ${stateLabel}` : ""}
${portLabel ? `- Port: ${portLabel}` : ""}
${transportPrice !== "0-0" ? `- Transport Price: ₹${transportPrice} per ${getUnitType(getProductType(), product?.name?.toLowerCase() || '')}` : ""}
${exchangeInfo ? `- Exchange Rate: ${exchangeInfo.example}` : ""}
- Estimated Bill Breakdown:
  • Base Product Price: ${currencySymbol}${formatNumber(displayPrices.baseProductPrice)}/unit
  • Grade Price: ${currencySymbol}${formatNumber(displayPrices.gradePrice)}/unit
  • Packing Price: ${currencySymbol}${formatNumber(displayPrices.packingPrice)}/${packingUnit}
  • Quantity Price: ${currencySymbol}${formatNumber(displayPrices.quantityPrice)}
  ${brandingRequired === "Yes" ? `• Branding/Custom Printing: ${currencySymbol}${formatNumber(displayPrices.brandingCost)}` : ""}
  ${transportPrice !== "0-0" ? `• Transport Cost: ${currencySymbol}${formatNumber(displayPrices.transportCost)}` : ""}
  • Subtotal: ${currencySymbol}${formatNumber(displayPrices.totalPrice)}
  • Final Total: ${currencySymbol}${formatNumber(displayPrices.finalTotalPrice)}
${additionalInfo ? `- Additional Info: ${additionalInfo}` : ""}
Thank you!`;

      // Open WhatsApp
      window.open(
        `https://wa.me/+917396007479?text=${encodeURIComponent(message)}`,
        "_blank"
      );

      // Show success message with order count
      alert(`✅ Order #${quoteId.substring(0, 8)} submitted successfully! Check "My Orders" for details.`);
      
      // Notify parent component about new order
      if (onOrderSubmitted) {
        onOrderSubmitted();
      }

      // Show thank you popup
      setShowThankYou(true);
      
      // Reset form
      resetForm();

    } catch (err) {
      console.error("Error submitting form:", err);
      alert("Something went wrong while submitting your quote. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setGrade("");
    setPacking("");
    setQuantity("");
    setCifRequired("");
    setCurrency("INR");
    setBrandingRequired("");
    setAdditionalInfo("");
    setCustomQuantity("");
    setGradePrice("0.00");
    setPackingPrice("0.00");
    setQuantityPrice("0.00");
    setShippingCost("0.00");
    setInsuranceCost("0.00");
    setTaxes("0.00");
    setBrandingCost("0.00");
    setTransportCost("0.00");
    setTotalPrice("0.00");
    setSelectedState("");
    setSelectedPort("");
    setPortOptions([]);
    setTransportPrice("0-0");
    
    if (!profile) {
      setFullName("");
      setEmail("");
      setPhoneNumber("");
      setCountryCode("+91");
    }
    setPhoneError("");
    setEmailError("");
  };

  const handleClose = () => {
    resetForm();
    setShowThankYou(false);
    onClose();
  };

  // Effects
  useEffect(() => {
    calculatePrices();
  }, [grade, packing, quantity, cifRequired, currency, baseProductPrice, customQuantity, brandingRequired, transportPrice, selectedState, selectedPort]);

  useEffect(() => {
    if (isOpen && product) {
      setGrade("");
      setCifRequired("");
      setCurrency("INR");
      setBrandingRequired("");
      setCustomQuantity("");
      setGradePrice("0.00");
      setPackingPrice("0.00");
      setQuantityPrice("0.00");
      setShippingCost("0.00");
      setInsuranceCost("0.00");
      setTaxes("0.00");
      setBrandingCost("0.00");
      setTransportCost("0.00");
      setTotalPrice("0.00");
      setSelectedState("");
      setSelectedPort("");
      setPortOptions([]);
      setTransportPrice("0-0");
      
      const basePrice = extractBasePrice(product.price);
      setBaseProductPrice(basePrice.toFixed(2));
      
      console.log('Product detected as:', getProductType());
      console.log('Product details:', product);
    }
  }, [isOpen, product]);

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

  if (!isOpen) return null;

  const availableGrades = getAvailableGradesForProduct();
  const currencySymbol = getCurrencySymbol();
  const quantityOptions = getQuantityOptionsForProduct();
  const displayPrices = getDisplayPrices();
  const exchangeInfo = getExchangeRateInfo();
  const productType = getProductType();
  const packingOptions = getPackingOptionsForProduct();
  const packingUnit = getPackingUnit(packing);
  const unitType = getUnitType(productType, product?.name?.toLowerCase() || '');

  return (
    <>
      <div className="buy-modal-overlay">
        <div className="buy-modal-container" ref={modalRef}>
          <button className="buy-modal-close-btn" onClick={handleClose} aria-label="Close modal">
            &times;
          </button>
          
          <div className="buy-modal-header">
            <h2 className="buy-modal-title">Get Quote</h2>
            <p className="buy-modal-subtitle">Fill out the form below and we'll get back to you shortly</p>
            {product && (
              <div className="product-price-info">
                <small>Base Price: {product.price} (INR)</small>
                {productType === 'rice' && (
                  <div className="rice-price-note">
                    <small>Note: Rice prices are per quintal (100kg). Calculations are converted to per kg.</small>
                  </div>
                )}
                {productType === 'construction' && (
                  <div className="construction-price-note">
                    <small>Construction materials: Prices calculated based on selected quantity and packaging type.</small>
                  </div>
                )}
                <div className="product-type-info">
                  <small>Product Type: {productType}</small>
                </div>
              </div>
            )}
          </div>
          
          <div className="buy-modal-body">
            <div className="modal-layout">
              {/* Left Side - Form (Scrollable) */}
              <div className="form-section-container" ref={formContainerRef}>
                <form onSubmit={handleSubmit}>
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
                        readOnly={!!profile}
                      />
                      {profile && (
                        <div className="profile-autofill-note">
                          <small>Auto-filled from your profile</small>
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
                        readOnly={!!profile}
                      />
                      {profile && (
                        <div className="profile-autofill-note">
                          <small>Auto-filled from your profile</small>
                        </div>
                      )}
                      {emailError && <div className="error-message">{emailError}</div>}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Phone Number *</label>
                      <div className="phone-input-group">
                        <select
                          value={countryCode}
                          onChange={handleCountryChange}
                          className="country-code-select"
                          disabled={!!profile}
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
                          readOnly={!!profile}
                        />
                      </div>
                      {profile && (
                        <div className="profile-autofill-note">
                          <small>Auto-filled from your profile</small>
                        </div>
                      )}
                      {phoneError && <div className="error-message">{phoneError}</div>}
                    </div>
                  </section>

                  <section className="form-section">
                    <h3 className="section-title">Product Information</h3>

                    <div className="form-group">
                      <label className="form-label">Product Name</label>
                      <input
                        type="text"
                        value={product?.name || ""}
                        className="form-input"
                        readOnly
                        disabled
                      />
                    </div>

                    {product?.variety && (
                      <div className="form-group">
                        <label className="form-label">Variety</label>
                        <input
                          type="text"
                          value={product.variety}
                          className="form-input"
                          readOnly
                          disabled
                        />
                      </div>
                    )}

                    <div className="form-group">
                      <label className="form-label">Original Price (INR)</label>
                      <input
                        type="text"
                        value={product?.price || ""}
                        className="form-input"
                        readOnly
                        disabled
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Grade *</label>
                      <select value={grade} onChange={handleGradeChange} required className="form-select">
                        <option value="">Select Grade</option>
                        {availableGrades.map((gradeOption, index) => (
                          <option key={index} value={gradeOption.value}>{gradeOption.value}</option>
                        ))}
                      </select>
                      <div className="grade-info">
                        <small>Available grades for {product?.variety || product?.name}</small>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Packing *</label>
                      <select value={packing} onChange={handlePackingChange} required className="form-select">
                        <option value="">Select Packing</option>
                        {packingOptions.map((packingOption, index) => (
                          <option key={index} value={packingOption.value}>{packingOption.value}</option>
                        ))}
                      </select>
                      <div className="packing-info">
                        <small>Available packing options for {productType}</small>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Quantity *</label>
                      <select value={quantity} onChange={handleQuantityChange} required className="form-select">
                        <option value="">Select Quantity</option>
                        {quantityOptions.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                      {quantity === "custom" && (
                        <input
                          type="number"
                          placeholder={`Enter custom quantity in ${getQuantityUnit()}`}
                          value={customQuantity}
                          onChange={handleCustomQuantityChange}
                          className="form-input"
                          style={{ marginTop: '10px' }}
                          min="1"
                          step="1"
                          required
                        />
                      )}
                    </div>

                    {/* Transport Selection Section - UPDATED with alphabetical sorting */}
                    <div className="form-group">
                      <label className="form-label">Transport Information</label>
                      <div className="transport-selection-group">
                        <div className="transport-row">
                          <div className="transport-column">
                            <label className="form-label">State</label>
                            <select 
                              value={selectedState} 
                              onChange={handleStateChange} 
                              className="form-select"
                            >
                              <option value="">Select State</option>
                              {/* States displayed in alphabetical order */}
                              {stateOptions
                                .sort((a, b) => a.label.localeCompare(b.label))
                                .map((state) => (
                                  <option key={state.value} value={state.value}>
                                    {state.label}
                                  </option>
                                ))}
                            </select>
                          </div>
                          <div className="transport-column">
                            <label className="form-label">Port/Destination</label>
                            <select 
                              value={selectedPort} 
                              onChange={handlePortChange} 
                              className="form-select"
                              disabled={!selectedState}
                            >
                              <option value="">Select Port</option>
                              {/* Ports displayed in alphabetical order */}
                              {portOptions
                                .sort((a, b) => a.label.localeCompare(b.label))
                                .map((port, index) => (
                                  <option key={index} value={port.value}>
                                    {port.label}
                                  </option>
                                ))}
                            </select>
                          </div>
                        </div>
                        {transportPrice !== "0-0" && (
                          <div className="transport-price-info">
                            <small>Transport Price: ₹{transportPrice} per {unitType}</small>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">CIF Required (If Any)</label>
                      <select value={cifRequired} onChange={handleCifChange} className="form-select">
                        <option value="">Select Option</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                      <div className="cif-info">
                        <small>CIF (Cost, Insurance, and Freight) includes shipping and insurance costs to your destination port</small>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Brand Required (If Any)</label>
                      <select value={brandingRequired} onChange={handleBrandingChange} className="form-select">
                        <option value="">Select Option</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                      <div className="branding-info">
                        <small>Add your logo/branding to the packaging - Additional charge: {currencySymbol}35</small>
                        {brandingRequired === "Yes" && (
                          <div className="branding-cost-preview">
                            <small>Branding/custom printing cost: {currencySymbol}{formatNumber(displayPrices.brandingCost)}</small>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Currency *</label>
                      <select value={currency} onChange={handleCurrencyChange} required className="form-select">
                        <option value="">Select Currency</option>
                        {currencyOptions.map((curr, i) => (
                          <option key={i} value={curr.value}>
                            {curr.value} ({curr.symbol}) - {curr.name}
                          </option>
                        ))}
                      </select>
                      {exchangeInfo && (
                        <div className="currency-info">
                          <small>Exchange Rate: {exchangeInfo.example}</small>
                        </div>
                      )}
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
                        "Get Quote"
                      )}
                    </button>
                    <button type="button" onClick={handleClose} className="cancel-btn">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>

              {/* Right Side - Estimated Bill (Also Scrollable) */}
              <div className="estimate-section-container" ref={estimateContainerRef}>
                <div className="price-breakdown-section">
                  <h4 className="price-breakdown-title">Estimated Bill Breakdown</h4>
                  <div className="estimate-note">
                    <small>This is an estimated bill. Final pricing may vary based on actual costs and market conditions.</small>
                    {productType === 'rice' && (
                      <div className="rice-calculation-note">
                        <small>Rice prices calculated per kg (converted from quintal price)</small>
                      </div>
                    )}
                    {productType === 'construction' && (
                      <div className="construction-calculation-note">
                        <small>Construction materials: Prices calculated based on selected quantity type</small>
                      </div>
                    )}
                    {exchangeInfo && (
                      <div className="currency-conversion-note">
                        <small>Prices converted from INR to {currency}. {exchangeInfo.example}</small>
                      </div>
                    )}
                    {transportPrice !== "0-0" && (
                      <div className="transport-price-display">
                        <small>Transport Price: ₹{transportPrice} per {unitType}</small>
                      </div>
                    )}
                  </div>
                  <div className="price-breakdown-grid">
                    <div className="price-item">
                      <span className="price-label">Base Product Price:</span>
                      <span className="price-value">{currencySymbol}{formatNumber(displayPrices.baseProductPrice)}/unit</span>
                    </div>
                    <div className="price-item">
                      <span className="price-label">Grade Price:</span>
                      <span className="price-value">{currencySymbol}{formatNumber(displayPrices.gradePrice)}/unit</span>
                    </div>
                    <div className="price-item">
                      <span className="price-label">Packing Price:</span>
                      <span className="price-value">{currencySymbol}{formatNumber(displayPrices.packingPrice)}/{packingUnit}</span>
                    </div>
                    <div className="price-item">
                      <span className="price-label">Quantity Price:</span>
                      <span className="price-value">{currencySymbol}{formatNumber(displayPrices.quantityPrice)}</span>
                    </div>
                    
                    {brandingRequired === "Yes" && (
                      <div className="price-item branding-costs">
                        <span className="price-label">Branding/Custom Printing:</span>
                        <span className="price-value">{currencySymbol}{formatNumber(displayPrices.brandingCost)}</span>
                      </div>
                    )}
                    
                    {transportPrice !== "0-0" && (
                      <div className="price-item transport-costs">
                        <span className="price-label">Transport Cost:</span>
                        <span className="price-value">{currencySymbol}{formatNumber(displayPrices.transportCost)}</span>
                      </div>
                    )}
                    
                    {cifRequired === "Yes" && (
                      <>
                        <div className="price-item">
                          <span className="price-label">Shipping Cost:</span>
                          <span className="price-value">{currencySymbol}{formatNumber(displayPrices.shippingCost)}</span>
                        </div>
                        <div className="price-item">
                          <span className="price-label">Insurance Cost:</span>
                          <span className="price-value">{currencySymbol}{formatNumber(displayPrices.insuranceCost)}</span>
                        </div>
                        <div className="price-item">
                          <span className="price-label">Taxes & Duties:</span>
                          <span className="price-value">{currencySymbol}{formatNumber(displayPrices.taxes)}</span>
                        </div>
                      </>
                    )}
                    
                    <div className="price-item final-total">
                      <span className="price-label">Final Total:</span>
                      <span className="price-value">{currencySymbol}{formatNumber(displayPrices.finalTotalPrice)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ThankYouPopup isOpen={showThankYou} onClose={() => setShowThankYou(false)} />

      <style jsx>{`
        .buy-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 10px;
          backdrop-filter: blur(10px);
        }

        .buy-modal-container {
          background: linear-gradient(135deg, #1a1f35, #2d3748);
          border: 1px solid rgba(74, 85, 104, 0.5);
          border-radius: 16px;
          box-shadow: 0 25px 80px rgba(0, 0, 0, 0.5);
          width: 100%;
          max-width: 1200px;
          max-height: 95vh;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
          animation: modalSlideIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .buy-modal-close-btn {
          position: absolute;
          top: 15px;
          right: 15px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          width: 35px;
          height: 35px;
          font-size: 18px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          transition: all 0.3s ease;
          color: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
        }

        .buy-modal-close-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          transform: rotate(90deg) scale(1.1);
        }

        .buy-modal-header {
          padding: 25px 25px 15px;
          border-bottom: 1px solid rgba(74, 85, 104, 0.3);
          background: rgba(26, 32, 44, 0.8);
          position: relative;
          overflow: hidden;
          flex-shrink: 0;
        }

        .buy-modal-header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, #4299e1, #3182ce, #4299e1);
        }

        .buy-modal-title {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, #4299e1, #63b3ed);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: 0 2px 10px rgba(66, 153, 225, 0.3);
        }

        .buy-modal-subtitle {
          margin: 8px 0 0;
          opacity: 0.8;
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.9);
          line-height: 1.4;
        }

        .product-price-info {
          margin-top: 8px;
          padding: 6px 10px;
          background: rgba(66, 153, 225, 0.1);
          border-radius: 6px;
          border-left: 3px solid #4299e1;
        }

        .product-price-info small {
          color: #90cdf4;
          font-size: 0.8rem;
          line-height: 1.3;
        }

        .rice-price-note {
          margin-top: 5px;
          padding: 4px 8px;
          background: rgba(101, 163, 13, 0.1);
          border-radius: 4px;
          border-left: 2px solid #65a30d;
        }

        .rice-price-note small {
          color: #84cc16;
          font-size: 0.75rem;
        }

        .construction-price-note {
          margin-top: 5px;
          padding: 4px 8px;
          background: rgba(101, 163, 13, 0.1);
          border-radius: 4px;
          border-left: 2px solid #65a30d;
        }

        .construction-price-note small {
          color: #84cc16;
          font-size: 0.75rem;
        }

        .product-type-info {
          margin-top: 5px;
          padding: 4px 8px;
          background: rgba(101, 163, 13, 0.1);
          border-radius: 4px;
          border-left: 2px solid #65a30d;
        }

        .product-type-info small {
          color: #84cc16;
          font-size: 0.75rem;
        }

        .buy-modal-body {
          flex: 1;
          overflow: hidden;
          padding: 0;
          display: flex;
          flex-direction: column;
        }

        .modal-layout {
          display: flex;
          flex: 1;
          min-height: 0;
          overflow: hidden;
          flex-direction: row;
        }

        .form-section-container {
          flex: 1;
          min-width: 0;
          overflow-y: auto;
          border-right: 1px solid rgba(74, 85, 104, 0.2);
          display: flex;
          flex-direction: column;
        }

        .estimate-section-container {
          flex: 0 0 350px;
          background: rgba(26, 32, 44, 0.6);
          border-left: 1px solid rgba(74, 85, 104, 0.2);
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }

        .form-section {
          padding: 20px 25px;
          border-bottom: 1px solid rgba(74, 85, 104, 0.2);
          flex-shrink: 0;
        }

        .form-section:last-of-type {
          border-bottom: none;
        }

        .section-title {
          margin: 0 0 20px 0;
          font-size: 1.1rem;
          font-weight: 600;
          color: #63b3ed;
          display: flex;
          align-items: center;
          position: relative;
        }

        .section-title::before {
          content: "";
          width: 4px;
          height: 18px;
          background: linear-gradient(135deg, #4299e1, #3182ce);
          margin-right: 10px;
          border-radius: 2px;
        }

        .form-group {
          margin-bottom: 20px;
          position: relative;
        }

        .form-label {
          display: block;
          margin-bottom: 6px;
          font-weight: 600;
          color: #e2e8f0;
          font-size: 0.9rem;
        }

        .form-input,
        .form-select,
        .form-textarea {
          width: 100%;
          padding: 12px 14px;
          background: rgba(45, 55, 72, 0.8);
          border: 1px solid rgba(74, 85, 104, 0.5);
          border-radius: 8px;
          font-size: 0.95rem;
          transition: all 0.3s ease;
          color: white;
          backdrop-filter: blur(10px);
        }

        .form-input::placeholder,
        .form-textarea::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        .form-input:focus,
        .form-select:focus,
        .form-textarea:focus {
          outline: none;
          border-color: #4299e1;
          background: rgba(45, 55, 72, 1);
          box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
          transform: translateY(-1px);
        }

        .form-input:read-only,
        .form-input:disabled {
          background-color: rgba(74, 85, 104, 0.3);
          color: rgba(255, 255, 255, 0.6);
          cursor: not-allowed;
          border-color: rgba(74, 85, 104, 0.5);
        }

        .form-select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2363b3ed' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
          background-size: 14px;
          padding-right: 40px;
          cursor: pointer;
        }

        .form-select option {
          background: #2d3748;
          color: white;
          padding: 10px 14px;
          border: none;
          font-size: 0.95rem;
        }

        .country-code-select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2363b3ed' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
          background-size: 14px;
          padding-right: 40px;
          cursor: pointer;
          background: rgba(45, 55, 72, 0.8);
          border: 1px solid rgba(74, 85, 104, 0.5);
          border-radius: 8px;
          color: white;
          font-size: 0.9rem;
        }

        .phone-input-group {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .country-code-select {
          flex: 0 0 auto;
          width: 120px;
          padding: 12px;
        }

        .phone-input {
          flex: 1;
        }

        .form-textarea {
          resize: vertical;
          min-height: 100px;
          font-family: inherit;
          line-height: 1.5;
        }

        .error-message {
          color: #fc8181;
          font-size: 0.8rem;
          margin-top: 5px;
        }

        .profile-autofill-note {
          margin-top: 5px;
          color: #84cc16;
          font-size: 0.75rem;
          font-style: italic;
        }

        .grade-info,
        .cif-info,
        .branding-info,
        .currency-info,
        .packing-info {
          margin-top: 5px;
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.8rem;
          line-height: 1.3;
        }

        .branding-cost-preview {
          margin-top: 5px;
          padding: 4px 8px;
          background: rgba(101, 163, 13, 0.1);
          border-radius: 4px;
          border-left: 2px solid #65a30d;
        }

        .branding-cost-preview small {
          color: #84cc16;
          font-size: 0.75rem;
        }

        /* Transport Selection Styles */
        .transport-selection-group {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .transport-row {
          display: flex;
          gap: 10px;
        }

        .transport-column {
          flex: 1;
        }

        .transport-price-info {
          margin-top: 5px;
          padding: 8px;
          background: rgba(101, 163, 13, 0.1);
          border-radius: 6px;
          border-left: 3px solid #65a30d;
        }

        .transport-price-info small {
          color: #84cc16;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .transport-price-display {
          margin-top: 8px;
          padding: 8px;
          background: rgba(101, 163, 13, 0.1);
          border-radius: 5px;
          border-left: 3px solid #65a30d;
        }

        .transport-price-display small {
          color: #84cc16;
          font-size: 0.75rem;
          line-height: 1.3;
        }

        .price-breakdown-section {
          padding: 20px;
          height: 100%;
          display: flex;
          flex-direction: column;
          min-height: 0;
        }

        .price-breakdown-title {
          margin: 0 0 12px 0;
          font-size: 1.2rem;
          font-weight: 700;
          color: #63b3ed;
          text-align: center;
          background: linear-gradient(135deg, #4299e1, #63b3ed);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1.3;
        }

        .estimate-note {
          text-align: center;
          margin-bottom: 15px;
          padding: 10px;
          background: rgba(66, 153, 225, 0.1);
          border-radius: 6px;
          border-left: 3px solid #4299e1;
        }

        .estimate-note small {
          color: #90cdf4;
          font-size: 0.8rem;
          line-height: 1.3;
        }

        .rice-calculation-note {
          margin-top: 8px;
          padding: 8px;
          background: rgba(101, 163, 13, 0.1);
          border-radius: 5px;
          border-left: 3px solid #65a30d;
        }

        .rice-calculation-note small {
          color: #84cc16;
          font-size: 0.75rem;
          line-height: 1.3;
        }

        .construction-calculation-note {
          margin-top: 8px;
          padding: 8px;
          background: rgba(101, 163, 13, 0.1);
          border-radius: 5px;
          border-left: 3px solid #65a30d;
        }

        .construction-calculation-note small {
          color: #84cc16;
          font-size: 0.75rem;
          line-height: 1.3;
        }

        .currency-conversion-note {
          margin-top: 8px;
          padding: 8px;
          background: rgba(101, 163, 13, 0.1);
          border-radius: 5px;
          border-left: 3px solid #65a30d;
        }

        .currency-conversion-note small {
          color: #84cc16;
          font-size: 0.75rem;
          line-height: 1.3;
        }

        .price-breakdown-grid {
          display: flex;
          flex-direction: column;
          gap: 10px;
          flex: 1;
          min-height: 0;
        }

        .price-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid rgba(74, 85, 104, 0.2);
          flex-shrink: 0;
        }

        .price-item:last-child {
          border-bottom: none;
        }

        .price-item.branding-costs {
          color: #90cdf4;
          border-left: 3px solid #4299e1;
          padding-left: 8px;
          background: rgba(66, 153, 225, 0.05);
          margin: 3px -8px;
          padding: 8px;
        }

        .price-item.transport-costs {
          color: #68d391;
          border-left: 3px solid #68d391;
          padding-left: 8px;
          background: rgba(104, 211, 145, 0.05);
          margin: 3px -8px;
          padding: 8px;
        }

        .price-item.final-total {
          border-top: 2px solid #4299e1;
          border-bottom: none;
          padding-top: 12px;
          margin-top: 8px;
          font-weight: 700;
          background: rgba(66, 153, 225, 0.1);
          margin: 12px -8px -8px -8px;
          padding: 12px 8px;
          border-radius: 6px;
        }

        .price-label {
          color: #e2e8f0;
          font-size: 0.9rem;
          flex: 1;
          padding-right: 10px;
        }

        .price-value {
          color: #68d391;
          font-weight: 600;
          font-size: 0.9rem;
          text-align: right;
          white-space: nowrap;
        }

        .price-item.branding-costs .price-value {
          color: #90cdf4;
        }

        .price-item.transport-costs .price-value {
          color: #68d391;
        }

        .price-item.final-total .price-value {
          color: #4299e1;
          font-size: 1.1rem;
        }

        .form-actions {
          padding: 20px 25px;
          background: rgba(26, 32, 44, 0.8);
          border-top: 1px solid rgba(74, 85, 104, 0.3);
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          align-items: center;
          flex-shrink: 0;
        }

        .submit-btn {
          background: linear-gradient(135deg, #4299e1, #3182ce);
          color: white;
          border: none;
          padding: 12px 25px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.95rem;
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(66, 153, 225, 0.3);
          flex: 1;
          max-width: 120px;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 15px rgba(66, 153, 225, 0.4);
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .btn-loading {
          display: flex;
          align-items: center;
          gap: 6px;
          justify-content: center;
        }

        .btn-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid transparent;
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .cancel-btn {
          background: rgba(74, 85, 104, 0.3);
          color: #e2e8f0;
          border: 1px solid rgba(74, 85, 104, 0.5);
          padding: 12px 25px;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.95rem;
          flex: 1;
          max-width: 120px;
        }

        .cancel-btn:hover {
          background: rgba(74, 85, 104, 0.5);
        }

        /* Scrollbar styling for both containers */
        .form-section-container::-webkit-scrollbar,
        .estimate-section-container::-webkit-scrollbar {
          width: 5px;
        }

        .form-section-container::-webkit-scrollbar-track,
        .estimate-section-container::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }

        .form-section-container::-webkit-scrollbar-thumb,
        .estimate-section-container::-webkit-scrollbar-thumb {
          background: rgba(66, 153, 225, 0.5);
          border-radius: 3px;
        }

        .form-section-container::-webkit-scrollbar-thumb:hover,
        .estimate-section-container::-webkit-scrollbar-thumb:hover {
          background: rgba(66, 153, 225, 0.7);
        }

        /* Mobile Responsive Styles */
        @media (max-width: 768px) {
          .buy-modal-overlay {
            padding: 5px;
          }

          .buy-modal-container {
            max-height: 98vh;
            max-width: 100vw;
            border-radius: 12px;
          }

          .modal-layout {
            flex-direction: column;
          }

          .form-section-container {
            border-right: none;
            border-bottom: 1px solid rgba(74, 85, 104, 0.2);
            flex: 1;
            min-height: 0;
            max-height: 60vh;
          }

          .estimate-section-container {
            flex: 0 0 auto;
            border-left: none;
            border-top: 1px solid rgba(74, 85, 104, 0.2);
            max-height: 35vh;
            min-height: 250px;
          }

          .form-section {
            padding: 15px 20px;
          }

          .form-actions {
            padding: 15px 20px;
            flex-direction: column;
            gap: 10px;
          }

          .submit-btn,
          .cancel-btn {
            width: 100%;
            max-width: none;
          }

          .phone-input-group {
            flex-direction: column;
            gap: 8px;
          }

          .country-code-select {
            width: 100%;
          }

          .transport-row {
            flex-direction: column;
            gap: 10px;
          }

          .price-breakdown-section {
            padding: 15px;
          }

          .price-breakdown-title {
            font-size: 1.1rem;
          }

          .price-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 5px;
          }

          .price-value {
            align-self: flex-end;
          }
        }

        @media (max-width: 480px) {
          .buy-modal-header {
            padding: 20px 20px 12px;
          }

          .buy-modal-title {
            font-size: 1.3rem;
          }

          .buy-modal-subtitle {
            font-size: 0.85rem;
          }

          .form-section {
            padding: 12px 15px;
          }

          .section-title {
            font-size: 1rem;
            margin-bottom: 15px;
          }

          .form-group {
            margin-bottom: 15px;
          }

          .form-input,
          .form-select,
          .form-textarea {
            padding: 10px 12px;
            font-size: 0.9rem;
          }

          .price-breakdown-section {
            padding: 12px;
          }

          .form-actions {
            padding: 12px 15px;
          }

          .submit-btn,
          .cancel-btn {
            padding: 10px 15px;
            font-size: 0.9rem;
          }
        }

        /* Extra small devices */
        @media (max-width: 360px) {
          .buy-modal-header {
            padding: 15px 15px 10px;
          }

          .form-section {
            padding: 10px 12px;
          }

          .price-breakdown-section {
            padding: 10px;
          }

          .price-item {
            padding: 8px 0;
          }

          .price-label,
          .price-value {
            font-size: 0.85rem;
          }
        }
      `}</style>
    </>
  );
};

export default BuyModal;