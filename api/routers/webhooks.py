"""
OriginMark API — Webhook Management Router.

Endpoints:
    POST   /webhooks              — Create a new webhook (JWT or API key)
    GET    /webhooks              — List all webhooks (JWT or API key)
    DELETE /webhooks/{webhook_id} — Delete a webhook (JWT or API key)
"""

import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from db import get_db
from dependencies import get_current_user_id
from webhooks import webhook_manager, WebhookConfig, WebhookType, WebhookEvent

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
    webhook_id = str(uuid.uuid4())

    webhook_config = WebhookConfig(
        id=webhook_id,
        name=webhook_data.name,
        url=webhook_data.url,
        type=webhook_data.type,
        events=webhook_data.events,
        secret=webhook_data.secret,
    )

    webhook_manager.webhooks[webhook_id] = webhook_config

    return {
        "message": "Webhook created successfully",
        "webhook_id": webhook_id,
        "name": webhook_data.name,
        "type": webhook_data.type,
    }


@router.get("")
async def list_webhooks(
    user_id: str = Depends(get_current_user_id),
):
    """List all webhooks for the authenticated user"""
    webhooks = [
        {
            "id": webhook.id,
            "name": webhook.name,
            "url": str(webhook.url),
            "type": webhook.type,
            "events": webhook.events,
            "is_active": webhook.is_active,
        }
        for webhook in webhook_manager.webhooks.values()
    ]

    return {"webhooks": webhooks}


@router.delete("/{webhook_id}")
async def delete_webhook(
    webhook_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """Delete a webhook"""
    if webhook_id in webhook_manager.webhooks:
        del webhook_manager.webhooks[webhook_id]
        return {"message": "Webhook deleted successfully"}
    else:
        raise HTTPException(status_code=404, detail="Webhook not found")
