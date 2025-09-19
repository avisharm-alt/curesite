import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { BarChart3 } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ECProfilesPage = () => {
  const [profiles, setProfiles] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ medical_school: '', admission_year: '' });

  useEffect(() => {
    fetchProfiles();
    fetchStats();
  }, [filters]);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.medical_school) params.append('medical_school', filters.medical_school);
      if (filters.admission_year) params.append('admission_year', filters.admission_year);
      
      const response = await axios.get(`${API}/ec-profiles?${params}`);
      setProfiles(response.data);
    } catch (error) {
      toast.error('Error fetching EC profiles');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/ec-profiles/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats');
    }
  };

  const ProfileCard = ({ profile }) => (
    <div className="profile-card">
      <div className="profile-header">
        <h3 className="profile-school">{profile.medical_school}</h3>
        <span className="profile-year">Class of {profile.admission_year}</span>
      </div>
      
      <div className="profile-stats">
        <div className="stat-item">
          <span className="stat-label">Undergraduate GPA</span>
          <span className="stat-value">{profile.undergraduate_gpa.toFixed(2)}</span>
        </div>
        
        {profile.mcat_score && (
          <div className="stat-item">
            <span className="stat-label">MCAT Score</span>
            <span className="stat-value">{profile.mcat_score}</span>
          </div>
        )}
        
        <div className="stat-item">
          <span className="stat-label">Research Hours</span>
          <span className="stat-value">{profile.research_hours || 'N/A'}</span>
        </div>
        
        <div className="stat-item">
          <span className="stat-label">Volunteer Hours</span>
          <span className="stat-value">{profile.volunteer_hours || 'N/A'}</span>
        </div>
      </div>
      
      {profile.leadership_activities && profile.leadership_activities.length > 0 && (
        <div className="profile-activities">
          <h4>Leadership Activities</h4>
          <div className="activity-tags">
            {profile.leadership_activities.map((activity, index) => (
              <span key={index} className="activity-tag">{activity}</span>
            ))}
          </div>
        </div>
      )}
      
      {profile.awards_scholarships && profile.awards_scholarships.length > 0 && (
        <div className="profile-awards">
          <h4>Awards & Scholarships</h4>
          <div className="award-tags">
            {profile.awards_scholarships.map((award, index) => (
              <span key={index} className="award-tag">{award}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-icon">
          <BarChart3 size={32} />
        </div>
        <div>
          <h1 className="page-title">EC Profiles & Stats</h1>
          <p className="page-description">
            Anonymous profiles and statistics from accepted Canadian medical school students.
          </p>
        </div>
      </div>

      <div className="page-content">
        <div className="profile-controls">
          <select
            value={filters.medical_school}
            onChange={(e) => setFilters({...filters, medical_school: e.target.value})}
            className="filter-select"
          >
            <option value="">All Medical Schools</option>
            <option value="University of Toronto">University of Toronto</option>
            <option value="University of Western Ontario">University of Western Ontario</option>
            <option value="McMaster University">McMaster University</option>
            <option value="Queen's University">Queen's University</option>
            <option value="University of Ottawa">University of Ottawa</option>
          </select>
          
          <input
            type="number"
            placeholder="Admission year..."
            value={filters.admission_year}
            onChange={(e) => setFilters({...filters, admission_year: e.target.value})}
            className="filter-input"
            min="2020"
            max="2030"
          />
        </div>

        {stats.length > 0 && (
          <div className="stats-overview">
            <h3>Average Statistics by School</h3>
            <div className="stats-grid">
              {stats.map((stat, index) => (
                <div key={index} className="stat-card">
                  <h4>{stat._id}</h4>
                  <div className="stat-details">
                    <div className="stat-detail">
                      <span>Avg GPA</span>
                      <span>{stat.avg_gpa?.toFixed(2) || 'N/A'}</span>
                    </div>
                    <div className="stat-detail">
                      <span>Avg MCAT</span>
                      <span>{stat.avg_mcat?.toFixed(0) || 'N/A'}</span>
                    </div>
                    <div className="stat-detail">
                      <span>Profiles</span>
                      <span>{stat.count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="loading">Loading profiles...</div>
        ) : (
          <>
            <div className="profiles-grid">
              {profiles.map((profile) => (
                <ProfileCard key={profile.id} profile={profile} />
              ))}
            </div>

            {profiles.length === 0 && (
              <div className="empty-state">
                <BarChart3 size={48} />
                <h3>No profiles found</h3>
                <p>Submit your profile to help future students!</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ECProfilesPage;