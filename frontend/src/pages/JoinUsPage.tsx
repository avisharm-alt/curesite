import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Send, CheckCircle } from 'lucide-react';
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'why_join') {
      const words = value.trim().split(/\s+/).filter(Boolean);
      if (words.length > 200) return; // hard cap
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
      <div className="join-page">
        <div className="container container-sm">
          <motion.div
            className="join-success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            data-testid="application-success"
          >
            <CheckCircle size={48} strokeWidth={1.5} />
            <h1>Application Received</h1>
            <p>
              Thank you for your interest in joining the Vital Signs Review Board.
              We'll review your application and get back to you soon.
            </p>
          </motion.div>
        </div>
        <style>{joinStyles}</style>
      </div>
    );
  }

  return (
    <div className="join-page">
      <section className="join-header">
        <div className="container container-sm">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="join-title">Join the Review Board</h1>
            <p className="join-subtitle">
              Help shape the stories that get published on Vital Signs. We're building
              a distributed editorial board of students across Canadian universities
              who care about authentic health storytelling.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="join-form-section">
        <div className="container container-sm">
          <motion.div
            className="join-what"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2>What reviewers do</h2>
            <ul>
              <li>Read submitted stories and flag content concerns</li>
              <li>Recommend approve, reject, or request edits</li>
              <li>Help maintain the quality and sensitivity of published stories</li>
            </ul>
          </motion.div>

          <motion.form
            className="join-form"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            data-testid="join-form"
          >
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
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
              <div className="form-group">
                <label htmlFor="email">Email</label>
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

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="university">University</label>
                <select
                  id="university"
                  name="university"
                  value={form.university}
                  onChange={handleChange}
                  required
                  data-testid="join-university"
                >
                  <option value="">Select university</option>
                  {UNIVERSITIES.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="program">Program</label>
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

            <div className="form-group">
              <label htmlFor="year">Year of Study</label>
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

            <div className="form-group">
              <label htmlFor="why_join">
                Why do you want to join the review board?
                <span className="word-count">{wordCount}/200 words</span>
              </label>
              <textarea
                id="why_join"
                name="why_join"
                value={form.why_join}
                onChange={handleChange}
                placeholder="Tell us why you're interested in reviewing health stories and what perspective you'd bring to the board..."
                rows={6}
                required
                data-testid="join-why"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg join-submit"
              disabled={submitting || wordCount === 0}
              data-testid="join-submit-btn"
            >
              {submitting ? 'Submitting...' : 'Submit Application'}
              {!submitting && <Send size={18} />}
            </button>
          </motion.form>
        </div>
      </section>
      <style>{joinStyles}</style>
    </div>
  );
};

const joinStyles = `
  .join-page {
    min-height: 100vh;
    background: var(--vs-bg-subtle);
  }

  .join-header {
    background: var(--vs-white);
    padding: var(--vs-space-16) 0 var(--vs-space-12);
    border-bottom: 1px solid var(--vs-border);
  }

  .join-title {
    font-size: 2.75rem;
    font-weight: 700;
    line-height: 1.1;
    letter-spacing: -0.02em;
    margin-bottom: var(--vs-space-4);
  }

  .join-subtitle {
    font-size: 1.125rem;
    line-height: 1.7;
    color: var(--vs-text-secondary);
    max-width: 560px;
  }

  .join-form-section {
    padding: var(--vs-space-10) 0 var(--vs-space-20);
  }

  .join-what {
    background: var(--vs-white);
    border: 1px solid var(--vs-border);
    border-radius: var(--vs-radius-lg);
    padding: var(--vs-space-6) var(--vs-space-8);
    margin-bottom: var(--vs-space-8);
  }

  .join-what h2 {
    font-size: 1.125rem;
    font-weight: 600;
    margin-bottom: var(--vs-space-3);
  }

  .join-what ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .join-what li {
    position: relative;
    padding-left: var(--vs-space-5);
    font-size: 0.9375rem;
    color: var(--vs-text-secondary);
    line-height: 1.8;
  }

  .join-what li::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0.65em;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--vs-coral);
  }

  .join-form {
    background: var(--vs-white);
    border: 1px solid var(--vs-border);
    border-radius: var(--vs-radius-lg);
    padding: var(--vs-space-8);
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--vs-space-5);
  }

  .form-group {
    margin-bottom: var(--vs-space-5);
  }

  .form-group label {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--vs-text-primary);
    margin-bottom: var(--vs-space-2);
  }

  .word-count {
    font-size: 0.75rem;
    font-weight: 400;
    color: var(--vs-text-tertiary);
  }

  .form-group input,
  .form-group select,
  .form-group textarea {
    width: 100%;
    padding: var(--vs-space-3) var(--vs-space-4);
    font-family: var(--vs-font);
    font-size: 0.9375rem;
    color: var(--vs-text-primary);
    background: var(--vs-white);
    border: 1px solid var(--vs-border);
    border-radius: var(--vs-radius-md);
    transition: border-color var(--vs-transition-fast);
    box-sizing: border-box;
  }

  .form-group input:focus,
  .form-group select:focus,
  .form-group textarea:focus {
    outline: none;
    border-color: var(--vs-black);
  }

  .form-group textarea {
    resize: vertical;
    line-height: 1.6;
  }

  .join-submit {
    display: inline-flex;
    align-items: center;
    gap: var(--vs-space-2);
    margin-top: var(--vs-space-2);
  }

  .join-submit:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .join-success {
    text-align: center;
    padding: var(--vs-space-24) 0;
  }

  .join-success svg {
    color: #16a34a;
    margin-bottom: var(--vs-space-6);
  }

  .join-success h1 {
    font-size: 2rem;
    font-weight: 600;
    margin-bottom: var(--vs-space-4);
  }

  .join-success p {
    font-size: 1.125rem;
    color: var(--vs-text-secondary);
    max-width: 480px;
    margin: 0 auto;
    line-height: 1.7;
  }

  @media (max-width: 768px) {
    .join-title {
      font-size: 2rem;
    }

    .form-row {
      grid-template-columns: 1fr;
    }

    .join-form {
      padding: var(--vs-space-6);
    }
  }
`;

export default JoinUsPage;
