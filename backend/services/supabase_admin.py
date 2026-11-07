import json
import logging
from typing import Optional, Dict, Any, List, Tuple
import httpx
from backend.config import settings
from backend.services.db import get_db_connection

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

<<<<<<< HEAD
    async def get_brand_knowledge(self, org_id: str) -> List[Dict[str, Any]]:
        """Retrieve brand knowledge items for RAG and guideline heuristic matching."""
=======
    async def get_brand_knowledge(self, org_id: Optional[str]) -> List[Dict[str, Any]]:
        """
        Retrieves organization-isolated brand knowledge items from persistent SQLite database.
        Includes rules, facts, approved nomenclature, banned buzzwords, and mandatory disclaimers.
        Provides safe demo fallback only for demo or empty initial workspaces.
        """
        target_org = org_id.strip() if org_id and isinstance(org_id, str) else "org-demo-brandsense"
        
        conn = get_db_connection()
        cur = conn.cursor()
        try:
            cur.execute("""
                SELECT * FROM knowledge_items 
                WHERE organization_id = ? AND status = 'Active'
                ORDER BY created_at DESC
            """, (target_org,))
            rows = cur.fetchall()

            # If tenant has no custom knowledge items yet, fall back to demo knowledge if applicable
            if not rows and target_org in ["org-demo-brandsense", "org-1", "default", ""]:
                cur.execute("""
                    SELECT * FROM knowledge_items 
                    WHERE organization_id = 'org-demo-brandsense' AND status = 'Active'
                    ORDER BY created_at DESC
                """)
                rows = cur.fetchall()

            items = []
            for r in rows:
                tag_list = []
                try:
                    tag_list = json.loads(r["tags"]) if r["tags"] else []
                except Exception:
                    tag_list = []

                items.append({
                    "id": r["id"],
                    "organizationId": r["organization_id"],
                    "type": r["type"],
                    "title": r["title"],
                    "content": r["content"],
                    "category": r["category"] or "General",
                    "tags": tag_list,
                    "status": r["status"] or "Active",
                    "replacement": r["replacement"],
                    "fileFormat": r["file_format"],
                    "fileSize": r["file_size"],
                    "fileUrl": r["file_url"],
                    "createdBy": r["created_by"],
                    "createdAt": r["created_at"],
                    "lastUpdated": r["updated_at"],
                })

            if items:
                return items
        except Exception as db_err:
            logger.error(f"Failed to query knowledge_items from SQLite: {db_err}")
            raise
        finally:
            conn.close()

        # Hardcoded foundational fallback only as absolute last resort
>>>>>>> 050db5a4b1a5a7ab1ae529b9ddc5eb2c1274d9d8
        return [
            {
                "id": "kb-1",
                "organizationId": target_org,
                "type": "guideline",
                "title": "Brand Voice & Lexicon Guidelines (2026 Edition)",
                "content": "Pillars: Authoritative, Measured, Fact-based. Prohibit absolute warranties without statistical qualifications.",
                "category": "Tone and Voice",
                "tags": ["Tone", "Governance"],
                "status": "Active",
                "lastUpdated": "2026-01-01T00:00:00Z"
            },
            {
                "id": "kb-2",
                "organizationId": target_org,
                "type": "banned",
                "title": "Disruptive / Miracle / Magic (Hyperbolic Buzzwords)",
                "content": "Banned buzzwords that dilute trust.",
                "replacement": "Streamlined / Enterprise-grade / Advanced Governance",
                "category": "Restricted Vocabulary",
                "tags": ["Banned", "Terminology"],
                "status": "Active",
                "lastUpdated": "2026-01-01T00:00:00Z"
            },
            {
                "id": "kb-3",
                "organizationId": target_org,
                "type": "disclaimer",
                "title": "Financial ROI Performance Disclaimer (*Study Citation)",
                "content": "*Results based on a 2025 audited cohort study of 42 enterprise accounts. Individual outcomes may vary.",
                "category": "Financial & Claims",
                "tags": ["Disclaimer", "Legal"],
                "status": "Active",
                "lastUpdated": "2026-01-01T00:00:00Z"
            },
            {
                "id": "kb-4",
                "organizationId": target_org,
                "type": "terminology",
                "title": "Product Family Nomenclature & Capitalization Standard",
                "content": "BrandSense is always single CamelCase. Child modules: BrandSense Content Hub™.",
                "category": "Trademarks & Naming",
                "tags": ["Trademark", "Terminology"],
                "status": "Active",
                "lastUpdated": "2026-01-01T00:00:00Z"
            }
        ]

supabase_admin = SupabaseAdminService()
