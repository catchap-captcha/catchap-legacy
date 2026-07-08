"""
main.py — FastAPI application wiring the CAPTCHA + mock-login endpoints.

Run:
    uvicorn main:app --reload

Endpoints:
    POST /api/captcha/challenge          -> create a challenge (no answer leaked)
    GET  /api/captcha/{cid}/target       -> opaque target-pose image (resource token)
    POST /api/captcha/verify             -> verify an answer, issue token on success
    POST /api/auth/login                 -> mock login; captcha_required after 5 fails
    GET  /api/health                     -> liveness probe
"""

from __future__ import annotations

import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

import captcha_service as cs
from captcha_service import CaptchaService, InMemoryStore
from models import (
    ChallengeResponse,
    LoginRequest,
    LoginResponse,
    VerifyRequest,
    VerifyResponse,
)

# ---------------------------------------------------------------------------
# App + service singletons
# ---------------------------------------------------------------------------
app = FastAPI(title="Forest Village CAPTCHA API", version="1.0.0")

# 1st version: in-memory store. Swap for RedisStore()/DBStore() in production.
service = CaptchaService(store=InMemoryStore())

# Where the animal frames live. Defaults to the sibling frontend/ folder so the
# backend can serve the *target pose* image itself (never revealing the index).
# In production this would be a private asset bucket, not the public frontend.
ASSETS_DIR = os.environ.get(
    "CAPTCHA_ASSETS_DIR",
    os.path.join(os.path.dirname(__file__), "..", "frontend", "assets", "animals"),
)

# ---------------------------------------------------------------------------
# CORS — allow the static frontend (localhost:5500) to call this API (:8000)
# ---------------------------------------------------------------------------
# Tighten `allow_origins` to your real domains before deploying.
ALLOWED_ORIGINS = os.environ.get(
    "CAPTCHA_ALLOWED_ORIGINS",
    "http://localhost:5500,http://127.0.0.1:5500",
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Mock user "database" — prototype only. Replace with a real DB + hashing.
# ---------------------------------------------------------------------------
MOCK_USERS = {
    "test@example.com": "password123",
    "child@forest.kr": "1234",
}


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------
@app.get("/api/health")
def health():
    return {"status": "ok"}


# ---------------------------------------------------------------------------
# 1) Create a challenge
# ---------------------------------------------------------------------------
@app.post("/api/captcha/challenge", response_model=ChallengeResponse)
def create_challenge():
    rec = service.create_challenge()
    # Only display-safe fields are returned. target_object / target_direction
    # stay on the server (inside the ChallengeRecord).
    return ChallengeResponse(
        challenge_id=rec.challenge_id,
        animal=rec.animal,
        objects=cs.OBJECTS,
        start_direction=rec.start_direction,
        expires_in=rec.seconds_left(),
    )


# ---------------------------------------------------------------------------
# 2) Serve the target-pose image as an OPAQUE resource (the "resource token")
# ---------------------------------------------------------------------------
# The client shows this image so a human can see which way to rotate, but the
# URL and payload never reveal the direction index — that's the whole point.
# A production version would:
#   * gate this behind the object choice (only reveal behind the right object),
#   * add a per-challenge signed/expiring URL,
#   * and ideally composite the animal into the scene server-side.
@app.get("/api/captcha/{challenge_id}/target")
def target_image(challenge_id: str):
    rec = service.get_active_challenge(challenge_id)
    if rec is None:
        raise HTTPException(status_code=404, detail="challenge_not_found_or_expired")

    path = os.path.abspath(
        os.path.join(ASSETS_DIR, rec.animal, f"dir{rec.target_direction}.png")
    )
    # guard against path escaping the assets dir
    if not path.startswith(os.path.abspath(ASSETS_DIR)) or not os.path.exists(path):
        raise HTTPException(status_code=404, detail="asset_not_found")

    # no-store so intermediaries can't cache the answer image
    return FileResponse(path, media_type="image/png", headers={"Cache-Control": "no-store"})


# ---------------------------------------------------------------------------
# 3) Verify an answer
# ---------------------------------------------------------------------------
@app.post("/api/captcha/verify", response_model=VerifyResponse)
def verify(req: VerifyRequest):
    ok = service.verify(req.challenge_id, req.selected_object, req.selected_direction)
    if ok:
        return VerifyResponse(success=True, captcha_token=service.issue_token())
    # wrong (or expired/unknown): challenge already discarded -> need a new one
    return VerifyResponse(success=False, message="new_challenge_required")


# ---------------------------------------------------------------------------
# 4) Mock login demonstrating the "captcha after 5 failures" flow
# ---------------------------------------------------------------------------
@app.post("/api/auth/login", response_model=LoginResponse)
def login(req: LoginRequest):
    # account_key: today just the account. Extend to include IP/device later.
    account_key = req.account

    needs_captcha = service.captcha_required(account_key)

    # Once locked behind a captcha, a valid single-use token is required to try.
    if needs_captcha:
        if not service.consume_token(req.captcha_token):
            return LoginResponse(
                success=False,
                captcha_required=True,
                failed_attempts=service.login_fail_count(account_key),
                message="captcha_required",
            )
        # valid token accepted -> allow this attempt to proceed

    # ---- mock credential check ----
    if MOCK_USERS.get(req.account) == req.password:
        service.clear_login_failures(account_key)   # success resets the counter
        return LoginResponse(success=True, message="login_ok")

    # ---- failed credentials ----
    fails = service.register_login_failure(account_key)
    return LoginResponse(
        success=False,
        captcha_required=service.captcha_required(account_key),
        failed_attempts=fails,
        message="invalid_credentials",
    )
