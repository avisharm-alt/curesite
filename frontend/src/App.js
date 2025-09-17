import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import './App.css';

// Import Lucide React icons
import { 
  BookOpen, Users, GraduationCap, Heart, FileText, 
  User, LogOut, Menu, X, Search, Filter, Plus,
  Star, MapPin, Clock, Mail, Phone, ExternalLink,
  Award, BarChart3, TrendingUp, Calendar, Home, Edit3, Save, Trash2, AlertTriangle, Download, Eye, ZoomIn
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

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

    // Check for auth callback in URL
    const urlParams = new URLSearchParams(window.location.search);
    const token_param = urlParams.get('token');
    const user_param = urlParams.get('user');
    
    if (token_param && user_param) {
      try {
        const userData = JSON.parse(decodeURIComponent(user_param));
        localStorage.setItem('token', token_param);
        setUser(userData);
        toast.success(`Welcome, ${userData.name}!`);
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (error) {
        console.error('Error parsing auth callback:', error);
        toast.error('Authentication failed. Please try again.');
      }
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

// Header Component
const Header = () => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Poster Journal', href: '/posters', icon: FileText },
    { name: 'Student Network', href: '/students', icon: Users },
    { name: 'Professor Network', href: '/professors', icon: GraduationCap },
    { name: 'EC Profiles', href: '/profiles', icon: BarChart3 },
    { name: 'Volunteer Opportunities', href: '/volunteer', icon: Heart },
    ...(user ? [{ name: 'My Profile', href: '/profile', icon: User }] : []),
    ...(user?.user_type === 'admin' ? [{ name: 'Admin Panel', href: '/admin', icon: Award }] : []),
  ];

  const handleGoogleLogin = () => {
    // Redirect to backend Google OAuth endpoint
    window.location.href = `${API}/auth/google`;
  };

  return (
    <header className="header">
      <nav className="nav-container">
        <div className="nav-brand">
          <Link to="/">
            <img 
              src="https://customer-assets.emergentagent.com/job_137e70c1-f0f7-4e3d-8748-ad4447b6d332/artifacts/l3ze9cjg_Logo%20maker%20project%20%284%29.png" 
              alt="CURE Logo" 
              className="logo"
            />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="nav-links">
          {navigation.map((item) => (
            <Link 
              key={item.name} 
              to={item.href} 
              className={`nav-link ${location.pathname === item.href ? 'active' : ''}`}
            >
              {item.name}
            </Link>
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
            <button onClick={handleGoogleLogin} className="google-login-btn">
              <img 
                src="https://developers.google.com/identity/images/g-logo.png" 
                alt="Google" 
                className="google-icon"
              />
              Sign in with Google
            </button>
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
            <Link 
              key={item.name} 
              to={item.href} 
              className="mobile-nav-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              <item.icon size={18} />
              {item.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
};

// Home Page Component
const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="page">
      {/* Hero Section */}
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
              <button 
                className="cta-primary"
                onClick={() => navigate('/students')}
              >
                Join the Network
              </button>
              <button 
                className="cta-secondary"
                onClick={() => navigate('/posters')}
              >
                Explore Resources
              </button>
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

      {/* Features Overview */}
      <section className="features-overview">
        <div className="container">
          <h2 className="section-title">Explore Our Platform</h2>
          <div className="features-grid">
            <div className="feature-card" onClick={() => navigate('/posters')}>
              <div className="feature-icon">
                <FileText size={32} />
              </div>
              <h3>Poster Journal</h3>
              <p>Showcase your research and discover groundbreaking work from students across Canada.</p>
            </div>
            
            <div className="feature-card" onClick={() => navigate('/students')}>
              <div className="feature-icon">
                <Users size={32} />
              </div>
              <h3>Student Network</h3>
              <p>Connect with like-minded undergraduate students passionate about research.</p>
            </div>
            
            <div className="feature-card" onClick={() => navigate('/professors')}>
              <div className="feature-icon">
                <GraduationCap size={32} />
              </div>
              <h3>Professor Network</h3>
              <p>Find faculty mentors for research opportunities and career guidance.</p>
            </div>
            
            <div className="feature-card" onClick={() => navigate('/profiles')}>
              <div className="feature-icon">
                <BarChart3 size={32} />
              </div>
              <h3>EC Profiles</h3>
              <p>Anonymous profiles and statistics from accepted Canadian medical students.</p>
            </div>
            
            <div className="feature-card" onClick={() => navigate('/volunteer')}>
              <div className="feature-icon">
                <Heart size={32} />
              </div>
              <h3>Volunteer Opportunities</h3>
              <p>Discover medical-related volunteer opportunities to build your experience.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// Poster Viewer Modal Component
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
  const viewerUrl = `${API}/posters/${poster.id}/view`;

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
          {loading && (
            <div className="poster-loading">
              <div className="loading-spinner"></div>
              <p>Loading poster...</p>
            </div>
          )}
          
          {error && (
            <div className="poster-error">
              <AlertTriangle size={48} />
              <h3>Unable to load poster</h3>
              <p>There was an error loading the poster file.</p>
              <button onClick={handleDownload} className="download-fallback-btn">
                <Download size={16} />
                Download Instead
              </button>
            </div>
          )}
          
          {fileType === 'pdf' && (
            <iframe
              src={viewerUrl}
              className="poster-pdf-viewer"
              onLoad={() => setLoading(false)}
              onError={() => {
                setLoading(false);
                setError(true);
              }}
              title={poster.title}
            />
          )}
          
          {fileType === 'image' && (
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

// Poster Journal Page
const PosterJournalPage = () => {
  const { user } = useAuth();
  const [posters, setPosters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: 'approved', university: '' });
  const [viewingPoster, setViewingPoster] = useState(null);

  useEffect(() => {
    fetchPosters();
  }, [filters]);

  const fetchPosters = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.university) params.append('university', filters.university);
      
      const response = await axios.get(`${API}/posters?${params}`);
      setPosters(response.data);
    } catch (error) {
      toast.error('Error fetching posters');
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
              onClick={() => handleViewPoster(poster)}
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

// Student Network Page
const StudentNetworkPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStudents();
  }, [searchTerm]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('research_interest', searchTerm);
      
      const response = await axios.get(`${API}/student-network?${params}`);
      setStudents(response.data);
    } catch (error) {
      toast.error('Error fetching student network');
    } finally {
      setLoading(false);
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
    <div className="page">
      <div className="page-header">
        <div className="page-icon">
          <Users size={32} />
        </div>
        <div>
          <h1 className="page-title">Student Network</h1>
          <p className="page-description">
            Connect with like-minded undergraduate students passionate about research and medical careers.
          </p>
        </div>
      </div>

      <div className="page-content">
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

        {loading ? (
          <div className="loading">Loading students...</div>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
};

// Professor Network Page
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

// EC Profiles Page
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

// My Profile Page
const MyProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(user || {});
  const [myPosters, setMyPosters] = useState([]);
  const [myNetworkProfile, setMyNetworkProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (user) {
      fetchMyData();
    }
  }, [user]);

  const fetchMyData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch my posters
      const postersResponse = await axios.get(`${API}/posters/my`, { headers });
      setMyPosters(postersResponse.data);

      // Try to fetch my network profile
      try {
        const networkResponse = await axios.get(`${API}/student-network/my`, { headers });
        setMyNetworkProfile(networkResponse.data);
      } catch (error) {
        // Network profile doesn't exist yet
        console.log('No network profile found');
      }

    } catch (error) {
      toast.error('Error fetching profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      await axios.put(`${API}/users/profile`, profile, { headers });
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error('Error updating profile');
    }
  };

  const handleNetworkProfileUpdate = async (networkData) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      if (myNetworkProfile) {
        await axios.put(`${API}/student-network/my`, networkData, { headers });
      } else {
        await axios.post(`${API}/student-network`, networkData, { headers });
      }
      
      toast.success('Network profile updated successfully!');
      fetchMyData(); // Refresh data
    } catch (error) {
      toast.error('Error updating network profile');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      await axios.delete(`${API}/users/account`, { headers });
      toast.success('Account deleted successfully');
      logout();
      navigate('/');
    } catch (error) {
      toast.error('Error deleting account');
    }
  };

  const handleDeleteMyPoster = async (posterId) => {
    if (!window.confirm('Are you sure you want to delete this poster?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      await axios.delete(`${API}/posters/${posterId}`, { headers });
      toast.success('Poster deleted successfully');
      fetchMyData(); // Refresh the data
    } catch (error) {
      toast.error('Error deleting poster');
    }
  };

  if (!user) {
    return (
      <div className="page">
        <div className="page-content">
          <div className="empty-state">
            <User size={48} />
            <h3>Please sign in to view your profile</h3>
            <p>Sign in with Google to access your profile and submissions.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page">
        <div className="page-content">
          <div className="loading">Loading your profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-icon">
          <User size={32} />
        </div>
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-description">
            Manage your profile, view your submissions, and update your research interests.
          </p>
        </div>
      </div>

      <div className="page-content">
        {/* Profile Information */}
        <div className="profile-section">
          <div className="section-header">
            <h2>Profile Information</h2>
            <button 
              onClick={() => isEditing ? handleProfileUpdate() : setIsEditing(true)}
              className="edit-btn"
            >
              {isEditing ? <Save size={18} /> : <Edit3 size={18} />}
              {isEditing ? 'Save Changes' : 'Edit Profile'}
            </button>
          </div>

          <div className="profile-form">
            <div className="form-grid">
              <div className="form-field">
                <label>Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.name || ''}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                    className="form-input"
                  />
                ) : (
                  <span className="form-value">{profile.name}</span>
                )}
              </div>

              <div className="form-field">
                <label>Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={profile.email || ''}
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                    className="form-input"
                  />
                ) : (
                  <span className="form-value">{profile.email}</span>
                )}
              </div>

              <div className="form-field">
                <label>University</label>
                {isEditing ? (
                  <select
                    value={profile.university || ''}
                    onChange={(e) => setProfile({...profile, university: e.target.value})}
                    className="form-input"
                  >
                    <option value="">Select University</option>
                    <option value="University of Toronto">University of Toronto</option>
                    <option value="University of Western Ontario">University of Western Ontario</option>
                    <option value="McMaster University">McMaster University</option>
                    <option value="Queen's University">Queen's University</option>
                    <option value="University of Ottawa">University of Ottawa</option>
                    <option value="University of British Columbia">University of British Columbia</option>
                    <option value="McGill University">McGill University</option>
                    <option value="University of Alberta">University of Alberta</option>
                  </select>
                ) : (
                  <span className="form-value">{profile.university || 'Not specified'}</span>
                )}
              </div>

              <div className="form-field">
                <label>Program</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.program || ''}
                    onChange={(e) => setProfile({...profile, program: e.target.value})}
                    className="form-input"
                    placeholder="e.g., Life Sciences, Biology, Chemistry"
                  />
                ) : (
                  <span className="form-value">{profile.program || 'Not specified'}</span>
                )}
              </div>

              <div className="form-field">
                <label>Year of Study</label>
                {isEditing ? (
                  <select
                    value={profile.year || ''}
                    onChange={(e) => setProfile({...profile, year: parseInt(e.target.value)})}
                    className="form-input"
                  >
                    <option value="">Select Year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                    <option value="5">5th Year+</option>
                  </select>
                ) : (
                  <span className="form-value">{profile.year ? `${profile.year}${profile.year === 1 ? 'st' : profile.year === 2 ? 'nd' : profile.year === 3 ? 'rd' : 'th'} Year` : 'Not specified'}</span>
                )}
              </div>

              <div className="form-field">
                <label>User Type</label>
                <span className="form-value user-type-badge">{profile.user_type}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Network Profile */}
        <NetworkProfileSection 
          networkProfile={myNetworkProfile}
          onUpdate={handleNetworkProfileUpdate}
        />

        {/* My Poster Submissions */}
        <div className="profile-section">
          <div className="section-header">
            <h2>My Poster Submissions</h2>
            <div className="section-actions">
              <span className="section-count">{myPosters.length} submissions</span>
              <Link to="/posters" className="add-btn">
                <Plus size={16} />
                Submit New Poster
              </Link>
            </div>
          </div>

          {myPosters.length > 0 ? (
            <div className="posters-grid">
              {myPosters.map((poster) => (
                <div key={poster.id} className="poster-card compact">
                  <div className="poster-header">
                    <h3 className="poster-title">{poster.title}</h3>
                    <span className={`status-badge status-${poster.status}`}>
                      {poster.status}
                    </span>
                  </div>
                  <div className="poster-meta">
                    <span className="poster-university">{poster.university}</span>
                    <span className="poster-program">{poster.program}</span>
                  </div>
                  <p className="poster-abstract">{poster.abstract.length > 150 ? poster.abstract.substring(0, 150) + '...' : poster.abstract}</p>
                  <div className="poster-footer">
                    <div className="poster-keywords">
                      {poster.keywords.slice(0, 3).map((keyword, index) => (
                        <span key={index} className="keyword-tag small">{keyword}</span>
                      ))}
                      {poster.keywords.length > 3 && (
                        <span className="keyword-tag small">+{poster.keywords.length - 3} more</span>
                      )}
                    </div>
                    <div className="poster-profile-actions">
                      <div className="poster-date">
                        <small>{new Date(poster.submitted_at).toLocaleDateString()}</small>
                      </div>
                      <button
                        onClick={() => handleDeleteMyPoster(poster.id)}
                        className="delete-my-poster-btn"
                        title="Delete this poster"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state compact">
              <FileText size={32} />
              <h3>No poster submissions yet</h3>
              <p>Submit your first research poster to showcase your work!</p>
            </div>
          )}
        </div>

        {/* Account Settings */}
        <div className="profile-section danger-section">
          <div className="section-header">
            <h2>Account Settings</h2>
          </div>
          
          <div className="danger-zone">
            <div className="danger-content">
              <div className="danger-info">
                <h3>Delete Account</h3>
                <p>Permanently delete your account and all associated data. This action cannot be undone.</p>
              </div>
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="delete-account-btn"
              >
                <Trash2 size={18} />
                Delete Account
              </button>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <AlertTriangle size={24} className="warning-icon" />
                <h3>Delete Account</h3>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete your account? This will permanently remove:</p>
                <ul>
                  <li>Your profile information</li>
                  <li>All poster submissions</li>
                  <li>Network profile and connections</li>
                  <li>EC profile data</li>
                  <li>All posted volunteer opportunities</li>
                </ul>
                <p><strong>This action cannot be undone.</strong></p>
              </div>
              <div className="modal-actions">
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="cancel-btn"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteAccount}
                  className="confirm-delete-btn"
                >
                  <Trash2 size={16} />
                  Delete My Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Network Profile Section Component
const NetworkProfileSection = ({ networkProfile, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    research_interests: networkProfile?.research_interests || [],
    skills: networkProfile?.skills || [],
    looking_for: networkProfile?.looking_for || [],
    contact_preferences: networkProfile?.contact_preferences || 'Email',
    public_profile: networkProfile?.public_profile ?? true
  });

  const handleSave = () => {
    onUpdate(formData);
    setIsEditing(false);
  };

  const handleArrayInput = (field, value) => {
    const array = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData({...formData, [field]: array});
  };

  return (
    <div className="profile-section">
      <div className="section-header">
        <h2>Research Network Profile</h2>
        <button 
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className="edit-btn"
        >
          {isEditing ? <Save size={18} /> : <Edit3 size={18} />}
          {isEditing ? 'Save Changes' : networkProfile ? 'Edit Profile' : 'Create Profile'}
        </button>
      </div>

      <div className="network-form">
        <div className="form-grid">
          <div className="form-field">
            <label>Research Interests</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.research_interests.join(', ')}
                onChange={(e) => handleArrayInput('research_interests', e.target.value)}
                className="form-input"
                placeholder="e.g., Molecular Biology, Cancer Research, Neuroscience"
              />
            ) : (
              <div className="tags-display">
                {formData.research_interests.map((interest, index) => (
                  <span key={index} className="interest-tag">{interest}</span>
                ))}
                {formData.research_interests.length === 0 && <span className="form-value">Not specified</span>}
              </div>
            )}
            {isEditing && <small>Separate multiple interests with commas</small>}
          </div>

          <div className="form-field">
            <label>Skills</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.skills.join(', ')}
                onChange={(e) => handleArrayInput('skills', e.target.value)}
                className="form-input"
                placeholder="e.g., Python, Laboratory Techniques, Data Analysis"
              />
            ) : (
              <div className="tags-display">
                {formData.skills.map((skill, index) => (
                  <span key={index} className="skill-tag">{skill}</span>
                ))}
                {formData.skills.length === 0 && <span className="form-value">Not specified</span>}
              </div>
            )}
            {isEditing && <small>Separate multiple skills with commas</small>}
          </div>

          <div className="form-field">
            <label>Looking For</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.looking_for.join(', ')}
                onChange={(e) => handleArrayInput('looking_for', e.target.value)}
                className="form-input"
                placeholder="e.g., Research Opportunities, Collaboration, Mentorship"
              />
            ) : (
              <div className="tags-display">
                {formData.looking_for.map((item, index) => (
                  <span key={index} className="looking-for-tag">{item}</span>
                ))}
                {formData.looking_for.length === 0 && <span className="form-value">Not specified</span>}
              </div>
            )}
            {isEditing && <small>Separate multiple items with commas</small>}
          </div>

          <div className="form-field">
            <label>Contact Preferences</label>
            {isEditing ? (
              <select
                value={formData.contact_preferences}
                onChange={(e) => setFormData({...formData, contact_preferences: e.target.value})}
                className="form-input"
              >
                <option value="Email">Email</option>
                <option value="Through Platform">Through Platform</option>
                <option value="LinkedIn">LinkedIn</option>
              </select>
            ) : (
              <span className="form-value">{formData.contact_preferences}</span>
            )}
          </div>

          <div className="form-field">
            <label className="checkbox-label">
              {isEditing ? (
                <input
                  type="checkbox"
                  checked={formData.public_profile}
                  onChange={(e) => setFormData({...formData, public_profile: e.target.checked})}
                />
              ) : (
                <input
                  type="checkbox"
                  checked={formData.public_profile}
                  disabled
                />
              )}
              Make my profile visible to other students
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

