import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { Check, X, Edit3, Star, StarOff, Eye, BarChart3, FileText, Users, Tag, Sparkles } from 'lucide-react';
import StatCard from '../components/StatCard.tsx';
import TagPill from '../components/TagPill.tsx';
import InstagramGenerator from './InstagramGenerator.tsx';
import { ADMIN_STORIES, ADMIN_STATS, HEALTH_TAGS, type AdminStory } from '../data/mockData.ts';

const API_URL = process.env.REACT_APP_BACKEND_URL;

type TabType = 'overview' | 'review' | 'featured' | 'tags' | 'generator';
type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

interface AuthUser {
  user_id: string;
  email: string;
  name: string;
  user_type: string;
}

const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');
  const [stories, setStories] = useState(ADMIN_STORIES);
  const [tags, setTags] = useState(HEALTH_TAGS);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user was passed via route state (from AuthCallback)
    if (location.state && (location.state as any).user) {
      const u = (location.state as any).user;
      setCurrentUser(u);
      setLoading(false);
      return;
    }

    // Check session via /auth/me
    fetch(`${API_URL}/api/auth/me`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => { setCurrentUser(data); setLoading(false); })
      .catch(() => { setLoading(false); navigate('/signin'); });
  }, [location.state, navigate]);

  const isAdminEmail = currentUser?.email === 'curejournal@gmail.com';

  const handleApprove = (id: string) => {
    setStories((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'approved' as const } : s))
    );
  };

  const handleReject = (id: string) => {
    setStories((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'rejected' as const } : s))
    );
  };

  const handleToggleFeatured = (id: string) => {
    setStories((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isFeatured: !s.isFeatured } : s))
    );
  };

  const filteredStories = statusFilter === 'all'
    ? stories
    : stories.filter((s) => s.status === statusFilter);

  const approvedStories = stories.filter((s) => s.status === 'approved');

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: <BarChart3 size={18} /> },
    { id: 'review' as TabType, label: 'Review Queue', icon: <FileText size={18} /> },
    { id: 'featured' as TabType, label: 'Featured', icon: <Star size={18} /> },
    { id: 'tags' as TabType, label: 'Tags', icon: <Tag size={18} /> },
    ...(isAdminEmail ? [{ id: 'generator' as TabType, label: 'Post Generator', icon: <Sparkles size={18} /> }] : []),
  ];

  if (loading) {
    return (
      <div className="admin-page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--vs-text-secondary)' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="admin-page" data-testid="admin-dashboard">
      {/* Header */}
      <header className="admin-header">
        <div className="container">
          <div className="admin-header-content">
            <h1>Admin Dashboard</h1>
            <p>Manage stories, reviews, and platform settings</p>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <nav className="admin-tabs">
        <div className="container">
          <div className="tabs-bar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="admin-content">
        <div className="container">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="stats-grid">
                <StatCard
                  label="Total Submitted"
                  value={ADMIN_STATS.totalSubmitted}
                  icon={<FileText size={20} />}
                />
                <StatCard
                  label="Approved"
                  value={ADMIN_STATS.approved}
                  icon={<Check size={20} />}
                />
                <StatCard
                  label="Pending Review"
                  value={ADMIN_STATS.pending}
                  icon={<Users size={20} />}
                />
                <StatCard
                  label="Rejected"
                  value={ADMIN_STATS.rejected}
                  icon={<X size={20} />}
                />
              </div>
            </motion.div>
          )}

          {/* Review Queue Tab */}
          {activeTab === 'review' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="review-filters">
                {(['all', 'pending', 'approved', 'rejected'] as StatusFilter[]).map((status) => (
                  <button
                    key={status}
                    className={`filter-btn ${statusFilter === status ? 'active' : ''}`}
                    onClick={() => setStatusFilter(status)}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                    <span className="filter-count">
                      {status === 'all'
                        ? stories.length
                        : stories.filter((s) => s.status === status).length}
                    </span>
                  </button>
                ))}
              </div>

              <div className="review-table">
                <div className="table-header">
                  <span className="col-title">Story</span>
                  <span className="col-author">Author</span>
                  <span className="col-status">Status</span>
                  <span className="col-date">Submitted</span>
                  <span className="col-actions">Actions</span>
                </div>
                {filteredStories.map((story) => (
                  <div key={story.id} className="table-row">
                    <div className="col-title">
                      <span className="story-title">{story.title}</span>
                      <div className="story-tags">
                        {story.tags.slice(0, 2).map((tag) => (
                          <TagPill key={tag} tag={tag} size="sm" />
                        ))}
                      </div>
                    </div>
                    <div className="col-author">
                      <span className="author-name">
                        {story.isAnonymous ? 'Anonymous' : story.authorName}
                      </span>
                      <span className="author-email">{story.authorEmail}</span>
                    </div>
                    <div className="col-status">
                      <span className={`status-badge status-${story.status}`}>
                        {story.status}
                      </span>
                    </div>
                    <div className="col-date">
                      {new Date(story.submittedAt).toLocaleDateString()}
                    </div>
                    <div className="col-actions">
                      <button className="action-btn action-view" title="View">
                        <Eye size={16} />
                      </button>
                      {story.status === 'pending' && (
                        <>
                          <button
                            className="action-btn action-approve"
                            title="Approve"
                            onClick={() => handleApprove(story.id)}
                          >
                            <Check size={16} />
                          </button>
                          <button
                            className="action-btn action-edit"
                            title="Request Edit"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            className="action-btn action-reject"
                            title="Reject"
                            onClick={() => handleReject(story.id)}
                          >
                            <X size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Featured Tab */}
          {activeTab === 'featured' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <p className="tab-description">
                Featured stories appear prominently on the homepage.
              </p>
              <div className="featured-list">
                {approvedStories.map((story) => (
                  <div key={story.id} className="featured-item">
                    <div className="featured-info">
                      <h3>{story.title}</h3>
                      <div className="featured-meta">
                        {story.isAnonymous ? 'Anonymous' : story.authorName}
                      </div>
                    </div>
                    <button
                      className={`feature-toggle ${story.isFeatured ? 'active' : ''}`}
                      onClick={() => handleToggleFeatured(story.id)}
                    >
                      {story.isFeatured ? <StarOff size={18} /> : <Star size={18} />}
                      {story.isFeatured ? 'Unfeature' : 'Feature'}
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Tags Tab */}
          {activeTab === 'tags' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <p className="tab-description">
                Manage health topic tags for story categorization.
              </p>
              <div className="tags-list">
                {tags.map((tag) => (
                  <div key={tag.id} className="tag-item">
                    <div className="tag-info">
                      <span className="tag-name">{tag.name}</span>
                      <span className="tag-count">{tag.count} stories</span>
                    </div>
                    <div className="tag-actions">
                      <button className="action-btn action-edit" title="Rename">
                        <Edit3 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button className="btn btn-secondary add-tag-btn">
                Add New Tag
              </button>
            </motion.div>
          )}

          {/* Post Generator Tab - Only for curejournal@gmail.com */}
          {activeTab === 'generator' && isAdminEmail && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <InstagramGenerator />
            </motion.div>
          )}
        </div>
      </main>

      <style>{`
        .admin-page {
          min-height: 100vh;
          background: var(--vs-bg-subtle);
        }

        .admin-header {
          background: var(--vs-white);
          padding: var(--vs-space-8) 0;
          border-bottom: 1px solid var(--vs-border);
        }

        .admin-header h1 {
          font-size: 1.5rem;
          margin-bottom: var(--vs-space-1);
        }

        .admin-header p {
          font-size: 0.9375rem;
          color: var(--vs-text-secondary);
        }

        .admin-tabs {
          background: var(--vs-white);
          border-bottom: 1px solid var(--vs-border);
        }

        .tabs-bar {
          display: flex;
          gap: var(--vs-space-1);
          padding: var(--vs-space-3) 0;
        }

        .tab-btn {
          display: flex;
          align-items: center;
          gap: var(--vs-space-2);
          padding: var(--vs-space-2) var(--vs-space-4);
          font-family: var(--vs-font);
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--vs-text-secondary);
          background: transparent;
          border: none;
          border-radius: var(--vs-radius-md);
          cursor: pointer;
          transition: all var(--vs-transition-fast);
        }

        .tab-btn:hover {
          background: var(--vs-bg-hover);
          color: var(--vs-text-primary);
        }

        .tab-btn.active {
          background: var(--vs-black);
          color: var(--vs-white);
        }

        .admin-content {
          padding: var(--vs-space-8) 0 var(--vs-space-16);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--vs-space-4);
        }

        .tab-description {
          font-size: 0.9375rem;
          color: var(--vs-text-secondary);
          margin-bottom: var(--vs-space-6);
        }

        /* Review Table */
        .review-filters {
          display: flex;
          gap: var(--vs-space-2);
          margin-bottom: var(--vs-space-6);
        }

        .filter-btn {
          display: flex;
          align-items: center;
          gap: var(--vs-space-2);
          padding: var(--vs-space-2) var(--vs-space-4);
          font-family: var(--vs-font);
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--vs-text-secondary);
          background: var(--vs-white);
          border: 1px solid var(--vs-border);
          border-radius: var(--vs-radius-full);
          cursor: pointer;
          transition: all var(--vs-transition-fast);
        }

        .filter-btn:hover {
          border-color: var(--vs-border-hover);
        }

        .filter-btn.active {
          background: var(--vs-black);
          color: var(--vs-white);
          border-color: var(--vs-black);
        }

        .filter-count {
          font-size: 0.75rem;
          opacity: 0.7;
        }

        .review-table {
          background: var(--vs-white);
          border: 1px solid var(--vs-border);
          border-radius: var(--vs-radius-lg);
          overflow: hidden;
        }

        .table-header,
        .table-row {
          display: grid;
          grid-template-columns: 2fr 1.5fr 100px 100px 140px;
          gap: var(--vs-space-4);
          padding: var(--vs-space-4) var(--vs-space-5);
          align-items: center;
        }

        .table-header {
          background: var(--vs-bg-subtle);
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--vs-text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .table-row {
          border-top: 1px solid var(--vs-border);
        }

        .table-row:hover {
          background: var(--vs-bg-hover);
        }

        .story-title {
          font-weight: 500;
          color: var(--vs-text-primary);
          display: block;
          margin-bottom: var(--vs-space-2);
        }

        .story-tags {
          display: flex;
          gap: var(--vs-space-1);
        }

        .author-name {
          display: block;
          font-weight: 500;
          color: var(--vs-text-primary);
          font-size: 0.875rem;
        }

        .author-email {
          font-size: 0.75rem;
          color: var(--vs-text-tertiary);
        }

        .status-badge {
          display: inline-block;
          padding: var(--vs-space-1) var(--vs-space-2);
          font-size: 0.75rem;
          font-weight: 500;
          border-radius: var(--vs-radius-sm);
          text-transform: capitalize;
        }

        .status-pending {
          background: rgba(17, 17, 17, 0.08);
          color: var(--vs-text-secondary);
        }

        .status-approved {
          background: rgba(34, 197, 94, 0.1);
          color: #16a34a;
        }

        .status-rejected {
          background: rgba(255, 90, 95, 0.1);
          color: var(--vs-coral);
        }

        .col-date {
          font-size: 0.875rem;
          color: var(--vs-text-secondary);
        }

        .col-actions {
          display: flex;
          gap: var(--vs-space-1);
        }

        .action-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: 1px solid var(--vs-border);
          border-radius: var(--vs-radius-md);
          color: var(--vs-text-secondary);
          cursor: pointer;
          transition: all var(--vs-transition-fast);
        }

        .action-btn:hover {
          border-color: var(--vs-border-hover);
          color: var(--vs-text-primary);
        }

        .action-approve:hover {
          border-color: #16a34a;
          color: #16a34a;
          background: rgba(34, 197, 94, 0.1);
        }

        .action-reject:hover {
          border-color: var(--vs-coral);
          color: var(--vs-coral);
          background: rgba(255, 90, 95, 0.1);
        }

        /* Featured List */
        .featured-list {
          display: flex;
          flex-direction: column;
          gap: var(--vs-space-3);
        }

        .featured-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--vs-space-4) var(--vs-space-5);
          background: var(--vs-white);
          border: 1px solid var(--vs-border);
          border-radius: var(--vs-radius-lg);
        }

        .featured-info h3 {
          font-size: 0.9375rem;
          font-weight: 500;
          margin-bottom: var(--vs-space-1);
        }

        .featured-meta {
          font-size: 0.8125rem;
          color: var(--vs-text-tertiary);
        }

        .meta-separator {
          margin: 0 var(--vs-space-2);
        }

        .feature-toggle {
          display: flex;
          align-items: center;
          gap: var(--vs-space-2);
          padding: var(--vs-space-2) var(--vs-space-3);
          font-family: var(--vs-font);
          font-size: 0.8125rem;
          font-weight: 500;
          color: var(--vs-text-secondary);
          background: transparent;
          border: 1px solid var(--vs-border);
          border-radius: var(--vs-radius-md);
          cursor: pointer;
          transition: all var(--vs-transition-fast);
        }

        .feature-toggle:hover {
          border-color: var(--vs-border-hover);
        }

        .feature-toggle.active {
          background: rgba(255, 90, 95, 0.1);
          border-color: var(--vs-coral);
          color: var(--vs-coral);
        }

        /* Tags List */
        .tags-list {
          display: flex;
          flex-direction: column;
          gap: var(--vs-space-2);
          margin-bottom: var(--vs-space-6);
        }

        .tag-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--vs-space-3) var(--vs-space-4);
          background: var(--vs-white);
          border: 1px solid var(--vs-border);
          border-radius: var(--vs-radius-md);
        }

        .tag-name {
          font-weight: 500;
        }

        .tag-count {
          font-size: 0.8125rem;
          color: var(--vs-text-tertiary);
          margin-left: var(--vs-space-3);
        }

        .add-tag-btn {
          margin-top: var(--vs-space-4);
        }

        @media (max-width: 1024px) {
          .stats-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .tabs-bar {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }

          .review-table {
            overflow-x: auto;
          }

          .table-header,
          .table-row {
            min-width: 700px;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminPage;
