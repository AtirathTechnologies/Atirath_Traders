import React, { useEffect, useState } from 'react';

const ThankYouPopup = ({ isOpen, onClose }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShow(true);
      
      const timer = setTimeout(() => {
        handleClose();
      }, 3000000); // Auto close after 3 seconds

      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setShow(false);
    setTimeout(onClose, 300);
  };

  if (!isOpen && !show) return null;

  return (
    <div className="thank-you-popup-overlay">
      <div className={`thank-you-popup-content ${show ? 'show' : 'hide'}`}>
        <div className="popup-icon">🎉</div>
        <h2 className="popup-title">Thank You!</h2>
        <p className="popup-desc">
          Your query has been submitted successfully.
        </p>
        <p className="popup-info">
          Our team will contact you within 24 hours.
        </p>
        <div className="popup-actions">
          <button
            onClick={handleClose}
            className="popup-close-btn"
            aria-label="Close thank you message"
          >
            Close
          </button>
        </div>
      </div>

      <style jsx>{`
        .thank-you-popup-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10001;
          padding: 20px;
          backdrop-filter: blur(10px);
        }

        .thank-you-popup-content {
          background: linear-gradient(135deg, rgba(25, 35, 56, 0.95), rgba(30, 46, 79, 0.95));
          border: 1px solid rgba(143, 179, 226, 0.3);
          border-radius: 20px;
          padding: 40px 30px;
          text-align: center;
          max-width: 450px;
          width: 100%;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5);
          position: relative;
          overflow: hidden;
          transform: scale(0.9);
          opacity: 0;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .thank-you-popup-content::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #8FB3E2, #31487A, #D9E1F1, #31487A, #8FB3E2);
          background-size: 200% 100%;
          animation: shimmer 3s linear infinite;
        }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        .thank-you-popup-content.show {
          transform: scale(1);
          opacity: 1;
        }

        .thank-you-popup-content.hide {
          transform: scale(0.9);
          opacity: 0;
        }

        .popup-icon {
          font-size: 4rem;
          margin-bottom: 20px;
          animation: bounce 1s ease infinite alternate;
        }

        @keyframes bounce {
          0% { transform: translateY(0) scale(1); }
          100% { transform: translateY(-10px) scale(1.05); }
        }

        .popup-title {
          font-size: 2.2rem;
          font-weight: 700;
          margin: 0 0 15px 0;
          background: linear-gradient(135deg, #8FB3E2, #D9E1F1);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .popup-desc {
          font-size: 1.1rem;
          color: rgba(255, 255, 255, 0.9);
          margin: 0 0 10px 0;
          line-height: 1.5;
        }

        .popup-info {
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.7);
          margin: 0 0 25px 0;
          line-height: 1.4;
        }

        .popup-actions {
          display: flex;
          justify-content: center;
          gap: 15px;
        }

        .popup-close-btn {
          background: linear-gradient(135deg, #8FB3E2, #31487A);
          color: white;
          border: none;
          padding: 12px 30px;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 1rem;
          box-shadow: 0 4px 15px rgba(143, 179, 226, 0.3);
        }

        .popup-close-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(143, 179, 226, 0.4);
          background: linear-gradient(135deg, #9bc1e8, #3a5490);
        }

        @media (max-width: 480px) {
          .thank-you-popup-content {
            padding: 30px 20px;
          }

          .popup-icon {
            font-size: 3.5rem;
          }

          .popup-title {
            font-size: 1.8rem;
          }

          .popup-desc {
            font-size: 1rem;
          }

          .popup-info {
            font-size: 0.9rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ThankYouPopup;