// Submit Poster Page
const SubmitPosterPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    authors: '',
    abstract: '',
    keywords: '',
    university: user?.university || '',
    program: user?.program || ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to submit a poster');
      return;
    }

    if (!selectedFile) {
      toast.error('Please select a poster file to upload');
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // First, upload the file
      const fileFormData = new FormData();
      fileFormData.append('file', selectedFile);

      const uploadResponse = await axios.post(`${API}/posters/upload`, fileFormData, {
        headers: {
          ...headers,
          'Content-Type': 'multipart/form-data'
        }
      });

      // Then, submit the poster data with file reference
      const posterData = {
        ...formData,
        authors: formData.authors.split(',').map(author => author.trim()).filter(author => author),
        keywords: formData.keywords.split(',').map(keyword => keyword.trim()).filter(keyword => keyword),
        poster_url: uploadResponse.data.file_path
      };

      await axios.post(`${API}/posters`, posterData, { headers });
      toast.success('Poster submitted successfully! It will be reviewed by our team.');
      navigate('/posters');
    } catch (error) {
      toast.error('Error submitting poster: ' + (error.response?.data?.detail || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please select a PDF or image file (PNG, JPG, JPEG)');
        return;
      }
      
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      
      setSelectedFile(file);
    }
  };

  if (!user) {
    return (
      <div className="page">
        <div className="page-content">
          <div className="empty-state">
            <FileText size={48} />
            <h3>Please sign in to submit a poster</h3>
            <p>Sign in with Google to submit your research poster.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-icon">
          <Plus size={32} />
        </div>
        <div>
          <h1 className="page-title">Submit Poster</h1>
          <p className="page-description">
            Submit your research poster for review and publication in the journal.
          </p>
        </div>
      </div>

      <div className="page-content">
        <form onSubmit={handleSubmit} className="poster-form">
          <div className="form-section">
            <h3>Poster Information</h3>
            
            <div className="form-field">
              <label htmlFor="title">Poster Title *</label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="form-input"
                required
                placeholder="Enter your poster title"
              />
            </div>

            <div className="form-field">
              <label htmlFor="authors">Authors *</label>
              <input
                type="text"
                id="authors"
                value={formData.authors}
                onChange={(e) => setFormData({...formData, authors: e.target.value})}
                className="form-input"
                required
                placeholder="Enter authors separated by commas (e.g., John Doe, Jane Smith)"
              />
              <small>Separate multiple authors with commas</small>
            </div>

            <div className="form-field">
              <label htmlFor="abstract">Abstract *</label>
              <textarea
                id="abstract"
                value={formData.abstract}
                onChange={(e) => setFormData({...formData, abstract: e.target.value})}
                className="form-textarea"
                required
                rows={6}
                placeholder="Enter your poster abstract (maximum 500 words)"
              />
            </div>

            <div className="form-field">
              <label htmlFor="keywords">Keywords *</label>
              <input
                type="text"
                id="keywords"
                value={formData.keywords}
                onChange={(e) => setFormData({...formData, keywords: e.target.value})}
                className="form-input"
                required
                placeholder="Enter keywords separated by commas (e.g., cancer research, immunotherapy)"
              />
              <small>Separate keywords with commas</small>
            </div>

            <div className="form-field">
              <label htmlFor="poster-file">Poster File *</label>
              <input
                type="file"
                id="poster-file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                className="file-input"
                required
              />
              <small>Upload your poster as PDF or image (PNG, JPG, JPEG). Max size: 10MB</small>
              {selectedFile && (
                <div className="file-selected">
                  <span className="file-name">Selected: {selectedFile.name}</span>
                  <span className="file-size">({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
              )}
            </div>
          </div>

          <div className="form-section">
            <h3>Institution Information</h3>
            
            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="university">University *</label>
                <select
                  id="university"
                  value={formData.university}
                  onChange={(e) => setFormData({...formData, university: e.target.value})}
                  className="form-input"
                  required
                >
                  <option value="">Select University</option>
                  <option value="University of Toronto">University of Toronto</option>
                  <option value="University of Western Ontario">University of Western Ontario</option>
                  <option value="McMaster University">McMaster University</option>
                  <option value="Queen's University">Queen's University</option>
                  <option value="University of Ottawa">University of Ottawa</option>
                  <option value="University of British Columbia">University of British Columbia</option>
                  <option value="McGill University">McGill University</option>
                  <option value="University of Alberta">University of Alberta</option>
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="program">Program *</label>
                <input
                  type="text"
                  id="program"
                  value={formData.program}
                  onChange={(e) => setFormData({...formData, program: e.target.value})}
                  className="form-input"
                  required
                  placeholder="e.g., Life Sciences, Biology, Chemistry"
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/posters')}
              className="cancel-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="submit-btn"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Poster'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Admin Tab Components
const PosterManagementTab = ({ posters, onReview, onDelete }) => (
  <div className="admin-section">
    <h2>Poster Management</h2>
    {posters.length > 0 ? (
      <div className="admin-posters">
        {posters.map((poster) => (
          <div key={poster.id} className="admin-poster-card">
            <div className="poster-header">
              <h3>{poster.title}</h3>
              <div className="poster-meta-header">
                <span className={`status-badge status-${poster.status}`}>{poster.status}</span>
                <span className="submitted-date">
                  {new Date(poster.submitted_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            
            <div className="poster-details">
              <div className="poster-authors">
                <strong>Authors:</strong> {poster.authors.join(', ')}
              </div>
              <div className="poster-institution">
                <strong>Institution:</strong> {poster.university} - {poster.program}
              </div>
              <div className="poster-abstract">
                <strong>Abstract:</strong>
                <p>{poster.abstract}</p>
              </div>
              <div className="poster-keywords">
                <strong>Keywords:</strong>
                <div className="keywords-list">
                  {poster.keywords.map((keyword, index) => (
                    <span key={index} className="keyword-tag">{keyword}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="admin-actions">
              {poster.poster_url && (
                <>
                  <button
                    onClick={() => {
                      const token = localStorage.getItem('token');
                      const viewUrl = `${API}/admin/posters/${poster.id}/view`;
                      window.open(viewUrl, '_blank');
                    }}
                    className="view-btn"
                  >
                    <Eye size={16} />
                    View
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      const token = localStorage.getItem('token');
                      fetch(`${API}/admin/posters/${poster.id}/download`, {
                        headers: { Authorization: `Bearer ${token}` }
                      })
                      .then(response => response.blob())
                      .then(blob => {
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${poster.title}.pdf`;
                        document.body.appendChild(a);
                        a.click();
                        window.URL.revokeObjectURL(url);
                        document.body.removeChild(a);
                        toast.success('Downloaded successfully');
                      })
                      .catch(() => toast.error('Download failed'));
                    }}
                    className="download-btn"
                  >
                    <Download size={16} />
                    Download
                  </button>
                </>
              )}
              
              {poster.status === 'pending' && (
                <>
                  <button
                    onClick={() => onReview(poster.id, 'approved')}
                    className="approve-btn"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => onReview(poster.id, 'rejected', 'Does not meet quality standards')}
                    className="reject-btn"
                  >
                    Reject
                  </button>
                </>
              )}
              
              <button
                onClick={() => onDelete(poster.id)}
                className="admin-delete-btn"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="empty-state">
        <FileText size={48} />
        <h3>No posters found</h3>
        <p>No poster submissions in the system yet.</p>
      </div>
    )}
  </div>
);

const ProfessorManagementTab = ({ professors, onDelete, onAdd }) => (
  <div className="admin-section">
    <div className="section-header">
      <h2>Professor Network Management</h2>
      <button onClick={onAdd} className="add-new-btn">
        <Plus size={16} />
        Add Professor
      </button>
    </div>
    
    {professors.length > 0 ? (
      <div className="admin-items-grid">
        {professors.map((professor) => (
          <div key={professor.id} className="admin-item-card">
            <div className="item-header">
              <h3>{professor.user_name}</h3>
              <button onClick={() => onDelete(professor.id)} className="delete-item-btn">
                <Trash2 size={16} />
              </button>
            </div>
            <p><strong>Department:</strong> {professor.department}</p>
            <p><strong>Email:</strong> {professor.contact_email}</p>
            <p><strong>Research Areas:</strong> {professor.research_areas.join(', ')}</p>
            <p><strong>Accepting Students:</strong> {professor.accepting_students ? 'Yes' : 'No'}</p>
            {professor.website && (
              <p><strong>Website:</strong> <a href={professor.website} target="_blank" rel="noopener noreferrer">{professor.website}</a></p>
            )}
          </div>
        ))}
      </div>
    ) : (
      <div className="empty-state">
        <GraduationCap size={48} />
        <h3>No professors found</h3>
        <p>Add professors to the network.</p>
      </div>
    )}
  </div>
);

const VolunteerManagementTab = ({ opportunities, onDelete, onAdd }) => (
  <div className="admin-section">
    <div className="section-header">
      <h2>Volunteer Opportunities Management</h2>
      <button onClick={onAdd} className="add-new-btn">
        <Plus size={16} />
        Add Opportunity
      </button>
    </div>
    
    {opportunities.length > 0 ? (
      <div className="admin-items-grid">
        {opportunities.map((opportunity) => (
          <div key={opportunity.id} className="admin-item-card">
            <div className="item-header">
              <h3>{opportunity.title}</h3>
              <button onClick={() => onDelete(opportunity.id)} className="delete-item-btn">
                <Trash2 size={16} />
              </button>
            </div>
            <p><strong>Organization:</strong> {opportunity.organization}</p>
            <p><strong>Location:</strong> {opportunity.location}</p>
            <p><strong>Time Commitment:</strong> {opportunity.time_commitment}</p>
            <p><strong>Contact:</strong> {opportunity.contact_email}</p>
            <p className="item-description">{opportunity.description}</p>
          </div>
        ))}
      </div>
    ) : (
      <div className="empty-state">
        <Heart size={48} />
        <h3>No volunteer opportunities found</h3>
        <p>Add volunteer opportunities for students.</p>
      </div>
    )}
  </div>
);

const ECProfileManagementTab = ({ profiles, onDelete, onAdd }) => (
  <div className="admin-section">
    <div className="section-header">
      <h2>EC Profiles Management</h2>
      <button onClick={onAdd} className="add-new-btn">
        <Plus size={16} />
        Add EC Profile
      </button>
    </div>
    
    {profiles.length > 0 ? (
      <div className="admin-items-grid">
        {profiles.map((profile) => (
          <div key={profile.id} className="admin-item-card">
            <div className="item-header">
              <h3>{profile.medical_school}</h3>
              <button onClick={() => onDelete(profile.id)} className="delete-item-btn">
                <Trash2 size={16} />
              </button>
            </div>
            <p><strong>Admission Year:</strong> {profile.admission_year}</p>
            <p><strong>Undergraduate GPA:</strong> {profile.undergraduate_gpa}</p>
            {profile.mcat_score && <p><strong>MCAT Score:</strong> {profile.mcat_score}</p>}
            <p><strong>Research Hours:</strong> {profile.research_hours || 'N/A'}</p>
            <p><strong>Volunteer Hours:</strong> {profile.volunteer_hours || 'N/A'}</p>
          </div>
        ))}
      </div>
    ) : (
      <div className="empty-state">
        <BarChart3 size={48} />
        <h3>No EC profiles found</h3>
        <p>Add EC profiles to help students understand admission statistics.</p>
      </div>
    )}
  </div>
);

// Modal Components for Adding New Items
const AddProfessorModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    contact_email: '',
    department: '',
    research_areas: '',
    lab_description: '',
    accepting_students: true,
    website: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const submitData = {
        ...formData,
        research_areas: formData.research_areas.split(',').map(area => area.trim())
      };
      
      await axios.post(`${API}/admin/professor-network`, submitData, { headers });
      toast.success('Professor added successfully');
      onSuccess();
    } catch (error) {
      toast.error('Error adding professor');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Add Professor</h3>
          <button onClick={onClose} className="close-modal-btn">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-grid">
            <div className="form-field">
              <label>Email *</label>
              <input
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                className="form-input"
                required
              />
            </div>
            
            <div className="form-field">
              <label>Department *</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
                className="form-input"
                required
              />
            </div>
            
            <div className="form-field">
              <label>Research Areas *</label>
              <input
                type="text"
                value={formData.research_areas}
                onChange={(e) => setFormData({...formData, research_areas: e.target.value})}
                className="form-input"
                placeholder="Separate with commas"
                required
              />
            </div>
            
            <div className="form-field">
              <label>Website</label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({...formData, website: e.target.value})}
                className="form-input"
              />
            </div>
          </div>
          
          <div className="form-field">
            <label>Lab Description *</label>
            <textarea
              value={formData.lab_description}
              onChange={(e) => setFormData({...formData, lab_description: e.target.value})}
              className="form-textarea"
              required
            />
          </div>
          
          <div className="form-field">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.accepting_students}
                onChange={(e) => setFormData({...formData, accepting_students: e.target.checked})}
              />
              Currently accepting students
            </label>
          </div>
          
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">Cancel</button>
            <button type="submit" className="submit-btn">Add Professor</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AddVolunteerModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    organization: '',
    description: '',
    location: '',
    contact_email: '',
    contact_phone: '',
    requirements: '',
    time_commitment: '',
    expires_at: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const submitData = {
        ...formData,
        requirements: formData.requirements ? formData.requirements.split(',').map(req => req.trim()) : [],
        expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null
      };
      
      await axios.post(`${API}/admin/volunteer-opportunities`, submitData, { headers });
      toast.success('Volunteer opportunity added successfully');
      onSuccess();
    } catch (error) {
      toast.error('Error adding volunteer opportunity');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Add Volunteer Opportunity</h3>
          <button onClick={onClose} className="close-modal-btn">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-grid">
            <div className="form-field">
              <label>Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="form-input"
                required
              />
            </div>
            
            <div className="form-field">
              <label>Organization *</label>
              <input
                type="text"
                value={formData.organization}
                onChange={(e) => setFormData({...formData, organization: e.target.value})}
                className="form-input"
                required
              />
            </div>
            
            <div className="form-field">
              <label>Location *</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="form-input"
                required
              />
            </div>
            
            <div className="form-field">
              <label>Time Commitment *</label>
              <input
                type="text"
                value={formData.time_commitment}
                onChange={(e) => setFormData({...formData, time_commitment: e.target.value})}
                className="form-input"
                placeholder="e.g., 4 hours/week"
                required
              />
            </div>
            
            <div className="form-field">
              <label>Contact Email *</label>
              <input
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                className="form-input"
                required
              />
            </div>
            
            <div className="form-field">
              <label>Contact Phone</label>
              <input
                type="tel"
                value={formData.contact_phone}
                onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
                className="form-input"
              />
            </div>
          </div>
          
          <div className="form-field">
            <label>Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="form-textarea"
              required
            />
          </div>
          
          <div className="form-field">
            <label>Requirements</label>
            <input
              type="text"
              value={formData.requirements}
              onChange={(e) => setFormData({...formData, requirements: e.target.value})}
              className="form-input"
              placeholder="Separate with commas"
            />
          </div>
          
          <div className="form-field">
            <label>Expires At</label>
            <input
              type="date"
              value={formData.expires_at}
              onChange={(e) => setFormData({...formData, expires_at: e.target.value})}
              className="form-input"
            />
          </div>
          
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">Cancel</button>
            <button type="submit" className="submit-btn">Add Opportunity</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AddECProfileModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    medical_school: '',
    admission_year: new Date().getFullYear(),
    undergraduate_gpa: '',
    mcat_score: '',
    research_hours: '',
    volunteer_hours: '',
    clinical_hours: '',
    leadership_activities: '',
    awards_scholarships: '',
    publications: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const submitData = {
        ...formData,
        admission_year: parseInt(formData.admission_year),
        undergraduate_gpa: parseFloat(formData.undergraduate_gpa),
        mcat_score: formData.mcat_score ? parseInt(formData.mcat_score) : null,
        research_hours: formData.research_hours ? parseInt(formData.research_hours) : null,
        volunteer_hours: formData.volunteer_hours ? parseInt(formData.volunteer_hours) : null,
        clinical_hours: formData.clinical_hours ? parseInt(formData.clinical_hours) : null,
        publications: formData.publications ? parseInt(formData.publications) : null,
        leadership_activities: formData.leadership_activities ? formData.leadership_activities.split(',').map(item => item.trim()) : [],
        awards_scholarships: formData.awards_scholarships ? formData.awards_scholarships.split(',').map(item => item.trim()) : []
      };
      
      await axios.post(`${API}/admin/ec-profiles`, submitData, { headers });
      toast.success('EC profile added successfully');
      onSuccess();
    } catch (error) {
      toast.error('Error adding EC profile');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Add EC Profile</h3>
          <button onClick={onClose} className="close-modal-btn">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-grid">
            <div className="form-field">
              <label>Medical School *</label>
              <select
                value={formData.medical_school}
                onChange={(e) => setFormData({...formData, medical_school: e.target.value})}
                className="form-input"
                required
              >
                <option value="">Select Medical School</option>
                <option value="University of Toronto">University of Toronto</option>
                <option value="University of Western Ontario">University of Western Ontario</option>
                <option value="McMaster University">McMaster University</option>
                <option value="Queen's University">Queen's University</option>
                <option value="University of Ottawa">University of Ottawa</option>
              </select>
            </div>
            
            <div className="form-field">
              <label>Admission Year *</label>
              <input
                type="number"
                value={formData.admission_year}
                onChange={(e) => setFormData({...formData, admission_year: e.target.value})}
                className="form-input"
                min="2020"
                max="2030"
                required
              />
            </div>
            
            <div className="form-field">
              <label>Undergraduate GPA *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="4.0"
                value={formData.undergraduate_gpa}
                onChange={(e) => setFormData({...formData, undergraduate_gpa: e.target.value})}
                className="form-input"
                required
              />
            </div>
            
            <div className="form-field">
              <label>MCAT Score</label>
              <input
                type="number"
                min="472"
                max="528"
                value={formData.mcat_score}
                onChange={(e) => setFormData({...formData, mcat_score: e.target.value})}
                className="form-input"
              />
            </div>
            
            <div className="form-field">
              <label>Research Hours</label>
              <input
                type="number"
                value={formData.research_hours}
                onChange={(e) => setFormData({...formData, research_hours: e.target.value})}
                className="form-input"
              />
            </div>
            
            <div className="form-field">
              <label>Volunteer Hours</label>
              <input
                type="number"
                value={formData.volunteer_hours}
                onChange={(e) => setFormData({...formData, volunteer_hours: e.target.value})}
                className="form-input"
              />
            </div>
          </div>
          
          <div className="form-field">
            <label>Leadership Activities</label>
            <input
              type="text"
              value={formData.leadership_activities}
              onChange={(e) => setFormData({...formData, leadership_activities: e.target.value})}
              className="form-input"
              placeholder="Separate with commas"
            />
          </div>
          
          <div className="form-field">
            <label>Awards & Scholarships</label>
            <input
              type="text"
              value={formData.awards_scholarships}
              onChange={(e) => setFormData({...formData, awards_scholarships: e.target.value})}
              className="form-input"
              placeholder="Separate with commas"
            />
          </div>
          
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">Cancel</button>
            <button type="submit" className="submit-btn">Add EC Profile</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Admin Panel Page
const AdminPanelPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('posters');
  const [pendingPosters, setPendingPosters] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [volunteerOpportunities, setVolunteerOpportunities] = useState([]);
  const [ecProfiles, setEcProfiles] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [showAddProfessor, setShowAddProfessor] = useState(false);
  const [showAddVolunteer, setShowAddVolunteer] = useState(false);
  const [showAddECProfile, setShowAddECProfile] = useState(false);

  useEffect(() => {
    if (user?.user_type === 'admin') {
      fetchAdminData();
    }
  }, [user]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [postersResponse, professorsResponse, volunteerResponse, ecProfilesResponse, statsResponse] = await Promise.all([
        axios.get(`${API}/admin/posters/all`, { headers }),
        axios.get(`${API}/admin/professor-network`, { headers }),
        axios.get(`${API}/admin/volunteer-opportunities`, { headers }),
        axios.get(`${API}/admin/ec-profiles`, { headers }),
        axios.get(`${API}/admin/stats`, { headers })
      ]);

      setPendingPosters(postersResponse.data);
      setProfessors(professorsResponse.data);
      setVolunteerOpportunities(volunteerResponse.data);
      setEcProfiles(ecProfilesResponse.data);
      setStats(statsResponse.data);
    } catch (error) {
      toast.error('Error fetching admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewPoster = async (posterId, status, comments = '') => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      await axios.put(`${API}/posters/${posterId}/review?status=${status}&comments=${encodeURIComponent(comments)}`, {}, { headers });
      toast.success(`Poster ${status} successfully`);
      fetchAdminData(); // Refresh data
    } catch (error) {
      toast.error('Error reviewing poster');
    }
  };

  const handleDeleteAdminPoster = async (posterId) => {
    if (!window.confirm('Are you sure you want to permanently delete this poster?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      await axios.delete(`${API}/posters/${posterId}`, { headers });
      toast.success('Poster deleted successfully');
      fetchAdminData(); // Refresh data
    } catch (error) {
      toast.error('Error deleting poster');
    }
  };

  const handleDeleteProfessor = async (professorId) => {
    if (!window.confirm('Are you sure you want to delete this professor profile?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      await axios.delete(`${API}/admin/professor-network/${professorId}`, { headers });
      toast.success('Professor profile deleted successfully');
      fetchAdminData();
    } catch (error) {
      toast.error('Error deleting professor profile');
    }
  };

  const handleDeleteVolunteerOpportunity = async (opportunityId) => {
    if (!window.confirm('Are you sure you want to delete this volunteer opportunity?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      await axios.delete(`${API}/admin/volunteer-opportunities/${opportunityId}`, { headers });
      toast.success('Volunteer opportunity deleted successfully');
      fetchAdminData();
    } catch (error) {
      toast.error('Error deleting volunteer opportunity');
    }
  };

  const handleDeleteECProfile = async (profileId) => {
    if (!window.confirm('Are you sure you want to delete this EC profile?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      await axios.delete(`${API}/admin/ec-profiles/${profileId}`, { headers });
      toast.success('EC profile deleted successfully');
      fetchAdminData();
    } catch (error) {
      toast.error('Error deleting EC profile');
    }
  };

  if (!user || user.user_type !== 'admin') {
    return (
      <div className="page">
        <div className="page-content">
          <div className="empty-state">
            <Award size={48} />
            <h3>Admin Access Required</h3>
            <p>You need admin privileges to access this page.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page">
        <div className="page-content">
          <div className="loading">Loading admin panel...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-icon">
          <Award size={32} />
        </div>
        <div>
          <h1 className="page-title">Admin Panel</h1>
          <p className="page-description">
            Manage poster submissions and review platform statistics.
          </p>
        </div>
      </div>

      <div className="page-content">
        {/* Statistics */}
        <div className="admin-stats">
          <div className="stat-card">
            <h3>Total Users</h3>
            <span className="stat-number">{stats.total_users}</span>
          </div>
          <div className="stat-card">
            <h3>Total Posters</h3>
            <span className="stat-number">{stats.total_posters}</span>
          </div>
          <div className="stat-card">
            <h3>Pending Review</h3>
            <span className="stat-number pending">{stats.pending_posters}</span>
          </div>
          <div className="stat-card">
            <h3>Approved</h3>
            <span className="stat-number approved">{stats.approved_posters}</span>
          </div>
        </div>

        {/* Admin Tabs */}
        <div className="admin-tabs">
          <button 
            className={`admin-tab ${activeTab === 'posters' ? 'active' : ''}`}
            onClick={() => setActiveTab('posters')}
          >
            <FileText size={16} />
            Poster Management
          </button>
          <button 
            className={`admin-tab ${activeTab === 'professors' ? 'active' : ''}`}
            onClick={() => setActiveTab('professors')}
          >
            <GraduationCap size={16} />
            Professor Network
          </button>
          <button 
            className={`admin-tab ${activeTab === 'volunteer' ? 'active' : ''}`}
            onClick={() => setActiveTab('volunteer')}
          >
            <Heart size={16} />
            Volunteer Opportunities
          </button>
          <button 
            className={`admin-tab ${activeTab === 'ecprofiles' ? 'active' : ''}`}
            onClick={() => setActiveTab('ecprofiles')}
          >
            <BarChart3 size={16} />
            EC Profiles
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'posters' && (
          <PosterManagementTab 
            posters={pendingPosters}
            onReview={handleReviewPoster}
            onDelete={handleDeleteAdminPoster}
          />
        )}

        {activeTab === 'professors' && (
          <ProfessorManagementTab 
            professors={professors}
            onDelete={handleDeleteProfessor}
            onAdd={() => setShowAddProfessor(true)}
          />
        )}

        {activeTab === 'volunteer' && (
          <VolunteerManagementTab 
            opportunities={volunteerOpportunities}
            onDelete={handleDeleteVolunteerOpportunity}
            onAdd={() => setShowAddVolunteer(true)}
          />
        )}

        {activeTab === 'ecprofiles' && (
          <ECProfileManagementTab 
            profiles={ecProfiles}
            onDelete={handleDeleteECProfile}
            onAdd={() => setShowAddECProfile(true)}
          />
        )}

        {/* Add Forms */}
        {showAddProfessor && (
          <AddProfessorModal 
            onClose={() => setShowAddProfessor(false)}
            onSuccess={() => {
              setShowAddProfessor(false);
              fetchAdminData();
            }}
          />
        )}

        {showAddVolunteer && (
          <AddVolunteerModal 
            onClose={() => setShowAddVolunteer(false)}
            onSuccess={() => {
              setShowAddVolunteer(false);
              fetchAdminData();
            }}
          />
        )}

        {showAddECProfile && (
          <AddECProfileModal 
            onClose={() => setShowAddECProfile(false)}
            onSuccess={() => {
              setShowAddECProfile(false);
              fetchAdminData();
            }}
          />
        )}
      </div>
    </div>
  );
};

// Volunteer Opportunities Page
const VolunteerOpportunitiesPage = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLocation, setSearchLocation] = useState('');

  useEffect(() => {
    fetchOpportunities();
  }, [searchLocation]);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchLocation) params.append('location', searchLocation);
      
      const response = await axios.get(`${API}/volunteer-opportunities?${params}`);
      setOpportunities(response.data);
    } catch (error) {
      toast.error('Error fetching volunteer opportunities');
    } finally {
      setLoading(false);
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
      
      {opportunity.requirements && opportunity.requirements.length > 0 && (
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

// Footer Component
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
            <li><Link to="/posters">Poster Journal</Link></li>
            <li><Link to="/students">Student Network</Link></li>
            <li><Link to="/professors">Professor Network</Link></li>
            <li><Link to="/profiles">EC Profiles</Link></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Resources</h4>
          <ul>
            <li><Link to="/volunteer">Volunteer Opportunities</Link></li>
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

// Main App Component
const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="App">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/posters" element={<PosterJournalPage />} />
              <Route path="/students" element={<StudentNetworkPage />} />
              <Route path="/professors" element={<ProfessorNetworkPage />} />
              <Route path="/profiles" element={<ECProfilesPage />} />
              <Route path="/volunteer" element={<VolunteerOpportunitiesPage />} />
              <Route path="/profile" element={<MyProfilePage />} />
              <Route path="/submit-poster" element={<SubmitPosterPage />} />
              <Route path="/admin" element={<AdminPanelPage />} />
            </Routes>
          </main>
          <Footer />
          <Toaster position="top-right" />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;