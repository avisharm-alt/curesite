import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import './App.css';

// Import Lucide React icons
import { 
  BookOpen, Users, GraduationCap, Heart, FileText, 
  User, LogOut, Menu, X, Search, Filter, Plus,
  Star, MapPin, Clock, Mail, Phone, ExternalLink,
  Award, BarChart3, TrendingUp, Calendar
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const GOOGLE_CLIENT_ID = "492483192809-ltp2f8jtudscriesriob5a6jn34snbtc.apps.googleusercontent.com";

// Auth Context
const AuthContext = React.createContext();

const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token and get user info
      axios.get(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(response => {
        setUser(response.data);
      })
      .catch(() => {
        localStorage.removeItem('token');
      })
      .finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    setUser(userData);
    toast.success(`Welcome back, ${userData.name}!`);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Components
const Header = () => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Poster Journal', href: '#posters' },
    { name: 'Student Network', href: '#students' },
    { name: 'Professor Network', href: '#professors' },
    { name: 'EC Profiles', href: '#profiles' },
    { name: 'Volunteer Opportunities', href: '#volunteer' },
  ];

  return (
    <header className="header">
      <nav className="nav-container">
        <div className="nav-brand">
          <img 
            src="https://customer-assets.emergentagent.com/job_137e70c1-f0f7-4e3d-8748-ad4447b6d332/artifacts/l3ze9cjg_Logo%20maker%20project%20%284%29.png" 
            alt="CURE Logo" 
            className="logo"
          />
        </div>

        {/* Desktop Navigation */}
        <div className="nav-links">
          {navigation.map((item) => (
            <a key={item.name} href={item.href} className="nav-link">
              {item.name}
            </a>
          ))}
        </div>

        {/* User Menu */}
        <div className="nav-user">
          {user ? (
            <div className="user-menu">
              <div className="user-info">
                <span className="user-name">{user.name}</span>
                <span className="user-type">{user.user_type}</span>
              </div>
              <button onClick={logout} className="logout-btn">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <GoogleLoginButton />
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="mobile-menu-btn">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          {navigation.map((item) => (
            <a key={item.name} href={item.href} className="mobile-nav-link">
              {item.name}
            </a>
          ))}
        </div>
      )}
    </header>
  );
};

const GoogleLoginButton = () => {
  const { login } = useAuth();

  const handleGoogleLogin = () => {
    window.location.href = `${API}/auth/google`;
  };

  // Listen for auth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const userStr = urlParams.get('user');
    
    if (token && userStr) {
      try {
        const userData = JSON.parse(decodeURIComponent(userStr));
        login(userData, token);
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (error) {
        console.error('Error parsing auth callback:', error);
      }
    }
  }, [login]);

  return (
    <button onClick={handleGoogleLogin} className="google-login-btn">
      <img 
        src="https://developers.google.com/identity/images/g-logo.png" 
        alt="Google" 
        className="google-icon"
      />
      Sign in with Google
    </button>
  );
};

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-content">
        <div className="hero-text">
          <h1 className="hero-title">
            Canadian Undergraduate
            <span className="accent-text"> Research Exchange</span>
          </h1>
          <p className="hero-description">
            The premier platform connecting Canadian undergraduate students with research opportunities, 
            medical school preparation resources, and a thriving community of future healthcare professionals.
          </p>
          <div className="hero-buttons">
            <button className="cta-primary">Join the Network</button>
            <button className="cta-secondary">Explore Resources</button>
          </div>
        </div>
        <div className="hero-image">
          <img 
            src="https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwcmVzZWFyY2h8ZW58MHx8fHwxNzU3OTkwMjE1fDA&ixlib=rb-4.1.0&q=85"
            alt="Medical Research"
            className="hero-img"
          />
        </div>
      </div>
    </section>
  );
};

const FeatureSection = ({ id, title, description, icon: Icon, children, image }) => {
  return (
    <section id={id} className="feature-section">
      <div className="feature-container">
        <div className="feature-header">
          <div className="feature-icon">
            <Icon size={32} />
          </div>
          <div className="feature-title-container">
            <h2 className="feature-title">{title}</h2>
            <p className="feature-description">{description}</p>
          </div>
        </div>
        
        {image && (
          <div className="feature-image">
            <img src={image} alt={title} className="section-img" />
          </div>
        )}
        
        <div className="feature-content">
          {children}
        </div>
      </div>
    </section>
  );
};

