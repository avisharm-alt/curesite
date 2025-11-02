from fastapi import FastAPI, APIRouter, HTTPException, Depends, File, UploadFile, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import JSONResponse, RedirectResponse, FileResponse, StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorGridFSBucket
from authlib.integrations.starlette_client import OAuth
import os
import logging
from pathlib import Path
import shutil
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import jwt
from passlib.context import CryptContext
import secrets
from urllib.parse import quote
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest
import io

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection with fallbacks for development
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db_name = os.environ.get('DB_NAME', 'cure_db')
db = client[db_name]
fs = AsyncIOMotorGridFSBucket(db)

# Log connection info (without sensitive data)
print(f"📊 Connecting to database: {db_name}")
print(f"🔗 MongoDB host: {mongo_url.split('@')[-1] if '@' in mongo_url else mongo_url}")

# Security
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'fallback_secret_key')
ALGORITHM = os.environ.get('JWT_ALGORITHM', 'HS256')
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Stripe Payment Configuration
STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY')
STRIPE_PUBLISHABLE_KEY = os.environ.get('STRIPE_PUBLISHABLE_KEY')
POSTER_PUBLICATION_FEE = 10.00  # Fixed fee in CAD for poster publication

if STRIPE_API_KEY:
    print("✅ Stripe configured with live keys")
else:
    print("⚠️  Stripe not configured - set STRIPE_API_KEY")

# OAuth Setup with environment checks
oauth = OAuth()

# Only register OAuth if credentials are provided
google_client_id = os.environ.get('GOOGLE_CLIENT_ID')
google_client_secret = os.environ.get('GOOGLE_CLIENT_SECRET')

if google_client_id and google_client_secret:
    oauth.register(
        name='google',
        client_id=google_client_id,
        client_secret=google_client_secret,
        server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
        client_kwargs={
            'scope': 'openid email profile'
        }
    )
    print("✅ Google OAuth configured")
else:
    print("⚠️  Google OAuth not configured - set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET")

# Create the main app
app = FastAPI(title="CURE - Canadian Undergraduate Research Exchange")

# Add session middleware
app.add_middleware(SessionMiddleware, secret_key=secrets.token_urlsafe(32))

# Add CORS middleware for deployment
allowed_origins = [
    "http://localhost:3000",  # Local development
    "https://localhost:3000",  # Local development HTTPS
    "https://curesite-olive.vercel.app",  # Production Vercel frontend
    "https://cureproject.ca",  # Custom domain
    "http://cureproject.ca",  # Custom domain HTTP (redirects to HTTPS)
    "https://www.cureproject.ca",  # Custom domain with www
    "http://www.cureproject.ca",  # Custom domain with www HTTP
    "https://curesite-production.up.railway.app",  # Production Railway backend
]

