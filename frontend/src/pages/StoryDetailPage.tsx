import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Share2 } from 'lucide-react';
import StoryMeta from '../components/StoryMeta.tsx';
import ResonanceButton from '../components/ResonanceButton.tsx';
import ContentWarningBanner from '../components/ContentWarningBanner.tsx';
import StoryCard from '../components/StoryCard.tsx';
import SectionHeader from '../components/SectionHeader.tsx';
import { ALL_STORIES } from '../data/mockData.ts';

const StoryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const story = ALL_STORIES.find((s) => s.id === id);

  if (!story) {
    return (
      <div className="story-not-found">
        <div className="container container-sm">
          <h1>Story not found</h1>
          <p>The story you're looking for doesn't exist or has been removed.</p>
          <Link to="/stories" className="btn btn-primary">
            Browse Stories
          </Link>
        </div>
      </div>
    );
  }

  const relatedStories = ALL_STORIES
    .filter((s) => s.id !== story.id && s.tags.some((t) => story.tags.includes(t)))
    .slice(0, 2);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: story.title,
          text: story.preview,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="story-detail-page">
      <ContentWarningBanner 
        visible={story.hasContentWarning}
        onProceed={() => {}}
      />

      <nav className="story-nav">
        <div className="container container-sm">
          <Link to="/stories" className="story-nav-back">
            <ArrowLeft size={18} />
            <span>Back to Stories</span>
          </Link>
        </div>
      </nav>

      <article className="story-article">
        <div className="container container-sm">
          <motion.header
            className="story-header"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="story-title">{story.title}</h1>
          </motion.header>

          <StoryMeta
            author={story.authorName}
            isAnonymous={story.isAnonymous}
            date={story.publishedAt}
            tags={story.tags}
            university={story.university}
          />

          <motion.div
            className="story-body"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {story.body.split('\n\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </motion.div>

          <footer className="story-footer">
            <div className="story-actions">
              <ResonanceButton initialCount={story.resonanceCount} size="lg" />
              <button className="btn btn-secondary" onClick={handleShare}>
                <Share2 size={18} />
                Share
              </button>
            </div>

            <div className="story-cta">
              <p>Has this story inspired you to share your own experience?</p>
              <Link to="/submit" className="btn btn-primary">
                Share Your Story
              </Link>
            </div>
          </footer>
        </div>
      </article>

      {relatedStories.length > 0 && (
        <section className="related-stories">
          <div className="container">
            <SectionHeader
              title="Related Stories"
              subtitle="More stories you might connect with"
            />
            <div className="related-stories-grid">
              {relatedStories.map((s, index) => (
                <StoryCard key={s.id} story={s} index={index} />
              ))}
            </div>
          </div>
        </section>
      )}

      <style>{`
        .story-detail-page {
          min-height: 100vh;
          background: var(--vs-white);
        }

        .story-not-found {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .story-not-found h1 {
          margin-bottom: var(--vs-space-4);
        }

        .story-not-found p {
          margin-bottom: var(--vs-space-6);
        }

        .story-nav {
          padding: var(--vs-space-4) 0;
          border-bottom: 1px solid var(--vs-border);
        }

        .story-nav-back {
          display: inline-flex;
          align-items: center;
          gap: var(--vs-space-2);
          font-size: 0.9375rem;
          font-weight: 500;
          color: var(--vs-text-secondary);
          text-decoration: none;
          transition: color var(--vs-transition-fast);
        }

        .story-nav-back:hover {
          color: var(--vs-text-primary);
        }

        .story-article {
          padding: var(--vs-space-12) 0 var(--vs-space-16);
        }

        .story-header {
          margin-bottom: var(--vs-space-8);
        }

        .story-title {
          font-size: 2.75rem;
          font-weight: 700;
          line-height: 1.15;
          letter-spacing: -0.02em;
          color: var(--vs-text-primary);
        }

        .story-body {
          font-size: 1.125rem;
          line-height: 1.9;
          color: var(--vs-text-primary);
        }

        .story-body p {
          margin-bottom: var(--vs-space-6);
          color: var(--vs-text-primary);
        }

        .story-body p:last-child {
          margin-bottom: 0;
        }

        .story-footer {
          margin-top: var(--vs-space-12);
          padding-top: var(--vs-space-8);
          border-top: 1px solid var(--vs-border);
        }

        .story-actions {
          display: flex;
          gap: var(--vs-space-4);
          flex-wrap: wrap;
          margin-bottom: var(--vs-space-10);
        }

        .story-actions .btn-secondary {
          display: flex;
          align-items: center;
          gap: var(--vs-space-2);
        }

        .story-cta {
          background: var(--vs-bg-subtle);
          border: 1px solid var(--vs-border);
          border-radius: var(--vs-radius-lg);
          padding: var(--vs-space-8);
          text-align: center;
        }

        .story-cta p {
          font-size: 1rem;
          margin-bottom: var(--vs-space-4);
        }

        .related-stories {
          padding: var(--vs-space-16) 0;
          background: var(--vs-bg-subtle);
          border-top: 1px solid var(--vs-border);
        }

        .related-stories-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--vs-space-6);
        }

        @media (max-width: 768px) {
          .story-title {
            font-size: 2rem;
          }

          .story-body {
            font-size: 1rem;
          }

          .related-stories-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default StoryDetailPage;
