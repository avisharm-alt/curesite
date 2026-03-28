import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface CTASectionProps {
  title: string;
  subtitle?: string;
  buttonText: string;
  buttonLink: string;
}

const CTASection: React.FC<CTASectionProps> = ({ 
  title, 
  subtitle, 
  buttonText, 
  buttonLink 
}) => {
  return (
    <>
      <section className="cta-section">
        <div className="container">
          <motion.div 
            className="cta-content"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="cta-title">{title}</h2>
            {subtitle && <p className="cta-subtitle">{subtitle}</p>}
            <Link to={buttonLink} className="btn btn-primary btn-lg cta-button">
              {buttonText}
              <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </section>

      <style>{`
        .cta-section {
          padding: var(--vs-space-20) 0;
          background: var(--vs-bg-subtle);
          border-top: 1px solid var(--vs-border);
          border-bottom: 1px solid var(--vs-border);
        }

        .cta-content {
          text-align: center;
          max-width: 600px;
          margin: 0 auto;
        }

        .cta-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--vs-text-primary);
          margin-bottom: var(--vs-space-3);
          letter-spacing: -0.02em;
        }

        .cta-subtitle {
          font-size: 1.25rem;
          color: var(--vs-text-secondary);
          margin-bottom: var(--vs-space-8);
        }

        .cta-button {
          display: inline-flex;
          gap: var(--vs-space-2);
        }

        @media (max-width: 768px) {
          .cta-title {
            font-size: 2rem;
          }

          .cta-subtitle {
            font-size: 1.125rem;
          }
        }
      `}</style>
    </>
  );
};

export default CTASection;
