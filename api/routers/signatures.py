"""
OriginMark API — Signature & Verification Router.

Endpoints:
    POST /sign                          — Sign content with Ed25519
    POST /verify                        — Verify content signature
    GET  /badge                         — Verification badge HTML
    GET  /signatures/{id}               — Get signature metadata
    GET  /signatures/{id}/c2pa          — Export signature as C2PA manifest
    GET  /users/{user_id}/signatures    — List user's signatures
"""

import base64
import json
import time
import uuid
from datetime import datetime, timezone
from typing import Optional

import nacl.signing
import nacl.exceptions
from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile
import html
from fastapi.responses import HTMLResponse, JSONResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from c2pa_export import C2PAManifestExporter
from db import get_db, APIKey, SignatureMetadata
from dependencies import compute_hash, get_api_key, get_optional_api_key, get_current_user_id
from telemetry import telemetry
from webhooks import notify_signature_created

router = APIRouter(tags=["signatures"])


class SignatureResponse(BaseModel):
    id: str
    content_hash: str
    signature: str
    public_key: str
    timestamp: str
    metadata: dict


@router.post("/sign", response_model=SignatureResponse)
async def sign_content(
    request: Request,
    file: Optional[UploadFile] = File(None),
    author: Optional[str] = Form(None),
    model_used: Optional[str] = Form(None),
    private_key: Optional[str] = Form(None),
    format: Optional[str] = Form(None),
    api_key: Optional[APIKey] = Depends(get_optional_api_key),
    db: Session = Depends(get_db),
):
    """Sign content with Ed25519 signature"""
    start_time = time.time()
    try:
        if file:
            MAX_FILE_SIZE = 25 * 1024 * 1024  # 25 MB
            content = await file.read(MAX_FILE_SIZE + 1)
            if len(content) > MAX_FILE_SIZE:
                raise HTTPException(status_code=413, detail="File too large (max 25MB)")
            content_type = "image" if file.content_type and file.content_type.startswith("image") else "text"
            file_name = file.filename
            file_size = len(content)
        else:
            return JSONResponse(status_code=400, content={"error": "No content provided"})

        if private_key:
            signing_key = nacl.signing.SigningKey(base64.b64decode(private_key))
        else:
            signing_key = nacl.signing.SigningKey.generate()

        verify_key = signing_key.verify_key
        content_hash = compute_hash(content)
        signed = signing_key.sign(content_hash.encode())
        signature = base64.b64encode(signed.signature).decode()

        signature_id = str(uuid.uuid4())
        timestamp = datetime.now(timezone.utc)

        metadata = {
            "author": author or "Anonymous",
            "timestamp": timestamp.isoformat(),
            "content_type": content_type,
            "model_used": model_used,
            "file_name": file_name,
            "file_size": file_size,
        }

        db_signature = SignatureMetadata(
            id=signature_id,
            user_id=api_key.user_id if api_key else None,
            api_key_id=api_key.id if api_key else None,
            content_hash=content_hash,
            signature=signature,
            public_key=base64.b64encode(bytes(verify_key)).decode(),
            author=author,
            timestamp=timestamp,
            content_type=content_type,
            ai_model_used=model_used,
            file_name=file_name,
            file_size=file_size,
            metadata_json=json.dumps(metadata),
        )
        db.add(db_signature)
        db.commit()

        pub_key_b64 = base64.b64encode(bytes(verify_key)).decode()

        signature_response = SignatureResponse(
            id=signature_id, content_hash=content_hash, signature=signature,
            public_key=pub_key_b64, timestamp=timestamp.isoformat(), metadata=metadata,
        )

        try:
            await notify_signature_created({"id": signature_id, "content_hash": content_hash, "metadata": metadata})
        except Exception as e:
            print(f"Webhook notification failed: {e}")

        response_time_ms = int((time.time() - start_time) * 1000)
        await telemetry.track_usage(
            db=db, action="sign",
            user_id=api_key.user_id if api_key else None,
            api_key_id=api_key.id if api_key else None,
            content_type=content_type, status_code=200,
            response_time_ms=response_time_ms,
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent"),
            metadata={"file_size": file_size, "model_used": model_used, "has_private_key": bool(private_key), "export_format": format},
        )

        if format and format.lower() == "c2pa":
            try:
                c2pa_exporter = C2PAManifestExporter()
                originmark_data = {
                    "id": signature_id, "content_hash": content_hash, "signature": signature,
                    "public_key": pub_key_b64, "timestamp": timestamp.isoformat(), "metadata": metadata,
                }
                c2pa_manifest = c2pa_exporter.create_c2pa_manifest(originmark_data)
                validation = c2pa_exporter.validate_export(c2pa_manifest)
                if not validation["valid"]:
                    print(f"C2PA validation warnings: {validation['warnings']}")
                    print(f"C2PA validation errors: {validation['errors']}")
                return JSONResponse(status_code=200, content={
                    "format": "c2pa", "manifest": c2pa_manifest,
                    "originmark_signature": {"id": signature_id, "content_hash": content_hash, "signature": signature, "public_key": pub_key_b64, "timestamp": timestamp.isoformat()},
                    "validation": validation,
                })
            except Exception as c2pa_error:
                print(f"C2PA export failed: {c2pa_error}")
                signature_response.metadata["c2pa_export_error"] = str(c2pa_error)

        return signature_response

    except Exception as e:
        response_time_ms = int((time.time() - start_time) * 1000)
        await telemetry.track_usage(
            db=db, action="sign",
            user_id=api_key.user_id if api_key else None,
            api_key_id=api_key.id if api_key else None,
            content_type=content_type if "content_type" in locals() else None,
            status_code=500, response_time_ms=response_time_ms,
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent"),
            metadata={"error": str(e)},
        )
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/signatures/{signature_id}/c2pa")
async def export_signature_c2pa(
    signature_id: str,
    api_key: Optional[APIKey] = Depends(get_optional_api_key),
    db: Session = Depends(get_db),
):
    """Export existing signature as C2PA manifest"""
    db_signature = db.query(SignatureMetadata).filter(SignatureMetadata.id == signature_id).first()
    if not db_signature:
        raise HTTPException(status_code=404, detail="Signature not found")

    originmark_data = {
        "id": db_signature.id, "content_hash": db_signature.content_hash,
        "signature": db_signature.signature, "public_key": db_signature.public_key,
        "timestamp": db_signature.timestamp.isoformat(),
        "metadata": {"author": db_signature.author, "model_used": db_signature.ai_model_used, "content_type": db_signature.content_type, "file_name": db_signature.file_name, "file_size": db_signature.file_size},
    }

    c2pa_exporter = C2PAManifestExporter()
    c2pa_manifest = c2pa_exporter.create_c2pa_manifest(originmark_data)
    validation = c2pa_exporter.validate_export(c2pa_manifest)

    return JSONResponse(status_code=200, content={
        "format": "c2pa", "signature_id": signature_id, "manifest": c2pa_manifest, "validation": validation,
        "export_info": {"specification": "C2PA v1.4", "exporter": "OriginMark/2.0.0", "timestamp": datetime.now(timezone.utc).isoformat(), "compatibility": "Adobe Content Authenticity Initiative"},
    })


