import React, { useState, useEffect, useRef } from "react";
import ThankYouPopup from "../components/ThankYouPopup";
import { submitQuote } from "../firebasequote";

const BuyModal = ({ isOpen, onClose, product, profile }) => {
  // State declarations
  const [grade, setGrade] = useState("");
  const [packing, setPacking] = useState("");
  const [quantity, setQuantity] = useState("");
  const [port, setPort] = useState("");
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
  const [logoRequired, setLogoRequired] = useState("");
  const [shippingCost, setShippingCost] = useState("0.00");
  const [insuranceCost, setInsuranceCost] = useState("0.00");
  const [taxes, setTaxes] = useState("0.00");
  const [portCost, setPortCost] = useState("0.00");
  const [exchangeRates, setExchangeRates] = useState({});
  const [isLoadingRates, setIsLoadingRates] = useState(false);
  const [baseProductPrice, setBaseProductPrice] = useState("0.00");
  const [customQuantity, setCustomQuantity] = useState("");
  
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

  // Port costs data (in INR) - More realistic pricing
  const portCosts = {
    "Mundra": { baseCost: 2500, perKg: 1.2, perLiter: 0.8, perUnit: 8 },
    "Kandla": { baseCost: 2300, perKg: 1.1, perLiter: 0.7, perUnit: 7 },
    "Nhava Sheva": { baseCost: 2800, perKg: 1.4, perLiter: 0.9, perUnit: 9 },
    "Chennai": { baseCost: 2200, perKg: 1.0, perLiter: 0.6, perUnit: 6 },
    "Vizag": { baseCost: 2100, perKg: 0.9, perLiter: 0.5, perUnit: 5 },
    "Kolkata": { baseCost: 2400, perKg: 1.1, perLiter: 0.7, perUnit: 7 },
    "Mumbai": { baseCost: 2700, perKg: 1.3, perLiter: 0.8, perUnit: 8 },
    "Cochin": { baseCost: 2150, perKg: 1.0, perLiter: 0.6, perUnit: 6 }
  };

  // Extract base price from product price string and convert to number
  const extractBasePrice = (priceString) => {
    if (!priceString) return 0;
    
    try {
      // Handle different price formats like "₹120-140 per liter", "₹7,250-8,650 per quintal"
      const priceMatch = priceString.match(/(\d+(?:,\d+)*(?:\.\d+)?)/);
      if (priceMatch) {
        // Take the first price (lower range) and convert to number
        const priceValue = parseFloat(priceMatch[1].replace(/,/g, ''));
        return priceValue;
      }
      
      return 0;
    } catch (error) {
      console.error('Error extracting price:', error);
      return 0;
    }
  };

  // Get quantity options based on product type - UPDATED CONSTRUCTION QUANTITIES
  const getQuantityOptions = () => {
    const productType = getProductType();
    const productName = product?.name?.toLowerCase() || '';
    
    // Construction material specific quantity options
    if (productType === 'construction') {
      // Cement specific quantities
      if (productName.includes('cement')) {
        return [
          { value: "1", label: "1 Bag (50kg)", multiplier: 50, unit: "bags" },
          { value: "5", label: "5 Bags (250kg)", multiplier: 250, unit: "bags" },
          { value: "10", label: "10 Bags (500kg)", multiplier: 500, unit: "bags" },
          { value: "20", label: "20 Bags (1 ton)", multiplier: 1000, unit: "bags" },
          { value: "50", label: "50 Bags (2.5 tons)", multiplier: 2500, unit: "bags" },
          { value: "100", label: "100 Bags (5 tons)", multiplier: 5000, unit: "bags" },
          { value: "200", label: "200 Bags (10 tons)", multiplier: 10000, unit: "bags" },
          { value: "500", label: "500 Bags (25 tons)", multiplier: 25000, unit: "bags" },
          { value: "1000", label: "1,000 Bags (50 tons)", multiplier: 50000, unit: "bags" },
          { value: "custom", label: "Custom Quantity", multiplier: 1, unit: "bags" }
        ];
      }
      
      // Steel bars specific quantities
      if (productName.includes('steel') || productName.includes('rod') || productName.includes('tmt')) {
        return [
          { value: "100", label: "100 Kg", multiplier: 100, unit: "kg" },
          { value: "500", label: "500 Kg", multiplier: 500, unit: "kg" },
          { value: "1000", label: "1 Ton", multiplier: 1000, unit: "kg" },
          { value: "2000", label: "2 Tons", multiplier: 2000, unit: "kg" },
          { value: "5000", label: "5 Tons", multiplier: 5000, unit: "kg" },
          { value: "10000", label: "10 Tons", multiplier: 10000, unit: "kg" },
          { value: "1", label: "1 Bundle", multiplier: 2000, unit: "bundles" },
          { value: "2", label: "2 Bundles", multiplier: 4000, unit: "bundles" },
          { value: "5", label: "5 Bundles", multiplier: 10000, unit: "bundles" },
          { value: "custom", label: "Custom Quantity", multiplier: 1, unit: "kg" }
        ];
      }
      
      // Bricks specific quantities
      if (productName.includes('brick')) {
        return [
          { value: "100", label: "100 Bricks", multiplier: 100, unit: "pieces" },
          { value: "500", label: "500 Bricks", multiplier: 500, unit: "pieces" },
          { value: "1000", label: "1,000 Bricks", multiplier: 1000, unit: "pieces" },
          { value: "5000", label: "5,000 Bricks", multiplier: 5000, unit: "pieces" },
          { value: "10000", label: "10,000 Bricks", multiplier: 10000, unit: "pieces" },
          { value: "50000", label: "50,000 Bricks", multiplier: 50000, unit: "pieces" },
          { value: "100000", label: "100,000 Bricks", multiplier: 100000, unit: "pieces" },
          { value: "custom", label: "Custom Quantity", multiplier: 1, unit: "pieces" }
        ];
      }
      
      // Sand, gravel, aggregate specific quantities
      if (productName.includes('sand') || productName.includes('gravel') || productName.includes('aggregate')) {
        return [
          { value: "100", label: "100 Kg", multiplier: 100, unit: "kg" },
          { value: "500", label: "500 Kg", multiplier: 500, unit: "kg" },
          { value: "1000", label: "1 Ton", multiplier: 1000, unit: "kg" },
          { value: "5000", label: "5 Tons", multiplier: 5000, unit: "kg" },
          { value: "10000", label: "10 Tons", multiplier: 10000, unit: "kg" },
          { value: "25000", label: "25 Tons", multiplier: 25000, unit: "kg" },
          { value: "50000", label: "50 Tons", multiplier: 50000, unit: "kg" },
          { value: "1", label: "1 Truck Load", multiplier: 5000, unit: "trucks" },
          { value: "2", label: "2 Truck Loads", multiplier: 10000, unit: "trucks" },
          { value: "5", label: "5 Truck Loads", multiplier: 25000, unit: "trucks" },
          { value: "custom", label: "Custom Quantity", multiplier: 1, unit: "kg" }
        ];
      }
      
      // Concrete blocks specific quantities
      if (productName.includes('concrete') && productName.includes('block')) {
        return [
          { value: "50", label: "50 Blocks", multiplier: 50, unit: "pieces" },
          { value: "100", label: "100 Blocks", multiplier: 100, unit: "pieces" },
          { value: "500", label: "500 Blocks", multiplier: 500, unit: "pieces" },
          { value: "1000", label: "1,000 Blocks", multiplier: 1000, unit: "pieces" },
          { value: "5000", label: "5,000 Blocks", multiplier: 5000, unit: "pieces" },
          { value: "10000", label: "10,000 Blocks", multiplier: 10000, unit: "pieces" },
          { value: "custom", label: "Custom Quantity", multiplier: 1, unit: "pieces" }
        ];
      }
      
      // Wood/timber specific quantities
      if (productName.includes('wood') || productName.includes('timber') || productName.includes('plywood')) {
        return [
          { value: "10", label: "10 Sq Ft", multiplier: 10, unit: "sqft" },
          { value: "50", label: "50 Sq Ft", multiplier: 50, unit: "sqft" },
          { value: "100", label: "100 Sq Ft", multiplier: 100, unit: "sqft" },
          { value: "500", label: "500 Sq Ft", multiplier: 500, unit: "sqft" },
          { value: "1000", label: "1,000 Sq Ft", multiplier: 1000, unit: "sqft" },
          { value: "1", label: "1 Cubic Foot", multiplier: 1, unit: "cubic_feet" },
          { value: "5", label: "5 Cubic Feet", multiplier: 5, unit: "cubic_feet" },
          { value: "10", label: "10 Cubic Feet", multiplier: 10, unit: "cubic_feet" },
          { value: "custom", label: "Custom Quantity", multiplier: 1, unit: "sqft" }
        ];
      }
      
      // Pipes specific quantities
      if (productName.includes('pipe')) {
        return [
          { value: "10", label: "10 Meters", multiplier: 10, unit: "meters" },
          { value: "50", label: "50 Meters", multiplier: 50, unit: "meters" },
          { value: "100", label: "100 Meters", multiplier: 100, unit: "meters" },
          { value: "500", label: "500 Meters", multiplier: 500, unit: "meters" },
          { value: "1000", label: "1,000 Meters", multiplier: 1000, unit: "meters" },
          { value: "1", label: "1 Piece", multiplier: 1, unit: "pieces" },
          { value: "5", label: "5 Pieces", multiplier: 5, unit: "pieces" },
          { value: "10", label: "10 Pieces", multiplier: 10, unit: "pieces" },
          { value: "50", label: "50 Pieces", multiplier: 50, unit: "pieces" },
          { value: "custom", label: "Custom Quantity", multiplier: 1, unit: "meters" }
        ];
      }
      
      // Tiles specific quantities
      if (productName.includes('tile')) {
        return [
          { value: "10", label: "10 Sq Ft", multiplier: 10, unit: "sqft" },
          { value: "50", label: "50 Sq Ft", multiplier: 50, unit: "sqft" },
          { value: "100", label: "100 Sq Ft", multiplier: 100, unit: "sqft" },
          { value: "500", label: "500 Sq Ft", multiplier: 500, unit: "sqft" },
          { value: "1000", label: "1,000 Sq Ft", multiplier: 1000, unit: "sqft" },
          { value: "1", label: "1 Box", multiplier: 10, unit: "boxes" },
          { value: "5", label: "5 Boxes", multiplier: 50, unit: "boxes" },
          { value: "10", label: "10 Boxes", multiplier: 100, unit: "boxes" },
          { value: "50", label: "50 Boxes", multiplier: 500, unit: "boxes" },
          { value: "custom", label: "Custom Quantity", multiplier: 1, unit: "sqft" }
        ];
      }
      
      // Wires specific quantities
      if (productName.includes('wire')) {
        return [
          { value: "50", label: "50 Meters", multiplier: 50, unit: "meters" },
          { value: "100", label: "100 Meters", multiplier: 100, unit: "meters" },
          { value: "500", label: "500 Meters", multiplier: 500, unit: "meters" },
          { value: "1000", label: "1,000 Meters", multiplier: 1000, unit: "meters" },
          { value: "1", label: "1 Coil", multiplier: 50, unit: "coils" },
          { value: "2", label: "2 Coils", multiplier: 100, unit: "coils" },
          { value: "5", label: "5 Coils", multiplier: 250, unit: "coils" },
          { value: "10", label: "10 Coils", multiplier: 500, unit: "coils" },
          { value: "custom", label: "Custom Quantity", multiplier: 1, unit: "meters" }
        ];
      }
      
      // Marble slabs specific quantities
      if (productName.includes('marble') || productName.includes('slab')) {
        return [
          { value: "1", label: "1 Slab", multiplier: 1, unit: "pieces" },
          { value: "5", label: "5 Slabs", multiplier: 5, unit: "pieces" },
          { value: "10", label: "10 Slabs", multiplier: 10, unit: "pieces" },
          { value: "20", label: "20 Slabs", multiplier: 20, unit: "pieces" },
          { value: "50", label: "50 Slabs", multiplier: 50, unit: "pieces" },
          { value: "10", label: "10 Sq Ft", multiplier: 10, unit: "sqft" },
          { value: "50", label: "50 Sq Ft", multiplier: 50, unit: "sqft" },
          { value: "100", label: "100 Sq Ft", multiplier: 100, unit: "sqft" },
          { value: "custom", label: "Custom Quantity", multiplier: 1, unit: "pieces" }
        ];
      }
      
      // Paints specific quantities
      if (productName.includes('paint')) {
        return [
          { value: "1", label: "1 Liter", multiplier: 1, unit: "liters" },
          { value: "5", label: "5 Liters", multiplier: 5, unit: "liters" },
          { value: "10", label: "10 Liters", multiplier: 10, unit: "liters" },
          { value: "20", label: "20 Liters", multiplier: 20, unit: "liters" },
          { value: "50", label: "50 Liters", multiplier: 50, unit: "liters" },
          { value: "100", label: "100 Liters", multiplier: 100, unit: "liters" },
          { value: "1", label: "1 Bucket", multiplier: 20, unit: "buckets" },
          { value: "2", label: "2 Buckets", multiplier: 40, unit: "buckets" },
          { value: "5", label: "5 Buckets", multiplier: 100, unit: "buckets" },
          { value: "custom", label: "Custom Quantity", multiplier: 1, unit: "liters" }
        ];
      }
      
      // Windows glass specific quantities
      if (productName.includes('window') || productName.includes('glass')) {
        return [
          { value: "1", label: "1 Piece", multiplier: 1, unit: "pieces" },
          { value: "5", label: "5 Pieces", multiplier: 5, unit: "pieces" },
          { value: "10", label: "10 Pieces", multiplier: 10, unit: "pieces" },
          { value: "20", label: "20 Pieces", multiplier: 20, unit: "pieces" },
          { value: "50", label: "50 Pieces", multiplier: 50, unit: "pieces" },
          { value: "10", label: "10 Sq Ft", multiplier: 10, unit: "sqft" },
          { value: "50", label: "50 Sq Ft", multiplier: 50, unit: "sqft" },
          { value: "100", label: "100 Sq Ft", multiplier: 100, unit: "sqft" },
          { value: "custom", label: "Custom Quantity", multiplier: 1, unit: "pieces" }
        ];
      }
      
      // Default construction quantities
      return [
        { value: "100", label: "100 Kg", multiplier: 100, unit: "kg" },
        { value: "500", label: "500 Kg", multiplier: 500, unit: "kg" },
        { value: "1000", label: "1 Ton", multiplier: 1000, unit: "kg" },
        { value: "5000", label: "5 Tons", multiplier: 5000, unit: "kg" },
        { value: "10000", label: "10 Tons", multiplier: 10000, unit: "kg" },
        { value: "1", label: "1 Unit", multiplier: 1, unit: "units" },
        { value: "5", label: "5 Units", multiplier: 5, unit: "units" },
        { value: "10", label: "10 Units", multiplier: 10, unit: "units" },
        { value: "50", label: "50 Units", multiplier: 50, unit: "units" },
        { value: "custom", label: "Custom Quantity", multiplier: 1, unit: "units" }
      ];
    }
    
    const quantityOptionsByType = {
      oil: [
        { value: "5", label: "5 Liters", multiplier: 5, unit: "liters" },
        { value: "10", label: "10 Liters", multiplier: 10, unit: "liters" },
        { value: "25", label: "25 Liters", multiplier: 25, unit: "liters" },
        { value: "50", label: "50 Liters", multiplier: 50, unit: "liters" },
        { value: "100", label: "100 Liters", multiplier: 100, unit: "liters" },
        { value: "500", label: "500 Liters", multiplier: 500, unit: "liters" },
        { value: "1000", label: "1,000 Liters", multiplier: 1000, unit: "liters" },
        { value: "5000", label: "5,000 Liters", multiplier: 5000, unit: "liters" },
        { value: "10000", label: "10,000 Liters", multiplier: 10000, unit: "liters" },
        { value: "25000", label: "25,000 Liters", multiplier: 25000, unit: "liters" },
        { value: "50000", label: "50,000 Liters", multiplier: 50000, unit: "liters" },
        { value: "100000", label: "100,000 Liters", multiplier: 100000, unit: "liters" },
        { value: "custom", label: "Custom Quantity", multiplier: 1, unit: "liters" }
      ],
      
      rice: [
        { value: "5", label: "5 Kg", multiplier: 5, unit: "kg" },
        { value: "10", label: "10 Kg", multiplier: 10, unit: "kg" },
        { value: "25", label: "25 Kg", multiplier: 25, unit: "kg" },
        { value: "50", label: "50 Kg", multiplier: 50, unit: "kg" },
        { value: "100", label: "100 Kg", multiplier: 100, unit: "kg" },
        { value: "500", label: "500 Kg", multiplier: 500, unit: "kg" },
        { value: "1000", label: "1 Ton", multiplier: 1000, unit: "kg" },
        { value: "5000", label: "5 Tons", multiplier: 5000, unit: "kg" },
        { value: "10000", label: "10 Tons", multiplier: 10000, unit: "kg" },
        { value: "25000", label: "25 Tons", multiplier: 25000, unit: "kg" },
        { value: "50000", label: "50 Tons", multiplier: 50000, unit: "kg" },
        { value: "100000", label: "100 Tons", multiplier: 100000, unit: "kg" },
        { value: "custom", label: "Custom Quantity", multiplier: 1, unit: "kg" }
      ],
      
      pulses: [
        { value: "5", label: "5 Kg", multiplier: 5, unit: "kg" },
        { value: "10", label: "10 Kg", multiplier: 10, unit: "kg" },
        { value: "25", label: "25 Kg", multiplier: 25, unit: "kg" },
        { value: "50", label: "50 Kg", multiplier: 50, unit: "kg" },
        { value: "100", label: "100 Kg", multiplier: 100, unit: "kg" },
        { value: "500", label: "500 Kg", multiplier: 500, unit: "kg" },
        { value: "1000", label: "1 Ton", multiplier: 1000, unit: "kg" },
        { value: "5000", label: "5 Tons", multiplier: 5000, unit: "kg" },
        { value: "10000", label: "10 Tons", multiplier: 10000, unit: "kg" },
        { value: "custom", label: "Custom Quantity", multiplier: 1, unit: "kg" }
      ],
      
      spices: [
        { value: "1", label: "1 Kg", multiplier: 1, unit: "kg" },
        { value: "5", label: "5 Kg", multiplier: 5, unit: "kg" },
        { value: "10", label: "10 Kg", multiplier: 10, unit: "kg" },
        { value: "25", label: "25 Kg", multiplier: 25, unit: "kg" },
        { value: "50", label: "50 Kg", multiplier: 50, unit: "kg" },
        { value: "100", label: "100 Kg", multiplier: 100, unit: "kg" },
        { value: "500", label: "500 Kg", multiplier: 500, unit: "kg" },
        { value: "1000", label: "1 Ton", multiplier: 1000, unit: "kg" },
        { value: "custom", label: "Custom Quantity", multiplier: 1, unit: "kg" }
      ],
      
      dryfruits: [
        { value: "1", label: "1 Kg", multiplier: 1, unit: "kg" },
        { value: "5", label: "5 Kg", multiplier: 5, unit: "kg" },
        { value: "10", label: "10 Kg", multiplier: 10, unit: "kg" },
        { value: "25", label: "25 Kg", multiplier: 25, unit: "kg" },
        { value: "50", label: "50 Kg", multiplier: 50, unit: "kg" },
        { value: "100", label: "100 Kg", multiplier: 100, unit: "kg" },
        { value: "custom", label: "Custom Quantity", multiplier: 1, unit: "kg" }
      ],
      
      tea: [
        { value: "1", label: "1 Kg", multiplier: 1, unit: "kg" },
        { value: "5", label: "5 Kg", multiplier: 5, unit: "kg" },
        { value: "10", label: "10 Kg", multiplier: 10, unit: "kg" },
        { value: "25", label: "25 Kg", multiplier: 25, unit: "kg" },
        { value: "50", label: "50 Kg", multiplier: 50, unit: "kg" },
        { value: "100", label: "100 Kg", multiplier: 100, unit: "kg" },
        { value: "custom", label: "Custom Quantity", multiplier: 1, unit: "kg" }
      ],
      
      fruits: [
        { value: "5", label: "5 Kg", multiplier: 5, unit: "kg" },
        { value: "10", label: "10 Kg", multiplier: 10, unit: "kg" },
        { value: "25", label: "25 Kg", multiplier: 25, unit: "kg" },
        { value: "50", label: "50 Kg", multiplier: 50, unit: "kg" },
        { value: "100", label: "100 Kg", multiplier: 100, unit: "kg" },
        { value: "1", label: "1 Box", multiplier: 1, unit: "boxes" },
        { value: "5", label: "5 Boxes", multiplier: 5, unit: "boxes" },
        { value: "10", label: "10 Boxes", multiplier: 10, unit: "boxes" },
        { value: "25", label: "25 Boxes", multiplier: 25, unit: "boxes" },
        { value: "custom", label: "Custom Quantity", multiplier: 1, unit: "kg" }
      ],
      
      vegetables: [
        { value: "5", label: "5 Kg", multiplier: 5, unit: "kg" },
        { value: "10", label: "10 Kg", multiplier: 10, unit: "kg" },
        { value: "25", label: "25 Kg", multiplier: 25, unit: "kg" },
        { value: "50", label: "50 Kg", multiplier: 50, unit: "kg" },
        { value: "100", label: "100 Kg", multiplier: 100, unit: "kg" },
        { value: "1", label: "1 Crate", multiplier: 1, unit: "crates" },
        { value: "5", label: "5 Crates", multiplier: 5, unit: "crates" },
        { value: "10", label: "10 Crates", multiplier: 10, unit: "crates" },
        { value: "25", label: "25 Crates", multiplier: 25, unit: "crates" },
        { value: "custom", label: "Custom Quantity", multiplier: 1, unit: "kg" }
      ],
      
      beverages: [
        { value: "12", label: "12 Bottles", multiplier: 12, unit: "bottles" },
        { value: "24", label: "24 Bottles", multiplier: 24, unit: "bottles" },
        { value: "50", label: "50 Bottles", multiplier: 50, unit: "bottles" },
        { value: "100", label: "100 Bottles", multiplier: 100, unit: "bottles" },
        { value: "500", label: "500 Bottles", multiplier: 500, unit: "bottles" },
        { value: "10", label: "10 Liters", multiplier: 10, unit: "liters" },
        { value: "25", label: "25 Liters", multiplier: 25, unit: "liters" },
        { value: "50", label: "50 Liters", multiplier: 50, unit: "liters" },
        { value: "100", label: "100 Liters", multiplier: 100, unit: "liters" },
        { value: "500", label: "500 Liters", multiplier: 500, unit: "liters" },
        { value: "custom", label: "Custom Quantity", multiplier: 1, unit: "bottles" }
      ],
      
      gadgets: [
        { value: "1", label: "1 Piece", multiplier: 1, unit: "pieces" },
        { value: "5", label: "5 Pieces", multiplier: 5, unit: "pieces" },
        { value: "10", label: "10 Pieces", multiplier: 10, unit: "pieces" },
        { value: "25", label: "25 Pieces", multiplier: 25, unit: "pieces" },
        { value: "50", label: "50 Pieces", multiplier: 50, unit: "pieces" },
        { value: "100", label: "100 Pieces", multiplier: 100, unit: "pieces" },
        { value: "custom", label: "Custom Quantity", multiplier: 1, unit: "pieces" }
      ],
      
      clothing: [
        { value: "1", label: "1 Piece", multiplier: 1, unit: "pieces" },
        { value: "5", label: "5 Pieces", multiplier: 5, unit: "pieces" },
        { value: "10", label: "10 Pieces", multiplier: 10, unit: "pieces" },
        { value: "25", label: "25 Pieces", multiplier: 25, unit: "pieces" },
        { value: "50", label: "50 Pieces", multiplier: 50, unit: "pieces" },
        { value: "100", label: "100 Pieces", multiplier: 100, unit: "pieces" },
        { value: "custom", label: "Custom Quantity", multiplier: 1, unit: "pieces" }
      ],
      
      chocolate: [
        { value: "1", label: "1 Kg", multiplier: 1, unit: "kg" },
        { value: "5", label: "5 Kg", multiplier: 5, unit: "kg" },
        { value: "10", label: "10 Kg", multiplier: 10, unit: "kg" },
        { value: "25", label: "25 Kg", multiplier: 25, unit: "kg" },
        { value: "50", label: "50 Kg", multiplier: 50, unit: "kg" },
        { value: "100", label: "100 Pieces", multiplier: 100, unit: "pieces" },
        { value: "500", label: "500 Pieces", multiplier: 500, unit: "pieces" },
        { value: "1000", label: "1,000 Pieces", multiplier: 1000, unit: "pieces" },
        { value: "custom", label: "Custom Quantity", multiplier: 1, unit: "kg" }
      ],
      
      perfume: [
        { value: "1", label: "1 Bottle", multiplier: 1, unit: "bottles" },
        { value: "5", label: "5 Bottles", multiplier: 5, unit: "bottles" },
        { value: "10", label: "10 Bottles", multiplier: 10, unit: "bottles" },
        { value: "25", label: "25 Bottles", multiplier: 25, unit: "bottles" },
        { value: "50", label: "50 Bottles", multiplier: 50, unit: "bottles" },
        { value: "100", label: "100 Bottles", multiplier: 100, unit: "bottles" },
        { value: "custom", label: "Custom Quantity", multiplier: 1, unit: "bottles" }
      ],
      
      flowers: [
        { value: "12", label: "12 Stems", multiplier: 12, unit: "stems" },
        { value: "24", label: "24 Stems", multiplier: 24, unit: "stems" },
        { value: "50", label: "50 Stems", multiplier: 50, unit: "stems" },
        { value: "100", label: "100 Stems", multiplier: 100, unit: "stems" },
        { value: "500", label: "500 Stems", multiplier: 500, unit: "stems" },
        { value: "1", label: "1 Bouquet", multiplier: 1, unit: "bouquets" },
        { value: "5", label: "5 Bouquets", multiplier: 5, unit: "bouquets" },
        { value: "10", label: "10 Bouquets", multiplier: 10, unit: "bouquets" },
        { value: "25", label: "25 Bouquets", multiplier: 25, unit: "bouquets" },
        { value: "custom", label: "Custom Quantity", multiplier: 1, unit: "stems" }
      ],
      
      default: [
        { value: "1", label: "1 Unit", multiplier: 1, unit: "units" },
        { value: "5", label: "5 Units", multiplier: 5, unit: "units" },
        { value: "10", label: "10 Units", multiplier: 10, unit: "units" },
        { value: "25", label: "25 Units", multiplier: 25, unit: "units" },
        { value: "50", label: "50 Units", multiplier: 50, unit: "units" },
        { value: "100", label: "100 Units", multiplier: 100, unit: "units" },
        { value: "custom", label: "Custom Quantity", multiplier: 1, unit: "units" }
      ]
    };
    
    return quantityOptionsByType[productType] || quantityOptionsByType.default;
  };

  // Product-specific packing options - UPDATED CONSTRUCTION PACKING
  const getPackingOptions = () => {
    const productType = getProductType();
    const productName = product?.name?.toLowerCase() || '';
    
    // Construction material specific packing options
    if (productType === 'construction') {
      // Cement specific packing
      if (productName.includes('cement')) {
        return [
          { value: "PP Bags (50kg)", price: "12" },
          { value: "HDPE Bags (50kg)", price: "14" },
          { value: "Paper Bags (50kg)", price: "10" },
          { value: "Jumbo Bags (1 ton)", price: "25" },
          { value: "Bulk Tanker", price: "8" },
          { value: "Loose Bulk", price: "5" },
          { value: "Export Packaging", price: "35" },
          { value: "Custom Packaging", price: "50" }
        ];
      }
      
      // Steel bars specific packing
      if (productName.includes('steel') || productName.includes('rod') || productName.includes('tmt')) {
        return [
          { value: "Steel Bundles", price: "35" },
          { value: "Wire Rod Bundles", price: "25" },
          { value: "Corrugated Boxes", price: "15" },
          { value: "Wooden Crates", price: "30" },
          { value: "Plastic Wrapping", price: "12" },
          { value: "Waterproof Cover", price: "18" },
          { value: "Export Packaging", price: "40" },
          { value: "Custom Packaging", price: "45" }
        ];
      }
      
      // Bricks specific packing
      if (productName.includes('brick')) {
        return [
          { value: "Wooden Pallets", price: "40" },
          { value: "Plastic Pallets", price: "35" },
          { value: "Corrugated Boxes", price: "15" },
          { value: "Brick Pallets", price: "45" },
          { value: "Loose Packing", price: "8" },
          { value: "Weatherproof Cover", price: "20" },
          { value: "Export Packaging", price: "38" },
          { value: "Custom Packaging", price: "42" }
        ];
      }
      
      // Sand, gravel, aggregate specific packing
      if (productName.includes('sand') || productName.includes('gravel') || productName.includes('aggregate')) {
        return [
          { value: "Jumbo Bags", price: "22" },
          { value: "PP Bags", price: "10" },
          { value: "Bulk Truck", price: "15" },
          { value: "Loose Bulk", price: "5" },
          { value: "Container Load", price: "30" },
          { value: "Weatherproof Cover", price: "18" },
          { value: "Export Packaging", price: "32" },
          { value: "Custom Packaging", price: "40" }
        ];
      }
      
      // Concrete blocks specific packing
      if (productName.includes('concrete') && productName.includes('block')) {
        return [
          { value: "Wooden Pallets", price: "38" },
          { value: "Plastic Pallets", price: "32" },
          { value: "Corrugated Boxes", price: "16" },
          { value: "Block Pallets", price: "42" },
          { value: "Loose Packing", price: "10" },
          { value: "Weatherproof Cover", price: "22" },
          { value: "Export Packaging", price: "36" },
          { value: "Custom Packaging", price: "44" }
        ];
      }
      
      // Wood/timber specific packing
      if (productName.includes('wood') || productName.includes('timber') || productName.includes('plywood')) {
        return [
          { value: "Wooden Crates", price: "32" },
          { value: "Plastic Wrapping", price: "14" },
          { value: "Corrugated Boxes", price: "18" },
          { value: "Waterproof Cover", price: "20" },
          { value: "Bundle Packing", price: "16" },
          { value: "Export Packaging", price: "34" },
          { value: "Custom Packaging", price: "38" }
        ];
      }
      
      // Pipes specific packing
      if (productName.includes('pipe')) {
        return [
          { value: "Pipe Bundles", price: "22" },
          { value: "Wooden Crates", price: "28" },
          { value: "Plastic Wrapping", price: "15" },
          { value: "Corrugated Boxes", price: "18" },
          { value: "Waterproof Cover", price: "20" },
          { value: "Export Packaging", price: "32" },
          { value: "Custom Packaging", price: "36" }
        ];
      }
      
      // Tiles specific packing
      if (productName.includes('tile')) {
        return [
          { value: "Tile Boxes", price: "18" },
          { value: "Corrugated Boxes", price: "16" },
          { value: "Wooden Crates", price: "26" },
          { value: "Plastic Wrapping", price: "12" },
          { value: "Protective Corner", price: "14" },
          { value: "Export Packaging", price: "30" },
          { value: "Custom Packaging", price: "34" }
        ];
      }
      
      // Wires specific packing
      if (productName.includes('wire')) {
        return [
          { value: "Wire Coils", price: "20" },
          { value: "Plastic Spools", price: "16" },
          { value: "Corrugated Boxes", price: "14" },
          { value: "Wooden Crates", price: "24" },
          { value: "Waterproof Cover", price: "18" },
          { value: "Export Packaging", price: "28" },
          { value: "Custom Packaging", price: "32" }
        ];
      }
      
      // Marble slabs specific packing
      if (productName.includes('marble') || productName.includes('slab')) {
        return [
          { value: "Glass Crates", price: "28" },
          { value: "Wooden Crates", price: "32" },
          { value: "Protective Corner", price: "22" },
          { value: "Foam Wrapping", price: "18" },
          { value: "Waterproof Cover", price: "24" },
          { value: "Export Packaging", price: "36" },
          { value: "Custom Packaging", price: "40" }
        ];
      }
      
      // Paints specific packing
      if (productName.includes('paint')) {
        return [
          { value: "Paint Cans", price: "15" },
          { value: "Plastic Buckets", price: "12" },
          { value: "Corrugated Boxes", price: "14" },
          { value: "Wooden Crates", price: "22" },
          { value: "Protective Wrapping", price: "16" },
          { value: "Export Packaging", price: "26" },
          { value: "Custom Packaging", price: "30" }
        ];
      }
      
      // Windows glass specific packing
      if (productName.includes('window') || productName.includes('glass')) {
        return [
          { value: "Glass Crates", price: "28" },
          { value: "Wooden Crates", price: "30" },
          { value: "Protective Corner", price: "20" },
          { value: "Foam Wrapping", price: "16" },
          { value: "Waterproof Cover", price: "22" },
          { value: "Export Packaging", price: "34" },
          { value: "Custom Packaging", price: "38" }
        ];
      }
      
      // Default construction packing
      return [
        { value: "Wooden Crates", price: "30" },
        { value: "Plastic Crates", price: "20" },
        { value: "Corrugated Boxes", price: "15" },
        { value: "Steel Boxes", price: "35" },
        { value: "Wooden Pallets", price: "40" },
        { value: "Plastic Pallets", price: "35" },
        { value: "Bulk Packaging", price: "8" },
        { value: "Export Packaging", price: "35" },
        { value: "Custom Packaging", price: "50" }
      ];
    }
    
    const packingOptionsByType = {
      oil: [
        { value: "PET Bottles", price: "8" },
        { value: "Glass Bottles", price: "12" },
        { value: "Plastic Cans", price: "10" },
        { value: "Tin Cans", price: "15" },
        { value: "Flexi Pouches", price: "6" },
        { value: "Drum Packaging", price: "25" },
        { value: "Bulk Tankers", price: "5" },
        { value: "Aseptic Packaging", price: "18" }
      ],
      
      rice: [
        { value: "PP Bags", price: "10" },
        { value: "Non-Woven Bags", price: "15" },
        { value: "Jute Bags", price: "20" },
        { value: "BOPP Bags", price: "16" },
        { value: "LDPE Bags", price: "12" },
        { value: "HDPE Bags", price: "11" },
        { value: "Vacuum Packed", price: "24" },
        { value: "Paper Bags", price: "9" },
        { value: "Bulk Packaging", price: "6" },
        { value: "Custom Packaging", price: "30" }
      ],
      
      pulses: [
        { value: "PP Bags", price: "8" },
        { value: "Jute Bags", price: "18" },
        { value: "LDPE Bags", price: "10" },
        { value: "HDPE Bags", price: "9" },
        { value: "Vacuum Packed", price: "22" },
        { value: "Paper Bags", price: "7" },
        { value: "Bulk Packaging", price: "5" },
        { value: "Retail Pouches", price: "12" }
      ],
      
      spices: [
        { value: "PP Pouches", price: "6" },
        { value: "Aluminum Pouches", price: "15" },
        { value: "Glass Jars", price: "18" },
        { value: "Plastic Jars", price: "12" },
        { value: "Vacuum Packed", price: "20" },
        { value: "Stand-up Pouches", price: "10" },
        { value: "Bulk Bags", price: "8" },
        { value: "Retail Boxes", price: "14" }
      ],
      
      dryfruits: [
        { value: "Vacuum Packed", price: "22" },
        { value: "PP Pouches", price: "8" },
        { value: "Aluminum Foil Bags", price: "16" },
        { value: "Glass Jars", price: "20" },
        { value: "Tin Cans", price: "18" },
        { value: "Stand-up Pouches", price: "12" },
        { value: "Bulk Bags", price: "10" },
        { value: "Gift Boxes", price: "25" }
      ],
      
      tea: [
        { value: "Tea Bags", price: "15" },
        { value: "Aluminum Pouches", price: "12" },
        { value: "Paper Bags", price: "8" },
        { value: "Tin Cans", price: "20" },
        { value: "Glass Jars", price: "18" },
        { value: "Vacuum Packed", price: "16" },
        { value: "Gift Boxes", price: "22" },
        { value: "Bulk Packaging", price: "6" }
      ],
      
      fruits: [
        { value: "Corrugated Boxes", price: "15" },
        { value: "Wooden Crates", price: "25" },
        { value: "Plastic Crates", price: "18" },
        { value: "Mesh Bags", price: "8" },
        { value: "Bulk Packaging", price: "6" },
        { value: "Gift Boxes", price: "22" },
        { value: "Vacuum Packed", price: "20" },
        { value: "Modified Atmosphere", price: "28" }
      ],
      
      vegetables: [
        { value: "Mesh Bags", price: "7" },
        { value: "Corrugated Boxes", price: "12" },
        { value: "Plastic Crates", price: "15" },
        { value: "Jute Bags", price: "10" },
        { value: "Bulk Packaging", price: "5" },
        { value: "Vacuum Packed", price: "18" },
        { value: "Modified Atmosphere", price: "25" },
        { value: "Retail Trays", price: "14" }
      ],
      
      beverages: [
        { value: "Glass Bottles", price: "12" },
        { value: "PET Bottles", price: "8" },
        { value: "Aluminum Cans", price: "10" },
        { value: "Tetra Packs", price: "9" },
        { value: "Plastic Jugs", price: "11" },
        { value: "Bulk Drums", price: "15" },
        { value: "Multi-packs", price: "14" },
        { value: "Gift Packs", price: "20" }
      ],
      
      chocolate: [
        { value: "Foil Wrapping", price: "8" },
        { value: "Paper Boxes", price: "12" },
        { value: "Plastic Boxes", price: "10" },
        { value: "Gift Boxes", price: "18" },
        { value: "Bulk Packaging", price: "6" },
        { value: "Retail Bars", price: "9" },
        { value: "Truffle Boxes", price: "22" },
        { value: "Seasonal Packaging", price: "25" }
      ],
      
      perfume: [
        { value: "Glass Bottles", price: "25" },
        { value: "Premium Boxes", price: "30" },
        { value: "Gift Sets", price: "35" },
        { value: "Travel Packs", price: "20" },
        { value: "Luxury Packaging", price: "40" },
        { value: "Sample Vials", price: "15" },
        { value: "Custom Bottles", price: "45" },
        { value: "Display Boxes", price: "28" }
      ],
      
      flowers: [
        { value: "Bouquet Wrapping", price: "12" },
        { value: "Vase Packaging", price: "18" },
        { value: "Gift Boxes", price: "15" },
        { value: "Floral Foam", price: "10" },
        { value: "Cellophane Wrap", price: "8" },
        { value: "Premium Boxes", price: "22" },
        { value: "Custom Arrangements", price: "25" },
        { value: "Event Packaging", price: "30" }
      ],
      
      clothing: [
        { value: "Poly Bags", price: "6" },
        { value: "Cardboard Boxes", price: "12" },
        { value: "Hanger Packs", price: "15" },
        { value: "Gift Boxes", price: "18" },
        { value: "Vacuum Packed", price: "10" },
        { value: "Bulk Cartons", price: "8" },
        { value: "Premium Packaging", price: "22" },
        { value: "Retail Ready", price: "14" }
      ],
      
      gadgets: [
        { value: "Retail Boxes", price: "25" },
        { value: "Blister Packs", price: "18" },
        { value: "Clamshell Packaging", price: "20" },
        { value: "Gift Boxes", price: "30" },
        { value: "Bulk Cartons", price: "15" },
        { value: "Premium Packaging", price: "35" },
        { value: "Display Boxes", price: "28" },
        { value: "Security Packaging", price: "22" }
      ],
      
      default: [
        { value: "Standard Packaging", price: "10" },
        { value: "Bulk Packaging", price: "6" },
        { value: "Custom Packaging", price: "25" },
        { value: "Retail Packaging", price: "12" },
        { value: "Export Packaging", price: "18" }
      ]
    };
    
    return packingOptionsByType[productType] || packingOptionsByType.default;
  };

  // NEW FUNCTION: Get packing unit for display
  const getPackingUnit = (packingValue) => {
    if (!packingValue) return "unit";
    
    const packingLower = packingValue.toLowerCase();
    
    // Boxes and cases
    if (packingLower.includes('box') || packingLower.includes('case') || 
        packingLower.includes('gift') || packingLower.includes('display')) {
      return "box";
    }
    
    // Bags
    if (packingLower.includes('bag') || packingLower.includes('pouch') || 
        packingLower.includes('sack')) {
      return "bag";
    }
    
    // Bottles
    if (packingLower.includes('bottle') || packingLower.includes('jar') || 
        packingLower.includes('vial')) {
      return "bottle";
    }
    
    // Cans and containers
    if (packingLower.includes('can') || packingLower.includes('tin') || 
        packingLower.includes('drum') || packingLower.includes('container')) {
      return "can";
    }
    
    // Crates
    if (packingLower.includes('crate') || packingLower.includes('pallet')) {
      return "crate";
    }
    
    // Wrapping
    if (packingLower.includes('wrap') || packingLower.includes('foil') || 
        packingLower.includes('cellophane')) {
      return "wrap";
    }
    
    // Sets and packs
    if (packingLower.includes('set') || packingLower.includes('pack') || 
        packingLower.includes('multi-pack')) {
      return "set";
    }
    
    // Construction specific
    if (packingLower.includes('bundle') || packingLower.includes('coil')) {
      return "bundle";
    }
    
    if (packingLower.includes('silo') || packingLower.includes('tanker')) {
      return "unit";
    }
    
    // Default to unit
    return "unit";
  };

  const varietyGrades = {
    "1121 Basmati":[
      "1121 Steam A+",
      "1121 Steam A",
      "1121 Golden Sella A",
      "1121 Golden Sella A+",
      "1121 White Sella A+",
      "1121 White Sella A"
    ],
    "1509 Basmati": [
      "1509 Steam A+",
      "1509 Steam A",
      "1509 Golden Sella A+",
      "1509 Golden Sella A",
      "1509 White Sella A+",
      "1509 White Sella A"
    ],
    "1401 Basmati": [
      "1401 Steam A+",
      "1401 Steam A",
      "1401 white Sella A+",
      "1401 white Sella A",
      "1401 Golden Sella A+",
      "1401 Golden Sella A"
    ],
    "Pusa Basmati": [
      "Pusa Golden Sella A",
      "Pusa Golden Sella A+",
      "Pusa White Sella A+",
      "Pusa White Sella A",
      "Pusa Steam A",
      "Pusa Steam A+"
    ],
    "Traditional Basmati": [
      "Traditional Golden Sella A",
      "Traditional Golden Sella A+",
      "Traditional White Sella A+",
      "Traditional White Sella A",
      "Traditional Steam A",
      "Traditional Steam A+"
    ],
    "1885 Basmati": [
      "1885 Golden Sella A",
      "1885 Golden Sella A+",
      "1885 White Sella A+",
      "1885 White Sella A",
      "1885 Steam A",
      "1885 Steam A+"
    ],
    "1718 Basmati": [
      "1718 White Sella A+",
      "1718 White Sella A",
      "1718 Golden Sella A+",
      "1718 Golden Sella A",
      "1718 Steam A+",
      "1718 Steam A"
    ],
    "Sugandha (Non-Basmati)": [
      "Sugandha Creamy Parboiled",
      "Sugandha Golden",
      "Sugandha Steam",
      "Sugandha Sella"
    ],
    "Sharbati (Non-Basmati)": [
      "Sharbati Creamy Parboiled",
      "Sharbati Golden",
      "Sharbati Steam",
      "Sharbati Sella"
    ],
    "PR-11/14 (Non-Basmati)": [
      "PR-11/14 Creamy Parboiled",
      "PR-11/14 Golden",
      "PR-11/14 Steam",
      "PR-11/14 Sella"
    ],
    "PR-06/47 (Non-Basmati)": [
      "PR-06/47 Creamy Parboiled",
      "PR-06/47 Golden",
      "PR-06/47 Steam",
      "PR-06/47 Sella"
    ],
    "RH-10 (Non-Basmati)": [
      "Creamy Parboiled",
      "RH-10 Golden",
      "RH-10 Steam",
      "RH-10 Sella"
    ],
    "Sona Masoori (Non-Basmati)": [
      "Sona Masoori Steam",
      "Sona Masoori Sella",
      "Sona Masoori Creamy Parboiled",
      "Sona Masoori Golden"
    ],
    "Long Grain (Non-Basmati)": [
      "Long Grain Parboiled",
      "Long Grain Creamy Parboiled",
      "Long Grain Sella",
      "Long Grain Golden",
      "Long Grain Steam"
    ],
    "IR-8 (Non-Basmati)": [
      "IR-8 Parboiled",
      "IR-8 Creamy Parboiled",
      "IR-8 Sella",
      "IR-8 Golden",
      "IR-8 Steam"
    ],
    "GR-11 (Non-Basmati)": [
      "GR-11 Creamy Parboiled",
      "GR-11 Parboiled",
      "GR-11 Sella",
      "GR-11 Steam",
      "GR-11 Golden"
    ],
    "Swarna (Non-Basmati)": [
      "Swarna Steam",
      "Swarna sella",
      "Swarna Creamy Parboiled",
      "Swarna Parboiled",
      "Swarna Golden"
    ],
    "Kalizeera (Non-Basmati)": [
      "Kalizeera steam",
      "Kalizeera Golden",
      "Kalizeera Creamy Parboiled",
      "Kalizeera Parboiled",
      "Kalizeera Sella"
    ],
    "Ponni Rice (Non-Basmati)": [
      "Pooni Rice Steam",
      "Ponni Rice Sella",
      "Ponni Rice Golden",
      "Ponni Rice Creamy Parboiled",
      "Ponni Rice Parboiled"
    ]
  };

  const gradePrices = {
    "1121 Steam A+": "1.10", "1121 Steam A": "1.00", "1121 Golden Sella A": "1.05",
    "1121 Golden Sella A+": "1.15", "1121 White Sella A+": "1.08", "1121 White Sella A": "0.98",
    "1509 Steam A+": "0.95", "1509 Steam A": "0.85", "1509 Golden Sella A+": "1.00",
    "1509 Golden Sella A": "0.90", "1509 White Sella A+": "0.92", "1509 White Sella A": "0.82",
    "1401 Steam A+": "0.85", "1401 Steam A": "0.75", "1401 white Sella A+": "0.82",
    "1401 white Sella A": "0.72", "1401 Golden Sella A+": "0.84", "1401 Golden Sella A": "0.74",
    "Pusa Golden Sella A": "0.82", "Pusa Golden Sella A+": "0.92", "Pusa White Sella A+": "0.88",
    "Pusa White Sella A": "0.78", "Pusa Steam A": "0.80", "Pusa Steam A+": "0.90",
    "Traditional Golden Sella A": "0.78", "Traditional Golden Sella A+": "0.88",
    "Traditional White Sella A+": "0.84", "Traditional White Sella A": "0.74",
    "Traditional Steam A": "0.76", "Traditional Steam A+": "0.86",
    "1885 Golden Sella A": "0.80", "1885 Golden Sella A+": "0.90", "1885 White Sella A+": "0.86",
    "1885 White Sella A": "0.76", "1885 Steam A": "0.78", "1885 Steam A+": "0.88",
    "1718 White Sella A+": "0.86", "1718 White Sella A": "0.76", "1718 Golden Sella A+": "0.88",
    "1718 Golden Sella A": "0.78", "1718 Steam A+": "0.84", "1718 Steam A": "0.74",
    
    "Sugandha Creamy Parboiled": "0.55", "Sugandha Golden": "0.50", "Sugandha Steam": "0.52", "Sugandha Sella": "0.50",
    "Sharbati Creamy Parboiled": "0.52", "Sharbati Golden": "0.48", "Sharbati Steam": "0.50", "Sharbati Sella": "0.48",
    "PR-11/14 Creamy Parboiled": "0.50", "PR-11/14 Golden": "0.45", "PR-11/14 Steam": "0.48", "PR-11/14 Sella": "0.45",
    "PR-06/47 Creamy Parboiled": "0.48", "PR-06/47 Golden": "0.43", "PR-06/47 Steam": "0.46", "PR-06/47 Sella": "0.43",
    "Creamy Parboiled": "0.46", "RH-10 Golden": "0.41", "RH-10 Steam": "0.44", "RH-10 Sella": "0.41",
    "Sona Masoori Steam": "0.58", "Sona Masoori Sella": "0.55", "Sona Masoori Creamy Parboiled": "0.60", "Sona Masoori Golden": "0.52",
    "Long Grain Parboiled": "0.44", "Long Grain Creamy Parboiled": "0.48", "Long Grain Sella": "0.42",
    "Long Grain Golden": "0.40", "Long Grain Steam": "0.46",
    "IR-8 Parboiled": "0.38", "IR-8 Creamy Parboiled": "0.42", "IR-8 Sella": "0.36",
    "IR-8 Golden": "0.34", "IR-8 Steam": "0.40",
    "GR-11 Creamy Parboiled": "0.43", "GR-11 Parboiled": "0.38", "GR-11 Sella": "0.36",
    "GR-11 Steam": "0.41", "GR-11 Golden": "0.34",
    "Swarna Steam": "0.42", "Swarna sella": "0.40", "Swarna Creamy Parboiled": "0.46",
    "Swarna Parboiled": "0.38", "Swarna Golden": "0.36",
    "Kalizeera steam": "0.48", "Kalizeera Golden": "0.44", "Kalizeera Creamy Parboiled": "0.52",
    "Kalizeera Parboiled": "0.44", "Kalizeera Sella": "0.42",
    "Pooni Rice Steam": "0.50", "Ponni Rice Sella": "0.48", "Ponni Rice Golden": "0.46",
    "Ponni Rice Creamy Parboiled": "0.54", "Ponni Rice Parboiled": "0.46"
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
    
    // Check if product has a category property
    if (product.category) {
      return product.category;
    }
    
    // Check product name for keywords
    const productName = product.name?.toLowerCase() || '';
    
    // Oil detection
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
    
    // Rice detection
    if (productName.includes('rice') || 
        productName.includes('basmati') || 
        product.variety) {
      return 'rice';
    }
    
    // Pulses detection
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
    
    // Spices detection
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
    
    // Tea detection
    if (productName.includes('tea') || 
        productName.includes('green tea') || 
        productName.includes('black tea') || 
        productName.includes('oolong') ||
        productName.includes('chai')) {
      return 'tea';
    }
    
    // Dry fruits detection
    if (productName.includes('almond') || 
        productName.includes('cashew') || 
        productName.includes('raisin') || 
        productName.includes('walnut') ||
        productName.includes('pistachio') ||
        productName.includes('dry fruit') ||
        productName.includes('nut')) {
      return 'dryfruits';
    }
    
    // Construction detection
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
    
    // Fruits detection
    if (productName.includes('apple') || 
        productName.includes('banana') || 
        productName.includes('orange') || 
        productName.includes('mango') ||
        productName.includes('fruit')) {
      return 'fruits';
    }
    
    // Vegetables detection
    if (productName.includes('vegetable') || 
        productName.includes('potato') || 
        productName.includes('tomato') || 
        productName.includes('onion') ||
        productName.includes('carrot') ||
        productName.includes('spinach')) {
      return 'vegetables';
    }
    
    // Beverages detection
    if (productName.includes('juice') || 
        productName.includes('soda') || 
        productName.includes('drink') || 
        productName.includes('beverage')) {
      return 'beverages';
    }
    
    // Gadgets detection
    if (productName.includes('phone') || 
        productName.includes('laptop') || 
        productName.includes('tablet') || 
        productName.includes('gadget') ||
        productName.includes('electronic')) {
      return 'gadgets';
    }
    
    // Clothing detection
    if (productName.includes('shirt') || 
        productName.includes('dress') || 
        productName.includes('pants') || 
        productName.includes('jeans') ||
        productName.includes('clothing') ||
        productName.includes('apparel')) {
      return 'clothing';
    }
    
    // Chocolate detection
    if (productName.includes('chocolate') || 
        productName.includes('cocoa') || 
        productName.includes('dark chocolate') || 
        productName.includes('milk chocolate')) {
      return 'chocolate';
    }
    
    // Perfume detection
    if (productName.includes('perfume') || 
        productName.includes('fragrance') || 
        productName.includes('cologne') || 
        productName.includes('scent')) {
      return 'perfume';
    }
    
    // Flowers detection
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

  const getAvailableGrades = (productType, productData) => {
    if (productType === 'rice' && productData) {
      const productVariety = productData.variety || '';
      const productName = productData.name || '';
      
      let matchedVariety = null;
      
      if (productVariety && varietyGrades[productVariety]) {
        matchedVariety = productVariety;
      } else if (productVariety) {
        for (const varietyKey in varietyGrades) {
          const cleanVariety = productVariety.replace('Rice', '').replace('rice', '').trim();
          const cleanKey = varietyKey.replace('Rice', '').replace('rice', '').trim();
          if (cleanVariety.includes(cleanKey) || cleanKey.includes(cleanVariety)) {
            matchedVariety = varietyKey;
            break;
          }
        }
      } else if (productName) {
        for (const varietyKey in varietyGrades) {
          const cleanName = productName.replace('Rice', '').replace('rice', '').trim();
          const cleanKey = varietyKey.replace('Rice', '').replace('rice', '').trim();
          if (cleanName.includes(cleanKey) || cleanKey.includes(cleanName)) {
            matchedVariety = varietyKey;
            break;
          }
        }
      }

      if (matchedVariety && varietyGrades[matchedVariety]) {
        return varietyGrades[matchedVariety].map(grade => ({
          value: grade,
          price: gradePrices[grade] || "1.00"
        }));
      }

      const allRiceGrades = Object.values(varietyGrades).flat();
      const uniqueGrades = [...new Set(allRiceGrades)];
      return uniqueGrades.map(grade => ({
        value: grade,
        price: gradePrices[grade] || "1.00"
      }));
    }

    const gradeOptions = {
      oil: [
        { value: "Extra Virgin", price: "1.20" }, { value: "Virgin", price: "1.10" },
        { value: "Pure", price: "1.00" }, { value: "Refined", price: "0.95" },
        { value: "Cold Pressed", price: "1.25" }, { value: "Organic", price: "1.30" }
      ],
      construction: [
        { value: "Grade A", price: "1.15" }, { value: "Grade B", price: "1.00" },
        { value: "Industrial Grade", price: "0.90" }, { value: "Commercial Grade", price: "1.05" },
        { value: "Premium Quality", price: "1.25" }, { value: "Standard Quality", price: "0.95" },
        { value: "Structural Grade", price: "1.10" }, { value: "Reinforcement Grade", price: "1.08" },
        { value: "Waterproof Grade", price: "1.20" }, { value: "Weather Resistant", price: "1.18" },
        { value: "Fire Resistant", price: "1.25" }, { value: "Load Bearing", price: "1.12" }
      ],
      fruits: [
        { value: "Grade A", price: "1.10" }, { value: "Grade B", price: "0.95" },
        { value: "Export Quality", price: "1.20" }, { value: "Premium", price: "1.15" },
        { value: "Standard", price: "0.85" }, { value: "Organic", price: "1.25" }
      ],
      vegetables: [
        { value: "Grade A", price: "1.05" }, { value: "Grade B", price: "0.90" },
        { value: "Fresh", price: "1.10" }, { value: "Organic", price: "1.15" },
        { value: "Premium", price: "1.08" }, { value: "Standard", price: "0.85" }
      ],
      pulses: [
        { value: "Premium Grade", price: "1.10" }, { value: "Standard Grade", price: "1.00" },
        { value: "Export Quality", price: "1.15" }, { value: "First Quality", price: "1.05" },
        { value: "Commercial Grade", price: "0.95" }, { value: "Top Quality", price: "1.12" },
        { value: "Superior Quality", price: "1.08" }, { value: "Regular Quality", price: "0.90" }
      ],
      spices: [
        { value: "Premium Grade", price: "1.20" }, { value: "Standard Grade", price: "1.05" },
        { value: "Export Quality", price: "1.25" }, { value: "First Quality", price: "1.15" },
        { value: "Commercial Grade", price: "1.00" }, { value: "A Grade", price: "1.18" },
        { value: "B Grade", price: "1.08" }, { value: "C Grade", price: "0.95" },
        { value: "Top Quality", price: "1.22" }, { value: "Superior Quality", price: "1.12" },
        { value: "Regular Quality", price: "0.98" }
      ],
      tea: [
        { value: "Premium Grade", price: "1.25" }, { value: "First Flush", price: "1.35" },
        { value: "Second Flush", price: "1.30" }, { value: "Orthodox", price: "1.40" },
        { value: "CTC", price: "1.15" }, { value: "Green Tea", price: "1.28" },
        { value: "White Tea", price: "1.45" }, { value: "Oolong Tea", price: "1.32" },
        { value: "Darjeeling Tea", price: "1.50" }, { value: "Assam Tea", price: "1.20" },
        { value: "Organic Tea", price: "1.30" }, { value: "Commercial Grade", price: "1.10" }
      ],
      clothing: [
        { value: "Premium Quality", price: "1.30" }, { value: "Export Quality", price: "1.25" },
        { value: "First Quality", price: "1.20" }, { value: "Commercial Grade", price: "1.10" },
        { value: "Standard Quality", price: "1.15" }, { value: "Luxury Grade", price: "1.40" },
        { value: "Boutique Quality", price: "1.35" }, { value: "Mass Market", price: "1.05" },
        { value: "Designer Grade", price: "1.45" }, { value: "Economy Grade", price: "1.00" }
      ],
      chocolate: [
        { value: "Premium Grade", price: "1.25" }, { value: "Belgian Chocolate", price: "1.35" },
        { value: "Swiss Chocolate", price: "1.32" }, { value: "Dark Chocolate", price: "1.20" },
        { value: "Milk Chocolate", price: "1.15" }, { value: "White Chocolate", price: "1.18" },
        { value: "Organic Chocolate", price: "1.28" }, { value: "Sugar-Free", price: "1.22" },
        { value: "Commercial Grade", price: "1.10" }, { value: "Artisanal", price: "1.40" },
        { value: "Couverture", price: "1.38" }, { value: "Compound", price: "1.08" }
      ],
      beverages: [
        { value: "Premium Grade", price: "1.15" }, { value: "Natural", price: "1.18" },
        { value: "Organic", price: "1.22" }, { value: "Sugar-Free", price: "1.20" },
        { value: "Concentrate", price: "1.10" }, { value: "Ready-to-Drink", price: "1.25" },
        { value: "Commercial Grade", price: "1.05" }, { value: "Export Quality", price: "1.23" },
        { value: "First Quality", price: "1.12" }, { value: "Standard Quality", price: "1.08" }
      ],
      perfume: [
        { value: "Premium Grade", price: "1.35" }, { value: "Luxury", price: "1.45" },
        { value: "Designer", price: "1.40" }, { value: "Niche", price: "1.50" },
        { value: "Export Quality", price: "1.32" }, { value: "Commercial Grade", price: "1.20" },
        { value: "First Quality", price: "1.28" }, { value: "Standard Quality", price: "1.25" },
        { value: "Organic", price: "1.38" }, { value: "Natural", price: "1.42" }
      ],
      flowers: [
        { value: "Premium Grade", price: "1.10" }, { value: "Export Quality", price: "1.15" },
        { value: "First Quality", price: "1.08" }, { value: "Commercial Grade", price: "1.00" },
        { value: "Standard Quality", price: "1.05" }, { value: "Luxury Grade", price: "1.20" },
        { value: "Organic", price: "1.12" }, { value: "Fresh Cut", price: "1.06" },
        { value: "Bouquet Quality", price: "1.18" }, { value: "Event Grade", price: "0.95" }
      ],
      dryfruits: [
        { value: "Premium Grade", price: "1.25" }, { value: "Export Quality", price: "1.30" },
        { value: "First Quality", price: "1.22" }, { value: "Commercial Grade", price: "1.10" },
        { value: "Standard Quality", price: "1.15" }, { value: "Organic", price: "1.35" },
        { value: "Natural", price: "1.28" }, { value: "Roasted", price: "1.20" },
        { value: "Raw", price: "1.18" }, { value: "Salted", price: "1.23" },
        { value: "Unsalted", price: "1.22" }, { value: "Blanched", price: "1.26" }
      ],
      gadgets: [
        { value: "Premium Grade", price: "1.30" }, { value: "Brand New", price: "1.35" },
        { value: "Refurbished", price: "1.20" }, { value: "Original", price: "1.32" },
        { value: "Standard Quality", price: "1.25" }
      ],
      default: [
        { value: "Premium Grade", price: "1.10" }, { value: "Standard Grade", price: "1.00" },
        { value: "Export Quality", price: "1.15" }, { value: "First Quality", price: "1.05" },
        { value: "Commercial Grade", price: "0.95" }
      ]
    };

    return gradeOptions[productType] || gradeOptions.default;
  };

  // Calculate port cost based on selected port and quantity
  const calculatePortCost = (portValue, quantityValue, productType) => {
    if (!portValue || !quantityValue || quantityValue === "custom") return 0;
    
    const portData = portCosts[portValue];
    if (!portData) return 0;
    
    const quantityOptionsList = getQuantityOptions();
    const selectedQuantity = quantityOptionsList.find(q => q.value === quantityValue);
    if (!selectedQuantity) return 0;
    
    const qty = selectedQuantity.multiplier;
    let portCostValue = portData.baseCost;
    
    // Add cost based on product type and quantity
    if (productType === 'oil') {
      portCostValue += qty * portData.perLiter;
    } else if (['rice', 'pulses', 'spices', 'dryfruits', 'tea', 'fruits', 'vegetables', 'chocolate'].includes(productType)) {
      portCostValue += qty * portData.perKg;
    } else if (productType === 'construction') {
      // Construction materials typically use per kg or per unit
      if (selectedQuantity.unit === 'kg') {
        portCostValue += qty * portData.perKg;
      } else {
        portCostValue += qty * portData.perUnit;
      }
    } else {
      portCostValue += qty * portData.perUnit;
    }
    
    return portCostValue;
  };

  // Calculate shipping cost based on quantity and product type - Reduced rates
  const calculateShippingCost = (quantityValue, productType, productValue) => {
    if (!quantityValue || quantityValue === "custom") return 0;
    
    const qty = parseFloat(quantityValue);
    let baseRate = 0;
    
    // Reduced shipping rates
    const shippingRates = {
      oil: 1.5,           // Reduced from 3
      rice: 2.5,          // Reduced from 5
      pulses: 2,          // Reduced from 4
      spices: 3,          // Reduced from 6
      dryfruits: 3.5,     // Reduced from 7
      tea: 4,             // Reduced from 8
      construction: 1,    // Reduced from 2
      fruits: 5,          // Reduced from 10
      vegetables: 4.5,    // Reduced from 9
      beverages: 0.8,     // Reduced from 1.6
      gadgets: 50,        // Reduced from 100
      clothing: 20,       // Reduced from 40
      chocolate: 2.5,     // Reduced from 5
      perfume: 30,        // Reduced from 60
      flowers: 1,         // Reduced from 2
      default: 2          // Reduced from 4
    };
    
    baseRate = shippingRates[productType] || shippingRates.default;
    return Math.max(qty * baseRate, productValue * 0.02); // Reduced minimum from 5% to 2%
  };

  // Calculate insurance cost (0.5% of product value) - Reduced
  const calculateInsuranceCost = (productValue) => {
    return productValue * 0.005; // Reduced from 1% to 0.5%
  };

  // Calculate taxes and duties (3% of total) - Reduced
  const calculateTaxes = (subtotal) => {
    return subtotal * 0.03; // Reduced from 5% to 3%
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
      USD: 0.012,    // 1 INR = 0.012 USD
      EUR: 0.011,    // 1 INR = 0.011 EUR
      GBP: 0.0095,   // 1 INR = 0.0095 GBP
      AED: 0.044,    // 1 INR = 0.044 AED
      SAR: 0.045,    // 1 INR = 0.045 SAR
      CAD: 0.016,    // 1 INR = 0.016 CAD
      AUD: 0.018,    // 1 INR = 0.018 AUD
      JPY: 1.8,      // 1 INR = 1.8 JPY
      CNY: 0.087,    // 1 INR = 0.087 CNY
      IRR: 504.5     // 1 INR = 504.5 IRR
    };
    
    const rate = exchangeRates[currency] || 1;
    return parseFloat(inrAmount) * rate;
  };

  // Get price per unit based on product type
  const getPricePerUnit = () => {
    const productType = getProductType();
    const basePrice = parseFloat(baseProductPrice);
    
    // For rice, the base price is per quintal (100kg), so convert to per kg
    if (productType === 'rice') {
      return basePrice / 100; // Convert quintal price to per kg
    }
    
    // For construction materials, handle different pricing units
    if (productType === 'construction') {
      const productName = product?.name?.toLowerCase() || '';
      
      // Cement is typically priced per bag (50kg)
      if (productName.includes('cement')) {
        return basePrice / 50; // Convert bag price to per kg
      }
      
      // Steel is typically priced per kg
      if (productName.includes('steel') || productName.includes('rod')) {
        return basePrice; // Already per kg
      }
      
      // Bricks are typically priced per piece
      if (productName.includes('brick')) {
        return basePrice; // Already per piece
      }
      
      // Sand, gravel are typically priced per ton
      if (productName.includes('sand') || productName.includes('gravel') || productName.includes('aggregate')) {
        return basePrice / 1000; // Convert ton price to per kg
      }
      
      // Default for construction
      return basePrice;
    }
    
    // For other products, return the base price as is
    return basePrice;
  };

  // Calculate quantity price based on selected quantity and unit
  const calculateQuantityPrice = (quantityValue, gradeMultiplier, customQty = null) => {
    const pricePerUnit = getPricePerUnit();
    const productType = getProductType();
    
    if (quantityValue === "custom") {
      const customQuantityValue = customQty || parseFloat(customQuantity) || 0;
      if (customQuantityValue > 0) {
        return customQuantityValue * pricePerUnit * gradeMultiplier;
      }
      return 0;
    }
    
    const quantityOptionsList = getQuantityOptions();
    const selectedQuantity = quantityOptionsList.find(q => q.value === quantityValue);
    if (!selectedQuantity) return 0;
    
    const qty = selectedQuantity.multiplier;
    
    // For rice, we need to handle different units
    if (productType === 'rice') {
      // If the quantity is in kg, use as is (since pricePerUnit is now per kg)
      if (selectedQuantity.unit === 'kg') {
        return qty * pricePerUnit * gradeMultiplier;
      }
      // For other units, you might need additional conversion logic
    }
    
    // For construction materials, handle different units
    if (productType === 'construction') {
      const productName = product?.name?.toLowerCase() || '';
      
      // Handle different construction material units
      if (selectedQuantity.unit === 'kg') {
        return qty * pricePerUnit * gradeMultiplier;
      } else if (selectedQuantity.unit === 'bags') {
        // For cement bags (typically 50kg each)
        if (productName.includes('cement')) {
          return qty * (pricePerUnit * 50) * gradeMultiplier;
        }
        // For other bags, assume standard bag weight
        return qty * (pricePerUnit * 25) * gradeMultiplier;
      } else if (selectedQuantity.unit === 'pieces') {
        // For bricks, blocks, etc.
        return qty * pricePerUnit * gradeMultiplier;
      } else if (selectedQuantity.unit === 'sqft') {
        // For tiles, slabs, etc.
        return qty * pricePerUnit * gradeMultiplier;
      } else if (selectedQuantity.unit === 'meters') {
        // For pipes, rods, etc.
        return qty * pricePerUnit * gradeMultiplier;
      } else if (selectedQuantity.unit === 'cubic_feet') {
        // For wood, timber, etc.
        return qty * pricePerUnit * gradeMultiplier;
      }
    }
    
    return qty * pricePerUnit * gradeMultiplier;
  };

  // Price calculation
  const calculatePrices = () => {
    let gradePriceValue = 0;
    let packingPriceValue = 0;
    let quantityPriceValue = 0;
    let shippingCostValue = 0;
    let insuranceCostValue = 0;
    let taxesValue = 0;
    let portCostValue = 0;

    // Get price per unit based on product type
    const pricePerUnit = getPricePerUnit();

    // Calculate grade multiplier
    let gradeMultiplier = 1;
    if (grade) {
      const availableGrades = getAvailableGrades(getProductType(), product);
      const selectedGrade = availableGrades.find(g => g.value === grade);
      if (selectedGrade) {
        gradeMultiplier = parseFloat(selectedGrade.price);
      }
    }

    // Calculate grade price (this is the price per unit after grade adjustment)
    gradePriceValue = pricePerUnit * gradeMultiplier;

    if (packing) {
      const selectedPacking = getPackingOptions().find(p => p.value === packing);
      if (selectedPacking) {
        packingPriceValue = parseFloat(selectedPacking.price);
      }
    }

    // Calculate quantity price
    quantityPriceValue = calculateQuantityPrice(quantity, gradeMultiplier);

    // Calculate port cost if port is selected
    if (port) {
      const productType = getProductType();
      portCostValue = calculatePortCost(port, quantity, productType);
    }

    // Calculate CIF costs only if CIF is required
    if (cifRequired === "Yes") {
      const productType = getProductType();
      shippingCostValue = calculateShippingCost(quantity, productType, quantityPriceValue);
      insuranceCostValue = calculateInsuranceCost(quantityPriceValue);
      taxesValue = calculateTaxes(quantityPriceValue + packingPriceValue + portCostValue);
    }

    const subtotal = quantityPriceValue + packingPriceValue + portCostValue + shippingCostValue + insuranceCostValue + taxesValue;

    // Convert all prices to selected currency
    setGradePrice(convertToCurrency(gradePriceValue).toFixed(2));
    setPackingPrice(convertToCurrency(packingPriceValue).toFixed(2));
    setQuantityPrice(convertToCurrency(quantityPriceValue).toFixed(2));
    setPortCost(convertToCurrency(portCostValue).toFixed(2));
    setShippingCost(convertToCurrency(shippingCostValue).toFixed(2));
    setInsuranceCost(convertToCurrency(insuranceCostValue).toFixed(2));
    setTaxes(convertToCurrency(taxesValue).toFixed(2));
    setTotalPrice(convertToCurrency(subtotal).toFixed(2));
  };

  // Get prices for display (with currency conversion)
  const getDisplayPrices = () => {
    const subtotal = parseFloat(totalPrice);
    const finalTotalPrice = subtotal;

    return {
      gradePrice: gradePrice,
      packingPrice: packingPrice,
      quantityPrice: quantityPrice,
      portCost: portCost,
      shippingCost: shippingCost,
      insuranceCost: insuranceCost,
      taxes: taxes,
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
    if (!profile) {
      const newCode = e.target.value;
      setCountryCode(newCode);
      validatePhoneNumber(phoneNumber, newCode);
      
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
      validatePhoneNumber(value, countryCode);
    }
  };

  const handleEmailChange = (e) => {
    if (!profile) {
      const value = e.target.value;
      setEmail(value);
      validateEmail(value);
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
      const gradeMultiplier = grade ? parseFloat(getAvailableGrades(getProductType(), product).find(g => g.value === grade)?.price || 1) : 1;
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

  const handlePortChange = (e) => {
    setPort(e.target.value);
  };

  const handleCifChange = (e) => {
    setCifRequired(e.target.value);
  };

  const handleCurrencyChange = (e) => {
    setCurrency(e.target.value);
  };

  const handleLogoChange = (e) => {
    setLogoRequired(e.target.value);
  };

  // Helper function to get quantity unit for custom input placeholder
  const getQuantityUnit = () => {
    const productType = getProductType();
    const productName = product?.name?.toLowerCase() || '';
    
    if (productType === 'construction') {
      // Specific construction material units
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!quantity || !packing || !port || !grade || !fullName || !cifRequired || !logoRequired) {
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

    if (logoRequired === "") {
      alert("Please select if logo is required.");
      return;
    }

    if (!currency) {
      alert("Please select a currency.");
      return;
    }
    
    // Validate custom quantity if selected
    if (quantity === "custom" && (!customQuantity || parseFloat(customQuantity) <= 0)) {
      alert("Please enter a valid custom quantity.");
      return;
    }
    
    const isPhoneValid = validatePhoneNumber(phoneNumber, countryCode);
    const isEmailValid = validateEmail(email);

    if (!isPhoneValid || !isEmailValid) {
      if (!isPhoneValid) alert("Please enter a valid phone number.");
      if (!isEmailValid) alert("Please enter a valid email address.");
      return;
    }

    const fullPhoneNumber = `${countryCode}${phoneNumber}`;
    const quantityOptions = getQuantityOptions();
    const selectedQuantityOption = quantityOptions.find(opt => opt.value === quantity);
    
    let quantityDisplay = "";
    if (quantity === "custom") {
      quantityDisplay = `${customQuantity} ${getQuantityUnit()}`;
    } else {
      quantityDisplay = selectedQuantityOption ? selectedQuantityOption.label : `${quantity} ${getQuantityUnit()}`;
    }

    const displayPrices = getDisplayPrices();
    const currencySymbol = getCurrencySymbol();
    const exchangeInfo = getExchangeRateInfo();
    const packingUnit = getPackingUnit(packing);

    const quoteData = {
      name: fullName,
      email,
      phone: fullPhoneNumber,
      product: product?.name || "",
      variety: product?.variety || "",
      brand: product?.brand || "",
      grade,
      packing,
      quantity: quantityDisplay,
      port,
      cifRequired,
      logoRequired,
      currency: currency,
      priceBreakdown: {
        baseProductPrice: `${currencySymbol}${formatNumber(displayPrices.baseProductPrice)}/unit`,
        gradePrice: `${currencySymbol}${formatNumber(displayPrices.gradePrice)}/unit`,
        packingPrice: `${currencySymbol}${formatNumber(displayPrices.packingPrice)}/${packingUnit}`,
        quantityPrice: `${currencySymbol}${formatNumber(displayPrices.quantityPrice)}`,
        portCost: `${currencySymbol}${formatNumber(displayPrices.portCost)}`,
        subtotal: `${currencySymbol}${formatNumber(displayPrices.totalPrice)}`,
        finalTotal: `${currencySymbol}${formatNumber(displayPrices.finalTotalPrice)}`
      },
      additionalInfo: additionalInfo || "",
      timestamp: Date.now(),
      productType: getProductType(),
      status: "new",
      source: "website"
    };

    setIsSubmitting(true);

    try {
      const quoteId = await submitQuote(quoteData);
      console.log('Quote submitted with ID:', quoteId);

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
- Port: ${port}
- CIF Required: ${cifRequired}
- Logo Required: ${logoRequired}
- Currency: ${currency}
${exchangeInfo ? `- Exchange Rate: ${exchangeInfo.example}` : ""}
- Estimated Bill Breakdown:
  • Base Product Price: ${currencySymbol}${formatNumber(displayPrices.baseProductPrice)}/unit
  • Grade Price: ${currencySymbol}${formatNumber(displayPrices.gradePrice)}/unit
  • Packing Price: ${currencySymbol}${formatNumber(displayPrices.packingPrice)}/${packingUnit}
  • Quantity Price: ${currencySymbol}${formatNumber(displayPrices.quantityPrice)}
  • Port Charges: ${currencySymbol}${formatNumber(displayPrices.portCost)}
  • Subtotal: ${currencySymbol}${formatNumber(displayPrices.totalPrice)}
  • Final Total: ${currencySymbol}${formatNumber(displayPrices.finalTotalPrice)}
${additionalInfo ? `- Additional Info: ${additionalInfo}` : ""}
Thank you!`;

      window.open(
        `https://wa.me/+919703744571?text=${encodeURIComponent(message)}`,
        "_blank"
      );

      setShowThankYou(true);
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
    setPort("");
    setCifRequired("");
    setCurrency("INR");
    setLogoRequired("");
    setAdditionalInfo("");
    setCustomQuantity("");
    setGradePrice("0.00");
    setPackingPrice("0.00");
    setQuantityPrice("0.00");
    setPortCost("0.00");
    setShippingCost("0.00");
    setInsuranceCost("0.00");
    setTaxes("0.00");
    setTotalPrice("0.00");
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
  }, [grade, packing, quantity, port, cifRequired, currency, baseProductPrice, customQuantity]);

  useEffect(() => {
    if (isOpen && profile) {
      const nameValue = profile.fullName || profile.name || "";
      setFullName(nameValue);
      setEmail(profile.email || "");
      if (profile.phone) {
        const cleanedPhone = profile.phone.replace(/\s+/g, "").replace(/[^+\d]/g, "");
        const matchedCountry = countryOptions.find((opt) => cleanedPhone.startsWith(opt.value));
        
        if (matchedCountry) {
          setCountryCode(matchedCountry.value);
          setPhoneNumber(cleanedPhone.replace(matchedCountry.value, ""));
          if (matchedCountry.currency) {
            setCurrency(matchedCountry.currency);
          }
        } else {
          setCountryCode("+91");
          setPhoneNumber(cleanedPhone.replace(/^\+/, ""));
        }
        validatePhoneNumber(phoneNumber, countryCode);
      }
    }
  }, [isOpen, profile]);

  useEffect(() => {
    if (isOpen && product) {
      setGrade("");
      setCifRequired("");
      setCurrency("INR");
      setLogoRequired("");
      setCustomQuantity("");
      setGradePrice("0.00");
      setPackingPrice("0.00");
      setQuantityPrice("0.00");
      setPortCost("0.00");
      setShippingCost("0.00");
      setInsuranceCost("0.00");
      setTaxes("0.00");
      setTotalPrice("0.00");
      
      // Extract base price from product (this will be in INR)
      const basePrice = extractBasePrice(product.price);
      setBaseProductPrice(basePrice.toFixed(2));
      
      // Debug log to check product type detection
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

  const availableGrades = getAvailableGrades(getProductType(), product);
  const currencySymbol = getCurrencySymbol();
  const quantityOptions = getQuantityOptions();
  const displayPrices = getDisplayPrices();
  const exchangeInfo = getExchangeRateInfo();
  const productType = getProductType();
  const packingOptions = getPackingOptions();
  const packingUnit = getPackingUnit(packing);

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
                {port && (
                  <div className="port-selection-info">
                    <small>Selected Port: {port} - Charges: {currencySymbol}{formatNumber(displayPrices.portCost)}</small>
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

                    <div className="form-group">
                      <label className="form-label">Port *</label>
                      <select value={port} onChange={handlePortChange} required className="form-select">
                        <option value="">Select Port</option>
                        <option value="Mundra">Mundra</option>
                        <option value="Kandla">Kandla</option>
                        <option value="Nhava Sheva">Nhava Sheva</option>
                        <option value="Chennai">Chennai</option>
                        <option value="Vizag">Vizag</option>
                        <option value="Kolkata">Kolkata</option>
                        <option value="Mumbai">Mumbai</option>
                        <option value="Cochin">Cochin</option>
                      </select>
                      <div className="port-info">
                        <small>Port charges include handling, documentation, and loading fees</small>
                        {port && (
                          <div className="port-cost-preview">
                            <small>Estimated port charges: {currencySymbol}{formatNumber(displayPrices.portCost)}</small>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">CIF Required? *</label>
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
                      <label className="form-label">Logo Required? *</label>
                      <select value={logoRequired} onChange={handleLogoChange} required className="form-select">
                        <option value="">Select Option</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                      <div className="logo-info">
                        <small>Add your logo to the packaging</small>
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
                    
                    {/* Port Charges - Always shown when port is selected */}
                    {port && (
                      <div className="price-item port-costs">
                        <span className="price-label">Port Charges ({port}):</span>
                        <span className="price-value">{currencySymbol}{formatNumber(displayPrices.portCost)}</span>
                      </div>
                    )}
                    
                    {/* CIF Costs - Only shown when CIF is required */}
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

        .port-selection-info {
          margin-top: 5px;
          padding: 4px 8px;
          background: rgba(101, 163, 13, 0.1);
          border-radius: 4px;
          border-left: 2px solid #65a30d;
        }

        .port-selection-info small {
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

        .grade-info,
        .cif-info,
        .logo-info,
        .currency-info,
        .port-info,
        .packing-info {
          margin-top: 5px;
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.8rem;
          line-height: 1.3;
        }

        .port-cost-preview {
          margin-top: 5px;
          padding: 4px 8px;
          background: rgba(101, 163, 13, 0.1);
          border-radius: 4px;
          border-left: 2px solid #65a30d;
        }

        .port-cost-preview small {
          color: #84cc16;
          font-size: 0.75rem;
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

        .price-item.port-costs {
          color: #90cdf4;
          border-left: 3px solid #4299e1;
          padding-left: 8px;
          background: rgba(66, 153, 225, 0.05);
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

        .price-item.port-costs .price-value {
          color: #90cdf4;
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