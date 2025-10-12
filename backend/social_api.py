"""
CURE Social - API Endpoints
RESTful API for social networking features
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorDatabase
import re

from social_models import (
    Post, PostCreate, PostResponse, Comment, CommentCreate,
    Follow, Circle, CircleCreate, CircleMember, Notification,
    Like, FeedResponse, UserSocialStats, SearchQuery, SearchResult
)

# Create router
social_router = APIRouter(prefix="/api/social", tags=["social"])


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def extract_tags(text: str) -> List[str]:
    """Extract #hashtags from text"""
    return list(set(re.findall(r'#(\w+)', text)))


def extract_mentions(text: str) -> List[str]:
    """Extract @mentions from text"""
    return list(set(re.findall(r'@(\w+)', text)))


async def get_post_with_author(db: AsyncIOMotorDatabase, post_id: str, current_user_id: Optional[str] = None) -> Optional[PostResponse]:
    """Get post with author details and engagement status"""
    post = await db.posts.find_one({"id": post_id})
    if not post:
        return None
    
    author = await db.users.find_one({"id": post["author_id"]})
    if not author:
        return None
    
    # Check if current user liked this post
    is_liked = False
    is_following = False
    if current_user_id:
        like = await db.likes.find_one({"post_id": post_id, "user_id": current_user_id})
        is_liked = like is not None
        
        follow = await db.follows.find_one({"follower_id": current_user_id, "followed_id": post["author_id"]})
        is_following = follow is not None
    
    return PostResponse(
        id=post["id"],
        author_id=post["author_id"],
        author_name=author.get("name", "Unknown"),
        author_role=author.get("role", "student"),
        author_picture=author.get("profile_picture"),
        author_university=author.get("university"),
        text=post["text"],
        attachments=post.get("attachments", []),
        tags=post.get("tags", []),
        visibility=post.get("visibility", "public"),
        metrics=post.get("metrics", {"likes": 0, "comments": 0, "reposts": 0, "views": 0}),
        created_at=post.get("created_at"),
        is_liked=is_liked,
        is_following_author=is_following
    )


async def create_notification(db: AsyncIOMotorDatabase, user_id: str, type: str, actor_id: str, 
                              post_id: Optional[str] = None, comment_id: Optional[str] = None):
    """Create a notification for a user"""
    if user_id == actor_id:  # Don't notify yourself
        return
    
    notification = Notification(
        user_id=user_id,
        type=type,
        actor_id=actor_id,
        post_id=post_id,
        comment_id=comment_id
    )
    await db.notifications.insert_one(notification.dict())


# ============================================================================
# POST ENDPOINTS
# ============================================================================

