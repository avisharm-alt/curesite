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

function drawBackground(ctx: CanvasRenderingContext2D, w: number, h: number, variant: BackgroundVariant) {
  if (variant === 'gradient') {
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#FFF5F3');
    grad.addColorStop(1, '#FFE8E5');
    ctx.fillStyle = grad;
  } else if (variant === 'teal') {
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#0D9488');
    grad.addColorStop(1, '#0F766E');
    ctx.fillStyle = grad;
  } else if (variant === 'coral') {
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#FF5A5F');
    grad.addColorStop(1, '#E54B50');
    ctx.fillStyle = grad;
  } else if (variant === 'black') {
    ctx.fillStyle = '#111111';
  } else {
    ctx.fillStyle = WARM_WHITE;
  }
  ctx.fillRect(0, 0, w, h);
}

// ═══════════════════════════════════════════════════════════════════════════
// REDESIGNED TEMPLATE RENDERERS - More Visual Impact
// ═══════════════════════════════════════════════════════════════════════════

function renderStoryHighlight(ctx: CanvasRenderingContext2D, w: number, h: number, quote: string, author: string, isAnonymous: boolean, tags: string[]) {
  // Warm cream background
  ctx.fillStyle = '#FBF9F7';
  ctx.fillRect(0, 0, w, h);
  
  // Large coral accent block in top-left
  ctx.fillStyle = CORAL;
  ctx.fillRect(0, 0, 8, 400);
  
  // Tag pill at top
  if (tags.length > 0) {
    const tag = tags[0].toUpperCase();
    ctx.font = `700 13px ${FONT}`;
    const tagW = ctx.measureText(tag).width + 32;
    ctx.fillStyle = CORAL;
    roundRect(ctx, 50, 50, tagW, 36, 18);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'left';
    ctx.fillText(tag, 66, 74);
  }
  
  // Giant decorative quote mark
  ctx.font = `700 420px ${SERIF}`;
  ctx.fillStyle = 'rgba(255, 90, 95, 0.07)';
  ctx.textAlign = 'left';
  ctx.fillText('"', -30, 450);
  
  // Main quote - large and bold
  const qLen = quote.length;
  const fontSize = qLen > 100 ? 44 : qLen > 60 ? 52 : 62;
  ctx.font = `500 ${fontSize}px ${SERIF}`;
  ctx.fillStyle = CHARCOAL;
  const lines = wrapText(ctx, quote, w - 100);
  const lineH = fontSize * 1.35;
  const totalH = lines.length * lineH;
  const startY = (h - totalH) / 2 + 40;
  
  lines.forEach((line, i) => {
    ctx.fillText(line, 50, startY + i * lineH);
  });
  
  // Author with em dash
  const authorY = startY + lines.length * lineH + 50;
  ctx.font = `600 20px ${FONT}`;
  ctx.fillStyle = CORAL;
  ctx.fillText('—', 50, authorY);
  ctx.fillStyle = '#666';
  ctx.font = `500 20px ${FONT}`;
  ctx.fillText(isAnonymous ? 'Anonymous' : author, 80, authorY);
  
  // Bottom branding bar
  ctx.fillStyle = '#F0EDEA';
  ctx.fillRect(0, h - 70, w, 70);
  ctx.font = `600 14px ${FONT}`;
  ctx.fillStyle = '#999';
  ctx.textAlign = 'center';
  ctx.fillText('VITAL SIGNS', w / 2, h - 35);
  
  ctx.textAlign = 'start';
}

