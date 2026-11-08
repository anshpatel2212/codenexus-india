import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

from backend.auth.jwt_guard import get_current_user, require_role, AuthenticatedUser
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
    """Retrieve approvals for organization strictly from SQLite."""
    conn = get_db_connection()
    cur = conn.cursor()
    org_id = current_user.organization_id or "org-demo-brandsense"
    
    try:
        if current_user.role == "Super Admin":
            cur.execute("""
                SELECT a.*, r.title as review_title, r.content_type, r.overall_score, r.author_id,
                       u.full_name as submitter_name, u.email as submitter_email
                FROM approvals a
                LEFT JOIN reviews r ON a.review_id = r.id
                LEFT JOIN users u ON a.submitted_by = u.id
                ORDER BY a.created_at DESC
            """)
        else:
            cur.execute("""
                SELECT a.*, r.title as review_title, r.content_type, r.overall_score, r.author_id,
                       u.full_name as submitter_name, u.email as submitter_email
                FROM approvals a
                LEFT JOIN reviews r ON a.review_id = r.id
                LEFT JOIN users u ON a.submitted_by = u.id
                WHERE a.organization_id = ? OR a.assigned_to = ?
                ORDER BY a.created_at DESC
            """, (org_id, current_user.id))
        
        rows = cur.fetchall()
        result = []
        for row in rows:
            # Fetch comments for this approval
            cur.execute("""
                SELECT c.*, u.full_name as author_name, u.role as author_role
                FROM approval_comments c
                LEFT JOIN users u ON c.author_id = u.id
                WHERE c.approval_id = ?
                ORDER BY c.created_at ASC
            """, (row["id"],))
            comment_rows = cur.fetchall()
            comments = [
                {
                    "id": c["id"],
                    "approvalId": c["approval_id"],
                    "authorId": c["author_id"],
                    "text": c["text"],
                    "createdAt": c["created_at"],
                    "timestamp": c["created_at"],
                    "author": {
                        "name": c["author_name"] or "Compliance Team",
                        "role": c["author_role"] or "Reviewer"
                    }
                }
                for c in comment_rows
            ]

            result.append({
                "id": row["id"],
                "reviewId": row["review_id"],
                "review_id": row["review_id"],
                "organizationId": row["organization_id"],
                "organization_id": row["organization_id"],
                "submittedBy": row["submitter_name"] or row["submitted_by"],
                "submitted_by": row["submitted_by"],
                "assignedTo": row["assigned_to"],
                "assigned_to": row["assigned_to"],
                "status": row["status"],
                "urgency": row["urgency"] or "Medium",
                "complianceScore": row["compliance_score"],
                "compliance_score": row["compliance_score"],
                "decisionNotes": row["decision_notes"],
                "decidedBy": row["decided_by"],
                "decidedAt": row["decided_at"],
                "createdAt": row["created_at"],
                "created_at": row["created_at"],
                "review": {
                    "id": row["review_id"],
                    "title": row["review_title"] or "Brand Review",
                    "contentType": row["content_type"] or "Campaign",
                    "content_type": row["content_type"] or "Campaign",
                    "overallScore": row["overall_score"] or 74.0,
                    "overall_score": row["overall_score"] or 74.0,
                },
                "comments": comments
            })
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch approvals from SQLite: {str(e)}")
    finally:
        conn.close()