@social_router.post("/posts", response_model=PostResponse)
async def create_post(
    post_data: PostCreate,
    current_user = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Create a new post"""
    # Validate text length
    if len(post_data.text) > 500:
        raise HTTPException(status_code=400, detail="Post text must be 500 characters or less")
    
    # Extract tags from text if not provided
    tags = post_data.tags or []
    extracted_tags = extract_tags(post_data.text)
    tags.extend(extracted_tags)
    tags = list(set(tags))  # Remove duplicates
    
    # Create post
    post = Post(
        author_id=current_user.id,
        author_type=current_user.role,
        text=post_data.text,
        attachments=post_data.attachments or [],
        tags=tags,
        visibility=post_data.visibility or "public"
    )
    
    await db.posts.insert_one(post.dict())
    
    # Create notifications for mentions
    mentions = extract_mentions(post_data.text)
    for mentioned_username in mentions:
        mentioned_user = await db.users.find_one({"name": mentioned_username})
        if mentioned_user:
            await create_notification(db, mentioned_user["id"], "mention", current_user.id, post.id)
    
    return await get_post_with_author(db, post.id, current_user.id)


@social_router.get("/posts/{post_id}", response_model=PostResponse)
async def get_post(
    post_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user = Depends(get_current_user_optional)
):
    """Get a single post by ID"""
    current_user_id = current_user.id if current_user else None
    post = await get_post_with_author(db, post_id, current_user_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Increment view count
    await db.posts.update_one(
        {"id": post_id},
        {"$inc": {"metrics.views": 1}}
    )
    
    return post


@social_router.delete("/posts/{post_id}")
async def delete_post(
    post_id: str,
    current_user = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Delete a post (author or admin only)"""
    post = await db.posts.find_one({"id": post_id})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Check permissions
    if post["author_id"] != current_user.id and current_user.user_type != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this post")
    
    await db.posts.delete_one({"id": post_id})
    await db.comments.delete_many({"post_id": post_id})
    await db.likes.delete_many({"post_id": post_id})
    
    return {"message": "Post deleted successfully"}


# ============================================================================
# FEED ENDPOINTS
# ============================================================================

@social_router.get("/feed", response_model=FeedResponse)
async def get_feed(
    mode: str = Query("global", description="Feed mode: following, global, university, circle"),
    circle_id: Optional[str] = None,
    cursor: Optional[str] = None,
    limit: int = Query(20, le=50),
    current_user = Depends(get_current_user_optional),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get feed based on mode"""
    query = {"visibility": "public"}
    
    if mode == "following":
        if not current_user:
            raise HTTPException(status_code=401, detail="Authentication required for following feed")
        
        # Get list of followed users
        follows = await db.follows.find({"follower_id": current_user.id}).to_list(length=1000)
        followed_ids = [f["followed_id"] for f in follows]
        
        if not followed_ids:
            return FeedResponse(posts=[], has_more=False)
        
        query["author_id"] = {"$in": followed_ids}
    
    elif mode == "university":
        if not current_user or not current_user.university:
            raise HTTPException(status_code=400, detail="University information required")
        
        # Get posts from users at same university
        university_users = await db.users.find({"university": current_user.university}).to_list(length=10000)
        user_ids = [u["id"] for u in university_users]
        query["author_id"] = {"$in": user_ids}
    
    elif mode == "circle":
        if not circle_id:
            raise HTTPException(status_code=400, detail="circle_id required for circle feed")
        
        # Get circle
        circle = await db.circles.find_one({"id": circle_id})
        if not circle:
            raise HTTPException(status_code=404, detail="Circle not found")
        
        # Posts with tags matching circle
        query["tags"] = {"$in": [circle["slug"], circle["name"].lower()]}
    
    # Apply cursor for pagination
    if cursor:
        query["created_at"] = {"$lt": cursor}
    
    # Get posts
    posts_cursor = db.posts.find(query).sort("created_at", -1).limit(limit + 1)
    posts = await posts_cursor.to_list(length=limit + 1)
    
    has_more = len(posts) > limit
    if has_more:
        posts = posts[:limit]
    
    # Enrich with author details
    current_user_id = current_user.id if current_user else None
    post_responses = []
    for post in posts:
        post_response = await get_post_with_author(db, post["id"], current_user_id)
        if post_response:
            post_responses.append(post_response)
    
    next_cursor = posts[-1]["created_at"].isoformat() if posts and has_more else None
    
    return FeedResponse(posts=post_responses, cursor=next_cursor, has_more=has_more)


# ============================================================================
# ENGAGEMENT ENDPOINTS (Likes, Comments)
# ============================================================================

@social_router.post("/posts/{post_id}/like")
async def like_post(
    post_id: str,
    current_user = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Like a post"""
    post = await db.posts.find_one({"id": post_id})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Check if already liked
    existing_like = await db.likes.find_one({"post_id": post_id, "user_id": current_user.id})
    if existing_like:
        return {"message": "Post already liked"}
    
    # Create like
    like = Like(post_id=post_id, user_id=current_user.id)
    await db.likes.insert_one(like.dict())
    
    # Update metrics
    await db.posts.update_one({"id": post_id}, {"$inc": {"metrics.likes": 1}})
    
    # Create notification
    await create_notification(db, post["author_id"], "like", current_user.id, post_id)
    
    return {"message": "Post liked successfully"}


@social_router.delete("/posts/{post_id}/like")
async def unlike_post(
    post_id: str,
    current_user = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Unlike a post"""
    result = await db.likes.delete_one({"post_id": post_id, "user_id": current_user.id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Like not found")
    
    # Update metrics
    await db.posts.update_one({"id": post_id}, {"$inc": {"metrics.likes": -1}})
    
    return {"message": "Post unliked successfully"}


@social_router.post("/posts/{post_id}/comments", response_model=Comment)
async def create_comment(
    post_id: str,
    comment_data: CommentCreate,
    current_user = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
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
    
    await db.comments.insert_one(comment.dict())
    
    # Update metrics
    await db.posts.update_one({"id": post_id}, {"$inc": {"metrics.comments": 1}})
    
    # Create notification
    await create_notification(db, post["author_id"], "comment", current_user.id, post_id, comment.id)
    
    return comment


@social_router.get("/posts/{post_id}/comments")
async def get_comments(
    post_id: str,
    cursor: Optional[str] = None,
    limit: int = Query(50, le=100),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get comments for a post"""
    query = {"post_id": post_id}
    if cursor:
        query["created_at"] = {"$lt": cursor}
    
    comments_cursor = db.comments.find(query).sort("created_at", -1).limit(limit)
    comments = await comments_cursor.to_list(length=limit)
    
    # Enrich with author details
    enriched_comments = []
    for comment in comments:
        author = await db.users.find_one({"id": comment["author_id"]})
        if author:
            comment["author_name"] = author.get("name")
            comment["author_picture"] = author.get("profile_picture")
            comment["author_role"] = author.get("role")
            enriched_comments.append(comment)
    
    return enriched_comments


@social_router.delete("/comments/{comment_id}")
async def delete_comment(
    comment_id: str,
    current_user = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Delete a comment (author or admin only)"""
    comment = await db.comments.find_one({"id": comment_id})
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    # Check permissions
    if comment["author_id"] != current_user.id and current_user.user_type != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this comment")
    
    await db.comments.delete_one({"id": comment_id})
    
    # Update metrics
    await db.posts.update_one({"id": comment["post_id"]}, {"$inc": {"metrics.comments": -1}})
    
    return {"message": "Comment deleted successfully"}


# ============================================================================
# FOLLOW ENDPOINTS
# ============================================================================

@social_router.post("/follow/{user_id}")
async def follow_user(
    user_id: str,
    current_user = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Follow a user"""
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot follow yourself")
    
    # Check if user exists
    target_user = await db.users.find_one({"id": user_id})
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if already following
    existing_follow = await db.follows.find_one({"follower_id": current_user.id, "followed_id": user_id})
    if existing_follow:
        return {"message": "Already following this user"}
    
    # Create follow
    follow = Follow(follower_id=current_user.id, followed_id=user_id)
    await db.follows.insert_one(follow.dict())
    
    # Create notification
    await create_notification(db, user_id, "follow", current_user.id)
    
    return {"message": "User followed successfully"}


@social_router.delete("/follow/{user_id}")
async def unfollow_user(
    user_id: str,
    current_user = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Unfollow a user"""
    result = await db.follows.delete_one({"follower_id": current_user.id, "followed_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Follow relationship not found")
    
    return {"message": "User unfollowed successfully"}


@social_router.get("/user/{user_id}/followers")
async def get_followers(
    user_id: str,
    limit: int = Query(50, le=100),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get user's followers"""
    follows = await db.follows.find({"followed_id": user_id}).limit(limit).to_list(length=limit)
    follower_ids = [f["follower_id"] for f in follows]
    
    # Get user details
    users = await db.users.find({"id": {"$in": follower_ids}}).to_list(length=len(follower_ids))
    
    return [{"id": u["id"], "name": u.get("name"), "profile_picture": u.get("profile_picture"), "role": u.get("role")} for u in users]


@social_router.get("/user/{user_id}/following")
async def get_following(
    user_id: str,
    limit: int = Query(50, le=100),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get users that this user follows"""
    follows = await db.follows.find({"follower_id": user_id}).limit(limit).to_list(length=limit)
    followed_ids = [f["followed_id"] for f in follows]
    
    # Get user details
    users = await db.users.find({"id": {"$in": followed_ids}}).to_list(length=len(followed_ids))
    
    return [{"id": u["id"], "name": u.get("name"), "profile_picture": u.get("profile_picture"), "role": u.get("role")} for u in users]


# ============================================================================
# CIRCLE ENDPOINTS
# ============================================================================

@social_router.get("/circles")
async def get_circles(
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get all circles"""
    circles = await db.circles.find().to_list(length=100)
    return circles


@social_router.post("/circles", response_model=Circle)
async def create_circle(
    circle_data: CircleCreate,
    current_user = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Create a new circle (admin only for now)"""
    if current_user.user_type != "admin":
        raise HTTPException(status_code=403, detail="Only admins can create circles")
    
    # Generate slug
    slug = circle_data.name.lower().replace(" ", "-").replace("_", "-")
    
    # Check if circle already exists
    existing = await db.circles.find_one({"slug": slug})
    if existing:
        raise HTTPException(status_code=400, detail="Circle already exists")
    
    circle = Circle(
        name=circle_data.name,
        slug=slug,
        description=circle_data.description,
        owner_type="system"
    )
    
    await db.circles.insert_one(circle.dict())
    return circle


@social_router.post("/circles/{circle_id}/join")
async def join_circle(
    circle_id: str,
    current_user = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Join a circle"""
    circle = await db.circles.find_one({"id": circle_id})
    if not circle:
        raise HTTPException(status_code=404, detail="Circle not found")
    
    # Check if already a member
    existing = await db.circle_members.find_one({"circle_id": circle_id, "user_id": current_user.id})
    if existing:
        return {"message": "Already a member of this circle"}
    
    # Create membership
    member = CircleMember(circle_id=circle_id, user_id=current_user.id)
    await db.circle_members.insert_one(member.dict())
    
    # Update member count
    await db.circles.update_one({"id": circle_id}, {"$inc": {"member_count": 1}})
    
    return {"message": "Joined circle successfully"}


@social_router.delete("/circles/{circle_id}/leave")
async def leave_circle(
    circle_id: str,
    current_user = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Leave a circle"""
    result = await db.circle_members.delete_one({"circle_id": circle_id, "user_id": current_user.id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not a member of this circle")
    
    # Update member count
    await db.circles.update_one({"id": circle_id}, {"$inc": {"member_count": -1}})
    
    return {"message": "Left circle successfully"}


@social_router.get("/circles/{circle_id}/feed", response_model=FeedResponse)
async def get_circle_feed(
    circle_id: str,
    cursor: Optional[str] = None,
    limit: int = Query(20, le=50),
    current_user = Depends(get_current_user_optional),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get feed for a specific circle"""
    return await get_feed("circle", circle_id=circle_id, cursor=cursor, limit=limit, current_user=current_user, db=db)


# ============================================================================
# NOTIFICATION ENDPOINTS
# ============================================================================

@social_router.get("/notifications")
async def get_notifications(
    cursor: Optional[str] = None,
    limit: int = Query(20, le=50),
    current_user = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get user notifications"""
    query = {"user_id": current_user.id}
    if cursor:
        query["created_at"] = {"$lt": cursor}
    
    notifications_cursor = db.notifications.find(query).sort("created_at", -1).limit(limit)
    notifications = await notifications_cursor.to_list(length=limit)
    
    # Enrich with actor details
    enriched = []
    for notif in notifications:
        actor = await db.users.find_one({"id": notif["actor_id"]})
        if actor:
            notif["actor_name"] = actor.get("name")
            notif["actor_picture"] = actor.get("profile_picture")
            enriched.append(notif)
    
    return enriched


@social_router.post("/notifications/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    current_user = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Mark a notification as read"""
    result = await db.notifications.update_one(
        {"id": notification_id, "user_id": current_user.id},
        {"$set": {"read": True}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    return {"message": "Notification marked as read"}


# ============================================================================
# SEARCH ENDPOINT
# ============================================================================

@social_router.get("/search")
async def search(
    q: str = Query(..., min_length=2),
    type: str = Query("all", description="Search type: user, post, tag, all"),
    limit: int = Query(20, le=50),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Search users, posts, and tags"""
    results = []
    
    if type in ["user", "all"]:
        # Search users
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
                "avatar": user.get("profile_picture"),
                "metadata": {"university": user.get("university"), "role": user.get("role")}
            })
    
    if type in ["post", "all"]:
        # Search posts
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
                    "avatar": author.get("profile_picture"),
                    "metadata": {"author": author.get("name"), "tags": post.get("tags", [])}
                })
    
    if type in ["tag", "all"]:
        # Search tags
        posts_with_tag = await db.posts.find({
            "tags": {"$regex": q, "$options": "i"}
        }).to_list(length=100)
        
        tag_counts = {}
        for post in posts_with_tag:
            for tag in post.get("tags", []):
                if q.lower() in tag.lower():
                    tag_counts[tag] = tag_counts.get(tag, 0) + 1
        
        for tag, count in sorted(tag_counts.items(), key=lambda x: x[1], reverse=True)[:10]:
            results.append({
                "type": "tag",
                "id": tag,
                "title": f"#{tag}",
                "description": f"{count} posts",
                "metadata": {"count": count}
            })
    
    return results


# ============================================================================
# STATS ENDPOINT
# ============================================================================

@social_router.get("/user/{user_id}/stats", response_model=UserSocialStats)
async def get_user_stats(
    user_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get user's social statistics"""
    followers_count = await db.follows.count_documents({"followed_id": user_id})
    following_count = await db.follows.count_documents({"follower_id": user_id})
    posts_count = await db.posts.count_documents({"author_id": user_id})
    circles_count = await db.circle_members.count_documents({"user_id": user_id})
    
    return UserSocialStats(
        followers_count=followers_count,
        following_count=following_count,
        posts_count=posts_count,
        circles_count=circles_count
    )
