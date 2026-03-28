import React, { useEffect, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_BACKEND_URL;
const GOOGLE_CLIENT_ID = '492483192809-ktal7sbtjgvqn6fp1cmp1ebkdjpkrg7g.apps.googleusercontent.com';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (
            element: HTMLElement,
            config: {
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              type?: 'standard' | 'icon';
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              width?: number;
            }
          ) => void;
          prompt: () => void;
        };
      };
    };
  }
}

const SignInPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Handle credential response from Google Identity Services
  const handleCredentialResponse = useCallback(async (response: { credential: string }) => {
    setIsLoading(true);
    try {
      // Send the credential to our backend for verification
      const res = await fetch(`${API_URL}/api/auth/google/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credential: response.credential }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || 'Authentication failed');
      }

      const data = await res.json();
      
      // Store in localStorage (same pattern as OAuthTokenHandler in App.tsx)
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      toast.success(`Welcome, ${data.user.name || data.user.email}!`);
      
      // Admin goes to /admin, everyone else to /
      if (data.user.user_type === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (error) {
      console.error('Authentication error:', error);
      toast.error(error instanceof Error ? error.message : 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  // Load Google Identity Services script and initialize
  useEffect(() => {
    // Check if already logged in
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      try {
        const userData = JSON.parse(user);
        if (userData.user_type === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
        return;
      } catch {
        // Invalid stored data, continue to sign-in
      }
    }

    const initializeGoogleSignIn = () => {
      if (!window.google?.accounts?.id) {
        console.error('Google Identity Services not loaded');
        return;
      }

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Render the Google Sign-In button
      const buttonContainer = document.getElementById('google-signin-button');
      if (buttonContainer) {
        window.google.accounts.id.renderButton(buttonContainer, {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          text: 'continue_with',
          shape: 'rectangular',
          width: 320,
        });
      }
    };

    // Check if script is already loaded
    if (window.google?.accounts?.id) {
      initializeGoogleSignIn();
      return;
    }

    // Load the Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogleSignIn;
    document.body.appendChild(script);
  }, [navigate, handleCredentialResponse]);

  // Fallback to redirect-based OAuth (legacy)
  const handleGoogleSignInRedirect = () => {
    window.location.href = `${API_URL}/api/auth/google`;
  };

  return (
    <div className="signin-page">
      <div className="signin-container">
        <motion.div
          className="signin-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="signin-header">
            <Link to="/" className="signin-logo">
              Vital Signs<span className="signin-logo-dot">.</span>
            </Link>
            <h1>Welcome back</h1>
            <p>Sign in to share your story or manage your submissions.</p>
          </div>

          {/* Google Identity Services Button Container */}
          <div id="google-signin-button" className="google-btn-container">
            {isLoading && (
              <div className="loading-spinner">
                <div className="spinner"></div>
                <span>Signing in...</span>
              </div>
            )}
          </div>

          {/* Fallback button */}
          <button 
            className="google-btn-fallback" 
            onClick={handleGoogleSignInRedirect}
            style={{ display: 'none' }}
          >
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path
                fill="#4285f4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34a853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#fbbc05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#ea4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          <div className="signin-divider">
            <span>or</span>
          </div>

          <p className="signin-alt">
            Don't have an account?{' '}
            <span className="signin-alt-text">
              Sign up with Google above
            </span>
          </p>

          <p className="signin-terms">
            By signing in, you agree to our{' '}
            <Link to="/about">Terms of Service</Link> and{' '}
            <Link to="/about">Privacy Policy</Link>.
          </p>
        </motion.div>
      </div>

      <style>{`
        .signin-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--vs-bg-subtle, #f8f9fa);
          padding: 1.5rem;
        }

        .signin-container {
          width: 100%;
          max-width: 400px;
        }

        .signin-card {
          background: var(--vs-white, #ffffff);
          border: 1px solid var(--vs-border, #e5e7eb);
          border-radius: 1rem;
          padding: 2.5rem;
        }

        .signin-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .signin-logo {
          display: inline-block;
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--vs-black, #1a1a1a);
          text-decoration: none;
          margin-bottom: 1.5rem;
        }

        .signin-logo-dot {
          color: var(--vs-coral, #ff6b6b);
        }

        .signin-header h1 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: var(--vs-black, #1a1a1a);
        }

        .signin-header p {
          font-size: 0.9375rem;
          color: var(--vs-text-secondary, #6b7280);
        }

        .google-btn-container {
          display: flex;
          justify-content: center;
          min-height: 44px;
          align-items: center;
        }

        .loading-spinner {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: var(--vs-text-secondary, #6b7280);
          font-size: 0.9375rem;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid var(--vs-border, #e5e7eb);
          border-top-color: var(--vs-coral, #ff6b6b);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .google-btn-fallback {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 1rem;
          font-family: inherit;
          font-size: 0.9375rem;
          font-weight: 500;
          color: var(--vs-text-primary, #1a1a1a);
          background: var(--vs-white, #ffffff);
          border: 1px solid var(--vs-border, #e5e7eb);
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .google-btn-fallback:hover {
          border-color: var(--vs-border-hover, #d1d5db);
          background: var(--vs-bg-hover, #f9fafb);
        }

        .signin-divider {
          display: flex;
          align-items: center;
          margin: 1.5rem 0;
        }

        .signin-divider::before,
        .signin-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--vs-border, #e5e7eb);
        }

        .signin-divider span {
          padding: 0 1rem;
          font-size: 0.8125rem;
          color: var(--vs-text-tertiary, #9ca3af);
        }

        .signin-alt {
          text-align: center;
          font-size: 0.9375rem;
          color: var(--vs-text-secondary, #6b7280);
        }

        .signin-alt-text {
          color: var(--vs-coral, #ff6b6b);
          font-weight: 500;
        }

        .signin-terms {
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--vs-border, #e5e7eb);
          text-align: center;
          font-size: 0.8125rem;
          color: var(--vs-text-tertiary, #9ca3af);
        }

        .signin-terms a {
          color: var(--vs-text-secondary, #6b7280);
          text-decoration: none;
        }

        .signin-terms a:hover {
          color: var(--vs-text-primary, #1a1a1a);
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default SignInPage;
