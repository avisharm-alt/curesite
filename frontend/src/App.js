import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import './App.css';

// Import pages
import HomePage from './pages/HomePage';
import PosterJournalPage from './pages/PosterJournalPage';
import StudentNetworkPage from './pages/StudentNetworkPage';
import ProfessorNetworkPage from './pages/ProfessorNetworkPage';
import ECProfilesPage from './pages/ECProfilesPage';
import VolunteerOpportunitiesPage from './pages/VolunteerOpportunitiesPage';
import ProfilePage from './pages/ProfilePage';
import SubmitPosterPage from './pages/SubmitPosterPage';
import AdminPanelPage from './pages/AdminPanelPage';
import DebugPage from './pages/DebugPage';
import TestConnectionPage from './pages/TestConnectionPage';

// Import hooks and components
import { AuthProvider, useAuth } from './hooks/useAuth';

// Import Lucide React icons
import { 
  BookOpen, Users, GraduationCap, Heart, FileText, 
  User, LogOut, Menu, X, Home, Award, BarChart3
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Header Component
const Header = () => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Poster Journal', href: '/posters', icon: FileText },
    { name: 'Student Network', href: '/students', icon: Users },
    { name: 'Professor Network', href: '/professors', icon: GraduationCap },
    { name: 'EC Profiles', href: '/profiles', icon: BarChart3 },
    { name: 'Volunteer Opportunities', href: '/volunteer', icon: Heart },
    ...(user ? [{ name: 'My Profile', href: '/profile', icon: User }] : []),
    ...(user?.user_type === 'admin' ? [{ name: 'Admin Panel', href: '/admin', icon: Award }] : []),
  ];

  const handleGoogleLogin = () => {
    // Redirect to backend Google OAuth endpoint
    window.location.href = `${API}/auth/google`;
  };

  return (
    <header className="header">
      <nav className="nav-container">
        <div className="nav-brand">
          <Link to="/">
            <img 
              src="https://customer-assets.emergentagent.com/job_137e70c1-f0f7-4e3d-8748-ad4447b6d332/artifacts/l3ze9cjg_Logo%20maker%20project%20%284%29.png" 
              alt="CURE Logo" 
              className="logo"
            />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="nav-links">
          {navigation.map((item) => (
            <Link 
              key={item.name} 
              to={item.href} 
              className={`nav-link ${location.pathname === item.href ? 'active' : ''}`}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* User Menu */}
        <div className="nav-user">
          {user ? (
            <div className="user-menu">
              <div className="user-info">
                <span className="user-name">{user.name}</span>
                <span className="user-type">{user.user_type}</span>
              </div>
              <button onClick={logout} className="logout-btn">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button onClick={handleGoogleLogin} className="google-login-btn">
              <img 
                src="https://developers.google.com/identity/images/g-logo.png" 
                alt="Google" 
                className="google-icon"
              />
              Sign in with Google
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="mobile-menu-btn">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          {navigation.map((item) => (
            <Link 
              key={item.name} 
              to={item.href} 
              className="mobile-nav-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              <item.icon size={18} />
              {item.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
};

// Footer Component
const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>CURE</h3>
          <p>Canadian Undergraduate Research Exchange</p>
          <p>Connecting students with research opportunities and medical school preparation.</p>
        </div>
        
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/posters">Poster Journal</Link></li>
            <li><Link to="/students">Student Network</Link></li>
            <li><Link to="/professors">Professor Network</Link></li>
            <li><Link to="/profiles">EC Profiles</Link></li>
            <li><Link to="/volunteer">Volunteer Opportunities</Link></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Resources</h4>
          <ul>
            <li><a href="#" target="_blank" rel="noopener noreferrer">Research Guidelines</a></li>
            <li><a href="#" target="_blank" rel="noopener noreferrer">Medical School Prep</a></li>
            <li><a href="#" target="_blank" rel="noopener noreferrer">Contact Support</a></li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; 2024 CURE - Canadian Undergraduate Research Exchange. All rights reserved.</p>
      </div>
    </footer>
  );
};

// Main App Component
const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="App">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/posters" element={<PosterJournalPage />} />
              <Route path="/students" element={<StudentNetworkPage />} />
              <Route path="/professors" element={<ProfessorNetworkPage />} />
              <Route path="/profiles" element={<ECProfilesPage />} />
              <Route path="/volunteer" element={<VolunteerOpportunitiesPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/submit-poster" element={<SubmitPosterPage />} />
              <Route path="/admin" element={<AdminPanelPage />} />
              <Route path="/debug" element={<DebugPage />} />
              <Route path="/test" element={<TestConnectionPage />} />
              <Route path="*" element={<HomePage />} />
            </Routes>
          </main>
          <Footer />
          <Toaster position="top-right" />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;