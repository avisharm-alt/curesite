import React from 'react';
import TagPill from './TagPill.tsx';
import type { Tag } from '../data/mockData.ts';

interface FilterBarProps {
  tags: Tag[];
  selectedTag: string | null;
  onTagSelect: (tag: string | null) => void;
  authorFilter: 'all' | 'anonymous' | 'identified';
  onAuthorFilterChange: (filter: 'all' | 'anonymous' | 'identified') => void;
  universities?: string[];
  selectedUniversity: string | null;
  onUniversityChange: (university: string | null) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  tags,
  selectedTag,
  onTagSelect,
  authorFilter,
  onAuthorFilterChange,
  universities,
  selectedUniversity,
  onUniversityChange,
}) => {
  return (
    <>
      <div className="filter-bar">
        <div className="filter-group">
          <span className="filter-label">Topics</span>
          <div className="filter-tags">
            <TagPill
              tag="All"
              active={selectedTag === null}
              onClick={() => onTagSelect(null)}
            />
            {tags.map((tag) => (
              <TagPill
                key={tag.id}
                tag={tag.name}
                count={tag.count}
                active={selectedTag === tag.name}
                onClick={() => onTagSelect(tag.name)}
              />
            ))}
          </div>
        </div>

        <div className="filter-row">
          <div className="filter-group filter-group-inline">
            <span className="filter-label">Author</span>
            <select
              className="filter-select"
              value={authorFilter}
              onChange={(e) => onAuthorFilterChange(e.target.value as any)}
            >
              <option value="all">All Authors</option>
              <option value="anonymous">Anonymous Only</option>
              <option value="identified">Named Authors</option>
            </select>
          </div>

          {universities && (
            <div className="filter-group filter-group-inline">
              <span className="filter-label">University</span>
              <select
                className="filter-select"
                value={selectedUniversity || ''}
                onChange={(e) => onUniversityChange(e.target.value || null)}
              >
                <option value="">All Universities</option>
                {universities.map((uni) => (
                  <option key={uni} value={uni}>{uni}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .filter-bar {
          padding: var(--vs-space-6);
          background: var(--vs-white);
          border: 1px solid var(--vs-border);
          border-radius: var(--vs-radius-lg);
          margin-bottom: var(--vs-space-8);
        }

        .filter-group {
          margin-bottom: var(--vs-space-4);
        }

        .filter-group:last-child {
          margin-bottom: 0;
        }

        .filter-label {
          display: block;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--vs-text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: var(--vs-space-2);
        }

        .filter-tags {
          display: flex;
          flex-wrap: wrap;
          gap: var(--vs-space-2);
        }

        .filter-row {
          display: flex;
          gap: var(--vs-space-6);
          flex-wrap: wrap;
          padding-top: var(--vs-space-4);
          border-top: 1px solid var(--vs-border);
        }

        .filter-group-inline {
          display: flex;
          align-items: center;
          gap: var(--vs-space-3);
          margin-bottom: 0;
        }

        .filter-group-inline .filter-label {
          margin-bottom: 0;
        }

        .filter-select {
          padding: var(--vs-space-2) var(--vs-space-3);
          font-family: var(--vs-font);
          font-size: 0.875rem;
          color: var(--vs-text-primary);
          background: var(--vs-white);
          border: 1px solid var(--vs-border);
          border-radius: var(--vs-radius-md);
          cursor: pointer;
        }

        .filter-select:focus {
          outline: none;
          border-color: var(--vs-text-tertiary);
        }
      `}</style>
    </>
  );
};

export default FilterBar;
