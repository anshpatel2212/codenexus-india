try:
    import pytest
except ImportError:
    class MockPytest:
        class mark:
            @staticmethod
            def asyncio(f):
                return f
    pytest = MockPytest()

import asyncio
from backend.services.ai_review_engine import ai_review_engine
from backend.services.sensa_rag import sensa_rag_service

@pytest.mark.asyncio
async def test_ai_review_engine_flags_absolute_guarantee():
    test_content = "Our product guarantees a 100% elimination of compliance fines within 30 days."
    score, cat_scores, findings, suggested_content = await ai_review_engine.analyze_content(
        content=test_content,
        content_type="Social Media",
        brand_profile_name="Corporate Core",
        org_id="org-1"
    )
    
    assert any(f["category"] == "Promotional Claims" for f in findings)
    promotional_finding = next(f for f in findings if f["category"] == "Promotional Claims")
    assert promotional_finding["severity"] == "Critical"
    assert "reduce regulatory risk" in promotional_finding["suggestedFix"]
    assert "guarantees a 100%" not in suggested_content

@pytest.mark.asyncio
async def test_ai_review_engine_flags_banned_buzzwords():
    test_content = "Connect with our disruptive miracle platform for instant results."
    score, cat_scores, findings, suggested_content = await ai_review_engine.analyze_content(
        content=test_content,
        content_type="Press Release",
        brand_profile_name="Corporate Core",
        org_id="org-1"
    )
    
    assert any(f["category"] == "Terminology" for f in findings)
    term_finding = next(f for f in findings if f["category"] == "Terminology")
    assert "enterprise content governance platform" in term_finding["suggestedFix"]

@pytest.mark.asyncio
async def test_sensa_grounded_citations():
    query = "Can we say our platform guarantees zero compliance errors?"
    result = await sensa_rag_service.chat(prompt=query, org_id="org-1", user_id="usr-1")
    
    assert result["requiresHumanReview"] is True
    assert len(result["citations"]) > 0
    assert result["citations"][0]["confidence"] >= 90
    assert result["suggestedFix"] is not None

def run_coro(coro):
    stack = [coro]
    val = None
    while stack:
        try:
            res = stack[-1].send(val)
            if hasattr(res, 'send'):
                stack.append(res)
                val = None
            else:
                val = res
        except StopIteration as e:
            stack.pop()
            val = e.value
    return val

if __name__ == "__main__":
    print("Running Backend AI Engine Test Suite...")
    run_coro(test_ai_review_engine_flags_absolute_guarantee())
    print("[PASS] test_ai_review_engine_flags_absolute_guarantee")
    run_coro(test_ai_review_engine_flags_banned_buzzwords())
    print("[PASS] test_ai_review_engine_flags_banned_buzzwords")
    run_coro(test_sensa_grounded_citations())
    print("[PASS] test_sensa_grounded_citations")
    print("Summary: 3 passed, 0 failed, 0 skipped\n")

    from backend.test_jwt_verification import run_tests as run_jwt_tests
    jwt_success = run_jwt_tests()
    if not jwt_success:
        import sys
        sys.exit(1)

