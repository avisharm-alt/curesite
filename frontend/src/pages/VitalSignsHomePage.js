import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, BookOpen, PenLine, ArrowRight, MessageCircleHeart } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const VitalSignsHomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [featuredStories, setFeaturedStories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch featured stories
        const storiesRes = await fetch(`${API}/stories/featured`);
        if (storiesRes.ok) {
          const storiesData = await storiesRes.json();
          setFeaturedStories(storiesData);
        }

        // Fetch tags
        const tagsRes = await fetch(`${API}/tags`);
        if (tagsRes.ok) {
          const tagsData = await tagsRes.json();
          setTags(tagsData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleShareStory = () => {
    if (user) {
      navigate('/submit');
    } else {
      // Trigger Google login
      window.location.href = `${API}/auth/google`;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const truncateText = (text, maxLength = 150) => {
    if (!text) return '';
    // Strip HTML tags for preview
    const plainText = text.replace(/<[^>]*>/g, '');
    if (plainText.length <= maxLength) return plainText;
    return plainText.substring(0, maxLength).trim() + '...';
  };

  return (
    <div className="vs-page">
      {/* Hero Section */}
      <section className="vs-hero">
        <div className="vs-hero-content">
          <h1 className="vs-hero-title">
            Vital<span className="vs-accent">Signs</span>
          </h1>
          <div className="vs-uoft-badge">
            <span className="vs-uoft-logo">🏛️</span>
            <span>UofT Affiliated</span>
          </div>
          <p className="vs-hero-tagline">Real stories. Real health. Real people.</p>
          <p className="vs-hero-description">
            A community where people share their health experiences to build empathy, 
            reduce stigma, and connect with others who understand.
          </p>
          <div className="vs-hero-buttons">
            <button className="vs-btn-primary" onClick={handleShareStory}>
              <PenLine size={20} />
              Share Your Story
            </button>
            <button className="vs-btn-secondary" onClick={() => navigate('/stories')}>
              <BookOpen size={20} />
              Read Stories
            </button>
          </div>
        </div>
        <div className="vs-hero-illustration">
          <div className="vs-hero-shapes">
            <div className="vs-shape vs-shape-1"></div>
            <div className="vs-shape vs-shape-2"></div>
            <div className="vs-shape vs-shape-3"></div>
          </div>
        </div>
      </section>

      {/* Featured Stories Section */}
      <section className="vs-featured-section">
        <div className="vs-container">
          <h2 className="vs-section-title">Featured Stories</h2>
          {loading ? (
            <div className="vs-loading">Loading stories...</div>
          ) : featuredStories.length > 0 ? (
            <div className="vs-featured-grid">
              {featuredStories.map((story) => (
                <article 
                  key={story.id} 
                  className="vs-story-card"
                  onClick={() => navigate(`/stories/${story.id}`)}
                >
                  {story.has_content_warning && (
                    <div className="vs-content-warning-badge">Content Warning</div>
                  )}
                  <div className="vs-story-card-tags">
                    {story.tags?.slice(0, 2).map((tag, idx) => (
                      <span key={idx} className="vs-tag-pill">{tag}</span>
                    ))}
                  </div>
                  <h3 className="vs-story-card-title">{story.title}</h3>
                  <p className="vs-story-card-preview">{truncateText(story.body)}</p>
                  <div className="vs-story-card-footer">
                    <span className="vs-story-author">
                      {story.author_name || 'Anonymous'}
                    </span>
                    <span className="vs-story-date">{formatDate(story.published_at)}</span>
                  </div>
                  <div className="vs-story-card-resonance">
                    <MessageCircleHeart size={16} />
                    <span>{story.resonance_count || 0} resonated</span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="vs-empty-featured">
              <Heart size={48} className="vs-empty-icon" />
              <p>Stories are being reviewed. Check back soon!</p>
              <button className="vs-btn-primary" onClick={handleShareStory}>
                Be the first to share
              </button>
            </div>
          )}
          {featuredStories.length > 0 && (
            <div className="vs-section-cta">
              <button className="vs-btn-link" onClick={() => navigate('/stories')}>
                View all stories <ArrowRight size={18} />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Topic Tags Section */}
      <section className="vs-topics-section">
        <div className="vs-container">
          <h2 className="vs-section-title">Explore by Topic</h2>
          <div className="vs-topics-grid">
            {tags.map((tag) => (
              <button
                key={tag.id}
                className="vs-topic-card"
                onClick={() => navigate(`/stories?tag=${encodeURIComponent(tag.name)}`)}
              >
                <span className="vs-topic-name">{tag.name}</span>
                <span className="vs-topic-count">{tag.story_count || 0} stories</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="vs-about-section">
        <div className="vs-container">
          <div className="vs-about-content">
            <h2 className="vs-about-title">Why Vital Signs?</h2>
            <p className="vs-about-text">
              Health experiences shape who we are, yet too often we face them in isolation. 
              Vital Signs creates a space where sharing your story can help someone else feel 
              less alone, and reading others' stories can bring comfort and understanding.
            </p>
            <button className="vs-btn-outline" onClick={() => navigate('/about')}>
              Learn More About Us
            </button>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="vs-cta-section">
        <div className="vs-container">
          <div className="vs-cta-content">
            <h2 className="vs-cta-title">Everyone has a health story.</h2>
            <p className="vs-cta-subtitle">What's yours?</p>
            <button className="vs-btn-primary vs-btn-large" onClick={handleShareStory}>
              <PenLine size={24} />
              Share Your Story
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default VitalSignsHomePage;
