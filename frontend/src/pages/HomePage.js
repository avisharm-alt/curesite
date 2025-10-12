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
              The premier platform connecting Canadian undergraduate students with research opportunities, 
              medical school preparation resources, and a thriving community of future healthcare professionals.
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
          <div className="hero-image">
            <img 
              src="https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwcmVzZWFyY2h8ZW58MHx8fHwxNzU3OTkwMjE1fDA&ixlib=rb-4.1.0&q=85"
              alt="Medical Research"
              className="hero-img"
            />
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