const PosterJournal = () => {
  const { user } = useAuth();
  const [posters, setPosters] = useState([]);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [filters, setFilters] = useState({ status: 'approved', university: '' });

  useEffect(() => {
    fetchPosters();
  }, [filters]);

  const fetchPosters = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.university) params.append('university', filters.university);
      
      const response = await axios.get(`${API}/posters?${params}`);
      setPosters(response.data);
    } catch (error) {
      toast.error('Error fetching posters');
    }
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
    </div>
  );

  return (
    <FeatureSection
      id="posters"
      title="Poster Journal"
      description="Showcase your research and discover groundbreaking work from undergraduate students across Canada."
      icon={FileText}
      image="https://images.unsplash.com/photo-1579165466949-3180a3d056d5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwyfHxtZWRpY2FsJTIwcmVzZWFyY2h8ZW58MHx8fHwxNzU3OTkwMjE1fDA&ixlib=rb-4.1.0&q=85"
    >
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
          <button 
            onClick={() => setShowSubmitForm(true)}
            className="submit-poster-btn"
          >
            <Plus size={18} />
            Submit Poster
          </button>
        )}
      </div>

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
    </FeatureSection>
  );
};

const StudentNetwork = () => {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStudents();
  }, [searchTerm]);

  const fetchStudents = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('research_interest', searchTerm);
      
      const response = await axios.get(`${API}/student-network?${params}`);
      setStudents(response.data);
    } catch (error) {
      toast.error('Error fetching student network');
    }
  };

  const StudentCard = ({ student }) => (
    <div className="student-card">
      <div className="student-header">
        <h3 className="student-name">{student.user_name}</h3>
        <div className="student-meta">
          <span className="student-university">{student.user_university}</span>
          <span className="student-program">{student.user_program}</span>
        </div>
      </div>
      
      <div className="student-interests">
        <h4>Research Interests</h4>
        <div className="interest-tags">
          {student.research_interests.map((interest, index) => (
            <span key={index} className="interest-tag">{interest}</span>
          ))}
        </div>
      </div>
      
      <div className="student-skills">
        <h4>Skills</h4>
        <div className="skill-tags">
          {student.skills.map((skill, index) => (
            <span key={index} className="skill-tag">{skill}</span>
          ))}
        </div>
      </div>
      
      <div className="student-looking-for">
        <strong>Looking for:</strong> {student.looking_for.join(', ')}
      </div>
    </div>
  );

  return (
    <FeatureSection
      id="students"
      title="Student Network"
      description="Connect with like-minded undergraduate students passionate about research and medical careers."
      icon={Users}
      image="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwzfHx1bml2ZXJzaXR5JTIwc3R1ZGVudHN8ZW58MHx8fHwxNzU4MDczNDYxfDA&ixlib=rb-4.1.0&q=85"
    >
      <div className="network-search">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by research interest..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="students-grid">
        {students.map((student) => (
          <StudentCard key={student.id} student={student} />
        ))}
      </div>

      {students.length === 0 && (
        <div className="empty-state">
          <Users size={48} />
          <h3>No students found</h3>
          <p>Join the network to connect with other students!</p>
        </div>
      )}
    </FeatureSection>
  );
};

const ProfessorNetwork = () => {
  const [professors, setProfessors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAvailableOnly, setShowAvailableOnly] = useState(true);

  useEffect(() => {
    fetchProfessors();
  }, [searchTerm, showAvailableOnly]);

  const fetchProfessors = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('research_area', searchTerm);
      if (showAvailableOnly) params.append('accepting_students', 'true');
      
      const response = await axios.get(`${API}/professor-network?${params}`);
      setProfessors(response.data);
    } catch (error) {
      toast.error('Error fetching professor network');
    }
  };

  const ProfessorCard = ({ professor }) => (
    <div className="professor-card">
      <div className="professor-header">
        <h3 className="professor-name">{professor.user_name}</h3>
        <div className="professor-meta">
          <span className="professor-university">{professor.user_university}</span>
          <span className="professor-department">{professor.department}</span>
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
    <FeatureSection
      id="professors"
      title="Professor Network"
      description="Connect with faculty members for research opportunities, mentorship, and career guidance."
      icon={GraduationCap}
      image="https://images.unsplash.com/photo-1571260899304-425eee4c7efc?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwyfHx1bml2ZXJzaXR5JTIwc3R1ZGVudHN8ZW58MHx8fHwxNzU4MDczNDYxfDA&ixlib=rb-4.1.0&q=85"
    >
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
    </FeatureSection>
  );
};

