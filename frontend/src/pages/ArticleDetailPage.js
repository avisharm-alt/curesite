import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ArrowLeft, Download, Copy, Check, Calendar, User, Building2, BookOpen, Tag, FileText } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ArticleDetailPage = () => {
  const { identifier } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedCitation, setCopiedCitation] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    loadArticle();
  }, [identifier]);

  const loadArticle = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/journal/article/${identifier}`);
      setArticle(response.data);
    } catch (error) {
      console.error('Error loading article:', error);
      toast.error('Article not found');
    } finally {
      setLoading(false);
    }
  };

  const generateCitation = () => {
    if (!article) return '';
    
    const authors = article.authors;
    const year = new Date(article.submitted_at).getFullYear();
    const title = article.title;
    const identifier = article.cure_identifier;
    
    return `${authors} (${year}). ${title}. CURE Journal, ${identifier}.`;
  };

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'citation') {
        setCopiedCitation(true);
        setTimeout(() => setCopiedCitation(false), 2000);
      } else {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      }
      toast.success('Copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  if (loading) {
    return (
      <div className="article-detail-page">
        <div className="article-detail-container">
          <div className="loading-state">Loading article...</div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="article-detail-page">
        <div className="article-detail-container">
          <div className="error-state">
            <h2>Article Not Found</h2>
            <p>The article you're looking for doesn't exist or hasn't been published yet.</p>
            <Link to="/journal" className="back-link">
              <ArrowLeft size={16} />
              Back to CURE Journal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const articleUrl = `${window.location.origin}/journal/article/${article.cure_identifier}`;
  const keywords = article.keywords ? article.keywords.split(',').map(k => k.trim()) : [];

  return (
    <div className="article-detail-page">
      <div className="article-detail-container">
        {/* Back Button */}
        <Link to="/journal" className="back-link">
          <ArrowLeft size={16} />
          Back to CURE Journal
        </Link>

        {/* Article Header */}
        <div className="article-header-section">
          <div className="article-type-badge">{article.article_type.replace('_', ' ')}</div>
          <h1 className="article-main-title">{article.title}</h1>
          
          {/* Authors */}
          <div className="article-authors">
            <User size={16} />
            <span>{article.authors}</span>
          </div>

          {/* Metadata Row */}
          <div className="article-metadata-row">
            <div className="metadata-item">
              <Building2 size={14} />
              <span>{article.university}</span>
            </div>
            <div className="metadata-item">
              <BookOpen size={14} />
              <span>{article.program}</span>
            </div>
            <div className="metadata-item">
              <Calendar size={14} />
              <span>Submitted: {formatDate(article.submitted_at)}</span>
            </div>
          </div>

          {/* CURE Identifier */}
          <div className="cure-identifier-box">
            <div className="identifier-label">CURE Identifier:</div>
            <div className="identifier-value">{article.cure_identifier}</div>
          </div>
        </div>

        {/* Abstract Section */}
        <div className="article-section">
          <h2 className="section-title">Abstract</h2>
          <div className="abstract-text">{article.abstract}</div>
        </div>

        {/* Keywords Section */}
        {keywords.length > 0 && (
          <div className="article-section">
            <h2 className="section-title">Keywords</h2>
            <div className="keywords-list">
              {keywords.map((keyword, index) => (
                <span key={index} className="keyword-badge">
                  <Tag size={12} />
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Citation Section */}
        <div className="article-section citation-section">
          <h2 className="section-title">How to Cite This Article</h2>
          <div className="citation-box">
            <div className="citation-text">{generateCitation()}</div>
            <button
              onClick={() => copyToClipboard(generateCitation(), 'citation')}
              className="copy-button"
              title="Copy citation"
            >
              {copiedCitation ? <Check size={16} /> : <Copy size={16} />}
              {copiedCitation ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Link to This Article */}
        <div className="article-section">
          <h2 className="section-title">Link to This Article</h2>
          <div className="citation-box">
            <div className="citation-text link-text">{articleUrl}</div>
            <button
              onClick={() => copyToClipboard(articleUrl, 'link')}
              className="copy-button"
              title="Copy link"
            >
              {copiedLink ? <Check size={16} /> : <Copy size={16} />}
              {copiedLink ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Download PDF Section */}
        {article.pdf_url && (
          <div className="article-section">
            <a
              href={article.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="download-pdf-button"
            >
              <Download size={18} />
              Download PDF
            </a>
          </div>
        )}

        {/* Footer Info */}
        <div className="article-footer-info">
          <div className="footer-item">
            <FileText size={14} />
            <span>Article Type: {article.article_type.replace('_', ' ')}</span>
          </div>
          {article.reviewed_at && (
            <div className="footer-item">
              <Calendar size={14} />
              <span>Published: {formatDate(article.reviewed_at)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArticleDetailPage;
