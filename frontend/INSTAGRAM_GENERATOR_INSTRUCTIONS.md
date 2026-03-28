# Instagram Post Generator - Build Instructions
## For AI Engineers

---

## OVERVIEW

Build a web-based Instagram post generator for Vital Signs that creates:
1. **Story Highlight Posts** - Feature community stories
2. **Call for Submissions** - Announce submission requests
3. **Logo Generator** - Create brand logos

All posts must be downloadable as PNG files.

---

## TECH STACK

- React + TypeScript
- html2canvas (for PNG export)
- Tailwind CSS (optional) or CSS-in-JS
- Framer Motion (subtle animations in preview)

---

## DESIGN SPECIFICATIONS

### Colors (ONLY THESE)
```css
--coral: #FF5A5F;
--white: #FFFFFF;
--black: #111111;
--text-secondary: rgba(17, 17, 17, 0.6);
--text-tertiary: rgba(17, 17, 17, 0.4);
```

### Typography
- Font: Inter (Google Fonts)
- Weights: 400, 500, 600, 700
- Letter-spacing for headings: -0.02em to -0.03em

### Logo
```jsx
<span style={{ fontWeight: 600, letterSpacing: '-0.02em' }}>
  Vital Signs<span style={{ color: '#FF5A5F' }}>.</span>
</span>
```

---

## POST TEMPLATES

### Template 1: Story Highlight (1080x1080)
```
┌────────────────────────────────┐
│                                │
│  ╭─────────────────────────╮   │
│  │                         │   │
│  │   [Optional Tag Pills]  │   │
│  │                         │   │
│  │   "Story Quote or       │   │
│  │    Title Here"          │   │
│  │                         │   │
│  │   — Author or Anonymous │   │
│  │                         │   │
│  ╰─────────────────────────╯   │
│                                │
│         Vital Signs.           │
│    vitalsigns.ca/stories       │
└────────────────────────────────┘
```

