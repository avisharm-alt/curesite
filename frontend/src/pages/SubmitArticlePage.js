import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Plus, BookOpen } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SubmitArticlePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    authors: '',
    abstract: '',
    keywords: '',
    university: user?.university || '',
    program: user?.program || '',
    article_type: 'research'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to submit an article');
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      await axios.post(`${API}/journal/articles`, formData, { headers });
      toast.success('Article submitted successfully! It will be reviewed by our team.');
      navigate('/journal');
    } catch (error) {
      toast.error('Error submitting article: ' + (error.response?.data?.detail || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="page">
        <div className="page-content">
          <div className="empty-state">
            <BookOpen size={48} />
            <h3>Please sign in to submit an article</h3>
            <p>Sign in with Google to submit your article to CURE Journal.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-icon">
          <Plus size={32} />
        </div>
        <div>
          <h1 className="page-title">Submit Article</h1>
          <p className="page-description">
            Submit your research article or abstract for review and publication in CURE Journal.
          </p>
        </div>
      </div>

      <div className="page-content">
        <form onSubmit={handleSubmit} className="poster-form">
          <div className="form-section">
            <h3>Article Information</h3>
            
            <div className="form-field">
              <label htmlFor="title">Article Title *</label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="form-input"
                required
                placeholder="Enter your article title"
              />
            </div>

            <div className="form-field">
              <label htmlFor="authors">Authors *</label>
              <input
                type="text"
                id="authors"
                value={formData.authors}
                onChange={(e) => setFormData({...formData, authors: e.target.value})}
                className="form-input"
                required
                placeholder="Enter authors separated by commas (e.g., John Doe, Jane Smith)"
              />
              <small>Separate multiple authors with commas</small>
            </div>

            <div className="form-field">
              <label htmlFor="article_type">Article Type *</label>
              <select
                id="article_type"
                value={formData.article_type}
                onChange={(e) => setFormData({...formData, article_type: e.target.value})}
                className="form-input"
                required
              >
                <option value="research">Research Article</option>
                <option value="review">Review Article</option>
                <option value="case_study">Case Study</option>
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="abstract">Abstract *</label>
              <textarea
                id="abstract"
                value={formData.abstract}
                onChange={(e) => setFormData({...formData, abstract: e.target.value})}
                className="form-textarea"
                required
                rows={8}
                placeholder="Enter your article abstract"
              />
            </div>

            <div className="form-field">
              <label htmlFor="keywords">Keywords</label>
              <input
                type="text"
                id="keywords"
                value={formData.keywords}
                onChange={(e) => setFormData({...formData, keywords: e.target.value})}
                className="form-input"
                placeholder="Enter keywords separated by commas (e.g., neuroscience, machine learning)"
              />
              <small>Separate keywords with commas</small>
            </div>
          </div>

          <div className="form-section">
            <h3>Institution Information</h3>
            
            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="university">University *</label>
                <select
                  id="university"
                  value={formData.university}
                  onChange={(e) => setFormData({...formData, university: e.target.value})}
                  className="form-input"
                  required
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
                <label htmlFor="program">Program *</label>
                <input
                  type="text"
                  id="program"
                  value={formData.program}
                  onChange={(e) => setFormData({...formData, program: e.target.value})}
                  className="form-input"
                  required
                  placeholder="e.g., Life Sciences, Biology, Neuroscience"
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/journal')}
              className="cancel-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="submit-btn"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Article'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitArticlePage;
