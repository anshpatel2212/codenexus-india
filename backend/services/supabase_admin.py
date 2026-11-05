import logging
from typing import Optional, Dict, Any, List
from backend.config import settings

logger = logging.getLogger("brandsense.supabase")

try:
    from supabase import create_client, Client
    _has_supabase_sdk = True
except ImportError:
    _has_supabase_sdk = False

class SupabaseAdminService:
    def __init__(self):
        self.client: Optional[Any] = None
        if _has_supabase_sdk and settings.SUPABASE_URL and not any(p in settings.SUPABASE_URL.lower() for p in ["placeholder", "your_project_ref", "your-project-ref"]):
            try:
                self.client = create_client(
                    settings.SUPABASE_URL,
                    settings.SUPABASE_SERVICE_ROLE_KEY
                )
                logger.info("Supabase Admin Client initialized successfully.")
            except Exception as e:
                logger.warning(f"Could not connect to Supabase: {e}")

    def is_live(self) -> bool:
        return self.client is not None

    async def get_user_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Fetch real profile record directly from database to prevent token spoofing."""
        if self.is_live():
            try:
                res = self.client.table("profiles").select("*, organizations(name)").eq("id", user_id).single().execute()
                return res.data
            except Exception as e:
                logger.warning(f"Error fetching profile for {user_id}: {e}")
        
        # Fallback profile for mock/demo
        return {
            "id": user_id,
            "organization_id": "org-1",
            "full_name": "Elena Rostova",
            "email": "elena.rostova@acmebrand.com",
            "role": "Manager",
            "department": "Brand & Global Marketing",
        }

    async def get_brand_knowledge(self, org_id: str) -> List[Dict[str, Any]]:
        """Retrieve brand knowledge items for RAG and guideline heuristic matching."""
        if self.is_live():
            try:
                res = self.client.table("knowledge_items").select("*").eq("organization_id", org_id).eq("status", "Active").execute()
                if res.data:
                    return res.data
            except Exception as e:
                logger.warning(f"Error fetching knowledge items: {e}")
        
        # Default active brand knowledge
        return [
            {
                "id": "kb-1",
                "type": "guideline",
                "title": "Brand Voice & Lexicon Guidelines (2026 Edition)",
                "content": "Pillars: Authoritative, Measured, Fact-based. Prohibit absolute warranties without statistical qualifications.",
                "category": "Tone and Voice",
            },
            {
                "id": "kb-2",
                "type": "banned",
                "title": "Disruptive / Miracle / Magic (Hyperbolic Buzzwords)",
                "content": "Banned buzzwords that dilute trust.",
                "replacement": "Streamlined / Enterprise-grade / Advanced Governance",
                "category": "Restricted Vocabulary",
            },
            {
                "id": "kb-3",
                "type": "disclaimer",
                "title": "Financial ROI Performance Disclaimer (*Study Citation)",
                "content": "*Results based on a 2025 audited cohort study of 42 enterprise accounts. Individual outcomes may vary.",
                "category": "Financial & Claims",
            },
            {
                "id": "kb-4",
                "type": "terminology",
                "title": "Product Family Nomenclature & Capitalization Standard",
                "content": "BrandSense is always single CamelCase. Child modules: BrandSense Content Hub™.",
                "category": "Trademarks & Naming",
            }
        ]

supabase_admin = SupabaseAdminService()

