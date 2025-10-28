import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Award, Eye, Download, Trash2, Plus, Edit3, Save, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminPanelPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('posters');
  const [posters, setPosters] = useState([]);
  const [articles, setArticles] = useState([]);
  const [volunteerOpps, setVolunteerOpps] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.user_type === 'admin') {
      fetchData();
    }
  }, [user, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching admin data - Token exists:', !!token);
      console.log('Fetching data for tab:', activeTab);
      console.log('User type:', user?.user_type);
      
      if (!token) {
        toast.error('No authentication token found. Please login again.');
        return;
      }
      
      const headers = { Authorization: `Bearer ${token}` };

      // Test admin access first
      try {
        const testRes = await axios.get(`${API}/admin/test`, { headers });
        console.log('Admin test response:', testRes.data);
      } catch (testError) {
        console.error('Admin test failed:', testError.response?.data || testError.message);
        toast.error('Admin access denied. Please login as admin.');
        return;
      }

      switch (activeTab) {
        case 'posters':
          console.log('Fetching posters from:', `${API}/admin/posters`);
          const postersRes = await axios.get(`${API}/admin/posters`, { headers });
          console.log('Posters response:', postersRes.data);
          setPosters(Array.isArray(postersRes.data) ? postersRes.data : []);
          break;
        case 'articles':
          console.log('Fetching articles from:', `${API}/admin/journal/articles`);
          const articlesRes = await axios.get(`${API}/admin/journal/articles`, { headers });
          console.log('Articles response:', articlesRes.data);
          setArticles(Array.isArray(articlesRes.data) ? articlesRes.data : []);
          break;
        case 'volunteer':
          const volRes = await axios.get(`${API}/admin/volunteer-opportunities`, { headers });
          setVolunteerOpps(Array.isArray(volRes.data) ? volRes.data : []);
          break;
      }
      
      console.log(`Successfully loaded ${activeTab} data`);
      toast.success(`Successfully loaded ${activeTab} data`);
    } catch (error) {
      console.error('Admin data fetch error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      toast.error(`ADMIN ERROR (${activeTab}): ${error.response?.data?.detail || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (user?.user_type !== 'admin') {
    return (
      <div className="page">
        <div className="page-content">
          <div className="empty-state">
            <Award size={48} />
            <h3>Access Denied</h3>
            <p>You need admin privileges to access this page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-icon">
          <Award size={32} />
        </div>
        <div>
          <h1 className="page-title">Admin Panel</h1>
          <p className="page-description">
            Manage platform content, review submissions, and oversee user data.
          </p>
        </div>
      </div>

      <div className="page-content">
        {/* Admin Tabs */}
        <div className="admin-tabs">
          <button
            onClick={() => setActiveTab('posters')}
            className={`admin-tab ${activeTab === 'posters' ? 'active' : ''}`}
          >
            Poster Management
          </button>
          <button
            onClick={() => setActiveTab('articles')}
            className={`admin-tab ${activeTab === 'articles' ? 'active' : ''}`}
          >
            CURE Journal
          </button>
          <button
            onClick={() => setActiveTab('volunteer')}
            className={`admin-tab ${activeTab === 'volunteer' ? 'active' : ''}`}
          >
            Volunteer Opportunities
          </button>
        </div>
        
        <div className="admin-info">
          <p>📝 <strong>Note:</strong> Professor Network and EC Profiles are now pre-loaded with sample data and don't require admin management.</p>
        </div>

        {/* Tab Content */}
        <div className="admin-content">
          {loading ? (
            <div className="loading">Loading...</div>
          ) : (
            <>
              {activeTab === 'posters' && (
                <PosterManagementTab 
                  posters={posters} 
                  onReview={handlePosterReview}
                  onDelete={handlePosterDelete}
                  onMarkPayment={handleMarkPaymentCompleted}
                />
              )}
              {activeTab === 'volunteer' && (
                <VolunteerManagementTab 
                  opportunities={volunteerOpps}
                  onAdd={handleAddVolunteerOpp}
                  onEdit={handleEditVolunteerOpp}
                  onDelete={handleDeleteVolunteerOpp}
                  onRefresh={fetchData}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );

  // Handler functions
  async function handlePosterReview(posterId, status) {
    try {
      console.log('Reviewing poster:', posterId, 'with status:', status);
      const token = localStorage.getItem('token');
      console.log('Token exists:', !!token);
      
      if (!token) {
        toast.error('No authentication token found. Please login again.');
        return;
      }
      
      const headers = { Authorization: `Bearer ${token}` };
      console.log('Making request to:', `${API}/admin/posters/${posterId}/review`);
      
      const response = await axios.put(`${API}/admin/posters/${posterId}/review`, { status }, { headers });
      console.log('Review response:', response.data);
      
      toast.success(`Poster ${status} successfully`);
      fetchData();
    } catch (error) {
      console.error('Poster review error:', error);
      console.error('Error response:', error.response?.data || error.message);
      toast.error('Error reviewing poster: ' + (error.response?.data?.detail || error.message));
    }
  }

  async function handlePosterDelete(posterId) {
    if (!window.confirm('Are you sure you want to delete this poster?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      await axios.delete(`${API}/posters/${posterId}`, { headers });
      toast.success('Poster deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Poster delete error:', error.response?.data || error.message);
      toast.error('Error deleting poster: ' + (error.response?.data?.detail || error.message));
    }
  }

  async function handleMarkPaymentCompleted(posterId) {
    if (!window.confirm('Are you sure you want to mark this payment as completed?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      await axios.put(`${API}/admin/posters/${posterId}/payment`, {}, { headers });
      toast.success('Payment marked as completed');
      fetchData();
    } catch (error) {
      console.error('Mark payment error:', error.response?.data || error.message);
      toast.error('Error marking payment: ' + (error.response?.data?.detail || error.message));
    }
  }

  async function handleAddVolunteerOpp(opportunityData) {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      await axios.post(`${API}/admin/volunteer-opportunities`, opportunityData, { headers });
      toast.success('Volunteer opportunity added successfully');
      fetchData();
    } catch (error) {
      console.error('Add volunteer error:', error.response?.data || error.message);
      toast.error('Error adding volunteer opportunity: ' + (error.response?.data?.detail || error.message));
    }
  }

  async function handleEditVolunteerOpp(oppId, opportunityData) {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      await axios.put(`${API}/admin/volunteer-opportunities/${oppId}`, opportunityData, { headers });
      toast.success('Volunteer opportunity updated successfully');
      fetchData();
    } catch (error) {
      console.error('Edit volunteer error:', error.response?.data || error.message);
      toast.error('Error updating volunteer opportunity: ' + (error.response?.data?.detail || error.message));
    }
  }

  async function handleDeleteVolunteerOpp(oppId) {
    if (!window.confirm('Are you sure you want to delete this volunteer opportunity?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      await axios.delete(`${API}/admin/volunteer-opportunities/${oppId}`, { headers });
      toast.success('Volunteer opportunity deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Delete volunteer error:', error.response?.data || error.message);
      toast.error('Error deleting volunteer opportunity: ' + (error.response?.data?.detail || error.message));
    }
  }
};

// Poster Management Tab Component
const PosterManagementTab = ({ posters, onReview, onDelete, onMarkPayment }) => (
  <div className="admin-section">
    <h2>Poster Management</h2>
    {posters.length > 0 ? (
      <div className="admin-posters">
        {posters.map((poster) => (
          <div key={poster.id} className="admin-poster-card">
            <div className="poster-header">
              <h3>{poster.title}</h3>
              <div className="poster-meta-header">
                <span className={`status-badge status-${poster.status}`}>{poster.status}</span>
                {poster.status === 'approved' && (
                  <span className={`status-badge status-${poster.payment_status === 'completed' ? 'paid' : 'payment-pending'}`}>
                    {poster.payment_status === 'completed' ? 'Paid' : 'Payment Pending'}
                  </span>
                )}
                <span className="submitted-date">
                  {new Date(poster.submitted_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            
            <div className="poster-details">
              <div className="poster-authors">
                <strong>Authors:</strong> {poster.authors.join(', ')}
              </div>
              <div className="poster-institution">
                <strong>Institution:</strong> {poster.university} - {poster.program}
              </div>
              <div className="poster-abstract">
                <strong>Abstract:</strong>
                <p>{poster.abstract}</p>
              </div>
              <div className="poster-keywords">
                <strong>Keywords:</strong>
                <div className="keywords-list">
                  {poster.keywords.map((keyword, index) => (
                    <span key={index} className="keyword-tag">{keyword}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="admin-actions">
              {poster.poster_url && (
                <>
                  <button
                    onClick={async () => {
                      try {
                        const token = localStorage.getItem('token');
                        const response = await fetch(`${API}/admin/posters/${poster.id}/view`, {
                          headers: { Authorization: `Bearer ${token}` }
                        });
                        
                        if (!response.ok) {
                          throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        
                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);
                        window.open(url, '_blank');
                        
                        // Clean up the URL after a delay
                        setTimeout(() => window.URL.revokeObjectURL(url), 10000);
                      } catch (error) {
                        console.error('View poster error:', error);
                        toast.error('Failed to view poster: ' + error.message);
                      }
                    }}
                    className="view-btn"
                  >
                    <Eye size={16} />
                    View
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      const token = localStorage.getItem('token');
                      fetch(`${API}/admin/posters/${poster.id}/download`, {
                        headers: { Authorization: `Bearer ${token}` }
                      })
                      .then(response => response.blob())
                      .then(blob => {
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${poster.title}.pdf`;
                        document.body.appendChild(a);
                        a.click();
                        window.URL.revokeObjectURL(url);
                        document.body.removeChild(a);
                        toast.success('Downloaded successfully');
                      })
                      .catch(() => toast.error('Download failed'));
                    }}
                    className="download-btn"
                  >
                    <Download size={16} />
                    Download
                  </button>
                </>
              )}
              
              {poster.status === 'pending' && (
                <>
                  <button
                    onClick={() => onReview(poster.id, 'approved')}
                    className="approve-btn"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => onReview(poster.id, 'rejected')}
                    className="reject-btn"
                  >
                    Reject
                  </button>
                </>
              )}
              
              {poster.status === 'approved' && poster.payment_status === 'pending' && (
                <button
                  onClick={() => onMarkPayment(poster.id)}
                  className="payment-btn"
                  title="Mark payment as completed"
                >
                  Mark as Paid
                </button>
              )}
              
              <button
                onClick={() => onDelete(poster.id)}
                className="delete-btn"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="empty-state">
        <h3>No posters to review</h3>
        <p>All posters have been processed.</p>
      </div>
    )}
  </div>
);

// Volunteer Management Tab Component
const VolunteerManagementTab = ({ opportunities, onAdd, onEdit, onDelete, onRefresh }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingOpp, setEditingOpp] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    organization: '',
    type: '',
    location: '',
    description: '',
    requirements: '',
    time_commitment: '',
    application_link: '',
    contact_email: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const oppData = {
      ...formData,
      requirements: formData.requirements.split(',').map(req => req.trim()).filter(req => req),
      posted_date: new Date().toISOString()
    };

    if (editingOpp) {
      await onEdit(editingOpp.id, oppData);
      setEditingOpp(null);
    } else {
      await onAdd(oppData);
    }
    
    setShowForm(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      organization: '',
      type: '',
      location: '',
      description: '',
      requirements: '',
      time_commitment: '',
      application_link: '',
      contact_email: ''
    });
  };

  const handleEdit = (opp) => {
    setEditingOpp(opp);
    setFormData({
      ...opp,
      requirements: opp.requirements.join(', ')
    });
    setShowForm(true);
  };

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2>Volunteer Opportunities Management</h2>
        <button 
          onClick={() => setShowForm(true)}
          className="add-btn"
        >
          <Plus size={16} />
          Add Opportunity
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content small-modal">
            <div className="modal-header">
              <h3>{editingOpp ? 'Edit Opportunity' : 'Add New Opportunity'}</h3>
              <button 
                onClick={() => {
                  setShowForm(false);
                  setEditingOpp(null);
                  resetForm();
                }}
                className="close-btn"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="volunteer-form compact-form">
              <div className="form-grid compact-grid">
                <div className="form-field">
                  <label>Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                    className="form-input compact-input"
                  />
                </div>
                
                <div className="form-field">
                  <label>Organization *</label>
                  <input
                    type="text"
                    value={formData.organization}
                    onChange={(e) => setFormData({...formData, organization: e.target.value})}
                    required
                    className="form-input compact-input"
                  />
                </div>
                
                <div className="form-field">
                  <label>Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    required
                    className="form-input compact-input"
                  >
                    <option value="">Select Type</option>
                    <option value="Clinical">Clinical</option>
                    <option value="Research">Research</option>
                    <option value="Community Health">Community Health</option>
                    <option value="Non-clinical">Non-clinical</option>
                  </select>
                </div>
                
                <div className="form-field">
                  <label>Location *</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    required
                    className="form-input compact-input"
                  />
                </div>
                
                <div className="form-field">
                  <label>Time Commitment</label>
                  <input
                    type="text"
                    value={formData.time_commitment}
                    onChange={(e) => setFormData({...formData, time_commitment: e.target.value})}
                    className="form-input compact-input"
                    placeholder="e.g., 4-6 hours per week"
                  />
                </div>
                
                <div className="form-field">
                  <label>Contact Email</label>
                  <input
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                    className="form-input compact-input"
                  />
                </div>
              </div>
              
              <div className="form-field">
                <label>Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                  className="form-textarea compact-textarea"
                  rows={2}
                />
              </div>
              
              <div className="form-row">
                <div className="form-field">
                  <label>Requirements</label>
                  <input
                    type="text"
                    value={formData.requirements}
                    onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                    className="form-input compact-input"
                    placeholder="Separate with commas"
                  />
                </div>
                
                <div className="form-field">
                  <label>Application Link</label>
                  <input
                    type="url"
                    value={formData.application_link}
                    onChange={(e) => setFormData({...formData, application_link: e.target.value})}
                    className="form-input compact-input"
                    placeholder="https://..."
                  />
                </div>
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={() => setShowForm(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {editingOpp ? 'Update Opportunity' : 'Add Opportunity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="opportunities-list">
        {opportunities.map((opp) => (
          <div key={opp.id} className="admin-card">
            <div className="card-header">
              <h3>{opp.title}</h3>
              <div className="card-actions">
                <button onClick={() => handleEdit(opp)} className="edit-btn">
                  <Edit3 size={16} />
                </button>
                <button onClick={() => onDelete(opp.id)} className="delete-btn">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className="card-content">
              <p><strong>Organization:</strong> {opp.organization}</p>
              <p><strong>Type:</strong> {opp.type}</p>
              <p><strong>Location:</strong> {opp.location}</p>
              <p><strong>Description:</strong> {opp.description}</p>
              {opp.requirements && opp.requirements.length > 0 && (
                <p><strong>Requirements:</strong> {opp.requirements.join(', ')}</p>
              )}
              {opp.time_commitment && <p><strong>Time Commitment:</strong> {opp.time_commitment}</p>}
              {opp.application_link && <p><strong>Application:</strong> <a href={opp.application_link} target="_blank" rel="noopener noreferrer">Apply Here</a></p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPanelPage;