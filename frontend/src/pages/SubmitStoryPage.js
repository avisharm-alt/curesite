import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SubmitStoryPage = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [form, setForm] = useState({
    title: '', body: '', tags: [], is_anonymous: true,
    university: '', has_content_warning: false, consent_given: false,
  });
  const [tags, setTags] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      toast.error('Sign in to share your story');
      window.location.href = `${API}/auth/google`;
      return;
    }
    fetch(`${API}/tags`).then(r => r.ok ? r.json() : []).then(setTags).catch(() => {});
    fetch(`${API}/universities`).then(r => r.ok ? r.json() : []).then(setUniversities).catch(() => {});
  }, [user]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(e => ({ ...e, [name]: null }));
  };

  const toggleTag = (name) => {
    setForm(f => ({
      ...f,
      tags: f.tags.includes(name) ? f.tags.filter(t => t !== name) : [...f.tags, name],
    }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Required.';
    else if (form.title.length > 120) e.title = 'Max 120 characters.';
    if (!form.body.trim()) e.body = 'Required.';
    else if (form.body.trim().length < 100) e.body = 'At least 100 characters.';
    if (form.tags.length === 0) e.tags = 'Pick at least one topic.';
    if (!form.consent_given) e.consent = 'You must consent.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) { toast.error('Please fix the issues above'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API}/stories`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success('Submitted. We’ll review it before publishing.');
        navigate('/profile');
      } else {
        const err = await res.json();
        toast.error(err.detail || 'Submission failed');
      }
    } catch { toast.error('Network error'); }
    finally { setLoading(false); }
  };

  if (!user) return null;

  return (
    <div className="vs-page">
      {/* Hero */}
      <section className="vs-page-hero">
        <div className="vs-container">
          <div className="vs-eyebrow">— SHARE YOUR STORY</div>
          <div className="vs-spacer-sm" />
          <h1 className="vs-page-title">
            Tell us what <em className="vs-italic vs-coral">mattered</em><span className="vs-period">.</span>
          </h1>
          <p className="vs-lead">
            Write at your own pace. Anonymously or with your name. We review every story
            for safety and respect before it's published — usually within a few days.
          </p>
        </div>
      </section>

      <section>
        <div className="vs-container">
          <form className="vs-form-shell" onSubmit={onSubmit}>
            {/* Title */}
            <div className="vs-field">
              <label className="vs-field-label" htmlFor="title">
                01 — Title <span className="req">*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                className={`vs-input ${errors.title ? 'vs-input--error' : ''}`}
                placeholder="A line that catches what this is about"
                value={form.title}
                onChange={onChange}
                maxLength={120}
              />
              <div className="vs-field-foot">
                <span>{form.title.length}/120</span>
                {errors.title && <span className="err">— {errors.title}</span>}
              </div>
            </div>

            {/* Body */}
            <div className="vs-field">
              <label className="vs-field-label" htmlFor="body">
                02 — Your story <span className="req">*</span>
              </label>
              <textarea
                id="body"
                name="body"
                className={`vs-textarea ${errors.body ? 'vs-textarea--error' : ''}`}
                placeholder="Start anywhere. The diagnosis. The waiting room. The first morning after."
                value={form.body}
                onChange={onChange}
              />
              <div className="vs-field-foot">
                <span className="vs-field-help">Most stories run 400–1,500 words. Take your time.</span>
                {errors.body && <span className="err">— {errors.body}</span>}
              </div>
            </div>

            {/* Tags */}
            <div className="vs-field">
              <label className="vs-field-label">03 — Topics <span className="req">*</span></label>
              <p className="vs-field-help" style={{ margin: 0 }}>Select all that apply.</p>
              <div className="vs-tag-selector" style={{ marginTop: 8 }}>
                {tags.map(t => (
                  <button
                    type="button"
                    key={t.id}
                    className={`vs-chip ${form.tags.includes(t.name) ? 'vs-chip--active' : ''}`}
                    onClick={() => toggleTag(t.name)}
                  >
                    {form.tags.includes(t.name) ? '✓ ' : ''}{t.name}
                  </button>
                ))}
              </div>
              {errors.tags && <div className="vs-field-foot"><span className="err">— {errors.tags}</span></div>}
            </div>

            {/* Author display */}
            <div className="vs-field">
              <label className="vs-field-label">04 — How should we credit you?</label>
              <div className="vs-toggle-row">
                <button
                  type="button"
                  className={`vs-toggle-btn ${form.is_anonymous ? 'is-active' : ''}`}
                  onClick={() => setForm(f => ({ ...f, is_anonymous: true }))}
                >
                  Anonymous
                </button>
                <button
                  type="button"
                  className={`vs-toggle-btn ${!form.is_anonymous ? 'is-active' : ''}`}
                  onClick={() => setForm(f => ({ ...f, is_anonymous: false }))}
                >
                  My name ({user.name?.split(' ')[0]})
                </button>
              </div>
              <p className="vs-field-help" style={{ marginTop: 12 }}>
                Editors will always know who wrote each story — readers only see what you choose.
              </p>
            </div>

            {/* University */}
            <div className="vs-field">
              <label className="vs-field-label" htmlFor="university">
                05 — Affiliation <span className="opt">(optional)</span>
              </label>
              <select
                id="university"
                name="university"
                className="vs-select"
                value={form.university}
                onChange={onChange}
              >
                <option value="">None / Prefer not to say</option>
                {universities.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>

            {/* Content warning */}
            <div className="vs-field">
              <label className="vs-field-label">06 — Sensitive content</label>
              <label className="vs-check">
                <input
                  type="checkbox"
                  name="has_content_warning"
                  checked={form.has_content_warning}
                  onChange={onChange}
                />
                <span>
                  This story includes trauma, loss, or graphic detail. Add a content warning.
                </span>
              </label>
            </div>

            {/* Consent */}
            <div className="vs-field">
              <label className="vs-field-label">07 — Consent <span className="req">*</span></label>
              <label className="vs-check">
                <input
                  type="checkbox"
                  name="consent_given"
                  checked={form.consent_given}
                  onChange={onChange}
                />
                <span>
                  I consent to this story being reviewed and published on Vital Signs.
                </span>
              </label>
              {errors.consent && <div className="vs-field-foot"><span className="err">— {errors.consent}</span></div>}
            </div>

            <div className="vs-btn-row" style={{ marginTop: 32 }}>
              <button type="submit" className="vs-btn vs-btn--primary vs-btn--large" disabled={loading}>
                <span className="vs-btn-dot" />
                {loading ? 'Submitting…' : 'Submit for review'}
              </button>
              <button type="button" className="vs-btn vs-btn--secondary" onClick={() => navigate('/')}>
                Save & exit
              </button>
            </div>

            <p className="vs-field-help" style={{ marginTop: 24, maxWidth: '60ch' }}>
              By submitting, you understand your story will be read by our editorial team
              before appearing on the site. We may suggest small edits for clarity — never tone.
            </p>
          </form>
        </div>
      </section>
    </div>
  );
};

export default SubmitStoryPage;
