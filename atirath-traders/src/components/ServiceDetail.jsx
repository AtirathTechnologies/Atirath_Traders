import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Globe, Truck, Package, Search, Users, Shield, Phone, Mail, Calendar, Target, Zap, TrendingUp } from 'lucide-react';

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const services = [
    {
      id: 1,
      title: "Import & Export Services",
      description: "Complete international trade solutions including customs clearance, documentation, and regulatory compliance for seamless cross-border transactions.",
      icon: <Globe className="w-8 h-8" />,
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
      features: ["Customs Clearance", "Trade Documentation", "Regulatory Compliance", "Global Logistics"],
      category: "International Trade",
      detailedContent: {
        overview: "Our comprehensive import and export services streamline international trade operations, ensuring compliance with global regulations while optimizing efficiency and reducing operational costs. We handle the entire trade process from documentation to final delivery.",
        services: [
          "Customs clearance and documentation management",
          "Export licensing and regulatory compliance",
          "Import duty optimization and tax consultation",
          "Product classification and HS code management",
          "Letter of credit and trade finance facilitation",
          "Insurance and risk management solutions",
          "Certificate of origin processing",
          "Export control compliance and documentation"
        ],
        benefits: [
          "40% reduction in customs clearance time",
          "Complete regulatory compliance assurance",
          "Cost optimization through duty planning",
          "Expert guidance on international trade laws",
          "Streamlined documentation processes",
          "Risk mitigation through proper compliance"
        ],
        industries: ["Agriculture & Food", "Manufacturing", "Retail", "Consumer Goods", "Textiles", "Automotive", "Electronics"],
        process: [
          "Initial consultation and requirement analysis",
          "Documentation preparation and verification",
          "Customs clearance and regulatory compliance",
          "Shipping coordination and logistics management",
          "Delivery tracking and post-shipment support"
        ],
        stats: [
          { icon: <Target className="w-5 h-5" />, value: "98%", label: "Success Rate" },
          { icon: <Zap className="w-5 h-5" />, value: "24-48", label: "Hours Clearance" },
          { icon: <TrendingUp className="w-5 h-5" />, value: "40%", label: "Cost Savings" }
        ]
      }
    },
    {
      id: 2,
      title: "Logistics & Transportation",
      description: "End-to-end logistics management with multi-modal transport solutions ensuring timely and secure delivery across global supply chains.",
      icon: <Truck className="w-8 h-8" />,
      image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
      features: ["Multi-modal Transport", "Warehousing", "Real-time Tracking", "Supply Chain Optimization"],
      category: "Supply Chain",
      detailedContent: {
        overview: "Our integrated logistics solutions provide complete visibility and control over your supply chain. We optimize transportation routes, manage warehousing, and ensure timely delivery through our global network of trusted partners.",
        services: [
          "Air, sea, and road freight management",
          "Warehousing and distribution center operations",
          "Inventory management and optimization",
          "Last-mile delivery solutions",
          "Cold chain logistics for perishables",
          "Hazardous material handling",
          "Cross-docking and consolidation services",
          "Freight forwarding and customs brokerage"
        ],
        benefits: [
          "Real-time shipment tracking and visibility",
          "Optimized routing for 25% cost reduction",
          "Dedicated account management support",
          "Flexible scheduling and capacity planning",
          "Comprehensive insurance coverage",
          "Reduced transit times through route optimization"
        ],
        industries: ["E-commerce", "Manufacturing", "Pharmaceuticals", "Automotive", "Retail", "Food & Beverage", "Consumer Goods"],
        process: [
          "Route optimization and carrier selection",
          "Pickup coordination and cargo consolidation",
          "Transportation with real-time monitoring",
          "Customs clearance for international shipments",
          "Final delivery with proof of delivery"
        ],
        stats: [
          { icon: <Target className="w-5 h-5" />, value: "99.5%", label: "On-time Delivery" },
          { icon: <Zap className="w-5 h-5" />, value: "50+", label: "Countries Served" },
          { icon: <TrendingUp className="w-5 h-5" />, value: "25%", label: "Cost Reduction" }
        ]
      }
    },
    {
      id: 3,
      title: "Product Sourcing",
      description: "Strategic sourcing solutions connecting businesses with verified suppliers worldwide for quality products at competitive prices.",
      icon: <Search className="w-8 h-8" />,
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
      features: ["Supplier Verification", "Quality Assurance", "Cost Optimization", "Market Intelligence"],
      category: "Procurement",
      detailedContent: {
        overview: "Our strategic sourcing services connect you with pre-vetted global suppliers, ensuring quality products at competitive prices. We conduct rigorous supplier assessments and provide market intelligence for informed procurement decisions.",
        services: [
          "Supplier identification and comprehensive vetting",
          "Quality assurance audits and factory inspections",
          "Price negotiation and contract management",
          "Sample evaluation and product testing",
          "Supply chain optimization and risk assessment",
          "Market intelligence and trend analysis",
          "Supplier relationship management",
          "Risk assessment and mitigation strategies"
        ],
        benefits: [
          "Access to verified and reliable supplier network",
          "15-30% cost savings through strategic negotiation",
          "Quality control at source with regular audits",
          "60% reduction in sourcing cycle time",
          "Market competitive intelligence for better decisions",
          "Risk mitigation through diversified supplier base"
        ],
        industries: ["Agriculture", "Textiles", "Electronics", "Construction", "Consumer Goods", "Automotive", "Healthcare"],
        process: [
          "Requirement analysis and supplier identification",
          "Supplier vetting and quality assessment",
          "Price negotiation and sample evaluation",
          "Contract finalization and quality assurance",
          "Ongoing supplier performance monitoring"
        ],
        stats: [
          { icon: <Target className="w-5 h-5" />, value: "500+", label: "Verified Suppliers" },
          { icon: <Zap className="w-5 h-5" />, value: "30%", label: "Cost Savings" },
          { icon: <TrendingUp className="w-5 h-5" />, value: "60%", label: "Faster Sourcing" }
        ]
      }
    },
    {
      id: 4,
      title: "Quality Assurance",
      description: "Comprehensive quality control and packaging solutions ensuring products meet international standards and reach customers in perfect condition.",
      icon: <Package className="w-8 h-8" />,
      image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
      features: ["Quality Control", "Packaging Solutions", "Compliance Testing", "Brand Protection"],
      category: "Quality Management",
      detailedContent: {
        overview: "Our quality assurance services protect your brand reputation by ensuring products meet international standards. We implement rigorous testing protocols and sustainable packaging solutions that enhance product appeal while ensuring safety.",
        services: [
          "Custom packaging design and material selection",
          "Multi-stage quality control inspections",
          "Compliance testing and certification services",
          "Sustainable and eco-friendly packaging solutions",
          "Labeling and branding consistency management",
          "Product testing and validation protocols",
          "Shelf-life testing and optimization",
          "Regulatory compliance verification across markets"
        ],
        benefits: [
          "99.8% reduction in product damage during transit",
          "Enhanced brand recognition through consistent packaging",
          "Full regulatory compliance across target markets",
          "85% reduction in returns due to quality issues",
          "Brand consistency across global markets",
          "Sustainable packaging options reducing environmental impact"
        ],
        industries: ["Food & Beverage", "Pharmaceuticals", "Electronics", "Cosmetics", "Consumer Products", "Luxury Goods", "Healthcare"],
        process: [
          "Packaging requirement analysis and design",
          "Material selection and prototype development",
          "Quality testing and compliance verification",
          "Production monitoring and quality control",
          "Final inspection and certification"
        ],
        stats: [
          { icon: <Target className="w-5 h-5" />, value: "99.8%", label: "Quality Rate" },
          { icon: <Zap className="w-5 h-5" />, value: "85%", label: "Returns Reduction" },
          { icon: <TrendingUp className="w-5 h-5" />, value: "50+", label: "Markets Served" }
        ]
      }
    },
    {
      id: 5,
      title: "Trade Consultation",
      description: "Expert advisory services for market expansion, regulatory compliance, and strategic planning in international trade operations.",
      icon: <Users className="w-8 h-8" />,
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
      features: ["Market Analysis", "Regulatory Guidance", "Risk Assessment", "Strategic Planning"],
      category: "Business Advisory",
      detailedContent: {
        overview: "Our trade consultation services provide strategic insights and practical solutions for successful global market expansion. We combine market intelligence with regulatory expertise to guide your international growth strategy.",
        services: [
          "Market entry strategy development and planning",
          "Regulatory compliance advisory and guidance",
          "Trade agreement optimization and utilization",
          "Risk assessment and mitigation strategies",
          "Competitive analysis and market positioning",
          "Export-import documentation and process guidance",
          "Cultural and business practice consulting",
          "International partnership development and management"
        ],
        benefits: [
          "Data-driven decision making for market entry",
          "95% reduction in compliance-related risks",
          "Optimized trade strategies maximizing ROI",
          "Access to untapped market opportunities",
          "Expert guidance throughout expansion process",
          "Cultural intelligence for better market adaptation"
        ],
        industries: ["All Industries", "Startups", "SMEs", "Large Enterprises", "Manufacturing", "Technology", "Services", "Retail"],
        process: [
          "Initial assessment and objective setting",
          "Market research and opportunity analysis",
          "Strategy development and implementation planning",
          "Execution support and operational guidance",
          "Performance monitoring and strategy optimization"
        ],
        stats: [
          { icon: <Target className="w-5 h-5" />, value: "95%", label: "Risk Reduction" },
          { icon: <Zap className="w-5 h-5" />, value: "50+", label: "Markets Analyzed" },
          { icon: <TrendingUp className="w-5 h-5" />, value: "200+", label: "Clients Served" }
        ]
      }
    },
    {
      id: 6,
      title: "Supply Chain Management",
      description: "Integrated supply chain solutions optimizing operations from sourcing to delivery for enhanced efficiency and cost-effectiveness.",
      icon: <Shield className="w-8 h-8" />,
      image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
      features: ["End-to-End Management", "Inventory Optimization", "Cost Reduction", "Performance Analytics"],
      category: "Operations",
      detailedContent: {
        overview: "Our comprehensive supply chain management solutions transform complex logistics into competitive advantages. We optimize every aspect of your supply chain, from raw material sourcing to final customer delivery, ensuring maximum efficiency and cost-effectiveness.",
        services: [
          "Supply chain design and network optimization",
          "Inventory management system implementation",
          "Demand forecasting and planning accuracy",
          "Supplier relationship and performance management",
          "Logistics network design and optimization",
          "Performance monitoring and analytics dashboard",
          "Risk management and contingency planning",
          "Sustainability and green supply chain initiatives"
        ],
        benefits: [
          "20-35% reduction in overall operational costs",
          "40% improvement in inventory turnover rates",
          "98% customer satisfaction through reliable delivery",
          "Comprehensive risk management with backup plans",
          "Complete supply chain visibility and control",
          "Sustainable operations reducing environmental impact"
        ],
        industries: ["Manufacturing", "Retail", "Healthcare", "Automotive", "Technology", "Consumer Goods", "Logistics", "E-commerce"],
        process: [
          "Current state analysis and performance assessment",
          "Supply chain design and strategy development",
          "System implementation and process optimization",
          "Performance monitoring and continuous improvement",
          "Regular review and strategic refinement"
        ],
        stats: [
          { icon: <Target className="w-5 h-5" />, value: "35%", label: "Cost Reduction" },
          { icon: <Zap className="w-5 h-5" />, value: "40%", label: "Efficiency Gain" },
          { icon: <TrendingUp className="w-5 h-5" />, value: "98%", label: "Customer Satisfaction" }
        ]
      }
    }
  ];

  const service = services.find(s => s.id === parseInt(id));

  if (!service) {
    return (
      <div className="container text-center py-5" style={{ marginTop: '100px', minHeight: '100vh' }}>
        <h1 className="text-white">Service Not Found</h1>
        <p className="text-light">The service you're looking for doesn't exist.</p>
        <button 
          onClick={() => navigate('/services')}
          className="btn btn-primary mt-3"
        >
          Back to Services
        </button>
      </div>
    );
  }

  const handleContactClick = () => {
    navigate('/contact');
  };

  const handleScheduleConsultation = () => {
    alert('Consultation scheduling feature coming soon!');
  };

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

        {/* Service Header */}
        <div className="row mb-5">
          <div className="col-lg-8">
            <div className="d-flex align-items-center mb-3">
              <div className="bg-primary rounded-circle p-2 d-flex align-items-center justify-content-center me-3" style={{ width: '60px', height: '60px' }}>
                <div className="text-white">
                  {service.icon}
                </div>
              </div>
              <div>
                <span className="badge bg-primary fs-6 mb-2">{service.category}</span>
                <h1 className="display-5 fw-bold text-white">{service.title}</h1>
              </div>
            </div>
            <p className="lead text-light opacity-80">
              {service.description}
            </p>
          </div>
        </div>

        {/* Performance Stats */}
        {service.detailedContent.stats && (
          <div className="row mb-5">
            <div className="col-12">
              <div className="card blog-card p-4">
                <div className="row text-center">
                  {service.detailedContent.stats.map((stat, index) => (
                    <div key={index} className="col-md-4 mb-3">
                      <div className="d-flex flex-column align-items-center">
                        <div className="text-primary mb-2">
                          {stat.icon}
                        </div>
                        <h3 className="text-white fw-bold mb-1">{stat.value}</h3>
                        <p className="text-light opacity-80 small mb-0">{stat.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="row">
          {/* Left Column - Content */}
          <div className="col-lg-8">
            {/* Overview Section */}
            <div className="card blog-card p-4 mb-4">
              <h3 className="text-white mb-3">Service Overview</h3>
              <p className="text-light opacity-80 mb-0">
                {service.detailedContent.overview}
              </p>
            </div>

            {/* Services Offered */}
            <div className="card blog-card p-4 mb-4">
              <h3 className="text-white mb-3">Our Service Portfolio</h3>
              <div className="row">
                {service.detailedContent.services.map((item, index) => (
                  <div key={index} className="col-lg-6 mb-3">
                    <div className="d-flex align-items-start">
                      <CheckCircle className="w-4 h-4 text-success mt-1 me-2 flex-shrink-0" />
                      <span className="text-light opacity-80">{item}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Benefits */}
            <div className="card blog-card p-4 mb-4">
              <h3 className="text-white mb-3">Client Benefits</h3>
              <div className="row">
                {service.detailedContent.benefits.map((benefit, index) => (
                  <div key={index} className="col-lg-6 mb-3">
                    <div className="d-flex align-items-start">
                      <div className="bg-primary rounded-circle p-1 d-flex align-items-center justify-content-center me-3 mt-1" style={{ width: '24px', height: '24px', flexShrink: 0 }}>
                        <span className="text-white fw-bold small">{index + 1}</span>
                      </div>
                      <span className="text-light opacity-80">{benefit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Process */}
            <div className="card blog-card p-4 mb-4">
              <h3 className="text-white mb-3">Our Process</h3>
              <div className="row">
                {service.detailedContent.process.map((step, index) => (
                  <div key={index} className="col-12 mb-3">
                    <div className="d-flex align-items-start">
                      <div className="bg-primary rounded-circle p-2 d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px', flexShrink: 0 }}>
                        <span className="text-white fw-bold">{index + 1}</span>
                      </div>
                      <div>
                        <h6 className="text-white mb-1">Step {index + 1}: {step.split(':')[0]}</h6>
                        <p className="text-light opacity-80 mb-0">{step.split(':')[1] || step}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="col-lg-4">
            {/* Service Image */}
            <div className="card blog-card p-3 mb-4">
              <img 
                src={service.image} 
                alt={service.title}
                className="w-100 rounded"
                style={{ height: '250px', objectFit: 'cover' }}
              />
            </div>

            {/* Key Features */}
            <div className="card blog-card p-4 mb-4">
              <h4 className="text-white mb-3">Core Features</h4>
              <div className="space-y-2">
                {service.features.map((feature, index) => (
                  <div key={index} className="d-flex align-items-center mb-2">
                    <CheckCircle className="w-4 h-4 text-success me-2" />
                    <span className="text-light opacity-80 small">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Industries Served */}
            <div className="card blog-card p-4 mb-4">
              <h4 className="text-white mb-3">Industries Served</h4>
              <div className="row">
                {service.detailedContent.industries.map((industry, index) => (
                  <div key={index} className="col-6 mb-2">
                    <div className="d-flex align-items-center">
                      <div className="bg-primary rounded-circle p-1 me-2" style={{ width: '6px', height: '6px' }}></div>
                      <span className="text-light opacity-80 small">{industry}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Call to Action */}
            <div className="card blog-card p-4 text-center">
              <h5 className="text-white mb-3">Start Your Project</h5>
              <p className="text-light opacity-80 small mb-3">
                Ready to leverage our expertise for your business success?
              </p>
              <button 
                className="btn btn-primary w-100 mb-2 d-flex align-items-center justify-content-center gap-2"
                onClick={handleContactClick}
              >
                <Phone className="w-4 h-4" />
                Contact Our Team
              </button>
              <button 
                className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center gap-2"
                onClick={handleScheduleConsultation}
              >
                <Calendar className="w-4 h-4" />
                Schedule Consultation
              </button>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="row mt-5">
          <div className="col-12">
            <div className="card blog-card p-5 text-center">
              <h3 className="text-white mb-3">Transform Your Business Operations</h3>
              <p className="text-light opacity-80 mb-4 lead">
                Partner with Atirath Traders to optimize your {service.title.toLowerCase()} and drive sustainable growth.
              </p>
              <div className="d-flex gap-3 justify-content-center flex-wrap">
                <button 
                  className="btn btn-primary btn-lg d-flex align-items-center gap-2"
                  onClick={handleContactClick}
                >
                  <Mail className="w-5 h-5" />
                  Request Detailed Proposal
                </button>
                <button 
                  className="btn btn-success btn-lg d-flex align-items-center gap-2"
                  onClick={handleScheduleConsultation}
                >
                  <Calendar className="w-5 h-5" />
                  Book Strategy Session
                </button>
                <button className="btn btn-outline-primary btn-lg">
                  Download Service Overview
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServiceDetail;