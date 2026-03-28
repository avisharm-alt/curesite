import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircleHeart, AlertTriangle, Calendar, User, Share2, Copy, Check } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const StoryDetailPage = () => {
  const { storyId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resonating, setResonating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchStory();
  }, [storyId]);

  const fetchStory = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/stories/${storyId}`);
      if (res.ok) {
        const data = await res.json();
        setStory(data);
      } else if (res.status === 404) {
        toast.error('Story not found');
        navigate('/stories');
      }
    } catch (error) {
      console.error('Error fetching story:', error);
      toast.error('Failed to load story');
    } finally {
      setLoading(false);
    }
  };

  const handleResonate = async () => {
    if (!user) {
      toast.error('Please sign in to resonate with this story');
      return;
    }

    setResonating(true);
    try {
      const res = await fetch(`${API}/stories/${storyId}/resonate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        const data = await res.json();
        setStory(prev => ({
          ...prev,
          resonance_count: data.resonance_count,
          user_resonated: data.user_resonated
        }));
        toast.success(data.user_resonated ? 'This resonated with you' : 'Resonance removed');
      }
    } catch (error) {
      console.error('Error toggling resonance:', error);
      toast.error('Failed to update');
    } finally {
      setResonating(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: story.title,
          text: `Read this story on Vital Signs: ${story.title}`,
          url: url
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          copyToClipboard(url);
        }
      }
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const renderBody = (body) => {
    // Check if body contains HTML
    if (body.includes('<') && body.includes('>')) {
      return <div dangerouslySetInnerHTML={{ __html: body }} />;
    }
    // Plain text - convert line breaks to paragraphs
    return body.split('\n\n').map((paragraph, idx) => (
      <p key={idx}>{paragraph}</p>
    ));
  };

  if (loading) {
    return (
      <div className="vs-page vs-story-detail-page">
        <div className="vs-container">
          <div className="vs-story-loading">
            <div className="vs-loading-spinner"></div>
            <p>Loading story...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="vs-page vs-story-detail-page">
        <div className="vs-container">
          <div className="vs-story-not-found">
            <h2>Story not found</h2>
            <button className="vs-btn-primary" onClick={() => navigate('/stories')}>
              Browse Stories
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="vs-page vs-story-detail-page">
      {/* Back Navigation */}
      <div className="vs-story-nav">
        <div className="vs-container">
          <button className="vs-back-btn" onClick={() => navigate('/stories')}>
            <ArrowLeft size={20} />
            Back to Stories
          </button>
        </div>
      </div>

      {/* Content Warning Banner */}
      {story.has_content_warning && (
        <div className="vs-content-warning-banner">
          <div className="vs-container">
            <AlertTriangle size={24} />
            <div>
              <strong>Content Warning</strong>
              <p>This story contains content that some readers may find distressing.</p>
            </div>
          </div>
        </div>
      )}

      {/* Story Content */}
      <article className="vs-story-article">
        <div className="vs-container vs-story-container">
          {/* Header */}
          <header className="vs-story-header">
            <div className="vs-story-tags">
              {story.tags?.map((tag, idx) => (
                <span 
                  key={idx} 
                  className="vs-tag-pill vs-tag-pill-large"
                  onClick={() => navigate(`/stories?tag=${encodeURIComponent(tag)}`)}
                >
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="vs-story-title">{story.title}</h1>
            <div className="vs-story-meta">
              <div className="vs-story-author-info">
                <User size={20} />
                <span>{story.author_name || 'Anonymous'}</span>
                {story.university && (
                  <span className="vs-story-university">• {story.university}</span>
                )}
              </div>
              <div className="vs-story-date-info">
                <Calendar size={18} />
                <span>{formatDate(story.published_at)}</span>
              </div>
            </div>
          </header>

          {/* Body */}
          <div className="vs-story-body">
            {renderBody(story.body)}
          </div>

          {/* Footer Actions */}
          <footer className="vs-story-footer">
            <div className="vs-story-actions">
              <button 
                className={`vs-resonate-btn-large ${story.user_resonated ? 'resonated' : ''}`}
                onClick={handleResonate}
                disabled={resonating}
              >
                <MessageCircleHeart size={24} />
                <span>This resonated with me</span>
                <span className="vs-resonate-count">{story.resonance_count || 0}</span>
              </button>
              
              <button className="vs-share-btn" onClick={handleShare}>
                {copied ? <Check size={20} /> : <Share2 size={20} />}
                {copied ? 'Copied!' : 'Share'}
              </button>
            </div>

            <div className="vs-story-cta">
              <p>Has this story inspired you to share your own experience?</p>
              <button 
                className="vs-btn-primary"
                onClick={() => navigate('/submit')}
              >
                Share Your Story
              </button>
            </div>
          </footer>
        </div>
      </article>
    </div>
  );
};

export default StoryDetailPage;
