import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Download, Image, Type, Sparkles, Check, Heart, MessageCircle, Calendar, Users, TrendingUp, UserPlus } from 'lucide-react';
import { HEALTH_TAGS } from '../data/mockData.ts';

type TemplateType = 'story-highlight' | 'call-for-submissions' | 'logo' | 'stat-card' | 'event-promo' | 'community-spotlight' | 'quote-carousel' | 'tip-of-day' | 'call-for-reviewers';
type BackgroundVariant = 'white' | 'coral' | 'black' | 'gradient' | 'teal';
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

function getBackgroundColors(variant: BackgroundVariant) {
  switch (variant) {
    case 'gradient':
      return { primary: '#FF5A5F', secondary: '#FFB088' };
    case 'coral':
      return { primary: '#FF5A5F', secondary: '#FF5A5F' };
    case 'black':
      return { primary: '#111111', secondary: '#1a1a1a' };
    case 'teal':
      return { primary: '#2A9D8F', secondary: '#264653' };
    default:
      return { primary: '#FFFFFF', secondary: '#F8F9FA' };
  }
}

function drawGradientBackground(ctx: CanvasRenderingContext2D, w: number, h: number, variant: BackgroundVariant) {
  const colors = getBackgroundColors(variant);
  
  if (variant === 'gradient') {
    const gradient = ctx.createLinearGradient(0, 0, w, h);
    gradient.addColorStop(0, '#FF5A5F');
    gradient.addColorStop(0.5, '#FF8A6B');
    gradient.addColorStop(1, '#FFB088');
    ctx.fillStyle = gradient;
  } else if (variant === 'teal') {
    const gradient = ctx.createLinearGradient(0, 0, w, h);
    gradient.addColorStop(0, '#2A9D8F');
    gradient.addColorStop(1, '#264653');
    ctx.fillStyle = gradient;
  } else {
    ctx.fillStyle = colors.primary;
  }
  ctx.fillRect(0, 0, w, h);
}

function drawBrandingFooter(ctx: CanvasRenderingContext2D, w: number, h: number, isLight: boolean, showUrl: boolean = true) {
  const cx = w / 2;
  const footerY = h - 80;
  const textColor = isLight ? '#111111' : '#FFFFFF';
  const accentColor = '#FF5A5F';
  
  ctx.textAlign = 'center';
  ctx.font = `600 28px ${FONT}`;
  ctx.fillStyle = textColor;
  const brandText = 'Vital Signs';
  const brandW = ctx.measureText(brandText).width;
  ctx.fillText(brandText, cx - 6, footerY);
  ctx.fillStyle = isLight ? accentColor : '#FFFFFF';
  ctx.fillText('.', cx + brandW / 2 - 2, footerY);

  if (showUrl) {
    ctx.font = `400 16px ${FONT}`;
    ctx.fillStyle = isLight ? 'rgba(17,17,17,0.4)' : 'rgba(255,255,255,0.6)';
    ctx.fillText('vitalsigns.ca', cx, footerY + 28);
  }
  
  ctx.textAlign = 'start';
}

// ── Template renderers ────────────────────────────────────────────────

function renderStoryHighlight(
  ctx: CanvasRenderingContext2D, w: number, h: number,
  quote: string, author: string, isAnonymous: boolean, tags: string[]
) {
  // Soft cream background
  ctx.fillStyle = '#FDF8F4';
  ctx.fillRect(0, 0, w, h);

  const cx = w / 2;

  // Decorative top accent line
  ctx.fillStyle = '#FF5A5F';
  roundRect(ctx, cx - 40, 60, 80, 4, 2);
  ctx.fill();

  // Card background with subtle shadow effect
  const cardPad = 70;
  const cardW = w - cardPad * 2;
  const cardX = cardPad;
  const cardTop = 100;
  const cardBottom = h - 140;
  const cardH = cardBottom - cardTop;

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.04)';
  roundRect(ctx, cardX + 4, cardTop + 4, cardW, cardH, 24);
  ctx.fill();

  // Card
  roundRect(ctx, cardX, cardTop, cardW, cardH, 24);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();

  // Tags at top
  let contentY = cardTop + 50;
  if (tags.length > 0) {
    drawCenteredPills(ctx, tags.slice(0, 3), cx, contentY, {
      bg: 'rgba(255,90,95,0.08)',
      color: '#FF5A5F',
      fontSize: 18,
      paddingX: 18,
      paddingY: 8,
      gap: 10,
    });
    contentY += 50;
  }

  // Large decorative quote mark
  ctx.font = `700 160px Georgia, serif`;
  ctx.fillStyle = 'rgba(255,90,95,0.08)';
  ctx.textAlign = 'center';
  ctx.fillText('\u201C', cx, contentY + 80);

  // Quote text
  const quoteFontSize = quote.length > 120 ? 30 : quote.length > 80 ? 34 : 40;
  ctx.font = `500 ${quoteFontSize}px ${FONT}`;
  ctx.fillStyle = '#1a1a1a';
  ctx.textAlign = 'center';
  const quoteMaxW = cardW - 100;
  const lines = wrapText(ctx, quote, quoteMaxW);
  const lineH = quoteFontSize * 1.5;
  const totalTextH = lines.length * lineH;
  const textStartY = cardTop + (cardH - totalTextH) / 2 + (tags.length > 0 ? 30 : 0);

  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], cx, textStartY + i * lineH + quoteFontSize * 0.8);
  }

  // Author with decorative dash
  const authorY = textStartY + totalTextH + 40;
  ctx.fillStyle = '#FF5A5F';
  roundRect(ctx, cx - 20, authorY - 10, 40, 2, 1);
  ctx.fill();
  
  ctx.font = `500 20px ${FONT}`;
  ctx.fillStyle = 'rgba(17,17,17,0.5)';
  ctx.fillText(isAnonymous ? 'Anonymous' : author, cx, authorY + 20);

  // Footer branding
  drawBrandingFooter(ctx, w, h, true);
}

