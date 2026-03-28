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
| Join Us | `/join` | Done |
| About | `/about` | Done |
| Sign In | `/signin` | Done |
| Admin Dashboard | `/admin` | Done |

## Authentication
- **Direct Google OAuth** via authlib (no third-party middleman)
- JWT tokens stored in localStorage
- Admin email: `curejournal@gmail.com` → `user_type: admin`
- All other users → `user_type: student`

## Features

### Post Generator (Upgraded)
- **Canvas API rendering** — pixel-perfect output, no html2canvas artifacts
- **3x resolution** downloads (3240x3240 for 1080x1080 posts) — print quality
- Live canvas preview updates in real-time
- Templates: Story Highlight, Call for Submissions, Logo
- Background variants: White, Coral, Black
- Logo sizes: Square (1080x1080), Horizontal (1920x1080), Story (1080x1920)

### Review Board Applications
- Public "Join Us" page with application form
- Fields: name, email, university, program, year, why they want to join (200 word max)
- Admin "Applications" tab with approve/reject

### Admin Dashboard
- Overview, Review Queue, Featured, Tags, Applications, Post Generator

## Key Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/google` | Initiates Google OAuth flow |
| GET | `/api/auth/google/callback` | Handles Google callback, issues JWT |
| GET | `/api/auth/me` | Get current user from JWT Bearer token |
| POST | `/api/applications` | Submit review board application (public) |
| GET | `/api/admin/applications` | List all applications (admin) |
| PUT | `/api/admin/applications/:id/status` | Approve/reject application (admin) |

## What's Implemented (as of Mar 2026)
- [x] Full frontend with mock data
- [x] Direct Google OAuth sign-in
- [x] JWT-based authentication
- [x] Admin dashboard with auth gating
- [x] Instagram Post Generator — Canvas API, 3x resolution output
- [x] 3 stories with accurate tags, no likes/resonances
- [x] Join Us page with review board application form
- [x] Admin Applications tab with approve/reject

## Backlog
- P1: Connect frontend to live backend APIs for stories CRUD
- P2: Phase 2 features from vital_signs_brief.docx
- P3: Backend refactoring (routes/models separation)
- P4: Legacy .js file cleanup
