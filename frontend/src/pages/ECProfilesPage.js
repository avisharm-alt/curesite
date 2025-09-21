import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { BarChart3 } from 'lucide-react';

// Hardcoded EC Profiles data
const EC_PROFILES_DATA = [
  {
    id: '1',
    medical_school: 'University of Toronto',
    admission_year: 2024,
    undergraduate_gpa: 3.95,
    mcat_score: 522,
    research_hours: 2500,
    volunteer_hours: 800,
    leadership_activities: ['President of Pre-Med Society', 'Volunteer Coordinator at Local Hospital', 'Research Team Leader'],
    awards_scholarships: ['Dean\'s List (4 years)', 'NSERC Undergraduate Research Award', 'University Entrance Scholarship']
  },
  {
    id: '2',
    medical_school: 'McGill University',
    admission_year: 2024,
    undergraduate_gpa: 3.89,
    mcat_score: 518,
    research_hours: 1800,
    volunteer_hours: 1200,
    leadership_activities: ['Vice-President of Science Students Association', 'Peer Tutor Program Coordinator'],
    awards_scholarships: ['McGill Entrance Scholarship', 'Academic Excellence Award']
  },
  {
    id: '3',
    medical_school: 'University of British Columbia',
    admission_year: 2023,
    undergraduate_gpa: 3.92,
    mcat_score: 520,
    research_hours: 2200,
    volunteer_hours: 950,
    leadership_activities: ['Captain of University Volleyball Team', 'President of Biology Club', 'Orientation Week Leader'],
    awards_scholarships: ['Provincial Academic Scholarship', 'Athletic Excellence Award', 'Research Excellence Grant']
  },
  {
    id: '4',
    medical_school: 'McMaster University',
    admission_year: 2023,
    undergraduate_gpa: 3.87,
    mcat_score: 515,
    research_hours: 1600,
    volunteer_hours: 1400,
    leadership_activities: ['Director of Campus Mental Health Initiative', 'Executive Member of Student Council'],
    awards_scholarships: ['McMaster Scholars Award', 'Community Service Recognition']
  },
  {
    id: '5',
    medical_school: 'University of Western Ontario',
    admission_year: 2024,
    undergraduate_gpa: 3.94,
    mcat_score: 519,
    research_hours: 2100,
    volunteer_hours: 750,
    leadership_activities: ['Editor-in-Chief of Science Journal', 'Head Teaching Assistant', 'Research Symposium Organizer'],
    awards_scholarships: ['Western Scholarship of Excellence', 'Research Publication Award']
  },
  {
    id: '6',
    medical_school: 'Queen\'s University',
    admission_year: 2023,
    undergraduate_gpa: 3.91,
    mcat_score: 517,
    research_hours: 1900,
    volunteer_hours: 1100,
    leadership_activities: ['President of Global Health Club', 'Peer Mentor Program Leader'],
    awards_scholarships: ['Queen\'s Excellence Award', 'International Experience Grant']
  },
  {
    id: '7',
    medical_school: 'University of Ottawa',
    admission_year: 2024,
    undergraduate_gpa: 3.88,
    mcat_score: 516,
    research_hours: 1700,
    volunteer_hours: 1300,
    leadership_activities: ['VP External of Health Sciences Student Association', 'Community Outreach Coordinator'],
    awards_scholarships: ['Ottawa Entrance Scholarship', 'Volunteer Excellence Award']
  },
  {
    id: '8',
    medical_school: 'University of Alberta',
    admission_year: 2023,
    undergraduate_gpa: 3.93,
    mcat_score: 521,
    research_hours: 2400,
    volunteer_hours: 850,
    leadership_activities: ['Research Lab Manager', 'President of Pre-Professional Health Club', 'Student Senator'],
    awards_scholarships: ['Jason Lang Scholarship', 'Research Excellence Award', 'Leadership Recognition']
  },
  {
    id: '9',
    medical_school: 'University of Toronto',
    admission_year: 2023,
    undergraduate_gpa: 3.96,
    mcat_score: 523,
    research_hours: 2800,
    volunteer_hours: 700,
    leadership_activities: ['Chief Research Officer for Student Society', 'Mentor for Incoming Students'],
    awards_scholarships: ['President\'s Entrance Scholarship', 'Research Publication Grant', 'Academic Achievement Award']
  },
  {
    id: '10',
    medical_school: 'McGill University',
    admission_year: 2023,
    undergraduate_gpa: 3.90,
    mcat_score: 519,
    research_hours: 2000,
    volunteer_hours: 1000,
    leadership_activities: ['Director of Student Wellness Program', 'Executive Board Member of Science Society'],
    awards_scholarships: ['McGill Major Scholarship', 'Community Impact Award']
  }
];

// Generate stats from the hardcoded data
const generateStats = (profiles) => {
  const stats = {};
  
  profiles.forEach(profile => {
    const school = profile.medical_school;
    if (!stats[school]) {
      stats[school] = {
        medical_school: school,
        count: 0,
        avg_gpa: 0,
        avg_mcat: 0,
        avg_research_hours: 0,
        avg_volunteer_hours: 0
      };
    }
    
    stats[school].count += 1;
    stats[school].avg_gpa += profile.undergraduate_gpa;
    stats[school].avg_mcat += profile.mcat_score;
    stats[school].avg_research_hours += profile.research_hours;
    stats[school].avg_volunteer_hours += profile.volunteer_hours;
  });
  
  // Calculate averages
  Object.values(stats).forEach(stat => {
    stat.avg_gpa = (stat.avg_gpa / stat.count).toFixed(2);
    stat.avg_mcat = Math.round(stat.avg_mcat / stat.count);
    stat.avg_research_hours = Math.round(stat.avg_research_hours / stat.count);
    stat.avg_volunteer_hours = Math.round(stat.avg_volunteer_hours / stat.count);
  });
  
  return Object.values(stats);
};

const ECProfilesPage = () => {
  const [profiles, setProfiles] = useState(EC_PROFILES_DATA);
  const [stats, setStats] = useState(generateStats(EC_PROFILES_DATA));
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ medical_school: '', admission_year: '' });

  useEffect(() => {
    filterProfiles();
  }, [filters]);

  const filterProfiles = () => {
    let filtered = EC_PROFILES_DATA;
    
    if (filters.medical_school) {
      filtered = filtered.filter(profile => profile.medical_school === filters.medical_school);
    }
    
    if (filters.admission_year) {
      filtered = filtered.filter(profile => profile.admission_year.toString() === filters.admission_year);
    }
    
    setProfiles(filtered);
    setStats(generateStats(filtered));
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