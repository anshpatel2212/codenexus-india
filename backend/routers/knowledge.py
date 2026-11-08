import json
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

from backend.auth.jwt_guard import get_current_user, require_role, AuthenticatedUser
from backend.services.supabase_admin import supabase_admin
from backend.services.db import get_db_connection

router = APIRouter(prefix="/knowledge-base", tags=["Knowledge Base"])

class CreateKnowledgeRequest(BaseModel):
    type: str = Field(..., description="'guideline' | 'fact' | 'terminology' | 'banned' | 'phrase' | 'disclaimer' | 'asset'")
    title: str = Field(..., min_length=2)
    content: str = Field(..., min_length=2)
    category: Optional[str] = "General"
    tags: Optional[List[str]] = []
    replacement: Optional[str] = None
    fileFormat: Optional[str] = None
    fileSize: Optional[str] = None
    fileUrl: Optional[str] = None

@router.get("")
async def list_knowledge(
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """Retrieve organization-isolated brand knowledge items from SQLite."""
    return await supabase_admin.get_brand_knowledge(current_user.organization_id)

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_knowledge_rule(
    req: CreateKnowledgeRequest,
    current_user: AuthenticatedUser = Depends(require_role(["Admin", "Manager", "Super Admin"]))
):
    """
    Creates an approved brand governance rule or fact in persistent SQLite.
    Strictly isolated to current_user.organization_id.
    """
    org_id = current_user.organization_id or "org-demo-brandsense"
    now_iso = datetime.utcnow().isoformat() + "Z"
    item_id = f"kb-{uuid.uuid4().hex[:8]}"

    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            INSERT INTO knowledge_items (
                id, organization_id, type, title, content, category,
                tags, status, replacement, file_format, file_size, file_url,
                created_by, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'Active', ?, ?, ?, ?, ?, ?, ?)
        """, (
            item_id,
            org_id,
            req.type,
            req.title.strip(),
            req.content.strip(),
            req.category or "General",
            json.dumps(req.tags or []),
            req.replacement,
            req.fileFormat,
            req.fileSize,
            req.fileUrl,
            current_user.id,
            now_iso,
            now_iso
        ))
        conn.commit()
    except Exception as db_err:
        conn.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error while creating knowledge rule: {str(db_err)}"
        )
    finally:
        conn.close()

    return {
        "id": item_id,
        "organizationId": org_id,
        "type": req.type,
        "title": req.title.strip(),
        "content": req.content.strip(),
        "category": req.category or "General",
        "tags": req.tags or [],
        "status": "Active",
        "replacement": req.replacement,
        "fileFormat": req.fileFormat,
        "fileSize": req.fileSize,
        "fileUrl": req.fileUrl,
        "createdBy": current_user.id,
        "lastUpdated": now_iso,
        "updatedBy": current_user.full_name
    }

@router.delete("/{item_id}")
async def delete_knowledge_rule(
    item_id: str,
    current_user: AuthenticatedUser = Depends(require_role(["Admin", "Manager", "Super Admin"]))
):
    """Deletes brand knowledge rule from persistent SQLite with org boundary enforcement."""
    org_id = current_user.organization_id or "org-demo-brandsense"
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        if current_user.role == "Super Admin":
            cur.execute("DELETE FROM knowledge_items WHERE id = ?", (item_id,))
        else:
            cur.execute("DELETE FROM knowledge_items WHERE id = ? AND organization_id = ?", (item_id, org_id))
        
        if cur.rowcount == 0:
            conn.close()
            raise HTTPException(status_code=404, detail="Knowledge item not found in your organization.")
        conn.commit()
    except HTTPException:
        raise
    except Exception as db_err:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete knowledge item: {str(db_err)}")
    finally:
        conn.close()

    return {"success": True, "deletedId": item_id}

