import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { 
  Heart, MessageCircle, Share2, MoreVertical, 
  Trash2, ExternalLink, Calendar 
} from 'lucide-react';
import CommentThread from './CommentThread';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PostCard = ({ post, onPostDeleted }) => {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isLiked, setIsLiked] = useState(post.is_liked);
  const [likeCount, setLikeCount] = useState(post.metrics.likes);
  const [commentCount, setCommentCount] = useState(post.metrics.comments);
  const [liking, setLiking] = useState(false);

  const handleLike = async () => {
    if (liking) return;
    
    setLiking(true);
    try {
      const token = localStorage.getItem('token');
      
      if (isLiked) {
        await axios.delete(`${API}/social/posts/${post.id}/like`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsLiked(false);
        setLikeCount(likeCount - 1);
      } else {
        await axios.post(`${API}/social/posts/${post.id}/like`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsLiked(true);
        setLikeCount(likeCount + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like');
    } finally {
      setLiking(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/social/posts/${post.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (onPostDeleted) {
        onPostDeleted(post.id);
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  const handleCommentAdded = () => {
    setCommentCount(commentCount + 1);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const canDelete = user && (user.id === post.author_id || user.user_type === 'admin');

  return (
    <article className="post-card">
      {/* Post Header */}
      <div className="post-header">
        <img
          src={post.author_picture || '/default-avatar.png'}
          alt={post.author_name}
          className="post-avatar"
        />
        <div className="post-author-info">
          <div className="post-author-name">
            {post.author_name}
            {post.author_role === 'professor' && (
              <span className="badge-verified">Faculty</span>
            )}
          </div>
          <div className="post-meta">
            <span>{post.author_role}</span>
            {post.author_university && (
              <>
                <span className="meta-separator">•</span>
                <span>{post.author_university}</span>
              </>
            )}
            <span className="meta-separator">•</span>
            <span>{formatDate(post.created_at)}</span>
          </div>
        </div>
        
        {canDelete && (
          <div className="post-menu">
            <button
              className="menu-button"
              onClick={() => setShowMenu(!showMenu)}
            >
              <MoreVertical size={20} />
            </button>
            {showMenu && (
              <div className="menu-dropdown">
                <button onClick={handleDelete} className="menu-item danger">
                  <Trash2 size={16} />
                  Delete Post
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Post Content */}
      <div className="post-content">
        <p className="post-text">{post.text}</p>
        
        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="post-tags">
            {post.tags.map(tag => (
              <span key={tag} className="tag-badge">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Attachments */}
        {post.attachments && post.attachments.length > 0 && (
          <div className="post-attachments">
            {post.attachments.map((attachment, idx) => (
              <a
                key={idx}
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="attachment-link"
              >
                <ExternalLink size={16} />
                {attachment.title || attachment.type}
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Post Actions */}
      <div className="post-actions">
        <button
          className={`action-btn ${isLiked ? 'active liked' : ''}`}
          onClick={handleLike}
          disabled={liking}
        >
          <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
          <span>{likeCount}</span>
        </button>

        <button
          className={`action-btn ${showComments ? 'active' : ''}`}
          onClick={() => setShowComments(!showComments)}
        >
          <MessageCircle size={20} />
          <span>{commentCount}</span>
        </button>

        <button className="action-btn">
          <Share2 size={20} />
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <CommentThread
          postId={post.id}
          onCommentAdded={handleCommentAdded}
        />
      )}
    </article>
  );
};

export default PostCard;
