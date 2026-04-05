import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Download, Image, Type, Sparkles, Check, Heart, MessageCircle, Calendar, Users, TrendingUp, UserPlus } from 'lucide-react';
import { HEALTH_TAGS } from '../data/mockData.ts';

type TemplateType = 'story-highlight' | 'call-for-submissions' | 'logo' | 'stat-card' | 'event-promo' | 'community-spotlight' | 'quote-carousel' | 'tip-of-day' | 'call-for-reviewers';
type BackgroundVariant = 'white' | 'coral' | 'black' | 'gradient' | 'teal';
type LogoSize = 'square' | 'horizontal' | 'story';

const SCALE = 3;
const FONT = 'Inter, system-ui, -apple-system, sans-serif';
const SERIF = 'Georgia, "Times New Roman", serif';
const CORAL = '#FF5A5F';
const TEAL = '#0D9488';
const CHARCOAL = '#1a1a1a';
const WARM_WHITE = '#FEFCFA';
const SOFT_GRAY = '#F5F3F0';

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

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

function drawMinimalBackground(ctx: CanvasRenderingContext2D, w: number, h: number, variant: BackgroundVariant) {
  if (variant === 'gradient') {
    // Soft warm gradient
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#FFF8F6');
    grad.addColorStop(1, '#FFF0ED');
    ctx.fillStyle = grad;
  } else if (variant === 'teal') {
    ctx.fillStyle = TEAL;
  } else if (variant === 'coral') {
    ctx.fillStyle = CORAL;
  } else if (variant === 'black') {
    ctx.fillStyle = CHARCOAL;
  } else {
    ctx.fillStyle = WARM_WHITE;
  }
  ctx.fillRect(0, 0, w, h);
}

function drawMinimalBranding(ctx: CanvasRenderingContext2D, cx: number, y: number, isDark: boolean, size: number = 20) {
  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = `500 ${size}px ${FONT}`;
  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.25)';
  ctx.fillText('vitalsigns.health', cx, y);
  ctx.restore();
}

// ═══════════════════════════════════════════════════════════════════════════
// MINIMALIST TEMPLATE RENDERERS
// ═══════════════════════════════════════════════════════════════════════════

function renderStoryHighlight(ctx: CanvasRenderingContext2D, w: number, h: number, quote: string, author: string, isAnonymous: boolean, tags: string[]) {
  // Clean warm background
  ctx.fillStyle = WARM_WHITE;
  ctx.fillRect(0, 0, w, h);
  
  const cx = w / 2;
  const margin = 70;
  
  // Single elegant accent line at top
  ctx.fillStyle = CORAL;
  ctx.fillRect(margin, 60, 50, 3);
  
  // Small tag label
  if (tags.length > 0) {
    ctx.font = `500 13px ${FONT}`;
    ctx.fillStyle = CORAL;
    ctx.textAlign = 'left';
    ctx.fillText(tags[0].toUpperCase(), margin, 100);
  }
  
  // Large opening quote mark - very subtle
  ctx.font = `300 240px ${SERIF}`;
  ctx.fillStyle = 'rgba(255, 90, 95, 0.08)';
  ctx.textAlign = 'left';
  ctx.fillText('"', margin - 15, 300);
  
  // Main quote - elegant serif
  const qLen = quote.length;
  const fontSize = qLen > 120 ? 38 : qLen > 80 ? 46 : 54;
  ctx.font = `400 ${fontSize}px ${SERIF}`;
  ctx.fillStyle = CHARCOAL;
  ctx.textAlign = 'left';
  const lines = wrapText(ctx, quote, w - margin * 2);
  const lineH = fontSize * 1.45;
  
  // Center quote block vertically
  const blockH = lines.length * lineH;
  let y = Math.max(220, (h - blockH) / 2 - 20);
  
  lines.forEach((line, i) => {
    ctx.fillText(line, margin, y + i * lineH);
  });
  
  // Author - minimal styling
  const authorY = y + lines.length * lineH + 40;
  ctx.font = `500 18px ${FONT}`;
  ctx.fillStyle = '#666';
  ctx.fillText(`— ${isAnonymous ? 'Anonymous' : author}`, margin, authorY);
  
  // Bottom branding
  drawMinimalBranding(ctx, cx, h - 45, false, 15);
  ctx.textAlign = 'start';
}

