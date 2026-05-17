import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="vs-footer">
      <div className="vs-footer-container">
        <div className="vs-footer-grid">
          <div className="vs-footer-brand">
            <Link to="/" className="vs-footer-wordmark">
              Vital Signs<span className="vs-period">.</span>
            </Link>
            <p className="vs-footer-tagline">
              A community where people share their health experiences to build empathy,
              reduce stigma, and feel a little less alone.
            </p>
          </div>

          <div className="vs-footer-col">
            <h4>— Read</h4>
            <Link to="/stories">All Stories</Link>
            <Link to="/stories?tag=Mental%20Health">Mental Health</Link>
            <Link to="/stories?tag=Chronic%20Illness">Chronic Illness</Link>
            <Link to="/stories?tag=Caregiving">Caregiving</Link>
          </div>

          <div className="vs-footer-col">
            <h4>— Contribute</h4>
            <Link to="/submit">Share a Story</Link>
            <Link to="/join">Join the Board</Link>
            <Link to="/about">About Vital Signs</Link>
          </div>

          <div className="vs-footer-col">
            <h4>— Connect</h4>
            <a href="mailto:hello@vitalsigns.org">hello@vitalsigns.org</a>
            <a href="https://utoronto.ca" target="_blank" rel="noreferrer">University of Toronto</a>
          </div>
        </div>

        <div className="vs-footer-bottom">
          <span>
            © {year} Vital Signs<span className="vs-period">.</span> &nbsp;&nbsp; All rights reserved.
          </span>
          <span>vitalsigns.org</span>
        </div>
      </div>

      <style>{`
        .vs-footer {
          background: var(--vs-charcoal);
          color: var(--vs-paper);
          padding: 96px 0 48px;
          position: relative;
          z-index: 3;
        }
        .vs-footer-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 96px;
        }
        .vs-footer-grid {
          display: grid;
          grid-template-columns: 1.6fr 1fr 1fr 1fr;
          gap: 64px;
          margin-bottom: 80px;
        }
        .vs-footer-brand { max-width: 36ch; }
        .vs-footer-wordmark {
          font-family: var(--vs-font-serif);
          font-weight: 600;
          font-size: 38px;
          letter-spacing: -0.02em;
          color: var(--vs-paper);
          line-height: 1;
          display: inline-block;
          margin-bottom: 20px;
        }
        .vs-footer-tagline {
          font-family: var(--vs-font-sans);
          font-size: 14px;
          color: rgba(245, 242, 234, 0.6);
          line-height: 1.6;
          margin: 0;
        }
        .vs-footer-col h4 {
          font-family: var(--vs-font-mono);
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--vs-coral);
          margin: 0 0 24px;
          line-height: 1;
        }
        .vs-footer-col a {
          display: block;
          font-family: var(--vs-font-sans);
          font-size: 14px;
          color: rgba(245, 242, 234, 0.78);
          margin-bottom: 12px;
          transition: color 200ms ease;
        }
        .vs-footer-col a:hover { color: var(--vs-coral); }

        .vs-footer-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 32px;
          border-top: 1px solid var(--vs-rule-dark);
          font-family: var(--vs-font-mono);
          font-size: 10.5px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: rgba(245, 242, 234, 0.5);
        }
        .vs-footer-bottom .vs-period { color: var(--vs-coral); }

        @media (max-width: 1024px) {
          .vs-footer-grid { grid-template-columns: 1fr 1fr; gap: 48px; }
        }
        @media (max-width: 900px) {
          .vs-footer-container { padding: 0 24px; }
        }
        @media (max-width: 600px) {
          .vs-footer-grid { grid-template-columns: 1fr; gap: 40px; }
          .vs-footer-bottom { flex-direction: column; gap: 12px; align-items: flex-start; }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
