import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Download, Image, Type, Sparkles, Check } from 'lucide-react';
import { HEALTH_TAGS } from '../data/mockData.ts';

type TemplateType = 'story-highlight' | 'call-for-submissions' | 'logo';
type BackgroundVariant = 'white' | 'coral' | 'black';
type LogoSize = 'square' | 'horizontal' | 'story';

// ── Canvas rendering helpers ──────────────────────────────────────────
const SCALE = 3; // 3x for ultra-crisp output
const FONT = 'Inter, -apple-system, BlinkMacSystemFont, sans-serif';

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function drawPill(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, opts: {
  bg: string; color: string; fontSize: number; paddingX: number; paddingY: number;
  border?: string;
}): number {
  ctx.font = `500 ${opts.fontSize}px ${FONT}`;
  const tw = ctx.measureText(text).width;
  const pw = tw + opts.paddingX * 2;
  const ph = opts.fontSize + opts.paddingY * 2;
  const r = ph / 2;

  roundRect(ctx, x, y, pw, ph, r);
  ctx.fillStyle = opts.bg;
  ctx.fill();

  if (opts.border) {
    ctx.strokeStyle = opts.border;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  ctx.fillStyle = opts.color;
  ctx.fillText(text, x + opts.paddingX, y + opts.paddingY + opts.fontSize * 0.82);

  return pw;
}

function drawCenteredPills(ctx: CanvasRenderingContext2D, tags: string[], centerX: number, y: number, opts: {
  bg: string; color: string; fontSize: number; paddingX: number; paddingY: number;
  gap: number; border?: string;
}): number {
  // Measure total width first
  ctx.font = `500 ${opts.fontSize}px ${FONT}`;
  const widths = tags.map((t) => ctx.measureText(t).width + opts.paddingX * 2);
  const totalW = widths.reduce((a, b) => a + b, 0) + (tags.length - 1) * opts.gap;
  let cx = centerX - totalW / 2;
  const ph = opts.fontSize + opts.paddingY * 2;

  for (let i = 0; i < tags.length; i++) {
    drawPill(ctx, tags[i], cx, y, opts);
    cx += widths[i] + opts.gap;
  }
  return ph;
}

// ── Template renderers ────────────────────────────────────────────────

function renderStoryHighlight(
  ctx: CanvasRenderingContext2D, w: number, h: number,
  quote: string, author: string, isAnonymous: boolean, tags: string[]
) {
  // White background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, w, h);

  const cx = w / 2;

  // Card background
  const cardPad = 80;
  const cardW = w - cardPad * 2;
  const cardX = cardPad;
  const cardTop = 120;
  const cardBottom = h - 160;
  const cardH = cardBottom - cardTop;

  roundRect(ctx, cardX, cardTop, cardW, cardH, 28);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.strokeStyle = 'rgba(17,17,17,0.06)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Tags
  let tagY = cardTop + 56;
  if (tags.length > 0) {
    drawCenteredPills(ctx, tags.slice(0, 3), cx, tagY, {
      bg: 'rgba(255,90,95,0.08)',
      color: '#FF5A5F',
      fontSize: 20,
      paddingX: 20,
      paddingY: 10,
      gap: 10,
    });
    tagY += 56;
  }

  // Open quote mark
  ctx.font = `700 120px Georgia, serif`;
  ctx.fillStyle = 'rgba(255,90,95,0.12)';
  ctx.textAlign = 'center';
  ctx.fillText('\u201C', cx, tagY + 60);

  // Quote text
  const quoteFontSize = quote.length > 120 ? 32 : quote.length > 80 ? 36 : 42;
  ctx.font = `600 ${quoteFontSize}px ${FONT}`;
  ctx.fillStyle = '#111111';
  ctx.textAlign = 'center';
  const quoteMaxW = cardW - 120;
  const lines = wrapText(ctx, `\u201C${quote}\u201D`, quoteMaxW);
  const lineH = quoteFontSize * 1.45;
  const totalTextH = lines.length * lineH;
  const textStartY = cardTop + (cardH - totalTextH) / 2 + (tags.length > 0 ? 20 : 0);

  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], cx, textStartY + i * lineH + quoteFontSize * 0.82);
  }

  // Author
  const authorY = textStartY + totalTextH + 32;
  ctx.font = `500 22px ${FONT}`;
  ctx.fillStyle = 'rgba(17,17,17,0.5)';
  ctx.fillText(`\u2014 ${isAnonymous ? 'Anonymous' : author}`, cx, authorY);

  // Footer branding
  const footerY = h - 80;
  ctx.font = `600 28px ${FONT}`;
  ctx.fillStyle = '#111111';
  ctx.textAlign = 'center';
  const brandText = 'Vital Signs';
  const brandW = ctx.measureText(brandText).width;
  ctx.fillText(brandText, cx - 6, footerY);
  ctx.fillStyle = '#FF5A5F';
  ctx.fillText('.', cx + brandW / 2 - 2, footerY);

  ctx.font = `400 16px ${FONT}`;
  ctx.fillStyle = 'rgba(17,17,17,0.35)';
  ctx.fillText('vitalsigns.ca/stories', cx, footerY + 28);

  ctx.textAlign = 'start'; // reset
}