**Layout Details:**
- Background: White (#FFFFFF)
- Quote card: Centered, white with subtle border
- Quote text: 32-48px, Inter SemiBold, #111111
- Author: 18px, Inter Medium, rgba(17,17,17,0.6)
- Tags: Coral pills at top of quote card
- Logo: Bottom center, 20px
- URL: Below logo, 14px, rgba(17,17,17,0.4)

### Template 2: Story Highlight with Photo Background (1080x1080)
```
┌────────────────────────────────┐
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│  ░░░ GRADIENT OVERLAY ░░░░░░░  │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│                                │
│      [Tag Pills - White]       │
│                                │
│      "Story Quote"             │
│                                │
│      — Author                  │
│                                │
│         Vital Signs.           │
│    (logo in white)             │
└────────────────────────────────┘
```

**Layout Details:**
- Background: User-uploaded image with dark gradient overlay
- Gradient: linear-gradient(to bottom, rgba(17,17,17,0.3), rgba(17,17,17,0.8))
- All text: White (#FFFFFF)
- Tags: White border pills

### Template 3: Call for Submissions (1080x1080)
```
┌────────────────────────────────┐
│                                │
│         Vital Signs.           │
│                                │
│   ━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                │
│      CALL FOR                  │
│      SUBMISSIONS               │
│                                │
│   ━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                │
│   "Share your story with       │
│    our community"              │
│                                │
│   [Topic] [Topic] [Topic]      │
│                                │
│   Submit at vitalsigns.ca      │
└────────────────────────────────┘
```

**Layout Details:**
- Background: Solid coral (#FF5A5F) or white
- "Call for Submissions": Large, bold, uppercase
- If coral bg: White text
- If white bg: Black text with coral accents
- Topic pills showing accepted themes

### Template 4: Logo Only (Various Sizes)
```
Options:
- Square (1080x1080) - for profile pics
- Horizontal (1920x1080) - for banners
- Vertical (1080x1920) - for stories

Variants:
- Black text, coral dot on white
- White text, coral dot on black
- White text, coral dot on coral
```

---

## COMPONENT STRUCTURE

```
InstagramGenerator/
├── components/
│   ├── PostCanvas.tsx       # The actual post being designed
│   ├── TemplateSelector.tsx # Choose template type
│   ├── TextEditor.tsx       # Edit quote, author, etc.
│   ├── TagSelector.tsx      # Select topic tags
│   ├── ColorPicker.tsx      # Choose background variant
│   ├── ImageUploader.tsx    # For photo backgrounds
│   ├── LogoPreview.tsx      # Logo generator
│   └── DownloadButton.tsx   # Export as PNG
├── templates/
│   ├── StoryHighlight.tsx
│   ├── StoryHighlightPhoto.tsx
│   ├── CallForSubmissions.tsx
│   └── LogoTemplate.tsx
└── utils/
    └── downloadPng.ts       # html2canvas export logic
```

---

## KEY IMPLEMENTATION DETAILS

### PNG Export Function
```typescript
import html2canvas from 'html2canvas';

export const downloadPng = async (
  elementId: string, 
  filename: string = 'vital-signs-post'
) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  const canvas = await html2canvas(element, {
    scale: 2,  // 2x for high resolution
    useCORS: true,
    backgroundColor: null,
  });

  const link = document.createElement('a');
  link.download = `${filename}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
};
```

### Post Canvas Base
```tsx
interface PostCanvasProps {
  width: number;   // 1080 for square
  height: number;  // 1080 for square, 1920 for story
  children: React.ReactNode;
}

const PostCanvas: React.FC<PostCanvasProps> = ({ width, height, children }) => {
  // Scale down for preview (e.g., 400px wide)
  const scale = 400 / width;
  
  return (
    <div
      style={{
        width: width * scale,
        height: height * scale,
        overflow: 'hidden',
      }}
    >
      <div
        id="post-canvas"
        style={{
          width,
          height,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          // ... other styles
        }}
      >
        {children}
      </div>
    </div>
  );
};
```

### Story Highlight Template
```tsx
interface StoryHighlightProps {
  quote: string;
  author: string;
  isAnonymous: boolean;
  tags: string[];
  variant: 'white' | 'minimal';
}

const StoryHighlight: React.FC<StoryHighlightProps> = ({
  quote,
  author,
  isAnonymous,
  tags,
  variant,
}) => {
  return (
    <div style={{
      width: 1080,
      height: 1080,
      background: '#FFFFFF',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 80,
      fontFamily: 'Inter, sans-serif',
    }}>
      {/* Quote Card */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid rgba(17,17,17,0.08)',
        borderRadius: 24,
        padding: 60,
        maxWidth: 800,
        textAlign: 'center',
      }}>
        {/* Tags */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 24 }}>
          {tags.map(tag => (
            <span key={tag} style={{
              background: 'rgba(255,90,95,0.1)',
              color: '#FF5A5F',
              padding: '6px 16px',
              borderRadius: 9999,
              fontSize: 14,
              fontWeight: 500,
            }}>
              {tag}
            </span>
          ))}
        </div>

        {/* Quote */}
        <p style={{
          fontSize: 36,
          fontWeight: 600,
          color: '#111111',
          lineHeight: 1.4,
          letterSpacing: '-0.02em',
          marginBottom: 24,
        }}>
          "{quote}"
        </p>

        {/* Author */}
        <p style={{
          fontSize: 18,
          fontWeight: 500,
          color: 'rgba(17,17,17,0.6)',
        }}>
          — {isAnonymous ? 'Anonymous' : author}
        </p>
      </div>

      {/* Logo */}
      <div style={{ marginTop: 60, textAlign: 'center' }}>
        <p style={{
          fontSize: 20,
          fontWeight: 600,
          color: '#111111',
          letterSpacing: '-0.02em',
        }}>
          Vital Signs<span style={{ color: '#FF5A5F' }}>.</span>
        </p>
        <p style={{
          fontSize: 14,
          color: 'rgba(17,17,17,0.4)',
          marginTop: 8,
        }}>
          vitalsigns.ca/stories
        </p>
      </div>
    </div>
  );
};
```

### Call for Submissions Template
```tsx
interface CallForSubmissionsProps {
  headline?: string;
  subheadline?: string;
  topics: string[];
  variant: 'coral' | 'white' | 'black';
}