function renderCallForSubmissions(ctx: CanvasRenderingContext2D, w: number, h: number, headline: string, subheadline: string, tags: string[], bg: BackgroundVariant) {
  const isDark = bg === 'coral' || bg === 'black' || bg === 'teal';
  drawBackground(ctx, w, h, bg);
  
  const textColor = isDark ? '#FFFFFF' : CHARCOAL;
  const subtleColor = isDark ? 'rgba(255,255,255,0.75)' : '#555';
  
  // Corner accent shape
  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,90,95,0.1)';
  ctx.beginPath();
  ctx.moveTo(w, 0);
  ctx.lineTo(w, 350);
  ctx.lineTo(w - 350, 0);
  ctx.closePath();
  ctx.fill();
  
  // Small label
  ctx.font = `700 12px ${FONT}`;
  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.6)' : CORAL;
  ctx.textAlign = 'left';
  ctx.fillText('✦  CALL FOR STORIES', 50, 80);
  
  // Large headline - dramatic
  ctx.font = `800 82px ${FONT}`;
  ctx.fillStyle = textColor;
  const hlLines = wrapText(ctx, headline.toUpperCase(), w - 100);
  let y = 200;
  hlLines.forEach(line => {
    ctx.fillText(line, 50, y);
    y += 90;
  });
  
  // Accent line
  ctx.fillStyle = isDark ? '#fff' : CORAL;
  ctx.fillRect(50, y + 10, 80, 5);
  
  // Subheadline
  ctx.font = `400 26px ${FONT}`;
  ctx.fillStyle = subtleColor;
  const subLines = wrapText(ctx, subheadline, w - 100);
  y += 60;
  subLines.forEach(line => {
    ctx.fillText(line, 50, y);
    y += 36;
  });
  
  // Tags row at bottom
  if (tags.length > 0) {
    ctx.font = `500 14px ${FONT}`;
    let tx = 50;
    const ty = h - 130;
    tags.slice(0, 3).forEach((tag) => {
      const tw = ctx.measureText(tag).width + 28;
      ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.15)';
      ctx.lineWidth = 1.5;
      roundRect(ctx, tx, ty, tw, 38, 19);
      ctx.stroke();
      ctx.fillStyle = subtleColor;
      ctx.fillText(tag, tx + 14, ty + 25);
      tx += tw + 12;
    });
  }
  
  // CTA arrow
  ctx.font = `400 36px ${FONT}`;
  ctx.fillStyle = textColor;
  ctx.textAlign = 'right';
  ctx.fillText('→', w - 50, h - 50);
  
  ctx.textAlign = 'start';
}

function renderCallForReviewers(ctx: CanvasRenderingContext2D, w: number, h: number, headline: string, description: string, benefits: string[], bg: BackgroundVariant) {
  const isDark = bg === 'coral' || bg === 'black' || bg === 'teal';
  drawBackground(ctx, w, h, bg);
  
  const textColor = isDark ? '#FFFFFF' : CHARCOAL;
  const subtleColor = isDark ? 'rgba(255,255,255,0.7)' : '#666';
  const accentColor = isDark ? '#FFFFFF' : CORAL;
  
  // Side accent bar
  ctx.fillStyle = accentColor;
  ctx.fillRect(0, 150, 6, 500);
  
  // Icon circle
  ctx.beginPath();
  ctx.arc(100, 100, 40, 0, Math.PI * 2);
  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(255,90,95,0.12)';
  ctx.fill();
  ctx.font = `400 32px ${FONT}`;
  ctx.fillStyle = accentColor;
  ctx.textAlign = 'center';
  ctx.fillText('✋', 100, 112);
  
  // Label
  ctx.font = `700 12px ${FONT}`;
  ctx.fillStyle = subtleColor;
  ctx.textAlign = 'left';
  ctx.fillText('JOIN THE TEAM', 160, 108);
  
  // Headline
  ctx.font = `700 64px ${FONT}`;
  ctx.fillStyle = textColor;
  const hlLines = wrapText(ctx, headline, w - 80);
  let y = 240;
  hlLines.forEach(line => {
    ctx.fillText(line, 40, y);
    y += 72;
  });
  
  // Description
  ctx.font = `400 22px ${FONT}`;
  ctx.fillStyle = subtleColor;
  const descLines = wrapText(ctx, description, w - 80);
  y += 15;
  descLines.forEach(line => {
    ctx.fillText(line, 40, y);
    y += 30;
  });
  
  // Benefits with checkmarks
  y += 40;
  ctx.font = `500 20px ${FONT}`;
  benefits.slice(0, 4).forEach((benefit) => {
    // Checkmark circle
    ctx.beginPath();
    ctx.arc(60, y - 6, 14, 0, Math.PI * 2);
    ctx.fillStyle = accentColor;
    ctx.fill();
    ctx.font = `700 12px ${FONT}`;
    ctx.fillStyle = isDark ? CHARCOAL : '#fff';
    ctx.textAlign = 'center';
    ctx.fillText('✓', 60, y - 2);
    
    ctx.font = `500 20px ${FONT}`;
    ctx.fillStyle = textColor;
    ctx.textAlign = 'left';
    ctx.fillText(benefit, 90, y);
    y += 46;
  });
  
  ctx.textAlign = 'start';
}

