import logging
from typing import Optional, Dict, Any, List, Tuple
import httpx
from backend.config import settings

logger = logging.getLogger("brandsense.supabase")

class SupabaseAdminService:
    def __init__(self):
        self.url = (settings.SUPABASE_URL or "").rstrip("/")
        self.service_role_key = settings.SUPABASE_SERVICE_ROLE_KEY or ""
        if self.is_live():
            logger.info("Supabase Admin Service configured with live credentials.")
        else:
            logger.warning("Supabase Admin Service running in offline/mock mode.")

    def is_live(self) -> bool:
        return bool(
            self.url
            and self.service_role_key
            and not any(p in self.url.lower() for p in ["placeholder", "your_project_ref", "your-project-ref"])
        )

    def _headers(self) -> Dict[str, str]:
        return {
            "apikey": self.service_role_key,
            "Authorization": f"Bearer {self.service_role_key}",
            "Content-Type": "application/json"
        }

    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Finds an existing Supabase Auth user by email address."""
        if not self.is_live():
            return None
        try:
            with httpx.Client(timeout=10.0) as client:
                res = client.get(
                    f"{self.url}/auth/v1/admin/users",
                    headers=self._headers()
                )
                if res.status_code == 200:
                    users = res.json().get("users", [])
                    target = email.strip().lower()
                    for u in users:
                        if (u.get("email") or "").strip().lower() == target:
                            return u
                else:
                    logger.warning(f"Supabase list users returned status {res.status_code}: {res.text}")
        except Exception as e:
            logger.warning(f"Error checking Supabase user by email {email}: {e}")
        return None

    def create_auth_user(
        self,
        email: str,
        password: str,
        full_name: str,
        role: str,
        organization_id: Optional[str] = None
    ) -> Tuple[Optional[str], Optional[str]]:
        """
        Creates an identity in Supabase Auth via the Admin REST API.
        Marks email as confirmed and stores role and metadata.
        Returns (supabase_uid, error_message).
        """
        if not self.is_live():
            # In offline or non-configured environments, gracefully return a synthetic id
            return f"sb-{email.replace('@', '-at-')}", None

        normalized_email = email.strip().lower()
        payload = {
            "email": normalized_email,
            "password": password,
            "email_confirm": True,
            "user_metadata": {
                "full_name": full_name.strip(),
                "role": role,
                "organization_id": organization_id or ""
            }
        }

        try:
            with httpx.Client(timeout=10.0) as client:
                res = client.post(
                    f"{self.url}/auth/v1/admin/users",
                    headers=self._headers(),
                    json=payload
                )

                if res.status_code in [200, 201]:
                    data = res.json()
                    sb_uid = data.get("id")
                    logger.info(f"Successfully created Supabase Auth user {normalized_email} with UID {sb_uid}")
                    return sb_uid, None

                # If user already exists in Supabase Auth (HTTP 422)
                if res.status_code == 422:
                    logger.info(f"User {normalized_email} already exists in Supabase Auth. Retrieving existing UUID.")
                    existing = self.get_user_by_email(normalized_email)
                    if existing and existing.get("id"):
                        return existing["id"], None

                err_text = res.text
                logger.error(f"Failed to create Supabase Auth user {normalized_email}: status {res.status_code} - {err_text}")
                return None, f"Supabase Auth error ({res.status_code}): {err_text}"
        except Exception as e:
            logger.error(f"Network error contacting Supabase Auth for {normalized_email}: {e}")
            return None, str(e)

    def delete_auth_user(self, supabase_uid: str) -> bool:
        """
        Rollback helper: Deletes an identity in Supabase Auth if a subsequent database transaction fails.
        """
        if not self.is_live() or not supabase_uid or supabase_uid.startswith("sb-"):
            return True
        try:
            with httpx.Client(timeout=10.0) as client:
                res = client.delete(
                    f"{self.url}/auth/v1/admin/users/{supabase_uid}",
                    headers=self._headers()
                )
                return res.status_code in [200, 204, 404]
        except Exception as e:
            logger.error(f"Error rolling back Supabase Auth user {supabase_uid}: {e}")
            return False

    async def get_user_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Fetch profile record for mock/demo compatibility."""
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
