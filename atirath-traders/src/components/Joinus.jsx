import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Target, Heart, Award, Mail, Phone, MapPin } from 'lucide-react';

const JoinUs = () => {
  const navigate = useNavigate();
  
  // ✅ WhatsApp number from environment variable
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER;

  const benefits = [
    {
      icon: <Target className="w-8 h-8" />,
      title: "Career Growth",
      description: "Opportunities for professional development and career advancement in the agriculture sector."
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Competitive Packages",
      description: "Attractive compensation with performance-based incentives and benefits."
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Work-Life Balance",
      description: "Flexible working hours and supportive work environment."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Team Culture",
      description: "Collaborative environment with experienced professionals in agriculture."
    }
  ];

  const openPositions = [
    {
      title: "Agricultural Sales Executive",
      department: "Sales & Marketing",
      location: "Multiple Locations",
      type: "Full-time"
    },
    {
      title: "Farm Relationship Manager",
      department: "Customer Relations",
      location: "Rural Areas",
      type: "Full-time"
    },
    {
      title: "Agri Product Specialist",
      department: "Technical Support",
      location: "Field & Office",
      type: "Full-time"
    },
    {
      title: "Digital Marketing Executive",
      department: "Marketing",
      location: "Head Office",
      type: "Full-time"
    }
  ];

  const handleApplyClick = (positionTitle) => {
    
    const currentDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const message = `*Job Application Inquiry* 📝%0A%0A*Date:* ${currentDate}%0A*Position Interested In:* ${positionTitle}%0A%0AHello Atirath Traders Team,%0A%0AI am interested in applying for the ${positionTitle} position.%0A%0APlease provide me with the application process details.%0A%0A_Contact me for further discussion._`;
    
    // ✅ Using environment variable for WhatsApp number
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${message}`;
    
    window.open(whatsappURL, '_blank');
  };

  return (
    <section className="py-5" style={{ marginTop: '100px', minHeight: '100vh' }}>
      <div className="container">
        {/* Back Button */}
        <div className="mb-4">
          <button 
            onClick={() => navigate(-1)}
            className="btn btn-outline-primary d-flex align-items-center gap-2"
            style={{
              background: 'rgba(143, 179, 226, 0.1)',
              borderColor: '#8FB3E2',
              color: '#8FB3E2'
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        {/* Header Section */}
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold text-white mb-3">Join Our Team</h1>
          <p className="lead text-light opacity-80 mb-4">
            Build Your Career in Agriculture with Atirath Traders
          </p>
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <p className="text-light opacity-80">
                At Atirath Traders, we're not just building a company - we're building a community of passionate 
                individuals dedicated to transforming Indian agriculture. Join us in our mission to empower farmers 
                and revolutionize the agricultural sector.
              </p>
            </div>
          </div>
        </div>

        {/* Why Join Us Section */}
        <div className="row mb-5">
          <div className="col-12">
            <h2 className="text-center text-white mb-4">Why Join Atirath Traders?</h2>
            <div className="row g-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="col-lg-3 col-md-6">
                  <div className="card h-100 blog-card text-center p-4">
                    <div className="text-primary mb-3" style={{ color: '#8FB3E2' }}>
                      {benefit.icon}
                    </div>
                    <h5 className="text-white mb-3">{benefit.title}</h5>
                    <p className="text-light opacity-80">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Open Positions */}
        <div className="row mb-5">
          <div className="col-12">
            <h2 className="text-center text-white mb-4">Current Openings</h2>
            <div className="row g-4">
              {openPositions.map((position, index) => (
                <div key={index} className="col-lg-6">
                  <div className="card blog-card p-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <h5 className="text-white mb-0">{position.title}</h5>
                      <span className="badge bg-primary">{position.type}</span>
                    </div>
                    <div className="text-light opacity-80 mb-3">
                      <strong>Department:</strong> {position.department}
                    </div>
                    <div className="text-light opacity-80 mb-3">
                      <strong>Location:</strong> {position.location}
                    </div>
                    {/* Apply Now Button - Direct WhatsApp Link */}
                    <button 
                      className="apply-now-button-fixed"
                      onClick={() => handleApplyClick(position.title)}
                    >
                      <i className="fab fa-whatsapp me-2"></i>
                      Apply via WhatsApp
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* How to Apply */}
        <div className="row">
          <div className="col-lg-8 mx-auto">
            <div className="card blog-card p-5 text-center">
              <h3 className="text-white mb-4">How to Apply</h3>
              <div className="row g-4">
                {/* Email */}
                <div className="col-md-4">
                  <div className="text-primary mb-2">
                    <Mail className="w-6 h-6 mx-auto" />
                  </div>
                  <h6 className="text-white">Email Your Resume</h6>
                  <p className="text-light opacity-80 small">
                    Send your resume to info@atirathtradersltd.com
                  </p>
                </div>
                
                {/* ✅ Phone - Using environment variable */}
                <div className="col-md-4">
                  <div className="text-primary mb-2">
                    <Phone className="w-6 h-6 mx-auto" />
                  </div>
                  <h6 className="text-white">Call Us</h6>
                  <p className="text-light opacity-80 small">
                    <a href={`tel:${whatsappNumber}`} 
                       style={{ color: 'inherit', textDecoration: 'none' }}>
                      {whatsappNumber}
                    </a>
                    <br />
                    Mon-Fri, 9AM-6PM
                  </p>
                </div>
                
                {/* ✅ WhatsApp - Using environment variable */}
                <div className="col-md-4">
                  <div className="text-primary mb-2">
                    <i className="fab fa-whatsapp" style={{ fontSize: '24px', color: '#25D366' }}></i>
                  </div>
                  <h6 className="text-white">WhatsApp</h6>
                  <p className="text-light opacity-80 small">
                    <a href={`https://wa.me/${whatsappNumber}`} 
                       style={{ color: 'inherit', textDecoration: 'none' }}
                       target="_blank" 
                       rel="noopener noreferrer">
                      {whatsappNumber}
                    </a>
                    <br />
                    24/7 Available
                  </p>
                </div>
              </div>
              
              <div className="mt-4 p-4 rounded" style={{ background: 'rgba(143, 179, 226, 0.1)' }}>
                <h5 className="text-white mb-3">What We Look For</h5>
                <p className="text-light opacity-80 mb-0">
                  We value passion for agriculture, innovative thinking, teamwork, and commitment to making a difference 
                  in farmers' lives. If you share our vision for sustainable agriculture, we'd love to hear from you.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inline Styles */}
      <style jsx>{`
        /* Apply Now Button */
        .apply-now-button-fixed {
          background: linear-gradient(135deg, #25D366, #128C7E) !important;
          border: none !important;
          color: white !important;
          font-weight: 600 !important;
          padding: 0.75rem 1.5rem !important;
          border-radius: 0.75rem !important;
          cursor: pointer !important;
          width: 100% !important;
          transition: all 0.3s ease !important;
          display: block !important;
          margin-top: 1rem !important;
          position: relative !important;
          z-index: 10 !important;
          text-decoration: none !important;
          text-align: center !important;
          box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3) !important;
          min-height: auto !important;
          min-width: auto !important;
        }
        
        .apply-now-button-fixed:hover {
          background: linear-gradient(135deg, #20bd5a, #0e7a5f) !important;
          transform: translateY(-2px) !important;
          box-shadow: 0 6px 20px rgba(37, 211, 102, 0.4) !important;
        }
        
        .apply-now-button-fixed:active {
          transform: translateY(0) !important;
        }
        
        /* Blog Card Styles */
        .blog-card {
          background: rgba(25, 35, 56, 0.8);
          border: 1px solid rgba(143, 179, 226, 0.2);
          border-radius: 1rem;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }
        
        .blog-card:hover {
          border-color: rgba(143, 179, 226, 0.4);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }
        
        /* Responsive styles */
        @media (max-width: 768px) {
          .apply-now-button-fixed {
            padding: 0.65rem 1.25rem !important;
            font-size: 0.95rem !important;
          }
        }
        
        @media (max-width: 480px) {
          .apply-now-button-fixed {
            padding: 0.6rem 1rem !important;
            font-size: 0.9rem !important;
          }
        }
      `}</style>
      
      {/* Add Font Awesome for icons */}
      <link 
        rel="stylesheet" 
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" 
      />
    </section>
  );
};

export default JoinUs;