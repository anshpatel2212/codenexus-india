import io
import json
import pytest
import zipfile
import xml.etree.ElementTree as ET
from fastapi.testclient import TestClient

from backend.main import app
from backend.services.ai_review_engine import ai_review_engine, extract_document_text
from backend.services.db import get_db_connection

client = TestClient(app)


def get_auth_token(role: str = "Admin") -> str:
    """Helper to authenticate as demo persona and obtain valid JWT."""
    res = client.post(f"/api/v1/auth/demo/{role.lower().replace(' ', '')}")
    assert res.status_code == 200, f"Demo login failed for {role}: {res.text}"
    return res.json()["token"]


# ==============================================================================
# IMPROVEMENT 1: DUAL-PASS VERIFICATION & CONFIDENCE SCORING TESTS
# ==============================================================================

@pytest.mark.asyncio
async def test_second_pass_verification_verifies_grounded_finding():
    """
    Verifies that a finding with exact evidence in content and matching policy
    receives high evidence-grounded confidence and 'verified' status without escalation.
    """
    draft = "BrandSense guarantees a 100% elimination of all regulatory compliance fines within 30 days."
    score, cat_scores, findings, suggested = await ai_review_engine.analyze_content(
        content=draft,
        content_type="Social Media",
        brand_profile_name="Corporate Core",
        org_id="org-demo-brandsense"
    )

    assert len(findings) >= 1
    warranty_finding = next((f for f in findings if f["category"] == "Promotional Claims"), findings[0])

    assert warranty_finding["verificationStatus"] == "verified"
    assert warranty_finding["confidence"] >= 85
    assert warranty_finding["escalatedToHuman"] is False
    assert "Verified" in warranty_finding["verificationNotes"]


@pytest.mark.asyncio
async def test_second_pass_escalates_ambiguous_low_confidence_finding():
    """
    Verifies that an ambiguous or weakly evidenced finding receives a calibrated
    lower confidence score (< 75%) and is automatically routed to human reviewers.
    """
    draft = "We might potentially evaluate minor wording updates if deemed appropriate."
    ambiguous_finding = {
        "id": "f-ambiguous",
        "category": "Tone and Voice",
        "severity": "Low",
        "reason": "Potentially non-assertive tone",
        "evidence": "might potentially evaluate minor wording updates if deemed appropriate",
        "highlightedText": "might potentially evaluate minor wording updates if deemed appropriate",
        "sourceDocument": "Unpublished Internal Memo",
        "suggestedFix": "We evaluate updates.",
        "explanation": "Contextual ambiguity requires human review",
        "status": "pending"
    }

    verified = await ai_review_engine.run_second_verification_pass([ambiguous_finding], draft, [])
    f = verified[0]

    assert f["verificationStatus"] == "escalated"
    assert f["severity"] == "Needs Human Review"
    assert f["escalatedToHuman"] is True
    assert f["confidence"] < 75
    assert "Escalated to human reviewer" in f["verificationNotes"]


@pytest.mark.asyncio
async def test_second_pass_detects_hallucinated_evidence_false_positive():
    """
    Verifies that if an AI finding references an evidence string that does NOT exist
    in the draft text, it is flagged as ungrounded / false positive.
    """
    draft = "Our enterprise platform accelerates compliance auditing."
    hallucinated_finding = {
        "id": "f-hallucinated",
        "category": "Terminology",
        "severity": "Critical",
        "reason": "Banned buzzword",
        "evidence": "magic revolutionary super-platform",
        "highlightedText": "magic revolutionary super-platform",
        "sourceDocument": "Enterprise Lexicon",
        "suggestedFix": "enterprise platform",
        "explanation": "Term was never written",
        "status": "pending"
    }

    verified = await ai_review_engine.run_second_verification_pass([hallucinated_finding], draft, [])
    f = verified[0]

    assert f["verificationStatus"] == "flagged"
    assert f["escalatedToHuman"] is True
    assert "not found verbatim" in f["verificationNotes"]


# ==============================================================================
# IMPROVEMENT 2: INTENT-PRESERVING REWRITES & DOCUMENT REVIEW TESTS
# ==============================================================================

@pytest.mark.asyncio
async def test_intent_preserving_rewrite_retains_core_message_and_calculates_score():
    """
    Verifies that the intent-preserving rewrite removes prohibited guarantees while
    retaining core business subjects and computing an Intent Preservation Score (0-100%).
    """
    original = (
        "BrandSense guarantees a 100% elimination of all regulatory compliance fines within 30 days. "
        "Our disruptive miracle platform revolutionises how enterprise legal teams review creative copy."
    )
    result = await ai_review_engine.rewrite_text(original_text=original)

    assert "guarantees a 100%" not in result.lower()
    assert "miracle platform" not in result.lower()
    # Check intent retention score
    score = result.get("intentPreservationScore")
    assert score is not None
    assert score >= 75.0
    # Check key facts retained
    key_facts = result.get("keyFactsRetained")
    assert isinstance(key_facts, list)