const ECProfiles = () => {
  const [profiles, setProfiles] = useState([]);
  const [stats, setStats] = useState([]);
  const [filters, setFilters] = useState({ medical_school: '', admission_year: '' });

  useEffect(() => {
    fetchProfiles();
    fetchStats();
  }, [filters]);

  const fetchProfiles = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.medical_school) params.append('medical_school', filters.medical_school);
      if (filters.admission_year) params.append('admission_year', filters.admission_year);
      
      const response = await axios.get(`${API}/ec-profiles?${params}`);
      setProfiles(response.data);
    } catch (error) {
      toast.error('Error fetching EC profiles');
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
      
      {profile.leadership_activities.length > 0 && (
        <div className="profile-activities">
          <h4>Leadership Activities</h4>
          <div className="activity-tags">
            {profile.leadership_activities.map((activity, index) => (
              <span key={index} className="activity-tag">{activity}</span>
            ))}
          </div>
        </div>
      )}
      
      {profile.awards_scholarships.length > 0 && (
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
    <FeatureSection
      id="profiles"
      title="EC Profiles & Stats"
      description="Anonymous profiles and statistics from accepted Canadian medical school students."
      icon={BarChart3}
      image="https://images.unsplash.com/photo-1511174511562-5f7f18b874f8?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHw0fHxtZWRpY2FsJTIwcmVzZWFyY2h8ZW58MHx8fHwxNzU3OTkwMjE1fDA&ixlib=rb-4.1.0&q=85"
    >
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
    </FeatureSection>
  );
};

const VolunteerOpportunities = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [searchLocation, setSearchLocation] = useState('');

  useEffect(() => {
    fetchOpportunities();
  }, [searchLocation]);

  const fetchOpportunities = async () => {
    try {
      const params = new URLSearchParams();
      if (searchLocation) params.append('location', searchLocation);
      
      const response = await axios.get(`${API}/volunteer-opportunities?${params}`);
      setOpportunities(response.data);
    } catch (error) {
      toast.error('Error fetching volunteer opportunities');
    }
  };

  const OpportunityCard = ({ opportunity }) => (
    <div className="opportunity-card">
      <div className="opportunity-header">
        <h3 className="opportunity-title">{opportunity.title}</h3>
        <span className="opportunity-org">{opportunity.organization}</span>
      </div>
      
      <div className="opportunity-meta">
        <div className="meta-item">
          <MapPin size={16} />
          <span>{opportunity.location}</span>
        </div>
        <div className="meta-item">
          <Clock size={16} />
          <span>{opportunity.time_commitment}</span>
        </div>
      </div>
      
      <p className="opportunity-description">{opportunity.description}</p>
      
      {opportunity.requirements.length > 0 && (
        <div className="opportunity-requirements">
          <h4>Requirements</h4>
          <ul>
            {opportunity.requirements.map((req, index) => (
              <li key={index}>{req}</li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="opportunity-contact">
        <a href={`mailto:${opportunity.contact_email}`} className="contact-btn">
          <Mail size={16} />
          Apply Now
        </a>
        {opportunity.contact_phone && (
          <a href={`tel:${opportunity.contact_phone}`} className="phone-btn">
            <Phone size={16} />
            Call
          </a>
        )}
      </div>
    </div>
  );

  return (
    <FeatureSection
      id="volunteer"
      title="Volunteer Opportunities"
      description="Discover medical-related volunteer opportunities to build your experience and give back to the community."
      icon={Heart}
      image="https://images.pexels.com/photos/356040/pexels-photo-356040.jpeg"
    >
      <div className="opportunity-search">
        <div className="search-box">
          <MapPin size={20} />
          <input
            type="text"
            placeholder="Search by location..."
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

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
    </FeatureSection>
  );
};

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <img 
            src="https://customer-assets.emergentagent.com/job_137e70c1-f0f7-4e3d-8748-ad4447b6d332/artifacts/l3ze9cjg_Logo%20maker%20project%20%284%29.png" 
            alt="CURE Logo" 
            className="footer-logo"
          />
          <p className="footer-description">
            Connecting Canadian undergraduate students with research opportunities and medical school preparation resources.
          </p>
        </div>
        
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="#posters">Poster Journal</a></li>
            <li><a href="#students">Student Network</a></li>
            <li><a href="#professors">Professor Network</a></li>
            <li><a href="#profiles">EC Profiles</a></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Resources</h4>
          <ul>
            <li><a href="#volunteer">Volunteer Opportunities</a></li>
            <li><a href="#mcat">MCAT Prep (Coming Soon)</a></li>
            <li><a href="#courses">Course Resources (Coming Soon)</a></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Universities</h4>
          <ul>
            <li>University of Toronto</li>
            <li>University of Western Ontario</li>
            <li>McMaster University</li>
            <li>Queen's University</li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; 2024 CURE - Canadian Undergraduate Research Exchange. All rights reserved.</p>
      </div>
    </footer>
  );
};

const App = () => {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <BrowserRouter>
          <div className="App">
            <Header />
            <main>
              <Hero />
              <PosterJournal />
              <StudentNetwork />
              <ProfessorNetwork />
              <ECProfiles />
              <VolunteerOpportunities />
            </main>
            <Footer />
            <Toaster position="top-right" />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
};

export default App;