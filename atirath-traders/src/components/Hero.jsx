import React, { useState, useEffect, useRef } from 'react';

const Hero = () => {
  const [currentTitleIndex, setCurrentTitleIndex] = useState(0);
  const [scrollingLogos, setScrollingLogos] = useState([]);
  const [isScrolling, setIsScrolling] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const videoRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const animationIdRef = useRef(null);
  const scrollPositionRef = useRef(0);

  const titles = [
    {
      title: "Diverse Businesses, One Vision",
      subtitle: "Leading innovation across multiple industries"
    },
    {
      title: "Premium Agricultural Products",
      subtitle: "Quality seeds, Edible oils, and food products"
    },
    {
      title: "Global Reach, Local Impact",
      subtitle: "Serving customers across 42 countries"
    }
  ];

  // Company data with detailed information
  const companyData = [
    { 
      id: 1,
      name: "Siea - Sai Import and Export Agro", 
      logo: "/img/Trusted/Siea.png",
      description: "Specializes in rice products including both Basmati and Non-Basmati varieties. One of the leading rice import and export companies with global operations.",
      products: "Basmati Rice, Non-Basmati Rice, Rice Products",
      location: "Delhi, India",
      establishment: "Established in 2005",
      certifications: ["ISO 22000:2018", "FSSAI", "APEDA", "USDA Organic", "EU Organic"],
      socialMedia: {
        facebook: "https://facebook.com/sieaexports",
        instagram: "https://instagram.com/sieaexports",
        twitter: "https://twitter.com/sieaexports",
        linkedin: "https://linkedin.com/company/siea-exports"
      }
    },
    { 
      id: 2,
      name: "Atirath Industries", 
      logo: "/img/Trusted/Atirath_Industries.png",
      description: "Comprehensive import and export trading company dealing in agricultural commodities across India and international markets.",
      products: "Rice, Pulses, Vegetables, Grains, Spices, Edible Oils",
      location: "Hyderabad, Telangana, India",
      establishment: "Established in 1998",
      certifications: ["ISO 9001:2015", "FSSAI", "APEDA", "Spice Board", "AGMARK"],
      socialMedia: {
        facebook: "https://facebook.com/atirathindustries",
        instagram: "https://instagram.com/atirathindustries",
        twitter: "https://twitter.com/atirathind",
        website: "https://atirathindustries.com"
      },
      sisterCompany: "Atirath Agro Industries (Hyderabad)"
    },
    { 
      id: 3,
      name: "Frout Root (Dubai Company)", 
      logo: "/img/Trusted/Dubai.png",
      description: "Dubai-based agricultural products company specializing in rice distribution across Middle Eastern markets.",
      products: "Rice Products, Grains, Food Commodities",
      location: "Dubai, UAE",
      establishment: "Established in 2010",
      certifications: ["ISO 22000", "Dubai Municipality", "ESMA", "Halal Certification"],
      socialMedia: {
        facebook: "https://facebook.com/froutroot",
        instagram: "https://instagram.com/froutroot",
        linkedin: "https://linkedin.com/company/frout-root"
      }
    },
    { 
      id: 4,
      name: "ET Logo - Exclusive Trader", 
      logo: "/img/Trusted/ET_Logo.png",
      description: "UK-based exclusive trading company dealing in premium agricultural and food products across European markets.",
      products: "All Agricultural Products, Exclusive Commodities, Specialty Foods",
      location: "London, United Kingdom",
      establishment: "Established in 2003",
      certifications: ["ISO 9001", "BRCGS", "IFS Food", "UKAS", "Soil Association Organic"],
      socialMedia: {
        facebook: "https://facebook.com/exclusivetraderuk",
        instagram: "https://instagram.com/exclusivetrader",
        twitter: "https://twitter.com/ETraderUK"
      }
    },
    { 
      id: 5,
      name: "Al-Jazeel Company", 
      logo: "/img/Trusted/Oman.png",
      description: "Oman's leading import and export company specializing in meat, fruits, vegetables, and rice products.",
      products: "Meat Products, Fresh Fruits, Vegetables, Rice, Dairy",
      location: "Muscat, Oman",
      establishment: "Established in 2007",
      certifications: ["Oman Ministry of Agriculture", "GCC Standardization", "Halal Certification", "ISO 22000"],
      socialMedia: {
        facebook: "https://facebook.com/aljazeeloman",
        instagram: "https://instagram.com/aljazeel.oman",
        twitter: "https://twitter.com/AlJazeelOman"
      }
    },
    { 
      id: 6,
      name: "Royalone Appliances", 
      logo: "/img/Trusted/Royalone.jpg",
      description: "Australian manufacturer and distributor of premium HVAC products including air conditioners and heaters.",
      products: "Air Conditioners, Heaters, HVAC Systems, Cooling Solutions",
      location: "Sydney, Australia",
      establishment: "Established in 2012",
      certifications: ["Australian Standards AS/NZS", "Energy Rating Label", "CE Certification", "RCM Mark"],
      socialMedia: {
        facebook: "https://facebook.com/royaloneappliances",
        instagram: "https://instagram.com/royalone.au",
        twitter: "https://twitter.com/RoyaloneAU"
      }
    },
    { 
      id: 7,
      name: "Suguna Foods", 
      logo: "/img/Trusted/Sugana.png",
      description: "Hyderabad-based dairy products company specializing in milk-based sweets, cool drinks, and dairy products.",
      products: "Milk Products, Sweets, Milk-based Cool Drinks, Dairy Items",
      location: "Hyderabad, Telangana, India",
      establishment: "Established in 2001",
      certifications: ["FSSAI", "ISO 22000", "AGMARK", "NSF International", "BIS Certification"],
      socialMedia: {
        facebook: "https://facebook.com/sugunafoods",
        instagram: "https://instagram.com/suguna_foods",
        twitter: "https://twitter.com/SugunaFoods"
      }
    },
    { 
      id: 8,
      name: "Tayo General Trading", 
      logo: "/img/Trusted/Tyago.png",
      description: "USA-based agricultural products import and export company with global reach in agro commodities.",
      products: "All Agricultural Products, Food Commodities, Agro Products",
      location: "New York, USA",
      establishment: "Established in 2008",
      certifications: ["USDA", "FDA", "ISO 9001:2015", "Kosher Certification", "Organic NOP"],
      socialMedia: {
        facebook: "https://facebook.com/tayogeneral",
        instagram: "https://instagram.com/tayo_general",
        linkedin: "https://linkedin.com/company/tayo-general-trading"
      }
    },
    { 
      id: 9,
      name: "Metas Corporation", 
      logo: "/img/Trusted/Metas.jpg",
      description: "Diversified corporation with interests in multiple sectors including agriculture, technology, and trading.",
      products: "Multiple Sectors - Agriculture, Technology, Trading",
      location: "Global Operations",
      establishment: "Established in 2015",
      certifications: ["ISO 9001", "ISO 14001", "OHSAS 18001", "Multiple Industry Certifications"],
      socialMedia: {
        facebook: "https://facebook.com/metascorporation",
        instagram: "https://instagram.com/metas.corp",
        twitter: "https://twitter.com/MetasCorp"
      }
    },
    { 
      id: 10,
      name: "Heritage", 
      logo: "/img/Trusted/Heritage.png",
      description: "Thailand-based global import and export company specializing in agricultural commodities, with a strong focus on rice, spices, and tropical fruits. Operating worldwide with a legacy of quality and reliability.",
      products: "Rice, Spices, Tropical Fruits, Agricultural Commodities, Food Products",
      location: "Bangkok, Thailand (Global Operations)",
      establishment: "Established in 1995",
      certifications: ["ISO 22000:2018", "Thai FDA", "HACCP", "Halal Certification", "GLOBALG.A.P.", "Organic Thailand", "EU Organic"],
      socialMedia: {
        facebook: "https://facebook.com/heritageexports",
        instagram: "https://instagram.com/heritage.global",
        twitter: "https://twitter.com/HeritageExport",
        linkedin: "https://linkedin.com/company/heritage-import-export",
        website: "https://heritage-export.com"
      }
    },
    { 
      id: 11,
      name: "Akil Drinks", 
      logo: "/img/Trusted/Akil.jpeg",
      description: "Global import and export company specializing in beverages and drinks with operations worldwide. Based in Thailand with branches across multiple countries, focusing on quality beverage products distribution.",
      products: "Beverages, Soft Drinks, Juices, Energy Drinks, Alcoholic Beverages, Water Products",
      location: "Bangkok, Thailand (Global Operations)",
      establishment: "Established in 2000",
      certifications: ["ISO 22000:2018", "Thai FDA", "HACCP", "FDA Approval", "Halal Certification", "BRCGS", "IFS Food"],
      socialMedia: {
        facebook: "https://facebook.com/akildrinks",
        instagram: "https://instagram.com/akil.drinks",
        twitter: "https://twitter.com/AkilDrinks",
        linkedin: "https://linkedin.com/company/akil-drinks",
        website: "https://akildrinks.com"
      }
    }
  ];

  // Initialize with all logos
  useEffect(() => {
    setScrollingLogos([...companyData]);
  }, []);

  // Title rotation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTitleIndex((prev) => (prev + 1) % titles.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [titles.length]);

  // Handle video play
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.log('Video autoplay failed:', error);
      });
    }
  }, []);

  // Infinite RTL scrolling animation for logos
  useEffect(() => {
    if (!scrollContainerRef.current || scrollingLogos.length === 0) return;

    const container = scrollContainerRef.current;
    const scrollSpeed = 1;
    let lastTimestamp = 0;

    const scrollLogos = (timestamp) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      
      if (isScrolling) {
        const deltaTime = timestamp - lastTimestamp;
        const deltaScroll = (deltaTime * scrollSpeed) / 16;
        
        scrollPositionRef.current += deltaScroll;
        
        const singleSetWidth = container.scrollWidth / 3;
        
        if (scrollPositionRef.current >= singleSetWidth) {
          scrollPositionRef.current = 0;
        }
        
        container.style.transform = `translateX(-${scrollPositionRef.current}px)`;
      }
      
      lastTimestamp = timestamp;
      animationIdRef.current = requestAnimationFrame(scrollLogos);
    };

    animationIdRef.current = requestAnimationFrame(scrollLogos);

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [isScrolling, scrollingLogos]);

  // Handle logo click
  const handleLogoClick = (company) => {
    setSelectedCompany(company);
    setShowPopup(true);
    setIsScrolling(false);
  };

  // Close popup
  const closePopup = () => {
    setShowPopup(false);
    setSelectedCompany(null);
    setIsScrolling(true);
  };

  // Pause scroll on hover
  const handleMouseEnter = () => {
    setIsScrolling(false);
  };

  const handleMouseLeave = () => {
    setIsScrolling(true);
  };

  // Refresh logos with all companies
  const refreshLogos = () => {
    setScrollingLogos([...companyData]);
  };

  // Shuffle logos randomly
  const shuffleLogos = () => {
    const shuffled = [...companyData].sort(() => 0.5 - Math.random());
    setScrollingLogos(shuffled);
  };

  return (
    <section id="home" className="position-relative overflow-hidden" style={{ paddingTop: '80px' }}>
      <div className="slideshow-container">
        {/* Single Video Background */}
        <div className="slide active">
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            className="slide-video"
          >
            <source src="/img/Agriculture_products.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          
          <div className="slide-overlay">
            <div className="slide-content">
              {/* Animated Title Container */}
              <div className="title-container">
                <h2 
                  key={currentTitleIndex}
                  className="slide-title animate-fadeIn"
                >
                  {titles[currentTitleIndex].title}
                </h2>
                <p 
                  key={currentTitleIndex + titles.length}
                  className="slide-subtitle animate-fadeIn"
                  style={{ animationDelay: '0.2s' }}
                >
                  {titles[currentTitleIndex].subtitle}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RTL Scrolling Company Logos Section */}
      <div 
        className="scrolling-logos-section"
        style={{
          position: 'absolute',
          bottom: '20px',
          left: 0,
          width: '100%',
          height: '140px',
          overflow: 'hidden',
          zIndex: 10,
          pointerEvents: 'auto'
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* "Trusted Partnerships" text above logos */}
        <div className="text-center mb-2">
          <span 
            className="fw-bold"
            style={{
              color: 'white',
              fontSize: '1.1rem',
              padding: '0.4rem 1.2rem',
              borderRadius: '0.5rem',
              display: 'inline-block',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
              letterSpacing: '0.5px'
            }}
          >
            Trusted Partnership ({scrollingLogos.length} Companies)
          </span>
        </div>
        
        <div className="d-flex align-items-center justify-content-center h-100 px-3" style={{ height: 'calc(100% - 30px)' }}>
          {/* Label on left side */}
          <span 
            className="fw-bold me-3"
            style={{
              color: 'white',
              fontSize: '0.9rem',
              padding: '0.3rem 0.8rem',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '0.5rem',
              backdropFilter: 'blur(5px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              whiteSpace: 'nowrap',
              minWidth: 'fit-content'
            }}
          >
            Our Brands & Partners
          </span>
          
          {/* Buttons Container */}
          <div className="d-flex ms-3" style={{ gap: '0.5rem' }}>
            {/* Refresh button */}
            <button
              onClick={refreshLogos}
              className="btn btn-sm"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '0.5rem',
                padding: '0.3rem 0.8rem',
                fontSize: '0.8rem',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(5px)',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              All Logos
            </button>
            
            {/* Shuffle button */}
            <button
              onClick={shuffleLogos}
              className="btn btn-sm"
              style={{
                backgroundColor: 'rgba(76, 175, 80, 0.2)',
                color: 'white',
                border: '1px solid rgba(76, 175, 80, 0.3)',
                borderRadius: '0.5rem',
                padding: '0.3rem 0.8rem',
                fontSize: '0.8rem',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(5px)',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(76, 175, 80, 0.3)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(76, 175, 80, 0.2)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Shuffle
            </button>
          </div>
          
          {/* Infinite Scrolling Logos Container */}
          <div 
            ref={scrollContainerRef}
            className="scrolling-logos-container"
            style={{
              display: 'flex',
              gap: '2rem',
              willChange: 'transform',
              transition: isScrolling ? 'none' : 'transform 0.3s ease',
              alignItems: 'center',
              marginLeft: '2rem'
            }}
          >
            {/* First set of logos */}
            {scrollingLogos.map((company, index) => (
              <LogoItem 
                key={`first-${company.id}-${index}`} 
                company={company} 
                index={index}
                onClick={() => handleLogoClick(company)}
              />
            ))}
            {/* Second set (duplicate for seamless loop) */}
            {scrollingLogos.map((company, index) => (
              <LogoItem 
                key={`second-${company.id}-${index}`} 
                company={company} 
                index={index}
                onClick={() => handleLogoClick(company)}
              />
            ))}
            {/* Third set (for extra smoothness) */}
            {scrollingLogos.map((company, index) => (
              <LogoItem 
                key={`third-${company.id}-${index}`} 
                company={company} 
                index={index}
                onClick={() => handleLogoClick(company)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Company Information Popup */}
      {showPopup && selectedCompany && (
        <CompanyPopup company={selectedCompany} onClose={closePopup} />
      )}

      <style jsx>{`
        .slideshow-container {
          height: 100vh;
        }
        
        .scrolling-logos-section {
          transition: opacity 0.3s ease;
        }
        
        .scrolling-logos-section:hover {
          opacity: 0.95;
        }
        
        @media (max-width: 768px) {
          .scrolling-logos-section {
            height: 120px;
            bottom: 10px;
          }
          
          .scrolling-logos-section span {
            font-size: 0.8rem !important;
            padding: 0.2rem 0.5rem !important;
          }
          
          .scrolling-logos-section button {
            padding: 0.2rem 0.5rem !important;
            font-size: 0.7rem !important;
          }
          
          .text-center span {
            font-size: 0.9rem !important;
            padding: 0.3rem 0.9rem !important;
          }
        }
        
        @media (max-width: 480px) {
          .scrolling-logos-section {
            height: 110px;
            padding: 0 1rem;
          }
          
          .scrolling-logos-section span {
            font-size: 0.7rem !important;
            padding: 0.15rem 0.4rem !important;
          }
          
          .scrolling-logos-section button {
            padding: 0.15rem 0.4rem !important;
            font-size: 0.65rem !important;
          }
          
          .text-center span {
            font-size: 0.8rem !important;
            padding: 0.25rem 0.7rem !important;
          }
        }
      `}</style>
    </section>
  );
};

// Company Popup Component
const CompanyPopup = ({ company, onClose }) => {
  return (
    <div 
      className="company-popup-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        backdropFilter: 'blur(10px)'
      }}
      onClick={onClose}
    >
      <div 
        className="company-popup-content"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '15px',
          padding: '2rem',
          maxWidth: '90%',
          width: '600px',
          maxHeight: '85vh',
          overflowY: 'auto',
          position: 'relative',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            background: 'rgba(0, 0, 0, 0.2)',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            color: 'white',
            fontSize: '1.5rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.4)';
            e.currentTarget.style.transform = 'rotate(90deg)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.2)';
            e.currentTarget.style.transform = 'rotate(0deg)';
          }}
        >
          ×
        </button>
        
        {/* Company Logo and Name */}
        <div className="text-center mb-4">
          <div 
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '15px',
              overflow: 'hidden',
              margin: '0 auto 1rem',
              backgroundColor: 'white',
              padding: '0.5rem',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
              border: '1px solid rgba(0, 0, 0, 0.1)'
            }}
          >
            <img
              src={company.logo}
              alt={company.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = `
                  <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #333; font-size: 1rem; font-weight: bold;">
                    ${company.name}
                  </div>
                `;
              }}
            />
          </div>
          <h3 style={{ color: '#333', marginBottom: '0.5rem', fontSize: '1.8rem' }}>
            {company.name}
          </h3>
          <p style={{ color: '#666', fontSize: '1rem', marginBottom: '1.5rem' }}>
            {company.establishment}
          </p>
        </div>
        
        {/* Company Description */}
        <div className="mb-4">
          <h4 style={{ color: '#444', marginBottom: '1rem', borderBottom: '2px solid #4CAF50', paddingBottom: '0.5rem' }}>
            Company Overview
          </h4>
          <p style={{ color: '#555', lineHeight: '1.6', fontSize: '1rem' }}>
            {company.description}
          </p>
        </div>
        
        {/* Products */}
        <div className="mb-4">
          <h4 style={{ color: '#444', marginBottom: '0.8rem', fontSize: '1.1rem' }}>
            📦 Major Products
          </h4>
          <p style={{ color: '#555', fontSize: '1rem', padding: '0.8rem', background: 'rgba(76, 175, 80, 0.1)', borderRadius: '8px' }}>
            {company.products}
          </p>
        </div>
        
        {/* Location */}
        <div className="mb-4">
          <h4 style={{ color: '#444', marginBottom: '0.8rem', fontSize: '1.1rem' }}>
            📍 Location
          </h4>
          <p style={{ color: '#555', fontSize: '1rem', padding: '0.8rem', background: 'rgba(33, 150, 243, 0.1)', borderRadius: '8px' }}>
            {company.location}
          </p>
        </div>
        
        {/* Certifications */}
        <div className="mb-4">
          <h4 style={{ color: '#444', marginBottom: '0.8rem', fontSize: '1.1rem' }}>
            🏆 Certifications & Government Approvals
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {company.certifications.map((cert, index) => (
              <span 
                key={index}
                style={{
                  background: 'rgba(255, 152, 0, 0.1)',
                  color: '#E65100',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  border: '1px solid rgba(255, 152, 0, 0.3)'
                }}
              >
                {cert}
              </span>
            ))}
          </div>
        </div>
        
        {/* Social Media Links */}
        <div className="mb-4">
          <h4 style={{ color: '#444', marginBottom: '0.8rem', fontSize: '1.1rem' }}>
            🌐 Connect With Us
          </h4>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {company.socialMedia.facebook && (
              <a 
                href={company.socialMedia.facebook} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#1877F2',
                  textDecoration: 'none',
                  padding: '0.5rem 1rem',
                  background: 'rgba(24, 119, 242, 0.1)',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(24, 119, 242, 0.2)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(24, 119, 242, 0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>📘</span>
                Facebook
              </a>
            )}
            {company.socialMedia.instagram && (
              <a 
                href={company.socialMedia.instagram} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#E4405F',
                  textDecoration: 'none',
                  padding: '0.5rem 1rem',
                  background: 'rgba(228, 64, 95, 0.1)',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(228, 64, 95, 0.2)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(228, 64, 95, 0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>📷</span>
                Instagram
              </a>
            )}
            {company.socialMedia.twitter && (
              <a 
                href={company.socialMedia.twitter} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#1DA1F2',
                  textDecoration: 'none',
                  padding: '0.5rem 1rem',
                  background: 'rgba(29, 161, 242, 0.1)',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(29, 161, 242, 0.2)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(29, 161, 242, 0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>🐦</span>
                Twitter
              </a>
            )}
            {company.socialMedia.linkedin && (
              <a 
                href={company.socialMedia.linkedin} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#0A66C2',
                  textDecoration: 'none',
                  padding: '0.5rem 1rem',
                  background: 'rgba(10, 102, 194, 0.1)',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(10, 102, 194, 0.2)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(10, 102, 194, 0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>💼</span>
                LinkedIn
              </a>
            )}
            {company.socialMedia.website && (
              <a 
                href={company.socialMedia.website} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#4CAF50',
                  textDecoration: 'none',
                  padding: '0.5rem 1rem',
                  background: 'rgba(76, 175, 80, 0.1)',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(76, 175, 80, 0.2)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(76, 175, 80, 0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>🌐</span>
                Website
              </a>
            )}
          </div>
        </div>
        
        {/* Sister Company Info (if exists) */}
        {company.sisterCompany && (
          <div className="mt-3" style={{
            padding: '1rem',
            background: 'rgba(156, 39, 176, 0.1)',
            borderRadius: '8px',
            borderLeft: '4px solid #9C27B0'
          }}>
            <h5 style={{ color: '#7B1FA2', marginBottom: '0.5rem', fontSize: '1rem' }}>
              👥 Sister Company
            </h5>
            <p style={{ color: '#555', fontSize: '0.95rem', margin: 0 }}>
              {company.sisterCompany}
            </p>
          </div>
        )}
        
        {/* Additional Info */}
        <div className="mt-4 pt-3" style={{ borderTop: '1px solid #eee' }}>
          <p style={{ color: '#777', fontSize: '0.9rem', textAlign: 'center', margin: 0 }}>
            Click outside this window to close
          </p>
        </div>
      </div>
    </div>
  );
};

// LogoItem Component
const LogoItem = ({ company, index, onClick }) => {
  return (
    <div
      className="logo-item"
      style={{
        flex: '0 0 auto',
        width: '120px',
        height: '80px',
        borderRadius: '0.5rem',
        overflow: 'hidden',
        position: 'relative',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
        transition: 'all 0.3s ease',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(5px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '0.5rem',
        margin: '0 0 3rem 0',
        cursor: 'pointer'
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.15) translateY(-5px)';
        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.4)';
        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
      }}
    >
      <img
        src={company.logo}
        alt={`${company.name} logo`}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          borderRadius: '0.25rem',
          filter: 'brightness(1.1) contrast(1.1)'
        }}
        onError={(e) => {
          console.error(`Failed to load logo: ${company.name}`);
          e.target.style.display = 'none';
          e.target.parentElement.innerHTML = `
            <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: white; font-size: 0.7rem; text-align: center; padding: 0.5rem;">
              ${company.name}
            </div>
          `;
        }}
      />
      {/* Company name tooltip */}
      <div 
        className="logo-tooltip"
        style={{
          position: 'absolute',
          bottom: '-30px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '0.4rem 0.8rem',
          borderRadius: '0.25rem',
          fontSize: '0.8rem',
          whiteSpace: 'nowrap',
          opacity: 0,
          transition: 'opacity 0.3s ease',
          pointerEvents: 'none',
          backdropFilter: 'blur(5px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          zIndex: 20
        }}
      >
        Click for details
      </div>
      <style jsx>{`
        .logo-item:hover .logo-tooltip {
          opacity: 1;
        }
        
        @media (max-width: 768px) {
          .logo-item {
            width: 100px !important;
            height: 65px !important;
          }
        }
        
        @media (max-width: 480px) {
          .logo-item {
            width: 80px !important;
            height: 55px !important;
            padding: 0.3rem !important;
          }
          
          .logo-tooltip {
            font-size: 0.6rem !important;
            padding: 0.15rem 0.3rem !important;
            bottom: -25px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Hero;