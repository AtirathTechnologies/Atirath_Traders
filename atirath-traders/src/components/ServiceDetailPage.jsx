import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Globe, Truck, Package, Search, Users, Shield, Phone, Mail, Calendar } from 'lucide-react';

const ServiceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const services = {
    1: {
      id: 1,
      title: "Import & Export Services",
      description: "Complete international trade solutions including customs clearance, documentation, and regulatory compliance for seamless cross-border transactions.",
      longDescription: `Atirath Traders provides comprehensive import and export services designed to streamline your international trade operations. Our expertise spans across various industries and markets, ensuring your goods move efficiently across borders while complying with all regulatory requirements.

We handle the entire process from documentation to final delivery, providing you with a hassle-free trading experience. Our team stays updated with the latest trade regulations and tariff codes to ensure compliance and optimize costs.`,
      icon: <Globe className="w-12 h-12" />,
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      features: [
        "Customs Clearance & Documentation",
        "Export License Applications",
        "Import Duty & Tax Optimization",
        "Trade Compliance Management",
        "Shipping & Freight Coordination",
        "Risk Assessment & Mitigation"
      ],
      benefits: [
        "Reduced customs clearance time by 40%",
        "Compliance with 150+ countries' regulations",
        "24/7 shipment tracking",
        "Dedicated trade specialist"
      ],
      process: [
        "Documentation Review & Preparation",
        "Customs Clearance Filing",
        "Shipping & Logistics Coordination",
        "Final Delivery & Documentation"
      ],
      category: "International Trade"
    },
    2: {
      id: 2,
      title: "Logistics & Transportation",
      description: "End-to-end logistics management with multi-modal transport solutions ensuring timely and secure delivery across global supply chains.",
      longDescription: `Our logistics and transportation services provide seamless movement of goods across multiple modes of transport including sea, air, rail, and road. We optimize routes and consolidate shipments to reduce costs while maintaining delivery schedules.

With real-time tracking and proactive communication, we ensure complete visibility throughout the supply chain. Our network of trusted carriers and partners guarantees reliable and efficient transportation solutions.`,
      icon: <Truck className="w-12 h-12" />,
      image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      features: [
        "Multi-modal Transport Solutions",
        "Warehousing & Distribution",
        "Real-time Shipment Tracking",
        "Supply Chain Optimization",
        "Inventory Management",
        "Last-mile Delivery Solutions"
      ],
      benefits: [
        "99.7% on-time delivery rate",
        "Real-time tracking updates",
        "Reduced transportation costs",
        "Flexible storage solutions"
      ],
      process: [
        "Route Optimization & Planning",
        "Carrier Selection & Booking",
        "Warehousing & Inventory Management",
        "Final Mile Delivery"
      ],
      category: "Supply Chain"
    },
    3: {
      id: 3,
      title: "Product Sourcing",
      description: "Strategic sourcing solutions connecting businesses with verified suppliers worldwide for quality products at competitive prices.",
      longDescription: `Atirath Traders connects you with pre-vetted suppliers across global markets, ensuring quality products at competitive prices. Our sourcing experts conduct thorough supplier audits, quality checks, and negotiate favorable terms on your behalf.

We specialize in identifying reliable manufacturing partners and managing the entire procurement process, from initial supplier identification to final product delivery.`,
      icon: <Search className="w-12 h-12" />,
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      features: [
        "Supplier Verification & Audits",
        "Quality Assurance Programs",
        "Cost Optimization Strategies",
        "Market Intelligence & Analysis",
        "Sample Evaluation & Testing",
        "Contract Negotiation"
      ],
      benefits: [
        "Access to 5000+ verified suppliers",
        "Average 15-25% cost savings",
        "Quality assurance guarantee",
        "Market trend insights"
      ],
      process: [
        "Supplier Identification & Screening",
        "Sample Evaluation & Testing",
        "Contract Negotiation & Finalization",
        "Quality Control & Delivery"
      ],
      category: "Procurement"
    },
    4: {
      id: 4,
      title: "Quality Assurance",
      description: "Comprehensive quality control and packaging solutions ensuring products meet international standards and reach customers in perfect condition.",
      longDescription: `Our quality assurance services ensure that every product meets international standards and your specific requirements. We implement rigorous quality control processes at every stage of production and before shipment.

From factory audits to final inspection, our quality experts work closely with manufacturers to maintain consistent quality standards and protect your brand reputation.`,
      icon: <Package className="w-12 h-12" />,
      image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      features: [
        "Factory Audits & Certification",
        "Production Monitoring",
        "Final Random Inspection",
        "Laboratory Testing",
        "Packaging Quality Control",
        "Compliance Certification"
      ],
      benefits: [
        "99.5% quality acceptance rate",
        "ISO 9001 certified processes",
        "Reduced returns and complaints",
        "Brand protection assurance"
      ],
      process: [
        "Pre-production Quality Planning",
        "During Production Monitoring",
        "Pre-shipment Inspection",
        "Final Quality Certification"
      ],
      category: "Quality Management"
    },
    5: {
      id: 5,
      title: "Trade Consultation",
      description: "Expert advisory services for market expansion, regulatory compliance, and strategic planning in international trade operations.",
      longDescription: `Our trade consultation services provide expert guidance on market entry strategies, regulatory compliance, and international business expansion. We help you navigate complex trade regulations and develop effective global business strategies.

With deep industry knowledge and market insights, we provide actionable recommendations to optimize your international trade operations and maximize profitability.`,
      icon: <Users className="w-12 h-12" />,
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      features: [
        "Market Analysis & Research",
        "Regulatory Compliance Guidance",
        "Risk Assessment & Management",
        "Strategic Business Planning",
        "Trade Agreement Optimization",
        "Competitive Intelligence"
      ],
      benefits: [
        "Customized market entry strategies",
        "Compliance with local regulations",
        "Risk mitigation plans",
        "Competitive market analysis"
      ],
      process: [
        "Market Research & Analysis",
        "Strategy Development",
        "Implementation Planning",
        "Performance Monitoring"
      ],
      category: "Business Advisory"
    },
    6: {
      id: 6,
      title: "Supply Chain Management",
      description: "Integrated supply chain solutions optimizing operations from sourcing to delivery for enhanced efficiency and cost-effectiveness.",
      longDescription: `We provide end-to-end supply chain management solutions that optimize your entire operation from raw material sourcing to final product delivery. Our integrated approach ensures seamless coordination across all supply chain components.

Using advanced analytics and industry best practices, we identify bottlenecks, reduce costs, and improve overall supply chain performance while maintaining flexibility to adapt to market changes.`,
      icon: <Shield className="w-12 h-12" />,
      image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      features: [
        "End-to-End Supply Chain Management",
        "Inventory Optimization",
        "Cost Reduction Strategies",
        "Performance Analytics & Reporting",
        "Supplier Relationship Management",
        "Demand Forecasting"
      ],
      benefits: [
        "20-30% supply chain cost reduction",
        "Improved inventory turnover",
        "Enhanced supplier performance",
        "Real-time performance metrics"
      ],
      process: [
        "Supply Chain Assessment",
        "Strategy Development & Implementation",
        "Performance Monitoring",
        "Continuous Improvement"
      ],
      category: "Operations"
    }
  };

  const service = services[id];

  if (!service) {
    return (
      <section className="py-5" style={{ marginTop: '100px', minHeight: '100vh' }}>
        <div className="container text-center">
          <h1 className="text-white">Service Not Found</h1>
          <button onClick={() => navigate('/services')} className="btn btn-primary mt-3">
            Back to Services
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="py-5" style={{ marginTop: '100px', minHeight: '100vh' }}>
      <div className="container">
        {/* Back Button */}
        <div className="mb-4">
          <button 
            onClick={() => navigate('/services')}
            className="btn btn-outline-primary d-flex align-items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Services
          </button>
        </div>

        {/* Hero Section */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card blog-card overflow-hidden">
              <div className="row g-0">
                <div className="col-lg-6">
                  <img 
                    src={service.image} 
                    alt={service.title}
                    className="w-100 h-100 object-fit-cover"
                    style={{ minHeight: '400px' }}
                  />
                </div>
                <div className="col-lg-6">
                  <div className="p-4">
                    <div className="d-flex align-items-center mb-3">
                      <div className="bg-primary rounded-circle p-3 d-flex align-items-center justify-content-center me-3">
                        <div className="text-white">
                          {service.icon}
                        </div>
                      </div>
                      <div>
                        <span className="badge bg-primary">{service.category}</span>
                      </div>
                    </div>
                    
                    <h1 className="text-white mb-3">{service.title}</h1>
                    <p className="text-light opacity-80 lead mb-0">
                      {service.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Service Overview Section */}
        <div className="row mb-3">
          <div className="col-12">
            <div className="card blog-card p-4">
              <h3 className="text-white mb-3">Service Overview</h3>
              <p className="text-light opacity-80 mb-0" style={{ lineHeight: '1.8', textAlign: 'justify' }}>
                {service.longDescription}
              </p>
            </div>
          </div>
        </div>

        {/* Key Benefits Section */}
        <div className="row mb-3">
          <div className="col-12">
            <div className="card blog-card p-4">
              <h3 className="text-white mb-3">Key Benefits</h3>
              <div className="row">
                {service.benefits.map((benefit, index) => (
                  <div key={index} className="col-md-6 mb-2">
                    <div className="d-flex align-items-center">
                      <div className="bg-success rounded-circle p-1 d-flex align-items-center justify-content-center me-3 flex-shrink-0">
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-light opacity-80">{benefit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Explore Other Services Section */}
        <div className="row mb-3">
          <div className="col-12">
            <div className="card blog-card p-4">
              <h3 className="text-white mb-3">Explore Other Services</h3>
              <div className="row">
                {Object.values(services)
                  .filter(s => s.id !== service.id)
                  .slice(0, 3)
                  .map(relatedService => (
                    <div key={relatedService.id} className="col-lg-4 col-md-6 mb-3">
                      <div 
                        className="card blog-card h-100 p-3 text-center"
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/service-detail/${relatedService.id}`)}
                      >
                        <div className="bg-primary rounded-circle p-3 d-inline-flex align-items-center justify-content-center mb-2">
                          <div className="text-white">
                            {React.cloneElement(relatedService.icon, { className: 'w-6 h-6' })}
                          </div>
                        </div>
                        <h6 className="text-white mb-2">{relatedService.title}</h6>
                        <p className="text-light opacity-80 small mb-0">
                          {relatedService.description}
                        </p>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        </div>

        {/* Our Process Section */}
        <div className="row">
          <div className="col-12">
            <div className="card blog-card p-4">
              <h3 className="text-white mb-3">Our Process</h3>
              <div className="row">
                {service.process.map((step, index) => (
                  <div key={index} className="col-lg-6 mb-2">
                    <div className="d-flex align-items-start">
                      <div className="bg-primary rounded-circle p-2 d-flex align-items-center justify-content-center me-3 flex-shrink-0" style={{ width: '35px', height: '35px' }}>
                        <span className="text-white fw-bold">{index + 1}</span>
                      </div>
                      <div>
                        <h6 className="text-white mb-1">{step}</h6>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServiceDetailPage;