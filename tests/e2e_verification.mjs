import assert from 'node:assert/strict';

const BACKEND_URL = 'http://127.0.0.1:8000/api/v1';
const FRONTEND_URL = 'http://localhost:3000';

async function runE2EVerification() {
  console.log('====================================================');
  console.log('🚀 RUNNING COMPREHENSIVE BRANDSENSE E2E VERIFICATION');
  console.log('====================================================\n');

  // ---------------------------------------------------------------------------
  // 1. FRONTEND LANDING PAGE & MOBILE NAVBAR INSPECTION
  // ---------------------------------------------------------------------------
  console.log('--- 1. Testing Landing Page HTML & Mobile Navigation ---');
  const landingRes = await fetch(`${FRONTEND_URL}/`);
  assert.equal(landingRes.status, 200, 'Landing page should return 200 OK');
  const landingHtml = await landingRes.text();

  assert.ok(landingHtml.includes('class="login-link">Log in</a>'), 'Landing page must contain visible Log in link');
  assert.ok(landingHtml.includes('mobile-only-nav-item'), 'Landing page must contain mobile drawer nav items');
  assert.ok(landingHtml.includes('BrandSense'), 'Landing page title must contain BrandSense');
  console.log('✔ Landing page loads with directly visible Login link and mobile drawer items');

  // ---------------------------------------------------------------------------
  // 2. AUTHENTICATION FLOW ACROSS ALL 5 ROLES
  // ---------------------------------------------------------------------------
  console.log('\n--- 2. Testing Authentication & Session Across All 5 Roles ---');
  const roles = [
    { role: 'Creator', email: 'creator@brandsense.ai' },
    { role: 'Reviewer', email: 'reviewer@brandsense.ai' },
    { role: 'Manager', email: 'manager@brandsense.ai' },
    { role: 'Admin', email: 'admin@brandsense.ai' },
    { role: 'Super Admin', email: 'superadmin@brandsense.ai' },
  ];

  const roleTokens = {};

  for (const { role, email } of roles) {
    const slug = role.toLowerCase().replace(' ', '-');
    const t0 = performance.now();
    const loginRes = await fetch(`${BACKEND_URL}/auth/demo/${slug}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const latency = performance.now() - t0;
    assert.equal(loginRes.status, 200, `Demo login for ${role} must return 200`);
    const loginData = await loginRes.json();
    const token = loginData.access_token || loginData.token;
    assert.ok(token, `Token must be returned for ${role}`);
    assert.equal(loginData.user.role, role, `User role must match ${role}`);
    roleTokens[role] = token;

    // Test /auth/me
    const meRes = await fetch(`${BACKEND_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(meRes.status, 200, `/auth/me must return 200 for ${role}`);
    const meData = await meRes.json();
    const validatedRole = meData.role || meData.user?.role;
    assert.equal(validatedRole, role, `Validated role in /auth/me must be ${role}`);
    console.log(`✔ ${role} login authenticated in ${latency.toFixed(1)}ms (role verified: ${validatedRole})`);
  }

  // ---------------------------------------------------------------------------
  // 3. REAL USER REGISTRATION & PERSISTENT LOGIN
  // ---------------------------------------------------------------------------
  console.log('\n--- 3. Testing Real User Signup & Persistent Auth ---');
  const uniqueEmail = `qa_test_${Date.now()}@example.com`;
  const signupRes = await fetch(`${BACKEND_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: uniqueEmail,
      password: 'SecurePassword123!',
      name: 'QA Automation Creator',
      organization_name: 'QA Testing Enterprise',
      role: 'Creator',
    }),
  });
  assert.equal(signupRes.status, 201, 'Signup must return 201 Created');
  const signupData = await signupRes.json();
  assert.equal(signupData.user.role, 'Creator');
  assert.equal(signupData.user.email, uniqueEmail);
  const newCreatorToken = signupData.access_token;
  const newCreatorOrgId = signupData.user.organization_id;
  console.log(`✔ New Creator registered successfully: ${uniqueEmail} (Org ID: ${newCreatorOrgId})`);

  // Verify persistent password login
  const passLoginRes = await fetch(`${BACKEND_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: uniqueEmail,
      password: 'SecurePassword123!',
    }),
  });
  assert.equal(passLoginRes.status, 200, 'Password login must succeed');
  const passLoginData = await passLoginRes.json();
  assert.equal(passLoginData.user.email, uniqueEmail);
  console.log('✔ Password login verified and persistent');

  // ---------------------------------------------------------------------------
  // 4. CREATOR & REVIEW WORKFLOW IN SQLITE
  // ---------------------------------------------------------------------------
  console.log('\n--- 4. Testing Creator Review Workflow in SQLite ---');
  const submitReviewRes = await fetch(`${BACKEND_URL}/reviews/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${newCreatorToken}`,
    },
    body: JSON.stringify({
      title: 'Q4 Product Launch Press Release',
      contentType: 'Press Release',
      content: 'We 100% guarantee that our miracle platform will eliminate all compliance penalties forever.',
      brandProfile: 'Corporate Core (Global English)',
    }),
  });
  assert.equal(submitReviewRes.status, 201, 'Review submission must return 201');
  const reviewResult = await submitReviewRes.json();
  assert.ok(reviewResult.id, 'Created review must have an ID');
  assert.ok(reviewResult.findings.length > 0, 'Review engine must flag non-compliant claims');
  console.log(`✔ Review created with ID ${reviewResult.id} (Score: ${reviewResult.score}, Findings: ${reviewResult.findings.length})`);

  // Verify creator sees their review in SQLite
  const listReviewsRes = await fetch(`${BACKEND_URL}/reviews`, {
    headers: { Authorization: `Bearer ${newCreatorToken}` },
  });
  assert.equal(listReviewsRes.status, 200);
  const reviewsList = await listReviewsRes.json();
  assert.ok(reviewsList.some((r) => r.id === reviewResult.id), 'Submitted review must be listed for creator');
  console.log(`✔ Review found in isolated tenant review list (${reviewsList.length} total)`);

  // Save Revision
  const revisionRes = await fetch(`${BACKEND_URL}/reviews/${reviewResult.id}/revisions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${newCreatorToken}`,
    },
    body: JSON.stringify({
      content: 'Our platform is designed to assist teams in mitigating compliance risks efficiently.',
      summary: 'Softened claims to adhere to brand guidelines.',
      complianceScore: 92,
      status: 'In Review',
    }),
  });
  assert.equal(revisionRes.status, 201, 'Saving revision must return 201');
  const revisionData = await revisionRes.json();
  const ver = revisionData.versionNumber || revisionData.version_number;
  assert.ok(ver >= 2, `Revision version number should be >= 2 (got ${ver})`);
  console.log(`✔ Revision ${ver} saved for review ${reviewResult.id}`);

  // ---------------------------------------------------------------------------
  // 5. REVIEWER APPROVAL & DECISION EXECUTION
  // ---------------------------------------------------------------------------
  console.log('\n--- 5. Testing Reviewer Decision Execution ---');
  const reviewerToken = roleTokens['Reviewer'];
  const decisionRes = await fetch(`${BACKEND_URL}/approvals/${reviewResult.id}/decision`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${reviewerToken}`,
    },
    body: JSON.stringify({
      status: 'Approved',
      note: 'Revised copy complies with legal guardrails.',
    }),
  });
  assert.equal(decisionRes.status, 200, 'Reviewer decision must return 200');
  const decisionData = await decisionRes.json();
  assert.equal(decisionData.status, 'Approved');
  console.log(`✔ Review ${reviewResult.id} marked as Approved by Reviewer`);

  // ---------------------------------------------------------------------------
  // 6. SENSA MULTI-TURN CONVERSATION MEMORY
  // ---------------------------------------------------------------------------
  console.log('\n--- 6. Testing SENSA Multi-Turn AI Conversation Memory ---');
  // Turn 1
  const sensaTurn1Res = await fetch(`${FRONTEND_URL}/api/sensa/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: 'Check this claim: We guarantee 100% zero fine compliance forever!',
      history: [],
    }),
  });
  assert.equal(sensaTurn1Res.status, 200);
  const turn1Data = await sensaTurn1Res.json();
  assert.ok(turn1Data.content.length > 20, 'SENSA must return analysis');
  console.log(`✔ Turn 1 Response: "${turn1Data.content.substring(0, 80).replace(/\n/g, ' ')}..."`);

  // Turn 2: Follow-up requesting concise variant
  const sensaTurn2Res = await fetch(`${FRONTEND_URL}/api/sensa/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: 'Can you make it shorter and more concise?',
      history: [
        { role: 'user', content: 'Check this claim: We guarantee 100% zero fine compliance forever!' },
        { role: 'model', content: turn1Data.content },
      ],
    }),
  });
  assert.equal(sensaTurn2Res.status, 200);
  const turn2Data = await sensaTurn2Res.json();
  assert.ok(turn2Data.content.length > 10, 'SENSA must return refined response using history');
  console.log(`✔ Turn 2 Response (using history): "${turn2Data.content.substring(0, 80).replace(/\n/g, ' ')}..."`);

  // ---------------------------------------------------------------------------
  // 7. DASHBOARD AND CORE ROUTES ACCESSIBILITY
  // ---------------------------------------------------------------------------
  console.log('\n--- 7. Testing Dashboard & Core Application Routes ---');
  const routesToTest = [
    '/login',
    '/signup',
    '/dashboard',
    '/creator/dashboard',
    '/reviewer/dashboard',
    '/admin/dashboard',
    '/super-admin/dashboard',
    '/creator/new-review',
    '/assistant',
    '/approvals',
    '/settings',
  ];

  for (const route of routesToTest) {
    const res = await fetch(`${FRONTEND_URL}${route}`);
    assert.equal(res.status, 200, `Route ${route} must return 200 OK`);
  }
  console.log(`✔ All ${routesToTest.length} primary frontend routes return HTTP 200 OK`);

  console.log('\n====================================================');
  console.log('🎉 ALL COMPREHENSIVE E2E VERIFICATIONS PASSED 100%!');
  console.log('====================================================\n');
}

runE2EVerification().catch((err) => {
  console.error('❌ E2E Verification failed:', err);
  process.exit(1);
});
