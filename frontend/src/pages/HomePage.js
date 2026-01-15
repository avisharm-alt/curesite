import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Users, GraduationCap, BarChart3, Heart, Info } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              North Star
              <span className="accent-text"> Foundation</span>
            </h1>
            <p className="hero-description">
              Guiding communities forward through compassion and action. We support those in need with 
              100% of proceeds going directly to community-centered projects helping the homeless and vulnerable.
            </p>
            <div className="hero-buttons">
              <button 
                className="cta-primary"
                onClick={() => navigate('/about')}
              >
                Learn About Our Impact
              </button>
              <button 
                className="cta-secondary"
                onClick={() => navigate('/volunteer')}
              >
                Get Involved
              </button>
            </div>
          </div>
          <div className="partner-universities-hero">
            <div className="university-crests">
              <img 
                src="https://customer-assets.emergentagent.com/job_948ff013-2cd0-406a-97a8-f570e6ddf57c/artifacts/qpgs5g6x_University_of_Western_Ontario_Logosvg.png"
                alt="Western University"
                className="university-crest"
              />
              <img 
                src="https://customer-assets.emergentagent.com/job_948ff013-2cd0-406a-97a8-f570e6ddf57c/artifacts/1se48470_Utoronto_coa.svg.png"
                alt="University of Toronto"
                className="university-crest university-crest-uoft"
              />
              <img 
                src="https://customer-assets.emergentagent.com/job_948ff013-2cd0-406a-97a8-f570e6ddf57c/artifacts/k8n0udka_McMaster_University_logosvg.png"
                alt="McMaster University"
                className="university-crest"
              />
              <img 
                src="https://customer-assets.emergentagent.com/job_948ff013-2cd0-406a-97a8-f570e6ddf57c/artifacts/0xgsnp2p_QueensU_Crest.svg.png"
                alt="Queen's University"
                className="university-crest"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="features-overview">
        <div className="container">
          <h2 className="section-title">Explore The Platform</h2>
          <div className="features-grid">
            <div className="feature-card" onClick={() => navigate('/about')}>
              <div className="feature-icon">
                <Heart size={32} />
              </div>
              <h3>Our Impact</h3>
              <p>Learn how we're making a difference in the homeless community, starting with blanket drives in London, Ontario.</p>
            </div>
            
            <div className="feature-card" onClick={() => navigate('/posters')}>
              <div className="feature-icon">
                <FileText size={32} />
              </div>
              <h3>Poster Journal</h3>
              <p>Showcase your research and discover groundbreaking work from students across Canada.</p>
            </div>
            
            <div className="feature-card" onClick={() => navigate('/students')}>
              <div className="feature-icon">
                <Users size={32} />
              </div>
              <h3>Student Network</h3>
              <p>Connect with like-minded undergraduate researchers.</p>
            </div>
            
            <div className="feature-card" onClick={() => navigate('/volunteer')}>
              <div className="feature-icon">
                <GraduationCap size={32} />
              </div>
              <h3>Volunteer Opportunities</h3>
              <p>Find opportunities to give back and make a difference in your community.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;