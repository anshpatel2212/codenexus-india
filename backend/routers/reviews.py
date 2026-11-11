from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid
import json
import logging

from backend.auth.jwt_guard import get_current_user, require_role, AuthenticatedUser
from backend.services.ai_review_engine import ai_review_engine, extract_document_text
from backend.services.db import get_db_connection

logger = logging.getLogger("brandsense.reviews")

router = APIRouter(prefix="/reviews", tags=["Reviews"])

class SubmitReviewRequest(BaseModel):
    title: str = Field(..., min_length=2)
    contentType: str = Field(..., description="e.g. Social Media, Press Release, Email")
    brandProfile: Optional[str] = "Corporate Core (Global English)"
    content: str = Field(..., min_length=5)
    instructions: Optional[str] = None
    filePath: Optional[str] = None
    fileUrl: Optional[str] = None
    pages: Optional[List[Dict[str, Any]]] = None
    fileType: Optional[str] = None
    fileName: Optional[str] = None
    pageCount: Optional[int] = 1

class RewriteRequest(BaseModel):
    originalText: str
    targetFindingId: Optional[str] = None
    instructions: Optional[str] = None

class CreateRevisionRequest(BaseModel):
    content: str = Field(..., min_length=5)
    summary: Optional[str] = "Updated content revision"
    complianceScore: Optional[float] = None
    status: Optional[str] = "Draft Revision"
    acceptedCount: Optional[int] = 0
    rejectedCount: Optional[int] = 0

class UpdateFindingRequest(BaseModel):
    status: str = Field(..., description="'pending' | 'accepted' | 'rejected' | 'modified'")
    suggestedFix: Optional[str] = None
    userNote: Optional[str] = None

class UpdateReviewContentRequest(BaseModel):
    content: str = Field(..., min_length=1)
    findingId: Optional[str] = None
    findingStatus: Optional[str] = "accepted"
    summary: Optional[str] = None

def recalculate_review_score(findings: List[Dict[str, Any]]) -> Tuple[float, Dict[str, int], str]:
    """
    Recalculates governance score using the established empirical penalty framework:
      - Critical severity unresolved finding: 15 point penalty
      - High severity unresolved finding: 8 point penalty
      - Medium severity unresolved finding: 4 point penalty
      - Low severity unresolved finding: 2 point penalty
    Overall score is bounded within [50.0, 100.0].
    Category scores restore to baseline when category findings are resolved.
    Status transitions to 'Approved' when overall_score >= 95, else 'Changes Requested'.
    """
    unresolved = [f for f in findings if f.get("status") != "accepted"]

    critical_count = sum(1 for f in unresolved if f.get("severity") == "Critical")
    high_count = sum(1 for f in unresolved if f.get("severity") == "High")
    med_count = sum(1 for f in unresolved if f.get("severity") == "Medium")
    low_count = sum(1 for f in unresolved if f.get("severity") == "Low")

    penalty = (critical_count * 15) + (high_count * 8) + (med_count * 4) + (low_count * 2)
    overall_score = float(max(50, min(100, 100 - penalty)))

    unresolved_categories = {f.get("category") for f in unresolved}

    category_scores = {
        "Tone and Voice": 75 if "Tone and Voice" in unresolved_categories else 95,
        "Terminology": 70 if "Terminology" in unresolved_categories else 96,
        "Facts and Claims": 65 if "Facts and Claims" in unresolved_categories else 94,
        "Promotional Claims": 60 if "Promotional Claims" in unresolved_categories else 98,
        "Visual Consistency": 95,
        "Accessibility": 82 if "Accessibility" in unresolved_categories else 96,
    }

    review_status = "Approved" if overall_score >= 95 else "Changes Requested"
    return overall_score, category_scores, review_status

