import React, { useState, useEffect } from 'react';
import { database, ref, get } from '../firebase'; // Import Firebase functions

const AllProducts = ({ onProductClick, onNavigate }) => {
  const [categoriesData, setCategoriesData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    fetchCategories();
  }, []);
  
  const fetchCategories = async () => {
    try {
      console.log('Fetching categories for All Products...');
      setIsLoading(true);
      const categoriesRef = ref(database, 'categories');
      const snapshot = await get(categoriesRef);
      
      if (snapshot.exists()) {
        const categories = snapshot.val();
        setCategoriesData(categories);
        console.log('Loaded categories:', Object.keys(categories));
        console.log('Category details:', categories);
      } else {
        console.log('No categories found in DB.');
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setIsLoading(false);
    }
  };
  
  const handleCategoryClick = (categoryId) => {
    console.log('All products - category clicked:', categoryId);
    console.log('Available categories:', Object.keys(categoriesData));
    
    if (onProductClick) {
      // Pass categoryId to ProductPage for drill-down
      onProductClick(categoryId, { fromAllProducts: true });
    }
  };
  
  const handleBackClick = () => {
    console.log('Back button clicked - going to home');
    if (onNavigate) {
      onNavigate('home');
    }
  };
  
  // Convert categoriesData to array for rendering
  const allCategories = Object.entries(categoriesData).map(([key, value]) => ({
    id: key,
    name: value.name || key,
    category: key,
    description: value.description || '',
    image: getCategoryImage(key, value),
    companyCount: 0
  }));
  
  function getCategoryImage(category, categoryData) {
    // First, check if the category has an image URL in the database
    if (categoryData && categoryData.image) {
      // If it's a Firebase storage URL or any valid URL, use it directly
      if (categoryData.image.startsWith('http://') || 
          categoryData.image.startsWith('https://') ||
          categoryData.image.startsWith('gs://') ||
          categoryData.image.includes('firebasestorage.googleapis.com')) {
        return categoryData.image;
      }
      // If it's a relative path from Firebase, prepend with proper path
      else if (categoryData.image.startsWith('/') || categoryData.image.startsWith('./')) {
        return categoryData.image;
      }
      // If it's just a filename, assume it's in the default images folder
      else {
        return `/img/All_Products/${categoryData.image}`;
      }
    }
    
    // Fallback to default images for known categories if no image in database
    const images = {
      rice: "/img/All_Products/Rice.jpg",
      chocolates: "/img/All_Products/Chocolate.webp",
      beverages: "/img/All_Products/Beverages.jpg",
      dry_fruits: "/img/All_Products/Dryfruits.jpg",
      dried_fruits: "/img/All_Products/Dried_Logo.webp",
      popcorn: "/img/All_Products/Popcorn.jpg",
      tea: "/img/All_Products/Tea.jpg",
      default: "/img/All_Products/default-category.jpg"
    };
    
    // Return the specific image for the category, or default if not found
    return images[category] || images.default;
  }
  
  if (isLoading) {
    return (
      <section className="all-products-page">
        <div className="container">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading categories...</p>
          </div>
        </div>
      </section>
    );
  }
  
  return (
    <section className="all-products-page">
      <div className="container">
        {/* Back Button */}
        <button 
          className="back-button"
          onClick={handleBackClick}
          title="Back to Home"
        >
          ←
        </button>
        
        <h1 className="h2 fw-bold text-center accent mb-5">All Products</h1>
        
        {allCategories.length === 0 ? (
          <div className="text-center py-5">
            <p className="h5 text-muted">No categories found in database.</p>
            <p className="text-sm text-muted">Please check your Firebase database structure.</p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-center">
              <p className="mb-4 sky-blue-text" style={{ 
                color: '#87CEEB',
                fontSize: '1.1rem',
                fontWeight: '500'
              }}>
                Found {allCategories.length} categories
              </p>
            </div>
            <div className="row g-4">
              {allCategories.map((category, index) => (
                <div 
                  key={category.id} 
                  className="col-6 col-md-4 col-lg-3"
                  data-aos="fade-up" 
                  data-aos-delay={index % 4 * 100}
                >
                  <div 
                    className="service-card glass p-3 text-center h-100"
                    onClick={() => handleCategoryClick(category.category)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="service-icon-container">
                      <div className="service-icon-cube">
                        <div className="service-icon-face service-icon-front">
                          <img 
                            src={category.image} 
                            alt={category.name} 
                            onError={(e) => {
                              console.log('Image error for:', category.name, category.image);
                              e.target.src = getCategoryImage('default', {});
                            }}
                          />
                        </div>
                        <div className="service-icon-face service-icon-back">
                          <img 
                            src={category.image} 
                            alt={category.name} 
                            onError={(e) => {
                              e.target.src = getCategoryImage('default', {});
                            }}
                          />
                        </div>
                        <div className="service-icon-face service-icon-top">
                          <img 
                            src={category.image} 
                            alt={category.name} 
                            onError={(e) => {
                              e.target.src = getCategoryImage('default', {});
                            }}
                          />
                        </div>
                        <div className="service-icon-face service-icon-bottom">
                          <img 
                            src={category.image} 
                            alt={category.name} 
                            onError={(e) => {
                              e.target.src = getCategoryImage('default', {});
                            }}
                          />
                        </div>
                        <div className="service-icon-face service-icon-left">
                          <img 
                            src={category.image} 
                            alt={category.name} 
                            onError={(e) => {
                              e.target.src = getCategoryImage('default', {});
                            }}
                          />
                        </div>
                        <div className="service-icon-face service-icon-right">
                          <img 
                            src={category.image} 
                            alt={category.name} 
                            onError={(e) => {
                              e.target.src = getCategoryImage('default', {});
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <h4 className="h6 fw-semibold accent mb-2">{category.name}</h4>
                    <p className="small mb-0">{category.description}</p>
                    <div className="mt-2">
                      <small style={{ 
                        color: '#87CEEB',
                        fontWeight: '500',
                        fontSize: '0.85rem'
                      }}>
                        ID: {category.category}
                      </small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default AllProducts;