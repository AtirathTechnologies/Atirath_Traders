// components/AddToCartConfigModal.jsx
import React, { useState, useEffect } from 'react';
import { X, ShoppingCart } from 'lucide-react';
import '../styles/form.css';   // ← make sure to import the CSS

const AddToCartConfigModal = ({ 
  isOpen, 
  onClose, 
  product, 
  onAddToCart,
  getRiceGrades,
  getPackingOptions,
  getQuantityOptions,
  getPackingCost,
  getQuantityUnit,
  isRiceProduct,
  currencyRates,
  currencySymbols,
  selectedCurrency
}) => {
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedGradePrice, setSelectedGradePrice] = useState(0);
  const [selectedGradeDisplay, setSelectedGradeDisplay] = useState('');
  const [selectedPacking, setSelectedPacking] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState('');
  const [selectedQuantityLabel, setSelectedQuantityLabel] = useState('');
  const [quantityUnit, setQuantityUnit] = useState('');
  const [isRice, setIsRice] = useState(false);
  const [grades, setGrades] = useState([]);
  const [packingOptions, setPackingOptions] = useState([]);
  const [quantityOptions, setQuantityOptions] = useState([]);
  const [validationError, setValidationError] = useState('');
  
  const [basePackPrice, setBasePackPrice] = useState(0);
  const [packingCostPerKg, setPackingCostPerKg] = useState(0);
  const [totalPackingCost, setTotalPackingCost] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);

  // Prevent body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => document.body.style.overflow = 'unset';
  }, [isOpen]);

  const getBasePackPriceFromFirebase = (product, quantityKg) => {
    if (!product || !quantityKg) return 0;
    const qtyNum = parseFloat(quantityKg);
    if (isNaN(qtyNum)) return 0;

    if (product.meta?.baseExMillPrices && typeof product.meta.baseExMillPrices === 'object') {
      const exactMatch = product.meta.baseExMillPrices[qtyNum.toString()] ||
                         product.meta.baseExMillPrices[`${qtyNum}kg`];
      if (exactMatch) return parseFloat(exactMatch);
      for (let key of Object.keys(product.meta.baseExMillPrices)) {
        const keyNum = parseFloat(key);
        if (keyNum === qtyNum) return parseFloat(product.meta.baseExMillPrices[key]);
      }
    }
    if (product.price_range?.unit === 'per_pack' && qtyNum === 5) {
      return product.price_range.min;
    }
    if (product.price?.perPack?.[qtyNum]) return product.price.perPack[qtyNum];
    return 0;
  };

  const getSimpleProductPrice = (product) => {
    if (!product) return { value: 0, display: 'Contact for Price' };
    let priceValue = 0;
    let currency = 'USD';
    let unit = 'carton';
    
    if (product.price_usd_per_carton) {
      priceValue = parseFloat(product.price_usd_per_carton);
      currency = 'USD';
      unit = 'carton';
    } else if (product.fob_price_usd) {
      priceValue = parseFloat(product.fob_price_usd);
      currency = 'USD';
      unit = 'carton';
    } else if (product["Ex-Mill_usd"]) {
      priceValue = parseFloat(product["Ex-Mill_usd"]);
      currency = 'USD';
      unit = 'carton';
    } else if (product.pricing?.basePrice) {
      priceValue = parseFloat(product.pricing.basePrice);
      currency = product.pricing.currency || 'USD';
      unit = product.pricing.unit || 'carton';
    } else if (product.price && typeof product.price === 'number') {
      priceValue = product.price;
      currency = product.currency || 'USD';
      unit = 'unit';
    } else if (product.price?.value) {
      priceValue = product.price.value;
      currency = product.price.currency || 'USD';
      unit = product.price.unit || 'unit';
    }
    
    const symbol = currency === 'USD' ? '$' : (currency === 'INR' ? '₹' : currency);
    const display = `${symbol}${priceValue.toFixed(2)} / ${unit}`;
    return { value: priceValue, display, currency, unit };
  };

  useEffect(() => {
    if (!product) return;
    
    const riceCheck = isRiceProduct ? isRiceProduct(product) : false;
    setIsRice(riceCheck);
    
    const packOptions = getPackingOptions ? getPackingOptions(product) : [];
    setPackingOptions(packOptions);
    if (packOptions.length > 0) setSelectedPacking(packOptions[0].value);
    
    const qtyOptions = getQuantityOptions ? getQuantityOptions(product) : [];
    setQuantityOptions(qtyOptions);
    if (qtyOptions.length > 0) {
      const firstQty = qtyOptions[0];
      setSelectedQuantity(firstQty.value);
      setSelectedQuantityLabel(firstQty.label);
      setQuantityUnit(firstQty.unit || (riceCheck ? 'kg' : 'unit'));
    }
    
    if (riceCheck) {
      if (getRiceGrades) {
        const productGrades = getRiceGrades(product);
        setGrades(productGrades);
        if (productGrades.length > 0) {
          setSelectedGrade(productGrades[0].value);
          setSelectedGradePrice(parseFloat(productGrades[0].price) || 0);
          setSelectedGradeDisplay(productGrades[0].label || productGrades[0].value);
        } else {
          setGrades([]);
          setSelectedGrade('');
          setSelectedGradePrice(0);
          setSelectedGradeDisplay('');
        }
      }
    }
    
    setValidationError('');
  }, [product, getRiceGrades, getPackingOptions, getQuantityOptions, isRiceProduct]);

  useEffect(() => {
    if (!isRice) return;
    const qtyNum = parseFloat(selectedQuantity);
    if (isNaN(qtyNum) || qtyNum <= 0) {
      setBasePackPrice(0);
      setPackingCostPerKg(0);
      setTotalPackingCost(0);
      setGrandTotal(0);
      return;
    }
    
    const packPrice = getBasePackPriceFromFirebase(product, qtyNum);
    setBasePackPrice(packPrice);
    
    let packingPerKg = 0;
    if (selectedPacking && selectedQuantity && getPackingCost) {
      const cost = getPackingCost(product, selectedPacking, selectedQuantity);
      packingPerKg = parseFloat(cost) || 0;
    }
    setPackingCostPerKg(packingPerKg);
    
    const packingTotal = packingPerKg * qtyNum;
    setTotalPackingCost(packingTotal);
    setGrandTotal(packPrice + packingTotal);
  }, [selectedQuantity, selectedPacking, isRice, product, getPackingCost]);

  const handleGradeChange = (e) => {
    const gradeValue = e.target.value;
    const selectedGradeObj = grades.find(g => g.value === gradeValue);
    if (selectedGradeObj) {
      setSelectedGrade(selectedGradeObj.value);
      setSelectedGradePrice(parseFloat(selectedGradeObj.price) || 0);
      setSelectedGradeDisplay(selectedGradeObj.label || selectedGradeObj.value);
    }
  };

  const handlePackingChange = (e) => setSelectedPacking(e.target.value);
  const handleQuantityChange = (e) => {
    const qtyValue = e.target.value;
    setSelectedQuantity(qtyValue);
    const selectedQtyObj = quantityOptions.find(q => q.value === qtyValue);
    if (selectedQtyObj) {
      setSelectedQuantityLabel(selectedQtyObj.label);
      setQuantityUnit(selectedQtyObj.unit || (isRice ? 'kg' : 'unit'));
    }
  };

  const handleAddToCart = () => {
    if (!selectedPacking) {
      setValidationError('Please select a packing option');
      return;
    }
    if (!selectedQuantity) {
      setValidationError('Please select a quantity');
      return;
    }
    if (isRice && grades.length > 0 && !selectedGrade) {
      setValidationError('Please select a grade');
      return;
    }
    
    let productWithConfig;
    
    if (isRice) {
      productWithConfig = {
        id: product.id,
        name: product.name,
        brandId: product.brandId || null,
        brandName: product.brandName || 'General',
        companyId: product.companyId || null,
        companyName: product.companyName || '',
        image: product.image,
        category: product.category,
        categoryId: product.categoryId,
        origin: product.origin,
        
        price: {
          value: basePackPrice,
          packPrice: basePackPrice,
          quantity: parseFloat(selectedQuantity),
          unit: 'pack',
          currency: 'INR',
          display: `₹${basePackPrice.toFixed(2)} / ${selectedQuantityLabel}`
        },
        
        packingPricePerKg: packingCostPerKg,
        totalPackingCost: totalPackingCost,
        
        selectedGrade,
        selectedGradePrice,
        selectedGradeDisplay,
        selectedPacking,
        selectedQuantity,
        selectedQuantityLabel,
        quantityUnit,
        isRice: true,
        
        selectedConfig: {
          grade: selectedGrade,
          gradePrice: selectedGradePrice,
          gradeDisplay: selectedGradeDisplay,
          packing: selectedPacking,
          quantity: selectedQuantity,
          quantityLabel: selectedQuantityLabel,
          quantityUnit,
          packingPricePerKg: packingCostPerKg,
          totalPackingCost,
          isRice: true
        },
        
        cartCurrency: 'INR',
        cartCurrencySymbol: '₹',
        cartBaseCurrency: 'INR',
        cartBaseValue: basePackPrice
      };
    } else {
      const { value, display, currency, unit } = getSimpleProductPrice(product);
      productWithConfig = {
        id: product.id,
        name: product.name,
        brandId: product.brandId || null,
        brandName: product.brandName || 'General',
        companyId: product.companyId || null,
        companyName: product.companyName || '',
        image: product.image,
        category: product.category,
        categoryId: product.categoryId,
        origin: product.origin,
        
        price: {
          value: value,
          display: display,
          currency: currency,
          unit: unit
        },
        
        selectedPacking,
        selectedQuantity,
        selectedQuantityLabel,
        quantityUnit,
        isRice: false,
        
        selectedConfig: {
          packing: selectedPacking,
          quantity: selectedQuantity,
          quantityLabel: selectedQuantityLabel,
          quantityUnit,
          isRice: false
        },
        
        cartCurrency: currency,
        cartCurrencySymbol: currency === 'USD' ? '$' : (currency === 'INR' ? '₹' : currency),
        cartBaseCurrency: currency,
        cartBaseValue: value
      };
    }
    
    console.log("✅ Adding to cart with separate product price and packing cost:", {
      productPrice: productWithConfig.price.value,
      packingCost: productWithConfig.totalPackingCost,
      total: productWithConfig.price.value + (productWithConfig.totalPackingCost || 0)
    });
    
    onAddToCart(productWithConfig);
    onClose();
  };

  if (!isOpen || !product) return null;

  return (
    <div className="add-to-cart-config-modal-overlay">
      <div className="add-to-cart-config-modal">
        <div className="add-to-cart-config-modal-header">
          <h3 className="add-to-cart-config-modal-title">
            Configure {product.brandName && product.brandName !== 'General' ? product.brandName : product.companyName} - {product.name}
          </h3>
          <button className="add-to-cart-config-close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        
        <div className="add-to-cart-config-modal-body">
          <div className="config-product-info">
            <img 
              src={product.image} 
              alt={product.name}
              className="config-product-image"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&auto=format&fit=crop&q=60';
              }}
            />
            <div className="config-product-details">
              <h4 className="config-product-name">{product.name}</h4>
              <p className="config-product-company">{product.companyName}</p>
              {product.brandName && product.brandName !== 'General' && (
                <p className="config-product-brand config-product-brand-special">Brand: {product.brandName}</p>
              )}
              {product.origin && (
                <p className="config-product-origin">Origin: {product.origin}</p>
              )}
            </div>
          </div>
          
          <div className="config-options">
            {isRice && grades.length > 0 && (
              <div className="config-option-group">
                <label className="config-option-label">
                  Select Grade <span className="required-star">*</span>
                </label>
                <select value={selectedGrade} onChange={handleGradeChange} className="config-option-select">
                  {grades.map((grade, idx) => (
                    <option key={idx} value={grade.value}>{grade.label || grade.value}</option>
                  ))}
                </select>
                {selectedGradePrice > 0 && (
                  <div className="config-grade-price">Grade Price: ₹{selectedGradePrice}/kg</div>
                )}
              </div>
            )}
            
            <div className="config-option-group">
              <label className="config-option-label">Select Packing <span className="required-star">*</span></label>
              {packingOptions.length > 0 ? (
                <select value={selectedPacking} onChange={handlePackingChange} className="config-option-select">
                  {packingOptions.map((opt, idx) => (
                    <option key={idx} value={opt.value}>{opt.label || opt.value}</option>
                  ))}
                </select>
              ) : (
                <div className="config-no-options">No packing options available</div>
              )}
            </div>
            
            <div className="config-option-group">
              <label className="config-option-label">Select Quantity <span className="required-star">*</span></label>
              {quantityOptions.length > 0 ? (
                <select value={selectedQuantity} onChange={handleQuantityChange} className="config-option-select">
                  {quantityOptions.map((opt, idx) => (
                    <option key={idx} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ) : (
                <div className="config-no-options">No quantity options available</div>
              )}
            </div>
            
            {isRice && selectedQuantityLabel && (
              <div className="config-pricing-breakdown">
                <div className="breakdown-row">
                  <span>Product Price ({selectedQuantityLabel}):</span>
                  <span>₹{basePackPrice.toFixed(2)}</span>
                </div>
                <div className="breakdown-row">
                  <span>Packing Cost:</span>
                  <span>₹{packingCostPerKg.toFixed(2)}/kg × {selectedQuantityLabel} = ₹{totalPackingCost.toFixed(2)}</span>
                </div>
                <div className="breakdown-row total">
                  <span>Total:</span>
                  <span>₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>
            )}
            
            {!isRice && selectedQuantityLabel && (
              <div className="config-pricing-breakdown">
                <div className="breakdown-row total">
                  <span>Total:</span>
                  <span>{getSimpleProductPrice(product).display}</span>
                </div>
              </div>
            )}
            
            {validationError && (
              <div className="config-validation-error">⚠️ {validationError}</div>
            )}
          </div>
          
          <div className="config-summary">
            <h5 className="config-summary-title">Selected Options:</h5>
            <ul className="config-summary-list">
              <li><span className="summary-label">Brand:</span><span className="summary-value summary-brand-value">{product.brandName || product.companyName || 'General'}</span></li>
              {isRice && grades.length > 0 && (
                <li><span className="summary-label">Grade:</span><span className="summary-value">{selectedGradeDisplay || selectedGrade || 'Not selected'}{selectedGradePrice > 0 && ` (₹${selectedGradePrice.toFixed(2)}/kg)`}</span></li>
              )}
              <li><span className="summary-label">Packing:</span><span className="summary-value">{selectedPacking || 'Not selected'}</span></li>
              <li><span className="summary-label">Quantity:</span><span className="summary-value">{selectedQuantityLabel || 'Not selected'}</span></li>
              {isRice ? (
                <li className="summary-total"><span className="summary-label">Total Price:</span><span className="summary-value summary-total-price">₹{grandTotal.toFixed(2)}</span></li>
              ) : (
                <li className="summary-total"><span className="summary-label">Total Price:</span><span className="summary-value summary-total-price">{getSimpleProductPrice(product).display}</span></li>
              )}
            </ul>
          </div>
        </div>
        
        <div className="add-to-cart-config-modal-footer">
          <button className="config-cancel-btn" onClick={onClose}>Cancel</button>
          <button className="config-add-to-cart-btn" onClick={handleAddToCart}>
            <ShoppingCart size={18} className="config-add-to-cart-icon" /> Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddToCartConfigModal;