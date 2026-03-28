# Vital Signs Design System
## Complete Brand & Code Guidelines for AI Engineers

---

## 1. BRAND IDENTITY

### 1.1 Brand Essence
- **Personality**: Premium, calm, human, trustworthy, modern
- **Inspiration**: Linear, Stripe, Vercel, Notion, YC startup landing pages
- **Avoid**: Hospital aesthetics, nonprofit/charity vibes, academic journal feel, cluttered dashboards, stock photos

### 1.2 Tagline
```
"Real stories. Real health. Real people."
```

---

## 2. COLOR PALETTE

### 2.1 Primary Colors (ONLY USE THESE)
```css
--vs-coral: #FF5A5F;      /* Primary accent, CTAs, links */
--vs-coral-hover: #E54E52; /* Hover state for coral */
--vs-white: #FFFFFF;       /* Backgrounds */
--vs-black: #111111;       /* Primary text, headings */
```

### 2.2 Opacity Variants (NO NAMED GRAYS)
```css
/* Text */
--vs-text-primary: rgba(17, 17, 17, 1);      /* Headings, important text */
--vs-text-secondary: rgba(17, 17, 17, 0.6);  /* Body text, descriptions */
--vs-text-tertiary: rgba(17, 17, 17, 0.4);   /* Captions, hints, metadata */

/* Borders */
--vs-border: rgba(17, 17, 17, 0.08);         /* Default borders */
--vs-border-hover: rgba(17, 17, 17, 0.15);   /* Hover state borders */

/* Backgrounds */
--vs-bg-subtle: rgba(17, 17, 17, 0.02);      /* Section backgrounds */
--vs-bg-hover: rgba(17, 17, 17, 0.04);       /* Hover backgrounds */
```

### 2.3 Color Usage Rules
- **Coral**: ONLY for CTAs, active states, accent dots, links
- **Black**: Headings, primary buttons (secondary style), active tags
- **White**: Page backgrounds, cards, inputs
- **Opacity variants**: All secondary/tertiary elements
- **NEVER**: Blue, teal, grey as named colors, gradients (unless nearly invisible)

---

## 3. TYPOGRAPHY

### 3.1 Font Family
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

### 3.2 Font Weights
```css
400 - Regular (body text)
500 - Medium (buttons, labels, metadata)
600 - SemiBold (subheadings, card titles)
700 - Bold (main headings, hero text)
```

### 3.3 Type Scale
```css
/* Headings */
H1: 3.5rem (56px), weight 700, letter-spacing: -0.03em, line-height: 1.05
H2: 2.25rem (36px), weight 600, letter-spacing: -0.02em, line-height: 1.2
H3: 1.5rem (24px), weight 600, letter-spacing: -0.02em, line-height: 1.2
H4: 1.25rem (20px), weight 600, letter-spacing: -0.02em, line-height: 1.2

/* Body */
Large: 1.25rem (20px), line-height: 1.7
Base: 1rem (16px), line-height: 1.6
Small: 0.9375rem (15px), line-height: 1.6
XSmall: 0.875rem (14px), line-height: 1.5
Caption: 0.8125rem (13px), line-height: 1.4
Micro: 0.75rem (12px), line-height: 1.4
```

### 3.4 Typography Rules
- **Headings**: Tight letter-spacing (-0.02em to -0.03em)
- **Body**: Default letter-spacing
- **Labels/Caps**: letter-spacing: 0.05em, text-transform: uppercase
- **Line heights**: Headings tight (1.05-1.2), body loose (1.6-1.8)

---

## 4. SPACING SYSTEM

### 4.1 Base Unit: 4px
```css
--vs-space-1: 4px;
--vs-space-2: 8px;
--vs-space-3: 12px;
--vs-space-4: 16px;
--vs-space-5: 20px;
--vs-space-6: 24px;
--vs-space-8: 32px;
--vs-space-10: 40px;
--vs-space-12: 48px;
--vs-space-16: 64px;
--vs-space-20: 80px;
--vs-space-24: 96px;
```

### 4.2 Spacing Usage
- **Component padding**: 16-24px (space-4 to space-6)
- **Section padding**: 80-96px vertical (space-20 to space-24)
- **Card padding**: 24px (space-6)
- **Button padding**: 12px 20px (space-3 space-5)
- **Input padding**: 12px 16px (space-3 space-4)
- **Gap between elements**: 8-16px (space-2 to space-4)
- **Gap between sections**: 32-48px (space-8 to space-12)

---

## 5. BORDER & RADIUS

### 5.1 Border Radius
```css
--vs-radius-sm: 6px;      /* Small elements, tags */
--vs-radius-md: 8px;      /* Buttons, inputs */
--vs-radius-lg: 12px;     /* Cards, modals */
--vs-radius-xl: 16px;     /* Large cards, hero elements */
--vs-radius-full: 9999px; /* Pills, avatars */
```

### 5.2 Border Usage
- **Default border**: 1px solid rgba(17, 17, 17, 0.08)
- **Hover border**: 1px solid rgba(17, 17, 17, 0.15)
- **Focus border**: 1px solid rgba(17, 17, 17, 0.4)
- **NEVER**: Thick borders, colored borders (except coral on active states)

---

## 6. SHADOWS

### 6.1 Shadow Scale
```css
--vs-shadow-sm: 0 1px 2px rgba(17, 17, 17, 0.04);
--vs-shadow-md: 0 2px 8px rgba(17, 17, 17, 0.06);
--vs-shadow-lg: 0 4px 16px rgba(17, 17, 17, 0.08);
--vs-shadow-hover: 0 8px 24px rgba(17, 17, 17, 0.1);
```

### 6.2 Shadow Usage
- **Default cards**: No shadow or shadow-sm
- **Hover cards**: shadow-md to shadow-lg with slight translateY(-2px)
- **Dropdowns/Modals**: shadow-lg
- **NEVER**: Heavy shadows, colored shadows

---

## 7. ANIMATION & TRANSITIONS

### 7.1 Transition Speeds
```css
--vs-transition-fast: 150ms ease;
--vs-transition-base: 200ms ease;
--vs-transition-slow: 300ms ease;
```

### 7.2 Framer Motion Patterns
```jsx
// Fade up on scroll
initial={{ opacity: 0, y: 20 }}
whileInView={{ opacity: 1, y: 0 }}
viewport={{ once: true }}
transition={{ duration: 0.5 }}

// Stagger children
transition={{ duration: 0.4, delay: index * 0.1 }}

// Button tap
whileTap={{ scale: 0.95 }}

// Pulse effect
animate={{ scale: [1, 1.3, 1] }}
transition={{ duration: 0.3 }}
```

### 7.3 Animation Rules
- **Subtle only**: Never flashy or attention-grabbing
- **Purpose**: Guide attention, provide feedback
- **Duration**: 150-500ms max
- **Easing**: ease or ease-out (never bounce)

---

## 8. COMPONENT PATTERNS

### 8.1 Buttons
```css
/* Primary (Coral) */
.btn-primary {
  background: #FF5A5F;
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 15px;
  border: none;
  transition: all 150ms ease;
}
.btn-primary:hover {
  background: #E54E52;
  transform: translateY(-1px);
}

/* Secondary (Outline) */
.btn-secondary {
  background: transparent;
  color: rgba(17, 17, 17, 1);
  border: 1px solid rgba(17, 17, 17, 0.08);
  /* Same padding/radius as primary */
}
.btn-secondary:hover {
  border-color: rgba(17, 17, 17, 0.15);
  background: rgba(17, 17, 17, 0.04);
}

/* Ghost (Text only) */
.btn-ghost {
  background: transparent;
  color: rgba(17, 17, 17, 0.6);
  border: none;
}
.btn-ghost:hover {
  color: rgba(17, 17, 17, 1);
  background: rgba(17, 17, 17, 0.04);
}
```

### 8.2 Cards
```css
.card {
  background: white;
  border: 1px solid rgba(17, 17, 17, 0.08);
  border-radius: 12px;
  padding: 24px;
  transition: all 200ms ease;
}
.card:hover {
  border-color: rgba(17, 17, 17, 0.15);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(17, 17, 17, 0.1);
}
```

### 8.3 Tags/Pills
```css
.tag {
  display: inline-flex;
  padding: 4px 12px;
  font-size: 13px;
  font-weight: 500;
  color: rgba(17, 17, 17, 0.6);
  background: rgba(17, 17, 17, 0.02);
  border: 1px solid rgba(17, 17, 17, 0.08);
  border-radius: 9999px;
}
.tag.active {
  background: #111111;
  color: white;
  border-color: #111111;
}
```

### 8.4 Inputs
```css
.input {
  width: 100%;
  padding: 12px 16px;
  font-size: 15px;
  color: rgba(17, 17, 17, 1);
  background: white;
  border: 1px solid rgba(17, 17, 17, 0.08);
  border-radius: 8px;
}
.input:focus {
  outline: none;
  border-color: rgba(17, 17, 17, 0.4);
}
.input::placeholder {
  color: rgba(17, 17, 17, 0.4);
}
```

---

## 9. LAYOUT PATTERNS

### 9.1 Container
```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}
.container-sm { max-width: 720px; }
.container-md { max-width: 900px; }
```

### 9.2 Grid Patterns
```css
/* 3-column cards */
grid-template-columns: repeat(3, 1fr);
gap: 24px;

/* 2-column cards */
grid-template-columns: repeat(2, 1fr);
gap: 24px;

/* Responsive */
@media (max-width: 1024px) { repeat(2, 1fr) }
@media (max-width: 768px) { 1fr }
```

### 9.3 Section Spacing
```css
.section {
  padding: 80px 0;
}
.section-lg {
  padding: 96px 0;
}
/* Mobile */
@media (max-width: 768px) {
  .section { padding: 48px 0; }
  .section-lg { padding: 64px 0; }
}
```

---

## 10. LOGO SPECIFICATION

### 10.1 Text Logo
```
"Vital Signs" + coral dot

- Font: Inter SemiBold (600)
- Color: #111111 (black)
- Dot color: #FF5A5F (coral)
- Tracking: -0.02em
```

### 10.2 Logo Variants
```jsx
// Standard
<span style={{ fontWeight: 600, color: '#111111' }}>
  Vital Signs<span style={{ color: '#FF5A5F' }}>.</span>
</span>

// Inverted (on dark backgrounds)
<span style={{ fontWeight: 600, color: '#FFFFFF' }}>
  Vital Signs<span style={{ color: '#FF5A5F' }}>.</span>
</span>
```

---

## 11. ICONOGRAPHY

### 11.1 Icon Library
Use **Lucide React** icons exclusively.

### 11.2 Icon Sizing
```
Small: 16px (inline with text)
Medium: 18-20px (buttons, navigation)
Large: 24px (section icons)
XLarge: 32-48px (hero/feature icons)
```

### 11.3 Icon Colors
- Default: rgba(17, 17, 17, 0.6) or rgba(17, 17, 17, 0.4)
- Active/Accent: #FF5A5F
- On dark: white or rgba(255, 255, 255, 0.7)

---

## 12. RESPONSIVE BREAKPOINTS

```css
/* Mobile first approach */
@media (min-width: 640px)  { /* sm */ }
@media (min-width: 768px)  { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
```

### Mobile Adjustments:
- H1: 2.5rem (40px) instead of 3.5rem
- H2: 1.75rem (28px) instead of 2.25rem
- Container padding: 16px instead of 24px
- Section padding: 48-64px instead of 80-96px
- Single column layouts
- Stack buttons vertically

---

## 13. DO'S AND DON'TS

### DO:
✅ Use generous whitespace
✅ Keep UI minimal and clean
✅ Use typography as primary hierarchy
✅ Apply subtle animations
✅ Maintain consistent spacing
✅ Use coral sparingly (CTAs only)

### DON'T:
❌ Use stock photos
❌ Add decorative illustrations
❌ Use gradients (unless barely visible)
❌ Use grey as a named color
❌ Use blue, teal, or health-tech colors
❌ Add excessive shadows
❌ Use overly rounded UI (childish)
❌ Use glassmorphism or neumorphism
❌ Clutter layouts

---

## 14. CODE ORGANIZATION

```
src/
├── styles/
│   └── design-system.css    # All CSS variables and base styles
├── components/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── StoryCard.tsx
│   ├── TagPill.tsx
│   ├── ResonanceButton.tsx
│   ├── SearchInput.tsx
│   ├── SortDropdown.tsx
│   ├── FilterBar.tsx
│   ├── StatCard.tsx
│   ├── CTASection.tsx
│   ├── SectionHeader.tsx
│   ├── StoryMeta.tsx
│   └── ContentWarningBanner.tsx
├── pages/
│   ├── HomePage.tsx
│   ├── StoriesPage.tsx
│   ├── StoryDetailPage.tsx
│   ├── SubmitStoryPage.tsx
│   ├── AboutPage.tsx
│   ├── SignInPage.tsx
│   └── AdminPage.tsx
└── data/
    └── mockData.ts
```

---

This design system ensures consistency across all Vital Signs products and can be used by any AI engineer to create on-brand experiences.
