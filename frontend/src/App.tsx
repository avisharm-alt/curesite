import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

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
import AuthCallback from './pages/AuthCallback.tsx';

function AppRouter() {
  const location = useLocation();

  // Detect session_id in URL hash synchronously during render
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }

  return (
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
              <Route path="/about" element={<AboutPage />} />
            </Routes>
          </main>
          <Footer />
        </>
      } />
    </Routes>
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
