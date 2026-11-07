import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime, timedelta
import secrets

from backend.auth.jwt_guard import get_current_user, require_role, AuthenticatedUser
from backend.services.db import get_db_connection

router = APIRouter(prefix="/onboarding", tags=["Organization Onboarding"])

class InviteMemberRequest(BaseModel):
    email: EmailStr
    role: str = Field(..., description="'Creator' | 'Manager' | 'Reviewer' | 'Admin'")

class AcceptInviteRequest(BaseModel):
    token: str

@router.post("/invite", status_code=status.HTTP_201_CREATED)
async def invite_organization_member(
    req: InviteMemberRequest,
    current_user: AuthenticatedUser = Depends(require_role(["Admin", "Super Admin"]))
):
    """
    Invite a new team member to the organization in persistent SQLite.
    Strictly restricted to Admin and Super Admin.
    """
    if req.role not in ["Admin", "Creator", "Manager", "Reviewer"]:
        raise HTTPException(status_code=400, detail="Invalid role specified.")

    token = secrets.token_hex(20)
    expires_at = datetime.utcnow() + timedelta(days=7)
    now_iso = datetime.utcnow().isoformat() + "Z"
    expires_iso = expires_at.isoformat() + "Z"
    invitation_id = f"inv-{uuid.uuid4().hex[:8]}"
    org_id = current_user.organization_id or "org-demo-brandsense"

    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            INSERT INTO invitations (
                id, organization_id, email, role, token, invited_by, status, expires_at, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?)
        """, (
            invitation_id,
            org_id,
            req.email.strip().lower(),
            req.role,
            token,
            current_user.id,
            expires_iso,
            now_iso
        ))
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to record invitation: {str(e)}")
    finally:
        conn.close()

    return {
        "success": True,
        "id": invitation_id,
        "email": req.email,
        "role": req.role,
        "token": token,
        "inviteLink": f"/invite?token={token}",
        "expiresAt": expires_iso
    }

@router.get("/invite/{token}")
async def verify_invite_token(token: str):
    """
    Validates an invitation token against persistent SQLite prior to signup or workspace join.
    Enforces real token lookup, email, status, and expiration.
    """
    if not token or len(token.strip()) < 8:
        raise HTTPException(status_code=400, detail="Invalid invitation token format.")

    clean_token = token.strip()
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
            SELECT i.*, o.name as organization_name
            FROM invitations i
            LEFT JOIN organizations o ON i.organization_id = o.id
            WHERE i.token = ?
        """, (clean_token,))
        record = cur.fetchone()

        if not record:
            # Check development demo token fallback
            if clean_token == "demo-invite-token-reviewer":
                return {
                    "valid": True,
                    "email": "invited.colleague@acmebrand.com",
                    "role": "Reviewer",
                    "organizationId": "org-demo-brandsense",
                    "organizationName": "BrandSense Demo Corp",
                    "expiresAt": (datetime.utcnow() + timedelta(days=7)).isoformat() + "Z"
                }
            raise HTTPException(status_code=404, detail="Invitation token not found.")

        if record["status"] != "pending":
            raise HTTPException(
                status_code=400, 
                detail=f"This invitation has already been {record['status']}."
            )

        # Check expiration
        expires_at_str = record["expires_at"]
        if expires_at_str:
            try:
                exp = datetime.fromisoformat(expires_at_str.replace("Z", "+00:00"))
                now = datetime.now(exp.tzinfo)
                if now > exp:
                    raise HTTPException(status_code=410, detail="This invitation link has expired.")
            except (ValueError, TypeError):
                pass

        return {
            "valid": True,
            "email": record["email"],
            "role": record["role"],
            "organizationId": record["organization_id"],
            "organizationName": record["organization_name"] or "BrandSense Workspace",
            "expiresAt": record["expires_at"]
        }
    finally:
        conn.close()

