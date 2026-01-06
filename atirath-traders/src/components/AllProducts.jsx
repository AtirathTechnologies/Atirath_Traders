import React, { useState, useEffect } from 'react';
import { database, ref, get } from '../firebase'; // Import Firebase functions

const AllProducts = ({ onProductClick, onNavigate }) => {
  const [categoriesData, setCategoriesData] = useState({});
  
  useEffect(() => {
    fetchCategories();
  }, []);
  
  const fetchCategories = async () => {
    try {
      console.log('Fetching categories for All Products...');
      const categoriesRef = ref(database, 'categories');
      const snapshot = await get(categoriesRef);
      
      if (snapshot.exists()) {
        setCategoriesData(snapshot.val());
        console.log('Loaded categories:', Object.keys(snapshot.val()));
      } else {
        console.log('No categories found in DB.');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };
  
  const handleCategoryClick = (categoryId) => {
    console.log('All products - category clicked:', categoryId);
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
  
  // Convert categoriesData to array for rendering (updated from products to categories)
  const allCategories = Object.entries(categoriesData).map(([key, value]) => ({
    id: key,
    name: value.name || key,
    category: key,
    description: value.description || '',
    image: getCategoryImage(key, value),
    companyCount: 0 // Placeholder; compute from products if needed via shared fetch
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
      dry_fruits: "/img/All_Products/Dryfruits.jpg",
      lentils: "/img/All_Products/Lentils.avif",
      tea: "/img/All_Products/Tea.jpg",
      oil: "/img/All_Products/oil.jpeg",
      construction: "/img/All_Products/steel-cement.png",
      popcorn: "/img/All_Products/Popcorn.jpg",
      default: "/img/All_Products/default-category.jpg"
    };
    
    // Return the specific image for the category, or default if not found
    return images[category] || images.default;
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
            
          </div>
        ) : (
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
                            // If image fails to load, use fallback
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
                  
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default AllProducts;