function renderCallForSubmissions(ctx: CanvasRenderingContext2D, w: number, h: number, headline: string, subheadline: string, tags: string[], bg: BackgroundVariant) {
  const isDark = bg === 'coral' || bg === 'black' || bg === 'teal';
  drawMinimalBackground(ctx, w, h, bg);
  
  const cx = w / 2;
  const margin = 60;
  const textColor = isDark ? '#FFFFFF' : CHARCOAL;
  const subtleColor = isDark ? 'rgba(255,255,255,0.7)' : '#666';
  
  // Vertical accent line
  const lineX = margin;
  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.3)' : CORAL;
  ctx.fillRect(lineX, 160, 3, 320);
  
  // Small label
  ctx.font = `600 11px ${FONT}`;
  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.6)' : CORAL;
  ctx.textAlign = 'left';
  ctx.letterSpacing = '0.15em';
  ctx.fillText('CALL FOR STORIES', lineX + 24, 180);
  
  // Large headline - dramatic size
  ctx.font = `700 68px ${FONT}`;
  ctx.fillStyle = textColor;
  const hlLines = wrapText(ctx, headline, w - margin * 2 - 30);
  let y = 280;
  hlLines.forEach(line => {
    ctx.fillText(line, lineX + 24, y);
    y += 75;
  });
  
  // Subheadline
  ctx.font = `400 22px ${FONT}`;
  ctx.fillStyle = subtleColor;
  ctx.fillText(subheadline, lineX + 24, y + 15);
  
  // Minimal tags at bottom
  if (tags.length > 0) {
    ctx.font = `400 13px ${FONT}`;
    ctx.fillStyle = subtleColor;
    const tagText = tags.slice(0, 3).join('  ·  ');
    ctx.fillText(tagText, lineX + 24, h - 100);
  }
  
  // Arrow indicator
  ctx.font = `300 28px ${FONT}`;
  ctx.fillStyle = textColor;
  ctx.fillText('→', w - margin - 30, h - 96);
  
  // Branding
  drawMinimalBranding(ctx, cx, h - 45, isDark, 15);
  ctx.textAlign = 'start';
}

function renderCallForReviewers(ctx: CanvasRenderingContext2D, w: number, h: number, headline: string, description: string, benefits: string[], bg: BackgroundVariant) {
  const isDark = bg === 'coral' || bg === 'black' || bg === 'teal';
  drawMinimalBackground(ctx, w, h, bg);
  
  const cx = w / 2;
  const margin = 60;
  const textColor = isDark ? '#FFFFFF' : CHARCOAL;
  const subtleColor = isDark ? 'rgba(255,255,255,0.6)' : '#888';
  const accentColor = isDark ? '#FFFFFF' : CORAL;
  
  // Top label with line
  ctx.fillStyle = accentColor;
  ctx.fillRect(margin, 80, 35, 3);
  
  ctx.font = `600 11px ${FONT}`;
  ctx.fillStyle = subtleColor;
  ctx.textAlign = 'left';
  ctx.fillText('JOIN US', margin + 48, 86);
  
  // Headline
  ctx.font = `700 52px ${FONT}`;
  ctx.fillStyle = textColor;
  const hlLines = wrapText(ctx, headline, w - margin * 2);
  let y = 180;
  hlLines.forEach(line => {
    ctx.fillText(line, margin, y);
    y += 58;
  });
  
  // Description
  ctx.font = `400 20px ${FONT}`;
  ctx.fillStyle = subtleColor;
  const descLines = wrapText(ctx, description, w - margin * 2);
  y += 10;
  descLines.forEach(line => {
    ctx.fillText(line, margin, y);
    y += 28;
  });
  
  // Benefits - minimal bullet style
  y += 35;
  ctx.font = `500 17px ${FONT}`;
  benefits.slice(0, 4).forEach((benefit) => {
    ctx.fillStyle = accentColor;
    ctx.fillText('·', margin, y);
    ctx.fillStyle = textColor;
    ctx.fillText(benefit, margin + 18, y);
    y += 36;
  });
  
  // Branding
  drawMinimalBranding(ctx, cx, h - 45, isDark, 15);
  ctx.textAlign = 'start';
}

function renderStatCard(ctx: CanvasRenderingContext2D, w: number, h: number, statNumber: string, statLabel: string, description: string, bg: BackgroundVariant) {
  const isDark = bg === 'coral' || bg === 'black' || bg === 'teal';
  drawMinimalBackground(ctx, w, h, bg);
  
  const cx = w / 2;
  const textColor = isDark ? '#FFFFFF' : CHARCOAL;
  const subtleColor = isDark ? 'rgba(255,255,255,0.5)' : '#999';
  const accentColor = isDark ? '#FFFFFF' : CORAL;
  
  ctx.textAlign = 'center';
  
  // Massive number - the hero
  ctx.font = `200 220px ${FONT}`;
  ctx.fillStyle = textColor;
  ctx.fillText(statNumber, cx, h/2 + 20);
  
  // Thin line
  ctx.fillStyle = accentColor;
  ctx.fillRect(cx - 25, h/2 + 50, 50, 2);
  
  // Label
  ctx.font = `600 14px ${FONT}`;
  ctx.fillStyle = subtleColor;
  ctx.fillText(statLabel.toUpperCase(), cx, h/2 + 90);
  
  // Description
  ctx.font = `400 18px ${FONT}`;
  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.7)' : '#666';
  const lines = wrapText(ctx, description, w - 160);
  lines.slice(0, 2).forEach((line, i) => {
    ctx.fillText(line, cx, h/2 + 135 + i * 26);
  });
  
  // Branding
  drawMinimalBranding(ctx, cx, h - 45, isDark, 15);
  ctx.textAlign = 'start';
}

