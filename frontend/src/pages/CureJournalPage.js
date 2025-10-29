import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { BookOpen, Plus, Calendar, User, Tag, FileText, Download, X } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CureJournalPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [showArticleModal, setShowArticleModal] = useState(false);

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      setLoading(true);
      // Only fetch published articles (articles under review won't be visible)
      const response = await axios.get(`${API}/journal/articles`);
      setArticles(response.data);
    } catch (error) {
      console.error('Error loading articles:', error);
      toast.error('Failed to load journal articles');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!user) {
      toast.error('Please log in to submit to CURE Journal');
      return;
    }
    navigate('/submit-article');
  };

  const handleReadArticle = (article) => {
    if (article.cure_identifier) {
      navigate(`/journal/article/${article.cure_identifier}`);
    } else {
      // Fallback for old articles without identifier
      setSelectedArticle(article);
      setShowArticleModal(true);
    }
  };

  return (
    <div className="journal-page">
      <div className="journal-container">
        {/* Header */}
        <div className="journal-header">
          <div className="journal-header-content">
            <div className="journal-title-section">
              <BookOpen size={32} className="journal-icon" />
              <div>
                <h1 className="journal-title">CURE Journal</h1>
                <p className="journal-subtitle">Academic Research & Project Abstracts</p>
              </div>
            </div>
            <button onClick={handleSubmit} className="submit-article-btn">
              <Plus size={20} />
              Submit Article
            </button>
          </div>
        </div>

        {/* Articles Grid */}
        {loading ? (
          <div className="articles-loading-container">
            <div className="loading-skeleton-grid">
              {[1, 2, 3].map((i) => (
                <div key={i} className="article-card-skeleton">
                  <div className="skeleton-badge"></div>
                  <div className="skeleton-title"></div>
                  <div className="skeleton-author"></div>
                  <div className="skeleton-text"></div>
                  <div className="skeleton-text"></div>
                  <div className="skeleton-tags">
                    <div className="skeleton-tag"></div>
                    <div className="skeleton-tag"></div>
                    <div className="skeleton-tag"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : articles.length === 0 ? (
          <div className="empty-state">
            <BookOpen size={64} />
            <h3>No Articles Yet</h3>
            <p>Be the first to submit to CURE Journal</p>
            <button onClick={handleSubmit} className="submit-article-btn">
              Submit Article
            </button>
          </div>
        ) : (
          <div className="articles-grid">
            {articles.map((article) => (
              <div key={article.id} className="article-card">
                <div className="article-header">
                  <span className={`article-status status-${article.status}`}>
                    {article.status}
                  </span>
                  <span className="article-date">
                    <Calendar size={14} />
                    {new Date(article.submitted_at).toLocaleDateString()}
                  </span>
                </div>
                
                {article.cure_identifier && (
                  <div className="article-identifier">
                    {article.cure_identifier}
                  </div>
                )}
                
                <h3 className="article-title">{article.title}</h3>
                
                <div className="article-authors">
                  <User size={16} />
                  <span>{article.authors}</span>
                </div>
                
                <p className="article-abstract">{article.abstract}</p>
                
                {article.keywords && (
                  <div className="article-keywords">
                    {article.keywords.split(',').map((keyword, idx) => (
                      <span key={idx} className="keyword-tag">
                        <Tag size={12} />
                        {keyword.trim()}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="article-actions">
                  <button onClick={() => handleReadArticle(article)} className="view-article-btn">
                    <FileText size={16} />
                    Read Full Article
                  </button>
                  {article.pdf_url && (
                    <button className="download-btn">
                      <Download size={16} />
                      Download PDF
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Article Detail Modal */}
      {showArticleModal && selectedArticle && (
        <div className="modal-overlay" onClick={() => setShowArticleModal(false)}>
          <div className="modal-content article-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedArticle.title}</h2>
              <button onClick={() => setShowArticleModal(false)} className="modal-close">
                <X size={24} />
              </button>
            </div>
            
            <div className="article-modal-body">
              <div className="article-meta-row">
                <div className="meta-item">
                  <strong>Authors:</strong> {selectedArticle.authors}
                </div>
                <div className="meta-item">
                  <strong>Type:</strong> <span className="article-type-badge">{selectedArticle.article_type}</span>
                </div>
              </div>

              <div className="article-meta-row">
                <div className="meta-item">
                  <strong>Institution:</strong> {selectedArticle.university}
                </div>
                <div className="meta-item">
                  <strong>Program:</strong> {selectedArticle.program}
                </div>
              </div>

              <div className="article-meta-row">
                <div className="meta-item">
                  <strong>Published:</strong> {new Date(selectedArticle.submitted_at).toLocaleDateString()}
                </div>
              </div>

              {selectedArticle.keywords && (
                <div className="article-keywords-section">
                  <strong>Keywords:</strong>
                  <div className="keywords-list">
                    {selectedArticle.keywords.split(',').map((keyword, idx) => (
                      <span key={idx} className="keyword-tag">{keyword.trim()}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="article-abstract-section">
                <h3>Abstract</h3>
                <p className="abstract-full-text">{selectedArticle.abstract}</p>
              </div>

              {selectedArticle.pdf_url && (
                <div className="article-actions-modal">
                  <button className="download-pdf-btn">
                    <Download size={18} />
                    Download Full Article (PDF)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CureJournalPage;
