import React from 'react';

const About = () => {
  return (
    <section id="about" className="py-5 px-3">
      <div className="container">
        {/* HERO-LEVEL HEADING – now has extra top margin to clear the navbar */}
        <h2
          className="display-4 fw-bold accent text-center mb-5"
          data-aos="zoom-in"
          style={{ marginTop: '80px' }}
        >
          About Us
        </h2>

        {/* First row */}
        <div className="row align-items-center mb-5">
          <div className="col-md-6 mb-4 mb-md-0" data-aos="fade-right">
            <img
              src="/img/found.jpg"
              alt="ATIRATH GROUP Overview"
              className="img-fluid rounded-3 shadow"
            />
          </div>
          <div className="col-md-6" data-aos="fade-up">
            <h3 className="h1 fw-bold accent mb-3">Foundation</h3>
            <p className="lead opacity-90">
              Atirath Traders India Pvt. Ltd. — a fast-growing, globally connected trading powerhouse founded in 2023 and headquartered
              in Hyderabad, Telangana, India, with a strategic presence in Guwahati, Assam, India, and key international markets
              including UAE, Oman, Africa, USA, and UK.
              We specialize in wholesale trading, import, and export of high-demand categories, including FMCG, agricultural commodities, edible oils, and personal care products.
            </p>
          </div>
        </div>

        {/* Second row */}
        <div className="row align-items-center mb-5">
          <div className="col-md-6 order-2 order-md-1" data-aos="fade-up">
            <h3 className="h1 fw-bold accent mb-3">Diversified Portfolio</h3>
            <p className="lead opacity-90">
              Highlight our competitive edge — quality-driven sourcing, agile supply chain excellence, and customer-first
              philosophy — backed by a team blending deep local market insight with global trade expertise. Convey our
              mission: to be the trusted bridge between global suppliers and buyers, enabling sustainable, scalable growth
              for all stakeholders. Tone: confident, professional, forward-thinking, and partnership-oriented.
            </p>
          </div>
          <div className="col-md-6 mb-4 mb-md-0 order-1 order-md-2" data-aos="fade-left">
            <img
              src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
              alt="Diversified Portfolio"
              className="img-fluid rounded-3 shadow"
            />
          </div>
        </div>

        {/* Third row */}
        <div className="row align-items-center mb-5">
          <div className="col-md-6 mb-4 mb-md-0" data-aos="fade-right">
            <img
              src="https://images.unsplash.com/photo-1506784983877-45594efa4cbe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
              alt="Our Vision"
              className="img-fluid rounded-3 shadow"
            />
          </div>
          <div className="col-md-6" data-aos="fade-up">
            <h3 className="h1 fw-bold accent mb-3">Our Vision</h3>
            <p className="lead opacity-90 mb-4">
              To be the leading global trading partner, recognized internationally for our profound expertise, unwavering
              ethical practices, and steadfast commitment to achieving unparalleled client success.
            </p>
            <h3 className="h1 fw-bold accent mb-3">Our Mission</h3>
            <p className="lead opacity-90">
              To facilitate seamless and profitable trade connections, empowering businesses of all sizes to thrive in the
              dynamic global marketplace. We aim to simplify international trade complexities for our partners.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;