@router.get("/{approval_id}/comments")
async def get_approval_comments(
    approval_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """Retrieve all comments for a specific approval item."""
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        if current_user.role == "Super Admin":
            cur.execute("""
                SELECT c.*, u.full_name as author_name, u.role as author_role
                FROM approval_comments c
                LEFT JOIN users u ON c.author_id = u.id
                WHERE c.approval_id = ?
                ORDER BY c.created_at ASC
            """, (approval_id,))
        else:
            org_id = current_user.organization_id or "org-demo-brandsense"
            cur.execute("""
                SELECT c.*, u.full_name as author_name, u.role as author_role
                FROM approval_comments c
                JOIN approvals a ON a.id = c.approval_id
                LEFT JOIN users u ON c.author_id = u.id
                WHERE c.approval_id = ? AND a.organization_id = ?
                ORDER BY c.created_at ASC
            """, (approval_id, org_id))
        rows = cur.fetchall()
        return [
            {
                "id": c["id"],
                "approvalId": c["approval_id"],
                "authorId": c["author_id"],
                "text": c["text"],
                "createdAt": c["created_at"],
                "timestamp": c["created_at"],
                "author": {
                    "name": c["author_name"] or "Compliance Team",
                    "role": c["author_role"] or "Reviewer"
                }
            }
            for c in rows
        ]
    finally:
        conn.close()

@router.post("/{approval_id}/decision")
async def execute_approval_decision(
    approval_id: str,
    req: ApprovalDecisionRequest,
    current_user: AuthenticatedUser = Depends(require_role(["Admin", "Manager", "Reviewer", "Super Admin"]))
):
    """
    Executes a formal pre-publication sign-off decision in SQLite.
    Strictly restricted to Reviewers, Managers, Admins, and Super Admin.
    """
    if req.status not in ["Approved", "Rejected", "Needs Revision"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Status must be one of: 'Approved', 'Rejected', 'Needs Revision'."
        )

    now_iso = datetime.utcnow().isoformat() + "Z"
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute("SELECT * FROM approvals WHERE id = ? OR review_id = ?", (approval_id, approval_id))
        approval = cur.fetchone()
        if not approval:
            raise HTTPException(status_code=404, detail="Approval record not found.")
        if current_user.role != "Super Admin" and approval["organization_id"] != (current_user.organization_id or "org-demo-brandsense"):
            raise HTTPException(status_code=404, detail="Approval record not found.")

        target_review_id = req.reviewId or approval["review_id"]
        actual_approval_id = approval["id"]

        # Update approval
        cur.execute("""
            UPDATE approvals 
            SET status = ?, decision_notes = ?, decided_by = ?, decided_at = ?
            WHERE id = ?
        """, (req.status, req.note or "", current_user.full_name, now_iso, actual_approval_id))

        # Update parent review status
        if target_review_id:
            cur.execute("""
                UPDATE reviews
                SET status = ?, updated_at = ?
                WHERE id = ? AND organization_id = ?
            """, (req.status, now_iso, target_review_id, approval["organization_id"]))

        # If a decision note was provided, insert an audit decision comment
        if req.note:
            comment_id = f"comm-{uuid.uuid4().hex[:8]}"
            cur.execute("""
                INSERT INTO approval_comments (id, approval_id, author_id, organization_id, text, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                comment_id,
                actual_approval_id,
                current_user.id,
                approval["organization_id"],
                f"[{req.status.upper()}] {req.note.strip()}",
                now_iso
            ))

        conn.commit()
    except HTTPException:
        conn.rollback()
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Database update failed: {str(e)}")
    finally:
        conn.close()

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
    """Adds a discussion comment to the approval audit trail in SQLite."""
    conn = get_db_connection()
    cur = conn.cursor()
    now_iso = datetime.utcnow().isoformat() + "Z"
    comment_id = f"comm-{uuid.uuid4().hex[:8]}"

    try:
        cur.execute("SELECT organization_id FROM approvals WHERE id = ?", (approval_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Approval record not found.")
        org_id = row["organization_id"] or "org-demo-brandsense"
        if current_user.role != "Super Admin" and org_id != (current_user.organization_id or "org-demo-brandsense"):
            raise HTTPException(status_code=404, detail="Approval record not found.")

        cur.execute("""
            INSERT INTO approval_comments (id, approval_id, author_id, organization_id, text, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            comment_id,
            approval_id,
            current_user.id,
            org_id,
            req.text.strip(),
            now_iso
        ))
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to save comment to SQLite: {str(e)}")
    finally:
        conn.close()

    return {
        "success": True,
        "id": comment_id,
        "approvalId": approval_id,
        "text": req.text.strip(),
        "createdAt": now_iso,
        "timestamp": "Just now",
        "author": {
            "name": current_user.full_name,
            "role": current_user.role
        }
    }