function renderEventPromo(ctx: CanvasRenderingContext2D, w: number, h: number, eventTitle: string, eventDate: string, eventDescription: string, bg: BackgroundVariant) {
  const isDark = bg === 'coral' || bg === 'black' || bg === 'teal';
  drawMinimalBackground(ctx, w, h, bg);
  
  const margin = 60;
  const cx = w / 2;
  const textColor = isDark ? '#FFFFFF' : CHARCOAL;
  const subtleColor = isDark ? 'rgba(255,255,255,0.6)' : '#888';
  const accentColor = isDark ? '#FFFFFF' : CORAL;
  
  // Top corner date badge
  ctx.fillStyle = accentColor;
  roundRect(ctx, w - margin - 130, 60, 130, 44, 22);
  ctx.fill();
  ctx.font = `600 14px ${FONT}`;
  ctx.fillStyle = isDark ? CHARCOAL : '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.fillText(eventDate.split('•')[0]?.trim() || eventDate, w - margin - 65, 88);
  
  // Event label
  ctx.font = `600 11px ${FONT}`;
  ctx.fillStyle = subtleColor;
  ctx.textAlign = 'left';
  ctx.fillText('EVENT', margin, 80);
  
  // Large title - stacked dramatically
  ctx.font = `700 58px ${FONT}`;
  ctx.fillStyle = textColor;
  const titleLines = wrapText(ctx, eventTitle, w - margin * 2);
  let y = 220;
  titleLines.forEach(line => {
    ctx.fillText(line, margin, y);
    y += 66;
  });
  
  // Time
  ctx.font = `400 18px ${FONT}`;
  ctx.fillStyle = subtleColor;
  const timePart = eventDate.split('•')[1]?.trim() || '';
  if (timePart) {
    ctx.fillText(timePart, margin, y + 20);
  }
  
  // Description
  ctx.font = `400 20px ${FONT}`;
  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.8)' : '#555';
  const descLines = wrapText(ctx, eventDescription, w - margin * 2);
  y += 70;
  descLines.slice(0, 2).forEach(line => {
    ctx.fillText(line, margin, y);
    y += 28;
  });
  
  // Branding
  drawMinimalBranding(ctx, cx, h - 45, isDark, 15);
  ctx.textAlign = 'start';
}

function renderCommunitySpotlight(ctx: CanvasRenderingContext2D, w: number, h: number, memberName: string, memberStory: string, memberTags: string[], bg: BackgroundVariant) {
  const isDark = bg === 'coral' || bg === 'black' || bg === 'teal';
  drawMinimalBackground(ctx, w, h, bg);
  
  const cx = w / 2;
  const margin = 60;
  const textColor = isDark ? '#FFFFFF' : CHARCOAL;
  const subtleColor = isDark ? 'rgba(255,255,255,0.6)' : '#888';
  const accentColor = isDark ? '#FFFFFF' : CORAL;
  
  ctx.textAlign = 'center';
  
  // Minimal label
  ctx.font = `600 11px ${FONT}`;
  ctx.fillStyle = subtleColor;
  ctx.fillText('COMMUNITY SPOTLIGHT', cx, 80);
  
  // Large initial letter as avatar
  const initial = memberName.charAt(0).toUpperCase();
  ctx.font = `300 160px ${SERIF}`;
  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,90,95,0.1)';
  ctx.fillText(initial, cx, 280);
  
  // Name overlaid
  ctx.font = `600 34px ${FONT}`;
  ctx.fillStyle = textColor;
  ctx.fillText(memberName, cx, 250);
  
  // Tags
  if (memberTags.length > 0) {
    ctx.font = `400 13px ${FONT}`;
    ctx.fillStyle = accentColor;
    ctx.fillText(memberTags.slice(0, 2).join('  ·  '), cx, 285);
  }
  
  // Quote
  ctx.font = `400 italic 26px ${SERIF}`;
  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.9)' : '#444';
  ctx.textAlign = 'left';
  const lines = wrapText(ctx, `"${memberStory}"`, w - margin * 2);
  let y = 400;
  lines.slice(0, 4).forEach(line => {
    ctx.textAlign = 'center';
    ctx.fillText(line, cx, y);
    y += 38;
  });
  
  // Branding
  drawMinimalBranding(ctx, cx, h - 45, isDark, 15);
  ctx.textAlign = 'start';
}

