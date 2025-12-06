import React, { useState } from 'react';
import { Truck, MapPin, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { transportData } from '../data/ProductData';

const TransportPage = () => {
  const navigate = useNavigate();
  const [selectedState, setSelectedState] = useState(null);

  const handleStateSelect = (state) => {
    setSelectedState(state);
    // Scroll to top when state is selected to ensure content is visible below navbar
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    if (selectedState) {
      setSelectedState(null);
    } else {
      navigate(-1);
    }
  };

  // Function to display price in Indian Rupees format with proper unit
  const displayPrice = (price) => {
    return `₹ ${price}`;
  };

  return (
    <div className="transport-page min-vh-100" style={{
      background: 'linear-gradient(135deg, #192338, #1E2E4F, #31487A, #8FB3E2, #D9E1F1)',
      backgroundAttachment: 'fixed',
      paddingTop: '80px',
      minHeight: '100vh'
    }}>
      {/* Back Button */}
      <button
        className="btn btn-outline-light position-fixed top-0 start-0 m-3 z-3"
        onClick={handleBack}
        style={{
          background: 'rgba(25, 35, 56, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          backdropFilter: 'blur(10px)',
          marginTop: '100px',
          zIndex: 1000
        }}
      >
        <ArrowLeft className="me-2" size={18} />
        Back
      </button>

      <div className="container py-5" style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div className="text-center mb-5">
          <div className="d-flex justify-content-center align-items-center mb-3">
            <Truck className="text-accent me-3" size={48} />
            <h1 className="display-4 fw-bold text-white mb-0">Transportation Pricing</h1>
          </div>
          <p className="lead text-light opacity-80">
            Competitive freight rates across all major states and ports in India
          </p>
        </div>

        {!selectedState ? (
          /* State Selection Grid - Updated with full card images */
          <div className="row g-4 justify-content-center">
            {Object.entries(transportData).map(([key, state]) => (
              <div key={key} className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                <div
                  className="card transport-state-card glass border-0 h-100 text-center cursor-pointer position-relative overflow-hidden"
                  onClick={() => handleStateSelect(key)}
                  style={{
                    transition: 'all 0.3s ease',
                    background: 'rgba(25, 35, 56, 0.7)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    minHeight: '200px'
                  }}
                >
                  {/* Background Image covering entire card without spacing */}
                  <div
                    className="position-absolute w-100 h-100 top-0 start-0"
                    style={{
                      backgroundImage: `url(${state.icon})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat'
                    }}
                  />

                  {/* Content positioned absolutely to overlay image */}
                  <div className="card-body p-0 position-absolute w-100 h-100 d-flex flex-column justify-content-center align-items-center z-1">
                    <div className="text-content p-3" style={{
                      background: 'rgba(25, 35, 56, 0.7)',
                      borderRadius: '8px'
                    }}>
                      <h5 className="card-title text-white fw-bold mb-2">{state.name}</h5>
                      <p className="text-white-50 mb-0">
                        {state.destinations.length} destination{state.destinations.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* State Details - Updated with proper spacing to prevent overlapping */
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div
                className="card glass border-0 mb-5"
                style={{
                  background: 'rgba(25, 35, 56, 0.8)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  marginTop: '20px'
                }}
              >
                <div className="card-header bg-transparent border-bottom-0 py-4">
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center me-3 overflow-hidden"
                        style={{
                          width: '60px',
                          height: '60px',
                          background: 'linear-gradient(135deg, #8FB3E2, #31487A)',
                          border: '2px solid rgba(255, 255, 255, 0.2)'
                        }}
                      >
                        <img
                          src={transportData[selectedState].icon}
                          alt={transportData[selectedState].name}
                          className="w-100 h-100 object-fit-cover"
                          style={{
                            objectFit: 'cover',
                            borderRadius: '50%'
                          }}
                        />
                      </div>
                      <div>
                        {/* State Name in White Color */}
                        <h2 className="h3 text-white mb-1">{transportData[selectedState].name}</h2>
                        <p className="text-white-50 mb-0">Transportation Routes & Pricing</p>
                      </div>
                    </div>
                    <button
                      className="btn btn-outline-accent btn-sm"
                      onClick={() => setSelectedState(null)}
                    >
                      Back to States
                    </button>
                  </div>
                </div>

                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-dark table-hover mb-0">
                      <thead>
                        <tr>
                          {/* Table Headers in White Color */}
                          <th className="border-0 ps-4 py-3 text-white fw-bold">Destination / Port</th>
                          <th className="border-0 text-center py-3 text-white fw-bold">Price per kg</th>
                          <th className="border-0 text-center py-3 text-white fw-bold">Price per liter</th>
                          <th className="border-0 text-center py-3 text-white fw-bold">Price per piece</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transportData[selectedState].destinations.map((destination, index) => (
                          <tr key={index} className="border-top border-secondary">
                            <td className="ps-4 py-3">
                              <div className="d-flex align-items-center">
                                <Truck className="text-accent me-3" size={18} />
                                {/* Destination Names in Bold White Color */}
                                <span className="text-white fw-bold">
                                  {destination.port || destination.location}
                                </span>
                              </div>
                            </td>
                            <td className="text-center py-3">
                              <div className="d-flex align-items-center justify-content-center">
                                <span className="fw-bold text-success">
                                  {displayPrice(destination.prices.kg)}
                                </span>
                              </div>
                            </td>
                            <td className="text-center py-3">
                              <div className="d-flex align-items-center justify-content-center">
                                <span className="fw-bold text-info">
                                  {displayPrice(destination.prices.liter)}
                                </span>
                              </div>
                            </td>
                            <td className="text-center py-3">
                              <div className="d-flex align-items-center justify-content-center">
                                <span className="fw-bold text-warning">
                                  {displayPrice(destination.prices.piece)}
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="card-footer bg-transparent border-top-0 py-4">
                  <div className="alert alert-info glass border-0 mb-0">
                    <div className="d-flex">
                      <div className="flex-shrink-0">
                        <MapPin className="text-info" size={20} />
                      </div>
                      <div className="flex-grow-1 ms-3">
                        <h6 className="alert-heading text-info mb-2">Pricing Information</h6>
                        <p className="mb-2 text-white">
                          • <strong className="text-success">Green prices</strong> indicate per kilogram rates<br />
                          • <strong className="text-info">Blue prices</strong> indicate per liter rates<br />
                          • <strong className="text-warning">Yellow prices</strong> indicate per piece rates<br />
                          • Minimum charges may apply<br />
                          • Contact us for bulk shipments and special discounts<br />
                          • Prices subject to change based on fuel costs and market conditions<br />
                          • Rates include basic transportation charges
                        </p>
                        <div className="row mt-3">
                          <div className="col-md-6">
                            <button className="btn btn-info btn-sm w-100 mb-2">
                              Get Custom Quote for Bulk Orders
                            </button>
                          </div>
                          <div className="col-md-6">
                            <button className="btn btn-outline-info btn-sm w-100">
                              Contact for Special Product Rates
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .transport-state-card {
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .transport-state-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(143, 179, 226, 0.3);
          border-color: rgba(143, 179, 226, 0.5) !important;
        }
        
        .cursor-pointer {
          cursor: pointer;
        }
        
        .table-dark {
          background: transparent;
        }
        
        .table-dark tbody tr:hover {
          background: rgba(255, 255, 255, 0.05);
        }
        
        .text-white-50 {
          color: rgba(255, 255, 255, 0.7) !important;
        }
        
        .object-fit-cover {
          object-fit: cover;
        }

        /* Ensure proper stacking context */
        .transport-page {
          position: relative;
          z-index: 1;
        }

        /* Prevent navbar overlap */
        @media (max-width: 768px) {
          .container {
            margin-top: 20px;
          }
          
          .table-responsive {
            font-size: 0.875rem;
          }
        }
      `}</style>
    </div>
  );
};

export default TransportPage;