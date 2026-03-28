import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, CheckCircle, XCircle, Edit3, Star, StarOff, 
  AlertTriangle, User, Calendar, Tag, BarChart3, Eye
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminStoriesPage = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  
  const [stories, setStories] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [page, setPage] = useState(1);
  const [counts, setCounts] = useState({});
  const [hasMore, setHasMore] = useState(false);
  
  // Modal states
  const [selectedStory, setSelectedStory] = useState(null);
  const [actionModal, setActionModal] = useState(null); // 'approve', 'reject', 'edit_request'
  const [feedback, setFeedback] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!user || user.user_type !== 'admin') {
      toast.error('Admin access required');
      navigate('/');
      return;
    }
    fetchStories();
    fetchAnalytics();
  }, [user, statusFilter]);

  const fetchStories = async (pageNum = 1) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API}/admin/stories?status=${statusFilter}&page=${pageNum}&limit=20`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      if (res.ok) {
        const data = await res.json();
        if (pageNum === 1) {
          setStories(data.stories);
        } else {
          setStories(prev => [...prev, ...data.stories]);
        }
        setCounts(data.counts);
        setPage(pageNum);
        setHasMore((pageNum * 20) < data.total);
      }
    } catch (error) {
      console.error('Error fetching stories:', error);
      toast.error('Failed to load stories');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`${API}/admin/stories/analytics`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const handleAction = async (action) => {
    if (action === 'edit_requested' && !feedback.trim()) {
      toast.error('Please provide feedback when requesting edits');
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(`${API}/admin/stories/${selectedStory.id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: action,
          feedback: feedback || null
        })
      });

      if (res.ok) {
        toast.success(`Story ${action === 'approved' ? 'approved' : action === 'rejected' ? 'rejected' : 'sent back for edits'}`);
        setActionModal(null);
        setSelectedStory(null);
        setFeedback('');
        fetchStories(1);
        fetchAnalytics();
      } else {
        const error = await res.json();
        toast.error(error.detail || 'Action failed');
      }
    } catch (error) {
      console.error('Error performing action:', error);
      toast.error('Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleFeatured = async (storyId) => {
    try {
      const res = await fetch(`${API}/admin/stories/${storyId}/feature`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(data.message);
        fetchStories(1);
      }
    } catch (error) {
      console.error('Error toggling featured:', error);
      toast.error('Failed to update');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const truncateText = (text, maxLength = 150) => {
    if (!text) return '';
    const plainText = text.replace(/<[^>]*>/g, '');
    if (plainText.length <= maxLength) return plainText;
    return plainText.substring(0, maxLength).trim() + '...';
  };

  if (!user || user.user_type !== 'admin') {
    return null;
  }

  return (
    <div className="vs-admin-page">
      {/* Header */}
      <div className="vs-admin-header">
        <div className="vs-container">
          <div className="vs-admin-header-content">
            <BookOpen size={32} />
            <div>
              <h1>Story Management</h1>
              <p>Review and manage community stories</p>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="vs-admin-analytics">
          <div className="vs-container">
            <div className="vs-analytics-grid">
              <div className="vs-analytics-card">
                <BarChart3 size={24} />
                <div>
                  <span className="vs-analytics-value">{analytics.total_submitted}</span>
                  <span className="vs-analytics-label">Total Stories</span>
                </div>
              </div>
              <div className="vs-analytics-card vs-analytics-pending">
                <AlertTriangle size={24} />
                <div>
                  <span className="vs-analytics-value">{analytics.total_pending}</span>
                  <span className="vs-analytics-label">Pending Review</span>
                </div>
              </div>
              <div className="vs-analytics-card vs-analytics-approved">
                <CheckCircle size={24} />
                <div>
                  <span className="vs-analytics-value">{analytics.total_approved}</span>
                  <span className="vs-analytics-label">Published</span>
                </div>
              </div>
              <div className="vs-analytics-card">
                <Star size={24} />
                <div>
                  <span className="vs-analytics-value">{analytics.total_resonance}</span>
                  <span className="vs-analytics-label">Total Resonance</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Tabs */}
      <div className="vs-admin-tabs">
        <div className="vs-container">
          <div className="vs-tabs-bar">
            {['pending', 'approved', 'rejected', 'edit_requested'].map(status => (
              <button
                key={status}
                className={`vs-tab ${statusFilter === status ? 'active' : ''}`}
                onClick={() => { setStatusFilter(status); setPage(1); }}
              >
                {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
                <span className="vs-tab-count">{counts[status] || 0}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stories List */}
      <div className="vs-admin-content">
        <div className="vs-container">
          {loading && page === 1 ? (
            <div className="vs-admin-loading">Loading stories...</div>
          ) : stories.length === 0 ? (
            <div className="vs-admin-empty">
              <BookOpen size={48} />
              <p>No {statusFilter.replace('_', ' ')} stories</p>
            </div>
          ) : (
            <>
              <div className="vs-admin-stories-list">
                {stories.map(story => (
                  <div key={story.id} className="vs-admin-story-card">
                    <div className="vs-admin-story-header">
                      <div className="vs-admin-story-meta">
                        <User size={16} />
                        <span className="vs-admin-author">
                          {story.author_name} ({story.author_email})
                        </span>
                        {story.is_anonymous && (
                          <span className="vs-admin-badge vs-badge-anonymous">Anonymous</span>
                        )}
                        {story.has_content_warning && (
                          <span className="vs-admin-badge vs-badge-warning">
                            <AlertTriangle size={12} /> Content Warning
                          </span>
                        )}
                        {story.is_featured && (
                          <span className="vs-admin-badge vs-badge-featured">
                            <Star size={12} /> Featured
                          </span>
                        )}
                      </div>
                      <div className="vs-admin-story-date">
                        <Calendar size={14} />
                        {formatDate(story.created_at)}
                      </div>
                    </div>

                    <h3 className="vs-admin-story-title">{story.title}</h3>
                    
                    <div className="vs-admin-story-tags">
                      {story.tags?.map((tag, idx) => (
                        <span key={idx} className="vs-tag-pill-small">{tag}</span>
                      ))}
                    </div>

                    <p className="vs-admin-story-preview">{truncateText(story.body, 250)}</p>

                    {story.admin_feedback && (
                      <div className="vs-admin-feedback">
                        <strong>Admin Feedback:</strong> {story.admin_feedback}
                      </div>
                    )}

                    <div className="vs-admin-story-actions">
                      <button 
                        className="vs-admin-btn vs-btn-view"
                        onClick={() => setSelectedStory(story)}
                      >
                        <Eye size={16} /> View Full
                      </button>

                      {story.status === 'pending' && (
                        <>
                          <button 
                            className="vs-admin-btn vs-btn-approve"
                            onClick={() => { setSelectedStory(story); setActionModal('approved'); }}
                          >
                            <CheckCircle size={16} /> Approve
                          </button>
                          <button 
                            className="vs-admin-btn vs-btn-edit-request"
                            onClick={() => { setSelectedStory(story); setActionModal('edit_requested'); }}
                          >
                            <Edit3 size={16} /> Request Edit
                          </button>
                          <button 
                            className="vs-admin-btn vs-btn-reject"
                            onClick={() => { setSelectedStory(story); setActionModal('rejected'); }}
                          >
                            <XCircle size={16} /> Reject
                          </button>
                        </>
                      )}

                      {story.status === 'approved' && (
                        <button 
                          className="vs-admin-btn vs-btn-feature"
                          onClick={() => handleToggleFeatured(story.id)}
                        >
                          {story.is_featured ? <StarOff size={16} /> : <Star size={16} />}
                          {story.is_featured ? 'Unfeature' : 'Feature'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {hasMore && (
                <div className="vs-admin-load-more">
                  <button 
                    className="vs-btn-outline"
                    onClick={() => fetchStories(page + 1)}
                    disabled={loading}
                  >
                    Load More
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* View Story Modal */}
      {selectedStory && !actionModal && (
        <div className="vs-modal-overlay" onClick={() => setSelectedStory(null)}>
          <div className="vs-modal vs-modal-large" onClick={e => e.stopPropagation()}>
            <div className="vs-modal-header">
              <h2>Story Details</h2>
              <button onClick={() => setSelectedStory(null)}>×</button>
            </div>
            <div className="vs-modal-body">
              <div className="vs-modal-meta">
                <p><strong>Author:</strong> {selectedStory.author_name} ({selectedStory.author_email})</p>
                <p><strong>Display:</strong> {selectedStory.is_anonymous ? 'Anonymous' : 'Named'}</p>
                <p><strong>University:</strong> {selectedStory.university || 'Not specified'}</p>
                <p><strong>Submitted:</strong> {formatDate(selectedStory.created_at)}</p>
                <p><strong>Status:</strong> {selectedStory.status}</p>
              </div>
              <div className="vs-modal-tags">
                {selectedStory.tags?.map((tag, idx) => (
                  <span key={idx} className="vs-tag-pill">{tag}</span>
                ))}
              </div>
              {selectedStory.has_content_warning && (
                <div className="vs-modal-warning">
                  <AlertTriangle size={18} /> This story has a content warning
                </div>
              )}
              <h3>{selectedStory.title}</h3>
              <div 
                className="vs-modal-story-body"
                dangerouslySetInnerHTML={{ __html: selectedStory.body.replace(/\n/g, '<br/>') }}
              />
            </div>
            <div className="vs-modal-footer">
              {selectedStory.status === 'pending' && (
                <>
                  <button 
                    className="vs-btn-primary"
                    onClick={() => setActionModal('approved')}
                  >
                    Approve
                  </button>
                  <button 
                    className="vs-btn-outline"
                    onClick={() => setActionModal('edit_requested')}
                  >
                    Request Edit
                  </button>
                  <button 
                    className="vs-btn-danger"
                    onClick={() => setActionModal('rejected')}
                  >
                    Reject
                  </button>
                </>
              )}
              <button className="vs-btn-secondary" onClick={() => setSelectedStory(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Confirmation Modal */}
      {actionModal && (
        <div className="vs-modal-overlay" onClick={() => { setActionModal(null); setFeedback(''); }}>
          <div className="vs-modal" onClick={e => e.stopPropagation()}>
            <div className="vs-modal-header">
              <h2>
                {actionModal === 'approved' && 'Approve Story'}
                {actionModal === 'rejected' && 'Reject Story'}
                {actionModal === 'edit_requested' && 'Request Edits'}
              </h2>
              <button onClick={() => { setActionModal(null); setFeedback(''); }}>×</button>
            </div>
            <div className="vs-modal-body">
              <p><strong>Story:</strong> {selectedStory?.title}</p>
              
              {(actionModal === 'rejected' || actionModal === 'edit_requested') && (
                <div className="vs-form-group">
                  <label>
                    Feedback for Author {actionModal === 'edit_requested' && <span className="vs-required">*</span>}
                  </label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder={
                      actionModal === 'edit_requested' 
                        ? 'Explain what changes are needed...'
                        : 'Optional: Explain why this story was rejected...'
                    }
                    rows={4}
                  />
                </div>
              )}

              {actionModal === 'approved' && (
                <p className="vs-modal-info">
                  This story will be published and visible to all users.
                </p>
              )}
            </div>
            <div className="vs-modal-footer">
              <button 
                className={`vs-btn-primary ${actionModal === 'rejected' ? 'vs-btn-danger' : ''}`}
                onClick={() => handleAction(actionModal)}
                disabled={actionLoading}
              >
                {actionLoading ? 'Processing...' : 'Confirm'}
              </button>
              <button 
                className="vs-btn-secondary"
                onClick={() => { setActionModal(null); setFeedback(''); }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStoriesPage;
