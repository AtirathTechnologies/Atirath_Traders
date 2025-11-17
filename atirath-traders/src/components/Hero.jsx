import React, { useState, useEffect, useRef } from 'react';

const Hero = () => {
  const [currentTitleIndex, setCurrentTitleIndex] = useState(0);
  const videoRef = useRef(null);

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
        
        {/* Title Navigation Dots */}
        {/* <div className="title-nav">
          {titles.map((_, index) => (
            <div
              key={index}
              className={`title-dot ${index === currentTitleIndex ? 'active' : ''}`}
              onClick={() => setCurrentTitleIndex(index)}
            />
          ))}
        </div> */}
      </div>
    </section>
  );
};

export default Hero;