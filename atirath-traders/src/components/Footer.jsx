import React from 'react';
import { Instagram, Twitter, Facebook, Linkedin, MessageCircle } from 'lucide-react';

const Footer = () => {
  return (
    <footer id="contact" className="py-4 mt-5 border-top border-opacity-10">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-md-4 mb-3 mb-md-0">
            <div className="d-flex align-items-center">
              <div className="footer-logo-icon">
                <img src="/img/icon2.png" alt="ATIRATH GROUP Logo" className="logo-img" />
              </div>
              <div className="ms-3">
                <div className="footer-company-name fw-bold">ATIRATH TRADERS INDIA PVT.LTD</div>
                <div className="footer-caption text-white small mt-1">Diverse Businesses, One Vision</div>
              </div>
            </div>
          </div>
          <div className="col-md-4 text-center mb-3 mb-md-0">
            <div className="text-xs opacity-65">
              © 2025 ATIRATH TRADERS INDIA PVT.LTD.
            </div>
          </div>
          <div className="col-md-4 text-center text-md-end">
            <div className="d-flex gap-3 justify-content-center justify-content-md-end">
              <a 
                href="https://www.instagram.com/atirathtradersindia?igsh=c2JvbjB3YzJsMjZu" 
                className="text-white hover-accent"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="https://x.com/atirathtraders" 
                className="text-white hover-accent"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="https://www.facebook.com/share/1GE7seKPgf/" 
                className="text-white hover-accent"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="https://www.linkedin.com/company/atirath-traders-india-private/" 
                className="text-white hover-accent"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a 
                href="https://whatsapp.com/channel/0029Vb6L0HcE50UiJzADHE28" 
                className="text-white hover-accent"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;