function renderCallForSubmissions(
  ctx: CanvasRenderingContext2D, w: number, h: number,
  headline: string, subheadline: string, tags: string[], bgVariant: BackgroundVariant
) {
  const isLight = bgVariant === 'white';
  drawGradientBackground(ctx, w, h, bgVariant);

  const cx = w / 2;
  const textColor = isLight ? '#111111' : '#FFFFFF';
  const subtleColor = isLight ? 'rgba(17,17,17,0.6)' : 'rgba(255,255,255,0.8)';

  // Top badge
  ctx.textAlign = 'center';
  const badgeY = 100;
  drawPill(ctx, '✨ NOW OPEN', cx - 70, badgeY, {
    bg: isLight ? 'rgba(255,90,95,0.1)' : 'rgba(255,255,255,0.15)',
    color: isLight ? '#FF5A5F' : '#FFFFFF',
    fontSize: 16,
    paddingX: 24,
    paddingY: 12,
  });

  // Headline
  const hlFontSize = headline.length > 25 ? 52 : headline.length > 15 ? 64 : 72;
  ctx.font = `800 ${hlFontSize}px ${FONT}`;
  ctx.fillStyle = textColor;
  const hlLines = wrapText(ctx, headline.toUpperCase(), w - 140);
  const hlLineH = hlFontSize * 1.1;
  let hlY = 220;
  for (let i = 0; i < hlLines.length; i++) {
    ctx.fillText(hlLines[i], cx, hlY + i * hlLineH);
  }

  // Decorative line
  const lineY = hlY + hlLines.length * hlLineH + 20;
  ctx.fillStyle = isLight ? 'rgba(255,90,95,0.3)' : 'rgba(255,255,255,0.3)';
  roundRect(ctx, cx - 60, lineY, 120, 3, 1.5);
  ctx.fill();

  // Subheadline
  ctx.font = `400 26px ${FONT}`;
  ctx.fillStyle = subtleColor;
  ctx.fillText(subheadline, cx, lineY + 50);

  // Tags
  if (tags.length > 0) {
    const tagY = lineY + 100;
    drawCenteredPills(ctx, tags.slice(0, 4), cx, tagY, {
      bg: 'transparent',
      color: textColor,
      fontSize: 16,
      paddingX: 20,
      paddingY: 10,
      gap: 10,
      border: isLight ? 'rgba(17,17,17,0.15)' : 'rgba(255,255,255,0.3)',
    });
  }

  // Bottom CTA
  const ctaY = h - 130;
  roundRect(ctx, cx - 140, ctaY, 280, 50, 25);
  ctx.fillStyle = isLight ? '#111111' : '#FFFFFF';
  ctx.fill();
  
  ctx.font = `600 18px ${FONT}`;
  ctx.fillStyle = isLight ? '#FFFFFF' : '#111111';
  ctx.fillText('Submit Your Story →', cx, ctaY + 32);

  // Footer
  drawBrandingFooter(ctx, w, h, isLight, false);
}

