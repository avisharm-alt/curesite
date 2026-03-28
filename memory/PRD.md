# Vital Signs - Product Requirements Document

## Product Overview
**Vital Signs** is a digital health storytelling platform where users share authentic health experiences.

**Tagline**: Real stories. Real health. Real people.

## Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: FastAPI, MongoDB (Motor async driver)
- **Auth**: Direct Google OAuth (authlib) → JWT tokens in localStorage
- **Hosting**: Preview on Emergent platform

## Core Pages
| Page | Route | Status |
|------|-------|--------|
| Home | `/` | Done |
| Stories | `/stories` | Done |
| Story Detail | `/stories/:id` | Done |
| Submit Story | `/submit` | Done (mock) |
| About | `/about` | Done |
| Sign In | `/signin` | Done |
| Admin Dashboard | `/admin` | Done |

## Authentication
- **Direct Google OAuth** via authlib (no third-party middleman)
- JWT tokens stored in localStorage
- Google Client ID: `492483192809-ktal7sbtjgvqn6fp1cmp1ebkdjpkrg7g.apps.googleusercontent.com`
- Admin email: `curejournal@gmail.com` → `user_type: admin`
- All other users → `user_type: student`
- Admin dashboard restricted to admin users only
- Post Generator tab restricted to `curejournal@gmail.com` specifically

## Current Data
- **3 featured stories** with full body content (mock data)
- **4 topic tags**: Mental Health (3), Chronic Illness (1), Caregiving (1), Addiction & Recovery (1)
- Tag counts accurately reflect story content
- Likes/resonances completely removed

## Key Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/google` | Initiates Google OAuth flow |
| GET | `/api/auth/google/callback` | Handles Google callback, issues JWT |
| GET | `/api/auth/me` | Get current user from JWT Bearer token |
| POST | `/api/auth/logout` | Logout |
| GET | `/health` | Health check |

## What's Implemented (as of Feb 2026)
- [x] Full frontend with mock data (Home, Stories, Detail, Submit, About, Admin)
- [x] Direct Google OAuth sign-in (no middleman)
- [x] JWT-based authentication with localStorage
- [x] Admin dashboard with auth gating (admin only)
- [x] Instagram Post & Logo Generator (admin only, curejournal@gmail.com)
- [x] 3 stories with accurate tags, no likes/resonances
- [x] Responsive design with Framer Motion animations

## Backlog
- P1: Connect frontend to live backend APIs for stories CRUD
- P2: Phase 2 features from vital_signs_brief.docx
- P3: Backend refactoring (routes/models separation)
- P4: Legacy .js file cleanup

## Google Console Note
The preview redirect URI must be added to Google Cloud Console:
`https://vital-admin-stage.preview.emergentagent.com/api/auth/google/callback`