function renderStatCard(ctx: CanvasRenderingContext2D, w: number, h: number, statNumber: string, statLabel: string, description: string, bg: BackgroundVariant) {
  const isDark = bg === 'coral' || bg === 'black' || bg === 'teal';
  drawBackground(ctx, w, h, bg);
  
  const textColor = isDark ? '#FFFFFF' : CHARCOAL;
  const subtleColor = isDark ? 'rgba(255,255,255,0.6)' : '#888';
  const accentColor = isDark ? '#FFFFFF' : CORAL;
  
  // Decorative circles
  ctx.beginPath();
  ctx.arc(w - 100, 150, 180, 0, Math.PI * 2);
  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,90,95,0.05)';
  ctx.fill();
  
  ctx.beginPath();
  ctx.arc(150, h - 150, 120, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.textAlign = 'center';
  
  // Small label above number
  ctx.font = `700 14px ${FONT}`;
  ctx.fillStyle = accentColor;
  ctx.fillText('COMMUNITY IMPACT', w / 2, 180);
  
  // Massive number
  ctx.font = `200 280px ${FONT}`;
  ctx.fillStyle = textColor;
  ctx.fillText(statNumber, w / 2, h / 2 + 80);
  
  // Label below
  ctx.font = `700 24px ${FONT}`;
  ctx.fillStyle = textColor;
  ctx.fillText(statLabel.toUpperCase(), w / 2, h / 2 + 140);
  
  // Divider
  ctx.fillStyle = accentColor;
  ctx.fillRect(w / 2 - 40, h / 2 + 170, 80, 3);
  
  // Description
  ctx.font = `400 20px ${FONT}`;
  ctx.fillStyle = subtleColor;
  const lines = wrapText(ctx, description, w - 160);
  lines.slice(0, 2).forEach((line, i) => {
    ctx.fillText(line, w / 2, h / 2 + 220 + i * 28);
  });
  
  ctx.textAlign = 'start';
}

