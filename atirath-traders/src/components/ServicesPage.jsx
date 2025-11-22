import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Globe, Truck, Package, Search, Users, Phone, Shield, Clock } from 'lucide-react';

const ServicesPage = () => {
  const navigate = useNavigate();

  const services = [
    {
      id: 1,
      title: "Import & Export Services",
      description: "Complete international trade solutions including customs clearance, documentation, and regulatory compliance for seamless cross-border transactions.",
      icon: <Globe className="w-8 h-8" />,
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      features: ["Customs Clearance", "Trade Documentation", "Regulatory Compliance", "Global Logistics"],
      category: "International Trade"
    },
    {
      id: 2,
      title: "Logistics & Transportation",
      description: "End-to-end logistics management with multi-modal transport solutions ensuring timely and secure delivery across global supply chains.",
      icon: <Truck className="w-8 h-8" />,
      image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      features: ["Multi-modal Transport", "Warehousing", "Real-time Tracking", "Supply Chain Optimization"],
      category: "Supply Chain"
    },
    {
      id: 3,
      title: "Product Sourcing",
      description: "Strategic sourcing solutions connecting businesses with verified suppliers worldwide for quality products at competitive prices.",
      icon: <Search className="w-8 h-8" />,
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      features: ["Supplier Verification", "Quality Assurance", "Cost Optimization", "Market Intelligence"],
      category: "Procurement"
    },
    {
      id: 4,
      title: "Quality Assurance",
      description: "Comprehensive quality control and packaging solutions ensuring products meet international standards and reach customers in perfect condition.",
      icon: <Package className="w-8 h-8" />,
      image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      features: ["Quality Control", "Packaging Solutions", "Compliance Testing", "Brand Protection"],
      category: "Quality Management"
    },
    {
      id: 5,
      title: "Trade Consultation",
      description: "Expert advisory services for market expansion, regulatory compliance, and strategic planning in international trade operations.",
      icon: <Users className="w-8 h-8" />,
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      features: ["Market Analysis", "Regulatory Guidance", "Risk Assessment", "Strategic Planning"],
      category: "Business Advisory"
    },
    {
      id: 6,
      title: "Supply Chain Management",
      description: "Integrated supply chain solutions optimizing operations from sourcing to delivery for enhanced efficiency and cost-effectiveness.",
      icon: <Shield className="w-8 h-8" />,
      image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      features: ["End-to-End Management", "Inventory Optimization", "Cost Reduction", "Performance Analytics"],
      category: "Operations"
    }
  ];

  const benefits = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Quality Assurance",
      description: "Rigorous quality control measures ensuring premium products and services"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Timely Delivery",
      description: "Reliable processes guaranteeing on-time delivery commitments"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Expert Team",
      description: "Seasoned professionals with extensive global trade expertise"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Global Network",
      description: "Established partnerships with suppliers and clients worldwide"
    }
  ];

  const handleContactClick = () => {
    navigate('/contact');
  };

  const handleLearnMore = (serviceId) => {
    navigate(`/service-detail/${serviceId}`);
  };

  return (
    <section className="py-5" style={{ marginTop: '100px', minHeight: '100vh' }}>
      <div className="container">
        {/* Back Button */}
        <div className="mb-4">
          <button 
            onClick={() => navigate(-1)}
            className="btn btn-outline-primary d-flex align-items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        {/* Header Section */}
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold text-white mb-3">Our Services</h1>
          <p className="lead text-light opacity-80 mb-4">
            Comprehensive Global Trade Solutions
          </p>
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="card blog-card p-4">
                <p className="text-light opacity-80 mb-0 text-center">
                  Atirath Traders delivers end-to-end international trade services designed to streamline 
                  your global operations. Our integrated approach ensures seamless cross-border transactions 
                  while maintaining the highest standards of quality and compliance.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Services Section */}
        <div className="mb-5">
          <h2 className="text-white mb-4 text-center" style={{ borderBottom: '2px solid #8FB3E2', paddingBottom: '0.5rem' }}>
            Core Services
          </h2>
          <div className="row g-4">
            {services.map((service) => (
              <div key={service.id} className="col-lg-4 col-md-6">
                <div 
                  className="card h-100 blog-card service-card"
                  style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                >
                  <div className="card-img-top position-relative overflow-hidden" style={{ height: '200px' }}>
                    <img 
                      src={service.image} 
                      alt={service.title}
                      className="w-100 h-100 object-fit-cover"
                      style={{ transition: 'transform 0.3s ease' }}
                      onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                      onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                    />
                    <div className="position-absolute top-0 start-0 m-3">
                      <div className="bg-primary rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                        <div className="text-white">
                          {service.icon}
                        </div>
                      </div>
                    </div>
                    <div className="position-absolute top-0 end-0 m-3">
                      <span className="badge bg-primary">{service.category}</span>
                    </div>
                  </div>
                  
                  <div className="card-body">
                    <h5 className="card-title text-white mb-3" style={{ fontSize: '1.2rem' }}>{service.title}</h5>
                    <p className="card-text text-light opacity-80 mb-3" style={{ fontSize: '0.95rem' }}>
                      {service.description}
                    </p>
                    
                    <div className="service-features">
                      <h6 className="text-white mb-2" style={{ fontSize: '0.9rem', color: '#8FB3E2' }}>Key Features:</h6>
                      <ul className="list-unstyled mb-0">
                        {service.features.map((feature, idx) => (
                          <li key={idx} className="text-light opacity-80 small mb-1 d-flex align-items-center">
                            <CheckCircle className="w-3 h-3 text-success me-2" style={{ minWidth: '16px' }} />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="card-footer border-0 bg-transparent pt-0">
                    <button 
                      className="btn btn-primary w-100"
                      onClick={() => handleLearnMore(service.id)}
                    >
                      Learn More
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Why Choose Us Section */}
        <div className="row mt-5 mb-5">
          <div className="col-12">
            <div className="card blog-card p-4">
              <h3 className="text-white text-center mb-4">Why Choose Atirath Traders?</h3>
              <div className="row">
                {benefits.map((benefit, index) => (
                  <div key={index} className="col-lg-3 col-md-6 mb-4">
                    <div className="text-center">
                      <div className="bg-primary rounded-circle p-3 d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '70px', height: '70px' }}>
                        <div className="text-white">
                          {benefit.icon}
                        </div>
                      </div>
                      <h6 className="text-white mb-2">{benefit.title}</h6>
                      <p className="text-light opacity-80 small mb-0">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action Section */}
        <div className="row mt-5">
          <div className="col-12">
            <div className="card blog-card p-5 text-center">
              <h3 className="text-white mb-3">Ready to Expand Your Global Reach?</h3>
              <p className="text-light opacity-80 mb-4 lead">
                Partner with us for seamless international trade solutions
                <br />
                that drive your business growth and global expansion.
              </p>
              <div className="d-flex gap-3 justify-content-center flex-wrap">
                <button 
                  className="btn btn-primary btn-lg d-flex align-items-center gap-2"
                  onClick={handleContactClick}
                >
                  <Phone className="w-5 h-5" />
                  Contact Us
                </button>
                <button className="btn btn-outline-primary btn-lg">
                  Request Quote
                </button>
                <button className="btn btn-success btn-lg">
                  Schedule Consultation
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info Section */}
        <div className="row mt-5">
          <div className="col-lg-6 mb-4">
            <div className="card blog-card h-100 p-4">
              <h4 className="text-white mb-3">Our Approach</h4>
              <div className="d-flex align-items-start mb-3">
                <div className="bg-primary rounded-circle p-2 d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px', flexShrink: 0 }}>
                  <span className="text-white fw-bold">1</span>
                </div>
                <div>
                  <h6 className="text-white mb-1">Client Consultation</h6>
                  <p className="text-light opacity-80 small mb-0">Understanding your business objectives and trade requirements</p>
                </div>
              </div>
              <div className="d-flex align-items-start mb-3">
                <div className="bg-primary rounded-circle p-2 d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px', flexShrink: 0 }}>
                  <span className="text-white fw-bold">2</span>
                </div>
                <div>
                  <h6 className="text-white mb-1">Solution Design</h6>
                  <p className="text-light opacity-80 small mb-0">Creating customized trade and logistics strategies</p>
                </div>
              </div>
              <div className="d-flex align-items-start mb-3">
                <div className="bg-primary rounded-circle p-2 d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px', flexShrink: 0 }}>
                  <span className="text-white fw-bold">3</span>
                </div>
                <div>
                  <h6 className="text-white mb-1">Implementation</h6>
                  <p className="text-light opacity-80 small mb-0">Executing plans with precision and quality control</p>
                </div>
              </div>
              <div className="d-flex align-items-start">
                <div className="bg-primary rounded-circle p-2 d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px', flexShrink: 0 }}>
                  <span className="text-white fw-bold">4</span>
                </div>
                <div>
                  <h6 className="text-white mb-1">Continuous Support</h6>
                  <p className="text-light opacity-80 small mb-0">Ongoing monitoring and optimization of trade operations</p>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-6 mb-4">
            <div className="card blog-card h-100 p-4">
              <h4 className="text-white mb-3">Industry Expertise</h4>
              <div className="row">
                <div className="col-6 mb-3">
                  <div className="d-flex align-items-center">
                    <CheckCircle className="w-4 h-4 text-success me-2" />
                    <span className="text-light opacity-80 small">Agriculture & Food</span>
                  </div>
                </div>
                <div className="col-6 mb-3">
                  <div className="d-flex align-items-center">
                    <CheckCircle className="w-4 h-4 text-success me-2" />
                    <span className="text-light opacity-80 small">Consumer Goods</span>
                  </div>
                </div>
                <div className="col-6 mb-3">
                  <div className="d-flex align-items-center">
                    <CheckCircle className="w-4 h-4 text-success me-2" />
                    <span className="text-light opacity-80 small">Industrial Products</span>
                  </div>
                </div>
                <div className="col-6 mb-3">
                  <div className="d-flex align-items-center">
                    <CheckCircle className="w-4 h-4 text-success me-2" />
                    <span className="text-light opacity-80 small">Textiles & Apparel</span>
                  </div>
                </div>
                <div className="col-6 mb-3">
                  <div className="d-flex align-items-center">
                    <CheckCircle className="w-4 h-4 text-success me-2" />
                    <span className="text-light opacity-80 small">Electronics</span>
                  </div>
                </div>
                <div className="col-6 mb-3">
                  <div className="d-flex align-items-center">
                    <CheckCircle className="w-4 h-4 text-success me-2" />
                    <span className="text-light opacity-80 small">Automotive</span>
                  </div>
                </div>
                <div className="col-6 mb-3">
                  <div className="d-flex align-items-center">
                    <CheckCircle className="w-4 h-4 text-success me-2" />
                    <span className="text-light opacity-80 small">Construction</span>
                  </div>
                </div>
                <div className="col-6 mb-3">
                  <div className="d-flex align-items-center">
                    <CheckCircle className="w-4 h-4 text-success me-2" />
                    <span className="text-light opacity-80 small">Healthcare</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesPage;