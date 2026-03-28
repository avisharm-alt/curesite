import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const SignInPage: React.FC = () => {
  const handleGoogleSignIn = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + '/';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
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

          <button className="google-btn" onClick={handleGoogleSignIn}>
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
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
            <button className="signin-alt-btn" onClick={handleGoogleSignIn}>
              Sign up with Google
            </button>
          </p>

          <p className="signin-terms">
            By signing in, you agree to our{' '}
            <a href="#">Terms of Service</a> and{' '}
            <a href="#">Privacy Policy</a>.
          </p>
        </motion.div>
      </div>

      <style>{`
        .signin-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--vs-bg-subtle);
          padding: var(--vs-space-6);
        }

        .signin-container {
          width: 100%;
          max-width: 400px;
        }

        .signin-card {
          background: var(--vs-white);
          border: 1px solid var(--vs-border);
          border-radius: var(--vs-radius-xl);
          padding: var(--vs-space-10);
        }

        .signin-header {
          text-align: center;
          margin-bottom: var(--vs-space-8);
        }

        .signin-logo {
          display: inline-block;
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--vs-black);
          text-decoration: none;
          margin-bottom: var(--vs-space-6);
        }

        .signin-logo-dot {
          color: var(--vs-coral);
        }

        .signin-header h1 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: var(--vs-space-2);
        }

        .signin-header p {
          font-size: 0.9375rem;
          color: var(--vs-text-secondary);
        }

        .google-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--vs-space-3);
          padding: var(--vs-space-4);
          font-family: var(--vs-font);
          font-size: 0.9375rem;
          font-weight: 500;
          color: var(--vs-text-primary);
          background: var(--vs-white);
          border: 1px solid var(--vs-border);
          border-radius: var(--vs-radius-md);
          cursor: pointer;
          transition: all var(--vs-transition-fast);
        }

        .google-btn:hover {
          border-color: var(--vs-border-hover);
          background: var(--vs-bg-hover);
        }

        .signin-divider {
          display: flex;
          align-items: center;
          margin: var(--vs-space-6) 0;
        }

        .signin-divider::before,
        .signin-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--vs-border);
        }

        .signin-divider span {
          padding: 0 var(--vs-space-4);
          font-size: 0.8125rem;
          color: var(--vs-text-tertiary);
        }

        .signin-alt {
          text-align: center;
          font-size: 0.9375rem;
          color: var(--vs-text-secondary);
        }

        .signin-alt-btn {
          background: none;
          border: none;
          color: var(--vs-coral);
          font-weight: 500;
          cursor: pointer;
          font-size: inherit;
          font-family: inherit;
        }

        .signin-alt-btn:hover {
          text-decoration: underline;
        }

        .signin-terms {
          margin-top: var(--vs-space-6);
          padding-top: var(--vs-space-6);
          border-top: 1px solid var(--vs-border);
          text-align: center;
          font-size: 0.8125rem;
          color: var(--vs-text-tertiary);
        }

        .signin-terms a {
          color: var(--vs-text-secondary);
        }

        .signin-terms a:hover {
          color: var(--vs-text-primary);
        }
      `}</style>
    </div>
  );
};

export default SignInPage;