function renderEventPromo(ctx: CanvasRenderingContext2D, w: number, h: number, eventTitle: string, eventDate: string, eventDescription: string, bg: BackgroundVariant) {
  const isDark = bg === 'coral' || bg === 'black' || bg === 'teal';
  drawBackground(ctx, w, h, bg);
  
  const textColor = isDark ? '#FFFFFF' : CHARCOAL;
  const subtleColor = isDark ? 'rgba(255,255,255,0.7)' : '#666';
  const accentColor = isDark ? '#FFFFFF' : CORAL;
  
  // Calendar icon block
  ctx.fillStyle = accentColor;
  roundRect(ctx, 50, 50, 100, 100, 16);
  ctx.fill();
  ctx.font = `400 48px ${FONT}`;
  ctx.fillStyle = isDark ? CHARCOAL : '#fff';
  ctx.textAlign = 'center';
  ctx.fillText('📅', 100, 115);
  
  // Date badge
  ctx.fillStyle = isDark ? 'rgba(0,0,0,0.3)' : '#F5F3F0';
  roundRect(ctx, 170, 65, 200, 70, 12);
  ctx.fill();
  ctx.font = `700 16px ${FONT}`;
  ctx.fillStyle = subtleColor;
  ctx.fillText('SAVE THE DATE', 270, 95);
  ctx.font = `600 18px ${FONT}`;
  ctx.fillStyle = textColor;
  ctx.fillText(eventDate.split('•')[0]?.trim() || eventDate, 270, 120);
  
  // Large title
  ctx.font = `700 72px ${FONT}`;
  ctx.fillStyle = textColor;
  ctx.textAlign = 'left';
  const titleLines = wrapText(ctx, eventTitle, w - 100);
  let y = 280;
  titleLines.forEach(line => {
    ctx.fillText(line, 50, y);
    y += 80;
  });
  
  // Time
  const timePart = eventDate.split('•')[1]?.trim();
  if (timePart) {
    ctx.font = `500 24px ${FONT}`;
    ctx.fillStyle = accentColor;
    ctx.fillText(timePart, 50, y + 20);
    y += 50;
  }
  
  // Description
  ctx.font = `400 24px ${FONT}`;
  ctx.fillStyle = subtleColor;
  const descLines = wrapText(ctx, eventDescription, w - 100);
  y += 30;
  descLines.slice(0, 2).forEach(line => {
    ctx.fillText(line, 50, y);
    y += 34;
  });
  
  // Bottom bar with CTA
  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.1)' : '#F5F3F0';
  ctx.fillRect(0, h - 90, w, 90);
  ctx.font = `700 16px ${FONT}`;
  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.fillText('TAP TO LEARN MORE  →', w / 2, h - 45);
  
  ctx.textAlign = 'start';
}

function renderCommunitySpotlight(ctx: CanvasRenderingContext2D, w: number, h: number, memberName: string, memberStory: string, memberTags: string[], bg: BackgroundVariant) {
  const isDark = bg === 'coral' || bg === 'black' || bg === 'teal';
  drawBackground(ctx, w, h, bg);
  
  const textColor = isDark ? '#FFFFFF' : CHARCOAL;
  const subtleColor = isDark ? 'rgba(255,255,255,0.7)' : '#666';
  const accentColor = isDark ? '#FFFFFF' : CORAL;
  
  // Top banner
  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.1)' : CORAL;
  ctx.fillRect(0, 0, w, 80);
  ctx.font = `700 14px ${FONT}`;
  ctx.fillStyle = isDark ? '#fff' : '#fff';
  ctx.textAlign = 'center';
  ctx.fillText('★  COMMUNITY SPOTLIGHT  ★', w / 2, 50);
  
  // Large avatar circle with initial
  const avatarY = 230;
  ctx.beginPath();
  ctx.arc(w / 2, avatarY, 100, 0, Math.PI * 2);
  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.15)' : '#F5F3F0';
  ctx.fill();
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 4;
  ctx.stroke();
  
  const initial = memberName.charAt(0).toUpperCase();
  ctx.font = `600 72px ${FONT}`;
  ctx.fillStyle = accentColor;
  ctx.fillText(initial, w / 2, avatarY + 26);
  
  // Name
  ctx.font = `700 36px ${FONT}`;
  ctx.fillStyle = textColor;
  ctx.fillText(memberName, w / 2, avatarY + 150);
  
  // Tags
  if (memberTags.length > 0) {
    ctx.font = `500 14px ${FONT}`;
    ctx.fillStyle = subtleColor;
    ctx.fillText(memberTags.slice(0, 2).join('  ·  '), w / 2, avatarY + 185);
  }
  
  // Quote box
  const boxY = avatarY + 230;
  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.08)' : '#F8F6F4';
  roundRect(ctx, 50, boxY, w - 100, 260, 20);
  ctx.fill();
  
  // Quote mark
  ctx.font = `700 80px ${SERIF}`;
  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(255,90,95,0.15)';
  ctx.textAlign = 'left';
  ctx.fillText('"', 70, boxY + 70);
  
  // Story quote
  ctx.font = `400 italic 26px ${SERIF}`;
  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.9)' : '#444';
  ctx.textAlign = 'center';
  const lines = wrapText(ctx, memberStory, w - 160);
  lines.slice(0, 4).forEach((line, i) => {
    ctx.fillText(line, w / 2, boxY + 100 + i * 38);
  });
  
  ctx.textAlign = 'start';
}

