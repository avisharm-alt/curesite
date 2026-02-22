import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Award, BookOpen, Users, CheckCircle, FileText, 
  ChevronDown, ChevronUp, Lock, Upload, X, 
  GraduationCap, Clock
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const FellowshipPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [existingApplication, setExistingApplication] = useState(null);
  const [stats, setStats] = useState(null);
  const [expandedPhase, setExpandedPhase] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
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
    'Life Sciences', 'Engineering', 'AI / Computer Science',
    'Social Sciences', 'Humanities', 'Health & Medicine',
    'Policy & Public Health', 'Environmental Science'
  ];

  const yearOptions = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year+', 'Graduate'];

  const programPhases = [
    {
      id: 1,
      title: 'Research Foundations',
      duration: 'Week 1',
      deliverables: ['Complete research methods orientation', 'Finalize research question', 'Submit annotated bibliography']
    },
    {
      id: 2,
      title: 'Manuscript Development',
      duration: 'Week 2',
      deliverables: ['Submit first draft of manuscript', 'Develop figures and visualizations', 'Peer review participation']
    },
    {
      id: 3,
      title: 'Publication & Impact',
      duration: 'Week 3',
      deliverables: ['Final manuscript submission', 'Present at virtual symposium', 'Publication to North Star Journal']
    }
  ];

  useEffect(() => {
    fetchStats();
    if (user) {
      fetchExistingApplication();
      setFormData(prev => ({ ...prev, full_name: user.name || '' }));
    }
  }, [user]);

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

  const wordCount = (text) => text.trim().split(/\s+/).filter(word => word.length > 0).length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (wordCount(formData.statement_of_interest) < 200) {
      toast.error('Statement of interest must be at least 200 words');
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

      if (resumeFile) {
        const formDataFile = new FormData();
        formDataFile.append('file', resumeFile);
        await axios.post(`${API}/fellowship/upload-resume`, formDataFile, {
          headers: { ...headers, 'Content-Type': 'multipart/form-data' }
        });
      }

      await axios.post(`${API}/fellowship/apply`, formData, { headers });
      toast.success('Application submitted successfully!');
      fetchExistingApplication();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      submitted: { bg: '#f0f9ff', color: '#0369a1', text: 'Submitted' },
      under_review: { bg: '#fef3c7', color: '#92400e', text: 'Under Review' },
      accepted: { bg: '#d1fae5', color: '#065f46', text: 'Accepted' },
      rejected: { bg: '#fee2e2', color: '#991b1b', text: 'Not Selected' }
    };
    const s = styles[status] || styles.submitted;
    return <span className="status-badge" style={{ background: s.bg, color: s.color }}>{s.text}</span>;
  };

  return (
    <div className="page fellowship-page">
      <div className="page-header">
        <div className="page-icon"><Award size={32} /></div>
        <div>
          <h1 className="page-title">North Star Fellowship Program</h1>
          <p className="page-description">
            A selective 3-week guided research fellowship for Canadian undergraduates, 
            culminating in peer-reviewed publication.
          </p>
        </div>
      </div>

      <div className="page-content">
        {/* Cohort Info Banner */}
        <div className="fellowship-cohort-banner">
          <span className="cohort-badge">Founding Cohort</span>
          <div className="cohort-stats">
            <span><Clock size={16} /> 3 Weeks</span>
            <span><Users size={16} /> 20-25 Fellows</span>
            <span><GraduationCap size={16} /> Free</span>
            {stats && stats.seats_remaining > 0 && (
              <span className="seats-remaining">{stats.seats_remaining} seats remaining</span>
            )}
          </div>
        </div>

        {/* APPLICATION FORM - At the top */}
        <div className="fellowship-application-section">
          <h2>Fellowship Application</h2>
          
          {/* Already Applied */}
          {existingApplication && (
            <div className="fellowship-status-card">
              <div className="status-header">
                <h3>Your Application</h3>
                {getStatusBadge(existingApplication.status)}
              </div>
              <p>Submitted on {new Date(existingApplication.submitted_at).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })}.</p>
              {existingApplication.status === 'submitted' && (
                <p className="status-note">Your application is under review. We will notify you via email.</p>
              )}
              {existingApplication.status === 'accepted' && (
                <p className="status-note success">Congratulations! You've been accepted. Check your email for next steps.</p>
              )}
            </div>
          )}

          {/* Login Gate */}
          {!authLoading && !user && !existingApplication && (
            <div className="fellowship-login-gate">
              <Lock size={28} />
              <h3>Sign In Required</h3>
              <p>Please sign in with Google to submit your application.</p>
              <button onClick={handleGoogleLogin} className="google-login-btn-large">
                <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" className="google-icon" />
                Sign in with Google
              </button>
            </div>
          )}

          {/* Application Form */}
          {user && !existingApplication && (
            <form onSubmit={handleSubmit} className="fellowship-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name <span className="required">*</span></label>
                  <input type="text" value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>University <span className="required">*</span></label>
                  <input type="text" value={formData.university} onChange={(e) => setFormData({...formData, university: e.target.value})} placeholder="e.g., University of Toronto" required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Program / Major <span className="required">*</span></label>
                  <input type="text" value={formData.program} onChange={(e) => setFormData({...formData, program: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Year of Study <span className="required">*</span></label>
                  <select value={formData.year_of_study} onChange={(e) => setFormData({...formData, year_of_study: e.target.value})} required>
                    <option value="">Select year...</option>
                    {yearOptions.map(year => <option key={year} value={year}>{year}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Research Interests <span className="required">*</span></label>
                <div className="interest-tags">
                  {researchInterestOptions.map(interest => (
                    <button key={interest} type="button" className={`interest-tag ${formData.research_interests.includes(interest) ? 'selected' : ''}`} onClick={() => handleInterestToggle(interest)}>
                      {interest}
                    </button>
                  ))}
                </div>
                <div className="custom-interest-row">
                  <input type="text" value={customInterest} onChange={(e) => setCustomInterest(e.target.value)} placeholder="Add other..." onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomInterest())} />
                  <button type="button" onClick={addCustomInterest} className="add-btn">Add</button>
                </div>
              </div>

              <div className="form-group">
                <label>Prior Research Experience <span className="optional">(Optional)</span></label>
                <textarea value={formData.prior_experience} onChange={(e) => setFormData({...formData, prior_experience: e.target.value})} rows={2} placeholder="Briefly describe any prior experience..." />
              </div>

              <div className="form-group">
                <label>Statement of Interest <span className="required">*</span></label>
                <p className="form-hint">In 250–400 words, explain why you wish to join and what research topic you hope to explore.</p>
                <textarea value={formData.statement_of_interest} onChange={(e) => setFormData({...formData, statement_of_interest: e.target.value})} rows={6} required />
                <div className={`word-counter ${wordCount(formData.statement_of_interest) < 200 ? 'warning' : ''}`}>
                  {wordCount(formData.statement_of_interest)} words
                </div>
              </div>

              <div className="form-group">
                <label>Proposed Research Idea <span className="optional">(Optional)</span></label>
                <textarea value={formData.proposed_research_idea} onChange={(e) => setFormData({...formData, proposed_research_idea: e.target.value})} rows={3} placeholder="Briefly describe a research question you may wish to develop..." />
              </div>

              <div className="form-group">
                <label>Resume <span className="optional">(Optional, PDF only)</span></label>
                <div className="file-upload-row">
                  <input type="file" accept=".pdf" onChange={handleFileChange} id="resume" className="file-input-hidden" />
                  <label htmlFor="resume" className="file-label"><Upload size={18} />{resumeFile ? resumeFile.name : 'Choose file...'}</label>
                  {resumeFile && <button type="button" onClick={() => setResumeFile(null)} className="remove-file"><X size={16} /></button>}
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input type="checkbox" checked={formData.commitment_confirmed} onChange={(e) => setFormData({...formData, commitment_confirmed: e.target.checked})} />
                  <span>I commit to active participation and submission of deliverables. <span className="required">*</span></span>
                </label>
              </div>

              <button type="submit" className="submit-btn" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </form>
          )}
        </div>

        {/* Program Structure */}
        <div className="fellowship-info-section">
          <h2>Program Structure</h2>
          <p className="section-intro">An intensive 3-week program designed to guide you from research question to published scholar.</p>
          
          <div className="program-timeline">
            {programPhases.map((phase) => (
              <div key={phase.id} className="timeline-phase">
                <div className="phase-header" onClick={() => setExpandedPhase(expandedPhase === phase.id ? null : phase.id)}>
                  <div className="phase-number">{phase.id}</div>
                  <div className="phase-info">
                    <h3>{phase.title}</h3>
                    <span>{phase.duration}</span>
                  </div>
                  {expandedPhase === phase.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
                {expandedPhase === phase.id && (
                  <div className="phase-content">
                    <ul>
                      {phase.deliverables.map((d, i) => <li key={i}><CheckCircle size={14} /> {d}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className="fellowship-info-section">
          <h2>Fellowship Benefits</h2>
          <div className="benefits-grid">
            <div className="benefit-item"><Award size={24} /><span>North Star Fellow Designation</span></div>
            <div className="benefit-item"><BookOpen size={24} /><span>Publication in North Star Journal</span></div>
            <div className="benefit-item"><FileText size={24} /><span>Digital Certificate</span></div>
            <div className="benefit-item"><Users size={24} /><span>Featured Author Spotlight</span></div>
          </div>
        </div>

        {/* Eligibility */}
        <div className="fellowship-info-section">
          <h2>Eligibility</h2>
          <div className="eligibility-list">
            <span><CheckCircle size={16} /> Canadian undergraduate student</span>
            <span><CheckCircle size={16} /> Interest in academic research</span>
            <span><CheckCircle size={16} /> Commitment to deliverables</span>
            <span><CheckCircle size={16} /> Any discipline welcome</span>
          </div>
          <p className="eligibility-note">Prior research experience not required.</p>
        </div>
      </div>
    </div>
  );
};

export default FellowshipPage;
