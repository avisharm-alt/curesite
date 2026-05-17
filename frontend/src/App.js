import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './App.css';
import './VitalSigns.css';

// Pages
import VitalSignsHomePage from './pages/VitalSignsHomePage';
import VitalSignsAboutPage from './pages/VitalSignsAboutPage';
import StoriesPage from './pages/StoriesPage';
import StoryDetailPage from './pages/StoryDetailPage';
import SubmitStoryPage from './pages/SubmitStoryPage';
import AdminStoriesPage from './pages/AdminStoriesPage';
import ProfilePage from './pages/ProfilePage';
import SignInPage from './pages/SignInPage';

import { AuthProvider, useAuth } from './hooks/useAuth';
import { Menu, X } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// ---------- Wordmark ----------
const Wordmark = ({ size = 26 }) => (
  <span className="vs-wordmark" style={{ fontSize: size }}>
    Vital Signs<span className="vs-period">.</span>
  </span>
);

// ---------- Header ----------
const VitalSignsHeader = () => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const nav = [
    { name: 'Stories', href: '/stories' },
    { name: 'About', href: '/about' },
    ...(user ? [{ name: 'Share', href: '/submit' }] : []),
    ...(user ? [{ name: 'Profile', href: '/profile' }] : []),
    ...(user?.user_type === 'admin' ? [{ name: 'Admin', href: '/admin' }] : []),
  ];

  const handleLogin = () => { window.location.href = `${API}/auth/google`; };

  const isActive = (href) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <header className="vs-header">
      <div className="vs-nav-container">
        <Link to="/" aria-label="Vital Signs home"><Wordmark /></Link>

        <nav className="vs-nav-links" aria-label="Primary">
          {nav.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`vs-nav-link ${isActive(item.href) ? 'active' : ''}`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="vs-nav-cta">
          {user ? (
            <>
              <span className="vs-user-name">— {user.name?.split(' ')[0]}</span>
              <button onClick={logout} className="vs-btn vs-btn--ghost" aria-label="Sign out">
                Sign out
              </button>
            </>
          ) : (
            <button onClick={handleLogin} className="vs-btn vs-btn--primary">
              <span className="vs-btn-dot" />
              Sign in
            </button>
          )}
          <button
            className="vs-mobile-toggle vs-btn vs-btn--ghost"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <div className={`vs-mobile-menu ${open ? 'open' : ''}`}>
        <Link to="/" onClick={() => setOpen(false)} className={isActive('/') ? 'active' : ''}>Home</Link>
        {nav.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            onClick={() => setOpen(false)}
            className={isActive(item.href) ? 'active' : ''}
          >
            {item.name}
          </Link>
        ))}
        {!user && (
          <button
            onClick={handleLogin}
            className="vs-btn vs-btn--primary"
            style={{ alignSelf: 'flex-start', marginTop: 16 }}
          >
            <span className="vs-btn-dot" />
            Sign in with Google
          </button>
        )}
      </div>
    </header>
  );
};

// ---------- Footer ----------
const VitalSignsFooter = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="vs-footer">
      <div className="vs-container">
        <div className="vs-footer-grid">
          <div>
            <div className="vs-footer-wordmark">
              Vital Signs<span className="vs-period">.</span>
            </div>
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
            <Link to="/about">About Vital Signs</Link>
            <Link to="/about">Editorial Standards</Link>
          </div>

          <div className="vs-footer-col">
            <h4>— Connect</h4>
            <a href="mailto:hello@vitalsigns.org">hello@vitalsigns.org</a>
            <a href="https://utoronto.ca" target="_blank" rel="noreferrer">University of Toronto</a>
          </div>
        </div>

        <div className="vs-footer-bottom">
          <span>© {year} Vital Signs<span className="vs-period">.</span> &nbsp;&nbsp; All rights reserved.</span>
          <span>vitalsigns.org</span>
        </div>
      </div>
    </footer>
  );
};

const LegacyRedirect = () => <Navigate to="/" replace />;

const App = () => {
  React.useEffect(() => {
    document.title = 'Vital Signs. — Real stories. Real health. Real people.';
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.content = 'A literary community where people share their health experiences to build empathy, reduce stigma, and connect with others who understand.';
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="vs-app">
          <VitalSignsHeader />
          <main className="vs-main">
            <Routes>
              <Route path="/" element={<VitalSignsHomePage />} />
              <Route path="/stories" element={<StoriesPage />} />
              <Route path="/stories/:storyId" element={<StoryDetailPage />} />
              <Route path="/submit" element={<SubmitStoryPage />} />
              <Route path="/about" element={<VitalSignsAboutPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/admin" element={<AdminStoriesPage />} />
              <Route path="/signin" element={<SignInPage />} />

              {/* Legacy redirects */}
              <Route path="/posters" element={<LegacyRedirect />} />
              <Route path="/journal" element={<LegacyRedirect />} />
              <Route path="/journal/*" element={<LegacyRedirect />} />
              <Route path="/fellowship" element={<LegacyRedirect />} />
              <Route path="/internships" element={<LegacyRedirect />} />
              <Route path="/students" element={<LegacyRedirect />} />
              <Route path="/submit-poster" element={<LegacyRedirect />} />
              <Route path="/submit-article" element={<LegacyRedirect />} />

              <Route path="*" element={<VitalSignsHomePage />} />
            </Routes>
          </main>
          <VitalSignsFooter />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#161616',
                color: '#F5F2EA',
                fontFamily: "'Space Mono', monospace",
                fontSize: '11px',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                borderRadius: '6px',
                padding: '14px 18px',
              },
            }}
          />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
