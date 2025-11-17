import React from 'react';
import { useNavigate } from 'react-router-dom'; // Added for navigation

const Services = ({ onServiceClick, onViewAllClick }) => {
  const navigate = useNavigate(); // For programmatic navigation

  const services = [
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
      image: "https://www.bhg.com/thmb/Mwd_YEkDbVg_fPsUDcWr3eZk9W0=/5645x0/filters:no_upscale():strip_icc()/difference-between-fruits-vegetables-01-5f92e7ec706b463287bcfb46985698f9.jpg",
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

  // Show only first 6 products initially
  const initialServices = services.slice(0, 6);

  const handleServiceClick = (productType) => {
    console.log('Service card clicked:', productType);
    if (onServiceClick) {
      // Restore fromAllProducts flag for tracking
      onServiceClick(productType, { fromAllProducts: true });
    } else {
      // Fallback: Direct navigation if onServiceClick is not provided
      navigate(`/product/${productType}`);
    }
  };

  const handleViewAllClick = () => {
    console.log('View All button clicked');
    if (onViewAllClick) {
      onViewAllClick();
    } else {
      // Fallback: Navigate to AllProducts page
      navigate('/allproducts');
    }
  };

  return (
    <section id="services" className="py-5 px-3">
      <div className="container">
        <h3
          className="h2 fw-bold text-center accent mb-5"
          data-aos="zoom-in"
          style={{ marginTop: '80px' }} // Keep navbar fix
        >
          Our Products
        </h3>

        <div className="row g-4">
          {initialServices.map((service, index) => (
            <div 
              key={index} 
              className="col-6 col-md-4 col-lg-3 col-xl-2"
              data-aos="fade-up" 
              data-aos-delay={index % 6 * 100}
            >
              <div 
                className="service-card glass p-3 text-center h-100"
                onClick={() => handleServiceClick(service.product)}
                style={{ cursor: 'pointer' }}
              >
                <div className="service-icon-container">
                  <div className="service-icon-cube">
                    <div className="service-icon-face service-icon-front">
                      <img src={service.image} alt={service.name} />
                    </div>
                    <div className="service-icon-face service-icon-back">
                      <img src={service.image} alt={service.name} />
                    </div>
                    <div className="service-icon-face service-icon-top">
                      <img src={service.image} alt={service.name} />
                    </div>
                    <div className="service-icon-face service-icon-bottom">
                      <img src={service.image} alt={service.name} />
                    </div>
                    <div className="service-icon-face service-icon-left">
                      <img src={service.image} alt={service.name} />
                    </div>
                    <div className="service-icon-face service-icon-right">
                      <img src={service.image} alt={service.name} />
                    </div>
                  </div>
                </div>
                <h4 className="h6 fw-semibold accent mb-2">{service.name}</h4>
                <p className="small mb-0">{service.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-5" data-aos="fade-up">
          <button 
            className="btn btn-primary btn-lg px-5"
            onClick={handleViewAllClick}
          >
            View All Products
          </button>
        </div>
      </div>
    </section>
  );
};

export default Services;