# Add any additional frontend URL from environment
if os.environ.get("FRONTEND_URL"):
    allowed_origins.append(os.environ.get("FRONTEND_URL"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Health check endpoint for Railway
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "CURE Backend"}

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str
    profile_picture: Optional[str] = None
    university: Optional[str] = None
    program: Optional[str] = None
    year: Optional[int] = None
    user_type: str = "student"  # student, professor, admin
    verified: bool = False
    # Social fields
    role: str = "student"  # student, professor, lab (for CURE Social)
    bio: Optional[str] = None
    interests: List[str] = []
    links: Dict[str, str] = {}  # {"website": "...", "twitter": "...", "orcid": "..."}
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    email: EmailStr
    name: str
    profile_picture: Optional[str] = None
    university: Optional[str] = None
    program: Optional[str] = None
    year: Optional[int] = None
    user_type: Optional[str] = None

class UserUpdate(BaseModel):
    name: Optional[str] = None
    profile_picture: Optional[str] = None
    university: Optional[str] = None
    program: Optional[str] = None
    year: Optional[int] = None

class PosterSubmission(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    authors: List[str]
    abstract: str
    keywords: List[str]
    university: str
    program: str
    poster_url: Optional[str] = None
    contact_email: str  # Submitter's contact email
    submitted_by: str  # user_id
    status: str = "pending"  # pending, approved, rejected
    submitted_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    reviewed_at: Optional[datetime] = None
    reviewer_id: Optional[str] = None
    reviewer_comments: Optional[str] = None
    payment_status: str = "not_required"  # not_required, pending, completed
    payment_link: Optional[str] = None
    stripe_session_id: Optional[str] = None
    payment_completed_at: Optional[datetime] = None

class PosterSubmissionCreate(BaseModel):
    title: str
    authors: List[str]
    abstract: str
    keywords: List[str]
    university: str
    program: str
    poster_url: Optional[str] = None
    contact_email: str


# Journal Article Models
class JournalArticle(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    cure_identifier: Optional[str] = None  # e.g., CURE.2024.001
    title: str
    authors: str  # Comma-separated author names
    abstract: str
    keywords: Optional[str] = None  # Comma-separated keywords
    university: str
    program: str
    article_type: str = "research"  # research, review, case_study
    pdf_url: Optional[str] = None
    contact_email: str  # Submitter's contact email
    submitted_by: str  # user_id
    status: str = "pending"  # pending, published, rejected
    submitted_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    reviewed_at: Optional[datetime] = None
    reviewer_id: Optional[str] = None
    reviewer_comments: Optional[str] = None
    payment_status: str = "not_required"  # not_required, pending, completed
    payment_link: Optional[str] = None
    stripe_session_id: Optional[str] = None
    payment_completed_at: Optional[datetime] = None

class JournalArticleCreate(BaseModel):
    title: str
    authors: str
    abstract: str
    keywords: Optional[str] = None
    university: str
    program: str
    article_type: str = "research"
    pdf_url: Optional[str] = None
    contact_email: str

class JournalArticleReviewRequest(BaseModel):
    status: str  # published or rejected
    comments: Optional[str] = None

class ECProfile(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    medical_school: str
    admission_year: int
    undergraduate_gpa: float
    mcat_score: Optional[int] = None
    research_hours: Optional[int] = None
    volunteer_hours: Optional[int] = None
    clinical_hours: Optional[int] = None
    leadership_activities: List[str] = []
    awards_scholarships: List[str] = []
    publications: Optional[int] = None
    submitted_by: str  # user_id (anonymous)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ECProfileCreate(BaseModel):
    medical_school: str
    admission_year: int
    undergraduate_gpa: float
    mcat_score: Optional[int] = None
    research_hours: Optional[int] = None
    volunteer_hours: Optional[int] = None
    clinical_hours: Optional[int] = None
    leadership_activities: List[str] = []
    awards_scholarships: List[str] = []
    publications: Optional[int] = None

class VolunteerOpportunity(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    organization: str
    type: str  # Clinical, Research, Community Health, Non-clinical
    description: str
    location: str
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    requirements: List[str] = []
    time_commitment: str
    application_link: Optional[str] = None  # TypeForm or external application link
    medical_relevant: bool = True
    posted_by: str  # user_id
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    expires_at: Optional[datetime] = None

class VolunteerOpportunityCreate(BaseModel):
    title: str
    organization: str
    type: str  # Clinical, Research, Community Health, Non-clinical
    description: str
    location: str
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None
    requirements: List[str] = []
    time_commitment: str
    application_link: Optional[str] = None  # TypeForm or external application link
    expires_at: Optional[datetime] = None

class StudentNetwork(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    research_interests: List[str]
    skills: List[str]
    looking_for: List[str]  # collaboration, mentorship, research_opportunities
    contact_preferences: str
    public_profile: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StudentNetworkCreate(BaseModel):
    research_interests: List[str]
    skills: List[str]
    looking_for: List[str]
    contact_preferences: str
    public_profile: bool = True

class ProfessorNetwork(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    department: str
    research_areas: List[str]
    lab_description: str
    accepting_students: bool = True
    contact_email: str
    website: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProfessorNetworkCreate(BaseModel):
    department: str
    research_areas: List[str]
    lab_description: str
    accepting_students: bool = True
    website: Optional[str] = None


class AdminProfessorNetworkProfile(ProfessorNetworkCreate):
    user_name: str
    contact_email: EmailStr
    user_university: Optional[str] = None

class PaymentTransaction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    poster_id: str
    user_id: str
    amount: float
    currency: str = "cad"
    payment_status: str = "pending"  # pending, completed, failed, expired
    checkout_status: str = "initiated"  # initiated, open, complete, expired
    metadata: Dict[str, str] = {}
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    completed_at: Optional[datetime] = None

class CreateCheckoutRequest(BaseModel):
    poster_id: str
    origin_url: str

# ============================================================================
# CURE SOCIAL MODELS
# ============================================================================

class Post(BaseModel):
    """Social media post for academic discussions"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    author_id: str
    author_type: str = "student"  # student, professor, lab
    text: str  # max 500 chars enforced at API level
    attachments: List[Dict[str, str]] = []  # [{"type": "poster|pdf|image|doi|link", "url": "...", "title": "..."}]
    tags: List[str] = []  # ["neuroscience", "tms", ...]
    visibility: str = "public"  # public, university, lab-only
    metrics: Dict[str, int] = {"likes": 0, "comments": 0, "reposts": 0, "views": 0}
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PostCreate(BaseModel):
    """Request model for creating a post"""
    text: str
    attachments: Optional[List[Dict[str, str]]] = []
    tags: Optional[List[str]] = []
    visibility: Optional[str] = "public"

class Comment(BaseModel):
    """Comment on a post"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    post_id: str
    author_id: str
    text: str
    parent_comment_id: Optional[str] = None  # for nested comments
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CommentCreate(BaseModel):
    """Request model for creating a comment"""
    text: str
    parent_comment_id: Optional[str] = None

class Follow(BaseModel):
    """Follow relationship between users"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    follower_id: str
    followed_id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Circle(BaseModel):
    """Academic topic community"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str  # "Neuroscience", "Machine Learning in Medicine"
    slug: str  # "neuroscience", "ml-in-medicine"
    description: str
    owner_type: str = "system"  # system or user
    member_count: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CircleCreate(BaseModel):
    """Request model for creating a circle"""
    name: str
    description: str

class CircleMember(BaseModel):
    """Membership in a circle"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    circle_id: str
    user_id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Notification(BaseModel):
    """User notification"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    type: str  # like, comment, follow, repost, mention
    actor_id: str  # user who triggered the notification
    post_id: Optional[str] = None
    comment_id: Optional[str] = None
    read: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Like(BaseModel):
    """Like on a post"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    post_id: str
    user_id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# JWT Functions
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            print("❌ No user_id in JWT payload")
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        
        user = await db.users.find_one({"id": user_id})
        if user is None:
            print(f"❌ User not found in database: {user_id}")
            raise HTTPException(status_code=401, detail="User not found")
        
        print(f"✅ User authenticated: {user.get('email')} - Type: {user.get('user_type')}")
        return User(**user)
    except jwt.PyJWTError as e:
        print(f"❌ JWT Error: {e}")
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

async def get_current_user_optional(request: Request):
    """Get current user if authenticated, otherwise return None"""
    try:
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return None
        
        token = auth_header.split(" ")[1]
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
        
        user = await db.users.find_one({"id": user_id})
        if user is None:
            return None
        
        return User(**user)
    except Exception as e:
        print(f"Error in get_current_user_optional: {e}")
        return None

# Helper functions
def prepare_for_mongo(data):
    if isinstance(data, dict):
        if 'created_at' in data and isinstance(data['created_at'], datetime):
            data['created_at'] = data['created_at'].isoformat()
        if 'submitted_at' in data and isinstance(data['submitted_at'], datetime):
            data['submitted_at'] = data['submitted_at'].isoformat()
        if 'reviewed_at' in data and isinstance(data['reviewed_at'], datetime):
            data['reviewed_at'] = data['reviewed_at'].isoformat()
        if 'expires_at' in data and isinstance(data['expires_at'], datetime):
            data['expires_at'] = data['expires_at'].isoformat()
        if 'payment_completed_at' in data and isinstance(data['payment_completed_at'], datetime):
            data['payment_completed_at'] = data['payment_completed_at'].isoformat()
    return data

def parse_from_mongo(item):
    if isinstance(item, dict):
        # Remove MongoDB's _id field to avoid ObjectId serialization issues
        item.pop('_id', None)
        
        if 'created_at' in item and isinstance(item['created_at'], str):
            item['created_at'] = datetime.fromisoformat(item['created_at'])
        if 'submitted_at' in item and isinstance(item['submitted_at'], str):
            item['submitted_at'] = datetime.fromisoformat(item['submitted_at'])
        if 'reviewed_at' in item and isinstance(item['reviewed_at'], str):
            item['reviewed_at'] = datetime.fromisoformat(item['reviewed_at'])
        if 'expires_at' in item and isinstance(item['expires_at'], str):
            item['expires_at'] = datetime.fromisoformat(item['expires_at'])
        if 'payment_completed_at' in item and isinstance(item['payment_completed_at'], str):
            item['payment_completed_at'] = datetime.fromisoformat(item['payment_completed_at'])
    return item

# ============================================================================
# CURE SOCIAL HELPER FUNCTIONS
# ============================================================================

import re

def extract_tags(text: str) -> List[str]:
    """Extract #hashtags from text"""
    return list(set(re.findall(r'#(\w+)', text)))

def extract_mentions(text: str) -> List[str]:
    """Extract @mentions from text"""
    return list(set(re.findall(r'@(\w+)', text)))

async def create_notification(user_id: str, notif_type: str, actor_id: str, 
                              post_id: Optional[str] = None, comment_id: Optional[str] = None):
    """Create a notification for a user"""
    if user_id == actor_id:  # Don't notify yourself
        return
    
    notification = Notification(
        user_id=user_id,
        type=notif_type,
        actor_id=actor_id,
        post_id=post_id,
        comment_id=comment_id
    )
    await db.notifications.insert_one(prepare_for_mongo(notification.dict()))


async def send_article_acceptance_email(to_email: str, name: str, article_title: str, article_id: str):
    """Send article acceptance email notification"""
    # For now, just print. Can be extended with actual email service (SendGrid, etc.)
    print(f"""
    ═══════════════════════════════════════════════════════
    📧 ARTICLE ACCEPTANCE EMAIL
    ═══════════════════════════════════════════════════════
    To: {to_email}
    Subject: Congratulations! Your Article Has Been Accepted
    
    Dear {name},
    
    We are pleased to inform you that your article "{article_title}" has been 
    accepted for publication in the CURE Journal!
    
    Next Steps:
    1. Complete the publication fee payment of ${POSTER_PUBLICATION_FEE} CAD
    2. Your article will be published immediately after payment confirmation
    3. View your article status in your profile at: {os.getenv('FRONTEND_URL', 'http://localhost:3000')}/profile
    
    Article ID: {article_id}
    
    Congratulations on this achievement!
    
    Best regards,
    CURE Journal Team
    ═══════════════════════════════════════════════════════
    """)
    return True  # Return True to indicate email was "sent"

# Authentication Routes
@api_router.get("/auth/google")
async def google_auth(request: Request):
    # Use redirect URI from environment or default to Railway
    redirect_uri = os.environ.get('GOOGLE_REDIRECT_URI', 'https://curesite-production.up.railway.app/api/auth/google/callback')
    return await oauth.google.authorize_redirect(request, redirect_uri)

async def upsert_user_from_oauth(user_info: Dict[str, Any]) -> User:
    """Ensure the OAuth user exists with the correct metadata."""
    email = user_info['email']
    display_name = user_info.get('name')

    existing_user = await db.users.find_one({"email": email})

    if existing_user:
        normalized_user = parse_from_mongo(existing_user)
        updates: Dict[str, Any] = {}

        if not normalized_user.get("id"):
            normalized_user["id"] = str(uuid.uuid4())
            updates["id"] = normalized_user["id"]

        if display_name and normalized_user.get("name") != display_name:
            updates["name"] = display_name

        if email == "curejournal@gmail.com":
            if normalized_user.get("user_type") != "admin":
                updates["user_type"] = "admin"
            if not normalized_user.get("verified"):
                updates["verified"] = True

        if updates:
            await db.users.update_one({"email": email}, {"$set": updates})
            normalized_user.update(updates)

        return User(**normalized_user)

    # Create a new user record when none exists yet
    user_type = "admin" if email == "curejournal@gmail.com" else "student"
    user = User(
        email=email,
        name=display_name or email,
        profile_picture=user_info.get('picture'),
        user_type=user_type,
        verified=True if user_type == "admin" else False
    )
    user_dict = prepare_for_mongo(user.dict())
    await db.users.insert_one(user_dict)

    # Auto-create student network profile for new students
    if user_type == "student":
        student_profile = StudentNetwork(
            user_id=user.id,
            research_interests=["General Research"],
            skills=["Research Skills"],
            looking_for=["Research Opportunities"],
            contact_preferences="Email",
            public_profile=True
        )
        profile_dict = prepare_for_mongo(student_profile.dict())
        await db.student_network.insert_one(profile_dict)

    return user


@api_router.get("/auth/google/callback")
async def google_callback(request: Request):
    try:
        token = await oauth.google.authorize_access_token(request)
        user_info = token.get('userinfo')

        if not user_info:
            raise HTTPException(status_code=400, detail="Failed to get user info from Google")

        user = await upsert_user_from_oauth(user_info)

        # Create JWT token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.id}, expires_delta=access_token_expires
        )

        # Determine frontend URL - prioritize env var, then use Vercel subdomain
        frontend_url = os.environ.get('FRONTEND_URL', 'https://curesite-olive.vercel.app')
        
        user_data_encoded = quote(user.json())
        redirect_url = f"{frontend_url}/?token={access_token}&user={user_data_encoded}"

        return RedirectResponse(url=redirect_url)

    except Exception as e:
        # Redirect to frontend with error
        frontend_url = os.environ.get('FRONTEND_URL', 'https://curesite-olive.vercel.app')
        error_message = quote(str(e))
        redirect_url = f"{frontend_url}/?error={error_message}"
        return RedirectResponse(url=redirect_url)

@api_router.post("/auth/logout")
async def logout():
    return {"message": "Logged out successfully"}

@api_router.get("/auth/me")
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user

# User Routes
@api_router.put("/users/profile")
async def update_profile(user_update: UserUpdate, current_user: User = Depends(get_current_user)):
    update_data = prepare_for_mongo(user_update.dict(exclude_unset=True))
    if update_data:  # Only update if there's data to update
        await db.users.update_one({"id": current_user.id}, {"$set": update_data})
    updated_user = await db.users.find_one({"id": current_user.id})
    return User(**parse_from_mongo(updated_user))

@api_router.delete("/users/account")
async def delete_account(current_user: User = Depends(get_current_user)):
    """Delete user account and all associated data"""
    try:
        # Delete all user's associated data
        await db.poster_submissions.delete_many({"submitted_by": current_user.id})
        await db.student_network.delete_many({"user_id": current_user.id})
        await db.professor_network.delete_many({"user_id": current_user.id})
        await db.ec_profiles.delete_many({"submitted_by": current_user.id})
        await db.volunteer_opportunities.delete_many({"posted_by": current_user.id})
        
        # Delete the user account
        await db.users.delete_one({"id": current_user.id})
        
        return {"message": "Account successfully deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error deleting account")

# Poster Routes
@api_router.post("/posters/upload")
async def upload_poster_file(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    """Upload poster file to MongoDB GridFS and return file ID"""
    if not file.filename.lower().endswith(('.pdf', '.png', '.jpg', '.jpeg')):
        raise HTTPException(status_code=400, detail="Only PDF and image files are allowed")
    
    # Read file content
    file_content = await file.read()
    
    # Determine content type
    file_extension = Path(file.filename).suffix.lower()
    content_type_map = {
        '.pdf': 'application/pdf',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg'
    }
    content_type = content_type_map.get(file_extension, 'application/octet-stream')
    
    # Upload to GridFS
    file_id = await fs.upload_from_stream(
        file.filename,
        io.BytesIO(file_content),
        metadata={
            'user_id': current_user.id,
            'content_type': content_type,
            'uploaded_at': datetime.now(timezone.utc).isoformat()
        }
    )
    
    print(f"📁 Uploaded poster file to GridFS: {file_id}")
    
    return {"file_id": str(file_id), "filename": file.filename}

@api_router.post("/journal/articles/upload")
async def upload_article_file(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    """Upload article PDF file to MongoDB GridFS and return file ID"""
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed for articles")
    
    # Read file content
    file_content = await file.read()
    
    # Upload to GridFS
    file_id = await fs.upload_from_stream(
        file.filename,
        io.BytesIO(file_content),
        metadata={
            'user_id': current_user.id,
            'content_type': 'application/pdf',
            'uploaded_at': datetime.now(timezone.utc).isoformat(),
            'type': 'article'
        }
    )
    
    print(f"📁 Uploaded article file to GridFS: {file_id}")
    
    return {"file_id": str(file_id), "filename": file.filename}


@api_router.post("/posters", response_model=PosterSubmission)
async def submit_poster(poster: PosterSubmissionCreate, current_user: User = Depends(get_current_user)):
    poster_data = poster.dict()
    poster_obj = PosterSubmission(**poster_data, submitted_by=current_user.id)
    poster_dict = prepare_for_mongo(poster_obj.dict())
    await db.poster_submissions.insert_one(poster_dict)
    return poster_obj

@api_router.get("/posters", response_model=List[PosterSubmission])
async def get_posters(status: Optional[str] = None, university: Optional[str] = None):
    query = {
        "status": "approved",
        "payment_status": "completed"  # Only show paid posters to public
    }
    if university:
        query["university"] = university
    
    posters = await db.poster_submissions.find(query).to_list(100)
    return [PosterSubmission(**parse_from_mongo(poster)) for poster in posters]

@api_router.get("/posters/my", response_model=List[PosterSubmission])
async def get_my_posters(current_user: User = Depends(get_current_user)):
    posters = await db.poster_submissions.find({"submitted_by": current_user.id}).to_list(100)
    return [PosterSubmission(**parse_from_mongo(poster)) for poster in posters]

class PosterReviewRequest(BaseModel):
    status: str
    comments: Optional[str] = None

@api_router.put("/admin/posters/{poster_id}/review")
async def review_poster(poster_id: str, review_data: PosterReviewRequest, current_user: User = Depends(get_current_user)):
    if current_user.user_type not in ["admin", "professor"]:
        raise HTTPException(status_code=403, detail="Not authorized to review posters")
    
    # Get the poster to check if status is changing to approved
    poster = await db.poster_submissions.find_one({"id": poster_id})
    if not poster:
        raise HTTPException(status_code=404, detail="Poster not found")
    
    update_data = {
        "status": review_data.status,
        "reviewed_at": datetime.now(timezone.utc).isoformat(),
        "reviewer_id": current_user.id,
        "reviewer_comments": review_data.comments
    }
    
    # If poster is being approved, set payment requirements
    if review_data.status == "approved":
        update_data["payment_status"] = "pending"
        # Payment link will be generated when user initiates checkout
        
        # Log approval
        user = await db.users.find_one({"id": poster["submitted_by"]})
        if user:
            print(f"✅ Poster approved: '{poster['title']}'")
            print(f"   Student: {user['name']} ({user['email']})")
            print(f"   💳 Student can now complete payment ($${POSTER_PUBLICATION_FEE})")
    
    await db.poster_submissions.update_one({"id": poster_id}, {"$set": update_data})
    updated_poster = await db.poster_submissions.find_one({"id": poster_id})
    return PosterSubmission(**parse_from_mongo(updated_poster))

@api_router.get("/admin/posters/pending", response_model=List[PosterSubmission])
async def get_pending_posters(current_user: User = Depends(get_current_user)):
    if current_user.user_type != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    posters = await db.poster_submissions.find({"status": "pending"}).to_list(100)
    return [PosterSubmission(**parse_from_mongo(poster)) for poster in posters]

@api_router.get("/admin/posters/all", response_model=List[PosterSubmission])
async def get_all_posters_admin(current_user: User = Depends(get_current_user)):
    if current_user.user_type != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    posters = await db.poster_submissions.find({}).to_list(100)
    return [PosterSubmission(**parse_from_mongo(poster)) for poster in posters]

@api_router.put("/admin/posters/{poster_id}/payment")
async def mark_payment_completed(poster_id: str, current_user: User = Depends(get_current_user)):
    """Admin endpoint to mark payment as completed"""
    if current_user.user_type != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    update_data = {
        "payment_status": "completed",
        "payment_completed_at": datetime.now(timezone.utc).isoformat()
    }
    
    result = await db.poster_submissions.update_one({"id": poster_id}, {"$set": update_data})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Poster not found")
    
    updated_poster = await db.poster_submissions.find_one({"id": poster_id})
    return PosterSubmission(**parse_from_mongo(updated_poster))

# Stripe Payment Endpoints
@api_router.post("/payments/create-checkout")
async def create_checkout_session(request_data: CreateCheckoutRequest, current_user: User = Depends(get_current_user)):
    """Create a Stripe checkout session for poster publication payment"""
    if not STRIPE_API_KEY:
        raise HTTPException(status_code=500, detail="Stripe not configured")
    
    # Get the poster
    poster = await db.poster_submissions.find_one({"id": request_data.poster_id})
    if not poster:
        raise HTTPException(status_code=404, detail="Poster not found")
    
    # Verify user owns this poster
    if poster["submitted_by"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Verify poster is approved and payment is pending
    if poster["status"] != "approved" or poster["payment_status"] != "pending":
        raise HTTPException(status_code=400, detail="Poster is not eligible for payment")
    
    # Check if there's already a pending transaction
    existing_transaction = await db.payment_transactions.find_one({
        "poster_id": request_data.poster_id,
        "payment_status": {"$in": ["pending", "completed"]}
    })
    
    if existing_transaction and existing_transaction.get("payment_status") == "completed":
        raise HTTPException(status_code=400, detail="Payment already completed")
    
    # Initialize Stripe checkout
    webhook_url = f"{request_data.origin_url}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    # Create success and cancel URLs
    success_url = f"{request_data.origin_url}/profile?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{request_data.origin_url}/profile"
    
    # Create checkout session
    checkout_request = CheckoutSessionRequest(
        amount=POSTER_PUBLICATION_FEE,
        currency="cad",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "poster_id": request_data.poster_id,
            "user_id": current_user.id,
            "user_email": current_user.email,
            "poster_title": poster["title"]
        }
    )
    
    session: CheckoutSessionResponse = await stripe_checkout.create_checkout_session(checkout_request)
    
    # Create payment transaction record
    transaction = PaymentTransaction(
        session_id=session.session_id,
        poster_id=request_data.poster_id,
        user_id=current_user.id,
        amount=POSTER_PUBLICATION_FEE,
        currency="cad",
        payment_status="pending",
        checkout_status="initiated",
        metadata={
            "poster_title": poster["title"],
            "user_email": current_user.email
        }
    )
    
    await db.payment_transactions.insert_one(prepare_for_mongo(transaction.model_dump()))
    
    # Update poster with checkout session info
    await db.poster_submissions.update_one(
        {"id": request_data.poster_id},
        {"$set": {"payment_link": session.url, "stripe_session_id": session.session_id}}
    )
    
    print(f"💳 Created checkout session for poster {request_data.poster_id}")
    
    return {"url": session.url, "session_id": session.session_id}

@api_router.get("/payments/status/{session_id}")
async def get_payment_status(session_id: str, current_user: User = Depends(get_current_user)):
    """Check the status of a payment by session ID"""
    if not STRIPE_API_KEY:
        raise HTTPException(status_code=500, detail="Stripe not configured")
    
    # Get transaction
    transaction = await db.payment_transactions.find_one({"session_id": session_id})
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    # Verify user owns this transaction
    if transaction["user_id"] != current_user.id and current_user.user_type != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # If already completed, return cached status
    if transaction["payment_status"] == "completed":
        return {
            "status": transaction["checkout_status"],
            "payment_status": transaction["payment_status"],
            "amount": transaction["amount"],
            "currency": transaction["currency"]
        }
    
    # Check with Stripe for latest status
    webhook_url = "https://placeholder.com/webhook"  # Not used for status checks
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    checkout_status: CheckoutStatusResponse = await stripe_checkout.get_checkout_status(session_id)
    
    # Update transaction status
    update_data = {
        "checkout_status": checkout_status.status,
        "payment_status": "completed" if checkout_status.payment_status == "paid" else transaction["payment_status"]
    }
    
    # If payment is completed, update poster/article and transaction
    if checkout_status.payment_status == "paid" and transaction["payment_status"] != "completed":
        update_data["payment_status"] = "completed"
        update_data["completed_at"] = datetime.now(timezone.utc).isoformat()
        
        # Determine if this is a poster or article payment based on metadata
        item_type = transaction.get("metadata", {}).get("type", "poster")
        item_id = transaction.get("poster_id")  # Field is named poster_id for both
        
        if item_type == "journal_article":
            # Update article payment status
            await db.journal_articles.update_one(
                {"id": item_id},
                {"$set": {
                    "payment_status": "completed",
                    "payment_completed_at": datetime.now(timezone.utc).isoformat()
                }}
            )
            print(f"✅ Payment completed for article {item_id}")
        else:
            # Update poster payment status
            await db.poster_submissions.update_one(
                {"id": item_id},
                {"$set": {
                    "payment_status": "completed",
                    "payment_completed_at": datetime.now(timezone.utc).isoformat()
                }}
            )
            print(f"✅ Payment completed for poster {item_id}")
    
    await db.payment_transactions.update_one(
        {"session_id": session_id},
        {"$set": update_data}
    )
    
    return {
        "status": checkout_status.status,
        "payment_status": checkout_status.payment_status,
        "amount": checkout_status.amount_total / 100,  # Convert from cents
        "currency": checkout_status.currency
    }



# ==================== CURE JOURNAL ARTICLE ENDPOINTS ====================

@api_router.post("/journal/articles", response_model=JournalArticle)
async def submit_article(article: JournalArticleCreate, current_user: User = Depends(get_current_user)):
    """Submit a new journal article"""
    article_data = article.dict()
    article_obj = JournalArticle(**article_data, submitted_by=current_user.id)
    article_dict = prepare_for_mongo(article_obj.dict())
    await db.journal_articles.insert_one(article_dict)
    return article_obj

@api_router.get("/journal/articles", response_model=List[JournalArticle])
async def get_articles(status: Optional[str] = None, university: Optional[str] = None):
    """Get published articles (public can only see published & paid articles)"""
    query = {
        "status": "published",
        "payment_status": "completed"  # Only show paid articles to public
    }
    if university:
        query["university"] = university
    
    articles = await db.journal_articles.find(query).to_list(100)
    return [JournalArticle(**parse_from_mongo(article)) for article in articles]

@api_router.get("/journal/articles/my", response_model=List[JournalArticle])
async def get_my_articles(current_user: User = Depends(get_current_user)):
    """Get current user's submitted articles"""
    articles = await db.journal_articles.find({"submitted_by": current_user.id}).to_list(100)
    return [JournalArticle(**parse_from_mongo(article)) for article in articles]

@api_router.get("/journal/articles/{article_id}", response_model=JournalArticle)
async def get_article(article_id: str):
    """Get a specific article by ID"""
    article = await db.journal_articles.find_one({"id": article_id, "status": "published", "payment_status": "completed"})
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    return JournalArticle(**parse_from_mongo(article))

@api_router.get("/journal/article/{identifier}", response_model=JournalArticle)
async def get_article_by_identifier(identifier: str):
    """Get a specific article by CURE identifier (e.g., CURE.2024.001)"""
    article = await db.journal_articles.find_one({
        "cure_identifier": identifier,
        "status": "published",
        "payment_status": "completed"
    })
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    return JournalArticle(**parse_from_mongo(article))

# Admin endpoints for journal article review
@api_router.get("/admin/journal/articles", response_model=List[JournalArticle])
async def get_all_articles_admin(current_user: User = Depends(get_current_user)):
    """Get all articles for admin review"""
    if current_user.user_type not in ["admin", "professor"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    articles = await db.journal_articles.find({}).to_list(200)
    return [JournalArticle(**parse_from_mongo(article)) for article in articles]

@api_router.put("/admin/journal/articles/{article_id}/review")
async def review_article(article_id: str, review_data: JournalArticleReviewRequest, current_user: User = Depends(get_current_user)):
    """Review an article (approve/reject)"""
    if current_user.user_type not in ["admin", "professor"]:
        raise HTTPException(status_code=403, detail="Not authorized to review articles")
    
    # Get the article
    article = await db.journal_articles.find_one({"id": article_id})
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    update_data = {
        "status": review_data.status,
        "reviewed_at": datetime.now(timezone.utc).isoformat(),
        "reviewer_id": current_user.id,
        "reviewer_comments": review_data.comments
    }
    
    # If article is being published, set payment requirements
    if review_data.status == "published":
        update_data["payment_status"] = "pending"
        
        # Generate unique CURE identifier if not already assigned
        if not article.get("cure_identifier"):
            # Get count of published articles to determine next number
            published_count = await db.journal_articles.count_documents({
                "status": "published",
                "cure_identifier": {"$exists": True, "$ne": None}
            })
            year = datetime.now(timezone.utc).year
            next_number = published_count + 1
            cure_id = f"CURE.{year}.{next_number:03d}"
            update_data["cure_identifier"] = cure_id
            print(f"   🔖 Assigned identifier: {cure_id}")
        
        # Get user details for email
        user = await db.users.find_one({"id": article["submitted_by"]})
        if user:
            print(f"✅ Article approved: '{article['title']}'")
            print(f"   Author: {user['name']} ({user['email']})")
            print(f"   💳 Author can now complete payment ($${POSTER_PUBLICATION_FEE})")
            
            # Send acceptance email
            try:
                email_sent = await send_article_acceptance_email(
                    user["email"],
                    user["name"],
                    article["title"],
                    article_id
                )
                if email_sent:
                    print(f"   ✉️  Acceptance email sent to {user['email']}")
                else:
                    print(f"   ⚠️  Failed to send acceptance email")
            except Exception as e:
                print(f"   ❌ Email error: {e}")
    
    await db.journal_articles.update_one({"id": article_id}, {"$set": update_data})
    return {"message": f"Article {review_data.status}", "article_id": article_id}

@api_router.post("/admin/journal/articles/{article_id}/payment-completed")
async def mark_article_payment_completed(article_id: str, current_user: User = Depends(get_current_user)):
    """Mark article payment as completed (admin only)"""
    if current_user.user_type != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    update_data = {
        "payment_status": "completed",
        "payment_completed_at": datetime.now(timezone.utc).isoformat()
    }
    
    result = await db.journal_articles.update_one({"id": article_id}, {"$set": update_data})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Article not found")
    
    return {"message": "Payment marked as completed", "article_id": article_id}

@api_router.delete("/admin/journal/articles/{article_id}")
async def delete_article(article_id: str, current_user: User = Depends(get_current_user)):
    """Delete an article (admin only)"""
    if current_user.user_type != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    result = await db.journal_articles.delete_one({"id": article_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Article not found")
    
    return {"message": "Article deleted successfully", "article_id": article_id}


# Article payment checkout
@api_router.post("/journal/articles/{article_id}/create-checkout")
async def create_article_checkout(article_id: str, current_user: User = Depends(get_current_user)):
    """Create Stripe checkout session for article publication fee"""
    if not STRIPE_API_KEY:
        raise HTTPException(status_code=500, detail="Stripe not configured")
    
    article = await db.journal_articles.find_one({"id": article_id})
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    if article["submitted_by"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not your article")
    
    if article["status"] != "published":
        raise HTTPException(status_code=400, detail="Article not yet approved")
    
    if article["payment_status"] == "completed":
        raise HTTPException(status_code=400, detail="Payment already completed")
    
    # Check if there's already a pending transaction
    existing_transaction = await db.payment_transactions.find_one({
        "item_id": article_id,
        "type": "journal_article",
        "payment_status": {"$in": ["pending", "completed"]}
    })
    
    if existing_transaction and existing_transaction.get("payment_status") == "completed":
        raise HTTPException(status_code=400, detail="Payment already completed")
    
    # Initialize Stripe checkout
    origin_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
    webhook_url = f"{os.getenv('REACT_APP_BACKEND_URL', 'http://localhost:8001')}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    # Create success and cancel URLs
    success_url = f"{origin_url}/profile?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{origin_url}/profile"
    
    # Create checkout session using CheckoutSessionRequest
    checkout_request = CheckoutSessionRequest(
        amount=POSTER_PUBLICATION_FEE,
        currency="cad",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "type": "journal_article",
            "article_id": article_id,
            "user_id": current_user.id,
            "user_email": current_user.email,
            "article_title": article["title"]
        }
    )
    
    session: CheckoutSessionResponse = await stripe_checkout.create_checkout_session(checkout_request)
    
    # Create payment transaction record
    transaction = PaymentTransaction(
        session_id=session.session_id,
        poster_id=article_id,  # Using poster_id field for compatibility
        user_id=current_user.id,
        amount=POSTER_PUBLICATION_FEE,
        currency="cad",
        payment_status="pending",
        checkout_status="initiated",
        metadata={
            "type": "journal_article",
            "article_title": article["title"],
            "user_email": current_user.email
        }
    )
    
    await db.payment_transactions.insert_one(prepare_for_mongo(transaction.model_dump()))
    
    # Store payment link in article
    await db.journal_articles.update_one(
        {"id": article_id},
        {"$set": {
            "payment_link": session.url,
            "stripe_session_id": session.session_id
        }}
    )
    
    print(f"💳 Created checkout session for article {article_id}")
    
    return {"checkout_url": session.url, "session_id": session.session_id}


@api_router.get("/journal/articles/{article_id}/payment-status")
async def get_article_payment_status(article_id: str, current_user: User = Depends(get_current_user)):
    """Check payment status for an article"""
    article = await db.journal_articles.find_one({"id": article_id})
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    if article["submitted_by"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not your article")
    
    return {
        "payment_status": article.get("payment_status", "not_required"),
        "payment_link": article.get("payment_link"),
        "amount": POSTER_PUBLICATION_FEE,
        "currency": "CAD"
    }

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    """Handle Stripe webhook events"""
    if not STRIPE_API_KEY:
        raise HTTPException(status_code=500, detail="Stripe not configured")
    
    # Get raw body and signature
    body = await request.body()
    signature = request.headers.get("Stripe-Signature")
    
    if not signature:
        raise HTTPException(status_code=400, detail="No signature provided")
    
    try:
        # Initialize Stripe checkout
        webhook_url = "https://placeholder.com/webhook"  # Not used in handler
        stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
        
        # Handle webhook
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        
        # Process based on event type
        if webhook_response.event_type == "checkout.session.completed":
            session_id = webhook_response.session_id
            
            # Get transaction
            transaction = await db.payment_transactions.find_one({"session_id": session_id})
            if transaction:
                # Update transaction
                await db.payment_transactions.update_one(
                    {"session_id": session_id},
                    {"$set": {
                        "payment_status": "completed",
                        "completed_at": datetime.now(timezone.utc).isoformat()
                    }}
                )
                
                # Determine if this is a poster or article payment based on metadata
                item_type = transaction.get("metadata", {}).get("type", "poster")
                item_id = transaction.get("poster_id")  # Field is named poster_id for both
                
                if item_type == "journal_article":
                    # Update article payment status
                    await db.journal_articles.update_one(
                        {"id": item_id},
                        {"$set": {
                            "payment_status": "completed",
                            "payment_completed_at": datetime.now(timezone.utc).isoformat()
                        }}
                    )
                    print(f"🎉 Webhook: Payment completed for article {item_id}")
                else:
                    # Update poster payment status
                    await db.poster_submissions.update_one(
                        {"id": item_id},
                        {"$set": {
                            "payment_status": "completed",
                            "payment_completed_at": datetime.now(timezone.utc).isoformat()
                        }}
                    )
                    print(f"🎉 Webhook: Payment completed for poster {item_id}")
        
        return {"status": "success"}
    
    except Exception as e:
        print(f"❌ Webhook error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@api_router.get("/admin/stats")
async def get_admin_stats(current_user: User = Depends(get_current_user)):
    if current_user.user_type != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    stats = {
        "total_users": await db.users.count_documents({}),
        "total_posters": await db.poster_submissions.count_documents({}),
        "pending_posters": await db.poster_submissions.count_documents({"status": "pending"}),
        "approved_posters": await db.poster_submissions.count_documents({"status": "approved"}),
        "total_network_profiles": await db.student_network.count_documents({}),
        "total_volunteer_opportunities": await db.volunteer_opportunities.count_documents({})
    }
    return stats

@api_router.get("/admin/posters/{poster_id}/download")
async def download_poster(poster_id: str, current_user: User = Depends(get_current_user)):
    if current_user.user_type != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    poster = await db.poster_submissions.find_one({"id": poster_id})
    if not poster:
        raise HTTPException(status_code=404, detail="Poster not found")
    
    if not poster.get("poster_url"):
        raise HTTPException(status_code=404, detail="No file attached to this poster")
    
    file_path = Path(poster["poster_url"])
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Poster file not found")
    
    return FileResponse(
        path=file_path,
        filename=f"{poster['title']}.{file_path.suffix[1:]}",
        media_type='application/octet-stream'
    )

@api_router.get("/admin/posters/{poster_id}/view")
async def view_poster_admin(poster_id: str, current_user: User = Depends(get_current_user)):
    """View poster inline (admin access)"""
    if current_user.user_type != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    poster = await db.poster_submissions.find_one({"id": poster_id})
    if not poster:
        raise HTTPException(status_code=404, detail="Poster not found")
    
    if not poster.get("poster_url"):
        raise HTTPException(status_code=404, detail="No file attached to this poster")
    
    file_path = Path(poster["poster_url"])
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Poster file not found")
    
    # Determine media type based on file extension
    file_extension = file_path.suffix.lower()
    if file_extension == '.pdf':
        media_type = 'application/pdf'
    elif file_extension in ['.png']:
        media_type = 'image/png'
    elif file_extension in ['.jpg', '.jpeg']:
        media_type = 'image/jpeg'
    elif file_extension == '.gif':
        media_type = 'image/gif'
    else:
        media_type = 'application/octet-stream'
    
    return FileResponse(
        path=file_path,
        media_type=media_type,
        headers={
            "Content-Disposition": "inline",
            "Cache-Control": "public, max-age=3600"
        }
    )

@api_router.get("/posters/{poster_id}/download")
async def download_approved_poster(poster_id: str):
    """Download approved poster (public access)"""
    poster = await db.poster_submissions.find_one({"id": poster_id})
    if not poster:
        raise HTTPException(status_code=404, detail="Poster not found")
    
    if poster.get("status") != "approved":
        raise HTTPException(status_code=403, detail="Poster not approved for public viewing")
    
    if not poster.get("poster_url"):
        raise HTTPException(status_code=404, detail="No file attached to this poster")
    
    file_path = Path(poster["poster_url"])
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Poster file not found")
    
    return FileResponse(
        path=file_path,
        filename=f"{poster['title']}.{file_path.suffix[1:]}",
        media_type='application/octet-stream'
    )

@api_router.get("/posters/{poster_id}/view")
async def view_approved_poster(poster_id: str):
    """View approved poster inline (public access) - retrieves from GridFS with chunked streaming"""
    poster = await db.poster_submissions.find_one({"id": poster_id})
    if not poster:
        raise HTTPException(status_code=404, detail="Poster not found")
    
    if poster.get("status") != "approved" or poster.get("payment_status") != "completed":
        raise HTTPException(status_code=403, detail="Poster not approved or payment not completed")
    
    # Get file_id from poster_url (now stores GridFS file ID)
    file_identifier = poster.get("poster_url")
    if not file_identifier:
        raise HTTPException(status_code=404, detail="No file attached to this poster")
    
    try:
        from bson import ObjectId
        
        # Check if it's a GridFS ID or old file path
        if file_identifier.startswith("/"):
            raise HTTPException(status_code=404, detail="Poster file not found. Please re-upload.")
        
        file_id = ObjectId(file_identifier)
        
        # Open download stream from GridFS
        grid_out = await fs.open_download_stream(file_id)
        
        # Get metadata
        content_type = grid_out.metadata.get('content_type', 'application/pdf') if grid_out.metadata else 'application/pdf'
        
        # Create async generator for chunked streaming
        async def file_iterator():
            chunk_size = 1024 * 64  # 64KB chunks for faster streaming
            while True:
                chunk = await grid_out.read(chunk_size)
                if not chunk:
                    break
                yield chunk
        
        return StreamingResponse(
            file_iterator(),
            media_type=content_type,
            headers={
                "Content-Disposition": f"inline; filename={poster.get('title', 'poster')}.pdf",
                "Cache-Control": "public, max-age=3600"
            }
        )
    except Exception as e:
        print(f"❌ Error retrieving poster file: {e}")
        raise HTTPException(status_code=404, detail="Poster file not found")


@api_router.get("/posters/{poster_id}/download")
async def download_approved_poster(poster_id: str):
    """Download approved poster as attachment (public access)"""
    poster = await db.poster_submissions.find_one({"id": poster_id})
    if not poster:
        raise HTTPException(status_code=404, detail="Poster not found")
    
    if poster.get("status") != "approved" or poster.get("payment_status") != "completed":
        raise HTTPException(status_code=403, detail="Poster not approved or payment not completed")
    
    file_identifier = poster.get("poster_url")
    if not file_identifier:
        raise HTTPException(status_code=404, detail="No file attached to this poster")
    
    try:
        from bson import ObjectId
        
        if file_identifier.startswith("/"):
            raise HTTPException(status_code=404, detail="Poster file not found. Please re-upload.")
        
        file_id = ObjectId(file_identifier)
        grid_out = await fs.open_download_stream(file_id)
        content_type = grid_out.metadata.get('content_type', 'application/pdf') if grid_out.metadata else 'application/pdf'
        
        # Async generator for streaming
        async def file_iterator():
            chunk_size = 1024 * 64
            while True:
                chunk = await grid_out.read(chunk_size)
                if not chunk:
                    break
                yield chunk
        
        # Force download instead of inline view
        filename = f"{poster.get('title', 'poster').replace(' ', '_')}.pdf"
        return StreamingResponse(
            file_iterator(),
            media_type=content_type,
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
                "Cache-Control": "public, max-age=3600"
            }
        )
    except Exception as e:
        print(f"❌ Error downloading poster file: {e}")
        raise HTTPException(status_code=404, detail="Poster file not found")

@api_router.delete("/posters/{poster_id}")
async def delete_poster(poster_id: str, current_user: User = Depends(get_current_user)):
    """Delete poster (user can delete their own, admin can delete any)"""
    poster = await db.poster_submissions.find_one({"id": poster_id})
    if not poster:
        raise HTTPException(status_code=404, detail="Poster not found")
    
    # Check permissions
    if current_user.user_type != "admin" and poster["submitted_by"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this poster")
    
    # Delete the file if it exists
    if poster.get("poster_url"):
        file_path = Path(poster["poster_url"])
        if file_path.exists():
            file_path.unlink()
    
    # Delete from database
    await db.poster_submissions.delete_one({"id": poster_id})
    
    return {"message": "Poster deleted successfully"}

# Admin Network Management Routes

@api_router.post("/admin/professor-network", response_model=ProfessorNetwork)
async def admin_create_professor(profile: AdminProfessorNetworkProfile, current_user: User = Depends(get_current_user)):
    """Admin creates professor network profile"""
    if current_user.user_type != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    profile_data = profile.dict()
    professor_name = profile_data.pop("user_name")
    contact_email = profile_data.pop("contact_email")
    professor_university = profile_data.pop("user_university", None)

    existing_user = await db.users.find_one({"email": contact_email})
    if existing_user:
        # Some legacy records might be missing an explicit `id` field
        # which would previously cause a KeyError and break the admin flow.
        professor_user_id = existing_user.get("id") or str(uuid.uuid4())
        user_updates = {}

        # Ensure the legacy record also gets an id so future lookups succeed
        if "id" not in existing_user or existing_user.get("id") != professor_user_id:
            user_updates["id"] = professor_user_id
        if existing_user.get("name") != professor_name:
            user_updates["name"] = professor_name
        if professor_university and existing_user.get("university") != professor_university:
            user_updates["university"] = professor_university
        if existing_user.get("user_type") != "professor":
            user_updates["user_type"] = "professor"
        if not existing_user.get("verified"):
            user_updates["verified"] = True

        if user_updates:
            await db.users.update_one({"email": contact_email}, {"$set": user_updates})
    else:
        prof_user = User(
            email=contact_email,
            name=professor_name,
            university=professor_university,
            user_type="professor",
            verified=True
        )
        await db.users.insert_one(prepare_for_mongo(prof_user.dict()))
        professor_user_id = prof_user.id

    profile_obj = ProfessorNetwork(
        **profile_data,
        user_id=professor_user_id,
        contact_email=contact_email
    )
    profile_dict = prepare_for_mongo(profile_obj.dict())
    await db.professor_network.insert_one(profile_dict)
    return profile_obj

@api_router.put("/admin/professor-network/{profile_id}", response_model=ProfessorNetwork)
async def admin_update_professor(profile_id: str, profile: AdminProfessorNetworkProfile, current_user: User = Depends(get_current_user)):
    """Admin updates professor network profile"""
    if current_user.user_type != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    existing_profile = await db.professor_network.find_one({"id": profile_id})
    if not existing_profile:
        raise HTTPException(status_code=404, detail="Professor profile not found")

    profile_data = profile.dict()
    professor_name = profile_data.pop("user_name")
    contact_email = profile_data.pop("contact_email")
    professor_university = profile_data.pop("user_university", None)

    professor_user_id = existing_profile.get("user_id")
    existing_user = None
    if professor_user_id:
        existing_user = await db.users.find_one({"id": professor_user_id})

    if existing_user:
        user_updates = {}
        if existing_user.get("email") != contact_email:
            user_updates["email"] = contact_email
        if existing_user.get("name") != professor_name:
            user_updates["name"] = professor_name
        if professor_university and existing_user.get("university") != professor_university:
            user_updates["university"] = professor_university
        if existing_user.get("user_type") != "professor":
            user_updates["user_type"] = "professor"
        if not existing_user.get("verified"):
            user_updates["verified"] = True

        if user_updates:
            await db.users.update_one({"id": professor_user_id}, {"$set": user_updates})
    else:
        new_user = User(
            email=contact_email,
            name=professor_name,
            university=professor_university,
            user_type="professor",
            verified=True
        )
        await db.users.insert_one(prepare_for_mongo(new_user.dict()))
        professor_user_id = new_user.id

    update_payload = prepare_for_mongo(profile_data)
    update_payload["contact_email"] = contact_email
    update_payload["user_id"] = professor_user_id

    await db.professor_network.update_one({"id": profile_id}, {"$set": update_payload})

    updated_profile = await db.professor_network.find_one({"id": profile_id})
    return ProfessorNetwork(**parse_from_mongo(updated_profile))

@api_router.delete("/admin/professor-network/{profile_id}")
async def admin_delete_professor(profile_id: str, current_user: User = Depends(get_current_user)):
    """Admin deletes professor network profile"""
    if current_user.user_type != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db.professor_network.delete_one({"id": profile_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Professor profile not found")
    
    return {"message": "Professor profile deleted successfully"}

@api_router.post("/admin/volunteer-opportunities", response_model=VolunteerOpportunity)
@api_router.post("/admin/opportunities", response_model=VolunteerOpportunity)  # Alternative endpoint to avoid ad blockers
async def admin_create_volunteer_opportunity(opportunity: VolunteerOpportunityCreate, current_user: User = Depends(get_current_user)):
    """Admin creates volunteer opportunity"""
    if current_user.user_type != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    opportunity_data = opportunity.dict()
    opportunity_obj = VolunteerOpportunity(**opportunity_data, posted_by=current_user.id)
    opportunity_dict = prepare_for_mongo(opportunity_obj.dict())
    await db.volunteer_opportunities.insert_one(opportunity_dict)
    return opportunity_obj

@api_router.put("/admin/volunteer-opportunities/{opportunity_id}", response_model=VolunteerOpportunity)
@api_router.put("/admin/opportunities/{opportunity_id}", response_model=VolunteerOpportunity)  # Alternative endpoint to avoid ad blockers
async def admin_update_volunteer_opportunity(opportunity_id: str, opportunity: VolunteerOpportunityCreate, current_user: User = Depends(get_current_user)):
    """Admin updates volunteer opportunity"""
    if current_user.user_type != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    update_data = prepare_for_mongo(opportunity.dict())
    update_data["posted_by"] = current_user.id  # Keep admin as poster
    
    result = await db.volunteer_opportunities.update_one({"id": opportunity_id}, {"$set": update_data})
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Volunteer opportunity not found")
    
    updated_opportunity = await db.volunteer_opportunities.find_one({"id": opportunity_id})
    return VolunteerOpportunity(**parse_from_mongo(updated_opportunity))

@api_router.delete("/admin/volunteer-opportunities/{opportunity_id}")
@api_router.delete("/admin/opportunities/{opportunity_id}")  # Alternative endpoint to avoid ad blockers
async def admin_delete_volunteer_opportunity(opportunity_id: str, current_user: User = Depends(get_current_user)):
    """Admin deletes volunteer opportunity"""
    if current_user.user_type != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db.volunteer_opportunities.delete_one({"id": opportunity_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Volunteer opportunity not found")
    
    return {"message": "Volunteer opportunity deleted successfully"}

@api_router.post("/admin/ec-profiles", response_model=ECProfile)
async def admin_create_ec_profile(profile: ECProfileCreate, current_user: User = Depends(get_current_user)):
    """Admin creates EC profile"""
    if current_user.user_type != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    profile_data = profile.dict()
    profile_obj = ECProfile(**profile_data, submitted_by=current_user.id)
    profile_dict = prepare_for_mongo(profile_obj.dict())
    await db.ec_profiles.insert_one(profile_dict)
    return profile_obj

@api_router.put("/admin/ec-profiles/{profile_id}", response_model=ECProfile)
async def admin_update_ec_profile(profile_id: str, profile: ECProfileCreate, current_user: User = Depends(get_current_user)):
    """Admin updates EC profile"""
    if current_user.user_type != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    update_data = prepare_for_mongo(profile.dict())
    update_data["submitted_by"] = current_user.id  # Keep admin as submitter
    
    result = await db.ec_profiles.update_one({"id": profile_id}, {"$set": update_data})
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="EC profile not found")
    
    updated_profile = await db.ec_profiles.find_one({"id": profile_id})
    return ECProfile(**parse_from_mongo(updated_profile))

@api_router.delete("/admin/ec-profiles/{profile_id}")
async def admin_delete_ec_profile(profile_id: str, current_user: User = Depends(get_current_user)):
    """Admin deletes EC profile"""
    if current_user.user_type != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db.ec_profiles.delete_one({"id": profile_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="EC profile not found")
    
    return {"message": "EC profile deleted successfully"}

@api_router.get("/admin/test")
async def admin_test(current_user: User = Depends(get_current_user)):
    """Test admin access"""
    return {
        "message": "Admin access working",
        "user_email": current_user.email,
        "user_type": current_user.user_type,
        "is_admin": current_user.user_type == "admin"
    }

@api_router.get("/admin/posters", response_model=List[Dict[str, Any]])
async def admin_get_all_posters(current_user: User = Depends(get_current_user)):
    """Admin gets all poster submissions"""
    if current_user.user_type != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    posters = await db.poster_submissions.find({}).to_list(100)
    result = []
    for poster in posters:
        result.append({
            "id": poster["id"],
            "title": poster["title"],
            "authors": poster["authors"],
            "abstract": poster["abstract"],
            "keywords": poster["keywords"],
            "university": poster["university"],
            "program": poster["program"],
            "status": poster.get("status", "pending"),
            "submitted_at": poster.get("submitted_at"),
            "submitted_by": poster.get("submitted_by"),
            "poster_url": poster.get("poster_url"),
            "payment_status": poster.get("payment_status", "not_required"),
            "payment_link": poster.get("payment_link"),
            "payment_completed_at": poster.get("payment_completed_at"),
            "stripe_session_id": poster.get("stripe_session_id")
        })
    return result

@api_router.get("/admin/professor-network", response_model=List[Dict[str, Any]])
async def admin_get_all_professors(current_user: User = Depends(get_current_user)):
    """Admin gets all professor profiles"""
    if current_user.user_type != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    profiles = await db.professor_network.find({}).to_list(100)
    user_ids = [profile.get("user_id") for profile in profiles if profile.get("user_id")]
    users_by_id: Dict[str, Dict[str, Any]] = {}

    if user_ids:
        user_records = await db.users.find({"id": {"$in": user_ids}}).to_list(len(user_ids))
        users_by_id = {record["id"]: record for record in user_records}

    result = []
    for profile in profiles:
        parsed_profile = parse_from_mongo(profile)
        user = users_by_id.get(parsed_profile.get("user_id"))
        result.append({
            **parsed_profile,
            "user_name": user.get("name", "Professor (Admin Created)") if user else "Professor (Admin Created)",
            "user_university": user.get("university", "") if user else ""
        })
    return result

@api_router.get("/admin/volunteer-opportunities", response_model=List[VolunteerOpportunity])
@api_router.get("/admin/opportunities", response_model=List[VolunteerOpportunity])  # Alternative endpoint to avoid ad blockers
async def admin_get_all_volunteer_opportunities(current_user: User = Depends(get_current_user)):
    """Admin gets all volunteer opportunities"""
    if current_user.user_type != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    opportunities = await db.volunteer_opportunities.find({}).to_list(100)
    return [VolunteerOpportunity(**parse_from_mongo(opportunity)) for opportunity in opportunities]

@api_router.get("/admin/ec-profiles", response_model=List[ECProfile])
async def admin_get_all_ec_profiles(current_user: User = Depends(get_current_user)):
    """Admin gets all EC profiles"""
    if current_user.user_type != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    profiles = await db.ec_profiles.find({}).to_list(100)
    return [ECProfile(**parse_from_mongo(profile)) for profile in profiles]

# EC Profile Routes
@api_router.post("/ec-profiles", response_model=ECProfile)
async def create_ec_profile(profile: ECProfileCreate, current_user: User = Depends(get_current_user)):
    profile_data = profile.dict()
    profile_obj = ECProfile(**profile_data, submitted_by=current_user.id)
    profile_dict = prepare_for_mongo(profile_obj.dict())
    await db.ec_profiles.insert_one(profile_dict)
    return profile_obj

@api_router.get("/ec-profiles", response_model=List[ECProfile])
async def get_ec_profiles(medical_school: Optional[str] = None, admission_year: Optional[int] = None):
    query = {}
    if medical_school:
        query["medical_school"] = medical_school
    if admission_year:
        query["admission_year"] = admission_year
    
    profiles = await db.ec_profiles.find(query).to_list(100)
    # Remove submitted_by for anonymity and clean up MongoDB fields
    for profile in profiles:
        profile.pop('submitted_by', None)
        profile = parse_from_mongo(profile)
    return [ECProfile(**profile) for profile in profiles]

@api_router.get("/ec-profiles/stats")
async def get_ec_stats():
    pipeline = [
        {
            "$group": {
                "_id": "$medical_school",
                "avg_gpa": {"$avg": "$undergraduate_gpa"},
                "avg_mcat": {"$avg": "$mcat_score"},
                "count": {"$sum": 1}
            }
        }
    ]
    
    stats = await db.ec_profiles.aggregate(pipeline).to_list(100)
    return stats

# Volunteer Opportunity Routes
@api_router.post("/volunteer-opportunities", response_model=VolunteerOpportunity)
async def create_volunteer_opportunity(opportunity: VolunteerOpportunityCreate, current_user: User = Depends(get_current_user)):
    opportunity_data = opportunity.dict()
    opportunity_obj = VolunteerOpportunity(**opportunity_data, posted_by=current_user.id)
    opportunity_dict = prepare_for_mongo(opportunity_obj.dict())
    await db.volunteer_opportunities.insert_one(opportunity_dict)
    return opportunity_obj

@api_router.get("/volunteer-opportunities", response_model=List[VolunteerOpportunity])
@api_router.get("/opportunities", response_model=List[VolunteerOpportunity])  # Alternative endpoint to avoid ad blockers
async def get_volunteer_opportunities(location: Optional[str] = None):
    query = {}
    if location:
        query["location"] = {"$regex": location, "$options": "i"}
    
    # Only return non-expired opportunities
    query["$or"] = [
        {"expires_at": {"$gte": datetime.now(timezone.utc).isoformat()}},
        {"expires_at": None}
    ]
    
    opportunities = await db.volunteer_opportunities.find(query).to_list(100)
    return [VolunteerOpportunity(**parse_from_mongo(opportunity)) for opportunity in opportunities]

# Student Network Routes
@api_router.post("/student-network", response_model=StudentNetwork)
async def create_student_network_profile(profile: StudentNetworkCreate, current_user: User = Depends(get_current_user)):
    profile_data = profile.dict()
    profile_obj = StudentNetwork(**profile_data, user_id=current_user.id)
    profile_dict = prepare_for_mongo(profile_obj.dict())
    await db.student_network.insert_one(profile_dict)
    return profile_obj

@api_router.get("/student-network", response_model=List[Dict[str, Any]])
async def get_student_network(research_interest: Optional[str] = None):
    query = {"public_profile": True}
    if research_interest:
        query["research_interests"] = {"$regex": research_interest, "$options": "i"}
    
    profiles = await db.student_network.find(query).to_list(100)
    
    # Join with user data
    result = []
    for profile in profiles:
        user = await db.users.find_one({"id": profile["user_id"]})
        if user:
            result.append({
                **parse_from_mongo(profile),
                "user_name": user["name"],
                "user_university": user.get("university", ""),
                "user_program": user.get("program", "")
            })
    
    return result

@api_router.get("/student-network/my", response_model=StudentNetwork)
async def get_my_student_network_profile(current_user: User = Depends(get_current_user)):
    profile = await db.student_network.find_one({"user_id": current_user.id})
    if not profile:
        raise HTTPException(status_code=404, detail="Network profile not found")
    return StudentNetwork(**parse_from_mongo(profile))

@api_router.put("/student-network/my", response_model=StudentNetwork)
async def update_my_student_network_profile(profile_update: StudentNetworkCreate, current_user: User = Depends(get_current_user)):
    existing_profile = await db.student_network.find_one({"user_id": current_user.id})
    if not existing_profile:
        raise HTTPException(status_code=404, detail="Network profile not found")
    
    update_data = prepare_for_mongo(profile_update.dict())
    await db.student_network.update_one({"user_id": current_user.id}, {"$set": update_data})
    updated_profile = await db.student_network.find_one({"user_id": current_user.id})
    return StudentNetwork(**parse_from_mongo(updated_profile))

# Professor Network Routes
@api_router.post("/professor-network", response_model=ProfessorNetwork)
async def create_professor_network_profile(profile: ProfessorNetworkCreate, current_user: User = Depends(get_current_user)):
    if current_user.user_type != "professor":
        raise HTTPException(status_code=403, detail="Only professors can create professor network profiles")
    
    profile_data = profile.dict()
    profile_obj = ProfessorNetwork(**profile_data, user_id=current_user.id, contact_email=current_user.email)
    profile_dict = prepare_for_mongo(profile_obj.dict())
    await db.professor_network.insert_one(profile_dict)
    return profile_obj

@api_router.get("/professor-network", response_model=List[Dict[str, Any]])
async def get_professor_network(research_area: Optional[str] = None, accepting_students: Optional[bool] = None):
    query = {}
    if research_area:
        query["research_areas"] = {"$regex": research_area, "$options": "i"}
    if accepting_students is not None:
        query["accepting_students"] = accepting_students
    
    profiles = await db.professor_network.find(query).to_list(100)
    
    # Join with user data
    result = []
    for profile in profiles:
        user = await db.users.find_one({"id": profile["user_id"]})
        if user:
            result.append({
                **parse_from_mongo(profile),
                "user_name": user["name"],
                "user_university": user.get("university", "")
            })
    
    return result

# Basic Routes
@api_router.get("/")
async def root():
    return {"message": "CURE API - Canadian Undergraduate Research Exchange"}

# ============================================================================
# CURE SOCIAL ENDPOINTS
# ============================================================================

# POST ENDPOINTS
@api_router.post("/social/posts")
async def create_post(post_data: PostCreate, current_user: User = Depends(get_current_user)):
    """Create a new post"""
    if len(post_data.text) > 500:
        raise HTTPException(status_code=400, detail="Post text must be 500 characters or less")
    
    # Extract tags from text if not provided
    tags = post_data.tags or []
    extracted_tags = extract_tags(post_data.text)
    tags.extend(extracted_tags)
    tags = list(set(tags))
    
    # Create post
    post = Post(
        author_id=current_user.id,
        author_type=current_user.role,
        text=post_data.text,
        attachments=post_data.attachments or [],
        tags=tags,
        visibility=post_data.visibility or "public"
    )
    
    await db.posts.insert_one(prepare_for_mongo(post.dict()))
    
    # Create notifications for mentions
    mentions = extract_mentions(post_data.text)
    for mentioned_username in mentions:
        mentioned_user = await db.users.find_one({"name": mentioned_username})
        if mentioned_user:
            await create_notification(mentioned_user["id"], "mention", current_user.id, post.id)
    
    return post

@api_router.get("/social/posts/{post_id}")
async def get_post(post_id: str, request: Request):
    """Get a single post by ID"""
    current_user = await get_current_user_optional(request)
    
    post = await db.posts.find_one({"id": post_id})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    author = await db.users.find_one({"id": post["author_id"]})
    
    # Check if current user liked/following
    is_liked = False
    is_following = False
    if current_user:
        like = await db.likes.find_one({"post_id": post_id, "user_id": current_user.id})
        is_liked = like is not None
        follow = await db.follows.find_one({"follower_id": current_user.id, "followed_id": post["author_id"]})
        is_following = follow is not None
    
    # Increment view count
    await db.posts.update_one({"id": post_id}, {"$inc": {"metrics.views": 1}})
    
    return {
        **parse_from_mongo(post),
        "author_name": author.get("name") if author else "Unknown",
        "author_role": author.get("role") if author else "student",
        "author_picture": author.get("profile_picture") if author else None,
        "author_university": author.get("university") if author else None,
        "is_liked": is_liked,
        "is_following_author": is_following
    }

@api_router.delete("/social/posts/{post_id}")
async def delete_post(post_id: str, current_user: User = Depends(get_current_user)):
    """Delete a post (author or admin only)"""
    post = await db.posts.find_one({"id": post_id})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    if post["author_id"] != current_user.id and current_user.user_type != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this post")
    
    await db.posts.delete_one({"id": post_id})
    await db.comments.delete_many({"post_id": post_id})
    await db.likes.delete_many({"post_id": post_id})
    
    return {"message": "Post deleted successfully"}

# FEED ENDPOINTS
@api_router.get("/social/feed")
async def get_feed(
    request: Request,
    mode: str = "global",
    circle_id: Optional[str] = None,
    cursor: Optional[str] = None,
    limit: int = 20
):
    """Get feed based on mode: following, global, university, circle"""
    current_user = await get_current_user_optional(request)
    query = {"visibility": "public"}
    
    if mode == "following":
        if not current_user:
            raise HTTPException(status_code=401, detail="Authentication required for following feed")
        follows = await db.follows.find({"follower_id": current_user.id}).to_list(length=1000)
        followed_ids = [f["followed_id"] for f in follows]
        if not followed_ids:
            return {"posts": [], "cursor": None, "has_more": False}
        query["author_id"] = {"$in": followed_ids}
    
    elif mode == "university":
        if not current_user:
            raise HTTPException(status_code=401, detail="Authentication required for university feed")
        if not current_user.university:
            raise HTTPException(status_code=400, detail="University information required")
        university_users = await db.users.find({"university": current_user.university}).to_list(length=10000)
        user_ids = [u["id"] for u in university_users]
        query["author_id"] = {"$in": user_ids}
    
    elif mode == "circle":
        if not circle_id:
            raise HTTPException(status_code=400, detail="circle_id required")
        circle = await db.circles.find_one({"id": circle_id})
        if not circle:
            raise HTTPException(status_code=404, detail="Circle not found")
        query["tags"] = {"$in": [circle["slug"], circle["name"].lower()]}
    
    if cursor:
        query["created_at"] = {"$lt": cursor}
    
    posts_cursor = db.posts.find(query).sort("created_at", -1).limit(limit + 1)
    posts = await posts_cursor.to_list(length=limit + 1)
    
    has_more = len(posts) > limit
    if has_more:
        posts = posts[:limit]
    
    # Enrich with author details
    enriched_posts = []
    for post in posts:
        author = await db.users.find_one({"id": post["author_id"]})
        if author:
            is_liked = False
            is_following = False
            if current_user:
                like = await db.likes.find_one({"post_id": post["id"], "user_id": current_user.id})
                is_liked = like is not None
                follow = await db.follows.find_one({"follower_id": current_user.id, "followed_id": post["author_id"]})
                is_following = follow is not None
            
            enriched_posts.append({
                **parse_from_mongo(post),
                "author_name": author.get("name"),
                "author_role": author.get("role", "student"),
                "author_picture": author.get("profile_picture"),
                "author_university": author.get("university"),
                "is_liked": is_liked,
                "is_following_author": is_following
            })
    
    next_cursor = posts[-1]["created_at"].isoformat() if posts and has_more else None
    
    return {"posts": enriched_posts, "cursor": next_cursor, "has_more": has_more}

# ENGAGEMENT ENDPOINTS
@api_router.post("/social/posts/{post_id}/like")
async def like_post(post_id: str, current_user: User = Depends(get_current_user)):
    """Like a post"""
    post = await db.posts.find_one({"id": post_id})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    existing_like = await db.likes.find_one({"post_id": post_id, "user_id": current_user.id})
    if existing_like:
        return {"message": "Post already liked"}
    
    like = Like(post_id=post_id, user_id=current_user.id)
    await db.likes.insert_one(prepare_for_mongo(like.dict()))
    await db.posts.update_one({"id": post_id}, {"$inc": {"metrics.likes": 1}})
    await create_notification(post["author_id"], "like", current_user.id, post_id)
    
    return {"message": "Post liked successfully"}

@api_router.delete("/social/posts/{post_id}/like")
async def unlike_post(post_id: str, current_user: User = Depends(get_current_user)):
    """Unlike a post"""
    result = await db.likes.delete_one({"post_id": post_id, "user_id": current_user.id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Like not found")
    await db.posts.update_one({"id": post_id}, {"$inc": {"metrics.likes": -1}})
    return {"message": "Post unliked successfully"}

@api_router.post("/social/posts/{post_id}/comments")
async def create_comment(post_id: str, comment_data: CommentCreate, current_user: User = Depends(get_current_user)):
    """Create a comment on a post"""
    post = await db.posts.find_one({"id": post_id})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    comment = Comment(
        post_id=post_id,
        author_id=current_user.id,
        text=comment_data.text,
        parent_comment_id=comment_data.parent_comment_id
    )
    
    await db.comments.insert_one(prepare_for_mongo(comment.dict()))
    await db.posts.update_one({"id": post_id}, {"$inc": {"metrics.comments": 1}})
    await create_notification(post["author_id"], "comment", current_user.id, post_id, comment.id)
    
    return comment

@api_router.get("/social/posts/{post_id}/comments")
async def get_comments(post_id: str, cursor: Optional[str] = None, limit: int = 50):
    """Get comments for a post"""
    query = {"post_id": post_id}
    if cursor:
        query["created_at"] = {"$lt": cursor}
    
    comments = await db.comments.find(query).sort("created_at", -1).limit(limit).to_list(length=limit)
    
    # Enrich with author details
    enriched = []
    for comment in comments:
        author = await db.users.find_one({"id": comment["author_id"]})
        if author:
            enriched.append({
                **parse_from_mongo(comment),
                "author_name": author.get("name"),
                "author_picture": author.get("profile_picture"),
                "author_role": author.get("role")
            })
    
    return enriched

@api_router.delete("/social/comments/{comment_id}")
async def delete_comment(comment_id: str, current_user: User = Depends(get_current_user)):
    """Delete a comment"""
    comment = await db.comments.find_one({"id": comment_id})
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    if comment["author_id"] != current_user.id and current_user.user_type != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.comments.delete_one({"id": comment_id})
    await db.posts.update_one({"id": comment["post_id"]}, {"$inc": {"metrics.comments": -1}})
    return {"message": "Comment deleted successfully"}

# FOLLOW ENDPOINTS
@api_router.post("/social/follow/{user_id}")
async def follow_user(user_id: str, current_user: User = Depends(get_current_user)):
    """Follow a user"""
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot follow yourself")
    
    target_user = await db.users.find_one({"id": user_id})
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    existing = await db.follows.find_one({"follower_id": current_user.id, "followed_id": user_id})
    if existing:
        return {"message": "Already following"}
    
    follow = Follow(follower_id=current_user.id, followed_id=user_id)
    await db.follows.insert_one(prepare_for_mongo(follow.dict()))
    await create_notification(user_id, "follow", current_user.id)
    
    return {"message": "User followed successfully"}

@api_router.delete("/social/follow/{user_id}")
async def unfollow_user(user_id: str, current_user: User = Depends(get_current_user)):
    """Unfollow a user"""
    result = await db.follows.delete_one({"follower_id": current_user.id, "followed_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Follow not found")
    return {"message": "User unfollowed successfully"}

@api_router.get("/social/user/{user_id}/followers")
async def get_followers(user_id: str, limit: int = 50):
    """Get user's followers"""
    follows = await db.follows.find({"followed_id": user_id}).limit(limit).to_list(length=limit)
    follower_ids = [f["follower_id"] for f in follows]
    users = await db.users.find({"id": {"$in": follower_ids}}).to_list(length=len(follower_ids))
    return [{"id": u["id"], "name": u.get("name"), "profile_picture": u.get("profile_picture"), "role": u.get("role")} for u in users]

@api_router.get("/social/user/{user_id}/following")
async def get_following(user_id: str, limit: int = 50):
    """Get users that this user follows"""
    follows = await db.follows.find({"follower_id": user_id}).limit(limit).to_list(length=limit)
    followed_ids = [f["followed_id"] for f in follows]
    users = await db.users.find({"id": {"$in": followed_ids}}).to_list(length=len(followed_ids))
    return [{"id": u["id"], "name": u.get("name"), "profile_picture": u.get("profile_picture"), "role": u.get("role")} for u in users]

# CIRCLE ENDPOINTS
@api_router.get("/social/circles")
async def get_circles():
    """Get all circles"""
    circles = await db.circles.find().to_list(length=100)
    return [parse_from_mongo(c) for c in circles]

@api_router.post("/social/circles")
async def create_circle(circle_data: CircleCreate, current_user: User = Depends(get_current_user)):
    """Create a new circle (admin only)"""
    if current_user.user_type != "admin":
        raise HTTPException(status_code=403, detail="Only admins can create circles")
    
    slug = circle_data.name.lower().replace(" ", "-").replace("_", "-")
    existing = await db.circles.find_one({"slug": slug})
    if existing:
        raise HTTPException(status_code=400, detail="Circle already exists")
    
    circle = Circle(
        name=circle_data.name,
        slug=slug,
        description=circle_data.description,
        owner_type="system"
    )
    
    await db.circles.insert_one(prepare_for_mongo(circle.dict()))
    return circle

@api_router.post("/social/circles/{circle_id}/join")
async def join_circle(circle_id: str, current_user: User = Depends(get_current_user)):
    """Join a circle"""
    circle = await db.circles.find_one({"id": circle_id})
    if not circle:
        raise HTTPException(status_code=404, detail="Circle not found")
    
    existing = await db.circle_members.find_one({"circle_id": circle_id, "user_id": current_user.id})
    if existing:
        return {"message": "Already a member"}
    
    member = CircleMember(circle_id=circle_id, user_id=current_user.id)
    await db.circle_members.insert_one(prepare_for_mongo(member.dict()))
    await db.circles.update_one({"id": circle_id}, {"$inc": {"member_count": 1}})
    
    return {"message": "Joined circle successfully"}

@api_router.delete("/social/circles/{circle_id}/leave")
async def leave_circle(circle_id: str, current_user: User = Depends(get_current_user)):
    """Leave a circle"""
    result = await db.circle_members.delete_one({"circle_id": circle_id, "user_id": current_user.id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not a member")
    await db.circles.update_one({"id": circle_id}, {"$inc": {"member_count": -1}})
    return {"message": "Left circle successfully"}

# NOTIFICATION ENDPOINTS
@api_router.get("/social/notifications")
async def get_notifications(cursor: Optional[str] = None, limit: int = 20, current_user: User = Depends(get_current_user)):
    """Get user notifications"""
    query = {"user_id": current_user.id}
    if cursor:
        query["created_at"] = {"$lt": cursor}
    
    notifications = await db.notifications.find(query).sort("created_at", -1).limit(limit).to_list(length=limit)
    
    # Enrich with actor details
    enriched = []
    for notif in notifications:
        actor = await db.users.find_one({"id": notif["actor_id"]})
        if actor:
            enriched.append({
                **parse_from_mongo(notif),
                "actor_name": actor.get("name"),
                "actor_picture": actor.get("profile_picture")
            })
    
    return enriched

@api_router.post("/social/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, current_user: User = Depends(get_current_user)):
    """Mark notification as read"""
    result = await db.notifications.update_one(
        {"id": notification_id, "user_id": current_user.id},
        {"$set": {"read": True}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"message": "Notification marked as read"}

# SEARCH ENDPOINT
@api_router.get("/social/search")
async def search(q: str, type: str = "all", limit: int = 20):
    """Search users, posts, and tags"""
    results = []
    
    if type in ["user", "all"]:
        users = await db.users.find({
            "$or": [
                {"name": {"$regex": q, "$options": "i"}},
                {"email": {"$regex": q, "$options": "i"}},
                {"university": {"$regex": q, "$options": "i"}}
            ]
        }).limit(limit).to_list(length=limit)
        
        for user in users:
            results.append({
                "type": "user",
                "id": user["id"],
                "title": user.get("name"),
                "description": f"{user.get('role', 'student')} at {user.get('university', 'Unknown')}",
                "avatar": user.get("profile_picture")
            })
    
    if type in ["post", "all"]:
        posts = await db.posts.find({
            "$or": [
                {"text": {"$regex": q, "$options": "i"}},
                {"tags": {"$regex": q, "$options": "i"}}
            ],
            "visibility": "public"
        }).sort("created_at", -1).limit(limit).to_list(length=limit)
        
        for post in posts:
            author = await db.users.find_one({"id": post["author_id"]})
            if author:
                results.append({
                    "type": "post",
                    "id": post["id"],
                    "title": post["text"][:100],
                    "description": f"by {author.get('name')}",
                    "avatar": author.get("profile_picture")
                })
    
    return results

# USER STATS ENDPOINT
@api_router.get("/social/user/{user_id}/stats")
async def get_user_stats(user_id: str):
    """Get user's social statistics"""
    followers_count = await db.follows.count_documents({"followed_id": user_id})
    following_count = await db.follows.count_documents({"follower_id": user_id})
    posts_count = await db.posts.count_documents({"author_id": user_id})
    circles_count = await db.circle_members.count_documents({"user_id": user_id})
    
    return {
        "followers_count": followers_count,
        "following_count": following_count,
        "posts_count": posts_count,
        "circles_count": circles_count
    }

# PROFILE UPDATE ENDPOINT
@api_router.patch("/social/profile")
async def update_social_profile(
    bio: Optional[str] = None,
    interests: Optional[List[str]] = None,
    role: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """Update user's social profile"""
    update_data = {}
    if bio is not None:
        update_data["bio"] = bio
    if interests is not None:
        update_data["interests"] = interests
    if role is not None and role in ["student", "professor"]:
        update_data["role"] = role
        
        # Auto-create professor network profile when user becomes professor
        if role == "professor":
            # Check if professor profile already exists
            existing_prof_profile = await db.professor_network.find_one({"user_id": current_user.id})
            if not existing_prof_profile:
                # Create basic professor network profile with user's existing data
                professor_profile = ProfessorNetwork(
                    user_id=current_user.id,
                    department=current_user.program or "Not specified",
                    research_areas=current_user.interests if hasattr(current_user, 'interests') and current_user.interests else interests or [],
                    lab_description=bio or "Newly joined professor",
                    accepting_students=True,
                    contact_email=current_user.email,
                    website=None
                )
                await db.professor_network.insert_one(prepare_for_mongo(professor_profile.dict()))
                print(f"✅ Auto-created professor network profile for {current_user.email}")
    
    if update_data:
        await db.users.update_one({"id": current_user.id}, {"$set": update_data})
    
    updated_user = await db.users.find_one({"id": current_user.id})
    return parse_from_mongo(updated_user)

# Include the router in the main app
app.include_router(api_router)


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
