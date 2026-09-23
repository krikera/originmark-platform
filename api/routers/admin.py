"""
OriginMark API — Admin & Feedback Router.

Endpoints:
    GET   /admin/metrics              — Metrics dashboard
    POST  /feedback                   — Submit user feedback
    GET   /admin/feedback             — List feedback (admin)
    PATCH /admin/feedback/{id}        — Update feedback status (admin)
"""

from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, Form, HTTPException
from sqlalchemy.orm import Session

from db import APIKey, User, UserFeedback, get_db
from dependencies import get_current_user_id, get_optional_api_key
from telemetry import telemetry

router = APIRouter(tags=["admin"])

def require_admin(user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)) -> User:
    """Verify that the user or API key belongs to an admin user."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin privileges required")
    return user


@router.get("/admin/metrics")
async def get_admin_metrics(
    days: int = 7,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Get metrics dashboard for admin users"""
    await telemetry.update_daily_summary(db)
    metrics = await telemetry.get_metrics_summary(db, days)
    return metrics


@router.post("/feedback")
async def submit_feedback(
    feedback_type: str = Form(...),
    message: str = Form(...),
    rating: Optional[int] = Form(None),
    page_url: Optional[str] = Form(None),
    api_key: Optional[APIKey] = Depends(get_optional_api_key),
    db: Session = Depends(get_db),
):
    """Submit user feedback"""
    try:
        valid_types = ["bug", "feature", "general"]
        if feedback_type not in valid_types:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid feedback type. Must be one of: {', '.join(valid_types)}",
            )

        if rating is not None and (rating < 1 or rating > 5):
            raise HTTPException(
                status_code=400,
                detail="Rating must be between 1 and 5",
            )

        feedback_id = await telemetry.record_feedback(
            db=db,
            feedback_type=feedback_type,
            message=message,
            user_id=api_key.user_id if api_key else None,
            rating=rating,
            page_url=page_url,
            metadata={
                "api_version": "0.1.0",
                "timestamp": datetime.now(timezone.utc).isoformat(),
            },
        )

        return {
            "message": "Thank you for your feedback!",
            "feedback_id": feedback_id,
            "status": "submitted",
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/admin/feedback")
async def get_feedback(
    status: Optional[str] = None,
    limit: int = 50,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Get user feedback (admin only)"""
    query = db.query(UserFeedback)

    if status:
        query = query.filter(UserFeedback.status == status)

    feedback_items = query.order_by(
        UserFeedback.created_at.desc()
    ).limit(limit).all()

    return {
        "feedback": [
            {
                "id": item.id,
                "type": item.feedback_type,
                "message": item.message,
                "rating": item.rating,
                "page_url": item.page_url,
                "user_id": item.user_id,
                "created_at": item.created_at.isoformat(),
                "status": item.status,
            }
            for item in feedback_items
        ],
        "total": len(feedback_items),
    }


@router.patch("/admin/feedback/{feedback_id}")
async def update_feedback_status(
    feedback_id: str,
    status: str,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Update feedback status (admin only)"""
    valid_statuses = ["new", "reviewed", "resolved"]
    if status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}",
        )

    feedback = db.query(UserFeedback).filter(
        UserFeedback.id == feedback_id
    ).first()

    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")

    feedback.status = status
    db.commit()

    return {"message": "Feedback status updated", "new_status": status}
