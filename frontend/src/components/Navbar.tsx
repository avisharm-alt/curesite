import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogOut } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

interface AuthUser {
  user_id: string;
  email: string;
  name: string;
  user_type: string;
  profile_picture?: string;
}

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Skip auth check if returning from OAuth callback
    if (window.location.hash?.includes('session_id=')) return;

    // Check if user was passed via route state (from AuthCallback)
    if (location.state && (location.state as any).user) {
      setUser((location.state as any).user);
      return;
    }

    // Check session via /auth/me
    fetch(`${API_URL}/api/auth/me`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => setUser(data))
      .catch(() => setUser(null));
  }, [location.state]);

  const handleSignOut = async () => {
    try {
      await fetch(`${API_URL}/api/auth/signout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {}
    setUser(null);
    navigate('/');
  };

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

        {/* Sign In / User Actions */}
        <div className="navbar-actions">
          {user ? (
            <div className="navbar-user" data-testid="navbar-user">
              <span className="navbar-user-name">{user.name}</span>
              {user.user_type === 'admin' && (
                <Link to="/admin" className="btn btn-secondary btn-sm" data-testid="admin-link">
                  Admin
                </Link>
              )}
              <button className="navbar-signout" onClick={handleSignOut} data-testid="signout-btn" title="Sign out">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link to="/signin" className="btn btn-secondary btn-sm" data-testid="signin-btn">
              Sign In
            </Link>
          )}
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
            {user ? (
              <>
                {user.user_type === 'admin' && (
                  <Link to="/admin" className="navbar-mobile-link" onClick={() => setIsMobileMenuOpen(false)}>
                    Admin Dashboard
                  </Link>
                )}
                <button className="navbar-mobile-link navbar-mobile-signin" onClick={() => { setIsMobileMenuOpen(false); handleSignOut(); }}>
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                to="/signin"
                className="navbar-mobile-link navbar-mobile-signin"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign In
              </Link>
            )}
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

        .navbar-user {
          display: flex;
          align-items: center;
          gap: var(--vs-space-3);
        }

        .navbar-user-name {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--vs-text-primary);
        }

        .navbar-signout {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          background: transparent;
          border: 1px solid var(--vs-border);
          border-radius: var(--vs-radius-md);
          color: var(--vs-text-secondary);
          cursor: pointer;
          transition: all var(--vs-transition-fast);
        }

        .navbar-signout:hover {
          border-color: var(--vs-coral);
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
