import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, Shield, Users, ArrowRight } from 'lucide-react';

const AboutPage: React.FC = () => {
  const values = [
    {
      icon: <Heart size={24} />,
      title: 'Honesty',
      description: 'We value authentic stories shared with courage and vulnerability.',
    },
    {
      icon: <Shield size={24} />,
      title: 'Dignity',
      description: 'Every story is treated with respect, compassion, and care.',
    },
    {
      icon: <Users size={24} />,
      title: 'Community',
      description: 'We build connections through shared experiences and understanding.',
    },
  ];

  return (
    <div className="about-page">
      {/* Hero */}
      <section className="about-hero">
        <div className="container container-md">
          <motion.div
            className="about-hero-content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1>About Vital Signs</h1>
            <p className="about-lead">
              A platform for authentic health storytelling. We believe that sharing 
              experiences has the power to heal, connect, and transform.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section className="about-section">
        <div className="container container-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2>Why We Exist</h2>
            <div className="about-text">
              <p>
                Health experiences shape who we are, yet too often we navigate them 
                in isolation. Whether facing a diagnosis, supporting a loved one, or 
                recovering from a difficult period, the journey can feel lonely.
              </p>
              <p>
                Vital Signs creates a space where people can share their authentic 
                health stories. Not curated success narratives or clinical case studies, 
                but real experiences from real people—messy, uncertain, hopeful, and human.
              </p>
              <p>
                We believe that when someone shares their story, it can help someone 
                else feel less alone. And when someone reads a story that resonates, 
                it creates a moment of connection that transcends distance and circumstance.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="about-mission">
        <div className="container container-md">
          <motion.div
            className="mission-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h3>Our Mission</h3>
            <p>
              To reduce stigma, build empathy, and foster connection through 
              authentic health storytelling. Every story shared is a step toward 
              a world where no one faces their health journey alone.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="about-section">
        <div className="container">
          <motion.h2
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Our Values
          </motion.h2>
          <div className="values-grid">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                className="value-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="value-icon">{value.icon}</div>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety */}
      <section className="about-section about-safety">
        <div className="container container-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2>Safety & Moderation</h2>
            <div className="about-text">
              <p>
                <strong>Anonymity.</strong> You can choose to share your story 
                anonymously. Your identity is always protected—only our moderation 
                team can see author information, and only for review purposes.
              </p>
              <p>
                <strong>Review Process.</strong> Every story is reviewed before 
                publication to ensure a safe, supportive environment. We don't 
                edit for perfection—we simply ensure content aligns with our 
                community guidelines.
              </p>
              <p>
                <strong>Content Warnings.</strong> Stories with potentially 
                distressing content are clearly marked, giving readers the choice 
                to proceed when they're ready.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta">
        <div className="container">
          <motion.div
            className="cta-content"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2>Ready to share your story?</h2>
            <p>Your experience could help someone else feel less alone.</p>
            <Link to="/submit" className="btn btn-primary btn-lg">
              Share Your Story
              <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </section>

      <style>{`
        .about-page {
          min-height: 100vh;
        }

        .about-hero {
          padding: var(--vs-space-20) 0;
          background: var(--vs-white);
          border-bottom: 1px solid var(--vs-border);
        }

        .about-hero-content {
          max-width: 640px;
        }

        .about-hero h1 {
          font-size: 3rem;
          font-weight: 700;
          margin-bottom: var(--vs-space-6);
        }

        .about-lead {
          font-size: 1.25rem;
          line-height: 1.7;
          color: var(--vs-text-secondary);
        }

        .about-section {
          padding: var(--vs-space-16) 0;
        }

        .about-section h2 {
          font-size: 1.75rem;
          margin-bottom: var(--vs-space-6);
        }

        .about-text p {
          font-size: 1.0625rem;
          line-height: 1.8;
          color: var(--vs-text-secondary);
          margin-bottom: var(--vs-space-5);
        }

        .about-text p:last-child {
          margin-bottom: 0;
        }

        .about-text strong {
          color: var(--vs-text-primary);
        }

        .about-mission {
          padding: var(--vs-space-12) 0;
          background: var(--vs-bg-subtle);
          border-top: 1px solid var(--vs-border);
          border-bottom: 1px solid var(--vs-border);
        }

        .mission-card {
          text-align: center;
          max-width: 560px;
          margin: 0 auto;
        }

        .mission-card h3 {
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--vs-coral);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: var(--vs-space-4);
        }

        .mission-card p {
          font-size: 1.375rem;
          line-height: 1.6;
          color: var(--vs-text-primary);
        }

        .values-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--vs-space-8);
          margin-top: var(--vs-space-10);
        }

        .value-card {
          text-align: center;
          padding: var(--vs-space-8);
        }

        .value-icon {
          width: 56px;
          height: 56px;
          background: rgba(255, 90, 95, 0.08);
          color: var(--vs-coral);
          border-radius: var(--vs-radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto var(--vs-space-5);
        }

        .value-card h3 {
          font-size: 1.125rem;
          margin-bottom: var(--vs-space-3);
        }

        .value-card p {
          font-size: 0.9375rem;
          color: var(--vs-text-secondary);
          line-height: 1.6;
        }

        .about-safety {
          background: var(--vs-white);
          border-top: 1px solid var(--vs-border);
        }

        .about-cta {
          padding: var(--vs-space-20) 0;
          background: var(--vs-bg-subtle);
          border-top: 1px solid var(--vs-border);
        }

        .about-cta .cta-content {
          text-align: center;
        }

        .about-cta h2 {
          font-size: 2rem;
          margin-bottom: var(--vs-space-3);
        }

        .about-cta p {
          font-size: 1.125rem;
          color: var(--vs-text-secondary);
          margin-bottom: var(--vs-space-8);
        }

        .about-cta .btn {
          display: inline-flex;
          align-items: center;
          gap: var(--vs-space-2);
        }

        @media (max-width: 768px) {
          .about-hero {
            padding: var(--vs-space-12) 0;
          }

          .about-hero h1 {
            font-size: 2.25rem;
          }

          .values-grid {
            grid-template-columns: 1fr;
            gap: var(--vs-space-4);
          }

          .value-card {
            padding: var(--vs-space-5);
          }
        }
      `}</style>
    </div>
  );
};

export default AboutPage;
