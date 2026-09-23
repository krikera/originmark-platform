"""
OriginMark API — Webhook Management Router.

Endpoints:
    POST   /webhooks              — Create a new webhook (JWT or API key)
    GET    /webhooks              — List all webhooks (JWT or API key)
    DELETE /webhooks/{webhook_id} — Delete a webhook (JWT or API key)
"""

import json
import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from db import WebhookModel, get_db
from dependencies import get_current_user_id
from webhooks import WebhookConfig, WebhookEvent, WebhookType, is_safe_url, webhook_manager

router = APIRouter(prefix="/webhooks", tags=["webhooks"])


class CreateWebhookRequest(BaseModel):
    name: str
    url: str
    type: WebhookType
    events: list[WebhookEvent]
    secret: Optional[str] = None


@router.post("")
async def create_webhook(
    webhook_data: CreateWebhookRequest,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Create a new webhook"""
    if not is_safe_url(webhook_data.url):
        raise HTTPException(status_code=400, detail="Invalid or unsafe webhook URL")

    webhook_id = str(uuid.uuid4())

    webhook_config = WebhookConfig(
        id=webhook_id,
        name=webhook_data.name,
        url=webhook_data.url,
        type=webhook_data.type,
        events=webhook_data.events,
        secret=webhook_data.secret,
        user_id=user_id,
    )

    webhook_manager.webhooks[webhook_id] = webhook_config

    db_webhook = WebhookModel(
        id=webhook_id,
        name=webhook_data.name,
        url=str(webhook_data.url),
        type=webhook_data.type.value if hasattr(webhook_data.type, "value") else str(webhook_data.type),
        events_json=json.dumps([e.value if hasattr(e, "value") else str(e) for e in webhook_data.events]),
        secret=webhook_data.secret,
        user_id=user_id,
        is_active=True,
    )
    db.add(db_webhook)
    db.commit()

    return {
        "message": "Webhook created successfully",
        "webhook_id": webhook_id,
        "name": webhook_data.name,
        "type": webhook_data.type,
    }


@router.get("")
async def list_webhooks(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """List all webhooks for the authenticated user"""
    db_webhooks = db.query(WebhookModel).filter(
        WebhookModel.user_id == user_id,
        WebhookModel.is_active == True,
    ).all()

    webhooks = [
        {
            "id": webhook.id,
            "name": webhook.name,
            "url": webhook.url,
            "type": webhook.type,
            "events": json.loads(webhook.events_json) if webhook.events_json else [],
            "is_active": webhook.is_active,
        }
        for webhook in db_webhooks
    ]

    return {"webhooks": webhooks}


@router.delete("/{webhook_id}")
async def delete_webhook(
    webhook_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Delete a webhook"""
    db_webhook = db.query(WebhookModel).filter(WebhookModel.id == webhook_id).first()

    if not db_webhook and webhook_id not in webhook_manager.webhooks:
        raise HTTPException(status_code=404, detail="Webhook not found")

    if db_webhook:
        if db_webhook.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to delete this webhook")
        db.delete(db_webhook)
        db.commit()

    if webhook_id in webhook_manager.webhooks:
        if webhook_manager.webhooks[webhook_id].user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to delete this webhook")
        del webhook_manager.webhooks[webhook_id]

    return {"message": "Webhook deleted successfully"}
