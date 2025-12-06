import React, { useState, useEffect, useRef } from 'react';

const Hero = () => {
  const [currentTitleIndex, setCurrentTitleIndex] = useState(0);
  const [scrollingLogos, setScrollingLogos] = useState([]);
  const [isScrolling, setIsScrolling] = useState(true);
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

  // Company logos with their names
  const logoPool = [
    { name: "Atirath Industries", logo: "/img/Atirath_Industries.png" },
    { name: "Dubai", logo: "/img/Dubai.png" },
    { name: "ET Logo", logo: "/img/ET_Logo.png" },
    { name: "Metas", logo: "/img/Metas.jpg" },
    { name: "Oman", logo: "/img/Oman.png" },
    { name: "Royalone", logo: "/img/Royalone.jpg" },
    { name: "Siea", logo: "/img/Siea.png" },
    { name: "Sugana", logo: "/img/Sugana.png" },
    { name: "Tyago", logo: "/img/Tyago.png" }
  ];

  // Initialize random logos (take 7 random ones)
  useEffect(() => {
    const getRandomLogos = () => {
      const shuffled = [...logoPool].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, 7); // Take 7 random logos
    };
    setScrollingLogos(getRandomLogos());
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
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const scrollSpeed = 1; // Adjust speed as needed
    let lastTimestamp = 0;

    const scrollLogos = (timestamp) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      
      if (isScrolling) {
        const deltaTime = timestamp - lastTimestamp;
        const deltaScroll = (deltaTime * scrollSpeed) / 16; // Normalize to 60fps
        
        scrollPositionRef.current += deltaScroll;
        
        // Calculate the width of one set of logos
        const singleSetWidth = container.scrollWidth / 3;
        
        // When we've scrolled one full set, reset position
        if (scrollPositionRef.current >= singleSetWidth) {
          scrollPositionRef.current = 0;
        }
        
        container.style.transform = `translateX(-${scrollPositionRef.current}px)`;
      }
      
      lastTimestamp = timestamp;
      animationIdRef.current = requestAnimationFrame(scrollLogos);
    };

    // Start animation
    animationIdRef.current = requestAnimationFrame(scrollLogos);

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [isScrolling]);

  // Pause scroll on hover
  const handleMouseEnter = () => {
    setIsScrolling(false);
  };

  const handleMouseLeave = () => {
    setIsScrolling(true);
  };

  // Refresh random logos
  const refreshLogos = () => {
    const shuffled = [...logoPool].sort(() => 0.5 - Math.random());
    setScrollingLogos(shuffled.slice(0, 7));
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

      {/* RTL Scrolling Company Logos Section - Transparent background */}
      <div 
        className="scrolling-logos-section"
        style={{
          position: 'absolute',
          bottom: '20px',
          left: 0,
          width: '100%',
          height: '140px', // Increased height for text above
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
              // backgroundColor: 'rgba(0, 0, 0, 0.4)',
              borderRadius: '0.5rem',
              // backdropFilter: 'blur(8px)',
              // border: '1px solid rgba(255, 255, 255, 0.15)',
              display: 'inline-block',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
              letterSpacing: '0.5px'
            }}
          >
            Trusted Partnership
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
          
          {/* Refresh button */}
          <button
            onClick={refreshLogos}
            className="btn btn-sm ms-3"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '0.5rem',
              padding: '0.3rem 0.8rem',
              fontSize: '0.8rem',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(5px)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            }}
          >
            Refresh Logos
          </button>
          
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
            {scrollingLogos.map((logo, index) => (
              <LogoItem key={`first-${index}`} logo={logo} index={index} />
            ))}
            {/* Second set (duplicate for seamless loop) */}
            {scrollingLogos.map((logo, index) => (
              <LogoItem key={`second-${index}`} logo={logo} index={index} />
            ))}
            {/* Third set (for extra smoothness) */}
            {scrollingLogos.map((logo, index) => (
              <LogoItem key={`third-${index}`} logo={logo} index={index} />
            ))}
          </div>
        </div>
      </div>

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
            margin-left: 0.5rem !important;
          }
          
          /* Trusted Partnerships text for mobile */
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
            margin-left: 0.4rem !important;
          }
          
          /* Trusted Partnerships text for small mobile */
          .text-center span {
            font-size: 0.8rem !important;
            padding: 0.25rem 0.7rem !important;
          }
        }
      `}</style>
    </section>
  );
};

// Separate LogoItem component for better performance
const LogoItem = ({ logo, index }) => {
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
        margin: '0 0 3rem 0'
      }}
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
        src={logo.logo}
        alt={`${logo.name} logo`}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          borderRadius: '0.25rem',
          filter: 'brightness(1.1) contrast(1.1)'
        }}
        onError={(e) => {
          console.error(`Failed to load logo: ${logo.name}`);
          e.target.style.display = 'none';
          e.target.parentElement.innerHTML = `
            <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: white; font-size: 0.7rem; text-align: center; padding: 0.5rem;">
              ${logo.name}
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
        {logo.name}
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