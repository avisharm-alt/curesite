import React, { useState, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ALL_STORIES, HEALTH_TAGS } from '../data/mockData.ts';

const stripHtml = (s: string) => (s || '').replace(/<[^>]*>/g, '');
const truncate = (s: string, n = 220) => {
  const t = stripHtml(s);
  return t.length <= n ? t : t.slice(0, n).trim() + '…';
};
const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase() : '';
const readTime = (text: string) => `${Math.max(1, Math.round(stripHtml(text).split(/\s+/).length / 200))} MIN READ`;

const StoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const initialTag = params.get('tag') || '';

  const [selectedTag, setSelectedTag] = useState<string>(initialTag);
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let arr = [...ALL_STORIES];
    if (selectedTag) arr = arr.filter((s: any) => s.tags?.includes(selectedTag));
    if (search) {
      const q = search.toLowerCase();
      arr = arr.filter((s: any) =>
        s.title.toLowerCase().includes(q) || (s.preview || s.body || '').toLowerCase().includes(q)
      );
    }
    arr.sort((a: any, b: any) => {
      const da = new Date(a.publishedAt).getTime();
      const db = new Date(b.publishedAt).getTime();
      return sort === 'newest' ? db - da : da - db;
    });
    return arr;
  }, [selectedTag, sort, search]);

  const onTag = (name: string) => {
    setSelectedTag(name);
    if (name) setParams({ tag: name }); else setParams({});
  };

  return (
    <div className="stories-page">
      {/* Hero */}
      <section className="sp-hero">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="vs-eyebrow">— THE ARCHIVE</div>
            <h1 className="sp-title">
              Stories<span className="vs-period">.</span>
            </h1>
            <p className="vs-lead">
              Long-form accounts of illness, recovery, caregiving and the quiet
              in-between, written by the people who lived them.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filter bar */}
      <section className="sp-filter-section">
        <div className="container">
          <div className="sp-filter-bar">
            <div className="sp-filter-tags">
              <button
                className={`vs-chip ${!selectedTag ? 'vs-chip--active' : ''}`}
                onClick={() => onTag('')}
              >
                All
              </button>
              {HEALTH_TAGS.map((t: any) => (
                <button
                  key={t.id}
                  className={`vs-chip ${selectedTag === t.name ? 'vs-chip--active' : ''}`}
                  onClick={() => onTag(t.name)}
                >
                  {t.name}
                </button>
              ))}
            </div>
            <div className="sp-filter-meta">
              <input
                type="text"
                className="sp-search"
                placeholder="Search…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <span className="sp-count">{filtered.length} {filtered.length === 1 ? 'STORY' : 'STORIES'}</span>
              <select
                className="sp-sort"
                value={sort}
                onChange={(e) => setSort(e.target.value as any)}
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* List */}
      <section className="sp-list-section">
        <div className="container">
          <div className="vs-story-list">
            {filtered.length === 0 && (
              <div className="sp-empty">
                <h3>No stories here yet.</h3>
                <p>Try removing a filter, or be the first to share.</p>
                <Link to="/submit" className="btn btn-primary">Share yours</Link>
              </div>
            )}
            {filtered.map((s: any, idx: number) => (
              <motion.article
                key={s.id}
                className={`vs-story-card ${idx === 0 ? 'vs-story-card--featured' : ''}`}
                onClick={() => navigate(`/stories/${s.id}`)}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: Math.min(idx * 0.05, 0.3) }}
              >
                <div className="vs-story-card-meta-top">
                  {s.hasContentWarning && <span className="vs-chip vs-chip--warning">Content Warning</span>}
                  {(s.tags || []).slice(0, 3).map((t: string) => (
                    <span key={t} className="vs-chip">{t}</span>
                  ))}
                </div>
                <h3 className="vs-story-card-title">{s.title}</h3>
                <p className="vs-story-card-excerpt">{truncate(s.preview || s.body, 220)}</p>
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

      <style>{`
        .stories-page { min-height: 100vh; background: var(--vs-ivory); }

        .sp-hero { padding: 96px 0 56px; }
        .sp-title {
          font-family: var(--vs-font-serif);
          font-feature-settings: "liga", "dlig", "kern";
          font-weight: 600;
          font-size: clamp(48px, 6.5vw, 96px);
          line-height: 0.98;
          letter-spacing: -0.03em;
          color: var(--vs-ink);
          margin: 24px 0 32px;
        }

        .sp-filter-section { padding: 0; }
        .sp-filter-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 24px;
          padding: 28px 0;
          border-top: 1px solid var(--vs-rule);
          border-bottom: 1px solid var(--vs-rule);
          flex-wrap: wrap;
        }
        .sp-filter-tags { display: flex; flex-wrap: wrap; gap: 8px; }
        .sp-filter-meta {
          display: flex;
          align-items: center;
          gap: 16px;
          font-family: var(--vs-font-mono);
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--vs-ink-muted);
        }
        .sp-search {
          width: 200px;
          padding: 8px 14px;
          font-family: var(--vs-font-sans);
          font-size: 13px;
          letter-spacing: 0;
          text-transform: none;
          border: 1px solid var(--vs-rule-strong);
          border-radius: 999px;
          background: transparent;
          color: var(--vs-ink);
        }
        .sp-search:focus { outline: none; border-color: var(--vs-coral); }
        .sp-sort {
          font-family: var(--vs-font-mono);
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--vs-ink);
          background: transparent;
          border: 1px solid var(--vs-rule-strong);
          border-radius: 999px;
          padding: 6px 32px 6px 14px;
          cursor: pointer;
          width: auto;
        }

        .sp-list-section { padding: 0 0 96px; }

        .sp-empty {
          padding: 96px 0;
          border-top: 1px solid var(--vs-rule);
          border-bottom: 1px solid var(--vs-rule);
        }
        .sp-empty h3 {
          font-family: var(--vs-font-serif);
          font-size: 36px;
          font-weight: 500;
          letter-spacing: -0.015em;
          margin: 0 0 16px;
        }
        .sp-empty p {
          color: var(--vs-ink-muted);
          margin: 0 0 32px;
          font-size: 17px;
        }

        @media (max-width: 900px) {
          .sp-hero { padding: 56px 0 32px; }
          .sp-search { width: 100%; }
          .sp-filter-meta { width: 100%; justify-content: space-between; }
        }
      `}</style>
    </div>
  );
};

export default StoriesPage;
