import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import SectionHeader from '../components/SectionHeader.tsx';
import TagPill from '../components/TagPill.tsx';
import { HEALTH_TAGS, UNIVERSITIES } from '../data/mockData.ts';

const SubmitStoryPage: React.FC = () => {
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    tags: [] as string[],
    isAnonymous: true,
    university: '',
    hasContentWarning: false,
    consentGiven: false,
  });
  const [submitted, setSubmitted] = useState(false);

  const handleTagToggle = (tagName: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tagName)
        ? prev.tags.filter((t) => t !== tagName)
        : [...prev.tags, tagName],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock submission
    setSubmitted(true);
  };

  const isValid = formData.title && formData.body && formData.tags.length > 0 && formData.consentGiven;

  if (submitted) {
    return (
      <div className="submit-success">
        <div className="container container-sm">
          <motion.div
            className="success-content"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="success-icon">
              <Check size={32} />
            </div>
            <h1>Story Submitted</h1>
            <p>
              Thank you for sharing your story. Our team will review it and
              you'll be notified once it's published.
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="submit-page">
      <section className="submit-header">
        <div className="container container-sm">
          <SectionHeader
            title="Share Your Story"
            subtitle="Your experience matters. Share it with a community that cares."
          />
        </div>
      </section>

      <section className="submit-form-section">
        <div className="container container-sm">
          <form className="submit-form" onSubmit={handleSubmit}>
            {/* Title */}
            <div className="form-group">
              <label className="form-label">Title</label>
              <input
                type="text"
                className="input"
                placeholder="Give your story a title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                maxLength={120}
              />
              <span className="form-hint">{formData.title.length}/120</span>
            </div>

            {/* Body */}
            <div className="form-group">
              <label className="form-label">Your Story</label>
              <textarea
                className="input textarea story-textarea"
                placeholder="Share your experience. Take your time—there's no wrong way to tell your story."
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                rows={12}
              />
            </div>

            {/* Tags */}
            <div className="form-group">
              <label className="form-label">Topics</label>
              <p className="form-description">Select all that apply</p>
              <div className="tags-grid">
                {HEALTH_TAGS.map((tag) => (
                  <TagPill
                    key={tag.id}
                    tag={tag.name}
                    active={formData.tags.includes(tag.name)}
                    onClick={() => handleTagToggle(tag.name)}
                  />
                ))}
              </div>
            </div>

            {/* Author Display */}
            <div className="form-group">
              <label className="form-label">Author Display</label>
              <div className="toggle-group">
                <button
                  type="button"
                  className={`toggle-btn ${formData.isAnonymous ? 'active' : ''}`}
                  onClick={() => setFormData({ ...formData, isAnonymous: true })}
                >
                  <EyeOff size={18} />
                  <span>Post Anonymously</span>
                </button>
                <button
                  type="button"
                  className={`toggle-btn ${!formData.isAnonymous ? 'active' : ''}`}
                  onClick={() => setFormData({ ...formData, isAnonymous: false })}
                >
                  <Eye size={18} />
                  <span>Use My Name</span>
                </button>
              </div>
              <p className="form-hint">
                Your identity is always private to moderators, regardless of display choice.
              </p>
            </div>

            {/* University */}
            <div className="form-group">
              <label className="form-label">University Affiliation <span className="optional">(optional)</span></label>
              <select
                className="input"
                value={formData.university}
                onChange={(e) => setFormData({ ...formData, university: e.target.value })}
              >
                <option value="">Select university (optional)</option>
                {UNIVERSITIES.map((uni) => (
                  <option key={uni} value={uni}>{uni}</option>
                ))}
              </select>
            </div>

            {/* Content Warning */}
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.hasContentWarning}
                  onChange={(e) => setFormData({ ...formData, hasContentWarning: e.target.checked })}
                />
                <AlertTriangle size={18} />
                <span>This story contains potentially distressing content</span>
              </label>
            </div>

            {/* Consent */}
            <div className="form-group consent-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.consentGiven}
                  onChange={(e) => setFormData({ ...formData, consentGiven: e.target.checked })}
                />
                <span>
                  I consent to this story being published on Vital Signs and understand
                  it will be reviewed before publication.
                </span>
              </label>
            </div>

            {/* Submit */}
            <div className="form-actions">
              <p className="form-notice">
                Stories are reviewed by our team to ensure a safe, supportive environment.
                You'll be notified when your story is published.
              </p>
              <button type="submit" className="btn btn-primary btn-lg" disabled={!isValid}>
                Submit Story
              </button>
            </div>
          </form>
        </div>
      </section>

      <style>{`
        .submit-page {
          min-height: 100vh;
          background: var(--vs-white);
        }

        .submit-success {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .success-content {
          text-align: center;
          max-width: 400px;
        }

        .success-icon {
          width: 64px;
          height: 64px;
          background: rgba(255, 90, 95, 0.1);
          color: var(--vs-coral);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto var(--vs-space-6);
        }

        .success-content h1 {
          font-size: 2rem;
          margin-bottom: var(--vs-space-4);
        }

        .submit-header {
          padding: var(--vs-space-12) 0;
          border-bottom: 1px solid var(--vs-border);
        }

        .submit-header .section-header {
          margin-bottom: 0;
        }

        .submit-form-section {
          padding: var(--vs-space-10) 0 var(--vs-space-20);
        }

        .submit-form {
          display: flex;
          flex-direction: column;
          gap: var(--vs-space-8);
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-label {
          font-size: 0.9375rem;
          font-weight: 600;
          color: var(--vs-text-primary);
          margin-bottom: var(--vs-space-2);
        }

        .form-label .optional {
          font-weight: 400;
          color: var(--vs-text-tertiary);
        }

        .form-description {
          font-size: 0.875rem;
          color: var(--vs-text-tertiary);
          margin-bottom: var(--vs-space-3);
        }

        .form-hint {
          font-size: 0.8125rem;
          color: var(--vs-text-tertiary);
          margin-top: var(--vs-space-2);
        }

        .story-textarea {
          min-height: 320px;
          line-height: 1.8;
        }

        .tags-grid {
          display: flex;
          flex-wrap: wrap;
          gap: var(--vs-space-2);
        }

        .toggle-group {
          display: flex;
          gap: var(--vs-space-3);
        }

        .toggle-btn {
          display: flex;
          align-items: center;
          gap: var(--vs-space-2);
          padding: var(--vs-space-3) var(--vs-space-4);
          font-family: var(--vs-font);
          font-size: 0.9375rem;
          font-weight: 500;
          color: var(--vs-text-secondary);
          background: var(--vs-white);
          border: 1px solid var(--vs-border);
          border-radius: var(--vs-radius-md);
          cursor: pointer;
          transition: all var(--vs-transition-fast);
        }

        .toggle-btn:hover {
          border-color: var(--vs-border-hover);
        }

        .toggle-btn.active {
          background: var(--vs-black);
          color: var(--vs-white);
          border-color: var(--vs-black);
        }

        .checkbox-label {
          display: flex;
          align-items: flex-start;
          gap: var(--vs-space-3);
          font-size: 0.9375rem;
          color: var(--vs-text-primary);
          cursor: pointer;
        }

        .checkbox-label input[type="checkbox"] {
          width: 18px;
          height: 18px;
          margin-top: 2px;
          accent-color: var(--vs-coral);
        }

        .checkbox-label svg {
          color: var(--vs-coral);
          flex-shrink: 0;
          margin-top: 2px;
        }

        .consent-group {
          padding: var(--vs-space-5);
          background: var(--vs-bg-subtle);
          border: 1px solid var(--vs-border);
          border-radius: var(--vs-radius-lg);
        }

        .form-actions {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: var(--vs-space-4);
          padding-top: var(--vs-space-6);
          border-top: 1px solid var(--vs-border);
        }

        .form-notice {
          font-size: 0.875rem;
          color: var(--vs-text-tertiary);
          text-align: right;
          max-width: 400px;
        }

        @media (max-width: 768px) {
          .toggle-group {
            flex-direction: column;
          }

          .form-actions {
            align-items: stretch;
          }

          .form-notice {
            text-align: left;
            max-width: none;
          }
        }
      `}</style>
    </div>
  );
};

export default SubmitStoryPage;
