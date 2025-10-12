import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { User, Edit3, Save, Plus, FileText, Trash2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(user || {});
  const [myPosters, setMyPosters] = useState([]);
  const [myNetworkProfile, setMyNetworkProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (user) {
      fetchMyData();
    }
  }, [user]);

  const fetchMyData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch my posters
      const postersResponse = await axios.get(`${API}/posters/my`, { headers });
      setMyPosters(Array.isArray(postersResponse.data) ? postersResponse.data : []);

      // Try to fetch my network profile
      try {
        const networkResponse = await axios.get(`${API}/student-network/my`, { headers });
        setMyNetworkProfile(networkResponse.data);
      } catch (error) {
        // Network profile doesn't exist yet
        console.log('No network profile found');
      }

    } catch (error) {
      console.error('Error fetching profile data:', error);
      toast.error('Error fetching profile data');
      setMyPosters([]); // Reset to empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      await axios.put(`${API}/users/profile`, profile, { headers });
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error('Error updating profile');
    }
  };

  const handleNetworkProfileUpdate = async (networkData) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      if (myNetworkProfile) {
        await axios.put(`${API}/student-network/my`, networkData, { headers });
      } else {
        await axios.post(`${API}/student-network`, networkData, { headers });
      }
      
      toast.success('Network profile updated successfully!');
      fetchMyData(); // Refresh data
    } catch (error) {
      toast.error('Error updating network profile');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      await axios.delete(`${API}/users/account`, { headers });
      toast.success('Account deleted successfully');
      logout();
      navigate('/');
    } catch (error) {
      toast.error('Error deleting account');
    }
  };

  const handleDeleteMyPoster = async (posterId) => {
    if (!window.confirm('Are you sure you want to delete this poster?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      await axios.delete(`${API}/posters/${posterId}`, { headers });
      toast.success('Poster deleted successfully');
      fetchMyData(); // Refresh the data
    } catch (error) {
      toast.error('Error deleting poster');
    }
  };

  const [paymentProcessing, setPaymentProcessing] = useState(false);

  const handlePayment = async (posterId) => {
    try {
      setPaymentProcessing(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      // Get origin URL
      const originUrl = window.location.origin;
      
      // Create checkout session
      const response = await axios.post(`${API}/payments/create-checkout`, {
        poster_id: posterId,
        origin_url: originUrl
      }, { headers });
      
      // Redirect to Stripe checkout
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.response?.data?.detail || 'Error initiating payment');
      setPaymentProcessing(false);
    }
  };

  const pollPaymentStatus = async (sessionId, attempts = 0) => {
    const maxAttempts = 5;
    const pollInterval = 2000; // 2 seconds

    if (attempts >= maxAttempts) {
      toast.info('Payment status check timed out. Please refresh the page.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const response = await axios.get(`${API}/payments/status/${sessionId}`, { headers });
      
      if (response.data.payment_status === 'paid') {
        toast.success('Payment successful! Your poster is now live on the network.');
        fetchMyData(); // Refresh data to show updated payment status
        return;
      } else if (response.data.status === 'expired') {
        toast.error('Payment session expired. Please try again.');
        return;
      }

      // If payment is still pending, continue polling
      setTimeout(() => pollPaymentStatus(sessionId, attempts + 1), pollInterval);
    } catch (error) {
      console.error('Error checking payment status:', error);
      toast.error('Error checking payment status. Please refresh the page.');
    }
  };

  useEffect(() => {
    // Check if returning from Stripe
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    
    if (sessionId) {
      toast.info('Checking payment status...');
      pollPaymentStatus(sessionId);
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  if (!user) {
    return (
      <div className="page">
        <div className="page-content">
          <div className="empty-state">
            <User size={48} />
            <h3>Please sign in to view your profile</h3>
            <p>Sign in with Google to access your profile and submissions.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page">
        <div className="page-content">
          <div className="loading">Loading your profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-icon">
          <User size={32} />
        </div>
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-description">
            Manage your profile, view your submissions, and update your research interests.
          </p>
        </div>
      </div>

      <div className="page-content">
        {/* Profile Information */}
        <div className="profile-section">
          <div className="section-header">
            <h2>Profile Information</h2>
            <button 
              onClick={() => isEditing ? handleProfileUpdate() : setIsEditing(true)}
              className="edit-btn"
            >
              {isEditing ? <Save size={18} /> : <Edit3 size={18} />}
              {isEditing ? 'Save Changes' : 'Edit Profile'}
            </button>
          </div>

          <div className="profile-form">
            <div className="form-grid">
              <div className="form-field">
                <label>Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.name || ''}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                    className="form-input"
                  />
                ) : (
                  <span className="form-value">{profile.name}</span>
                )}
              </div>

              <div className="form-field">
                <label>Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={profile.email || ''}
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                    className="form-input"
                  />
                ) : (
                  <span className="form-value">{profile.email}</span>
                )}
              </div>

              <div className="form-field">
                <label>University</label>
                {isEditing ? (
                  <select
                    value={profile.university || ''}
                    onChange={(e) => setProfile({...profile, university: e.target.value})}
                    className="form-input"
                  >
                    <option value="">Select University</option>
                    <option value="University of Toronto">University of Toronto</option>
                    <option value="University of Western Ontario">University of Western Ontario</option>
                    <option value="McMaster University">McMaster University</option>
                    <option value="Queen's University">Queen's University</option>
                    <option value="University of Ottawa">University of Ottawa</option>
                    <option value="University of British Columbia">University of British Columbia</option>
                    <option value="McGill University">McGill University</option>
                    <option value="University of Alberta">University of Alberta</option>
                  </select>
                ) : (
                  <span className="form-value">{profile.university || 'Not specified'}</span>
                )}
              </div>

              <div className="form-field">
                <label>Program</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.program || ''}
                    onChange={(e) => setProfile({...profile, program: e.target.value})}
                    className="form-input"
                    placeholder="e.g., Life Sciences, Biology, Chemistry"
                  />
                ) : (
                  <span className="form-value">{profile.program || 'Not specified'}</span>
                )}
              </div>

              <div className="form-field">
                <label>Year of Study</label>
                {isEditing ? (
                  <select
                    value={profile.year || ''}
                    onChange={(e) => setProfile({...profile, year: parseInt(e.target.value)})}
                    className="form-input"
                  >
                    <option value="">Select Year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                    <option value="5">5th Year+</option>
                  </select>
                ) : (
                  <span className="form-value">{profile.year ? `${profile.year}${profile.year === 1 ? 'st' : profile.year === 2 ? 'nd' : profile.year === 3 ? 'rd' : 'th'} Year` : 'Not specified'}</span>
                )}
              </div>

              <div className="form-field">
                <label>User Type</label>
                <span className="form-value user-type-badge">{profile.user_type}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Network Profile */}
        <NetworkProfileSection 
          networkProfile={myNetworkProfile}
          onUpdate={handleNetworkProfileUpdate}
        />

        {/* My Poster Submissions */}
        <div className="profile-section">
          <div className="section-header">
            <h2>My Poster Submissions</h2>
            <div className="section-actions">
              <span className="section-count">{myPosters.length} submissions</span>
              <Link to="/submit-poster" className="add-btn">
                <Plus size={16} />
                Submit New Poster
              </Link>
            </div>
          </div>

          {myPosters.length > 0 ? (
            <div className="posters-grid">
              {myPosters.map((poster) => (
                <div key={poster.id} className="poster-card compact">
                  <div className="poster-header">
                    <h3 className="poster-title">{poster.title}</h3>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span className={`status-badge status-${poster.status}`}>
                        {poster.status}
                      </span>
                      {poster.status === 'approved' && (
                        <span className={`status-badge status-${poster.payment_status === 'completed' ? 'paid' : 'payment-pending'}`}>
                          {poster.payment_status === 'completed' ? 'Paid' : 'Payment Pending'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="poster-meta">
                    <span className="poster-university">{poster.university}</span>
                    <span className="poster-program">{poster.program}</span>
                  </div>
                  <p className="poster-abstract">{poster.abstract.length > 150 ? poster.abstract.substring(0, 150) + '...' : poster.abstract}</p>
                  
                  {/* Show payment link for approved but unpaid posters */}
                  {poster.status === 'approved' && poster.payment_status === 'pending' && poster.payment_link && (
                    <div className="payment-notice">
                      <p style={{ marginBottom: '8px', fontSize: '14px', color: '#059669' }}>
                        🎉 Your poster has been accepted! Complete payment to publish it on the network.
                      </p>
                      <a 
                        href={poster.payment_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="payment-link-btn"
                      >
                        Complete Payment
                      </a>
                    </div>
                  )}
                  
                  {poster.status === 'approved' && poster.payment_status === 'completed' && (
                    <div className="payment-notice" style={{ backgroundColor: '#d1fae5' }}>
                      <p style={{ marginBottom: '0', fontSize: '14px', color: '#059669' }}>
                        ✅ Payment completed! Your poster is live on the network.
                      </p>
                    </div>
                  )}
                  
                  <div className="poster-footer">
                    <div className="poster-keywords">
                      {poster.keywords.slice(0, 3).map((keyword, index) => (
                        <span key={index} className="keyword-tag small">{keyword}</span>
                      ))}
                      {poster.keywords.length > 3 && (
                        <span className="keyword-tag small">+{poster.keywords.length - 3} more</span>
                      )}
                    </div>
                    <div className="poster-profile-actions">
                      <div className="poster-date">
                        <small>{new Date(poster.submitted_at).toLocaleDateString()}</small>
                      </div>
                      <button
                        onClick={() => handleDeleteMyPoster(poster.id)}
                        className="delete-my-poster-btn"
                        title="Delete this poster"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state compact">
              <FileText size={32} />
              <h3>No poster submissions yet</h3>
              <p>Submit your first research poster to showcase your work!</p>
            </div>
          )}
        </div>

        {/* Account Settings */}
        <div className="profile-section danger-section">
          <div className="section-header">
            <h2>Account Settings</h2>
          </div>
          
          <div className="danger-zone">
            <div className="danger-content">
              <div className="danger-info">
                <h3>Delete Account</h3>
                <p>Permanently delete your account and all associated data. This action cannot be undone.</p>
              </div>
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="delete-account-btn"
              >
                <Trash2 size={18} />
                Delete Account
              </button>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <AlertTriangle size={24} className="warning-icon" />
                <h3>Delete Account</h3>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete your account? This will permanently remove:</p>
                <ul>
                  <li>Your profile information</li>
                  <li>All poster submissions</li>
                  <li>Network profile and connections</li>
                  <li>EC profile data</li>
                  <li>All posted volunteer opportunities</li>
                </ul>
                <p><strong>This action cannot be undone.</strong></p>
              </div>
              <div className="modal-actions">
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="cancel-btn"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteAccount}
                  className="confirm-delete-btn"
                >
                  <Trash2 size={16} />
                  Delete My Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Network Profile Section Component
const NetworkProfileSection = ({ networkProfile, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    research_interests: networkProfile?.research_interests || [],
    skills: networkProfile?.skills || [],
    looking_for: networkProfile?.looking_for || [],
    contact_preferences: networkProfile?.contact_preferences || 'Email',
    public_profile: networkProfile?.public_profile ?? true
  });

  const handleSave = () => {
    onUpdate(formData);
    setIsEditing(false);
  };

  const handleArrayInput = (field, value) => {
    const array = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData({...formData, [field]: array});
  };

  return (
    <div className="profile-section">
      <div className="section-header">
        <h2>Research Network Profile</h2>
        <button 
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className="edit-btn"
        >
          {isEditing ? <Save size={18} /> : <Edit3 size={18} />}
          {isEditing ? 'Save Changes' : networkProfile ? 'Edit Profile' : 'Create Profile'}
        </button>
      </div>

      <div className="network-form">
        <div className="form-grid">
          <div className="form-field">
            <label>Research Interests</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.research_interests.join(', ')}
                onChange={(e) => handleArrayInput('research_interests', e.target.value)}
                className="form-input"
                placeholder="e.g., Molecular Biology, Cancer Research, Neuroscience"
              />
            ) : (
              <div className="tags-display">
                {formData.research_interests.map((interest, index) => (
                  <span key={index} className="interest-tag">{interest}</span>
                ))}
                {formData.research_interests.length === 0 && <span className="form-value">Not specified</span>}
              </div>
            )}
            {isEditing && <small>Separate multiple interests with commas</small>}
          </div>

          <div className="form-field">
            <label>Skills</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.skills.join(', ')}
                onChange={(e) => handleArrayInput('skills', e.target.value)}
                className="form-input"
                placeholder="e.g., Python, Laboratory Techniques, Data Analysis"
              />
            ) : (
              <div className="tags-display">
                {formData.skills.map((skill, index) => (
                  <span key={index} className="skill-tag">{skill}</span>
                ))}
                {formData.skills.length === 0 && <span className="form-value">Not specified</span>}
              </div>
            )}
            {isEditing && <small>Separate multiple skills with commas</small>}
          </div>

          <div className="form-field">
            <label>Looking For</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.looking_for.join(', ')}
                onChange={(e) => handleArrayInput('looking_for', e.target.value)}
                className="form-input"
                placeholder="e.g., Research Opportunities, Collaboration, Mentorship"
              />
            ) : (
              <div className="tags-display">
                {formData.looking_for.map((item, index) => (
                  <span key={index} className="looking-for-tag">{item}</span>
                ))}
                {formData.looking_for.length === 0 && <span className="form-value">Not specified</span>}
              </div>
            )}
            {isEditing && <small>Separate multiple items with commas</small>}
          </div>

          <div className="form-field">
            <label>Contact Preferences</label>
            {isEditing ? (
              <select
                value={formData.contact_preferences}
                onChange={(e) => setFormData({...formData, contact_preferences: e.target.value})}
                className="form-input"
              >
                <option value="Email">Email</option>
                <option value="Through Platform">Through Platform</option>
                <option value="LinkedIn">LinkedIn</option>
              </select>
            ) : (
              <span className="form-value">{formData.contact_preferences}</span>
            )}
          </div>

          <div className="form-field">
            <label className="checkbox-label">
              {isEditing ? (
                <input
                  type="checkbox"
                  checked={formData.public_profile}
                  onChange={(e) => setFormData({...formData, public_profile: e.target.checked})}
                />
              ) : (
                <input
                  type="checkbox"
                  checked={formData.public_profile}
                  disabled
                />
              )}
              Make my profile visible to other students
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;