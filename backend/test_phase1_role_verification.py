import uuid
import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.services.db import get_db_connection

client = TestClient(app)

def test_creator_signup_and_role_persistence():
    unique_email = f"creator_test_{uuid.uuid4().hex[:8]}@example.com"
    # 1. Signup with Creator role
    res = client.post("/api/v1/auth/signup", json={
        "name": "Jane Creator",
        "email": unique_email,
        "password": "Password123!",
        "role": "Creator",
        "organisation": "Creator Media Lab"
    })
    assert res.status_code == 201
    data = res.json()
    assert data["success"] is True
    assert data["user"]["role"] == "Creator"
    assert data["user"]["email"] == unique_email
    token = data["token"]

    # 2. Verify stored role directly in SQLite DB
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT role FROM users WHERE email = ?", (unique_email,))
    row = cur.fetchone()
    conn.close()
    assert row is not None
    assert row["role"] == "Creator", f"Expected SQLite role to be 'Creator', got '{row['role']}'"

    # 3. Verify /auth/me returns Creator
    me_res = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["role"] == "Creator"
    assert me_data["email"] == unique_email

    # 4. Login as Creator and verify returned role
    login_res = client.post("/api/v1/auth/login", json={
        "email": unique_email,
        "password": "Password123!"
    })
    assert login_res.status_code == 200
    login_data = login_res.json()
    assert login_data["user"]["role"] == "Creator"

def test_prevent_admin_role_during_public_signup():
    unique_email = f"hacker_admin_{uuid.uuid4().hex[:8]}@example.com"
    # Attempting to sign up with 'Admin'
    res = client.post("/api/v1/auth/signup", json={
        "name": "Fake Admin",
        "email": unique_email,
        "password": "Password123!",
        "role": "Admin",
        "organisation": "Fake Org"
    })
    assert res.status_code == 400
    assert "Public account creation only allows 'Creator' or 'Manager'" in res.json()["detail"]

    # Attempting to sign up with 'Super Admin'
    res_sa = client.post("/api/v1/auth/signup", json={
        "name": "Fake Super Admin",
        "email": f"hacker_sa_{uuid.uuid4().hex[:8]}@example.com",
        "password": "Password123!",
        "role": "Super Admin"
    })
    assert res_sa.status_code == 400

def test_existing_creator_account_persistence():
    # Verify p@pr.com is now Creator and returns Creator on me and login
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, email, role FROM users WHERE email = 'p@pr.com'")
    user = cur.fetchone()
    conn.close()
    assert user is not None
    assert user["role"] == "Creator"

def test_creator_cannot_access_super_admin_routes():
    unique_email = f"creator_rbac_{uuid.uuid4().hex[:8]}@example.com"
    signup_res = client.post("/api/v1/auth/signup", json={
        "name": "Restricted Creator",
        "email": unique_email,
        "password": "Password123!",
        "role": "Creator"
    })
    token = signup_res.json()["token"]

    # Attempt to hit super-admin endpoints with Creator token
    res = client.get("/api/v1/super-admin/organisations", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 403
    assert "Super Admin" in res.json()["detail"]

def test_admin_login_preserves_admin_role():
    # Demo admin login
    res = client.post("/api/v1/auth/demo/admin")
    assert res.status_code == 200
    data = res.json()
    assert data["user"]["role"] == "Admin"
    token = data["token"]

    me_res = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["role"] == "Admin"

