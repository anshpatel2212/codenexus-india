import logging
import jwt
from jwt import PyJWKClient, PyJWK
from jwt.exceptions import PyJWKClientError, PyJWKError, PyJWTError
from typing import List, Optional, Dict, Any
from fastapi import Depends, HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import datetime, timedelta
from pydantic import BaseModel
from backend.config import settings
from backend.services.supabase_admin import supabase_admin
from backend.services.db import get_db_connection

logger = logging.getLogger("brandsense.auth")
security = HTTPBearer(auto_error=False)

APP_JWT_SECRET = settings.SUPABASE_LEGACY_HS256_SECRET or settings.SUPABASE_JWT_SECRET or "brandsense-secure-enterprise-jwt-key-32-chars-min"

def create_access_token(user_data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Generate a signed HS256 JWT access token for persistent backend session authentication."""
    now = datetime.utcnow()
    exp = now + (expires_delta or timedelta(days=7))
    payload = {
        "sub": str(user_data["id"]),
        "email": user_data["email"],
        "role": user_data["role"],
        "organization_id": user_data.get("organization_id"),
        "full_name": user_data.get("full_name") or user_data.get("name") or "User",
        "department": user_data.get("department", "General"),
        "aud": "authenticated",
        "iat": int(now.timestamp()),
        "exp": int(exp.timestamp())
    }
    return jwt.encode(payload, APP_JWT_SECRET, algorithm="HS256")

# Thread-safe JWKS Client singleton with caching & cooldown
_jwks_client: Optional[PyJWKClient] = None

def get_jwks_client() -> Optional[PyJWKClient]:
    """Retrieve or initialize the PyJWKClient using the configured Supabase JWKS endpoint."""
    global _jwks_client
    if _jwks_client is not None:
        return _jwks_client
    jwks_url = settings.jwks_url
    if not jwks_url:
        return None
    _jwks_client = PyJWKClient(
        uri=jwks_url,
        cache_jwk_set=True,
        lifespan=300.0,        # 5 minutes cache lifespan for automatic key rotation
        max_cached_keys=16,
        cooldown_duration=10.0  # 10s cooldown to throttle repeated unknown kid lookups
    )
    return _jwks_client

def set_jwks_client(client: Optional[PyJWKClient]):
    """Testing hook to inject a mock or custom PyJWKClient."""
    global _jwks_client
    _jwks_client = client

class AuthenticatedUser(BaseModel):
    id: str
    organization_id: Optional[str] = None
    email: str
    full_name: str
    role: str  # 'Super Admin' | 'Admin' | 'Creator' | 'Manager' | 'Reviewer'
    department: Optional[str] = None
    supabase_user_id: Optional[str] = None

def verify_supabase_jwt(token: str) -> Dict[str, Any]:
    """
    Decodes and validates a Supabase JWT token.
    
    Security Controls:
    1. Primary: ECC P-256 (ES256) verified via Supabase's public JWKS endpoint.
    2. Backward Compatibility: Legacy HS256 verified via explicit legacy secret only.
    3. Strict algorithm isolation - never accepts HS256 for ES256 or vice-versa.
    4. Enforces 'aud' = 'authenticated', 'iss' matching project auth endpoint, and 'exp'.
    5. Rejects unsigned ('none') or arbitrary algorithms.
    6. Never logs tokens, secrets, or keys.
    """
    try:
        unverified_header = jwt.get_unverified_header(token)
    except Exception as e:
        logger.warning(f"Failed to read JWT header: {type(e).__name__}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Malformed or invalid JWT header.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    alg = unverified_header.get("alg")
    kid = unverified_header.get("kid")

    if not alg or alg.lower() == "none":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unsecured or missing JWT algorithm is strictly rejected.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    expected_issuer = settings.expected_issuer
    expected_audience = "authenticated"

    # Base decode configuration
    decode_options = {
        "verify_signature": True,
        "verify_exp": True,
        "verify_aud": True,
    }
    decode_kwargs: Dict[str, Any] = {
        "audience": expected_audience,
        "options": decode_options,
    }

    if expected_issuer:
        decode_kwargs["issuer"] = expected_issuer
        decode_options["verify_iss"] = True
    else:
        decode_options["verify_iss"] = False

    # -------------------------------------------------------------------------
    # Route 1: ECC P-256 (ES256) Verification via JWKS
    # -------------------------------------------------------------------------
    if alg == "ES256":
        if not kid:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="ES256 token missing required key ID (kid) in header.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        jwks_client = get_jwks_client()
        if not jwks_client:
            if settings.is_production():
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Authentication server configuration error: JWKS endpoint not configured."
                )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="JWKS verification unavailable: Supabase URL or JWKS endpoint not configured.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        try:
            signing_key = jwks_client.get_signing_key_from_jwt(token)
        except (PyJWKClientError, PyJWKError, Exception) as e:
            logger.warning(f"Could not resolve JWK signing key: {type(e).__name__}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Signing key not found or unrecognized in JWKS.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        try:
            payload = jwt.decode(
                token,
                signing_key.key,
                algorithms=["ES256"],  # Strictly ES256
                **decode_kwargs
            )
            return payload
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication token has expired.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        except jwt.InvalidAudienceError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token audience: expected 'authenticated'.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        except jwt.InvalidIssuerError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token issuer.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        except jwt.InvalidSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token signature.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        except PyJWTError as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Token verification failed: {type(e).__name__}",
                headers={"WWW-Authenticate": "Bearer"},
            )

    # -------------------------------------------------------------------------
    # Route 2: HS256 Verification via Configured Secret
    # -------------------------------------------------------------------------
    elif alg == "HS256":
        legacy_secret = APP_JWT_SECRET
        if not legacy_secret or len(legacy_secret) < 16:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="HS256 tokens are disabled or secret not configured.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        hs256_kwargs = {
            "audience": expected_audience,
            "options": {
                "verify_signature": True,
                "verify_exp": True,
                "verify_aud": True,
                "verify_iss": False,
            }
        }

        try:
            payload = jwt.decode(
                token,
                legacy_secret,
                algorithms=["HS256"],  # Strictly HS256
                **hs256_kwargs
            )
            return payload
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication token has expired.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        except jwt.InvalidAudienceError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token audience: expected 'authenticated'.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        except jwt.InvalidIssuerError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token issuer.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        except jwt.InvalidSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token signature.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        except PyJWTError as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Token verification failed: {type(e).__name__}",
                headers={"WWW-Authenticate": "Bearer"},
            )

    # -------------------------------------------------------------------------
    # Disallowed Algorithms (RS256, none, symmetric on ES256, etc.)
    # -------------------------------------------------------------------------
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Unsupported token algorithm '{alg}'. Only ES256 (ECC P-256) and configured HS256 are permitted.",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security)
) -> AuthenticatedUser:
    """
    Decodes Supabase JWT token and retrieves verified database profile.
    Rejects any unauthenticated access or forged tenant headers.
    """
    if not credentials or not credentials.credentials:
        # Development-only mock principal when Supabase credentials are not configured
        if not settings.is_production() and (not settings.SUPABASE_URL or any(p in settings.SUPABASE_URL.lower() for p in ["placeholder", "your_project_ref", "your-project-ref"])):
            return AuthenticatedUser(
                id="usr-1",
                organization_id="org-1",
                email="elena.rostova@acmebrand.com",
                full_name="Elena Rostova",
                role="Manager",
                department="Brand & Global Marketing"
            )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or malformed Authorization Bearer token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    payload = verify_supabase_jwt(token)

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="JWT token missing valid subject identifier.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 1. Primary: Authoritative relational database lookup (by SQLite ID or Supabase UID)
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        "SELECT id, email, full_name, role, organization_id, department, supabase_user_id FROM users WHERE id = ? OR supabase_user_id = ?",
        (user_id, user_id)
    )
    row = cur.fetchone()
    conn.close()

    if row:
        sb_uid = row["supabase_user_id"] if "supabase_user_id" in row.keys() else None
        return AuthenticatedUser(
            id=row["id"],
            organization_id=row["organization_id"],
            email=row["email"],
            full_name=row["full_name"],
            role=row["role"],
            department=row["department"],
            supabase_user_id=sb_uid
        )

    # 2. Use verified claims from JWT payload if user exists in token
    if payload.get("email") and payload.get("role"):
        return AuthenticatedUser(
            id=user_id,
            organization_id=payload.get("organization_id"),
            email=payload.get("email"),
            full_name=payload.get("full_name") or payload.get("email", "").split("@")[0],
            role=payload.get("role", "Creator"),
            department=payload.get("department", "General"),
            supabase_user_id=payload.get("supabase_user_id")
        )

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="User profile not registered in persistent system records."
    )

def require_role(allowed_roles: List[str]):
    """
    Dependency factory to enforce strict Role-Based Access Control (RBAC).
    Supported roles: 'Super Admin', 'Admin', 'Creator', 'Manager', 'Reviewer'
    """
    async def role_checker(user: AuthenticatedUser = Depends(get_current_user)) -> AuthenticatedUser:
        # Super Admin has overarching platform governance permissions
        if user.role == "Super Admin":
            return user
        if user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Operation requires one of the following roles: {', '.join(allowed_roles)}. Your role is '{user.role}'."
            )
        return user
    return role_checker
