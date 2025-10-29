import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Heart, Search, MapPin, Clock, ExternalLink, Briefcase, X } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const VolunteerOpportunitiesPage = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  useEffect(() => {
    fetchOpportunities();
  }, []);

  // Filter opportunities locally for better performance
  const filteredOpportunities = opportunities.filter(opp => {
    const matchesSearch = opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opp.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opp.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || opp.type === selectedType;
    const matchesLocation = !locationFilter || opp.location.toLowerCase().includes(locationFilter.toLowerCase());
    
    return matchesSearch && matchesType && matchesLocation;
  });

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/volunteer-opportunities`);
      setOpportunities(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching volunteer opportunities:', error);
      toast.error('Error fetching volunteer opportunities');
      setOpportunities([]);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedType('');
    setLocationFilter('');
  };

  const opportunityTypes = ['Clinical', 'Research', 'Community Health', 'Non-clinical'];

  const OpportunityCard = ({ opportunity }) => (
    <div className="volunteer-opportunity-card">
      <div className="volunteer-card-header">
        <div className="volunteer-type-badge">{opportunity.type}</div>
      </div>
      
      <h3 className="volunteer-card-title">{opportunity.title}</h3>
      <h4 className="volunteer-card-organization">{opportunity.organization}</h4>
      
      <div className="volunteer-card-meta">
        <div className="volunteer-meta-item">
          <MapPin size={14} />
          <span>{opportunity.location}</span>
        </div>
        {opportunity.time_commitment && (
          <div className="volunteer-meta-item">
            <Clock size={14} />
            <span>{opportunity.time_commitment}</span>
          </div>
        )}
      </div>
      
      <p className="volunteer-card-description">{opportunity.description}</p>
      
      {opportunity.requirements && opportunity.requirements.length > 0 && (
        <div className="volunteer-requirements">
          <span className="requirements-label">Requirements:</span>
          <div className="volunteer-requirement-tags">
            {opportunity.requirements.slice(0, 3).map((requirement, index) => (
              <span key={index} className="volunteer-requirement-tag">{requirement}</span>
            ))}
            {opportunity.requirements.length > 3 && (
              <span className="volunteer-requirement-tag">+{opportunity.requirements.length - 3} more</span>
            )}
          </div>
        </div>
      )}
      
      <div className="volunteer-card-footer">
        <div className="volunteer-posted-date">
          {new Date(opportunity.posted_date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          })}
        </div>
        {opportunity.application_link && (
          <a 
            href={opportunity.application_link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="volunteer-apply-btn"
          >
            Apply Now
            <ExternalLink size={14} />
          </a>
        )}
      </div>
    </div>
  );

  const activeFiltersCount = [searchTerm, selectedType, locationFilter].filter(Boolean).length;

  return (
    <div className="volunteer-page">
      <div className="volunteer-page-container">
        {/* Header */}
        <div className="volunteer-page-header">
          <div className="volunteer-header-content">
            <Heart size={40} className="volunteer-header-icon" />
            <div>
              <h1 className="volunteer-page-title">Volunteer Opportunities</h1>
              <p className="volunteer-page-subtitle">
                Discover medical-related volunteer opportunities to build your experience and give back to the community
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="volunteer-search-section">
          <div className="volunteer-search-bar">
            <Search size={20} className="volunteer-search-icon" />
            <input
              type="text"
              placeholder="Search by title, organization, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="volunteer-search-input"
            />
          </div>

          <div className="volunteer-filter-row">
            <div className="volunteer-filter-chips">
              {opportunityTypes.map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedType(selectedType === type ? '' : type)}
                  className={`volunteer-filter-chip ${selectedType === type ? 'active' : ''}`}
                >
                  <Briefcase size={14} />
                  {type}
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="Filter by location..."
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="volunteer-location-input"
            />

            {activeFiltersCount > 0 && (
              <button onClick={clearFilters} className="volunteer-clear-filters">
                <X size={16} />
                Clear ({activeFiltersCount})
              </button>
            )}
          </div>
        </div>

        {/* Results Count */}
        {!loading && (
          <div className="volunteer-results-info">
            <span>{filteredOpportunities.length} {filteredOpportunities.length === 1 ? 'opportunity' : 'opportunities'} found</span>
          </div>
        )}

        {/* Opportunities Grid */}
        {loading ? (
          <div className="volunteer-loading-container">
            <div className="volunteer-loading-skeleton-grid">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="volunteer-card-skeleton">
                  <div className="volunteer-skeleton-badge"></div>
                  <div className="volunteer-skeleton-title"></div>
                  <div className="volunteer-skeleton-org"></div>
                  <div className="volunteer-skeleton-meta"></div>
                  <div className="volunteer-skeleton-text"></div>
                  <div className="volunteer-skeleton-text"></div>
                </div>
              ))}
            </div>
          </div>
        ) : filteredOpportunities.length === 0 ? (
          <div className="volunteer-empty-state">
            <Heart size={64} />
            <h3>No opportunities found</h3>
            <p>Try adjusting your search or filters</p>
            {activeFiltersCount > 0 && (
              <button onClick={clearFilters} className="volunteer-clear-filters-btn">
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="volunteer-opportunities-grid">
            {filteredOpportunities.map((opportunity) => (
              <OpportunityCard key={opportunity.id} opportunity={opportunity} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VolunteerOpportunitiesPage;