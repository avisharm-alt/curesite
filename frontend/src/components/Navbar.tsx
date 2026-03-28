import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { href: '/stories', label: 'Read Stories' },
    { href: '/submit', label: 'Share Your Story' },
    { href: '/about', label: 'About' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          Vital Signs
          <span className="navbar-logo-dot">.</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="navbar-links">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`navbar-link ${isActive(link.href) ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Sign In Button */}
        <div className="navbar-actions">
          <Link to="/signin" className="btn btn-secondary btn-sm">
            Sign In
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="navbar-mobile-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="navbar-mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="navbar-mobile-link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/signin"
              className="navbar-mobile-link navbar-mobile-signin"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Sign In
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .navbar {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(8px);
          border-bottom: 1px solid var(--vs-border);
        }

        .navbar-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 var(--vs-space-6);
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .navbar-logo {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--vs-black);
          text-decoration: none;
          letter-spacing: -0.02em;
        }

        .navbar-logo-dot {
          color: var(--vs-coral);
        }

        .navbar-links {
          display: flex;
          gap: var(--vs-space-8);
        }

        .navbar-link {
          font-size: 0.9375rem;
          font-weight: 500;
          color: var(--vs-text-secondary);
          text-decoration: none;
          transition: color var(--vs-transition-fast);
        }

        .navbar-link:hover,
        .navbar-link.active {
          color: var(--vs-text-primary);
        }

        .navbar-actions {
          display: flex;
          align-items: center;
          gap: var(--vs-space-4);
        }

        .navbar-mobile-btn {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--vs-text-primary);
          padding: var(--vs-space-2);
        }

        .navbar-mobile-menu {
          display: none;
          overflow: hidden;
          border-top: 1px solid var(--vs-border);
        }

        .navbar-mobile-link {
          display: block;
          padding: var(--vs-space-4) var(--vs-space-6);
          font-size: 1rem;
          font-weight: 500;
          color: var(--vs-text-primary);
          text-decoration: none;
          border-bottom: 1px solid var(--vs-border);
        }

        .navbar-mobile-link:hover {
          background: var(--vs-bg-hover);
        }

        .navbar-mobile-signin {
          color: var(--vs-coral);
        }

        @media (max-width: 768px) {
          .navbar-links,
          .navbar-actions {
            display: none;
          }

          .navbar-mobile-btn {
            display: block;
          }

          .navbar-mobile-menu {
            display: block;
          }

          .navbar-container {
            padding: 0 var(--vs-space-4);
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
