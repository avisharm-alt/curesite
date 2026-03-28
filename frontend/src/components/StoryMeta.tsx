import React from 'react';
import { Calendar, User, Tag as TagIcon } from 'lucide-react';
import TagPill from './TagPill.tsx';

interface StoryMetaProps {
  author: string | null;
  isAnonymous: boolean;
  date: string;
  tags: string[];
  university?: string;
}

const StoryMeta: React.FC<StoryMetaProps> = ({ 
  author, 
  isAnonymous, 
  date, 
  tags,
  university 
}) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <>
      <div className="story-meta">
        <div className="story-meta-row">
          <div className="story-meta-item">
            <User size={16} />
            <span>{isAnonymous ? 'Anonymous' : author}</span>
            {university && <span className="story-meta-university">at {university}</span>}
          </div>
          <div className="story-meta-item">
            <Calendar size={16} />
            <span>{formatDate(date)}</span>
          </div>
        </div>
        <div className="story-meta-tags">
          {tags.map((tag) => (
            <TagPill key={tag} tag={tag} size="md" />
          ))}
        </div>
      </div>

      <style>{`
        .story-meta {
          padding-bottom: var(--vs-space-8);
          margin-bottom: var(--vs-space-8);
          border-bottom: 1px solid var(--vs-border);
        }

        .story-meta-row {
          display: flex;
          flex-wrap: wrap;
          gap: var(--vs-space-6);
          margin-bottom: var(--vs-space-4);
        }

        .story-meta-item {
          display: flex;
          align-items: center;
          gap: var(--vs-space-2);
          font-size: 0.9375rem;
          color: var(--vs-text-secondary);
        }

        .story-meta-item svg {
          color: var(--vs-text-tertiary);
        }

        .story-meta-university {
          color: var(--vs-text-tertiary);
        }

        .story-meta-tags {
          display: flex;
          flex-wrap: wrap;
          gap: var(--vs-space-2);
        }
      `}</style>
    </>
  );
};

export default StoryMeta;
