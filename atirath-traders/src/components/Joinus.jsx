import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Target, Heart, Award, Mail, Phone, MapPin } from 'lucide-react';
import '../styles/home.css'; // Import external CSS

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
    
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${message}`;
    window.open(whatsappURL, '_blank');
  };

  return (
    <section className="join-us-section py-5">
      <div className="container">
        {/* Back Button */}
        <div className="mb-4">
          <button 
            onClick={() => navigate(-1)}
            className="btn btn-outline-primary join-us-back-btn d-flex align-items-center gap-2"
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
                  <div className="card blog-card h-100 text-center p-4">
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
                    <button 
                      className="apply-now-button"
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
                
                {/* Phone */}
                <div className="col-md-4">
                  <div className="text-primary mb-2">
                    <Phone className="w-6 h-6 mx-auto" />
                  </div>
                  <h6 className="text-white">Call Us</h6>
                  <p className="text-light opacity-80 small">
                    <a href={`tel:${whatsappNumber}`} className="contact-link">
                      {whatsappNumber}
                    </a>
                    <br />
                    Mon-Fri, 9AM-6PM
                  </p>
                </div>
                
                {/* WhatsApp */}
                <div className="col-md-4">
                  <div className="text-primary mb-2">
                    <i className="fab fa-whatsapp" style={{ fontSize: '24px', color: '#25D366' }}></i>
                  </div>
                  <h6 className="text-white">WhatsApp</h6>
                  <p className="text-light opacity-80 small">
                    <a href={`https://wa.me/${whatsappNumber}`} className="contact-link" target="_blank" rel="noopener noreferrer">
                      {whatsappNumber}
                    </a>
                    <br />
                    24/7 Available
                  </p>
                </div>
              </div>
              
              <div className="mt-4 p-4 join-us-highlight">
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

      {/* Font Awesome Icons (still needed) */}
      <link 
        rel="stylesheet" 
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" 
      />
    </section>
  );
};

export default JoinUs;