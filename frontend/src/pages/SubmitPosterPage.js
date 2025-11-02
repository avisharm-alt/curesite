import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Plus, FileText } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SubmitPosterPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    authors: '',
    abstract: '',
    keywords: '',
    university: user?.university || '',
    program: user?.program || '',
    submitter_email: user?.email || ''
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
        poster_url: uploadResponse.data.file_id
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
              <label htmlFor="submitter_email">Your Email *</label>
              <input
                type="email"
                id="submitter_email"
                value={formData.submitter_email}
                onChange={(e) => setFormData({...formData, submitter_email: e.target.value})}
                className="form-input"
                required
                placeholder="Enter your email address"
              />
              <small>We'll use this email to contact you about your submission</small>
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
                  <option value="Brock University">Brock University</option>
                  <option value="Carleton University">Carleton University</option>
                  <option value="Dalhousie University">Dalhousie University</option>
                  <option value="McGill University">McGill University</option>
                  <option value="McMaster University">McMaster University</option>
                  <option value="Memorial University of Newfoundland">Memorial University of Newfoundland</option>
                  <option value="Ontario Tech University (OTU)">Ontario Tech University (OTU)</option>
                  <option value="Queen's University">Queen's University</option>
                  <option value="Simon Fraser University">Simon Fraser University</option>
                  <option value="Toronto Metropolitan University (TMU)">Toronto Metropolitan University (TMU)</option>
                  <option value="Université de Montréal">Université de Montréal</option>
                  <option value="Université Laval">Université Laval</option>
                  <option value="University of Alberta">University of Alberta</option>
                  <option value="University of British Columbia (UBC)">University of British Columbia (UBC)</option>
                  <option value="University of Calgary">University of Calgary</option>
                  <option value="University of Manitoba">University of Manitoba</option>
                  <option value="University of Ottawa">University of Ottawa</option>
                  <option value="University of Saskatchewan">University of Saskatchewan</option>
                  <option value="University of Toronto">University of Toronto</option>
                  <option value="University of Victoria">University of Victoria</option>
                  <option value="University of Waterloo">University of Waterloo</option>
                  <option value="Western University">Western University</option>
                  <option value="Wilfrid Laurier University (WLU)">Wilfrid Laurier University (WLU)</option>
                  <option value="York University">York University</option>
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

export default SubmitPosterPage;