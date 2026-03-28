import React, { useState, useMemo } from 'react';
import StoryCard from '../components/StoryCard.tsx';
import SectionHeader from '../components/SectionHeader.tsx';
import FilterBar from '../components/FilterBar.tsx';
import SearchInput from '../components/SearchInput.tsx';
import SortDropdown from '../components/SortDropdown.tsx';
import { ALL_STORIES, HEALTH_TAGS, UNIVERSITIES } from '../data/mockData.ts';

const StoriesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [authorFilter, setAuthorFilter] = useState<'all' | 'anonymous' | 'identified'>('all');
  const [selectedUniversity, setSelectedUniversity] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('recent');

  const sortOptions = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'resonated', label: 'Most Resonated' },
  ];

  const filteredStories = useMemo(() => {
    let stories = [...ALL_STORIES];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      stories = stories.filter(
        (s) =>
          s.title.toLowerCase().includes(query) ||
          s.preview.toLowerCase().includes(query)
      );
    }

    // Tag filter
    if (selectedTag) {
      stories = stories.filter((s) => s.tags.includes(selectedTag));
    }

    // Author filter
    if (authorFilter === 'anonymous') {
      stories = stories.filter((s) => s.isAnonymous);
    } else if (authorFilter === 'identified') {
      stories = stories.filter((s) => !s.isAnonymous);
    }

    // University filter
    if (selectedUniversity) {
      stories = stories.filter((s) => s.university === selectedUniversity);
    }

    // Sort
    if (sortBy === 'resonated') {
      stories.sort((a, b) => b.resonanceCount - a.resonanceCount);
    } else {
      stories.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    }

    return stories;
  }, [searchQuery, selectedTag, authorFilter, selectedUniversity, sortBy]);

  return (
    <div className="stories-page">
      <section className="stories-header">
        <div className="container">
          <SectionHeader
            title="Stories"
            subtitle="Real health experiences shared by our community. Each story helps someone feel less alone."
          />
        </div>
      </section>

      <section className="stories-content">
        <div className="container">
          <div className="stories-controls">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search stories..."
            />
            <SortDropdown
              value={sortBy}
              onChange={setSortBy}
              options={sortOptions}
            />
          </div>

          <FilterBar
            tags={HEALTH_TAGS}
            selectedTag={selectedTag}
            onTagSelect={setSelectedTag}
            authorFilter={authorFilter}
            onAuthorFilterChange={setAuthorFilter}
            universities={UNIVERSITIES}
            selectedUniversity={selectedUniversity}
            onUniversityChange={setSelectedUniversity}
          />

          <div className="stories-results-info">
            <span>{filteredStories.length} {filteredStories.length === 1 ? 'story' : 'stories'} found</span>
          </div>

          {filteredStories.length > 0 ? (
            <div className="stories-grid">
              {filteredStories.map((story, index) => (
                <StoryCard key={story.id} story={story} index={index} />
              ))}
            </div>
          ) : (
            <div className="stories-empty">
              <h3>No stories found</h3>
              <p>Try adjusting your filters or search query.</p>
            </div>
          )}
        </div>
      </section>

      <style>{`
        .stories-page {
          min-height: 100vh;
          background: var(--vs-bg-subtle);
        }

        .stories-header {
          background: var(--vs-white);
          padding: var(--vs-space-12) 0;
          border-bottom: 1px solid var(--vs-border);
        }

        .stories-header .section-header {
          margin-bottom: 0;
        }

        .stories-content {
          padding: var(--vs-space-10) 0 var(--vs-space-20);
        }

        .stories-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: var(--vs-space-4);
          margin-bottom: var(--vs-space-6);
        }

        .stories-results-info {
          font-size: 0.875rem;
          color: var(--vs-text-tertiary);
          margin-bottom: var(--vs-space-6);
        }

        .stories-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--vs-space-6);
        }

        .stories-empty {
          text-align: center;
          padding: var(--vs-space-16) 0;
          color: var(--vs-text-secondary);
        }

        .stories-empty h3 {
          font-size: 1.25rem;
          margin-bottom: var(--vs-space-2);
          color: var(--vs-text-primary);
        }

        @media (max-width: 768px) {
          .stories-controls {
            flex-direction: column;
            align-items: stretch;
          }

          .stories-controls .search-input-wrapper {
            max-width: 100%;
          }

          .stories-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default StoriesPage;
