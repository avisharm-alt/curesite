import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import type { Story } from '../data/mockData.ts';
import TagPill from './TagPill.tsx';

interface StoryCardProps {
  story: Story;
  index?: number;
}

const StoryCard: React.FC<StoryCardProps> = ({ story, index = 0 }) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <motion.article
      className="story-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      data-testid={`story-card-${story.id}`}
    >
      <Link to={`/stories/${story.id}`} className="story-card-link">
        {story.hasContentWarning && (
          <div className="story-card-warning">
            <AlertTriangle size={14} />
            <span>Content Warning</span>
          </div>
        )}

        <div className="story-card-tags">
          {story.tags.slice(0, 2).map((tag) => (
            <TagPill key={tag} tag={tag} size="sm" />
          ))}
        </div>

        <h3 className="story-card-title">{story.title}</h3>
        <p className="story-card-preview">{story.preview}</p>

        <div className="story-card-meta">
          <span className="story-card-author">
            {story.isAnonymous ? 'Anonymous' : story.authorName}
          </span>
          <span className="story-card-separator">&middot;</span>
          <span className="story-card-date">{formatDate(story.publishedAt)}</span>
        </div>
      </Link>

      <style>{`
        .story-card {
          background: var(--vs-white);
          border: 1px solid var(--vs-border);
          border-radius: var(--vs-radius-lg);
          transition: all var(--vs-transition-base);
          position: relative;
        }

        .story-card:hover {
          border-color: var(--vs-border-hover);
          transform: translateY(-2px);
          box-shadow: var(--vs-shadow-lg);
        }

        .story-card-link {
          display: block;
          padding: var(--vs-space-6);
          text-decoration: none;
          color: inherit;
        }

        .story-card-warning {
          display: inline-flex;
          align-items: center;
          gap: var(--vs-space-1);
          padding: var(--vs-space-1) var(--vs-space-2);
          background: rgba(255, 90, 95, 0.1);
          color: var(--vs-coral);
          font-size: 0.75rem;
          font-weight: 500;
          border-radius: var(--vs-radius-sm);
          margin-bottom: var(--vs-space-3);
        }

        .story-card-tags {
          display: flex;
          gap: var(--vs-space-2);
          flex-wrap: wrap;
          margin-bottom: var(--vs-space-3);
        }

        .story-card-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--vs-text-primary);
          margin-bottom: var(--vs-space-3);
          line-height: 1.3;
        }

        .story-card-preview {
          font-size: 0.9375rem;
          color: var(--vs-text-secondary);
          line-height: 1.6;
          margin-bottom: var(--vs-space-4);
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .story-card-meta {
          display: flex;
          align-items: center;
          gap: var(--vs-space-2);
          font-size: 0.8125rem;
          color: var(--vs-text-tertiary);
        }

        .story-card-author {
          font-weight: 500;
        }

        .story-card-separator {
          opacity: 0.5;
        }
      `}</style>
    </motion.article>
  );
};

export default StoryCard;
