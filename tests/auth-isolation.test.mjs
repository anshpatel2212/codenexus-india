import test from 'node:test';
import assert from 'node:assert/strict';

// In-memory mock localStorage simulating browser storage with per-key isolation
class MockLocalStorage {
  constructor() {
    this.store = new Map();
  }
  getItem(key) {
    return this.store.has(key) ? this.store.get(key) : null;
  }
  setItem(key, value) {
    this.store.set(key, String(value));
  }
  removeItem(key) {
    this.store.delete(key);
  }
  clear() {
    this.store.clear();
  }
  get length() {
    return this.store.size;
  }
}

// Emulate multi-tenant local storage operations mirroring SupabaseDataService
class IsolatedTenantDataService {
  constructor(storage, demoOrgId = 'org-demo-brandsense') {
    this.storage = storage;
    this.demoOrgId = demoOrgId;
  }

  getReviewsKey(orgId) {
    return `brandsense_reviews_${orgId || this.demoOrgId}`;
  }

  getKBKey(orgId) {
    return `brandsense_kb_${orgId || this.demoOrgId}`;
  }

  getApprovalsKey(orgId) {
    return `brandsense_approvals_${orgId || this.demoOrgId}`;
  }

  getCurrentReviewKey(userId) {
    return `brandsense_current_review_${userId || 'anonymous'}`;
  }

