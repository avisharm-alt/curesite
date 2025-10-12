import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { Send, Trash2 } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CommentThread = ({ postId, onCommentAdded }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/social/posts/${postId}/comments`);
      setComments(response.data);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      return;
    }

    setPosting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API}/social/posts/${postId}/comments`,
        { text: newComment.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Add new comment to the list (prepend since they're sorted newest first)
      setComments([response.data, ...comments]);
      setNewComment('');
      
      if (onCommentAdded) {
        onCommentAdded();
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error('Failed to post comment');
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Delete this comment?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/social/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setComments(comments.filter(c => c.id !== commentId));
      toast.success('Comment deleted');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
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

  return (
    <div className="comment-thread">
      {/* Comment Input */}
      <form className="comment-input-form" onSubmit={handleSubmit}>
        <img
          src={user?.profile_picture || '/default-avatar.png'}
          alt={user?.name}
          className="comment-avatar"
        />
        <div className="comment-input-wrapper">
          <input
            type="text"
            className="comment-input"
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={posting}
          />
          <button
            type="submit"
            className="comment-submit-btn"
            disabled={posting || !newComment.trim()}
          >
            {posting ? (
              <div className="spinner-small"></div>
            ) : (
              <Send size={16} />
            )}
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="comments-list">
        {loading ? (
          <div className="comment-loading">
            <div className="spinner-small"></div>
            <span>Loading comments...</span>
          </div>
        ) : comments.length === 0 ? (
          <p className="no-comments">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="comment-item">
              <img
                src={comment.author_picture || '/default-avatar.png'}
                alt={comment.author_name}
                className="comment-avatar"
              />
              <div className="comment-content">
                <div className="comment-header">
                  <span className="comment-author">
                    {comment.author_name}
                    {comment.author_role === 'professor' && (
                      <span className="badge-verified-small">Faculty</span>
                    )}
                  </span>
                  <span className="comment-date">{formatDate(comment.created_at)}</span>
                </div>
                <p className="comment-text">{comment.text}</p>
              </div>
              {user && (user.id === comment.author_id || user.user_type === 'admin') && (
                <button
                  className="comment-delete-btn"
                  onClick={() => handleDelete(comment.id)}
                  title="Delete comment"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommentThread;