function renderStatCard(
  ctx: CanvasRenderingContext2D, w: number, h: number,
  statNumber: string, statLabel: string, description: string, bgVariant: BackgroundVariant
) {
  const isLight = bgVariant === 'white';
  drawGradientBackground(ctx, w, h, bgVariant);

  const cx = w / 2;
  const textColor = isLight ? '#111111' : '#FFFFFF';
  const subtleColor = isLight ? 'rgba(17,17,17,0.55)' : 'rgba(255,255,255,0.7)';

  // Decorative circles in background
  if (!isLight) {
    ctx.globalAlpha = 0.05;
    ctx.beginPath();
    ctx.arc(w * 0.2, h * 0.3, 200, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(w * 0.8, h * 0.7, 150, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // Big stat number with slight shadow
  ctx.textAlign = 'center';
  
  if (!isLight) {
    ctx.font = `900 200px ${FONT}`;
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.fillText(statNumber, cx + 4, h / 2 - 30);
  }
  
  ctx.font = `900 200px ${FONT}`;
  ctx.fillStyle = textColor;
  ctx.fillText(statNumber, cx, h / 2 - 34);

  // Stat label with decorative underline
  ctx.font = `700 32px ${FONT}`;
  ctx.fillStyle = textColor;
  ctx.fillText(statLabel.toUpperCase(), cx, h / 2 + 50);

  // Decorative line
  ctx.fillStyle = isLight ? '#FF5A5F' : 'rgba(255,255,255,0.4)';
  roundRect(ctx, cx - 40, h / 2 + 70, 80, 3, 1.5);
  ctx.fill();

  // Description
  ctx.font = `400 22px ${FONT}`;
  ctx.fillStyle = subtleColor;
  const descLines = wrapText(ctx, description, w - 180);
  for (let i = 0; i < Math.min(descLines.length, 3); i++) {
    ctx.fillText(descLines[i], cx, h / 2 + 120 + i * 32);
  }

  // Branding
  drawBrandingFooter(ctx, w, h, isLight);
}

function renderEventPromo(
  ctx: CanvasRenderingContext2D, w: number, h: number,
  eventTitle: string, eventDate: string, eventDescription: string, bgVariant: BackgroundVariant
) {
  const isLight = bgVariant === 'white';
  drawGradientBackground(ctx, w, h, bgVariant);

  const cx = w / 2;
  const textColor = isLight ? '#111111' : '#FFFFFF';
  const subtleColor = isLight ? 'rgba(17,17,17,0.6)' : 'rgba(255,255,255,0.75)';
  const accentColor = isLight ? '#FF5A5F' : '#FFFFFF';

  // Calendar icon badge at top
  ctx.textAlign = 'center';
  const iconY = 100;
  
  // Circle background for icon
  ctx.beginPath();
  ctx.arc(cx, iconY + 30, 45, 0, Math.PI * 2);
  ctx.fillStyle = isLight ? 'rgba(255,90,95,0.1)' : 'rgba(255,255,255,0.15)';
  ctx.fill();
  
  ctx.font = `400 40px ${FONT}`;
  ctx.fillText('📅', cx, iconY + 45);

  // "UPCOMING EVENT" text
  ctx.font = `600 14px ${FONT}`;
  ctx.fillStyle = accentColor;
  ctx.fillText('UPCOMING EVENT', cx, iconY + 100);

  // Event title
  ctx.font = `800 56px ${FONT}`;
  ctx.fillStyle = textColor;
  const titleLines = wrapText(ctx, eventTitle, w - 140);
  let titleY = iconY + 180;
  for (const line of titleLines) {
    ctx.fillText(line, cx, titleY);
    titleY += 68;
  }

  // Date pill
  const dateY = titleY + 20;
  const dateText = eventDate;
  ctx.font = `600 20px ${FONT}`;
  const dateW = ctx.measureText(dateText).width + 48;
  roundRect(ctx, cx - dateW / 2, dateY, dateW, 44, 22);
  ctx.fillStyle = accentColor;
  ctx.fill();
  
  ctx.fillStyle = isLight ? '#FFFFFF' : '#111111';
  ctx.fillText(dateText, cx, dateY + 29);

  // Description
  ctx.font = `400 22px ${FONT}`;
  ctx.fillStyle = subtleColor;
  const descLines = wrapText(ctx, eventDescription, w - 160);
  const descY = dateY + 80;
  for (let i = 0; i < Math.min(descLines.length, 3); i++) {
    ctx.fillText(descLines[i], cx, descY + i * 32);
  }

  // Branding
  drawBrandingFooter(ctx, w, h, isLight);
}

function renderCommunitySpotlight(
  ctx: CanvasRenderingContext2D, w: number, h: number,
  memberName: string, memberStory: string, memberTags: string[], bgVariant: BackgroundVariant
) {
  const isLight = bgVariant === 'white';
  drawGradientBackground(ctx, w, h, bgVariant);

  const cx = w / 2;
  const textColor = isLight ? '#111111' : '#FFFFFF';
  const subtleColor = isLight ? 'rgba(17,17,17,0.6)' : 'rgba(255,255,255,0.75)';
  const accentColor = isLight ? '#FF5A5F' : '#FFFFFF';

  // Top label
  ctx.textAlign = 'center';
  ctx.font = `700 14px ${FONT}`;
  ctx.fillStyle = accentColor;
  ctx.fillText('★  COMMUNITY SPOTLIGHT  ★', cx, 90);

  // Avatar circle with gradient border
  const avatarY = 180;
  const avatarR = 65;
  
  // Outer ring
  ctx.beginPath();
  ctx.arc(cx, avatarY, avatarR + 4, 0, Math.PI * 2);
  ctx.fillStyle = accentColor;
  ctx.fill();
  
  // Inner circle
  ctx.beginPath();
  ctx.arc(cx, avatarY, avatarR, 0, Math.PI * 2);
  ctx.fillStyle = isLight ? '#FDF8F4' : 'rgba(255,255,255,0.1)';
  ctx.fill();

  // Initials
  ctx.font = `700 42px ${FONT}`;
  ctx.fillStyle = accentColor;
  const initials = memberName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  ctx.fillText(initials, cx, avatarY + 15);

  // Member name
  ctx.font = `700 40px ${FONT}`;
  ctx.fillStyle = textColor;
  ctx.fillText(memberName, cx, avatarY + 100);

  // Tags
  if (memberTags.length > 0) {
    drawCenteredPills(ctx, memberTags.slice(0, 3), cx, avatarY + 130, {
      bg: isLight ? 'rgba(255,90,95,0.08)' : 'rgba(255,255,255,0.1)',
      color: accentColor,
      fontSize: 14,
      paddingX: 14,
      paddingY: 7,
      gap: 8,
    });
  }

  // Quote marks
  ctx.font = `700 80px Georgia, serif`;
  ctx.fillStyle = isLight ? 'rgba(255,90,95,0.15)' : 'rgba(255,255,255,0.1)';
  ctx.fillText('\u201C', cx - 280, avatarY + 260);

  // Story excerpt
  ctx.font = `500 24px ${FONT}`;
  ctx.fillStyle = subtleColor;
  const storyLines = wrapText(ctx, memberStory, w - 160);
  const storyStartY = avatarY + 230;
  for (let i = 0; i < Math.min(storyLines.length, 4); i++) {
    ctx.fillText(storyLines[i], cx, storyStartY + i * 36);
  }

  // Branding
  drawBrandingFooter(ctx, w, h, isLight);
}

function renderQuoteCarousel(
  ctx: CanvasRenderingContext2D, w: number, h: number,
  quote: string, slideNumber: string, totalSlides: string, bgVariant: BackgroundVariant
) {
  const isLight = bgVariant === 'white';
  drawGradientBackground(ctx, w, h, bgVariant);

  const cx = w / 2;
  const textColor = isLight ? '#111111' : '#FFFFFF';
  const subtleColor = isLight ? 'rgba(17,17,17,0.4)' : 'rgba(255,255,255,0.5)';
  const accentColor = isLight ? '#FF5A5F' : '#FFFFFF';

  // Slide indicator at top
  ctx.textAlign = 'center';
  ctx.font = `500 16px ${FONT}`;
  ctx.fillStyle = subtleColor;
  ctx.fillText(`${slideNumber} of ${totalSlides}`, cx, 80);

  // Large decorative quote marks
  ctx.font = `700 280px Georgia, serif`;
  ctx.fillStyle = isLight ? 'rgba(255,90,95,0.06)' : 'rgba(255,255,255,0.08)';
  ctx.fillText('\u201C', cx, 340);

  // Quote text - centered
  const quoteFontSize = quote.length > 100 ? 34 : quote.length > 60 ? 42 : 48;
  ctx.font = `600 ${quoteFontSize}px ${FONT}`;
  ctx.fillStyle = textColor;
  const quoteLines = wrapText(ctx, quote, w - 140);
  const lineH = quoteFontSize * 1.45;
  const totalH = quoteLines.length * lineH;
  const startY = (h - totalH) / 2 + 20;

  for (let i = 0; i < quoteLines.length; i++) {
    ctx.fillText(quoteLines[i], cx, startY + i * lineH);
  }

  // Carousel dots
  const dotsY = h - 140;
  const total = parseInt(totalSlides) || 5;
  const current = parseInt(slideNumber) || 1;
  const dotSpacing = 24;
  const totalDotsWidth = (total - 1) * dotSpacing;
  let dotX = cx - totalDotsWidth / 2;
  
  for (let i = 1; i <= total; i++) {
    ctx.beginPath();
    const isActive = i === current;
    ctx.arc(dotX, dotsY, isActive ? 6 : 4, 0, Math.PI * 2);
    ctx.fillStyle = isActive ? accentColor : subtleColor;
    ctx.fill();
    dotX += dotSpacing;
  }

  // Branding
  drawBrandingFooter(ctx, w, h, isLight, false);
}

function renderTipOfDay(
  ctx: CanvasRenderingContext2D, w: number, h: number,
  tipTitle: string, tipContent: string, tipNumber: string, bgVariant: BackgroundVariant
) {
  const isLight = bgVariant === 'white';
  drawGradientBackground(ctx, w, h, bgVariant);

  const cx = w / 2;
  const textColor = isLight ? '#111111' : '#FFFFFF';
  const subtleColor = isLight ? 'rgba(17,17,17,0.6)' : 'rgba(255,255,255,0.75)';
  const accentColor = isLight ? '#FF5A5F' : '#FFFFFF';

  // Light bulb icon
  ctx.textAlign = 'center';
  const iconY = 100;
  
  ctx.beginPath();
  ctx.arc(cx, iconY + 30, 40, 0, Math.PI * 2);
  ctx.fillStyle = isLight ? 'rgba(255,90,95,0.1)' : 'rgba(255,255,255,0.12)';
  ctx.fill();
  
  ctx.font = `400 36px ${FONT}`;
  ctx.fillText('💡', cx, iconY + 43);

  // Tip number badge
  ctx.font = `700 14px ${FONT}`;
  ctx.fillStyle = accentColor;
  ctx.fillText(`TIP #${tipNumber}`, cx, iconY + 100);

  // Tip title
  ctx.font = `800 48px ${FONT}`;
  ctx.fillStyle = textColor;
  const titleLines = wrapText(ctx, tipTitle, w - 140);
  let titleY = iconY + 180;
  for (const line of titleLines) {
    ctx.fillText(line, cx, titleY);
    titleY += 60;
  }

  // Decorative line
  ctx.fillStyle = accentColor;
  roundRect(ctx, cx - 40, titleY + 10, 80, 3, 1.5);
  ctx.fill();

  // Tip content
  ctx.font = `400 24px ${FONT}`;
  ctx.fillStyle = subtleColor;
  const contentLines = wrapText(ctx, tipContent, w - 160);
  const contentStartY = titleY + 60;
  for (let i = 0; i < Math.min(contentLines.length, 5); i++) {
    ctx.fillText(contentLines[i], cx, contentStartY + i * 36);
  }

  // Branding
  drawBrandingFooter(ctx, w, h, isLight);
}

function renderCallForReviewers(
  ctx: CanvasRenderingContext2D, w: number, h: number,
  headline: string, description: string, benefits: string[], bgVariant: BackgroundVariant
) {
  const isLight = bgVariant === 'white';
  drawGradientBackground(ctx, w, h, bgVariant);

  const cx = w / 2;
  const textColor = isLight ? '#111111' : '#FFFFFF';
  const subtleColor = isLight ? 'rgba(17,17,17,0.6)' : 'rgba(255,255,255,0.75)';
  const accentColor = isLight ? '#FF5A5F' : '#FFFFFF';

  // Top badge
  ctx.textAlign = 'center';
  const badgeY = 80;
  drawPill(ctx, '📋 JOIN OUR TEAM', cx - 85, badgeY, {
    bg: isLight ? 'rgba(255,90,95,0.1)' : 'rgba(255,255,255,0.15)',
    color: accentColor,
    fontSize: 16,
    paddingX: 24,
    paddingY: 12,
  });

  // Main headline
  ctx.font = `800 56px ${FONT}`;
  ctx.fillStyle = textColor;
  const hlLines = wrapText(ctx, headline.toUpperCase(), w - 120);
  let hlY = 200;
  for (const line of hlLines) {
    ctx.fillText(line, cx, hlY);
    hlY += 68;
  }

  // Description
  ctx.font = `400 24px ${FONT}`;
  ctx.fillStyle = subtleColor;
  const descLines = wrapText(ctx, description, w - 140);
  let descY = hlY + 30;
  for (const line of descLines) {
    ctx.fillText(line, cx, descY);
    descY += 34;
  }

  // Benefits list
  if (benefits.length > 0) {
    const benefitsY = descY + 40;
    ctx.font = `500 20px ${FONT}`;
    
    for (let i = 0; i < Math.min(benefits.length, 4); i++) {
      const benefit = benefits[i];
      const itemY = benefitsY + i * 42;
      
      // Checkmark circle
      ctx.beginPath();
      ctx.arc(cx - 180, itemY - 6, 12, 0, Math.PI * 2);
      ctx.fillStyle = accentColor;
      ctx.fill();
      
      // Checkmark
      ctx.font = `600 14px ${FONT}`;
      ctx.fillStyle = isLight ? '#FFFFFF' : '#111111';
      ctx.fillText('✓', cx - 184, itemY - 1);
      
      // Benefit text
      ctx.font = `500 20px ${FONT}`;
      ctx.fillStyle = textColor;
      ctx.textAlign = 'left';
      ctx.fillText(benefit, cx - 155, itemY);
      ctx.textAlign = 'center';
    }
  }

  // Apply CTA button
  const ctaY = h - 150;
  roundRect(ctx, cx - 120, ctaY, 240, 52, 26);
  ctx.fillStyle = accentColor;
  ctx.fill();
  
  ctx.font = `700 18px ${FONT}`;
  ctx.fillStyle = isLight ? '#FFFFFF' : '#111111';
  ctx.fillText('Apply Now →', cx, ctaY + 34);

  // Branding
  drawBrandingFooter(ctx, w, h, isLight, false);
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
  ctx.font = `700 ${mainSize}px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.fillStyle = textColor;
  const brandText = 'Vital Signs';
  const brandW = ctx.measureText(brandText).width;
  ctx.fillText(brandText, cx - 6, cy - 10);
  ctx.fillStyle = dotColor;
  ctx.fillText('.', cx + brandW / 2 - 2, cy - 10);

  // Tagline
  const taglineSize = mainSize * 0.24;
  ctx.font = `400 ${taglineSize}px ${FONT}`;
  ctx.fillStyle = subColor;
  ctx.fillText('Real stories. Real health. Real people.', cx, cy + mainSize * 0.5);

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
  const [headline, setHeadline] = useState('Share Your Story');
  const [subheadline, setSubheadline] = useState('Your experience could help someone feel less alone');
  const [logoSize, setLogoSize] = useState<LogoSize>('square');
  const [logoVariant, setLogoVariant] = useState<BackgroundVariant>('white');
  const [downloading, setDownloading] = useState(false);

  // Stat card
  const [statNumber, setStatNumber] = useState('127');
  const [statLabel, setStatLabel] = useState('Stories Shared');
  const [statDescription, setStatDescription] = useState('Real people sharing their health journeys to help others feel less alone.');

  // Event promo
  const [eventTitle, setEventTitle] = useState('Virtual Story Circle');
  const [eventDate, setEventDate] = useState('March 15, 2026 • 7PM EST');
  const [eventDescription, setEventDescription] = useState('Join us for an evening of sharing, listening, and connection.');

  // Community spotlight
  const [memberName, setMemberName] = useState('Jordan K.');
  const [memberStory, setMemberStory] = useState('Sharing my story here helped me realize I was never alone in my journey.');

  // Quote carousel
  const [slideNumber, setSlideNumber] = useState('1');
  const [totalSlides, setTotalSlides] = useState('5');
  const [carouselQuote, setCarouselQuote] = useState('Every story shared here makes someone else feel less alone in their journey.');

  // Tip of day
  const [tipTitle, setTipTitle] = useState('Start Where You Are');
  const [tipContent, setTipContent] = useState('You don\'t need to have your whole story figured out. Share what feels true today.');
  const [tipNumber, setTipNumber] = useState('42');

  // Call for reviewers
  const [reviewerHeadline, setReviewerHeadline] = useState('Become a Story Reviewer');
  const [reviewerDescription, setReviewerDescription] = useState('Help us create a safe, supportive space for health storytelling.');
  const [reviewerBenefits, setReviewerBenefits] = useState([
    'Shape community guidelines',
    'Support fellow storytellers',
    'Build moderation experience',
    'Join a meaningful mission'
  ]);

  const previewRef = useRef<HTMLCanvasElement>(null);

  const logoSizes = {
    square: { width: 1080, height: 1080 },
    horizontal: { width: 1920, height: 1080 },
    story: { width: 1080, height: 1920 },
  };

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
      case 'call-for-reviewers':
        renderCallForReviewers(ctx, w, h, reviewerHeadline, reviewerDescription, reviewerBenefits, bgVariant);
        break;
    }
  }, [template, quote, author, isAnonymous, selectedTags, bgVariant, headline, subheadline, logoSize, logoVariant,
      statNumber, statLabel, statDescription, eventTitle, eventDate, eventDescription, memberName, memberStory,
      slideNumber, totalSlides, carouselQuote, tipTitle, tipContent, tipNumber, reviewerHeadline, reviewerDescription, reviewerBenefits]); // eslint-disable-line

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
        case 'call-for-reviewers':
          renderCallForReviewers(ctx, w, h, reviewerHeadline, reviewerDescription, reviewerBenefits, bgVariant);
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

  const updateBenefit = (index: number, value: string) => {
    setReviewerBenefits(prev => {
      const newBenefits = [...prev];
      newBenefits[index] = value;
      return newBenefits;
    });
  };

  const templates: { id: TemplateType; label: string; icon: React.ReactNode }[] = [
    { id: 'story-highlight', label: 'Story Highlight', icon: <Type size={16} /> },
    { id: 'call-for-submissions', label: 'Call for Stories', icon: <Sparkles size={16} /> },
    { id: 'call-for-reviewers', label: 'Call for Reviewers', icon: <UserPlus size={16} /> },
    { id: 'stat-card', label: 'Stats Card', icon: <TrendingUp size={16} /> },
    { id: 'event-promo', label: 'Event Promo', icon: <Calendar size={16} /> },
    { id: 'community-spotlight', label: 'Spotlight', icon: <Users size={16} /> },
    { id: 'quote-carousel', label: 'Carousel', icon: <MessageCircle size={16} /> },
    { id: 'tip-of-day', label: 'Tip of Day', icon: <Heart size={16} /> },
    { id: 'logo', label: 'Logo', icon: <Image size={16} /> },
  ];

  const renderBackgroundSelector = () => (
    <div className="control-section">
      <label className="control-label">Background</label>
      <div className="variant-buttons">
        <button className={`variant-btn variant-white ${bgVariant === 'white' ? 'active' : ''}`} onClick={() => setBgVariant('white')}>Light</button>
        <button className={`variant-btn variant-coral ${bgVariant === 'coral' ? 'active' : ''}`} onClick={() => setBgVariant('coral')}>Coral</button>
        <button className={`variant-btn variant-black ${bgVariant === 'black' ? 'active' : ''}`} onClick={() => setBgVariant('black')}>Dark</button>
        <button className={`variant-btn variant-gradient ${bgVariant === 'gradient' ? 'active' : ''}`} onClick={() => setBgVariant('gradient')}>Warm</button>
        <button className={`variant-btn variant-teal ${bgVariant === 'teal' ? 'active' : ''}`} onClick={() => setBgVariant('teal')}>Teal</button>
      </div>
    </div>
  );

  return (
    <div className="ig-generator">
      <div className="ig-header">
        <div className="container">
          <h1>Instagram Post Generator</h1>
          <p>Create on-brand posts for Vital Signs — exports at 3x resolution for crisp quality</p>
        </div>
      </div>

      <div className="ig-content">
        <div className="container">
          <div className="ig-layout">
            {/* Controls */}
            <div className="ig-controls">
              <div className="control-section">
                <label className="control-label">Template</label>
                <div className="template-grid">
                  {templates.map((t) => (
                    <button
                      key={t.id}
                      className={`template-btn ${template === t.id ? 'active' : ''}`}
                      onClick={() => setTemplate(t.id)}
                    >
                      {t.icon}
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Story Highlight */}
              {template === 'story-highlight' && (
                <>
                  <div className="control-section">
                    <label className="control-label">Quote</label>
                    <textarea
                      className="control-textarea"
                      value={quote}
                      onChange={(e) => setQuote(e.target.value)}
                      maxLength={180}
                      rows={3}
                    />
                    <span className="char-count">{quote.length}/180</span>
                  </div>
                  <div className="control-section">
                    <label className="control-label">Author</label>
                    <div className="author-row">
                      <input
                        type="text"
                        className="control-input"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        disabled={isAnonymous}
                      />
                      <label className="checkbox-label">
                        <input type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} />
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

              {/* Call for Submissions */}
              {template === 'call-for-submissions' && (
                <>
                  <div className="control-section">
                    <label className="control-label">Headline</label>
                    <input type="text" className="control-input" value={headline} onChange={(e) => setHeadline(e.target.value)} />
                  </div>
                  <div className="control-section">
                    <label className="control-label">Subheadline</label>
                    <input type="text" className="control-input" value={subheadline} onChange={(e) => setSubheadline(e.target.value)} />
                  </div>
                  <div className="control-section">
                    <label className="control-label">Topics</label>
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
                  {renderBackgroundSelector()}
                </>
              )}

              {/* Call for Reviewers */}
              {template === 'call-for-reviewers' && (
                <>
                  <div className="control-section">
                    <label className="control-label">Headline</label>
                    <input type="text" className="control-input" value={reviewerHeadline} onChange={(e) => setReviewerHeadline(e.target.value)} />
                  </div>
                  <div className="control-section">
                    <label className="control-label">Description</label>
                    <textarea className="control-textarea" value={reviewerDescription} onChange={(e) => setReviewerDescription(e.target.value)} rows={2} />
                  </div>
                  <div className="control-section">
                    <label className="control-label">Benefits (4 max)</label>
                    {reviewerBenefits.map((benefit, i) => (
                      <input
                        key={i}
                        type="text"
                        className="control-input benefit-input"
                        value={benefit}
                        onChange={(e) => updateBenefit(i, e.target.value)}
                        placeholder={`Benefit ${i + 1}`}
                      />
                    ))}
                  </div>
                  {renderBackgroundSelector()}
                </>
              )}

              {/* Stat Card */}
              {template === 'stat-card' && (
                <>
                  <div className="control-section">
                    <label className="control-label">Number</label>
                    <input type="text" className="control-input" value={statNumber} onChange={(e) => setStatNumber(e.target.value)} placeholder="e.g., 127, 5K, 98%" />
                  </div>
                  <div className="control-section">
                    <label className="control-label">Label</label>
                    <input type="text" className="control-input" value={statLabel} onChange={(e) => setStatLabel(e.target.value)} />
                  </div>
                  <div className="control-section">
                    <label className="control-label">Description</label>
                    <textarea className="control-textarea" value={statDescription} onChange={(e) => setStatDescription(e.target.value)} rows={2} />
                  </div>
                  {renderBackgroundSelector()}
                </>
              )}

              {/* Event Promo */}
              {template === 'event-promo' && (
                <>
                  <div className="control-section">
                    <label className="control-label">Event Title</label>
                    <input type="text" className="control-input" value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} />
                  </div>
                  <div className="control-section">
                    <label className="control-label">Date & Time</label>
                    <input type="text" className="control-input" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
                  </div>
                  <div className="control-section">
                    <label className="control-label">Description</label>
                    <textarea className="control-textarea" value={eventDescription} onChange={(e) => setEventDescription(e.target.value)} rows={2} />
                  </div>
                  {renderBackgroundSelector()}
                </>
              )}

              {/* Community Spotlight */}
              {template === 'community-spotlight' && (
                <>
                  <div className="control-section">
                    <label className="control-label">Member Name</label>
                    <input type="text" className="control-input" value={memberName} onChange={(e) => setMemberName(e.target.value)} />
                  </div>
                  <div className="control-section">
                    <label className="control-label">Story Excerpt</label>
                    <textarea className="control-textarea" value={memberStory} onChange={(e) => setMemberStory(e.target.value)} rows={3} maxLength={150} />
                    <span className="char-count">{memberStory.length}/150</span>
                  </div>
                  <div className="control-section">
                    <label className="control-label">Topics</label>
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
                  {renderBackgroundSelector()}
                </>
              )}

              {/* Quote Carousel */}
              {template === 'quote-carousel' && (
                <>
                  <div className="control-section">
                    <label className="control-label">Quote</label>
                    <textarea className="control-textarea" value={carouselQuote} onChange={(e) => setCarouselQuote(e.target.value)} rows={3} maxLength={150} />
                    <span className="char-count">{carouselQuote.length}/150</span>
                  </div>
                  <div className="control-section">
                    <label className="control-label">Slide Position</label>
                    <div className="slide-row">
                      <input type="number" className="control-input small" value={slideNumber} onChange={(e) => setSlideNumber(e.target.value)} min="1" />
                      <span>of</span>
                      <input type="number" className="control-input small" value={totalSlides} onChange={(e) => setTotalSlides(e.target.value)} min="2" max="10" />
                    </div>
                  </div>
                  {renderBackgroundSelector()}
                </>
              )}

              {/* Tip of Day */}
              {template === 'tip-of-day' && (
                <>
                  <div className="control-section">
                    <label className="control-label">Tip Number</label>
                    <input type="text" className="control-input small" value={tipNumber} onChange={(e) => setTipNumber(e.target.value)} />
                  </div>
                  <div className="control-section">
                    <label className="control-label">Title</label>
                    <input type="text" className="control-input" value={tipTitle} onChange={(e) => setTipTitle(e.target.value)} />
                  </div>
                  <div className="control-section">
                    <label className="control-label">Content</label>
                    <textarea className="control-textarea" value={tipContent} onChange={(e) => setTipContent(e.target.value)} rows={3} maxLength={180} />
                    <span className="char-count">{tipContent.length}/180</span>
                  </div>
                  {renderBackgroundSelector()}
                </>
              )}

              {/* Logo */}
              {template === 'logo' && (
                <>
                  <div className="control-section">
                    <label className="control-label">Size</label>
                    <div className="variant-buttons">
                      <button className={`variant-btn ${logoSize === 'square' ? 'active' : ''}`} onClick={() => setLogoSize('square')}>Square</button>
                      <button className={`variant-btn ${logoSize === 'horizontal' ? 'active' : ''}`} onClick={() => setLogoSize('horizontal')}>Wide</button>
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

              {/* Download */}
              <motion.button
                className="download-btn"
                onClick={handleDownload}
                disabled={downloading}
                whileTap={{ scale: 0.98 }}
              >
                <Download size={20} />
                {downloading ? 'Generating...' : 'Download PNG (3x)'}
              </motion.button>
            </div>

            {/* Preview */}
            <div className="ig-preview">
              <div className="preview-label">Live Preview</div>
              <div className="preview-container">
                <canvas ref={previewRef} style={{ width: '100%', height: 'auto', borderRadius: '12px' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .ig-generator { min-height: 100vh; background: var(--vs-bg-subtle, #f8f9fa); }
        .ig-header { background: var(--vs-white, #fff); padding: 2rem 0; border-bottom: 1px solid var(--vs-border, #e5e7eb); }
        .ig-header h1 { font-size: 1.5rem; margin-bottom: 0.25rem; }
        .ig-header p { color: var(--vs-text-secondary, #6b7280); font-size: 0.9375rem; }
        .ig-content { padding: 2rem 0; }
        .ig-layout { display: grid; grid-template-columns: 360px 1fr; gap: 2rem; align-items: start; }
        .ig-controls { background: var(--vs-white, #fff); border: 1px solid var(--vs-border, #e5e7eb); border-radius: 16px; padding: 1.5rem; max-height: 80vh; overflow-y: auto; }
        .control-section { margin-bottom: 1.5rem; }
        .control-label { display: block; font-size: 0.75rem; font-weight: 600; color: var(--vs-text-tertiary, #9ca3af); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.75rem; }
        
        .template-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; }
        .template-btn { display: flex; flex-direction: column; align-items: center; gap: 0.375rem; padding: 0.75rem 0.5rem; background: var(--vs-white, #fff); border: 1px solid var(--vs-border, #e5e7eb); border-radius: 8px; font-family: inherit; font-size: 0.6875rem; font-weight: 500; color: var(--vs-text-secondary, #6b7280); cursor: pointer; transition: all 0.15s; }
        .template-btn:hover { border-color: var(--vs-border-hover, #d1d5db); }
        .template-btn.active { background: var(--vs-black, #111); color: var(--vs-white, #fff); border-color: var(--vs-black, #111); }
        .template-btn span { text-align: center; line-height: 1.2; }
        
        .control-input, .control-textarea { width: 100%; padding: 0.75rem; font-family: inherit; font-size: 0.9375rem; border: 1px solid var(--vs-border, #e5e7eb); border-radius: 8px; resize: vertical; box-sizing: border-box; }
        .control-input:focus, .control-textarea:focus { outline: none; border-color: var(--vs-text-tertiary, #9ca3af); }
        .control-input.small { width: 70px; text-align: center; }
        .benefit-input { margin-bottom: 0.5rem; }
        .char-count { display: block; font-size: 0.6875rem; color: var(--vs-text-tertiary, #9ca3af); text-align: right; margin-top: 0.25rem; }
        
        .author-row, .slide-row { display: flex; gap: 0.75rem; align-items: center; }
        .author-row .control-input { flex: 1; }
        .slide-row span { color: var(--vs-text-tertiary, #9ca3af); font-size: 0.875rem; }
        .checkbox-label { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; color: var(--vs-text-secondary, #6b7280); cursor: pointer; white-space: nowrap; }
        .checkbox-label input { accent-color: var(--vs-coral, #ff5a5f); }
        
        .tag-selector { display: flex; flex-wrap: wrap; gap: 0.5rem; }
        .tag-btn { display: inline-flex; align-items: center; gap: 4px; padding: 0.375rem 0.75rem; font-family: inherit; font-size: 0.75rem; font-weight: 500; color: var(--vs-text-secondary, #6b7280); background: var(--vs-white, #fff); border: 1px solid var(--vs-border, #e5e7eb); border-radius: 9999px; cursor: pointer; transition: all 0.15s; }
        .tag-btn:hover:not(:disabled) { border-color: var(--vs-border-hover, #d1d5db); }
        .tag-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .tag-btn.active { background: var(--vs-coral, #ff5a5f); color: var(--vs-white, #fff); border-color: var(--vs-coral, #ff5a5f); }
        
        .variant-buttons { display: flex; gap: 0.5rem; flex-wrap: wrap; }
        .variant-btn { flex: 1; min-width: 60px; padding: 0.5rem 0.75rem; font-family: inherit; font-size: 0.75rem; font-weight: 500; border: 1px solid var(--vs-border, #e5e7eb); border-radius: 8px; cursor: pointer; transition: all 0.15s; background: var(--vs-white, #fff); color: var(--vs-text-primary, #111); }
        .variant-btn.variant-white { background: #fff; }
        .variant-btn.variant-coral { background: #ff5a5f; color: #fff; border-color: #ff5a5f; }
        .variant-btn.variant-black { background: #111; color: #fff; border-color: #111; }
        .variant-btn.variant-gradient { background: linear-gradient(135deg, #ff5a5f, #ffb088); color: #fff; border-color: #ff5a5f; }
        .variant-btn.variant-teal { background: linear-gradient(135deg, #2a9d8f, #264653); color: #fff; border-color: #2a9d8f; }
        .variant-btn.active { box-shadow: 0 0 0 2px var(--vs-coral, #ff5a5f); }
        
        .download-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 1rem; background: var(--vs-coral, #ff5a5f); color: var(--vs-white, #fff); border: none; border-radius: 10px; font-family: inherit; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.15s; }
        .download-btn:hover:not(:disabled) { filter: brightness(1.05); }
        .download-btn:disabled { opacity: 0.7; cursor: wait; }
        
        .ig-preview { background: var(--vs-white, #fff); border: 1px solid var(--vs-border, #e5e7eb); border-radius: 16px; padding: 1.5rem; position: sticky; top: 1rem; }
        .preview-label { font-size: 0.75rem; font-weight: 600; color: var(--vs-text-tertiary, #9ca3af); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 1rem; }
        .preview-container { border-radius: 12px; border: 1px solid var(--vs-border, #e5e7eb); overflow: hidden; background: #f8f9fa; }
        
        @media (max-width: 1024px) { .ig-layout { grid-template-columns: 1fr; } .ig-preview { position: static; } }
      `}</style>
    </div>
  );
};

export default InstagramGenerator;
