import React, { useState } from 'react';
import { Download, X, AlertTriangle, ExternalLink } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PosterViewerModal = ({ poster, isOpen, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleDownload = () => {
    const url = `${API}/posters/${poster.id}/download`;
    window.open(url, '_blank');
  };

  // Use the backend view endpoint for proper file serving
  const viewerUrl = `${API}/posters/${poster.id}/view`;

  return (
    <div className="poster-modal-overlay" onClick={onClose}>
      <div className="poster-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="poster-modal-header">
          <div className="poster-modal-title">
            <h3>{poster.title}</h3>
            <p>By: {poster.authors.join(', ')}</p>
          </div>
          <div className="poster-modal-actions">
            <button onClick={handleDownload} className="download-modal-btn" title="Download">
              <Download size={20} />
            </button>
            <button 
              onClick={() => window.open(viewerUrl, '_blank')} 
              className="open-tab-modal-btn" 
              title="Open in New Tab"
            >
              <ExternalLink size={20} />
            </button>
            <button onClick={onClose} className="close-modal-btn" title="Close">
              <X size={20} />
            </button>
          </div>
        </div>
        
        <div className="poster-modal-body">
          {loading && !error && (
            <div className="poster-loading">
              <div className="loading-spinner"></div>
              <p>Loading poster...</p>
            </div>
          )}
          
          {error && (
            <div className="poster-error">
              <AlertTriangle size={48} />
              <p>Unable to display poster in modal</p>
              <div className="error-actions">
                <button onClick={() => window.open(viewerUrl, '_blank')} className="open-new-tab-btn">
                  <ExternalLink size={20} />
                  Open in New Tab
                </button>
                <button onClick={handleDownload} className="download-btn">
                  <Download size={20} />
                  Download
                </button>
              </div>
            </div>
          )}
          
          <iframe
            src={viewerUrl}
            title={poster.title}
            className="poster-iframe-viewer"
            onLoad={() => setLoading(false)}
            onError={() => {
              console.error('Failed to load poster');
              setLoading(false);
              setError(true);
            }}
            style={{ display: error ? 'none' : 'block' }}
          />
        </div>
      </div>
    </div>
  );
};

export default PosterViewerModal;