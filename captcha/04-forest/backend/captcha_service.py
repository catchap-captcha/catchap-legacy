"""
captcha_service.py — all CAPTCHA business logic + storage.

This module is deliberately framework-agnostic (no FastAPI imports) so it can
be unit-tested on its own and reused from a worker, a CLI, etc.

Storage design
--------------
Everything is kept behind a tiny `Store` interface. The 1st version ships an
`InMemoryStore` (a plain dict) which is perfect for a team prototype. To move
to Redis or a DB later you only implement the same handful of methods and swap
the instance in `main.py` — no other code changes.

    class RedisStore(Store):        # future
        def save_challenge(...): ...
        def get_challenge(...): ...
        ...

Security properties implemented here (see README for the full list):
  * The answer (target_object/target_direction) is generated ON THE SERVER and
    stored server-side only. It is never returned to the client.
  * challenge_id is a UUID4.
  * A challenge is single-use and expires (default 120s).
  * A wrong answer immediately discards (deletes) the challenge.
  * A correct answer issues a short-lived captcha_token.
  * Login failure counts are tracked per account_key.
"""

from __future__ import annotations

import secrets
import time
import uuid
from dataclasses import dataclass, field
from typing import Dict, List, Optional


# ---------------------------------------------------------------------------
# Configuration — tweak here or override from env in main.py
# ---------------------------------------------------------------------------
# Must stay in sync with the frontend animal config (frontend/js/captcha.js).
ANIMALS: List[str] = ["dog", "rabbit", "chicken", "panda", "capybara"]
OBJECTS: List[str] = ["tree", "house", "mushroom"]

DIRECTIONS = 8                       # 8-way turntable (0..7)
CHALLENGE_TTL_SECONDS = 120          # 60~120s per the spec
CAPTCHA_TOKEN_TTL_SECONDS = 120      # token is short-lived on purpose
LOGIN_FAIL_THRESHOLD = 5             # captcha_required after this many fails


# ---------------------------------------------------------------------------
# Internal records (SERVER-SIDE ONLY — never serialized to the client)
# ---------------------------------------------------------------------------
@dataclass
class ChallengeRecord:
    challenge_id: str
    animal: str
    # ---- THE ANSWER — must never leave the server ----
    target_object: str               # which object hides the animal
    target_direction: int            # 0..7 the animal is facing (the goal)
    # ---- display-only ----
    start_direction: int             # 0..7 initial facing of the control animal
    created_at: float
    ttl: int = CHALLENGE_TTL_SECONDS

    @property
    def expires_at(self) -> float:
        return self.created_at + self.ttl

    def is_expired(self, now: Optional[float] = None) -> bool:
        return (now or time.time()) >= self.expires_at

    def seconds_left(self, now: Optional[float] = None) -> int:
        return max(0, int(self.expires_at - (now or time.time())))


@dataclass
class TokenRecord:
    token: str
    created_at: float
    ttl: int = CAPTCHA_TOKEN_TTL_SECONDS
    used: bool = False               # a token is also single-use (consumed at login)

    def is_valid(self, now: Optional[float] = None) -> bool:
        now = now or time.time()
        return (not self.used) and (now < self.created_at + self.ttl)


# ---------------------------------------------------------------------------
# Storage abstraction
# ---------------------------------------------------------------------------
class Store:
    """Interface every backend (memory / Redis / DB) must implement."""

    # challenges
    def save_challenge(self, rec: ChallengeRecord) -> None: raise NotImplementedError
    def get_challenge(self, cid: str) -> Optional[ChallengeRecord]: raise NotImplementedError
    def delete_challenge(self, cid: str) -> None: raise NotImplementedError

    # captcha tokens
    def save_token(self, rec: TokenRecord) -> None: raise NotImplementedError
    def get_token(self, token: str) -> Optional[TokenRecord]: raise NotImplementedError
    def delete_token(self, token: str) -> None: raise NotImplementedError

    # login attempt counters (keyed by account_key)
    def get_fail_count(self, account_key: str) -> int: raise NotImplementedError
    def incr_fail_count(self, account_key: str) -> int: raise NotImplementedError
    def reset_fail_count(self, account_key: str) -> None: raise NotImplementedError


