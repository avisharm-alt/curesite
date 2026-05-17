import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const stripHtml = (s) => (s || '').replace(/<[^>]*>/g, '');
const truncate = (s, n = 200) => {
  const t = stripHtml(s);
  return t.length <= n ? t : t.slice(0, n).trim() + '…';
};
const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase() : '';
const readTime = (text) => `${Math.max(1, Math.round(stripHtml(text).split(/\s+/).length / 200))} MIN READ`;

const StoriesPage = () => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const [stories, setStories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  const [selectedTag, setSelectedTag] = useState(params.get('tag') || '');
  const [sort, setSort] = useState('newest');

  useEffect(() => {
    fetch(`${API}/tags`).then(r => r.ok ? r.json() : []).then(setTags).catch(() => {});
  }, []);

  useEffect(() => { fetchStories(1); /* eslint-disable-next-line */ }, [selectedTag, sort]);

  const fetchStories = async (n) => {
    setLoading(true);
    try {
      let url = `${API}/stories?page=${n}&limit=10&sort=${sort}`;
      if (selectedTag) url += `&tag=${encodeURIComponent(selectedTag)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setStories(n === 1 ? data.stories : [...stories, ...data.stories]);
        setPage(n);
        setHasMore(data.has_more);
        setTotal(data.total);
      }
    } finally { setLoading(false); }
  };

  const onTag = (name) => {
    setSelectedTag(name);
    if (name) setParams({ tag: name }); else setParams({});
  };

  return (
    <div className="vs-page">
      {/* ----- Page hero ----- */}
      <section className="vs-page-hero">
        <div className="vs-container">
          <div className="vs-eyebrow">— THE ARCHIVE</div>
          <div className="vs-spacer-sm" />
          <h1 className="vs-page-title">
            Stories<span className="vs-period">.</span>
          </h1>
          <p className="vs-lead">
            Long-form accounts of illness, recovery, caregiving and the quiet
            in-between, written by the people who lived them.
          </p>
        </div>
      </section>

      {/* ----- Filter bar ----- */}
      <section>
        <div className="vs-container">
          <div className="vs-filter-bar">
            <div className="left">
              <button
                className={`vs-chip ${!selectedTag ? 'vs-chip--active' : ''}`}
                onClick={() => onTag('')}
              >
                All
              </button>
              {tags.map(t => (
                <button
                  key={t.id}
                  className={`vs-chip ${selectedTag === t.name ? 'vs-chip--active' : ''}`}
                  onClick={() => onTag(t.name)}
                >
                  {t.name}
                </button>
              ))}
            </div>
            <div className="right">
              <span>{total} {total === 1 ? 'STORY' : 'STORIES'}</span>
              <select className="vs-select-native" value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="most_resonated">Most resonated</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* ----- Stories list ----- */}
      <section>
        <div className="vs-container">
          <div className="vs-story-list">
            {loading && page === 1 && [1, 2, 3].map(i => (
              <div key={i} className="vs-loading-row">
                <div className="vs-skeleton vs-skel-tag" />
                <div className="vs-skeleton vs-skel-title" />
                <div className="vs-skeleton vs-skel-excerpt" />
                <div className="vs-skeleton vs-skel-excerpt-2" />
              </div>
            ))}

            {!loading && stories.length === 0 && (
              <div className="vs-empty">
                <h3 className="vs-h3">No stories yet{selectedTag ? ` in ${selectedTag}.` : '.'}</h3>
                <p>Be the first to share — your account could be the one someone else needed to read today.</p>
                <button className="vs-btn vs-btn--primary" onClick={() => navigate('/submit')}>
                  <span className="vs-btn-dot" /> Share yours
                </button>
              </div>
            )}

            {stories.map((s, idx) => (
              <article
                key={s.id}
                className={`vs-story-card ${idx === 0 ? 'vs-story-card--featured' : ''}`}
                onClick={() => navigate(`/stories/${s.id}`)}
              >
                <div className="vs-story-card-meta-top">
                  {s.has_content_warning && <span className="vs-chip vs-chip--warning">Content Warning</span>}
                  {s.tags?.slice(0, 3).map(t => <span key={t} className="vs-chip">{t}</span>)}
                </div>
                <h3 className="vs-story-card-title">{s.title}</h3>
                <p className="vs-story-card-excerpt">{truncate(s.body, 220)}</p>
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

          {hasMore && (
            <div className="vs-load-more">
              <button
                className="vs-btn vs-btn--ghost"
                disabled={loading}
                onClick={() => fetchStories(page + 1)}
              >
                {loading ? 'Loading…' : 'Load more →'}
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default StoriesPage;