@router.post("/submit", status_code=status.HTTP_201_CREATED)
async def submit_review(
    req: SubmitReviewRequest,
    current_user: AuthenticatedUser = Depends(require_role(["Admin", "Creator", "Manager", "Reviewer", "Super Admin"]))
):
    """
    Submit content for multi-vector AI governance verification.
    Stores review, findings, initial revision, and approval record in persistent SQLite.
    """
    review_id = f"REV-{datetime.utcnow().year}-{uuid.uuid4().hex[:4].upper()}"
    org_id = current_user.organization_id or "org-demo-brandsense"
    now_iso = datetime.utcnow().isoformat() + "Z"

    # 1. Run Dual-Pass AI Review Engine
    overall_score, category_scores, findings, suggested_content = await ai_review_engine.analyze_content(
        content=req.content,
        content_type=req.contentType,
        brand_profile_name=req.brandProfile or "Corporate Core",
        org_id=org_id,
        pages=req.pages
    )

    review_status = "Approved" if overall_score >= 95 else "Changes Requested"

    # 2. Atomic SQLite Transaction
    conn = get_db_connection()
    try:
        cur = conn.cursor()

        # Insert Review
        cur.execute("""
            INSERT INTO reviews (
                id, organization_id, title, content_type, original_content,
                modified_content, suggested_content, instructions, overall_score, category_scores,
                status, author_id, file_type, file_name, page_count, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            review_id,
            org_id,
            req.title.strip(),
            req.contentType,
            req.content,
            req.content,
            suggested_content,
            req.instructions,
            overall_score,
            json.dumps(category_scores),
            review_status,
            current_user.id,
            req.fileType or ("document" if req.pages else "text"),
            req.fileName,
            req.pageCount or (len(req.pages) if req.pages else 1),
            now_iso,
            now_iso
        ))

        # Insert Verified Findings
        for idx, f in enumerate(findings):
            fid = f"fnd-{uuid.uuid4().hex[:10]}"
            f["id"] = fid
            cur.execute("""
                INSERT INTO findings (
                    id, review_id, organization_id, category, severity,
                    reason, evidence, highlighted_text, suggested_fix,
                    explanation, confidence, status,
                    verification_status, verification_confidence, verification_notes,
                    escalated_to_human, source_page, source_section, source_document, evidence_quote
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                fid,
                review_id,
                org_id,
                f["category"],
                f["severity"],
                f["reason"],
                f.get("evidence"),
                f.get("highlightedText"),
                f.get("suggestedFix"),
                f.get("explanation"),
                f.get("confidence", 90),
                f.get("status", "pending"),
                f.get("verificationStatus") or f.get("verification_status") or "verified",
                f.get("verificationConfidence") or f.get("verification_confidence") or 90.0,
                f.get("verificationNotes") or f.get("verification_notes") or "",
                1 if (f.get("escalatedToHuman") or f.get("escalated_to_human")) else 0,
                f.get("sourcePage") or f.get("source_page") or 1,
                f.get("sourceSection") or f.get("source_section") or "General",
                f.get("sourceDocument") or f.get("source_document") or "Enterprise Brand Guidelines",
                f.get("evidenceQuote") or f.get("evidence_quote") or f.get("evidence")
            ))

        # Insert Revision #1
        revision_id = f"rev-snap-{uuid.uuid4().hex[:8]}"
        cur.execute("""
            INSERT INTO review_revisions (
                id, organization_id, review_id, version_number, author_id,
                compliance_score, status, summary, content, accepted_count,
                rejected_count, created_at
            ) VALUES (?, ?, ?, 1, ?, ?, 'Initial Submission', 'Original draft submitted for governance audit.', ?, 0, 0, ?)
        """, (
            revision_id,
            org_id,
            review_id,
            current_user.id,
            overall_score,
            req.content,
            now_iso
        ))

        # Insert Approval Item
        approval_id = f"appr-{uuid.uuid4().hex[:8]}"
        cur.execute("""
            INSERT INTO approvals (
                id, review_id, organization_id, submitted_by, assigned_to,
                status, urgency, compliance_score, created_at
            ) VALUES (?, ?, ?, ?, ?, 'Pending', ?, ?, ?)
        """, (
            approval_id,
            review_id,
            org_id,
            current_user.id,
            None,
            "Medium" if overall_score >= 75 else "High",
            overall_score,
            now_iso
        ))

        conn.commit()
    except Exception as db_err:
        conn.rollback()
        logger.error(f"Failed to persist review transaction to SQLite: {db_err}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database transaction error: Failed to save review ({str(db_err)})"
        )
    finally:
        conn.close()

    return {
        "id": review_id,
        "review_id": review_id,
        "reviewId": review_id,
        "title": req.title.strip(),
        "contentType": req.contentType,
        "content_type": req.contentType,
        "brandProfile": req.brandProfile or "Corporate Core (Global English)",
        "createdAt": now_iso,
        "updatedAt": now_iso,
        "created_at": now_iso,
        "updated_at": now_iso,
        "author": {
            "name": current_user.full_name,
            "email": current_user.email,
            "avatar": getattr(current_user, "avatar_url", None) or "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            "role": current_user.role,
        },
        "authorId": current_user.id,
        "author_id": current_user.id,
        "organizationId": org_id,
        "organization_id": org_id,
        "overallScore": overall_score,
        "overall_score": overall_score,
        "status": review_status,
        "originalContent": req.content,
        "original_content": req.content,
        "modifiedContent": req.content,
        "modified_content": req.content,
        "suggestedContent": suggested_content,
        "suggested_content": suggested_content,
        "categoryScores": category_scores,
        "category_scores": category_scores,
        "findings": findings,
        "revisionCount": 1,
    }

