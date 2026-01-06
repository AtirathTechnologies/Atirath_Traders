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
  getTransportPrice,
  getUnitType
} from "../data/ProductData";

const BuyModal = ({ isOpen, onClose, product, profile, onOrderSubmitted }) => {
  // State declarations
  const [grade, setGrade] = useState("");
  const [packing, setPacking] = useState("");
  const [quantity, setQuantity] = useState("");
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
  const [gradePrice, setGradePrice] = useState("0.00");
  const [packingPrice, setPackingPrice] = useState("0.00");
  const [quantityPrice, setQuantityPrice] = useState("0.00");
  const [totalPrice, setTotalPrice] = useState("0.00");
  const [currency, setCurrency] = useState("USD");
  const [brandingRequired, setBrandingRequired] = useState("No");
  const [shippingCost, setShippingCost] = useState("0.00");
  const [insuranceCost, setInsuranceCost] = useState("0.00");
  const [taxes, setTaxes] = useState("0.00");
  const [baseProductPrice, setBaseProductPrice] = useState("0.00");
  const [customQuantity, setCustomQuantity] = useState("");
  const [brandingCost, setBrandingCost] = useState("0.00");
  const [transportCost, setTransportCost] = useState("0.00");
  const [productCurrency, setProductCurrency] = useState("USD");
  const [productOrigin, setProductOrigin] = useState("");
  const [availableGrades, setAvailableGrades] = useState([]);
  const [hasGrades, setHasGrades] = useState(false);
  const [productPriceDisplay, setProductPriceDisplay] = useState("");
  const [quantityOptions, setQuantityOptions] = useState([]);
  const [packingOptions, setPackingOptions] = useState([]);
  const [submitError, setSubmitError] = useState("");

  // New state for transport selection - BOTH AS INPUT FIELDS
  const [selectedState, setSelectedState] = useState("");
  const [selectedPort, setSelectedPort] = useState("");
  const [transportPrice, setTransportPrice] = useState("0-0");

  // New state for profile fields
  const [country, setCountry] = useState("India");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");

  // New state to track if profile data has been auto-filled
  const [hasAutoFilled, setHasAutoFilled] = useState(false);

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

  const countryNames = [
    { name: "India", code: "IN" },
    { name: "Oman", code: "OM" },
    { name: "United Kingdom", code: "GB" },
    { name: "United States", code: "US" },
    { name: "UAE", code: "AE" },
    { name: "Australia", code: "AU" },
    { name: "Canada", code: "CA" },
    { name: "Germany", code: "DE" },
    { name: "France", code: "FR" },
    { name: "Singapore", code: "SG" },
    { name: "Japan", code: "JP" },
    // { name: "Thailand", code: "TH" },
    { name: "Turkey", code: "TR" },
    { name: "China", code: "CN" }
  ];

  const currencyOptions = [
    { value: "INR", symbol: "₹", name: "Indian Rupee" },
    { value: "USD", symbol: "$", name: "US Dollar" },
    { value: "EUR", symbol: "€", name: "Euro" },
    { value: "GBP", symbol: "£", name: "British Pound" },
    { value: "AED", symbol: "د.إ", name: "UAE Dirham" },
    { value: "SAR", symbol: "﷼", name: "Saudi Riyal" },
    { value: "THB", symbol: "฿", name: "Thai Baht" },
    { value: "TRY", symbol: "₺", name: "Turkish Lira" },
    { value: "CAD", symbol: "C$", name: "Canadian Dollar" },
    { value: "AUD", symbol: "A$", name: "Australian Dollar" },
    { value: "JPY", symbol: "¥", name: "Japanese Yen" },
    { value: "CNY", symbol: "¥", name: "Chinese Yuan" },
    { value: "OMR", symbol: "﷼", name: "Omani Rial" }
  ];

  // Analyze product data from Firebase
  const analyzeProductData = () => {
    if (!product) return {};

    console.log("📦 Raw Product Data:", product);

    // Extract price and currency
    let priceValue = 0;
    let currencyDetected = "USD";
    let priceDisplay = "";

    // Check for price_usd_per_carton (Heritage products)
    if (product.price_usd_per_carton !== undefined) {
      priceValue = product.price_usd_per_carton;
      currencyDetected = "USD";
      priceDisplay = `$${priceValue} per carton`;
    }
    // Check for fob_price_usd (Nut Walker products)
    else if (product.fob_price_usd !== undefined) {
      priceValue = product.fob_price_usd;
      currencyDetected = "USD";
      priceDisplay = `$${priceValue} per carton`;
    }
    // Check for Ex-Mill_usd (Akil Drinks products)
    else if (product["Ex-Mill_usd"] !== undefined) {
      priceValue = product["Ex-Mill_usd"];
      currencyDetected = "USD";
      priceDisplay = `$${priceValue} EX-MILL per carton`;
    }
    // Check for price object with min/max (SIEA Rice)
    else if (product.price && typeof product.price === 'object') {
      if (product.price.min !== undefined && product.price.max !== undefined) {
        priceValue = (product.price.min + product.price.max) / 2;
        currencyDetected = "INR";
        priceDisplay = `₹${product.price.min} - ₹${product.price.max} per ${product.price.unit || "unit"}`;
      }
    }
    // Check for string price
    else if (typeof product.price === 'string') {
      // Extract currency from string
      if (product.price.includes('$')) {
        currencyDetected = "USD";
        priceValue = parseFloat(product.price.replace(/[^\d.-]/g, '')) || 0;
      } else if (product.price.includes('₹') || product.price.includes('Rs') || product.price.includes('INR')) {
        currencyDetected = "INR";
        priceValue = parseFloat(product.price.replace(/[^\d.-]/g, '')) || 0;
      } else if (product.price.includes('€')) {
        currencyDetected = "EUR";
        priceValue = parseFloat(product.price.replace(/[^\d.-]/g, '')) || 0;
      } else if (product.price.includes('£')) {
        currencyDetected = "GBP";
        priceValue = parseFloat(product.price.replace(/[^\d.-]/g, '')) || 0;
      } else {
        // Try to extract number
        priceValue = parseFloat(product.price) || 0;
        // Default to INR for Indian companies
        if (product.companyName?.includes('Heritage') ||
          product.companyName?.includes('Nut Walker') ||
          product.companyName?.includes('Akil Drinks') ||
          product.companyName?.includes('SIEA')) {
          currencyDetected = "USD";
        }
      }
      priceDisplay = product.price;
    }
    // Check for number price
    else if (typeof product.price === 'number') {
      priceValue = product.price;
      // Default currency based on company
      if (product.companyName?.includes('Heritage') ||
        product.companyName?.includes('Nut Walker') ||
        product.companyName?.includes('Akil Drinks')) {
        currencyDetected = "USD";
        priceDisplay = `$${priceValue}`;
      } else {
        currencyDetected = "INR";
        priceDisplay = `₹${priceValue}`;
      }
    }

    // Extract origin
    let origin = product.origin ||
      product.Origin ||
      product.country_of_origin ||
      "India";

    // Extract grades if available
    let grades = [];
    let hasGradesField = false;

    if (product.grades && Array.isArray(product.grades) && product.grades.length > 0) {
      grades = product.grades.map(grade => ({
        value: grade.grade || grade.name || grade.type || "Standard",
        price: grade.price || grade.price_inr || "1.00",
        currency: grade.currency || currencyDetected
      }));
      hasGradesField = true;
    } else if (product.grade) {
      // Single grade field
      grades = [{
        value: product.grade,
        price: "1.00",
        currency: currencyDetected
      }];
      hasGradesField = true;
    }

    // Extract packaging information
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

    // Determine product type from data
    const productType = getProductType();

    return {
      priceValue,
      currency: currencyDetected,
      priceDisplay,
      origin,
      grades,
      hasGrades: hasGradesField,
      packagingInfo,
      productType,
      rawPrice: product.price
    };
  };

  // Get quantity options based on actual product data
  const getQuantityOptionsFromProduct = () => {
    const analysis = analyzeProductData();
    const productType = analysis.productType;
    const productName = product?.name?.toLowerCase() || '';

    // Check for carton-based products
    const isCartonBased = product?.price_usd_per_carton ||
      product?.fob_price_usd ||
      product?.["Ex-Mill_usd"] ||
      (product?.packaging && product.packaging.units_per_carton);

    if (isCartonBased) {
      const unitsPerCarton = product?.packaging?.units_per_carton || 48; // Default to 48 based on screenshot

      // Return carton-based options
      return [
        { value: "1", label: `1 Carton (${unitsPerCarton} units)`, multiplier: 1, unit: "cartons", actualQuantity: unitsPerCarton, actualUnit: "units" },
        { value: "5", label: `5 Cartons (${unitsPerCarton * 5} units)`, multiplier: 5, unit: "cartons", actualQuantity: unitsPerCarton * 5, actualUnit: "units" },
        { value: "10", label: `10 Cartons (${unitsPerCarton * 10} units)`, multiplier: 10, unit: "cartons", actualQuantity: unitsPerCarton * 10, actualUnit: "units" },
        { value: "20", label: `20 Cartons (${unitsPerCarton * 20} units)`, multiplier: 20, unit: "cartons", actualQuantity: unitsPerCarton * 20, actualUnit: "units" },
        { value: "custom", label: "Custom Quantity", multiplier: 1, unit: "cartons", actualQuantity: 0, actualUnit: "cartons" }
      ];
    }

    // Get base options for non-carton products
    let options = getQuantityOptions(productType, productName);

    // Adjust based on product packaging if available
    if (product?.packaging && typeof product.packaging === 'object') {
      const unitsPerCarton = product.packaging.units_per_carton || 48;
      const unitWeight = product.packaging.unit_weight_g;

      if (unitsPerCarton) {
        // Add carton-based options
        const cartonOptions = [
          { value: "1", label: `1 Carton (${unitsPerCarton} units)`, multiplier: unitsPerCarton, unit: "cartons", actualQuantity: unitsPerCarton, actualUnit: "units" },
          { value: "5", label: `5 Cartons (${unitsPerCarton * 5} units)`, multiplier: unitsPerCarton * 5, unit: "cartons", actualQuantity: unitsPerCarton * 5, actualUnit: "units" },
          { value: "10", label: `10 Cartons (${unitsPerCarton * 10} units)`, multiplier: unitsPerCarton * 10, unit: "cartons", actualQuantity: unitsPerCarton * 10, actualUnit: "units" },
          { value: "20", label: `20 Cartons (${unitsPerCarton * 20} units)`, multiplier: unitsPerCarton * 20, unit: "cartons", actualQuantity: unitsPerCarton * 20, actualUnit: "units" }
        ];

        options = [...cartonOptions, ...options.filter(opt => opt.value === "custom")];
      }
    }

    return options;
  };

  // Get packing options based on actual product data
  const getPackingOptionsFromProduct = () => {
    const analysis = analyzeProductData();
    const productType = analysis.productType;
    const productName = product?.name?.toLowerCase() || '';
    const packagingInfo = analysis.packagingInfo;

    // FOR RICE PRODUCTS: Show standard packing options
    if (productType === 'rice') {
      // Get standard rice packing options from ProductData
      return getPackingOptions('rice', productName);
    }

    // FOR ALL OTHER PRODUCTS: Display packing from Firebase data
    // Get the packing from Firebase
    let firebasePacking = "";

    // Check multiple possible fields for packing in Firebase
    if (product?.pack_type) {
      firebasePacking = product.pack_type;
    } else if (product?.packaging) {
      if (typeof product.packaging === 'string') {
        firebasePacking = product.packaging;
      } else if (typeof product.packaging === 'object' && product.packaging.type) {
        firebasePacking = product.packaging.type;
      }
    } else if (analysis.packagingInfo) {
      firebasePacking = analysis.packagingInfo;
    }

    // If we have packing from Firebase, return it as the only option
    if (firebasePacking) {
      return [
        { value: firebasePacking, price: "10" }
      ];
    }

    // Fallback: Get packing options based on product type
    return getPackingOptions(productType, productName);
  };

  // Get available grades from product data
  const getGradesFromProduct = () => {
    const analysis = analyzeProductData();

    // If product has grades, use them
    if (analysis.hasGrades && analysis.grades.length > 0) {
      return analysis.grades;
    }

    // Otherwise, only show grades if it's a rice product
    const productType = analysis.productType;
    if (productType === 'rice') {
      return getAvailableGrades(productType, product);
    }

    // For non-rice products without grades, return empty array
    return [];
  };

  // Helper functions
  const getCurrencySymbol = () => {
    const selectedCurrency = currencyOptions.find(curr => curr.value === currency);
    return selectedCurrency ? selectedCurrency.symbol : "$";
  };

  const getProductCurrencySymbol = () => {
    const analysis = analyzeProductData();
    const productCurr = analysis.currency;
    const selectedCurrency = currencyOptions.find(curr => curr.value === productCurr);
    return selectedCurrency ? selectedCurrency.symbol : "$";
  };

  const getCurrentCountry = () => countryOptions.find((opt) => opt.value === countryCode);

  // PRODUCT TYPE DETECTION from actual data
  const getProductType = () => {
    if (!product) return 'default';

    // First check category from product data
    if (product.category) {
      return product.category.toLowerCase();
    }

    // Check product name and company name
    const productName = product.name?.toLowerCase() || '';
    const companyName = product.companyName?.toLowerCase() || '';

    // SIEA - rice
    if (companyName.includes('siea')) {
      return 'rice';
    }

    // Fallback to name-based detection - prioritize rice detection
    if (productName.includes('rice') || productName.includes('basmati')) {
      return 'rice';
    }

    // Heritage foods - check if it's rice
    if (companyName.includes('heritage')) {
      if (productName.includes('rice')) return 'rice';
      if (productName.includes('dal') || productName.includes('lentil')) return 'pulses';
      if (productName.includes('spice')) return 'spices';
      if (productName.includes('tea')) return 'tea';
      return 'default';
    }

    // Nut Walker - dry fruits
    if (companyName.includes('nut walker')) {
      return 'dryfruits';
    }

    // Akil Drinks - beverages
    if (companyName.includes('akil drinks')) {
      return 'beverages';
    }

    // Other product type detection...
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

  // Calculate shipping cost based on actual product data
  const calculateShippingCost = (quantityValue, productValue, customQty = null) => {
    if (!quantityValue || cifRequired !== "Yes") return 0;

    let actualQuantity = 0;

    if (quantityValue === "custom") {
      actualQuantity = parseFloat(customQty) || parseFloat(customQuantity) || 0;
    } else {
      const selectedQuantity = quantityOptions.find(q => q.value === quantityValue);
      if (!selectedQuantity) return 0;
      actualQuantity = selectedQuantity.actualQuantity;
    }

    if (actualQuantity <= 0) return 0;

    const analysis = analyzeProductData();
    const productType = analysis.productType;

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
    if (cifRequired !== "Yes") return 0;
    return productValue * 0.005;
  };

  // Calculate taxes and duties
  const calculateTaxes = (subtotal) => {
    if (cifRequired !== "Yes") return 0;
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
      const selectedQuantity = quantityOptions.find(q => q.value === quantityValue);
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
    const number = parseFloat(num);
    if (isNaN(number)) return "0.00";

    return number.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Get price per unit based on actual product data
  const getPricePerUnit = () => {
    const analysis = analyzeProductData();
    let price = analysis.priceValue;
    const productType = analysis.productType;

    // Check if this is a per-carton price (like Heritage, Akil Drinks products)
    if (product?.price_usd_per_carton || product?.fob_price_usd || product?.["Ex-Mill_usd"]) {
      // This is already a per-carton price, don't divide
      return price; // Return as is for carton price
    }

    // Only divide for per-unit pricing structures
    if (product?.packaging?.units_per_carton) {
      // Some products might have per-unit pricing, but check carefully
      // For now, assume if it has units_per_carton, it's per-carton pricing
      return price; // Return as is for carton price
    } else if (productType === 'rice') {
      // Rice is often priced per quintal (100kg), convert to per kg
      price = price / 100;
    } else if (productType === 'construction' && product?.name?.toLowerCase().includes('cement')) {
      // Cement bags: 50kg per bag
      price = price / 50;
    }

    return price;
  };

  // Calculate quantity price based on selected quantity
  const calculateQuantityPrice = (quantityValue, gradeMultiplier, customQty = null) => {
    const pricePerCarton = getPricePerUnit(); // This is now price per carton
    const analysis = analyzeProductData();

    let actualCartons = 0;

    if (quantityValue === "custom") {
      actualCartons = parseFloat(customQty) || parseFloat(customQuantity) || 0;
    } else {
      const selectedQuantity = quantityOptions.find(q => q.value === quantityValue);
      if (!selectedQuantity) return 0;

      // Check if quantity option specifies cartons
      if (selectedQuantity.unit === "cartons") {
        actualCartons = parseFloat(selectedQuantity.value); // Number of cartons
      } else {
        // Convert units to cartons if we know units per carton
        const unitsPerCarton = product?.packaging?.units_per_carton;
        if (unitsPerCarton && selectedQuantity.actualQuantity) {
          actualCartons = selectedQuantity.actualQuantity / unitsPerCarton;
        } else {
          actualCartons = parseFloat(selectedQuantity.value);
        }
      }
    }

    if (actualCartons <= 0) return 0;

    return actualCartons * pricePerCarton * gradeMultiplier;
  };

  // Price calculation
  const calculatePrices = () => {
    const analysis = analyzeProductData();
    const productType = analysis.productType;

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
    if (grade && analysis.hasGrades) {
      const selectedGrade = analysis.grades.find(g => g.value === grade);
      if (selectedGrade) {
        gradeMultiplier = parseFloat(selectedGrade.price);
      }
    }

    // Grade price per unit
    gradePriceValue = pricePerUnit * gradeMultiplier;

    // Packing price
    if (packing) {
      const selectedPacking = packingOptions.find(p => p.value === packing);
      if (selectedPacking) {
        packingPriceValue = parseFloat(selectedPacking.price);
      }
    }

    // Quantity price
    quantityPriceValue = calculateQuantityPrice(quantity, gradeMultiplier);

    // Branding cost
    brandingCostValue = calculateBrandingCost(brandingRequired);

    // Transport cost
    const productName = product?.name?.toLowerCase() || '';
    const unitType = getUnitType(productType, productName);
    transportCostValue = calculateTransportCost(quantity, transportPrice, unitType, customQuantity);

    // CIF costs
    if (cifRequired === "Yes") {
      shippingCostValue = calculateShippingCost(quantity, quantityPriceValue, customQuantity);
      insuranceCostValue = calculateInsuranceCost(quantityPriceValue);
      taxesValue = calculateTaxes(quantityPriceValue + packingPriceValue + brandingCostValue + transportCostValue);
    }

    // Subtotal
    const subtotal = quantityPriceValue + packingPriceValue + brandingCostValue + shippingCostValue + insuranceCostValue + taxesValue + transportCostValue;

    setGradePrice(gradePriceValue.toFixed(2));
    setPackingPrice(packingPriceValue.toFixed(2));
    setQuantityPrice(quantityPriceValue.toFixed(2));
    setShippingCost(shippingCostValue.toFixed(2));
    setInsuranceCost(insuranceCostValue.toFixed(2));
    setTaxes(taxesValue.toFixed(2));
    setBrandingCost(brandingCostValue.toFixed(2));
    setTransportCost(transportCostValue.toFixed(2));
    setTotalPrice(subtotal.toFixed(2));
  };

  // Get prices for display
  const getDisplayPrices = () => {
    const analysis = analyzeProductData();
    const productCurrencySymbol = getProductCurrencySymbol();
    const selectedCurrencySymbol = getCurrencySymbol();

    return {
      baseProductPrice: `${productCurrencySymbol}${formatNumber(analysis.priceValue)}`,
      gradePrice: `${selectedCurrencySymbol}${formatNumber(gradePrice)}`,
      packingPrice: `${selectedCurrencySymbol}${formatNumber(packingPrice)}`,
      quantityPrice: `${selectedCurrencySymbol}${formatNumber(quantityPrice)}`,
      shippingCost: cifRequired === "Yes" ? `${selectedCurrencySymbol}${formatNumber(shippingCost)}` : "Not Required",
      insuranceCost: cifRequired === "Yes" ? `${selectedCurrencySymbol}${formatNumber(insuranceCost)}` : "Not Required",
      taxes: cifRequired === "Yes" ? `${selectedCurrencySymbol}${formatNumber(taxes)}` : "Not Required",
      brandingCost: brandingRequired === "Yes" ? `${selectedCurrencySymbol}${formatNumber(brandingCost)}` : "Not Required",
      transportCost: transportPrice !== "0-0" ? `${selectedCurrencySymbol}${formatNumber(transportCost)}` : "Not Required",
      totalPrice: `${selectedCurrencySymbol}${formatNumber(totalPrice)}`,
      finalTotalPrice: `${selectedCurrencySymbol}${formatNumber(totalPrice)}`
    };
  };

  // Validation functions
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

  // Event handlers
  const handleCountryChange = (e) => {
    const newCode = e.target.value;
    setCountryCode(newCode);

    // Update country name based on country code
    const selectedCountry = countryOptions.find(opt => opt.value === newCode);
    if (selectedCountry) {
      setCountry(selectedCountry.name);
      if (selectedCountry.currency) {
        setCurrency(selectedCountry.currency);
      }
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
    setCountry(e.target.value);
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
      calculatePrices();
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

  // New handlers for state and port selection - BOTH AS INPUT FIELDS
  const handleStateChange = (e) => {
    const stateValue = e.target.value;
    setSelectedState(stateValue);
    setSelectedPort(""); // Clear port when state changes

    if (stateValue) {
      const analysis = analyzeProductData();
      const unitType = getUnitType(analysis.productType, product?.name?.toLowerCase() || '');
      setTransportPrice(getTransportPrice(stateValue, "", unitType));
    } else {
      setTransportPrice("0-0");
    }
  };

  const handlePortChange = (e) => {
    const port = e.target.value;
    setSelectedPort(port);

    // Update transport price when port is entered
    if (selectedState && port) {
      const analysis = analyzeProductData();
      const unitType = getUnitType(analysis.productType, product?.name?.toLowerCase() || '');
      setTransportPrice(getTransportPrice(selectedState, port, unitType));
    }
  };

  // Helper function to get quantity unit for custom input placeholder
  const getQuantityUnit = () => {
    const analysis = analyzeProductData();

    // Check if this is a carton-based product
    const isCartonBased = product?.price_usd_per_carton ||
      product?.fob_price_usd ||
      product?.["Ex-Mill_usd"];

    if (isCartonBased) {
      return "cartons";
    }

    const productType = analysis.productType;

    if (product?.packaging?.units_per_carton) {
      return "cartons";
    }

    switch (productType) {
      case 'rice': return 'kg';
      case 'oil': return 'liters';
      case 'beverages': return 'bottles';
      case 'dryfruits': return 'kg';
      case 'spices': return 'kg';
      case 'tea': return 'kg';
      case 'pulses': return 'kg';
      default: return 'units';
    }
  };

  // Helper function to get product origin display
  const getProductOrigin = () => {
    const analysis = analyzeProductData();
    return analysis.origin;
  };

  // Function to auto-fill from profile
  const handleAutoFillFromProfile = () => {
    if (!profile) return;

    console.log('📋 Auto-filling form from profile:', profile);

    // Fill all fields from profile
    setFullName(profile.name || "");
    setEmail(profile.email || "");
    setCountry(profile.country || "India");
    setState(profile.state || "");
    setCity(profile.city || "");
    setPincode(profile.pincode || "");

    // Handle phone number
    if (profile.phone) {
      const phoneStr = profile.phone.toString();
      let foundCountryCode = "+91";

      const matchedCountry = countryOptions.find((opt) => phoneStr.startsWith(opt.value));
      if (matchedCountry) {
        foundCountryCode = matchedCountry.value;
        const phoneWithoutCode = phoneStr.replace(matchedCountry.value, "");
        setPhoneNumber(phoneWithoutCode);
        setCountryCode(foundCountryCode);

        if (matchedCountry.currency) {
          setCurrency(matchedCountry.currency);
        }
      } else {
        // Default to India
        setCountryCode('+91');
        setPhoneNumber(phoneStr);
        setCountry('India');
      }
    } else {
      setCountryCode("+91");
      setPhoneNumber("");
    }

    // Clear validation errors
    setPhoneError("");
    setEmailError("");

    // Mark as auto-filled
    setHasAutoFilled(true);

    console.log('✅ Form auto-filled with profile data');
  };

  // Initialize product data when modal opens
  useEffect(() => {
    if (isOpen && product) {
      const analysis = analyzeProductData();
      console.log("🔍 Product Analysis:", analysis);

      setProductCurrency(analysis.currency);
      setProductOrigin(analysis.origin);
      setHasGrades(analysis.hasGrades);
      setProductPriceDisplay(analysis.priceDisplay);
      setBaseProductPrice(analysis.priceValue.toString());

      // Set grades if available
      const grades = getGradesFromProduct();
      setAvailableGrades(grades);

      // Set quantity options based on product
      const qtyOptions = getQuantityOptionsFromProduct();
      setQuantityOptions(qtyOptions);

      // Set packing options
      const packOptions = getPackingOptionsFromProduct();
      setPackingOptions(packOptions);

      // Set currency based on product
      setCurrency(analysis.currency);

      // Set default packing if available
      if (packOptions.length > 0 && !packing) {
        setPacking(packOptions[0].value);
      }

      // Set default quantity if available
      if (qtyOptions.length > 0 && !quantity) {
        setQuantity(qtyOptions[0].value);
      }
    }
  }, [isOpen, product]);

  // Auto-fill form with profile data on open
  useEffect(() => {
    if (isOpen && profile && !hasAutoFilled) {
      handleAutoFillFromProfile();
    }
  }, [isOpen, profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    console.log("🔄 Starting form submission...");

    // Validate required fields
    const requiredFields = [
      { field: quantity, name: "Quantity" },
      { field: packing, name: "Packing" },
      { field: fullName, name: "Full Name" },
      { field: cifRequired, name: "CIF Required" },
      { field: brandingRequired, name: "Brand Required" },
      { field: currency, name: "Currency" }
    ];

    const missingFields = requiredFields.filter(f => !f.field);
    if (missingFields.length > 0) {
      const errorMsg = `Please fill all required fields: ${missingFields.map(f => f.name).join(', ')}`;
      alert(errorMsg);
      setSubmitError(errorMsg);
      return;
    }

    // Only validate grade if product has grades
    const analysis = analyzeProductData();
    if (analysis.hasGrades && !grade) {
      const errorMsg = "Please select a grade.";
      alert(errorMsg);
      setSubmitError(errorMsg);
      return;
    }

    if (quantity === "custom" && (!customQuantity || parseFloat(customQuantity) <= 0)) {
      const errorMsg = "Please enter a valid custom quantity.";
      alert(errorMsg);
      setSubmitError(errorMsg);
      return;
    }

    // Validate phone and email
    const isPhoneValid = validatePhoneNumber(phoneNumber, countryCode);
    const isEmailValid = validateEmail(email);

    if (!isPhoneValid || !isEmailValid) {
      let errorMsg = "";
      if (!isPhoneValid) errorMsg = "Please enter a valid phone number.";
      if (!isEmailValid) errorMsg = "Please enter a valid email address.";
      if (!isPhoneValid && !isEmailValid) errorMsg = "Please enter valid phone number and email address.";

      alert(errorMsg);
      setSubmitError(errorMsg);
      return;
    }

    const fullPhoneNumber = `${countryCode}${phoneNumber}`;
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

    // Get state and port labels - now just use the input values
    const stateLabel = selectedState;
    const portLabel = selectedPort;

    // Prepare the quote data
    const quoteData = {
      // Basic Information
      name: fullName,
      email: email,
      phone: fullPhoneNumber,
      country: country,
      state: state,
      city: city,
      pincode: pincode,

      // Product Information
      product: product?.name || "",
      productId: product?.id || "",
      variety: product?.variety || "",
      brand: product?.brand || product?.brandName || "",
      origin: getProductOrigin(),
      grade: grade || "Standard",
      packing: packing,
      quantity: quantityDisplay,
      actualQuantity: actualQuantity,
      actualUnit: actualUnit,

      // Requirements
      cifRequired: cifRequired,
      brandingRequired: brandingRequired,
      currency: currency,
      productCurrency: productCurrency,

      // Transport Information
      transportState: stateLabel,
      port: portLabel,
      transportPrice: transportPrice !== "0-0" ? `₹${transportPrice} per ${getUnitType(analysis.productType, product?.name?.toLowerCase() || '')}` : "Not Selected",

      // Price Breakdown
      priceBreakdown: {
        note: "This is an estimated bill. Final pricing may vary based on actual costs and market conditions.",
        originalPrice: `Original Price: ${productPriceDisplay}`,

        ...(transportPrice !== "0-0" && {
          transportPriceLine: `Transport Price: ₹${transportPrice} per ${getUnitType(analysis.productType, product?.name?.toLowerCase() || '')}`
        }),

        ...(grade && {
          gradeLine: `Grade: ${grade}`
        }),

        packingLine: `Packing: ${packing}`,
        quantityLine: `Quantity: ${quantityDisplay}`,
        quantityPriceLine: `Quantity Price: ${displayPrices.quantityPrice}`,

        ...(brandingRequired === "Yes" && {
          brandingCostLine: `Branding/Custom Printing: ${displayPrices.brandingCost}`
        }),

        ...(transportPrice !== "0-0" && {
          transportCostLine: `Transport Cost: ${displayPrices.transportCost}`
        }),

        ...(cifRequired === "Yes" && {
          shippingCostLine: `Shipping Cost: ${displayPrices.shippingCost}`,
          insuranceCostLine: `Insurance Cost: ${displayPrices.insuranceCost}`,
          taxesLine: `Taxes & Duties: ${displayPrices.taxes}`
        }),

        finalTotalLine: `Final Total: ${displayPrices.finalTotalPrice}`
      },

      displayValues: {
        originalPrice: productPriceDisplay,
        grade: grade || "Not Selected",
        packing: packing,
        quantity: quantityDisplay,
        brandingCost: displayPrices.brandingCost,
        transportCost: displayPrices.transportCost,
        shippingCost: displayPrices.shippingCost,
        insuranceCost: displayPrices.insuranceCost,
        taxes: displayPrices.taxes,
        finalTotal: displayPrices.finalTotalPrice
      },

      additionalInfo: additionalInfo || "",

      userId: profile?.uid || "guest",
      userEmail: profile?.email || email,
      timestamp: Date.now(),
      date: new Date().toISOString(),
      readableDate: new Date().toLocaleString(),
      productType: analysis.productType,
      status: "new",
      source: "website",
      isNew: true,
      hasAutoFilled: hasAutoFilled,
      profileUsed: !!profile
    };

    console.log("📝 Quote Data Prepared:", quoteData);
    setIsSubmitting(true);

    try {
      console.log("📤 Submitting to Firebase...");
      // Submit to Firebase
      const quoteId = await submitQuote(quoteData);
      console.log('✅ Quote submitted successfully with ID:', quoteId);

      // Create WhatsApp message
      const message = `Hello! I want a quote for:
- Name: ${fullName}
- Email: ${email}
- Phone: ${fullPhoneNumber}
- Country: ${country}
- State: ${state}
- City: ${city}
- Pincode: ${pincode}
- Product: ${product?.name || ""}
- Origin: ${getProductOrigin()}
- Variety: ${product?.variety || ""}
- Brand: ${product?.brand || product?.brandName || ""}
${grade ? `- Grade: ${grade}` : ""}
- Packing: ${packing}
- Quantity: ${quantityDisplay}
- CIF Required: ${cifRequired}
- Brand Required: ${brandingRequired}
- Product Currency: ${productCurrency}
- Selected Currency: ${currency}
${selectedState ? `- Transport State: ${selectedState}` : ""}
${selectedPort ? `- Port: ${selectedPort}` : ""}
${transportPrice !== "0-0" ? `- Transport Price: ₹${transportPrice} per ${getUnitType(analysis.productType, product?.name?.toLowerCase() || '')}` : ""}
- Estimated Bill:
  • Original Price: ${productPriceDisplay}
  ${grade ? `• Grade: ${grade}` : ""}
  • Packing: ${packing}
  • Quantity: ${quantityDisplay}
  • Quantity Price: ${displayPrices.quantityPrice}
  ${brandingRequired === "Yes" ? `• Branding/Custom Printing: ${displayPrices.brandingCost}` : ""}
  ${transportPrice !== "0-0" ? `• Transport Cost: ${displayPrices.transportCost}` : ""}
  ${cifRequired === "Yes" ? `• Shipping Cost: ${displayPrices.shippingCost}` : ""}
  ${cifRequired === "Yes" ? `• Insurance Cost: ${displayPrices.insuranceCost}` : ""}
  ${cifRequired === "Yes" ? `• Taxes & Duties: ${displayPrices.taxes}` : ""}
  • Final Total: ${displayPrices.finalTotalPrice}
${additionalInfo ? `- Additional Info: ${additionalInfo}` : ""}
Thank you!`;

      console.log("📱 WhatsApp Message Created");

      // Open WhatsApp
      window.open(
        `https://wa.me/+917396007479?text=${encodeURIComponent(message)}`,
        "_blank"
      );

      // Show success message
      const successMsg = `✅ Order #${quoteId.substring(0, 8)} submitted successfully! Check "My Orders" for details.`;
      alert(successMsg);
      console.log(successMsg);

      // Notify parent component about new order
      if (onOrderSubmitted) {
        onOrderSubmitted(quoteId);
      }

      // Show thank you popup
      setShowThankYou(true);

      // Reset form
      resetForm();

    } catch (err) {
      console.error("❌ Error submitting form:", err);
      const errorMsg = err.message || "Something went wrong while submitting your quote. Please try again.";
      alert(errorMsg);
      setSubmitError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setGrade("");
    setPacking("");
    setQuantity("");
    setCifRequired("No");
    setCurrency("USD");
    setBrandingRequired("No");
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
    setTransportPrice("0-0");
    setProductCurrency("USD");
    setProductOrigin("");
    setAvailableGrades([]);
    setHasGrades(false);
    setProductPriceDisplay("");
    setQuantityOptions([]);
    setPackingOptions([]);
    setHasAutoFilled(false);
    setSubmitError("");

    // Reset all fields
    setFullName("");
    setEmail("");
    setPhoneNumber("");
    setCountryCode("+91");
    setCountry("India");
    setState("");
    setCity("");
    setPincode("");

    setPhoneError("");
    setEmailError("");
  };

  const handleClose = () => {
    resetForm();
    setShowThankYou(false);
    onClose();
  };

  // Recalculate prices when dependencies change
  useEffect(() => {
    calculatePrices();
  }, [grade, packing, quantity, cifRequired, currency, baseProductPrice, customQuantity, brandingRequired, transportPrice, selectedState, selectedPort]);

  useEffect(() => {
    if (isOpen && product) {
      const analysis = analyzeProductData();

      // Reset form fields
      setGrade("");
      setCifRequired("No");
      setBrandingRequired("No");
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
      setTransportPrice("0-0");
      setSubmitError("");

      // Set product-specific data
      setBaseProductPrice(analysis.priceValue.toString());
      setProductCurrency(analysis.currency);
      setProductOrigin(analysis.origin);
      setHasGrades(analysis.hasGrades);
      setProductPriceDisplay(analysis.priceDisplay);

      // Initialize options
      const grades = getGradesFromProduct();
      setAvailableGrades(grades);

      const qtyOptions = getQuantityOptionsFromProduct();
      setQuantityOptions(qtyOptions);

      const packOptions = getPackingOptionsFromProduct();
      setPackingOptions(packOptions);

      // Set currency to match product
      setCurrency(analysis.currency);

      // Set default packing if available
      if (packOptions.length > 0) {
        setPacking(packOptions[0].value);
      }

      // Set default quantity if available
      if (qtyOptions.length > 0) {
        setQuantity(qtyOptions[0].value);
      }
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

  const analysis = analyzeProductData();
  const currencySymbol = getCurrencySymbol();
  const productCurrencySymbol = getProductCurrencySymbol();
  const displayPrices = getDisplayPrices();
  const productType = analysis.productType;
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

          </div>

          <div className="buy-modal-body">
            <div className="modal-layout">
              {/* Left Side - Form (Scrollable) */}
              <div className="form-section-container" ref={formContainerRef}>
                <form onSubmit={handleSubmit}>
                  {/* Auto-fill button for signed-in users */}
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
                        Click to auto-fill your information from your profile. You can still edit any field.
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
                          <small>Auto-filled from profile</small>
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
                          <small>Auto-filled from profile</small>
                        </div>
                      )}
                      {emailError && <div className="error-message">{emailError}</div>}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Country *</label>
                      <select
                        value={country}
                        onChange={handleCountryNameChange}
                        required
                        className="form-select"
                      >
                        <option value="">Select Country</option>
                        {countryNames.map((countryOption) => (
                          <option key={countryOption.code} value={countryOption.name}>
                            {countryOption.name}
                          </option>
                        ))}
                      </select>
                      {hasAutoFilled && (
                        <div className="profile-autofill-note">
                          <small>Auto-filled from profile</small>
                        </div>
                      )}
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
                          <small>Auto-filled from profile</small>
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
                          <small>Auto-filled from profile</small>
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
                          <small>Auto-filled from profile</small>
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
                          <small>Auto-filled from profile</small>
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
                      <label className="form-label">Origin</label>
                      <input
                        type="text"
                        value={getProductOrigin()}
                        className="form-input"
                        readOnly
                        disabled
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Price</label>
                      <input
                        type="text"
                        value={productPriceDisplay}
                        className="form-input"
                        readOnly
                        disabled
                      />
                    </div>

                    {/* Only show grade selection if product has grades */}
                    {hasGrades && availableGrades.length > 0 && (
                      <div className="form-group">
                        <label className="form-label">Grade *</label>
                        <select value={grade} onChange={handleGradeChange} required className="form-select">
                          <option value="">Select Grade</option>
                          {availableGrades.map((gradeOption, index) => (
                            <option key={index} value={gradeOption.value}>
                              {gradeOption.value}
                            </option>
                          ))}
                        </select>
                        <div className="grade-info">
                          <small>Available grades for this product</small>
                        </div>
                      </div>
                    )}

                    <div className="form-group">
                      <label className="form-label">Packing *</label>
                      {productType === 'rice' ? (
                        <>
                          <select value={packing} onChange={handlePackingChange} required className="form-select">
                            <option value="">Select Packing</option>
                            {packingOptions.map((packingOption, index) => (
                              <option key={index} value={packingOption.value}>
                                {packingOption.value} {packingOption.price ? `(${currencySymbol}${packingOption.price})` : ''}
                              </option>
                            ))}
                          </select>
                          <div className="packing-info">
                            <small>Available packing options for rice</small>
                          </div>
                        </>
                      ) : (
                        <>
                          <select value={packing} onChange={handlePackingChange} required className="form-select">
                            <option value="">Select Packing</option>
                            {packingOptions.map((packingOption, index) => (
                              <option key={index} value={packingOption.value}>
                                {packingOption.value} {packingOption.price ? `(${currencySymbol}${packingOption.price})` : ''}
                              </option>
                            ))}
                          </select>
                          <div className="packing-info">
                            <small>Available packing options for this product</small>
                          </div>
                        </>
                      )}
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

                    {/* Transport Selection Section - BOTH AS INPUT FIELDS */}
                    <div className="form-group">
                      <label className="form-label">Transport Information</label>
                      <div className="transport-selection-group">
                        <div className="transport-row">
                          <div className="transport-column">
                            <label className="form-label">State</label>
                            <input
                              type="text"
                              placeholder="Enter state for transport"
                              value={selectedState}
                              onChange={handleStateChange}
                              className="form-input"
                            />
                          </div>
                          <div className="transport-column">
                            <label className="form-label">Port/Destination</label>
                            <input
                              type="text"
                              placeholder="Enter port or destination"
                              value={selectedPort}
                              onChange={handlePortChange}
                              className="form-input"
                            />
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
                      <label className="form-label">CIF Required (If Any) *</label>
                      <select value={cifRequired} onChange={handleCifChange} required className="form-select">
                        <option value="">Select Option</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                      <div className="cif-info">
                        <small>CIF (Cost, Insurance, and Freight) includes shipping and insurance costs to your destination port</small>
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
                        <small>Add your logo/branding to the packaging - Additional charge: {currencySymbol}35</small>
                        {brandingRequired === "Yes" && (
                          <div className="branding-cost-preview">
                            <small>Branding/custom printing cost: {displayPrices.brandingCost}</small>
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

                    {transportPrice !== "0-0" && (
                      <div className="transport-price-display">
                        <small>Transport Price: ₹{transportPrice} per {unitType}</small>
                      </div>
                    )}
                  </div>
                  <div className="price-breakdown-grid">
                    {hasGrades && grade && (
                      <div className="price-item">
                        <span className="price-label">Selected Grade:</span>
                        <span className="price-value">{grade}</span>
                      </div>
                    )}

                    {/* Show packing for all products */}
                    <div className="price-item">
                      <span className="price-label">Packing:</span>
                      <span className="price-value">{packing || "Not Selected"}</span>
                    </div>

                    <div className="price-item">
                      <span className="price-label">Quantity:</span>
                      <span className="price-value">
                        {quantity === "custom"
                          ? `${customQuantity} ${getQuantityUnit()}`
                          : quantityOptions.find(q => q.value === quantity)?.label || "Not Selected"
                        }
                      </span>
                    </div>

                    <div className="price-item">
                      <span className="price-label">Quantity Price:</span>
                      <span className="price-value">{displayPrices.quantityPrice}</span>
                    </div>

                    {brandingRequired === "Yes" && (
                      <div className="price-item branding-costs">
                        <span className="price-label">Branding/Custom Printing:</span>
                        <span className="price-value">{displayPrices.brandingCost}</span>
                      </div>
                    )}

                    {transportPrice !== "0-0" && (
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

      <ThankYouPopup isOpen={showThankYou} onClose={() => setShowThankYou(false)} />

      {/* CSS Styles remain the same */}
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

        .submit-error-section {
          padding: 15px 25px;
          background: rgba(248, 113, 113, 0.1);
          border-bottom: 1px solid rgba(248, 113, 113, 0.3);
        }

        .alert-error {
          color: #fed7d7;
          background: rgba(248, 113, 113, 0.2);
          padding: 10px 15px;
          border-radius: 8px;
          border-left: 3px solid #fc8181;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .product-price-info {
          margin-top: 8px;
          padding: 8px 12px;
          background: rgba(66, 153, 225, 0.1);
          border-radius: 6px;
          border-left: 3px solid #4299e1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .product-type-info {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 4px;
        }

        .product-type-info small {
          padding: 2px 6px;
          background: rgba(101, 163, 13, 0.1);
          border-radius: 4px;
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

        /* Auto-fill section styles */
        .auto-fill-section {
          padding: 15px 25px;
          background: rgba(66, 153, 225, 0.1);
          border-bottom: 1px solid rgba(66, 153, 225, 0.3);
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .auto-fill-btn {
          background: linear-gradient(135deg, #4299e1, #3182ce);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.9rem;
          align-self: flex-start;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .auto-fill-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(66, 153, 225, 0.3);
        }

        .auto-fill-note {
          color: #90cdf4;
          font-size: 0.8rem;
          line-height: 1.3;
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
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2363b3ed' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
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
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .estimate-note small {
          color: #90cdf4;
          font-size: 0.8rem;
          line-height: 1.3;
        }

        .rice-calculation-note {
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