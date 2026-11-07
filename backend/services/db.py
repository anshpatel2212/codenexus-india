import sqlite3
import os
import json
import secrets
import hashlib
import hmac
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional, Dict, Any, List, Tuple

DB_DIR = Path(__file__).resolve().parent.parent / "data"
DB_PATH = DB_DIR / "brandsense.db"

def get_db_connection() -> sqlite3.Connection:
    DB_DIR.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH), timeout=30.0, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA busy_timeout = 10000;")
    return conn

def hash_password(password: str, salt: Optional[str] = None) -> Tuple[str, str]:
    if not salt:
        salt = secrets.token_hex(16)
    hashed = hashlib.sha256((salt + password).encode("utf-8")).hexdigest()
    return hashed, salt

def verify_password(password: str, stored_hash: str, salt: str) -> bool:
    check_hash = hashlib.sha256((salt + password).encode("utf-8")).hexdigest()
    return hmac.compare_digest(check_hash, stored_hash)

class DatabaseService:
    def __init__(self):
        self.init_db()

    def init_db(self):
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""
        CREATE TABLE IF NOT EXISTS organizations (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            slug TEXT UNIQUE,
            tier TEXT DEFAULT 'Enterprise Plan',
            status TEXT DEFAULT 'active',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
        """)

        cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            salt TEXT NOT NULL,
            full_name TEXT NOT NULL,
            role TEXT NOT NULL,
            organization_id TEXT,
            department TEXT DEFAULT 'General',
            avatar_url TEXT DEFAULT '',
            status TEXT DEFAULT 'active',
            is_demo INTEGER DEFAULT 0,
            supabase_user_id TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
        )
        """)

        # Backward compatibility migration: ensure supabase_user_id column exists
        cur.execute("PRAGMA table_info(users)")
        columns = [row[1] for row in cur.fetchall()]
        if "supabase_user_id" not in columns:
            cur.execute("ALTER TABLE users ADD COLUMN supabase_user_id TEXT")

        cur.execute("""
        CREATE TABLE IF NOT EXISTS knowledge_items (
            id TEXT PRIMARY KEY,
            organization_id TEXT NOT NULL,
            type TEXT NOT NULL,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            category TEXT DEFAULT 'General',
            tags TEXT DEFAULT '[]',
            status TEXT DEFAULT 'Active',
            replacement TEXT,
            file_format TEXT,
            file_size TEXT,
            file_url TEXT,
            created_by TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
        )
        """)

        cur.execute("""
        CREATE TABLE IF NOT EXISTS reviews (
            id TEXT PRIMARY KEY,
            organization_id TEXT NOT NULL,
            title TEXT NOT NULL,
            content_type TEXT NOT NULL,
            original_content TEXT NOT NULL,
            suggested_content TEXT,
            instructions TEXT,
            overall_score REAL NOT NULL,
            category_scores TEXT DEFAULT '{}',
            status TEXT NOT NULL,
            author_id TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
        )
        """)

        cur.execute("""
        CREATE TABLE IF NOT EXISTS findings (
            id TEXT PRIMARY KEY,
            review_id TEXT NOT NULL,
            organization_id TEXT NOT NULL,
            category TEXT NOT NULL,
            severity TEXT NOT NULL,
            reason TEXT NOT NULL,
            evidence TEXT,
            highlighted_text TEXT,
            suggested_fix TEXT,
            explanation TEXT,
            confidence REAL DEFAULT 90,
            status TEXT DEFAULT 'pending',
            FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE
        )
        """)

        cur.execute("""
        CREATE TABLE IF NOT EXISTS approvals (
            id TEXT PRIMARY KEY,
            review_id TEXT NOT NULL,
            organization_id TEXT NOT NULL,
            submitted_by TEXT NOT NULL,
            assigned_to TEXT,
            status TEXT DEFAULT 'Pending',
            urgency TEXT DEFAULT 'Medium',
            compliance_score REAL DEFAULT 0,
            decision_notes TEXT,
            decided_by TEXT,
            created_at TEXT NOT NULL,
            decided_at TEXT,
            FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE
        )
        """)

        cur.execute("""
        CREATE TABLE IF NOT EXISTS approval_comments (
            id TEXT PRIMARY KEY,
            approval_id TEXT NOT NULL,
            author_id TEXT NOT NULL,
            organization_id TEXT NOT NULL,
            text TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (approval_id) REFERENCES approvals(id) ON DELETE CASCADE
        )
        """)

        cur.execute("""
        CREATE TABLE IF NOT EXISTS activity_logs (
            id TEXT PRIMARY KEY,
            organization_id TEXT,
            user_id TEXT NOT NULL,
            user_name TEXT,
            action TEXT NOT NULL,
            details TEXT,
            ip_address TEXT DEFAULT '127.0.0.1',
            timestamp TEXT NOT NULL
        )
        """)

        cur.execute("""
        CREATE TABLE IF NOT EXISTS ai_configs (
            id TEXT PRIMARY KEY,
            organization_id TEXT DEFAULT 'global',
            provider TEXT NOT NULL,
            model_name TEXT NOT NULL,
            temperature REAL DEFAULT 0.2,
            similarity_threshold REAL DEFAULT 0.85,
            max_tokens INTEGER DEFAULT 4096,
            fallback_model TEXT DEFAULT 'gemini-1.5-flash',
            strict_mode INTEGER DEFAULT 1,
            api_key_configured INTEGER DEFAULT 1,
            status TEXT DEFAULT 'Active',
            error_rate REAL DEFAULT 0.0,
            total_requests INTEGER DEFAULT 0,
            last_latency_ms REAL DEFAULT 340,
            updated_at TEXT NOT NULL
        )
        """)

        # Safe migration if table previously existed without new columns
        for col, col_def in [
            ("organization_id", "TEXT DEFAULT 'global'"),
            ("temperature", "REAL DEFAULT 0.2"),
            ("similarity_threshold", "REAL DEFAULT 0.85"),
            ("max_tokens", "INTEGER DEFAULT 4096"),
            ("fallback_model", "TEXT DEFAULT 'gemini-1.5-flash'"),
            ("strict_mode", "INTEGER DEFAULT 1")
        ]:
            try:
                cur.execute(f"ALTER TABLE ai_configs ADD COLUMN {col} {col_def}")
            except Exception:
                pass

        cur.execute("""
        CREATE TABLE IF NOT EXISTS invitations (
            id TEXT PRIMARY KEY,
            organization_id TEXT NOT NULL,
            email TEXT NOT NULL,
            role TEXT NOT NULL,
            token TEXT UNIQUE NOT NULL,
            invited_by TEXT NOT NULL,
            status TEXT DEFAULT 'pending',
            expires_at TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
        """)

        conn.commit()
        conn.close()

        # Seed initial demo organizations and demo personas
        self.seed_defaults()

    def seed_defaults(self):
        conn = get_db_connection()
        cur = conn.cursor()

        # 1. Seed Demo Organization
        cur.execute("SELECT id FROM organizations WHERE id = 'org-demo-brandsense'")
        if not cur.fetchone():
            now = datetime.utcnow().isoformat() + "Z"
            cur.execute("""
            INSERT INTO organizations (id, name, slug, tier, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """, ('org-demo-brandsense', 'BrandSense Demo Corp', 'brandsense-demo', 'Enterprise Plan', 'active', now, now))

        # 2. Seed Default AI Config
        cur.execute("SELECT id FROM ai_configs WHERE id = 'cfg-gemini'")
        if not cur.fetchone():
            now = datetime.utcnow().isoformat() + "Z"
            cur.execute("""
            INSERT INTO ai_configs (id, provider, model_name, api_key_configured, status, error_rate, total_requests, last_latency_ms, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, ('cfg-gemini', 'Google Gemini AI', 'gemini-1.5-flash', 1, 'Active', 0.2, 1420, 310, now))

        # 3. Seed Demo Users for ALL 4 Roles
        demo_personas = [
            {
                "id": "usr-demo-superadmin",
                "email": "demo-superadmin@brandsense.ai",
                "full_name": "Alexander Vance (Super Admin Demo)",
                "role": "Super Admin",
                "organization_id": None,
                "department": "Platform Security & Governance Operations",
                "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
                "is_demo": 1
            },
            {
                "id": "usr-demo-admin",
                "email": "demo-admin@brandsense.ai",
                "full_name": "Devon Hayes (Org Admin Demo)",
                "role": "Admin",
                "organization_id": "org-demo-brandsense",
                "department": "Information Security & IT",
                "avatar_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
                "is_demo": 1
            },
            {
                "id": "usr-demo-creator",
                "email": "demo-creator@brandsense.ai",
                "full_name": "Chloe Dubois (Creator Demo)",
                "role": "Creator",
                "organization_id": "org-demo-brandsense",
                "department": "Creative & Social Media",
                "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
                "is_demo": 1
            },
            {
                "id": "usr-demo-reviewer",
                "email": "demo-reviewer@brandsense.ai",
                "full_name": "Marcus Vance (Reviewer Demo)",
                "role": "Reviewer",
                "organization_id": "org-demo-brandsense",
                "department": "Legal & Regulatory Compliance",
                "avatar_url": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
                "is_demo": 1
            },
            {
                "id": "usr-demo-manager",
                "email": "demo-manager@brandsense.ai",
                "full_name": "Elena Rostova (Manager Demo)",
                "role": "Manager",
                "organization_id": "org-demo-brandsense",
                "department": "Brand & Global Marketing",
                "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
                "is_demo": 1
            }
        ]

        now = datetime.utcnow().isoformat() + "Z"
        for p in demo_personas:
            cur.execute("SELECT id FROM users WHERE email = ?", (p["email"],))
            if not cur.fetchone():
                p_hash, salt = hash_password("Demo@2025!")
                cur.execute("""
                INSERT INTO users (id, email, password_hash, salt, full_name, role, organization_id, department, avatar_url, status, is_demo, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?)
                """, (p["id"], p["email"], p_hash, salt, p["full_name"], p["role"], p["organization_id"], p["department"], p["avatar_url"], p["is_demo"], now, now))

        # 4. Seed Demo Knowledge Base for Demo Org
        cur.execute("SELECT COUNT(*) FROM knowledge_items WHERE organization_id = 'org-demo-brandsense'")
        if cur.fetchone()[0] == 0:
            demo_kb = [
                ("kb-demo-1", "org-demo-brandsense", "guideline", "Tone & Voice Policy", "Brand voice must be authoritative, confident, yet humble and measured. Avoid hype.", "Brand Core", "Active"),
                ("kb-demo-2", "org-demo-brandsense", "fact", "SOC-2 Type II Certified", "BrandSense infrastructure is audited annually for SOC-2 Type II compliance.", "Security", "Active"),
                ("kb-demo-3", "org-demo-brandsense", "terminology", "BrandSense Platform™", "Always spell with camel-case BrandSense. Include trademark on first reference.", "Nomenclature", "Active"),
                ("kb-demo-4", "org-demo-brandsense", "banned", "Miracle / Magic / Guaranteed Zero Risk", "Absolute guarantees and superlative buzzwords are legally prohibited.", "Legal", "Active"),
                ("kb-demo-5", "org-demo-brandsense", "phrase", "Audited AI Governance", "Required marketing tag phrase for all press releases and campaign announcements.", "Marketing", "Active"),
                ("kb-demo-6", "org-demo-brandsense", "disclaimer", "Individual Results Disclaimer", "Results based on 2025 cohort study of 42 enterprise accounts; individual outcomes vary.", "Compliance", "Active"),
                ("kb-demo-7", "org-demo-brandsense", "asset", "Primary BrandSense SVG Logo", "Approved enterprise lockup on dark navy (#20364A) backgrounds.", "Visual Assets", "Active")
            ]
            for item in demo_kb:
                cur.execute("""
                INSERT INTO knowledge_items (id, organization_id, type, title, content, category, status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (item[0], item[1], item[2], item[3], item[4], item[5], item[6], now, now))

        # 5. Seed Activity Log
        cur.execute("SELECT COUNT(*) FROM activity_logs")
        if cur.fetchone()[0] == 0:
            cur.execute("""
            INSERT INTO activity_logs (id, organization_id, user_id, user_name, action, details, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """, ("act-1", "org-demo-brandsense", "usr-demo-admin", "Devon Hayes", "Platform Initialized", "BrandSense multi-tenant governance database initialized.", now))

        # 6. Seed Interconnected Demo Review & Approval Item
        cur.execute("SELECT COUNT(*) FROM reviews WHERE organization_id = 'org-demo-brandsense'")
        if cur.fetchone()[0] == 0:
            rev_id = "rev-demo-q3-launch"
            orig_content = (
                "BrandSense guarantees a 100% elimination of all regulatory compliance fines within 30 days. "
                "Our disruptive miracle platform revolutionises how your team reviews content. Connect your repository with brand sense Cloud Sync in one click.\n\n"
                "Clients typically see an instant 450% ROI on their enterprise license in quarter one. Don’t be a dinosaur! "
                "Grab your license today before your competitors leave you in the dust! Click the green button on the right side of the screen to download."
            )
            sugg_content = (
                "BrandSense is designed to help reduce regulatory risk and streamline compliance reviews. "
                "Our enterprise content governance platform streamlines how your team reviews content. Connect your repository with BrandSense Content Hub™ in one click.\n\n"
                "Clients achieve measurable workflow acceleration (*Results based on a 2025 cohort study of 42 enterprise accounts; individual outcomes vary). "
                "Equip your marketing and compliance teams with proactive governance today. Select the ‘Download Report’ button below to get started."
            )
            cat_scores = json.dumps({
                "Tone and Voice": 72,
                "Terminology": 84,
                "Facts and Claims": 65,
                "Promotional Claims": 60,
                "Visual Consistency": 95,
                "Accessibility": 92
            })
            cur.execute("""
            INSERT INTO reviews (id, organization_id, title, content_type, original_content, suggested_content, overall_score, category_scores, status, author_id, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (rev_id, "org-demo-brandsense", "Q3 Global Product Launch — Enterprise LinkedIn Campaign", "Social Media", orig_content, sugg_content, 74.0, cat_scores, "Changes Requested", "usr-demo-creator", now, now))

            findings_data = [
                ("fnd-1", rev_id, "org-demo-brandsense", "Facts and Claims", "High", "Unsubstantiated Performance Claim", "guarantees a 100% elimination of all regulatory compliance fines within 30 days", "Absolute guarantee of zero fines violates SEC & FTC promotional guidelines.", 95.0),
                ("fnd-2", rev_id, "org-demo-brandsense", "Terminology", "Medium", "Banned Superlative 'miracle'", "disruptive miracle platform", "Term 'miracle' is on the banned vocabulary list for BrandSense Demo Corp.", 92.0),
                ("fnd-3", rev_id, "org-demo-brandsense", "Tone and Voice", "Medium", "Aggressive high-pressure sales tone", "Don’t be a dinosaur! Grab your license today before your competitors leave you in the dust!", "Contradicts executive tone requirement of 'authoritative, confident, yet humble and measured'.", 88.0),
                ("fnd-4", rev_id, "org-demo-brandsense", "Disclaimers", "High", "Missing Required ROI Footnote", "instant 450% ROI on their enterprise license in quarter one", "Requires mandatory 2025 cohort disclosure footnote.", 96.0)
            ]
            for f in findings_data:
                cur.execute("""
                INSERT INTO findings (id, review_id, organization_id, category, severity, reason, highlighted_text, explanation, confidence, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
                """, f)

            cur.execute("""
            INSERT INTO approvals (id, review_id, organization_id, submitted_by, assigned_to, status, urgency, compliance_score, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, ("app-demo-1", rev_id, "org-demo-brandsense", "usr-demo-creator", "usr-demo-reviewer", "Pending", "High", 74.0, now))

        conn.commit()
        conn.close()

db_service = DatabaseService()
