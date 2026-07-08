"""
Pydantic request/response models + internal data structures for the CAPTCHA API.

Keeping the wire schema in one place makes it easy to see exactly what the
frontend is (and is NOT) allowed to know. The golden rule of this project:

    The answer (target_object, target_direction) NEVER appears in any
    response model. It only lives inside `ChallengeRecord`, which is a
    server-side-only object and is never serialized to the client.
"""

from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# CAPTCHA — challenge creation
# ---------------------------------------------------------------------------
class ChallengeResponse(BaseModel):
    """What the browser receives when a new challenge is created.

    NOTE (security): this intentionally contains only the *display* data the
    prototype needs to render the scene. It does NOT contain:
      - target_object   (which object hides the animal)
      - target_direction(which way the animal must face)
    The target pose is delivered separately as an opaque image via
    GET /api/captcha/{challenge_id}/target so the client can show the puzzle
    without ever learning the numeric answer.
    """

    challenge_id: str
    animal: str                      # e.g. "rabbit" — the animal species shown
    objects: List[str]               # clickable objects, e.g. ["tree","house","mushroom"]
    start_direction: int             # 0..7 initial facing of the control animal
    expires_in: int                  # seconds until this challenge expires


# ---------------------------------------------------------------------------
# CAPTCHA — verification
# ---------------------------------------------------------------------------
class VerifyRequest(BaseModel):
    challenge_id: str
    selected_object: str             # object the user chose, e.g. "house"
    selected_direction: int = Field(ge=0, le=7)   # 0..7 the user rotated to


class VerifyResponse(BaseModel):
    success: bool
    captcha_token: Optional[str] = None   # issued only on success
    message: Optional[str] = None         # e.g. "new_challenge_required" on failure


# ---------------------------------------------------------------------------
# AUTH — mock login that demonstrates the "captcha after N failures" flow
# ---------------------------------------------------------------------------
class LoginRequest(BaseModel):
    account: str                     # username / email — the "account_key"
    password: str
    # Present once the user has solved a captcha. Required after too many fails.
    captcha_token: Optional[str] = None


class LoginResponse(BaseModel):
    success: bool
    captcha_required: bool = False
    failed_attempts: int = 0
    message: Optional[str] = None
