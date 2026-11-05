from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

from backend.auth.jwt_guard import get_current_user, require_role, AuthenticatedUser
from backend.services.supabase_admin import supabase_admin

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

@router.get("")
async def list_knowledge(
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """Retrieve organization-isolated brand knowledge items."""
    return await supabase_admin.get_brand_knowledge(current_user.organization_id)

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_knowledge_rule(
    req: CreateKnowledgeRequest,
    current_user: AuthenticatedUser = Depends(require_role(["Admin", "Manager"]))
):
    """
    Creates an approved brand governance rule or fact.
    Strictly restricted to Admin and Manager roles.
    """
    if supabase_admin.is_live():
        try:
            res = supabase_admin.client.table("knowledge_items").insert({
                "organization_id": current_user.organization_id,
                "type": req.type,
                "title": req.title,
                "content": req.content,
                "category": req.category or "General",
                "tags": req.tags or [],
                "status": "Active",
                "replacement": req.replacement,
                "file_format": req.fileFormat,
                "file_size": req.fileSize,
                "created_by": current_user.id
            }).execute()
            if res.data:
                return res.data[0]
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to create rule: {e}")

    return {
        "id": f"kb-{int(datetime.utcnow().timestamp()*1000)}",
        "type": req.type,
        "title": req.title,
        "content": req.content,
        "category": req.category,
        "tags": req.tags,
        "status": "Active",
        "lastUpdated": "Just now",
        "updatedBy": current_user.full_name
    }

@router.delete("/{item_id}")
async def delete_knowledge_rule(
    item_id: str,
    current_user: AuthenticatedUser = Depends(require_role(["Admin", "Manager"]))
):
    """Deletes brand knowledge rule. Restricted to Admin and Manager."""
    if supabase_admin.is_live():
        try:
            supabase_admin.client.table("knowledge_items").delete().eq("id", item_id).eq("organization_id", current_user.organization_id).execute()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to delete: {e}")
    return {"success": True, "deletedId": item_id}