function renderQuoteCarousel(ctx: CanvasRenderingContext2D, w: number, h: number, quote: string, slideNumber: string, totalSlides: string, bg: BackgroundVariant) {
  const isDark = bg === 'coral' || bg === 'black' || bg === 'teal';
  drawMinimalBackground(ctx, w, h, bg);
  
  const cx = w / 2;
  const margin = 60;
  const textColor = isDark ? '#FFFFFF' : CHARCOAL;
  const subtleColor = isDark ? 'rgba(255,255,255,0.4)' : '#bbb';
  const accentColor = isDark ? '#FFFFFF' : CORAL;
  
  ctx.textAlign = 'center';
  
  // Slide indicator - minimal dots at top
  const total = parseInt(totalSlides) || 5;
  const current = parseInt(slideNumber) || 1;
  const dotSpacing = 14;
  let dotX = cx - ((total - 1) * dotSpacing) / 2;
  for (let i = 1; i <= total; i++) {
    ctx.beginPath();
    ctx.arc(dotX, 60, i === current ? 4 : 2.5, 0, Math.PI * 2);
    ctx.fillStyle = i === current ? accentColor : subtleColor;
    ctx.fill();
    dotX += dotSpacing;
  }
  
  // Giant subtle quote mark
  ctx.font = `300 340px ${SERIF}`;
  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';
  ctx.fillText('"', cx, 440);
  
  // Quote text - centered and elegant
  const qLen = quote.length;
  const fontSize = qLen > 100 ? 38 : qLen > 60 ? 46 : 54;
  ctx.font = `400 ${fontSize}px ${SERIF}`;
  ctx.fillStyle = textColor;
  const lines = wrapText(ctx, quote, w - margin * 2);
  const lineH = fontSize * 1.45;
  const blockH = lines.length * lineH;
  const startY = (h - blockH) / 2 + 30;
  
  lines.forEach((line, i) => {
    ctx.fillText(line, cx, startY + i * lineH);
  });
  
  // Branding
  drawMinimalBranding(ctx, cx, h - 45, isDark, 15);
  ctx.textAlign = 'start';
}

function renderTipOfDay(ctx: CanvasRenderingContext2D, w: number, h: number, tipTitle: string, tipContent: string, tipNumber: string, bg: BackgroundVariant) {
  const isDark = bg === 'coral' || bg === 'black' || bg === 'teal';
  drawMinimalBackground(ctx, w, h, bg);
  
  const cx = w / 2;
  const margin = 60;
  const textColor = isDark ? '#FFFFFF' : CHARCOAL;
  const subtleColor = isDark ? 'rgba(255,255,255,0.6)' : '#888';
  const accentColor = isDark ? '#FFFFFF' : CORAL;
  
  // Large tip number in background
  ctx.font = `200 280px ${FONT}`;
  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';
  ctx.textAlign = 'right';
  ctx.fillText(tipNumber, w - 30, 300);
  
  // Label
  ctx.font = `600 11px ${FONT}`;
  ctx.fillStyle = accentColor;
  ctx.textAlign = 'left';
  ctx.fillText(`TIP #${tipNumber}`, margin, 110);
  
  // Title
  ctx.font = `700 48px ${FONT}`;
  ctx.fillStyle = textColor;
  const titleLines = wrapText(ctx, tipTitle, w - margin * 2);
  let y = 210;
  titleLines.forEach(line => {
    ctx.fillText(line, margin, y);
    y += 55;
  });
  
  // Accent line
  ctx.fillStyle = accentColor;
  ctx.fillRect(margin, y + 5, 45, 3);
  
  // Content
  ctx.font = `400 22px ${FONT}`;
  ctx.fillStyle = subtleColor;
  const contentLines = wrapText(ctx, tipContent, w - margin * 2);
  y += 45;
  contentLines.slice(0, 4).forEach(line => {
    ctx.fillText(line, margin, y);
    y += 32;
  });
  
  // Branding
  drawMinimalBranding(ctx, cx, h - 45, isDark, 15);
  ctx.textAlign = 'start';
}

