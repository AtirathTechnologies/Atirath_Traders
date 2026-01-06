import React from 'react';

const Leadership = () => {
  const leaders = [
    
    {
      name: "Mr. G. Chandar",
      position: "CEO",
      image: "/img/Leader/Director.png",
      description: "He brings expertise in real estate, agriculture, IT, and supply chain management. Having worked with international partners across MENA and USA markets, he plays a key role in driving operational excellence, building partnerships, and expanding Atirath Traders' global presence."
    },
    
    {
      name: "Mr. Md. Faiz",
      position: "Executive Director",
      image: "/img/Leader/faiz.jpg",
      description: "Mr. Faiz is an accomplished MBA graduate with deep expertise in finance, operations, and global trade, complemented by extensive international experience in IT and supply chain management. At Atirath Traders, he leads initiatives to strengthen financial discipline, optimize operational efficiency, and drive international expansion, consistently delivering sustainable growth and superior customer satisfaction."
    },
    {
      name: "Ms. Tripti Gaur",
      position: "Regional Director (Australia/Europe)",
      image: "/img/Leader/tripti.jpg",
      description: "With 10+ years of expertise in Marketing, HR, FMCG, Pharmaceuticals, Export-Import, and Strategic Leadership, she brings a wealth of knowledge to the organization. She holds MBA in HR & Marketing, she has successfully driven global business expansion and positioned the company as a strong player in agro-trade and exports."
    }
  ];

  return (
    <section id="leadership" className="py-5 px-3">
      <div className="container">
        {/* HEADING FIXED: Added margin-top to clear navbar */}
        <h3
          className="h2 fw-bold text-center accent mb-5"
          data-aos="zoom-in"
          style={{ marginTop: '80px' }}   // THIS LINE FIXES THE OVERLAP
        >
          Our Leadership
        </h3>

        <div className="row g-4">
          {leaders.map((leader, index) => (
            <div key={index} className="col-md-4" data-aos="fade-up" data-aos-delay={index * 200}>
              <div className="glass p-4 text-center h-100">
                <div className="leader-img-container mx-auto mb-3">
                  <img 
                    src={leader.image} 
                    alt={leader.position}
                    className="rounded-circle border-4 border-accent"
                  />
                  <div className="glitter-overlay">
                    <div className="glitter-particle particle-1"></div>
                    <div className="glitter-particle particle-2"></div>
                    <div className="glitter-particle particle-3"></div>
                    <div className="glitter-particle particle-4"></div>
                  </div>
                </div>
                <h4 className="h5 fw-semibold accent">{leader.position}</h4>
                <h4 className="h5 fw-semibold accent mb-3">{leader.name}</h4>
                <p className="small">{leader.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Leadership;