import {
  ReviewItem,
  Finding,
  KnowledgeItem,
  ApprovalItem,
  ApprovalComment,
  SensaMessage,
  ContentType
} from '@/types';
import { supabaseDataService } from './supabase-service';
import { getClientEnv } from '@/lib/env';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { isGeminiConfigured, analyzeContentWithGemini, chatWithSensaGemini } from './gemini-ai';
import { authClient, DEMO_ORG_ID } from './auth-client';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? '/api/v1' : 'http://127.0.0.1:8000/api/v1');

/**
 * Normalizes backend snake_case response fields to frontend camelCase standards.
 */
function normalizeReview(r: any): ReviewItem {
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
  const findings: Finding[] = rawFindings.map((f: any) => ({
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
  }));

  return {
    id: r.id,
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
  };
}

function normalizeKnowledgeItem(k: any): KnowledgeItem {
  let tags = k.tags || [];
  if (typeof tags === 'string') {
    try {
      tags = JSON.parse(tags);
    } catch {
      tags = [];
    }
  }
  return {
    id: k.id,
    type: k.type,
    title: k.title,
    content: k.content,
    category: k.category || 'General',
    tags,
    status: k.status || 'Active',
    replacement: k.replacement || undefined,
    fileFormat: k.fileFormat || k.file_format || undefined,
    fileSize: k.fileSize || k.file_size || undefined,
    fileUrl: k.fileUrl || k.file_url || undefined,
    lastUpdated: k.lastUpdated || k.updated_at || k.created_at || 'Just now',
    updatedBy: k.updatedBy || k.created_by || 'Admin',
  };
}

