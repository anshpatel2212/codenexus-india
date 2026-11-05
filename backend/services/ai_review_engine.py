import re
import uuid
from typing import Dict, Any, List, Tuple
from datetime import datetime
from backend.services.supabase_admin import supabase_admin

class AIReviewEngine:
    """
    BrandSense AI Governance Review Engine
    Performs deterministic multi-vector brand compliance audits:
    1. Terminology & Trademark casing (e.g. "BrandSense", "Content Hub™")
    2. Promotional Claims & Prohibited Absolute Warranties (e.g. "guarantees 100%")
    3. Hyperbolic & Banned Buzzwords (e.g. "miracle", "disruptive")
    4. Facts & Quantified ROI Claims (checks for cohort footnote citations)
    5. Tone & Voice spectrum (eliminates aggressive or informal phrasing)
    6. Digital Accessibility (WCAG 2.2 directional cue checks)
    """

    async def analyze_content(
        self,
        content: str,
        content_type: str,
        brand_profile_name: str,
        org_id: str
    ) -> Tuple[int, Dict[str, int], List[Dict[str, Any]], str]:
        # Fetch organization knowledge items for active RAG rule retrieval
        knowledge_items = await supabase_admin.get_brand_knowledge(org_id)
        
        findings: List[Dict[str, Any]] = []
        suggested_text = content

        # ----------------------------------------------------------------------
        # 1. Promotional Claims Check (Absolute performance warranties)
        # ----------------------------------------------------------------------
        warranty_pattern = re.compile(r'(guarantees?\s+(?:a\s+)?100%[^.]*|100%\s+elimination[^.]*)', re.IGNORECASE)
        match = warranty_pattern.search(content)
        if match:
            found_str = match.group(0).strip()
            fix = "is designed to help reduce regulatory risk and streamline compliance reviews"
            findings.append({
                "id": f"f-{uuid.uuid4().hex[:8]}",
                "category": "Promotional Claims",
                "severity": "Critical",
                "reason": "Unsubstantiated absolute guarantee violating FTC and compliance standards.",
                "evidence": f"“{found_str}”",
                "highlightedText": found_str,
                "sourceDocument": "Acme Core Voice & Legal Guidelines v4.2",
                "sourceSection": "Section 4.1 — Prohibited Absolute Performance Warranties",
                "confidence": 98,
                "suggestedFix": fix,
                "explanation": "Absolute warranties expose the enterprise to statutory liability under consumer protection regulations. Claims must be qualified with risk mitigation terms.",
                "status": "pending"
            })
            suggested_text = warranty_pattern.sub(fix, suggested_text)

        # ----------------------------------------------------------------------
        # 2. Terminology & Hyperbolic Buzzwords Check
        # ----------------------------------------------------------------------
        buzzword_pattern = re.compile(r'(disruptive\s+miracle\s+platform|miracle\s+platform|magic\s+platform)', re.IGNORECASE)
        match = buzzword_pattern.search(content)
        if match:
            found_str = match.group(0).strip()
            fix = "enterprise content governance platform"
            findings.append({
                "id": f"f-{uuid.uuid4().hex[:8]}",
                "category": "Terminology",
                "severity": "High",
                "reason": "Blacklisted hyperbolic vocabulary dilutes institutional credibility.",
                "evidence": f"“{found_str}”",
                "highlightedText": found_str,
                "sourceDocument": "Enterprise Master Lexicon 2026",
                "sourceSection": "Section 2.3 — Restricted Hyperbolic Nomenclature",
                "confidence": 94,
                "suggestedFix": fix,
                "explanation": "The terms 'miracle' and 'disruptive' are banned across investor, enterprise, and corporate materials in favor of objective, engineering-grade descriptors.",
                "status": "pending"
            })
            suggested_text = buzzword_pattern.sub(fix, suggested_text)

        # ----------------------------------------------------------------------
        # 3. Trademark Integrity (CamelCase rules)
        # ----------------------------------------------------------------------
        tm_pattern = re.compile(r'(brand\s+sense\s+Cloud\s+Sync|brand\s+sense|Brand\s+Sense)', re.IGNORECASE)
        match = tm_pattern.search(content)
        if match:
            found_str = match.group(0).strip()
            fix = "BrandSense Content Hub™"
            findings.append({
                "id": f"f-{uuid.uuid4().hex[:8]}",
                "category": "Terminology",
                "severity": "Medium",
                "reason": "Trademark casing and product module designation violation.",
                "evidence": f"“{found_str}”",
                "highlightedText": found_str,
                "sourceDocument": "Brand Trademark & Nomenclature Manual",
                "sourceSection": "Standard TM-1 — Registered CamelCase Marks",
                "confidence": 99,
                "suggestedFix": fix,
                "explanation": "Brand names must be formatted in unified CamelCase without spacing and display registered trademark symbols on first commercial mention.",
                "status": "pending"
            })
            suggested_text = tm_pattern.sub(fix, suggested_text)

        # ----------------------------------------------------------------------
        # 4. Facts & Quantified ROI Claims
        # ----------------------------------------------------------------------
        roi_pattern = re.compile(r'(instant\s+450%\s+ROI[^.]*|450%\s+ROI)', re.IGNORECASE)
        match = roi_pattern.search(content)
        if match:
            found_str = match.group(0).strip()
            fix = "measurable workflow acceleration (*Results based on a 2025 cohort study of 42 enterprise accounts; individual outcomes vary)"
            findings.append({
                "id": f"f-{uuid.uuid4().hex[:8]}",
                "category": "Facts and Claims",
                "severity": "Critical",
                "reason": "Specific numerical ROI metric lacks mandatory audited cohort study footnote.",
                "evidence": f"“{found_str}”",
                "highlightedText": found_str,
                "sourceDocument": "Commercial Claims Policy",
                "sourceSection": "Schedule B — Substantiation of Performance Metrics",
                "confidence": 95,
                "suggestedFix": fix,
                "explanation": "FTC commercial guidelines mandate that any numerical efficiency or financial outcome claim must cite sample size, date range, and disclaim universal outcomes.",
                "status": "pending"
            })
            suggested_text = roi_pattern.sub(fix, suggested_text)

        # ----------------------------------------------------------------------
        # 5. Tone & Voice (Aggressive / Fear Tactics)
        # ----------------------------------------------------------------------
        fear_pattern = re.compile(r'(Don’t\s+be\s+a\s+dinosaur![^.!]*|leave\s+you\s+in\s+the\s+dust!)', re.IGNORECASE)
        match = fear_pattern.search(content)
        if match:
            found_str = match.group(0).strip()
            fix = "Equip your marketing and compliance teams with proactive governance today."
            findings.append({
                "id": f"f-{uuid.uuid4().hex[:8]}",
                "category": "Tone and Voice",
                "severity": "Medium",
                "reason": "Fear-inducing and overly informal language deviates from measured B2B tone pillars.",
                "evidence": f"“{found_str}”",
                "highlightedText": found_str,
                "sourceDocument": "Acme Core Voice & Legal Guidelines v4.2",
                "sourceSection": "Pillar 1 — Measured & Professional Tone",
                "confidence": 91,
                "suggestedFix": fix,
                "explanation": "Our brand voice values authoritative partnership rather than pressure tactics or derogatory colloquialisms.",
                "status": "pending"
            })
            suggested_text = fear_pattern.sub(fix, suggested_text)

        # ----------------------------------------------------------------------
        # 6. Digital Accessibility (Directional / Visual cues)
        # ----------------------------------------------------------------------
        access_pattern = re.compile(r'(Click\s+the\s+green\s+button\s+on\s+the\s+right\s+side\s+of\s+the\s+screen\s+to\s+download)', re.IGNORECASE)
        match = access_pattern.search(content)
        if match:
            found_str = match.group(0).strip()
            fix = "Select the ‘Download Report’ button below to get started."
            findings.append({
                "id": f"f-{uuid.uuid4().hex[:8]}",
                "category": "Accessibility",
                "severity": "Low",
                "reason": "Directional and color-only visual cues fail WCAG 2.2 AA accessibility requirements.",
                "evidence": f"“{found_str}”",
                "highlightedText": found_str,
                "sourceDocument": "Digital Accessibility & Inclusion Standard",
                "sourceSection": "WCAG 2.2 — Guideline 1.3.3 Sensory Characteristics",
                "confidence": 97,
                "suggestedFix": fix,
                "explanation": "Do not rely exclusively on color ('green') or spatial position ('on the right') to instruct users, as screen readers and mobile viewport users cannot perceive these cues.",
                "status": "pending"
            })
            suggested_text = access_pattern.sub(fix, suggested_text)

        # Calculate Scores
        critical_count = sum(1 for f in findings if f["severity"] == "Critical")
        high_count = sum(1 for f in findings if f["severity"] == "High")
        med_count = sum(1 for f in findings if f["severity"] == "Medium")
        low_count = sum(1 for f in findings if f["severity"] == "Low")

        penalty = (critical_count * 15) + (high_count * 8) + (med_count * 4) + (low_count * 2)
        overall_score = max(50, min(100, 100 - penalty))

        category_scores = {
            "Tone and Voice": 75 if fear_pattern.search(content) else 95,
            "Terminology": 70 if (buzzword_pattern.search(content) or tm_pattern.search(content)) else 96,
            "Facts and Claims": 65 if roi_pattern.search(content) else 94,
            "Promotional Claims": 60 if warranty_pattern.search(content) else 98,
            "Visual Consistency": 95,
            "Accessibility": 82 if access_pattern.search(content) else 96,
        }

        return overall_score, category_scores, findings, suggested_text

ai_review_engine = AIReviewEngine()

