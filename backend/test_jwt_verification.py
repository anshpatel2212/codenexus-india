"""
BrandSense Test Suite: Supabase JWT Verification (ECC P-256 / ES256 & Legacy HS256)
===================================================================================
Tests all cryptographic and security guardrails for:
1. ECC P-256 (ES256) JWKS verification.
2. Signature integrity, expiration, audience ('authenticated'), and issuer matching.
3. Unknown kid rejection and JWKS caching/rotation.
4. Legacy HS256 backward compatibility with strict algorithm separation.
5. Rejection of unapproved algorithms ('none', 'RS256', etc.).
"""

import time
import base64
import jwt
from cryptography.hazmat.primitives.asymmetric import ec
from fastapi import HTTPException
from backend.config import settings
from backend.auth.jwt_guard import verify_supabase_jwt, set_jwks_client
from jwt import PyJWKClient

def int_to_b64(val: int) -> str:
    """Helper to convert big-endian integer coordinates to base64url string."""
    return base64.urlsafe_b64encode(val.to_bytes(32, "big")).rstrip(b"=").decode("utf-8")

def create_ecc_keypair(kid: str = "ecc-key-primary"):
    """Generates an ECC SECP256R1 (P-256) keypair and matching JWK definition."""
    private_key = ec.generate_private_key(ec.SECP256R1())
    public_numbers = private_key.public_key().public_numbers()
    jwk = {
        "kty": "EC",
        "crv": "P-256",
        "x": int_to_b64(public_numbers.x),
        "y": int_to_b64(public_numbers.y),
        "kid": kid,
        "alg": "ES256",
        "use": "sig"
    }
    return private_key, jwk