@router.get("")
async def list_reviews(
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """List reviews strictly isolated by the user's organization."""
    conn = get_db_connection()
    cur = conn.cursor()
    org_id = current_user.organization_id or "org-demo-brandsense"

    try:
        if current_user.role == "Super Admin":
            cur.execute("""
                SELECT r.*, u.full_name as author_name, u.email as author_email, u.role as author_role, u.avatar_url as author_avatar
                FROM reviews r
                LEFT JOIN users u ON r.author_id = u.id
                ORDER BY r.created_at DESC
            """)
        else:
            cur.execute("""
                SELECT r.*, u.full_name as author_name, u.email as author_email, u.role as author_role, u.avatar_url as author_avatar
                FROM reviews r
                LEFT JOIN users u ON r.author_id = u.id
                WHERE r.organization_id = ?
                ORDER BY r.created_at DESC
            """, (org_id,))

        rows = cur.fetchall()
        reviews_list = []
        for r in rows:
            cat_scores = {}
            try:
                cat_scores = json.loads(r["category_scores"]) if r["category_scores"] else {}
            except Exception:
                pass

            # Fetch findings count and findings for this review
            cur.execute("SELECT * FROM findings WHERE review_id = ?", (r["id"],))
            f_rows = cur.fetchall()
            findings = [
                {
                    "id": f["id"],
                    "reviewId": f["review_id"],
                    "category": f["category"],
                    "severity": f["severity"],
                    "reason": f["reason"],
                    "evidence": f["evidence"],
                    "highlightedText": f["highlighted_text"],
                    "suggestedFix": f["suggested_fix"],
                    "explanation": f["explanation"],
                    "confidence": f["confidence"],
                    "status": f["status"],
                    "verificationStatus": f["verification_status"] or "verified",
                    "verification_status": f["verification_status"] or "verified",
                    "verificationConfidence": f["verification_confidence"] or f["confidence"] or 90.0,
                    "verification_confidence": f["verification_confidence"] or f["confidence"] or 90.0,
                    "verificationNotes": f["verification_notes"] or "",
                    "verification_notes": f["verification_notes"] or "",
                    "escalatedToHuman": bool(f["escalated_to_human"]),
                    "escalated_to_human": bool(f["escalated_to_human"]),
                    "sourcePage": f["source_page"] or 1,
                    "source_page": f["source_page"] or 1,
                    "sourceSection": f["source_section"] or "General",
                    "source_section": f["source_section"] or "General",
                    "evidenceQuote": f["evidence_quote"] or f["evidence"],
                    "evidence_quote": f["evidence_quote"] or f["evidence"]
                }
                for f in f_rows
            ]

            mod_content = r["modified_content"] if ("modified_content" in r.keys() and r["modified_content"]) else r["original_content"]

            reviews_list.append({
                "id": r["id"],
                "review_id": r["id"],
                "reviewId": r["id"],
                "organizationId": r["organization_id"],
                "organization_id": r["organization_id"],
                "title": r["title"],
                "contentType": r["content_type"],
                "content_type": r["content_type"],
                "originalContent": r["original_content"],
                "original_content": r["original_content"],
                "modifiedContent": mod_content,
                "modified_content": mod_content,
                "suggestedContent": r["suggested_content"],
                "suggested_content": r["suggested_content"],
                "overallScore": r["overall_score"],
                "overall_score": r["overall_score"],
                "categoryScores": cat_scores,
                "category_scores": cat_scores,
                "status": r["status"],
                "authorId": r["author_id"],
                "author_id": r["author_id"],
                "author": {
                    "name": r["author_name"] or "Author",
                    "email": r["author_email"] or "",
                    "role": r["author_role"] or "Creator",
                    "avatar": r["author_avatar"] or ""
                },
                "createdAt": r["created_at"],
                "created_at": r["created_at"],
                "updatedAt": r["updated_at"],
                "updated_at": r["updated_at"],
                "findings": findings
            })
        return reviews_list
    except Exception as e:
        logger.error(f"Failed to list reviews from SQLite: {e}")
        return []
    finally:
        conn.close()

@router.get("/{review_id}")
async def get_review(
    review_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """Retrieve single review with findings and revisions strictly from SQLite."""
    conn = get_db_connection()
    cur = conn.cursor()
    org_id = current_user.organization_id or "org-demo-brandsense"

    try:
        if current_user.role == "Super Admin":
            cur.execute("""
                SELECT r.*, u.full_name as author_name, u.email as author_email, u.role as author_role, u.avatar_url as author_avatar
                FROM reviews r
                LEFT JOIN users u ON r.author_id = u.id
                WHERE r.id = ?
            """, (review_id,))
        else:
            cur.execute("""
                SELECT r.*, u.full_name as author_name, u.email as author_email, u.role as author_role, u.avatar_url as author_avatar
                FROM reviews r
                LEFT JOIN users u ON r.author_id = u.id
                WHERE r.id = ? AND r.organization_id = ?
            """, (review_id, org_id))

        r = cur.fetchone()
        if not r:
            raise HTTPException(status_code=404, detail="Review not found.")

        # Findings
        cur.execute("SELECT * FROM findings WHERE review_id = ?", (review_id,))
        f_rows = cur.fetchall()
        findings = [
            {
                "id": f["id"],
                "reviewId": f["review_id"],
                "category": f["category"],
                "severity": f["severity"],
                "reason": f["reason"],
                "evidence": f["evidence"],
                "highlightedText": f["highlighted_text"],
                "suggestedFix": f["suggested_fix"],
                "explanation": f["explanation"],
                "confidence": f["confidence"],
                "status": f["status"],
                "verificationStatus": f["verification_status"] or "verified",
                "verification_status": f["verification_status"] or "verified",
                "verificationConfidence": f["verification_confidence"] or f["confidence"] or 90.0,
                "verification_confidence": f["verification_confidence"] or f["confidence"] or 90.0,
                "verificationNotes": f["verification_notes"] or "",
                "verification_notes": f["verification_notes"] or "",
                "escalatedToHuman": bool(f["escalated_to_human"]),
                "escalated_to_human": bool(f["escalated_to_human"]),
                "sourcePage": f["source_page"] or 1,
                "source_page": f["source_page"] or 1,
                "sourceSection": f["source_section"] or "General",
                "source_section": f["source_section"] or "General",
                "evidenceQuote": f["evidence_quote"] or f["evidence"],
                "evidence_quote": f["evidence_quote"] or f["evidence"]
            }
            for f in f_rows
        ]

        # Revisions
        cur.execute("""
            SELECT rev.*, u.full_name as author_name, u.role as author_role
            FROM review_revisions rev
            LEFT JOIN users u ON rev.author_id = u.id
            WHERE rev.review_id = ?
            ORDER BY rev.version_number DESC
        """, (review_id,))
        rev_rows = cur.fetchall()
        revisions = [
            {
                "id": rev["id"],
                "versionNumber": rev["version_number"],
                "author": f"{rev['author_name'] or 'Creator'} ({rev['author_role'] or 'Creator'})",
                "complianceScore": rev["compliance_score"],
                "status": rev["status"],
                "summary": rev["summary"],
                "content": rev["content"],
                "acceptedCount": rev["accepted_count"],
                "rejectedCount": rev["rejected_count"],
                "createdAt": rev["created_at"],
                "date": rev["created_at"]
            }
            for rev in rev_rows
        ]

        cat_scores = {}
        try:
            cat_scores = json.loads(r["category_scores"]) if r["category_scores"] else {}
        except Exception:
            pass

        mod_content = r["modified_content"] if ("modified_content" in r.keys() and r["modified_content"]) else r["original_content"]

        return {
            "id": r["id"],
            "review_id": r["id"],
            "reviewId": r["id"],
            "organizationId": r["organization_id"],
            "organization_id": r["organization_id"],
            "title": r["title"],
            "contentType": r["content_type"],
            "content_type": r["content_type"],
            "originalContent": r["original_content"],
            "original_content": r["original_content"],
            "modifiedContent": mod_content,
            "modified_content": mod_content,
            "suggestedContent": r["suggested_content"],
            "suggested_content": r["suggested_content"],
            "instructions": r["instructions"],
            "overallScore": r["overall_score"],
            "overall_score": r["overall_score"],
            "categoryScores": cat_scores,
            "category_scores": cat_scores,
            "status": r["status"],
            "authorId": r["author_id"],
            "author_id": r["author_id"],
            "author": {
                "name": r["author_name"] or "Author",
                "email": r["author_email"] or "",
                "role": r["author_role"] or "Creator",
                "avatar": r["author_avatar"] or ""
            },
            "createdAt": r["created_at"],
            "created_at": r["created_at"],
            "updatedAt": r["updated_at"],
            "updated_at": r["updated_at"],
            "findings": findings,
            "revisions": revisions,
            "revisionCount": max(len(revisions), 1)
        }
    finally:
        conn.close()

@router.get("/{review_id}/revisions")
async def get_review_revisions(
    review_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """Retrieve full revision history for a review."""
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        org_id = current_user.organization_id or "org-demo-brandsense"
        if current_user.role == "Super Admin":
            cur.execute("""
                SELECT rev.*, u.full_name as author_name, u.role as author_role
                FROM review_revisions rev
                LEFT JOIN users u ON rev.author_id = u.id
                WHERE rev.review_id = ?
                ORDER BY rev.version_number DESC
            """, (review_id,))
        else:
            cur.execute("""
                SELECT rev.*, u.full_name as author_name, u.role as author_role
                FROM review_revisions rev
                JOIN reviews r ON r.id = rev.review_id
                LEFT JOIN users u ON rev.author_id = u.id
                WHERE rev.review_id = ? AND r.organization_id = ?
                ORDER BY rev.version_number DESC
            """, (review_id, org_id))
        rows = cur.fetchall()
        return [
            {
                "id": rev["id"],
                "versionNumber": rev["version_number"],
                "author": f"{rev['author_name'] or 'Creator'} ({rev['author_role'] or 'Creator'})",
                "complianceScore": rev["compliance_score"],
                "status": rev["status"],
                "summary": rev["summary"],
                "content": rev["content"],
                "acceptedCount": rev["accepted_count"],
                "rejectedCount": rev["rejected_count"],
                "createdAt": rev["created_at"],
                "date": rev["created_at"]
            }
            for rev in rows
        ]
    finally:
        conn.close()

@router.post("/{review_id}/revisions", status_code=status.HTTP_201_CREATED)
async def create_review_revision(
    review_id: str,
    req: CreateRevisionRequest,
    current_user: AuthenticatedUser = Depends(require_role(["Admin", "Creator", "Manager", "Reviewer", "Super Admin"]))
):
    """Save an updated content revision snapshot in SQLite."""
    conn = get_db_connection()
    cur = conn.cursor()
    now_iso = datetime.utcnow().isoformat() + "Z"
    revision_id = f"rev-snap-{uuid.uuid4().hex[:8]}"

    try:
        cur.execute("SELECT organization_id, overall_score FROM reviews WHERE id = ?", (review_id,))
        rev_row = cur.fetchone()
        if not rev_row:
            raise HTTPException(status_code=404, detail="Parent review not found.")

        org_id = rev_row["organization_id"]
        if current_user.role != "Super Admin" and org_id != (current_user.organization_id or "org-demo-brandsense"):
            raise HTTPException(status_code=404, detail="Parent review not found.")

        # Calculate next version number
        cur.execute("SELECT MAX(version_number) FROM review_revisions WHERE review_id = ?", (review_id,))
        max_ver = cur.fetchone()[0] or 1
        next_ver = max_ver + 1

        score = req.complianceScore if req.complianceScore is not None else rev_row["overall_score"]

        cur.execute("""
            INSERT INTO review_revisions (
                id, organization_id, review_id, version_number, author_id,
                compliance_score, status, summary, content, accepted_count,
                rejected_count, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            revision_id,
            org_id,
            review_id,
            next_ver,
            current_user.id,
            score,
            req.status or "Draft Revision",
            req.summary or f"Revision v{next_ver}",
            req.content,
            req.acceptedCount or 0,
            req.rejectedCount or 0,
            now_iso
        ))

        # Update parent review content
        cur.execute("""
            UPDATE reviews
            SET modified_content = ?, updated_at = ?
            WHERE id = ? AND organization_id = ?
        """, (req.content, now_iso, review_id, org_id))

        conn.commit()
    except HTTPException:
        conn.rollback()
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to record revision: {str(e)}")
    finally:
        conn.close()

    return {
        "success": True,
        "id": revision_id,
        "reviewId": review_id,
        "versionNumber": next_ver,
        "summary": req.summary,
        "complianceScore": score,
        "createdAt": now_iso
    }

@router.patch("/{review_id}/findings/{finding_id}")
async def update_finding_status(
    review_id: str,
    finding_id: str,
    req: UpdateFindingRequest,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """Updates status and suggested fix on a specific finding."""
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        if current_user.role == "Super Admin":
            cur.execute("""
                UPDATE findings 
                SET status = ?, suggested_fix = COALESCE(?, suggested_fix)
                WHERE id = ? AND review_id = ?
            """, (req.status, req.suggestedFix, finding_id, review_id))
        else:
            org_id = current_user.organization_id or "org-demo-brandsense"
            cur.execute("""
                UPDATE findings 
                SET status = ?, suggested_fix = COALESCE(?, suggested_fix)
                WHERE id = ? AND review_id = ?
                  AND review_id IN (SELECT id FROM reviews WHERE organization_id = ?)
            """, (req.status, req.suggestedFix, finding_id, review_id, org_id))
        
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Finding not found.")

        # Recalculate score based on remaining unresolved findings
        cur.execute("SELECT category, severity, status FROM findings WHERE review_id = ?", (review_id,))
        f_rows = [dict(f) for f in cur.fetchall()]
        new_score, new_cats, new_status = recalculate_review_score(f_rows)

        cur.execute("""
            UPDATE reviews
            SET overall_score = ?, category_scores = ?, status = ?, updated_at = ?
            WHERE id = ?
        """, (new_score, json.dumps(new_cats), new_status, datetime.utcnow().isoformat() + "Z", review_id))

        cur.execute("""
            UPDATE approvals
            SET compliance_score = ?,
                urgency = ?
            WHERE review_id = ?
        """, (new_score, "Low" if new_score >= 90 else ("Medium" if new_score >= 75 else "High"), review_id))

        conn.commit()
        return {
            "success": True,
            "findingId": finding_id,
            "status": req.status,
            "overallScore": new_score,
            "overall_score": new_score,
            "categoryScores": new_cats,
            "category_scores": new_cats,
            "reviewStatus": new_status
        }
    except HTTPException:
        conn.rollback()
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update finding: {str(e)}")
    finally:
        conn.close()

@router.patch("/{review_id}")
@router.put("/{review_id}")
async def update_review_content(
    review_id: str,
    req: UpdateReviewContentRequest,
    current_user: AuthenticatedUser = Depends(require_role(["Admin", "Creator", "Manager", "Reviewer", "Super Admin"]))
):
    """
    Updates the active modified content of a review and optionally marks a finding status.
    Recalculates the governance score and category scores using the standard compliance algorithm,
    persists the updated score in SQLite, records a revision snapshot, and updates approvals.
    """
    conn = get_db_connection()
    cur = conn.cursor()
    now_iso = datetime.utcnow().isoformat() + "Z"

    try:
        cur.execute("SELECT id, organization_id, overall_score, original_content, modified_content FROM reviews WHERE id = ?", (review_id,))
        rev_row = cur.fetchone()
        if not rev_row:
            raise HTTPException(status_code=404, detail="Review not found.")

        org_id = rev_row["organization_id"]
        user_org = current_user.organization_id or "org-demo-brandsense"
        if current_user.role != "Super Admin" and org_id != user_org:
            raise HTTPException(status_code=403, detail="Not authorized to edit this review.")

        # 1. Update review modified_content and updated_at
        cur.execute("""
            UPDATE reviews
            SET modified_content = ?, updated_at = ?
            WHERE id = ?
        """, (req.content, now_iso, review_id))

        # 2. If findingId provided, update finding status to 'accepted' (or specified status)
        if req.findingId:
            cur.execute("""
                UPDATE findings
                SET status = ?
                WHERE id = ? AND review_id = ?
            """, (req.findingStatus or "accepted", req.findingId, review_id))

        # 3. Recalculate governance score and category scores with updated findings
        cur.execute("SELECT category, severity, status FROM findings WHERE review_id = ?", (review_id,))
        f_rows = [dict(f) for f in cur.fetchall()]
        new_overall_score, new_cat_scores, new_status = recalculate_review_score(f_rows)

        # 4. Persist recalculated score and category scores in reviews table
        cur.execute("""
            UPDATE reviews
            SET overall_score = ?, category_scores = ?, status = ?
            WHERE id = ?
        """, (new_overall_score, json.dumps(new_cat_scores), new_status, review_id))

        # 5. Insert revision history snapshot with recalculated score
        cur.execute("SELECT MAX(version_number) FROM review_revisions WHERE review_id = ?", (review_id,))
        max_ver = cur.fetchone()[0] or 1
        next_ver = max_ver + 1
        revision_id = f"rev-snap-{uuid.uuid4().hex[:8]}"

        summary_text = req.summary or (f"Applied AI Fix for finding {req.findingId}" if req.findingId else f"Revision v{next_ver}")

        cur.execute("""
            INSERT INTO review_revisions (
                id, organization_id, review_id, version_number, author_id,
                compliance_score, status, summary, content, accepted_count,
                rejected_count, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, 'Draft Revision', ?, ?, 1, 0, ?)
        """, (
            revision_id,
            org_id,
            review_id,
            next_ver,
            current_user.id,
            new_overall_score,
            summary_text,
            req.content,
            now_iso
        ))

        # 6. Synchronize approvals table compliance score & urgency
        cur.execute("""
            UPDATE approvals
            SET compliance_score = ?,
                urgency = ?
            WHERE review_id = ?
        """, (new_overall_score, "Low" if new_overall_score >= 90 else ("Medium" if new_overall_score >= 75 else "High"), review_id))

        conn.commit()
        return {
            "success": True,
            "id": review_id,
            "reviewId": review_id,
            "overallScore": new_overall_score,
            "overall_score": new_overall_score,
            "categoryScores": new_cat_scores,
            "category_scores": new_cat_scores,
            "status": new_status,
            "modifiedContent": req.content,
            "modified_content": req.content,
            "findingId": req.findingId,
            "findingStatus": req.findingStatus or "accepted",
            "versionNumber": next_ver,
            "updatedAt": now_iso
        }
    except HTTPException:
        conn.rollback()
        raise
    except Exception as e:
        conn.rollback()
        logger.error(f"Failed to update review content: {e}")
        raise HTTPException(status_code=500, detail=f"Database update failed: {str(e)}")
    finally:
        conn.close()


@router.delete("/{review_id}")
async def delete_review(
    review_id: str,
    current_user: AuthenticatedUser = Depends(require_role(["Admin", "Super Admin", "Manager"]))
):
    """Deletes review and cascades findings, approvals, and revisions."""
    conn = get_db_connection()
    cur = conn.cursor()
    org_id = current_user.organization_id or "org-demo-brandsense"
    try:
        if current_user.role == "Super Admin":
            cur.execute("DELETE FROM reviews WHERE id = ?", (review_id,))
        else:
            cur.execute("DELETE FROM reviews WHERE id = ? AND organization_id = ?", (review_id, org_id))
        
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Review not found in your organization.")
        
        # Also clean up child tables
        cur.execute("DELETE FROM findings WHERE review_id = ?", (review_id,))
        cur.execute("DELETE FROM approvals WHERE review_id = ?", (review_id,))
        cur.execute("DELETE FROM review_revisions WHERE review_id = ?", (review_id,))
        conn.commit()
    except HTTPException:
        conn.rollback()
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete review: {str(e)}")
    finally:
        conn.close()

    return {"success": True, "deletedReviewId": review_id}

@router.post("/{review_id}/rewrite")
async def rewrite_review_content(
    review_id: str,
    req: RewriteRequest,
    current_user: AuthenticatedUser = Depends(require_role(["Admin", "Creator", "Manager", "Reviewer", "Super Admin"]))
):
    """
    Generate an intent-preserving, compliant rewrite for flagged content or a specific finding.
    """
    finding_reason = None
    if req.targetFindingId:
        try:
            conn = get_db_connection()
            cur = conn.cursor()
            if current_user.role == "Super Admin":
                cur.execute("SELECT reason FROM findings WHERE id = ? AND review_id = ?", (req.targetFindingId, review_id))
            else:
                org_id = current_user.organization_id or "org-demo-brandsense"
                cur.execute("""
                    SELECT f.reason FROM findings f
                    JOIN reviews r ON r.id = f.review_id
                    WHERE f.id = ? AND f.review_id = ? AND r.organization_id = ?
                """, (req.targetFindingId, review_id, org_id))
            row = cur.fetchone()
            if row:
                finding_reason = row["reason"]
            conn.close()
        except Exception:
            pass

    res = await ai_review_engine.rewrite_text(
        original_text=req.originalText,
        finding_reason=finding_reason,
        instructions=req.instructions
    )

    return {
        "success": True,
        "reviewId": review_id,
        "originalText": req.originalText,
        "rewrittenText": res.get("rewrittenText", req.originalText),
        "intentPreservationScore": res.get("intentPreservationScore", 98.0),
        "keyFactsRetained": res.get("keyFactsRetained", []),
        "targetFindingId": req.targetFindingId
    }

@router.post("/extract-document")
async def extract_document(
    file: UploadFile = File(...),
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Server-side multi-page document parser for PDF, DOCX, TXT, and Markdown files.
    Extracts text, page counts, and section-level headings for deep governance auditing.
    """
    try:
        content = await file.read()
        extracted = extract_document_text(content, file.filename or "document")
        return {
            "success": True,
            "filename": file.filename,
            "format": extracted["format"],
            "pageCount": extracted["pageCount"],
            "fullText": extracted["fullText"],
            "pages": extracted["pages"]
        }
    except Exception as e:
        logger.error(f"Failed to extract document: {e}")
        raise HTTPException(status_code=400, detail=f"Failed to extract text from document: {str(e)}")