function renderLogo(ctx: CanvasRenderingContext2D, w: number, h: number, variant: BackgroundVariant) {
  const isWhite = variant === 'white';
  const isCoral = variant === 'coral';
  
  ctx.fillStyle = isWhite ? WARM_WHITE : isCoral ? CORAL : CHARCOAL;
  ctx.fillRect(0, 0, w, h);
  
  const cx = w / 2, cy = h / 2;
  const textColor = isWhite ? CHARCOAL : '#FFFFFF';
  const dotColor = isCoral ? '#FFFFFF' : CORAL;
  
  // Clean wordmark
  const mainSize = Math.min(w, h) > 1200 ? 80 : Math.min(w, h) > 600 ? 64 : 56;
  ctx.font = `600 ${mainSize}px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.fillStyle = textColor;
  const text = 'Vital Signs';
  const tw = ctx.measureText(text).width;
  ctx.fillText(text, cx, cy);
  
  // Accent dot
  ctx.beginPath();
  ctx.arc(cx + tw/2 + 12, cy - mainSize * 0.3, 8, 0, Math.PI * 2);
  ctx.fillStyle = dotColor;
  ctx.fill();
  
  // Tagline
  ctx.font = `400 ${mainSize * 0.22}px ${FONT}`;
  ctx.fillStyle = isWhite ? '#888' : 'rgba(255,255,255,0.6)';
  ctx.fillText('Real stories. Real health.', cx, cy + mainSize * 0.6);
  ctx.textAlign = 'start';
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const InstagramGenerator: React.FC = () => {
  const [template, setTemplate] = useState<TemplateType>('story-highlight');
  const [quote, setQuote] = useState('Learning to live with uncertainty changed everything about how I understand my future.');
  const [author, setAuthor] = useState('Sarah M.');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>(['Mental Health', 'Chronic Illness']);
  const [bgVariant, setBgVariant] = useState<BackgroundVariant>('white');
  const [headline, setHeadline] = useState('Share Your Story');
  const [subheadline, setSubheadline] = useState('Your experience could help someone feel less alone');
  const [logoSize, setLogoSize] = useState<LogoSize>('square');
  const [logoVariant, setLogoVariant] = useState<BackgroundVariant>('white');
  const [downloading, setDownloading] = useState(false);

  const [statNumber, setStatNumber] = useState('127');
  const [statLabel, setStatLabel] = useState('Stories Shared');
  const [statDescription, setStatDescription] = useState('Real people sharing their health journeys to help others feel less alone.');

  const [eventTitle, setEventTitle] = useState('Virtual Story Circle');
  const [eventDate, setEventDate] = useState('March 15 • 7PM EST');
  const [eventDescription, setEventDescription] = useState('Join us for an evening of sharing, listening, and connection.');

  const [memberName, setMemberName] = useState('Jordan K.');
  const [memberStory, setMemberStory] = useState('Sharing my story here helped me realize I was never alone in my journey.');

  const [slideNumber, setSlideNumber] = useState('1');
  const [totalSlides, setTotalSlides] = useState('5');
  const [carouselQuote, setCarouselQuote] = useState('Every story shared here makes someone else feel less alone in their journey.');

  const [tipTitle, setTipTitle] = useState('Start Where You Are');
  const [tipContent, setTipContent] = useState("You don't need to have your whole story figured out. Share what feels true today.");
  const [tipNumber, setTipNumber] = useState('42');

  const [reviewerHeadline, setReviewerHeadline] = useState('Become a Story Reviewer');
  const [reviewerDescription, setReviewerDescription] = useState('Help us create a safe, supportive space for health storytelling.');
  const [reviewerBenefits, setReviewerBenefits] = useState(['Shape community guidelines', 'Support fellow storytellers', 'Build moderation experience', 'Join a meaningful mission']);

  const previewRef = useRef<HTMLCanvasElement>(null);
  const logoSizes = { square: { width: 1080, height: 1080 }, horizontal: { width: 1920, height: 1080 }, story: { width: 1080, height: 1920 } };

  const renderToCanvas = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    switch (template) {
      case 'story-highlight': renderStoryHighlight(ctx, w, h, quote, author, isAnonymous, selectedTags); break;
      case 'call-for-submissions': renderCallForSubmissions(ctx, w, h, headline, subheadline, selectedTags, bgVariant); break;
      case 'call-for-reviewers': renderCallForReviewers(ctx, w, h, reviewerHeadline, reviewerDescription, reviewerBenefits, bgVariant); break;
      case 'stat-card': renderStatCard(ctx, w, h, statNumber, statLabel, statDescription, bgVariant); break;
      case 'event-promo': renderEventPromo(ctx, w, h, eventTitle, eventDate, eventDescription, bgVariant); break;
      case 'community-spotlight': renderCommunitySpotlight(ctx, w, h, memberName, memberStory, selectedTags, bgVariant); break;
      case 'quote-carousel': renderQuoteCarousel(ctx, w, h, carouselQuote, slideNumber, totalSlides, bgVariant); break;
      case 'tip-of-day': renderTipOfDay(ctx, w, h, tipTitle, tipContent, tipNumber, bgVariant); break;
      case 'logo': renderLogo(ctx, w, h, logoVariant); break;
    }
  }, [template, quote, author, isAnonymous, selectedTags, bgVariant, headline, subheadline, logoVariant,
      statNumber, statLabel, statDescription, eventTitle, eventDate, eventDescription, memberName, memberStory,
      slideNumber, totalSlides, carouselQuote, tipTitle, tipContent, tipNumber, reviewerHeadline, reviewerDescription, reviewerBenefits]);

  const drawPreview = useCallback(() => {
    const canvas = previewRef.current;
    if (!canvas) return;
    let w: number, h: number;
    if (template === 'logo') { const s = logoSizes[logoSize]; w = s.width; h = s.height; }
    else { w = 1080; h = 1080; }
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d')!;
    renderToCanvas(ctx, w, h);
  }, [template, logoSize, renderToCanvas]); // eslint-disable-line

  React.useEffect(() => { drawPreview(); }, [drawPreview]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      let w: number, h: number;
      if (template === 'logo') { const s = logoSizes[logoSize]; w = s.width; h = s.height; }
      else { w = 1080; h = 1080; }
      const offscreen = document.createElement('canvas');
      offscreen.width = w * SCALE; offscreen.height = h * SCALE;
      const ctx = offscreen.getContext('2d')!;
      ctx.scale(SCALE, SCALE);
      renderToCanvas(ctx, w, h);
      const link = document.createElement('a');
      link.download = `vital-signs-${template}-${Date.now()}.png`;
      link.href = offscreen.toDataURL('image/png');
      link.click();
    } finally { setDownloading(false); }
  };

  const toggleTag = (tag: string) => setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  const updateBenefit = (i: number, v: string) => setReviewerBenefits(prev => { const n = [...prev]; n[i] = v; return n; });

  const templates: { id: TemplateType; label: string; icon: React.ReactNode }[] = [
    { id: 'story-highlight', label: 'Story', icon: <Type size={16} /> },
    { id: 'call-for-submissions', label: 'Call for Stories', icon: <Sparkles size={16} /> },
    { id: 'call-for-reviewers', label: 'Reviewers', icon: <UserPlus size={16} /> },
    { id: 'stat-card', label: 'Stats', icon: <TrendingUp size={16} /> },
    { id: 'event-promo', label: 'Event', icon: <Calendar size={16} /> },
    { id: 'community-spotlight', label: 'Spotlight', icon: <Users size={16} /> },
    { id: 'quote-carousel', label: 'Carousel', icon: <MessageCircle size={16} /> },
    { id: 'tip-of-day', label: 'Tip', icon: <Heart size={16} /> },
    { id: 'logo', label: 'Logo', icon: <Image size={16} /> },
  ];

  const BgSelector = () => (
    <div className="control-section">
      <label className="control-label">Background</label>
      <div className="variant-buttons">
        {(['white', 'coral', 'black', 'gradient', 'teal'] as BackgroundVariant[]).map(v => (
          <button key={v} className={`variant-btn variant-${v} ${bgVariant === v ? 'active' : ''}`} onClick={() => setBgVariant(v)}>
            {v === 'white' ? 'Light' : v === 'gradient' ? 'Warm' : v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="ig-generator">
      <div className="ig-header">
        <h1>Instagram Post Generator</h1>
        <p>Create minimalist, on-brand posts — exports at 3x resolution</p>
      </div>
      <div className="ig-layout">
        <div className="ig-controls">
          <div className="control-section">
            <label className="control-label">Template</label>
            <div className="template-grid">
              {templates.map(t => (
                <button key={t.id} className={`template-btn ${template === t.id ? 'active' : ''}`} onClick={() => setTemplate(t.id)}>
                  {t.icon}<span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {template === 'story-highlight' && (<>
            <div className="control-section"><label className="control-label">Quote</label><textarea className="control-textarea" value={quote} onChange={e => setQuote(e.target.value)} maxLength={180} rows={3} /><span className="char-count">{quote.length}/180</span></div>
            <div className="control-section"><label className="control-label">Author</label><div className="author-row"><input type="text" className="control-input" value={author} onChange={e => setAuthor(e.target.value)} disabled={isAnonymous} /><label className="checkbox-label"><input type="checkbox" checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)} /> Anonymous</label></div></div>
            <div className="control-section"><label className="control-label">Tags (max 3)</label><div className="tag-selector">{HEALTH_TAGS.slice(0, 9).map(tag => (<button key={tag.id} className={`tag-btn ${selectedTags.includes(tag.name) ? 'active' : ''}`} onClick={() => toggleTag(tag.name)} disabled={selectedTags.length >= 3 && !selectedTags.includes(tag.name)}>{selectedTags.includes(tag.name) && <Check size={12} />}{tag.name}</button>))}</div></div>
          </>)}

          {template === 'call-for-submissions' && (<>
            <div className="control-section"><label className="control-label">Headline</label><input type="text" className="control-input" value={headline} onChange={e => setHeadline(e.target.value)} /></div>
            <div className="control-section"><label className="control-label">Subheadline</label><input type="text" className="control-input" value={subheadline} onChange={e => setSubheadline(e.target.value)} /></div>
            <div className="control-section"><label className="control-label">Topics</label><div className="tag-selector">{HEALTH_TAGS.slice(0, 9).map(tag => (<button key={tag.id} className={`tag-btn ${selectedTags.includes(tag.name) ? 'active' : ''}`} onClick={() => toggleTag(tag.name)}>{selectedTags.includes(tag.name) && <Check size={12} />}{tag.name}</button>))}</div></div>
            <BgSelector />
          </>)}

          {template === 'call-for-reviewers' && (<>
            <div className="control-section"><label className="control-label">Headline</label><input type="text" className="control-input" value={reviewerHeadline} onChange={e => setReviewerHeadline(e.target.value)} /></div>
            <div className="control-section"><label className="control-label">Description</label><textarea className="control-textarea" value={reviewerDescription} onChange={e => setReviewerDescription(e.target.value)} rows={2} /></div>
            <div className="control-section"><label className="control-label">Benefits (4)</label>{reviewerBenefits.map((b, i) => <input key={i} type="text" className="control-input benefit-input" value={b} onChange={e => updateBenefit(i, e.target.value)} />)}</div>
            <BgSelector />
          </>)}

          {template === 'stat-card' && (<>
            <div className="control-section"><label className="control-label">Number</label><input type="text" className="control-input" value={statNumber} onChange={e => setStatNumber(e.target.value)} /></div>
            <div className="control-section"><label className="control-label">Label</label><input type="text" className="control-input" value={statLabel} onChange={e => setStatLabel(e.target.value)} /></div>
            <div className="control-section"><label className="control-label">Description</label><textarea className="control-textarea" value={statDescription} onChange={e => setStatDescription(e.target.value)} rows={2} /></div>
            <BgSelector />
          </>)}

          {template === 'event-promo' && (<>
            <div className="control-section"><label className="control-label">Event Title</label><input type="text" className="control-input" value={eventTitle} onChange={e => setEventTitle(e.target.value)} /></div>
            <div className="control-section"><label className="control-label">Date & Time</label><input type="text" className="control-input" value={eventDate} onChange={e => setEventDate(e.target.value)} /></div>
            <div className="control-section"><label className="control-label">Description</label><textarea className="control-textarea" value={eventDescription} onChange={e => setEventDescription(e.target.value)} rows={2} /></div>
            <BgSelector />
          </>)}

          {template === 'community-spotlight' && (<>
            <div className="control-section"><label className="control-label">Member Name</label><input type="text" className="control-input" value={memberName} onChange={e => setMemberName(e.target.value)} /></div>
            <div className="control-section"><label className="control-label">Story Excerpt</label><textarea className="control-textarea" value={memberStory} onChange={e => setMemberStory(e.target.value)} rows={3} maxLength={150} /><span className="char-count">{memberStory.length}/150</span></div>
            <div className="control-section"><label className="control-label">Topics</label><div className="tag-selector">{HEALTH_TAGS.slice(0, 9).map(tag => (<button key={tag.id} className={`tag-btn ${selectedTags.includes(tag.name) ? 'active' : ''}`} onClick={() => toggleTag(tag.name)} disabled={selectedTags.length >= 3 && !selectedTags.includes(tag.name)}>{selectedTags.includes(tag.name) && <Check size={12} />}{tag.name}</button>))}</div></div>
            <BgSelector />
          </>)}

          {template === 'quote-carousel' && (<>
            <div className="control-section"><label className="control-label">Quote</label><textarea className="control-textarea" value={carouselQuote} onChange={e => setCarouselQuote(e.target.value)} rows={3} maxLength={150} /><span className="char-count">{carouselQuote.length}/150</span></div>
            <div className="control-section"><label className="control-label">Slide Position</label><div className="slide-row"><input type="number" className="control-input small" value={slideNumber} onChange={e => setSlideNumber(e.target.value)} min="1" /><span>of</span><input type="number" className="control-input small" value={totalSlides} onChange={e => setTotalSlides(e.target.value)} min="2" max="10" /></div></div>
            <BgSelector />
          </>)}

          {template === 'tip-of-day' && (<>
            <div className="control-section"><label className="control-label">Tip Number</label><input type="text" className="control-input small" value={tipNumber} onChange={e => setTipNumber(e.target.value)} /></div>
            <div className="control-section"><label className="control-label">Title</label><input type="text" className="control-input" value={tipTitle} onChange={e => setTipTitle(e.target.value)} /></div>
            <div className="control-section"><label className="control-label">Content</label><textarea className="control-textarea" value={tipContent} onChange={e => setTipContent(e.target.value)} rows={3} maxLength={180} /><span className="char-count">{tipContent.length}/180</span></div>
            <BgSelector />
          </>)}

          {template === 'logo' && (<>
            <div className="control-section"><label className="control-label">Size</label><div className="variant-buttons">{(['square', 'horizontal', 'story'] as LogoSize[]).map(s => (<button key={s} className={`variant-btn ${logoSize === s ? 'active' : ''}`} onClick={() => setLogoSize(s)}>{s.charAt(0).toUpperCase() + s.slice(1)}</button>))}</div></div>
            <div className="control-section"><label className="control-label">Variant</label><div className="variant-buttons">{(['white', 'black', 'coral'] as BackgroundVariant[]).map(v => (<button key={v} className={`variant-btn variant-${v} ${logoVariant === v ? 'active' : ''}`} onClick={() => setLogoVariant(v)}>{v === 'white' ? 'Light' : v === 'black' ? 'Dark' : 'Coral'}</button>))}</div></div>
          </>)}

          <motion.button className="download-btn" onClick={handleDownload} disabled={downloading} whileTap={{ scale: 0.98 }}>
            <Download size={20} />{downloading ? 'Generating...' : 'Download PNG (3x)'}
          </motion.button>
        </div>

        <div className="ig-preview">
          <div className="preview-label">Live Preview</div>
          <div className="preview-container"><canvas ref={previewRef} /></div>
        </div>
      </div>

      <style>{`
        .ig-generator { background: #f8f9fa; }
        .ig-header { padding: 1.25rem 0; border-bottom: 1px solid #e5e7eb; }
        .ig-header h1 { font-size: 1.25rem; margin: 0 0 0.25rem; }
        .ig-header p { color: #6b7280; font-size: 0.875rem; margin: 0; }
        .ig-layout { display: grid; grid-template-columns: 320px 1fr; gap: 1.5rem; padding: 1.5rem 0; align-items: start; }
        .ig-controls { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 1.25rem; max-height: 72vh; overflow-y: auto; }
        .control-section { margin-bottom: 1.25rem; }
        .control-label { display: block; font-size: 0.6875rem; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem; }
        .template-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.375rem; }
        .template-btn { display: flex; flex-direction: column; align-items: center; gap: 0.25rem; padding: 0.5rem 0.375rem; background: #fff; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 0.625rem; font-weight: 600; color: #6b7280; cursor: pointer; transition: all 0.15s; }
        .template-btn:hover { border-color: #d1d5db; }
        .template-btn.active { background: #1a1a1a; color: #fff; border-color: #1a1a1a; }
        .control-input, .control-textarea { width: 100%; padding: 0.6rem; font-family: inherit; font-size: 0.875rem; border: 1px solid #e5e7eb; border-radius: 6px; resize: vertical; box-sizing: border-box; }
        .control-input:focus, .control-textarea:focus { outline: none; border-color: #9ca3af; }
        .control-input.small { width: 60px; text-align: center; }
        .benefit-input { margin-bottom: 0.375rem; }
        .char-count { display: block; font-size: 0.625rem; color: #9ca3af; text-align: right; margin-top: 0.125rem; }
        .author-row, .slide-row { display: flex; gap: 0.5rem; align-items: center; }
        .author-row .control-input { flex: 1; }
        .slide-row span { color: #9ca3af; font-size: 0.8rem; }
        .checkbox-label { display: flex; align-items: center; gap: 0.375rem; font-size: 0.8rem; color: #6b7280; cursor: pointer; white-space: nowrap; }
        .checkbox-label input { accent-color: #ff5a5f; }
        .tag-selector { display: flex; flex-wrap: wrap; gap: 0.375rem; }
        .tag-btn { display: inline-flex; align-items: center; gap: 3px; padding: 0.25rem 0.5rem; font-size: 0.6875rem; font-weight: 600; color: #6b7280; background: #fff; border: 1px solid #e5e7eb; border-radius: 9999px; cursor: pointer; transition: all 0.15s; }
        .tag-btn:hover:not(:disabled) { border-color: #d1d5db; }
        .tag-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .tag-btn.active { background: #ff5a5f; color: #fff; border-color: #ff5a5f; }
        .variant-buttons { display: flex; gap: 0.375rem; flex-wrap: wrap; }
        .variant-btn { flex: 1; min-width: 50px; padding: 0.4rem 0.5rem; font-size: 0.6875rem; font-weight: 600; border: 1.5px solid #e5e7eb; border-radius: 6px; cursor: pointer; transition: all 0.15s; background: #fff; color: #1a1a1a; }
        .variant-btn.variant-coral { background: #ff5a5f; color: #fff; border-color: #ff5a5f; }
        .variant-btn.variant-black { background: #1a1a1a; color: #fff; border-color: #1a1a1a; }
        .variant-btn.variant-gradient { background: linear-gradient(135deg, #fff8f6, #fff0ed); border-color: #ffd4d1; }
        .variant-btn.variant-teal { background: #0d9488; color: #fff; border-color: #0d9488; }
        .variant-btn.active { box-shadow: 0 0 0 2px #ff5a5f; }
        .download-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.875rem; background: #ff5a5f; color: #fff; border: none; border-radius: 8px; font-size: 0.9375rem; font-weight: 700; cursor: pointer; transition: all 0.15s; }
        .download-btn:hover:not(:disabled) { filter: brightness(1.05); }
        .download-btn:disabled { opacity: 0.7; cursor: wait; }
        .ig-preview { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 1.25rem; position: sticky; top: 1rem; }
        .preview-label { font-size: 0.6875rem; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.75rem; }
        .preview-container { border-radius: 8px; border: 1px solid #e5e7eb; overflow: hidden; background: #f3f4f6; }
        .preview-container canvas { width: 100%; height: auto; display: block; }
        @media (max-width: 900px) { .ig-layout { grid-template-columns: 1fr; } .ig-preview { position: static; } }
      `}</style>
    </div>
  );
};

export default InstagramGenerator;
