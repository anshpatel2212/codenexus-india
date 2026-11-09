from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List

from backend.auth.jwt_guard import get_optional_user, AuthenticatedUser
from backend.services.sensa_rag import sensa_rag_service

router = APIRouter(prefix="/sensa", tags=["SENSA Assistant"])

class SensaChatRequest(BaseModel):
    prompt: str = Field(..., min_length=1)
    context: Optional[Dict[str, Any]] = None
    history: Optional[List[Dict[str, Any]]] = None

@router.post("/chat")
async def chat_with_sensa(
    req: SensaChatRequest,
    current_user: Optional[AuthenticatedUser] = Depends(get_optional_user)
):
    """
    SENSA RAG Assistant: answers queries and verifies claims
    using active brand knowledge rules with authentic citations and multi-turn context.
    Works for both authenticated members and guest users.
    """
    org_id = current_user.organization_id if current_user and current_user.organization_id else "org-demo-brandsense"
    user_id = current_user.id if current_user else "usr-guest"
    return await sensa_rag_service.chat(
        prompt=req.prompt,
        org_id=org_id,
        user_id=user_id,
        history=req.history
    )
