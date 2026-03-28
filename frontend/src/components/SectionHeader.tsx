import React from 'react';
import { motion } from 'framer-motion';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ 
  title, 
  subtitle, 
  align = 'left' 
}) => {
  return (
    <>
      <motion.div 
        className={`section-header section-header-${align}`}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="section-header-title">{title}</h2>
        {subtitle && <p className="section-header-subtitle">{subtitle}</p>}
      </motion.div>

      <style>{`
        .section-header {
          margin-bottom: var(--vs-space-10);
        }

        .section-header-center {
          text-align: center;
        }

        .section-header-title {
          font-size: 2rem;
          font-weight: 600;
          color: var(--vs-text-primary);
          margin-bottom: var(--vs-space-3);
        }

        .section-header-subtitle {
          font-size: 1.125rem;
          color: var(--vs-text-secondary);
          max-width: 600px;
        }

        .section-header-center .section-header-subtitle {
          margin: 0 auto;
        }

        @media (max-width: 768px) {
          .section-header-title {
            font-size: 1.75rem;
          }
        }
      `}</style>
    </>
  );
};

export default SectionHeader;
