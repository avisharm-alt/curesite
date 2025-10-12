import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { User, GraduationCap, Users, FileText, Check } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const OnboardingPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    university: '',
    program: '',
    year: null,
    role: 'student', // student or professor
    wantsToPoster: false
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.name || !formData.university) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.role === 'student' && (!formData.program || !formData.year)) {
      toast.error('Please fill in your program and year');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Update user profile
      await axios.put(
        `${API}/users/profile`,
        {
          name: formData.name,
          university: formData.university,
          program: formData.program,
          year: formData.year
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update social profile with role
      await axios.patch(
        `${API}/social/profile`,
        { role: formData.role },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Profile completed!');

      // Redirect based on choices
      if (formData.role === 'student' && formData.wantsToPoster) {
        navigate('/submit-poster');
      } else {
        navigate('/social');
      }

      // Reload to update auth context
      window.location.reload();
    } catch (error) {
      console.error('Error completing profile:', error);
      toast.error('Failed to complete profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="onboarding-page">
      <div className="onboarding-container">
        <div className="onboarding-card">
          {/* Header */}
          <div className="onboarding-header">
            <h1>Welcome to CURE! 🎓</h1>
            <p>Let's set up your profile to get started</p>
          </div>

          {/* Progress Steps */}
          <div className="onboarding-steps">
            <div className={`step ${step >= 1 ? 'active' : ''}`}>
              <div className="step-number">1</div>
              <span>Account Type</span>
            </div>
            <div className="step-line"></div>
            <div className={`step ${step >= 2 ? 'active' : ''}`}>
              <div className="step-number">2</div>
              <span>Your Info</span>
            </div>
            <div className="step-line"></div>
            <div className={`step ${step >= 3 ? 'active' : ''}`}>
              <div className="step-number">3</div>
              <span>Get Started</span>
            </div>
          </div>

          {/* Step 1: Account Type */}
          {step === 1 && (
            <div className="onboarding-step">
              <h2>Are you a student or professor?</h2>
              <p className="step-description">This helps us personalize your experience</p>

              <div className="account-type-grid">
                <div
                  className={`account-type-card ${formData.role === 'student' ? 'selected' : ''}`}
                  onClick={() => setFormData({ ...formData, role: 'student' })}
                >
                  <Users size={40} />
                  <h3>Student</h3>
                  <p>Undergraduate researcher looking for opportunities</p>
                  {formData.role === 'student' && (
                    <div className="selected-badge">
                      <Check size={16} />
                    </div>
                  )}
                </div>

                <div
                  className={`account-type-card ${formData.role === 'professor' ? 'selected' : ''}`}
                  onClick={() => setFormData({ ...formData, role: 'professor' })}
                >
                  <GraduationCap size={40} />
                  <h3>Professor</h3>
                  <p>Faculty member offering research mentorship</p>
                  {formData.role === 'professor' && (
                    <div className="selected-badge">
                      <Check size={16} />
                    </div>
                  )}
                </div>
              </div>

              <button
                className="onboarding-btn primary"
                onClick={() => setStep(2)}
              >
                Continue
              </button>
            </div>
          )}

          {/* Step 2: Personal Info */}
          {step === 2 && (
            <div className="onboarding-step">
              <h2>Tell us about yourself</h2>
              <p className="step-description">We'll use this to connect you with the right people</p>

              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>University *</label>
                <input
                  type="text"
                  placeholder="e.g., University of Toronto"
                  value={formData.university}
                  onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                />
              </div>

              {formData.role === 'student' && (
                <>
                  <div className="form-group">
                    <label>Program/Major *</label>
                    <input
                      type="text"
                      placeholder="e.g., Biology, Neuroscience"
                      value={formData.program}
                      onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Year of Study *</label>
                    <select
                      value={formData.year || ''}
                      onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    >
                      <option value="">Select year</option>
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                      <option value="5">5th Year+</option>
                    </select>
                  </div>
                </>
              )}

              {formData.role === 'professor' && (
                <div className="form-group">
                  <label>Department</label>
                  <input
                    type="text"
                    placeholder="e.g., Department of Biology"
                    value={formData.program}
                    onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                  />
                </div>
              )}

              <div className="button-group">
                <button className="onboarding-btn secondary" onClick={() => setStep(1)}>
                  Back
                </button>
                <button className="onboarding-btn primary" onClick={() => setStep(3)}>
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Get Started */}
          {step === 3 && (
            <div className="onboarding-step">
              <h2>You're all set! 🎉</h2>
              <p className="step-description">What would you like to do first?</p>

              {formData.role === 'student' && (
                <div className="quick-action-card" onClick={() => setFormData({ ...formData, wantsToPoster: true })}>
                  <div className="quick-action-icon">
                    <FileText size={32} />
                  </div>
                  <div className="quick-action-content">
                    <h3>Submit a Research Poster</h3>
                    <p>Share your research work with the CURE community</p>
                    {formData.wantsToPoster && (
                      <div className="selected-badge">
                        <Check size={16} />
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="quick-action-card" onClick={() => setFormData({ ...formData, wantsToPoster: false })}>
                <div className="quick-action-icon">
                  <Users size={32} />
                </div>
                <div className="quick-action-content">
                  <h3>Explore the Network</h3>
                  <p>Connect with researchers and discover opportunities</p>
                  {!formData.wantsToPoster && (
                    <div className="selected-badge">
                      <Check size={16} />
                    </div>
                  )}
                </div>
              </div>

              <div className="button-group">
                <button className="onboarding-btn secondary" onClick={() => setStep(2)}>
                  Back
                </button>
                <button
                  className="onboarding-btn primary"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? 'Setting up...' : 'Get Started'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
