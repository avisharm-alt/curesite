import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FEATURED_STORIES, HEALTH_TAGS } from '../data/mockData.ts';

const stripHtml = (s: string) => (s || '').replace(/<[^>]*>/g, '');
const truncate = (s: string, n = 200) => {
  const t = stripHtml(s);
  return t.length <= n ? t : t.slice(0, n).trim() + '…';
};
const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase() : '';
const readTime = (text: string) => {
  const w = stripHtml(text).split(/\s+/).length;
  return `${Math.max(1, Math.round(w / 200))} MIN READ`;
};

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      {/* ---------- 01 HERO ---------- */}
      <section className="hp-hero">
        <div className="container">
          <div className="hp-hero-top">
            <motion.div
              className="vs-eyebrow"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              — ON THE PLATFORM
            </motion.div>
            <motion.div
              className="hp-affiliation"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.08 }}
            >
              University of Toronto<br />Affiliated
            </motion.div>
          </div>

          <motion.h1
            className="hp-hero-title"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.12 }}
          >
            Real stories.<br />
            Real health.<br />
            Real <em>people</em><span className="vs-period">.</span>
          </motion.h1>

          <motion.p
            className="hp-hero-lead"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            A literary space where people share the health experiences that
            shaped them — so others reading don’t have to carry them alone.
          </motion.p>

          <motion.div
            className="hp-cta-row"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.28 }}
          >
            <Link to="/submit" className="btn btn-primary btn-lg">Share your story</Link>
            <Link to="/stories" className="btn btn-secondary btn-lg">Read the archive →</Link>
          </motion.div>
        </div>
      </section>

      {/* ---------- 02 FEATURED ---------- */}
      <section className="section hp-featured">
        <div className="container">
          <div className="vs-section-number"><span className="num">02</span>— FEATURED</div>
          <div className="hp-feat-header">
            <h2 className="hp-section-title">
              The stories<br />we’re reading<span className="vs-period">.</span>
            </h2>
            <Link to="/stories" className="btn btn-ghost">See all →</Link>
          </div>

          <div className="vs-story-list">
            {FEATURED_STORIES.slice(0, 4).map((s: any, idx: number) => (
              <motion.article
                key={s.id}
                className={`vs-story-card ${idx === 0 ? 'vs-story-card--featured' : ''}`}
                onClick={() => navigate(`/stories/${s.id}`)}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: idx * 0.08 }}
              >
                <div className="vs-story-card-meta-top">
                  {s.hasContentWarning && (
                    <span className="vs-chip vs-chip--warning">Content Warning</span>
                  )}
                  {(s.tags || []).slice(0, 2).map((t: string) => (
                    <span key={t} className="vs-chip">{t}</span>
                  ))}
                </div>
                <h3 className="vs-story-card-title">{s.title}</h3>
                <p className="vs-story-card-excerpt">{truncate(s.preview || s.body, 200)}</p>
                <div className="vs-story-card-footer">
                  <span>— {s.isAnonymous ? 'ANONYMOUS' : (s.authorName || 'ANONYMOUS').toUpperCase()} · {readTime(s.body || s.preview || '')}</span>
                  <span className="right">
                    {formatDate(s.publishedAt)}
                    <span className="vs-story-card-arrow">→</span>
                  </span>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- 03 THEMES ---------- */}
      <section className="section hp-themes">
        <div className="container">
          <div className="vs-section-number"><span className="num">03</span>— THEMES</div>
          <div className="vs-grid-asym hp-themes-header">
            <h2 className="hp-section-title">
              Read by what<br /><em className="vs-italic vs-coral">matters</em> to you<span className="vs-period">.</span>
            </h2>
            <p className="vs-lead">
              Every story finds its readers. Browse by the experience that brought you here
              — chronic illness, mental health, caregiving, recovery.
            </p>
          </div>

          <div className="vs-themes">
            {HEALTH_TAGS.map((tag: any) => (
              <Link
                key={tag.id}
                to={`/stories?tag=${encodeURIComponent(tag.name)}`}
                className="vs-theme-row"
              >
                <span className="vs-theme-marker" />
                <span className="vs-theme-name">{tag.name}</span>
                <span className="vs-theme-count">
                  {tag.count || 0} {tag.count === 1 ? 'STORY' : 'STORIES'}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- 04 STATEMENT ---------- */}
      <section className="section vs-section--charcoal hp-statement">
        <div className="container">
          <div className="vs-section-number" style={{ color: 'rgba(245,242,234,0.6)' }}>
            <span className="num">04</span>— EDITORIAL NOTE
          </div>
          <p className="vs-statement-quote">
            We don’t publish health <em>content</em>.
            We publish the people who lived it.
          </p>
          <div className="vs-statement-attr">— The editors</div>
        </div>
      </section>

      {/* ---------- 05 CTA ---------- */}
      <section className="section hp-cta">
        <div className="container">
          <div className="vs-section-number"><span className="num">05</span>— YOUR TURN</div>
          <div className="vs-grid-asym hp-cta-row">
            <h2 className="hp-section-title">
              Share your <em className="vs-italic vs-coral">story</em><span className="vs-period">.</span>
            </h2>
            <div>
              <p className="vs-lead">
                Anonymously or with your name. Reviewed by editors. Read by people
                who needed to hear it.
              </p>
              <div style={{ marginTop: 32 }}>
                <Link to="/submit" className="btn btn-primary btn-lg">Begin writing</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .home-page { min-height: 100vh; background: var(--vs-ivory); }

        .hp-hero { padding: 120px 0 96px; }
        .hp-hero-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 96px;
          gap: 32px;
        }
        .hp-affiliation {
          font-family: var(--vs-font-mono);
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--vs-ink-muted);
          text-align: right;
          line-height: 1.5;
        }
        .hp-hero-title {
          font-family: var(--vs-font-serif);
          font-feature-settings: "liga", "dlig", "kern";
          font-weight: 600;
          font-size: clamp(48px, 7.5vw, 112px);
          line-height: 0.96;
          letter-spacing: -0.035em;
          color: var(--vs-ink);
          margin: 0 0 48px;
        }
        .hp-hero-title em {
          font-style: italic;
          font-weight: 500;
          color: var(--vs-coral);
        }
        .hp-hero-lead {
          font-family: var(--vs-font-sans);
          font-size: clamp(18px, 1.6vw, 22px);
          line-height: 1.5;
          color: var(--vs-ink-muted);
          max-width: 56ch;
          margin: 0 0 56px;
        }
        .hp-cta-row { display: flex; gap: 16px; flex-wrap: wrap; }

        .hp-featured { background: var(--vs-sand); }
        .hp-feat-header {
          display: flex;
          justify-content: space-between;
          align-items: end;
          gap: 24px;
          flex-wrap: wrap;
          margin: 24px 0 48px;
        }
        .hp-section-title {
          font-family: var(--vs-font-serif);
          font-feature-settings: "liga", "dlig", "kern";
          font-weight: 600;
          font-size: clamp(36px, 4.2vw, 64px);
          line-height: 1.04;
          letter-spacing: -0.022em;
          color: var(--vs-ink);
          margin: 0;
        }
        .hp-section-title em { font-style: italic; font-weight: 500; }

        .hp-themes-header { margin: 24px 0 64px; }

        .hp-statement { padding: 200px 0; }
        .hp-statement .vs-statement-quote { margin-top: 64px; }

        .hp-cta-row { margin-top: 32px; }

        @media (max-width: 900px) {
          .hp-hero { padding: 72px 0 64px; }
          .hp-hero-top { margin-bottom: 48px; }
          .hp-affiliation { display: none; }
          .hp-hero-lead { font-size: 18px; margin-bottom: 40px; }
          .hp-statement { padding: 120px 0; }
        }
      `}</style>
    </div>
  );
};

export default HomePage;
