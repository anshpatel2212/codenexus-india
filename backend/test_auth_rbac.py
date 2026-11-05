import pytest
from httpx import AsyncClient, ASGITransport
from backend.main import app
from backend.services.db import get_db_connection

@pytest.mark.asyncio
async def test_health():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

@pytest.mark.asyncio
async def test_demo_logins():
    roles = [
        ("super-admin", "Super Admin"),
        ("admin", "Admin"),
        ("creator", "Creator"),
        ("reviewer", "Reviewer"),
        ("manager", "Manager"),
    ]
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        for slug, expected_role in roles:
            resp = await ac.post(f"/api/v1/auth/demo/{slug}")
            assert resp.status_code == 200, f"Demo login failed for {slug}: {resp.text}"
            data = resp.json()
            assert data["success"] is True
            assert "token" in data
            assert data["user"]["role"] == expected_role

@pytest.mark.asyncio
async def test_signup_and_persistent_login():
    import uuid
    random_email = f"testuser_{uuid.uuid4().hex[:8]}@example.com"
    password = "SecurePassword123!"

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Signup
        signup_res = await ac.post("/api/v1/auth/signup", json={
            "name": "Integration Test User",
            "email": random_email,
            "password": password,
            "organisation": "Acme Test Corp",
            "role": "Admin"
        })
        assert signup_res.status_code == 201
        signup_data = signup_res.json()
        assert signup_data["success"] is True
        token1 = signup_data["token"]
        assert token1

        # 2. Login with correct password
        login_res = await ac.post("/api/v1/auth/login", json={
            "email": random_email,
            "password": password
        })
        assert login_res.status_code == 200
        login_data = login_res.json()
        assert login_data["success"] is True
        assert login_data["user"]["email"] == random_email
        assert login_data["user"]["role"] == "Admin"

        # 3. Login with wrong password
        wrong_pwd_res = await ac.post("/api/v1/auth/login", json={
            "email": random_email,
            "password": "WrongPassword999!"
        })
        assert wrong_pwd_res.status_code == 401

        # 4. Role portal enforcement - user is Admin, trying to log in via Creator portal
        portal_res = await ac.post("/api/v1/auth/login", json={
            "email": random_email,
            "password": password,
            "portalRole": "Creator"
        })
        assert portal_res.status_code == 403

        # 5. Profile Me endpoint with JWT token
        me_res = await ac.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token1}"})
        assert me_res.status_code == 200
        me_data = me_res.json()
        assert me_data["email"] == random_email

@pytest.mark.asyncio
async def test_super_admin_endpoints():
    # Login as Super Admin demo
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        demo_resp = await ac.post("/api/v1/auth/demo/super-admin")
        assert demo_resp.status_code == 200
        token = demo_resp.json()["token"]

        headers = {"Authorization": f"Bearer {token}"}

        # Stats
        stats_resp = await ac.get("/api/v1/super-admin/stats", headers=headers)
        assert stats_resp.status_code == 200
        stats = stats_resp.json()
        assert "totalOrganizations" in stats
        assert "totalUsers" in stats

        # System Health
        health_resp = await ac.get("/api/v1/super-admin/system-health", headers=headers)
        assert health_resp.status_code == 200
        assert health_resp.json()["status"] == "healthy"

        # AI Config
        ai_resp = await ac.get("/api/v1/super-admin/ai-config", headers=headers)
        assert ai_resp.status_code == 200

