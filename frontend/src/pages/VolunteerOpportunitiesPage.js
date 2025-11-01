import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Heart, MapPin, Clock, ExternalLink } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const VolunteerOpportunitiesPage = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/volunteer-opportunities`, {
        withCredentials: true
      });
      setOpportunities(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching volunteer opportunities:', error);
      toast.error('Error fetching volunteer opportunities');
      setOpportunities([]);
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
          Posted: {new Date(opportunity.created_at).toLocaleDateString()}
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
            Discover research, community, and academic volunteer opportunities across all fields to build your experience and give back to the community.
          </p>
        </div>
      </div>

      <div className="page-content">
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