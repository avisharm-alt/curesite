import React, { useState } from 'react';
import { Download, X, AlertTriangle } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PosterViewerModal = ({ poster, isOpen, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleDownload = () => {
    const url = `${API}/posters/${poster.id}/download`;
    const a = document.createElement('a');
    a.href = url;
    a.download = `${poster.title}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const getFileType = (url) => {
    if (!url) return 'unknown';
    const ext = url.split('.').pop().toLowerCase();
    if (['pdf'].includes(ext)) return 'pdf';
    if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) return 'image';
    return 'unknown';
  };

  const fileType = getFileType(poster.poster_url);
  // Use the direct poster_url with backend prefix
  const viewerUrl = poster.poster_url.startsWith('http') 
    ? poster.poster_url 
    : `${BACKEND_URL}${poster.poster_url}`;

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
            <button onClick={onClose} className="close-modal-btn" title="Close">
              <X size={20} />
            </button>
          </div>
        </div>
        
        <div className="poster-modal-body">
          {loading && (
            <div className="poster-loading">
              <div className="loading-spinner"></div>
              <p>Loading poster...</p>
            </div>
          )}
          
          {error && (
            <div className="poster-error">
              <AlertTriangle size={48} />
              <h3>Unable to load poster</h3>
              <p>There was an error loading the poster file.</p>
              <button onClick={handleDownload} className="download-fallback-btn">
                <Download size={16} />
                Download Instead
              </button>
            </div>
          )}
          
          {fileType === 'pdf' && (
            <iframe
              src={viewerUrl}
              className="poster-pdf-viewer"
              onLoad={() => setLoading(false)}
              onError={() => {
                setLoading(false);
                setError(true);
              }}
              title={poster.title}
            />
          )}
          
          {fileType === 'image' && (
            <img
              src={viewerUrl}
              alt={poster.title}
              className="poster-image-viewer"
              onLoad={() => setLoading(false)}
              onError={() => {
                setLoading(false);
                setError(true);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PosterViewerModal;