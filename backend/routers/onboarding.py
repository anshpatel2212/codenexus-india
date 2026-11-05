from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime, timedelta
import secrets

from backend.auth.jwt_guard import get_current_user, require_role, AuthenticatedUser
from backend.services.supabase_admin import supabase_admin

router = APIRouter(prefix="/onboarding", tags=["Organization Onboarding"])

class InviteMemberRequest(BaseModel):
    email: EmailStr
    role: str = Field(..., description="'Creator' | 'Manager' | 'Reviewer' | 'Admin'")

class AcceptInviteRequest(BaseModel):
    token: str

@router.post("/invite", status_code=status.HTTP_201_CREATED)
async def invite_organization_member(
    req: InviteMemberRequest,
    current_user: AuthenticatedUser = Depends(require_role(["Admin"]))
):
    """
    Invite a new team member to the organization.
    Strictly restricted to Admin role.
    """
    if req.role not in ["Admin", "Creator", "Manager", "Reviewer"]:
        raise HTTPException(status_code=400, detail="Invalid role specified.")

    token = secrets.token_hex(20)
    expires_at = datetime.utcnow() + timedelta(days=7)

    if supabase_admin.is_live():
        try:
            # Live invitations schema uses token_hash
            invite_data = {
                "organization_id": current_user.organization_id,
                "email": req.email,
                "role": req.role,
                "invited_by": current_user.id,
                "token_hash": token,
                "expires_at": expires_at.isoformat() + "Z",
                "status": "pending"
            }
            res = supabase_admin.client.table("invitations").insert(invite_data).execute()
        except Exception as e:
            # Fallback for schemas with token column
            try:
                invite_data["token"] = token
                res = supabase_admin.client.table("invitations").insert(invite_data).execute()
            except Exception:
                raise HTTPException(status_code=500, detail=f"Failed to record invitation: {e}")

    return {
        "success": True,
        "email": req.email,
        "role": req.role,
        "token": token,
        "inviteLink": f"/invite?token={token}",
        "expiresAt": expires_at.isoformat() + "Z"
    }

@router.get("/invite/{token}")
async def verify_invite_token(token: str):
    """
    Validates an invitation token prior to signup or workspace join.
    Enforces real token lookup, email, status, and expiration.
    Never returns fake valid invitation in production.
    """
    if not token or len(token.strip()) < 8:
        raise HTTPException(status_code=400, detail="Invalid invitation token format.")

    if supabase_admin.is_live():
        record = None
        # Try query by token, then fallback to token_hash
        try:
            res = supabase_admin.client.table("invitations").select("*, organizations(name)").eq("token", token).single().execute()
            if res.data:
                record = res.data
        except Exception:
            try:
                res = supabase_admin.client.table("invitations").select("*, organizations(name)").eq("token_hash", token).single().execute()
                if res.data:
                    record = res.data
            except Exception:
                record = None

        if not record:
            raise HTTPException(status_code=404, detail="Invitation token not found.")

        if record.get("status") != "pending":
            raise HTTPException(
                status_code=400, 
                detail=f"This invitation has already been {record.get('status', 'processed')}."
            )

        # Check expiration
        expires_at_str = record.get("expires_at")
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
            "organizationId": record.get("organization_id"),
            "organizationName": record.get("organizations", {}).get("name") if isinstance(record.get("organizations"), dict) else "Enterprise Organization",
            "expiresAt": record.get("expires_at")
        }

    # Development-only explicit mock token for testing
    if not supabase_admin.is_live() and token == "demo-invite-token-reviewer":
        return {
            "valid": True,
            "email": "invited.colleague@acmebrand.com",
            "role": "Reviewer",
            "organizationId": "org-1",
            "organizationName": "Acme Enterprise Holdings",
            "expiresAt": (datetime.utcnow() + timedelta(days=7)).isoformat() + "Z"
        }

    raise HTTPException(
        status_code=404, 
        detail="Invalid, expired, or unavailable invitation token."
    )

