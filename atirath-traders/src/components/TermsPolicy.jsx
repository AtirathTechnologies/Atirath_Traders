import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TermsPolicy = () => {
  const navigate = useNavigate();

  // ✅ WhatsApp number from environment variable
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER;

  const handleBackClick = () => {
    navigate(-1);
  };

  return (
    <section className="terms-policy-page" style={{ paddingTop: '100px', minHeight: '100vh' }}>
      <div className="container">
        {/* Back Button */}
        <button 
          className="back-button"
          onClick={handleBackClick}
          title="Back"
          style={{ top: '100px' }}
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="row justify-content-center">
          <div className="col-lg-10">
            <h1 className="h2 fw-bold text-center accent mb-5">Terms & Policy</h1>
            
            <div className="glass p-4 p-md-5 rounded-3">
              <div className="terms-content">
                <h2 className="h4 fw-bold text-accent mb-4">ATIRATH TRADERS INDIA PVT.LTD - Terms & Conditions</h2>

                <div className="mb-5">
                  <h3 className="h5 fw-semibold text-accent mb-3">1. Acceptance of Terms</h3>
                  <p className="mb-3">
                    By accessing and using ATIRATH TRADERS INDIA PVT.LTD services, you agree to be bound by these Terms and Conditions. 
                    If you do not agree with any part of these terms, you must not use our services.
                  </p>
                </div>

                <div className="mb-5">
                  <h3 className="h5 fw-semibold text-accent mb-3">2. Services Description</h3>
                  <p className="mb-3">
                    We provide international trading services specializing in import and export of various products including 
                    edible oils, construction materials, agricultural products, and consumer goods across global markets.
                  </p>
                </div>

                <div className="mb-5">
                  <h3 className="h5 fw-semibold text-accent mb-3">3. User Responsibilities</h3>
                  <ul className="mb-3">
                    <li>Provide accurate and complete information during registration and transactions</li>
                    <li>Maintain the confidentiality of your account credentials</li>
                    <li>Comply with all applicable laws and regulations</li>
                    <li>Use our services only for lawful purposes</li>
                    <li>Not engage in any fraudulent or malicious activities</li>
                  </ul>
                </div>

                <div className="mb-5">
                  <h3 className="h5 fw-semibold text-accent mb-3">4. Order Processing</h3>
                  <div className="mb-3">
                    <h4 className="h6 fw-semibold mb-2">4.1 Order Confirmation</h4>
                    <p>All orders are subject to acceptance and availability. We reserve the right to refuse or cancel any order for any reason.</p>
                  </div>
                  <div className="mb-3">
                    <h4 className="h6 fw-semibold mb-2">4.2 Pricing</h4>
                    <p>Prices are subject to change without notice. All prices are in USD unless otherwise specified.</p>
                  </div>
                </div>

                <div className="mb-5">
                  <h3 className="h5 fw-semibold text-accent mb-3">5. Payment Terms</h3>
                  <ul>
                    <li>Payment must be made in full before shipment for most orders</li>
                    <li>Large orders may require partial payment arrangements</li>
                    <li>Accepted payment methods: Bank Transfer, Letter of Credit</li>
                    <li>All transactions are subject to currency conversion rates</li>
                  </ul>
                </div>

                <div className="mb-5">
                  <h3 className="h5 fw-semibold text-accent mb-3">6. Shipping and Delivery</h3>
                  <p className="mb-3">
                    Delivery times are estimates and not guaranteed. Shipping costs are calculated based on weight, 
                    destination, and shipping method selected.
                  </p>
                  <ul>
                    <li>International shipping available to most countries</li>
                    <li>Customs duties and taxes are the responsibility of the buyer</li>
                    <li>Tracking information provided for all shipments</li>
                    <li>Risk of loss passes to buyer upon delivery to carrier</li>
                  </ul>
                </div>

                <div className="mb-5">
                  <h3 className="h5 fw-semibold text-accent mb-3">7. Returns and Refunds</h3>
                  <p className="mb-3">
                    Due to the nature of international trade and perishable goods, returns are limited:
                  </p>
                  <ul>
                    <li>Defective products must be reported within 7 days of receipt</li>
                    <li>Returns require prior authorization</li>
                    <li>Refunds processed within 30 business days of return approval</li>
                    <li>Shipping costs are non-refundable</li>
                  </ul>
                </div>

                <div className="mb-5">
                  <h3 className="h5 fw-semibold text-accent mb-3">8. Intellectual Property</h3>
                  <p className="mb-3">
                    All content on this platform, including text, graphics, logos, and images, is the property of 
                    ATIRATH TRADERS INDIA PVT.LTD and protected by intellectual property laws.
                  </p>
                </div>

                <div className="mb-5">
                  <h3 className="h5 fw-semibold text-accent mb-3">9. Privacy Policy</h3>
                  <p className="mb-3">
                    We are committed to protecting your privacy:
                  </p>
                  <ul>
                    <li>We collect only necessary information for order processing</li>
                    <li>Personal information is never sold to third parties</li>
                    <li>Data is stored securely and accessed only by authorized personnel</li>
                    <li>We use industry-standard security measures to protect your data</li>
                  </ul>
                </div>

                <div className="mb-5">
                  <h3 className="h5 fw-semibold text-accent mb-3">10. Limitation of Liability</h3>
                  <p className="mb-3">
                    ATIRATH TRADERS INDIA PVT.LTD shall not be liable for any indirect, incidental, special, 
                    consequential or punitive damages resulting from your use of or inability to use our services.
                  </p>
                </div>

                <div className="mb-5">
                  <h3 className="h5 fw-semibold text-accent mb-3">11. Governing Law</h3>
                  <p className="mb-3">
                    These terms shall be governed by and construed in accordance with the laws of India. 
                    Any disputes shall be subject to the exclusive jurisdiction of the courts in India.
                  </p>
                </div>

                <div className="mb-5">
                  <h3 className="h5 fw-semibold text-accent mb-3">12. Changes to Terms</h3>
                  <p className="mb-3">
                    We reserve the right to modify these terms at any time. Continued use of our services 
                    after changes constitutes acceptance of the modified terms.
                  </p>
                </div>

                <div className="mb-5">
                  <h3 className="h5 fw-semibold text-accent mb-3">13. Contact Information</h3>
                  <p className="mb-1">ATIRATH TRADERS INDIA PVT.LTD</p>
                  <p className="mb-1">
                    Email: <a href="mailto:info@atirathtradersltd.com" className="contact-link email-link">
                      info@atirathtradersltd.com
                    </a>
                  </p>
                  <p className="mb-1">
                    {/* ✅ Phone - Using environment variable with clickable link */}
                    Phone: <a href={`tel:${whatsappNumber}`} className="contact-link phone-link">
                      {whatsappNumber}
                    </a>
                  </p>
                  <p className="mb-1">
                    {/* ✅ WhatsApp - Using environment variable with clickable link */}
                    WhatsApp: <a href={`https://wa.me/${whatsappNumber}`} 
                               className="contact-link whatsapp-link"
                               target="_blank" 
                               rel="noopener noreferrer">
                      {whatsappNumber}
                    </a>
                  </p>
                  <p>Address: Flat No:45, Jai Hind Silicon valley, Madhapur Hyderabad, Telangana, 500081</p>
                </div>

                <div className="text-center mt-5">
                  <p className="text-muted">
                    <small>
                      Last updated: {new Date().toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </small>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Styles */}
      <style jsx>{`
        .terms-policy-page {
          background: linear-gradient(135deg, #0a0f1a 0%, #1a1f2e 100%);
          color: #fff;
          min-height: 100vh;
          position: relative;
        }
        
        .glass {
          background: rgba(25, 35, 56, 0.8);
          border: 1px solid rgba(143, 179, 226, 0.2);
          backdrop-filter: blur(10px);
          border-radius: 1rem;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }
        
        .text-accent {
          color: #8FB3E2;
        }
        
        .back-button {
          position: fixed;
          left: 20px;
          background: rgba(143, 179, 226, 0.1);
          border: 1px solid #8FB3E2;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #8FB3E2;
          cursor: pointer;
          transition: all 0.3s ease;
          z-index: 100;
        }
        
        .back-button:hover {
          background: rgba(143, 179, 226, 0.2);
          transform: translateX(-3px);
        }
        
        .terms-content ul {
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.8;
          padding-left: 20px;
        }
        
        .terms-content ul li {
          margin-bottom: 8px;
        }
        
        .terms-content p {
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.8;
        }
        
        .text-muted {
          color: rgba(255, 255, 255, 0.5) !important;
        }
        
        /* Contact Links Styling */
        .contact-link {
          text-decoration: none;
          transition: all 0.3s ease;
        }
        
        .email-link {
          color: #8FB3E2;
        }
        
        .email-link:hover {
          color: #ffffff !important;
          text-decoration: underline !important;
        }
        
        .phone-link {
          color: #8FB3E2;
        }
        
        .phone-link:hover {
          color: #ffffff !important;
          text-decoration: underline !important;
        }
        
        .whatsapp-link {
          color: #25D366;
          font-weight: 500;
        }
        
        .whatsapp-link:hover {
          color: #ffffff !important;
          text-decoration: underline !important;
        }
        
        /* Responsive Styles */
        @media (max-width: 768px) {
          .back-button {
            top: 80px !important;
            left: 10px;
            width: 35px;
            height: 35px;
          }
          
          .glass {
            padding: 1.5rem !important;
          }
          
          h1.h2 {
            font-size: 1.75rem;
          }
        }
        
        @media (max-width: 576px) {
          .glass {
            padding: 1rem !important;
          }
          
          .terms-content ul {
            padding-left: 15px;
          }
        }
      `}</style>
    </section>
  );
};

export default TermsPolicy;