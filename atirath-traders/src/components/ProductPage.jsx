import React, { useState, useEffect } from 'react';
import { ArrowLeft, Menu, X, ImageOff } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsData, brandsData } from '../data/productsData';
import BuyModal from './BuyModal';

const ProductPage = ({ profile, globalSearchQuery = '', onGlobalSearchClear, isAuthenticated = false }) => {
  const { type: productType } = useParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [imageErrors, setImageErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState('');

  // Sync with global search query
  useEffect(() => {
    setLocalSearchQuery(globalSearchQuery);
  }, [globalSearchQuery]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load products and brands
  useEffect(() => {
    setIsLoading(true);
    // Reset selectedBrand to 'all' when productType changes
    setSelectedBrand('all');
    setImageErrors({});
    setLocalSearchQuery(globalSearchQuery);

    if (productType && productsData[productType]) {
      const productList = productsData[productType];
      const brandList = brandsData[productType] || [];

      console.log('Loading products for:', productType);
      console.log('Products count:', productList.length);
      console.log('Brands:', brandList);
      console.log('Initial selected brand:', 'all'); // This should be 'all'

      setProducts(productList);
      setFilteredProducts(productList);
      setBrands(brandList);

      setTimeout(() => setIsLoading(false), 100);
    } else {
      console.error('Product type not found:', productType);
      setIsLoading(false);
    }
  }, [productType, globalSearchQuery]);

  // Apply filters
  useEffect(() => {
    let filtered = products;

    // Apply brand filter
    if (selectedBrand !== 'all') {
      console.log('Filtering by brand:', selectedBrand);
      filtered = filtered.filter(p => p.brand === selectedBrand);
    }

    // Apply search filter
    if (localSearchQuery.trim()) {
      const query = localSearchQuery.toLowerCase().trim();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query) ||
        (product.price && product.price.toLowerCase().includes(query))
      );
    }

    console.log('Filtered products count:', filtered.length);
    console.log('Current selected brand:', selectedBrand); // Debug log
    setFilteredProducts(filtered);
  }, [selectedBrand, products, localSearchQuery]);

  const handleBrandSelect = (brand) => {
    console.log('Brand selected:', brand);
    setSelectedBrand(brand);
    setSidebarOpen(false);
    setMobileMenuOpen(false);
  };

  const handleOrderNow = (product) => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      alert('Please sign in to place an order. You will be redirected to the home page.');
      setTimeout(() => {
        navigate('/');
      }, 2000);
      return;
    }

    // If authenticated, open the buy modal
    setSelectedProduct({
      ...product,
      quantity: 1,
      name: product.name,
      brand: product.brand,
      category: productType
    });
    setIsBuyModalOpen(true);
  };

  const handleCloseBuyModal = () => {
    setIsBuyModalOpen(false);
    setSelectedProduct(null);
  };

  const handleImageError = (productId) => {
    setImageErrors(prev => ({ ...prev, [productId]: true }));
  };

  const handleBackClick = () => {
    navigate('/all-products');
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setLocalSearchQuery(query);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };

  const clearSearch = () => {
    setLocalSearchQuery('');
    if (onGlobalSearchClear) {
      onGlobalSearchClear();
    }
  };

  const formatBrandName = (brand) => {
    if (brand === 'all') return 'All Brands';
    return brand.charAt(0).toUpperCase() + brand.slice(1).replace(/_/g, ' ');
  };

  const getFallbackImage = (category) => {
    const fallbackImages = {
      rice: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=60',
      spices: 'https://images.unsplash.com/photo-1557841450-9aa4b8cbf6c0?w=500&auto=format&fit=crop&q=60',
      oil: 'https://images.unsplash.com/photo-1571772996211-2f02c9727629?w=500&auto=format&fit=crop&q=60',
      construction: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500&auto=format&fit=crop&q=60',
      fruits: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=500&auto=format&fit=crop&q=60',
      vegetables: 'https://images.unsplash.com/photo-1594282486306-7a6f8b590dd1?w=500&auto=format&fit=crop&q=60',
      pulses: 'https://food.fnr.sndimg.com/content/dam/images/food/fullset/2016/2/15/0/HE_dried-legumes-istock-2_s4x3.jpg.rend.hgtvcom.1280.1280.85.suffix/1455572939649.webp',
      default: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&auto=format&fit=crop&q=60'
    };
    return fallbackImages[category] || fallbackImages.default;
  };

  if (!productType || !productsData[productType]) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-50">
        <div className="text-center">
          <p className="h5 text-muted">
            {productType ? 'No products available' : 'No category selected'}
          </p>
          <button className="btn btn-primary mt-3" onClick={handleBackClick}>
            Back to All Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="product-page">
      {/* Desktop Toggle */}
      <button
        className="categories-toggle d-none d-md-flex"
        style={{ gap: '1rem', top: '170px', bottom: 'auto' }}
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <Menu className="w-5 h-5" /> Brands
      </button>

      {/* Mobile Toggle */}
      <button
        className="categories-toggle-mobile d-md-none"
        onClick={() => setMobileMenuOpen(true)}
      >
        <Menu className="w-5 h-5" /> Brands
      </button>

      {/* Overlay - Only for mobile */}
      <div
        className={`overlay ${mobileMenuOpen ? 'active' : ''}`}
        onClick={() => {
          setMobileMenuOpen(false);
        }}
      />

      {/* Desktop Sidebar */}
      <div className={`categories-sidebar ${sidebarOpen ? 'active' : ''} d-none d-md-block`}>
        <div className="sidebar-header">
          <h3 className="h4 fw-bold accent mb-0">
            {productType.charAt(0).toUpperCase() + productType.slice(1)} Brands
          </h3>
          <button className="btn btn-link p-0 text-white" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="brand-list-container">
          <ul className="brand-list">
            <li
              className={`brand-item ${selectedBrand === 'all' ? 'active' : ''}`}
              onClick={() => {
                console.log('Clicking All Brands');
                handleBrandSelect('all');
              }}
            >
              <span className="brand-text">All Brands</span>
              {selectedBrand === 'all' && <span className="active-indicator">✓</span>}
            </li>
            {brands.map(brand => (
              <li
                key={brand}
                className={`brand-item ${selectedBrand === brand ? 'active' : ''}`}
                onClick={() => handleBrandSelect(brand)}
              >
                <span className="brand-text">{formatBrandName(brand)}</span>
                {selectedBrand === brand && <span className="active-indicator">✓</span>}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-categories-menu ${mobileMenuOpen ? 'active' : ''}`}>
        <div className="mobile-categories-header">
          <h3 className="h4 fw-bold accent mb-0">
            {productType.charAt(0).toUpperCase() + productType.slice(1)} Brands
          </h3>
          <button className="btn btn-link p-0 text-white" onClick={() => setMobileMenuOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="mobile-categories-content">
          <div className="brand-list-container-mobile">
            <div className="brand-list-mobile">
              <div
                className={`brand-item-mobile ${selectedBrand === 'all' ? 'active' : ''}`}
                onClick={() => {
                  console.log('Mobile: Clicking All Brands');
                  handleBrandSelect('all');
                }}
              >
                <span className="brand-text">All Brands</span>
                {selectedBrand === 'all' && <span className="active-indicator-mobile">✓</span>}
              </div>
              {brands.map(brand => (
                <div
                  key={brand}
                  className={`brand-item-mobile ${selectedBrand === brand ? 'active' : ''}`}
                  onClick={() => handleBrandSelect(brand)}
                >
                  <span className="brand-text">{formatBrandName(brand)}</span>
                  {selectedBrand === brand && <span className="active-indicator-mobile">✓</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`product-main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <button
          className="back-button"
          style={{ top: isMobile ? '180px' : '120px' }}
          onClick={handleBackClick}
          title="Back to All Products"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        {/* Search Bar - Mobile only */}
        <div className={`product-search-container mb-4 d-md-none`} style={{ marginTop: isMobile ? '7rem' : '10rem' }}>
          <form onSubmit={handleSearchSubmit} className="d-flex gap-2">
            <input
              type="text"
              className="search-bar flex-grow-1"
              placeholder={`Search ${productType}...`}
              value={localSearchQuery}
              onChange={handleSearchChange}
            />
            {localSearchQuery && (
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={clearSearch}
              >
                Clear
              </button>
            )}
          </form>
          
          {localSearchQuery && (
            <div className="search-info mt-2">
              <small className="text-muted">
                {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found for "{localSearchQuery}"
              </small>
            </div>
          )}
        </div>

        {/* Selected Brand Info */}
        {selectedBrand !== 'all' && (
          <div className="selected-brand-info mb-4" style={{ marginTop: isMobile ? '7rem' : '6rem' }}>
            <span className="fw-semibold">Showing: {formatBrandName(selectedBrand)}</span>
            <button
              className="btn btn-outline-accent btn-sm ms-3"
              onClick={() => handleBrandSelect('all')}
            >
              Clear Filter
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="loading-products">
            <div className="spinner-border text-accent" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading products...</p>
          </div>
        ) : (
          <>
            <div className="products-grid" style={{ 
              marginTop: isMobile && !localSearchQuery ? '7rem' : '6rem',
              marginLeft: isMobile ? '1rem' : '5rem' 
            }}>
              {filteredProducts.length === 0 ? (
                <div className="no-products-message">
                  <p className="h5 accent">No products found</p>
                  <p className="text-sm opacity-80 mt-2">
                    {localSearchQuery || selectedBrand !== 'all'
                      ? 'Try adjusting your search or select a different brand'
                      : 'No products available in this category'}
                  </p>
                  {(localSearchQuery || selectedBrand !== 'all') && (
                    <button
                      className="btn btn-primary mt-3"
                      onClick={() => {
                        setSelectedBrand('all');
                        clearSearch();
                      }}
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              ) : (
                filteredProducts.map(product => (
                  <div key={product.id} className="product-card" data-aos="fade-up">
                    <div className="product-image-container">
                      {imageErrors[product.id] ? (
                        <div className="product-image-fallback">
                          <ImageOff className="w-8 h-8 text-muted" />
                          <span className="text-xs text-muted mt-2">Image not available</span>
                        </div>
                      ) : (
                        <img
                          src={product.image || getFallbackImage(productType)}
                          alt={product.name}
                          className="product-image"
                          onError={() => handleImageError(product.id)}
                          loading="lazy"
                        />
                      )}
                    </div>
                    <div className="product-info">
                      <h3 className="product-title fw-semibold mb-2">{product.name}</h3>
                      <p className="product-price fw-bold text-accent mb-2">{product.price}</p>
                      <p className="text-xs opacity-70 mt-1">Brand: {formatBrandName(product.brand)}</p>
                      <div className="product-actions d-flex gap-2 mt-3">
                        <button className="btn btn-success btn-sm w-100" onClick={() => handleOrderNow(product)}>
                          Order Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      <BuyModal
        isOpen={isBuyModalOpen}
        onClose={handleCloseBuyModal}
        product={selectedProduct}
        profile={profile || null}
      />
    </div>
  );
};

export default ProductPage;