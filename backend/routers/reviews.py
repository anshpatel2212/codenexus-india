from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid

from backend.auth.jwt_guard import get_current_user, require_role, AuthenticatedUser
from backend.services.ai_review_engine import ai_review_engine
from backend.services.supabase_admin import supabase_admin

router = APIRouter(prefix="/reviews", tags=["Reviews"])

class SubmitReviewRequest(BaseModel):
    title: str = Field(..., min_length=2)
    contentType: str = Field(..., description="e.g. Social Media, Press Release, Email")
    brandProfile: Optional[str] = "Corporate Core (Global English)"
    content: str = Field(..., min_length=5)
    instructions: Optional[str] = None
    filePath: Optional[str] = None
    fileUrl: Optional[str] = None

class RewriteRequest(BaseModel):
    originalText: str
    targetFindingId: Optional[str] = None

@router.post("/submit", status_code=status.HTTP_201_CREATED)
async def submit_review(
    req: SubmitReviewRequest,
    current_user: AuthenticatedUser = Depends(require_role(["Admin", "Creator", "Manager", "Reviewer"]))
):
    """
    Submit content for multi-vector AI governance verification.
    Stores review, findings, revision snapshot, and creates approval item.
    """
    review_id = f"REV-{datetime.utcnow().year}-{uuid.uuid4().hex[:4].upper()}"
    
    # 1. Run AI Review Engine
    overall_score, category_scores, findings, suggested_content = await ai_review_engine.analyze_content(
        content=req.content,
        content_type=req.contentType,
        brand_profile_name=req.brandProfile or "Corporate Core",
        org_id=current_user.organization_id
    )

    review_status = "Approved" if overall_score >= 95 else "Changes Requested"

    # 2. Persist to Supabase if live
    if supabase_admin.is_live():
        try:
            supabase_admin.client.table("reviews").insert({
                "id": review_id,
                "organization_id": current_user.organization_id,
                "title": req.title,
                "content_type": req.contentType,
                "original_content": req.content,
                "suggested_content": suggested_content,
                "instructions": req.instructions,
                "file_path": req.filePath or req.fileUrl,
                "file_url": req.fileUrl,
                "overall_score": overall_score,
                "category_scores": category_scores,
                "status": review_status,
                "author_id": current_user.id,
                "created_by": current_user.id,
                "revision_count": 1,
            }).execute()

            # Insert findings
            if findings:
                findings_rows = [
                    {
                        "id": f["id"],
                        "organization_id": current_user.organization_id,
                        "review_id": review_id,
                        "category": f["category"],
                        "severity": f["severity"],
                        "reason": f["reason"],
                        "evidence": f["evidence"],
                        "highlighted_text": f.get("highlightedText"),
                        "source_document": f.get("sourceDocument"),
                        "source_section": f.get("sourceSection"),
                        "confidence": f.get("confidence", 90),
                        "suggested_fix": f.get("suggestedFix"),
                        "explanation": f.get("explanation"),
                        "status": f.get("status", "pending")
                    }
                    for f in findings
                ]
                supabase_admin.client.table("findings").insert(findings_rows).execute()

            # Insert Revision #1
            supabase_admin.client.table("review_revisions").insert({
                "organization_id": current_user.organization_id,
                "review_id": review_id,
                "version_number": 1,
                "author_id": current_user.id,
                "compliance_score": overall_score,
                "status": "Initial Submission",
                "summary": "Original draft submitted for governance audit.",
                "content": req.content,
                "accepted_count": 0,
                "rejected_count": 0,
            }).execute()

            # Insert Approval
            supabase_admin.client.table("approvals").insert({
                "organization_id": current_user.organization_id,
                "review_id": review_id,
                "submitted_by": current_user.id,
                "urgency": "Medium",
                "compliance_score": overall_score,
                "status": "Pending",
            }).execute()

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database transaction error: Failed to save review ({str(e)})"
            )

    return {
        "id": review_id,
        "title": req.title,
        "contentType": req.contentType,
        "brandProfile": req.brandProfile or "Corporate Core (Global English)",
        "createdAt": datetime.utcnow().isoformat() + "Z",
        "updatedAt": datetime.utcnow().isoformat() + "Z",
        "author": {
            "name": current_user.full_name,
            "email": current_user.email,
            "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            "role": current_user.role,
        },
        "overallScore": overall_score,
        "status": review_status,
        "originalContent": req.content,
        "suggestedContent": suggested_content,
        "categoryScores": category_scores,
        "findings": findings,
        "revisionCount": 1,
    }

@router.get("")
async def list_reviews(
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """List reviews strictly isolated by the user's organization."""
    if supabase_admin.is_live():
        try:
            res = supabase_admin.client.table("reviews").select("*, findings(*)").eq("organization_id", current_user.organization_id).order("created_at", desc=True).execute()
            if res.data:
                return res.data
        except Exception:
            pass
    return []

@router.get("/{review_id}")
async def get_review(
    review_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """Retrieve single review with findings and revisions."""
    if supabase_admin.is_live():
        try:
            res = supabase_admin.client.table("reviews").select("*, findings(*)").eq("id", review_id).eq("organization_id", current_user.organization_id).single().execute()
            if res.data:
                return res.data
        except Exception:
            pass
    raise HTTPException(status_code=404, detail="Review not found.")

