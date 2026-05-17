import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Share2, Check, AlertTriangle, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { ALL_STORIES } from '../data/mockData.ts';

const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-US', {
  month: 'long', day: 'numeric', year: 'numeric'
}).toUpperCase() : '';
const readTime = (text: string) => {
  const w = (text || '').replace(/<[^>]*>/g, '').split(/\s+/).length;
  return `${Math.max(1, Math.round(w / 200))} MIN READ`;
};

const StoryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const story = ALL_STORIES.find((s: any) => s.id === id);
  const [copied, setCopied] = useState(false);
  const [resonated, setResonated] = useState(false);
  const [resonateCount, setResonateCount] = useState((story as any)?.resonateCount || 12);

  if (!story) {
    return (
      <div className="story-not-found">
        <div className="container container-sm">
          <div className="vs-eyebrow vs-eyebrow--muted">— NOT FOUND</div>
          <h1>This story has been removed<span className="vs-period">.</span></h1>
          <p>Or maybe the link is wrong. The archive is still here.</p>
          <Link to="/stories" className="btn btn-primary">Browse the archive</Link>
        </div>
        <style>{notFoundStyles}</style>
      </div>
    );
  }

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: (story as any).title, url }); return; } catch {}
    }
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Link copied');
    setTimeout(() => setCopied(false), 1800);
  };

  const handleResonate = () => {
    setResonated(!resonated);
    setResonateCount((c: number) => resonated ? c - 1 : c + 1);
  };

  const s: any = story;

  return (
    <div className="story-detail-page">
      <div className="sd-shell">
        <Link to="/stories" className="sd-back">
          <ArrowLeft size={14} />
          <span>Back to the archive</span>
        </Link>

        {s.hasContentWarning && (
          <div className="sd-cw">
            <AlertTriangle size={18} />
            <div>
              <strong>● Content Warning</strong>
              <p>This story contains content that some readers may find distressing.</p>
            </div>
          </div>
        )}

        <div className="sd-tags">
          {(s.tags || []).map((t: string) => (
            <Link key={t} to={`/stories?tag=${encodeURIComponent(t)}`} className="vs-chip">{t}</Link>
          ))}
        </div>

        <motion.h1
          className="sd-title"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          {s.title}
        </motion.h1>

        <div className="sd-meta">
          <span>— BY {(s.isAnonymous ? 'ANONYMOUS' : (s.authorName || 'ANONYMOUS')).toUpperCase()}</span>
          <span className="dot">·</span>
          <span>{readTime(s.body)}</span>
          <span className="dot">·</span>
          <span>{formatDate(s.publishedAt)}</span>
          {s.university && (<><span className="dot">·</span><span>{s.university.toUpperCase()}</span></>)}
        </div>

        <motion.div
          className="sd-body"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.15 }}
        >
          {(s.body || '').split(/\n\n+/).map((p: string, i: number) => (
            <p key={i}>{p}</p>
          ))}
        </motion.div>

        <div className="sd-end">✱ — END</div>

        <div className="sd-actions">
          <button
            className={`sd-resonate ${resonated ? 'is-active' : ''}`}
            onClick={handleResonate}
          >
            ● This resonated
            <span className="count">{resonateCount}</span>
          </button>
          <button className="sd-resonate" onClick={handleShare} data-testid="share-story-btn">
            {copied ? <Check size={14} /> : <Share2 size={14} />}
            {copied ? 'Copied' : 'Share'}
          </button>
        </div>

        <div className="sd-next">
          <Link to="/stories" className="btn btn-ghost">Read another story →</Link>
        </div>
      </div>

      <style>{`
        .story-detail-page { min-height: 100vh; background: var(--vs-ivory); }
        .sd-shell {
          max-width: 680px;
          margin: 0 auto;
          padding: 64px 24px 128px;
        }

        .sd-back {
          display: inline-flex; align-items: center; gap: 10px;
          font-family: var(--vs-font-mono);
          font-size: 11px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--vs-ink-muted);
          margin-bottom: 56px;
        }
        .sd-back:hover { color: var(--vs-coral); }

        .sd-cw {
          display: flex;
          gap: 16px;
          align-items: flex-start;
          padding: 22px;
          border: 1px solid var(--vs-coral);
          border-radius: 4px;
          background: rgba(242, 92, 84, 0.04);
          margin-bottom: 40px;
          color: var(--vs-coral);
        }
        .sd-cw strong {
          display: block;
          font-family: var(--vs-font-mono);
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--vs-coral);
          margin-bottom: 6px;
        }
        .sd-cw p {
          font-family: var(--vs-font-sans);
          font-size: 15px;
          color: var(--vs-ink-muted);
          margin: 0;
        }

        .sd-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 32px; }

        .sd-title {
          font-family: var(--vs-font-serif);
          font-feature-settings: "liga", "dlig", "kern";
          font-weight: 600;
          font-size: clamp(40px, 5.5vw, 80px);
          line-height: 1;
          letter-spacing: -0.025em;
          color: var(--vs-ink);
          margin: 0 0 40px;
        }

        .sd-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 18px 0;
          border-top: 1px solid var(--vs-rule);
          border-bottom: 1px solid var(--vs-rule);
          margin-bottom: 56px;
          font-family: var(--vs-font-mono);
          font-size: 11px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--vs-ink-muted);
          flex-wrap: wrap;
        }
        .sd-meta .dot { color: var(--vs-ink-faint); }

        .sd-body {
          font-family: var(--vs-font-sans);
          font-size: 19px;
          line-height: 1.75;
          color: var(--vs-ink);
        }
        .sd-body p { margin: 0 0 32px; }
        .sd-body p:first-child::first-letter {
          font-family: var(--vs-font-serif);
          font-weight: 500;
          font-size: 4.2em;
          float: left;
          line-height: 0.9;
          margin: 0.05em 0.12em 0 -0.03em;
          color: var(--vs-ink);
        }

        .sd-end {
          margin-top: 64px;
          padding-top: 24px;
          border-top: 1px solid var(--vs-rule);
          font-family: var(--vs-font-mono);
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--vs-coral);
        }

        .sd-actions {
          display: flex;
          gap: 12px;
          margin-top: 32px;
          flex-wrap: wrap;
        }
        .sd-resonate {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 12px 20px;
          border-radius: 999px;
          border: 1px solid var(--vs-rule-strong);
          background: transparent;
          font-family: var(--vs-font-mono);
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--vs-ink);
          cursor: pointer;
          transition: all 200ms ease;
        }
        .sd-resonate:hover { border-color: var(--vs-coral); color: var(--vs-coral); }
        .sd-resonate.is-active {
          border-color: var(--vs-coral);
          color: var(--vs-coral);
          background: rgba(242, 92, 84, 0.06);
        }
        .sd-resonate .count {
          display: inline-flex; align-items: center; justify-content: center;
          min-width: 22px; height: 22px; padding: 0 6px;
          border-radius: 999px;
          background: var(--vs-ink);
          color: var(--vs-paper);
          font-size: 10px;
        }
        .sd-resonate.is-active .count { background: var(--vs-coral); color: #fff; }

        .sd-next {
          margin-top: 56px;
          text-align: center;
        }
      `}</style>
    </div>
  );
};

const notFoundStyles = `
  .story-not-found { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 96px 24px; }
  .story-not-found .vs-eyebrow { margin-bottom: 24px; }
  .story-not-found h1 { font-family: var(--vs-font-serif); font-weight: 600; font-size: clamp(48px, 7vw, 96px); letter-spacing: -0.03em; margin-bottom: 24px; }
  .story-not-found p { font-size: 18px; color: var(--vs-ink-muted); margin-bottom: 32px; }
`;

export default StoryDetailPage;
