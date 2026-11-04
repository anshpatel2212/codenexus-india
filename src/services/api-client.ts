import { ReviewItem, Finding, KnowledgeItem, ApprovalItem, SensaMessage } from '@/types';
import { sampleReviews, sampleKnowledgeBase, sampleApprovals } from '@/data/mock-data';
import { sampleFindings } from '@/data/mock-findings';

// CONFIGURATION: Set to true when FastAPI backend is connected
export const USE_MOCK_API = true;
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

/**
 * BrandSense Unified API Service Client
 * Prepared for future FastAPI backend endpoints:
 * - POST /api/v1/reviews/submit
 * - GET  /api/v1/reviews/{id}
 * - GET  /api/v1/reviews
 * - POST /api/v1/reviews/{id}/rewrite
 * - GET  /api/v1/knowledge-base
 * - POST /api/v1/knowledge-base/upload
 * - GET  /api/v1/approvals
 * - POST /api/v1/approvals/{id}/decision
 * - POST /api/v1/sensa/chat
 */
class BrandSenseApiClient {
  private getStorageKey(key: string): string {
    return `brandsense_${key}`;
  }

  // --- Reviews ---
  async getReviews(): Promise<ReviewItem[]> {
    if (USE_MOCK_API) {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(this.getStorageKey('reviews'));
        if (stored) return JSON.parse(stored);
      }
      return sampleReviews;
    }
    const res = await fetch(`${API_BASE_URL}/reviews`);
    return res.json();
  }

  async getReviewById(id: string): Promise<ReviewItem | undefined> {
    const reviews = await this.getReviews();
    return reviews.find(r => r.id === id) || reviews[0];
  }

  async submitReview(data: {
    title: string;
    contentType: string;
    brandProfile: string;
    content: string;
    instructions?: string;
  }): Promise<ReviewItem> {
    if (USE_MOCK_API) {
      // Simulate review creation with findings
      const newReview: ReviewItem = {
        id: `REV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        title: data.title || 'Untitled Brand Review',
        contentType: data.contentType as any || 'Social Media',
        brandProfile: data.brandProfile || 'Corporate Core',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: {
          name: 'Elena Rostova',
          email: 'elena.rostova@acmebrand.com',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          role: 'Manager',
        },
        overallScore: Math.floor(75 + Math.random() * 15),
        status: 'Changes Requested',
        originalContent: data.content,
        suggestedContent: data.content
          .replace(/guarantees 100%/gi, 'is engineered to optimize')
          .replace(/disruptive/gi, 'streamlined')
          .replace(/miracle/gi, 'reliable enterprise-grade'),
        categoryScores: {
          'Tone and Voice': 80,
          'Terminology': 85,
          'Facts and Claims': 72,
          'Promotional Claims': 68,
          'Visual Consistency': 95,
          'Accessibility': 90,
        },
        findings: sampleFindings.slice(0, 4),
        revisionCount: 1,
      };

      if (typeof window !== 'undefined') {
        const current = await this.getReviews();
        localStorage.setItem(this.getStorageKey('reviews'), JSON.stringify([newReview, ...current]));
      }

      return newReview;
    }

    const res = await fetch(`${API_BASE_URL}/reviews/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  }

  // --- Knowledge Base ---
  async getKnowledgeBase(): Promise<KnowledgeItem[]> {
    if (USE_MOCK_API) {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(this.getStorageKey('kb'));
        if (stored) return JSON.parse(stored);
      }
      return sampleKnowledgeBase;
    }
    const res = await fetch(`${API_BASE_URL}/knowledge-base`);
    return res.json();
  }

  async addKnowledgeItem(item: Omit<KnowledgeItem, 'id' | 'lastUpdated' | 'updatedBy'>): Promise<KnowledgeItem> {
    const newItem: KnowledgeItem = {
      ...item,
      id: `kb-${Date.now()}`,
      lastUpdated: 'Just now',
      updatedBy: 'Elena Rostova',
    };

    if (USE_MOCK_API) {
      if (typeof window !== 'undefined') {
        const current = await this.getKnowledgeBase();
        const updated = [newItem, ...current];
        localStorage.setItem(this.getStorageKey('kb'), JSON.stringify(updated));
      }
      return newItem;
    }

    const res = await fetch(`${API_BASE_URL}/knowledge-base`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem),
    });
    return res.json();
  }

  // --- Approvals ---
  async getApprovals(): Promise<ApprovalItem[]> {
    if (USE_MOCK_API) {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(this.getStorageKey('approvals'));
        if (stored) return JSON.parse(stored);
      }
      return sampleApprovals;
    }
    const res = await fetch(`${API_BASE_URL}/approvals`);
    return res.json();
  }

  async updateApprovalStatus(id: string, status: 'Approved' | 'Rejected' | 'Needs Revision'): Promise<void> {
    if (USE_MOCK_API) {
      if (typeof window !== 'undefined') {
        const current = await this.getApprovals();
        const updated = current.map(item => item.id === id ? { ...item, status } : item);
        localStorage.setItem(this.getStorageKey('approvals'), JSON.stringify(updated));
      }
      return;
    }
    await fetch(`${API_BASE_URL}/approvals/${id}/decision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
  }

  // --- SENSA Assistant Chat ---
  async querySensa(prompt: string, context?: any): Promise<SensaMessage> {
    if (USE_MOCK_API) {
      // Return contextual smart mock response
      return {
        id: `sensa-res-${Date.now()}`,
        sender: 'sensa',
        timestamp: 'Just now',
        content: `I checked that against your active brand guidance and approved facts.

**What matters here:** absolute promises and unverified numbers usually need to be softened or supported with evidence. Your voice standard favours clear, credible language over hyperbole.

I've prepared a safer version below, along with the source guidance I used.`,
        confidence: 96,
        requiresHumanReview: true,
        citations: [
          {
            title: 'Global Legal & Regulatory Guardrails 2026.pdf',
            document: 'Guardrails v4',
            section: 'Section 4.2 — Prohibited Performance Warranties',
            confidence: 98,
          }
        ],
        suggestedFix: '“Designed to significantly reduce non-compliance risks and accelerate editorial reviews.”',
      };
    }

    const res = await fetch(`${API_BASE_URL}/sensa/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, context }),
    });
    return res.json();
  }
}

export const apiClient = new BrandSenseApiClient();

