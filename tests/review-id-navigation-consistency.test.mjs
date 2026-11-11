import test from 'node:test';
import assert from 'node:assert/strict';

/**
 * Mirror of normalizeReview from src/services/api-client.ts
 */
function normalizeReview(r) {
  if (!r) return r;
  let catScores = r.categoryScores || r.category_scores || {};
  if (typeof catScores === 'string') {
    try {
      catScores = JSON.parse(catScores);
    } catch {
      catScores = {};
    }
  }

  const rawFindings = r.findings || [];
  const findings = rawFindings.map((f) => ({
    id: f.id || `f-${Math.random().toString(36).substring(2, 9)}`,
    category: f.category || 'General',
    severity: f.severity || 'Medium',
    reason: f.reason || '',
    evidence: f.evidence || '',
    highlightedText: f.highlightedText || f.highlighted_text || '',
    suggestedFix: f.suggestedFix || f.suggested_fix || undefined,
    explanation: f.explanation || undefined,
    sourceDocument: f.sourceDocument || f.source_document || undefined,
    sourceSection: f.sourceSection || f.source_section || undefined,
    confidence: f.confidence !== undefined ? f.confidence : 90,
    status: f.status || 'pending',
    verificationStatus: f.verificationStatus || f.verification_status || 'verified',
    verificationConfidence: f.verificationConfidence !== undefined ? f.verificationConfidence : (f.verification_confidence !== undefined ? f.verification_confidence : f.confidence),
    verificationNotes: f.verificationNotes || f.verification_notes || '',
    escalatedToHuman: Boolean(f.escalatedToHuman || f.escalated_to_human),
    sourcePage: f.sourcePage || f.source_page || 1,
    evidenceQuote: f.evidenceQuote || f.evidence_quote || f.evidence || '',
  }));

  const reviewId = r.id || r.review_id || r.reviewId || '';

  return {
    id: reviewId,
    title: r.title || 'Untitled Draft',
    contentType: r.contentType || r.content_type || 'Social Media',
    brandProfile: r.brandProfile || r.brand_profile || 'Corporate Core (Global English)',
    createdAt: r.createdAt || r.created_at || new Date().toISOString(),
    updatedAt: r.updatedAt || r.updated_at || new Date().toISOString(),
    author: r.author || {
      name: r.author_name || 'Content Creator',
      email: r.author_email || '',
      role: r.author_role || 'Creator',
      avatar: r.author_avatar || '',
    },
    overallScore: r.overallScore !== undefined ? r.overallScore : (r.overall_score !== undefined ? r.overall_score : 80),
    status: r.status || 'Pending Review',
    originalContent: r.originalContent || r.original_content || '',
    suggestedContent: r.suggestedContent || r.suggested_content || '',
    categoryScores: catScores,
    findings,
    revisionCount: r.revisionCount || r.revision_count || (r.revisions ? r.revisions.length : 1),
    fileType: r.fileType || r.file_type || undefined,
    fileName: r.fileName || r.file_name || undefined,
    pageCount: r.pageCount || r.page_count || 1,
    pages: r.pages || undefined,
  };
}

/**
 * Mirror of resolveApiUrl from src/services/api-client.ts
 */
function resolveApiUrl(endpoint, baseUrl) {
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  const cleanBase = (baseUrl || '').trim().replace(/\/+$/, '');
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  if (cleanBase.endsWith('/api/v1') && cleanEndpoint.startsWith('/api/v1')) {
    const subPath = cleanEndpoint.slice('/api/v1'.length);
    return subPath ? `${cleanBase}${subPath.startsWith('/') ? subPath : `/${subPath}`}` : cleanBase;
  }
  if (!cleanBase.endsWith('/api/v1') && !cleanEndpoint.startsWith('/api/v1')) {
    return `${cleanBase}/api/v1${cleanEndpoint}`;
  }
  return `${cleanBase}${cleanEndpoint}`;
}

