import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Download, Image, Type, Sparkles, Check, Heart, MessageCircle, Calendar, Users, TrendingUp, UserPlus } from 'lucide-react';
import { HEALTH_TAGS } from '../data/mockData.ts';

type TemplateType = 'story-highlight' | 'call-for-submissions' | 'logo' | 'stat-card' | 'event-promo' | 'community-spotlight' | 'quote-carousel' | 'tip-of-day' | 'call-for-reviewers';
type BackgroundVariant = 'white' | 'coral' | 'black' | 'gradient' | 'teal';
type LogoSize = 'square' | 'horizontal' | 'story';

const SCALE = 3;
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
  bg: string; color: string; fontSize: number; paddingX: number; paddingY: number; border?: string;
}): number {
  ctx.font = `600 ${opts.fontSize}px ${FONT}`;
  const tw = ctx.measureText(text).width;
  const pw = tw + opts.paddingX * 2;
  const ph = opts.fontSize + opts.paddingY * 2;
  const r = ph / 2;
  roundRect(ctx, x, y, pw, ph, r);
  ctx.fillStyle = opts.bg;
  ctx.fill();
  if (opts.border) { ctx.strokeStyle = opts.border; ctx.lineWidth = 2; ctx.stroke(); }
  ctx.fillStyle = opts.color;
  ctx.fillText(text, x + opts.paddingX, y + opts.paddingY + opts.fontSize * 0.78);
  return pw;
}

function drawCenteredPills(ctx: CanvasRenderingContext2D, tags: string[], centerX: number, y: number, opts: {
  bg: string; color: string; fontSize: number; paddingX: number; paddingY: number; gap: number; border?: string;
}): number {
  ctx.font = `600 ${opts.fontSize}px ${FONT}`;
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

function drawGradientBackground(ctx: CanvasRenderingContext2D, w: number, h: number, variant: BackgroundVariant) {
  if (variant === 'gradient') {
    const gradient = ctx.createLinearGradient(0, 0, w, h);
    gradient.addColorStop(0, '#FF6B6B');
    gradient.addColorStop(1, '#FFA07A');
    ctx.fillStyle = gradient;
  } else if (variant === 'teal') {
    const gradient = ctx.createLinearGradient(0, 0, w, h);
    gradient.addColorStop(0, '#20B2AA');
    gradient.addColorStop(1, '#008B8B');
    ctx.fillStyle = gradient;
  } else if (variant === 'coral') {
    ctx.fillStyle = '#FF6B6B';
  } else if (variant === 'black') {
    ctx.fillStyle = '#1a1a1a';
  } else {
    ctx.fillStyle = '#FFFFFF';
  }
  ctx.fillRect(0, 0, w, h);
}

function drawBranding(ctx: CanvasRenderingContext2D, cx: number, y: number, isLight: boolean) {
  ctx.textAlign = 'center';
  ctx.font = `700 26px ${FONT}`;
  ctx.fillStyle = isLight ? '#1a1a1a' : '#FFFFFF';
  const text = 'Vital Signs';
  const tw = ctx.measureText(text).width;
  ctx.fillText(text, cx - 4, y);
  ctx.fillStyle = isLight ? '#FF6B6B' : '#FFFFFF';
  ctx.fillText('.', cx + tw / 2 - 2, y);
  ctx.textAlign = 'start';
}

// ═══════════════════════════════════════════════════════════════════════
// TEMPLATE RENDERERS
// ═══════════════════════════════════════════════════════════════════════

function renderStoryHighlight(ctx: CanvasRenderingContext2D, w: number, h: number, quote: string, author: string, isAnonymous: boolean, tags: string[]) {
  // Warm cream background
  ctx.fillStyle = '#FFF8F0';
  ctx.fillRect(0, 0, w, h);

  const cx = w / 2;

  // Top accent bar
  ctx.fillStyle = '#FF6B6B';
  roundRect(ctx, cx - 50, 50, 100, 6, 3);
  ctx.fill();

  // Main card with shadow
  const cardX = 60, cardY = 90, cardW = w - 120, cardH = h - 180;
  
  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.06)';
  roundRect(ctx, cardX + 6, cardY + 6, cardW, cardH, 20);
  ctx.fill();
  
  // Card
  ctx.fillStyle = '#FFFFFF';
  roundRect(ctx, cardX, cardY, cardW, cardH, 20);
  ctx.fill();

  // Tags
  if (tags.length > 0) {
    drawCenteredPills(ctx, tags.slice(0, 3), cx, cardY + 45, {
      bg: '#FFF0F0', color: '#FF6B6B', fontSize: 16, paddingX: 16, paddingY: 8, gap: 10
    });
  }

  // Large quote mark - more visible
  ctx.font = `700 180px Georgia, serif`;
  ctx.fillStyle = 'rgba(255,107,107,0.15)';
  ctx.textAlign = 'center';
  ctx.fillText('"', cx, cardY + 200);

  // Quote text
  const qLen = quote.length;
  const fontSize = qLen > 120 ? 28 : qLen > 80 ? 34 : 40;
  ctx.font = `500 ${fontSize}px ${FONT}`;
  ctx.fillStyle = '#1a1a1a';
  const lines = wrapText(ctx, quote, cardW - 80);
  const lineH = fontSize * 1.55;
  const blockH = lines.length * lineH;
  const startY = cardY + (cardH - blockH) / 2 + 30;

  lines.forEach((line, i) => {
    ctx.fillText(line, cx, startY + i * lineH);
  });

  // Author line
  ctx.fillStyle = '#FF6B6B';
  roundRect(ctx, cx - 30, startY + blockH + 25, 60, 3, 1.5);
  ctx.fill();

  ctx.font = `500 20px ${FONT}`;
  ctx.fillStyle = '#666666';
  ctx.fillText(isAnonymous ? 'Anonymous' : author, cx, startY + blockH + 60);

  // Branding
  drawBranding(ctx, cx, h - 55, true);
  ctx.textAlign = 'start';
}

