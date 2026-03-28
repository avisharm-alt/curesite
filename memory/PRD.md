# Vital Signs - Product Requirements Document

## Product Overview
**Vital Signs** is a digital health storytelling platform where users share authentic health experiences. Think YC-startup quality frontend with polished UI/UX.

**Tagline**: Real stories. Real health. Real people.

## Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: FastAPI, MongoDB (Motor async driver)
- **Auth**: Emergent managed Google OAuth
- **Hosting**: Preview on Emergent platform

## Core Pages
| Page | Route | Status |
|------|-------|--------|
| Home | `/` | Done |
| Stories | `/stories` | Done |
| Story Detail | `/stories/:id` | Done |
| Submit Story | `/submit` | Done |
| About | `/about` | Done |
| Sign In | `/signin` | Done |
| Admin Dashboard | `/admin` | Done |

## Authentication
- Emergent managed Google OAuth via `https://auth.emergentagent.com/`
- Session-based auth with httpOnly cookies
- Admin email: `curejournal@gmail.com` (gets `user_type: admin`)
- All other users get `user_type: student`
- Admin dashboard restricted to admin users only
- Post Generator tab restricted to `curejournal@gmail.com`

## Current Data
- **3 featured stories** with full body content (mock data)
- **4 topic tags**: Mental Health (3), Chronic Illness (1), Caregiving (1), Addiction & Recovery (1)
- Tag counts accurately reflect story content
- Likes/resonances removed from the app

## Key Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/me` | Get current user (cookie/bearer) |
| POST | `/api/auth/session` | Exchange Emergent session_id |
| POST | `/api/auth/signout` | Logout + clear cookie |
| GET | `/health` | Health check |

## What's Implemented (as of Feb 2026)
- [x] Full frontend with mock data (Home, Stories, Detail, Submit, About, Admin)
- [x] Emergent Google OAuth sign-in flow
- [x] Session-based authentication with cookie storage
- [x] Admin dashboard with auth gating
- [x] Instagram Post & Logo Generator (admin only, curejournal@gmail.com)
- [x] 3 stories with accurate tags, no likes/resonances
- [x] Responsive design with Framer Motion animations

## Backlog
- P1: Connect frontend to live backend APIs for stories CRUD
- P2: Phase 2 features from vital_signs_brief.docx
- P3: Backend refactoring (routes/models separation)
- P4: Legacy .js file cleanup