function renderQuoteCarousel(ctx: CanvasRenderingContext2D, w: number, h: number, quote: string, slideNumber: string, totalSlides: string, bg: BackgroundVariant) {
  const isDark = bg === 'coral' || bg === 'black' || bg === 'teal';
  drawBackground(ctx, w, h, bg);
  
  const textColor = isDark ? '#FFFFFF' : CHARCOAL;
  const subtleColor = isDark ? 'rgba(255,255,255,0.4)' : '#ccc';
  const accentColor = isDark ? '#FFFFFF' : CORAL;
  
  // Frame border
  ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)';
  ctx.lineWidth = 2;
  roundRect(ctx, 40, 40, w - 80, h - 80, 24);
  ctx.stroke();
  
  ctx.textAlign = 'center';
  
  // Slide indicator dots
  const total = parseInt(totalSlides) || 5;
  const current = parseInt(slideNumber) || 1;
  const dotSpacing = 20;
  let dotX = w / 2 - ((total - 1) * dotSpacing) / 2;
  for (let i = 1; i <= total; i++) {
    ctx.beginPath();
    ctx.arc(dotX, 90, i === current ? 6 : 4, 0, Math.PI * 2);
    ctx.fillStyle = i === current ? accentColor : subtleColor;
    ctx.fill();
    dotX += dotSpacing;
  }
  
  // Giant quote marks
  ctx.font = `700 200px ${SERIF}`;
  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,90,95,0.08)';
  ctx.fillText('"', w / 2 - 300, 350);
  ctx.fillText('"', w / 2 + 200, 750);
  
  // Quote text
  const qLen = quote.length;
  const fontSize = qLen > 100 ? 42 : qLen > 60 ? 50 : 60;
  ctx.font = `500 ${fontSize}px ${SERIF}`;
  ctx.fillStyle = textColor;
  const lines = wrapText(ctx, quote, w - 160);
  const lineH = fontSize * 1.4;
  const blockH = lines.length * lineH;
  const startY = (h - blockH) / 2 + 20;
  
  lines.forEach((line, i) => {
    ctx.fillText(line, w / 2, startY + i * lineH);
  });
  
  // Branding at bottom
  ctx.font = `600 14px ${FONT}`;
  ctx.fillStyle = subtleColor;
  ctx.fillText('VITAL SIGNS', w / 2, h - 70);
  
  ctx.textAlign = 'start';
}