def run_tests():
    print("=" * 70)
    print("Running Supabase JWT Verification Test Suite (ECC P-256 / ES256)")
    print("=" * 70)

    test_issuer = "https://mock-proj.supabase.co/auth/v1"
    settings.SUPABASE_ISSUER = test_issuer
    settings.SUPABASE_LEGACY_HS256_SECRET = "legacy-enterprise-jwt-secret-at-least-32-chars-long"

    primary_priv, primary_jwk = create_ecc_keypair("primary-p256-kid")
    secondary_priv, secondary_jwk = create_ecc_keypair("secondary-p256-kid")

    # In-memory mock JWKS client
    mock_jwks = {"keys": [primary_jwk]}
    mock_client = PyJWKClient("https://mock-proj.supabase.co/auth/v1/.well-known/jwks.json")
    mock_client.fetch_data = lambda: mock_jwks
    set_jwks_client(mock_client)

    passed = 0
    failed = 0

    # -------------------------------------------------------------------------
    # Test 1: Valid ES256 Token
    # -------------------------------------------------------------------------
    try:
        token = jwt.encode(
            {
                "sub": "usr-uuid-001",
                "email": "sarah.chen@acmebrand.com",
                "aud": "authenticated",
                "iss": test_issuer,
                "exp": int(time.time()) + 3600
            },
            primary_priv,
            algorithm="ES256",
            headers={"kid": "primary-p256-kid"}
        )
        payload = verify_supabase_jwt(token)
        assert payload["sub"] == "usr-uuid-001"
        assert payload["aud"] == "authenticated"
        assert payload["iss"] == test_issuer
        print("[PASS] 1. Valid ES256 Token verified with matching JWKS ECC P-256 key")
        passed += 1
    except Exception as e:
        print(f"[FAIL] 1. Valid ES256 Token: {e}")
        failed += 1

    # -------------------------------------------------------------------------
    # Test 2: Invalid ES256 Signature (Tampered Key)
    # -------------------------------------------------------------------------
    try:
        # Token claims to use primary-p256-kid, but signed with secondary key
        forged_token = jwt.encode(
            {
                "sub": "usr-uuid-attacker",
                "aud": "authenticated",
                "iss": test_issuer,
                "exp": int(time.time()) + 3600
            },
            secondary_priv,
            algorithm="ES256",
            headers={"kid": "primary-p256-kid"}
        )
        try:
            verify_supabase_jwt(forged_token)
            print("[FAIL] 2. Invalid signature accepted")
            failed += 1
        except HTTPException as he:
            assert he.status_code == 401
            assert "Invalid token signature" in he.detail
            print("[PASS] 2. Invalid ES256 signature correctly rejected with 401")
            passed += 1
    except Exception as e:
        print(f"[FAIL] 2. Invalid ES256 Signature check: {e}")
        failed += 1

    # -------------------------------------------------------------------------
    # Test 3: Expired ES256 Token
    # -------------------------------------------------------------------------
    try:
        expired_token = jwt.encode(
            {
                "sub": "usr-uuid-expired",
                "aud": "authenticated",
                "iss": test_issuer,
                "exp": int(time.time()) - 300  # Expired 5 minutes ago
            },
            primary_priv,
            algorithm="ES256",
            headers={"kid": "primary-p256-kid"}
        )
        try:
            verify_supabase_jwt(expired_token)
            print("[FAIL] 3. Expired token accepted")
            failed += 1
        except HTTPException as he:
            assert he.status_code == 401
            assert "expired" in he.detail.lower()
            print("[PASS] 3. Expired ES256 token rejected with 401")
            passed += 1
    except Exception as e:
        print(f"[FAIL] 3. Expired ES256 Token check: {e}")
        failed += 1

    # -------------------------------------------------------------------------
    # Test 4: Wrong Audience
    # -------------------------------------------------------------------------
    try:
        wrong_aud_token = jwt.encode(
            {
                "sub": "usr-uuid-anon",
                "aud": "anon",  # Wrong audience (must be 'authenticated')
                "iss": test_issuer,
                "exp": int(time.time()) + 3600
            },
            primary_priv,
            algorithm="ES256",
            headers={"kid": "primary-p256-kid"}
        )
        try:
            verify_supabase_jwt(wrong_aud_token)
            print("[FAIL] 4. Wrong audience accepted")
            failed += 1
        except HTTPException as he:
            assert he.status_code == 401
            assert "audience" in he.detail.lower()
            print("[PASS] 4. Wrong audience ('anon') rejected; 'authenticated' strictly enforced")
            passed += 1
    except Exception as e:
        print(f"[FAIL] 4. Wrong Audience check: {e}")
        failed += 1

    # -------------------------------------------------------------------------
    # Test 5: Wrong Issuer
    # -------------------------------------------------------------------------
    try:
        wrong_iss_token = jwt.encode(
            {
                "sub": "usr-uuid-001",
                "aud": "authenticated",
                "iss": "https://malicious-external-auth.com/auth/v1",
                "exp": int(time.time()) + 3600
            },
            primary_priv,
            algorithm="ES256",
            headers={"kid": "primary-p256-kid"}
        )
        try:
            verify_supabase_jwt(wrong_iss_token)
            print("[FAIL] 5. Wrong issuer accepted")
            failed += 1
        except HTTPException as he:
            assert he.status_code == 401
            assert "issuer" in he.detail.lower()
            print("[PASS] 5. Forged issuer rejected; matched against Supabase auth endpoint")
            passed += 1
    except Exception as e:
        print(f"[FAIL] 5. Wrong Issuer check: {e}")
        failed += 1

    # -------------------------------------------------------------------------
    # Test 6: Unknown Signing Key (kid not in JWKS)
    # -------------------------------------------------------------------------
    try:
        unknown_kid_token = jwt.encode(
            {
                "sub": "usr-uuid-001",
                "aud": "authenticated",
                "iss": test_issuer,
                "exp": int(time.time()) + 3600
            },
            secondary_priv,
            algorithm="ES256",
            headers={"kid": "unadvertised-kid-999"}
        )
        try:
            verify_supabase_jwt(unknown_kid_token)
            print("[FAIL] 6. Unknown signing key accepted")
            failed += 1
        except HTTPException as he:
            assert he.status_code == 401
            assert "Signing key not found" in he.detail or "unrecognized" in he.detail
            print("[PASS] 6. Unknown kid rejected with 401")
            passed += 1
    except Exception as e:
        print(f"[FAIL] 6. Unknown Signing Key check: {e}")
        failed += 1

    # -------------------------------------------------------------------------
    # Test 7: Missing kid Header on ES256
    # -------------------------------------------------------------------------
    try:
        missing_kid_token = jwt.encode(
            {
                "sub": "usr-uuid-001",
                "aud": "authenticated",
                "iss": test_issuer,
                "exp": int(time.time()) + 3600
            },
            primary_priv,
            algorithm="ES256"
        )
        try:
            verify_supabase_jwt(missing_kid_token)
            print("[FAIL] 7. Missing kid header accepted")
            failed += 1
        except HTTPException as he:
            assert he.status_code == 401
            assert "missing required key ID" in he.detail
            print("[PASS] 7. ES256 token without kid header rejected with 401")
            passed += 1
    except Exception as e:
        print(f"[FAIL] 7. Missing kid Header check: {e}")
        failed += 1

    # -------------------------------------------------------------------------
    # Test 8: Legacy HS256 Backward Compatibility
    # -------------------------------------------------------------------------
    try:
        legacy_token = jwt.encode(
            {
                "sub": "legacy-user-42",
                "aud": "authenticated",
                "iss": test_issuer,
                "exp": int(time.time()) + 3600
            },
            settings.SUPABASE_LEGACY_HS256_SECRET,
            algorithm="HS256"
        )
        payload = verify_supabase_jwt(legacy_token)
        assert payload["sub"] == "legacy-user-42"
        assert payload["aud"] == "authenticated"

        # Tampered HS256 token
        tampered_hs256 = jwt.encode(
            {
                "sub": "legacy-user-42",
                "aud": "authenticated",
                "iss": test_issuer,
                "exp": int(time.time()) + 3600
            },
            "wrong-secret-which-should-fail-immediately-32-chars",
            algorithm="HS256"
        )
        try:
            verify_supabase_jwt(tampered_hs256)
            print("[FAIL] 8. Tampered HS256 accepted")
            failed += 1
        except HTTPException as he:
            assert he.status_code == 401
            print("[PASS] 8. Legacy HS256 compatibility verified (valid token passes, tampered rejected)")
            passed += 1
    except Exception as e:
        print(f"[FAIL] 8. Legacy HS256 Compatibility check: {e}")
        failed += 1

    # -------------------------------------------------------------------------
    # Test 9: Strict Algorithm Isolation & Disallowed Algorithms
    # -------------------------------------------------------------------------
    try:
        # None algorithm
        none_token = jwt.encode(
            {"sub": "attacker", "aud": "authenticated", "iss": test_issuer, "exp": int(time.time()) + 3600},
            key="",
            algorithm="none"
        )
        try:
            verify_supabase_jwt(none_token)
            print("[FAIL] 9. Unsecured 'none' algorithm accepted")
            failed += 1
        except HTTPException as he:
            assert he.status_code == 401
            assert "Unsecured or missing JWT algorithm" in he.detail

        # Unsupported RS256 algorithm
        # Create dummy RS256 token header/payload
        try:
            fake_rs256 = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMifQ.c2lnbmF0dXJl"
            verify_supabase_jwt(fake_rs256)
            print("[FAIL] 9. Unsupported algorithm accepted")
            failed += 1
        except HTTPException as he:
            assert he.status_code == 401
            assert "Unsupported token algorithm" in he.detail
            print("[PASS] 9. Strict algorithm isolation enforced ('none' and unapproved algorithms blocked)")
            passed += 1
    except Exception as e:
        print(f"[FAIL] 9. Strict Algorithm Isolation check: {e}")
        failed += 1

    # -------------------------------------------------------------------------
    # Test 10: Dynamic Key Rotation in JWKS
    # -------------------------------------------------------------------------
    try:
        # Rotate: add secondary_jwk to the JWKS keyset
        mock_jwks["keys"].append(secondary_jwk)

        # Clear cooldown timestamp to simulate key refresh after cooldown
        mock_client._last_successful_fetch = None
        if hasattr(mock_client, "jwk_set_cache") and mock_client.jwk_set_cache is not None:
            mock_client.jwk_set_cache.jwk_set_with_timestamp = None

        rotated_token = jwt.encode(
            {
                "sub": "usr-uuid-rotated-002",
                "aud": "authenticated",
                "iss": test_issuer,
                "exp": int(time.time()) + 3600
            },
            secondary_priv,
            algorithm="ES256",
            headers={"kid": "secondary-p256-kid"}
        )
        payload = verify_supabase_jwt(rotated_token)
        assert payload["sub"] == "usr-uuid-rotated-002"
        print("[PASS] 10. Key rotation handled seamlessly when JWKS publishes new ECC P-256 key")
        passed += 1
    except Exception as e:
        print(f"[FAIL] 10. Dynamic Key Rotation check: {e}")
        failed += 1

    print("=" * 70)
    print(f"Summary: {passed} passed, {failed} failed")
    print("=" * 70)
    return failed == 0

if __name__ == "__main__":
    import sys
    success = run_tests()
    sys.exit(0 if success else 1)
