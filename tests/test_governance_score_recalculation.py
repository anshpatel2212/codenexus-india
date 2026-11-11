import unittest
from unittest.mock import MagicMock
import sqlite3
import json
import sys
import os

# Mock external packages so tests run on standard Python without requiring pip install
for mod in [
    'fastapi',
    'pydantic',
    'backend',
    'backend.auth.jwt_guard',
    'backend.services.ai_review_engine',
    'backend.services.db',
]:
    if mod not in sys.modules:
        sys.modules[mod] = MagicMock()

# Add backend directory to path to test recalculate_review_score directly
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))
from routers.reviews import recalculate_review_score

class TestGovernanceScoreRecalculation(unittest.TestCase):
    def setUp(self):
        self.conn = sqlite3.connect(":memory:")
        self.conn.row_factory = sqlite3.Row
        cur = self.conn.cursor()

        cur.execute("""
        CREATE TABLE reviews (
            id TEXT PRIMARY KEY,
            organization_id TEXT NOT NULL,
            title TEXT NOT NULL,
            content_type TEXT NOT NULL,
            original_content TEXT NOT NULL,
            modified_content TEXT,
            overall_score REAL NOT NULL,
            category_scores TEXT DEFAULT '{}',
            status TEXT NOT NULL,
            author_id TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
        """)

        cur.execute("""
        CREATE TABLE findings (
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
            status TEXT DEFAULT 'pending'
        )
        """)

        cur.execute("""
        CREATE TABLE approvals (
            id TEXT PRIMARY KEY,
            review_id TEXT NOT NULL,
            organization_id TEXT NOT NULL,
            submitted_by TEXT NOT NULL,
            assigned_to TEXT,
            status TEXT DEFAULT 'Pending',
            urgency TEXT DEFAULT 'Medium',
            compliance_score REAL DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT
        )
        """)
        self.conn.commit()

    def tearDown(self):
        self.conn.close()

    def test_recalculate_review_score_unit(self):
        # 1. Clean review without findings -> 100.0, Approved
        score, cat_scores, status = recalculate_review_score([])
        self.assertEqual(score, 100.0)
        self.assertEqual(status, "Approved")

        # 2. Findings: 1 Critical (-15) + 1 High (-8) -> penalty 23 -> score 77.0
        findings = [
            {"id": "F-1", "severity": "Critical", "category": "Facts and Claims", "status": "pending"},
            {"id": "F-2", "severity": "High", "category": "Tone and Voice", "status": "pending"},
        ]
        score, cat_scores, status = recalculate_review_score(findings)
        self.assertEqual(score, 77.0)
        self.assertEqual(status, "Changes Requested")
        self.assertEqual(cat_scores["Facts and Claims"], 65)
        self.assertEqual(cat_scores["Tone and Voice"], 75)

        # 3. Apply Fix for Critical: status -> "accepted"
        # Remaining penalty is only High (-8) -> score 92.0
        findings[0]["status"] = "accepted"
        score, cat_scores, status = recalculate_review_score(findings)
        self.assertEqual(score, 92.0)
        self.assertEqual(status, "Changes Requested")
        self.assertEqual(cat_scores["Facts and Claims"], 94) # Restored
        self.assertEqual(cat_scores["Tone and Voice"], 75)  # Still penalized

        # 4. Apply Fix for High: status -> "accepted"
        # All findings accepted -> penalty 0 -> score 100.0, status -> Approved
        findings[1]["status"] = "accepted"
        score, cat_scores, status = recalculate_review_score(findings)
        self.assertEqual(score, 100.0)
        self.assertEqual(status, "Approved")
        self.assertEqual(cat_scores["Tone and Voice"], 95)  # Restored

        # 5. Rejected or modified finding still retains penalty if not accepted
        findings[1]["status"] = "rejected"
        score, cat_scores, status = recalculate_review_score(findings)
        self.assertEqual(score, 92.0)
        self.assertEqual(status, "Changes Requested")

        # 6. Score lower bound is capped at 50.0
        many_crit = [{"id": f"F-{i}", "severity": "Critical", "category": "Safety", "status": "pending"} for i in range(10)]
        score, _, _ = recalculate_review_score(many_crit)
        self.assertEqual(score, 50.0)

    def test_database_persistence_and_reviewer_sync(self):
        cur = self.conn.cursor()
        rev_id = "REV-2026-TEST"

        # Insert initial review with 1 Critical + 1 High finding
        cur.execute("""
        INSERT INTO reviews (id, organization_id, title, content_type, original_content, overall_score, category_scores, status, author_id, created_at, updated_at)
        VALUES (?, 'org-1', 'Test Campaign', 'Social Post', 'Initial draft with unverified claim', 77.0, '{}', 'Changes Requested', 'usr-1', '2026-11-11T12:00:00Z', '2026-11-11T12:00:00Z')
        """, (rev_id,))

        cur.execute("""
        INSERT INTO findings (id, review_id, organization_id, category, severity, reason, status)
        VALUES ('F-1', ?, 'org-1', 'Facts and Claims', 'Critical', 'Unsubstantiated 100% guarantee', 'pending')
        """, (rev_id,))

        cur.execute("""
        INSERT INTO findings (id, review_id, organization_id, category, severity, reason, status)
        VALUES ('F-2', ?, 'org-1', 'Tone and Voice', 'High', 'Overly aggressive sales tone', 'pending')
        """, (rev_id,))

        cur.execute("""
        INSERT INTO approvals (id, review_id, organization_id, submitted_by, compliance_score, status, created_at)
        VALUES ('APP-1', ?, 'org-1', 'usr-1', 77.0, 'Pending', '2026-11-11T12:00:00Z')
        """, (rev_id,))
        self.conn.commit()

        # Step 1: Simulate applying AI fix for F-1 (Critical)
        cur.execute("SELECT * FROM findings WHERE review_id = ?", (rev_id,))
        rows = cur.fetchall()
        findings_list = [dict(r) for r in rows]
        for f in findings_list:
            if f["id"] == "F-1":
                f["status"] = "accepted"

        new_score, cat_scores, new_status = recalculate_review_score(findings_list)
        self.assertEqual(new_score, 92.0)

        # Update findings, reviews, and approvals in DB
        cur.execute("UPDATE findings SET status = 'accepted' WHERE id = 'F-1'")
        cur.execute("""
        UPDATE reviews
        SET modified_content = 'Fixed draft without claim',
            overall_score = ?,
            category_scores = ?,
            status = ?,
            updated_at = '2026-11-11T12:05:00Z'
        WHERE id = ?
        """, (new_score, json.dumps(cat_scores), new_status, rev_id))

        cur.execute("""
        UPDATE approvals
        SET compliance_score = ?, updated_at = '2026-11-11T12:05:00Z'
        WHERE review_id = ?
        """, (new_score, rev_id))
        self.conn.commit()

        # Verify review table has updated score
        cur.execute("SELECT overall_score, status, modified_content FROM reviews WHERE id = ?", (rev_id,))
        rev_row = cur.fetchone()
        self.assertEqual(rev_row["overall_score"], 92.0)
        self.assertEqual(rev_row["status"], "Changes Requested")
        self.assertEqual(rev_row["modified_content"], "Fixed draft without claim")

        # Verify reviewer approvals table received the updated score
        cur.execute("SELECT compliance_score FROM approvals WHERE review_id = ?", (rev_id,))
        app_row = cur.fetchone()
        self.assertEqual(app_row["compliance_score"], 92.0)

        # Step 2: Apply fix for F-2 (High)
        findings_list[1]["status"] = "accepted"
        final_score, final_cats, final_status = recalculate_review_score(findings_list)
        self.assertEqual(final_score, 100.0)
        self.assertEqual(final_status, "Approved")

        cur.execute("UPDATE findings SET status = 'accepted' WHERE id = 'F-2'")
        cur.execute("""
        UPDATE reviews
        SET modified_content = 'Clean draft with friendly tone',
            overall_score = ?,
            category_scores = ?,
            status = ?,
            updated_at = '2026-11-11T12:10:00Z'
        WHERE id = ?
        """, (final_score, json.dumps(final_cats), final_status, rev_id))

        cur.execute("""
        UPDATE approvals
        SET compliance_score = ?, updated_at = '2026-11-11T12:10:00Z'
        WHERE review_id = ?
        """, (final_score, rev_id))
        self.conn.commit()

        # Check full page reload simulation (re-reading from DB)
        cur.execute("SELECT overall_score, status FROM reviews WHERE id = ?", (rev_id,))
        reloaded = cur.fetchone()
        self.assertEqual(reloaded["overall_score"], 100.0)
        self.assertEqual(reloaded["status"], "Approved")

        cur.execute("SELECT compliance_score FROM approvals WHERE review_id = ?", (rev_id,))
        reloaded_app = cur.fetchone()
        self.assertEqual(reloaded_app["compliance_score"], 100.0)

if __name__ == "__main__":
    unittest.main()
