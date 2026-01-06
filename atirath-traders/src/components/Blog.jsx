import React from 'react';
import { useNavigate } from 'react-router-dom';

const Blog = ({ id }) => {
  const navigate = useNavigate();
  
  const blogPosts = [
    {
      id: 1,
      title: "The Future of Agriculture in India",
      excerpt: "Exploring the latest trends and technologies shaping Indian agriculture and how Atirath Traders is leading the way in modern farming solutions.",
      category: "Agriculture",
      image: "https://media.beehiiv.com/cdn-cgi/image/fit=scale-down,format=auto,onerror=redirect,quality=80/uploads/asset/file/f16c4b5c-d439-4b1f-b81c-8ab426673378/f3b719e9-e3c6-4851-8d64-8f7e7dfaac88_1792x1024.jpg?t=1716722272",
      fullContent: `
        <h2>The Future of Agriculture in India: A Technological Revolution</h2>
        <p>Indian agriculture is undergoing a significant transformation, driven by technological advancements and changing market dynamics. At Atirath Traders, we are at the forefront of this revolution, bringing innovative solutions to farmers across the nation.</p>
        
        <h3>Key Trends Shaping Indian Agriculture</h3>
        <ul>
          <li><strong>Precision Farming:</strong> Using IoT sensors and data analytics to optimize resource usage</li>
          <li><strong>Smart Irrigation:</strong> Automated systems that conserve water while maximizing yield</li>
          <li><strong>Digital Marketplaces:</strong> Connecting farmers directly with buyers</li>
          <li><strong>Climate-Resilient Crops:</strong> Developing varieties that withstand changing weather patterns</li>
        </ul>
        
        <h3>Our Role in This Transformation</h3>
        <p>Atirath Traders has been instrumental in introducing cutting-edge technologies to small and medium-scale farmers. Our initiatives include:</p>
        
        <p>Training programs on modern farming techniques, providing access to quality inputs, and establishing market linkages that ensure fair prices for produce.</p>
        
        <p>The future of Indian agriculture is bright, and we are committed to being partners in this journey towards sustainable and profitable farming.</p>
      `
    },
    {
      id: 2,
      title: "Sustainable Farming Practices",
      excerpt: "How modern farming techniques are helping preserve our environment while increasing productivity and ensuring food security for future generations.",
      category: "Sustainability",
      image: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      fullContent: `
        <h2>Sustainable Farming Practices for a Greener Future</h2>
        <p>Sustainable agriculture is no longer an option but a necessity. At Atirath Traders, we believe in farming practices that protect the environment while ensuring food security.</p>
        
        <h3>Core Principles of Sustainable Farming</h3>
        <ul>
          <li><strong>Soil Health Management:</strong> Using organic manure and crop rotation</li>
          <li><strong>Water Conservation:</strong> Implementing drip irrigation and rainwater harvesting</li>
          <li><strong>Biodiversity Preservation:</strong> Maintaining ecological balance</li>
          <li><strong>Integrated Pest Management:</strong> Reducing chemical pesticide usage</li>
        </ul>
        
        <h3>Our Sustainable Initiatives</h3>
        <p>We have successfully implemented several sustainable practices:</p>
        
        <p>Through our training programs, we've helped farmers reduce water consumption by 40% and chemical fertilizer usage by 60% while maintaining or even increasing yields.</p>
        
        <p>Sustainable farming is not just about protecting the environment; it's about creating a resilient agricultural system that can feed future generations.</p>
      `
    },
    {
      id: 3,
      title: "Market Trends in Agri-Commodities",
      excerpt: "Analysis of current market trends and future predictions for agricultural commodities in the Indian and global markets.",
      category: "Market",
      image: "https://media.istockphoto.com/id/952101188/photo/eco-friendly-sustainable-growth-concept.jpg?s=612x612&w=0&k=20&c=6yUoOGmbxWA3OxCPOUeU8qJIfCsbJaq76nv4Ru8zRJA=",
      fullContent: `
        <h2>Market Trends in Agri-Commodities: 2024 Outlook</h2>
        <p>The agricultural commodities market is experiencing dynamic changes driven by global demand, climate factors, and technological advancements.</p>
        
        <h3>Current Market Scenario</h3>
        <ul>
          <li><strong>Rising Demand:</strong> Increased global population driving food demand</li>
          <li><strong>Price Volatility:</strong> Climate change impacting production patterns</li>
          <li><strong>Export Opportunities:</strong> Growing international market for Indian produce</li>
          <li><strong>Quality Standards:</strong> Higher consumer awareness about food quality</li>
        </ul>
        
        <h3>Future Predictions</h3>
        <p>Based on our market analysis, we anticipate:</p>
        
        <p>Organic products will see 25% growth in market share, digital platforms will dominate commodity trading, and climate-resilient crops will become mainstream.</p>
        
        <p>Atirath Traders is positioned to help farmers navigate these market dynamics through our market intelligence services and direct market linkages.</p>
      `
    },
    {
      id: 4,
      title: "Innovations in Crop Protection",
      excerpt: "Latest advancements in crop protection technologies and how they're revolutionizing pest management in agriculture.",
      category: "Technology",
      image: "https://images.unsplash.com/photo-1560493676-04071c5f467b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      fullContent: `
        <h2>Innovations in Crop Protection: A New Era</h2>
        <p>Crop protection has evolved significantly from traditional methods to sophisticated technological solutions that are both effective and environmentally friendly.</p>
        
        <h3>Revolutionary Technologies</h3>
        <ul>
          <li><strong>Biopesticides:</strong> Natural alternatives to chemical pesticides</li>
          <li><strong>Drone Technology:</strong> Precision application of protection agents</li>
          <li><strong>AI-Powered Monitoring:</strong> Early detection of pest infestations</li>
          <li><strong>Nanotechnology:</strong> Targeted delivery of protection agents</li>
        </ul>
        
        <h3>Our Implementation Strategy</h3>
        <p>Atirath Traders has partnered with leading research institutions to bring these innovations to Indian farmers:</p>
        
        <p>Our integrated crop protection programs have helped farmers reduce pesticide usage by 70% while increasing crop quality and yield.</p>
        
        <p>The future of crop protection lies in smart, sustainable solutions that protect both crops and the environment.</p>
      `
    },
    {
      id: 5,
      title: "Organic Farming: Benefits and Challenges",
      excerpt: "Understanding the growing demand for organic produce and the challenges farmers face in transitioning to organic methods.",
      category: "Organic",
      image: "https://www.unicropbiochem.com/assets/images/blogs/174722684419webp.webp",
      fullContent: `
        <h2>Organic Farming: Navigating Benefits and Challenges</h2>
        <p>The organic farming movement is gaining momentum worldwide, but the transition from conventional to organic practices presents unique challenges and opportunities.</p>
        
        <h3>Benefits of Organic Farming</h3>
        <ul>
          <li><strong>Healthier Soil:</strong> Improved soil structure and fertility</li>
          <li><strong>Premium Prices:</strong> 20-30% higher market prices</li>
          <li><strong>Environmental Protection:</strong> Reduced chemical runoff</li>
          <li><strong>Consumer Trust:</strong> Growing demand for safe, chemical-free food</li>
        </ul>
        
        <h3>Overcoming Challenges</h3>
        <p>We help farmers navigate the transition period through:</p>
        
        <p>Comprehensive training programs, certification assistance, market linkage establishment, and continuous technical support during the conversion phase.</p>
        
        <p>While the initial years can be challenging, the long-term benefits of organic farming make it a sustainable choice for forward-thinking farmers.</p>
      `
    },
    {
      id: 6,
      title: "Water Management in Agriculture",
      excerpt: "Effective water management strategies that help conserve water while maintaining optimal crop yields in various farming conditions.",
      category: "Sustainability",
      image: "https://media.licdn.com/dms/image/v2/C4E12AQEzpBM71SOZKQ/article-cover_image-shrink_600_2000/article-cover_image-shrink_600_2000/0/1632557249992?e=2147483647&v=beta&t=SSmbzanuwqXLsIASuNw3_iCCc9zz8OThEGStmgj0P2o",
      fullContent: `
        <h2>Smart Water Management: The Future of Agricultural Irrigation</h2>
        <p>With water scarcity becoming a critical issue, efficient water management in agriculture is more important than ever. Atirath Traders is pioneering smart water solutions for Indian farmers.</p>
        
        <h3>Advanced Water Management Techniques</h3>
        <ul>
          <li><strong>Drip Irrigation:</strong> 90% water efficiency compared to flood irrigation</li>
          <li><strong>Soil Moisture Sensors:</strong> Real-time monitoring and automated irrigation</li>
          <li><strong>Rainwater Harvesting:</strong> Capturing and storing monsoon rains</li>
          <li><strong>Crop Water Requirement Analysis:</strong> Scientific calculation of water needs</li>
        </ul>
        
        <h3>Our Water Conservation Impact</h3>
        <p>Through our water management initiatives, we've helped farmers achieve:</p>
        
        <p>40-60% reduction in water usage, 25% increase in crop yield, and significant cost savings on electricity and labor.</p>
        
        <p>Water is the lifeline of agriculture, and smart management ensures this precious resource is available for future generations.</p>
      `
    }
  ];

  const handleReadMore = (postId) => {
    navigate(`/blog/${postId}`);
  };

  return (
    <section id={id} className="py-5" style={{ marginTop: '100px', minHeight: '100vh' }}>
      <div className="container">
        {/* Header Section */}
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold text-white mb-3">Our Blog</h1>
          <div className="row justify-content-center">
            <div className="col-lg-8">
              {/* Optional description can go here */}
            </div>
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="row g-4">
          {blogPosts.map((post) => (
            <div key={post.id} className="col-lg-4 col-md-6">
              <div className="card h-100 blog-card">
                <div className="card-img-top position-relative overflow-hidden" style={{ height: '200px' }}>
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-100 h-100 object-fit-cover"
                    style={{ transition: 'transform 0.3s ease' }}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                  />
                  <div className="position-absolute top-0 start-0 m-3">
                    <span className="badge bg-primary">{post.category}</span>
                  </div>
                </div>
                <div className="card-body">
                  <h5 className="card-title text-white mb-3">{post.title}</h5>
                  <p className="card-text text-light opacity-80 mb-3">{post.excerpt}</p>
                </div>
                <div className="card-footer border-0 bg-transparent pt-0">
                  <div className="d-flex justify-content-end">
                    <button 
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => handleReadMore(post.id)}
                    >
                      Read More →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Blog;