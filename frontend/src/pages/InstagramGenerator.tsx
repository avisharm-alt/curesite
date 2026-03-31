import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Download, Image, Type, Sparkles, Check, Heart, MessageCircle, Calendar, Users, TrendingUp } from 'lucide-react';
import { HEALTH_TAGS } from '../data/mockData.ts';

type TemplateType = 'story-highlight' | 'call-for-submissions' | 'logo' | 'stat-card' | 'event-promo' | 'community-spotlight' | 'quote-carousel' | 'tip-of-day';
type BackgroundVariant = 'white' | 'coral' | 'black' | 'gradient';
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

function drawGradientBackground(ctx: CanvasRenderingContext2D, w: number, h: number, variant: BackgroundVariant) {
  if (variant === 'gradient') {
    const gradient = ctx.createLinearGradient(0, 0, w, h);
    gradient.addColorStop(0, '#FF5A5F');
    gradient.addColorStop(0.5, '#FF8A6B');
    gradient.addColorStop(1, '#FFB088');
    ctx.fillStyle = gradient;
  } else if (variant === 'coral') {
    ctx.fillStyle = '#FF5A5F';
  } else if (variant === 'black') {
    ctx.fillStyle = '#111111';
  } else {
    ctx.fillStyle = '#FFFFFF';
  }
  ctx.fillRect(0, 0, w, h);
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
  const isGradient = bgVariant === 'gradient';

  // Background
  drawGradientBackground(ctx, w, h, bgVariant);

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
  ctx.fillStyle = (isCoral || isGradient) ? '#FFFFFF' : '#FF5A5F';
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

function renderStatCard(
  ctx: CanvasRenderingContext2D, w: number, h: number,
  statNumber: string, statLabel: string, description: string, bgVariant: BackgroundVariant
) {
  const isWhite = bgVariant === 'white';
  const isCoral = bgVariant === 'coral';
  const isGradient = bgVariant === 'gradient';

  drawGradientBackground(ctx, w, h, bgVariant);

  const cx = w / 2;
  const textColor = isWhite ? '#111111' : '#FFFFFF';
  const subtleColor = isWhite ? 'rgba(17,17,17,0.55)' : 'rgba(255,255,255,0.7)';

  // Big stat number
  ctx.textAlign = 'center';
  ctx.font = `800 180px ${FONT}`;
  ctx.fillStyle = textColor;
  ctx.fillText(statNumber, cx, h / 2 - 40);

  // Stat label
  ctx.font = `600 36px ${FONT}`;
  ctx.fillStyle = textColor;
  ctx.fillText(statLabel.toUpperCase(), cx, h / 2 + 40);

  // Description
  ctx.font = `400 24px ${FONT}`;
  ctx.fillStyle = subtleColor;
  const descLines = wrapText(ctx, description, w - 200);
  for (let i = 0; i < descLines.length; i++) {
    ctx.fillText(descLines[i], cx, h / 2 + 100 + i * 36);
  }

  // Branding at bottom
  ctx.font = `600 24px ${FONT}`;
  ctx.fillStyle = textColor;
  const brandText = 'Vital Signs';
  const brandW = ctx.measureText(brandText).width;
  ctx.fillText(brandText, cx - 6, h - 70);
  ctx.fillStyle = (isCoral || isGradient) ? '#FFFFFF' : '#FF5A5F';
  ctx.fillText('.', cx + brandW / 2 - 2, h - 70);

  ctx.textAlign = 'start';
}

function renderEventPromo(
  ctx: CanvasRenderingContext2D, w: number, h: number,
  eventTitle: string, eventDate: string, eventDescription: string, bgVariant: BackgroundVariant
) {
  const isWhite = bgVariant === 'white';
  const isCoral = bgVariant === 'coral';
  const isGradient = bgVariant === 'gradient';

  drawGradientBackground(ctx, w, h, bgVariant);

  const cx = w / 2;
  const textColor = isWhite ? '#111111' : '#FFFFFF';
  const subtleColor = isWhite ? 'rgba(17,17,17,0.55)' : 'rgba(255,255,255,0.7)';
  const accentColor = (isCoral || isGradient) ? '#FFFFFF' : '#FF5A5F';

  // "UPCOMING EVENT" badge
  ctx.textAlign = 'center';
  const badgeY = 140;
  drawPill(ctx, 'UPCOMING EVENT', cx - 90, badgeY, {
    bg: isWhite ? 'rgba(255,90,95,0.1)' : 'rgba(255,255,255,0.2)',
    color: accentColor,
    fontSize: 16,
    paddingX: 24,
    paddingY: 12,
  });

  // Event title
  ctx.font = `700 64px ${FONT}`;
  ctx.fillStyle = textColor;
  const titleLines = wrapText(ctx, eventTitle, w - 160);
  let titleY = 280;
  for (const line of titleLines) {
    ctx.fillText(line, cx, titleY);
    titleY += 78;
  }

  // Date with calendar icon hint
  ctx.font = `600 28px ${FONT}`;
  ctx.fillStyle = accentColor;
  ctx.fillText(`📅  ${eventDate}`, cx, titleY + 20);

  // Description
  ctx.font = `400 24px ${FONT}`;
  ctx.fillStyle = subtleColor;
  const descLines = wrapText(ctx, eventDescription, w - 200);
  for (let i = 0; i < descLines.length; i++) {
    ctx.fillText(descLines[i], cx, titleY + 80 + i * 36);
  }

  // Branding
  ctx.font = `600 24px ${FONT}`;
  ctx.fillStyle = textColor;
  const brandText = 'Vital Signs';
  const brandW = ctx.measureText(brandText).width;
  ctx.fillText(brandText, cx - 6, h - 70);
  ctx.fillStyle = accentColor;
  ctx.fillText('.', cx + brandW / 2 - 2, h - 70);

  ctx.textAlign = 'start';
}

function renderCommunitySpotlight(
  ctx: CanvasRenderingContext2D, w: number, h: number,
  memberName: string, memberStory: string, memberTags: string[], bgVariant: BackgroundVariant
) {
  const isWhite = bgVariant === 'white';
  const isCoral = bgVariant === 'coral';
  const isGradient = bgVariant === 'gradient';

  drawGradientBackground(ctx, w, h, bgVariant);

  const cx = w / 2;
  const textColor = isWhite ? '#111111' : '#FFFFFF';
  const subtleColor = isWhite ? 'rgba(17,17,17,0.55)' : 'rgba(255,255,255,0.7)';
  const accentColor = (isCoral || isGradient) ? '#FFFFFF' : '#FF5A5F';

  // "COMMUNITY SPOTLIGHT" header
  ctx.textAlign = 'center';
  ctx.font = `600 18px ${FONT}`;
  ctx.fillStyle = accentColor;
  ctx.fillText('✨ COMMUNITY SPOTLIGHT ✨', cx, 100);

  // Avatar circle placeholder
  const avatarY = 180;
  ctx.beginPath();
  ctx.arc(cx, avatarY, 60, 0, Math.PI * 2);
  ctx.fillStyle = isWhite ? 'rgba(255,90,95,0.15)' : 'rgba(255,255,255,0.2)';
  ctx.fill();

  // Initials in avatar
  ctx.font = `700 36px ${FONT}`;
  ctx.fillStyle = accentColor;
  const initials = memberName.split(' ').map(n => n[0]).join('').slice(0, 2);
  ctx.fillText(initials, cx, avatarY + 12);

  // Member name
  ctx.font = `700 42px ${FONT}`;
  ctx.fillStyle = textColor;
  ctx.fillText(memberName, cx, avatarY + 110);

  // Tags
  if (memberTags.length > 0) {
    drawCenteredPills(ctx, memberTags.slice(0, 3), cx, avatarY + 140, {
      bg: isWhite ? 'rgba(255,90,95,0.08)' : 'rgba(255,255,255,0.15)',
      color: accentColor,
      fontSize: 16,
      paddingX: 16,
      paddingY: 8,
      gap: 8,
    });
  }

  // Story excerpt
  ctx.font = `400 26px ${FONT}`;
  ctx.fillStyle = subtleColor;
  const storyLines = wrapText(ctx, `"${memberStory}"`, w - 180);
  const storyStartY = avatarY + 220;
  for (let i = 0; i < Math.min(storyLines.length, 4); i++) {
    ctx.fillText(storyLines[i], cx, storyStartY + i * 38);
  }

  // Branding
  ctx.font = `600 24px ${FONT}`;
  ctx.fillStyle = textColor;
  const brandText = 'Vital Signs';
  const brandW = ctx.measureText(brandText).width;
  ctx.fillText(brandText, cx - 6, h - 70);
  ctx.fillStyle = accentColor;
  ctx.fillText('.', cx + brandW / 2 - 2, h - 70);

  ctx.textAlign = 'start';
}

function renderQuoteCarousel(
  ctx: CanvasRenderingContext2D, w: number, h: number,
  quote: string, slideNumber: string, totalSlides: string, bgVariant: BackgroundVariant
) {
  const isWhite = bgVariant === 'white';
  const isCoral = bgVariant === 'coral';
  const isGradient = bgVariant === 'gradient';

  drawGradientBackground(ctx, w, h, bgVariant);

  const cx = w / 2;
  const textColor = isWhite ? '#111111' : '#FFFFFF';
  const subtleColor = isWhite ? 'rgba(17,17,17,0.4)' : 'rgba(255,255,255,0.6)';
  const accentColor = (isCoral || isGradient) ? '#FFFFFF' : '#FF5A5F';

  // Slide indicator
  ctx.textAlign = 'center';
  ctx.font = `500 18px ${FONT}`;
  ctx.fillStyle = subtleColor;
  ctx.fillText(`${slideNumber} / ${totalSlides}`, cx, 100);

  // Large quotation mark
  ctx.font = `700 200px Georgia, serif`;
  ctx.fillStyle = isWhite ? 'rgba(255,90,95,0.1)' : 'rgba(255,255,255,0.15)';
  ctx.fillText('\u201C', cx, 280);

  // Quote text - centered vertically
  const quoteFontSize = quote.length > 100 ? 36 : 48;
  ctx.font = `600 ${quoteFontSize}px ${FONT}`;
  ctx.fillStyle = textColor;
  const quoteLines = wrapText(ctx, quote, w - 160);
  const lineH = quoteFontSize * 1.4;
  const totalH = quoteLines.length * lineH;
  const startY = (h - totalH) / 2 + 40;

  for (let i = 0; i < quoteLines.length; i++) {
    ctx.fillText(quoteLines[i], cx, startY + i * lineH);
  }

  // Carousel dots
  const dotsY = h - 120;
  const totalDotsWidth = parseInt(totalSlides) * 16 + (parseInt(totalSlides) - 1) * 12;
  let dotX = cx - totalDotsWidth / 2;
  for (let i = 1; i <= parseInt(totalSlides); i++) {
    ctx.beginPath();
    ctx.arc(dotX, dotsY, i === parseInt(slideNumber) ? 8 : 5, 0, Math.PI * 2);
    ctx.fillStyle = i === parseInt(slideNumber) ? accentColor : subtleColor;
    ctx.fill();
    dotX += 28;
  }

  // Branding
  ctx.font = `600 24px ${FONT}`;
  ctx.fillStyle = textColor;
  const brandText = 'Vital Signs';
  const brandW = ctx.measureText(brandText).width;
  ctx.fillText(brandText, cx - 6, h - 60);
  ctx.fillStyle = accentColor;
  ctx.fillText('.', cx + brandW / 2 - 2, h - 60);

  ctx.textAlign = 'start';
}

function renderTipOfDay(
  ctx: CanvasRenderingContext2D, w: number, h: number,
  tipTitle: string, tipContent: string, tipNumber: string, bgVariant: BackgroundVariant
) {
  const isWhite = bgVariant === 'white';
  const isCoral = bgVariant === 'coral';
  const isGradient = bgVariant === 'gradient';

  drawGradientBackground(ctx, w, h, bgVariant);

  const cx = w / 2;
  const textColor = isWhite ? '#111111' : '#FFFFFF';
  const subtleColor = isWhite ? 'rgba(17,17,17,0.55)' : 'rgba(255,255,255,0.7)';
  const accentColor = (isCoral || isGradient) ? '#FFFFFF' : '#FF5A5F';

  // "TIP OF THE DAY" badge with number
  ctx.textAlign = 'center';
  const badgeY = 120;
  drawPill(ctx, `💡 TIP #${tipNumber}`, cx - 70, badgeY, {
    bg: isWhite ? 'rgba(255,90,95,0.1)' : 'rgba(255,255,255,0.2)',
    color: accentColor,
    fontSize: 18,
    paddingX: 28,
    paddingY: 14,
  });

  // Tip title
  ctx.font = `700 52px ${FONT}`;
  ctx.fillStyle = textColor;
  const titleLines = wrapText(ctx, tipTitle, w - 160);
  let titleY = 260;
  for (const line of titleLines) {
    ctx.fillText(line, cx, titleY);
    titleY += 64;
  }

  // Tip content
  ctx.font = `400 28px ${FONT}`;
  ctx.fillStyle = subtleColor;
  const contentLines = wrapText(ctx, tipContent, w - 180);
  const contentStartY = titleY + 30;
  for (let i = 0; i < Math.min(contentLines.length, 5); i++) {
    ctx.fillText(contentLines[i], cx, contentStartY + i * 42);
  }

  // Branding
  ctx.font = `600 24px ${FONT}`;
  ctx.fillStyle = textColor;
  const brandText = 'Vital Signs';
  const brandW = ctx.measureText(brandText).width;
  ctx.fillText(brandText, cx - 6, h - 70);
  ctx.fillStyle = accentColor;
  ctx.fillText('.', cx + brandW / 2 - 2, h - 70);

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

  // New state for additional templates
  const [statNumber, setStatNumber] = useState('127');
  const [statLabel, setStatLabel] = useState('Stories Shared');
  const [statDescription, setStatDescription] = useState('Real people sharing their health journeys to help others feel less alone.');

  const [eventTitle, setEventTitle] = useState('Virtual Story Circle');
  const [eventDate, setEventDate] = useState('March 15, 2026 • 7PM EST');
  const [eventDescription, setEventDescription] = useState('Join us for an evening of sharing, listening, and connection. All experiences welcome.');

  const [memberName, setMemberName] = useState('Jordan K.');
  const [memberStory, setMemberStory] = useState('Sharing my story here helped me realize I was never alone in my journey. This community changed my life.');

  const [slideNumber, setSlideNumber] = useState('1');
  const [totalSlides, setTotalSlides] = useState('5');
  const [carouselQuote, setCarouselQuote] = useState('Every story shared here makes someone else feel less alone in their journey.');

  const [tipTitle, setTipTitle] = useState('Start Where You Are');
  const [tipContent, setTipContent] = useState('You don\'t need to have your whole story figured out. Share what feels true today, and know that healing is not linear.');
  const [tipNumber, setTipNumber] = useState('42');

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

    switch (template) {
      case 'story-highlight':
        renderStoryHighlight(ctx, w, h, quote, author, isAnonymous, selectedTags);
        break;
      case 'call-for-submissions':
        renderCallForSubmissions(ctx, w, h, headline, subheadline, selectedTags, bgVariant);
        break;
      case 'logo':
        renderLogo(ctx, w, h, logoVariant);
        break;
      case 'stat-card':
        renderStatCard(ctx, w, h, statNumber, statLabel, statDescription, bgVariant);
        break;
      case 'event-promo':
        renderEventPromo(ctx, w, h, eventTitle, eventDate, eventDescription, bgVariant);
        break;
      case 'community-spotlight':
        renderCommunitySpotlight(ctx, w, h, memberName, memberStory, selectedTags, bgVariant);
        break;
      case 'quote-carousel':
        renderQuoteCarousel(ctx, w, h, carouselQuote, slideNumber, totalSlides, bgVariant);
        break;
      case 'tip-of-day':
        renderTipOfDay(ctx, w, h, tipTitle, tipContent, tipNumber, bgVariant);
        break;
    }
  }, [template, quote, author, isAnonymous, selectedTags, bgVariant, headline, subheadline, logoSize, logoVariant,
      statNumber, statLabel, statDescription, eventTitle, eventDate, eventDescription, memberName, memberStory,
      slideNumber, totalSlides, carouselQuote, tipTitle, tipContent, tipNumber]); // eslint-disable-line

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

      switch (template) {
        case 'story-highlight':
          renderStoryHighlight(ctx, w, h, quote, author, isAnonymous, selectedTags);
          break;
        case 'call-for-submissions':
          renderCallForSubmissions(ctx, w, h, headline, subheadline, selectedTags, bgVariant);
          break;
        case 'logo':
          renderLogo(ctx, w, h, logoVariant);
          break;
        case 'stat-card':
          renderStatCard(ctx, w, h, statNumber, statLabel, statDescription, bgVariant);
          break;
        case 'event-promo':
          renderEventPromo(ctx, w, h, eventTitle, eventDate, eventDescription, bgVariant);
          break;
        case 'community-spotlight':
          renderCommunitySpotlight(ctx, w, h, memberName, memberStory, selectedTags, bgVariant);
          break;
        case 'quote-carousel':
          renderQuoteCarousel(ctx, w, h, carouselQuote, slideNumber, totalSlides, bgVariant);
          break;
        case 'tip-of-day':
          renderTipOfDay(ctx, w, h, tipTitle, tipContent, tipNumber, bgVariant);
          break;
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

  const templates: { id: TemplateType; label: string; icon: React.ReactNode }[] = [
    { id: 'story-highlight', label: 'Story Highlight', icon: <Type size={18} /> },
    { id: 'call-for-submissions', label: 'Call for Submissions', icon: <Sparkles size={18} /> },
    { id: 'stat-card', label: 'Stats Card', icon: <TrendingUp size={18} /> },
    { id: 'event-promo', label: 'Event Promo', icon: <Calendar size={18} /> },
    { id: 'community-spotlight', label: 'Community Spotlight', icon: <Users size={18} /> },
    { id: 'quote-carousel', label: 'Quote Carousel', icon: <MessageCircle size={18} /> },
    { id: 'tip-of-day', label: 'Tip of the Day', icon: <Heart size={18} /> },
    { id: 'logo', label: 'Logo', icon: <Image size={18} /> },
  ];

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
                  {templates.map((t) => (
                    <button
                      key={t.id}
                      className={`template-btn ${template === t.id ? 'active' : ''}`}
                      onClick={() => setTemplate(t.id)}
                      data-testid={`template-${t.id}`}
                    >
                      {t.icon}
                      {t.label}
                    </button>
                  ))}
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
                      <button className={`variant-btn variant-white ${bgVariant === 'white' ? 'active' : ''}`} onClick={() => setBgVariant('white')}>White</button>
                      <button className={`variant-btn variant-coral ${bgVariant === 'coral' ? 'active' : ''}`} onClick={() => setBgVariant('coral')}>Coral</button>
                      <button className={`variant-btn variant-black ${bgVariant === 'black' ? 'active' : ''}`} onClick={() => setBgVariant('black')}>Black</button>
                      <button className={`variant-btn variant-gradient ${bgVariant === 'gradient' ? 'active' : ''}`} onClick={() => setBgVariant('gradient')}>Gradient</button>
                    </div>
                  </div>
                </>
              )}

              {/* Stat Card Controls */}
              {template === 'stat-card' && (
                <>
                  <div className="control-section">
                    <label className="control-label">Stat Number</label>
                    <input
                      type="text"
                      className="control-input"
                      value={statNumber}
                      onChange={(e) => setStatNumber(e.target.value)}
                      placeholder="e.g., 127, 5K, 98%"
                    />
                  </div>

                  <div className="control-section">
                    <label className="control-label">Stat Label</label>
                    <input
                      type="text"
                      className="control-input"
                      value={statLabel}
                      onChange={(e) => setStatLabel(e.target.value)}
                      placeholder="e.g., Stories Shared"
                    />
                  </div>

                  <div className="control-section">
                    <label className="control-label">Description</label>
                    <textarea
                      className="control-textarea"
                      value={statDescription}
                      onChange={(e) => setStatDescription(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="control-section">
                    <label className="control-label">Background</label>
                    <div className="variant-buttons">
                      <button className={`variant-btn variant-white ${bgVariant === 'white' ? 'active' : ''}`} onClick={() => setBgVariant('white')}>White</button>
                      <button className={`variant-btn variant-coral ${bgVariant === 'coral' ? 'active' : ''}`} onClick={() => setBgVariant('coral')}>Coral</button>
                      <button className={`variant-btn variant-black ${bgVariant === 'black' ? 'active' : ''}`} onClick={() => setBgVariant('black')}>Black</button>
                      <button className={`variant-btn variant-gradient ${bgVariant === 'gradient' ? 'active' : ''}`} onClick={() => setBgVariant('gradient')}>Gradient</button>
                    </div>
                  </div>
                </>
              )}

              {/* Event Promo Controls */}
              {template === 'event-promo' && (
                <>
                  <div className="control-section">
                    <label className="control-label">Event Title</label>
                    <input
                      type="text"
                      className="control-input"
                      value={eventTitle}
                      onChange={(e) => setEventTitle(e.target.value)}
                    />
                  </div>

                  <div className="control-section">
                    <label className="control-label">Date & Time</label>
                    <input
                      type="text"
                      className="control-input"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                    />
                  </div>

                  <div className="control-section">
                    <label className="control-label">Description</label>
                    <textarea
                      className="control-textarea"
                      value={eventDescription}
                      onChange={(e) => setEventDescription(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="control-section">
                    <label className="control-label">Background</label>
                    <div className="variant-buttons">
                      <button className={`variant-btn variant-white ${bgVariant === 'white' ? 'active' : ''}`} onClick={() => setBgVariant('white')}>White</button>
                      <button className={`variant-btn variant-coral ${bgVariant === 'coral' ? 'active' : ''}`} onClick={() => setBgVariant('coral')}>Coral</button>
                      <button className={`variant-btn variant-gradient ${bgVariant === 'gradient' ? 'active' : ''}`} onClick={() => setBgVariant('gradient')}>Gradient</button>
                    </div>
                  </div>
                </>
              )}

              {/* Community Spotlight Controls */}
              {template === 'community-spotlight' && (
                <>
                  <div className="control-section">
                    <label className="control-label">Member Name</label>
                    <input
                      type="text"
                      className="control-input"
                      value={memberName}
                      onChange={(e) => setMemberName(e.target.value)}
                    />
                  </div>

                  <div className="control-section">
                    <label className="control-label">Their Story (excerpt)</label>
                    <textarea
                      className="control-textarea"
                      value={memberStory}
                      onChange={(e) => setMemberStory(e.target.value)}
                      rows={4}
                      maxLength={200}
                    />
                    <span className="char-count">{memberStory.length}/200</span>
                  </div>

                  <div className="control-section">
                    <label className="control-label">Topics (max 3)</label>
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

                  <div className="control-section">
                    <label className="control-label">Background</label>
                    <div className="variant-buttons">
                      <button className={`variant-btn variant-white ${bgVariant === 'white' ? 'active' : ''}`} onClick={() => setBgVariant('white')}>White</button>
                      <button className={`variant-btn variant-coral ${bgVariant === 'coral' ? 'active' : ''}`} onClick={() => setBgVariant('coral')}>Coral</button>
                      <button className={`variant-btn variant-gradient ${bgVariant === 'gradient' ? 'active' : ''}`} onClick={() => setBgVariant('gradient')}>Gradient</button>
                    </div>
                  </div>
                </>
              )}

              {/* Quote Carousel Controls */}
              {template === 'quote-carousel' && (
                <>
                  <div className="control-section">
                    <label className="control-label">Quote</label>
                    <textarea
                      className="control-textarea"
                      value={carouselQuote}
                      onChange={(e) => setCarouselQuote(e.target.value)}
                      rows={4}
                      maxLength={180}
                    />
                    <span className="char-count">{carouselQuote.length}/180</span>
                  </div>

                  <div className="control-section">
                    <label className="control-label">Slide Position</label>
                    <div className="slide-controls">
                      <input
                        type="number"
                        className="control-input small"
                        value={slideNumber}
                        onChange={(e) => setSlideNumber(e.target.value)}
                        min="1"
                        max={totalSlides}
                      />
                      <span className="slide-divider">of</span>
                      <input
                        type="number"
                        className="control-input small"
                        value={totalSlides}
                        onChange={(e) => setTotalSlides(e.target.value)}
                        min="2"
                        max="10"
                      />
                    </div>
                  </div>

                  <div className="control-section">
                    <label className="control-label">Background</label>
                    <div className="variant-buttons">
                      <button className={`variant-btn variant-white ${bgVariant === 'white' ? 'active' : ''}`} onClick={() => setBgVariant('white')}>White</button>
                      <button className={`variant-btn variant-coral ${bgVariant === 'coral' ? 'active' : ''}`} onClick={() => setBgVariant('coral')}>Coral</button>
                      <button className={`variant-btn variant-black ${bgVariant === 'black' ? 'active' : ''}`} onClick={() => setBgVariant('black')}>Black</button>
                      <button className={`variant-btn variant-gradient ${bgVariant === 'gradient' ? 'active' : ''}`} onClick={() => setBgVariant('gradient')}>Gradient</button>
                    </div>
                  </div>
                </>
              )}

              {/* Tip of the Day Controls */}
              {template === 'tip-of-day' && (
                <>
                  <div className="control-section">
                    <label className="control-label">Tip Number</label>
                    <input
                      type="text"
                      className="control-input small"
                      value={tipNumber}
                      onChange={(e) => setTipNumber(e.target.value)}
                    />
                  </div>

                  <div className="control-section">
                    <label className="control-label">Tip Title</label>
                    <input
                      type="text"
                      className="control-input"
                      value={tipTitle}
                      onChange={(e) => setTipTitle(e.target.value)}
                    />
                  </div>

                  <div className="control-section">
                    <label className="control-label">Tip Content</label>
                    <textarea
                      className="control-textarea"
                      value={tipContent}
                      onChange={(e) => setTipContent(e.target.value)}
                      rows={4}
                      maxLength={250}
                    />
                    <span className="char-count">{tipContent.length}/250</span>
                  </div>

                  <div className="control-section">
                    <label className="control-label">Background</label>
                    <div className="variant-buttons">
                      <button className={`variant-btn variant-white ${bgVariant === 'white' ? 'active' : ''}`} onClick={() => setBgVariant('white')}>White</button>
                      <button className={`variant-btn variant-coral ${bgVariant === 'coral' ? 'active' : ''}`} onClick={() => setBgVariant('coral')}>Coral</button>
                      <button className={`variant-btn variant-gradient ${bgVariant === 'gradient' ? 'active' : ''}`} onClick={() => setBgVariant('gradient')}>Gradient</button>
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
          grid-template-columns: 380px 1fr;
          gap: var(--vs-space-8);
          align-items: start;
        }

        .ig-controls {
          background: var(--vs-white);
          border: 1px solid var(--vs-border);
          border-radius: var(--vs-radius-lg);
          padding: var(--vs-space-6);
          max-height: 85vh;
          overflow-y: auto;
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
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--vs-space-2);
        }

        .template-btn {
          display: flex;
          align-items: center;
          gap: var(--vs-space-2);
          padding: var(--vs-space-2) var(--vs-space-3);
          background: var(--vs-white);
          border: 1px solid var(--vs-border);
          border-radius: var(--vs-radius-md);
          font-family: var(--vs-font);
          font-size: 0.8125rem;
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

        .control-input.small {
          width: 80px;
          text-align: center;
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

        .slide-controls {
          display: flex;
          align-items: center;
          gap: var(--vs-space-2);
        }

        .slide-divider {
          color: var(--vs-text-tertiary);
          font-size: 0.875rem;
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

        .variant-buttons { display: flex; gap: var(--vs-space-2); flex-wrap: wrap; }

        .variant-btn {
          flex: 1;
          min-width: 70px;
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
        .variant-btn.variant-gradient { background: linear-gradient(135deg, #FF5A5F, #FFB088); color: var(--vs-white); border-color: #FF5A5F; }
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
          position: sticky;
          top: var(--vs-space-4);
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
          .ig-preview { position: static; }
        }
      `}</style>
    </div>
  );
};

export default InstagramGenerator;
