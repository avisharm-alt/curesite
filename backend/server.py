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

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'fallback_secret_key')
ALGORITHM = os.environ.get('JWT_ALGORITHM', 'HS256')
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# OAuth Setup
oauth = OAuth()
oauth.register(
    name='google',
    client_id=os.environ['GOOGLE_CLIENT_ID'],
    client_secret=os.environ['GOOGLE_CLIENT_SECRET'],
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={
        'scope': 'openid email profile'
    }
)

# Create the main app
app = FastAPI(title="CURE - Canadian Undergraduate Research Exchange")

# Add session middleware
app.add_middleware(SessionMiddleware, secret_key=secrets.token_urlsafe(32))

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
    submitted_by: str  # user_id
    status: str = "pending"  # pending, approved, rejected
    submitted_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    reviewed_at: Optional[datetime] = None
    reviewer_id: Optional[str] = None
    reviewer_comments: Optional[str] = None

class PosterSubmissionCreate(BaseModel):
    title: str
    authors: List[str]
    abstract: str
    keywords: List[str]
    university: str
    program: str

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
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        
        user = await db.users.find_one({"id": user_id})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return User(**user)
    except jwt.PyJWTError:
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
    return item

# Authentication Routes
@api_router.get("/auth/google")
async def google_auth(request: Request):
    # Use exact redirect URI that matches Google Console configuration
    redirect_uri = "https://academiccure.preview.emergentagent.com/api/auth/google/callback"
    return await oauth.google.authorize_redirect(request, redirect_uri)

@api_router.get("/auth/google/callback")
async def google_callback(request: Request):
    try:
        token = await oauth.google.authorize_access_token(request)
        user_info = token.get('userinfo')
        
        if not user_info:
            raise HTTPException(status_code=400, detail="Failed to get user info from Google")
        
        # Check if user exists
        existing_user = await db.users.find_one({"email": user_info['email']})
        
        if existing_user:
            user = User(**parse_from_mongo(existing_user))
        else:
            # Create new user
            user_data = UserCreate(
                email=user_info['email'],
                name=user_info['name']
            )
            
            # Set admin role for curejournal@gmail.com
            user_type = "admin" if user_info['email'] == "curejournal@gmail.com" else "student"
            
            user = User(**user_data.dict(), 
                       profile_picture=user_info.get('picture'),
                       user_type=user_type,
                       verified=True if user_type == "admin" else False)
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
        
        # Create JWT token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.id}, expires_delta=access_token_expires
        )
        
        # Redirect to frontend with token and user data
        frontend_url = request.url.scheme + "://" + request.url.netloc
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
    query = {}
    if status:
        query["status"] = status
    if university:
        query["university"] = university
    
    posters = await db.poster_submissions.find(query).to_list(100)
    return [PosterSubmission(**parse_from_mongo(poster)) for poster in posters]

@api_router.get("/posters/my", response_model=List[PosterSubmission])
async def get_my_posters(current_user: User = Depends(get_current_user)):
    posters = await db.poster_submissions.find({"submitted_by": current_user.id}).to_list(100)
    return [PosterSubmission(**parse_from_mongo(poster)) for poster in posters]

@api_router.put("/posters/{poster_id}/review")
async def review_poster(poster_id: str, status: str, comments: Optional[str] = None, current_user: User = Depends(get_current_user)):
    if current_user.user_type not in ["admin", "professor"]:
        raise HTTPException(status_code=403, detail="Not authorized to review posters")
    
    update_data = {
        "status": status,
        "reviewed_at": datetime.now(timezone.utc).isoformat(),
        "reviewer_id": current_user.id,
        "reviewer_comments": comments
    }
    
    await db.poster_submissions.update_one({"id": poster_id}, {"$set": update_data})
    updated_poster = await db.poster_submissions.find_one({"id": poster_id})
    return PosterSubmission(**parse_from_mongo(updated_poster))

@api_router.get("/admin/posters/pending", response_model=List[PosterSubmission])
async def get_pending_posters(current_user: User = Depends(get_current_user)):
    if current_user.user_type != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    posters = await db.poster_submissions.find({"status": "pending"}).to_list(100)
    return [PosterSubmission(**parse_from_mongo(poster)) for poster in posters]

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

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()