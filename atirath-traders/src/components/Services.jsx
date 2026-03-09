import React from 'react';
import { useNavigate } from 'react-router-dom';

const Services = ({ onServiceClick, onViewAllClick }) => {
  const navigate = useNavigate();

  const services = [
    {
      name: "Rice",
      product: "rice", // Should match database category ID
      image: "/img/All_Products/Rice.webp",
      description: "Premium quality rice varieties for domestic and international markets."
    },
    {
      name: "Chocolates",
      product: "chocolates", // Should match database category ID
      image: "/img/All_Products/Chocolate.webp",
      description: "Premium chocolate coated nuts and confectionery products."
    },
    {
      name: "Beverages",
      product: "beverages", // Should match database category ID
      image: "/img/All_Products/Beverages.webp",
      description: "Premium Quality Beverages including soft drinks and energy drinks."
    },
    {
      name: "Dry Fruits",
      product: "dry_fruits", // Fixed: Changed to match typical Firebase category ID
      image: "/img/All_Products/Dryfruits.webp",
      description: "Premium quality dry fruits including nuts, dried berries, and snacks."
    },
    {
      name: "Dried Fruits",
      product: "dried_fruits", // Fixed: Changed to match typical Firebase category ID
      image: "/img/All_Products/Dried_Logo.webp",
      description: "High-quality dehydrated fruits and berries"
    },
    {
      name: "Popcorn",
      product: "popcorn", // Fixed: lowercase to match database
      image: "/img/All_Products/Popcorn.webp",
      description: "Wonder Puff premium popcorn varieties"
    }
  ];

  // Show only first 6 products initially
  const initialServices = services.slice(0, 6);

  const handleServiceClick = (productType) => {
    console.log('Service card clicked, product type:', productType);
    
    // Log for debugging
    console.log('All services:', services.map(s => ({ name: s.name, product: s.product })));
    
    if (onServiceClick) {
      onServiceClick(productType, { fromAllProducts: true });
    } else {
      navigate(`/product/${productType}`);
    }
  };

  const handleViewAllClick = () => {
    console.log('View All button clicked');
    if (onViewAllClick) {
      onViewAllClick();
    } else {
      navigate('/all-products');
    }
  };

  return (
    <section id="services" className="py-5 px-3">
      <div className="container">
        <h3
          className="h2 fw-bold text-center accent mb-5"
          data-aos="zoom-in"
          style={{ marginTop: '80px' }}
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

        {/* View All Button - ALWAYS VISIBLE */}
        <div className="text-center mt-5" data-aos="fade-up">
          <button 
            className="btn btn-primary btn-lg px-5"
            onClick={handleViewAllClick}
            style={{ 
              display: 'inline-block',
              visibility: 'visible',
              opacity: 1
            }}
          >
            View All Products
          </button>
        </div>
      </div>
    </section>
  );
};

export default Services;