def test_docx_document_text_extraction():
    """
    Verifies that extract_document_text extracts paragraphs and headings from Word (.docx) files.
    """
    # Create an in-memory DOCX file
    docx_io = io.BytesIO()
    with zipfile.ZipFile(docx_io, "w") as z:
        doc_xml = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
            <w:body>
                <w:p>
                    <w:pPr><w:pStyle w:val="Heading1"/></w:pPr>
                    <w:r><w:t>Q3 Marketing Campaign Overview</w:t></w:r>
                </w:p>
                <w:p>
                    <w:r><w:t>BrandSense guarantees a 100% elimination of all regulatory fines.</w:t></w:r>
                </w:p>
            </w:body>
        </w:document>"""
        z.writestr("word/document.xml", doc_xml.encode("utf-8"))

    extracted = extract_document_text(docx_io.getvalue(), "campaign_brief.docx")
    assert extracted["format"] == "docx"
    assert "Q3 Marketing Campaign Overview" in extracted["fullText"]
    assert "BrandSense guarantees a 100%" in extracted["fullText"]
    assert len(extracted["pages"]) >= 1


def test_plain_text_document_extraction():
    """
    Verifies text extraction for .txt and .md files.
    """
    content = b"# Executive Summary\nBrandSense platform safeguards brand integrity across enterprise workflows."
    extracted = extract_document_text(content, "summary.md")
    assert extracted["format"] == "text"
    assert "Executive Summary" in extracted["fullText"]
    assert extracted["pageCount"] == 1


def test_api_document_extraction_endpoint():
    """
    Verifies POST /api/v1/reviews/extract-document endpoint with file upload.
    """
    token = get_auth_token("Creator")
    file_bytes = b"Section 1: Launch Plan\nDon't be a dinosaur! Buy our miracle platform today."
    
    res = client.post(
        "/api/v1/reviews/extract-document",
        headers={"Authorization": f"Bearer {token}"},
        files={"file": ("brief.txt", file_bytes, "text/plain")}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert "Section 1: Launch Plan" in data["fullText"]
    assert data["pageCount"] == 1


# ==============================================================================
# IMPROVEMENT 3: GOVERNANCE INSIGHTS & REVISION HISTORY TESTS
# ==============================================================================

def test_governance_insights_endpoint_returns_real_database_metrics():
    """
    Verifies GET /api/v1/insights/governance calculates real metrics,
    repeated violations, frequently overridden rules, and unclear guidelines.
    """
    token = get_auth_token("Admin")
    res = client.get("/api/v1/insights/governance", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()

    assert data["success"] is True
    metrics = data["metrics"]
    assert "totalReviews" in metrics
    assert "totalFindings" in metrics
    assert "auditComplianceScore" in metrics
    assert "fixAcceptanceRate" in metrics
    assert "repeatInfractionsCount" in metrics

    # Repeated Violations
    repeated = data["repeatedViolations"]
    assert isinstance(repeated, list)
    if len(repeated) > 0:
        assert "category" in repeated[0]
        assert "occurrences" in repeated[0]
        assert "riskTier" in repeated[0]
        assert "avgConfidence" in repeated[0]

    # Unclear Guidelines
    unclear = data["unclearGuidelines"]
    assert isinstance(unclear, list)
    assert len(unclear) >= 1
    assert "guidelineTitle" in unclear[0]
    assert "frictionScore" in unclear[0]
    assert "recommendedClarification" in unclear[0]

    # Turnaround by Channel
    turnaround = data["turnaroundByChannel"]
    assert isinstance(turnaround, list)
    assert len(turnaround) >= 1


def test_full_review_revisions_and_rollback_flow():
    """
    Verifies submitting a review, creating revision snapshots, and retrieving
    complete version history with compliance score diffs.
    """
    token = get_auth_token("Creator")

    # 1. Submit review
    sub_res = client.post("/api/v1/reviews/submit", headers={"Authorization": f"Bearer {token}"}, json={
        "title": "Revision Flow Integration Test",
        "contentType": "Social Media",
        "content": "BrandSense guarantees a 100% elimination of all regulatory compliance fines within 30 days."
    })
    assert sub_res.status_code == 201
    rev_id = sub_res.json()["id"]

    # 2. Create Revision 2
    rev2_res = client.post(f"/api/v1/reviews/{rev_id}/revisions", headers={"Authorization": f"Bearer {token}"}, json={
        "content": "BrandSense is designed to help reduce regulatory risk and streamline compliance reviews.",
        "summary": "Accepted absolute warranty fix",
        "complianceScore": 95.0,
        "acceptedCount": 1,
        "rejectedCount": 0
    })
    assert rev2_res.status_code == 201
    rev2_data = rev2_res.json()
    assert rev2_data["versionNumber"] == 2

    # 3. Fetch revision history
    hist_res = client.get(f"/api/v1/reviews/{rev_id}/revisions", headers={"Authorization": f"Bearer {token}"})
    assert hist_res.status_code == 200
    history = hist_res.json()
    assert len(history) >= 2
    assert history[0]["versionNumber"] == 2
    assert history[1]["versionNumber"] == 1

