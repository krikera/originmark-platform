"""
OriginMark API — Application entry point.

Thin app factory: creates the FastAPI app, configures CORS and middleware,
and registers all routers. Business logic lives in routers/.
"""

import os
import time

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from routers import auth, signatures, webhooks, admin
from dependencies import limiter

app = FastAPI(title="OriginMark API", version="0.1.0")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── CORS Configuration ──────────────────────────────────────────────────────

CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "*").split(",")
if CORS_ORIGINS == ["*"]:
    cors_origins = ["*"]
else:
    cors_origins = [origin.strip() for origin in CORS_ORIGINS]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Middleware ───────────────────────────────────────────────────────────────

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    request.state.process_time_ms = int(process_time * 1000)
    
    # Security Headers
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    return response


# ── Routers ──────────────────────────────────────────────────────────────────

app.include_router(auth.router)
app.include_router(signatures.router)
app.include_router(webhooks.router)
app.include_router(admin.router)


# ── Root ─────────────────────────────────────────────────────────────────────

@app.get("/")
async def root():
    return {"message": "OriginMark API - Digital signature service for AI content with authentication"}


# ── Entry point ──────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)