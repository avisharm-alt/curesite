import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
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
    setSubmitted(true);
  };

  const isValid = formData.title && formData.body.trim().length >= 100 && formData.tags.length > 0 && formData.consentGiven;

  if (submitted) {
    return (
      <div className="submit-success">
        <div className="container container-sm">
          <motion.div
            className="ss-content"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="vs-eyebrow">— RECEIVED</div>
            <h1>Thank you<span className="vs-period">.</span></h1>
            <p>
              Your story is with our editors now. We read every submission carefully
              and respond within a few days. If we suggest small edits for clarity,
              we’ll explain why — and your voice always wins.
            </p>
            <div className="ss-actions">
              <Link to="/stories" className="btn btn-primary">Read the archive</Link>
              <Link to="/" className="btn btn-secondary">Back to home</Link>
            </div>
          </motion.div>
        </div>
        <style>{submitStyles}</style>
      </div>
    );
  }

  return (
    <div className="submit-page">
      <section className="sub-hero">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            <div className="vs-eyebrow">— SHARE YOUR STORY</div>
            <h1 className="sub-title">
              Tell us what <em className="vs-italic vs-coral">mattered</em><span className="vs-period">.</span>
            </h1>
            <p className="vs-lead">
              Write at your own pace. Anonymously or with your name. We review every
              story for safety and respect before it’s published — usually within a few days.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="sub-form-section">
        <div className="container">
          <form className="sub-form" onSubmit={handleSubmit}>
            {/* 01 Title */}
            <div className="sub-field">
              <label className="sub-label" htmlFor="title">
                01 — Title <span className="req">*</span>
              </label>
              <input
                id="title"
                type="text"
                placeholder="A line that catches what this is about"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                maxLength={120}
              />
              <div className="sub-foot">
                <span>{formData.title.length}/120</span>
              </div>
            </div>

            {/* 02 Body */}
            <div className="sub-field">
              <label className="sub-label" htmlFor="body">
                02 — Your story <span className="req">*</span>
              </label>
              <textarea
                id="body"
                placeholder="Start anywhere. The diagnosis. The waiting room. The first morning after."
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              />
              <div className="sub-foot">
                <span className="sub-help">Most stories run 400–1,500 words. Take your time.</span>
                <span>{formData.body.trim().split(/\s+/).filter(Boolean).length} words</span>
              </div>
            </div>

            {/* 03 Tags */}
            <div className="sub-field">
              <label className="sub-label">03 — Topics <span className="req">*</span></label>
              <p className="sub-help" style={{ marginBottom: 12 }}>Select all that apply.</p>
              <div className="sub-tags">
                {HEALTH_TAGS.map((t: any) => (
                  <button
                    type="button"
                    key={t.id}
                    className={`vs-chip ${formData.tags.includes(t.name) ? 'vs-chip--active' : ''}`}
                    onClick={() => handleTagToggle(t.name)}
                  >
                    {formData.tags.includes(t.name) && <Check size={11} strokeWidth={2.5} />}
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 04 + 05 in a 2-column row */}
            <div className="sub-form-row">
              {/* 04 Author */}
              <div className="sub-field">
                <label className="sub-label">04 — How should we credit you?</label>
                <div className="sub-toggle">
                  <button
                    type="button"
                    className={`sub-toggle-btn ${formData.isAnonymous ? 'is-active' : ''}`}
                    onClick={() => setFormData({ ...formData, isAnonymous: true })}
                  >
                    Anonymous
                  </button>
                  <button
                    type="button"
                    className={`sub-toggle-btn ${!formData.isAnonymous ? 'is-active' : ''}`}
                    onClick={() => setFormData({ ...formData, isAnonymous: false })}
                  >
                    My name
                  </button>
                </div>
                <p className="sub-help" style={{ marginTop: 12 }}>
                  Editors always know who wrote each story — readers only see what you choose.
                </p>
              </div>

              {/* 05 University */}
              <div className="sub-field">
                <label className="sub-label" htmlFor="university">
                  05 — Affiliation <span className="opt">(optional)</span>
                </label>
                <select
                  id="university"
                  value={formData.university}
                  onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                >
                  <option value="">None / Prefer not to say</option>
                  {UNIVERSITIES.map((uni: string) => (
                    <option key={uni} value={uni}>{uni}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 06 + 07 in a 2-column row */}
            <div className="sub-form-row">
              {/* 06 Content warning */}
              <div className="sub-field">
                <label className="sub-label">06 — Sensitive content</label>
                <label className="sub-check">
                  <input
                    type="checkbox"
                    checked={formData.hasContentWarning}
                    onChange={(e) => setFormData({ ...formData, hasContentWarning: e.target.checked })}
                  />
                  <span>
                    This story includes trauma, loss, or graphic detail. Add a content warning.
                  </span>
                </label>
              </div>

              {/* 07 Consent */}
              <div className="sub-field">
                <label className="sub-label">07 — Consent <span className="req">*</span></label>
                <label className="sub-check">
                  <input
                    type="checkbox"
                    checked={formData.consentGiven}
                    onChange={(e) => setFormData({ ...formData, consentGiven: e.target.checked })}
                  />
                  <span>
                    I consent to this story being reviewed and published on Vital Signs.
                  </span>
                </label>
              </div>
            </div>

            <div className="sub-cta">
              <button type="submit" className="btn btn-primary btn-lg" disabled={!isValid}>
                Submit for review
              </button>
              <Link to="/" className="btn btn-secondary">Save & exit</Link>
            </div>

            <p className="sub-help" style={{ marginTop: 24, maxWidth: '60ch' }}>
              By submitting, you understand your story will be read by our editorial team
              before appearing on the site. We may suggest small edits for clarity — never tone.
            </p>
          </form>
        </div>
      </section>

      <style>{submitStyles}</style>
    </div>
  );
};

const submitStyles = `
  .submit-page { min-height: 100vh; background: var(--vs-ivory); }

  .sub-hero { padding: 96px 0 56px; }
  .sub-title {
    font-family: var(--vs-font-serif);
    font-feature-settings: "liga", "dlig", "kern";
    font-weight: 600;
    font-size: clamp(44px, 5.5vw, 80px);
    line-height: 1;
    letter-spacing: -0.03em;
    color: var(--vs-ink);
    margin: 24px 0 32px;
  }
  .sub-title em { font-style: italic; font-weight: 500; }

  .sub-form-section { padding: 0 0 128px; }
  .sub-form { max-width: 100%; }
  .sub-form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 32px;
  }
  .sub-form-row > .sub-field { margin-bottom: 0; }
  @media (max-width: 700px) {
    .sub-form-row { grid-template-columns: 1fr; gap: 0; }
  }

  .sub-field {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 40px;
  }
  .sub-label {
    font-family: var(--vs-font-mono);
    font-size: 11px;
    font-weight: 400;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--vs-ink-muted);
  }
  .sub-label .req { color: var(--vs-coral); margin-left: 4px; }
  .sub-label .opt {
    color: var(--vs-ink-faint);
    text-transform: none;
    letter-spacing: 0.04em;
    margin-left: 4px;
  }

  .sub-foot {
    display: flex;
    justify-content: space-between;
    font-family: var(--vs-font-mono);
    font-size: 10px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--vs-ink-faint);
  }
  .sub-help {
    font-family: var(--vs-font-sans);
    font-size: 13px;
    color: var(--vs-ink-muted);
    text-transform: none;
    letter-spacing: 0;
    margin: 0;
  }

  .sub-tags { display: flex; flex-wrap: wrap; gap: 8px; }

  .sub-toggle {
    display: inline-flex;
    gap: 0;
    border: 1px solid var(--vs-rule-strong);
    border-radius: 999px;
    padding: 4px;
    width: fit-content;
  }
  .sub-toggle-btn {
    padding: 10px 18px;
    border-radius: 999px;
    font-family: var(--vs-font-mono);
    font-size: 10px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--vs-ink-muted);
    background: transparent;
    border: none;
    cursor: pointer;
  }
  .sub-toggle-btn.is-active {
    background: var(--vs-ink);
    color: var(--vs-paper);
  }

  .sub-check {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    cursor: pointer;
    font-family: var(--vs-font-sans);
    font-size: 14px;
    line-height: 1.5;
    color: var(--vs-ink);
  }
  .sub-check input[type="checkbox"] {
    appearance: none;
    width: 18px;
    height: 18px;
    border: 1px solid var(--vs-rule-strong);
    border-radius: 4px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-top: 1px;
    background: var(--vs-ivory);
    transition: all 180ms ease;
  }
  .sub-check input[type="checkbox"]:checked {
    background: var(--vs-ink);
    border-color: var(--vs-ink);
  }
  .sub-check input[type="checkbox"]:checked::after {
    content: "";
    width: 6px;
    height: 10px;
    border: solid var(--vs-paper);
    border-width: 0 1.5px 1.5px 0;
    transform: rotate(45deg) translate(-1px, -2px);
  }

  .sub-cta {
    display: flex;
    gap: 16px;
    margin-top: 48px;
    flex-wrap: wrap;
    padding-top: 32px;
    border-top: 1px solid var(--vs-rule);
  }

  .submit-success {
    min-height: 100vh;
    display: flex;
    align-items: center;
    background: var(--vs-ivory);
    padding: 96px 0;
  }
  .ss-content { max-width: 560px; }
  .ss-content h1 {
    font-family: var(--vs-font-serif);
    font-weight: 600;
    font-size: clamp(56px, 7vw, 96px);
    letter-spacing: -0.03em;
    line-height: 1;
    margin: 24px 0 32px;
  }
  .ss-content p {
    font-size: 18px;
    color: var(--vs-ink-muted);
    line-height: 1.6;
    margin-bottom: 40px;
    max-width: 54ch;
  }
  .ss-actions { display: flex; gap: 16px; flex-wrap: wrap; }
`;

export default SubmitStoryPage;