function renderCallForSubmissions(ctx: CanvasRenderingContext2D, w: number, h: number, headline: string, subheadline: string, tags: string[], bg: BackgroundVariant) {
  const isLight = bg === 'white';
  drawGradientBackground(ctx, w, h, bg);

  const cx = w / 2;
  const textColor = isLight ? '#1a1a1a' : '#FFFFFF';
  const subColor = isLight ? '#666666' : 'rgba(255,255,255,0.85)';

  // Badge
  ctx.textAlign = 'center';
  drawPill(ctx, '✦ NOW OPEN ✦', cx - 75, 70, {
    bg: isLight ? '#FFF0F0' : 'rgba(255,255,255,0.2)',
    color: isLight ? '#FF6B6B' : '#FFFFFF',
    fontSize: 16, paddingX: 22, paddingY: 12
  });

  // Headline
  const hlSize = headline.length > 20 ? 52 : 64;
  ctx.font = `800 ${hlSize}px ${FONT}`;
  ctx.fillStyle = textColor;
  const hlLines = wrapText(ctx, headline.toUpperCase(), w - 120);
  let y = 200;
  hlLines.forEach(line => { ctx.fillText(line, cx, y); y += hlSize * 1.1; });

  // Subheadline
  ctx.font = `400 24px ${FONT}`;
  ctx.fillStyle = subColor;
  ctx.fillText(subheadline, cx, y + 20);

  // Tags
  if (tags.length > 0) {
    drawCenteredPills(ctx, tags.slice(0, 4), cx, y + 70, {
      bg: 'transparent', color: textColor, fontSize: 15, paddingX: 18, paddingY: 10, gap: 10,
      border: isLight ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.4)'
    });
  }

  // CTA Button
  const btnY = h - 160;
  const btnW = 260, btnH = 54;
  roundRect(ctx, cx - btnW/2, btnY, btnW, btnH, btnH/2);
  ctx.fillStyle = isLight ? '#1a1a1a' : '#FFFFFF';
  ctx.fill();
  ctx.font = `700 18px ${FONT}`;
  ctx.fillStyle = isLight ? '#FFFFFF' : '#1a1a1a';
  ctx.fillText('Submit Your Story →', cx, btnY + 35);

  // Branding
  drawBranding(ctx, cx, h - 55, isLight);
  ctx.textAlign = 'start';
}

function renderCallForReviewers(ctx: CanvasRenderingContext2D, w: number, h: number, headline: string, description: string, benefits: string[], bg: BackgroundVariant) {
  const isLight = bg === 'white';
  drawGradientBackground(ctx, w, h, bg);

  const cx = w / 2;
  const textColor = isLight ? '#1a1a1a' : '#FFFFFF';
  const subColor = isLight ? '#555555' : 'rgba(255,255,255,0.85)';
  const accent = isLight ? '#FF6B6B' : '#FFFFFF';

  // Badge
  ctx.textAlign = 'center';
  drawPill(ctx, '📋 JOIN OUR TEAM', cx - 85, 60, {
    bg: isLight ? '#FFF0F0' : 'rgba(255,255,255,0.2)',
    color: accent, fontSize: 16, paddingX: 22, paddingY: 12
  });

  // Headline
  const hlSize = headline.length > 25 ? 48 : 56;
  ctx.font = `800 ${hlSize}px ${FONT}`;
  ctx.fillStyle = textColor;
  const hlLines = wrapText(ctx, headline.toUpperCase(), w - 100);
  let y = 180;
  hlLines.forEach(line => { ctx.fillText(line, cx, y); y += hlSize * 1.1; });

  // Description
  ctx.font = `400 22px ${FONT}`;
  ctx.fillStyle = subColor;
  const descLines = wrapText(ctx, description, w - 140);
  descLines.forEach(line => { ctx.fillText(line, cx, y + 25); y += 30; });

  // Benefits with checkmarks - CENTERED
  y += 50;
  ctx.font = `500 20px ${FONT}`;
  
  benefits.slice(0, 4).forEach((benefit, i) => {
    const itemY = y + i * 48;
    
    // Calculate text width to center everything
    const textW = ctx.measureText(benefit).width;
    const totalW = 32 + textW; // circle + gap + text
    const startX = cx - totalW / 2;
    
    // Checkmark circle
    ctx.beginPath();
    ctx.arc(startX + 14, itemY, 14, 0, Math.PI * 2);
    ctx.fillStyle = accent;
    ctx.fill();
    
    // Checkmark
    ctx.font = `700 14px ${FONT}`;
    ctx.fillStyle = isLight ? '#FFFFFF' : '#1a1a1a';
    ctx.textAlign = 'center';
    ctx.fillText('✓', startX + 14, itemY + 5);
    
    // Benefit text
    ctx.font = `500 20px ${FONT}`;
    ctx.fillStyle = textColor;
    ctx.textAlign = 'left';
    ctx.fillText(benefit, startX + 38, itemY + 6);
  });

  ctx.textAlign = 'center';

  // CTA Button
  const btnY = h - 150;
  const btnW = 220, btnH = 52;
  roundRect(ctx, cx - btnW/2, btnY, btnW, btnH, btnH/2);
  ctx.fillStyle = accent;
  ctx.fill();
  ctx.font = `700 17px ${FONT}`;
  ctx.fillStyle = isLight ? '#FFFFFF' : '#1a1a1a';
  ctx.fillText('Apply Now →', cx, btnY + 33);

  // Branding
  drawBranding(ctx, cx, h - 50, isLight);
  ctx.textAlign = 'start';
}

