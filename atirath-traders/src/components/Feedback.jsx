import React, { useState } from 'react';

const Feedback = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [showPopup, setShowPopup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ WhatsApp number from environment variable
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Prepare WhatsApp message
    const currentDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const message = `*New Feedback Submission* 📝%0A%0A*Date:* ${currentDate}%0A*Name:* ${formData.name}%0A*Email:* ${formData.email}%0A*Message:*%0A${formData.message}%0A%0A_Submitted via Atirath Traders Website_`;
    
    // Create WhatsApp URL
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${message}`;
    
    // Open WhatsApp in new tab
    window.open(whatsappURL, '_blank');
    
    // Simulate processing time
    setTimeout(() => {
      console.log('Feedback sent to WhatsApp:', formData);
      
      setIsSubmitting(false);
      setShowPopup(true);
      setFormData({ name: '', email: '', message: '' });
      
      setTimeout(() => setShowPopup(false), 3000);
    }, 1000);
  };

  return (
    <section id="feedback" className="py-5 px-3">
      <div className="container">
        {/* MAIN HEADING: Get in Touch */}
        <h2
          className="display-4 fw-bold accent text-center mb-5"
          data-aos="zoom-in"
          style={{ 
            marginTop: '80px',
            color: '#8FB3E2',
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
          }}
        >
          Get in Touch
        </h2>

        <div className="row g-5">
          {/* LEFT: Contact Us */}
          <div className="col-lg-6" data-aos="fade-up">
            <div className="contact-card p-4 h-100">
              <h3
                className="h4 fw-bold accent mb-4 text-center"
                data-aos="fade-up"
                data-aos-delay="100"
              >
                Contact Us
              </h3>

              <div className="d-flex align-items-center gap-3 mb-4">
                <div className="footer-logo-icon">
                  <img src="/img/icon2.png" alt="ATIRATH GROUP Logo" className="logo-img" />
                </div>
                <div>
                  <h4 className="h5 fw-bold accent mb-0">ATIRATH TRADERS INDIA PVT.LTD</h4>
                  <p className="small opacity-80 mb-0">Diverse Businesses, One Vision</p>
                </div>
              </div>

              <div className="contact-details">
                <div className="contact-item mb-3">
                  <div className="contact-label fw-semibold mb-1">Website:</div>
                  <a href="https://www.atirathtraders.com" 
                     className="contact-value text-decoration-none" 
                     target="_blank" 
                     rel="noopener noreferrer">
                    www.atirathtraders.com
                  </a>
                </div>
                
                <div className="contact-item mb-3">
                  <div className="contact-label fw-semibold mb-1">Email:</div>
                  <a href="mailto:info@atirathtradersltd.com" 
                     className="contact-value text-decoration-none">
                    info@atirathtradersltd.com
                  </a>
                </div>
                
                {/* ✅ Phone - Using environment variable */}
                <div className="contact-item mb-3">
                  <div className="contact-label fw-semibold mb-1">Phone:</div>
                  <a href={`tel:${whatsappNumber}`} 
                     className="contact-value text-decoration-none">
                    {whatsappNumber}
                  </a>
                </div>

                {/* ✅ WhatsApp - Using environment variable */}
                <div className="contact-item mb-3">
                  <div className="contact-label fw-semibold mb-1">WhatsApp:</div>
                  <a href={`https://wa.me/${whatsappNumber}`} 
                     className="contact-value text-decoration-none"
                     target="_blank" 
                     rel="noopener noreferrer">
                    {whatsappNumber}
                  </a>
                </div>
                
                <div className="contact-item mb-3">
                  <div className="contact-label fw-semibold mb-1">Social Media:</div>
                  <div className="contact-value">
                    @AtirathTraders (LinkedIn, Instagram, Facebook, Twitter)
                  </div>
                </div>
                
                <div className="contact-item">
                  <div className="contact-label fw-semibold mb-1">Address:</div>
                  <div className="contact-value">
                    Flat No:45, Jai Hind Silicon valley,<br />
                    Madhapur Hyderabad,<br />
                    Telangana, 500081
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Feedback Form */}
          <div className="col-lg-6" data-aos="fade-up" data-aos-delay="200">
            <div className="feedback-form-card p-4 h-100">
              <h3
                className="h4 fw-bold accent mb-4 text-center"
                data-aos="fade-up"
                data-aos-delay="300"
              >
                Feedback Form
              </h3>

              <form onSubmit={handleSubmit} id="feedbackForm">
                <div className="mb-4">
                  <label className="form-label fw-semibold mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-control feedback-input"
                    placeholder="Enter your full name"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                
                <div className="mb-4">
                  <label className="form-label fw-semibold mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-control feedback-input"
                    placeholder="Enter your email address"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                
                <div className="mb-4">
                  <label className="form-label fw-semibold mb-2">
                    Message
                  </label>
                  <textarea
                    rows="5"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className="form-control feedback-input"
                    placeholder="Share your thoughts, suggestions, or feedback..."
                    required
                    disabled={isSubmitting}
                  />
                </div>
                
                <div className="text-center mt-4">
                  <button
                    type="submit"
                    className="btn btn-primary btn-submit-feedback"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane me-2"></i>
                        Submit Feedback
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Success Popup - Using environment variable */}
      {showPopup && (
        <div className="feedback-popup-overlay">
          <div className="feedback-popup-content">
            <div className="popup-icon">
              <i className="fab fa-whatsapp"></i>
            </div>
            
            <h3 className="popup-title">Thank You!</h3>
            
            <p className="popup-message">
              Your feedback has been submitted successfully. Please check the WhatsApp window that opened and click "Send" to complete your submission.
            </p>
            
            <div className="popup-instructions mt-3">
              <p className="small mb-2"><strong>If WhatsApp didn't open:</strong></p>
              <a 
                href={`https://wa.me/${whatsappNumber}`}
                className="btn btn-whatsapp-direct"
                target="_blank" 
                rel="noopener noreferrer"
              >
                <i className="fab fa-whatsapp me-2"></i>
                Open WhatsApp Directly
              </a>
            </div>
            
            <button 
              className="btn btn-close-popup mt-3"
              onClick={() => setShowPopup(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Inline Styles */}
      <style jsx>{`
        #feedback {
          font-family: 'Poppins', sans-serif;
        }
        
        .contact-card {
          background: rgba(25, 35, 56, 0.8);
          border: 1px solid rgba(143, 179, 226, 0.2);
          border-radius: 1rem;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }
        
        .contact-card:hover {
          border-color: rgba(143, 179, 226, 0.4);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }
        
        .contact-details {
          margin-top: 1.5rem;
        }
        
        .contact-item {
          padding: 0.5rem 0;
        }
        
        .contact-label {
          color: #8FB3E2;
          font-size: 0.9rem;
          margin-bottom: 0.25rem;
        }
        
        .contact-value {
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.9rem;
          line-height: 1.5;
        }
        
        .contact-value a {
          color: rgba(255, 255, 255, 0.9);
          transition: color 0.3s ease;
        }
        
        .contact-value a:hover {
          color: #8FB3E2;
        }
        
        .feedback-form-card {
          background: rgba(25, 35, 56, 0.8);
          border: 1px solid rgba(143, 179, 226, 0.2);
          border-radius: 1rem;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }
        
        .feedback-form-card:hover {
          border-color: rgba(143, 179, 226, 0.4);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }
        
        .feedback-input {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          font-size: 1rem;
          transition: all 0.3s ease;
          width: 100%;
        }
        
        .feedback-input:focus {
          background: rgba(255, 255, 255, 0.15);
          border-color: #8FB3E2;
          box-shadow: 0 0 0 3px rgba(143, 179, 226, 0.2);
          outline: none;
        }
        
        .feedback-input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }
        
        .btn-submit-feedback {
          background: linear-gradient(135deg, #8FB3E2, #31487A);
          border: none;
          color: white;
          padding: 1rem 2.5rem;
          font-size: 1.1rem;
          font-weight: 600;
          border-radius: 0.75rem;
          transition: all 0.3s ease;
          min-width: 200px;
          min-height: 50px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        
        .btn-submit-feedback:hover:not(:disabled) {
          background: linear-gradient(135deg, #7fa1d6, #2a3e6b);
          transform: translateY(-3px);
          box-shadow: 0 10px 20px rgba(143, 179, 226, 0.4);
        }
        
        .btn-submit-feedback:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .feedback-note {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.9rem;
          margin-top: 1rem;
        }
        
        .feedback-popup-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          backdrop-filter: blur(5px);
        }
        
        .feedback-popup-content {
          background: rgba(25, 35, 56, 0.95);
          border: 2px solid rgba(143, 179, 226, 0.3);
          border-radius: 1.5rem;
          padding: 2.5rem;
          text-align: center;
          max-width: 500px;
          width: 90%;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
          animation: slideUpFade 0.5s ease-out;
        }
        
        .popup-icon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: rgba(37, 211, 102, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
        }
        
        .popup-icon i {
          font-size: 2.5rem;
          color: #25D366;
        }
        
        .popup-title {
          color: #8FB3E2;
          font-size: 1.8rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }
        
        .popup-message {
          color: rgba(255, 255, 255, 0.9);
          font-size: 1.1rem;
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }
        
        .popup-instructions {
          background: rgba(37, 211, 102, 0.1);
          border-radius: 0.75rem;
          padding: 1rem;
          margin-bottom: 1.5rem;
        }
        
        .popup-instructions .small {
          color: rgba(255, 255, 255, 0.8);
        }
        
        .btn-whatsapp-direct {
          background: linear-gradient(135deg, #25D366, #128C7E);
          color: white;
          border: none;
          padding: 0.5rem 1.5rem;
          border-radius: 0.5rem;
          font-weight: 600;
          font-size: 0.9rem;
          transition: all 0.3s ease;
          text-decoration: none;
          display: inline-block;
        }
        
        .btn-whatsapp-direct:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(37, 211, 102, 0.4);
          color: white;
        }
        
        .btn-close-popup {
          background: linear-gradient(135deg, #8FB3E2, #31487A);
          color: white;
          border: none;
          padding: 0.75rem 2rem;
          border-radius: 0.75rem;
          font-weight: 600;
          font-size: 1rem;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        
        .btn-close-popup:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(143, 179, 226, 0.4);
        }
        
        @keyframes slideUpFade {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* Responsive styles */
        @media (max-width: 768px) {
          .contact-card, .feedback-form-card {
            margin-bottom: 1.5rem;
          }
          
          .btn-submit-feedback {
            width: 100%;
            min-width: auto;
          }
        }
        
        @media (max-width: 576px) {
          .feedback-popup-content {
            padding: 1.5rem;
          }
          
          .popup-title {
            font-size: 1.5rem;
          }
          
          .popup-message {
            font-size: 1rem;
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

export default Feedback;