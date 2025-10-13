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
  // Use the backend view endpoint for proper file serving
  const viewerUrl = `${API}/posters/${poster.id}/view`;
  
  // Add #toolbar=0 to hide PDF toolbar and ensure it displays
  const pdfViewerUrl = fileType === 'pdf' ? `${viewerUrl}#view=FitH` : viewerUrl;

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
          {loading && !error && (
            <div className="poster-loading">
              <div className="loading-spinner"></div>
              <p>Loading poster...</p>
            </div>
          )}
          
          {error && (
            <div className="poster-error">
              <AlertTriangle size={48} />
              <p>Unable to display poster</p>
              <div className="error-actions">
                <button onClick={handleDownload} className="download-btn">
                  <Download size={20} />
                  Download Poster
                </button>
                <a 
                  href={viewerUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="open-new-tab-btn"
                >
                  Open in New Tab
                </a>
              </div>
            </div>
          )}
          
          {fileType === 'pdf' && !error && (
            <object
              data={pdfViewerUrl}
              type="application/pdf"
              className="poster-pdf-viewer"
              onLoad={() => setLoading(false)}
              onError={() => {
                console.error('PDF failed to load');
                setLoading(false);
                setError(true);
              }}
            >
              <embed
                src={pdfViewerUrl}
                type="application/pdf"
                className="poster-pdf-viewer"
              />
            </object>
          )}
          
          {fileType === 'image' && !error && (
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