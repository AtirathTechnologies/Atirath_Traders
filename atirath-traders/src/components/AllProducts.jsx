import React from 'react';

const AllProducts = ({ onProductClick, onNavigate }) => {
  const allProducts = [
    {
      name: "Edible Oil Refining",
      product: "oil",
      image: "./img/oil.jpeg",
      description: "High-quality refined Edible oil products for culinary and industrial use."
    },
    {
      name: "Construction Materials",
      product: "construction",
      image: "/img/steel-cement.png",
      description: "High-quality steel and cement for construction projects."
    },
    {
      name: "Rice",
      product: "rice",
      image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      description: "Premium quality rice varieties for domestic and international markets."
    },
    {
      name: "Pulses",
      product: "pulses",
      image: "https://food.fnr.sndimg.com/content/dam/images/food/fullset/2016/2/15/0/HE_dried-legumes-istock-2_s4x3.jpg.rend.hgtvcom.1280.1280.85.suffix/1455572939649.webp",
      description: "Premium pulses including Toor Dal, Moong Dal, Chana Dal and more."
    },
    {
      name: "Fruits",
      product: "fruits",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJaB4CfdpehM4mzx6avwe6dBvgAl1QnuQkxA&s",
      description: "Fresh and high-quality fruits sourced from the best farms."
    },
    {
      name: "Vegetables",
      product: "vegetables",
      image: "https://images2.minutemediacdn.com/image/upload/c_crop,x_0,y_0,w_1097,h_617/c_fill,w_720,ar_16:9,f_auto,q_auto,g_auto/shape/cover/sport/643188-gettyimages-153946385-ca1ccfaad9be44325afc434b305adc0d.jpg",
      description: "Fresh and organic vegetables for healthy living."
    },
    {
      name: "Gadgets",
      product: "gadgets",
      image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      description: "Latest electronic gadgets and accessories."
    },
    {
      name: "Chocolate",
      product: "chocolate",
      image: "https://images.unsplash.com/photo-1575377427642-087cf684f29d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      description: "Premium quality chocolates and confectionery products."
    },
    {
      name: "Beverages",
      product: "beverages",
      image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      description: "Refreshing beverages for all occasions."
    },
    {
      name: "Perfume",
      product: "perfume",
      image: "https://images.unsplash.com/photo-1541643600914-78b084683601?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      description: "Premium fragrances and personal care products."
    },
    {
      name: "Flowers",
      product: "flowers",
      image: "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      description: "Fresh flowers and floral arrangements for all occasions."
    },
    {
      name: "Spices",
      product: "spices",
      image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      description: "Aromatic spices to enhance your culinary experience."
    },
    {
      name: "Clothing",
      product: "clothing",
      image: "https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      description: "Fashionable clothing for all ages and occasions."
    },
    {
      name: "Dry Fruits",
      product: "dryfruits",
      image: "https://www.nutraj.com/cdn/shop/files/9-healthy-and-delicious-dry-fruits-featured-image-450300-mobile-view.jpg?v=1688041386",
      description: "Premium quality dry fruits and nuts for healthy snacking."
    },
    {
      name: "Tea",
      product: "tea",
      image: "https://domf5oio6qrcr.cloudfront.net/medialibrary/8468/conversions/Tea-thumb.jpg",
      description: "Premium tea varieties from the finest plantations."
    }
  ];

  const handleProductClick = (productType) => {
    console.log('All products - product clicked:', productType);
    if (onProductClick) {
      // Always set fromAllProducts to true when clicking from AllProducts
      onProductClick(productType, { fromAllProducts: true });
    }
  };

  const handleBackClick = () => {
    console.log('Back button clicked - going to home');
    if (onNavigate) {
      onNavigate('home');
    }
  };

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
        
        <div className="row g-4">
          {allProducts.map((product, index) => (
            <div 
              key={index} 
              className="col-6 col-md-4 col-lg-3"
              data-aos="fade-up" 
              data-aos-delay={index % 4 * 100}
            >
              <div 
                className="service-card glass p-3 text-center h-100"
                onClick={() => handleProductClick(product.product)}
                style={{ cursor: 'pointer' }}
              >
                <div className="service-icon-container">
                  <div className="service-icon-cube">
                    <div className="service-icon-face service-icon-front">
                      <img src={product.image} alt={product.name} />
                    </div>
                    <div className="service-icon-face service-icon-back">
                      <img src={product.image} alt={product.name} />
                    </div>
                    <div className="service-icon-face service-icon-top">
                      <img src={product.image} alt={product.name} />
                    </div>
                    <div className="service-icon-face service-icon-bottom">
                      <img src={product.image} alt={product.name} />
                    </div>
                    <div className="service-icon-face service-icon-left">
                      <img src={product.image} alt={product.name} />
                    </div>
                    <div className="service-icon-face service-icon-right">
                      <img src={product.image} alt={product.name} />
                    </div>
                  </div>
                </div>
                <h4 className="h6 fw-semibold accent mb-2">{product.name}</h4>
                <p className="small mb-0">{product.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AllProducts;