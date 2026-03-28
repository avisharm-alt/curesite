import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import InstagramGenerator from './pages/InstagramGenerator.tsx';

const App: React.FC = () => {
  // Set document title
  React.useEffect(() => {
    document.title = 'Vital Signs \u2022 Real stories. Real health. Real people.';
  }, []);

  return (
    <BrowserRouter>
      <div className="app">
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
          
          {/* Instagram Generator */}
          <Route path="/instagram" element={
            <>
              <Navbar />
              <InstagramGenerator />
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
