import React from 'react';
import { Mail, Instagram, Send, MapPin, Heart } from 'lucide-react';

const ContactPage = () => {
  return (
    <div className="page contact-page">
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="contact-hero-content">
          <div className="contact-hero-badge">
            <Heart size={16} />
            <span>Get In Touch</span>
          </div>
          <h1 className="contact-hero-title">
            Contact
            <span className="accent-text"> Us</span>
          </h1>
          <p className="contact-hero-description">
            Have questions about our initiatives or want to get involved? 
            We'd love to hear from you. Reach out through any of the channels below.
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="contact-section">
        <div className="contact-container">
          <div className="contact-grid">
            {/* Email Card */}
            <a 
              href="mailto:contact.northstarfoundation@gmail.com" 
              className="contact-card"
            >
              <div className="contact-icon">
                <Mail size={32} />
              </div>
              <h3>Email Us</h3>
              <p className="contact-value">contact.northstarfoundation@gmail.com</p>
              <p className="contact-description">
                For general inquiries, partnership opportunities, or questions about our programs.
              </p>
              <div className="contact-cta">
                <Send size={16} />
                <span>Send Email</span>
              </div>
            </a>

            {/* Instagram Card */}
            <a 
              href="https://instagram.com/northstarfdn" 
              target="_blank" 
              rel="noopener noreferrer"
              className="contact-card"
            >
              <div className="contact-icon instagram">
                <Instagram size={32} />
              </div>
              <h3>Follow Us</h3>
              <p className="contact-value">@northstarfdn</p>
              <p className="contact-description">
                Stay updated on our latest initiatives, events, and community impact stories.
              </p>
              <div className="contact-cta">
                <Instagram size={16} />
                <span>Follow on Instagram</span>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section className="contact-section location-section">
        <div className="contact-container">
          <div className="location-card">
            <div className="location-icon">
              <MapPin size={24} />
            </div>
            <div className="location-info">
              <h3>Our Focus Area</h3>
              <p>Currently serving the London, Ontario community</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="contact-section cta-section">
        <div className="contact-container">
          <div className="contact-cta-card">
            <h2>Want to Make a Difference?</h2>
            <p>
              Whether you want to volunteer, donate, or simply learn more about our work,
              we're here to help you get involved.
            </p>
            <div className="cta-buttons">
              <a href="/about" className="cta-primary">
                Learn About Our Impact
              </a>
              <a href="/volunteer" className="cta-secondary">
                Volunteer Opportunities
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
