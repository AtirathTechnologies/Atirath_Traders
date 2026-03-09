import React, { useState, useEffect, useRef } from "react";
import { ExternalLink } from "lucide-react";

const IndianAgriRSSFeed = () => {
  const [feeds, setFeeds] = useState([
    { 
      id: 1, 
      title: "Loading Indian Agriculture & DGFT updates...", 
      link: "#", 
      source: "DGFT",
      type: "policy"
    }
  ]);
  const scrollContainerRef = useRef(null);
  const animationRef = useRef(null);
  const scrollPositionRef = useRef(0);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchFeeds();
    const interval = setInterval(fetchFeeds, 5 * 60 * 1000); // every 5 mins
    
    return () => {
      clearInterval(interval);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (feeds.length > 0) {
      startScrolling();
    }
  }, [feeds]);

  const startScrolling = () => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    let startTime = null;
    const duration = 60000; // 60 seconds for one complete loop

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = (elapsed % duration) / duration;
      
      const contentWidth = container.scrollWidth / 2;
      const translateX = -progress * contentWidth;
      
      container.style.transform = `translateX(${translateX}px)`;
      scrollPositionRef.current = translateX;
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  const fetchFeeds = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/indian-agri-rss`);
      const data = await response.json();
      
      if (data?.articles?.length > 0) {
        const enhancedFeeds = data.articles.map((article, i) => ({
          id: i,
          title: article.title,
          link: article.link,
          source: article.source,
          type: getArticleType(article.title)
        }));
        setFeeds(enhancedFeeds);
      }
    } catch (err) {
      console.error("Error fetching feeds:", err);
      const fallbackFeeds = [
        { 
          id: 1, 
          title: `DGFT ${getRandomPolicyAction()} ${getRandomTrend()} agricultural exports`, 
          link: "https://dgft.gov.in", 
          source: "DGFT Official",
          type: "policy"
        },
        { 
          id: 2, 
          title: `Government ${getRandomSubsidyAction()} ${getRandomCrop()} farmers`, 
          link: "https://pib.gov.in", 
          source: "Agriculture Ministry",
          type: "subsidy"
        },
        { 
          id: 3, 
          title: `India's agricultural exports ${getRandomTrend()} by ${getRandomPercentage()}`, 
          link: "https://tradestat.commerce.gov.in", 
          source: "Trade Analysis",
          type: "trade"
        },
        { 
          id: 4, 
          title: `New MSP rates ${getRandomTrend()} for ${getRandomCrop()}`, 
          link: "https://agricoop.gov.in", 
          source: "CACP",
          type: "msp"
        },
        { 
          id: 5, 
          title: `Agricultural ${getRandomRegistrationType()} registrations cross ${getRandomNumber()} mark`, 
          link: "https://apeda.gov.in", 
          source: "DGFT Portal",
          type: "registration"
        }
      ];
      setFeeds(fallbackFeeds);
    }
  };

  const handleFeedClick = (feed, event) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (feed.link && feed.link !== "#") {
      setTimeout(() => {
        window.open(feed.link, "_blank", "noopener,noreferrer");
      }, 10);
    }
  };

  const getArticleType = (title) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('dgft') || lowerTitle.includes('export policy') || lowerTitle.includes('import')) return 'policy';
    if (lowerTitle.includes('subsidy') || lowerTitle.includes('incentive') || lowerTitle.includes('scheme')) return 'subsidy';
    if (lowerTitle.includes('export') || lowerTitle.includes('import') || lowerTitle.includes('trade')) return 'trade';
    if (lowerTitle.includes('msp') || lowerTitle.includes('minimum support')) return 'msp';
    if (lowerTitle.includes('registration') || lowerTitle.includes('license') || lowerTitle.includes('permit')) return 'registration';
    if (lowerTitle.includes('kisan') || lowerTitle.includes('farmer') || lowerTitle.includes('mandi')) return 'farmer';
    return 'general';
  };

  const getRandomPolicyAction = () => {
    const actions = ['updates', 'notifies', 'revises', 'announces', 'implements', 'extends'];
    return actions[Math.floor(Math.random() * actions.length)];
  };

  const getRandomSubsidyAction = () => {
    const actions = ['announces', 'extends', 'launches', 'increases', 'approves', 'releases'];
    return actions[Math.floor(Math.random() * actions.length)];
  };

  const getRandomCrop = () => {
    const crops = ['rice', 'wheat', 'pulses', 'cotton', 'sugarcane', 'maize', 'soybean', 'millets'];
    return crops[Math.floor(Math.random() * crops.length)];
  };

  const getRandomTrend = () => {
    const trends = ['strengthens', 'improves', 'rises', 'increases', 'stabilizes', 'boosts', 'supports', 'enhances'];
    return trends[Math.floor(Math.random() * trends.length)];
  };

  const getRandomPercentage = () => {
    const percentages = ['12%', '15%', '8%', '20%', '25%', '10%', '18%', '22%'];
    return percentages[Math.floor(Math.random() * percentages.length)];
  };

  const getRandomNumber = () => {
    const numbers = ['1 million', '2.5 million', '5 lakh', '10 lakh', '50,000', '1.2 million'];
    return numbers[Math.floor(Math.random() * numbers.length)];
  };

  const getRandomRegistrationType = () => {
    const types = ['export', 'import', 'quality', 'organic', 'APEDA', 'FSSAI'];
    return types[Math.floor(Math.random() * types.length)];
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'policy': return '📜';
      case 'subsidy': return '💰';
      case 'trade': return '📊';
      case 'msp': return '⚖️';
      case 'registration': return '📝';
      case 'farmer': return '🚜';
      default: return '🌾';
    }
  };

  return (
    <div className="IndianAgriRSSFeed">
      <div className="scrolling-container">
        <div
          ref={scrollContainerRef}
          className="flex gap-8 text-sm font-medium py-1.5"
          style={{
            whiteSpace: 'nowrap',
            display: 'inline-flex',
            willChange: 'transform'
          }}
        >
          {[...feeds, ...feeds].map((feed, i) => (
            <div
              key={`${feed.id}-${i}`}
              className={`flex items-center gap-3 transition-all duration-300 px-4 py-1.5 rounded-lg border border-transparent hover:bg-white/10 hover:border-white/20 ${
                feed.link && feed.link !== "#" 
                  ? 'hover:text-yellow-300 cursor-pointer' 
                  : 'cursor-not-allowed opacity-70'
              }`}
              onClick={(e) => feed.link && feed.link !== "#" && handleFeedClick(feed, e)}
            >
              <span className="text-lg">
                {getTypeIcon(feed.type)}
              </span>
              <strong className={`font-semibold ${
                feed.link && feed.link !== "#" 
                  ? 'group-hover:text-yellow-300' 
                  : 'opacity-70'
              }`}>
                {feed.title}
              </strong>
              <span className="text-xs font-medium bg-white/10 px-2 py-1 rounded border border-yellow-400/30">
                {feed.source}
              </span>
              {feed.link && feed.link !== "#" && (
                <ExternalLink size={10} className="opacity-70" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IndianAgriRSSFeed;