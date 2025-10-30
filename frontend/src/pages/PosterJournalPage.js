import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FileText, Plus, Eye, Download, Trash2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import PosterViewerModal from '../components/PosterViewerModal';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PosterJournalPage = () => {
  const { user } = useAuth();
  const [posters, setPosters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ university: '' });
  const [viewingPoster, setViewingPoster] = useState(null);

  useEffect(() => {
    fetchPosters();
  }, [filters]);

  const fetchPosters = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      // Always filter for approved and paid posters only
      params.append('status', 'approved');
      if (filters.university) params.append('university', filters.university);
      
      const response = await axios.get(`${API}/posters?${params}`);
      // Ensure we always have an array and filter for payment completed
      const approvedPosters = Array.isArray(response.data) 
        ? response.data.filter(p => p.payment_status === 'completed')
        : [];
      setPosters(approvedPosters);
    } catch (error) {
      console.error('Error fetching posters:', error);
      toast.error('Error fetching posters');
      setPosters([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePoster = async (posterId) => {
    if (!window.confirm('Are you sure you want to delete this poster?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      await axios.delete(`${API}/posters/${posterId}`, { headers });
      toast.success('Poster deleted successfully');
      fetchPosters(); // Refresh the list
    } catch (error) {
      toast.error('Error deleting poster');
    }
  };

  const handleViewPoster = (poster) => {
    console.log('Opening poster modal for:', poster.title);
    setViewingPoster(poster);
  };

  const handleDownloadPoster = (posterId, title) => {
    const url = `${API}/posters/${posterId}/download`;
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const PosterCard = ({ poster }) => (
    <div className="poster-card">
      <div className="poster-header">
        <h3 className="poster-title">{poster.title}</h3>
        <span className={`status-badge status-${poster.status}`}>
          {poster.status}
        </span>
      </div>
      <div className="poster-authors">
        By: {poster.authors.join(', ')}
      </div>
      <div className="poster-meta">
        <span className="poster-university">{poster.university}</span>
        <span className="poster-program">{poster.program}</span>
      </div>
      <p className="poster-abstract">{poster.abstract}</p>
      <div className="poster-keywords">
        {poster.keywords.map((keyword, index) => (
          <span key={index} className="keyword-tag">{keyword}</span>
        ))}
      </div>
      
      {/* Poster Actions */}
      <div className="poster-actions">
        {poster.status === 'approved' && poster.poster_url && (
          <>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('VIEW BUTTON CLICKED for poster:', poster.title);
                alert('Opening poster: ' + poster.title); // Debug alert
                setViewingPoster(poster);
              }}
              className="view-poster-btn"
            >
              <Eye size={16} />
              View Poster
            </button>
            <button
              onClick={() => handleDownloadPoster(poster.id, poster.title)}
              className="download-poster-btn"
            >
              <Download size={16} />
              Download
            </button>
          </>
        )}
        
        {user && (user.user_type === 'admin' || poster.submitted_by === user.id) && (
          <button
            onClick={() => handleDeletePoster(poster.id)}
            className="delete-poster-btn"
          >
            <Trash2 size={16} />
            Delete
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-icon">
          <FileText size={32} />
        </div>
        <div>
          <h1 className="page-title">Poster Journal</h1>
          <p className="page-description">
            Showcase your research and discover groundbreaking work from undergraduate students across Canada.
          </p>
        </div>
      </div>

      <div className="page-content">
        <div className="poster-controls">
          <div className="poster-filters">
            <select 
              value={filters.status} 
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="filter-select"
            >
              <option value="approved">Approved</option>
              <option value="pending">Pending Review</option>
              <option value="">All Status</option>
            </select>
            
            <input
              type="text"
              placeholder="Filter by university..."
              value={filters.university}
              onChange={(e) => setFilters({...filters, university: e.target.value})}
              className="filter-input"
            />
          </div>
          
          {user && (
            <Link to="/submit-poster" className="submit-poster-btn">
              <Plus size={18} />
              Submit Poster
            </Link>
          )}
        </div>

        {loading ? (
          <div className="loading">Loading posters...</div>
        ) : (
          <>
            <div className="posters-grid">
              {posters.map((poster) => (
                <PosterCard key={poster.id} poster={poster} />
              ))}
            </div>

            {posters.length === 0 && (
              <div className="empty-state">
                <FileText size={48} />
                <h3>No posters found</h3>
                <p>Be the first to submit a poster to the journal!</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Poster Viewer Modal */}
      <PosterViewerModal 
        poster={viewingPoster} 
        isOpen={!!viewingPoster}
        onClose={() => setViewingPoster(null)}
      />
    </div>
  );
};

export default PosterJournalPage;