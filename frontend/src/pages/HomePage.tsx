import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import StoryCard from '../components/StoryCard.tsx';
import TagPill from '../components/TagPill.tsx';
import CTASection from '../components/CTASection.tsx';
import SectionHeader from '../components/SectionHeader.tsx';
import { FEATURED_STORIES, HEALTH_TAGS } from '../data/mockData.ts';

const HomePage: React.FC = () => {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <motion.div
            className="hero-content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <h1 className="hero-title">
              Real stories.<br />
              Real health.<br />
              Real people.
            </h1>
            <p className="hero-subtitle">
              A platform for authentic health storytelling. Share your experience, 
              read others' stories, and connect with a community that understands.
            </p>
            <div className="hero-actions">
              <Link to="/submit" className="btn btn-primary btn-lg">
                Share Your Story
                <ArrowRight size={18} />
              </Link>
              <Link to="/stories" className="btn btn-secondary btn-lg">
                Read Stories
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Stories Section */}
      <section className="section featured-section">
        <div className="container">
          <div className="featured-header">
            <SectionHeader
              title="Featured Stories"
              subtitle="Selected stories from our community"
            />
            <Link to="/stories" className="btn btn-ghost">
              View all
              <ArrowRight size={16} />
            </Link>
          </div>
          <div className="stories-grid">
            {FEATURED_STORIES.map((story, index) => (
              <StoryCard key={story.id} story={story} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Topics Section */}
      <section className="section topics-section">
        <div className="container">
          <SectionHeader
            title="Explore by Topic"
            subtitle="Find stories that resonate with your experience"
            align="center"
          />
          <motion.div
            className="topics-grid"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {HEALTH_TAGS.map((tag) => (
              <Link key={tag.id} to={`/stories?tag=${encodeURIComponent(tag.name)}`}>
                <TagPill tag={tag.name} count={tag.count} size="lg" />
              </Link>
            ))}
          </motion.div>
        </div>
      </section>

      {/* About Preview Section */}
      <section className="section about-preview-section">
        <div className="container">
          <motion.div
            className="about-preview"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="about-preview-title">Why Vital Signs?</h2>
            <p className="about-preview-text">
              Vital Signs is a place for people to share health experiences with honesty, 
              empathy, and care. We believe that storytelling has the power to reduce stigma, 
              build understanding, and help others feel less alone.
            </p>
            <Link to="/about" className="btn btn-ghost">
              Learn more about us
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <CTASection
        title="Everyone has a health story."
        subtitle="What's yours?"
        buttonText="Share Your Story"
        buttonLink="/submit"
      />

      <style>{`
        .home-page {
          min-height: 100vh;
        }

        /* Hero */
        .hero {
          padding: var(--vs-space-24) 0 var(--vs-space-20);
          background: var(--vs-white);
        }

        .hero-content {
          max-width: 720px;
        }

        .hero-title {
          font-size: 4rem;
          font-weight: 700;
          line-height: 1.05;
          letter-spacing: -0.03em;
          color: var(--vs-text-primary);
          margin-bottom: var(--vs-space-6);
        }

        .hero-subtitle {
          font-size: 1.25rem;
          line-height: 1.7;
          color: var(--vs-text-secondary);
          margin-bottom: var(--vs-space-8);
          max-width: 560px;
        }

        .hero-actions {
          display: flex;
          gap: var(--vs-space-4);
          flex-wrap: wrap;
        }

        .hero-actions .btn {
          display: inline-flex;
          align-items: center;
          gap: var(--vs-space-2);
        }

        /* Featured */
        .featured-section {
          background: var(--vs-bg-subtle);
          border-top: 1px solid var(--vs-border);
          border-bottom: 1px solid var(--vs-border);
        }

        .featured-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .featured-header .btn-ghost {
          display: flex;
          align-items: center;
          gap: var(--vs-space-1);
        }

        .stories-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--vs-space-6);
        }

        /* Topics */
        .topics-section {
          background: var(--vs-white);
        }

        .topics-grid {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: var(--vs-space-3);
        }

        .topics-grid a {
          text-decoration: none;
        }

        /* About Preview */
        .about-preview-section {
          background: var(--vs-bg-subtle);
          border-top: 1px solid var(--vs-border);
        }

        .about-preview {
          max-width: 640px;
          margin: 0 auto;
          text-align: center;
        }

        .about-preview-title {
          font-size: 2rem;
          font-weight: 600;
          margin-bottom: var(--vs-space-4);
        }

        .about-preview-text {
          font-size: 1.125rem;
          line-height: 1.8;
          color: var(--vs-text-secondary);
          margin-bottom: var(--vs-space-6);
        }

        .about-preview .btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: var(--vs-space-1);
        }

        @media (max-width: 1024px) {
          .stories-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .hero {
            padding: var(--vs-space-16) 0 var(--vs-space-12);
          }

          .hero-title {
            font-size: 2.75rem;
          }

          .hero-subtitle {
            font-size: 1.125rem;
          }

          .stories-grid {
            grid-template-columns: 1fr;
          }

          .featured-header {
            flex-direction: column;
            gap: var(--vs-space-4);
          }
        }
      `}</style>
    </div>
  );
};

export default HomePage;
