// components/AddToCartConfigModal.jsx
import React, { useState, useEffect } from 'react';
import { X, ShoppingCart } from 'lucide-react';

const AddToCartConfigModal = ({ 
  isOpen, 
  onClose, 
  product, 
  onAddToCart,
  getRiceGrades,
  getPackingOptions,
  getQuantityOptions,
  isRiceProduct
}) => {
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedGradePrice, setSelectedGradePrice] = useState('');
  const [selectedGradeDisplay, setSelectedGradeDisplay] = useState('');
  const [selectedPacking, setSelectedPacking] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState('');
  const [quantityUnit, setQuantityUnit] = useState('');
  const [isRice, setIsRice] = useState(false);
  const [grades, setGrades] = useState([]);
  const [packingOptions, setPackingOptions] = useState([]);
  const [quantityOptions, setQuantityOptions] = useState([]);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (product) {
      console.log("🔧 Config modal received product:", product);
      
      const riceCheck = isRiceProduct ? isRiceProduct(product) : false;
      setIsRice(riceCheck);
      
      // Get grades from Firebase only
      if (riceCheck && getRiceGrades) {
        const productGrades = getRiceGrades(product);
        console.log("📊 Available grades from Firebase:", productGrades);
        setGrades(productGrades);
        if (productGrades.length > 0) {
          setSelectedGrade(productGrades[0].value);
          setSelectedGradePrice(productGrades[0].price);
          setSelectedGradeDisplay(productGrades[0].label || productGrades[0].value);
        }
      }
      
      // Get packing options from Firebase only
      const packOptions = getPackingOptions ? getPackingOptions(product) : [];
      console.log("📦 Packing options from Firebase:", packOptions);
      setPackingOptions(packOptions);
      if (packOptions.length > 0) {
        setSelectedPacking(packOptions[0].value);
      }
      
      // Get quantity options from Firebase only
      const qtyOptions = getQuantityOptions ? getQuantityOptions(product) : [];
      console.log("⚖️ Quantity options from Firebase:", qtyOptions);
      setQuantityOptions(qtyOptions);
      if (qtyOptions.length > 0) {
        setSelectedQuantity(qtyOptions[0].value);
        setQuantityUnit(qtyOptions[0].unit || 'kg');
      }
      
      setValidationError('');
    }
  }, [product, getRiceGrades, getPackingOptions, getQuantityOptions, isRiceProduct]);

  const handleGradeChange = (e) => {
    const gradeValue = e.target.value;
    
    const selectedGradeObj = grades.find(g => g.value === gradeValue);
    if (selectedGradeObj) {
      setSelectedGrade(selectedGradeObj.value);
      setSelectedGradePrice(selectedGradeObj.price);
      setSelectedGradeDisplay(selectedGradeObj.label || selectedGradeObj.value);
      console.log("📊 Selected grade:", {
        value: selectedGradeObj.value,
        price: selectedGradeObj.price,
        display: selectedGradeObj.label || selectedGradeObj.value
      });
    }
  };

  const handlePackingChange = (e) => {
    setSelectedPacking(e.target.value);
    console.log("📦 Selected packing:", e.target.value);
  };

  const handleQuantityChange = (e) => {
    const qtyValue = e.target.value;
    setSelectedQuantity(qtyValue);
    
    const selectedQtyObj = quantityOptions.find(q => q.value === qtyValue);
    if (selectedQtyObj) {
      setQuantityUnit(selectedQtyObj.unit || 'kg');
      console.log("⚖️ Selected quantity:", {
        value: qtyValue,
        unit: selectedQtyObj.unit
      });
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
    
    if (isRice && !selectedGrade) {
      setValidationError('Please select a grade');
      return;
    }
    
    console.log("📦 Preparing to add to cart with config:", {
      product: product?.name,
      brand: product?.brandName,
      grade: selectedGrade,
      gradeDisplay: selectedGradeDisplay,
      gradePrice: selectedGradePrice,
      packing: selectedPacking,
      quantity: selectedQuantity,
      quantityUnit: quantityUnit,
      isRice: isRice
    });
    
    const productWithConfig = {
      id: product.id,
      name: product.name,
      brandId: product.brandId || null,
      brandName: product.brandName || 'General',
      companyId: product.companyId || null,
      companyName: product.companyName || '',
      price: product.price,
      price_usd_per_carton: product.price_usd_per_carton,
      fob_price_usd: product.fob_price_usd,
      "Ex-Mill_usd": product["Ex-Mill_usd"],
      image: product.image,
      category: product.category,
      categoryId: product.categoryId,
      origin: product.origin,
      packaging: product.packaging,
      pack_type: product.pack_type,
      grades: product.grades,
      shelf_life: product.shelf_life,
      hsn_code: product.hsn_code,
      product_description: product.product_description,
      selectedGrade: selectedGrade,
      selectedGradePrice: selectedGradePrice,
      selectedGradeDisplay: selectedGradeDisplay,
      selectedPacking: selectedPacking,
      selectedQuantity: selectedQuantity,
      quantityUnit: quantityUnit,
      isRice: isRice,
      selectedConfig: {
        grade: selectedGrade,
        gradePrice: selectedGradePrice,
        gradeDisplay: selectedGradeDisplay,
        packing: selectedPacking,
        quantity: selectedQuantity,
        quantityUnit: quantityUnit,
        isRice: isRice
      }
    };
    
    console.log("✅ Product with configuration ready:", productWithConfig);
    
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
                <p className="config-product-brand" style={{ color: '#10b981', fontWeight: 'bold' }}>
                  Brand: {product.brandName}
                </p>
              )}
              {product.origin && (
                <p className="config-product-origin">Origin: {product.origin}</p>
              )}
            </div>
          </div>
          
          <div className="config-options">
            {isRice && (
              <div className="config-option-group">
                <label className="config-option-label">
                  Select Grade <span className="required-star">*</span>
                </label>
                {grades.length > 0 ? (
                  <select 
                    value={selectedGrade} 
                    onChange={handleGradeChange}
                    className="config-option-select"
                  >
                    {grades.map((grade, index) => (
                      <option key={index} value={grade.value}>
                        {grade.label || grade.value}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="config-no-options">No grades available</div>
                )}
                {selectedGradePrice && (
                  <div className="config-grade-price">
                    Price: ₹{selectedGradePrice}/kg
                  </div>
                )}
              </div>
            )}
            
            <div className="config-option-group">
              <label className="config-option-label">
                Select Packing <span className="required-star">*</span>
              </label>
              {packingOptions.length > 0 ? (
                <select 
                  value={selectedPacking} 
                  onChange={handlePackingChange}
                  className="config-option-select"
                >
                  {packingOptions.map((option, index) => (
                    <option key={index} value={option.value}>
                      {option.label || option.value}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="config-no-options">No packing options available</div>
              )}
            </div>
            
            <div className="config-option-group">
              <label className="config-option-label">
                Select Quantity <span className="required-star">*</span>
              </label>
              {quantityOptions.length > 0 ? (
                <select 
                  value={selectedQuantity} 
                  onChange={handleQuantityChange}
                  className="config-option-select"
                >
                  {quantityOptions.map((option, index) => (
                    <option key={index} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="config-no-options">No quantity options available</div>
              )}
              {selectedQuantity && quantityUnit && (
                <div className="config-quantity-unit">
                  Unit: {quantityUnit}
                </div>
              )}
            </div>
            
            {validationError && (
              <div className="config-validation-error">
                ⚠️ {validationError}
              </div>
            )}
          </div>
          
          <div className="config-summary">
            <h5 className="config-summary-title">Selected Options:</h5>
            <ul className="config-summary-list">
              <li>
                <span className="summary-label">Brand:</span>
                <span className="summary-value" style={{ color: '#10b981' }}>
                  {product.brandName || product.companyName || 'General'}
                </span>
              </li>
              {isRice && (
                <li>
                  <span className="summary-label">Grade:</span>
                  <span className="summary-value">
                    {selectedGradeDisplay || selectedGrade || 'Not selected'}
                    {selectedGradePrice && ` (₹${selectedGradePrice}/kg)`}
                  </span>
                </li>
              )}
              <li>
                <span className="summary-label">Packing:</span>
                <span className="summary-value">{selectedPacking || 'Not selected'}</span>
              </li>
              <li>
                <span className="summary-label">Quantity:</span>
                <span className="summary-value">
                  {selectedQuantity ? (
                    <>
                      {quantityOptions.find(q => q.value === selectedQuantity)?.label || selectedQuantity}
                    </>
                  ) : 'Not selected'}
                </span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="add-to-cart-config-modal-footer">
          <button className="config-cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="config-add-to-cart-btn" 
            onClick={handleAddToCart}
          >
            <ShoppingCart size={18} style={{ marginRight: '8px' }} />
            Add to Cart
          </button>
        </div>
      </div>
      
      <style>{`
        .add-to-cart-config-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1100;
          padding: 20px;
          animation: fadeIn 0.3s ease;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .add-to-cart-config-modal {
          background: linear-gradient(135deg, #1e293b 0%, #1a202c 100%);
          border-radius: 16px;
          max-width: 500px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 25px 80px rgba(0, 0, 0, 0.7);
          border: 2px solid rgba(64, 150, 226, 0.4);
          color: #f8fafc;
          animation: slideUp 0.3s ease-out;
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .add-to-cart-config-modal-header {
          padding: 1.5rem 2rem;
          border-bottom: 2px solid rgba(64, 150, 226, 0.3);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(30, 41, 59, 0.95);
          border-radius: 16px 16px 0 0;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        
        .add-to-cart-config-modal-title {
          margin: 0;
          font-weight: 700;
          font-size: 1.3rem;
          color: #f1f5f9;
          letter-spacing: 0.5px;
        }
        
        .add-to-cart-config-close-btn {
          background: rgba(64, 150, 226, 0.2);
          border: 2px solid rgba(64, 150, 226, 0.4);
          cursor: pointer;
          color: #e6e6e6;
          padding: 8px;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.3s ease;
        }
        
        .add-to-cart-config-close-btn:hover {
          background: rgba(64, 150, 226, 0.4);
          color: #ffffff;
          transform: rotate(90deg);
          border-color: #4096e2ff;
        }
        
        .add-to-cart-config-modal-body {
          padding: 2rem;
        }
        
        .config-product-info {
          display: flex;
          gap: 1.5rem;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 2px solid rgba(64, 150, 226, 0.2);
        }
        
        .config-product-image {
          width: 100px;
          height: 100px;
          object-fit: cover;
          border-radius: 10px;
          border: 2px solid rgba(64, 150, 226, 0.4);
        }
        
        .config-product-details {
          flex: 1;
        }
        
        .config-product-name {
          margin: 0 0 0.5rem;
          font-size: 1.2rem;
          font-weight: 600;
          color: #f1f5f9;
        }
        
        .config-product-company {
          margin: 0 0 0.25rem;
          font-size: 0.95rem;
          color: #94a3b8;
        }
        
        .config-product-brand {
          margin: 0.25rem 0;
          font-size: 1rem;
          color: #10b981;
          font-weight: 600;
        }
        
        .config-product-origin {
          margin: 0.25rem 0 0;
          font-size: 0.9rem;
          color: #60a5fa;
        }
        
        .config-options {
          margin-bottom: 2rem;
        }
        
        .config-option-group {
          margin-bottom: 1.5rem;
        }
        
        .config-option-label {
          display: block;
          margin-bottom: 0.75rem;
          font-weight: 600;
          color: #d1d5db;
          font-size: 1rem;
        }
        
        .required-star {
          color: #ef4444;
          margin-left: 4px;
        }
        
        .config-option-select {
          width: 100%;
          padding: 12px 16px;
          background: rgba(31, 41, 55, 0.8);
          border: 2px solid rgba(64, 150, 226, 0.3);
          border-radius: 10px;
          color: #f1f5f9;
          font-size: 1rem;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        
        .config-option-select:hover {
          border-color: #4096e2ff;
        }
        
        .config-option-select:focus {
          outline: none;
          border-color: #4096e2ff;
          box-shadow: 0 0 0 3px rgba(64, 150, 226, 0.2);
        }
        
        .config-option-select option {
          background: #1f2937;
          color: #f1f5f9;
          padding: 10px;
        }
        
        .config-no-options {
          padding: 12px 16px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 8px;
          color: #fecaca;
          font-size: 0.95rem;
          text-align: center;
        }
        
        .config-grade-price,
        .config-quantity-unit {
          margin-top: 0.5rem;
          font-size: 0.95rem;
          color: #10b981;
          padding: 8px 12px;
          background: rgba(16, 185, 129, 0.1);
          border-radius: 6px;
          border-left: 3px solid #10b981;
        }
        
        .config-validation-error {
          margin-top: 1rem;
          padding: 12px 16px;
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.5);
          border-radius: 8px;
          color: #fecaca;
          font-size: 0.95rem;
        }
        
        .config-summary {
          background: rgba(30, 41, 59, 0.6);
          border-radius: 12px;
          padding: 1.5rem;
          border: 1px solid rgba(64, 150, 226, 0.3);
        }
        
        .config-summary-title {
          margin: 0 0 1rem;
          font-size: 1.1rem;
          font-weight: 600;
          color: #d1d5db;
        }
        
        .config-summary-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .config-summary-list li {
          display: flex;
          justify-content: space-between;
          padding: 0.75rem 0;
          border-bottom: 1px solid rgba(64, 150, 226, 0.2);
        }
        
        .config-summary-list li:last-child {
          border-bottom: none;
        }
        
        .summary-label {
          color: #94a3b8;
        }
        
        .summary-value {
          color: #60a5fa;
          font-weight: 500;
        }
        
        .add-to-cart-config-modal-footer {
          padding: 1.5rem 2rem;
          border-top: 2px solid rgba(64, 150, 226, 0.3);
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          background: rgba(30, 41, 59, 0.95);
          border-radius: 0 0 16px 16px;
          position: sticky;
          bottom: 0;
        }
        
        .config-cancel-btn {
          padding: 12px 24px;
          background: rgba(107, 114, 128, 0.3);
          border: 1px solid rgba(107, 114, 128, 0.5);
          color: #e6e6e6;
          border-radius: 10px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .config-cancel-btn:hover {
          background: rgba(107, 114, 128, 0.5);
          transform: translateY(-2px);
        }
        
        .config-add-to-cart-btn {
          padding: 12px 32px;
          background: linear-gradient(135deg, #0dcaf0 0%, #0d6efd 100%);
          border: none;
          color: white;
          border-radius: 10px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .config-add-to-cart-btn:hover {
          background: linear-gradient(135deg, #0d6efd 0%, #0dcaf0 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(13, 110, 253, 0.4);
        }
        
        @media (max-width: 768px) {
          .add-to-cart-config-modal {
            max-width: 100%;
          }
          
          .config-product-info {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
          
          .add-to-cart-config-modal-footer {
            flex-direction: column;
          }
          
          .config-cancel-btn,
          .config-add-to-cart-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default AddToCartConfigModal;