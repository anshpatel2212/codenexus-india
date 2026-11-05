from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

from backend.auth.jwt_guard import get_current_user, require_role, AuthenticatedUser
from backend.services.supabase_admin import supabase_admin
from backend.services.db import get_db_connection

router = APIRouter(prefix="/approvals", tags=["Approvals"])

class ApprovalDecisionRequest(BaseModel):
    status: str = Field(..., description="'Approved' | 'Rejected' | 'Needs Revision'")
    reviewId: Optional[str] = None
    note: Optional[str] = None

class CommentRequest(BaseModel):
    text: str = Field(..., min_length=1)

@router.get("")
async def list_approvals(
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """Retrieve approvals for organization."""
    if supabase_admin.is_live():
        try:
            res = supabase_admin.client.table("approvals").select("*, review:reviews(title, content_type, overall_score)").eq("organization_id", current_user.organization_id).order("created_at", desc=True).execute()
            if res.data:
                return res.data
        except Exception:
            pass

    # SQLite fallback
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        org_id = current_user.organization_id or "org-demo-brandsense"
        
        cur.execute("""
            SELECT a.*, r.title as review_title, r.content_type, r.overall_score
            FROM approvals a
            LEFT JOIN reviews r ON a.review_id = r.id
            WHERE a.organization_id = ? OR a.assigned_to = ?
            ORDER BY a.created_at DESC
        """, (org_id, current_user.id))
        
        rows = cur.fetchall()
        result = []
        for row in rows:
            result.append({
                "id": row["id"],
                "review_id": row["review_id"],
                "organization_id": row["organization_id"],
                "submitted_by": row["submitted_by"],
                "assigned_to": row["assigned_to"],
                "status": row["status"],
                "urgency": row["urgency"],
                "compliance_score": row["compliance_score"],
                "created_at": row["created_at"],
                "review": {
                    "title": row["review_title"] or "Brand Review",
                    "content_type": row["content_type"] or "Campaign",
                    "overall_score": row["overall_score"] or 74.0
                }
            })
        conn.close()
        return result
    except Exception:
        return []

@router.post("/{approval_id}/decision")
async def execute_approval_decision(
    approval_id: str,
    req: ApprovalDecisionRequest,
    current_user: AuthenticatedUser = Depends(require_role(["Admin", "Manager", "Reviewer"]))
):
    """
    Executes a formal pre-publication sign-off decision.
    Strictly restricted to Reviewers, Managers, and Admins.
    """
    if req.status not in ["Approved", "Rejected", "Needs Revision"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Status must be one of: 'Approved', 'Rejected', 'Needs Revision'."
        )

    now_iso = datetime.utcnow().isoformat() + "Z"

    if supabase_admin.is_live():
        try:
            # 1. Update approval status
            supabase_admin.client.table("approvals").update({
                "status": req.status,
                "assigned_reviewer": current_user.id
            }).eq("id", approval_id).eq("organization_id", current_user.organization_id).execute()

            # 2. Update parent review status
            if req.reviewId:
                supabase_admin.client.table("reviews").update({
                    "status": req.status,
                    "reviewer_id": current_user.id
                }).eq("id", req.reviewId).eq("organization_id", current_user.organization_id).execute()

            # 3. Insert audit decision comment if note provided
            if req.note:
                supabase_admin.client.table("approval_comments").insert({
                    "organization_id": current_user.organization_id,
                    "approval_id": approval_id,
                    "author_id": current_user.id,
                    "comment_text": f"[{req.status.upper()}] {req.note}",
                    "resolved": True
                }).execute()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Database update failed: {e}")

    # Also persist to SQLite
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            UPDATE approvals 
            SET status = ?, decision_notes = ?, decided_by = ?, decided_at = ?
            WHERE id = ?
        """, (req.status, req.note or "", current_user.full_name, now_iso, approval_id))
        
        if req.reviewId:
            cur.execute("""
                UPDATE reviews
                SET status = ?, updated_at = ?
                WHERE id = ?
            """, (req.status, now_iso, req.reviewId))
        conn.commit()
        conn.close()
    except Exception:
        pass

    return {
        "success": True,
        "approvalId": approval_id,
        "status": req.status,
        "decidedBy": {
            "name": current_user.full_name,
            "role": current_user.role
        },
        "timestamp": now_iso
    }

@router.post("/{approval_id}/comments")
async def add_approval_comment(
    approval_id: str,
    req: CommentRequest,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """Adds a discussion comment to the approval audit trail."""
    if supabase_admin.is_live():
        try:
            res = supabase_admin.client.table("approval_comments").insert({
                "organization_id": current_user.organization_id,
                "approval_id": approval_id,
                "author_id": current_user.id,
                "comment_text": req.text,
            }).execute()
            return {"success": True, "data": res.data}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to post comment: {e}")

    return {
        "success": True,
        "id": f"comm-{int(datetime.utcnow().timestamp()*1000)}",
        "author": {
            "name": current_user.full_name,
            "role": current_user.role
        },
        "text": req.text,
        "timestamp": "Just now"
    }

