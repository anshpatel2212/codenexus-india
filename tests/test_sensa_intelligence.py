import asyncio
import sys
from backend.services.sensa_rag import sensa_rag_service

QUESTIONS = [
    "How are you?",
    "What is BrandSense?",
    "Explain artificial intelligence in simple words.",
    "Check whether this sentence follows our brand voice.",
    "Find approved facts about our organization.",
    "Which words are prohibited by our brand guidelines?",
    "Rewrite this marketing sentence professionally.",
    "Explain the difference between brand voice and brand tone.",
    "Give me three marketing campaign ideas.",
    "Follow-up: Explain your second suggestion in more detail.",
]

BANNED_REPETITIVE_STRING = "Your query aligns well with BrandSense institutional brand governance principles"

async def main():
    print("==================================================================")
    print("🤖 TESTING SENSA INTELLIGENCE & CONVERSATION PIPELINE (10 CHECKS)")
    print("==================================================================\n")

    responses = []
    history = []

    for i, question in enumerate(QUESTIONS, 1):
        result = await sensa_rag_service.chat(
            prompt=question,
            org_id="org-1",
            user_id="usr-test",
            history=history
        )
        content = result.get("content", "")
        
        # 1. Verify response is non-empty
        assert len(content) > 20, f"Q{i} response too short: {content}"
        
        # 2. Verify NOT the generic repetitive canned string
        assert BANNED_REPETITIVE_STRING.lower() not in content.lower(), (
            f"Q{i} failed! Received the prohibited generic repetitive response!"
        )

        responses.append(content)
        history.append({"role": "user", "content": question})
        history.append({"role": "model", "content": content})

        print(f"--- Q{i}: \"{question}\" ---")
        preview = content.split('\n')[0][:120]
        print(f"SENSA: {preview}...\n")

    # 3. Verify responses are distinct from each other
    unique_responses = set(responses)
    assert len(unique_responses) == len(QUESTIONS), (
        f"Expected {len(QUESTIONS)} unique responses, got {len(unique_responses)}"
    )

    # 4. Verify Q1 (How are you) contains conversational greeting
    assert any(w in responses[0].lower() for w in ["well", "good", "doing", "hello", "great"]), (
        f"Q1 response is not a conversational greeting: {responses[0]}"
    )

    # 5. Verify Q2 (What is BrandSense) explains the platform
    assert "brandsense" in responses[1].lower() and any(w in responses[1].lower() for w in ["governance", "platform", "brand", "review"]), (
        f"Q2 response does not explain BrandSense: {responses[1]}"
    )

    # 6. Verify Q5 (Approved facts) mentions approved facts / metrics
    assert any(w in responses[4].lower() for w in ["soc-2", "99.99%", "fact", "metric", "verified"]), (
        f"Q5 response does not contain approved facts: {responses[4]}"
    )

    # 7. Verify Q6 (Prohibited words) mentions banned terms
    assert any(w in responses[5].lower() for w in ["miracle", "guarantee", "banned", "prohibited", "disruptive"]), (
        f"Q6 response does not contain prohibited words: {responses[5]}"
    )

    # 8. Verify Q8 (Voice vs Tone) explains both
    assert "voice" in responses[7].lower() and "tone" in responses[7].lower(), (
        f"Q8 response does not explain voice vs tone: {responses[7]}"
    )

    # 9. Verify Q10 (Follow-up) refers to second suggestion
    assert any(w in responses[9].lower() for w in ["audit-proof", "suggestion", "second", "campaign"]), (
        f"Q10 response does not detail the second suggestion: {responses[9]}"
    )

    print("==================================================================")
    print("✅ ALL 10 SENSA INTELLIGENCE & REASONING VERIFICATION CHECKS PASSED!")
    print("==================================================================")

if __name__ == "__main__":
    asyncio.run(main())