const CallForSubmissions: React.FC<CallForSubmissionsProps> = ({
  headline = 'Call for Submissions',
  subheadline = 'Share your story with our community',
  topics,
  variant,
}) => {
  const bgColor = {
    coral: '#FF5A5F',
    white: '#FFFFFF',
    black: '#111111',
  }[variant];

  const textColor = variant === 'white' ? '#111111' : '#FFFFFF';
  const accentColor = variant === 'coral' ? '#FFFFFF' : '#FF5A5F';

  return (
    <div style={{
      width: 1080,
      height: 1080,
      background: bgColor,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 80,
      fontFamily: 'Inter, sans-serif',
    }}>
      {/* Logo */}
      <p style={{
        fontSize: 24,
        fontWeight: 600,
        color: textColor,
        marginBottom: 60,
      }}>
        Vital Signs<span style={{ color: accentColor }}>.</span>
      </p>

      {/* Divider */}
      <div style={{
        width: 200,
        height: 2,
        background: variant === 'white' 
          ? 'rgba(17,17,17,0.1)' 
          : 'rgba(255,255,255,0.3)',
        marginBottom: 60,
      }} />

      {/* Headline */}
      <h1 style={{
        fontSize: 72,
        fontWeight: 700,
        color: textColor,
        textTransform: 'uppercase',
        letterSpacing: '-0.02em',
        textAlign: 'center',
        lineHeight: 1.1,
        marginBottom: 40,
      }}>
        {headline}
      </h1>

      {/* Subheadline */}
      <p style={{
        fontSize: 24,
        color: variant === 'white' 
          ? 'rgba(17,17,17,0.6)' 
          : 'rgba(255,255,255,0.8)',
        textAlign: 'center',
        marginBottom: 40,
      }}>
        "{subheadline}"
      </p>

      {/* Topics */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        {topics.map(topic => (
          <span key={topic} style={{
            border: `1px solid ${variant === 'white' ? 'rgba(17,17,17,0.1)' : 'rgba(255,255,255,0.3)'}`,
            color: textColor,
            padding: '8px 20px',
            borderRadius: 9999,
            fontSize: 16,
            fontWeight: 500,
          }}>
            {topic}
          </span>
        ))}
      </div>

      {/* CTA */}
      <p style={{
        fontSize: 18,
        fontWeight: 500,
        color: textColor,
        marginTop: 60,
      }}>
        Submit at vitalsigns.ca
      </p>
    </div>
  );
};
```

---

## UI/UX REQUIREMENTS

### Editor Interface
1. **Left Panel**: Template selection, variant picker
2. **Center**: Live preview of post (scaled down)
3. **Right Panel**: Text editors, tag selectors
4. **Bottom**: Download button (prominent, coral)

### Form Fields by Template

**Story Highlight:**
- Quote text (textarea, max 200 chars)
- Author name (text input)
- Anonymous toggle (checkbox)
- Tags (multi-select from predefined list)
- Variant (white card / minimal)

**Call for Submissions:**
- Headline (text, default "Call for Submissions")
- Subheadline (text, default "Share your story...")
- Topics to highlight (multi-select)
- Background variant (coral / white / black)

**Logo:**
- Size (square / horizontal / vertical)
- Variant (light / dark / coral bg)

---

## PREDEFINED OPTIONS

### Health Topics
```typescript
const TOPICS = [
  'Mental Health',
  'Chronic Illness',
  'Disability',
  'Caregiving',
  'Surgical Experience',
  'Addiction & Recovery',
  'Reproductive Health',
  'Rare Disease',
  'Other',
];
```

### Post Sizes
```typescript
const SIZES = {
  square: { width: 1080, height: 1080 },
  story: { width: 1080, height: 1920 },
  landscape: { width: 1920, height: 1080 },
};
```

---

## QUALITY CHECKLIST

- [ ] Inter font loads correctly (use Google Fonts)
- [ ] Colors match exactly (#FF5A5F, #111111, #FFFFFF)
- [ ] PNG exports at 2x resolution (2160x2160 for square)
- [ ] Text is crisp and well-spaced
- [ ] Logo includes coral dot
- [ ] Preview scales correctly in editor
- [ ] All interactive elements have hover states
- [ ] Mobile responsive editor (optional)

---

This document provides everything needed to build a brand-consistent Instagram post generator for Vital Signs.
