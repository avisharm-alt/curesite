import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { UNIVERSITIES } from '../data/mockData.ts';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const JoinUsPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    university: '',
    program: '',
    year: '',
    why_join: '',
  });

  const wordCount = form.why_join.trim().split(/\s+/).filter(Boolean).length;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === 'why_join') {
      const words = value.trim().split(/\s+/).filter(Boolean);
      if (words.length > 200) return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.university || !form.program || !form.year || !form.why_join) {
      toast.error('Please fill in all fields.');
      return;
    }
    setSubmitting(true);
    try {
      const resp = await fetch(`${API_URL}/api/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, year: parseInt(form.year, 10) }),
      });
      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.detail || 'Submission failed');
      }
      setSubmitted(true);
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="join-success-page">
        <div className="container container-sm">
          <motion.div
            className="js-content"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            data-testid="application-success"
          >
            <div className="vs-eyebrow">— APPLICATION RECEIVED</div>
            <h1>Thank you<span className="vs-period">.</span></h1>
            <p>
              We’ve received your application to join the Vital Signs review board.
              We read every one carefully and will be in touch soon.
            </p>
            <div className="js-actions">
              <Link to="/stories" className="btn btn-primary">Read the archive</Link>
              <Link to="/" className="btn btn-secondary">Back to home</Link>
            </div>
          </motion.div>
        </div>
        <style>{joinStyles}</style>
      </div>
    );
  }

  return (
    <div className="join-page">
      <section className="jn-hero">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            <div className="vs-eyebrow">— WE’RE HIRING / VOLUNTEERS</div>
            <h1 className="jn-title">
              Join the <em className="vs-italic vs-coral">review</em> board<span className="vs-period">.</span>
            </h1>
            <p className="vs-lead">
              Help shape the stories that get published on Vital Signs. We’re building
              a small editorial board of students across Canadian universities who care
              about authentic health storytelling.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="jn-section">
        <div className="container">
          <div className="jn-what">
            <div className="vs-section-number"><span className="num">01</span>— WHAT REVIEWERS DO</div>
            <ul className="jn-list">
              <li><span className="jn-dot" />Read submitted stories and flag content concerns</li>
              <li><span className="jn-dot" />Recommend approve, reject, or request edits</li>
              <li><span className="jn-dot" />Help maintain the quality and sensitivity of published stories</li>
            </ul>
          </div>

          <form className="jn-form" onSubmit={handleSubmit} data-testid="join-form">
            <div className="vs-section-number" style={{ marginBottom: 24 }}>
              <span className="num">02</span>— APPLY
            </div>

            <div className="jn-row">
              <div className="sub-field">
                <label className="sub-label" htmlFor="name">Full name <span className="req">*</span></label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  required
                  data-testid="join-name"
                />
              </div>
              <div className="sub-field">
                <label className="sub-label" htmlFor="email">Email <span className="req">*</span></label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@university.ca"
                  required
                  data-testid="join-email"
                />
              </div>
            </div>

            <div className="jn-row">
              <div className="sub-field">
                <label className="sub-label" htmlFor="university">University <span className="req">*</span></label>
                <select
                  id="university"
                  name="university"
                  value={form.university}
                  onChange={handleChange}
                  required
                  data-testid="join-university"
                >
                  <option value="">Select university</option>
                  {UNIVERSITIES.map((u: string) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
              <div className="sub-field">
                <label className="sub-label" htmlFor="program">Program <span className="req">*</span></label>
                <input
                  id="program"
                  name="program"
                  type="text"
                  value={form.program}
                  onChange={handleChange}
                  placeholder="e.g. Health Sciences"
                  required
                  data-testid="join-program"
                />
              </div>
            </div>

            <div className="sub-field">
              <label className="sub-label" htmlFor="year">Year of study <span className="req">*</span></label>
              <select
                id="year"
                name="year"
                value={form.year}
                onChange={handleChange}
                required
                data-testid="join-year"
              >
                <option value="">Select year</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
                <option value="5">5th Year+</option>
                <option value="6">Graduate Student</option>
              </select>
            </div>

            <div className="sub-field">
              <label className="sub-label" htmlFor="why_join">
                Why join the board? <span className="req">*</span>
                <span className="jn-words">{wordCount}/200 words</span>
              </label>
              <textarea
                id="why_join"
                name="why_join"
                value={form.why_join}
                onChange={handleChange}
                placeholder="Tell us why you’re drawn to reviewing health stories and what perspective you’d bring to the board…"
                rows={6}
                required
                data-testid="join-why"
              />
            </div>

            <div className="jn-cta">
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={submitting || wordCount === 0}
                data-testid="join-submit-btn"
              >
                {submitting ? 'Submitting…' : 'Submit application'}
              </button>
              <Link to="/" className="btn btn-secondary">Cancel</Link>
            </div>
          </form>
        </div>
      </section>

      <style>{joinStyles}</style>
    </div>
  );
};

const joinStyles = `
  .join-page { min-height: 100vh; background: var(--vs-ivory); }

  .jn-hero { padding: 96px 0 56px; }
  .jn-title {
    font-family: var(--vs-font-serif);
    font-feature-settings: "liga", "dlig", "kern";
    font-weight: 600;
    font-size: clamp(44px, 5.5vw, 80px);
    line-height: 1.02;
    letter-spacing: -0.03em;
    color: var(--vs-ink);
    margin: 24px 0 32px;
  }
  .jn-title em { font-style: italic; font-weight: 500; }

  .jn-section { padding: 32px 0 128px; }

  .jn-what {
    max-width: 100%;
    padding: 48px 0;
    border-top: 1px solid var(--vs-rule);
    border-bottom: 1px solid var(--vs-rule);
    margin-bottom: 80px;
  }
  .jn-list {
    list-style: none;
    margin: 24px 0 0;
    padding: 0;
  }
  .jn-list li {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    font-family: var(--vs-font-sans);
    font-size: 17px;
    line-height: 1.6;
    color: var(--vs-ink);
    padding: 10px 0;
  }
  .jn-dot {
    display: inline-block;
    width: 8px; height: 8px;
    border-radius: 999px;
    background: var(--vs-coral);
    margin-top: 10px;
    flex-shrink: 0;
  }

  .jn-form { max-width: 100%; }

  .jn-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }
  .jn-row > .sub-field { margin-bottom: 0; }

  .jn-words {
    margin-left: auto;
    font-family: var(--vs-font-mono);
    font-size: 10px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--vs-ink-faint);
  }
  .sub-label { display: flex; align-items: center; }

  .jn-cta {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    margin-top: 32px;
    padding-top: 32px;
    border-top: 1px solid var(--vs-rule);
  }

  .join-success-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    background: var(--vs-ivory);
    padding: 96px 0;
  }
  .js-content { max-width: 560px; }
  .js-content h1 {
    font-family: var(--vs-font-serif);
    font-weight: 600;
    font-size: clamp(56px, 7vw, 96px);
    letter-spacing: -0.03em;
    line-height: 1;
    margin: 24px 0 32px;
  }
  .js-content p {
    font-size: 18px;
    color: var(--vs-ink-muted);
    line-height: 1.6;
    margin-bottom: 40px;
    max-width: 54ch;
  }
  .js-actions { display: flex; gap: 16px; flex-wrap: wrap; }

  @media (max-width: 700px) {
    .jn-hero { padding: 56px 0 32px; }
    .jn-row { grid-template-columns: 1fr; }
  }
`;

export default JoinUsPage;
