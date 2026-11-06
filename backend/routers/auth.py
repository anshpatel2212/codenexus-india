import uuid
import secrets
import logging
from datetime import datetime
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, status, Header
from pydantic import BaseModel, Field, EmailStr

from backend.config import settings
from backend.services.db import get_db_connection, hash_password, verify_password
from backend.auth.jwt_guard import create_access_token, get_current_user, AuthenticatedUser
from backend.services.supabase_admin import supabase_admin

logger = logging.getLogger("brandsense.auth_router")

router = APIRouter(prefix="/auth", tags=["Authentication & RBAC"])

class SignupRequest(BaseModel):
    name: str = Field(..., min_length=2)
    email: EmailStr
    password: str = Field(..., min_length=8)
    organisation: Optional[str] = "BrandSense Workspace"
    role: Optional[str] = "Creator"
    invitationToken: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str
    portalRole: Optional[str] = Field(None, description="'Super Admin' | 'Admin' | 'Creator' | 'Reviewer' | 'Manager'")

class ProvisionSuperAdminRequest(BaseModel):
    setupKey: str
    email: EmailStr
    password: str = Field(..., min_length=8)
    fullName: str = Field(..., min_length=2)

@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def signup(req: SignupRequest):
    """
    Registers a new tenant user and organisation in the persistent database.
    Creates credentials, generates signed JWT session, and prevents duplicate accounts.
    """
    normalized_email = req.email.strip().lower()

    if normalized_email.startswith("demo-"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reserved email prefix 'demo-'. Please register with your legitimate work email address."
        )

    conn = get_db_connection()
    cur = conn.cursor()

    # 1. Enforce unique email check across the persistent database
    cur.execute("SELECT id FROM users WHERE email = ?", (normalized_email,))
    existing_user = cur.fetchone()
    if existing_user:
        conn.close()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email address is already registered. Please sign in instead."
        )

    now = datetime.utcnow().isoformat() + "Z"
    target_org_id = None
    target_role = "Creator"
    org_name = req.organisation or "BrandSense Workspace"

    # 2. Check Invitation Token if provided
    if req.invitationToken:
        cur.execute("SELECT * FROM invitations WHERE token = ? AND status = 'pending'", (req.invitationToken,))
        invite = cur.fetchone()
        if not invite:
            conn.close()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invitation token is invalid, expired, or already claimed."
            )
        target_org_id = invite["organization_id"]
        target_role = invite["role"]

        # Fetch org name
        cur.execute("SELECT name FROM organizations WHERE id = ?", (target_org_id,))
        org_row = cur.fetchone()
        if org_row:
            org_name = org_row["name"]

        # Mark invite accepted
        cur.execute("UPDATE invitations SET status = 'accepted' WHERE token = ?", (req.invitationToken,))
    else:
        # Enforce BUG 2 & BUG 3: Public registration only permits 'Creator' or 'Manager'
        requested_role = (req.role or "Creator").strip()
        if requested_role not in ["Creator", "Manager"]:
            conn.close()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Public account creation only allows 'Creator' or 'Manager' roles. 'Admin' and 'Super Admin' privileges require authorization from an existing administrator."
            )
        target_role = requested_role

        # Create brand-new isolated organization for this user
        target_org_id = f"org-{uuid.uuid4().hex[:8]}"
        cur.execute("""
        INSERT INTO organizations (id, name, slug, tier, status, created_at, updated_at)
        VALUES (?, ?, ?, 'Standard Plan', 'active', ?, ?)
        """, (target_org_id, org_name, f"org-{uuid.uuid4().hex[:6]}", now, now))

    # 3. Secure password hashing
    p_hash, salt = hash_password(req.password)
    user_id = f"usr-{uuid.uuid4().hex[:10]}"

    cur.execute("""
    INSERT INTO users (id, email, password_hash, salt, full_name, role, organization_id, department, avatar_url, status, is_demo, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'Brand Management', '', 'active', 0, ?, ?)
    """, (user_id, normalized_email, p_hash, salt, req.name.strip(), target_role, target_org_id, now, now))

    # Log registration in activity logs
    cur.execute("""
    INSERT INTO activity_logs (id, organization_id, user_id, user_name, action, details, timestamp)
    VALUES (?, ?, ?, ?, 'User Registered', ?, ?)
    """, (f"act-{uuid.uuid4().hex[:8]}", target_org_id, user_id, req.name.strip(), f"User registered as {target_role} for {org_name}", now))

    conn.commit()
    conn.close()

    # 4. Generate signed JWT session
    user_payload = {
        "id": user_id,
        "email": normalized_email,
        "full_name": req.name.strip(),
        "role": target_role,
        "organization_id": target_org_id,
        "department": "Brand Management"
    }
    token = create_access_token(user_payload)

    return {
        "success": True,
        "token": token,
        "user": {
            "id": user_id,
            "name": req.name.strip(),
            "email": normalized_email,
            "role": target_role,
            "organizationId": target_org_id,
            "organisation": org_name,
            "avatar": "",
            "department": "Brand Management",
            "isDemo": False
        }
    }

