import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PenLine, ArrowLeft, AlertTriangle, Eye, EyeOff, Check, Info } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SubmitStoryPage = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    tags: [],
    is_anonymous: true,
    university: '',
    has_content_warning: false,
    consent_given: false
  });
  
  const [tags, setTags] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!user) {
      toast.error('Please sign in to submit a story');
      window.location.href = `${API}/auth/google`;
      return;
    }
    fetchFormData();
  }, [user]);

  const fetchFormData = async () => {
    try {
      const [tagsRes, uniRes] = await Promise.all([
        fetch(`${API}/tags`),
        fetch(`${API}/universities`)
      ]);
      
      if (tagsRes.ok) {
        const tagsData = await tagsRes.json();
        setTags(tagsData);
      }
      if (uniRes.ok) {
        const uniData = await uniRes.json();
        setUniversities(uniData);
      }
    } catch (error) {
      console.error('Error fetching form data:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (name === 'title') {
      setCharCount(value.length);
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleTagToggle = (tagName) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tagName)
        ? prev.tags.filter(t => t !== tagName)
        : [...prev.tags, tagName]
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 120) {
      newErrors.title = 'Title must be 120 characters or less';
    }
    
    if (!formData.body.trim()) {
      newErrors.body = 'Your story is required';
    } else if (formData.body.trim().length < 100) {
      newErrors.body = 'Please share a bit more (at least 100 characters)';
    }
    
    if (formData.tags.length === 0) {
      newErrors.tags = 'Please select at least one topic';
    }
    
    if (!formData.consent_given) {
      newErrors.consent = 'You must consent to the terms to submit';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors below');
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch(`${API}/stories`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        const data = await res.json();
        toast.success('Story submitted! It will be reviewed before publication.');
        navigate('/profile');
      } else {
        const error = await res.json();
        toast.error(error.detail || 'Failed to submit story');
      }
    } catch (error) {
      console.error('Error submitting story:', error);
      toast.error('Failed to submit story');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="vs-page vs-submit-page">
        <div className="vs-container">
          <div className="vs-auth-required">
            <PenLine size={48} />
            <h2>Sign In Required</h2>
            <p>Please sign in with Google to share your story.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="vs-page vs-submit-page">
      {/* Header */}
      <div className="vs-submit-header">
        <div className="vs-container">
          <button className="vs-back-btn" onClick={() => navigate('/')}>
            <ArrowLeft size={20} />
            Back
          </button>
          <div className="vs-submit-header-content">
            <PenLine size={32} />
            <div>
              <h1>Share Your Story</h1>
              <p>Your experience matters. Share it with our community.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="vs-container">
        <div className="vs-submit-layout">
          <form className="vs-submit-form" onSubmit={handleSubmit}>
            {/* Title */}
            <div className="vs-form-group">
              <label htmlFor="title" className="vs-form-label">
                Story Title <span className="vs-required">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Give your story a meaningful title"
                maxLength={120}
                className={`vs-input ${errors.title ? 'vs-input-error' : ''}`}
              />
              <div className="vs-input-footer">
                <span className={`vs-char-count ${charCount > 100 ? 'warning' : ''}`}>
                  {charCount}/120
                </span>
                {errors.title && <span className="vs-error">{errors.title}</span>}
              </div>
            </div>

            {/* Story Body */}
            <div className="vs-form-group">
              <label htmlFor="body" className="vs-form-label">
                Your Story <span className="vs-required">*</span>
              </label>
              <textarea
                id="body"
                name="body"
                value={formData.body}
                onChange={handleChange}
                placeholder="Share your health experience... What happened? How did it affect you? What did you learn?"
                rows={12}
                className={`vs-textarea ${errors.body ? 'vs-input-error' : ''}`}
              />
              <div className="vs-input-footer">
                <span className="vs-helper-text">
                  Tip: Be as open as you're comfortable with. Your story can help others feel less alone.
                </span>
                {errors.body && <span className="vs-error">{errors.body}</span>}
              </div>
            </div>

            {/* Topic Tags */}
            <div className="vs-form-group">
              <label className="vs-form-label">
                Health Topics <span className="vs-required">*</span>
              </label>
              <p className="vs-form-description">Select all that apply to your story</p>
              <div className="vs-tags-grid">
                {tags.map(tag => (
                  <button
                    key={tag.id}
                    type="button"
                    className={`vs-tag-select ${formData.tags.includes(tag.name) ? 'selected' : ''}`}
                    onClick={() => handleTagToggle(tag.name)}
                  >
                    {formData.tags.includes(tag.name) && <Check size={16} />}
                    {tag.name}
                  </button>
                ))}
              </div>
              {errors.tags && <span className="vs-error">{errors.tags}</span>}
            </div>

            {/* Author Display */}
            <div className="vs-form-group">
              <label className="vs-form-label">Author Display</label>
              <div className="vs-toggle-group">
                <button
                  type="button"
                  className={`vs-toggle-btn ${formData.is_anonymous ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, is_anonymous: true }))}
                >
                  <EyeOff size={18} />
                  Post Anonymously
                </button>
                <button
                  type="button"
                  className={`vs-toggle-btn ${!formData.is_anonymous ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, is_anonymous: false }))}
                >
                  <Eye size={18} />
                  Use My Name ({user.name})
                </button>
              </div>
              <p className="vs-form-description">
                <Info size={14} /> Your identity will only be visible to moderators for review purposes.
              </p>
            </div>

            {/* University (Optional) */}
            <div className="vs-form-group">
              <label htmlFor="university" className="vs-form-label">
                University Affiliation <span className="vs-optional">(Optional)</span>
              </label>
              <select
                id="university"
                name="university"
                value={formData.university}
                onChange={handleChange}
                className="vs-select"
              >
                <option value="">Select your university (optional)</option>
                {universities.map(uni => (
                  <option key={uni} value={uni}>{uni}</option>
                ))}
              </select>
            </div>

            {/* Content Warning */}
            <div className="vs-form-group">
              <label className="vs-checkbox-label">
                <input
                  type="checkbox"
                  name="has_content_warning"
                  checked={formData.has_content_warning}
                  onChange={handleChange}
                />
                <AlertTriangle size={18} />
                <span>This story contains potentially distressing content</span>
              </label>
              <p className="vs-form-description">
                Check this if your story includes topics like trauma, loss, or graphic medical details.
              </p>
            </div>

            {/* Consent */}
            <div className="vs-form-group vs-consent-group">
              <label className={`vs-checkbox-label ${errors.consent ? 'vs-checkbox-error' : ''}`}>
                <input
                  type="checkbox"
                  name="consent_given"
                  checked={formData.consent_given}
                  onChange={handleChange}
                />
                <span>
                  I consent to this story being published on Vital Signs and understand it will be 
                  reviewed before publication. <span className="vs-required">*</span>
                </span>
              </label>
              {errors.consent && <span className="vs-error">{errors.consent}</span>}
            </div>

            {/* Submit Button */}
            <div className="vs-form-actions">
              <button
                type="button"
                className="vs-btn-outline"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? 'Hide Preview' : 'Preview Story'}
              </button>
              <button
                type="submit"
                className="vs-btn-primary vs-btn-large"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Story'}
              </button>
            </div>
          </form>

          {/* Preview Panel */}
          {showPreview && (
            <div className="vs-preview-panel">
              <h3>Preview</h3>
              <div className="vs-preview-content">
                <div className="vs-preview-tags">
                  {formData.tags.map((tag, idx) => (
                    <span key={idx} className="vs-tag-pill">{tag}</span>
                  ))}
                </div>
                <h4>{formData.title || 'Your Title Here'}</h4>
                <p className="vs-preview-author">
                  By {formData.is_anonymous ? 'Anonymous' : user.name}
                  {formData.university && ` • ${formData.university}`}
                </p>
                {formData.has_content_warning && (
                  <div className="vs-preview-warning">
                    <AlertTriangle size={16} /> Content Warning
                  </div>
                )}
                <div className="vs-preview-body">
                  {formData.body || 'Your story will appear here...'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubmitStoryPage;
