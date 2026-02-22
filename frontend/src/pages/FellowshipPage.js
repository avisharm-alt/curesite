import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Award, BookOpen, Users, Clock, CheckCircle, FileText, 
  ChevronDown, ChevronUp, Lock, Upload, X, Linkedin, 
  GraduationCap, Target, Lightbulb, Star
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const FellowshipPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [existingApplication, setExistingApplication] = useState(null);
  const [stats, setStats] = useState(null);
  const [expandedPhase, setExpandedPhase] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const applicationRef = useRef(null);
  const structureRef = useRef(null);
  
  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    university: '',
    program: '',
    year_of_study: '',
    research_interests: [],
    prior_experience: '',
    statement_of_interest: '',
    proposed_research_idea: '',
    commitment_confirmed: false
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [customInterest, setCustomInterest] = useState('');

  const researchInterestOptions = [
    'Life Sciences',
    'Engineering', 
    'AI / Computer Science',
    'Social Sciences',
    'Humanities',
    'Health & Medicine',
    'Policy & Public Health',
    'Environmental Science'
  ];

  const yearOptions = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year+', 'Graduate'];

  const programPhases = [
    {
      id: 1,
      title: 'Research Foundations',
      duration: 'Weeks 1–3',
      description: 'Build your research toolkit and refine your question.',
      deliverables: [
        'Complete research methods orientation',
        'Finalize research question with mentor guidance',
        'Submit annotated bibliography'
      ],
      expectations: [
        'Attend weekly seminars',
        'Complete assigned readings',
        'Participate in peer discussion groups'
      ]
    },
    {
      id: 2,
      title: 'Manuscript Development',
      duration: 'Weeks 4–6',
      description: 'Draft your scholarly manuscript under structured guidance.',
      deliverables: [
        'Submit first draft of manuscript',
        'Develop figures and data visualizations',
        'Complete methods section review'
      ],
      expectations: [
        'Meet bi-weekly with assigned mentor',
        'Submit progress updates',
        'Integrate feedback iteratively'
      ]
    },
    {
      id: 3,
      title: 'Structured Peer Review',
      duration: 'Weeks 7–8',
      description: 'Experience rigorous academic peer review.',
      deliverables: [
        'Complete peer reviews of fellow manuscripts',
        'Revise manuscript based on peer feedback',
        'Submit response to reviewers document'
      ],
      expectations: [
        'Provide constructive, academic-quality feedback',
        'Engage with critique professionally',
        'Demonstrate scholarly integrity'
      ]
    },
    {
      id: 4,
      title: 'Publication & Impact',
      duration: 'Weeks 9–10',
      description: 'Finalize your contribution and measure your impact.',
      deliverables: [
        'Submit final manuscript to North Star Journal',
        'Complete impact reflection essay',
        'Present at virtual symposium'
      ],
      expectations: [
        'Address all editorial feedback',
        'Participate in cohort celebration',
        'Commit to knowledge mobilization'
      ]
    }
  ];

  useEffect(() => {
    fetchStats();
    if (user) {
      fetchExistingApplication();
    }
  }, [user]);

  useEffect(() => {
    if (user && !existingApplication) {
      setFormData(prev => ({
        ...prev,
        full_name: user.name || ''
      }));
    }
  }, [user, existingApplication]);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/fellowship/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchExistingApplication = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/fellowship/applications/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExistingApplication(response.data);
    } catch (error) {
      console.error('Error fetching application:', error);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API}/auth/google`;
  };

  const scrollToApplication = () => {
    applicationRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToStructure = () => {
    structureRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInterestToggle = (interest) => {
    setFormData(prev => ({
      ...prev,
      research_interests: prev.research_interests.includes(interest)
        ? prev.research_interests.filter(i => i !== interest)
        : [...prev.research_interests, interest]
    }));
  };

  const addCustomInterest = () => {
    if (customInterest.trim() && !formData.research_interests.includes(customInterest.trim())) {
      setFormData(prev => ({
        ...prev,
        research_interests: [...prev.research_interests, customInterest.trim()]
      }));
      setCustomInterest('');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        toast.error('Please upload a PDF file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setResumeFile(file);
    }
  };

  const wordCount = (text) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (wordCount(formData.statement_of_interest) < 200) {
      toast.error('Statement of interest must be at least 200 words');
      return;
    }
    if (wordCount(formData.statement_of_interest) > 500) {
      toast.error('Statement of interest must be under 500 words');
      return;
    }
    if (formData.research_interests.length === 0) {
      toast.error('Please select at least one research interest');
      return;
    }
    if (!formData.commitment_confirmed) {
      toast.error('Please confirm your commitment to the program');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Upload resume first if provided
      if (resumeFile) {
        const formDataFile = new FormData();
        formDataFile.append('file', resumeFile);
        await axios.post(`${API}/fellowship/upload-resume`, formDataFile, {
          headers: { ...headers, 'Content-Type': 'multipart/form-data' }
        });
      }

      // Submit application
      await axios.post(`${API}/fellowship/apply`, formData, { headers });
      
      toast.success('Application submitted successfully!');
      fetchExistingApplication();
      fetchStats();
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error(error.response?.data?.detail || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      submitted: { bg: '#f0f9ff', color: '#0369a1', text: 'Submitted' },
      under_review: { bg: '#fef3c7', color: '#92400e', text: 'Under Review' },
      accepted: { bg: '#d1fae5', color: '#065f46', text: 'Accepted' },
      rejected: { bg: '#fee2e2', color: '#991b1b', text: 'Not Selected' }
    };
    const style = statusStyles[status] || statusStyles.submitted;
    return (
      <span style={{ 
        background: style.bg, 
        color: style.color, 
        padding: '6px 12px', 
        borderRadius: '6px',
        fontSize: '0.85rem',
        fontWeight: '600'
      }}>
        {style.text}
      </span>
    );
  };

  return (
    <div className="fellowship-page">
      {/* Hero Section */}
      <section className="fellowship-hero">
        <div className="fellowship-hero-content">
          <h1>North Star Fellowship Program</h1>
          <p className="fellowship-hero-subtitle">
            A guided undergraduate research fellowship culminating in peer-reviewed 
            publication and measurable community impact.
          </p>
          <div className="fellowship-hero-actions">
            <button onClick={scrollToApplication} className="btn-primary-fellowship">
              Apply to the Fellowship
            </button>
            <button onClick={scrollToStructure} className="btn-secondary-fellowship">
              View Program Structure
            </button>
          </div>
        </div>
      </section>

      {/* What It Is Section */}
      <section className="fellowship-section">
        <div className="fellowship-container">
          <h2 className="fellowship-section-title">What is the North Star Fellowship?</h2>
          <p className="fellowship-intro-text">
            The North Star Fellowship is a selective 10-week guided research program designed for 
            Canadian undergraduates passionate about scholarly inquiry. Fellows receive structured 
            mentorship, engage in rigorous peer review, and culminate their experience with a 
            submission to the North Star Journal — our peer-reviewed publication platform.
          </p>
          <div className="fellowship-highlights">
            <div className="fellowship-highlight-item">
              <BookOpen size={24} />
              <span>Structured research training</span>
            </div>
            <div className="fellowship-highlight-item">
              <FileText size={24} />
              <span>Proposal development</span>
            </div>
            <div className="fellowship-highlight-item">
              <Target size={24} />
              <span>Manuscript drafting</span>
            </div>
            <div className="fellowship-highlight-item">
              <Users size={24} />
              <span>Peer review immersion</span>
            </div>
            <div className="fellowship-highlight-item">
              <Award size={24} />
              <span>Publication opportunity</span>
            </div>
            <div className="fellowship-highlight-item">
              <Lightbulb size={24} />
              <span>Impact-driven mission</span>
            </div>
          </div>
        </div>
      </section>

      {/* Program Structure Section */}
      <section className="fellowship-section fellowship-section-alt" ref={structureRef}>
        <div className="fellowship-container">
          <h2 className="fellowship-section-title">Program Structure</h2>
          <p className="fellowship-section-subtitle">
            Four phases designed to guide you from research question to published scholar.
          </p>
          <div className="fellowship-timeline">
            {programPhases.map((phase, index) => (
              <div key={phase.id} className="fellowship-phase">
                <div 
                  className={`fellowship-phase-header ${expandedPhase === phase.id ? 'expanded' : ''}`}
                  onClick={() => setExpandedPhase(expandedPhase === phase.id ? null : phase.id)}
                >
                  <div className="fellowship-phase-number">Phase {phase.id}</div>
                  <div className="fellowship-phase-info">
                    <h3>{phase.title}</h3>
                    <span className="fellowship-phase-duration">{phase.duration}</span>
                  </div>
                  <div className="fellowship-phase-toggle">
                    {expandedPhase === phase.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>
                {expandedPhase === phase.id && (
                  <div className="fellowship-phase-content">
                    <p className="fellowship-phase-description">{phase.description}</p>
                    <div className="fellowship-phase-details">
                      <div className="fellowship-phase-column">
                        <h4>Deliverables</h4>
                        <ul>
                          {phase.deliverables.map((item, i) => (
                            <li key={i}><CheckCircle size={14} /> {item}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="fellowship-phase-column">
                        <h4>Expectations</h4>
                        <ul>
                          {phase.expectations.map((item, i) => (
                            <li key={i}><CheckCircle size={14} /> {item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who Should Apply Section */}
      <section className="fellowship-section">
        <div className="fellowship-container">
          <h2 className="fellowship-section-title">Who Should Apply</h2>
          <div className="fellowship-eligibility">
            <div className="fellowship-eligibility-list">
              <div className="fellowship-eligibility-item">
                <CheckCircle size={20} />
                <span>Canadian undergraduate student</span>
              </div>
              <div className="fellowship-eligibility-item">
                <CheckCircle size={20} />
                <span>Interest in academic research</span>
              </div>
              <div className="fellowship-eligibility-item">
                <CheckCircle size={20} />
                <span>Commitment to completing deliverables</span>
              </div>
              <div className="fellowship-eligibility-item">
                <CheckCircle size={20} />
                <span>Any discipline welcome</span>
              </div>
            </div>
            <p className="fellowship-eligibility-note">
              Prior research experience is not required. We value curiosity, dedication, and 
              a willingness to learn.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="fellowship-section fellowship-section-alt">
        <div className="fellowship-container">
          <h2 className="fellowship-section-title">Fellowship Benefits</h2>
          <div className="fellowship-benefits-grid">
            <div className="fellowship-benefit">
              <Award size={28} />
              <h4>North Star Fellow Designation</h4>
              <p>Official recognition as a North Star Fellow</p>
            </div>
            <div className="fellowship-benefit">
              <BookOpen size={28} />
              <h4>Publication Pathway</h4>
              <p>Direct submission to peer-reviewed North Star Journal</p>
            </div>
            <div className="fellowship-benefit">
              <FileText size={28} />
              <h4>Digital Certificate</h4>
              <p>Verified certificate of completion</p>
            </div>
            <div className="fellowship-benefit">
              <Linkedin size={28} />
              <h4>LinkedIn-Ready Badge</h4>
              <p>Shareable credential for your profile</p>
            </div>
            <div className="fellowship-benefit">
              <Star size={28} />
              <h4>Featured Author Spotlight</h4>
              <p>Highlight on our platform upon publication</p>
            </div>
            <div className="fellowship-benefit">
              <Users size={28} />
              <h4>Community Impact</h4>
              <p>Contribute to knowledge mobilization</p>
            </div>
          </div>
        </div>
      </section>

      {/* Cohort Details Section */}
      <section className="fellowship-section">
        <div className="fellowship-container">
          <h2 className="fellowship-section-title">Cohort Details</h2>
          <div className="fellowship-cohort-box">
            <div className="fellowship-cohort-badge">Founding Fellowship Cohort</div>
            <div className="fellowship-cohort-grid">
              <div className="fellowship-cohort-item">
                <span className="label">Cohort Size</span>
                <span className="value">20–25 Fellows</span>
              </div>
              <div className="fellowship-cohort-item">
                <span className="label">Duration</span>
                <span className="value">10 Weeks</span>
              </div>
              <div className="fellowship-cohort-item">
                <span className="label">Format</span>
                <span className="value">Hybrid / Remote</span>
              </div>
              <div className="fellowship-cohort-item">
                <span className="label">Cost</span>
                <span className="value">Free (Cohort I)</span>
              </div>
              <div className="fellowship-cohort-item">
                <span className="label">Acceptance</span>
                <span className="value">Selective</span>
              </div>
              {stats && stats.seats_remaining > 0 && (
                <div className="fellowship-cohort-item highlight">
                  <span className="label">Seats Remaining</span>
                  <span className="value">{stats.seats_remaining}</span>
                </div>
              )}
            </div>
            <p className="fellowship-cohort-note">
              Applications reviewed on a rolling basis. Early submission encouraged.
            </p>
          </div>
        </div>
      </section>

      {/* Application Form Section */}
      <section className="fellowship-section fellowship-section-alt" ref={applicationRef}>
        <div className="fellowship-container">
          <h2 className="fellowship-section-title">Fellowship Application</h2>
          
          {/* Already Applied */}
          {existingApplication && (
            <div className="fellowship-existing-application">
              <div className="fellowship-existing-header">
                <h3>Your Application</h3>
                {getStatusBadge(existingApplication.status)}
              </div>
              <p>
                You submitted your fellowship application on{' '}
                {new Date(existingApplication.submitted_at).toLocaleDateString('en-CA', {
                  year: 'numeric', month: 'long', day: 'numeric'
                })}.
              </p>
              {existingApplication.status === 'submitted' && (
                <p className="fellowship-existing-note">
                  Your application is being reviewed. We will notify you via email once a decision is made.
                </p>
              )}
              {existingApplication.status === 'accepted' && (
                <p className="fellowship-existing-note success">
                  Congratulations! You have been accepted to the North Star Fellowship. 
                  Check your email for next steps.
                </p>
              )}
            </div>
          )}

          {/* Login Gate */}
          {!authLoading && !user && !existingApplication && (
            <div className="fellowship-login-gate">
              <div className="fellowship-form-blurred">
                <div className="form-placeholder"></div>
                <div className="form-placeholder short"></div>
                <div className="form-placeholder"></div>
                <div className="form-placeholder tall"></div>
              </div>
              <div className="fellowship-login-overlay">
                <Lock size={32} />
                <h3>Sign In Required</h3>
                <p>Please sign in with Google to submit your fellowship application.</p>
                <button onClick={handleGoogleLogin} className="google-login-btn-large">
                  <img 
                    src="https://developers.google.com/identity/images/g-logo.png" 
                    alt="Google" 
                    className="google-icon"
                  />
                  Sign in with Google
                </button>
              </div>
            </div>
          )}

          {/* Application Form */}
          {user && !existingApplication && (
            <form onSubmit={handleSubmit} className="fellowship-form">
              <div className="fellowship-form-row">
                <div className="fellowship-form-group">
                  <label>Full Name <span className="required">*</span></label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div className="fellowship-form-group">
                  <label>University <span className="required">*</span></label>
                  <input
                    type="text"
                    value={formData.university}
                    onChange={(e) => setFormData({...formData, university: e.target.value})}
                    placeholder="e.g., University of Toronto"
                    required
                  />
                </div>
              </div>

              <div className="fellowship-form-row">
                <div className="fellowship-form-group">
                  <label>Program / Major <span className="required">*</span></label>
                  <input
                    type="text"
                    value={formData.program}
                    onChange={(e) => setFormData({...formData, program: e.target.value})}
                    placeholder="e.g., Life Sciences, Computer Science"
                    required
                  />
                </div>
                <div className="fellowship-form-group">
                  <label>Year of Study <span className="required">*</span></label>
                  <select
                    value={formData.year_of_study}
                    onChange={(e) => setFormData({...formData, year_of_study: e.target.value})}
                    required
                  >
                    <option value="">Select year...</option>
                    {yearOptions.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="fellowship-form-group">
                <label>Research Interests <span className="required">*</span></label>
                <p className="fellowship-form-hint">Select all that apply</p>
                <div className="fellowship-interests-grid">
                  {researchInterestOptions.map(interest => (
                    <button
                      key={interest}
                      type="button"
                      className={`fellowship-interest-tag ${formData.research_interests.includes(interest) ? 'selected' : ''}`}
                      onClick={() => handleInterestToggle(interest)}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
                <div className="fellowship-custom-interest">
                  <input
                    type="text"
                    value={customInterest}
                    onChange={(e) => setCustomInterest(e.target.value)}
                    placeholder="Add other interest..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomInterest())}
                  />
                  <button type="button" onClick={addCustomInterest} className="add-interest-btn">Add</button>
                </div>
                {formData.research_interests.filter(i => !researchInterestOptions.includes(i)).length > 0 && (
                  <div className="fellowship-custom-interests-list">
                    {formData.research_interests.filter(i => !researchInterestOptions.includes(i)).map(interest => (
                      <span key={interest} className="custom-interest-tag">
                        {interest}
                        <button type="button" onClick={() => handleInterestToggle(interest)}>
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="fellowship-form-group">
                <label>Prior Research Experience <span className="optional">(Optional)</span></label>
                <textarea
                  value={formData.prior_experience}
                  onChange={(e) => setFormData({...formData, prior_experience: e.target.value})}
                  placeholder="Briefly describe any prior research experience, if applicable..."
                  rows={3}
                />
              </div>

              <div className="fellowship-form-group">
                <label>Statement of Interest <span className="required">*</span></label>
                <p className="fellowship-form-hint">
                  In 250–400 words, explain why you wish to join the North Star Fellowship 
                  and what research topic you hope to explore.
                </p>
                <textarea
                  value={formData.statement_of_interest}
                  onChange={(e) => setFormData({...formData, statement_of_interest: e.target.value})}
                  placeholder="Your statement of interest..."
                  rows={8}
                  required
                />
                <div className={`word-count ${wordCount(formData.statement_of_interest) < 200 || wordCount(formData.statement_of_interest) > 500 ? 'warning' : ''}`}>
                  {wordCount(formData.statement_of_interest)} / 250–400 words
                </div>
              </div>

              <div className="fellowship-form-group">
                <label>Proposed Research Idea <span className="optional">(Optional but Encouraged)</span></label>
                <p className="fellowship-form-hint">
                  Briefly describe a research question you may wish to develop.
                </p>
                <textarea
                  value={formData.proposed_research_idea}
                  onChange={(e) => setFormData({...formData, proposed_research_idea: e.target.value})}
                  placeholder="Your proposed research idea..."
                  rows={4}
                />
              </div>

              <div className="fellowship-form-group">
                <label>Resume <span className="optional">(Optional)</span></label>
                <p className="fellowship-form-hint">PDF only, max 5MB</p>
                <div className="fellowship-file-upload">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    id="resume-upload"
                    className="file-input-hidden"
                  />
                  <label htmlFor="resume-upload" className="file-upload-label">
                    <Upload size={20} />
                    {resumeFile ? resumeFile.name : 'Choose PDF file...'}
                  </label>
                  {resumeFile && (
                    <button type="button" onClick={() => setResumeFile(null)} className="remove-file-btn">
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>

              <div className="fellowship-form-group">
                <label className="fellowship-checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.commitment_confirmed}
                    onChange={(e) => setFormData({...formData, commitment_confirmed: e.target.checked})}
                  />
                  <span>
                    I understand the fellowship requires active participation and submission 
                    of final deliverables. <span className="required">*</span>
                  </span>
                </label>
              </div>

              <button type="submit" className="fellowship-submit-btn" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Fellowship Application'}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};

export default FellowshipPage;