  getLocalReviews(orgId) {
    const raw = this.storage.getItem(this.getReviewsKey(orgId));
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  saveLocalReview(review, orgId, authorId) {
    const key = this.getReviewsKey(orgId);
    const existing = this.getLocalReviews(orgId);
    const targetOrg = orgId || this.demoOrgId;
    const scopedReview = { ...review, organizationId: targetOrg, authorId };

    const idx = existing.findIndex((r) => r.id === scopedReview.id);
    if (idx >= 0) {
      existing[idx] = scopedReview;
    } else {
      existing.unshift(scopedReview);
    }

    this.storage.setItem(key, JSON.stringify(existing));
    this.storage.setItem(this.getCurrentReviewKey(authorId), JSON.stringify(scopedReview));
    return scopedReview;
  }

  getReviewById(id, orgId) {
    const reviews = this.getLocalReviews(orgId);
    const match = reviews.find((r) => r.id === id);
    if (!match) return undefined;
    // Strict multi-tenant verification: never return review belonging to another org
    if (orgId && match.organizationId && match.organizationId !== orgId) {
      return undefined;
    }
    return match;
  }

  resetDemoData() {
    this.storage.removeItem(`brandsense_reviews_${this.demoOrgId}`);
    this.storage.removeItem(`brandsense_kb_${this.demoOrgId}`);
    this.storage.removeItem(`brandsense_approvals_${this.demoOrgId}`);
    this.storage.removeItem(`brandsense_current_review_usr-demo-manager`);
  }
}

test('Multi-Tenant Data Isolation and Demo Sandbox Test Suite', async (t) => {
  const storage = new MockLocalStorage();
  const service = new IsolatedTenantDataService(storage);

  const ALICE_ORG = 'org-alice-enterprises';
  const ALICE_ID = 'usr-alice-123';

  const BOB_ORG = 'org-bob-agency';
  const BOB_ID = 'usr-bob-456';

  const DEMO_ORG = 'org-demo-brandsense';
  const DEMO_ID = 'usr-demo-manager';

  await t.test('1. Real User Registration creates strict, isolated tenant boundary', () => {
    // Save review for Alice
    const aliceReview = service.saveLocalReview(
      { id: 'rev-alice-1', title: 'Q4 Product Announcement', content: 'Secret confidential launch copy' },
      ALICE_ORG,
      ALICE_ID
    );

    assert.equal(aliceReview.organizationId, ALICE_ORG);
    assert.equal(aliceReview.authorId, ALICE_ID);

    // Save review for Bob
    const bobReview = service.saveLocalReview(
      { id: 'rev-bob-1', title: 'Competitor Campaign', content: 'Bob agency client pitch' },
      BOB_ORG,
      BOB_ID
    );

    assert.equal(bobReview.organizationId, BOB_ORG);
    assert.equal(bobReview.authorId, BOB_ID);

    // Verify storage keys in mock storage
    assert.ok(storage.getItem(`brandsense_reviews_${ALICE_ORG}`));
    assert.ok(storage.getItem(`brandsense_reviews_${BOB_ORG}`));
    assert.notEqual(
      storage.getItem(`brandsense_reviews_${ALICE_ORG}`),
      storage.getItem(`brandsense_reviews_${BOB_ORG}`)
    );
  });

  await t.test('2. User B cannot view User A reviews through getLocalReviews', () => {
    const bobReviews = service.getLocalReviews(BOB_ORG);
    assert.equal(bobReviews.length, 1);
    assert.equal(bobReviews[0].id, 'rev-bob-1');

    // Bob cannot find Alice's review in Bob's review list
    const leakedAliceInBob = bobReviews.find((r) => r.id === 'rev-alice-1');
    assert.equal(leakedAliceInBob, undefined);
  });

  await t.test('3. New organization with 0 reviews returns empty array, never leaking demo or other tenants', () => {
    const CHARLIE_ORG = 'org-charlie-fresh';
    const charlieReviews = service.getLocalReviews(CHARLIE_ORG);
    assert.deepEqual(charlieReviews, []);
  });

  await t.test('4. Cross-tenant ID probing in getReviewById is strictly blocked', () => {
    // Attempt to access Alice's review using Bob's org context
    const crossTenantAttempt = service.getReviewById('rev-alice-1', BOB_ORG);
    assert.equal(crossTenantAttempt, undefined, 'Must not return Alice review to Bob org');

    // Attempt to access Alice's review using Demo org context
    const demoCrossAttempt = service.getReviewById('rev-alice-1', DEMO_ORG);
    assert.equal(demoCrossAttempt, undefined, 'Must not return Alice review to Demo org');

    // Legitimate access by Alice
    const legitimateAlice = service.getReviewById('rev-alice-1', ALICE_ORG);
    assert.ok(legitimateAlice);
    assert.equal(legitimateAlice.id, 'rev-alice-1');
    assert.equal(legitimateAlice.organizationId, ALICE_ORG);
  });

  await t.test('5. Current review preview is isolated per user ID', () => {
    const aliceCurrent = storage.getItem(service.getCurrentReviewKey(ALICE_ID));
    const bobCurrent = storage.getItem(service.getCurrentReviewKey(BOB_ID));

    assert.ok(aliceCurrent);
    assert.ok(bobCurrent);
    assert.notEqual(aliceCurrent, bobCurrent);
    assert.ok(JSON.parse(aliceCurrent).title.includes('Q4 Product'));
    assert.ok(JSON.parse(bobCurrent).title.includes('Competitor Campaign'));
  });

  await t.test('6. Demo sandbox operations remain strictly quarantined', () => {
    // Save demo review
    service.saveLocalReview(
      { id: 'rev-demo-1', title: 'Sample Demo Review', content: 'Demo text' },
      DEMO_ORG,
      DEMO_ID
    );

    const demoReviews = service.getLocalReviews(DEMO_ORG);
    assert.equal(demoReviews.length, 1);
    assert.equal(demoReviews[0].id, 'rev-demo-1');

    // Alice still only has Alice reviews
    const aliceReviews = service.getLocalReviews(ALICE_ORG);
    assert.equal(aliceReviews.length, 1);
    assert.equal(aliceReviews[0].id, 'rev-alice-1');
  });

  await t.test('7. resetDemoData clears demo sandbox without disturbing real registered tenants', () => {
    // Verify pre-conditions
    assert.ok(storage.getItem(`brandsense_reviews_${DEMO_ORG}`));
    assert.ok(storage.getItem(`brandsense_reviews_${ALICE_ORG}`));
    assert.ok(storage.getItem(`brandsense_reviews_${BOB_ORG}`));

    // Reset demo
    service.resetDemoData();

    // Demo data must be cleared
    assert.equal(storage.getItem(`brandsense_reviews_${DEMO_ORG}`), null);
    assert.deepEqual(service.getLocalReviews(DEMO_ORG), []);

    // Real tenants must be completely unaffected
    const aliceReviewsAfter = service.getLocalReviews(ALICE_ORG);
    assert.equal(aliceReviewsAfter.length, 1);
    assert.equal(aliceReviewsAfter[0].id, 'rev-alice-1');

    const bobReviewsAfter = service.getLocalReviews(BOB_ORG);
    assert.equal(bobReviewsAfter.length, 1);
    assert.equal(bobReviewsAfter[0].id, 'rev-bob-1');
  });
});

