import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { GraduationCap, Search, Mail, ExternalLink } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ProfessorNetworkPage = () => {
  const [professors, setProfessors] = useState([]);
  const [filteredProfessors, setFilteredProfessors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAvailableOnly, setShowAvailableOnly] = useState(true);

  useEffect(() => {
    const fetchProfessors = async () => {
      try {
        // Fetch users with role='professor'
        const usersResponse = await axios.get(`${API}/users`);
        const professorUsers = usersResponse.data.filter(u => u.role === 'professor');
        
        // Fetch professor network profiles
        const networkResponse = await axios.get(`${API}/professor-network`);
        
        // Match users with their network profiles
        const professorsData = professorUsers.map(user => {
          const profile = networkResponse.data.find(p => p.user_id === user.id);
          return {
            ...user,
            profile: profile || null
          };
        });
        
        setProfessors(professorsData);
        setFilteredProfessors(professorsData);
      } catch (error) {
        console.error('Error fetching professors:', error);
        toast.error('Failed to load professor network');
      } finally {
        setLoading(false);
      }
    };

    fetchProfessors();
  }, []);

  useEffect(() => {
    filterProfessors();
  }, [searchTerm, showAvailableOnly, professors]);

  const filterProfessors = () => {
    let filtered = professors;
    
    // Filter by search term (research areas, name, university, department)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(prof => 
        prof.name?.toLowerCase().includes(term) ||
        prof.university?.toLowerCase().includes(term) ||
        prof.program?.toLowerCase().includes(term) ||
        prof.profile?.research_areas?.some(area => area.toLowerCase().includes(term))
      );
    }
    
    // Filter by accepting students
    if (showAvailableOnly) {
      filtered = filtered.filter(prof => prof.profile?.accepting_students);
    }
    
    setFilteredProfessors(filtered);
  };

  const ProfessorCard = ({ professor }) => (
    <div className="professor-card">
      <div className="professor-header">
        <div>
          <h3 className="professor-name">{professor.name}</h3>
          <div className="professor-meta">
            <span className="professor-university">{professor.university}</span>
            <span className="professor-department">{professor.program}</span>
          </div>
        </div>
        {professor.profile?.accepting_students && (
          <span className="accepting-badge">Accepting Students</span>
        )}
      </div>
      
      {professor.profile?.research_areas && (
        <div className="professor-research">
          <h4>Research Areas</h4>
          <div className="research-tags">
            {professor.profile.research_areas.map((area, index) => (
              <span key={index} className="research-tag">{area}</span>
            ))}
          </div>
        </div>
      )}
      
      {professor.profile?.lab_description && (
        <div className="professor-description">
          <p>{professor.profile.lab_description}</p>
        </div>
      )}
      
      <div className="professor-actions">
        <a href={`mailto:${professor.email}`} className="contact-btn">
          <Mail size={16} />
          Contact
        </a>
        {professor.profile?.website && (
          <a href={professor.profile.website} target="_blank" rel="noopener noreferrer" className="website-btn">
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
        <div className="search-filters">
          <div className="search-input">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search by research area..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-toggle">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={showAvailableOnly}
                onChange={(e) => setShowAvailableOnly(e.target.checked)}
              />
              Only show professors accepting students
            </label>
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading professors...</div>
        ) : (
          <div className="professors-grid">
            {filteredProfessors.length > 0 ? (
              filteredProfessors.map((professor) => (
                <ProfessorCard key={professor.id} professor={professor} />
              ))
            ) : (
              <div className="empty-state">
                <GraduationCap size={48} />
                <h3>No professors found</h3>
                <p>Try adjusting your search criteria or filters.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfessorNetworkPage;