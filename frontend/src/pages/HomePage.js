import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Users, GraduationCap, BarChart3, Heart } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Canadian Undergraduate
              <span className="accent-text"> Research Exchange</span>
            </h1>
            <p className="hero-description">
              The premier platform connecting Canadian undergraduate students with research opportunities across all STEM fields, 
              academic resources, and a thriving community of aspiring researchers, engineers, scientists, and scholars.
            </p>
            <div className="hero-buttons">
              <button 
                className="cta-primary"
                onClick={() => navigate('/students')}
              >
                Join the Network
              </button>
              <button 
                className="cta-secondary"
                onClick={() => navigate('/posters')}
              >
                Explore Resources
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
              <p>Connect with like-minded undergraduate students passionate about research.</p>
            </div>
            
            <div className="feature-card" onClick={() => navigate('/professors')}>
              <div className="feature-icon">
                <GraduationCap size={32} />
              </div>
              <h3>Professor Network</h3>
              <p>Find faculty mentors for research opportunities and career guidance.</p>
            </div>
            
            <div className="feature-card" onClick={() => navigate('/profiles')}>
              <div className="feature-icon">
                <BarChart3 size={32} />
              </div>
              <h3>EC Profiles</h3>
              <p>Anonymous profiles and statistics from accepted Canadian medical students.</p>
            </div>
            
            <div className="feature-card" onClick={() => navigate('/volunteer')}>
              <div className="feature-icon">
                <Heart size={32} />
              </div>
              <h3>Volunteer Opportunities</h3>
              <p>Discover medical-related volunteer opportunities to build your experience.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;