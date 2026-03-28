import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import { Download, Image, Type, Sparkles, Check, X } from 'lucide-react';
import { HEALTH_TAGS } from '../data/mockData.ts';

type TemplateType = 'story-highlight' | 'call-for-submissions' | 'logo';
type BackgroundVariant = 'white' | 'coral' | 'black';
type LogoSize = 'square' | 'horizontal' | 'story';

const InstagramGenerator: React.FC = () => {
  const [template, setTemplate] = useState<TemplateType>('story-highlight');
  const [quote, setQuote] = useState('Learning to live with uncertainty changed everything about how I understand my future.');
  const [author, setAuthor] = useState('Sarah M.');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>(['Mental Health', 'Chronic Illness']);
  const [bgVariant, setBgVariant] = useState<BackgroundVariant>('white');
  const [headline, setHeadline] = useState('Call for Submissions');
  const [subheadline, setSubheadline] = useState('Share your story with our community');
  const [logoSize, setLogoSize] = useState<LogoSize>('square');
  const [logoVariant, setLogoVariant] = useState<BackgroundVariant>('white');
  const [downloading, setDownloading] = useState(false);
  
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!canvasRef.current) return;
    setDownloading(true);
    
    try {
      const canvas = await html2canvas(canvasRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
      });
      
      const link = document.createElement('a');
      link.download = `vital-signs-${template}-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error generating image:', error);
    } finally {
      setDownloading(false);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const logoSizes = {
    square: { width: 1080, height: 1080 },
    horizontal: { width: 1920, height: 1080 },
    story: { width: 1080, height: 1920 },
  };

  const getLogoColors = (variant: BackgroundVariant) => {
    switch (variant) {
      case 'white': return { bg: '#FFFFFF', text: '#111111', dot: '#FF5A5F' };
      case 'black': return { bg: '#111111', text: '#FFFFFF', dot: '#FF5A5F' };
      case 'coral': return { bg: '#FF5A5F', text: '#FFFFFF', dot: '#FFFFFF' };
    }
  };

  return (
    <div className="ig-generator">
      <div className="ig-header">
        <div className="container">
          <h1>Instagram Post Generator</h1>
          <p>Create on-brand posts for Vital Signs</p>
        </div>
      </div>

      <div className="ig-content">
        <div className="container">
          <div className="ig-layout">
            {/* Left Panel - Controls */}
            <div className="ig-controls">
              {/* Template Selector */}
              <div className="control-section">
                <label className="control-label">Template</label>
                <div className="template-buttons">
                  <button
                    className={`template-btn ${template === 'story-highlight' ? 'active' : ''}`}
                    onClick={() => setTemplate('story-highlight')}
                  >
                    <Type size={20} />
                    Story Highlight
                  </button>
                  <button
                    className={`template-btn ${template === 'call-for-submissions' ? 'active' : ''}`}
                    onClick={() => setTemplate('call-for-submissions')}
                  >
                    <Sparkles size={20} />
                    Call for Submissions
                  </button>
                  <button
                    className={`template-btn ${template === 'logo' ? 'active' : ''}`}
                    onClick={() => setTemplate('logo')}
                  >
                    <Image size={20} />
                    Logo
                  </button>
                </div>
              </div>

              {/* Story Highlight Controls */}
              {template === 'story-highlight' && (
                <>
                  <div className="control-section">
                    <label className="control-label">Quote</label>
                    <textarea
                      className="control-textarea"
                      value={quote}
                      onChange={(e) => setQuote(e.target.value)}
                      maxLength={200}
                      rows={4}
                    />
                    <span className="char-count">{quote.length}/200</span>
                  </div>

                  <div className="control-section">
                    <label className="control-label">Author</label>
                    <div className="author-controls">
                      <input
                        type="text"
                        className="control-input"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        disabled={isAnonymous}
                      />
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={isAnonymous}
                          onChange={(e) => setIsAnonymous(e.target.checked)}
                        />
                        Anonymous
                      </label>
                    </div>
                  </div>

                  <div className="control-section">
                    <label className="control-label">Tags (max 3)</label>
                    <div className="tag-selector">
                      {HEALTH_TAGS.slice(0, 9).map(tag => (
                        <button
                          key={tag.id}
                          className={`tag-btn ${selectedTags.includes(tag.name) ? 'active' : ''}`}
                          onClick={() => toggleTag(tag.name)}
                          disabled={selectedTags.length >= 3 && !selectedTags.includes(tag.name)}
                        >
                          {selectedTags.includes(tag.name) && <Check size={12} />}
                          {tag.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Call for Submissions Controls */}
              {template === 'call-for-submissions' && (
                <>
                  <div className="control-section">
                    <label className="control-label">Headline</label>
                    <input
                      type="text"
                      className="control-input"
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                    />
                  </div>

                  <div className="control-section">
                    <label className="control-label">Subheadline</label>
                    <input
                      type="text"
                      className="control-input"
                      value={subheadline}
                      onChange={(e) => setSubheadline(e.target.value)}
                    />
                  </div>

                  <div className="control-section">
                    <label className="control-label">Featured Topics</label>
                    <div className="tag-selector">
                      {HEALTH_TAGS.slice(0, 9).map(tag => (
                        <button
                          key={tag.id}
                          className={`tag-btn ${selectedTags.includes(tag.name) ? 'active' : ''}`}
                          onClick={() => toggleTag(tag.name)}
                        >
                          {selectedTags.includes(tag.name) && <Check size={12} />}
                          {tag.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="control-section">
                    <label className="control-label">Background</label>
                    <div className="variant-buttons">
                      <button
                        className={`variant-btn variant-white ${bgVariant === 'white' ? 'active' : ''}`}
                        onClick={() => setBgVariant('white')}
                      >
                        White
                      </button>
                      <button
                        className={`variant-btn variant-coral ${bgVariant === 'coral' ? 'active' : ''}`}
                        onClick={() => setBgVariant('coral')}
                      >
                        Coral
                      </button>
                      <button
                        className={`variant-btn variant-black ${bgVariant === 'black' ? 'active' : ''}`}
                        onClick={() => setBgVariant('black')}
                      >
                        Black
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Logo Controls */}
              {template === 'logo' && (
                <>
                  <div className="control-section">
                    <label className="control-label">Size</label>
                    <div className="variant-buttons">
                      <button
                        className={`variant-btn ${logoSize === 'square' ? 'active' : ''}`}
                        onClick={() => setLogoSize('square')}
                      >
                        Square
                      </button>
                      <button
                        className={`variant-btn ${logoSize === 'horizontal' ? 'active' : ''}`}
                        onClick={() => setLogoSize('horizontal')}
                      >
                        Horizontal
                      </button>
                      <button
                        className={`variant-btn ${logoSize === 'story' ? 'active' : ''}`}
                        onClick={() => setLogoSize('story')}
                      >
                        Story
                      </button>
                    </div>
                  </div>

                  <div className="control-section">
                    <label className="control-label">Variant</label>
                    <div className="variant-buttons">
                      <button
                        className={`variant-btn variant-white ${logoVariant === 'white' ? 'active' : ''}`}
                        onClick={() => setLogoVariant('white')}
                      >
                        Light
                      </button>
                      <button
                        className={`variant-btn variant-black ${logoVariant === 'black' ? 'active' : ''}`}
                        onClick={() => setLogoVariant('black')}
                      >
                        Dark
                      </button>
                      <button
                        className={`variant-btn variant-coral ${logoVariant === 'coral' ? 'active' : ''}`}
                        onClick={() => setLogoVariant('coral')}
                      >
                        Coral
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Download Button */}
              <motion.button
                className="download-btn"
                onClick={handleDownload}
                disabled={downloading}
                whileTap={{ scale: 0.98 }}
              >
                <Download size={20} />
                {downloading ? 'Generating...' : 'Download PNG'}
              </motion.button>
            </div>

            {/* Right Panel - Preview */}
            <div className="ig-preview">
              <div className="preview-label">Preview</div>
              <div className="preview-container">
                {/* Story Highlight Template */}
                {template === 'story-highlight' && (
                  <div
                    ref={canvasRef}
                    className="canvas-story-highlight"
                    style={{
                      width: 1080,
                      height: 1080,
                      background: '#FFFFFF',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 80,
                      fontFamily: 'Inter, sans-serif',
                      boxSizing: 'border-box',
                    }}
                  >
                    <div style={{
                      background: '#FFFFFF',
                      border: '1px solid rgba(17,17,17,0.08)',
                      borderRadius: 24,
                      padding: 60,
                      maxWidth: 800,
                      textAlign: 'center',
                      boxSizing: 'border-box',
                    }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
                        {selectedTags.slice(0, 3).map(tag => (
                          <span key={tag} style={{
                            background: 'rgba(255,90,95,0.1)',
                            color: '#FF5A5F',
                            padding: '6px 16px',
                            borderRadius: 9999,
                            fontSize: 16,
                            fontWeight: 500,
                          }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                      <p style={{
                        fontSize: 36,
                        fontWeight: 600,
                        color: '#111111',
                        lineHeight: 1.4,
                        letterSpacing: '-0.02em',
                        marginBottom: 24,
                        margin: '0 0 24px 0',
                      }}>
                        "{quote}"
                      </p>
                      <p style={{
                        fontSize: 18,
                        fontWeight: 500,
                        color: 'rgba(17,17,17,0.6)',
                        margin: 0,
                      }}>
                        — {isAnonymous ? 'Anonymous' : author}
                      </p>
                    </div>
                    <div style={{ marginTop: 60, textAlign: 'center' }}>
                      <p style={{
                        fontSize: 24,
                        fontWeight: 600,
                        color: '#111111',
                        letterSpacing: '-0.02em',
                        margin: 0,
                      }}>
                        Vital Signs<span style={{ color: '#FF5A5F' }}>.</span>
                      </p>
                      <p style={{
                        fontSize: 14,
                        color: 'rgba(17,17,17,0.4)',
                        marginTop: 8,
                        margin: '8px 0 0 0',
                      }}>
                        vitalsigns.ca/stories
                      </p>
                    </div>
                  </div>
                )}

                {/* Call for Submissions Template */}
                {template === 'call-for-submissions' && (
                  <div
                    ref={canvasRef}
                    style={{
                      width: 1080,
                      height: 1080,
                      background: bgVariant === 'white' ? '#FFFFFF' : bgVariant === 'coral' ? '#FF5A5F' : '#111111',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 80,
                      fontFamily: 'Inter, sans-serif',
                      boxSizing: 'border-box',
                    }}
                  >
                    <p style={{
                      fontSize: 24,
                      fontWeight: 600,
                      color: bgVariant === 'white' ? '#111111' : '#FFFFFF',
                      marginBottom: 50,
                      margin: '0 0 50px 0',
                    }}>
                      Vital Signs<span style={{ color: bgVariant === 'coral' ? '#FFFFFF' : '#FF5A5F' }}>.</span>
                    </p>
                    <div style={{
                      width: 200,
                      height: 2,
                      background: bgVariant === 'white' ? 'rgba(17,17,17,0.1)' : 'rgba(255,255,255,0.3)',
                      marginBottom: 50,
                    }} />
                    <h1 style={{
                      fontSize: 64,
                      fontWeight: 700,
                      color: bgVariant === 'white' ? '#111111' : '#FFFFFF',
                      textTransform: 'uppercase',
                      letterSpacing: '-0.02em',
                      textAlign: 'center',
                      lineHeight: 1.1,
                      marginBottom: 30,
                      margin: '0 0 30px 0',
                    }}>
                      {headline}
                    </h1>
                    <p style={{
                      fontSize: 24,
                      color: bgVariant === 'white' ? 'rgba(17,17,17,0.6)' : 'rgba(255,255,255,0.8)',
                      textAlign: 'center',
                      marginBottom: 40,
                      margin: '0 0 40px 0',
                    }}>
                      "{subheadline}"
                    </p>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                      {selectedTags.slice(0, 5).map(tag => (
                        <span key={tag} style={{
                          border: `1px solid ${bgVariant === 'white' ? 'rgba(17,17,17,0.15)' : 'rgba(255,255,255,0.4)'}`,
                          color: bgVariant === 'white' ? '#111111' : '#FFFFFF',
                          padding: '10px 24px',
                          borderRadius: 9999,
                          fontSize: 16,
                          fontWeight: 500,
                        }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                    <p style={{
                      fontSize: 18,
                      fontWeight: 500,
                      color: bgVariant === 'white' ? '#111111' : '#FFFFFF',
                      marginTop: 50,
                      margin: '50px 0 0 0',
                    }}>
                      Submit at vitalsigns.ca
                    </p>
                  </div>
                )}

                {/* Logo Template */}
                {template === 'logo' && (() => {
                  const colors = getLogoColors(logoVariant);
                  const size = logoSizes[logoSize];
                  return (
                    <div
                      ref={canvasRef}
                      style={{
                        width: size.width,
                        height: size.height,
                        background: colors.bg,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'Inter, sans-serif',
                        boxSizing: 'border-box',
                      }}
                    >
                      <p style={{
                        fontSize: logoSize === 'square' ? 72 : logoSize === 'horizontal' ? 96 : 64,
                        fontWeight: 600,
                        color: colors.text,
                        letterSpacing: '-0.02em',
                        margin: 0,
                      }}>
                        Vital Signs<span style={{ color: colors.dot }}>.</span>
                      </p>
                      <p style={{
                        fontSize: logoSize === 'square' ? 20 : logoSize === 'horizontal' ? 24 : 18,
                        color: logoVariant === 'white' ? 'rgba(17,17,17,0.5)' : 'rgba(255,255,255,0.6)',
                        marginTop: 16,
                        margin: '16px 0 0 0',
                        letterSpacing: '0.1em',
                      }}>
                        Real stories. Real health. Real people.
                      </p>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .ig-generator {
          min-height: 100vh;
          background: var(--vs-bg-subtle);
        }

        .ig-header {
          background: var(--vs-white);
          padding: var(--vs-space-8) 0;
          border-bottom: 1px solid var(--vs-border);
        }

        .ig-header h1 {
          font-size: 1.5rem;
          margin-bottom: var(--vs-space-1);
        }

        .ig-header p {
          color: var(--vs-text-secondary);
        }

        .ig-content {
          padding: var(--vs-space-8) 0;
        }

        .ig-layout {
          display: grid;
          grid-template-columns: 360px 1fr;
          gap: var(--vs-space-8);
          align-items: start;
        }

        .ig-controls {
          background: var(--vs-white);
          border: 1px solid var(--vs-border);
          border-radius: var(--vs-radius-lg);
          padding: var(--vs-space-6);
        }

        .control-section {
          margin-bottom: var(--vs-space-6);
        }

        .control-label {
          display: block;
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--vs-text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: var(--vs-space-3);
        }

        .template-buttons {
          display: flex;
          flex-direction: column;
          gap: var(--vs-space-2);
        }

        .template-btn {
          display: flex;
          align-items: center;
          gap: var(--vs-space-2);
          padding: var(--vs-space-3) var(--vs-space-4);
          background: var(--vs-white);
          border: 1px solid var(--vs-border);
          border-radius: var(--vs-radius-md);
          font-family: var(--vs-font);
          font-size: 0.9375rem;
          font-weight: 500;
          color: var(--vs-text-secondary);
          cursor: pointer;
          transition: all var(--vs-transition-fast);
          text-align: left;
        }

        .template-btn:hover {
          border-color: var(--vs-border-hover);
        }

        .template-btn.active {
          background: var(--vs-black);
          color: var(--vs-white);
          border-color: var(--vs-black);
        }

        .control-input,
        .control-textarea {
          width: 100%;
          padding: var(--vs-space-3);
          font-family: var(--vs-font);
          font-size: 0.9375rem;
          border: 1px solid var(--vs-border);
          border-radius: var(--vs-radius-md);
          resize: vertical;
          box-sizing: border-box;
        }

        .control-input:focus,
        .control-textarea:focus {
          outline: none;
          border-color: var(--vs-text-tertiary);
        }

        .char-count {
          display: block;
          font-size: 0.75rem;
          color: var(--vs-text-tertiary);
          text-align: right;
          margin-top: var(--vs-space-1);
        }

        .author-controls {
          display: flex;
          gap: var(--vs-space-3);
          align-items: center;
        }

        .author-controls .control-input {
          flex: 1;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: var(--vs-space-2);
          font-size: 0.875rem;
          color: var(--vs-text-secondary);
          cursor: pointer;
          white-space: nowrap;
        }

        .checkbox-label input {
          accent-color: var(--vs-coral);
        }

        .tag-selector {
          display: flex;
          flex-wrap: wrap;
          gap: var(--vs-space-2);
        }

        .tag-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: var(--vs-space-1) var(--vs-space-3);
          font-family: var(--vs-font);
          font-size: 0.8125rem;
          font-weight: 500;
          color: var(--vs-text-secondary);
          background: var(--vs-white);
          border: 1px solid var(--vs-border);
          border-radius: var(--vs-radius-full);
          cursor: pointer;
          transition: all var(--vs-transition-fast);
        }

        .tag-btn:hover:not(:disabled) {
          border-color: var(--vs-border-hover);
        }

        .tag-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .tag-btn.active {
          background: var(--vs-coral);
          color: var(--vs-white);
          border-color: var(--vs-coral);
        }

        .variant-buttons {
          display: flex;
          gap: var(--vs-space-2);
        }

        .variant-btn {
          flex: 1;
          padding: var(--vs-space-2) var(--vs-space-3);
          font-family: var(--vs-font);
          font-size: 0.8125rem;
          font-weight: 500;
          border: 1px solid var(--vs-border);
          border-radius: var(--vs-radius-md);
          cursor: pointer;
          transition: all var(--vs-transition-fast);
        }

        .variant-btn.variant-white {
          background: var(--vs-white);
          color: var(--vs-text-primary);
        }

        .variant-btn.variant-coral {
          background: var(--vs-coral);
          color: var(--vs-white);
          border-color: var(--vs-coral);
        }

        .variant-btn.variant-black {
          background: var(--vs-black);
          color: var(--vs-white);
          border-color: var(--vs-black);
        }

        .variant-btn.active {
          box-shadow: 0 0 0 2px var(--vs-coral);
        }

        .download-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--vs-space-2);
          padding: var(--vs-space-4);
          background: var(--vs-coral);
          color: var(--vs-white);
          border: none;
          border-radius: var(--vs-radius-md);
          font-family: var(--vs-font);
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--vs-transition-fast);
        }

        .download-btn:hover:not(:disabled) {
          background: var(--vs-coral-hover);
        }

        .download-btn:disabled {
          opacity: 0.7;
          cursor: wait;
        }

        .ig-preview {
          background: var(--vs-white);
          border: 1px solid var(--vs-border);
          border-radius: var(--vs-radius-lg);
          padding: var(--vs-space-6);
        }

        .preview-label {
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--vs-text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: var(--vs-space-4);
        }

        .preview-container {
          display: flex;
          justify-content: center;
          overflow: hidden;
          border-radius: var(--vs-radius-md);
          border: 1px solid var(--vs-border);
        }

        .preview-container > div {
          transform-origin: top left;
          transform: scale(0.4);
        }

        @media (max-width: 1024px) {
          .ig-layout {
            grid-template-columns: 1fr;
          }

          .preview-container > div {
            transform: scale(0.35);
          }
        }
      `}</style>
    </div>
  );
};

export default InstagramGenerator;
