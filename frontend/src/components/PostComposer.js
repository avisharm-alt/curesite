import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { Image, FileText, Link2, Send, X, Hash } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PostComposer = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [visibility, setVisibility] = useState('public');
  const [posting, setPosting] = useState(false);
  const [showTagInput, setShowTagInput] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!text.trim()) {
      toast.error('Please enter some text');
      return;
    }

    if (text.length > 500) {
      toast.error('Post must be 500 characters or less');
      return;
    }

    setPosting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API}/social/posts`,
        {
          text: text.trim(),
          tags,
          attachments,
          visibility
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Reset form
      setText('');
      setTags([]);
      setAttachments([]);
      setTagInput('');
      setShowTagInput(false);

      // Notify parent
      if (onPostCreated) {
        onPostCreated(response.data);
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error(error.response?.data?.detail || 'Failed to create post');
    } finally {
      setPosting(false);
    }
  };

  const handleAddTag = () => {
    const tag = tagInput.trim().replace(/^#/, '');
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (showTagInput) {
        handleAddTag();
      } else {
        handleSubmit(e);
      }
    }
  };

  const characterCount = text.length;
  const characterLimit = 500;
  const characterWarning = characterCount > 450;

  return (
    <div className="post-composer">
      <div className="composer-header">
        <img
          src={user?.profile_picture || '/default-avatar.png'}
          alt={user?.name}
          className="composer-avatar"
        />
        <div className="composer-info">
          <span className="composer-name">{user?.name}</span>
          <span className="composer-role">{user?.role || 'student'}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <textarea
          className="composer-textarea"
          placeholder="What's on your mind? Share your research, insights, or questions... Use #hashtags to tag topics!"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={handleKeyPress}
          maxLength={500}
          rows={4}
        />

        {/* Tags Display */}
        {tags.length > 0 && (
          <div className="composer-tags">
            {tags.map(tag => (
              <span key={tag} className="tag-badge">
                #{tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="tag-remove"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Tag Input */}
        {showTagInput && (
          <div className="tag-input-row">
            <Hash size={18} />
            <input
              type="text"
              className="tag-input"
              placeholder="Add tag (e.g., neuroscience)"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              autoFocus
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="tag-add-btn"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setShowTagInput(false);
                setTagInput('');
              }}
              className="tag-cancel-btn"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="composer-footer">
          <div className="composer-actions">
            <button
              type="button"
              className="composer-action-btn"
              onClick={() => setShowTagInput(!showTagInput)}
              title="Add tag"
            >
              <Hash size={20} />
            </button>
            
            <select
              className="visibility-select"
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
            >
              <option value="public">Public</option>
              <option value="university">University Only</option>
            </select>
          </div>

          <div className="composer-submit-area">
            <span className={`character-count ${characterWarning ? 'warning' : ''}`}>
              {characterCount}/{characterLimit}
            </span>
            <button
              type="submit"
              className="composer-submit-btn"
              disabled={posting || !text.trim() || characterCount > characterLimit}
            >
              {posting ? (
                <>
                  <div className="spinner-small"></div>
                  Posting...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Post
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PostComposer;
