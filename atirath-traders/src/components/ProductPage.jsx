// components/ProductPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Building2, X, ChevronRight, ShoppingCart, Check, ShoppingBag, Package, MapPin, Clock, Tag, Layers, Award, Info, Box, Ruler, Droplet, Factory, Calendar, Hash, Globe, Star, AlertCircle } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { database, ref, get, getCurrencyData } from '../firebase';
import SingleProductBuyModal from './SingleProductBuyModal';
import CheckoutModal from './CheckoutModal';
import AddToCartConfigModal from './AddToCartConfigModal';
import { useCart } from './CartContext';

const ProductPage = ({ profile, globalSearchQuery = '', onGlobalSearchClear, isAuthenticated = false, onNewOrderSubmitted }) => {
  const { type: categoryId } = useParams();
  const navigate = useNavigate();
  const { addToCart, items: cartItems, setCheckoutProducts } = useCart();

  // States
  const [categoryData, setCategoryData] = useState(null);
  const [allCompanies, setAllCompanies] = useState({});
  const [allBrands, setAllBrands] = useState({});
  const [allProducts, setAllProducts] = useState({});
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isSingleProductModalOpen, setIsSingleProductModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isAddToCartConfigModalOpen, setIsAddToCartConfigModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedProductForConfig, setSelectedProductForConfig] = useState(null);
  const [checkoutProducts, setCheckoutProductsLocal] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailedProduct, setDetailedProduct] = useState(null);
  const [viewMode, setViewMode] = useState('companies');
  const [isLoading, setIsLoading] = useState(true);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [cartStatus, setCartStatus] = useState({});
  const [showCartSuccess, setShowCartSuccess] = useState(false);
  const [addedProduct, setAddedProduct] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);

  // Currency states from Firebase
  const [currencyRates, setCurrencyRates] = useState({});
  const [currencySymbols, setCurrencySymbols] = useState({});
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [availableCurrencies, setAvailableCurrencies] = useState([]);
  const [isLoadingCurrency, setIsLoadingCurrency] = useState(true);

  // Check mobile view
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch currency data from Firebase
  const fetchCurrencyData = async () => {
    setIsLoadingCurrency(true);
    try {
      const { rates, symbols } = await getCurrencyData();
      console.log('💰 Currency rates from Firebase:', rates);
      console.log('💰 Currency symbols from Firebase:', symbols);

      setCurrencyRates(rates);
      setCurrencySymbols(symbols);

      const currencies = Object.keys(rates).map(code => ({
        code,
        rate: rates[code],
        symbol: symbols[code] || code
      }));

      setAvailableCurrencies(currencies);
      setIsLoadingCurrency(false);
    } catch (error) {
      console.error('Error fetching currency data:', error);
      setIsLoadingCurrency(false);
    }
  };

  // Set default currency based on category
  const setDefaultCurrencyForCategory = () => {
    if (!categoryId || !currencyRates) return;

    const isRiceCategory = categoryId === 'rice' ||
      categoryData?.name?.toLowerCase().includes('rice') ||
      categoryId?.toLowerCase().includes('rice');

    if (isRiceCategory && currencyRates['INR']) {
      setSelectedCurrency('INR');
    } else {
      setSelectedCurrency('USD');
    }
  };

  // Fetch all data from Firebase
  useEffect(() => {
    if (!categoryId) return;
    fetchAllData();
    fetchCurrencyData();
  }, [categoryId]);

  useEffect(() => {
    if (categoryData && Object.keys(currencyRates).length > 0) {
      setDefaultCurrencyForCategory();
    }
  }, [categoryData, currencyRates]);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [categoriesSnap, companiesSnap, brandsSnap, productsSnap] = await Promise.all([
        get(ref(database, 'categories')),
        get(ref(database, 'companies')),
        get(ref(database, 'brands')),
        get(ref(database, 'products'))
      ]);

      const fetchedCategories = categoriesSnap.exists() ? categoriesSnap.val() : {};
      const fetchedCompanies = companiesSnap.exists() ? companiesSnap.val() : {};
      const fetchedBrands = brandsSnap.exists() ? brandsSnap.val() : {};
      const fetchedProducts = productsSnap.exists() ? productsSnap.val() : {};

      console.log('📦 All fetched products keys:', Object.keys(fetchedProducts));
      console.log('📦 All fetched products sample:', Object.values(fetchedProducts).slice(0, 3));
      
      // Debug: Check for Tando products specifically
      const tandoProducts = Object.entries(fetchedProducts).filter(([id, product]) => 
        product.companyId === 'tando_beverages'
      );
      console.log('🔍 Tando Beverages products found:', tandoProducts.length);
      console.log('🔍 Tando products details:', tandoProducts);

      setCategoryData(fetchedCategories[categoryId] || null);
      setAllCompanies(fetchedCompanies);
      setAllBrands(fetchedBrands);
      setAllProducts(fetchedProducts);

      // Filter products by category - FIXED: Handle nested product structures
      let categoryProducts = [];
      
      // Helper function to safely extract products
      const extractProducts = (obj) => {
        const result = [];
        if (!obj || typeof obj !== 'object') return result;
        
        Object.entries(obj).forEach(([productId, productData]) => {
          // Skip if productData is not an object
          if (!productData || typeof productData !== 'object') return;
          
          // Check if this product has categoryId directly
          if (productData.categoryId === categoryId) {
            result.push({
              id: productId,
              ...productData
            });
          }
          
          // Check for nested products (like in the JSON structure)
          Object.values(productData).forEach(nestedValue => {
            if (nestedValue && typeof nestedValue === 'object' && nestedValue.categoryId === categoryId) {
              result.push({
                id: productId + '_' + Math.random(), // Generate unique ID for nested
                ...nestedValue
              });
            }
          });
        });
        
        return result;
      };
      
      categoryProducts = extractProducts(fetchedProducts);
      
      // Also check directly in products object for any products with matching categoryId
      const directProducts = Object.entries(fetchedProducts)
        .filter(([productId, productData]) => {
          // Handle both direct and nested structures
          if (productData && productData.categoryId === categoryId) return true;
          // Check if any nested object has categoryId
          if (productData && typeof productData === 'object') {
            return Object.values(productData).some(val => 
              val && typeof val === 'object' && val.categoryId === categoryId
            );
          }
          return false;
        })
        .flatMap(([productId, productData]) => {
          if (productData.categoryId === categoryId) {
            return [{ id: productId, ...productData }];
          }
          // Flatten nested products
          const nestedProducts = [];
          Object.entries(productData).forEach(([nestedId, nestedData]) => {
            if (nestedData && typeof nestedData === 'object' && nestedData.categoryId === categoryId) {
              nestedProducts.push({
                id: `${productId}_${nestedId}`,
                ...nestedData
              });
            }
          });
          return nestedProducts;
        });
      
      // Use the more comprehensive extraction
      const finalCategoryProducts = directProducts.length > 0 ? directProducts : categoryProducts;
      
      console.log(`📦 Products in category "${categoryId}":`, finalCategoryProducts.length);
      console.log('📦 Category products sample:', finalCategoryProducts.slice(0, 2));

      // Get unique company IDs from products
      const uniqueCompanyIds = [...new Set(finalCategoryProducts.map(p => p.companyId).filter(Boolean))];
      console.log('🏢 Unique company IDs in category:', uniqueCompanyIds);

      let filteredCompanies = [];

      if (uniqueCompanyIds.length > 0) {
        filteredCompanies = uniqueCompanyIds.map(companyId => ({
          id: companyId,
          ...fetchedCompanies[companyId]
        })).filter(c => c && c.id);
      } else {
        // If no products with companyId, show all companies
        filteredCompanies = Object.entries(fetchedCompanies).map(([companyId, companyData]) => ({
          id: companyId,
          ...companyData
        }));
      }

      // Enhance companies with product and brand counts
      filteredCompanies = filteredCompanies.map(company => {
        const companyProducts = finalCategoryProducts.filter(p => p.companyId === company.id);
        const brandIds = [...new Set(companyProducts.map(p => p.brandId).filter(Boolean))];

        return {
          ...company,
          productCount: companyProducts.length,
          brandCount: brandIds.length,
          hasBrands: brandIds.length > 0,
          products: companyProducts // Store products for later use
        };
      });

      console.log('🏢 Filtered companies:', filteredCompanies.map(c => ({ id: c.id, name: c.name, productCount: c.productCount })));

      setCompanies(filteredCompanies);
      setDebugInfo({
        totalProducts: Object.keys(fetchedProducts).length,
        categoryProducts: finalCategoryProducts.length,
        companies: filteredCompanies.length,
        tandoProducts: finalCategoryProducts.filter(p => p.companyId === 'tando_beverages').length
      });
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setIsLoading(false);
    }
  };

  // Filter products based on search query
  useEffect(() => {
    let filtered = products;

    if (globalSearchQuery.trim() !== '') {
      const searchLower = globalSearchQuery.toLowerCase().trim();
      filtered = filtered.filter(product => (
        (product.name && product.name.toLowerCase().includes(searchLower)) ||
        (product.meta?.description && product.meta.description.toLowerCase().includes(searchLower)) ||
        (product.companyName && product.companyName.toLowerCase().includes(searchLower)) ||
        (product.brandName && product.brandName.toLowerCase().includes(searchLower)) ||
        (product.origin && product.origin.toLowerCase().includes(searchLower)) ||
        (product.meta?.pack_type && product.meta.pack_type.toLowerCase().includes(searchLower)) ||
        (product.meta?.shelf_life && product.meta.shelf_life.toLowerCase().includes(searchLower))
      ));
    }

    if (productSearchQuery.trim() !== '') {
      const searchLower = productSearchQuery.toLowerCase().trim();
      filtered = filtered.filter(product => (
        (product.name && product.name.toLowerCase().includes(searchLower)) ||
        (product.meta?.description && product.meta.description.toLowerCase().includes(searchLower)) ||
        (product.origin && product.origin.toLowerCase().includes(searchLower))
      ));
    }

    setFilteredProducts(filtered);
  }, [globalSearchQuery, products, productSearchQuery]);

  // Load brands when company is selected
  useEffect(() => {
    if (selectedCompany && allBrands && allProducts) {
      loadCompanyBrands();
    }
  }, [selectedCompany, allBrands, allProducts]);

  const loadCompanyBrands = () => {
    if (!selectedCompany || !allBrands || !allProducts) return;

    try {
      // Get all products for this company in this category
      let companyProducts = [];
      
      const extractCompanyProducts = (obj) => {
        if (!obj || typeof obj !== 'object') return;
        
        Object.entries(obj).forEach(([productId, productData]) => {
          if (!productData || typeof productData !== 'object') return;
          
          if (productData.categoryId === categoryId && productData.companyId === selectedCompany.id) {
            companyProducts.push({ id: productId, ...productData });
          }
          
          // Check nested
          Object.values(productData).forEach(nestedValue => {
            if (nestedValue && typeof nestedValue === 'object' && 
                nestedValue.categoryId === categoryId && 
                nestedValue.companyId === selectedCompany.id) {
              companyProducts.push({ id: productId + '_' + Math.random(), ...nestedValue });
            }
          });
        });
      };
      
      extractCompanyProducts(allProducts);
      
      console.log(`📦 Products for company ${selectedCompany.name}:`, companyProducts.length);

      const brandedProducts = companyProducts.filter(p => p.brandId);
      const unbrandedProducts = companyProducts.filter(p => !p.brandId);
      const brandIds = [...new Set(brandedProducts.map(p => p.brandId))];

      const brandList = brandIds
        .map(brandId => {
          const brandData = allBrands[brandId];
          if (!brandData) return null;
          return {
            id: brandId,
            ...brandData,
            companyId: selectedCompany.id,
            companyName: selectedCompany.name,
            productCount: brandedProducts.filter(p => p.brandId === brandId).length,
            logo: brandData.logo || brandData.image
          };
        })
        .filter(Boolean);

      if (brandList.length > 0) {
        setBrands(brandList);
        setViewMode('brands');
        return;
      }

      // If no brands, show products directly
      const productsList = unbrandedProducts.map(p => ({
        ...p,
        companyId: selectedCompany.id,
        companyName: selectedCompany.name,
        brandName: null,
        imageUrl: p.image
      }));

      setProducts(productsList);
      setFilteredProducts(productsList);
      setSelectedBrand(null);
      setViewMode('products');
    } catch (error) {
      console.error('Error loading company brands:', error);
      setBrands([]);
    }
  };

  // Load products when brand is selected
  useEffect(() => {
    if (selectedBrand && allProducts) {
      loadBrandProducts();
    }
  }, [selectedBrand, allProducts]);

  const loadBrandProducts = () => {
    if (!selectedBrand || !allProducts) return;

    try {
      let productsList = [];
      
      const extractBrandProducts = (obj) => {
        if (!obj || typeof obj !== 'object') return;
        
        Object.entries(obj).forEach(([productId, productData]) => {
          if (!productData || typeof productData !== 'object') return;
          
          if (productData.categoryId === categoryId && 
              productData.companyId === selectedBrand.companyId && 
              productData.brandId === selectedBrand.id) {
            productsList.push({
              id: productId,
              ...productData,
              companyId: selectedBrand.companyId,
              companyName: selectedBrand.companyName,
              brandName: selectedBrand.name,
              imageUrl: productData.image
            });
          }
          
          // Check nested
          Object.values(productData).forEach(nestedValue => {
            if (nestedValue && typeof nestedValue === 'object' && 
                nestedValue.categoryId === categoryId && 
                nestedValue.companyId === selectedBrand.companyId && 
                nestedValue.brandId === selectedBrand.id) {
              productsList.push({
                id: productId + '_' + Math.random(),
                ...nestedValue,
                companyId: selectedBrand.companyId,
                companyName: selectedBrand.companyName,
                brandName: selectedBrand.name,
                imageUrl: nestedValue.image
              });
            }
          });
        });
      };
      
      extractBrandProducts(allProducts);
      
      console.log(`📦 Products for brand ${selectedBrand.name}:`, productsList.length);

      setProducts(productsList);
      setFilteredProducts(productsList);
      setViewMode('products');
      setProductSearchQuery('');
    } catch (error) {
      console.error('Error loading brand products:', error);
      setProducts([]);
      setFilteredProducts([]);
    }
  };

  const getBrandImageUrl = (brandData) => {
    if (!brandData) return null;
    return brandData.logo || brandData.image || null;
  };

  const getCompanyLogoUrl = (company) => {
    if (!company) return null;
    return company.logo || null;
  };

  // Enhanced rice detection that checks for pack-based pricing
  const isRiceProduct = (product) => {
    if (!product) return false;
    if (product.companyName?.toLowerCase().includes('siea')) return true;
    if (categoryId === 'rice' || categoryData?.name?.toLowerCase().includes('rice')) return true;
    if (product.name?.toLowerCase().includes('rice') ||
        product.name?.toLowerCase().includes('basmati') ||
        product.name?.toLowerCase().includes('sona masoori')) return true;
    if (product.configurations && (product.configurations.packingTypes || product.configurations.quantityUnits)) return true;
    // Check for pack-based rice pricing
    if (product.meta?.baseExMillPrices) return true;
    if (product.price_range?.unit === 'per_pack') return false; // Not rice, but per pack
    return false;
  };

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

  // Get base price from Firebase product data structure
  // FIXED: For rice products, return pack prices (5kg,10kg,30kg) from meta.baseExMillPrices or price_range
  // Also normalise pack price keys to numbers (remove "kg")
  const getBasePrice = (product) => {
    if (!product) return { value: 0, currency: 'USD', type: 'unknown', unit: 'unit' };

    // --- RICE PACK PRICING (per pack: 5kg, 10kg, 30kg) ---
    if (isRiceProduct(product)) {
      // Priority 1: meta.baseExMillPrices
      if (product.meta?.baseExMillPrices && typeof product.meta.baseExMillPrices === 'object') {
        const rawPackPrices = product.meta.baseExMillPrices;
        // Normalise keys: convert "5kg" -> 5, "10kg" -> 10 etc.
        const packPrices = {};
        Object.entries(rawPackPrices).forEach(([key, price]) => {
          const numericKey = parseFloat(key); // "5kg" -> 5, "10" -> 10
          if (!isNaN(numericKey)) {
            packPrices[numericKey] = price;
          }
        });
        const numericPrices = Object.values(packPrices).filter(v => typeof v === 'number');
        if (numericPrices.length > 0) {
          const minPrice = Math.min(...numericPrices);
          const maxPrice = Math.max(...numericPrices);
          return {
            type: 'rice_pack',
            packPrices: packPrices,          // e.g. { 5: 490, 10: 980, 30: 2940 }
            currency: 'INR',
            unit: 'pack',
            min: minPrice,
            max: maxPrice,
            value: minPrice,
            displayUnit: 'pack'
          };
        }
      }
      // Priority 2: price_range with unit "per_pack"
      if (product.price_range && product.price_range.unit === 'per_pack') {
        const min = product.price_range.min;
        const max = product.price_range.max;
        if (typeof min === 'number' && typeof max === 'number') {
          return {
            type: 'rice_pack',
            currency: 'INR',
            unit: 'pack',
            min: min,
            max: max,
            value: min,
            displayUnit: 'pack'
          };
        }
      }
      // Priority 3: old rice per‑kg logic (fallback)
      if (product.price && typeof product.price === 'object') {
        if (product.price.min !== undefined && product.price.max !== undefined) {
          return {
            type: 'rice',
            min: product.price.min,
            max: product.price.max,
            value: (product.price.min + product.price.max) / 2,
            currency: product.price.currency || 'INR',
            unit: 'kg',
            displayUnit: 'kg'
          };
        }
      }
    }

    // --- NON‑RICE PRODUCTS (existing logic) ---
    if (product.pricing) {
      if (product.pricing.basePrice !== undefined) {
        return {
          value: product.pricing.basePrice,
          currency: product.pricing.currency || 'USD',
          type: product.pricing.type || 'fixed',
          unit: product.pricing.unit || 'per_carton',
          displayUnit: product.pricing.unit || 'carton'
        };
      }
      if (product.pricing.price !== undefined) {
        return {
          value: product.pricing.price,
          currency: product.pricing.currency || 'USD',
          type: product.pricing.type || 'fixed',
          unit: product.pricing.unit || 'unit',
          displayUnit: product.pricing.unit || 'unit'
        };
      }
    }

    if (product.packaging && product.packaging.units_per_carton && product.packaging.price_per_unit) {
      return {
        value: product.packaging.price_per_unit * product.packaging.units_per_carton,
        currency: product.packaging.currency || 'USD',
        type: 'carton',
        unit: 'carton',
        displayUnit: 'carton'
      };
    }

    if (product["Ex-Mill_usd"] !== undefined && product["Ex-Mill_usd"] !== null) {
      return {
        value: parseFloat(product["Ex-Mill_usd"]),
        currency: 'USD',
        type: 'EX-MILL',
        unit: 'carton',
        displayUnit: 'carton'
      };
    }

    if (product.price_usd_per_carton !== undefined && product.price_usd_per_carton !== null) {
      return {
        value: parseFloat(product.price_usd_per_carton),
        currency: 'USD',
        type: 'carton',
        unit: 'carton',
        displayUnit: 'carton'
      };
    }

    if (product.fob_price_usd !== undefined && product.fob_price_usd !== null) {
      return {
        value: parseFloat(product.fob_price_usd),
        currency: 'USD',
        type: 'FOB',
        unit: 'carton',
        displayUnit: 'carton'
      };
    }

    if (product.price !== undefined && typeof product.price === 'number') {
      return {
        value: product.price,
        currency: product.currency || 'USD',
        type: 'fixed',
        unit: 'unit',
        displayUnit: 'unit'
      };
    }

    if (product.price && typeof product.price === 'object' && product.price.value !== undefined) {
      return {
        value: product.price.value,
        currency: product.price.currency || 'USD',
        type: product.price.type || 'fixed',
        unit: product.price.unit || 'unit',
        displayUnit: product.price.unit || 'unit'
      };
    }

    console.warn('⚠️ No price found for product:', product.id, product.name);
    return {
      value: 0,
      currency: 'USD',
      type: 'unknown',
      unit: 'unit',
      displayUnit: 'unit'
    };
  };

  // Get product price display string (for cards, details modal)
  const getProductPriceDisplay = (product) => {
    if (!product) return 'Contact for Price';

    const basePrice = getBasePrice(product);
    
    if (basePrice.value === 0 && basePrice.min === undefined && basePrice.max === undefined) {
      return 'Contact for Price';
    }

    // Handle rice pack pricing
    if (basePrice.type === 'rice_pack') {
      const symbol = basePrice.currency === 'INR' ? '₹' : 
                    basePrice.currency === 'USD' ? '$' : 
                    currencySymbols[basePrice.currency] || basePrice.currency;
      
      // If we have actual pack prices (5kg,10kg,30kg), show them as range
      if (basePrice.min !== undefined && basePrice.max !== undefined) {
        // Convert if needed
        let minVal = basePrice.min;
        let maxVal = basePrice.max;
        if (selectedCurrency !== basePrice.currency) {
          minVal = convertCurrency(basePrice.min, basePrice.currency, selectedCurrency);
          maxVal = convertCurrency(basePrice.max, basePrice.currency, selectedCurrency);
        }
        const symbolFinal = selectedCurrency !== basePrice.currency
          ? (currencySymbols[selectedCurrency] || (selectedCurrency === 'INR' ? '₹' : selectedCurrency === 'USD' ? '$' : selectedCurrency))
          : symbol;
        // Determine pack size range from keys
        let sizeRange = '5kg-30kg';
        if (basePrice.packPrices) {
          const sizes = Object.keys(basePrice.packPrices).map(Number).sort((a,b)=>a-b);
          if (sizes.length) sizeRange = `${sizes[0]}kg-${sizes[sizes.length-1]}kg`;
        }
        return `${symbolFinal}${minVal.toFixed(2)} - ${symbolFinal}${maxVal.toFixed(2)} / pack (${sizeRange})`;
      }
      // Fallback: show single pack price
      let value = basePrice.value;
      if (selectedCurrency !== basePrice.currency) {
        value = convertCurrency(basePrice.value, basePrice.currency, selectedCurrency);
      }
      const symbolFinal = selectedCurrency !== basePrice.currency
        ? (currencySymbols[selectedCurrency] || (selectedCurrency === 'INR' ? '₹' : selectedCurrency === 'USD' ? '$' : selectedCurrency))
        : symbol;
      return `${symbolFinal}${value.toFixed(2)} / pack`;
    }

    // Handle legacy rice per‑kg
    if (basePrice.type === 'rice' && basePrice.min !== undefined && basePrice.max !== undefined) {
      const symbol = basePrice.currency === 'INR' ? '₹' : 
                    basePrice.currency === 'USD' ? '$' : 
                    currencySymbols[basePrice.currency] || basePrice.currency;
      if (selectedCurrency === basePrice.currency) {
        return `${symbol}${basePrice.min.toFixed(2)} - ${symbol}${basePrice.max.toFixed(2)} / kg`;
      } else {
        const convertedMin = convertCurrency(basePrice.min, basePrice.currency, selectedCurrency);
        const convertedMax = convertCurrency(basePrice.max, basePrice.currency, selectedCurrency);
        const symbolFinal = currencySymbols[selectedCurrency] || (selectedCurrency === 'INR' ? '₹' : selectedCurrency === 'USD' ? '$' : selectedCurrency);
        return `${symbolFinal}${convertedMin.toFixed(2)} - ${symbolFinal}${convertedMax.toFixed(2)} / kg`;
      }
    }

    // Non‑rice or fixed pricing
    if (selectedCurrency === basePrice.currency) {
      const symbol = basePrice.currency === 'INR' ? '₹' : 
                    basePrice.currency === 'USD' ? '$' : 
                    currencySymbols[basePrice.currency] || basePrice.currency;

      if (basePrice.type === 'EX-MILL') {
        return `${symbol}${basePrice.value.toFixed(2)} EX-MILL / carton`;
      }
      if (basePrice.type === 'FOB') {
        return `${symbol}${basePrice.value.toFixed(2)} FOB / carton`;
      }
      if (basePrice.type === 'carton' || basePrice.unit === 'carton' || basePrice.unit === 'per_carton') {
        return `${symbol}${basePrice.value.toFixed(2)} / carton`;
      }
      if (basePrice.value) {
        if (basePrice.unit === 'carton' || basePrice.unit === 'per_carton') {
          return `${symbol}${basePrice.value.toFixed(2)} / carton`;
        } else if (basePrice.unit === 'kg') {
          return `${symbol}${basePrice.value.toFixed(2)} / kg`;
        } else {
          return `${symbol}${basePrice.value.toFixed(2)} / ${basePrice.unit}`;
        }
      }
    } else {
      const convertedValue = convertCurrency(basePrice.value || basePrice.min || 0, basePrice.currency, selectedCurrency);
      const symbol = currencySymbols[selectedCurrency] ||
        (selectedCurrency === 'INR' ? '₹' :
          selectedCurrency === 'USD' ? '$' : selectedCurrency);

      if (basePrice.type === 'EX-MILL') {
        return `${symbol}${convertedValue.toFixed(2)} EX-MILL / carton`;
      }
      if (basePrice.type === 'FOB') {
        return `${symbol}${convertedValue.toFixed(2)} FOB / carton`;
      }
      if (basePrice.type === 'carton' || basePrice.unit === 'per_carton') {
        return `${symbol}${convertedValue.toFixed(2)} / carton`;
      }
      return `${symbol}${convertedValue.toFixed(2)} / ${basePrice.displayUnit}`;
    }

    return 'Contact for Price';
  };

  // Extended version that returns structured data
  const getProductPriceInSelectedCurrency = (product) => {
    if (!product) return { display: 'Contact for Price', value: 0, currency: selectedCurrency };

    const basePrice = getBasePrice(product);
    
    if (basePrice.value === 0 && basePrice.min === undefined) {
      return { display: 'Contact for Price', value: 0, currency: selectedCurrency };
    }

    if (basePrice.type === 'rice_pack') {
      let minVal = basePrice.min;
      let maxVal = basePrice.max;
      let value = basePrice.value;
      if (selectedCurrency !== basePrice.currency) {
        minVal = convertCurrency(basePrice.min, basePrice.currency, selectedCurrency);
        maxVal = convertCurrency(basePrice.max, basePrice.currency, selectedCurrency);
        value = convertCurrency(basePrice.value, basePrice.currency, selectedCurrency);
      }
      const symbol = currencySymbols[selectedCurrency] || (selectedCurrency === 'INR' ? '₹' : selectedCurrency === 'USD' ? '$' : selectedCurrency);
      let sizeRange = '5kg-30kg';
      if (basePrice.packPrices) {
        const sizes = Object.keys(basePrice.packPrices).map(Number).sort((a,b)=>a-b);
        if (sizes.length) sizeRange = `${sizes[0]}kg-${sizes[sizes.length-1]}kg`;
      }
      return {
        display: `${symbol}${minVal.toFixed(2)} - ${symbol}${maxVal.toFixed(2)} / pack (${sizeRange})`,
        min: minVal,
        max: maxVal,
        value: value,
        currency: selectedCurrency,
        type: 'rice_pack'
      };
    }

    if (selectedCurrency !== basePrice.currency) {
      const convertedValue = convertCurrency(basePrice.value || basePrice.min || 0, basePrice.currency, selectedCurrency);
      const symbol = currencySymbols[selectedCurrency] ||
        (selectedCurrency === 'INR' ? '₹' :
          selectedCurrency === 'USD' ? '$' : selectedCurrency);

      if (basePrice.type === 'EX-MILL') {
        return {
          display: `${symbol}${convertedValue.toFixed(2)} EX-MILL / carton`,
          value: convertedValue,
          currency: selectedCurrency
        };
      }
      if (basePrice.type === 'FOB') {
        return {
          display: `${symbol}${convertedValue.toFixed(2)} FOB / carton`,
          value: convertedValue,
          currency: selectedCurrency
        };
      }
      if (basePrice.type === 'rice' && basePrice.min !== undefined && basePrice.max !== undefined) {
        const convertedMin = convertCurrency(basePrice.min, basePrice.currency, selectedCurrency);
        const convertedMax = convertCurrency(basePrice.max, basePrice.currency, selectedCurrency);
        return {
          display: `${symbol}${convertedMin.toFixed(2)} - ${symbol}${convertedMax.toFixed(2)} / kg`,
          min: convertedMin,
          max: convertedMax,
          value: (convertedMin + convertedMax) / 2,
          currency: selectedCurrency
        };
      }
      return {
        display: `${symbol}${convertedValue.toFixed(2)} / ${basePrice.displayUnit}`,
        value: convertedValue,
        currency: selectedCurrency
      };
    }

    return {
      display: getProductPriceDisplay(product),
      value: basePrice.value || basePrice.min || 0,
      currency: basePrice.currency
    };
  };

  const getProductPrice = (product) => {
    return getProductPriceDisplay(product);
  };

  const getProductPriceForCart = (product) => {
    const priceDisplay = getProductPriceDisplay(product);
    const basePrice = getBasePrice(product);

    if (basePrice.type === 'rice_pack') {
      return {
        type: 'rice_pack',
        minPerPack: basePrice.min,
        maxPerPack: basePrice.max,
        packPrices: basePrice.packPrices,
        min: basePrice.min,
        max: basePrice.max,
        unit: 'pack',
        currency: 'INR',
        display: priceDisplay
      };
    }

    if (basePrice.type === 'rice' && basePrice.min !== undefined && basePrice.max !== undefined) {
      return {
        type: 'rice',
        minPerKg: basePrice.min,
        maxPerKg: basePrice.max,
        min: basePrice.min,
        max: basePrice.max,
        unit: 'kg',
        currency: 'INR',
        display: priceDisplay
      };
    }

    if (basePrice.value) {
      return {
        type: basePrice.type,
        value: basePrice.value,
        currency: basePrice.currency,
        display: priceDisplay,
        unit: basePrice.displayUnit
      };
    }

    return {
      type: 'unknown',
      display: 'Contact for Price'
    };
  };

  // ==================== UPDATED getQuantityOptionsFromFirebase ====================
  // Now returns a descriptive label with unit weight for non‑rice products.
  // Example: "27 × 200 ml / carton" instead of "27 units/carton"
  const getQuantityOptionsFromFirebase = (product) => {
    if (!product) return [];

    // Rice products – keep original logic
    if (isRiceProduct(product) && product.configurations?.quantityUnits) {
      const quantityUnits = product.configurations.quantityUnits;
      if (Array.isArray(quantityUnits)) {
        return quantityUnits.map(q => ({
          value: q,
          label: q,
          actualQuantity: parseFloat(q)
        }));
      }
      if (typeof quantityUnits === 'object') {
        return Object.values(quantityUnits).map(q => ({
          value: q,
          label: q,
          actualQuantity: parseFloat(q)
        }));
      }
    }

    // If product has a simple quantity array
    if (product.quantity && Array.isArray(product.quantity)) {
      return product.quantity.map(q => ({
        value: q,
        label: `${q} ${product.quantity_unit || 'units'}`,
        actualQuantity: parseFloat(q)
      }));
    }

    // For non‑rice products with packaging details
    if (product.packaging && product.packaging.units_per_carton) {
      const unitsPerCarton = product.packaging.units_per_carton;
      let unitWeightStr = '';
      let unitType = '';

      // Try to get unit weight from different possible fields
      if (product.packaging.unit_weight) {
        unitWeightStr = product.packaging.unit_weight;
        unitType = product.packaging.unit || 'ml';
      } else if (product.packaging.unit_weight_g) {
        unitWeightStr = product.packaging.unit_weight_g;
        unitType = 'g';
      } else if (product.packaging.unit_weight_ml) {
        unitWeightStr = product.packaging.unit_weight_ml;
        unitType = 'ml';
      }

      let label = `${unitsPerCarton} units / carton`;
      if (unitWeightStr) {
        label = `${unitsPerCarton} × ${unitWeightStr} ${unitType} / carton`;
      }

      return [{
        value: "carton",
        label: label,
        actualQuantity: unitsPerCarton,
        unit: unitType || 'unit'
      }];
    }

    return [];
  };
  // ==================== END OF UPDATED FUNCTION ====================

  // Get packing options from Firebase
  const getPackingOptionsFromFirebase = (product) => {
    if (!product) return [];

    if (isRiceProduct(product) && product.configurations?.packingTypes) {
      const packingTypes = product.configurations.packingTypes;
      if (Array.isArray(packingTypes)) {
        return packingTypes.map(p => ({
          value: p,
          label: p,
          pricePerKg: product.meta?.packing_costs?.[p] || 0,
          pricePerUnit: 0,
          applicableForQuantities: Object.keys(product.meta?.packing_costs?.[p] || {}),
          isDefault: p === (product.meta?.default_packing || packingTypes[0])
        }));
      }
      if (typeof packingTypes === 'object') {
        return Object.values(packingTypes).map(p => ({
          value: p,
          label: p,
          pricePerKg: product.meta?.packing_costs?.[p] || 0,
          pricePerUnit: 0,
          applicableForQuantities: Object.keys(product.meta?.packing_costs?.[p] || {}),
          isDefault: p === (product.meta?.default_packing || Object.values(packingTypes)[0])
        }));
      }
    }

    if (product.meta && product.meta.pack_type) {
      return product.meta.pack_type.split(',').map(item => ({
        value: item.trim(),
        label: item.trim(),
        pricePerKg: 0,
        pricePerUnit: 0,
        applicableForQuantities: [],
        isDefault: true
      }));
    }

    if (product.pack_type) {
      if (typeof product.pack_type === 'string') {
        return product.pack_type.split(',').map(item => ({
          value: item.trim(),
          label: item.trim(),
          pricePerKg: 0,
          pricePerUnit: 0,
          applicableForQuantities: [],
          isDefault: true
        }));
      }
      if (Array.isArray(product.pack_type)) {
        return product.pack_type.flatMap(p =>
          p.split(',').map(item => ({
            value: item.trim(),
            label: item.trim(),
            pricePerKg: 0,
            pricePerUnit: 0,
            applicableForQuantities: [],
            isDefault: true
          }))
        );
      }
    }

    if (product.packaging) {
      if (typeof product.packaging === 'string') {
        return [{
          value: product.packaging,
          label: product.packaging,
          pricePerKg: 0,
          pricePerUnit: 0,
          applicableForQuantities: [],
          isDefault: true
        }];
      }
      if (typeof product.packaging === 'object') {
        if (product.packaging.type) {
          return [{
            value: product.packaging.type,
            label: product.packaging.type,
            pricePerKg: 0,
            pricePerUnit: 0,
            applicableForQuantities: [],
            isDefault: true
          }];
        }
        if (product.packaging.units_per_carton) {
          const display = product.packaging.unit_weight
            ? `${product.packaging.units_per_carton} × ${product.packaging.unit_weight} ${product.packaging.unit || 'ml'}`
            : product.packaging.unit_weight_g
              ? `${product.packaging.units_per_carton} × ${product.packaging.unit_weight_g} g`
              : product.packaging.unit_weight_ml
                ? `${product.packaging.units_per_carton} × ${product.packaging.unit_weight_ml} ml`
                : `${product.packaging.units_per_carton} units/carton`;
          return [{
            value: display,
            label: display,
            pricePerKg: 0,
            pricePerUnit: 0,
            applicableForQuantities: [],
            isDefault: true
          }];
        }
      }
    }

    return [];
  };

  // Get packing cost from Firebase
  const getPackingCostFromFirebase = (product, packingType, quantity) => {
    if (!product || !packingType) return 0;
    
    if (isRiceProduct(product) && product.meta?.packing_costs) {
      const packingCosts = product.meta.packing_costs[packingType];
      if (packingCosts) {
        const quantityValue = parseFloat(quantity);
        const quantityKey = Object.keys(packingCosts).find(key => parseFloat(key) === quantityValue || key === quantity);
        if (quantityKey && packingCosts[quantityKey]) {
          return parseFloat(packingCosts[quantityKey]);
        }
      }
    }
    
    return 0;
  };

  // Get quantity unit from Firebase
  const getQuantityUnitFromFirebase = (product) => {
    if (!product) return 'units';

    if (isRiceProduct(product)) {
      return 'kg';
    }

    if (product.quantity_unit) {
      return product.quantity_unit;
    }

    if (product.packaging && product.packaging.unit_weight) {
      return product.packaging.unit_weight_unit || 'ml';
    }

    if (product.packaging && product.packaging.unit_weight_g) {
      return 'g';
    }

    if (product.packaging && product.packaging.unit_weight_ml) {
      return 'ml';
    }

    if (product.packaging && product.packaging.unit) {
      return product.packaging.unit;
    }

    return 'units';
  };

  // Get detailed packaging display with weight/volume units
  const getDetailedPackagingDisplay = (product) => {
    if (isRiceProduct(product)) {
      return null;
    }

    if (product.packaging) {
      if (typeof product.packaging === 'object') {
        const unitsPerCarton = product.packaging.units_per_carton;
        const unitWeight = product.packaging.unit_weight;
        const unit = product.packaging.unit || 'ml';
        
        if (unitsPerCarton && unitWeight) {
          return {
            main: `${unitsPerCarton} × ${unitWeight} ${unit}`,
            unitsPerCarton: unitsPerCarton,
            unitWeight: unitWeight,
            unitType: unit,
            displayText: `${unitsPerCarton} × ${unitWeight} ${unit} / carton`
          };
        }
        
        if (product.packaging.unit_weight_g) {
          const unitWeight = product.packaging.unit_weight_g;
          if (unitsPerCarton && unitWeight) {
            return {
              main: `${unitsPerCarton} × ${unitWeight} g`,
              unitsPerCarton: unitsPerCarton,
              unitWeight: unitWeight,
              unitType: 'g',
              displayText: `${unitsPerCarton} × ${unitWeight} g / carton`
            };
          }
        }
        
        if (product.packaging.unit_weight_ml) {
          const unitWeight = product.packaging.unit_weight_ml;
          if (unitsPerCarton && unitWeight) {
            return {
              main: `${unitsPerCarton} × ${unitWeight} ml`,
              unitsPerCarton: unitsPerCarton,
              unitWeight: unitWeight,
              unitType: 'ml',
              displayText: `${unitsPerCarton} × ${unitWeight} ml / carton`
            };
          }
        }
        
        if (unitsPerCarton) {
          return {
            main: `${unitsPerCarton} units / carton`,
            unitsPerCarton: unitsPerCarton,
            unitWeight: null,
            unitType: null,
            displayText: `${unitsPerCarton} units / carton`
          };
        }
      }
    }

    if (product.meta && product.meta.pack_type) {
      return {
        main: product.meta.pack_type,
        unitsPerCarton: null,
        unitWeight: null,
        unitType: null,
        displayText: product.meta.pack_type
      };
    }

    return null;
  };

  // ==================== UPDATED getComprehensiveProductSpecs ====================
  // This function now shows packaging quantity (e.g., "27 × 200 ml / carton") for non‑rice products
  const getComprehensiveProductSpecs = (product) => {
    const specs = [];
    const isRice = isRiceProduct(product);
    const packaging = getDetailedPackagingDisplay(product);
    const basePrice = getBasePrice(product);

    // Basic Information
    specs.push({
      category: "Basic Information",
      icon: <Info size={18} className="me-2" style={{ color: '#10b981' }} />,
      items: [
        { label: "Product Name", value: product.meta?.name || product.name || "N/A" },
        { label: "Brand", value: product.brandName || "General" },
        { label: "Company", value: product.companyName || "N/A" },
        { label: "Category", value: categoryData?.name || categoryId || "N/A" }
      ]
    });

    // Origin & Manufacturing
    specs.push({
      category: "Origin & Manufacturing",
      icon: <Globe size={18} className="me-2" style={{ color: '#10b981' }} />,
      items: [
        { label: "Country of Origin", value: product.meta?.origin || product.origin || "Not specified" },
        { label: "HSN Code", value: product.hsn_code || product.meta?.hsn_code || "Not specified" }
      ]
    });

    // For Rice products: show packing types, quantity options, and individual pack prices
    if (isRice && product.configurations) {
      const riceSpecItems = [];

      // Packing type (PP, BOPP, etc.)
      if (product.configurations.packingTypes) {
        const packingTypes = Array.isArray(product.configurations.packingTypes)
          ? product.configurations.packingTypes
          : Object.values(product.configurations.packingTypes);
        riceSpecItems.push({
          label: "Packing Type",
          value: packingTypes.join(', ')
        });
      }

      // Available quantities (5kg, 10kg, 30kg)
      if (product.configurations.quantityUnits) {
        const quantityUnits = Array.isArray(product.configurations.quantityUnits)
          ? product.configurations.quantityUnits
          : Object.values(product.configurations.quantityUnits);
        riceSpecItems.push({
          label: "Available Quantities",
          value: quantityUnits.join(', ')
        });
      }

      // Pack prices (5kg – ₹490, 10kg – ₹980, ...)
      if (basePrice.type === 'rice_pack' && basePrice.packPrices) {
        const packPrices = basePrice.packPrices;
        const symbol = basePrice.currency === 'INR' ? '₹' :
                       basePrice.currency === 'USD' ? '$' :
                       currencySymbols[basePrice.currency] || basePrice.currency;

        const priceList = Object.entries(packPrices)
          .map(([size, price]) => {
            let displayPrice = price;
            if (selectedCurrency !== basePrice.currency) {
              displayPrice = convertCurrency(price, basePrice.currency, selectedCurrency);
            }
            const finalSymbol = selectedCurrency !== basePrice.currency
              ? (currencySymbols[selectedCurrency] || (selectedCurrency === 'INR' ? '₹' : selectedCurrency === 'USD' ? '$' : selectedCurrency))
              : symbol;
            return `${size}kg – ${finalSymbol}${displayPrice.toFixed(2)}`;
          })
          .join('\n');

        riceSpecItems.push({
          label: "Pack Prices",
          value: priceList,
          isLongText: true
        });
      } else if (basePrice.type === 'rice_pack' && basePrice.min !== undefined && basePrice.max !== undefined) {
        const symbol = basePrice.currency === 'INR' ? '₹' :
                       basePrice.currency === 'USD' ? '$' :
                       currencySymbols[basePrice.currency] || basePrice.currency;
        let minVal = basePrice.min;
        let maxVal = basePrice.max;
        if (selectedCurrency !== basePrice.currency) {
          minVal = convertCurrency(basePrice.min, basePrice.currency, selectedCurrency);
          maxVal = convertCurrency(basePrice.max, basePrice.currency, selectedCurrency);
        }
        const finalSymbol = selectedCurrency !== basePrice.currency
          ? (currencySymbols[selectedCurrency] || (selectedCurrency === 'INR' ? '₹' : selectedCurrency === 'USD' ? '$' : selectedCurrency))
          : symbol;
        riceSpecItems.push({
          label: "Price Range",
          value: `${finalSymbol}${minVal.toFixed(2)} - ${finalSymbol}${maxVal.toFixed(2)} / pack`
        });
      }

      if (riceSpecItems.length > 0) {
        specs.push({
          category: "Product Specifications",
          icon: <Layers size={18} className="me-2" style={{ color: '#10b981' }} />,
          items: riceSpecItems
        });
      }
    }

    // ==================== NON‑RICE PRODUCTS: Enhanced Packaging Details ====================
    if (!isRice) {
      const packagingItems = [];

      // 1. Show the detailed packaging string (e.g., "27 × 200 ml / carton")
      if (packaging && packaging.displayText) {
        packagingItems.push({
          label: "Packaging / Quantity",
          value: packaging.displayText
        });
      }

      // 2. Show the original pack type (if available)
      let packTypeValue = null;
      if (product.meta?.pack_type) {
        packTypeValue = product.meta.pack_type;
      } else if (product.pack_type) {
        if (typeof product.pack_type === 'string') {
          packTypeValue = product.pack_type;
        } else if (Array.isArray(product.pack_type)) {
          packTypeValue = product.pack_type.join(', ');
        } else if (typeof product.pack_type === 'object') {
          packTypeValue = Object.values(product.pack_type).join(', ');
        } else {
          packTypeValue = String(product.pack_type);
        }
      }

      if (packTypeValue) {
        packagingItems.push({
          label: "Pack Type",
          value: packTypeValue
        });
      }

      // 3. Optionally show separate lines for units per carton and unit weight
      if (product.packaging) {
        if (product.packaging.units_per_carton) {
          packagingItems.push({
            label: "Units per Carton",
            value: `${product.packaging.units_per_carton} units`
          });
        }
        if (product.packaging.unit_weight) {
          const unit = product.packaging.unit || 'ml';
          packagingItems.push({
            label: "Unit Weight",
            value: `${product.packaging.unit_weight} ${unit}`
          });
        } else if (product.packaging.unit_weight_g) {
          packagingItems.push({
            label: "Unit Weight",
            value: `${product.packaging.unit_weight_g} g`
          });
        } else if (product.packaging.unit_weight_ml) {
          packagingItems.push({
            label: "Unit Weight",
            value: `${product.packaging.unit_weight_ml} ml`
          });
        }
      }

      if (packagingItems.length > 0) {
        specs.push({
          category: "Packaging Details",
          icon: <Box size={18} className="me-2" style={{ color: '#10b981' }} />,
          items: packagingItems
        });
      }
    }

    // Shelf Life & Storage
    specs.push({
      category: "Shelf Life & Storage",
      icon: <Calendar size={18} className="me-2" style={{ color: '#10b981' }} />,
      items: [
        { label: "Shelf Life", value: product.meta?.shelf_life || product.shelf_life || "Not specified" }
      ]
    });

    // Pricing Information
    const priceDisplay = getProductPriceDisplay(product);
    const pricingItems = [
      { label: "Current Price", value: priceDisplay },
      { label: "Price Currency", value: selectedCurrency },
    ];

    if (basePrice.type === 'EX-MILL') {
      pricingItems.push({ label: "Price Type", value: "EX-MILL (Ex Mill)" });
    } else if (basePrice.type === 'FOB') {
      pricingItems.push({ label: "Price Type", value: "FOB (Free On Board)" });
    } else if (basePrice.type === 'rice_pack') {
      pricingItems.push({ label: "Price Type", value: "Rice Pack Price (per pack)" });
      if (basePrice.min !== undefined && basePrice.max !== undefined) {
        pricingItems.push({ label: "Price Range", value: `${basePrice.min} - ${basePrice.max} ${basePrice.currency}/pack (5kg-30kg)` });
      }
    } else if (basePrice.type === 'rice') {
      pricingItems.push({ label: "Price Type", value: "Rice Price (per kg)" });
      if (basePrice.min !== undefined && basePrice.max !== undefined) {
        pricingItems.push({ label: "Price Range", value: `${basePrice.min} - ${basePrice.max} ${basePrice.currency}/kg` });
      }
    } else {
      pricingItems.push({ label: "Price Type", value: basePrice.type || "Standard" });
      pricingItems.push({ label: "Price Unit", value: basePrice.displayUnit || "unit" });
    }

    specs.push({
      category: "Pricing Information",
      icon: <Tag size={18} className="me-2" style={{ color: '#10b981' }} />,
      items: pricingItems
    });

    // Description
    if (product.meta?.description || product.product_description) {
      specs.push({
        category: "Description",
        icon: <Info size={18} className="me-2" style={{ color: '#10b981' }} />,
        items: [
          { label: "Description", value: product.meta?.description || product.product_description, isLongText: true }
        ]
      });
    }

    return specs;
  };

  const getPerUnitPrice = (product) => {
    const basePrice = getBasePrice(product);
    const packaging = getDetailedPackagingDisplay(product);

    if (basePrice.type !== 'rice' && (basePrice.unit === 'carton' || basePrice.unit === 'per_carton') && packaging && packaging.unitsPerCarton) {
      const perUnitBase = basePrice.value / packaging.unitsPerCarton;
      const perUnitConverted = convertCurrency(perUnitBase, basePrice.currency, selectedCurrency);
      const symbol = currencySymbols[selectedCurrency] ||
        (selectedCurrency === 'INR' ? '₹' :
          selectedCurrency === 'USD' ? '$' : selectedCurrency);
      return {
        perUnit: `${symbol}${perUnitConverted.toFixed(2)} per unit`,
        pricePerUnit: perUnitConverted
      };
    }
    return null;
  };

  const handleCompanySelect = (company) => {
    setSelectedCompany(company);
    setSelectedBrand(null);
  };

  const handleBrandSelect = (brand) => {
    setSelectedBrand(brand);
  };

  const handleBackToBrands = () => {
    setSelectedBrand(null);
    setProducts([]);
    setFilteredProducts([]);
    setViewMode('brands');
    setProductSearchQuery('');
  };

  const handleBackToCompanies = () => {
    setSelectedCompany(null);
    setSelectedBrand(null);
    setBrands([]);
    setProducts([]);
    setFilteredProducts([]);
    setViewMode('companies');
    setProductSearchQuery('');
  };

  const handleBackToAllProducts = () => {
    navigate('/all-products');
  };

  const handleOrderNow = (product) => {
    const basePrice = getBasePrice(product);
    const priceDisplay = getProductPriceDisplay(product);

    setSelectedProduct({
      ...product,
      quantity: 1,
      category: categoryData?.name || categoryId,
      company: product.companyName,
      brand: product.brandName || 'General',
      selectedCurrency: selectedCurrency,
      priceDisplay: priceDisplay,
      basePrice: basePrice,
      currencyRates: currencyRates,
      currencySymbols: currencySymbols
    });
    setIsSingleProductModalOpen(true);
  };

  const handleAddToCartClick = (product) => {
    console.log("📦 Opening add to cart config for product:", product);

    const isRice = isRiceProduct(product);
    const basePrice = getBasePrice(product);
    const priceDisplay = getProductPriceDisplay(product);

    const brandId = product.brandId || null;
    const brandName = product.brandName || 'General';

    const productForConfig = {
      id: product.id,
      name: product.meta?.name || product.name,
      companyName: product.companyName,
      companyId: product.companyId,
      brandName: brandName,
      brandId: brandId,
      category: categoryData?.name || categoryId,
      categoryId: categoryId,
      image: product.image,
      price: product.price,
      pricing: product.pricing,
      price_usd_per_carton: product.price_usd_per_carton,
      fob_price_usd: product.fob_price_usd,
      "Ex-Mill_usd": product["Ex-Mill_usd"],
      packaging: product.packaging,
      pack_type: product.pack_type,
      grades: product.grades,
      origin: product.meta?.origin || product.origin,
      shelf_life: product.meta?.shelf_life || product.shelf_life,
      meta: product.meta,
      configurations: product.configurations,
      product_description: product.meta?.description,
      isRice: isRice,
      quantity_options: product.quantity_options,
      quantity: product.quantity,
      quantity_unit: product.quantity_unit,
      selectedCurrency: selectedCurrency,
      priceDisplay: priceDisplay,
      basePrice: basePrice,
      currencyRates: currencyRates,
      currencySymbols: currencySymbols
    };

    console.log("✅ Product prepared for config modal:", productForConfig);
    setSelectedProductForConfig(productForConfig);
    setIsAddToCartConfigModalOpen(true);
  };

  const handleAddToCartWithConfig = (productWithConfig) => {
    console.log("📦 ProductPage: Adding product to cart with configuration:", productWithConfig);

    const basePrice = getBasePrice(productWithConfig);
    const priceDisplay = getProductPriceDisplay(productWithConfig);

    const packingPricePerKg = parseFloat(productWithConfig.packingPricePerKg) || 0;
    const totalPackingCost = parseFloat(productWithConfig.totalPackingCost) || 0;

    console.log("💰 ProductPage: Parsed packing cost:", { packingPricePerKg, totalPackingCost });

    const enhancedProduct = {
      id: productWithConfig.id,
      productId: productWithConfig.id,
      name: productWithConfig.name,
      brandId: productWithConfig.brandId || null,
      brandName: productWithConfig.brandName || 'General',
      companyId: productWithConfig.companyId || null,
      companyName: productWithConfig.companyName || '',

      price: {
        value: basePrice.value || basePrice.min || 0,
        display: priceDisplay,
        currency: selectedCurrency,
        type: basePrice.type,
        unit: basePrice.displayUnit,
        baseCurrency: basePrice.currency,
        baseValue: basePrice.value || basePrice.min || 0
      },

      price_usd_per_carton: productWithConfig.price_usd_per_carton,
      fob_price_usd: productWithConfig.fob_price_usd,
      "Ex-Mill_usd": productWithConfig["Ex-Mill_usd"],

      image: productWithConfig.image,
      category: productWithConfig.category || categoryData?.name || categoryId,
      categoryId: categoryId,
      quantity: 1,

      selectedGrade: productWithConfig.selectedGrade,
      selectedGradePrice: productWithConfig.selectedGradePrice,
      selectedGradeDisplay: productWithConfig.selectedGradeDisplay || productWithConfig.selectedGrade,
      selectedPacking: productWithConfig.selectedPacking,
      selectedQuantity: productWithConfig.selectedQuantity,
      quantityUnit: productWithConfig.quantityUnit || getQuantityUnitFromFirebase(productWithConfig) || 'kg',
      isRice: productWithConfig.isRice || false,

      packingPricePerKg: packingPricePerKg,
      totalPackingCost: totalPackingCost,

      selectedConfig: {
        grade: productWithConfig.selectedGrade,
        gradePrice: productWithConfig.selectedGradePrice,
        gradeDisplay: productWithConfig.selectedGradeDisplay || productWithConfig.selectedGrade,
        packing: productWithConfig.selectedPacking,
        quantity: productWithConfig.selectedQuantity,
        quantityUnit: productWithConfig.quantityUnit || getQuantityUnitFromFirebase(productWithConfig) || 'kg',
        isRice: productWithConfig.isRice || false,
        packingPricePerKg: packingPricePerKg,
        totalPackingCost: totalPackingCost
      },

      origin: productWithConfig.origin || '',
      packaging: productWithConfig.packaging || null,
      pack_type: productWithConfig.pack_type || '',
      grades: productWithConfig.grades || [],
      shelf_life: productWithConfig.shelf_life || '',
      meta: productWithConfig.meta || {},

      cartCurrency: selectedCurrency,
      cartCurrencySymbol: currencySymbols[selectedCurrency] ||
        (selectedCurrency === 'INR' ? '₹' :
          selectedCurrency === 'USD' ? '$' : selectedCurrency),
      cartBaseCurrency: basePrice.currency,
      cartBaseValue: basePrice.value || basePrice.min || 0,
      cartUnit: basePrice.displayUnit,
      cartPriceType: basePrice.type
    };

    console.log("✅ Enhanced product ready for cart:", {
      name: enhancedProduct.name,
      packingCost: enhancedProduct.totalPackingCost,
      packingPricePerKg: enhancedProduct.packingPricePerKg
    });

    addToCart(enhancedProduct);

    setAddedProduct(enhancedProduct);
    setShowCartSuccess(true);

    setTimeout(() => {
      setShowCartSuccess(false);
      setAddedProduct(null);
    }, 3000);
  };

  const handleCartCheckout = () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty! Add some products first.');
      return;
    }

    const cartProductsForCheckout = cartItems.map(item => ({
      ...item,
      name: item.name || `Product ${item.id}`,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
      companyName: item.companyName || 'Unknown Company',
      brandName: item.brandName || 'General',
      unit: item.unit || 'unit',
      category: item.category || categoryData?.name || categoryId,
      selectedConfig: item.selectedConfig || null,
      selectedGrade: item.selectedGrade || null,
      selectedGradePrice: item.selectedGradePrice || null,
      selectedGradeDisplay: item.selectedGradeDisplay || null,
      selectedPacking: item.selectedPacking || null,
      selectedQuantity: item.selectedQuantity || 1,
      quantityUnit: item.quantityUnit || getQuantityUnitFromFirebase(item) || 'unit',
      isRice: item.isRice || false,
      cartItemId: item.cartItemId,
      packingPricePerKg: item.packingPricePerKg,
      totalPackingCost: item.totalPackingCost,
      cartCurrency: item.cartCurrency,
      cartCurrencySymbol: item.cartCurrencySymbol,
      cartBaseCurrency: item.cartBaseCurrency,
      cartBaseValue: item.cartBaseValue,
      cartUnit: item.cartUnit,
      cartPriceType: item.cartPriceType
    }));

    setCheckoutProductsLocal(cartProductsForCheckout);
    if (setCheckoutProducts) {
      setCheckoutProducts(cartProductsForCheckout);
    }
    setIsCheckoutModalOpen(true);
  };

  const handleViewDetails = (product) => {
    setDetailedProduct(product);
    setShowDetailsModal(true);
  };

  const isProductInCart = (productId) => {
    return cartItems.some(item => item.id === productId);
  };

  const getCartQuantity = (productId) => {
    const item = cartItems.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };

  const getCartTotalItems = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  const handleOrderSubmitted = () => {
    if (onNewOrderSubmitted) {
      onNewOrderSubmitted();
    }
  };

  // CompanyLogo component with better error handling
  const CompanyLogo = ({ company }) => {
    const [imgError, setImgError] = useState(false);
    const logoUrl = getCompanyLogoUrl(company);
    
    if (!logoUrl || imgError) {
      return (
        <div className="company-logo-placeholder" style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto',
          border: '2px solid rgba(64, 150, 226, 0.3)'
        }}>
          <Building2 size={36} style={{ color: '#4096e2' }} />
        </div>
      );
    }
    
    return (
      <div style={{
        width: '80px',
        height: '80px',
        margin: '0 auto',
        borderRadius: '50%',
        overflow: 'hidden',
        background: '#1e293b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '2px solid rgba(64, 150, 226, 0.3)'
      }}>
        <img
          src={logoUrl}
          alt={company.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
          onError={() => setImgError(true)}
        />
      </div>
    );
  };

  if (isLoading || isLoadingCurrency) {
    return (
      <div className="product-page" style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        color: 'white',
        padding: '20px'
      }}>
        <div className="container py-5">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading products and currency data...</p>
            {debugInfo && (
              <div className="mt-4 p-3 bg-dark rounded small">
                <p>Debug Info:</p>
                <pre className="text-start text-light" style={{ fontSize: '11px' }}>
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!categoryData) {
    return (
      <div className="product-page" style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        color: 'white',
        padding: '20px'
      }}>
        <div className="container py-5">
          <div className="text-center">
            <p className="h5 text-muted">Category not found: {categoryId}</p>
            <button className="btn btn-primary mt-3" onClick={handleBackToAllProducts}>
              Back to All Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderCompanies = () => (
    <div className="companies-grid mt-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="h5" style={{ color: '#ffffff' }}>Companies</h3>
        <div className="badge bg-primary bg-opacity-25 px-3 py-2 rounded-pill" style={{ color: '#ffffff' }}>
          <strong style={{ color: '#ffffff' }}>{companies.length}</strong> company{companies.length !== 1 ? 'ies' : ''}
        </div>
      </div>

      {companies.length === 0 ? (
        <div className="no-products-message text-center py-5">
          <p className="h5" style={{ color: '#ffffff' }}>No companies available</p>
          <p className="text-sm mt-2" style={{ color: '#cccccc' }}>
            No companies offer products in this category yet.
          </p>
          <button
            className="btn btn-outline-accent btn-sm mt-3"
            onClick={handleBackToAllProducts}
          >
            Back to All Products
          </button>
        </div>
      ) : (
        <div className="row g-4">
          {companies.map((company, index) => (
            <div key={company.id} className="col-6 col-md-4 col-lg-3">
              <div
                className="service-card glass p-3 text-center h-100"
                onClick={() => handleCompanySelect(company)}
                style={{ cursor: 'pointer', transition: 'transform 0.2s ease', backgroundColor: 'rgba(31, 41, 55, 0.6)', borderRadius: '16px' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div className="company-logo-container mb-3">
                  <CompanyLogo company={company} />
                </div>
                <h4 className="h6 fw-semibold mb-1" style={{ color: '#ffffff' }}>{company.name}</h4>
                {company.hasBrands && (
                  <div className="badge bg-success bg-opacity-25 px-2 py-1 rounded-pill mt-2" style={{ color: '#ffffff' }}>
                    <strong style={{ color: '#ffffff' }}>{company.brandCount}</strong> brand{company.brandCount !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderBrands = () => (
    <div className="brands-grid mt-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="h5 mb-1" style={{ color: '#ffffff' }}>{selectedCompany.name}</h3>
          <p className="text-sm" style={{ color: '#cccccc' }}>Select a brand to view products</p>
        </div>
        <div className="badge bg-primary bg-opacity-25 px-3 py-2 rounded-pill" style={{ color: '#ffffff' }}>
          <strong style={{ color: '#ffffff' }}>{brands.length}</strong> brand{brands.length !== 1 ? 's' : ''} available
        </div>
      </div>

      {brands.length === 0 ? (
        <div className="no-products-message text-center py-5">
          <p className="h5" style={{ color: '#ffffff' }}>No brands available</p>
          <p className="text-sm mt-2" style={{ color: '#cccccc' }}>
            This company doesn't have any brands in this category.
          </p>
          <button
            className="btn btn-outline-accent btn-sm mt-3"
            onClick={handleBackToCompanies}
          >
            Back to Companies
          </button>
        </div>
      ) : (
        <div className="row g-4">
          {brands.map(brand => {
            const brandLogo = getBrandImageUrl(brand);
            return (
              <div key={brand.id} className="col-6 col-md-4 col-lg-3">
                <div
                  className="service-card glass p-4 text-center h-100"
                  onClick={() => handleBrandSelect(brand)}
                  style={{ cursor: 'pointer', transition: 'transform 0.2s ease', backgroundColor: 'rgba(31, 41, 55, 0.6)', borderRadius: '16px' }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div className="brand-icon mb-3">
                    {brandLogo ? (
                      <div className="brand-logo-container">
                        <img
                          src={brandLogo}
                          alt={brand.name}
                          className="brand-logo rounded-circle"
                          style={{
                            width: '80px',
                            height: '80px',
                            objectFit: 'cover',
                            border: '2px solid rgba(64, 150, 226, 0.3)',
                            borderRadius: '50%'
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="brand-icon-placeholder">
                        <Building2 size={36} style={{ color: '#4096e2' }} />
                      </div>
                    )}
                  </div>
                  <h4 className="h6 fw-semibold mb-1" style={{ color: '#ffffff' }}>{brand.name}</h4>
                  <p className="text-xs mb-0" style={{ color: '#ffffff' }}>
                    <strong style={{ color: '#ffffff' }}>{brand.productCount}</strong> product{brand.productCount !== 1 ? 's' : ''}
                  </p>
                  <div className="mt-3">
                    <ChevronRight size={16} style={{ color: '#4096e2' }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderProducts = () => {
    const hasSearchQuery = globalSearchQuery.trim() !== '' || productSearchQuery.trim() !== '';
    const searchResultsCount = filteredProducts.length;
    const cartTotalItemsCount = getCartTotalItems();

    return (
      <div className="products-full-screen mt-3">
        <div className="products-header" style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'stretch' : 'center',
          marginBottom: '24px',
          gap: '16px'
        }}>
          <div style={{ flex: '1 1 auto' }}>
            {selectedBrand ? (
              <h3 className="h4 mb-1" style={{ color: '#ffffff' }}>{selectedBrand.name} Products</h3>
            ) : selectedCompany ? (
              <h3 className="h4 mb-1" style={{ color: '#ffffff' }}>{selectedCompany.name} Products</h3>
            ) : (
              <h3 className="h4 mb-1" style={{ color: '#ffffff' }}>{categoryData.name} Products</h3>
            )}
            {hasSearchQuery && (
              <p className="text-sm mb-0" style={{ color: '#cccccc' }}>
                Showing <strong style={{ color: '#ffffff' }}>{searchResultsCount}</strong> product{searchResultsCount !== 1 ? 's' : ''}
              </p>
            )}
            {!hasSearchQuery && (
              <p className="text-sm mb-0" style={{ color: '#cccccc' }}>
                <strong style={{ color: '#ffffff' }}>{filteredProducts.length}</strong> product{filteredProducts.length !== 1 ? 's' : ''} available
              </p>
            )}
          </div>

          <div className="products-actions" style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
            justifyContent: isMobile ? 'flex-start' : 'flex-end'
          }}>
            {cartTotalItemsCount > 0 && (
              <button
                className="btn btn-success d-flex align-items-center gap-2"
                onClick={handleCartCheckout}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  border: 'none',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  whiteSpace: 'nowrap',
                  flex: isMobile ? '1 1 auto' : '0 0 auto'
                }}
              >
                <ShoppingBag size={18} />
                <span>Checkout Cart <strong>({cartTotalItemsCount})</strong></span>
              </button>
            )}

            <div className="currency-dropdown-container" style={{
              flex: isMobile ? '1 1 auto' : '0 0 auto'
            }}>
              <select
                className="form-select currency-dropdown"
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                style={{
                  background: 'rgba(31, 41, 55, 0.8)',
                  border: '1px solid rgba(64, 150, 226, 0.3)',
                  color: '#e6e6e6',
                  width: isMobile ? '100%' : '200px',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '0.95rem',
                  cursor: 'pointer'
                }}
              >
                {availableCurrencies.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.symbol} {currency.code}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {showCartSuccess && addedProduct && (
          <div className="cart-success-message" style={{
            position: 'fixed',
            top: '100px',
            right: '20px',
            background: '#10b981',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            animation: 'slideInRight 0.3s ease'
          }}>
            <Check size={20} />
            <div>
              <strong>{addedProduct.name}</strong> added to cart!
              {addedProduct.totalPackingCost > 0 && (
                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                  Packing Cost: {addedProduct.cartCurrencySymbol}{addedProduct.totalPackingCost}
                </div>
              )}
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                {getCartQuantity(addedProduct.id)} item(s) in cart
              </div>
            </div>
          </div>
        )}

        {filteredProducts.length === 0 ? (
          <div className="no-products-message text-center py-5">
            {hasSearchQuery ? (
              <>
                <p className="h5" style={{ color: '#ffffff' }}>No products found</p>
                <p className="text-sm mt-2" style={{ color: '#cccccc' }}>
                  No products match your search.
                </p>
                <button
                  className="btn btn-outline-accent btn-sm mt-3"
                  onClick={() => {
                    if (productSearchQuery) setProductSearchQuery('');
                    if (onGlobalSearchClear) onGlobalSearchClear();
                  }}
                >
                  Clear Search
                </button>
              </>
            ) : (
              <>
                <p className="h5" style={{ color: '#ffffff' }}>No products available</p>
                <p className="text-sm mt-2" style={{ color: '#cccccc' }}>
                  {selectedBrand
                    ? `${selectedBrand.name} doesn't have any products listed yet.`
                    : `${selectedCompany.name} doesn't have any products listed yet.`}
                </p>
                <button
                  className="btn btn-outline-accent btn-sm mt-3"
                  onClick={selectedBrand ? handleBackToBrands : handleBackToCompanies}
                >
                  Back to {selectedBrand ? 'Brands' : 'Companies'}
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="row g-4">
            {filteredProducts.map(product => {
              const perUnitPriceData = getPerUnitPrice(product);
              const productImage = product.image;
              const inCart = isProductInCart(product.id);
              const cartQuantity = getCartQuantity(product.id);
              const isRice = isRiceProduct(product);
              const priceDisplay = getProductPriceDisplay(product);
              const packagingDisplay = getDetailedPackagingDisplay(product);
              const perUnitPrice = perUnitPriceData?.perUnit;
              const productName = product.meta?.name || product.name;

              return (
                <div key={product.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                  <div className="product-card glass p-3 h-100 d-flex flex-column" style={{ backgroundColor: 'rgba(31, 41, 55, 0.6)', borderRadius: '16px', transition: 'transform 0.2s ease' }}>
                    <div className="product-image-container mb-3 flex-shrink-0 position-relative">
                      {productImage ? (
                        <img
                          src={productImage}
                          alt={productName}
                          className="product-image w-100"
                          style={{
                            height: '150px',
                            objectFit: 'contain',
                            borderRadius: '8px'
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div style={{
                          height: '150px',
                          background: 'rgba(255,255,255,0.05)',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Package size={48} style={{ color: '#4096e2', opacity: 0.5 }} />
                        </div>
                      )}
                      {inCart && (
                        <div style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          background: '#10b981',
                          color: 'white',
                          borderRadius: '50%',
                          width: '30px',
                          height: '30px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.8rem',
                          fontWeight: 'bold',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                        }}>
                          {cartQuantity}
                        </div>
                      )}
                    </div>

                    <div className="product-info flex-grow-1 d-flex flex-column">
                      <h4 className="h6 fw-semibold mb-2 line-clamp-2" style={{ color: '#ffffff' }}>
                        {productName}
                      </h4>

                      {product.brandName && product.brandName !== 'General' && (
                        <p className="text-xs mb-1" style={{ color: '#10b981' }}>
                          Brand: <strong style={{ color: '#10b981' }}>{product.brandName}</strong>
                        </p>
                      )}

                      <p className="product-price fw-bold mb-2" style={{ color: '#4096e2', fontSize: '1.1rem' }}>
                        {priceDisplay}
                      </p>

                      {/* For Non-Rice products: Show packaging details in card */}
                      {!isRice && packagingDisplay && (
                        <div className="product-details mb-2 small">
                          <div className="d-flex align-items-center mb-1" style={{ color: '#ffffff' }}>
                            <Package size={12} className="me-1" style={{ color: '#4096e2' }} />
                            <span>
                              Packing: <strong style={{ color: '#ffffff' }}>{packagingDisplay.displayText || packagingDisplay.main}</strong>
                            </span>
                          </div>

                          {perUnitPrice && (
                            <div className="d-flex align-items-center mb-1" style={{ color: '#10b981' }}>
                              <Droplet size={12} className="me-1" />
                              <span>{perUnitPrice}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {(product.meta?.origin || product.origin) && (
                        <div className="d-flex align-items-center mb-1" style={{ color: '#ffffff' }}>
                          <MapPin size={12} className="me-1" style={{ color: '#4096e2' }} />
                          <span>Origin: <strong style={{ color: '#ffffff' }}>{product.meta?.origin || product.origin}</strong></span>
                        </div>
                      )}

                      {(product.meta?.shelf_life || product.shelf_life) && (
                        <div className="d-flex align-items-center mb-1" style={{ color: '#ffffff' }}>
                          <Clock size={12} className="me-1" style={{ color: '#4096e2' }} />
                          <span>Shelf Life: <strong style={{ color: '#ffffff' }}>{product.meta?.shelf_life || product.shelf_life}</strong></span>
                        </div>
                      )}

                      <div className="product-actions d-flex flex-column gap-2 mt-auto">
                        <button
                          className="btn btn-outline-primary btn-sm w-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(product);
                          }}
                          title="View Details"
                          style={{
                            color: '#ffffff',
                            borderColor: '#4096e2',
                            backgroundColor: 'transparent',
                            padding: '8px 12px',
                            fontWeight: '500',
                            width: '100%'
                          }}
                        >
                          View Details
                        </button>

                        <div className="d-flex gap-2 w-100">
                          <button
                            className="btn btn-info btn-sm flex-grow-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCartClick(product);
                            }}
                            style={{
                              background: inCart ? '#059669' : '#0dcaf0',
                              borderColor: inCart ? '#059669' : '#0dcaf0',
                              color: 'white',
                              padding: '8px 12px',
                              fontWeight: '500'
                            }}
                            title={inCart ? `${cartQuantity} item(s) in cart` : 'Add to Cart'}
                          >
                            <ShoppingCart size={14} className="me-1" />
                            {inCart ? `In Cart (${cartQuantity})` : 'Add to Cart'}
                          </button>

                          <button
                            className="btn btn-success btn-sm flex-grow-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOrderNow(product);
                            }}
                            title="Order Now"
                            style={{
                              background: '#10b981',
                              borderColor: '#10b981',
                              color: 'white',
                              padding: '8px 12px',
                              fontWeight: '500'
                            }}
                          >
                            Order Now
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Responsive header styling for back button integration
  const headerFlexDirection = isMobile ? 'column' : 'row';
  const headerAlignItems = isMobile ? 'flex-start' : 'center';
  const headerTextAlign = isMobile ? 'left' : 'center';

  const backButtonStyle = {
    background: '#0f3460',
    border: '1px solid #4096e2ff',
    borderRadius: '40px',
    padding: '8px 20px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    color: '#e6e6e6',
    fontSize: '0.9rem',
    fontWeight: '500',
    whiteSpace: 'nowrap'
  };

  return (
    <div className="product-page" style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      color: '#e6e6e6',
      position: 'relative'
    }}>
      <div className="product-header" style={{
        marginTop: isMobile ? '90px' : '80px',
        padding: '0 20px'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: headerFlexDirection,
          alignItems: headerAlignItems,
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          <button
            className="back-button"
            onClick={
              viewMode === 'products'
                ? (selectedBrand ? handleBackToBrands : handleBackToCompanies)
                : viewMode === 'brands'
                  ? handleBackToCompanies
                  : handleBackToAllProducts
            }
            style={backButtonStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.background = '#1a4a7a';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.background = '#0f3460';
            }}
          >
            <ArrowLeft size={18} /> Back
          </button>
          <div style={{ flex: 1, textAlign: headerTextAlign }}>
            <h1 className="h2 fw-bold mb-2" style={{ color: '#4096e2' }}>{categoryData.name || categoryId}</h1>
            {categoryData.description && (
              <p className="lead mb-0" style={{ color: '#4096e2ff' }}>{categoryData.description}</p>
            )}
          </div>
          {!isMobile && <div style={{ width: '80px' }}></div>} {/* Spacer for balance on desktop */}
        </div>
      </div>

      <div className="container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
        {viewMode === 'companies' && renderCompanies()}
        {viewMode === 'brands' && renderBrands()}
        {viewMode === 'products' && renderProducts()}
      </div>

      <SingleProductBuyModal
        isOpen={isSingleProductModalOpen}
        onClose={() => {
          setIsSingleProductModalOpen(false);
          setSelectedProduct(null);
          if (onNewOrderSubmitted) {
            onNewOrderSubmitted();
          }
        }}
        product={selectedProduct}
        profile={profile || null}
        onOrderSubmitted={handleOrderSubmitted}
        currencyRates={currencyRates}
        currencySymbols={currencySymbols}
        selectedCurrency={selectedCurrency}
      />

      <AddToCartConfigModal
        isOpen={isAddToCartConfigModalOpen}
        onClose={() => {
          setIsAddToCartConfigModalOpen(false);
          setSelectedProductForConfig(null);
        }}
        product={selectedProductForConfig}
        onAddToCart={handleAddToCartWithConfig}
        getRiceGrades={(product) => product?.grades || []}
        getPackingOptions={getPackingOptionsFromFirebase}
        getQuantityOptions={getQuantityOptionsFromFirebase}
        getPackingCost={getPackingCostFromFirebase}
        getQuantityUnit={getQuantityUnitFromFirebase}
        isRiceProduct={isRiceProduct}
        currencyRates={currencyRates}
        currencySymbols={currencySymbols}
        selectedCurrency={selectedCurrency}
      />

      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => {
          setIsCheckoutModalOpen(false);
          setCheckoutProductsLocal([]);
        }}
        products={checkoutProducts}
        profile={profile || null}
        onOrderSubmitted={handleOrderSubmitted}
        currencyRates={currencyRates}
        currencySymbols={currencySymbols}
        selectedCurrency={selectedCurrency}
      />

      {showDetailsModal && detailedProduct && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)} style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1050,
          backdropFilter: 'blur(8px)',
          overflow: 'auto',
          padding: '20px'
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{
            background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
            color: '#1e293b',
            borderRadius: '28px',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            maxWidth: '1200px',
            width: '95%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 30px 60px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(16, 185, 129, 0.1) inset',
            animation: 'modalFadeIn 0.3s ease'
          }}>
            <div className="modal-header" style={{
              padding: '28px 32px',
              borderBottom: '1px solid rgba(16, 185, 129, 0.15)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(90deg, rgba(16, 185, 129, 0.05) 0%, transparent 100%)',
              position: 'sticky',
              top: 0,
              zIndex: 10,
              backgroundColor: 'white'
            }}>
              <div>
                <h5 className="modal-title" style={{
                  color: '#0f172a',
                  fontSize: '2rem',
                  fontWeight: '700',
                  marginBottom: '6px',
                  letterSpacing: '-0.02em'
                }}>
                  {detailedProduct.meta?.name || detailedProduct.name}
                </h5>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <Building2 size={18} style={{ color: '#10b981' }} />
                  <span style={{ color: '#475569', fontSize: '1rem', fontWeight: '500' }}>
                    {detailedProduct.brandName && detailedProduct.brandName !== 'General'
                      ? `${detailedProduct.brandName} • ${detailedProduct.companyName}`
                      : detailedProduct.companyName}
                  </span>
                </div>
              </div>
              <button className="close-btn" onClick={() => setShowDetailsModal(false)} style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                color: '#0f172a',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '50%',
                width: '42px',
                height: '42px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ padding: '32px' }}>
              <div className="row g-5">
                <div className="col-md-5">
                  <div style={{
                    background: '#ffffff',
                    borderRadius: '24px',
                    padding: '24px',
                    border: '1px solid rgba(16, 185, 129, 0.15)',
                    boxShadow: '0 15px 35px rgba(0, 0, 0, 0.05)',
                    position: 'sticky',
                    top: '20px'
                  }}>
                    {detailedProduct.image ? (
                      <img
                        src={detailedProduct.image}
                        alt={detailedProduct.meta?.name || detailedProduct.name}
                        className="img-fluid rounded"
                        style={{
                          maxHeight: '300px',
                          objectFit: 'contain',
                          width: '100%',
                          filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.1))'
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div style={{
                        height: '300px',
                        background: '#f1f5f9',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Package size={64} style={{ color: '#10b981', opacity: 0.5 }} />
                      </div>
                    )}

                    <div style={{
                      display: 'flex',
                      gap: '12px',
                      marginTop: '24px',
                      justifyContent: 'center',
                      flexWrap: 'wrap'
                    }}>
                      {(detailedProduct.meta?.origin || detailedProduct.origin) && (
                        <div style={{
                          background: 'rgba(16, 185, 129, 0.08)',
                          padding: '8px 16px',
                          borderRadius: '40px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          border: '1px solid rgba(16, 185, 129, 0.2)'
                        }}>
                          <MapPin size={16} style={{ color: '#10b981' }} />
                          <span style={{ color: '#1e293b', fontSize: '0.95rem', fontWeight: '500' }}>{detailedProduct.meta?.origin || detailedProduct.origin}</span>
                        </div>
                      )}
                      {(detailedProduct.meta?.shelf_life || detailedProduct.shelf_life) && (
                        <div style={{
                          background: 'rgba(16, 185, 129, 0.08)',
                          padding: '8px 16px',
                          borderRadius: '40px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          border: '1px solid rgba(16, 185, 129, 0.2)'
                        }}>
                          <Clock size={16} style={{ color: '#10b981' }} />
                          <span style={{ color: '#1e293b', fontSize: '0.95rem', fontWeight: '500' }}>{detailedProduct.meta?.shelf_life || detailedProduct.shelf_life}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="col-md-7">
                  <div style={{
                    background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                    padding: '24px 28px',
                    borderRadius: '20px',
                    marginBottom: '28px',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    boxShadow: '0 8px 20px rgba(16, 185, 129, 0.1)'
                  }}>
                    <div style={{ fontSize: '0.95rem', color: '#047857', marginBottom: '8px', fontWeight: '500', letterSpacing: '0.5px' }}>
                      PRICE ({selectedCurrency})
                    </div>
                    <div style={{
                      color: '#0f172a',
                      fontSize: '2.4rem',
                      fontWeight: '700',
                      lineHeight: '1.2'
                    }}>
                      {getProductPrice(detailedProduct)}
                    </div>
                  </div>

                  <div>
                    {(() => {
                      const allSpecs = getComprehensiveProductSpecs(detailedProduct);
                      return allSpecs.map((section, sectionIdx) => (
                        <div key={sectionIdx} style={{ marginBottom: '28px' }}>
                          <h6 style={{
                            color: '#10b981',
                            fontSize: '1.2rem',
                            marginBottom: '16px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            letterSpacing: '-0.3px',
                            borderLeft: '4px solid #10b981',
                            paddingLeft: '12px'
                          }}>
                            {section.icon}
                            {section.category}
                          </h6>
                          
                          <div className="specs-grid" style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px'
                          }}>
                            {section.items.map((item, itemIdx) => (
                              <div key={itemIdx} className="spec-row" style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: item.isLongText ? 'flex-start' : 'center',
                                padding: '14px 18px',
                                background: '#ffffff',
                                borderRadius: '14px',
                                border: '1px solid rgba(16, 185, 129, 0.12)',
                                transition: 'all 0.2s ease',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
                                flexWrap: item.isLongText ? 'wrap' : 'nowrap'
                              }}>
                                <span className="spec-label" style={{
                                  color: '#475569',
                                  fontSize: '0.95rem',
                                  fontWeight: '500',
                                  minWidth: '140px',
                                  flex: item.isLongText ? '0 0 100%' : '0 0 auto',
                                  marginBottom: item.isLongText ? '8px' : '0'
                                }}>
                                  {item.label}:
                                </span>
                                <span className="spec-value" style={{
                                  color: '#0f172a',
                                  fontWeight: '600',
                                  fontSize: '0.95rem',
                                  background: item.isLongText ? 'transparent' : '#f1f5f9',
                                  padding: item.isLongText ? '0' : '6px 16px',
                                  borderRadius: item.isLongText ? '0' : '30px',
                                  border: item.isLongText ? 'none' : '1px solid #e2e8f0',
                                  flex: '1',
                                  textAlign: item.isLongText ? 'left' : 'right',
                                  whiteSpace: item.isLongText ? 'pre-wrap' : 'normal',
                                  lineHeight: item.isLongText ? '1.5' : 'normal'
                                }}>
                                  {item.value || '—'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{
              padding: '24px 32px 32px',
              borderTop: '1px solid rgba(16, 185, 129, 0.15)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '16px',
              background: 'linear-gradient(90deg, rgba(16, 185, 129, 0.02) 0%, transparent 100%)',
              position: 'sticky',
              bottom: 0,
              backgroundColor: 'white'
            }}>
              <button
                className="btn"
                onClick={() => setShowDetailsModal(false)}
                style={{
                  background: 'transparent',
                  border: '2px solid #e2e8f0',
                  color: '#475569',
                  padding: '12px 28px',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontSize: '1rem',
                  fontWeight: '600'
                }}
              >
                Close
              </button>

              <button
                className="btn"
                onClick={() => {
                  setShowDetailsModal(false);
                  handleAddToCartClick(detailedProduct);
                }}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  border: 'none',
                  color: '#ffffff',
                  padding: '12px 28px',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'all 0.2s ease',
                  fontSize: '1rem',
                  fontWeight: '600',
                  boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)'
                }}
              >
                <ShoppingCart size={18} />
                Add to Cart
              </button>

              <button
                className="btn"
                onClick={() => {
                  setShowDetailsModal(false);
                  handleOrderNow(detailedProduct);
                }}
                style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  border: 'none',
                  color: '#ffffff',
                  padding: '12px 28px',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontSize: '1rem',
                  fontWeight: '600',
                  boxShadow: '0 8px 20px rgba(245, 158, 11, 0.25)'
                }}
              >
                Order Now
              </button>
            </div>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes modalFadeIn {
            from {
              opacity: 0;
              transform: scale(0.95) translateY(10px);
            }
            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }
          
          .spec-row:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 16px rgba(16, 185, 129, 0.1) !important;
            border-color: rgba(16, 185, 129, 0.3) !important;
          }
          
          .close-btn:hover {
            background: rgba(16, 185, 129, 0.2) !important;
            transform: rotate(90deg);
          }
          
          button:hover {
            transform: translateY(-2px);
          }

          @keyframes slideInRight {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }

          @media (max-width: 768px) {
            .products-header {
              flex-direction: column;
            }
            
            .products-actions {
              width: 100%;
              flex-direction: row;
              justify-content: space-between;
            }
            
            .currency-dropdown-container {
              flex: 1;
            }
            
            .currency-dropdown {
              width: 100% !important;
            }
          }

          @media (max-width: 480px) {
            .products-actions {
              flex-direction: column;
            }
            
            .products-actions button,
            .products-actions .currency-dropdown-container {
              width: 100%;
            }
            
            .currency-dropdown {
              width: 100% !important;
            }
          }

          .modal-content::-webkit-scrollbar {
            width: 8px;
          }
          
          .modal-content::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 10px;
          }
          
          .modal-content::-webkit-scrollbar-thumb {
            background: #10b981;
            border-radius: 10px;
          }
          
          .modal-content::-webkit-scrollbar-thumb:hover {
            background: #059669;
          }
        `}
      </style>
    </div>
  );
};

export default ProductPage;