@router.post("/verify")
async def verify_content(
    request: Request,
    file: Optional[UploadFile] = File(None),
    signature: Optional[str] = Form(None),
    public_key: Optional[str] = Form(None),
    signature_id: Optional[str] = Form(None),
    api_key: Optional[APIKey] = Depends(get_optional_api_key),
    db: Session = Depends(get_db),
):
    """Verify content signature"""
    start_time = time.time()
    try:
        db_signature = None
        if signature_id:
            db_signature = db.query(SignatureMetadata).filter(SignatureMetadata.id == signature_id).first()
            if db_signature:
                signature = db_signature.signature
                public_key = db_signature.public_key
                stored_hash = db_signature.content_hash
            elif not signature or not public_key:
                return {"valid": False, "message": "Signature not found"}

        if not signature or not public_key:
            return JSONResponse(status_code=400, content={"error": "Signature and public key required"})

        if file:
            content = await file.read()
        else:
            return JSONResponse(status_code=400, content={"error": "No content provided"})

        content_hash = compute_hash(content)

        if db_signature and stored_hash != content_hash:
            response_time_ms = int((time.time() - start_time) * 1000)
            await telemetry.track_usage(
                db=db, action="verify", user_id=api_key.user_id if api_key else None,
                api_key_id=api_key.id if api_key else None, content_type=file.content_type if file else None,
                status_code=200, response_time_ms=response_time_ms,
                ip_address=request.client.host if request.client else None,
                user_agent=request.headers.get("user-agent"),
                metadata={"result": "hash_mismatch", "signature_id": signature_id},
            )
            return {"valid": False, "message": "Content hash mismatch", "computed_hash": content_hash, "stored_hash": stored_hash}

        verify_key = nacl.signing.VerifyKey(base64.b64decode(public_key))

        try:
            verify_key.verify(content_hash.encode(), base64.b64decode(signature))
            metadata = None
            if signature_id and db_signature:
                metadata = json.loads(db_signature.metadata_json) if db_signature.metadata_json else None
            response_time_ms = int((time.time() - start_time) * 1000)
            await telemetry.track_usage(
                db=db, action="verify", user_id=api_key.user_id if api_key else None,
                api_key_id=api_key.id if api_key else None, content_type=file.content_type if file else None,
                status_code=200, response_time_ms=response_time_ms,
                ip_address=request.client.host if request.client else None,
                user_agent=request.headers.get("user-agent"),
                metadata={"result": "valid", "signature_id": signature_id},
            )
            return {"valid": True, "message": "Signature verified successfully", "content_hash": content_hash, "metadata": metadata}
        except nacl.exceptions.BadSignatureError:
            response_time_ms = int((time.time() - start_time) * 1000)
            await telemetry.track_usage(
                db=db, action="verify", user_id=api_key.user_id if api_key else None,
                api_key_id=api_key.id if api_key else None, content_type=file.content_type if file else None,
                status_code=200, response_time_ms=response_time_ms,
                ip_address=request.client.host if request.client else None,
                user_agent=request.headers.get("user-agent"),
                metadata={"result": "invalid_signature"},
            )
            return {"valid": False, "message": "Invalid signature", "content_hash": content_hash}

    except Exception as e:
        response_time_ms = int((time.time() - start_time) * 1000)
        await telemetry.track_usage(
            db=db, action="verify", user_id=api_key.user_id if api_key else None,
            api_key_id=api_key.id if api_key else None, content_type=None,
            status_code=500, response_time_ms=response_time_ms,
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent"),
            metadata={"error": str(e)},
        )
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/badge")
async def get_badge(id: str, db: Session = Depends(get_db)):
    """Generate verification badge HTML"""
    db_signature = db.query(SignatureMetadata).filter(SignatureMetadata.id == id).first()
    if not db_signature:
        raise HTTPException(status_code=404, detail="Signature not found")

    metadata = json.loads(db_signature.metadata_json) if db_signature.metadata_json else {}

    author = html.escape(str(metadata.get('author', 'Unknown')))
    model_used = html.escape(str(metadata.get('model_used', 'Not specified')))
    content_type = html.escape(str(metadata.get('content_type', 'Unknown')))
    timestamp = html.escape(str(metadata.get('timestamp', 'Unknown')))

    badge_html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>OriginMark Verification Badge</title>
        <style>
            body {{ font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }}
            .badge {{ background: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 400px; margin: 0 auto; }}
            .verified {{ color: #22c55e; font-size: 24px; font-weight: bold; margin-bottom: 10px; }}
            .details {{ font-size: 14px; color: #666; margin-top: 10px; }}
            .hash {{ font-family: monospace; font-size: 12px; background: #f0f0f0; padding: 5px; border-radius: 4px; word-break: break-all; }}
        </style>
    </head>
    <body>
        <div class="badge">
            <div class="verified">✓ Verified AI Content</div>
            <div class="details">
                <p><strong>Author:</strong> {author}</p>
                <p><strong>Model:</strong> {model_used}</p>
                <p><strong>Timestamp:</strong> {timestamp}</p>
                <p><strong>Content Type:</strong> {content_type}</p>
                <p><strong>Hash:</strong></p>
                <div class="hash">{html.escape(str(db_signature.content_hash))}</div>
            </div>
        </div>
    </body>
    </html>
    """
    return HTMLResponse(content=badge_html)


@router.get("/signatures/{signature_id}")
async def get_signature(signature_id: str, db: Session = Depends(get_db)):
    """Get signature metadata by ID"""
    db_signature = db.query(SignatureMetadata).filter(SignatureMetadata.id == signature_id).first()
    if not db_signature:
        raise HTTPException(status_code=404, detail="Signature not found")

    metadata = json.loads(db_signature.metadata_json) if db_signature.metadata_json else {}
    return {
        "id": db_signature.id, "content_hash": db_signature.content_hash,
        "signature": db_signature.signature, "public_key": db_signature.public_key,
        "timestamp": db_signature.timestamp.isoformat(), "metadata": metadata,
    }


@router.get("/me/signatures")
async def get_my_signatures(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Get all signatures for the authenticated user."""
    signatures = db.query(SignatureMetadata).filter(
        SignatureMetadata.user_id == user_id
    ).order_by(SignatureMetadata.timestamp.desc()).all()

    return {
        "signatures": [
            {"id": sig.id, "content_hash": sig.content_hash, "author": sig.author,
             "timestamp": sig.timestamp.isoformat(), "content_type": sig.content_type,
             "model_used": sig.ai_model_used, "file_name": sig.file_name}
            for sig in signatures
        ]
    }

