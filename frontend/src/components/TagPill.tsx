import React from 'react';

interface TagPillProps {
  tag: string;
  size?: 'sm' | 'md' | 'lg';
  active?: boolean;
  onClick?: () => void;
  count?: number;
}

const TagPill: React.FC<TagPillProps> = ({ 
  tag, 
  size = 'md', 
  active = false, 
  onClick,
  count 
}) => {
  const Component = onClick ? 'button' : 'span';

  return (
    <>
      <Component
        className={`tag-pill tag-pill-${size} ${active ? 'active' : ''} ${onClick ? 'clickable' : ''}`}
        onClick={onClick}
        type={onClick ? 'button' : undefined}
      >
        {tag}
        {count !== undefined && <span className="tag-pill-count">{count}</span>}
      </Component>

      <style>{`
        .tag-pill {
          display: inline-flex;
          align-items: center;
          gap: var(--vs-space-2);
          font-family: var(--vs-font);
          font-weight: 500;
          color: var(--vs-text-secondary);
          background: var(--vs-bg-subtle);
          border: 1px solid var(--vs-border);
          border-radius: var(--vs-radius-full);
          transition: all var(--vs-transition-fast);
          white-space: nowrap;
        }

        .tag-pill-sm {
          padding: 2px var(--vs-space-2);
          font-size: 0.75rem;
        }

        .tag-pill-md {
          padding: var(--vs-space-1) var(--vs-space-3);
          font-size: 0.8125rem;
        }

        .tag-pill-lg {
          padding: var(--vs-space-2) var(--vs-space-4);
          font-size: 0.875rem;
        }

        .tag-pill.clickable {
          cursor: pointer;
        }

        .tag-pill.clickable:hover {
          background: var(--vs-bg-hover);
          border-color: var(--vs-border-hover);
          color: var(--vs-text-primary);
        }

        .tag-pill.active {
          background: var(--vs-black);
          color: var(--vs-white);
          border-color: var(--vs-black);
        }

        .tag-pill-count {
          font-size: 0.75em;
          opacity: 0.6;
        }
      `}</style>
    </>
  );
};

export default TagPill;