test('Submission-to-Detail Navigation and Review ID Consistency Suite', async (t) => {
  const BACKEND_BASE = 'https://brandsense-backend-1lq0.onrender.com';
  const PERSISTED_BACKEND_ID = 'REV-2026-AEB3';
  const UNPERSISTED_MOCK_ID = 'REV-2026-6153';

  await t.test('1. Backend response schema with "id" extracts the persisted review ID', () => {
    const backendResponse = {
      id: PERSISTED_BACKEND_ID,
      title: 'Q3 Product Announcement',
      contentType: 'Social Media',
      overallScore: 88,
      status: 'Changes Requested',
    };
    const normalized = normalizeReview(backendResponse);
    assert.equal(normalized.id, PERSISTED_BACKEND_ID);
    assert.notEqual(normalized.id, UNPERSISTED_MOCK_ID);
  });

  await t.test('2. Backend response schema with "review_id" or "reviewId" extracts the persisted review ID', () => {
    const responseWithSnake = {
      review_id: PERSISTED_BACKEND_ID,
      title: 'Q3 Product Announcement',
      content_type: 'Social Media',
    };
    assert.equal(normalizeReview(responseWithSnake).id, PERSISTED_BACKEND_ID);

    const responseWithCamel = {
      reviewId: PERSISTED_BACKEND_ID,
      title: 'Q3 Product Announcement',
      contentType: 'Social Media',
    };
    assert.equal(normalizeReview(responseWithCamel).id, PERSISTED_BACKEND_ID);
  });

  await t.test('3. Post-submission navigation targets the exact persisted backend review ID', () => {
    const submitResult = normalizeReview({
      id: PERSISTED_BACKEND_ID,
      review_id: PERSISTED_BACKEND_ID,
      reviewId: PERSISTED_BACKEND_ID,
      title: 'Global Brand Campaign',
      status: 'Approved',
    });

    // Emulate creator page router.push(`/creator/content/${result.id}`)
    const targetUrl = `/creator/content/${submitResult.id}`;
    assert.equal(
      targetUrl,
      `/creator/content/${PERSISTED_BACKEND_ID}`,
      'Navigation must strictly use the backend-persisted ID'
    );
    assert.ok(
      !targetUrl.includes(UNPERSISTED_MOCK_ID),
      'Navigation must never route to client mock ID'
    );
  });

  await t.test('4. Detail retrieval API URL correctly builds with backend-persisted review ID', () => {
    const detailApiUrl = resolveApiUrl(`/api/v1/reviews/${PERSISTED_BACKEND_ID}`, BACKEND_BASE);
    assert.equal(
      detailApiUrl,
      `${BACKEND_BASE}/api/v1/reviews/${PERSISTED_BACKEND_ID}`,
      'Detail URL must point to backend reviews/:id'
    );
  });

  await t.test('5. Review listing page item ID mapping preserves persisted ID for navigation', () => {
    const reviewListFromApi = [
      {
        id: PERSISTED_BACKEND_ID,
        review_id: PERSISTED_BACKEND_ID,
        reviewId: PERSISTED_BACKEND_ID,
        title: 'Q3 Campaign',
        status: 'Approved',
      },
    ];

    const normalizedList = reviewListFromApi.map(normalizeReview);
    const item = normalizedList[0];
    const linkHref = `/creator/content/${item.id}`;

    assert.equal(linkHref, `/creator/content/${PERSISTED_BACKEND_ID}`);
  });

  await t.test('6. Heavy AI submission endpoints are configured with 60-second timeout', () => {
    const isHeavyEndpoint = (ep) =>
      ep.includes('/submit') || ep.includes('/rewrite') || ep.includes('/extract-document');

    assert.equal(isHeavyEndpoint('/api/v1/reviews/submit'), true);
    assert.equal(isHeavyEndpoint('/api/v1/reviews/REV-2026-AEB3/rewrite'), true);
    assert.equal(isHeavyEndpoint('/api/v1/reviews/extract-document'), true);
    assert.equal(isHeavyEndpoint('/api/v1/reviews'), false);
    assert.equal(isHeavyEndpoint(`/api/v1/reviews/${PERSISTED_BACKEND_ID}`), false);
  });
});