function renderCallForSubmissions(
  ctx: CanvasRenderingContext2D, w: number, h: number,
  headline: string, subheadline: string, tags: string[], bgVariant: BackgroundVariant
) {
  const isWhite = bgVariant === 'white';
  const isCoral = bgVariant === 'coral';

  // Background
  ctx.fillStyle = isWhite ? '#FFFFFF' : isCoral ? '#FF5A5F' : '#111111';
  ctx.fillRect(0, 0, w, h);

  const cx = w / 2;
  const textColor = isWhite ? '#111111' : '#FFFFFF';
  const subtleColor = isWhite ? 'rgba(17,17,17,0.55)' : 'rgba(255,255,255,0.75)';

  // Branding
  ctx.textAlign = 'center';
  ctx.font = `600 28px ${FONT}`;
  ctx.fillStyle = textColor;
  const brandText = 'Vital Signs';
  const brandW = ctx.measureText(brandText).width;
  ctx.fillText(brandText, cx - 6, 120);
  ctx.fillStyle = isCoral ? '#FFFFFF' : '#FF5A5F';
  ctx.fillText('.', cx + brandW / 2 - 2, 120);

  // Divider
  const divY = 160;
  ctx.fillStyle = isWhite ? 'rgba(17,17,17,0.08)' : 'rgba(255,255,255,0.25)';
  roundRect(ctx, cx - 100, divY, 200, 2, 1);
  ctx.fill();

  // Headline
  const hlFontSize = headline.length > 20 ? 56 : 72;
  ctx.font = `700 ${hlFontSize}px ${FONT}`;
  ctx.fillStyle = textColor;
  const hlLines = wrapText(ctx, headline.toUpperCase(), w - 160);
  const hlLineH = hlFontSize * 1.15;
  const hlStartY = 240;
  for (let i = 0; i < hlLines.length; i++) {
    ctx.fillText(hlLines[i], cx, hlStartY + i * hlLineH);
  }

  // Subheadline
  const subY = hlStartY + hlLines.length * hlLineH + 24;
  ctx.font = `400 26px ${FONT}`;
  ctx.fillStyle = subtleColor;
  ctx.fillText(`\u201C${subheadline}\u201D`, cx, subY);

  // Tags
  if (tags.length > 0) {
    const tagY = subY + 52;
    drawCenteredPills(ctx, tags.slice(0, 5), cx, tagY, {
      bg: 'transparent',
      color: textColor,
      fontSize: 18,
      paddingX: 24,
      paddingY: 12,
      gap: 12,
      border: isWhite ? 'rgba(17,17,17,0.12)' : 'rgba(255,255,255,0.35)',
    });
  }

  // Bottom CTA
  ctx.font = `500 22px ${FONT}`;
  ctx.fillStyle = textColor;
  ctx.fillText('Submit at vitalsigns.ca', cx, h - 80);

  ctx.textAlign = 'start';
}