@router.post("/login")
async def login(req: LoginRequest):
    """
    Authenticates user against persistent database records.
    Enforces server-side password verification and validates portal role boundary.
    """
    normalized_email = req.email.strip().lower()

    if not normalized_email or not req.password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email and password are required."
        )

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
    SELECT u.*, o.name as org_name
    FROM users u
    LEFT JOIN organizations o ON u.organization_id = o.id
    WHERE u.email = ?
    """, (normalized_email,))
    user = cur.fetchone()

    if not user:
        conn.close()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No account was found with this email address. Please register or verify your credentials."
        )

    # Constant-time password hash verification
    is_valid = verify_password(req.password, user["password_hash"], user["salt"])
    if not is_valid:
        conn.close()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password. Please verify your credentials and try again."
        )

    user_role = user["role"]

    # Role-Based Login Portal Boundary Enforcement:
    # A user attempting to log into a specialized portal without proper credentials must be rejected.
    if req.portalRole:
        requested = req.portalRole.strip().lower()
        actual = user_role.strip().lower()

        # Manager and Reviewer can access Reviewer portal
        is_match = (
            (requested == actual) or
            (requested in ["reviewer", "manager"] and actual in ["reviewer", "manager"]) or
            (actual == "super admin")  # Super admin can log into any portal
        )

        if not is_match:
            conn.close()
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access Denied: Your account role is '{user_role}'. You cannot access the {req.portalRole} portal with these credentials."
            )

    now = datetime.utcnow().isoformat() + "Z"
    cur.execute("""
    INSERT INTO activity_logs (id, organization_id, user_id, user_name, action, details, timestamp)
    VALUES (?, ?, ?, ?, 'User Login', 'Successful authentication session established', ?)
    """, (f"act-{uuid.uuid4().hex[:8]}", user["organization_id"], user["id"], user["full_name"], now))

    conn.commit()
    conn.close()

    user_payload = {
        "id": user["id"],
        "email": user["email"],
        "full_name": user["full_name"],
        "role": user["role"],
        "organization_id": user["organization_id"],
        "department": user["department"] or "General"
    }
    token = create_access_token(user_payload)

    return {
        "success": True,
        "token": token,
        "user": {
            "id": user["id"],
            "name": user["full_name"],
            "email": user["email"],
            "role": user["role"],
            "organizationId": user["organization_id"] or "",
            "organisation": user["org_name"] or "BrandSense Platform",
            "avatar": user["avatar_url"] or "",
            "department": user["department"] or "General",
            "isDemo": bool(user["is_demo"])
        }
    }

@router.get("/me")
async def get_current_user_profile(
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """Returns the authenticated user's profile and active organization context."""
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
    SELECT u.*, o.name as org_name
    FROM users u
    LEFT JOIN organizations o ON u.organization_id = o.id
    WHERE u.id = ?
    """, (current_user.id,))
    user = cur.fetchone()
    conn.close()

    if user:
        return {
            "id": user["id"],
            "name": user["full_name"],
            "email": user["email"],
            "role": user["role"],
            "organizationId": user["organization_id"] or "",
            "organisation": user["org_name"] or "BrandSense Platform",
            "avatar": user["avatar_url"] or "",
            "department": user["department"] or "General",
            "isDemo": bool(user["is_demo"])
        }

    return {
        "id": current_user.id,
        "name": current_user.full_name,
        "email": current_user.email,
        "role": current_user.role,
        "organizationId": current_user.organization_id or "",
        "organisation": "BrandSense Workspace",
        "avatar": "",
        "department": current_user.department or "General",
        "isDemo": False
    }

@router.post("/demo/{role_slug}")
async def demo_login(role_slug: str):
    """
    Authenticates as a dedicated, isolated demo persona for the requested role.
    Issues a real signed JWT token with that persona's role and organization.
    """
    slug_map = {
        "super-admin": "demo-superadmin@brandsense.ai",
        "superadmin": "demo-superadmin@brandsense.ai",
        "admin": "demo-admin@brandsense.ai",
        "creator": "demo-creator@brandsense.ai",
        "reviewer": "demo-reviewer@brandsense.ai",
        "manager": "demo-manager@brandsense.ai"
    }

    target_email = slug_map.get(role_slug.lower())
    if not target_email:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Unknown demo role '{role_slug}'. Valid roles: 'super-admin', 'admin', 'creator', 'reviewer', 'manager'."
        )

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
    SELECT u.*, o.name as org_name
    FROM users u
    LEFT JOIN organizations o ON u.organization_id = o.id
    WHERE u.email = ?
    """, (target_email,))
    user = cur.fetchone()
    conn.close()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Demo persona record not found in system database."
        )

    user_payload = {
        "id": user["id"],
        "email": user["email"],
        "full_name": user["full_name"],
        "role": user["role"],
        "organization_id": user["organization_id"],
        "department": user["department"]
    }
    token = create_access_token(user_payload)

    return {
        "success": True,
        "token": token,
        "user": {
            "id": user["id"],
            "name": user["full_name"],
            "email": user["email"],
            "role": user["role"],
            "organizationId": user["organization_id"] or "",
            "organisation": user["org_name"] or "BrandSense Demo Corp",
            "avatar": user["avatar_url"] or "",
            "department": user["department"],
            "isDemo": True
        }
    }

