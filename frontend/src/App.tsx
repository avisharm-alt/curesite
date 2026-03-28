import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';

// Import styles
import './styles/design-system.css';

// Import layout components
import Navbar from './components/Navbar.tsx';
import Footer from './components/Footer.tsx';

// Import pages
import HomePage from './pages/HomePage.tsx';
import StoriesPage from './pages/StoriesPage.tsx';
import StoryDetailPage from './pages/StoryDetailPage.tsx';
import SubmitStoryPage from './pages/SubmitStoryPage.tsx';
import AboutPage from './pages/AboutPage.tsx';
import SignInPage from './pages/SignInPage.tsx';
import AdminPage from './pages/AdminPage.tsx';
import JoinUsPage from './pages/JoinUsPage.tsx';

/** Picks up ?token=...&user=... from Google OAuth callback redirect */
function OAuthTokenHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const userParam = params.get('user');
    const error = params.get('error');

    if (error) {
      toast.error('Sign in failed. Please try again.');
      navigate('/', { replace: true });
      return;
    }

    if (token && userParam) {
      try {
        const userData = JSON.parse(decodeURIComponent(userParam));
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        toast.success(`Welcome, ${userData.name || userData.email}!`);

        // Admin goes to /admin, everyone else to /
        if (userData.user_type === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      } catch {
        navigate('/', { replace: true });
      }
    }
  }, [location.search, navigate]);

  return null;
}

function AppRouter() {
  return (
    <>
      <OAuthTokenHandler />
      <Routes>
        {/* Sign In page has no nav/footer */}
        <Route path="/signin" element={<SignInPage />} />
        
        {/* Admin page has its own layout */}
        <Route path="/admin" element={
          <>
            <Navbar />
            <AdminPage />
          </>
        } />
        
        {/* Main pages with standard layout */}
        <Route path="/*" element={
          <>
            <Navbar />
            <main>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/stories" element={<StoriesPage />} />
                <Route path="/stories/:id" element={<StoryDetailPage />} />
                <Route path="/submit" element={<SubmitStoryPage />} />
                <Route path="/join" element={<JoinUsPage />} />
                <Route path="/about" element={<AboutPage />} />
              </Routes>
            </main>
            <Footer />
          </>
        } />
      </Routes>
    </>
  );
}

const App: React.FC = () => {
  // Set document title
  React.useEffect(() => {
    document.title = 'Vital Signs \u2022 Real stories. Real health. Real people.';
  }, []);

  return (
    <BrowserRouter>
      <div className="app">
        <AppRouter />
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: 'var(--vs-font)',
              fontSize: '0.9375rem',
            },
          }}
        />
      </div>
    </BrowserRouter>
  );
};

export default App;