function renderLogo(
  ctx: CanvasRenderingContext2D, w: number, h: number,
  logoVariant: BackgroundVariant
) {
  const isWhite = logoVariant === 'white';
  const isCoral = logoVariant === 'coral';

  const bgColor = isWhite ? '#FFFFFF' : isCoral ? '#FF5A5F' : '#111111';
  const textColor = isWhite ? '#111111' : '#FFFFFF';
  const dotColor = isCoral ? '#FFFFFF' : '#FF5A5F';
  const subColor = isWhite ? 'rgba(17,17,17,0.45)' : 'rgba(255,255,255,0.55)';

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, w, h);

  const cx = w / 2;
  const cy = h / 2;

  // Main text
  const mainSize = Math.min(w, h) > 1200 ? 96 : Math.min(w, h) > 600 ? 72 : 64;
  ctx.font = `600 ${mainSize}px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.fillStyle = textColor;
  const brandText = 'Vital Signs';
  const brandW = ctx.measureText(brandText).width;
  ctx.fillText(brandText, cx - 6, cy - 10);
  ctx.fillStyle = dotColor;
  ctx.fillText('.', cx + brandW / 2 - 2, cy - 10);

  // Tagline
  const taglineSize = mainSize * 0.26;
  ctx.font = `400 ${taglineSize}px ${FONT}`;
  ctx.fillStyle = subColor;
  ctx.letterSpacing = '0.12em';
  ctx.fillText('Real stories. Real health. Real people.', cx, cy + mainSize * 0.45);

  ctx.textAlign = 'start';
}

// ── Component ─────────────────────────────────────────────────────────

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

  const previewRef = useRef<HTMLCanvasElement>(null);

  const logoSizes = {
    square: { width: 1080, height: 1080 },
    horizontal: { width: 1920, height: 1080 },
    story: { width: 1080, height: 1920 },
  };

  // Draw preview onto the visible canvas
  const drawPreview = useCallback(() => {
    const canvas = previewRef.current;
    if (!canvas) return;

    let w: number, h: number;
    if (template === 'logo') {
      const s = logoSizes[logoSize];
      w = s.width; h = s.height;
    } else {
      w = 1080; h = 1080;
    }

    // Preview at 1x for display
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;

    if (template === 'story-highlight') {
      renderStoryHighlight(ctx, w, h, quote, author, isAnonymous, selectedTags);
    } else if (template === 'call-for-submissions') {
      renderCallForSubmissions(ctx, w, h, headline, subheadline, selectedTags, bgVariant);
    } else if (template === 'logo') {
      renderLogo(ctx, w, h, logoVariant);
    }
  }, [template, quote, author, isAnonymous, selectedTags, bgVariant, headline, subheadline, logoSize, logoVariant]); // eslint-disable-line

  // Redraw preview when inputs change
  React.useEffect(() => {
    drawPreview();
  }, [drawPreview]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      let w: number, h: number;
      if (template === 'logo') {
        const s = logoSizes[logoSize];
        w = s.width; h = s.height;
      } else {
        w = 1080; h = 1080;
      }

      // High-res offscreen canvas
      const offscreen = document.createElement('canvas');
      offscreen.width = w * SCALE;
      offscreen.height = h * SCALE;
      const ctx = offscreen.getContext('2d')!;
      ctx.scale(SCALE, SCALE);

      if (template === 'story-highlight') {
        renderStoryHighlight(ctx, w, h, quote, author, isAnonymous, selectedTags);
      } else if (template === 'call-for-submissions') {
        renderCallForSubmissions(ctx, w, h, headline, subheadline, selectedTags, bgVariant);
      } else if (template === 'logo') {
        renderLogo(ctx, w, h, logoVariant);
      }

      const link = document.createElement('a');
      link.download = `vital-signs-${template}-${Date.now()}.png`;
      link.href = offscreen.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error generating image:', error);
    } finally {
      setDownloading(false);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
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
          <p>Create on-brand posts for Vital Signs — downloads at 3x resolution</p>
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
                    data-testid="template-story-highlight"
                  >
                    <Type size={20} />
                    Story Highlight
                  </button>
                  <button
                    className={`template-btn ${template === 'call-for-submissions' ? 'active' : ''}`}
                    onClick={() => setTemplate('call-for-submissions')}
                    data-testid="template-call-for-submissions"
                  >
                    <Sparkles size={20} />
                    Call for Submissions
                  </button>
                  <button
                    className={`template-btn ${template === 'logo' ? 'active' : ''}`}
                    onClick={() => setTemplate('logo')}
                    data-testid="template-logo"
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
                      data-testid="quote-input"
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
                        data-testid="author-input"
                      />
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={isAnonymous}
                          onChange={(e) => setIsAnonymous(e.target.checked)}
                          data-testid="anonymous-checkbox"
                        />
                        Anonymous
                      </label>
                    </div>
                  </div>

                  <div className="control-section">
                    <label className="control-label">Tags (max 3)</label>
                    <div className="tag-selector">
                      {HEALTH_TAGS.slice(0, 9).map((tag) => (
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
                      data-testid="headline-input"
                    />
                  </div>

                  <div className="control-section">
                    <label className="control-label">Subheadline</label>
                    <input
                      type="text"
                      className="control-input"
                      value={subheadline}
                      onChange={(e) => setSubheadline(e.target.value)}
                      data-testid="subheadline-input"
                    />
                  </div>

                  <div className="control-section">
                    <label className="control-label">Featured Topics</label>
                    <div className="tag-selector">
                      {HEALTH_TAGS.slice(0, 9).map((tag) => (
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
                      >White</button>
                      <button
                        className={`variant-btn variant-coral ${bgVariant === 'coral' ? 'active' : ''}`}
                        onClick={() => setBgVariant('coral')}
                      >Coral</button>
                      <button
                        className={`variant-btn variant-black ${bgVariant === 'black' ? 'active' : ''}`}
                        onClick={() => setBgVariant('black')}
                      >Black</button>
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
                      <button className={`variant-btn ${logoSize === 'square' ? 'active' : ''}`} onClick={() => setLogoSize('square')}>Square</button>
                      <button className={`variant-btn ${logoSize === 'horizontal' ? 'active' : ''}`} onClick={() => setLogoSize('horizontal')}>Horizontal</button>
                      <button className={`variant-btn ${logoSize === 'story' ? 'active' : ''}`} onClick={() => setLogoSize('story')}>Story</button>
                    </div>
                  </div>
                  <div className="control-section">
                    <label className="control-label">Variant</label>
                    <div className="variant-buttons">
                      <button className={`variant-btn variant-white ${logoVariant === 'white' ? 'active' : ''}`} onClick={() => setLogoVariant('white')}>Light</button>
                      <button className={`variant-btn variant-black ${logoVariant === 'black' ? 'active' : ''}`} onClick={() => setLogoVariant('black')}>Dark</button>
                      <button className={`variant-btn variant-coral ${logoVariant === 'coral' ? 'active' : ''}`} onClick={() => setLogoVariant('coral')}>Coral</button>
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
                data-testid="download-btn"
              >
                <Download size={20} />
                {downloading ? 'Generating...' : 'Download PNG (3x)'}
              </motion.button>
            </div>

            {/* Right Panel - Live Canvas Preview */}
            <div className="ig-preview">
              <div className="preview-label">Live Preview</div>
              <div className="preview-container" data-testid="preview-container">
                <canvas
                  ref={previewRef}
                  style={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: 'var(--vs-radius-md)',
                  }}
                />
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

        .template-btn:hover { border-color: var(--vs-border-hover); }
        .template-btn.active { background: var(--vs-black); color: var(--vs-white); border-color: var(--vs-black); }

        .control-input, .control-textarea {
          width: 100%;
          padding: var(--vs-space-3);
          font-family: var(--vs-font);
          font-size: 0.9375rem;
          border: 1px solid var(--vs-border);
          border-radius: var(--vs-radius-md);
          resize: vertical;
          box-sizing: border-box;
        }

        .control-input:focus, .control-textarea:focus { outline: none; border-color: var(--vs-text-tertiary); }

        .char-count {
          display: block;
          font-size: 0.75rem;
          color: var(--vs-text-tertiary);
          text-align: right;
          margin-top: var(--vs-space-1);
        }

        .author-controls { display: flex; gap: var(--vs-space-3); align-items: center; }
        .author-controls .control-input { flex: 1; }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: var(--vs-space-2);
          font-size: 0.875rem;
          color: var(--vs-text-secondary);
          cursor: pointer;
          white-space: nowrap;
        }
        .checkbox-label input { accent-color: var(--vs-coral); }

        .tag-selector { display: flex; flex-wrap: wrap; gap: var(--vs-space-2); }

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
        .tag-btn:hover:not(:disabled) { border-color: var(--vs-border-hover); }
        .tag-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .tag-btn.active { background: var(--vs-coral); color: var(--vs-white); border-color: var(--vs-coral); }

        .variant-buttons { display: flex; gap: var(--vs-space-2); }

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
        .variant-btn.variant-white { background: var(--vs-white); color: var(--vs-text-primary); }
        .variant-btn.variant-coral { background: var(--vs-coral); color: var(--vs-white); border-color: var(--vs-coral); }
        .variant-btn.variant-black { background: var(--vs-black); color: var(--vs-white); border-color: var(--vs-black); }
        .variant-btn.active { box-shadow: 0 0 0 2px var(--vs-coral); }

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
        .download-btn:hover:not(:disabled) { background: var(--vs-coral-hover); }
        .download-btn:disabled { opacity: 0.7; cursor: wait; }

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
          border-radius: var(--vs-radius-md);
          border: 1px solid var(--vs-border);
          overflow: hidden;
        }

        @media (max-width: 1024px) {
          .ig-layout { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default InstagramGenerator;