@router.post("/provision-super-admin")
async def provision_super_admin(req: ProvisionSuperAdminRequest):
    """
    Secure platform bootstrap mechanism to provision the initial actual Super Admin account.
    Protected by setup key; cannot be called via public signup.
    """
    expected_key = os.getenv("SUPER_ADMIN_SETUP_KEY", "brandsense-platform-bootstrap-key-2026")
    if not hmac.compare_digest(req.setupKey.strip(), expected_key):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid Super Admin provisioning key."
        )

    normalized_email = req.email.strip().lower()
    conn = get_db_connection()
    cur = conn.cursor()

    now = datetime.utcnow().isoformat() + "Z"
    p_hash, salt = hash_password(req.password)

    cur.execute("SELECT id FROM users WHERE email = ?", (normalized_email,))
    existing = cur.fetchone()

    if existing:
        cur.execute("""
        UPDATE users
        SET role = 'Super Admin', full_name = ?, password_hash = ?, salt = ?, updated_at = ?
        WHERE id = ?
        """, (req.fullName.strip(), p_hash, salt, now, existing["id"]))
        user_id = existing["id"]
    else:
        user_id = f"usr-sa-{uuid.uuid4().hex[:8]}"
        cur.execute("""
        INSERT INTO users (id, email, password_hash, salt, full_name, role, organization_id, department, avatar_url, status, is_demo, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 'Super Admin', NULL, 'Platform Oversight', '', 'active', 0, ?, ?)
        """, (user_id, normalized_email, p_hash, salt, req.fullName.strip(), now, now))

    # Log in activity logs
    cur.execute("""
    INSERT INTO activity_logs (id, organization_id, user_id, user_name, action, details, timestamp)
    VALUES (?, NULL, ?, ?, 'Super Admin Provisioned', 'Platform root administrator account established', ?)
    """, (f"act-{uuid.uuid4().hex[:8]}", user_id, req.fullName.strip(), now))

    conn.commit()
    conn.close()

    user_payload = {
        "id": user_id,
        "email": normalized_email,
        "full_name": req.fullName.strip(),
        "role": "Super Admin",
        "organization_id": None,
        "department": "Platform Oversight"
    }
    token = create_access_token(user_payload)

    return {
        "success": True,
        "message": "Super Admin account successfully provisioned.",
        "token": token,
        "user": {
            "id": user_id,
            "name": req.fullName.strip(),
            "email": normalized_email,
            "role": "Super Admin",
            "organizationId": "",
            "organisation": "BrandSense Global Platform",
            "avatar": "",
            "department": "Platform Oversight",
            "isDemo": False
        }
    }

