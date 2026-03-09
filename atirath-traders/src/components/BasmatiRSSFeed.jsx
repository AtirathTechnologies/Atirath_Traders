import React, { useState, useEffect, useRef } from "react";
import { RotateCw, TrendingUp, BarChart3, ExternalLink } from "lucide-react";

const BasmatiRSSFeed = () => {
  const [feeds, setFeeds] = useState([
    { id: 1, title: "Loading live rice market updates...", link: "#", source: "Market Watch", type: "info" }
  ]);
  const [loading, setLoading] = useState(false);
  const [paused, setPaused] = useState(false);
  const [currentTitle, setCurrentTitle] = useState("🌾 Live Rice Market Updates");
  const [marketTrend, setMarketTrend] = useState("loading");
  const [activeFeed, setActiveFeed] = useState(null);
  const scrollContainerRef = useRef(null);
  const animationRef = useRef(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchFeeds();
    const interval = setInterval(fetchFeeds, 1 * 60 * 1000);
    const titleInterval = setInterval(rotateTitle, 15000);
    
    return () => {
      clearInterval(interval);
      clearInterval(titleInterval);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!paused && feeds.length > 1) {
      startScrolling();
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [paused, feeds]);

  const startScrolling = () => {
    if (!scrollContainerRef.current || feeds.length <= 1) return;

    const container = scrollContainerRef.current;
    const contentWidth = container.scrollWidth / 2;
    let startTime = null;
    const duration = 120000; // 120 seconds for one complete loop

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Calculate translateX for right-to-left scrolling
      const translateX = -progress * contentWidth;
      
      container.style.transform = `translateX(${translateX}px)`;
      
      // Reset position when animation completes and loop
      if (progress >= 1) {
        startTime = timestamp;
      }
      
      if (!paused) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  const fetchFeeds = async () => {
    try {
      setLoading(true);
      const rssResponse = await fetch(`${API_BASE_URL}/rss`);
      const rssData = await rssResponse.json();

      if (rssData.current_title) setCurrentTitle(rssData.current_title);
      setMarketTrend(rssData.market_trend || "stable");

      if (rssData?.articles?.length > 0) {
        const enhancedFeeds = rssData.articles.map((article, i) => ({
          id: i,
          title: article.title,
          link: article.link || "#",
          source: article.source,
          type: getArticleType(article.title)
        }));
        setFeeds(enhancedFeeds);
      }
    } catch (err) {
      console.error("Error fetching feeds:", err);
      const fallbackFeeds = [
        { id: 1, title: `Basmati rice prices ${getRandomTrend()} amid ${getRandomCondition()}`, link: "https://example.com/price", source: "Market Intelligence", type: "price" },
        { id: 2, title: `Rice export demand ${getRandomTrend()} in international markets`, link: "https://example.com/export", source: "Trade Watch", type: "export" },
        { id: 3, title: `New rice varieties show ${getRandomTrend()} yield potential`, link: "https://example.com/innovation", source: "AgriTech", type: "innovation" },
        { id: 4, title: `Government announces new policies for rice exports`, link: "https://example.com/policy", source: "Policy Update", type: "policy" },
        { id: 5, title: `Weather conditions ${getRandomTrend()} rice production estimates`, link: "https://example.com/weather", source: "Agri Weather", type: "weather" }
      ];
      setFeeds(fallbackFeeds);
      setCurrentTitle(getRandomTitle());
    } finally {
      setLoading(false);
    }
  };

  const rotateTitle = () => {
    const titles = [
      "🌾 Live Rice Market Updates: Prices, Exports & Trends",
      "📈 Real-time Basmati Prices & Market Intelligence",
      "💹 Live Agri-Commodity Updates: Rice & Grains",
      "🌱 Rice Export News & Price Fluctuations"
    ];
    setCurrentTitle(titles[Math.floor(Math.random() * titles.length)]);
  };

  const handleFeedClick = (feed) => {
    console.log("Clicked feed link:", feed.link);
    if (feed.link && feed.link !== "#") {
      window.open(feed.link, "_blank", "noopener,noreferrer");
    }
    setActiveFeed(feed.id);
    setTimeout(() => setActiveFeed(null), 1000);
  };

  const getArticleType = (title) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('price') || lowerTitle.includes('cost') || lowerTitle.includes('msp')) return 'price';
    if (lowerTitle.includes('export') || lowerTitle.includes('import') || lowerTitle.includes('trade')) return 'trade';
    if (lowerTitle.includes('new') || lowerTitle.includes('technology') || lowerTitle.includes('innovation')) return 'innovation';
    if (lowerTitle.includes('weather') || lowerTitle.includes('monsoon') || lowerTitle.includes('crop')) return 'weather';
    if (lowerTitle.includes('policy') || lowerTitle.includes('government') || lowerTitle.includes('subsidy')) return 'policy';
    return 'info';
  };

  const getRandomTrend = () => {
    const trends = ['rising', 'falling', 'stable', 'volatile', 'strengthening', 'weakening'];
    return trends[Math.floor(Math.random() * trends.length)];
  };

  const getRandomCondition = () => {
    const conditions = ['strong export demand', 'supply constraints', 'good monsoon', 'trade negotiations', 'market speculation'];
    return conditions[Math.floor(Math.random() * conditions.length)];
  };

  const getRandomTitle = () => {
    const titles = [
      "🌾 Live Rice Market Intelligence",
      "📈 Real-time Commodity Updates",
      "💹 Basmati Price Watch Live"
    ];
    return titles[Math.floor(Math.random() * titles.length)];
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'price': return '💰';
      case 'trade': return '🚢';
      case 'innovation': return '🔬';
      case 'weather': return '🌤️';
      case 'policy': return '📜';
      default: return '📰';
    }
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'price': return 'text-yellow-400';
      case 'trade': return 'text-yellow-300';
      case 'innovation': return 'text-yellow-200';
      case 'weather': return 'text-yellow-100';
      case 'policy': return 'text-amber-300';
      default: return 'text-yellow-500';
    }
  };

  const getTrendColor = () => {
    switch(marketTrend) {
      case 'up': return 'text-green-400';
      case 'down': return 'text-red-400';
      case 'stable': return 'text-yellow-400';
      default: return 'text-yellow-300';
    }
  };

  const getTrendIcon = () => {
    switch(marketTrend) {
      case 'up': return '📈';
      case 'down': return '📉';
      case 'stable': return '➡️';
      default: return '📊';
    }
  };

  return (
    <div className="w-full h-16 bg-gradient-to-r from-black to-gray-900 border-b-2 border-yellow-600 shadow-lg z-30 overflow-hidden fixed top-14">
      {/* Scrolling News Ticker */}
      <div className="w-full h-full flex items-center relative bg-black">
        <div className="flex-1 overflow-hidden">
          <div
            ref={scrollContainerRef}
            className="flex gap-8 text-yellow-100 text-sm font-medium py-2 scrolling-container"
            style={{
              whiteSpace: 'nowrap',
              display: 'inline-flex',
              willChange: 'transform'
            }}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {[...feeds, ...feeds].map((feed, i) => (
              <div
                key={`${feed.id}-${i}`}
                className={`flex items-center gap-3 cursor-pointer transition-all duration-300 px-4 py-1.5 rounded-lg border ${
                  activeFeed === feed.id 
                    ? 'bg-yellow-600/30 border-yellow-400 scale-105' 
                    : 'hover:bg-yellow-900/50 hover:border-yellow-300/50 border-yellow-600/30'
                } ${
                  feed.link && feed.link !== "#" 
                    ? 'hover:text-yellow-200' 
                    : 'cursor-not-allowed opacity-70'
                }`}
                onClick={() => handleFeedClick(feed)}
              >
                <span className={`text-lg ${getTypeColor(feed.type)}`}>
                  {getTypeIcon(feed.type)}
                </span>
                <strong className={`font-semibold ${
                  feed.link && feed.link !== "#" 
                    ? 'text-yellow-100 group-hover:text-yellow-200' 
                    : 'text-yellow-200/70'
                }`}>
                  {feed.title}
                </strong>
                <span className="text-yellow-300 text-xs font-medium bg-yellow-900/30 px-2 py-1 rounded border border-yellow-500/30">
                  {feed.source}
                </span>
                {feed.link && feed.link !== "#" && (
                  <ExternalLink size={12} className="text-yellow-300 opacity-70" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasmatiRSSFeed;