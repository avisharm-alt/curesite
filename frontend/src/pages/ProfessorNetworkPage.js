import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { GraduationCap, Search, Mail, ExternalLink } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ProfessorNetworkPage = () => {
  const [professors, setProfessors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAvailableOnly, setShowAvailableOnly] = useState(true);

  useEffect(() => {
    fetchProfessors();
  }, [searchTerm, showAvailableOnly]);

  const fetchProfessors = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('research_area', searchTerm);
      if (showAvailableOnly) params.append('accepting_students', 'true');
      
      const response = await axios.get(`${API}/professor-network?${params}`);
      setProfessors(response.data);
    } catch (error) {
      toast.error('Error fetching professor network');
    } finally {
      setLoading(false);
    }
  };

  const ProfessorCard = ({ professor }) => (
    <div className="professor-card">
      <div className="professor-header">
        <div>
          <h3 className="professor-name">{professor.user_name}</h3>
          <div className="professor-meta">
            <span className="professor-university">{professor.user_university}</span>
            <span className="professor-department">{professor.department}</span>
          </div>
        </div>
        {professor.accepting_students && (
          <span className="accepting-badge">Accepting Students</span>
        )}
      </div>
      
      <div className="professor-research">
        <h4>Research Areas</h4>
        <div className="research-tags">
          {professor.research_areas.map((area, index) => (
            <span key={index} className="research-tag">{area}</span>
          ))}
        </div>
      </div>
      
      <p className="lab-description">{professor.lab_description}</p>
      
      <div className="professor-contact">
        <a href={`mailto:${professor.contact_email}`} className="contact-link">
          <Mail size={16} />
          Contact
        </a>
        {professor.website && (
          <a href={professor.website} target="_blank" rel="noopener noreferrer" className="website-link">
            <ExternalLink size={16} />
            Website
          </a>
        )}
      </div>
    </div>
  );

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-icon">
          <GraduationCap size={32} />
        </div>
        <div>
          <h1 className="page-title">Professor Network</h1>
          <p className="page-description">
            Connect with faculty members for research opportunities, mentorship, and career guidance.
          </p>
        </div>
      </div>

      <div className="page-content">
        <div className="professor-controls">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search by research area..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={showAvailableOnly}
              onChange={(e) => setShowAvailableOnly(e.target.checked)}
            />
            Only show professors accepting students
          </label>
        </div>

        {loading ? (
          <div className="loading">Loading professors...</div>
        ) : (
          <>
            <div className="professors-grid">
              {professors.map((professor) => (
                <ProfessorCard key={professor.id} professor={professor} />
              ))}
            </div>

            {professors.length === 0 && (
              <div className="empty-state">
                <GraduationCap size={48} />
                <h3>No professors found</h3>
                <p>Check back later for new research opportunities!</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProfessorNetworkPage;