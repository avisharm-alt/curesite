import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const stripHtml = (s) => (s || '').replace(/<[^>]*>/g, '');
const truncate = (s, n = 180) => {
  const t = stripHtml(s);
  return t.length <= n ? t : t.slice(0, n).trim() + '…';
};
const formatDate = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
};
const readTime = (text) => {
  const w = stripHtml(text).split(/\s+/).length;
  return `${Math.max(1, Math.round(w / 200))} MIN READ`;
};

const VitalSignsHomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [featured, setFeatured] = useState([]);
  const [tags, setTags] = useState([]);

  useEffect(() => {
    fetch(`${API}/stories/featured`).then(r => r.ok ? r.json() : []).then(setFeatured).catch(() => {});
    fetch(`${API}/tags`).then(r => r.ok ? r.json() : []).then(setTags).catch(() => {});
  }, []);

  const handleShare = () => {
    if (user) navigate('/submit');
    else window.location.href = `${API}/auth/google`;
  };

  return (
    <div className="vs-page">
      {/* ---------- 01 HERO ---------- */}
      <section className="vs-hero">
        <div className="vs-container">
          <div className="vs-hero-top">
            <div className="vs-eyebrow vs-fade-up">— ON THE PLATFORM</div>
            <div className="vs-affiliation vs-fade-up delay-1">
              University of Toronto<br />Affiliated
            </div>
          </div>

          <h1 className="vs-hero-title vs-fade-up delay-1">
            Real stories.<br />
            Real health.<br />
            Real <em>people</em><span className="vs-period">.</span>
          </h1>

          <p className="vs-hero-lead vs-fade-up delay-2">
            A literary space where people share the health experiences that shaped them —
            so others reading don't have to carry them alone.
          </p>

          <div className="vs-btn-row vs-fade-up delay-3">
            <button className="vs-btn vs-btn--primary vs-btn--large" onClick={handleShare}>
              <span className="vs-btn-dot" />
              Share your story
            </button>
            <button className="vs-btn vs-btn--secondary vs-btn--large" onClick={() => navigate('/stories')}>
              Read the archive →
            </button>
          </div>
        </div>
      </section>

      {/* ---------- 02 FEATURED STORIES ---------- */}
      <section className="vs-section vs-section--sand">
        <div className="vs-container">
          <div className="vs-section-number">
            <span className="num">02</span>— FEATURED
          </div>
          <div className="vs-row-between" style={{ marginTop: 24, marginBottom: 48 }}>
            <h2 className="vs-section-title">
              The stories<br />we're reading<span className="vs-period">.</span>
            </h2>
            <button className="vs-btn vs-btn--ghost" onClick={() => navigate('/stories')}>
              See all →
            </button>
          </div>

          <div className="vs-story-list">
            {featured.length === 0 && (
              <div className="vs-empty">
                <h3 className="vs-h3">No featured stories yet.</h3>
                <p>The first stories are being reviewed. Yours could be among them.</p>
                <button className="vs-btn vs-btn--primary" onClick={handleShare}>
                  <span className="vs-btn-dot" /> Be the first
                </button>
              </div>
            )}
            {featured.slice(0, 4).map((s, idx) => (
              <article
                key={s.id}
                className={`vs-story-card ${idx === 0 ? 'vs-story-card--featured' : ''}`}
                onClick={() => navigate(`/stories/${s.id}`)}
              >
                <div className="vs-story-card-meta-top">
                  {s.has_content_warning && (
                    <span className="vs-chip vs-chip--warning">Content Warning</span>
                  )}
                  {s.tags?.slice(0, 2).map(t => <span key={t} className="vs-chip">{t}</span>)}
                </div>
                <h3 className="vs-story-card-title">{s.title}</h3>
                <p className="vs-story-card-excerpt">{truncate(s.body, 200)}</p>
                <div className="vs-story-card-footer">
                  <span>— {s.author_name || 'Anonymous'} · {readTime(s.body)}</span>
                  <span className="right">
                    {formatDate(s.published_at)}
                    <span className="vs-story-card-arrow">→</span>
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- 03 THEMES ---------- */}
      <section className="vs-section">
        <div className="vs-container">
          <div className="vs-section-number">
            <span className="num">03</span>— THEMES
          </div>
          <div className="vs-grid-asym" style={{ marginTop: 24, marginBottom: 64 }}>
            <h2 className="vs-section-title">
              Read by what<br /><em className="vs-italic vs-coral">matters</em> to you<span className="vs-period">.</span>
            </h2>
            <p className="vs-lead">
              Every story finds its readers. Browse by the experience that brought you here —
              chronic illness, mental health, caregiving, recovery.
            </p>
          </div>

          <div className="vs-themes">
            {tags.length === 0 && [
              'Mental Health', 'Chronic Illness', 'Caregiving', 'Addiction & Recovery',
              'Disability', 'Reproductive Health',
            ].map(name => (
              <div key={name} className="vs-theme-row" onClick={() => navigate(`/stories?tag=${encodeURIComponent(name)}`)}>
                <span className="vs-theme-marker" />
                <span className="vs-theme-name">{name}</span>
                <span className="vs-theme-count">— stories</span>
              </div>
            ))}
            {tags.map(tag => (
              <div
                key={tag.id}
                className="vs-theme-row"
                onClick={() => navigate(`/stories?tag=${encodeURIComponent(tag.name)}`)}
              >
                <span className="vs-theme-marker" />
                <span className="vs-theme-name">{tag.name}</span>
                <span className="vs-theme-count">
                  {tag.story_count || 0} {tag.story_count === 1 ? 'STORY' : 'STORIES'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- 04 STATEMENT ---------- */}
      <section className="vs-section vs-section--charcoal">
        <div className="vs-container">
          <div className="vs-section-number" style={{ color: 'rgba(245,242,234,0.6)' }}>
            <span className="num">04</span>— EDITORIAL NOTE
          </div>
          <div style={{ marginTop: 64 }}>
            <p className="vs-statement-quote">
              We don't publish health <em>content</em>.
              We publish the people who lived it.
            </p>
            <div className="vs-statement-attr">— The editors</div>
          </div>
        </div>
      </section>

      {/* ---------- 05 CTA ---------- */}
      <section className="vs-section">
        <div className="vs-container">
          <div className="vs-section-number">
            <span className="num">05</span>— YOUR TURN
          </div>
          <div className="vs-grid-asym" style={{ marginTop: 32 }}>
            <h2 className="vs-section-title">
              Share your <em className="vs-italic vs-coral">story</em><span className="vs-period">.</span>
            </h2>
            <div>
              <p className="vs-lead" style={{ marginBottom: 32 }}>
                Anonymously or with your name. Reviewed by editors. Read by people
                who needed to hear it.
              </p>
              <button className="vs-btn vs-btn--primary vs-btn--large" onClick={handleShare}>
                <span className="vs-btn-dot" />
                Begin writing
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default VitalSignsHomePage;