function renderTipOfDay(ctx: CanvasRenderingContext2D, w: number, h: number, tipTitle: string, tipContent: string, tipNumber: string, bg: BackgroundVariant) {
  const isDark = bg === 'coral' || bg === 'black' || bg === 'teal';
  drawBackground(ctx, w, h, bg);
  
  const textColor = isDark ? '#FFFFFF' : CHARCOAL;
  const subtleColor = isDark ? 'rgba(255,255,255,0.7)' : '#666';
  const accentColor = isDark ? '#FFFFFF' : CORAL;
  
  // Large number in background
  ctx.font = `900 500px ${FONT}`;
  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
  ctx.textAlign = 'right';
  ctx.fillText(tipNumber, w + 50, 500);
  
  // Lightbulb icon
  ctx.beginPath();
  ctx.arc(100, 120, 50, 0, Math.PI * 2);
  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(255,90,95,0.12)';
  ctx.fill();
  ctx.font = `400 40px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.fillText('💡', 100, 135);
  
  // Tip badge
  ctx.fillStyle = accentColor;
  roundRect(ctx, 170, 95, 100, 50, 25);
  ctx.fill();
  ctx.font = `700 18px ${FONT}`;
  ctx.fillStyle = isDark ? CHARCOAL : '#fff';
  ctx.fillText(`#${tipNumber}`, 220, 128);
  
  // Title
  ctx.font = `700 60px ${FONT}`;
  ctx.fillStyle = textColor;
  ctx.textAlign = 'left';
  const titleLines = wrapText(ctx, tipTitle, w - 100);
  let y = 290;
  titleLines.forEach(line => {
    ctx.fillText(line, 50, y);
    y += 70;
  });
  
  // Divider
  ctx.fillStyle = accentColor;
  ctx.fillRect(50, y + 10, 60, 4);
  
  // Content
  ctx.font = `400 26px ${FONT}`;
  ctx.fillStyle = subtleColor;
  const contentLines = wrapText(ctx, tipContent, w - 100);
  y += 60;
  contentLines.slice(0, 4).forEach(line => {
    ctx.fillText(line, 50, y);
    y += 38;
  });
  
  // Bottom branding
  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.1)' : '#F5F3F0';
  ctx.fillRect(0, h - 80, w, 80);
  ctx.font = `600 14px ${FONT}`;
  ctx.fillStyle = subtleColor;
  ctx.textAlign = 'center';
  ctx.fillText('VITAL SIGNS  ·  WELLNESS TIPS', w / 2, h - 40);
  
  ctx.textAlign = 'start';
}

function renderLogo(ctx: CanvasRenderingContext2D, w: number, h: number, variant: BackgroundVariant) {
  const isWhite = variant === 'white';
  const isCoral = variant === 'coral';
  
  if (isCoral) {
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#FF5A5F');
    grad.addColorStop(1, '#E54B50');
    ctx.fillStyle = grad;
  } else if (isWhite) {
    ctx.fillStyle = WARM_WHITE;
  } else {
    ctx.fillStyle = '#111111';
  }
  ctx.fillRect(0, 0, w, h);
  
  const cx = w / 2, cy = h / 2;
  const textColor = isWhite ? CHARCOAL : '#FFFFFF';
  const dotColor = isCoral ? '#FFFFFF' : CORAL;
  
  // Decorative circles
  ctx.beginPath();
  ctx.arc(cx - 200, cy - 100, 300, 0, Math.PI * 2);
  ctx.fillStyle = isWhite ? 'rgba(255,90,95,0.05)' : 'rgba(255,255,255,0.03)';
  ctx.fill();
  
  ctx.beginPath();
  ctx.arc(cx + 200, cy + 100, 200, 0, Math.PI * 2);
  ctx.fill();
  
  // Clean wordmark
  const mainSize = Math.min(w, h) > 1200 ? 88 : Math.min(w, h) > 600 ? 72 : 64;
  ctx.font = `700 ${mainSize}px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.fillStyle = textColor;
  const text = 'Vital Signs';
  ctx.fillText(text, cx, cy + 10);
  
  // Accent dot
  const tw = ctx.measureText(text).width;
  ctx.beginPath();
  ctx.arc(cx + tw / 2 + 16, cy - mainSize * 0.25, 10, 0, Math.PI * 2);
  ctx.fillStyle = dotColor;
  ctx.fill();
  
  // Tagline
  ctx.font = `400 ${mainSize * 0.24}px ${FONT}`;
  ctx.fillStyle = isWhite ? '#888' : 'rgba(255,255,255,0.6)';
  ctx.fillText('Real stories. Real health. Real people.', cx, cy + mainSize * 0.65);
  
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
        <p>Create on-brand posts for Vital Signs — exports at 3x resolution</p>
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
        .variant-btn.variant-gradient { background: linear-gradient(135deg, #fff5f3, #ffe8e5); border-color: #ffd4d1; }
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