class InMemoryStore(Store):
    """Dict-backed store. Fine for a single-process prototype.

    NOTE: state is lost on restart and is NOT shared across workers. For
    multi-worker / production use, implement RedisStore(Store) instead and the
    rest of the code stays identical.
    """

    def __init__(self) -> None:
        self._challenges: Dict[str, ChallengeRecord] = {}
        self._tokens: Dict[str, TokenRecord] = {}
        self._fails: Dict[str, int] = {}

    def save_challenge(self, rec: ChallengeRecord) -> None:
        self._challenges[rec.challenge_id] = rec

    def get_challenge(self, cid: str) -> Optional[ChallengeRecord]:
        return self._challenges.get(cid)

    def delete_challenge(self, cid: str) -> None:
        self._challenges.pop(cid, None)

    def save_token(self, rec: TokenRecord) -> None:
        self._tokens[rec.token] = rec

    def get_token(self, token: str) -> Optional[TokenRecord]:
        return self._tokens.get(token)

    def delete_token(self, token: str) -> None:
        self._tokens.pop(token, None)

    def get_fail_count(self, account_key: str) -> int:
        return self._fails.get(account_key, 0)

    def incr_fail_count(self, account_key: str) -> int:
        self._fails[account_key] = self._fails.get(account_key, 0) + 1
        return self._fails[account_key]

    def reset_fail_count(self, account_key: str) -> None:
        self._fails.pop(account_key, None)


# ---------------------------------------------------------------------------
# The service
# ---------------------------------------------------------------------------
class CaptchaService:
    def __init__(self, store: Optional[Store] = None) -> None:
        self.store = store or InMemoryStore()

    # ---- challenge lifecycle ------------------------------------------------
    def create_challenge(self) -> ChallengeRecord:
        """Generate a brand-new challenge with a server-side random answer."""
        animal = secrets.choice(ANIMALS)
        target_object = secrets.choice(OBJECTS)
        target_direction = secrets.randbelow(DIRECTIONS)

        # start off-target so the user is always forced to rotate at least once
        start_direction = secrets.randbelow(DIRECTIONS)
        if start_direction == target_direction:
            start_direction = (start_direction + 1) % DIRECTIONS

        rec = ChallengeRecord(
            challenge_id=str(uuid.uuid4()),
            animal=animal,
            target_object=target_object,
            target_direction=target_direction,
            start_direction=start_direction,
            created_at=time.time(),
        )
        self.store.save_challenge(rec)
        return rec

    def get_active_challenge(self, cid: str) -> Optional[ChallengeRecord]:
        """Return the challenge if it exists AND is not expired.

        Expired challenges are proactively deleted (lazy cleanup). For a busy
        production system you'd add Redis TTLs or a periodic sweep instead.
        """
        rec = self.store.get_challenge(cid)
        if rec is None:
            return None
        if rec.is_expired():
            self.store.delete_challenge(cid)
            return None
        return rec

    def verify(self, cid: str, selected_object: str, selected_direction: int) -> bool:
        """Compare the submitted answer to the stored one.

        A challenge is ALWAYS discarded after a verify attempt (win or lose),
        making it strictly single-use. Callers must request a fresh challenge
        for the next attempt.
        """
        rec = self.get_active_challenge(cid)
        if rec is None:
            return False

        correct = (
            selected_object == rec.target_object
            and int(selected_direction) == rec.target_direction
        )
        # single-use: burn the challenge no matter the outcome
        self.store.delete_challenge(cid)
        return correct

    # ---- captcha tokens -----------------------------------------------------
    def issue_token(self) -> str:
        token = secrets.token_urlsafe(24)
        self.store.save_token(TokenRecord(token=token, created_at=time.time()))
        return token

    def consume_token(self, token: Optional[str]) -> bool:
        """Validate a captcha_token and mark it used (single-use)."""
        if not token:
            return False
        rec = self.store.get_token(token)
        if rec is None or not rec.is_valid():
            return False
        rec.used = True                       # consume
        self.store.save_token(rec)
        self.store.delete_token(token)        # and drop it entirely
        return True

    # ---- login attempt tracking --------------------------------------------
    #
    # Keyed by account_key today. Extending the key to include IP / device
    # fingerprint later is a one-line change here, e.g.:
    #     key = f"{account}|{client_ip}"
    # (Store interface already treats the key as an opaque string.)
    def login_fail_count(self, account_key: str) -> int:
        return self.store.get_fail_count(account_key)

    def register_login_failure(self, account_key: str) -> int:
        return self.store.incr_fail_count(account_key)

    def clear_login_failures(self, account_key: str) -> None:
        self.store.reset_fail_count(account_key)

    def captcha_required(self, account_key: str) -> bool:
        return self.login_fail_count(account_key) >= LOGIN_FAIL_THRESHOLD
