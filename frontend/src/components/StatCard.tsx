import React from 'react';
import { motion } from 'framer-motion';

interface StatCardProps {
  label: string;
  value: number | string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, trend, icon }) => {
  return (
    <>
      <motion.div 
        className="stat-card"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="stat-card-header">
          <span className="stat-card-label">{label}</span>
          {icon && <span className="stat-card-icon">{icon}</span>}
        </div>
        <div className="stat-card-value">{value}</div>
      </motion.div>

      <style>{`
        .stat-card {
          background: var(--vs-white);
          border: 1px solid var(--vs-border);
          border-radius: var(--vs-radius-lg);
          padding: var(--vs-space-5);
        }

        .stat-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--vs-space-2);
        }

        .stat-card-label {
          font-size: 0.8125rem;
          font-weight: 500;
          color: var(--vs-text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .stat-card-icon {
          color: var(--vs-text-tertiary);
        }

        .stat-card-value {
          font-size: 2rem;
          font-weight: 600;
          color: var(--vs-text-primary);
          line-height: 1;
        }
      `}</style>
    </>
  );
};

export default StatCard;
