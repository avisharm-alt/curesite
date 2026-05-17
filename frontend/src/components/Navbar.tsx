import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';

interface AuthUser {
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
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      try { setUser(JSON.parse(storedUser)); } catch { setUser(null); }
    } else { setUser(null); }
  }, [location]);

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  const navLinks = [
    { href: '/stories', label: 'Stories' },
    { href: '/submit', label: 'Share' },
    { href: '/join', label: 'Join Us' },
    { href: '/about', label: 'About' },
  ];

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Wordmark */}
        <Link to="/" className="navbar-logo" aria-label="Vital Signs home">
          Vital Signs<span className="navbar-logo-dot">.</span>
        </Link>

        {/* Desktop nav */}
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

        {/* Right side */}
        <div className="navbar-actions">
          <div className="navbar-affiliation" aria-label="University of Toronto Affiliated">
            <span>University of Toronto</span>
            <span>Affiliated</span>
          </div>

          {user ? (
            <div className="navbar-user" data-testid="navbar-user">
              <span className="navbar-user-name">— {user.name?.split(' ')[0]}</span>
              {user.user_type === 'admin' && (
                <Link to="/admin" className="btn btn-secondary btn-sm" data-testid="admin-link">
                  Admin
                </Link>
              )}
              <button className="navbar-signout" onClick={handleSignOut} data-testid="signout-btn">
                Sign out
              </button>
            </div>
          ) : (
            <Link to="/signin" className="btn btn-primary btn-sm" data-testid="signin-btn">
              Sign in
            </Link>
          )}

          <button
            className="navbar-mobile-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

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
                className={`navbar-mobile-link ${isActive(link.href) ? 'active' : ''}`}
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
                <button className="navbar-mobile-link navbar-mobile-cta" onClick={() => { setIsMobileMenuOpen(false); handleSignOut(); }}>
                  Sign Out
                </button>
              </>
            ) : (
              <Link to="/signin" className="navbar-mobile-link navbar-mobile-cta" onClick={() => setIsMobileMenuOpen(false)}>
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
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: saturate(180%) blur(12px);
          -webkit-backdrop-filter: saturate(180%) blur(12px);
          border-bottom: 1px solid var(--vs-rule);
        }
        .navbar-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 22px 96px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 40px;
        }
        .navbar-logo {
          font-family: var(--vs-font-serif);
          font-feature-settings: "liga", "kern";
          font-weight: 600;
          font-size: 26px;
          letter-spacing: -0.01em;
          color: var(--vs-ink);
          line-height: 1;
          white-space: nowrap;
        }
        .navbar-logo-dot { color: var(--vs-coral); }

        .navbar-links {
          display: flex;
          gap: 32px;
          align-items: center;
        }
        .navbar-link {
          position: relative;
          font-family: var(--vs-font-sans);
          font-size: 14px;
          font-weight: 500;
          color: var(--vs-ink);
          padding-bottom: 4px;
          transition: color 200ms ease;
        }
        .navbar-link::after {
          content: "";
          position: absolute;
          left: 0; bottom: 0;
          width: 0; height: 1px;
          background: var(--vs-coral);
          transition: width 220ms ease;
        }
        .navbar-link:hover,
        .navbar-link.active { color: var(--vs-coral); }
        .navbar-link:hover::after,
        .navbar-link.active::after { width: 100%; }

        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .navbar-affiliation {
          font-family: var(--vs-font-mono);
          font-size: 10.5px;
          font-weight: 400;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--vs-ink-muted);
          line-height: 1.4;
          text-align: right;
          display: flex;
          flex-direction: column;
        }

        .navbar-user { display: flex; align-items: center; gap: 14px; }
        .navbar-user-name {
          font-family: var(--vs-font-mono);
          font-size: 10.5px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--vs-ink-muted);
        }
        .navbar-signout {
          font-family: var(--vs-font-mono);
          font-size: 10.5px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--vs-ink);
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 8px 0;
          transition: color 200ms ease;
        }
        .navbar-signout:hover { color: var(--vs-coral); }

        .navbar-mobile-btn {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--vs-ink);
          padding: 6px;
        }

        .navbar-mobile-menu {
          overflow: hidden;
          border-top: 1px solid var(--vs-rule);
          background: var(--vs-ivory);
        }
        .navbar-mobile-link {
          display: block;
          padding: 18px 24px;
          font-family: var(--vs-font-serif);
          font-size: 24px;
          font-weight: 500;
          letter-spacing: -0.015em;
          color: var(--vs-ink);
          border-bottom: 1px solid var(--vs-rule);
        }
        .navbar-mobile-link.active { color: var(--vs-coral); }
        .navbar-mobile-cta {
          color: var(--vs-coral);
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
          width: 100%;
          font: inherit;
        }

        @media (max-width: 1024px) {
          .navbar-affiliation { display: none; }
        }
        @media (max-width: 900px) {
          .navbar-container { padding: 18px 24px; }
          .navbar-links { display: none; }
          .navbar-actions .btn { display: none; }
          .navbar-user { display: none; }
          .navbar-mobile-btn { display: inline-flex; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
