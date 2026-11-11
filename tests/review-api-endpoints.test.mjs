import test from 'node:test';
import assert from 'node:assert/strict';

/**
 * Mirror of resolveApiUrl from src/services/api-client.ts
 * Tests URL resolution against deployed Render configuration and local environments.
 */
function resolveApiUrl(endpoint, baseUrl) {
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }

  const cleanBase = (baseUrl || '').trim().replace(/\/+$/, '');
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  // If base URL already ends with /api/v1 and endpoint starts with /api/v1,
  // strip /api/v1 from endpoint to avoid duplicate /api/v1/api/v1
  if (cleanBase.endsWith('/api/v1') && cleanEndpoint.startsWith('/api/v1')) {
    const subPath = cleanEndpoint.slice('/api/v1'.length);
    return subPath ? `${cleanBase}${subPath.startsWith('/') ? subPath : `/${subPath}`}` : cleanBase;
  }

  // If base URL does not end with /api/v1 and endpoint does not start with /api/v1,
  // ensure /api/v1 is included since FastAPI routes are mounted at /api/v1
  if (!cleanBase.endsWith('/api/v1') && !cleanEndpoint.startsWith('/api/v1')) {
    return `${cleanBase}/api/v1${cleanEndpoint}`;
  }

  return `${cleanBase}${cleanEndpoint}`;
}

