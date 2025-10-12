"""
CURE Social - Data Models
Academic social networking models for posts, comments, follows, circles, and notifications
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
import uuid


# ============================================================================
# SOCIAL MODELS
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


class PostView(BaseModel):
    """Track post views"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    post_id: str
    user_id: Optional[str] = None  # can be anonymous
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ============================================================================
# RESPONSE MODELS
# ============================================================================

class PostResponse(BaseModel):
    """Enhanced post response with author details"""
    id: str
    author_id: str
    author_name: str
    author_role: str
    author_picture: Optional[str] = None
    author_university: Optional[str] = None
    text: str
    attachments: List[Dict[str, str]] = []
    tags: List[str] = []
    visibility: str
    metrics: Dict[str, int]
    created_at: datetime
    is_liked: bool = False  # whether current user liked it
    is_following_author: bool = False  # whether current user follows author


class FeedResponse(BaseModel):
    """Feed response with posts and cursor"""
    posts: List[PostResponse]
    cursor: Optional[str] = None
    has_more: bool = False


class UserSocialStats(BaseModel):
    """User's social statistics"""
    followers_count: int = 0
    following_count: int = 0
    posts_count: int = 0
    circles_count: int = 0


# ============================================================================
# SEARCH MODELS
# ============================================================================

class SearchQuery(BaseModel):
    """Search request"""
    q: str
    type: Optional[str] = "all"  # user, post, tag, all
    limit: Optional[int] = 20


class SearchResult(BaseModel):
    """Search result item"""
    type: str  # user, post, tag
    id: str
    title: str
    description: Optional[str] = None
    avatar: Optional[str] = None
    metadata: Dict[str, Any] = {}
