import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              Vital Signs<span className="footer-logo-dot">.</span>
            </Link>
            <p className="footer-tagline">
              Real stories. Real health. Real people.
            </p>
          </div>
          
          <div className="footer-links">
            <div className="footer-column">
              <h4 className="footer-column-title">Platform</h4>
              <Link to="/stories">Read Stories</Link>
              <Link to="/submit">Share Your Story</Link>
              <Link to="/about">About Us</Link>
            </div>
            <div className="footer-column">
              <h4 className="footer-column-title">Legal</h4>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Content Guidelines</a>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Vital Signs. All rights reserved.</p>
        </div>
      </div>

      <style>{`
        .footer {
          background: var(--vs-black);
          color: var(--vs-white);
          padding: var(--vs-space-16) 0 var(--vs-space-8);
        }

        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 var(--vs-space-6);
        }

        .footer-top {
          display: flex;
          justify-content: space-between;
          padding-bottom: var(--vs-space-12);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .footer-brand {
          max-width: 280px;
        }

        .footer-logo {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--vs-white);
          text-decoration: none;
        }

        .footer-logo-dot {
          color: var(--vs-coral);
        }

        .footer-tagline {
          margin-top: var(--vs-space-3);
          font-size: 0.9375rem;
          color: rgba(255, 255, 255, 0.5);
        }

        .footer-links {
          display: flex;
          gap: var(--vs-space-16);
        }

        .footer-column {
          display: flex;
          flex-direction: column;
          gap: var(--vs-space-3);
        }

        .footer-column-title {
          font-size: 0.8125rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.4);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: var(--vs-space-2);
        }

        .footer-column a {
          font-size: 0.9375rem;
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          transition: color var(--vs-transition-fast);
        }

        .footer-column a:hover {
          color: var(--vs-white);
        }

        .footer-bottom {
          padding-top: var(--vs-space-8);
        }

        .footer-bottom p {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.4);
        }

        @media (max-width: 768px) {
          .footer-top {
            flex-direction: column;
            gap: var(--vs-space-10);
          }

          .footer-links {
            gap: var(--vs-space-10);
          }

          .footer-container {
            padding: 0 var(--vs-space-4);
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
