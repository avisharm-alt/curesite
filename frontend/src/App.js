import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import './App.css';
import './VitalSigns.css';

// Import Vital Signs pages
import VitalSignsHomePage from './pages/VitalSignsHomePage';
import VitalSignsAboutPage from './pages/VitalSignsAboutPage';
import StoriesPage from './pages/StoriesPage';
import StoryDetailPage from './pages/StoryDetailPage';
import SubmitStoryPage from './pages/SubmitStoryPage';
import AdminStoriesPage from './pages/AdminStoriesPage';
import ProfilePage from './pages/ProfilePage';

// Import hooks
import { AuthProvider, useAuth } from './hooks/useAuth';

// Import Lucide React icons
import { 
  BookOpen, Heart, PenLine, User, LogOut, Menu, X, Home, Settings
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Vital Signs Header Component
const VitalSignsHeader = () => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Stories', href: '/stories', icon: BookOpen },
    { name: 'About', href: '/about', icon: Heart },
    ...(user ? [{ name: 'Share Story', href: '/submit', icon: PenLine }] : []),
    ...(user ? [{ name: 'My Profile', href: '/profile', icon: User }] : []),
    ...(user?.user_type === 'admin' ? [{ name: 'Admin', href: '/admin', icon: Settings }] : []),
  ];

  const handleGoogleLogin = () => {
    window.location.href = `${API}/auth/google`;
  };

  return (
    <header className="vs-header">
      <nav className="vs-nav-container">
        <div className="vs-nav-brand">
          <Link to="/" className="vs-logo-link">
            <span className="vs-logo-text">Vital<span className="vs-logo-accent">Signs</span></span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="vs-nav-links">
          {navigation.map((item) => (
            <Link 
              key={item.name} 
              to={item.href} 
              className={`vs-nav-link ${location.pathname === item.href ? 'active' : ''}`}
            >
              <item.icon size={18} />
              {item.name}
            </Link>
          ))}
        </div>

        {/* User Menu */}
        <div className="vs-nav-user">
          {user ? (
            <div className="vs-user-menu">
              <span className="vs-user-name">{user.name}</span>
              <button onClick={logout} className="vs-logout-btn" title="Sign out">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button onClick={handleGoogleLogin} className="vs-login-btn">
              <img 
                src="https://developers.google.com/identity/images/g-logo.png" 
                alt="Google" 
                className="vs-google-icon"
              />
              Sign in
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="vs-mobile-menu-btn">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="vs-mobile-menu">
          {navigation.map((item) => (
            <Link 
              key={item.name} 
              to={item.href} 
              className="vs-mobile-nav-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              <item.icon size={18} />
              {item.name}
            </Link>
          ))}
          {!user && (
            <button onClick={handleGoogleLogin} className="vs-mobile-login-btn">
              <img 
                src="https://developers.google.com/identity/images/g-logo.png" 
                alt="Google" 
                className="vs-google-icon"
              />
              Sign in with Google
            </button>
          )}
        </div>
      )}
    </header>
  );
};

// Vital Signs Footer Component
const VitalSignsFooter = () => {
  return (
    <footer className="vs-footer">
      <div className="vs-footer-content">
        <div className="vs-footer-brand">
          <span className="vs-footer-logo">Vital<span className="vs-logo-accent">Signs</span></span>
          <p className="vs-footer-tagline">Real stories. Real health. Real people.</p>
        </div>
        
        <div className="vs-footer-links">
          <Link to="/stories">Read Stories</Link>
          <Link to="/submit">Share Your Story</Link>
          <Link to="/about">About Us</Link>
        </div>
        
        <div className="vs-footer-bottom">
          <p>&copy; {new Date().getFullYear()} Vital Signs. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

// Legacy Route Redirects
const LegacyRedirect = () => {
  return <Navigate to="/" replace />;
};

// Main App Component
const App = () => {
  // Set document title for Vital Signs
  React.useEffect(() => {
    document.title = "Vital Signs - Real stories. Real health. Real people.";
    
    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.name = 'description';
      document.head.appendChild(metaDescription);
    }
    metaDescription.content = 'A community where people share their health experiences to build empathy, reduce stigma, and connect with others who understand.';
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="vs-app">
          <VitalSignsHeader />
          <main className="vs-main">
            <Routes>
              {/* Vital Signs Routes */}
              <Route path="/" element={<VitalSignsHomePage />} />
              <Route path="/stories" element={<StoriesPage />} />
              <Route path="/stories/:storyId" element={<StoryDetailPage />} />
              <Route path="/submit" element={<SubmitStoryPage />} />
              <Route path="/about" element={<VitalSignsAboutPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/admin" element={<AdminStoriesPage />} />
              
              {/* Legacy Route Redirects */}
              <Route path="/posters" element={<LegacyRedirect />} />
              <Route path="/journal" element={<LegacyRedirect />} />
              <Route path="/journal/*" element={<LegacyRedirect />} />
              <Route path="/fellowship" element={<LegacyRedirect />} />
              <Route path="/internships" element={<LegacyRedirect />} />
              <Route path="/students" element={<LegacyRedirect />} />
              <Route path="/submit-poster" element={<LegacyRedirect />} />
              <Route path="/submit-article" element={<LegacyRedirect />} />
              
              {/* Catch all */}
              <Route path="*" element={<VitalSignsHomePage />} />
            </Routes>
          </main>
          <VitalSignsFooter />
          <Toaster position="top-right" />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
