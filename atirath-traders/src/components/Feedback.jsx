import React, { useState } from 'react';
import '../styles/home.css';

const Feedback = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [showPopup, setShowPopup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    
    const currentDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const message = `*New Feedback Submission* 📝%0A%0A*Date:* ${currentDate}%0A*Name:* ${formData.name}%0A*Email:* ${formData.email}%0A*Message:*%0A${formData.message}%0A%0A_Submitted via Atirath Traders Website_`;
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${message}`;
    window.open(whatsappURL, '_blank');
    
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
        <h2
          className="display-4 fw-bold accent text-center mb-5"
          data-aos="zoom-in"
          style={{ marginTop: '80px' }}
        >
          Get in Touch
        </h2>

        <div className="row g-5">
          {/* LEFT: Contact Us */}
          <div className="col-lg-6" data-aos="fade-up">
            <div className="contact-card p-4 h-100">
              <h3 className="h4 fw-bold accent mb-4 text-center" data-aos="fade-up" data-aos-delay="100">
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
                  <a href="https://www.atirathtraders.com" className="contact-value" target="_blank" rel="noopener noreferrer">
                    www.atirathtraders.com
                  </a>
                </div>
                <div className="contact-item mb-3">
                  <div className="contact-label fw-semibold mb-1">Email:</div>
                  <a href="mailto:info@atirathtradersltd.com" className="contact-value">
                    info@atirathtradersltd.com
                  </a>
                </div>
                <div className="contact-item mb-3">
                  <div className="contact-label fw-semibold mb-1">Phone:</div>
                  <a href={`tel:${whatsappNumber}`} className="contact-value">
                    {whatsappNumber}
                  </a>
                </div>
                <div className="contact-item mb-3">
                  <div className="contact-label fw-semibold mb-1">WhatsApp:</div>
                  <a href={`https://wa.me/${whatsappNumber}`} className="contact-value" target="_blank" rel="noopener noreferrer">
                    {whatsappNumber}
                  </a>
                </div>
                <div className="contact-item mb-3">
                  <div className="contact-label fw-semibold mb-1">Social Media:</div>
                  <div className="contact-value">@AtirathTraders (LinkedIn, Instagram, Facebook, Twitter)</div>
                </div>
                <div className="contact-item">
                  <div className="contact-label fw-semibold mb-1">Address:</div>
                  <div className="contact-value">
                    Plot No:45, Jai Hind Enclave, Silicon valley, VIP Hills,<br />
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
              <h3 className="h4 fw-bold accent mb-4 text-center" data-aos="fade-up" data-aos-delay="300">
                Feedback Form
              </h3>

              <form onSubmit={handleSubmit} id="feedbackForm">
                <div className="mb-4">
                  <label className="form-label fw-semibold mb-2">Name</label>
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
                  <label className="form-label fw-semibold mb-2">Email</label>
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
                  <label className="form-label fw-semibold mb-2">Message</label>
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
                  <button type="submit" className="btn btn-primary btn-submit-feedback" disabled={isSubmitting}>
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

      {/* Success Popup */}
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
              <a href={`https://wa.me/${whatsappNumber}`} className="btn btn-whatsapp-direct" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-whatsapp me-2"></i>
                Open WhatsApp Directly
              </a>
            </div>
            <button className="btn btn-close-popup mt-3" onClick={() => setShowPopup(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Font Awesome Icons */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
    </section>
  );
};

export default Feedback;