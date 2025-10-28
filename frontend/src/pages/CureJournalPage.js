import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { BookOpen, Plus, Calendar, User, Tag, FileText, Download, X } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CureJournalPage = () => {
  const { user } = useAuth();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    authors: '',
    abstract: '',
    keywords: '',
    university: user?.university || '',
    program: user?.program || '',
    article_type: 'research'
  });

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      setLoading(true);
      // Only fetch published articles (articles under review won't be visible)
      const response = await axios.get(`${API}/journal/articles`);
      setArticles(response.data);
    } catch (error) {
      console.error('Error loading articles:', error);
      toast.error('Failed to load journal articles');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!user) {
      toast.error('Please log in to submit to CURE Journal');
      return;
    }
    setShowSubmitModal(true);
  };

  const handleSubmitArticle = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.authors || !formData.abstract || !formData.university || !formData.program) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/journal/articles`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Article submitted successfully! It will be reviewed by our team.');
      setShowSubmitModal(false);
      setFormData({
        title: '',
        authors: '',
        abstract: '',
        keywords: '',
        university: user?.university || '',
        program: user?.program || '',
        article_type: 'research'
      });
      loadArticles();
    } catch (error) {
      console.error('Error submitting article:', error);
      toast.error(error.response?.data?.detail || 'Failed to submit article');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="journal-page">
      <div className="journal-container">
        {/* Header */}
        <div className="journal-header">
          <div className="journal-header-content">
            <div className="journal-title-section">
              <BookOpen size={32} className="journal-icon" />
              <div>
                <h1 className="journal-title">CURE Journal</h1>
                <p className="journal-subtitle">Academic Research & Project Abstracts</p>
              </div>
            </div>
            <button onClick={handleSubmit} className="submit-article-btn">
              <Plus size={20} />
              Submit Article
            </button>
          </div>
        </div>

        {/* Articles Grid */}
        {loading ? (
          <div className="loading-state">Loading articles...</div>
        ) : articles.length === 0 ? (
          <div className="empty-state">
            <BookOpen size={64} />
            <h3>No Articles Yet</h3>
            <p>Be the first to submit to CURE Journal</p>
            <button onClick={handleSubmit} className="submit-article-btn">
              Submit Article
            </button>
          </div>
        ) : (
          <div className="articles-grid">
            {articles.map((article) => (
              <div key={article.id} className="article-card">
                <div className="article-header">
                  <span className={`article-status status-${article.status}`}>
                    {article.status}
                  </span>
                  <span className="article-date">
                    <Calendar size={14} />
                    {new Date(article.submitted_at).toLocaleDateString()}
                  </span>
                </div>
                
                <h3 className="article-title">{article.title}</h3>
                
                <div className="article-authors">
                  <User size={16} />
                  <span>{article.authors}</span>
                </div>
                
                <p className="article-abstract">{article.abstract}</p>
                
                {article.keywords && (
                  <div className="article-keywords">
                    {article.keywords.split(',').map((keyword, idx) => (
                      <span key={idx} className="keyword-tag">
                        <Tag size={12} />
                        {keyword.trim()}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="article-actions">
                  <button className="view-article-btn">
                    <FileText size={16} />
                    Read Abstract
                  </button>
                  {article.pdf_url && (
                    <button className="download-btn">
                      <Download size={16} />
                      Download PDF
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit Article Modal */}
      {showSubmitModal && (
        <div className="modal-overlay" onClick={() => setShowSubmitModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Submit Article to CURE Journal</h2>
              <button onClick={() => setShowSubmitModal(false)} className="modal-close">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmitArticle} className="article-form">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Enter article title"
                  required
                />
              </div>

              <div className="form-group">
                <label>Authors *</label>
                <input
                  type="text"
                  value={formData.authors}
                  onChange={(e) => setFormData({...formData, authors: e.target.value})}
                  placeholder="John Doe, Jane Smith"
                  required
                />
                <small>Separate multiple authors with commas</small>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>University *</label>
                  <input
                    type="text"
                    value={formData.university}
                    onChange={(e) => setFormData({...formData, university: e.target.value})}
                    placeholder="University name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Program *</label>
                  <input
                    type="text"
                    value={formData.program}
                    onChange={(e) => setFormData({...formData, program: e.target.value})}
                    placeholder="e.g., Biology, Neuroscience"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Article Type</label>
                <select
                  value={formData.article_type}
                  onChange={(e) => setFormData({...formData, article_type: e.target.value})}
                >
                  <option value="research">Research</option>
                  <option value="review">Review</option>
                  <option value="case_study">Case Study</option>
                </select>
              </div>

              <div className="form-group">
                <label>Abstract *</label>
                <textarea
                  value={formData.abstract}
                  onChange={(e) => setFormData({...formData, abstract: e.target.value})}
                  placeholder="Enter your article abstract..."
                  rows={6}
                  required
                />
              </div>

              <div className="form-group">
                <label>Keywords</label>
                <input
                  type="text"
                  value={formData.keywords}
                  onChange={(e) => setFormData({...formData, keywords: e.target.value})}
                  placeholder="neuroscience, machine learning, cancer research"
                />
                <small>Separate keywords with commas</small>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  onClick={() => setShowSubmitModal(false)} 
                  className="btn-secondary"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CureJournalPage;
