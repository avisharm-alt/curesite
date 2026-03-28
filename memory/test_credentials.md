# Test Credentials

## Google OAuth (Direct - No Middleman)
- **Client ID**: 492483192809-ktal7sbtjgvqn6fp1cmp1ebkdjpkrg7g.apps.googleusercontent.com
- **Admin email**: curejournal@gmail.com (gets `user_type: admin`)
- **Regular users**: any Google account (gets `user_type: student`)

## Auth Flow
1. "Continue with Google" → `/api/auth/google` → Google OAuth → callback → frontend with `?token=JWT&user=...`
2. JWT stored in `localStorage` as `token` key
3. User data stored in `localStorage` as `user` key

## JWT Secret
- `fallback_secret_key` (from `os.environ.get('JWT_SECRET_KEY', 'fallback_secret_key')`)

## Test JWT Tokens (for automated testing)
- **Student**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0LWp3dC11c2VyIiwiZXhwIjoxNzc1MzM4MDQxfQ.bnhydGXBB8PSSUA4EfMEnCzH-i_msVK3Ql4EwToVDWc`
  - email: test@example.com, user_type: student
- **Admin**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbi1qd3QtdXNlciIsImV4cCI6MTc3NTMzODA0MX0.ZO13KQirWv6nxp8xckscnxdl8jJQFk-v_P9wbgD7pEo`
  - email: curejournal@gmail.com, user_type: admin

## Important: Google Console Setup
User must add this authorized redirect URI in Google Cloud Console:
`https://signin-integration-1.preview.emergentagent.com/api/auth/google/callback`
