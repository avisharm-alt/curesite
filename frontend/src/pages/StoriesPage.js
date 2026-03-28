import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BookOpen, Filter, MessageCircleHeart, AlertTriangle, ChevronDown } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const StoriesPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, token } = useAuth();
  
  const [stories, setStories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  
  // Filters
  const [selectedTag, setSelectedTag] = useState(searchParams.get('tag') || '');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchTags();
  }, []);

  useEffect(() => {
    fetchStories(1);
  }, [selectedTag, sortBy]);

  const fetchTags = async () => {
    try {
      const res = await fetch(`${API}/tags`);
      if (res.ok) {
        const data = await res.json();
        setTags(data);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const fetchStories = async (pageNum) => {
    setLoading(true);
    try {
      let url = `${API}/stories?page=${pageNum}&limit=12&sort=${sortBy}`;
      if (selectedTag) {
        url += `&tag=${encodeURIComponent(selectedTag)}`;
      }
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (pageNum === 1) {
          setStories(data.stories);
        } else {
          setStories(prev => [...prev, ...data.stories]);
        }
        setPage(pageNum);
        setHasMore(data.has_more);
        setTotal(data.total);
      }
    } catch (error) {
      console.error('Error fetching stories:', error);
      toast.error('Failed to load stories');
    } finally {
      setLoading(false);
    }
  };

  const handleTagSelect = (tag) => {
    setSelectedTag(tag);
    if (tag) {
      setSearchParams({ tag });
    } else {
      setSearchParams({});
    }
  };

  const handleResonate = async (storyId, e) => {
    e.stopPropagation();
    
    if (!user) {
      toast.error('Please sign in to resonate with stories');
      return;
    }

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
        // Update local state
        setStories(prev => prev.map(story => 
          story.id === storyId 
            ? { ...story, resonance_count: data.resonance_count, user_resonated: data.user_resonated }
            : story
        ));
        toast.success(data.user_resonated ? 'This resonated with you' : 'Resonance removed');
      }
    } catch (error) {
      console.error('Error toggling resonance:', error);
      toast.error('Failed to update');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const truncateText = (text, maxLength = 200) => {
    if (!text) return '';
    const plainText = text.replace(/<[^>]*>/g, '');
    if (plainText.length <= maxLength) return plainText;
    return plainText.substring(0, maxLength).trim() + '...';
  };

  return (
    <div className="vs-page vs-stories-page">
      {/* Header */}
      <section className="vs-page-header">
        <div className="vs-container">
          <div className="vs-page-header-content">
            <div className="vs-page-icon">
              <BookOpen size={32} />
            </div>
            <div>
              <h1 className="vs-page-title">Stories</h1>
              <p className="vs-page-subtitle">
                Real health experiences shared by our community
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="vs-filters-section">
        <div className="vs-container">
          <div className="vs-filters-bar">
            <div className="vs-tag-filters">
              <button 
                className={`vs-tag-btn ${!selectedTag ? 'active' : ''}`}
                onClick={() => handleTagSelect('')}
              >
                All Topics
              </button>
              {tags.slice(0, 5).map(tag => (
                <button
                  key={tag.id}
                  className={`vs-tag-btn ${selectedTag === tag.name ? 'active' : ''}`}
                  onClick={() => handleTagSelect(tag.name)}
                >
                  {tag.name}
                </button>
              ))}
              <button 
                className="vs-tag-btn vs-more-btn"
                onClick={() => setShowFilters(!showFilters)}
              >
                More <ChevronDown size={16} />
              </button>
            </div>
            
            <div className="vs-sort-filter">
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="vs-sort-select"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="most_resonated">Most Resonated</option>
              </select>
            </div>
          </div>

          {showFilters && (
            <div className="vs-expanded-filters">
              {tags.map(tag => (
                <button
                  key={tag.id}
                  className={`vs-tag-btn ${selectedTag === tag.name ? 'active' : ''}`}
                  onClick={() => handleTagSelect(tag.name)}
                >
                  {tag.name} ({tag.story_count || 0})
                </button>
              ))}
            </div>
          )}

          <div className="vs-results-info">
            <span>{total} {total === 1 ? 'story' : 'stories'} found</span>
            {selectedTag && (
              <span className="vs-active-filter">
                in <strong>{selectedTag}</strong>
                <button onClick={() => handleTagSelect('')} className="vs-clear-filter">×</button>
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Stories Grid */}
      <section className="vs-stories-section">
        <div className="vs-container">
          {loading && page === 1 ? (
            <div className="vs-loading-grid">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="vs-story-card-skeleton"></div>
              ))}
            </div>
          ) : stories.length > 0 ? (
            <>
              <div className="vs-stories-grid">
                {stories.map(story => (
                  <article 
                    key={story.id}
                    className="vs-story-card"
                    onClick={() => navigate(`/stories/${story.id}`)}
                  >
                    {story.has_content_warning && (
                      <div className="vs-content-warning-badge">
                        <AlertTriangle size={12} /> Content Warning
                      </div>
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
                    <button 
                      className={`vs-resonate-btn ${story.user_resonated ? 'resonated' : ''}`}
                      onClick={(e) => handleResonate(story.id, e)}
                    >
                      <MessageCircleHeart size={18} />
                      <span>{story.resonance_count || 0}</span>
                    </button>
                  </article>
                ))}
              </div>

              {hasMore && (
                <div className="vs-load-more">
                  <button 
                    className="vs-btn-outline"
                    onClick={() => fetchStories(page + 1)}
                    disabled={loading}
                  >
                    {loading ? 'Loading...' : 'Load More Stories'}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="vs-empty-state">
              <BookOpen size={64} className="vs-empty-icon" />
              <h3>No stories yet</h3>
              <p>Be the first to share a story about {selectedTag || 'your health experience'}!</p>
              <button 
                className="vs-btn-primary"
                onClick={() => navigate('/submit')}
              >
                Share Your Story
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default StoriesPage;
