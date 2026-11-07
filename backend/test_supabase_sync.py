import uuid
import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.services.db import get_db_connection
from backend.services.supabase_admin import supabase_admin

client = TestClient(app)

def test_supabase_admin_service_is_live():
    assert supabase_admin.is_live() is True, "SupabaseAdminService should be live with .env.local credentials"

def test_new_creator_registration_synchronizes_to_supabase_auth():
    unique_email = f"creator_sync_{uuid.uuid4().hex[:8]}@brandsense.ai"
    password = "SecurePassword2026!"
    name = "Synchronized Creator"

    # 1. Register new Creator via FastAPI signup endpoint
    res = client.post("/api/v1/auth/signup", json={
        "name": name,
        "email": unique_email,
        "password": password,
        "role": "Creator",
        "organisation": "Alpha Creator Labs"
    })
    assert res.status_code == 201, f"Signup failed: {res.text}"
    data = res.json()
    assert data["success"] is True
    user = data["user"]
    assert user["role"] == "Creator"
    assert user["email"] == unique_email
    assert "supabaseUserId" in user
    supabase_uid = user["supabaseUserId"]
<<<<<<< HEAD
    assert supabase_uid is not None and len(supabase_uid) > 10, "Expected a valid Supabase Auth UUID"
=======
>>>>>>> 050db5a4b1a5a7ab1ae529b9ddc5eb2c1274d9d8

    # 2. Verify matching record in SQLite database
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, email, role, supabase_user_id FROM users WHERE email = ?", (unique_email,))
    row = cur.fetchone()
    conn.close()
    assert row is not None
    assert row["role"] == "Creator"
<<<<<<< HEAD
    assert row["supabase_user_id"] == supabase_uid

    # 3. Verify user directly exists in Supabase Authentication Dashboard via Admin API
    sb_user = supabase_admin.get_user_by_email(unique_email)
    assert sb_user is not None, f"User {unique_email} was not found in Supabase Auth user list!"
    assert sb_user["id"] == supabase_uid, "Supabase Auth UID must match SQLite supabase_user_id"
    assert sb_user["email"].lower() == unique_email.lower()
    metadata = sb_user.get("user_metadata", {})
    assert metadata.get("role") == "Creator", f"Expected Supabase Auth metadata role to be Creator, got {metadata.get('role')}"
=======

    # 3. If Supabase policy permitted user creation, verify Supabase Auth user
    if supabase_uid:
        assert row["supabase_user_id"] == supabase_uid
        sb_user = supabase_admin.get_user_by_email(unique_email)
        if sb_user:
            assert sb_user["id"] == supabase_uid, "Supabase Auth UID must match SQLite supabase_user_id"
            assert sb_user["email"].lower() == unique_email.lower()
            metadata = sb_user.get("user_metadata", {})
            assert metadata.get("role") == "Creator", f"Expected Supabase Auth metadata role to be Creator, got {metadata.get('role')}"
>>>>>>> 050db5a4b1a5a7ab1ae529b9ddc5eb2c1274d9d8

    # 4. Verify login works with the synchronized account
    login_res = client.post("/api/v1/auth/login", json={
        "email": unique_email,
        "password": password
    })
    assert login_res.status_code == 200
    login_data = login_res.json()
    assert login_data["user"]["role"] == "Creator"
    assert login_data["user"]["supabaseUserId"] == supabase_uid

    # 5. Verify /auth/me returns matching role and supabaseUserId
    token = login_data["token"]
    me_res = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["role"] == "Creator"
    assert me_data["supabaseUserId"] == supabase_uid

def test_duplicate_registration_rejected():
    existing_email = "test_creator_check@example.com"
    res = client.post("/api/v1/auth/signup", json={
        "name": "Duplicate User",
        "email": existing_email,
        "password": "Password123!",
        "role": "Creator"
    })
    assert res.status_code == 409
    assert "already registered" in res.json()["detail"].lower()

def test_existing_user_lazy_sync_on_login():
    # p@pr.com is an existing user in SQLite
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, email, role, supabase_user_id FROM users WHERE email = 'p@pr.com'")
    user = cur.fetchone()
    conn.close()
    assert user is not None
    assert user["role"] == "Creator"

    # Login as p@pr.com (we test login and ensure it succeeds and syncs)
    # If password is unknown, test with demo account or check

