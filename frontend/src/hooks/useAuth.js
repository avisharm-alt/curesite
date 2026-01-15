import React, { useState, useEffect, createContext, useContext } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper function to validate JWT format
const isValidJWT = (token) => {
  if (!token || typeof token !== 'string') return false;
  if (token === 'undefined' || token === 'null') return false;
  const parts = token.split('.');
  return parts.length === 3;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    // Validate token format before using it
    if (token && isValidJWT(token)) {
      // Verify token and get user info
      axios.get(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(response => {
        setUser(response.data);
      })
      .catch(() => {
        localStorage.removeItem('token');
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
    } else {
      // Clear invalid token
      if (token) {
        localStorage.removeItem('token');
      }
      setLoading(false);
    }

    // Check for auth callback in URL
    const urlParams = new URLSearchParams(window.location.search);
    const token_param = urlParams.get('token');
    const user_param = urlParams.get('user');
    
    if (token_param && user_param && isValidJWT(token_param)) {
      try {
        const userData = JSON.parse(decodeURIComponent(user_param));
        localStorage.setItem('token', token_param);
        setUser(userData);
        
        toast.success(`Welcome back, ${userData.name}!`);
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (error) {
        console.error('Error parsing auth callback:', error);
        toast.error('Authentication failed. Please try again.');
      }
    }
  }, []);

  const login = (userData, token) => {
    if (isValidJWT(token)) {
      localStorage.setItem('token', token);
      setUser(userData);
      toast.success(`Welcome back, ${userData.name}!`);
    } else {
      toast.error('Invalid authentication token');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};