function renderStatCard(ctx: CanvasRenderingContext2D, w: number, h: number, statNumber: string, statLabel: string, description: string, bg: BackgroundVariant) {
  const isLight = bg === 'white';
  drawGradientBackground(ctx, w, h, bg);

  const cx = w / 2;
  const textColor = isLight ? '#1a1a1a' : '#FFFFFF';
  const subColor = isLight ? '#666666' : 'rgba(255,255,255,0.8)';

  // Decorative circles
  if (!isLight) {
    ctx.globalAlpha = 0.08;
    ctx.beginPath(); ctx.arc(w * 0.15, h * 0.25, 180, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF'; ctx.fill();
    ctx.beginPath(); ctx.arc(w * 0.85, h * 0.75, 140, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // Big number
  ctx.textAlign = 'center';
  ctx.font = `900 180px ${FONT}`;
  ctx.fillStyle = textColor;
  ctx.fillText(statNumber, cx, h / 2 - 20);

  // Label
  ctx.font = `700 30px ${FONT}`;
  ctx.fillText(statLabel.toUpperCase(), cx, h / 2 + 50);

  // Accent line
  ctx.fillStyle = isLight ? '#FF6B6B' : 'rgba(255,255,255,0.5)';
  roundRect(ctx, cx - 40, h / 2 + 75, 80, 4, 2);
  ctx.fill();

  // Description
  ctx.font = `400 21px ${FONT}`;
  ctx.fillStyle = subColor;
  const lines = wrapText(ctx, description, w - 160);
  lines.slice(0, 2).forEach((line, i) => {
    ctx.fillText(line, cx, h / 2 + 125 + i * 30);
  });

  // Branding
  drawBranding(ctx, cx, h - 55, isLight);
  ctx.textAlign = 'start';
}

function renderEventPromo(ctx: CanvasRenderingContext2D, w: number, h: number, eventTitle: string, eventDate: string, eventDescription: string, bg: BackgroundVariant) {
  const isLight = bg === 'white';
  drawGradientBackground(ctx, w, h, bg);

  const cx = w / 2;
  const textColor = isLight ? '#1a1a1a' : '#FFFFFF';
  const subColor = isLight ? '#555555' : 'rgba(255,255,255,0.85)';
  const accent = isLight ? '#FF6B6B' : '#FFFFFF';

  // Calendar icon circle
  ctx.textAlign = 'center';
  ctx.beginPath();
  ctx.arc(cx, 120, 50, 0, Math.PI * 2);
  ctx.fillStyle = isLight ? '#FFF0F0' : 'rgba(255,255,255,0.15)';
  ctx.fill();
  ctx.font = `400 42px ${FONT}`;
  ctx.fillText('📅', cx, 135);

  // Label
  ctx.font = `700 14px ${FONT}`;
  ctx.fillStyle = accent;
  ctx.fillText('UPCOMING EVENT', cx, 200);

  // Title
  const titleSize = eventTitle.length > 20 ? 48 : 56;
  ctx.font = `800 ${titleSize}px ${FONT}`;
  ctx.fillStyle = textColor;
  const titleLines = wrapText(ctx, eventTitle, w - 120);
  let y = 280;
  titleLines.forEach(line => { ctx.fillText(line, cx, y); y += titleSize * 1.15; });

  // Date pill
  ctx.font = `700 20px ${FONT}`;
  const dateW = ctx.measureText(eventDate).width + 50;
  roundRect(ctx, cx - dateW/2, y + 10, dateW, 48, 24);
  ctx.fillStyle = accent;
  ctx.fill();
  ctx.fillStyle = isLight ? '#FFFFFF' : '#1a1a1a';
  ctx.fillText(eventDate, cx, y + 42);

  // Description
  ctx.font = `400 21px ${FONT}`;
  ctx.fillStyle = subColor;
  const descLines = wrapText(ctx, eventDescription, w - 140);
  descLines.slice(0, 2).forEach((line, i) => {
    ctx.fillText(line, cx, y + 100 + i * 30);
  });

  // Branding
  drawBranding(ctx, cx, h - 55, isLight);
  ctx.textAlign = 'start';
}

function renderCommunitySpotlight(ctx: CanvasRenderingContext2D, w: number, h: number, memberName: string, memberStory: string, memberTags: string[], bg: BackgroundVariant) {
  const isLight = bg === 'white';
  drawGradientBackground(ctx, w, h, bg);

  const cx = w / 2;
  const textColor = isLight ? '#1a1a1a' : '#FFFFFF';
  const subColor = isLight ? '#555555' : 'rgba(255,255,255,0.85)';
  const accent = isLight ? '#FF6B6B' : '#FFFFFF';

  // Header
  ctx.textAlign = 'center';
  ctx.font = `700 14px ${FONT}`;
  ctx.fillStyle = accent;
  ctx.fillText('★  COMMUNITY SPOTLIGHT  ★', cx, 80);

  // Avatar with border
  const avatarY = 175;
  ctx.beginPath();
  ctx.arc(cx, avatarY, 68, 0, Math.PI * 2);
  ctx.fillStyle = accent;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, avatarY, 62, 0, Math.PI * 2);
  ctx.fillStyle = isLight ? '#FFF8F0' : 'rgba(255,255,255,0.15)';
  ctx.fill();

  // Initials
  const initials = memberName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  ctx.font = `700 42px ${FONT}`;
  ctx.fillStyle = accent;
  ctx.fillText(initials, cx, avatarY + 15);

  // Name
  ctx.font = `700 38px ${FONT}`;
  ctx.fillStyle = textColor;
  ctx.fillText(memberName, cx, avatarY + 95);

  // Tags
  if (memberTags.length > 0) {
    drawCenteredPills(ctx, memberTags.slice(0, 3), cx, avatarY + 125, {
      bg: isLight ? '#FFF0F0' : 'rgba(255,255,255,0.15)',
      color: accent, fontSize: 14, paddingX: 14, paddingY: 7, gap: 8
    });
  }

  // Quote marks
  ctx.font = `700 100px Georgia, serif`;
  ctx.fillStyle = isLight ? 'rgba(255,107,107,0.2)' : 'rgba(255,255,255,0.15)';
  ctx.fillText('"', cx - 250, avatarY + 250);

  // Story
  ctx.font = `500 24px ${FONT}`;
  ctx.fillStyle = subColor;
  const storyLines = wrapText(ctx, memberStory, w - 140);
  storyLines.slice(0, 3).forEach((line, i) => {
    ctx.fillText(line, cx, avatarY + 230 + i * 36);
  });

  // Branding
  drawBranding(ctx, cx, h - 55, isLight);
  ctx.textAlign = 'start';
}

function renderQuoteCarousel(ctx: CanvasRenderingContext2D, w: number, h: number, quote: string, slideNumber: string, totalSlides: string, bg: BackgroundVariant) {
  const isLight = bg === 'white';
  drawGradientBackground(ctx, w, h, bg);

  const cx = w / 2;
  const textColor = isLight ? '#1a1a1a' : '#FFFFFF';
  const subColor = isLight ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.5)';
  const accent = isLight ? '#FF6B6B' : '#FFFFFF';

  // Slide indicator
  ctx.textAlign = 'center';
  ctx.font = `500 16px ${FONT}`;
  ctx.fillStyle = subColor;
  ctx.fillText(`${slideNumber} of ${totalSlides}`, cx, 70);

  // Large quote marks
  ctx.font = `700 300px Georgia, serif`;
  ctx.fillStyle = isLight ? 'rgba(255,107,107,0.1)' : 'rgba(255,255,255,0.1)';
  ctx.fillText('"', cx, 350);

  // Quote
  const qLen = quote.length;
  const fontSize = qLen > 100 ? 32 : qLen > 60 ? 40 : 48;
  ctx.font = `600 ${fontSize}px ${FONT}`;
  ctx.fillStyle = textColor;
  const lines = wrapText(ctx, quote, w - 120);
  const lineH = fontSize * 1.5;
  const blockH = lines.length * lineH;
  const startY = (h - blockH) / 2 + 30;
  lines.forEach((line, i) => {
    ctx.fillText(line, cx, startY + i * lineH);
  });

  // Carousel dots
  const dotsY = h - 120;
  const total = parseInt(totalSlides) || 5;
  const current = parseInt(slideNumber) || 1;
  const spacing = 28;
  let dotX = cx - ((total - 1) * spacing) / 2;
  for (let i = 1; i <= total; i++) {
    ctx.beginPath();
    ctx.arc(dotX, dotsY, i === current ? 7 : 5, 0, Math.PI * 2);
    ctx.fillStyle = i === current ? accent : subColor;
    ctx.fill();
    dotX += spacing;
  }

  // Branding
  drawBranding(ctx, cx, h - 55, isLight);
  ctx.textAlign = 'start';
}

function renderTipOfDay(ctx: CanvasRenderingContext2D, w: number, h: number, tipTitle: string, tipContent: string, tipNumber: string, bg: BackgroundVariant) {
  const isLight = bg === 'white';
  drawGradientBackground(ctx, w, h, bg);

  const cx = w / 2;
  const textColor = isLight ? '#1a1a1a' : '#FFFFFF';
  const subColor = isLight ? '#555555' : 'rgba(255,255,255,0.85)';
  const accent = isLight ? '#FF6B6B' : '#FFFFFF';

  // Icon circle
  ctx.textAlign = 'center';
  ctx.beginPath();
  ctx.arc(cx, 110, 45, 0, Math.PI * 2);
  ctx.fillStyle = isLight ? '#FFF0F0' : 'rgba(255,255,255,0.15)';
  ctx.fill();
  ctx.font = `400 38px ${FONT}`;
  ctx.fillText('💡', cx, 125);

  // Tip number badge
  ctx.font = `700 14px ${FONT}`;
  ctx.fillStyle = accent;
  ctx.fillText(`TIP #${tipNumber}`, cx, 190);

  // Title
  const titleSize = tipTitle.length > 20 ? 44 : 52;
  ctx.font = `800 ${titleSize}px ${FONT}`;
  ctx.fillStyle = textColor;
  const titleLines = wrapText(ctx, tipTitle, w - 120);
  let y = 280;
  titleLines.forEach(line => { ctx.fillText(line, cx, y); y += titleSize * 1.15; });

  // Accent line
  ctx.fillStyle = accent;
  roundRect(ctx, cx - 40, y + 10, 80, 4, 2);
  ctx.fill();

  // Content
  ctx.font = `400 23px ${FONT}`;
  ctx.fillStyle = subColor;
  const contentLines = wrapText(ctx, tipContent, w - 140);
  contentLines.slice(0, 4).forEach((line, i) => {
    ctx.fillText(line, cx, y + 60 + i * 34);
  });

  // Branding
  drawBranding(ctx, cx, h - 55, isLight);
  ctx.textAlign = 'start';
}

function renderLogo(ctx: CanvasRenderingContext2D, w: number, h: number, logoVariant: BackgroundVariant) {
  const isWhite = logoVariant === 'white';
  const isCoral = logoVariant === 'coral';

  ctx.fillStyle = isWhite ? '#FFFFFF' : isCoral ? '#FF6B6B' : '#1a1a1a';
  ctx.fillRect(0, 0, w, h);

  const cx = w / 2, cy = h / 2;
  const textColor = isWhite ? '#1a1a1a' : '#FFFFFF';
  const dotColor = isCoral ? '#FFFFFF' : '#FF6B6B';
  const subColor = isWhite ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.6)';

  const mainSize = Math.min(w, h) > 1200 ? 88 : Math.min(w, h) > 600 ? 68 : 60;
  ctx.font = `700 ${mainSize}px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.fillStyle = textColor;
  const text = 'Vital Signs';
  const tw = ctx.measureText(text).width;
  ctx.fillText(text, cx - 4, cy);
  ctx.fillStyle = dotColor;
  ctx.fillText('.', cx + tw / 2 - 2, cy);

  ctx.font = `400 ${mainSize * 0.24}px ${FONT}`;
  ctx.fillStyle = subColor;
  ctx.fillText('Real stories. Real health. Real people.', cx, cy + mainSize * 0.55);
  ctx.textAlign = 'start';
}

// ═══════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════

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

  const drawPreview = useCallback(() => {
    const canvas = previewRef.current;
    if (!canvas) return;
    let w: number, h: number;
    if (template === 'logo') { const s = logoSizes[logoSize]; w = s.width; h = s.height; }
    else { w = 1080; h = 1080; }
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d')!;

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
  }, [template, quote, author, isAnonymous, selectedTags, bgVariant, headline, subheadline, logoSize, logoVariant,
      statNumber, statLabel, statDescription, eventTitle, eventDate, eventDescription, memberName, memberStory,
      slideNumber, totalSlides, carouselQuote, tipTitle, tipContent, tipNumber, reviewerHeadline, reviewerDescription, reviewerBenefits]); // eslint-disable-line

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
        <div className="container">
          <h1>Instagram Post Generator</h1>
          <p>Create on-brand posts for Vital Signs — exports at 3x resolution</p>
        </div>
      </div>
      <div className="ig-content">
        <div className="container">
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
                <div className="control-section">
                  <label className="control-label">Quote</label>
                  <textarea className="control-textarea" value={quote} onChange={e => setQuote(e.target.value)} maxLength={180} rows={3} />
                  <span className="char-count">{quote.length}/180</span>
                </div>
                <div className="control-section">
                  <label className="control-label">Author</label>
                  <div className="author-row">
                    <input type="text" className="control-input" value={author} onChange={e => setAuthor(e.target.value)} disabled={isAnonymous} />
                    <label className="checkbox-label"><input type="checkbox" checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)} /> Anonymous</label>
                  </div>
                </div>
                <div className="control-section">
                  <label className="control-label">Tags (max 3)</label>
                  <div className="tag-selector">
                    {HEALTH_TAGS.slice(0, 9).map(tag => (
                      <button key={tag.id} className={`tag-btn ${selectedTags.includes(tag.name) ? 'active' : ''}`}
                        onClick={() => toggleTag(tag.name)} disabled={selectedTags.length >= 3 && !selectedTags.includes(tag.name)}>
                        {selectedTags.includes(tag.name) && <Check size={12} />}{tag.name}
                      </button>
                    ))}
                  </div>
                </div>
              </>)}

              {template === 'call-for-submissions' && (<>
                <div className="control-section"><label className="control-label">Headline</label><input type="text" className="control-input" value={headline} onChange={e => setHeadline(e.target.value)} /></div>
                <div className="control-section"><label className="control-label">Subheadline</label><input type="text" className="control-input" value={subheadline} onChange={e => setSubheadline(e.target.value)} /></div>
                <div className="control-section">
                  <label className="control-label">Topics</label>
                  <div className="tag-selector">
                    {HEALTH_TAGS.slice(0, 9).map(tag => (
                      <button key={tag.id} className={`tag-btn ${selectedTags.includes(tag.name) ? 'active' : ''}`} onClick={() => toggleTag(tag.name)}>
                        {selectedTags.includes(tag.name) && <Check size={12} />}{tag.name}
                      </button>
                    ))}
                  </div>
                </div>
                <BgSelector />
              </>)}

              {template === 'call-for-reviewers' && (<>
                <div className="control-section"><label className="control-label">Headline</label><input type="text" className="control-input" value={reviewerHeadline} onChange={e => setReviewerHeadline(e.target.value)} /></div>
                <div className="control-section"><label className="control-label">Description</label><textarea className="control-textarea" value={reviewerDescription} onChange={e => setReviewerDescription(e.target.value)} rows={2} /></div>
                <div className="control-section">
                  <label className="control-label">Benefits (4)</label>
                  {reviewerBenefits.map((b, i) => <input key={i} type="text" className="control-input benefit-input" value={b} onChange={e => updateBenefit(i, e.target.value)} />)}
                </div>
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
                <div className="control-section">
                  <label className="control-label">Topics</label>
                  <div className="tag-selector">
                    {HEALTH_TAGS.slice(0, 9).map(tag => (
                      <button key={tag.id} className={`tag-btn ${selectedTags.includes(tag.name) ? 'active' : ''}`}
                        onClick={() => toggleTag(tag.name)} disabled={selectedTags.length >= 3 && !selectedTags.includes(tag.name)}>
                        {selectedTags.includes(tag.name) && <Check size={12} />}{tag.name}
                      </button>
                    ))}
                  </div>
                </div>
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
                <div className="control-section">
                  <label className="control-label">Size</label>
                  <div className="variant-buttons">
                    {(['square', 'horizontal', 'story'] as LogoSize[]).map(s => (
                      <button key={s} className={`variant-btn ${logoSize === s ? 'active' : ''}`} onClick={() => setLogoSize(s)}>{s.charAt(0).toUpperCase() + s.slice(1)}</button>
                    ))}
                  </div>
                </div>
                <div className="control-section">
                  <label className="control-label">Variant</label>
                  <div className="variant-buttons">
                    {(['white', 'black', 'coral'] as BackgroundVariant[]).map(v => (
                      <button key={v} className={`variant-btn variant-${v} ${logoVariant === v ? 'active' : ''}`} onClick={() => setLogoVariant(v)}>{v === 'white' ? 'Light' : v === 'black' ? 'Dark' : 'Coral'}</button>
                    ))}
                  </div>
                </div>
              </>)}

              <motion.button className="download-btn" onClick={handleDownload} disabled={downloading} whileTap={{ scale: 0.98 }}>
                <Download size={20} />{downloading ? 'Generating...' : 'Download PNG (3x)'}
              </motion.button>
            </div>

            <div className="ig-preview">
              <div className="preview-label">Live Preview</div>
              <div className="preview-container"><canvas ref={previewRef} style={{ width: '100%', height: 'auto', borderRadius: '12px' }} /></div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .ig-generator { min-height: 100vh; background: var(--vs-bg-subtle, #f8f9fa); }
        .ig-header { background: var(--vs-white, #fff); padding: 1.5rem 0; border-bottom: 1px solid var(--vs-border, #e5e7eb); }
        .ig-header h1 { font-size: 1.375rem; margin-bottom: 0.25rem; }
        .ig-header p { color: var(--vs-text-secondary, #6b7280); font-size: 0.875rem; }
        .ig-content { padding: 1.5rem 0; }
        .ig-layout { display: grid; grid-template-columns: 340px 1fr; gap: 1.5rem; align-items: start; }
        .ig-controls { background: var(--vs-white, #fff); border: 1px solid var(--vs-border, #e5e7eb); border-radius: 14px; padding: 1.25rem; max-height: 78vh; overflow-y: auto; }
        .control-section { margin-bottom: 1.25rem; }
        .control-label { display: block; font-size: 0.6875rem; font-weight: 700; color: var(--vs-text-tertiary, #9ca3af); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 0.6rem; }
        .template-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.4rem; }
        .template-btn { display: flex; flex-direction: column; align-items: center; gap: 0.3rem; padding: 0.6rem 0.4rem; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 0.625rem; font-weight: 600; color: #6b7280; cursor: pointer; transition: all 0.15s; }
        .template-btn:hover { border-color: #d1d5db; background: #fafafa; }
        .template-btn.active { background: #1a1a1a; color: #fff; border-color: #1a1a1a; }
        .control-input, .control-textarea { width: 100%; padding: 0.65rem; font-family: inherit; font-size: 0.875rem; border: 1px solid #e5e7eb; border-radius: 8px; resize: vertical; box-sizing: border-box; }
        .control-input:focus, .control-textarea:focus { outline: none; border-color: #9ca3af; }
        .control-input.small { width: 65px; text-align: center; }
        .benefit-input { margin-bottom: 0.4rem; }
        .char-count { display: block; font-size: 0.625rem; color: #9ca3af; text-align: right; margin-top: 0.2rem; }
        .author-row, .slide-row { display: flex; gap: 0.6rem; align-items: center; }
        .author-row .control-input { flex: 1; }
        .slide-row span { color: #9ca3af; font-size: 0.8rem; }
        .checkbox-label { display: flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; color: #6b7280; cursor: pointer; white-space: nowrap; }
        .checkbox-label input { accent-color: #ff6b6b; }
        .tag-selector { display: flex; flex-wrap: wrap; gap: 0.4rem; }
        .tag-btn { display: inline-flex; align-items: center; gap: 3px; padding: 0.3rem 0.6rem; font-size: 0.6875rem; font-weight: 600; color: #6b7280; background: #fff; border: 1px solid #e5e7eb; border-radius: 9999px; cursor: pointer; transition: all 0.15s; }
        .tag-btn:hover:not(:disabled) { border-color: #d1d5db; }
        .tag-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .tag-btn.active { background: #ff6b6b; color: #fff; border-color: #ff6b6b; }
        .variant-buttons { display: flex; gap: 0.4rem; flex-wrap: wrap; }
        .variant-btn { flex: 1; min-width: 55px; padding: 0.45rem 0.6rem; font-size: 0.6875rem; font-weight: 600; border: 1.5px solid #e5e7eb; border-radius: 8px; cursor: pointer; transition: all 0.15s; background: #fff; color: #1a1a1a; }
        .variant-btn.variant-coral { background: #ff6b6b; color: #fff; border-color: #ff6b6b; }
        .variant-btn.variant-black { background: #1a1a1a; color: #fff; border-color: #1a1a1a; }
        .variant-btn.variant-gradient { background: linear-gradient(135deg, #ff6b6b, #ffa07a); color: #fff; border-color: #ff6b6b; }
        .variant-btn.variant-teal { background: linear-gradient(135deg, #20b2aa, #008b8b); color: #fff; border-color: #20b2aa; }
        .variant-btn.active { box-shadow: 0 0 0 2px #ff6b6b; }
        .download-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.9rem; background: #ff6b6b; color: #fff; border: none; border-radius: 10px; font-size: 0.9375rem; font-weight: 700; cursor: pointer; transition: all 0.15s; }
        .download-btn:hover:not(:disabled) { filter: brightness(1.05); }
        .download-btn:disabled { opacity: 0.7; cursor: wait; }
        .ig-preview { background: #fff; border: 1px solid #e5e7eb; border-radius: 14px; padding: 1.25rem; position: sticky; top: 1rem; }
        .preview-label { font-size: 0.6875rem; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 0.75rem; }
        .preview-container { border-radius: 10px; border: 1px solid #e5e7eb; overflow: hidden; background: #f8f9fa; }
        @media (max-width: 1024px) { .ig-layout { grid-template-columns: 1fr; } .ig-preview { position: static; } }
      `}</style>
    </div>
  );
};

export default InstagramGenerator;
