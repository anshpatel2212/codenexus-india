from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

from backend.auth.jwt_guard import get_current_user, AuthenticatedUser
from backend.services.sensa_rag import sensa_rag_service

router = APIRouter(prefix="/sensa", tags=["SENSA Assistant"])

class SensaChatRequest(BaseModel):
    prompt: str = Field(..., min_length=1)
    context: Optional[Dict[str, Any]] = None

@router.post("/chat")
async def chat_with_sensa(
    req: SensaChatRequest,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """
    SENSA RAG Assistant: answers queries and verifies claims
    using active brand knowledge rules with authentic citations.
    """
    return await sensa_rag_service.chat(
        prompt=req.prompt,
        org_id=current_user.organization_id,
        user_id=current_user.id
    )

