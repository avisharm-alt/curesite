from fastapi import FastAPI, APIRouter, HTTPException, Depends, File, UploadFile, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import JSONResponse, RedirectResponse, FileResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
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
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection with fallbacks for development
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db_name = os.environ.get('DB_NAME', 'cure_db')
db = client[db_name]

# Log connection info (without sensitive data)
print(f"📊 Connecting to database: {db_name}")
print(f"🔗 MongoDB host: {mongo_url.split('@')[-1] if '@' in mongo_url else mongo_url}")

# Security
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'fallback_secret_key')
ALGORITHM = os.environ.get('JWT_ALGORITHM', 'HS256')
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# SendGrid Configuration
SENDGRID_API_KEY = os.environ.get('SENDGRID_API_KEY', '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')
SENDGRID_FROM_EMAIL = os.environ.get('SENDGRID_FROM_EMAIL', 'curejournal@gmail.com')

# Stripe Payment Configuration
STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/cNi6oJdBXd8j4COeMqgrS00'

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
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Local development
        "https://localhost:3000",  # Local development HTTPS
        os.environ.get("FRONTEND_URL", "*"),  # Production frontend URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    email: EmailStr
    name: str
    profile_picture: Optional[str] = None
    university: Optional[str] = None
    program: Optional[str] = None
    year: Optional[int] = None
    user_type: Optional[str] = None

class PosterSubmission(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    authors: List[str]
    abstract: str
    keywords: List[str]
    university: str
    program: str
    poster_url: Optional[str] = None
    submitted_by: str  # user_id
    status: str = "pending"  # pending, approved, rejected
    submitted_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    reviewed_at: Optional[datetime] = None
    reviewer_id: Optional[str] = None
    reviewer_comments: Optional[str] = None
    payment_status: str = "not_required"  # not_required, pending, completed
    payment_link: Optional[str] = None
    payment_completed_at: Optional[datetime] = None

class PosterSubmissionCreate(BaseModel):
    title: str
    authors: List[str]
    abstract: str
    keywords: List[str]
    university: str
    program: str
    poster_url: Optional[str] = None

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
    description: str
    location: str
    contact_email: str
    contact_phone: Optional[str] = None
    requirements: List[str] = []
    time_commitment: str
    medical_relevant: bool = True
    posted_by: str  # user_id
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    expires_at: Optional[datetime] = None

class VolunteerOpportunityCreate(BaseModel):
    title: str
    organization: str
    description: str
    location: str
    contact_email: EmailStr
    contact_phone: Optional[str] = None
    requirements: List[str] = []
    time_commitment: str
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

# Email sending function
async def send_acceptance_email(user_email: str, user_name: str, poster_title: str):
    """Send acceptance email with payment link to student"""
    try:
        message = Mail(
            from_email=SENDGRID_FROM_EMAIL,
            to_emails=user_email,
            subject='🎉 Congratulations! Your Research Poster Has Been Accepted',
            html_content=f"""
            <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #2563eb;">Congratulations, {user_name}!</h2>
                        
                        <p>We are thrilled to inform you that your research poster has been accepted for publication in the CURE Journal network!</p>
                        
                        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="margin-top: 0; color: #1f2937;">Accepted Poster:</h3>
                            <p style="font-weight: bold; color: #2563eb;">{poster_title}</p>
                        </div>
                        
                        <h3 style="color: #1f2937;">Next Steps:</h3>
                        <ol>
                            <li>Visit your profile on the CURE platform</li>
                            <li>Find your accepted poster with the payment link</li>
                            <li>Complete the payment to publish your poster on the network</li>
                            <li>Your poster will be visible to the entire community after payment confirmation</li>
                        </ol>
                        
                        <p style="margin-top: 30px;">
                            <a href="{STRIPE_PAYMENT_LINK}" 
                               style="background-color: #2563eb; color: white; padding: 12px 24px; 
                                      text-decoration: none; border-radius: 6px; display: inline-block;">
                                Complete Payment Now
                            </a>
                        </p>
                        
                        <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
                            You can also find this payment link in your profile under "My Submissions".
                        </p>
                        
                        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                        
                        <p style="color: #6b7280; font-size: 12px;">
                            Best regards,<br>
                            The CURE Journal Team
                        </p>
                    </div>
                </body>
            </html>
            """
        )
        
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        response = sg.send(message)
        print(f"✅ Acceptance email sent to {user_email} - Status: {response.status_code}")
        return True
    except Exception as e:
        print(f"❌ Error sending acceptance email to {user_email}: {str(e)}")
        return False

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

        # Redirect to frontend with token and user data
        frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
        user_data_encoded = quote(user.json())
        redirect_url = f"{frontend_url}/?token={access_token}&user={user_data_encoded}"

        return RedirectResponse(url=redirect_url)

    except Exception as e:
        # Redirect to frontend with error
        frontend_url = request.url.scheme + "://" + request.url.netloc
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
async def update_profile(user_update: UserCreate, current_user: User = Depends(get_current_user)):
    update_data = prepare_for_mongo(user_update.dict(exclude_unset=True))
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
    """Upload poster file and return file path"""
    if not file.filename.lower().endswith(('.pdf', '.png', '.jpg', '.jpeg')):
        raise HTTPException(status_code=400, detail="Only PDF and image files are allowed")
    
    # Create uploads directory if it doesn't exist
    upload_dir = Path("/app/uploads")
    upload_dir.mkdir(exist_ok=True)
    
    # Generate unique filename
    file_extension = Path(file.filename).suffix
    unique_filename = f"{current_user.id}_{uuid.uuid4()}{file_extension}"
    file_path = upload_dir / unique_filename
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    return {"file_path": str(file_path), "filename": unique_filename}

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
        update_data["payment_link"] = STRIPE_PAYMENT_LINK
        
        # Get user details for logging
        user = await db.users.find_one({"id": poster["submitted_by"]})
        if user:
            print(f"📧 Poster approved for {user['name']} ({user['email']})")
            print(f"   Title: {poster['title']}")
            print(f"   Payment link set: {STRIPE_PAYMENT_LINK}")
            print(f"   ⚠️  Remember to notify student via email manually!")
    
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
    """View approved poster inline (public access)"""
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
            "poster_url": poster.get("poster_url")
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

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc)}

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
