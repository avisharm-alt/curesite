import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Briefcase, MapPin, Building2, ExternalLink, Lock, LogIn } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const InternshipOpportunitiesPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchInternships();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const fetchInternships = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/internships`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInternships(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching internships:', error);
      if (error.response?.status === 403) {
        toast.error('Please sign in to view internships');
      } else {
        toast.error('Error fetching internships');
      }
      setInternships([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API}/auth/google`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-CA', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Show login gate if not authenticated
  if (!authLoading && !user) {
    return (
      <div className="internships-page">
        <div className="page-header">
          <h1>Internship Opportunities</h1>
          <p>Exclusive internship opportunities for Canadian undergraduate students</p>
        </div>

        <div className="login-gate">
          <div className="login-gate-content">
            <div className="login-gate-icon">
              <Lock size={48} />
            </div>
            <h2>Sign In Required</h2>
            <p>
              Access to internship opportunities is exclusive to registered users. 
              Please sign in with your Google account to view available positions.
            </p>
            <button onClick={handleGoogleLogin} className="google-login-btn large">
              <img 
                src="https://developers.google.com/identity/images/g-logo.png" 
                alt="Google" 
                className="google-icon"
              />
              Sign in with Google
            </button>
            <p className="login-gate-note">
              <strong>Note:</strong> These opportunities are specifically curated for 
              Canadian undergraduate students interested in healthcare and research careers.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  if (authLoading || loading) {
    return (
      <div className="internships-page">
        <div className="page-header">
          <h1>Internship Opportunities</h1>
          <p>Exclusive internship opportunities for Canadian undergraduate students</p>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading internship opportunities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="internships-page">
      <div className="page-header">
        <h1>Internship Opportunities</h1>
        <p>Exclusive internship opportunities for Canadian undergraduate students</p>
      </div>

      <div className="internships-info-banner">
        <Briefcase size={24} />
        <div>
          <strong>Welcome, {user?.name}!</strong>
          <p>Browse our curated list of internship opportunities in healthcare, research, and related fields across Canada.</p>
        </div>
      </div>

      <div className="internships-container">
        {internships.length === 0 ? (
          <div className="empty-state">
            <Briefcase size={64} />
            <h3>No Internships Available</h3>
            <p>Check back soon for new internship opportunities!</p>
          </div>
        ) : (
          <div className="internships-grid">
            {internships.map((internship) => (
              <div key={internship.id} className="internship-card">
                <div className="internship-header">
                  <h3 className="internship-title">{internship.title}</h3>
                  <div className="internship-company">
                    <Building2 size={16} />
                    <span>{internship.company}</span>
                  </div>
                </div>
                
                <div className="internship-location">
                  <MapPin size={16} />
                  <span>{internship.location}</span>
                </div>
                
                <p className="internship-description">{internship.description}</p>
                
                <div className="internship-footer">
                  <span className="internship-date">
                    Posted: {formatDate(internship.created_at)}
                  </span>
                  {internship.application_link && (
                    <a 
                      href={internship.application_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="apply-btn"
                    >
                      Apply Now
                      <ExternalLink size={16} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InternshipOpportunitiesPage;
