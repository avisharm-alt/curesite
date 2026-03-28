import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ContentWarningBannerProps {
  visible: boolean;
  onProceed: () => void;
}

const ContentWarningBanner: React.FC<ContentWarningBannerProps> = ({ visible, onProceed }) => {
  if (!visible) return null;

  return (
    <>
      <div className="content-warning-banner">
        <div className="content-warning-content">
          <AlertTriangle size={20} />
          <div className="content-warning-text">
            <strong>Content Warning</strong>
            <p>This story contains content that some readers may find distressing.</p>
          </div>
        </div>
      </div>

      <style>{`
        .content-warning-banner {
          background: rgba(255, 90, 95, 0.06);
          border-bottom: 1px solid rgba(255, 90, 95, 0.15);
          padding: var(--vs-space-4) 0;
        }

        .content-warning-content {
          max-width: 720px;
          margin: 0 auto;
          padding: 0 var(--vs-space-6);
          display: flex;
          align-items: flex-start;
          gap: var(--vs-space-3);
          color: var(--vs-coral);
        }

        .content-warning-content svg {
          flex-shrink: 0;
          margin-top: 2px;
        }

        .content-warning-text strong {
          display: block;
          font-size: 0.9375rem;
          margin-bottom: var(--vs-space-1);
        }

        .content-warning-text p {
          font-size: 0.875rem;
          color: var(--vs-text-secondary);
          margin: 0;
        }
      `}</style>
    </>
  );
};

export default ContentWarningBanner;
