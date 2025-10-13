import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  Globe, Users, School, Hash, TrendingUp, 
  Heart, MessageCircle, Send, MoreVertical, X 
} from 'lucide-react';
import PostComposer from '../components/PostComposer';
import PostCard from '../components/PostCard';
import CircleList from '../components/CircleList';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SocialPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('global');
  const [posts, setPosts] = useState([]);
  const [circles, setCircles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState(null);
  const [selectedCircle, setSelectedCircle] = useState(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      toast.error('Please log in to access CURE Social');
      navigate('/');
    }
  }, [user, navigate]);

  // Load circles
  useEffect(() => {
    const loadCircles = async () => {
      try {
        const response = await axios.get(`${API}/social/circles`);
        setCircles(response.data);
      } catch (error) {
        console.error('Error loading circles:', error);
      }
    };
    loadCircles();
  }, []);

  // Load feed
  useEffect(() => {
    loadFeed(true);
  }, [activeTab, selectedCircle]);

  const loadFeed = async (reset = false) => {
    if (loading) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      console.log('Loading feed with token:', token ? 'Present' : 'Missing');
      console.log('Mode:', activeTab);
      
      const params = {
        mode: activeTab,
        limit: 20
      };
      
      if (selectedCircle) {
        params.circle_id = selectedCircle.id;
      }
      
      if (!reset && cursor) {
        params.cursor = cursor;
      }

      const response = await axios.get(`${API}/social/feed`, {
        params,
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (reset) {
        setPosts(response.data.posts);
      } else {
        setPosts([...posts, ...response.data.posts]);
      }
      
      setCursor(response.data.cursor);
      setHasMore(response.data.has_more);
    } catch (error) {
      console.error('Error loading feed:', error);
      console.error('Error response:', error.response?.data);
      if (error.response?.status === 401) {
        toast.error('Please log in to view this feed');
      } else {
        toast.error('Failed to load feed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
    toast.success('Post created successfully!');
  };

  const handlePostDeleted = (postId) => {
    setPosts(posts.filter(p => p.id !== postId));
    toast.success('Post deleted');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedCircle(null);
    setPosts([]);
    setCursor(null);
  };

  const handleCircleSelect = (circle) => {
    setActiveTab('circle');
    setSelectedCircle(circle);
    setPosts([]);
    setCursor(null);
  };

  if (!user) return null;

  return (
    <div className="social-page">
      <div className="social-container">
        {/* Left Sidebar - Navigation */}
        <aside className="social-sidebar-left">
          <div className="social-nav">
            <h2 className="social-nav-title">Feeds</h2>
            
            <button
              className={`social-nav-item ${activeTab === 'global' ? 'active' : ''}`}
              onClick={() => handleTabChange('global')}
            >
              <Globe size={20} />
              <span>Global</span>
            </button>
            
            <button
              className={`social-nav-item ${activeTab === 'following' ? 'active' : ''}`}
              onClick={() => handleTabChange('following')}
            >
              <Users size={20} />
              <span>Following</span>
            </button>
            
            <button
              className={`social-nav-item ${activeTab === 'university' ? 'active' : ''}`}
              onClick={() => handleTabChange('university')}
            >
              <School size={20} />
              <span>My University</span>
            </button>
          </div>

          {/* Circles Section */}
          <div className="social-nav" style={{ marginTop: '2rem' }}>
            <h2 className="social-nav-title">Circles</h2>
            <div className="circles-list">
              {circles.slice(0, 10).map(circle => (
                <button
                  key={circle.id}
                  className={`social-nav-item ${selectedCircle?.id === circle.id ? 'active' : ''}`}
                  onClick={() => handleCircleSelect(circle)}
                >
                  <Hash size={18} />
                  <span className="circle-name">{circle.name}</span>
                  <span className="circle-count">{circle.member_count}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Feed */}
        <main className="social-main">
          {/* Header */}
          <div className="social-header">
            <h1 className="social-title">
              {selectedCircle ? (
                <>
                  <Hash size={24} />
                  {selectedCircle.name}
                </>
              ) : (
                <>
                  {activeTab === 'global' && (
                    <>
                      <Globe size={28} />
                      Global Feed
                    </>
                  )}
                  {activeTab === 'following' && (
                    <>
                      <Users size={28} />
                      Following
                    </>
                  )}
                  {activeTab === 'university' && (
                    <>
                      <School size={28} />
                      {user.university || 'University'} Network
                    </>
                  )}
                </>
              )}
            </h1>
            {selectedCircle && (
              <p className="circle-description">{selectedCircle.description}</p>
            )}
            {activeTab === 'university' && (
              <p className="circle-description">
                Connect with researchers and students at {user.university}. Follow your peers to see their latest work!
              </p>
            )}
          </div>

          {/* Post Composer */}
          <PostComposer onPostCreated={handlePostCreated} />

          {/* Feed */}
          <div className="social-feed">
            {loading && posts.length === 0 ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading posts...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="empty-state">
                <TrendingUp size={48} />
                <h3>No posts yet</h3>
                <p>
                  {activeTab === 'following' 
                    ? 'Follow some users to see their posts here'
                    : 'Be the first to post!'}
                </p>
              </div>
            ) : (
              <>
                {posts.map(post => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onPostDeleted={handlePostDeleted}
                  />
                ))}
                
                {hasMore && (
                  <button
                    className="load-more-btn"
                    onClick={() => loadFeed(false)}
                    disabled={loading}
                  >
                    {loading ? 'Loading...' : 'Load More'}
                  </button>
                )}
              </>
            )}
          </div>
        </main>

        {/* Right Sidebar - Trending & Suggestions */}
        <aside className="social-sidebar-right">
          <div className="sidebar-card">
            <h3 className="sidebar-title">About CURE Social</h3>
            <p className="sidebar-text">
              Where scientists connect. Built in Canada. Academic-first. Politics-free.
            </p>
          </div>

          <div className="sidebar-card">
            <h3 className="sidebar-title">Your Circles</h3>
            <CircleList circles={circles} compact={true} />
          </div>

          <div className="sidebar-card">
            <h3 className="sidebar-title">Trending Tags</h3>
            <div className="trending-tags">
              {['neuroscience', 'MRI', 'machinelearning', 'cancer', 'CRISPR', 'immunology'].map(tag => (
                <button key={tag} className="tag-badge">
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default SocialPage;
