import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const hash = window.location.hash;
    const sessionId = new URLSearchParams(hash.replace('#', '?')).get('session_id');

    if (!sessionId) {
      navigate('/', { replace: true });
      return;
    }

    (async () => {
      try {
        const resp = await fetch(`${API_URL}/api/auth/session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ session_id: sessionId }),
        });

        if (!resp.ok) throw new Error('Session exchange failed');

        const user = await resp.json();
        // Navigate to admin if admin, otherwise home
        const dest = user.user_type === 'admin' ? '/admin' : '/';
        navigate(dest, { replace: true, state: { user } });
      } catch (err) {
        console.error('Auth callback error:', err);
        navigate('/signin', { replace: true });
      }
    })();
  }, [navigate]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--vs-bg-subtle)',
    }}>
      <p style={{ color: 'var(--vs-text-secondary)', fontSize: '1rem' }}>Signing you in...</p>
    </div>
  );
};

export default AuthCallback;