test('BrandSense Review API Route Mappings and URL Resolution Suite', async (t) => {
  const DEPLOYED_BACKEND_BASE = 'https://brandsense-backend-1lq0.onrender.com';
  const BACKEND_WITH_V1 = 'https://brandsense-backend-1lq0.onrender.com/api/v1';
  const LOCAL_BACKEND_V1 = 'http://127.0.0.1:8000/api/v1';
  const CLIENT_RELATIVE_V1 = '/api/v1';

  await t.test('1. Deployed Render backend base URL resolves correctly to /api/v1/reviews (Fix for 404)', () => {
    const listingUrl = resolveApiUrl('/api/v1/reviews', DEPLOYED_BACKEND_BASE);
    assert.equal(
      listingUrl,
      'https://brandsense-backend-1lq0.onrender.com/api/v1/reviews',
      'Listing URL must target /api/v1/reviews on deployed backend'
    );
    assert.ok(
      !listingUrl.includes('/reviews') || listingUrl.includes('/api/v1/reviews'),
      'Must not request bare /reviews on backend base'
    );
  });

  await t.test('2. Legacy bare /reviews requests auto-upgrade to /api/v1/reviews on deployed base URL', () => {
    const legacyUrl = resolveApiUrl('/reviews', DEPLOYED_BACKEND_BASE);
    assert.equal(
      legacyUrl,
      'https://brandsense-backend-1lq0.onrender.com/api/v1/reviews',
      'Bare /reviews must be routed to /api/v1/reviews to prevent 404'
    );
  });

  await t.test('3. Duplicate /api/v1 prefixes are strictly avoided when base URL includes /api/v1', () => {
    const urlFromV1Base = resolveApiUrl('/api/v1/reviews', BACKEND_WITH_V1);
    assert.equal(
      urlFromV1Base,
      'https://brandsense-backend-1lq0.onrender.com/api/v1/reviews',
      'Must avoid duplicate /api/v1/api/v1/reviews when base URL contains /api/v1'
    );

    const localUrl = resolveApiUrl('/api/v1/reviews', LOCAL_BACKEND_V1);
    assert.equal(
      localUrl,
      'http://127.0.0.1:8000/api/v1/reviews',
      'Local dev URL must not duplicate /api/v1'
    );
  });

  await t.test('4. Trailing slashes in base URL are cleanly normalized without double slashes', () => {
    assert.equal(
      resolveApiUrl('/api/v1/reviews', 'https://brandsense-backend-1lq0.onrender.com/'),
      'https://brandsense-backend-1lq0.onrender.com/api/v1/reviews'
    );
    assert.equal(
      resolveApiUrl('/api/v1/reviews', 'https://brandsense-backend-1lq0.onrender.com/api/v1/'),
      'https://brandsense-backend-1lq0.onrender.com/api/v1/reviews'
    );
  });

  await t.test('5. Review submission endpoint maps to /api/v1/reviews/submit across all base configs', () => {
    assert.equal(
      resolveApiUrl('/api/v1/reviews/submit', DEPLOYED_BACKEND_BASE),
      'https://brandsense-backend-1lq0.onrender.com/api/v1/reviews/submit'
    );
    assert.equal(
      resolveApiUrl('/api/v1/reviews/submit', BACKEND_WITH_V1),
      'https://brandsense-backend-1lq0.onrender.com/api/v1/reviews/submit'
    );
    assert.equal(
      resolveApiUrl('/api/v1/reviews/submit', CLIENT_RELATIVE_V1),
      '/api/v1/reviews/submit'
    );
  });

  await t.test('6. Review detail retrieval and deletion map to /api/v1/reviews/:id', () => {
    const testId = 'REV-2026-F9B2';
    assert.equal(
      resolveApiUrl(`/api/v1/reviews/${testId}`, DEPLOYED_BACKEND_BASE),
      `https://brandsense-backend-1lq0.onrender.com/api/v1/reviews/${testId}`
    );
    assert.equal(
      resolveApiUrl(`/api/v1/reviews/${testId}`, BACKEND_WITH_V1),
      `https://brandsense-backend-1lq0.onrender.com/api/v1/reviews/${testId}`
    );
  });

  await t.test('7. Review revisions GET and POST map to /api/v1/reviews/:id/revisions', () => {
    const testId = 'REV-2026-F9B2';
    assert.equal(
      resolveApiUrl(`/api/v1/reviews/${testId}/revisions`, DEPLOYED_BACKEND_BASE),
      `https://brandsense-backend-1lq0.onrender.com/api/v1/reviews/${testId}/revisions`
    );
    assert.equal(
      resolveApiUrl(`/api/v1/reviews/${testId}/revisions`, BACKEND_WITH_V1),
      `https://brandsense-backend-1lq0.onrender.com/api/v1/reviews/${testId}/revisions`
    );
  });

  await t.test('8. Finding status PATCH maps to /api/v1/reviews/:id/findings/:findingId', () => {
    const testReviewId = 'REV-2026-F9B2';
    const testFindingId = 'find-promotional-warranty-01';
    assert.equal(
      resolveApiUrl(`/api/v1/reviews/${testReviewId}/findings/${testFindingId}`, DEPLOYED_BACKEND_BASE),
      `https://brandsense-backend-1lq0.onrender.com/api/v1/reviews/${testReviewId}/findings/${testFindingId}`
    );
  });

  await t.test('9. Rewrite POST maps to /api/v1/reviews/:id/rewrite', () => {
    const testReviewId = 'REV-2026-F9B2';
    assert.equal(
      resolveApiUrl(`/api/v1/reviews/${testReviewId}/rewrite`, DEPLOYED_BACKEND_BASE),
      `https://brandsense-backend-1lq0.onrender.com/api/v1/reviews/${testReviewId}/rewrite`
    );
  });

  await t.test('10. Document extraction POST maps to /api/v1/reviews/extract-document', () => {
    assert.equal(
      resolveApiUrl('/api/v1/reviews/extract-document', DEPLOYED_BACKEND_BASE),
      'https://brandsense-backend-1lq0.onrender.com/api/v1/reviews/extract-document'
    );
  });

  await t.test('11. Query parameter retention on review list endpoint (e.g. ?organization_id=org-123)', () => {
    const urlWithQuery = resolveApiUrl('/api/v1/reviews?organization_id=org-acme-prod', DEPLOYED_BACKEND_BASE);
    assert.equal(
      urlWithQuery,
      'https://brandsense-backend-1lq0.onrender.com/api/v1/reviews?organization_id=org-acme-prod'
    );
  });

  await t.test('12. Absolute external URLs are preserved untouched', () => {
    const externalUrl = 'https://supabase.co/storage/v1/object/public/test.pdf';
    assert.equal(resolveApiUrl(externalUrl, DEPLOYED_BACKEND_BASE), externalUrl);
  });
});
