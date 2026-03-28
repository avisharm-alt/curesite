# Test Credentials

## Google Auth (Emergent Managed)
- Admin email: curejournal@gmail.com (gets admin access)
- Regular users: any Google account (gets student access)

## Auth Flow
- Uses Emergent managed Google OAuth
- Sign in redirects to: https://auth.emergentagent.com/
- After auth, user returns to app with session_id in URL hash
- Backend exchanges session_id for session_token cookie

## Mock/Test Session Creation
To create a test session for automated testing:
```
mongosh --eval "
use('cure_db');
var userId = 'test-user-123';
var sessionToken = 'test_session_token_123';
db.users.updateOne({id: userId}, {\$set: {id: userId, email: 'test@example.com', name: 'Test User', user_type: 'student', created_at: new Date()}}, {upsert: true});
db.user_sessions.updateOne({session_token: sessionToken}, {\$set: {user_id: userId, session_token: sessionToken, expires_at: new Date(Date.now() + 7*24*60*60*1000).toISOString(), created_at: new Date().toISOString()}}, {upsert: true});
"
```

## Admin Test Session
```
mongosh --eval "
use('cure_db');
var userId = 'admin-user-123';
var sessionToken = 'admin_session_token_123';
db.users.updateOne({id: userId}, {\$set: {id: userId, email: 'curejournal@gmail.com', name: 'CURE Admin', user_type: 'admin', created_at: new Date()}}, {upsert: true});
db.user_sessions.updateOne({session_token: sessionToken}, {\$set: {user_id: userId, session_token: sessionToken, expires_at: new Date(Date.now() + 7*24*60*60*1000).toISOString(), created_at: new Date().toISOString()}}, {upsert: true});
"
```
