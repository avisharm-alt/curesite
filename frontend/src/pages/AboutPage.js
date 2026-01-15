import React from 'react';
import { Heart, MapPin, Users, Gift, Star, ArrowRight } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="page about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-content">
          <div className="about-hero-badge">
            <Heart size={16} />
            <span>Making a Difference</span>
          </div>
          <h1 className="about-hero-title">
            Guiding Communities
            <span className="accent-text"> Forward</span>
          </h1>
          <p className="about-hero-description">
            North Star Foundation is dedicated to supporting those in need within our communities. 
            All of our proceeds are donated to community-centered projects that make a real difference 
            in people's lives.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="about-section">
        <div className="about-container">
          <div className="section-header">
            <Star className="section-icon" size={32} />
            <h2>Our Mission</h2>
          </div>
          <p className="mission-text">
            At North Star Foundation, we believe everyone deserves warmth, dignity, and hope. 
            We work tirelessly to connect resources with those who need them most, focusing on 
            practical support that creates immediate impact in our communities.
          </p>
        </div>
      </section>

      {/* Impact Section */}
      <section className="about-section impact-section">
        <div className="about-container">
          <div className="section-header">
            <Heart className="section-icon" size={32} />
            <h2>Our Impact</h2>
          </div>
          
          <div className="impact-card featured">
            <div className="impact-card-header">
              <div className="impact-icon">
                <Gift size={40} />
              </div>
              <div className="impact-badge">Current Initiative</div>
            </div>
            <h3>Blanket Drive for the Homeless</h3>
            <div className="impact-location">
              <MapPin size={18} />
              <span>London, Ontario</span>
            </div>
            <p>
              Our first community initiative focuses on providing warmth to those experiencing 
              homelessness in London, Ontario. We're collecting and distributing blankets to 
              shelters, outreach programs, and directly to individuals in need on the streets.
            </p>
            <div className="impact-details">
              <div className="impact-detail">
                <span className="detail-label">Location</span>
                <span className="detail-value">London, Ontario, Canada</span>
              </div>
              <div className="impact-detail">
                <span className="detail-label">Focus</span>
                <span className="detail-value">Homeless Community Support</span>
              </div>
              <div className="impact-detail">
                <span className="detail-label">Item</span>
                <span className="detail-value">Blankets & Warm Essentials</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How We Help Section */}
      <section className="about-section">
        <div className="about-container">
          <div className="section-header">
            <Users className="section-icon" size={32} />
            <h2>How We Help</h2>
          </div>
          
          <div className="help-grid">
            <div className="help-card">
              <div className="help-number">01</div>
              <h4>Direct Support</h4>
              <p>We provide immediate assistance through blanket donations and essential items to those experiencing homelessness.</p>
            </div>
            <div className="help-card">
              <div className="help-number">02</div>
              <h4>Community Partnerships</h4>
              <p>We work with local shelters and organizations to maximize our impact and reach those most in need.</p>
            </div>
            <div className="help-card">
              <div className="help-number">03</div>
              <h4>100% Proceeds Donated</h4>
              <p>Every dollar raised goes directly to community-centered projects. No overhead, no exceptions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="about-section values-section">
        <div className="about-container">
          <div className="section-header">
            <Star className="section-icon" size={32} />
            <h2>Our Values</h2>
          </div>
          
          <div className="values-grid">
            <div className="value-item">
              <h4>Compassion</h4>
              <p>Every person deserves to be treated with dignity and kindness.</p>
            </div>
            <div className="value-item">
              <h4>Transparency</h4>
              <p>100% of proceeds go directly to helping those in need.</p>
            </div>
            <div className="value-item">
              <h4>Community</h4>
              <p>We believe in the power of communities coming together.</p>
            </div>
            <div className="value-item">
              <h4>Action</h4>
              <p>We focus on practical solutions that create immediate impact.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-section cta-section">
        <div className="about-container">
          <div className="cta-card">
            <h2>Join Our Mission</h2>
            <p>
              Whether through donations, volunteering, or spreading the word, 
              you can help us make a difference in the lives of those who need it most.
            </p>
            <div className="cta-buttons">
              <a href="/volunteer" className="cta-primary">
                Get Involved
                <ArrowRight size={18} />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
