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
  const [professors, setProfessors] = useState([]);
  const [volunteerOpps, setVolunteerOpps] = useState([]);
  const [ecProfiles, setECProfiles] = useState([]);
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
      console.log('Token exists:', !!token);
      console.log('Fetching data for tab:', activeTab);
      
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
          const postersRes = await axios.get(`${API}/admin/posters`, { headers });
          setPosters(Array.isArray(postersRes.data) ? postersRes.data : []);
          break;
        case 'professors':
          const profsRes = await axios.get(`${API}/admin/professor-network`, { headers });
          setProfessors(Array.isArray(profsRes.data) ? profsRes.data : []);
          break;
        case 'volunteer':
          const volRes = await axios.get(`${API}/admin/volunteer-opportunities`, { headers });
          setVolunteerOpps(Array.isArray(volRes.data) ? volRes.data : []);
          break;
        case 'ecprofiles':
          const ecRes = await axios.get(`${API}/admin/ec-profiles`, { headers });
          setECProfiles(Array.isArray(ecRes.data) ? ecRes.data : []);
          break;
      }
      
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
            onClick={() => setActiveTab('professors')}
            className={`admin-tab ${activeTab === 'professors' ? 'active' : ''}`}
          >
            Professor Network
          </button>
          <button
            onClick={() => setActiveTab('volunteer')}
            className={`admin-tab ${activeTab === 'volunteer' ? 'active' : ''}`}
          >
            Volunteer Opportunities
          </button>
          <button
            onClick={() => setActiveTab('ecprofiles')}
            className={`admin-tab ${activeTab === 'ecprofiles' ? 'active' : ''}`}
          >
            EC Profiles
          </button>
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
                />
              )}
              {activeTab === 'professors' && (
                <ProfessorManagementTab 
                  professors={professors}
                  onAdd={handleAddProfessor}
                  onEdit={handleEditProfessor}
                  onDelete={handleDeleteProfessor}
                  onRefresh={fetchData}
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
              {activeTab === 'ecprofiles' && (
                <ECProfileManagementTab 
                  profiles={ecProfiles}
                  onAdd={handleAddECProfile}
                  onEdit={handleEditECProfile}
                  onDelete={handleDeleteECProfile}
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
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      await axios.put(`${API}/posters/${posterId}/review`, { status }, { headers });
      toast.success(`Poster ${status} successfully`);
      fetchData();
    } catch (error) {
      console.error('Poster review error:', error.response?.data || error.message);
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

  async function handleAddProfessor(professorData) {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      await axios.post(`${API}/admin/professor-network`, professorData, { headers });
      toast.success('Professor added successfully');
      fetchData();
    } catch (error) {
      console.error('Add professor error:', error.response?.data || error.message);
      toast.error('Error adding professor: ' + (error.response?.data?.detail || error.message));
    }
  }

  async function handleEditProfessor(professorId, professorData) {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      await axios.put(`${API}/admin/professor-network/${professorId}`, professorData, { headers });
      toast.success('Professor updated successfully');
      fetchData();
    } catch (error) {
      console.error('Edit professor error:', error.response?.data || error.message);
      toast.error('Error updating professor: ' + (error.response?.data?.detail || error.message));
    }
  }

  async function handleDeleteProfessor(professorId) {
    if (!window.confirm('Are you sure you want to delete this professor?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      await axios.delete(`${API}/admin/professor-network/${professorId}`, { headers });
      toast.success('Professor deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Delete professor error:', error.response?.data || error.message);
      toast.error('Error deleting professor: ' + (error.response?.data?.detail || error.message));
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

  async function handleAddECProfile(profileData) {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      await axios.post(`${API}/admin/ec-profiles`, profileData, { headers });
      toast.success('EC Profile added successfully');
      fetchData();
    } catch (error) {
      console.error('Add EC profile error:', error.response?.data || error.message);
      toast.error('Error adding EC profile: ' + (error.response?.data?.detail || error.message));
    }
  }

  async function handleEditECProfile(profileId, profileData) {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      await axios.put(`${API}/admin/ec-profiles/${profileId}`, profileData, { headers });
      toast.success('EC Profile updated successfully');
      fetchData();
    } catch (error) {
      console.error('Edit EC profile error:', error.response?.data || error.message);
      toast.error('Error updating EC profile: ' + (error.response?.data?.detail || error.message));
    }
  }

  async function handleDeleteECProfile(profileId) {
    if (!window.confirm('Are you sure you want to delete this EC profile?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      await axios.delete(`${API}/admin/ec-profiles/${profileId}`, { headers });
      toast.success('EC Profile deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Delete EC profile error:', error.response?.data || error.message);
      toast.error('Error deleting EC profile: ' + (error.response?.data?.detail || error.message));
    }
  }
};

// Poster Management Tab Component
const PosterManagementTab = ({ posters, onReview, onDelete }) => (
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

// Professor Management Tab Component
const ProfessorManagementTab = ({ professors, onAdd, onEdit, onDelete, onRefresh }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingProfessor, setEditingProfessor] = useState(null);
  const [formData, setFormData] = useState({
    user_name: '',
    user_university: '',
    department: '',
    research_areas: '',
    lab_description: '',
    contact_email: '',
    website: '',
    accepting_students: true
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const professorData = {
      ...formData,
      research_areas: formData.research_areas.split(',').map(area => area.trim()).filter(area => area),
      website: formData.website.trim() || null // Send null if empty to avoid URL validation issues
    };

    if (editingProfessor) {
      await onEdit(editingProfessor.id, professorData);
      setEditingProfessor(null);
    } else {
      await onAdd(professorData);
    }
    
    setShowForm(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      user_name: '',
      user_university: '',
      department: '',
      research_areas: '',
      lab_description: '',
      contact_email: '',
      website: '',
      accepting_students: true
    });
  };

  const handleEdit = (professor) => {
    setEditingProfessor(professor);
    setFormData({
      ...professor,
      research_areas: professor.research_areas.join(', ')
    });
    setShowForm(true);
  };

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2>Professor Network Management</h2>
        <button 
          onClick={() => setShowForm(true)}
          className="add-btn"
        >
          <Plus size={16} />
          Add Professor
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingProfessor ? 'Edit Professor' : 'Add New Professor'}</h3>
              <button 
                onClick={() => {
                  setShowForm(false);
                  setEditingProfessor(null);
                  resetForm();
                }}
                className="close-btn"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="professor-form">
              <div className="form-grid">
                <div className="form-field">
                  <label>Name *</label>
                  <input
                    type="text"
                    value={formData.user_name}
                    onChange={(e) => setFormData({...formData, user_name: e.target.value})}
                    required
                    className="form-input"
                  />
                </div>
                
                <div className="form-field">
                  <label>University *</label>
                  <select
                    value={formData.user_university}
                    onChange={(e) => setFormData({...formData, user_university: e.target.value})}
                    required
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
                </div>
                
                <div className="form-field">
                  <label>Department *</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    required
                    className="form-input"
                  />
                </div>
                
                <div className="form-field">
                  <label>Contact Email *</label>
                  <input
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                    required
                    className="form-input"
                  />
                </div>
                
                <div className="form-field">
                  <label>Website (Optional)</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                    className="form-input"
                    placeholder="https://example.com (optional)"
                  />
                </div>
                
                <div className="form-field">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.accepting_students}
                      onChange={(e) => setFormData({...formData, accepting_students: e.target.checked})}
                    />
                    Currently accepting students
                  </label>
                </div>
              </div>
              
              <div className="form-field">
                <label>Research Areas *</label>
                <input
                  type="text"
                  value={formData.research_areas}
                  onChange={(e) => setFormData({...formData, research_areas: e.target.value})}
                  required
                  className="form-input"
                  placeholder="Separate multiple areas with commas"
                />
              </div>
              
              <div className="form-field">
                <label>Lab Description *</label>
                <textarea
                  value={formData.lab_description}
                  onChange={(e) => setFormData({...formData, lab_description: e.target.value})}
                  required
                  className="form-textarea"
                  rows={4}
                />
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={() => setShowForm(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {editingProfessor ? 'Update Professor' : 'Add Professor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="professors-list">
        {professors.map((professor) => (
          <div key={professor.id} className="admin-card">
            <div className="card-header">
              <h3>{professor.user_name}</h3>
              <div className="card-actions">
                <button onClick={() => handleEdit(professor)} className="edit-btn">
                  <Edit3 size={16} />
                </button>
                <button onClick={() => onDelete(professor.id)} className="delete-btn">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className="card-content">
              <p><strong>University:</strong> {professor.user_university}</p>
              <p><strong>Department:</strong> {professor.department}</p>
              <p><strong>Research Areas:</strong> {professor.research_areas.join(', ')}</p>
              <p><strong>Email:</strong> {professor.contact_email}</p>
              {professor.website && <p><strong>Website:</strong> <a href={professor.website} target="_blank" rel="noopener noreferrer">{professor.website}</a></p>}
              <p><strong>Accepting Students:</strong> {professor.accepting_students ? 'Yes' : 'No'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

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

// EC Profile Management Tab Component
const ECProfileManagementTab = ({ profiles, onAdd, onEdit, onDelete, onRefresh }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [formData, setFormData] = useState({
    medical_school: '',
    admission_year: '',
    undergraduate_gpa: '',
    mcat_score: '',
    research_hours: '',
    volunteer_hours: '',
    leadership_activities: '',
    awards_scholarships: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const profileData = {
      ...formData,
      undergraduate_gpa: parseFloat(formData.undergraduate_gpa),
      mcat_score: formData.mcat_score ? parseInt(formData.mcat_score) : null,
      research_hours: formData.research_hours ? parseInt(formData.research_hours) : null,
      volunteer_hours: formData.volunteer_hours ? parseInt(formData.volunteer_hours) : null,
      admission_year: parseInt(formData.admission_year),
      leadership_activities: formData.leadership_activities.split(',').map(item => item.trim()).filter(item => item),
      awards_scholarships: formData.awards_scholarships.split(',').map(item => item.trim()).filter(item => item)
    };

    if (editingProfile) {
      await onEdit(editingProfile.id, profileData);
      setEditingProfile(null);
    } else {
      await onAdd(profileData);
    }
    
    setShowForm(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      medical_school: '',
      admission_year: '',
      undergraduate_gpa: '',
      mcat_score: '',
      research_hours: '',
      volunteer_hours: '',
      leadership_activities: '',
      awards_scholarships: ''
    });
  };

  const handleEdit = (profile) => {
    setEditingProfile(profile);
    setFormData({
      ...profile,
      undergraduate_gpa: profile.undergraduate_gpa.toString(),
      mcat_score: profile.mcat_score ? profile.mcat_score.toString() : '',
      research_hours: profile.research_hours ? profile.research_hours.toString() : '',
      volunteer_hours: profile.volunteer_hours ? profile.volunteer_hours.toString() : '',
      admission_year: profile.admission_year.toString(),
      leadership_activities: profile.leadership_activities ? profile.leadership_activities.join(', ') : '',
      awards_scholarships: profile.awards_scholarships ? profile.awards_scholarships.join(', ') : ''
    });
    setShowForm(true);
  };

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2>EC Profiles Management</h2>
        <button 
          onClick={() => setShowForm(true)}
          className="add-btn"
        >
          <Plus size={16} />
          Add Profile
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingProfile ? 'Edit EC Profile' : 'Add New EC Profile'}</h3>
              <button 
                onClick={() => {
                  setShowForm(false);
                  setEditingProfile(null);
                  resetForm();
                }}
                className="close-btn"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-grid">
                <div className="form-field">
                  <label>Medical School *</label>
                  <select
                    value={formData.medical_school}
                    onChange={(e) => setFormData({...formData, medical_school: e.target.value})}
                    required
                    className="form-input"
                  >
                    <option value="">Select Medical School</option>
                    <option value="University of Toronto">University of Toronto</option>
                    <option value="University of Western Ontario">University of Western Ontario</option>
                    <option value="McMaster University">McMaster University</option>
                    <option value="Queen's University">Queen's University</option>
                    <option value="University of Ottawa">University of Ottawa</option>
                    <option value="University of British Columbia">University of British Columbia</option>
                    <option value="McGill University">McGill University</option>
                    <option value="University of Alberta">University of Alberta</option>
                  </select>
                </div>
                
                <div className="form-field">
                  <label>Admission Year *</label>
                  <input
                    type="number"
                    value={formData.admission_year}
                    onChange={(e) => setFormData({...formData, admission_year: e.target.value})}
                    required
                    className="form-input"
                    min="2020"
                    max="2030"
                  />
                </div>
                
                <div className="form-field">
                  <label>Undergraduate GPA *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.undergraduate_gpa}
                    onChange={(e) => setFormData({...formData, undergraduate_gpa: e.target.value})}
                    required
                    className="form-input"
                    min="0"
                    max="4.0"
                  />
                </div>
                
                <div className="form-field">
                  <label>MCAT Score</label>
                  <input
                    type="number"
                    value={formData.mcat_score}
                    onChange={(e) => setFormData({...formData, mcat_score: e.target.value})}
                    className="form-input"
                    min="472"
                    max="528"
                  />
                </div>
                
                <div className="form-field">
                  <label>Research Hours</label>
                  <input
                    type="number"
                    value={formData.research_hours}
                    onChange={(e) => setFormData({...formData, research_hours: e.target.value})}
                    className="form-input"
                    min="0"
                  />
                </div>
                
                <div className="form-field">
                  <label>Volunteer Hours</label>
                  <input
                    type="number"
                    value={formData.volunteer_hours}
                    onChange={(e) => setFormData({...formData, volunteer_hours: e.target.value})}
                    className="form-input"
                    min="0"
                  />
                </div>
              </div>
              
              <div className="form-field">
                <label>Leadership Activities</label>
                <input
                  type="text"
                  value={formData.leadership_activities}
                  onChange={(e) => setFormData({...formData, leadership_activities: e.target.value})}
                  className="form-input"
                  placeholder="Separate multiple activities with commas"
                />
              </div>
              
              <div className="form-field">
                <label>Awards & Scholarships</label>
                <input
                  type="text"
                  value={formData.awards_scholarships}
                  onChange={(e) => setFormData({...formData, awards_scholarships: e.target.value})}
                  className="form-input"
                  placeholder="Separate multiple awards with commas"
                />
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={() => setShowForm(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {editingProfile ? 'Update Profile' : 'Add Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="profiles-list">
        {profiles.map((profile) => (
          <div key={profile.id} className="admin-card">
            <div className="card-header">
              <h3>{profile.medical_school} - Class of {profile.admission_year}</h3>
              <div className="card-actions">
                <button onClick={() => handleEdit(profile)} className="edit-btn">
                  <Edit3 size={16} />
                </button>
                <button onClick={() => onDelete(profile.id)} className="delete-btn">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className="card-content">
              <p><strong>GPA:</strong> {profile.undergraduate_gpa}</p>
              {profile.mcat_score && <p><strong>MCAT:</strong> {profile.mcat_score}</p>}
              {profile.research_hours && <p><strong>Research Hours:</strong> {profile.research_hours}</p>}
              {profile.volunteer_hours && <p><strong>Volunteer Hours:</strong> {profile.volunteer_hours}</p>}
              {profile.leadership_activities && profile.leadership_activities.length > 0 && (
                <p><strong>Leadership:</strong> {profile.leadership_activities.join(', ')}</p>
              )}
              {profile.awards_scholarships && profile.awards_scholarships.length > 0 && (
                <p><strong>Awards:</strong> {profile.awards_scholarships.join(', ')}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPanelPage;