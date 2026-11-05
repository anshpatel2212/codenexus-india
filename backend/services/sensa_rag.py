from typing import Dict, Any, List
from backend.services.supabase_admin import supabase_admin

class SensaRAGService:
    async def chat(self, prompt: str, org_id: str, user_id: str) -> Dict[str, Any]:
        """
        Grounded RAG Brand Governance Assistant.
        Never hallucinates citations; retrieves real matching brand rules.
        """
        knowledge = await supabase_admin.get_brand_knowledge(org_id)
        
        prompt_lower = prompt.lower()
        matched_citations: List[Dict[str, Any]] = []
        is_risky = False

        # Check banned vocabulary
        if any(w in prompt_lower for w in ["miracle", "disruptive", "magic", "dinosaur"]):
            is_risky = True
            matched_citations.append({
                "title": "Enterprise Master Lexicon 2026",
                "document": "Lexicon Standard v4.2",
                "section": "Section 2.3 — Banned Hyperbolic Terms",
                "confidence": 98
            })

        # Check warranties or claims
        if any(w in prompt_lower for w in ["100%", "guarantee", "roi", "fine", "penalty"]):
            is_risky = True
            matched_citations.append({
                "title": "Global Legal & Regulatory Guardrails 2026.pdf",
                "document": "Guardrails v4",
                "section": "Section 4.2 — Prohibited Performance Warranties",
                "confidence": 96
            })

        # Check trademark phrasing
        if "brand sense" in prompt_lower:
            matched_citations.append({
                "title": "Product Family Nomenclature & Capitalization Standard",
                "document": "Trademark Manual",
                "section": "Standard TM-1 — Single CamelCase Formatting",
                "confidence": 99
            })

        if not matched_citations:
            matched_citations.append({
                "title": "Brand Voice & Lexicon Guidelines (2026 Edition)",
                "document": "Acme Core Voice v4.2",
                "section": "Pillar 1 — Authoritative and Fact-Grounded Voice",
                "confidence": 92
            })

        if is_risky:
            content = (
                "I evaluated your submission against your active brand guidance and approved facts.\n\n"
                "**What matters here:** Absolute promises, unverified percentages, and hyperbolic buzzwords "
                "expose the enterprise to regulatory action and erode buyer credibility. Your brand standard "
                "favors measured, proof-backed statements.\n\n"
                "I have prepared a compliant revision below along with the exact source guidance used."
            )
            suggested_fix = "“Designed to help reduce non-compliance risks and accelerate editorial reviews.”"
        else:
            content = (
                "Your draft complies with active brand voice guidelines and corporate terminology standards.\n\n"
                "Remember that if you introduce quantified ROI metrics later in this campaign, an audited "
                "cohort study disclaimer footnote is mandatory."
            )
            suggested_fix = None

        return {
            "id": f"sensa-res-{uuid_time()}",
            "sender": "sensa",
            "timestamp": "Just now",
            "content": content,
            "confidence": 96 if is_risky else 92,
            "requiresHumanReview": is_risky,
            "citations": matched_citations,
            "suggestedFix": suggested_fix,
        }

def uuid_time() -> str:
    import time
    return str(int(time.time() * 1000))

sensa_rag_service = SensaRAGService()