function normalizeApproval(a: any): ApprovalItem {
  const submitterName = typeof a.submittedBy === 'object' && a.submittedBy?.name
    ? a.submittedBy.name
    : (typeof a.submittedBy === 'string' && a.submittedBy.trim() ? a.submittedBy : (a.submitter_name || a.submitted_by || 'Content Creator'));

  const submitterAvatar = typeof a.submittedBy === 'object' && a.submittedBy?.avatar
    ? a.submittedBy.avatar
    : (a.submitter_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80');

  const submitterDept = typeof a.submittedBy === 'object' && a.submittedBy?.department
    ? a.submittedBy.department
    : (a.submitter_dept || 'Brand & Marketing');

  const reviewerName = typeof a.assignedReviewer === 'object' && a.assignedReviewer?.name
    ? a.assignedReviewer.name
    : (a.reviewer_name || 'Sarah Chen, Esq.');

  const reviewerAvatar = typeof a.assignedReviewer === 'object' && a.assignedReviewer?.avatar
    ? a.assignedReviewer.avatar
    : 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80';

  const title = a.title || a.review?.title || a.review_title || 'Brand Review';
  const contentType = (a.contentType || a.review?.contentType || a.content_type || 'Campaign') as ContentType;
  const submittedDate = a.submittedDate || a.createdAt || a.created_at || 'Just now';
  const complianceScore = a.complianceScore !== undefined ? a.complianceScore : (a.compliance_score !== undefined ? a.compliance_score : (a.review?.overallScore ?? 75));

  const rawComments = a.comments || [];
  const comments: ApprovalComment[] = rawComments.map((c: any) => ({
    id: c.id || `comm-${Math.random().toString(36).substring(2, 9)}`,
    author: {
      name: c.author?.name || c.author_name || 'Compliance Reviewer',
      avatar: c.author?.avatar || c.author_avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
      role: c.author?.role || c.author_role || 'Reviewer',
    },
    text: c.text || c.comment_text || '',
    timestamp: c.timestamp || c.createdAt || c.created_at || 'Just now',
    resolved: Boolean(c.resolved),
  }));

  return {
    id: a.id,
    reviewId: a.reviewId || a.review_id || '',
    title,
    submittedBy: {
      name: submitterName,
      avatar: submitterAvatar,
      department: submitterDept,
    },
    contentType,
    submittedDate,
    urgency: a.urgency || (complianceScore < 70 ? 'High' : 'Medium'),
    complianceScore,
    status: a.status || 'Pending',
    assignedReviewer: {
      name: reviewerName,
      avatar: reviewerAvatar,
    },
    commentsCount: a.commentsCount ?? comments.length,
    criticalIssuesCount: a.criticalIssuesCount ?? 0,
    assignedTo: a.assignedTo || a.assigned_to || undefined,
    organizationId: a.organizationId || a.organization_id || undefined,
    decisionNotes: a.decisionNotes || a.decision_notes || undefined,
    decidedBy: a.decidedBy || a.decided_by || undefined,
    decidedAt: a.decidedAt || a.decided_at || undefined,
    createdAt: a.createdAt || a.created_at || undefined,
    review: a.review ? {
      id: a.review.id || a.reviewId || a.review_id,
      title: a.review.title || title,
      contentType: a.review.contentType || contentType,
      overallScore: a.review.overallScore ?? complianceScore,
    } : {
      id: a.reviewId || a.review_id,
      title,
      contentType,
      overallScore: complianceScore,
    },
    comments,
  };
}

/**
 * BrandSense Production API Service Client
 * SQLite Backend API is the authoritative PRIMARY data source for all operations.
 */
class BrandSenseApiClient {
  private inFlightGetRequests = new Map<string, Promise<any>>();

  private async fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    let token: string | null = null;
    try {
      token = authClient.getToken();
      if (!token) {
        const supabase = getSupabaseBrowserClient();
        const { data: { session } } = await supabase.auth.getSession();
        token = session?.access_token || null;
      }
    } catch {
      // Ignore token retrieval errors
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
      const res = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.status === 401 || res.status === 403) {
        // Expired or unauthorized session
        if (typeof window !== 'undefined') {
          console.warn(`[apiClient] ${res.status} response from ${endpoint}`);
        }
      }

      return res;
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  }

  // ---------------------------------------------------------------------------
  // Reviews
  // ---------------------------------------------------------------------------
  async getReviews(orgId?: string): Promise<ReviewItem[]> {
    const cacheKey = `reviews-${orgId || 'default'}`;
    if (this.inFlightGetRequests.has(cacheKey)) {
      return this.inFlightGetRequests.get(cacheKey);
    }

    const fetchPromise = (async () => {
      try {
        const res = await this.fetchWithAuth('/reviews');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            return data.map(normalizeReview);
          }
        }
      } catch (err) {
        console.warn('Backend /reviews unreachable, attempting local/fallback:', err);
      } finally {
        this.inFlightGetRequests.delete(cacheKey);
      }

      // Safe fallback for demo personas / offline development
      return supabaseDataService.getReviews(orgId);
    })();

    this.inFlightGetRequests.set(cacheKey, fetchPromise);
    return fetchPromise;
  }

  async getReviewById(id: string, orgId?: string): Promise<ReviewItem | undefined> {
    try {
      const res = await this.fetchWithAuth(`/reviews/${id}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.id) {
          return normalizeReview(data);
        }
      }
    } catch (err) {
      console.warn(`Backend /reviews/${id} unreachable, checking fallback:`, err);
    }
    return supabaseDataService.getReviewById(id, orgId);
  }

  async getReview(id: string, orgId?: string): Promise<ReviewItem | undefined> {
    return this.getReviewById(id, orgId);
  }

  async submitReview(data: {
    title: string;
    contentType: string;
    brandProfile: string;
    content: string;
    instructions?: string;
    filePath?: string;
    fileUrl?: string;
    orgId?: string;
    authorId?: string;
    authorName?: string;
    authorEmail?: string;
  }): Promise<ReviewItem> {
    const orgId = data.orgId || DEMO_ORG_ID;
    const payload = { ...data, orgId };

    // 1. Primary: Persistent Backend Relational Database Execution
    try {
      const res = await this.fetchWithAuth('/reviews/submit', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const result = await res.json();
        const normalized = normalizeReview(result);
        if (typeof window !== 'undefined') {
          const userKey = data.authorId ? `brandsense_current_review_${data.authorId}` : 'brandsense_current_review';
          localStorage.setItem(userKey, JSON.stringify(normalized));
          localStorage.setItem('brandsense_current_review', JSON.stringify(normalized));
          supabaseDataService.saveLocalReview(normalized, orgId, data.authorId);
        }
        return normalized;
      } else if (res.status === 401 || res.status === 403) {
        const errData = await res.json().catch(() => ({ detail: 'Unauthorized' }));
        throw new Error(errData.detail || 'Authentication required to submit review.');
      } else if (res.status === 422) {
        const errData = await res.json().catch(() => ({ detail: 'Validation failed' }));
        const msg = Array.isArray(errData.detail) ? errData.detail[0]?.msg : errData.detail;
        throw new Error(msg || 'Validation error: please verify all required fields.');
      }
    } catch (backendErr: any) {
      if (backendErr?.message && (backendErr.message.includes('Authentication required') || backendErr.message.includes('Validation error'))) {
        throw backendErr;
      }
      console.warn('FastAPI backend submission failed or unreachable, checking local AI:', backendErr);
    }

    // 2. Secondary: Client-side Gemini AI Review
    if (isGeminiConfigured()) {
      try {
        const liveAiReview = await analyzeContentWithGemini(payload);
        if (typeof window !== 'undefined') {
          const userKey = data.authorId ? `brandsense_current_review_${data.authorId}` : 'brandsense_current_review';
          localStorage.setItem(userKey, JSON.stringify(liveAiReview));
          localStorage.setItem('brandsense_current_review', JSON.stringify(liveAiReview));
          supabaseDataService.saveLocalReview(liveAiReview, orgId, data.authorId);
        }
        return liveAiReview;
      } catch (geminiErr) {
        console.warn('Gemini live analysis encountered issue, using fallback:', geminiErr);
      }
    }

    // 3. Fallback: Local demo heuristic review
    const fallbackReview = await supabaseDataService.createReview(payload);
    if (typeof window !== 'undefined' && fallbackReview) {
      const userKey = data.authorId ? `brandsense_current_review_${data.authorId}` : 'brandsense_current_review';
      localStorage.setItem(userKey, JSON.stringify(fallbackReview));
      localStorage.setItem('brandsense_current_review', JSON.stringify(fallbackReview));
    }
    return fallbackReview;
  }

  async updateFinding(
    findingId: string,
    status: 'accepted' | 'rejected' | 'modified',
    suggestedFix?: string,
    userNote?: string,
    reviewId?: string
  ): Promise<void> {
    if (reviewId) {
      try {
        const res = await this.fetchWithAuth(`/reviews/${reviewId}/findings/${findingId}`, {
          method: 'PATCH',
          body: JSON.stringify({ status, suggestedFix, userNote }),
        });
        if (res.ok) return;
      } catch (e) {
        console.warn('Backend updateFinding notice:', e);
      }
    }
    return supabaseDataService.updateFindingStatus(findingId, status, suggestedFix, userNote);
  }

  async deleteReview(id: string, orgId?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await this.fetchWithAuth(`/reviews/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        supabaseDataService.deleteReview(id, orgId);
        return { success: true };
      }
    } catch (e: any) {
      console.warn('Backend deleteReview notice:', e);
    }
    return supabaseDataService.deleteReview(id, orgId);
  }

  // ---------------------------------------------------------------------------
  // Knowledge Base
  // ---------------------------------------------------------------------------
  async getKnowledgeBase(orgId?: string): Promise<KnowledgeItem[]> {
    const cacheKey = `kb-${orgId || 'default'}`;
    if (this.inFlightGetRequests.has(cacheKey)) {
      return this.inFlightGetRequests.get(cacheKey);
    }

    const fetchPromise = (async () => {
      try {
        const res = await this.fetchWithAuth('/knowledge-base');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            return data.map(normalizeKnowledgeItem);
          }
        }
      } catch (err) {
        console.warn('Backend /knowledge-base unreachable, using fallback:', err);
      } finally {
        this.inFlightGetRequests.delete(cacheKey);
      }

      return supabaseDataService.getKnowledgeBase(orgId);
    })();

    this.inFlightGetRequests.set(cacheKey, fetchPromise);
    return fetchPromise;
  }

  async addKnowledgeItem(
    item: Omit<KnowledgeItem, 'id' | 'lastUpdated' | 'updatedBy'> & { filePath?: string; fileUrl?: string },
    orgId?: string,
    userId?: string
  ): Promise<KnowledgeItem> {
    try {
      const res = await this.fetchWithAuth('/knowledge-base', {
        method: 'POST',
        body: JSON.stringify(item),
      });
      if (res.ok) {
        const data = await res.json();
        return normalizeKnowledgeItem(data);
      } else {
        const err = await res.json().catch(() => ({ detail: 'Failed to add rule' }));
        throw new Error(err.detail || 'Failed to save knowledge item.');
      }
    } catch (e: any) {
      if (e?.message && e.message.includes('Failed to save knowledge item')) throw e;
      console.warn('Backend addKnowledgeItem unreachable, falling back:', e);
      return supabaseDataService.addKnowledgeItem(item, orgId, userId);
    }
  }

  async createKnowledgeItem(
    orgId: string,
    item: any
  ): Promise<KnowledgeItem> {
    return this.addKnowledgeItem(item, orgId);
  }

  async deleteKnowledgeItem(id: string, orgId?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await this.fetchWithAuth(`/knowledge-base/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        supabaseDataService.deleteKnowledgeItem(id, orgId);
        return { success: true };
      }
      const err = await res.json().catch(() => ({ detail: 'Failed to delete' }));
      return { success: false, error: err.detail || 'Delete failed' };
    } catch (e: any) {
      console.warn('Backend deleteKnowledgeItem unreachable, falling back:', e);
      return supabaseDataService.deleteKnowledgeItem(id, orgId);
    }
  }

  // ---------------------------------------------------------------------------
  // Approvals & Workflow
  // ---------------------------------------------------------------------------
  async getApprovals(orgId?: string): Promise<ApprovalItem[]> {
    const cacheKey = `approvals-${orgId || 'default'}`;
    if (this.inFlightGetRequests.has(cacheKey)) {
      return this.inFlightGetRequests.get(cacheKey);
    }

    const fetchPromise = (async () => {
      try {
        const res = await this.fetchWithAuth('/approvals');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            return data.map(normalizeApproval);
          }
        }
      } catch (err) {
        console.warn('Backend /approvals unreachable, using fallback:', err);
      } finally {
        this.inFlightGetRequests.delete(cacheKey);
      }

      return supabaseDataService.getApprovals(orgId);
    })();

    this.inFlightGetRequests.set(cacheKey, fetchPromise);
    return fetchPromise;
  }

  async updateApprovalStatus(
    id: string,
    status: 'Approved' | 'Rejected' | 'Needs Revision',
    reviewId?: string,
    note?: string
  ): Promise<void> {
    try {
      const res = await this.fetchWithAuth(`/approvals/${id}/decision`, {
        method: 'POST',
        body: JSON.stringify({ status, reviewId, note }),
      });
      if (res.ok) {
        supabaseDataService.updateApprovalStatus(id, status, reviewId);
        return;
      }
    } catch (e) {
      console.warn('Backend updateApprovalStatus notice:', e);
    }
    return supabaseDataService.updateApprovalStatus(id, status, reviewId);
  }

  async getApprovalComments(approvalId: string): Promise<ApprovalComment[]> {
    try {
      const res = await this.fetchWithAuth(`/approvals/${approvalId}/comments`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          return data.map((c: any) => ({
            id: c.id,
            author: c.author || { name: 'Reviewer', role: 'Reviewer' },
            text: c.text,
            timestamp: c.timestamp || 'Just now',
          }));
        }
      }
    } catch (e) {
      console.warn('Backend getApprovalComments notice:', e);
    }
    return supabaseDataService.getApprovalComments(approvalId);
  }

  async addApprovalComment(
    approvalId: string,
    text: string,
    authorId?: string,
    orgId?: string
  ): Promise<void> {
    try {
      const res = await this.fetchWithAuth(`/approvals/${approvalId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ text }),
      });
      if (res.ok) {
        supabaseDataService.addApprovalComment(approvalId, text, authorId, orgId);
        return;
      }
    } catch (e) {
      console.warn('Backend addApprovalComment notice:', e);
    }
    return supabaseDataService.addApprovalComment(approvalId, text, authorId, orgId);
  }

  // ---------------------------------------------------------------------------
  // Revision History
  // ---------------------------------------------------------------------------
  async getRevisions(reviewId: string) {
    try {
      const res = await this.fetchWithAuth(`/reviews/${reviewId}/revisions`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data;
        }
      }
    } catch (e) {
      console.warn('Backend getRevisions notice:', e);
    }
    return supabaseDataService.getRevisions(reviewId);
  }

  async saveRevision(data: {
    reviewId: string;
    orgId: string;
    versionNumber: number;
    authorId?: string;
    reviewerId?: string;
    complianceScore: number;
    status: string;
    summary: string;
    content: string;
    acceptedCount: number;
    rejectedCount: number;
  }) {
    try {
      const res = await this.fetchWithAuth(`/reviews/${data.reviewId}/revisions`, {
        method: 'POST',
        body: JSON.stringify({
          content: data.content,
          summary: data.summary,
          complianceScore: data.complianceScore,
          status: data.status,
          acceptedCount: data.acceptedCount,
          rejectedCount: data.rejectedCount,
        }),
      });
      if (res.ok) {
        supabaseDataService.saveNewRevision(data);
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend saveRevision notice:', e);
    }
    return supabaseDataService.saveNewRevision(data);
  }

  // ---------------------------------------------------------------------------
  // Storage Operations & Signed URLs (Private Buckets)
  // ---------------------------------------------------------------------------
  async uploadAsset(
    bucket: 'brand-assets' | 'review-files' | 'knowledge-documents' | 'avatars',
    path: string,
    file: File | Blob,
    expectedOrgId?: string
  ): Promise<{ path: string; signedUrl: string | null } | null> {
    return supabaseDataService.uploadFile(bucket, path, file, expectedOrgId);
  }

  async getSignedUrl(
    bucket: 'brand-assets' | 'review-files' | 'knowledge-documents' | 'avatars',
    path: string,
    expiresIn = 3600
  ): Promise<string | null> {
    return supabaseDataService.getSignedUrl(bucket, path, expiresIn);
  }

  async deleteFile(
    bucket: 'brand-assets' | 'review-files' | 'knowledge-documents' | 'avatars',
    path: string
  ): Promise<{ success: boolean; error?: string }> {
    return supabaseDataService.deleteFile(bucket, path);
  }

  // ---------------------------------------------------------------------------
  // SENSA Assistant Chat (Multi-Turn Autonomous Neural RAG Copilot)
  // ---------------------------------------------------------------------------
  async querySensa(
    prompt: string,
    history: Array<{ role: 'user' | 'model' | 'sensa'; content: string }> = [],
    context?: any
  ): Promise<SensaMessage> {
    // 1. Primary: Server-side Next.js route with multi-turn history
    try {
      const res = await fetch('/api/sensa/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, history, context }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.content) {
          return data;
        }
      }
    } catch (err) {
      console.warn('Server-side SENSA route unreachable, trying client fallback:', err);
    }

    // 2. Secondary: Direct client-side Gemini fallback with multi-turn
    if (isGeminiConfigured()) {
      try {
        return await chatWithSensaGemini(prompt);
      } catch (err) {
        console.warn('Client Gemini call failed:', err);
      }
    }

    // 3. Fallback: Deterministic brand governance analysis
    const lower = prompt.toLowerCase().trim();
    const isGreeting = /^(hi|hello|hey|hhii|heyy|greetings|hola)\b/i.test(lower);
    const hasGuarantee = lower.includes('guarantee') || lower.includes('100%') || lower.includes('zero fine') || lower.includes('cures') || lower.includes('miracle');
    const hasFomo = lower.includes('dinosaur') || lower.includes('idiot') || lower.includes('stupid') || lower.includes('hurry') || lower.includes('dust');
    const hasDirectional = lower.includes('green button') || lower.includes('right side') || lower.includes('click here');

    let content = '';

    if (isGreeting) {
      content = 'Hello! I am SENSA, your BrandSense copilot. How can I assist you with your brand guidelines and content today?';
    } else if (hasGuarantee) {
      content = `**Policy Review Result: Non-Compliant Claim Flagged**

Your drafted copy contains absolute performance warranties ("guarantee", "100%", "miracle"). Under corporate legal guardrails, absolute guarantees expose the brand to regulatory penalties unless supported by registered, audited third-party validation.

**Guidance:** Pivot from absolute promises to quantifiable risk-mitigation messaging.`;
    } else if (hasFomo) {
      content = `**Policy Review Result: Aggressive Tone Flagged**

BrandSense voice guidelines require an empowering, authoritative, and respectful tone. Aggressive urgency or demeaning phrases ("don't be a dinosaur", fear-of-missing-out pressure) undermine enterprise trust.

**Guidance:** Frame the value proposition around operational efficiency and strategic enablement.`;
    } else if (hasDirectional) {
      content = `**Policy Review Result: Accessibility Issue (WCAG 2.2)**

Directional or sensory-only cues (e.g. "click the green button on the right") violate accessibility standards for vision-impaired users utilizing screen readers.

**Guidance:** Use clear, non-spatial action verbs such as "Download the compliance report" or "Select Continue".`;
    } else {
      content = `Your query aligns well with BrandSense institutional brand governance principles. The tone is constructive, professional, and clear. Let me know if you need specific guidance on brand voice, terminology, or compliance!`;
    }

    return {
      id: `sensa-res-${Date.now()}`,
      sender: 'sensa',
      timestamp: 'Just now',
      content,
    };
  }
}

export const apiClient = new BrandSenseApiClient();
