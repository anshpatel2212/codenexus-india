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
    creator_email = f"creator_{uuid.uuid4().hex[:8]}@example.com"
    manager_email = f"manager_{uuid.uuid4().hex[:8]}@example.com"
    attack_email = f"attacker_{uuid.uuid4().hex[:8]}@example.com"
    password = "SecurePassword123!"

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Privilege Escalation Prevention: Attempt public signup as Admin -> REJECTED
        admin_signup_attempt = await ac.post("/api/v1/auth/signup", json={
            "name": "Attacker",
            "email": attack_email,
            "password": password,
            "organisation": "Hacker Corp",
            "role": "Admin"
        })
        assert admin_signup_attempt.status_code == 400
        assert "Public account creation only allows 'Creator' or 'Manager' roles" in admin_signup_attempt.text

        # 2. Privilege Escalation Prevention: Attempt public signup as Super Admin -> REJECTED
        sa_signup_attempt = await ac.post("/api/v1/auth/signup", json={
            "name": "Attacker",
            "email": attack_email,
            "password": password,
            "organisation": "Hacker Corp",
            "role": "Super Admin"
        })
        assert sa_signup_attempt.status_code == 400

        # 3. Legitimate Creator Signup
        creator_signup = await ac.post("/api/v1/auth/signup", json={
            "name": "Alice Creator",
            "email": creator_email,
            "password": password,
            "organisation": "Acme Creative",
            "role": "Creator"
        })
        assert creator_signup.status_code == 201
        creator_data = creator_signup.json()
        assert creator_data["success"] is True
        assert creator_data["user"]["role"] == "Creator"
        creator_token = creator_data["token"]
        creator_user_id = creator_data["user"]["id"]

        # 4. Creator Login -> Role must be Creator (Single source of truth)
        creator_login = await ac.post("/api/v1/auth/login", json={
            "email": creator_email,
            "password": password
        })
        assert creator_login.status_code == 200
        assert creator_login.json()["user"]["role"] == "Creator"

        # 5. Creator /auth/me -> Role must be Creator
        creator_me = await ac.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {creator_token}"})
        assert creator_me.status_code == 200
        assert creator_me.json()["role"] == "Creator"

        # 6. Portal enforcement: Creator cannot log into Admin portal
        creator_portal_fail = await ac.post("/api/v1/auth/login", json={
            "email": creator_email,
            "password": password,
            "portalRole": "Admin"
        })
        assert creator_portal_fail.status_code == 403

        # 7. Legitimate Manager Signup
        manager_signup = await ac.post("/api/v1/auth/signup", json={
            "name": "Bob Manager",
            "email": manager_email,
            "password": password,
            "organisation": "Acme Governance",
            "role": "Manager"
        })
        assert manager_signup.status_code == 201
        manager_data = manager_signup.json()
        assert manager_data["user"]["role"] == "Manager"
        manager_token = manager_data["token"]

        # 8. Manager Login & /auth/me
        manager_login = await ac.post("/api/v1/auth/login", json={
            "email": manager_email,
            "password": password
        })
        assert manager_login.status_code == 200
        assert manager_login.json()["user"]["role"] == "Manager"

        manager_me = await ac.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {manager_token}"})
        assert manager_me.status_code == 200
        assert manager_me.json()["role"] == "Manager"

        # 9. Wrong password
        wrong_pwd_res = await ac.post("/api/v1/auth/login", json={
            "email": creator_email,
            "password": "WrongPassword999!"
        })
        assert wrong_pwd_res.status_code == 401

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

        # Secure Role Promotion by Super Admin
        role_resp = await ac.put(
            "/api/v1/super-admin/users/usr-demo-creator/role",
            json={"role": "Manager"},
            headers=headers
        )
        assert role_resp.status_code == 200
        assert role_resp.json()["newRole"] == "Manager"

        # Restore original role
        restore_resp = await ac.put(
            "/api/v1/super-admin/users/usr-demo-creator/role",
            json={"role": "Creator"},
            headers=headers
        )
        assert restore_resp.status_code == 200
        assert restore_resp.json()["newRole"] == "Creator"

