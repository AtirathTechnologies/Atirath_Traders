import React, { useState, useEffect, useRef } from "react";
import ThankYouPopup from "../components/ThankYouPopup";
import { submitQuote } from "../firebase";
import {
  transportData,
  getPackingUnit,
  getTransportPrice,
  getUnitType
} from "../data/ProductData";
import { ShoppingBag, Package, Plus, Minus, X, Check } from 'lucide-react';
import "../styles/form.css";

const SingleProductBuyModal = ({
  isOpen,
  onClose,
  product,
  profile,
  onOrderSubmitted,
  currencyRates,
  currencySymbols,
  selectedCurrency: propSelectedCurrency
}) => {
  // ===== State declarations (unchanged) =====
  const [grade, setGrade] = useState("");
  const [packing, setPacking] = useState("");
  const [quantity, setQuantity] = useState("");
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
  const [brandingRequired, setBrandingRequired] = useState("No");
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
  const [productType, setProductType] = useState('default');
  const [selectedCurrency, setSelectedCurrency] = useState(propSelectedCurrency || 'USD');
  const [availableCurrencies, setAvailableCurrencies] = useState([]);
  const [packingPricePerKg, setPackingPricePerKg] = useState(0);
  const [totalPackingCost, setTotalPackingCost] = useState(0);

  // Transport Module
  const [transportType, setTransportType] = useState("");
  const [pickupLocation, setPickupLocation] = useState({ city: "", state: "", country: "" });
  const [deliveryLocation, setDeliveryLocation] = useState({ city: "", state: "", country: "" });
  const [vehicleType, setVehicleType] = useState("");
  const [airportOfLoading, setAirportOfLoading] = useState({ country: "", airportName: "" });
  const [airportOfDestination, setAirportOfDestination] = useState({ country: "", airportName: "" });
  const [portOfLoading, setPortOfLoading] = useState({ country: "", state: "", portName: "" });
  const [portOfDestination, setPortOfDestination] = useState({ country: "", state: "", portName: "" });
  const [railLoadingStation, setRailLoadingStation] = useState({ city: "", state: "", country: "" });
  const [railDestinationStation, setRailDestinationStation] = useState({ city: "", state: "", country: "" });
  const [transportPrice, setTransportPrice] = useState("0-0");

  // Profile fields
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");

  const [hasAutoFilled, setHasAutoFilled] = useState(false);
  const [productImage, setProductImage] = useState("");
  const [orderQuantity, setOrderQuantity] = useState(1);

  const [ricePackPrices, setRicePackPrices] = useState({});
  const [ricePackSizes, setRicePackSizes] = useState([]);

  const modalRef = useRef(null);
  const formContainerRef = useRef(null);
  const estimateContainerRef = useRef(null);

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

  useEffect(() => {
    if (propSelectedCurrency) {
      setSelectedCurrency(propSelectedCurrency);
    }
  }, [propSelectedCurrency]);

  const convertCurrency = (amount, fromCurrency, toCurrency) => {
    if (!amount && amount !== 0) return 0;
    if (fromCurrency === toCurrency) return amount;
    if (!currencyRates[fromCurrency] || !currencyRates[toCurrency]) {
      console.warn('Missing currency rates for', fromCurrency, toCurrency);
      return amount;
    }
    const amountInUSD = fromCurrency === 'USD'
      ? amount
      : amount / currencyRates[fromCurrency];
    return amountInUSD * currencyRates[toCurrency];
  };

  // ============================================
  // PURE helper functions (unchanged)
  // ============================================
  const isRiceProduct = (productData) => {
    if (!productData) return false;
    if (productData.companyName?.toLowerCase().includes('siea')) return true;
    if (productData.price?.min !== undefined && productData.price?.max !== undefined) return true;
    if (productData.meta?.baseExMillPrices) return true;
    if (productData.price_range?.unit === 'per_pack') return true;
    if (productData.name?.toLowerCase().includes('rice') ||
        productData.name?.toLowerCase().includes('basmati') ||
        productData.name?.toLowerCase().includes('sona masoori')) return true;
    if (productData.configurations && (productData.configurations.packingTypes || productData.configurations.quantityUnits)) return true;
    return false;
  };

  const getBasePrice = (productData) => {
    if (!productData) return { value: 0, currency: 'USD', type: 'unknown', unit: 'unit', displayUnit: 'unit' };

    if (isRiceProduct(productData) && productData.meta?.baseExMillPrices) {
      const rawPackPrices = productData.meta.baseExMillPrices;
      const packPrices = {};
      Object.entries(rawPackPrices).forEach(([key, price]) => {
        const numericKey = parseFloat(key);
        if (!isNaN(numericKey)) {
          packPrices[numericKey] = price;
        }
      });
      const sizes = Object.keys(packPrices).map(Number).sort((a,b) => a-b);
      if (sizes.length > 0) {
        const numericPrices = Object.values(packPrices).filter(v => typeof v === 'number');
        return {
          type: 'rice_pack',
          packPrices: packPrices,
          packSizes: sizes,
          currency: 'INR',
          unit: 'pack',
          displayUnit: 'pack',
          min: Math.min(...numericPrices),
          max: Math.max(...numericPrices)
        };
      }
    }

    if (isRiceProduct(productData) && productData.price_range && productData.price_range.unit === 'per_pack') {
      const min = productData.price_range.min;
      const max = productData.price_range.max;
      if (typeof min === 'number' && typeof max === 'number') {
        const sizes = productData.configurations?.quantityUnits
          ? Object.values(productData.configurations.quantityUnits).map(v => parseFloat(v)).sort((a,b)=>a-b)
          : [5,10,30];
        const packPrices = {};
        sizes.forEach(size => {
          const ratio = (size - sizes[0]) / (sizes[sizes.length-1] - sizes[0]);
          packPrices[size] = min + ratio * (max - min);
        });
        return {
          type: 'rice_pack',
          packPrices: packPrices,
          packSizes: sizes,
          currency: productData.price_range.currency || 'INR',
          unit: 'pack',
          displayUnit: 'pack',
          min: min,
          max: max
        };
      }
    }

    if (isRiceProduct(productData) && productData.price && typeof productData.price === 'object') {
      if (productData.price.min !== undefined && productData.price.max !== undefined) {
        return {
          type: 'rice',
          min: productData.price.min,
          max: productData.price.max,
          value: (productData.price.min + productData.price.max) / 2,
          currency: productData.price.currency || 'INR',
          unit: 'kg',
          displayUnit: 'kg'
        };
      }
    }

    if (productData.pricing) {
      if (productData.pricing.basePrice !== undefined) {
        return {
          value: productData.pricing.basePrice,
          currency: productData.pricing.currency || 'USD',
          type: productData.pricing.type || 'fixed',
          unit: productData.pricing.unit || 'per_carton',
          displayUnit: productData.pricing.unit || 'carton'
        };
      }
      if (productData.pricing.price !== undefined) {
        return {
          value: productData.pricing.price,
          currency: productData.pricing.currency || 'USD',
          type: productData.pricing.type || 'fixed',
          unit: productData.pricing.unit || 'unit',
          displayUnit: productData.pricing.unit || 'unit'
        };
      }
    }

    if (productData.packaging && productData.packaging.units_per_carton && productData.packaging.price_per_unit) {
      return {
        value: productData.packaging.price_per_unit * productData.packaging.units_per_carton,
        currency: productData.packaging.currency || 'USD',
        type: 'carton',
        unit: 'carton',
        displayUnit: 'carton'
      };
    }

    if (productData["Ex-Mill_usd"] !== undefined && productData["Ex-Mill_usd"] !== null) {
      return {
        value: parseFloat(productData["Ex-Mill_usd"]),
        currency: 'USD',
        type: 'EX-MILL',
        unit: 'carton',
        displayUnit: 'carton'
      };
    }

    if (productData.price_usd_per_carton !== undefined && productData.price_usd_per_carton !== null) {
      return {
        value: parseFloat(productData.price_usd_per_carton),
        currency: 'USD',
        type: 'carton',
        unit: 'carton',
        displayUnit: 'carton'
      };
    }

    if (productData.fob_price_usd !== undefined && productData.fob_price_usd !== null) {
      return {
        value: parseFloat(productData.fob_price_usd),
        currency: 'USD',
        type: 'FOB',
        unit: 'carton',
        displayUnit: 'carton'
      };
    }

    if (productData.price !== undefined && typeof productData.price === 'number') {
      return {
        value: productData.price,
        currency: productData.currency || 'USD',
        type: 'fixed',
        unit: 'unit',
        displayUnit: 'unit'
      };
    }

    if (productData.price && typeof productData.price === 'object' && productData.price.value !== undefined) {
      return {
        value: productData.price.value,
        currency: productData.price.currency || 'USD',
        type: productData.price.type || 'fixed',
        unit: productData.price.unit || 'unit',
        displayUnit: productData.price.unit || 'unit'
      };
    }

    console.warn('⚠️ No price found for product:', productData.id, productData.name);
    return { value: 0, currency: 'USD', type: 'unknown', unit: 'unit', displayUnit: 'unit' };
  };

  const getProductPriceDisplay = (productData) => {
    if (!productData) return 'Contact for Price';
    const basePrice = getBasePrice(productData);
    if (basePrice.value === 0 && basePrice.min === undefined) return 'Contact for Price';

    const symbol = basePrice.currency === 'INR' ? '₹' : basePrice.currency === 'USD' ? '$' : currencySymbols[basePrice.currency] || basePrice.currency;
    const convertAndFormat = (val) => {
      if (selectedCurrency === basePrice.currency) return `${symbol}${val.toFixed(2)}`;
      const converted = convertCurrency(val, basePrice.currency, selectedCurrency);
      const finalSymbol = currencySymbols[selectedCurrency] || (selectedCurrency === 'INR' ? '₹' : selectedCurrency === 'USD' ? '$' : selectedCurrency);
      return `${finalSymbol}${converted.toFixed(2)}`;
    };

    if (basePrice.type === 'rice_pack' && basePrice.min !== undefined && basePrice.max !== undefined) {
      const minStr = convertAndFormat(basePrice.min);
      const maxStr = convertAndFormat(basePrice.max);
      const sizes = basePrice.packSizes || [5,10,30];
      const sizeRange = `${Math.min(...sizes)}kg-${Math.max(...sizes)}kg`;
      return `${minStr} - ${maxStr} / pack (${sizeRange})`;
    }
    if (basePrice.type === 'rice' && basePrice.min !== undefined && basePrice.max !== undefined) {
      return `${convertAndFormat(basePrice.min)} - ${convertAndFormat(basePrice.max)} / kg`;
    }
    if (basePrice.type === 'EX-MILL') return `${convertAndFormat(basePrice.value)} EX-MILL / carton`;
    if (basePrice.type === 'FOB') return `${convertAndFormat(basePrice.value)} FOB / carton`;
    if (basePrice.unit === 'carton' || basePrice.unit === 'per_carton') return `${convertAndFormat(basePrice.value)} / carton`;
    return `${convertAndFormat(basePrice.value)} / ${basePrice.displayUnit}`;
  };

  const getPackingCostFromFirebase = (productData, packingType, quantityValue) => {
    if (!productData || !packingType || !quantityValue) return 0;
    if (!isRiceProduct(productData)) return 0;
    if (!productData.meta?.packing_costs) return 0;

    const packingCostsObj = productData.meta.packing_costs[packingType];
    if (!packingCostsObj) return 0;

    let numericQuantity = parseFloat(quantityValue);
    if (isNaN(numericQuantity)) {
      const match = quantityValue.match(/(\d+(?:\.\d+)?)/);
      if (match) numericQuantity = parseFloat(match[1]);
    }
    if (isNaN(numericQuantity)) return 0;

    if (packingCostsObj[numericQuantity] !== undefined) return parseFloat(packingCostsObj[numericQuantity]);
    const keyWithoutKg = numericQuantity.toString();
    if (packingCostsObj[keyWithoutKg] !== undefined) return parseFloat(packingCostsObj[keyWithoutKg]);
    const keyWithKg = numericQuantity + "kg";
    if (packingCostsObj[keyWithKg] !== undefined) return parseFloat(packingCostsObj[keyWithKg]);
    for (let key in packingCostsObj) {
      const keyNum = parseFloat(key);
      if (!isNaN(keyNum) && keyNum === numericQuantity) {
        return parseFloat(packingCostsObj[key]);
      }
    }
    return 0;
  };

  const getQuantityOptionsFromFirebase = (productData) => {
    if (!productData) return [];

    if (isRiceProduct(productData)) {
      let packSizes = [];
      if (productData.configurations?.quantityUnits) {
        const qUnits = productData.configurations.quantityUnits;
        packSizes = Array.isArray(qUnits) ? qUnits.map(q => parseFloat(q)) : Object.values(qUnits).map(v => parseFloat(v));
      } else if (productData.meta?.baseExMillPrices) {
        packSizes = Object.keys(productData.meta.baseExMillPrices).map(k => parseFloat(k));
      } else {
        packSizes = [5, 10, 30];
      }
      packSizes.sort((a,b) => a-b);
      return packSizes.map(size => ({
        value: size.toString(),
        label: `${size} kg`,
        actualQuantity: size,
        actualUnit: 'kg',
        packPrice: ricePackPrices[size] || 0
      }));
    }

    if (productData.quantity && Array.isArray(productData.quantity)) {
      return productData.quantity.map(q => ({
        value: q.toString(),
        label: `${q} ${productData.quantity_unit || 'units'}`,
        actualQuantity: q,
        actualUnit: productData.quantity_unit || 'units'
      }));
    }

    if (productData.packaging && productData.packaging.units_per_carton) {
      const unitsPerCarton = productData.packaging.units_per_carton;
      let unitLabel = '';
      let unitWeightValue = null;
      let unitWeightUnit = '';
      if (productData.packaging.unit_weight_g) {
        unitWeightValue = productData.packaging.unit_weight_g;
        unitWeightUnit = 'g';
      } else if (productData.packaging.unit_weight_ml) {
        unitWeightValue = productData.packaging.unit_weight_ml;
        unitWeightUnit = 'ml';
      } else if (productData.packaging.unit_weight) {
        unitWeightValue = productData.packaging.unit_weight;
        unitWeightUnit = productData.packaging.unit || 'g';
      }
      if (unitWeightValue) {
        unitLabel = `${unitsPerCarton} × ${unitWeightValue} ${unitWeightUnit} / carton`;
      } else {
        unitLabel = `${unitsPerCarton} units / carton`;
      }
      return [{
        value: "carton",
        label: unitLabel,
        actualQuantity: 1,
        actualUnit: "carton"
      }];
    }

    return [];
  };

  const getPackingOptionsFromFirebase = (productData) => {
    if (!productData) return [];
    if (isRiceProduct(productData)) {
      if (productData.configurations?.packingTypes) {
        const packTypes = productData.configurations.packingTypes;
        const types = Array.isArray(packTypes) ? packTypes : Object.values(packTypes);
        return types.map(p => ({ value: p, label: p, pricePerKg: 0 }));
      }
      if (productData.meta?.packing_costs) {
        const packingTypesFromCosts = Object.keys(productData.meta.packing_costs);
        if (packingTypesFromCosts.length) {
          return packingTypesFromCosts.map(p => ({ value: p, label: p, pricePerKg: 0 }));
        }
      }
    }
    let packTypeList = [];
    if (productData.pack_type) {
      if (typeof productData.pack_type === 'string') {
        packTypeList = productData.pack_type.split(',').map(s => s.trim());
      } else if (Array.isArray(productData.pack_type)) {
        packTypeList = productData.pack_type.flatMap(p => p.split(',').map(s => s.trim()));
      } else if (typeof productData.pack_type === 'object') {
        packTypeList = Object.values(productData.pack_type).flatMap(p => p.split(',').map(s => s.trim()));
      }
    } else if (productData.meta?.pack_type) {
      packTypeList = productData.meta.pack_type.split(',').map(s => s.trim());
    } else if (productData.packaging && productData.packaging.type) {
      packTypeList = [productData.packaging.type];
    }
    if (packTypeList.length > 0) {
      return packTypeList.map(p => ({ value: p, label: p, pricePerKg: 0 }));
    }
    if (productData.packaging && productData.packaging.units_per_carton) {
      const unitsPerCarton = productData.packaging.units_per_carton;
      const unitWeightMl = productData.packaging.unit_weight_ml;
      const unitWeightG = productData.packaging.unit_weight_g;
      let desc = '';
      if (unitWeightMl) desc = `${unitsPerCarton} × ${unitWeightMl} ml`;
      else if (unitWeightG) desc = `${unitsPerCarton} × ${unitWeightG} g`;
      else desc = `${unitsPerCarton} units/carton`;
      return [{ value: desc, label: desc, pricePerKg: 0 }];
    }
    return [];
  };

  const getQuantityUnitFromFirebase = (productData) => {
    if (!productData) return 'units';
    if (isRiceProduct(productData)) return 'kg';
    if (productData.quantity_unit) return productData.quantity_unit;
    if (productData.packaging) {
      if (productData.packaging.unit_weight_ml) return 'ml';
      if (productData.packaging.unit_weight_g) return 'g';
      if (productData.packaging.unit_weight && productData.packaging.unit) return productData.packaging.unit;
    }
    return 'units';
  };

  const getProductTypeFromData = (productData) => {
    if (!productData) return 'default';
    if (productData.category) return productData.category.toLowerCase();
    const name = productData.name?.toLowerCase() || '';
    const company = productData.companyName?.toLowerCase() || '';
    if (company.includes('siea')) return 'rice';
    if (company.includes('akil drinks')) return 'beverages';
    if (name.includes('juice') || name.includes('drink') || name.includes('beverage')) return 'beverages';
    if (name.includes('oil')) return 'oil';
    if (name.includes('dal') || name.includes('lentil')) return 'pulses';
    if (name.includes('spice')) return 'spices';
    if (name.includes('tea')) return 'tea';
    if (name.includes('almond') || name.includes('cashew')) return 'dryfruits';
    return 'default';
  };

  const analyzeProductDataPure = (productData, currency) => {
    if (!productData) return { priceValue: 0, priceDisplay: 'Contact for Price', origin: 'India', grades: [], hasGrades: false, productType: 'default', productImage: '' };

    const basePrice = getBasePrice(productData);
    let priceValue = 0;
    let convertedPrice = 0;
    let priceDisplay = '';

    if (basePrice.type === 'rice_pack') {
      priceValue = basePrice.min;
      convertedPrice = convertCurrency(priceValue, basePrice.currency, currency);
      priceDisplay = getProductPriceDisplay(productData);
    } else if (basePrice.value > 0) {
      priceValue = basePrice.value;
      convertedPrice = convertCurrency(priceValue, basePrice.currency, currency);
      priceDisplay = getProductPriceDisplay(productData);
    } else if (basePrice.min !== undefined && basePrice.max !== undefined) {
      const minConverted = convertCurrency(basePrice.min, basePrice.currency, currency);
      const maxConverted = convertCurrency(basePrice.max, basePrice.currency, currency);
      priceValue = (minConverted + maxConverted) / 2;
      convertedPrice = priceValue;
      priceDisplay = getProductPriceDisplay(productData);
    } else {
      priceDisplay = 'Contact for Price';
    }

    let origin = productData.origin || productData.Origin || productData.country_of_origin || "India";
    let grades = [];
    let hasGradesField = false;

    if (productData.grades && Array.isArray(productData.grades) && productData.grades.length > 0) {
      grades = productData.grades.map(g => {
        const priceInr = parseFloat(g.price_inr || g.price || "1.00");
        const priceConverted = convertCurrency(priceInr, 'INR', currency);
        return { value: g.grade || g.name || "Standard", price: priceConverted.toFixed(2), originalPrice: priceInr, currency: currency };
      });
      hasGradesField = true;
    }

    let productImage = productData.image || productData.imageUrl || productData.productImage || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&auto=format&fit=crop&q=60";

    let ricePackPricesNormalized = null;
    let ricePackSizesNormalized = null;
    if (basePrice.type === 'rice_pack' && basePrice.packPrices) {
      ricePackPricesNormalized = basePrice.packPrices;
      ricePackSizesNormalized = basePrice.packSizes;
    }

    return {
      priceValue: convertedPrice,
      convertedPrice,
      currency: currency,
      priceDisplay,
      origin,
      grades,
      hasGrades: hasGradesField,
      productType: getProductTypeFromData(productData),
      productImage,
      baseCurrency: basePrice.currency,
      baseValue: basePrice.value,
      basePriceObj: basePrice,
      ricePackPrices: ricePackPricesNormalized,
      ricePackSizes: ricePackSizesNormalized
    };
  };

  useEffect(() => {
    if (product) {
      const analysis = analyzeProductDataPure(product, selectedCurrency);
      setProductPriceDisplay(analysis.priceDisplay);
      setBaseProductPrice(analysis.priceValue.toString());
      setAvailableGrades(analysis.grades);
      setHasGrades(analysis.hasGrades);
      setProductOrigin(analysis.origin);
      setProductImage(analysis.productImage);
      setProductType(analysis.productType);
      setProductCurrency(analysis.currency);
      if (analysis.ricePackPrices) {
        setRicePackPrices(analysis.ricePackPrices);
        setRicePackSizes(analysis.ricePackSizes);
      } else {
        setRicePackPrices({});
        setRicePackSizes([]);
      }
      const qtyOptions = getQuantityOptionsFromFirebase(product);
      setQuantityOptions(qtyOptions);
      const packOptions = getPackingOptionsFromFirebase(product);
      setPackingOptions(packOptions);
      if (packOptions.length > 0 && !packing) setPacking(packOptions[0].value);
      if (qtyOptions.length > 0 && !quantity) setQuantity(qtyOptions[0].value);
      if (analysis.grades.length > 0 && !grade) setGrade(analysis.grades[0].value);
    }
  }, [product, selectedCurrency]);

  const calculatePackingCost = () => {
    if (!isRiceProduct(product)) {
      setPackingPricePerKg(0);
      setTotalPackingCost(0);
      return 0;
    }
    if (!packing || !quantity) {
      setPackingPricePerKg(0);
      setTotalPackingCost(0);
      return 0;
    }

    let packSizeKg = 0;
    if (quantity === "custom") {
      packSizeKg = parseFloat(customQuantity) || 0;
    } else {
      const selectedQuantityObj = quantityOptions.find(q => q.value === quantity);
      packSizeKg = selectedQuantityObj ? selectedQuantityObj.actualQuantity : 0;
    }
    if (packSizeKg <= 0) {
      setPackingPricePerKg(0);
      setTotalPackingCost(0);
      return 0;
    }

    const packingCostPerKgValue = getPackingCostFromFirebase(product, packing, quantity);
    setPackingPricePerKg(packingCostPerKgValue);
    const totalPackingCostInr = packingCostPerKgValue * packSizeKg * orderQuantity;
    setTotalPackingCost(totalPackingCostInr);
    return convertCurrency(totalPackingCostInr, 'INR', selectedCurrency);
  };

  const getPricePerPack = () => {
    if (!isRiceProduct(product)) return 0;
    if (!quantity || quantity === "custom") return 0;
    const selectedOption = quantityOptions.find(q => q.value === quantity);
    if (!selectedOption) return 0;
    const packSize = selectedOption.actualQuantity;
    const packPrice = ricePackPrices[packSize];
    if (!packPrice) return 0;
    const converted = convertCurrency(packPrice, 'INR', selectedCurrency);
    return converted;
  };

  const calculateQuantityPrice = () => {
    if (isRiceProduct(product)) {
      if (!quantity || quantity === "custom") return 0;
      const packPrice = getPricePerPack();
      if (packPrice === 0) return 0;
      let gradeMultiplier = 1;
      if (grade && hasGrades) {
        const selectedGrade = availableGrades.find(g => g.value === grade);
        if (selectedGrade) {
          const basePackPriceInr = ricePackPrices[parseFloat(quantity)] || packPrice;
          const gradePriceInr = parseFloat(selectedGrade.originalPrice);
          if (gradePriceInr && basePackPriceInr) {
            gradeMultiplier = gradePriceInr / basePackPriceInr;
          }
        }
      }
      return packPrice * gradeMultiplier * orderQuantity;
    }

    const analysisData = analyzeProductDataPure(product, selectedCurrency);
    const pricePerUnit = analysisData.priceValue;
    let actualUnits = 0;
    if (quantity === "custom") {
      actualUnits = parseFloat(customQuantity) || 0;
    } else {
      const selectedQuantity = quantityOptions.find(q => q.value === quantity);
      if (!selectedQuantity) return 0;
      actualUnits = selectedQuantity.actualQuantity || parseFloat(selectedQuantity.value) || 0;
    }
    if (actualUnits <= 0) return 0;
    let gradeMultiplier = 1;
    if (grade && hasGrades) {
      const selectedGrade = availableGrades.find(g => g.value === grade);
      if (selectedGrade) {
        gradeMultiplier = parseFloat(selectedGrade.price) / pricePerUnit;
      }
    }
    return actualUnits * pricePerUnit * gradeMultiplier * orderQuantity;
  };

  const calculateBrandingCost = (brandingRequiredValue) => {
    if (brandingRequiredValue === "Yes") {
      const baseBrandingCost = 35;
      return convertCurrency(baseBrandingCost, 'INR', selectedCurrency) * orderQuantity;
    }
    return 0;
  };

  const calculateTransportCost = () => {
    if (!transportType) return 0;
    let actualQuantity = 0;
    if (quantity === "custom") {
      actualQuantity = parseFloat(customQuantity) || 0;
    } else {
      const selectedQuantity = quantityOptions.find(q => q.value === quantity);
      if (!selectedQuantity) return 0;
      actualQuantity = selectedQuantity.actualQuantity || 0;
    }
    if (actualQuantity <= 0) return 0;
    const baseRates = { road: 5, railway: 3, air: 50, ocean: 15 };
    const ratePerUnit = baseRates[transportType] || 0;
    const convertedRate = convertCurrency(ratePerUnit, 'INR', selectedCurrency);
    return actualQuantity * convertedRate * orderQuantity;
  };

  const calculatePrices = () => {
    let packingPriceValue = 0;
    let quantityPriceValue = 0;
    let brandingCostValue = 0;
    let transportCostValue = 0;

    quantityPriceValue = calculateQuantityPrice();
    if (isRiceProduct(product)) {
      packingPriceValue = calculatePackingCost();
    } else if (packing) {
      const selectedPacking = packingOptions.find(p => p.value === packing);
      if (selectedPacking) {
        const packingPriceBase = parseFloat(selectedPacking.pricePerKg || 0);
        packingPriceValue = convertCurrency(packingPriceBase, 'INR', selectedCurrency) * orderQuantity;
      }
    }
    brandingCostValue = calculateBrandingCost(brandingRequired);
    transportCostValue = calculateTransportCost();

    const subtotal = quantityPriceValue + packingPriceValue + brandingCostValue + transportCostValue;
    setQuantityPrice(quantityPriceValue);
    setPackingPrice(packingPriceValue);
    setBrandingCost(brandingCostValue);
    setTransportCost(transportCostValue);
    setTotalPrice(subtotal);
  };

  const getDisplayPrices = () => {
    const analysisData = analyzeProductDataPure(product, selectedCurrency);
    const selectedCurrencySymbol = getCurrencySymbol();
    return {
      baseProductPrice: `${selectedCurrencySymbol}${formatNumber(analysisData.priceValue)}`,
      gradePrice: `${selectedCurrencySymbol}${formatNumber(gradePrice)}`,
      packingPrice: `${selectedCurrencySymbol}${formatNumber(packingPrice)}`,
      quantityPrice: `${selectedCurrencySymbol}${formatNumber(quantityPrice)}`,
      brandingCost: brandingRequired === "Yes" ? `${selectedCurrencySymbol}${formatNumber(brandingCost)}` : "Not Required",
      transportCost: transportType ? `${selectedCurrencySymbol}${formatNumber(transportCost)}` : "Not Required",
      totalPrice: `${selectedCurrencySymbol}${formatNumber(totalPrice)}`,
      finalTotalPrice: `${selectedCurrencySymbol}${formatNumber(totalPrice)}`
    };
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
    return number.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

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

  const handleFullNameChange = (e) => setFullName(e.target.value);
  const handleCountryNameChange = (e) => {
    const newCountry = e.target.value;
    setCountry(newCountry);
    const isIndia = newCountry.trim().toLowerCase() === 'india';
    if (!isIndia && (transportType === 'road' || transportType === 'railway')) {
      setTransportType('');
      setPickupLocation({ city: "", state: "", country: "" });
      setDeliveryLocation({ city: "", state: "", country: "" });
      setRailLoadingStation({ city: "", state: "", country: "" });
      setRailDestinationStation({ city: "", state: "", country: "" });
      setVehicleType("");
    } else if (isIndia && transportType === 'ocean') {
      setTransportType('');
      setPortOfLoading({ country: "", state: "", portName: "" });
      setPortOfDestination({ country: "", state: "", portName: "" });
    }
  };
  const handleStateChangeInput = (e) => setState(e.target.value);
  const handleCityChange = (e) => setCity(e.target.value);
  const handlePincodeChange = (e) => setPincode(e.target.value);

  const handleQuantityChange = (e) => {
    const value = e.target.value;
    setQuantity(value);
    if (value !== "custom") setCustomQuantity("");
    if (isRiceProduct(product) && packing) {
      const costPerKg = getPackingCostFromFirebase(product, packing, value);
      setPackingPricePerKg(costPerKg);
    }
  };

  const handleCustomQuantityChange = (e) => {
    const value = e.target.value;
    setCustomQuantity(value);
    if (isRiceProduct(product) && packing) {
      const costPerKg = getPackingCostFromFirebase(product, packing, 'custom');
      setPackingPricePerKg(costPerKg);
    }
  };

  const handleGradeChange = (e) => setGrade(e.target.value);
  const handlePackingChange = (e) => {
    const newPacking = e.target.value;
    setPacking(newPacking);
    if (isRiceProduct(product) && quantity) {
      const costPerKg = getPackingCostFromFirebase(product, newPacking, quantity);
      setPackingPricePerKg(costPerKg);
    }
  };
  const handleCurrencyChange = (e) => setSelectedCurrency(e.target.value);
  const handleBrandingChange = (e) => setBrandingRequired(e.target.value);
  const handleTransportTypeChange = (e) => {
    const newType = e.target.value;
    setTransportType(newType);
    if (newType !== 'road') {
      setPickupLocation({ city: "", state: "", country: "" });
      setDeliveryLocation({ city: "", state: "", country: "" });
      setVehicleType("");
    }
    if (newType !== 'railway') {
      setRailLoadingStation({ city: "", state: "", country: "" });
      setRailDestinationStation({ city: "", state: "", country: "" });
    }
    if (newType !== 'air') {
      setAirportOfLoading({ country: "", airportName: "" });
      setAirportOfDestination({ country: "", airportName: "" });
    }
    if (newType !== 'ocean') {
      setPortOfLoading({ country: "", state: "", portName: "" });
      setPortOfDestination({ country: "", state: "", portName: "" });
    }
  };
  const handlePickupLocationChange = (field, value) => setPickupLocation(prev => ({ ...prev, [field]: value }));
  const handleDeliveryLocationChange = (field, value) => setDeliveryLocation(prev => ({ ...prev, [field]: value }));
  const handleAirportLoadingChange = (field, value) => setAirportOfLoading(prev => ({ ...prev, [field]: value }));
  const handleAirportDestinationChange = (field, value) => setAirportOfDestination(prev => ({ ...prev, [field]: value }));
  const handlePortOfLoadingChange = (field, value) => setPortOfLoading(prev => ({ ...prev, [field]: value }));
  const handlePortOfDestinationChange = (field, value) => setPortOfDestination(prev => ({ ...prev, [field]: value }));
  const handleRailLoadingChange = (field, value) => setRailLoadingStation(prev => ({ ...prev, [field]: value }));
  const handleRailDestinationChange = (field, value) => setRailDestinationStation(prev => ({ ...prev, [field]: value }));

  const handleIncreaseOrderQuantity = () => setOrderQuantity(prev => prev + 1);
  const handleDecreaseOrderQuantity = () => { if (orderQuantity > 1) setOrderQuantity(prev => prev - 1); };

  const handleAutoFillFromProfile = () => {
    if (!profile) return;
    setFullName(profile.name || "");
    setEmail(profile.email || "");
    setCountry(profile.country || "");
    setState(profile.state || "");
    setCity(profile.city || "");
    setPincode(profile.pincode || "");
    if (profile.phone) {
      const phoneStr = profile.phone.toString();
      let foundCountryCode = "+91";
      const matchedCountry = countryOptions.find((opt) => phoneStr.startsWith(opt.value));
      if (matchedCountry) {
        foundCountryCode = matchedCountry.value;
        const phoneWithoutCode = phoneStr.replace(matchedCountry.value, "");
        setPhoneNumber(phoneWithoutCode);
        setCountryCode(foundCountryCode);
        if (matchedCountry.currency) setSelectedCurrency(matchedCountry.currency);
      } else {
        setCountryCode('+91');
        setPhoneNumber(phoneStr);
      }
    } else {
      setCountryCode("+91");
      setPhoneNumber("");
    }
    setPhoneError("");
    setEmailError("");
    setHasAutoFilled(true);
  };

  const getAvailableTransportTypes = () => {
    const isIndia = country.trim().toLowerCase() === 'india';
    if (isIndia) {
      return [
        { value: "road", label: "🚛 Road Transport" },
        { value: "railway", label: "🚆 Railway Transport" },
        { value: "air", label: "✈️ Air Freight" }
      ];
    } else {
      return [
        { value: "air", label: "✈️ Air Freight" },
        { value: "ocean", label: "🚢 Ocean Freight" }
      ];
    }
  };

  const getSelectedQuantityDisplay = () => {
    if (quantity === "custom") {
      return `${customQuantity || 0} ${getQuantityUnitFromFirebase(product)}`;
    } else {
      const selectedOption = quantityOptions.find(q => q.value === quantity);
      return selectedOption ? selectedOption.label : "Not selected";
    }
  };

  useEffect(() => {
    calculatePrices();
  }, [grade, packing, quantity, selectedCurrency, customQuantity, brandingRequired, transportType, orderQuantity, ricePackPrices, availableGrades, hasGrades]);

  useEffect(() => {
    if (isOpen && profile && !hasAutoFilled) handleAutoFillFromProfile();
  }, [isOpen, profile]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    const requiredFields = [
      { field: fullName, name: "Full Name" },
      { field: email, name: "Email" },
      { field: country, name: "Country" },
      { field: state, name: "State" },
      { field: city, name: "City" },
      { field: pincode, name: "Pincode" },
      { field: brandingRequired, name: "Brand Required" },
      { field: selectedCurrency, name: "Currency" },
      { field: quantity, name: "Quantity" },
      { field: packing, name: "Packing" },
      { field: transportType, name: "Transport Type" }
    ];
    const missingFields = requiredFields.filter(f => !f.field);
    if (missingFields.length > 0) {
      const errorMsg = `Please fill all required fields: ${missingFields.map(f => f.name).join(', ')}`;
      alert(errorMsg);
      setSubmitError(errorMsg);
      return;
    }

    if (transportType === 'road') {
      if (!pickupLocation.city || !pickupLocation.state || !pickupLocation.country ||
        !deliveryLocation.city || !deliveryLocation.state || !deliveryLocation.country) {
        alert("Please fill all pickup and delivery location fields for road transport.");
        return;
      }
    } else if (transportType === 'railway') {
      if (!railLoadingStation.city || !railLoadingStation.state || !railLoadingStation.country ||
        !railDestinationStation.city || !railDestinationStation.state || !railDestinationStation.country) {
        alert("Please fill all loading and destination station fields for railway transport.");
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

    const analysisData = analyzeProductDataPure(product, selectedCurrency);
    if (analysisData.hasGrades && !grade) {
      alert("Please select a grade.");
      return;
    }
    if (quantity === "custom" && (!customQuantity || parseFloat(customQuantity) <= 0)) {
      alert("Please enter a valid custom quantity.");
      return;
    }

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
    const displayPrices = getDisplayPrices();
    const currencySymbol = getCurrencySymbol();

    const selectedQuantityOption = quantityOptions.find(opt => opt.value === quantity);
    let quantityDisplay = "";
    let actualQuantity = 0;
    let actualUnit = "";
    if (quantity === "custom") {
      quantityDisplay = `${customQuantity} ${getQuantityUnitFromFirebase(product)}`;
      actualQuantity = parseFloat(customQuantity) * orderQuantity;
      actualUnit = getQuantityUnitFromFirebase(product);
    } else {
      quantityDisplay = selectedQuantityOption ? selectedQuantityOption.label : `${quantity} ${getQuantityUnitFromFirebase(product)}`;
      actualQuantity = (selectedQuantityOption ? selectedQuantityOption.actualQuantity : parseFloat(quantity)) * orderQuantity;
      actualUnit = selectedQuantityOption ? selectedQuantityOption.actualUnit : getQuantityUnitFromFirebase(product);
    }

    let transportDetails = {};
    if (transportType === 'road') {
      transportDetails = { transportType: 'road', pickupLocation, deliveryLocation, vehicleType };
    } else if (transportType === 'railway') {
      transportDetails = { transportType: 'railway', railLoadingStation, railDestinationStation };
    } else if (transportType === 'air') {
      transportDetails = { transportType: 'air', airportOfLoading, airportOfDestination };
    } else if (transportType === 'ocean') {
      transportDetails = { transportType: 'ocean', portOfLoading, portOfDestination };
    }

    const quoteData = {
      name: fullName, email: email, phone: fullPhoneNumber, country: country, state: state, city: city, pincode: pincode,
      product: product?.name || "", productId: product?.id || "", variety: product?.variety || "",
      brand: product?.brand || product?.brandName || "", origin: analysisData.origin, grade: grade || "Standard",
      packing: packing, packingPricePerKg: packingPricePerKg, totalPackingCost: totalPackingCost,
      quantity: quantityDisplay, actualQuantity: actualQuantity, actualUnit: actualUnit, productImage: productImage,
      brandingRequired: brandingRequired, currency: selectedCurrency, currencySymbol: currencySymbol,
      productCurrency: productCurrency, transportDetails, transportCost: transportCost,
      priceBreakdown: {
        note: "This is an estimated bill. Final pricing may vary based on actual costs and market conditions.",
        originalPrice: productPriceDisplay, ...(grade && { gradeLine: `Grade: ${grade}` }),
        packingLine: `Packing: ${packing}`, ...(isRiceProduct(product) && totalPackingCost > 0 && {
          packingCostLine: `Packing Cost: ₹${totalPackingCost.toFixed(2)} (${packingPricePerKg}/kg × ${actualQuantity}kg)`
        }),
        quantityLine: `Quantity: ${quantityDisplay}`, quantityPriceLine: `Quantity Price: ${displayPrices.quantityPrice}`,
        ...(brandingRequired === "Yes" && { brandingCostLine: `Branding/Custom Printing: ${displayPrices.brandingCost}` }),
        transportTypeLine: `Transport Type: ${transportType.toUpperCase()}`,
        transportCostLine: `Transport Cost: ${displayPrices.transportCost}`,
        finalTotalLine: `Final Total: ${displayPrices.finalTotalPrice}`
      },
      displayValues: {
        originalPrice: productPriceDisplay, grade: grade || "Not Selected", packing: packing,
        packingCost: totalPackingCost > 0 ? `₹${totalPackingCost.toFixed(2)}` : "Not Applicable",
        quantity: quantityDisplay, brandingCost: displayPrices.brandingCost, transportType: transportType.toUpperCase(),
        transportCost: displayPrices.transportCost, finalTotal: displayPrices.finalTotalPrice
      },
      additionalInfo: additionalInfo || "", userId: profile?.uid || "guest", userEmail: profile?.email || email,
      timestamp: Date.now(), date: new Date().toISOString(), readableDate: new Date().toLocaleString(),
      productType: analysisData.productType, status: "new", source: "website", isNew: true, hasAutoFilled: hasAutoFilled,
      profileUsed: !!profile, orderQuantity: orderQuantity, selectedCurrency: selectedCurrency,
      currencyRates: currencyRates, currencySymbols: currencySymbols
    };

    setIsSubmitting(true);
    try {
      const quoteId = await submitQuote(quoteData);
      let transportMessage = "";
      if (transportType === 'road') {
        transportMessage = `- Transport: Road\n- Pickup: ${pickupLocation.city}, ${pickupLocation.state}, ${pickupLocation.country}\n- Delivery: ${deliveryLocation.city}, ${deliveryLocation.state}, ${deliveryLocation.country}\n${vehicleType ? `- Vehicle: ${vehicleType}` : ''}`;
      } else if (transportType === 'railway') {
        transportMessage = `- Transport: Railway\n- Loading Station: ${railLoadingStation.city}, ${railLoadingStation.state}, ${railLoadingStation.country}\n- Destination Station: ${railDestinationStation.city}, ${railDestinationStation.state}, ${railDestinationStation.country}`;
      } else if (transportType === 'air') {
        transportMessage = `- Transport: Air Freight\n- Airport of Loading: ${airportOfLoading.airportName}, ${airportOfLoading.country}\n- Airport of Destination: ${airportOfDestination.airportName}, ${airportOfDestination.country}`;
      } else if (transportType === 'ocean') {
        transportMessage = `- Transport: Ocean Freight\n- Port of Loading: ${portOfLoading.portName}, ${portOfLoading.state}, ${portOfLoading.country}\n- Port of Destination: ${portOfDestination.portName}, ${portOfDestination.state}, ${portOfDestination.country}`;
      }
      const packingCostMessage = isRiceProduct(product) && totalPackingCost > 0 ? `- Packing Cost: ₹${totalPackingCost.toFixed(2)} (${packingPricePerKg}/kg × ${actualQuantity}kg)` : "";
      const message = `Hello! I want a quote for:\n- Name: ${fullName}\n- Email: ${email}\n- Phone: ${fullPhoneNumber}\n- Country: ${country}\n- State: ${state}\n- City: ${city}\n- Pincode: ${pincode}\n- Product: ${product?.name || ""}\n- Origin: ${analysisData.origin}\n- Variety: ${product?.variety || ""}\n- Brand: ${product?.brand || product?.brandName || ""}\n${grade ? `- Grade: ${grade}` : ""}\n- Packing: ${packing}\n${packingCostMessage}\n- Quantity: ${quantityDisplay}\n- Order Quantity Multiplier: ${orderQuantity}\n- Brand Required: ${brandingRequired}\n- Selected Currency: ${selectedCurrency}\n${transportMessage}\n- Estimated Bill:\n  • Original Price: ${productPriceDisplay}\n  ${grade ? `  • Grade: ${grade}` : ""}\n  • Packing: ${packing}\n  ${packingCostMessage ? `  • ${packingCostMessage}` : ""}\n  • Quantity: ${quantityDisplay}\n  • Quantity Price: ${displayPrices.quantityPrice}\n  ${brandingRequired === "Yes" ? `• Branding/Custom Printing: ${displayPrices.brandingCost}` : ""}\n  • Transport Cost: ${displayPrices.transportCost}\n  • Final Total: ${displayPrices.finalTotalPrice}\n${additionalInfo ? `- Additional Info: ${additionalInfo}` : ""}\nThank you!`;
      window.open(`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
      alert(`✅ Order #${quoteId.substring(0, 8)} submitted successfully! Check "My Orders" for details.`);
      if (onOrderSubmitted) onOrderSubmitted(quoteId);
      setShowThankYou(true);
      resetForm();
    } catch (err) {
      console.error("❌ Error submitting form:", err);
      alert(err.message || "Something went wrong while submitting your quote. Please try again.");
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setGrade(""); setPacking(""); setQuantity(""); setBrandingRequired("No");
    setAdditionalInfo(""); setCustomQuantity(""); setGradePrice("0.00"); setPackingPrice("0.00");
    setQuantityPrice(0); setBrandingCost(0); setTransportCost(0); setTotalPrice(0);
    setPackingPricePerKg(0); setTotalPackingCost(0); setTransportType(""); setPickupLocation({ city: "", state: "", country: "" });
    setDeliveryLocation({ city: "", state: "", country: "" }); setVehicleType("");
    setAirportOfLoading({ country: "", airportName: "" }); setAirportOfDestination({ country: "", airportName: "" });
    setPortOfLoading({ country: "", state: "", portName: "" }); setPortOfDestination({ country: "", state: "", portName: "" });
    setRailLoadingStation({ city: "", state: "", country: "" }); setRailDestinationStation({ city: "", state: "", country: "" });
    setTransportPrice("0-0"); setProductCurrency("USD"); setProductOrigin(""); setAvailableGrades([]);
    setHasGrades(false); setProductPriceDisplay(""); setQuantityOptions([]); setPackingOptions([]);
    setHasAutoFilled(false); setSubmitError(""); setProductImage(""); setOrderQuantity(1); setProductType('default');
    setFullName(""); setEmail(""); setPhoneNumber(""); setCountryCode("+91"); setCountry("");
    setState(""); setCity(""); setPincode(""); setPhoneError(""); setEmailError("");
    setRicePackPrices({});
    setRicePackSizes([]);
  };

  const handleClose = () => {
    resetForm();
    setShowThankYou(false);
    onClose();
  };

  if (!isOpen) return null;

  const analysisData = analyzeProductDataPure(product, selectedCurrency);
  const currencySymbol = getCurrencySymbol();
  const displayPrices = getDisplayPrices();
  const availableTransportTypes = getAvailableTransportTypes();
  const selectedQuantityLabel = quantityOptions.find(q => q.value === quantity)?.label || "Not selected";
  const availableQuantityOptions = (() => {
    if (!packing || !isRiceProduct(product)) return quantityOptions;
    const packingOption = packingOptions.find(opt => opt.value === packing);
    if (!packingOption || !packingOption.applicableForQuantities || packingOption.applicableForQuantities.length === 0) {
      return quantityOptions;
    }
    return quantityOptions.filter(opt =>
      opt.value === 'custom' || packingOption.applicableForQuantities.includes(parseInt(opt.value))
    );
  })();

  return (
    <>
      <div className="buy-modal-overlay single-product">
        <div className="buy-modal-container" ref={modalRef}>
          <button className="buy-modal-close-btn" onClick={handleClose} aria-label="Close modal">&times;</button>
          <div className="buy-modal-header">
            <h2 className="buy-modal-title">Request Quote ({selectedCurrency})</h2>
            <p className="buy-modal-subtitle">Fill out the form below and we'll get back to you shortly</p>
            <div className="product-type-info">
              <small>📦 {productType?.charAt(0).toUpperCase() + productType?.slice(1)}</small>
              {product?.companyName && <small>🏢 {product.companyName}</small>}
              {product?.brandName && product.brandName !== 'General' && <small>🏷️ {product.brandName}</small>}
            </div>
          </div>
          <div className="buy-modal-body">
            <div className="modal-layout">
              <div className="form-section-container" ref={formContainerRef}>
                <form onSubmit={handleSubmit}>
                  {profile && !hasAutoFilled && (
                    <div className="auto-fill-section">
                      <button type="button" className="auto-fill-btn" onClick={handleAutoFillFromProfile}>🔄 Auto-fill from Profile</button>
                      <small className="auto-fill-note">Click to auto-fill your information from your profile. You can still edit any field.</small>
                    </div>
                  )}
                  {submitError && <div className="submit-error-section"><div className="error-message alert-error">⚠️ {submitError}</div></div>}
                  <section className="form-section">
                    <h3 className="section-title"><Package size={20} style={{ marginRight: '8px' }} />Product Details ({selectedCurrency})</h3>
                    {availableCurrencies.length > 1 && (
                      <div className="form-group mb-3">
                        <label className="form-label">Display Currency</label>
                        <select value={selectedCurrency} onChange={handleCurrencyChange} className="form-select">
                          {availableCurrencies.map(curr => <option key={curr.code} value={curr.code}>{curr.symbol} {curr.code}</option>)}
                        </select>
                      </div>
                    )}
                    <div className="standard-product-display">
                      <div className="standard-product-item single">
                        <div className="standard-product-image">
                          <div className="order-quantity-buttons">
                            <button type="button" className="order-quantity-btn" onClick={handleDecreaseOrderQuantity}><Minus size={16} /></button>
                            <span className="order-quantity-display">{orderQuantity}</span>
                            <button type="button" className="order-quantity-btn" onClick={handleIncreaseOrderQuantity}><Plus size={16} /></button>
                          </div>
                          <img src={productImage} alt={product?.name} onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&auto=format&fit=crop&q=60'} />
                          <div className="product-badge">
                            {product?.companyName === 'Nut Walker' ? '🥜 Dry Fruits' : product?.companyName === 'Heritage' ? '🌾 Heritage' : product?.companyName === 'Akil Drinks' ? '🥤 Beverages' : product?.companyName === 'SIEA' ? '🍚 Rice' : '⭐ Premium'}
                          </div>
                        </div>
                        <div className="standard-product-details">
                          <div className="standard-product-header">
                            <h4 className="standard-product-name">{product?.name}</h4>
                            <span className="standard-product-brand">{product?.companyName || 'Brand'}</span>
                            {product?.brandName && product.brandName !== 'General' && <span className="standard-product-sub-brand">{product.brandName}</span>}
                          </div>
                          <div className="standard-product-price-section">
                            <div className="standard-price-display">
                              <span className="standard-price-amount">{productPriceDisplay}</span>
                              <span className="standard-price-unit">each</span>
                            </div>
                            {quantity && quantity !== "custom" && (
                              <div className="standard-total-price">
                                <span className="total-label">Total ({orderQuantity} × {selectedQuantityLabel}):</span>
                                <span className="total-amount">{displayPrices.quantityPrice}</span>
                              </div>
                            )}
                          </div>
                          <div className="standard-product-config single">
                            {hasGrades && availableGrades.length > 0 && (
                              <div className="config-row">
                                <span className="config-label">Grade:</span>
                                <select value={grade} onChange={handleGradeChange} required className="config-select-small">
                                  <option value="">Select Grade</option>
                                  {availableGrades.map((gradeOption, index) => (
                                    <option key={index} value={gradeOption.value}>{gradeOption.value} ({currencySymbol}{gradeOption.price}/kg)</option>
                                  ))}
                                </select>
                              </div>
                            )}
                            <div className="config-row">
                              <span className="config-label">Packing:</span>
                              <select value={packing} onChange={handlePackingChange} required className="config-select-small">
                                <option value="">Select Packing</option>
                                {packingOptions.map((packingOption, index) => (
                                  <option key={index} value={packingOption.value}>{packingOption.label} {packingOption.pricePerKg ? `(${currencySymbol}${packingOption.pricePerKg}/kg)` : ''}</option>
                                ))}
                              </select>
                            </div>
                            <div className="config-row">
                              <span className="config-label">Quantity:</span>
                              <div className="quantity-select-group">
                                <select value={quantity} onChange={handleQuantityChange} required className="config-select-small">
                                  <option value="">Select Quantity</option>
                                  {availableQuantityOptions.map((option) => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                  ))}
                                </select>
                                {quantity === "custom" && (
                                  <input type="number" placeholder={`Enter custom quantity in ${getQuantityUnitFromFirebase(product)}`} value={customQuantity} onChange={handleCustomQuantityChange} className="custom-quantity-input" min="1" step="1" required />
                                )}
                              </div>
                            </div>
                          </div>
                          {isRiceProduct(product) && packingPricePerKg > 0 && quantity && quantity !== 'custom' && (
                            <div className="packing-cost-card">
                              <div className="packing-cost-row">
                                <span className="packing-cost-label">Packing Cost per kg:</span>
                                <span className="packing-cost-value">₹{packingPricePerKg}/kg</span>
                              </div>
                              <div className="packing-cost-row">
                                <span className="packing-cost-label">Total Packing Cost:</span>
                                <span className="packing-cost-value">₹{totalPackingCost.toFixed(2)}</span>
                              </div>
                              <div className="packing-cost-note">
                                ({packingPricePerKg}/kg × {quantity}kg × {orderQuantity} order qty)
                              </div>
                            </div>
                          )}
                          <div className="standard-product-meta">
                            {product?.origin && <div className="meta-item"><span className="meta-label">Origin:</span><span className="meta-value">{product.origin}</span></div>}
                            {product?.variety && <div className="meta-item"><span className="meta-label">Variety:</span><span className="meta-value">{product.variety}</span></div>}
                            <div className="meta-item"><span className="meta-label">Selected Qty:</span><span className="meta-value">{getSelectedQuantityDisplay()}</span></div>
                            <div className="meta-item"><span className="meta-label">Order Qty:</span><span className="meta-value">{orderQuantity} units</span></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>
                  <section className="form-section">
                    <h3 className="section-title">Contact Information</h3>
                    <div className="form-group"><label className="form-label">Full Name *</label><input type="text" placeholder="Enter your full name" value={fullName} onChange={handleFullNameChange} required className="form-input" /></div>
                    <div className="form-group"><label className="form-label">Email Address *</label><input type="email" placeholder="your.email@example.com" value={email} onChange={handleEmailChange} required className="form-input" />{emailError && <div className="error-message">{emailError}</div>}</div>
                    <div className="form-group"><label className="form-label">Country *</label><input type="text" placeholder="Enter your country (e.g., India, USA, UAE)" value={country} onChange={handleCountryNameChange} required className="form-input" /></div>
                    <div className="form-group"><label className="form-label">State/Province *</label><input type="text" placeholder="Enter your state/province" value={state} onChange={handleStateChangeInput} required className="form-input" /></div>
                    <div className="form-group"><label className="form-label">City/Town *</label><input type="text" placeholder="Enter your city/town" value={city} onChange={handleCityChange} required className="form-input" /></div>
                    <div className="form-group"><label className="form-label">Pincode/ZIP *</label><input type="text" placeholder="Enter your pincode/ZIP" value={pincode} onChange={handlePincodeChange} required className="form-input" /></div>
                    <div className="form-group">
                      <label className="form-label">Phone Number *</label>
                      <div className="phone-input-group">
                        <select value={countryCode} onChange={handleCountryChange} className="country-code-select">
                          {countryOptions.map((option) => <option key={option.value} value={option.value}>{option.flag} {option.value} ({option.name})</option>)}
                        </select>
                        <input type="tel" placeholder={`Phone number (${getCurrentCountry()?.length || 10} digits)`} value={phoneNumber} onChange={handlePhoneChange} maxLength={getCurrentCountry()?.length || 10} required className="form-input phone-input" />
                      </div>
                      {phoneError && <div className="error-message">{phoneError}</div>}
                    </div>
                  </section>
                  <section className="form-section">
                    <h3 className="section-title">Transport Details</h3>
                    <div className="form-group">
                      <label className="form-label">Select Transport Type *</label>
                      <select value={transportType} onChange={handleTransportTypeChange} required className="form-select">
                        <option value="">Select Transport Type</option>
                        {availableTransportTypes.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>
                    {transportType === 'road' && (
                      <>
                        <div className="form-group"><label className="form-label">Pickup Location *</label><div className="transport-location-group"><input type="text" placeholder="City" value={pickupLocation.city} onChange={(e) => handlePickupLocationChange('city', e.target.value)} className="form-input" required /><input type="text" placeholder="State" value={pickupLocation.state} onChange={(e) => handlePickupLocationChange('state', e.target.value)} className="form-input" required /><input type="text" placeholder="Country" value={pickupLocation.country} onChange={(e) => handlePickupLocationChange('country', e.target.value)} className="form-input" required /></div></div>
                        <div className="form-group"><label className="form-label">Delivery Location *</label><div className="transport-location-group"><input type="text" placeholder="City" value={deliveryLocation.city} onChange={(e) => handleDeliveryLocationChange('city', e.target.value)} className="form-input" required /><input type="text" placeholder="State" value={deliveryLocation.state} onChange={(e) => handleDeliveryLocationChange('state', e.target.value)} className="form-input" required /><input type="text" placeholder="Country" value={deliveryLocation.country} onChange={(e) => handleDeliveryLocationChange('country', e.target.value)} className="form-input" required /></div></div>
                        <div className="form-group"><label className="form-label">Vehicle Type (Optional)</label><select value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} className="form-select"><option value="">Select Vehicle Type (Optional)</option>{vehicleOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div>
                      </>
                    )}
                    {transportType === 'railway' && (
                      <>
                        <div className="form-group"><label className="form-label">Loading Station *</label><div className="transport-location-group"><input type="text" placeholder="City" value={railLoadingStation.city} onChange={(e) => handleRailLoadingChange('city', e.target.value)} className="form-input" required /><input type="text" placeholder="State" value={railLoadingStation.state} onChange={(e) => handleRailLoadingChange('state', e.target.value)} className="form-input" required /><input type="text" placeholder="Country" value={railLoadingStation.country} onChange={(e) => handleRailLoadingChange('country', e.target.value)} className="form-input" required /></div></div>
                        <div className="form-group"><label className="form-label">Destination Station *</label><div className="transport-location-group"><input type="text" placeholder="City" value={railDestinationStation.city} onChange={(e) => handleRailDestinationChange('city', e.target.value)} className="form-input" required /><input type="text" placeholder="State" value={railDestinationStation.state} onChange={(e) => handleRailDestinationChange('state', e.target.value)} className="form-input" required /><input type="text" placeholder="Country" value={railDestinationStation.country} onChange={(e) => handleRailDestinationChange('country', e.target.value)} className="form-input" required /></div></div>
                      </>
                    )}
                    {transportType === 'air' && (
                      <>
                        <div className="form-group"><label className="form-label">Airport of Loading *</label><div className="airport-group"><input type="text" placeholder="Country" value={airportOfLoading.country} onChange={(e) => handleAirportLoadingChange('country', e.target.value)} className="form-input" required /><input type="text" placeholder="Airport Name" value={airportOfLoading.airportName} onChange={(e) => handleAirportLoadingChange('airportName', e.target.value)} className="form-input" required /></div></div>
                        <div className="form-group"><label className="form-label">Airport of Destination *</label><div className="airport-group"><input type="text" placeholder="Country" value={airportOfDestination.country} onChange={(e) => handleAirportDestinationChange('country', e.target.value)} className="form-input" required /><input type="text" placeholder="Airport Name" value={airportOfDestination.airportName} onChange={(e) => handleAirportDestinationChange('airportName', e.target.value)} className="form-input" required /></div></div>
                      </>
                    )}
                    {transportType === 'ocean' && (
                      <>
                        <div className="form-group"><label className="form-label">Port of Loading *</label><div className="transport-selection-group"><div className="transport-row"><div className="transport-column"><label className="form-label">Country</label><input type="text" placeholder="Enter country" value={portOfLoading.country} onChange={(e) => handlePortOfLoadingChange('country', e.target.value)} className="form-input" required /></div><div className="transport-column"><label className="form-label">State</label><input type="text" placeholder="Enter state" value={portOfLoading.state} onChange={(e) => handlePortOfLoadingChange('state', e.target.value)} className="form-input" required /></div><div className="transport-column"><label className="form-label">Port Name</label><input type="text" placeholder="Enter port name" value={portOfLoading.portName} onChange={(e) => handlePortOfLoadingChange('portName', e.target.value)} className="form-input" required /></div></div></div></div>
                        <div className="form-group"><label className="form-label">Port of Destination *</label><div className="transport-selection-group"><div className="transport-row"><div className="transport-column"><label className="form-label">Country</label><input type="text" placeholder="Enter country" value={portOfDestination.country} onChange={(e) => handlePortOfDestinationChange('country', e.target.value)} className="form-input" required /></div><div className="transport-column"><label className="form-label">State</label><input type="text" placeholder="Enter state" value={portOfDestination.state} onChange={(e) => handlePortOfDestinationChange('state', e.target.value)} className="form-input" required /></div><div className="transport-column"><label className="form-label">Port Name</label><input type="text" placeholder="Enter port name" value={portOfDestination.portName} onChange={(e) => handlePortOfDestinationChange('portName', e.target.value)} className="form-input" required /></div></div></div></div>
                      </>
                    )}
                    {transportType && <div className="transport-price-info"><small>Transport Cost Estimate: {displayPrices.transportCost}</small></div>}
                  </section>
                  <section className="form-section">
                    <h3 className="section-title">Order Requirements</h3>
                    <div className="form-group">
                      <label className="form-label">Brand Required (If Any) *</label>
                      <select value={brandingRequired} onChange={handleBrandingChange} required className="form-select">
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                      <div className="branding-info">
                        <small>Add your logo/branding to the packaging - Additional charge: {currencySymbol}35 per order</small>
                        {brandingRequired === "Yes" && <div className="branding-cost-preview"><small>Branding/custom printing cost: {displayPrices.brandingCost}</small></div>}
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Additional Information</label>
                      <textarea placeholder="Enter any additional information here" value={additionalInfo} onChange={(e) => setAdditionalInfo(e.target.value)} className="form-textarea" rows="4" />
                    </div>
                  </section>
                  <div className="form-actions">
                    <button type="submit" className="submit-btn" disabled={isSubmitting}>
                      {isSubmitting ? <span className="btn-loading"><span className="btn-spinner"></span>Submitting...</span> : `Request Quote(Include CIF)`}
                    </button>
                    <button type="button" onClick={handleClose} className="cancel-btn">Cancel</button>
                  </div>
                </form>
              </div>
              <div className="estimate-section-container" ref={estimateContainerRef}>
                <div className="price-breakdown-section">
                  <h4 className="price-breakdown-title">Estimated Bill Breakdown ({selectedCurrency})</h4>
                  <div className="estimate-note"><small>This is an estimated bill. Final pricing may vary based on actual costs and market conditions.</small></div>
                  <div className="price-breakdown-grid">
                    {transportType && <div className="price-item transport-summary"><span className="price-label">Transport Type:</span><span className="price-value">{transportType === 'road' ? '🚛 Road' : transportType === 'railway' ? '🚆 Railway' : transportType === 'air' ? '✈️ Air' : '🚢 Ocean'}</span></div>}
                    {transportType === 'road' && pickupLocation.city && <div className="price-item"><span className="price-label">Route:</span><span className="price-value">{pickupLocation.city} → {deliveryLocation.city}</span></div>}
                    {transportType === 'railway' && railLoadingStation.city && <div className="price-item"><span className="price-label">Route:</span><span className="price-value">{railLoadingStation.city} → {railDestinationStation.city}</span></div>}
                    {transportType === 'air' && airportOfLoading.airportName && <div className="price-item"><span className="price-label">Route:</span><span className="price-value">{airportOfLoading.airportName} → {airportOfDestination.airportName}</span></div>}
                    {transportType === 'ocean' && portOfLoading.portName && <div className="price-item"><span className="price-label">Route:</span><span className="price-value">{portOfLoading.portName} → {portOfDestination.portName}</span></div>}
                    {hasGrades && grade && <div className="price-item"><span className="price-label">Selected Grade:</span><span className="price-value">{grade}</span></div>}
                    <div className="price-item"><span className="price-label">Packing:</span><span className="price-value">{packing || "Not Selected"}</span></div>
                    {isRiceProduct(product) && totalPackingCost > 0 && (
                      <>
                        <div className="price-item packing-cost-item">
                          <span className="price-label">Packing Cost per kg:</span>
                          <span className="price-value price-value-orange">₹{packingPricePerKg}/kg</span>
                        </div>
                        <div className="price-item packing-cost-item">
                          <span className="price-label">Total Packing Cost:</span>
                          <span className="price-value price-value-orange">₹{totalPackingCost.toFixed(2)}</span>
                        </div>
                      </>
                    )}
                    <div className="price-item"><span className="price-label">Quantity:</span><span className="price-value">{quantity === "custom" ? `${customQuantity} ${getQuantityUnitFromFirebase(product)}` : selectedQuantityLabel}</span></div>
                    <div className="price-item"><span className="price-label">Order Quantity:</span><span className="price-value">{orderQuantity} units</span></div>
                    <div className="price-item"><span className="price-label">Quantity Price:</span><span className="price-value">{displayPrices.quantityPrice}</span></div>
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
      <ThankYouPopup isOpen={showThankYou} onClose={() => setShowThankYou(false)} />
    </>
  );
};

export default SingleProductBuyModal;