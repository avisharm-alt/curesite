import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';

interface ResonanceButtonProps {
  initialCount: number;
  size?: 'sm' | 'md' | 'lg';
}

const ResonanceButton: React.FC<ResonanceButtonProps> = ({ 
  initialCount, 
  size = 'md' 
}) => {
  const [resonated, setResonated] = useState(false);
  const [count, setCount] = useState(initialCount);

  const handleClick = () => {
    setResonated(!resonated);
    setCount(prev => resonated ? prev - 1 : prev + 1);
  };

  const iconSizes = { sm: 16, md: 20, lg: 24 };

  return (
    <>
      <motion.button
        className={`resonance-btn resonance-btn-${size} ${resonated ? 'active' : ''}`}
        onClick={handleClick}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          animate={resonated ? { scale: [1, 1.3, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          <Heart 
            size={iconSizes[size]} 
            fill={resonated ? 'currentColor' : 'none'} 
          />
        </motion.div>
        <span className="resonance-btn-text">This resonated with me</span>
        <span className="resonance-btn-count">{count}</span>
      </motion.button>

      <style>{`
        .resonance-btn {
          display: inline-flex;
          align-items: center;
          gap: var(--vs-space-2);
          font-family: var(--vs-font);
          font-weight: 500;
          background: var(--vs-white);
          border: 1px solid var(--vs-border);
          border-radius: var(--vs-radius-full);
          cursor: pointer;
          transition: all var(--vs-transition-fast);
        }

        .resonance-btn-sm {
          padding: var(--vs-space-2) var(--vs-space-4);
          font-size: 0.8125rem;
        }

        .resonance-btn-md {
          padding: var(--vs-space-3) var(--vs-space-5);
          font-size: 0.9375rem;
        }

        .resonance-btn-lg {
          padding: var(--vs-space-4) var(--vs-space-6);
          font-size: 1rem;
        }

        .resonance-btn:hover {
          border-color: var(--vs-coral);
          color: var(--vs-coral);
        }

        .resonance-btn.active {
          background: rgba(255, 90, 95, 0.08);
          border-color: var(--vs-coral);
          color: var(--vs-coral);
        }

        .resonance-btn-text {
          color: inherit;
        }

        .resonance-btn-count {
          padding-left: var(--vs-space-2);
          border-left: 1px solid var(--vs-border);
          margin-left: var(--vs-space-1);
          opacity: 0.8;
        }

        .resonance-btn.active .resonance-btn-count {
          border-left-color: rgba(255, 90, 95, 0.3);
        }
      `}</style>
    </>
  );
};

export default ResonanceButton;
