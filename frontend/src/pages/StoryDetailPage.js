import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertTriangle, Share2, Check } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', {
  month: 'long', day: 'numeric', year: 'numeric'
}).toUpperCase() : '';

const readTime = (text) => {
  const w = (text || '').replace(/<[^>]*>/g, '').split(/\s+/).length;
  return `${Math.max(1, Math.round(w / 200))} MIN READ`;
};

const StoryDetailPage = () => {
  const { storyId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resonating, setResonating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => { fetchStory(); /* eslint-disable-next-line */ }, [storyId]);

  const fetchStory = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/stories/${storyId}`);
      if (res.ok) setStory(await res.json());
      else if (res.status === 404) { toast.error('Story not found'); navigate('/stories'); }
    } finally { setLoading(false); }
  };

  const onResonate = async () => {
    if (!user) { toast.error('Sign in to resonate'); return; }
    setResonating(true);
    try {
      const res = await fetch(`${API}/stories/${storyId}/resonate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const d = await res.json();
        setStory(s => ({ ...s, resonance_count: d.resonance_count, user_resonated: d.user_resonated }));
      }
    } finally { setResonating(false); }
  };

  const onShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: story.title, url }); return; } catch { /* fall through */ }
    }
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Link copied');
    setTimeout(() => setCopied(false), 1800);
  };

  const renderBody = (body) => {
    if (!body) return null;
    if (body.includes('<') && body.includes('>')) {
      return <div dangerouslySetInnerHTML={{ __html: body }} />;
    }
    return body.split(/\n\n+/).map((p, i) => <p key={i}>{p}</p>);
  };

  if (loading) {
    return (
      <div className="vs-page">
        <div className="vs-article-shell">
          <div className="vs-skeleton vs-skel-tag" />
          <div className="vs-skeleton vs-skel-title" style={{ height: 64, marginBottom: 24 }} />
          <div className="vs-skeleton vs-skel-excerpt" />
          <div className="vs-skeleton vs-skel-excerpt-2" />
        </div>
      </div>
    );
  }

  if (!story) return null;

  return (
    <div className="vs-page">
      <div className="vs-article-shell">
        <button className="vs-article-back" onClick={() => navigate('/stories')}>
          ← Back to the archive
        </button>

        {story.has_content_warning && (
          <div className="vs-cw-banner">
            <AlertTriangle size={18} style={{ color: 'var(--vs-coral)', flexShrink: 0, marginTop: 2 }} />
            <div>
              <strong>● Content Warning</strong>
              <p>This story contains content that some readers may find distressing.</p>
            </div>
          </div>
        )}

        <div className="vs-article-tags">
          {story.tags?.map(t => (
            <span key={t} className="vs-chip" onClick={() => navigate(`/stories?tag=${encodeURIComponent(t)}`)}>
              {t}
            </span>
          ))}
        </div>

        <h1 className="vs-article-title">{story.title}</h1>

        <div className="vs-article-meta">
          <span>— BY {(story.author_name || 'ANONYMOUS').toUpperCase()}</span>
          <span className="dot">·</span>
          <span>{readTime(story.body)}</span>
          <span className="dot">·</span>
          <span>{formatDate(story.published_at)}</span>
          {story.university && (<><span className="dot">·</span><span>{story.university.toUpperCase()}</span></>)}
        </div>

        <div className="vs-article-body">
          {renderBody(story.body)}
        </div>

        <div className="vs-article-end">
          ✱ — END
        </div>

        <div className="vs-article-actions">
          <button
            className={`vs-resonate-btn ${story.user_resonated ? 'is-active' : ''}`}
            onClick={onResonate}
            disabled={resonating}
          >
            ● This resonated
            <span className="count">{story.resonance_count || 0}</span>
          </button>
          <button className="vs-resonate-btn" onClick={onShare}>
            {copied ? <Check size={14} /> : <Share2 size={14} />}
            {copied ? 'Copied' : 'Share'}
          </button>
        </div>

        <div className="vs-read-another">
          <button className="vs-btn vs-btn--ghost" onClick={() => navigate('/stories')}>
            Read another story →
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoryDetailPage;
