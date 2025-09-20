import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Heart, Search, Filter, MapPin, Clock, ExternalLink } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const VolunteerOpportunitiesPage = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ type: '', location: '' });

  useEffect(() => {
    fetchOpportunities();
  }, [searchTerm, filters]);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('title', searchTerm);
      if (filters.type) params.append('type', filters.type);
      if (filters.location) params.append('location', filters.location);
      
      const response = await axios.get(`${API}/volunteer-opportunities?${params}`);
      // Ensure we always have an array
      setOpportunities(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching volunteer opportunities:', error);
      toast.error('Error fetching volunteer opportunities');
      setOpportunities([]); // Reset to empty array on error
    } finally {
      setLoading(false);
    }
  };

  const OpportunityCard = ({ opportunity }) => (
    <div className="opportunity-card">
      <div className="opportunity-header">
        <h3 className="opportunity-title">{opportunity.title}</h3>
        <span className="opportunity-type">{opportunity.type}</span>
      </div>
      
      <div className="opportunity-organization">
        <h4>{opportunity.organization}</h4>
      </div>
      
      <div className="opportunity-meta">
        <div className="meta-item">
          <MapPin size={16} />
          <span>{opportunity.location}</span>
        </div>
        {opportunity.time_commitment && (
          <div className="meta-item">
            <Clock size={16} />
            <span>{opportunity.time_commitment}</span>
          </div>
        )}
      </div>
      
      <p className="opportunity-description">{opportunity.description}</p>
      
      {opportunity.requirements && opportunity.requirements.length > 0 && (
        <div className="opportunity-requirements">
          <h4>Requirements</h4>
          <div className="requirement-tags">
            {opportunity.requirements.map((requirement, index) => (
              <span key={index} className="requirement-tag">{requirement}</span>
            ))}
          </div>
        </div>
      )}
      
      <div className="opportunity-footer">
        <div className="opportunity-posted">
          Posted: {new Date(opportunity.posted_date).toLocaleDateString()}
        </div>
        {opportunity.application_link && (
          <a 
            href={opportunity.application_link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="apply-link"
          >
            <ExternalLink size={16} />
            Apply Now
          </a>
        )}
      </div>
    </div>
  );

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-icon">
          <Heart size={32} />
        </div>
        <div>
          <h1 className="page-title">Volunteer Opportunities</h1>
          <p className="page-description">
            Discover medical-related volunteer opportunities to build your experience and give back to the community.
          </p>
        </div>
      </div>

      <div className="page-content">
        <div className="volunteer-controls">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search opportunities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="volunteer-filters">
            <select
              value={filters.type}
              onChange={(e) => setFilters({...filters, type: e.target.value})}
              className="filter-select"
            >
              <option value="">All Types</option>
              <option value="Clinical">Clinical</option>
              <option value="Research">Research</option>
              <option value="Community Health">Community Health</option>
              <option value="Non-clinical">Non-clinical</option>
            </select>
            
            <input
              type="text"
              placeholder="Location..."
              value={filters.location}
              onChange={(e) => setFilters({...filters, location: e.target.value})}
              className="filter-input"
            />
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading opportunities...</div>
        ) : (
          <>
            <div className="opportunities-grid">
              {opportunities.map((opportunity) => (
                <OpportunityCard key={opportunity.id} opportunity={opportunity} />
              ))}
            </div>

            {opportunities.length === 0 && (
              <div className="empty-state">
                <Heart size={48} />
                <h3>No opportunities found</h3>
                <p>Check back later for new volunteer opportunities!</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default VolunteerOpportunitiesPage;