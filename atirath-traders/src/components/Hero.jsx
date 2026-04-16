import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import '../styles/home.css';

const Hero = () => {
  const [currentTitleIndex, setCurrentTitleIndex] = useState(0);
  const [scrollingLogos, setScrollingLogos] = useState([]);
  const [isScrolling, setIsScrolling] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const animationIdRef = useRef(null);
  const scrollPositionRef = useRef(0);

  const VIDEO_PLAYBACK_SPEED = 0.5;

  const titles = useMemo(() => [
    { title: "Diverse Businesses, One Vision", subtitle: "Leading innovation across multiple industries" },
    { title: "Premium Agricultural Products", subtitle: "Quality seeds, Edible oils, and food products" },
    { title: "Global Reach, Local Impact", subtitle: "Serving customers across 42 countries" }
  ], []);

  const companyData = useMemo(() => [
    { id: 1, name: "Siea - Sai Import and Export Agro", logo: "/img/Trusted/Siea.webp", description: "Specializes in rice products including both Basmati and Non-Basmati varieties. One of the leading rice import and export companies with global operations.", products: "Basmati Rice, Non-Basmati Rice, Rice Products", location: "Delhi, India", establishment: "Established in 2005", certifications: ["ISO 22000:2018", "FSSAI", "APEDA", "USDA Organic", "EU Organic"], socialMedia: { facebook: "https://facebook.com/sieaexports", instagram: "https://instagram.com/sieaexports", twitter: "https://twitter.com/sieaexports", linkedin: "https://linkedin.com/company/siea-exports" } },
    { id: 2, name: "Atirath Industries", logo: "/img/Trusted/Atirath_Industries.webp", description: "Comprehensive import and export trading company dealing in agricultural commodities across India and international markets.", products: "Rice, Pulses, Vegetables, Grains, Spices, Edible Oils", location: "Hyderabad, Telangana, India", establishment: "Established in 1998", certifications: ["ISO 9001:2015", "FSSAI", "APEDA", "Spice Board", "AGMARK"], socialMedia: { facebook: "https://facebook.com/atirathindustries", instagram: "https://instagram.com/atirathindustries", twitter: "https://twitter.com/atirathind", website: "https://atirathindustries.com" }, sisterCompany: "Atirath Agro Industries (Hyderabad)" },
    { id: 3, name: "Frout Root (Dubai Company)", logo: "/img/Trusted/Dubai.webp", description: "Dubai-based agricultural products company specializing in rice distribution across Middle Eastern markets.", products: "Rice Products, Grains, Food Commodities", location: "Dubai, UAE", establishment: "Established in 2010", certifications: ["ISO 22000", "Dubai Municipality", "ESMA", "Halal Certification"], socialMedia: { facebook: "https://facebook.com/froutroot", instagram: "https://instagram.com/froutroot", linkedin: "https://linkedin.com/company/frout-root" } },
    { id: 4, name: "ET Logo - Exclusive Trader", logo: "/img/Trusted/ET_Logo.webp", description: "UK-based exclusive trading company dealing in premium agricultural and food products across European markets.", products: "All Agricultural Products, Exclusive Commodities, Specialty Foods", location: "London, United Kingdom", establishment: "Established in 2003", certifications: ["ISO 9001", "BRCGS", "IFS Food", "UKAS", "Soil Association Organic"], socialMedia: { facebook: "https://facebook.com/exclusivetraderuk", instagram: "https://instagram.com/exclusivetrader", twitter: "https://twitter.com/ETraderUK" } },
    { id: 5, name: "Al-Jazeel Company", logo: "/img/Trusted/Oman.webp", description: "Oman's leading import and export company specializing in meat, fruits, vegetables, and rice products.", products: "Meat Products, Fresh Fruits, Vegetables, Rice, Dairy", location: "Muscat, Oman", establishment: "Established in 2007", certifications: ["Oman Ministry of Agriculture", "GCC Standardization", "Halal Certification", "ISO 22000"], socialMedia: { facebook: "https://facebook.com/aljazeeloman", instagram: "https://instagram.com/aljazeel.oman", twitter: "https://twitter.com/AlJazeelOman" } },
    { id: 6, name: "Royalone Appliances", logo: "/img/Trusted/Royalone.webp", description: "Australian manufacturer and distributor of premium HVAC products including air conditioners and heaters.", products: "Air Conditioners, Heaters, HVAC Systems, Cooling Solutions", location: "Sydney, Australia", establishment: "Established in 2012", certifications: ["Australian Standards AS/NZS", "Energy Rating Label", "CE Certification", "RCM Mark"], socialMedia: { facebook: "https://facebook.com/royaloneappliances", instagram: "https://instagram.com/royalone.au", twitter: "https://twitter.com/RoyaloneAU" } },
    { id: 7, name: "Suguna Foods", logo: "/img/Trusted/Sugana.webp", description: "Hyderabad-based dairy products company specializing in milk-based sweets, cool drinks, and dairy products.", products: "Milk Products, Sweets, Milk-based Cool Drinks, Dairy Items", location: "Hyderabad, Telangana, India", establishment: "Established in 2001", certifications: ["FSSAI", "ISO 22000", "AGMARK", "NSF International", "BIS Certification"], socialMedia: { facebook: "https://facebook.com/sugunafoods", instagram: "https://instagram.com/suguna_foods", twitter: "https://twitter.com/SugunaFoods" } },
    { id: 8, name: "Tayo General Trading", logo: "/img/Trusted/Tyago.webp", description: "USA-based agricultural products import and export company with global reach in agro commodities.", products: "All Agricultural Products, Food Commodities, Agro Products", location: "New York, USA", establishment: "Established in 2008", certifications: ["USDA", "FDA", "ISO 9001:2015", "Kosher Certification", "Organic NOP"], socialMedia: { facebook: "https://facebook.com/tayogeneral", instagram: "https://instagram.com/tayo_general", linkedin: "https://linkedin.com/company/tayo-general-trading" } },
    { id: 9, name: "Metas Corporation", logo: "/img/Trusted/Metas.webp", description: "Diversified corporation with interests in multiple sectors including agriculture, technology, and trading.", products: "Multiple Sectors - Agriculture, Technology, Trading", location: "Global Operations", establishment: "Established in 2015", certifications: ["ISO 9001", "ISO 14001", "OHSAS 18001", "Multiple Industry Certifications"], socialMedia: { facebook: "https://facebook.com/metascorporation", instagram: "https://instagram.com/metas.corp", twitter: "https://twitter.com/MetasCorp" } },
    { id: 10, name: "Heritage", logo: "/img/Trusted/Heritage.webp", description: "Thailand-based global import and export company specializing in agricultural commodities, with a strong focus on rice, spices, and tropical fruits. Operating worldwide with a legacy of quality and reliability.", products: "Rice, Spices, Tropical Fruits, Agricultural Commodities, Food Products", location: "Bangkok, Thailand (Global Operations)", establishment: "Established in 1995", certifications: ["ISO 22000:2018", "Thai FDA", "HACCP", "Halal Certification", "GLOBALG.A.P.", "Organic Thailand", "EU Organic"], socialMedia: { facebook: "https://facebook.com/heritageexports", instagram: "https://instagram.com/heritage.global", twitter: "https://twitter.com/HeritageExport", linkedin: "https://linkedin.com/company/heritage-import-export", website: "https://heritage-export.com" } },
    { id: 11, name: "Akil Drinks", logo: "/img/Trusted/Akil.webp", description: "Global import and export company specializing in beverages and drinks with operations worldwide. Based in Thailand with branches across multiple countries, focusing on quality beverage products distribution.", products: "Beverages, Soft Drinks, Juices, Energy Drinks, Alcoholic Beverages, Water Products", location: "Bangkok, Thailand (Global Operations)", establishment: "Established in 2000", certifications: ["ISO 22000:2018", "Thai FDA", "HACCP", "FDA Approval", "Halal Certification", "BRCGS", "IFS Food"], socialMedia: { facebook: "https://facebook.com/akildrinks", instagram: "https://instagram.com/akil.drinks", twitter: "https://twitter.com/AkilDrinks", linkedin: "https://linkedin.com/company/akil-drinks", website: "https://akildrinks.com" } }
  ], []);

  useEffect(() => { setScrollingLogos([...companyData]); }, [companyData]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTitleIndex((prev) => (prev + 1) % titles.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [titles.length]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const handleLoadedData = () => {
      setIsVideoLoaded(true);
      video.playbackRate = VIDEO_PLAYBACK_SPEED;
      const playPromise = video.play();
      if (playPromise !== undefined) playPromise.catch(error => console.log('Video autoplay prevented:', error));
    };
    const handleError = () => setVideoError(true);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('error', handleError);
    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('error', handleError);
    };
  }, [VIDEO_PLAYBACK_SPEED]);

  useEffect(() => {
    const setVideoSpeed = () => { if (videoRef.current) videoRef.current.playbackRate = VIDEO_PLAYBACK_SPEED; };
    if (isVideoLoaded) setVideoSpeed();
    const video = videoRef.current;
    if (video) {
      video.addEventListener('timeupdate', setVideoSpeed);
      video.addEventListener('play', setVideoSpeed);
    }
    return () => {
      if (video) {
        video.removeEventListener('timeupdate', setVideoSpeed);
        video.removeEventListener('play', setVideoSpeed);
      }
    };
  }, [VIDEO_PLAYBACK_SPEED, isVideoLoaded]);

  useEffect(() => {
    if (showPopup) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [showPopup]);

  // Infinite scrolling animation
  useEffect(() => {
    if (!scrollContainerRef.current || scrollingLogos.length === 0) return;
    const container = scrollContainerRef.current;
    let animationFrameId;
    let lastTime = 0;
    const scrollSpeed = 0.5;
    const animate = (currentTime) => {
      if (!lastTime) lastTime = currentTime;
      if (isScrolling) {
        const deltaTime = currentTime - lastTime;
        const deltaScroll = (deltaTime * scrollSpeed) / 16;
        scrollPositionRef.current += deltaScroll;
        const singleSetWidth = container.scrollWidth / 3;
        if (scrollPositionRef.current >= singleSetWidth) scrollPositionRef.current = 0;
        container.style.transform = `translate3d(-${scrollPositionRef.current}px, 0, 0)`;
      }
      lastTime = currentTime;
      animationFrameId = requestAnimationFrame(animate);
    };
    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isScrolling, scrollingLogos]);

  const handleLogoClick = useCallback((company) => {
    setSelectedCompany(company);
    setShowPopup(true);
    setIsScrolling(false);
  }, []);

  const closePopup = useCallback(() => {
    setShowPopup(false);
    setSelectedCompany(null);
    setIsScrolling(true);
  }, []);

  const refreshLogos = useCallback(() => setScrollingLogos([...companyData]), [companyData]);
  const shuffleLogos = useCallback(() => setScrollingLogos([...companyData].sort(() => 0.5 - Math.random())), [companyData]);

  return (
    <section id="home" className="position-relative overflow-hidden" style={{ paddingTop: '80px' }}>
      <div className="slideshow-container">
        <div className="slide active">
          {!videoError ? (
            <>
              {!isVideoLoaded && (
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', zIndex: 1 }} />
              )}
              <video
                ref={videoRef}
                autoPlay
                muted
                loop
                playsInline
                className="slide-video"
                preload="metadata"
                style={{ opacity: isVideoLoaded ? 1 : 0, transition: 'opacity 0.5s ease' }}
                onLoadedData={(e) => { e.target.playbackRate = VIDEO_PLAYBACK_SPEED; }}
                onPlay={(e) => { e.target.playbackRate = VIDEO_PLAYBACK_SPEED; }}
              >
                <source src="/img/Agriculture_products.mp4" type="video/mp4" />
              </video>
            </>
          ) : (
            <div className="video-fallback">Loading experience...</div>
          )}
          <div className="slide-overlay">
            <div className="slide-content">
              <div className="title-container">
                <h2 key={currentTitleIndex} className="slide-title animate-fadeIn">
                  {titles[currentTitleIndex].title}
                </h2>
                <p key={currentTitleIndex + titles.length} className="slide-subtitle animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                  {titles[currentTitleIndex].subtitle}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scrolling Logos Section */}
      <div
        className="scrolling-logos-section"
        style={{ position: 'absolute', bottom: '20px', left: 0, width: '100%', height: '140px', overflow: 'hidden', zIndex: 10, pointerEvents: 'auto' }}
        onMouseEnter={() => setIsScrolling(false)}
        onMouseLeave={() => setIsScrolling(true)}
      >
        <div className="text-center mb-2">
          <span className="fw-bold" style={{ color: 'white', fontSize: '1.1rem', padding: '0.4rem 1.2rem', borderRadius: '0.5rem', display: 'inline-block', textShadow: '0 2px 4px rgba(0,0,0,0.5)', letterSpacing: '0.5px' }}>
            Trusted Partnership ({scrollingLogos.length} Companies)
          </span>
        </div>
        <div className="d-flex align-items-center justify-content-center h-100 px-3" style={{ height: 'calc(100% - 30px)' }}>
          <span className="fw-bold me-3" style={{ color: 'white', fontSize: '0.9rem', padding: '0.3rem 0.8rem', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '0.5rem', backdropFilter: 'blur(5px)', border: '1px solid rgba(255,255,255,0.1)', whiteSpace: 'nowrap' }}>
            Our Brands & Partners
          </span>
          <div className="d-flex ms-3" style={{ gap: '0.5rem' }}>
            <button onClick={refreshLogos} className="btn btn-sm" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '0.5rem', padding: '0.3rem 0.8rem', fontSize: '0.8rem', transition: 'all 0.3s ease', backdropFilter: 'blur(5px)' }}>
              All Logos
            </button>
            <button onClick={shuffleLogos} className="btn btn-sm" style={{ backgroundColor: 'rgba(76, 175, 80, 0.2)', color: 'white', border: '1px solid rgba(76, 175, 80, 0.3)', borderRadius: '0.5rem', padding: '0.3rem 0.8rem', fontSize: '0.8rem', transition: 'all 0.3s ease', backdropFilter: 'blur(5px)' }}>
              Shuffle
            </button>
          </div>
          <div ref={scrollContainerRef} className="scrolling-logos-container" style={{ transition: isScrolling ? 'none' : 'transform 0.3s ease', marginLeft: '2rem' }}>
            {scrollingLogos.map((company, idx) => <LogoItem key={`first-${company.id}-${idx}`} company={company} onClick={() => handleLogoClick(company)} />)}
            {scrollingLogos.map((company, idx) => <LogoItem key={`second-${company.id}-${idx}`} company={company} onClick={() => handleLogoClick(company)} />)}
            {scrollingLogos.map((company, idx) => <LogoItem key={`third-${company.id}-${idx}`} company={company} onClick={() => handleLogoClick(company)} />)}
          </div>
        </div>
      </div>

      {showPopup && selectedCompany && <CompanyPopup company={selectedCompany} onClose={closePopup} />}
    </section>
  );
};

// LogoItem Component (static CSS only)
const LogoItem = React.memo(({ company, onClick }) => {
  const [imgError, setImgError] = useState(false);
  return (
    <div className="logo-item" onClick={onClick}>
      {!imgError ? (
        <img src={company.logo} alt={`${company.name} logo`} loading="lazy" onError={() => setImgError(true)} />
      ) : (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.7rem', textAlign: 'center', padding: '0.5rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          {company.name}
        </div>
      )}
      <div className="logo-tooltip">Click for details</div>
    </div>
  );
});

// CompanyPopup Component (static CSS only)
const CompanyPopup = ({ company, onClose }) => {
  return (
    <div className="company-popup-overlay" onClick={onClose}>
      <div className="company-popup-content" onClick={(e) => e.stopPropagation()}>
        <button className="popup-close-btn" onClick={onClose}>×</button>
        <div className="text-center mb-4">
          <div className="company-logo-wrapper">
            <img src={company.logo} alt={company.name} className="company-logo" onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#333;font-weight:bold;">${company.name}</div>`; }} />
          </div>
          <h3 className="popup-company-name">{company.name}</h3>
          <p className="popup-establishment">{company.establishment}</p>
        </div>
        <div className="mb-4">
          <h4 className="popup-section-title">Company Overview</h4>
          <p className="popup-description">{company.description}</p>
        </div>
        <div className="mb-4">
          <h4 style={{ color: '#444', marginBottom: '0.8rem', fontSize: '1.1rem' }}>📦 Major Products</h4>
          <p className="products-box">{company.products}</p>
        </div>
        <div className="mb-4">
          <h4 style={{ color: '#444', marginBottom: '0.8rem', fontSize: '1.1rem' }}>📍 Location</h4>
          <p className="location-box">{company.location}</p>
        </div>
        <div className="mb-4">
          <h4 style={{ color: '#444', marginBottom: '0.8rem', fontSize: '1.1rem' }}>🏆 Certifications & Government Approvals</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {company.certifications.map((cert, idx) => <span key={idx} className="cert-badge">{cert}</span>)}
          </div>
        </div>
        <div className="mb-4">
          <h4 style={{ color: '#444', marginBottom: '0.8rem', fontSize: '1.1rem' }}>🌐 Connect With Us</h4>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {company.socialMedia.facebook && <a href={company.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="social-link" style={{ background: 'rgba(24, 119, 242, 0.1)', color: '#1877F2' }}><span>📘</span> Facebook</a>}
            {company.socialMedia.instagram && <a href={company.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="social-link" style={{ background: 'rgba(228, 64, 95, 0.1)', color: '#E4405F' }}><span>📷</span> Instagram</a>}
            {company.socialMedia.twitter && <a href={company.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="social-link" style={{ background: 'rgba(29, 161, 242, 0.1)', color: '#1DA1F2' }}><span>🐦</span> Twitter</a>}
            {company.socialMedia.linkedin && <a href={company.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" className="social-link" style={{ background: 'rgba(10, 102, 194, 0.1)', color: '#0A66C2' }}><span>💼</span> LinkedIn</a>}
            {company.socialMedia.website && <a href={company.socialMedia.website} target="_blank" rel="noopener noreferrer" className="social-link" style={{ background: 'rgba(76, 175, 80, 0.1)', color: '#4CAF50' }}><span>🌐</span> Website</a>}
          </div>
        </div>
        {company.sisterCompany && (
          <div className="sister-company-box">
            <h5 className="sister-title">👥 Sister Company</h5>
            <p style={{ color: '#555', fontSize: '0.95rem', margin: 0 }}>{company.sisterCompany}</p>
          </div>
        )}
        <div className="popup-footer-note">Click outside this window to close</div>
      </div>
    </div>
  );
};

export default React.memo(Hero);