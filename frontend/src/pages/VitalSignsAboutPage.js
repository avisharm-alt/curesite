import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Users, Shield, MessageCircleHeart, PenLine } from 'lucide-react';

const VitalSignsAboutPage = () => {
  const navigate = useNavigate();

  return (
    <div className="vs-page vs-about-page">
      {/* Hero Section */}
      <section className="vs-about-hero">
        <div className="vs-container">
          <div className="vs-about-hero-content">
            <h1>About Vital Signs</h1>
            <p className="vs-about-tagline">
              A community where health stories create connection, understanding, and hope.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="vs-mission-section">
        <div className="vs-container">
          <div className="vs-mission-content">
            <div className="vs-mission-icon">
              <Heart size={48} />
            </div>
            <h2>Our Mission</h2>
            <p>
              Health experiences are deeply personal, yet remarkably universal. Whether you're 
              navigating a chronic illness, supporting a loved one through treatment, or reflecting 
              on a health journey that changed your life—your story matters.
            </p>
            <p>
              Vital Signs exists to create a safe space where people can share their authentic 
              health experiences. We believe that storytelling has the power to reduce stigma, 
              build empathy, and help others feel less alone in their struggles.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="vs-values-section">
        <div className="vs-container">
          <h2>What We Stand For</h2>
          <div className="vs-values-grid">
            <div className="vs-value-card">
              <div className="vs-value-icon">
                <MessageCircleHeart size={32} />
              </div>
              <h3>Authenticity</h3>
              <p>
                Real stories from real people. We value honest, unfiltered experiences that 
                reflect the true complexity of health journeys.
              </p>
            </div>
            
            <div className="vs-value-card">
              <div className="vs-value-icon">
                <Users size={32} />
              </div>
              <h3>Community</h3>
              <p>
                You're not alone. Our platform connects people through shared experiences, 
                creating a supportive community of understanding.
              </p>
            </div>
            
            <div className="vs-value-card">
              <div className="vs-value-icon">
                <Shield size={32} />
              </div>
              <h3>Safety</h3>
              <p>
                Your comfort matters. Share anonymously if you prefer, and know that all 
                stories are reviewed to maintain a respectful, supportive environment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="vs-how-section">
        <div className="vs-container">
          <h2>How It Works</h2>
          <div className="vs-steps-grid">
            <div className="vs-step">
              <div className="vs-step-number">1</div>
              <h3>Share Your Story</h3>
              <p>Write about your health experience—whether it's a diagnosis, recovery, caregiving, or anything in between.</p>
            </div>
            <div className="vs-step">
              <div className="vs-step-number">2</div>
              <h3>We Review</h3>
              <p>Our team reviews submissions to ensure a safe, supportive environment for everyone.</p>
            </div>
            <div className="vs-step">
              <div className="vs-step-number">3</div>
              <h3>Connect & Heal</h3>
              <p>Your story is published and others can resonate with it, creating connections that help everyone feel less alone.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Section */}
      <section className="vs-privacy-section">
        <div className="vs-container">
          <div className="vs-privacy-content">
            <Shield size={32} />
            <h2>Your Privacy Matters</h2>
            <p>
              We take your privacy seriously. You can choose to share your story anonymously, 
              and your personal information is never shared publicly. Only our moderation team 
              can see your identity to ensure the authenticity and safety of our platform.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="vs-about-cta">
        <div className="vs-container">
          <div className="vs-about-cta-content">
            <h2>Ready to Share Your Story?</h2>
            <p>Your experience could be exactly what someone else needs to hear today.</p>
            <button 
              className="vs-btn-primary vs-btn-large"
              onClick={() => navigate('/submit')}
            >
              <PenLine size={24} />
              Share Your Story
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default VitalSignsAboutPage;