@router.get("/verify-admin")
async def verify_admin_accounts():
    """
    Audits and returns existing actual administrative accounts in the database.
    Excludes passwords and sensitive secrets.
    """
    conn = get_db_connection()
    cur = conn.cursor()

    # Query Actual Super Admins (is_demo = 0)
    cur.execute("""
    SELECT id, email, full_name, role, status, created_at
    FROM users
    WHERE role = 'Super Admin' AND is_demo = 0
    """)
    actual_super_admins = [dict(row) for row in cur.fetchall()]

    # Query Actual Organisation Admins (is_demo = 0)
    cur.execute("""
    SELECT u.id, u.email, u.full_name, u.role, u.status, u.created_at, o.name as org_name
    FROM users u
    LEFT JOIN organizations o ON u.organization_id = o.id
    WHERE u.role = 'Admin' AND u.is_demo = 0
    """)
    actual_org_admins = [dict(row) for row in cur.fetchall()]

    # Query Demo Admin Personas
    cur.execute("""
    SELECT id, email, full_name, role, status
    FROM users
    WHERE is_demo = 1
    """)
    demo_accounts = [dict(row) for row in cur.fetchall()]

    conn.close()

    return {
        "actualSuperAdmins": actual_super_admins,
        "actualOrgAdmins": actual_org_admins,
        "demoPersonas": demo_accounts
    }

class UpdateProfileRequest(BaseModel):
    fullName: Optional[str] = None
    avatarUrl: Optional[str] = None
    department: Optional[str] = None

@router.put("/profile")
async def update_profile(
    req: UpdateProfileRequest,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Updates the authenticated user's name, avatar image URL/base64, or department.
    Persists changes to the persistent SQLite database.
    """
    conn = get_db_connection()
    cur = conn.cursor()

    updates = []
    params = []
    now = datetime.utcnow().isoformat() + "Z"

    if req.fullName is not None:
        updates.append("full_name = ?")
        params.append(req.fullName.strip())
    if req.avatarUrl is not None:
        updates.append("avatar_url = ?")
        params.append(req.avatarUrl)
    if req.department is not None:
        updates.append("department = ?")
        params.append(req.department.strip())

    if not updates:
        conn.close()
        return {"success": True, "message": "No changes specified."}

    updates.append("updated_at = ?")
    params.append(now)
    params.append(current_user.id)

    cur.execute(f"UPDATE users SET {', '.join(updates)} WHERE id = ?", params)
    conn.commit()

    # Re-fetch user
    cur.execute("""
    SELECT u.*, o.name as org_name
    FROM users u
    LEFT JOIN organizations o ON u.organization_id = o.id
    WHERE u.id = ?
    """, (current_user.id,))
    updated_user = cur.fetchone()
    conn.close()

    return {
        "success": True,
        "user": {
            "id": updated_user["id"],
            "name": updated_user["full_name"],
            "email": updated_user["email"],
            "role": updated_user["role"],
            "organizationId": updated_user["organization_id"] or "",
            "organisation": updated_user["org_name"] or "BrandSense Platform",
            "avatar": updated_user["avatar_url"] or "",
            "department": updated_user["department"] or "General",
            "isDemo": bool(updated_user["is_demo"])
        }
    }

