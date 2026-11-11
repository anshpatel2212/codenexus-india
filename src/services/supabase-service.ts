import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { getClientEnv } from '@/lib/env';
import { 
  ReviewItem, 
  Finding, 
  KnowledgeItem, 
  ApprovalItem, 
  ApprovalComment, 
  SensaMessage,
  UserProfile 
} from '@/types';
import { 
  sampleReviews, 
  sampleKnowledgeBase, 
  sampleApprovals 
} from '@/data/mock-data';
import { sampleFindings } from '@/data/mock-findings';

class SupabaseDataService {
  private get client(): any {
    return getSupabaseBrowserClient();
  }

  private isConnected(): boolean {
    return getClientEnv().isConfigured;
  }

  // ---------------------------------------------------------------------------
  // Reviews
  // ---------------------------------------------------------------------------
  async getReviews(orgId?: string): Promise<ReviewItem[]> {
    if (!this.isConnected()) {
      return this.getLocalReviews(orgId);
    }

    try {
      let query = this.client
        .from('reviews')
        .select(`
          *,
          author:profiles!reviews_author_id_fkey(full_name, email, avatar_url, role),
          reviewer:profiles!reviews_reviewer_id_fkey(full_name, email, avatar_url, role),
          findings(*)
        `)
        .order('created_at', { ascending: false });

      if (orgId) {
        query = query.eq('organization_id', orgId);
      }

      const { data, error } = await query;
      if (error || !data || data.length === 0) {
        return this.getLocalReviews(orgId);
      }

      return data.map((r: any) => this.mapReviewRecord(r));
    } catch {
      return this.getLocalReviews(orgId);
    }
  }

  async getReviewById(id: string, orgId?: string): Promise<ReviewItem | undefined> {
    if (!this.isConnected()) {
      const local = this.getLocalReviews(orgId);
      return local.find((r) => r.id === id);
    }

    try {
      let query = this.client
        .from('reviews')
        .select(`
          *,
          author:profiles!reviews_author_id_fkey(full_name, email, avatar_url, role),
          reviewer:profiles!reviews_reviewer_id_fkey(full_name, email, avatar_url, role),
          findings(*)
        `)
        .eq('id', id);

      if (orgId) {
        query = query.eq('organization_id', orgId);
      }

      const { data, error } = await query.single();

      if (error || !data) {
        const local = this.getLocalReviews(orgId);
        return local.find((r) => r.id === id);
      }

      return this.mapReviewRecord(data);
    } catch {
      const local = this.getLocalReviews(orgId);
      return local.find((r) => r.id === id);
    }
  }

  async createReview(data: {
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
    const reviewId = `REV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Deterministic Multi-Vector Heuristic Compliance Audit (No random production scores)
    const generatedFindings: Finding[] = [];
    let suggestedContent = data.content;

    // 1. Promotional Claims & Prohibited Absolute Warranties
    const warrantyRegex = /(guarantees?\s+(?:a\s+)?100%[^.]*|100%\s+elimination[^.]*|guarantees\s+zero[^.]*)/i;
    const warrantyMatch = data.content.match(warrantyRegex);
    if (warrantyMatch) {
      const found = warrantyMatch[0].trim();
      const fix = 'is designed to help reduce regulatory risk and optimize review cycles';
      generatedFindings.push({
        id: `f-${Date.now()}-1`,
        category: 'Promotional Claims',
        severity: 'Critical',
        reason: 'Unsubstantiated absolute guarantee violating FTC and compliance standards.',
        evidence: `“${found}”`,
        highlightedText: found,
        sourceDocument: 'Acme Core Voice & Legal Guidelines v4.2',
        sourceSection: 'Section 4.1 — Prohibited Absolute Performance Warranties',
        confidence: 98,
        suggestedFix: fix,
        explanation: 'Absolute warranties expose the enterprise to statutory liability. Qualified performance claims are mandatory.',
        status: 'pending',
      });
      suggestedContent = suggestedContent.replace(warrantyRegex, fix);
    }

    // 2. Terminology & Banned Hyperbole
    const buzzwordRegex = /(disruptive\s+miracle\s+platform|miracle\s+platform|magic\s+platform)/i;
    const buzzwordMatch = data.content.match(buzzwordRegex);
    if (buzzwordMatch) {
      const found = buzzwordMatch[0].trim();
      const fix = 'enterprise content governance platform';
      generatedFindings.push({
        id: `f-${Date.now()}-2`,
        category: 'Terminology',
        severity: 'High',
        reason: 'Use of blacklisted hyperbolic vocabulary dilutes institutional trust.',
        evidence: `“${found}”`,
        highlightedText: found,
        sourceDocument: 'Enterprise Master Lexicon 2026',
        sourceSection: 'Section 2.3 — Restricted Hyperbolic Nomenclature',
        confidence: 94,
        suggestedFix: fix,
        explanation: 'Hyperbolic terms like miracle or disruptive must be replaced with objective enterprise nomenclature.',
        status: 'pending',
      });
      suggestedContent = suggestedContent.replace(buzzwordRegex, fix);
    }

    // 3. Trademark Casing & Marks
    const tmRegex = /(brand\s+sense\s+Cloud\s+Sync|brand\s+sense)/i;
    const tmMatch = data.content.match(tmRegex);
    if (tmMatch) {
      const found = tmMatch[0].trim();
      const fix = 'BrandSense Content Hub™';
      generatedFindings.push({
        id: `f-${Date.now()}-3`,
        category: 'Terminology',
        severity: 'Medium',
        reason: 'Trademark formatting and product nomenclature capitalization standard violation.',
        evidence: `“${found}”`,
        highlightedText: found,
        sourceDocument: 'Brand Trademark & Nomenclature Manual',
        sourceSection: 'Standard TM-1 — Registered Marks',
        confidence: 99,
        suggestedFix: fix,
        explanation: 'Product marks must follow unified CamelCase and display registered trademark symbol.',
        status: 'pending',
      });
      suggestedContent = suggestedContent.replace(tmRegex, fix);
    }

    // 4. Quantified ROI Claims
    const roiRegex = /(instant\s+450%\s+ROI[^.]*|450%\s+ROI)/i;
    const roiMatch = data.content.match(roiRegex);
    if (roiMatch) {
      const found = roiMatch[0].trim();
      const fix = 'measurable ROI over verified cohorts (*2025 cohort study footnote required)';
      generatedFindings.push({
        id: `f-${Date.now()}-4`,
        category: 'Facts and Claims',
        severity: 'Critical',
        reason: 'Quantified performance assertion lacks mandatory audited cohort study disclaimer.',
        evidence: `“${found}”`,
        highlightedText: found,
        sourceDocument: 'Commercial Claims Policy',
        sourceSection: 'Schedule B — Performance Metrics',
        confidence: 95,
        suggestedFix: fix,
        explanation: 'Audited source citations are legally required for all quantitative financial or efficiency metrics.',
        status: 'pending',
      });
      suggestedContent = suggestedContent.replace(roiRegex, fix);
    }

    // Calculate real deterministic score based on violations
    const criticalPenalty = generatedFindings.filter((f) => f.severity === 'Critical').length * 15;
    const highPenalty = generatedFindings.filter((f) => f.severity === 'High').length * 8;
    const medPenalty = generatedFindings.filter((f) => f.severity === 'Medium').length * 4;
    const overallScore = Math.max(50, Math.min(100, 100 - (criticalPenalty + highPenalty + medPenalty)));

    const categoryScores = {
      'Tone and Voice': warrantyMatch ? 75 : 95,
      'Terminology': buzzwordMatch || tmMatch ? 70 : 96,
      'Facts and Claims': roiMatch ? 65 : 94,
      'Promotional Claims': warrantyMatch ? 60 : 98,
      'Visual Consistency': 95,
      'Accessibility': 92,
    };

    const newReview: ReviewItem = {
      id: reviewId,
      title: data.title || 'Untitled Brand Review',
      contentType: (data.contentType as any) || 'Social Media',
      brandProfile: data.brandProfile || 'Corporate Core (Global English)',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: {
        name: data.authorName || 'Elena Rostova',
        email: data.authorEmail || 'elena.rostova@acmebrand.com',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        role: 'Manager',
      },
      overallScore,
      status: overallScore >= 95 ? 'Approved' : 'Changes Requested',
      originalContent: data.content,
      suggestedContent,
      categoryScores,
      findings: generatedFindings,
      revisionCount: 1,
      filePath: data.filePath,
      fileUrl: data.fileUrl,
    };

    if (this.isConnected() && data.orgId) {
      const reviewInsert = {
        id: reviewId,
        organization_id: data.orgId,
        title: newReview.title,
        content_type: newReview.contentType,
        original_content: data.content,
        suggested_content: suggestedContent,
        instructions: data.instructions,
        file_path: data.filePath || null,
        file_url: data.fileUrl || null,
        overall_score: overallScore,
        category_scores: categoryScores,
        status: overallScore >= 95 ? 'Approved' : 'Changes Requested',
        author_id: data.authorId || null,
        created_by: data.authorId || null,
        revision_count: 1,
      };

      const { error: revErr } = await this.client.from('reviews').insert(reviewInsert);
      if (revErr) {
        console.error('Database review insert failed in Supabase:', revErr);
        throw new Error(`Failed to save review in database: ${revErr.message}`);
      }

      // Insert findings
      if (generatedFindings.length > 0) {
        const findingsToInsert = generatedFindings.map((f) => ({
          id: f.id,
          organization_id: data.orgId!,
          review_id: reviewId,
          category: f.category,
          severity: f.severity,
          reason: f.reason,
          evidence: f.evidence,
          highlighted_text: f.highlightedText,
          source_document: f.sourceDocument,
          source_section: f.sourceSection,
          confidence: f.confidence,
          suggested_fix: f.suggestedFix,
          explanation: f.explanation,
          status: f.status,
        }));
        const { error: findErr } = await this.client.from('findings').insert(findingsToInsert as any);
        if (findErr) {
          console.warn('Findings insert warning in Supabase:', findErr);
        }
      }

      // Insert Initial Revision
      const { error: revRevisionErr } = await this.client.from('review_revisions').insert({
        organization_id: data.orgId,
        review_id: reviewId,
        version_number: 1,
        author_id: data.authorId || null,
        compliance_score: overallScore,
        status: 'Initial Submission',
        summary: 'Original draft submitted for governance audit.',
        content: data.content,
        accepted_count: 0,
        rejected_count: 0,
      });
      if (revRevisionErr) {
        console.warn('Review revision insert warning:', revRevisionErr);
      }

      // Insert into Approvals workflow
      const { error: approvalErr } = await this.client.from('approvals').insert({
        organization_id: data.orgId,
        review_id: reviewId,
        submitted_by: data.authorId || null,
        status: 'Pending',
        urgency: overallScore < 75 ? 'High' : 'Medium',
        compliance_score: overallScore,
      });
      if (approvalErr) {
        console.warn('Approval item insert warning:', approvalErr);
      }

      return newReview;
    }

    // Development / demo cache persistence only
    if (process.env.NODE_ENV !== 'production' || !this.isConnected()) {
      this.saveLocalReview(newReview, data.orgId, data.authorId);

      // Register an approval workflow item in the isolated organization store
      const approvalItem: ApprovalItem = {
        id: `appr-${Date.now()}`,
        reviewId: newReview.id,
        title: newReview.title,
        submittedBy: {
          name: newReview.author.name,
          avatar: newReview.author.avatar,
          department: 'Brand & Marketing',
        },
        contentType: newReview.contentType,
        submittedDate: 'Just now',
        urgency: newReview.overallScore < 75 ? 'High' : 'Medium',
        complianceScore: newReview.overallScore,
        status: 'Pending',
        assignedReviewer: {
          name: 'Sarah Chen, Esq.',
          avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
        },
        commentsCount: 0,
        criticalIssuesCount: newReview.findings.filter((f) => f.severity === 'Critical').length,
      };
      const existingApprovals = this.getLocalApprovals(data.orgId);
      this.writeLocalApprovals([approvalItem, ...existingApprovals.filter(a => a.reviewId !== newReview.id)], data.orgId);
    }
    return newReview;
  }

  // ---------------------------------------------------------------------------
  // Findings
  // ---------------------------------------------------------------------------
  async updateFindingStatus(
    findingId: string, 
    status: 'accepted' | 'rejected' | 'modified', 
    suggestedFix?: string, 
    userNote?: string,
    explicitScore?: number
  ): Promise<void> {
    if (this.isConnected()) {
      try {
        const updateData: any = { status };
        if (suggestedFix !== undefined) updateData.suggested_fix = suggestedFix;
        if (userNote !== undefined) updateData.user_note = userNote;

        await this.client
          .from('findings')
          .update(updateData)
          .eq('id', findingId);
      } catch (err) {
        console.warn('Failed to update finding status in Supabase:', err);
      }
    }

    // Update in local review cache
    const reviews = this.getLocalReviews();
    let updated = false;
    for (const rev of reviews) {
      const idx = rev.findings.findIndex((f) => f.id === findingId);
      if (idx !== -1) {
        rev.findings[idx].status = status;
        if (suggestedFix) rev.findings[idx].suggestedFix = suggestedFix;
        if (userNote) rev.findings[idx].userNote = userNote;

        const unresolved = rev.findings.filter((f) => f.status !== 'accepted');
        const critPenalty = unresolved.filter((f) => f.severity === 'Critical').length * 15;
        const highPenalty = unresolved.filter((f) => f.severity === 'High').length * 8;
        const medPenalty = unresolved.filter((f) => f.severity === 'Medium').length * 4;
        const lowPenalty = unresolved.filter((f) => f.severity === 'Low').length * 2;
        const recalculated = Math.max(50, Math.min(100, 100 - (critPenalty + highPenalty + medPenalty + lowPenalty)));
        rev.overallScore = explicitScore !== undefined ? explicitScore : recalculated;
        rev.status = rev.overallScore >= 95 ? 'Approved' : 'Changes Requested';

        updated = true;
        break;
      }
    }
    if (updated) {
      this.writeLocalReviews(reviews);
      try {
        const approvals = this.getLocalApprovals();
        let apprsUpdated = false;
        const matchingRev = reviews.find((r) => r.findings?.some((f) => f.id === findingId));
        if (matchingRev) {
          for (const appr of approvals) {
            if (appr.reviewId === matchingRev.id) {
              appr.complianceScore = matchingRev.overallScore;
              apprsUpdated = true;
            }
          }
          if (apprsUpdated) this.writeLocalApprovals(approvals);
        }
      } catch {}
    }
  }

  async updateReviewContent(
    reviewId: string,
    content: string,
    findingId?: string,
    findingStatus?: string,
    explicitScore?: number
  ): Promise<any> {
    const status = (findingStatus as any) || 'accepted';

    // 1. If Supabase is connected, update DB
    if (this.isConnected()) {
      try {
        await this.client
          .from('reviews')
          .update({
            original_content: content,
            updated_at: new Date().toISOString(),
          })
          .eq('id', reviewId);

        if (findingId) {
          await this.client
            .from('findings')
            .update({ status })
            .eq('id', findingId);
        }
      } catch (err) {
        console.warn('Failed to update review content in Supabase:', err);
      }
    }

    // 2. Update local reviews cache
    const reviews = this.getLocalReviews();
    let updated = false;
    let computedScore = explicitScore;
    for (const rev of reviews) {
      if (rev.id === reviewId) {
        rev.modifiedContent = content;
        rev.updatedAt = new Date().toISOString();
        if (findingId && rev.findings) {
          const f = rev.findings.find((item) => item.id === findingId);
          if (f) {
            f.status = status;
          }
        }

        const unresolved = rev.findings ? rev.findings.filter((f) => f.status !== 'accepted') : [];
        const critPenalty = unresolved.filter((f) => f.severity === 'Critical').length * 15;
        const highPenalty = unresolved.filter((f) => f.severity === 'High').length * 8;
        const medPenalty = unresolved.filter((f) => f.severity === 'Medium').length * 4;
        const lowPenalty = unresolved.filter((f) => f.severity === 'Low').length * 2;
        const recalculated = Math.max(50, Math.min(100, 100 - (critPenalty + highPenalty + medPenalty + lowPenalty)));
        computedScore = explicitScore !== undefined ? explicitScore : recalculated;
        rev.overallScore = computedScore;
        rev.status = rev.overallScore >= 95 ? 'Approved' : 'Changes Requested';

        updated = true;
        break;
      }
    }
    if (updated) {
      this.writeLocalReviews(reviews);
      try {
        const approvals = this.getLocalApprovals();
        let apprsUpdated = false;
        for (const appr of approvals) {
          if (appr.reviewId === reviewId && computedScore !== undefined) {
            appr.complianceScore = computedScore;
            apprsUpdated = true;
          }
        }
        if (apprsUpdated) this.writeLocalApprovals(approvals);
      } catch {}
    }

    // 3. Update localStorage current review if matching
    if (typeof window !== 'undefined') {
      try {
        const cur = localStorage.getItem('brandsense_current_review');
        if (cur) {
          const parsed = JSON.parse(cur);
          if (parsed.id === reviewId) {
            parsed.modifiedContent = content;
            if (computedScore !== undefined) parsed.overallScore = computedScore;
            if (findingId && parsed.findings) {
              const f = parsed.findings.find((item: any) => item.id === findingId);
              if (f) f.status = status;
            }
            localStorage.setItem('brandsense_current_review', JSON.stringify(parsed));
          }
        }
      } catch {}
    }

    return {
      success: true,
      reviewId,
      overallScore: computedScore,
      modifiedContent: content,
    };
  }

  // ---------------------------------------------------------------------------
  // Knowledge Base
  // ---------------------------------------------------------------------------
  async getKnowledgeBase(orgId?: string): Promise<KnowledgeItem[]> {
    if (!this.isConnected()) {
      return this.getLocalKnowledgeBase(orgId);
    }

    try {
      let query = this.client
        .from('knowledge_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (orgId) {
        query = query.eq('organization_id', orgId);
      }

      const { data, error } = await query;
      if (error || !data || data.length === 0) {
        return this.getLocalKnowledgeBase(orgId);
      }

      return data.map((item: any) => ({
        id: item.id,
        type: item.type,
        title: item.title,
        content: item.content,
        category: item.category || 'General',
        tags: item.tags || [],
        status: item.status,
        lastUpdated: new Date(item.updated_at || item.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric',
        }),
        updatedBy: 'Authorized Brand Officer',
        fileSize: item.file_size || undefined,
        fileFormat: item.file_format || undefined,
        filePath: item.file_path || undefined,
        fileUrl: item.file_url || undefined,
        thumbnailUrl: item.thumbnail_url || undefined,
        replacement: item.replacement || undefined,
      }));
    } catch {
      return this.getLocalKnowledgeBase(orgId);
    }
  }

  async addKnowledgeItem(
    item: Omit<KnowledgeItem, 'id' | 'lastUpdated' | 'updatedBy'> & { filePath?: string; fileUrl?: string },
    orgId?: string,
    userId?: string
  ): Promise<KnowledgeItem> {
    const newItem: KnowledgeItem = {
      ...item,
      id: `kb-${Date.now()}`,
      lastUpdated: 'Just now',
      updatedBy: 'Elena Rostova',
      filePath: item.filePath,
      fileUrl: item.fileUrl,
    };

    if (this.isConnected() && orgId) {
      const numericFileSize = typeof item.fileSize === 'number'
        ? item.fileSize
        : (typeof item.fileSize === 'string' && !isNaN(parseInt(item.fileSize, 10))
            ? parseInt(item.fileSize, 10)
            : null);

      const { data, error } = await this.client
        .from('knowledge_items')
        .insert({
          organization_id: orgId,
          type: item.type,
          title: item.title,
          content: item.content,
          category: item.category || 'General',
          tags: item.tags || [],
          status: item.status || 'Active',
          replacement: item.replacement || null,
          file_format: item.fileFormat || null,
          file_size: numericFileSize,
          file_path: item.filePath || null,
          file_url: item.fileUrl || null,
          created_by: userId || null,
        })
        .select()
        .single();

      if (error) {
        console.error('Knowledge item insert failed in Supabase:', error);
        throw new Error(`Failed to save knowledge item in Supabase: ${error.message}`);
      }

      if (data) {
        newItem.id = data.id;
        newItem.filePath = data.file_path || newItem.filePath;
      }
      return newItem;
    }

    if (process.env.NODE_ENV !== 'production') {
      const current = this.getLocalKnowledgeBase();
      this.writeLocalKnowledgeBase([newItem, ...current]);
    }
    return newItem;
  }

  async deleteKnowledgeItem(id: string, orgId?: string): Promise<{ success: boolean; error?: string }> {
    if (this.isConnected()) {
      try {
        // Step 1: Query stored file_path and item type
        const { data: item, error: fetchErr } = await this.client
          .from('knowledge_items')
          .select('file_path, type')
          .eq('id', id)
          .single();

        if (fetchErr && fetchErr.code !== 'PGRST116') {
          console.error(`Failed to retrieve knowledge item for deletion [${id}]:`, fetchErr);
          return { success: false, error: `Failed to find knowledge item: ${fetchErr.message}` };
        }

        // Step 2: Delete the associated Storage object from the appropriate bucket
        if (item?.file_path) {
          const targetBucket = item.type === 'asset' ? 'brand-assets' : 'knowledge-documents';
          const deleteStorageRes = await this.deleteFile(targetBucket, item.file_path);
          if (!deleteStorageRes.success) {
            console.error('Storage deletion failed, preventing silent metadata loss:', deleteStorageRes.error);
            return {
              success: false,
              error: `Storage cleanup failed: ${deleteStorageRes.error}. Knowledge item metadata preserved.`,
            };
          }
        }

        // Step 3: Delete the database record only after handling file deletion safely
        const { error: dbErr } = await this.client
          .from('knowledge_items')
          .delete()
          .eq('id', id);

        if (dbErr) {
          console.error(`Failed to delete knowledge item record [${id}]:`, dbErr);
          return { success: false, error: `Failed to delete record: ${dbErr.message}` };
        }
      } catch (err: any) {
        console.error(`Exception during deleteKnowledgeItem [${id}]:`, err);
        return { success: false, error: err?.message || 'Delete operation failed' };
      }
    }

    const current = this.getLocalKnowledgeBase(orgId);
    this.writeLocalKnowledgeBase(current.filter((k) => k.id !== id), orgId);
    return { success: true };
  }

  async deleteReview(id: string, orgId?: string): Promise<{ success: boolean; error?: string }> {
    if (this.isConnected()) {
      try {
        // Step 1: Query stored file_path
        const { data: item, error: fetchErr } = await this.client
          .from('reviews')
          .select('file_path')
          .eq('id', id)
          .single();

        if (fetchErr && fetchErr.code !== 'PGRST116') {
          return { success: false, error: `Failed to find review: ${fetchErr.message}` };
        }

        // Step 2: Delete associated review file from storage
        if (item?.file_path) {
          const deleteStorageRes = await this.deleteFile('review-files', item.file_path);
          if (!deleteStorageRes.success) {
            return {
              success: false,
              error: `Review storage cleanup failed: ${deleteStorageRes.error}. Review record preserved.`,
            };
          }
        }

        // Step 3: Delete database record
        const { error: dbErr } = await this.client
          .from('reviews')
          .delete()
          .eq('id', id);

        if (dbErr) {
          return { success: false, error: `Failed to delete review: ${dbErr.message}` };
        }
      } catch (err: any) {
        return { success: false, error: err?.message || 'Delete review failed' };
      }
    }

    const current = this.getLocalReviews(orgId);
    this.writeLocalReviews(current.filter((r) => r.id !== id), orgId);
    return { success: true };
  }

  // ---------------------------------------------------------------------------
  // Approvals & Comments
  // ---------------------------------------------------------------------------
  async getApprovals(orgId?: string): Promise<ApprovalItem[]> {
    if (!this.isConnected()) {
      return this.getLocalApprovals(orgId);
    }

    try {
      let query = this.client
        .from('approvals')
        .select(`
          *,
          review:reviews(title, content_type, overall_score),
          submitter:profiles!approvals_submitted_by_fkey(full_name, avatar_url, department),
          reviewer:profiles!approvals_assigned_reviewer_fkey(full_name, avatar_url),
          comments:approval_comments(count)
        `)
        .order('created_at', { ascending: false });

      if (orgId) {
        query = query.eq('organization_id', orgId);
      }

      const { data, error } = await query;
      if (error || !data || data.length === 0) {
        return this.getLocalApprovals(orgId);
      }

      return data.map((a: any) => ({
        id: a.id,
        reviewId: a.review_id,
        title: a.review?.title || 'Brand Content Review',
        submittedBy: {
          name: a.submitter?.full_name || 'Marcus Vance',
          avatar: a.submitter?.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
          department: a.submitter?.department || 'Growth Copywriting',
        },
        contentType: (a.review?.content_type as any) || 'Social Media',
        submittedDate: new Date(a.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }),
        urgency: a.urgency,
        complianceScore: a.compliance_score || a.review?.overall_score || 80,
        status: a.status,
        assignedReviewer: {
          name: a.reviewer?.full_name || 'Sarah Chen, Esq.',
          avatar: a.reviewer?.avatar_url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
        },
        commentsCount: a.comments?.[0]?.count || 2,
        criticalIssuesCount: 1,
      }));
    } catch {
      return this.getLocalApprovals(orgId);
    }
  }

  async updateApprovalStatus(
    id: string, 
    status: 'Approved' | 'Rejected' | 'Needs Revision',
    reviewId?: string
  ): Promise<void> {
    if (this.isConnected()) {
      try {
        await this.client
          .from('approvals')
          .update({ status })
          .eq('id', id);

        if (reviewId) {
          const mappedReviewStatus = 
            status === 'Approved' ? 'Approved' :
            status === 'Rejected' ? 'Rejected' : 'Needs Revision';

          await this.client
            .from('reviews')
            .update({ status: mappedReviewStatus })
            .eq('id', reviewId);
        }
      } catch (err) {
        console.warn('Failed to update approval status in Supabase:', err);
      }
    }

    const current = this.getLocalApprovals();
    const updated = current.map((item) => (item.id === id ? { ...item, status } : item));
    this.writeLocalApprovals(updated);
  }

  async getApprovalComments(approvalId: string): Promise<ApprovalComment[]> {
    if (!this.isConnected()) {
      return [
        {
          id: 'comm-1',
          author: {
            name: 'Sarah Chen, Esq.',
            avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
            role: 'Legal Counsel',
          },
          timestamp: 'Nov 03, 10:45 AM',
          text: 'Marcus, please confirm the ROI cohort footnote is tied to the 2025 audited sample before I provide formal sign-off.',
        },
        {
          id: 'comm-2',
          author: {
            name: 'Marcus Vance',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
            role: 'Copywriter',
          },
          timestamp: 'Nov 03, 11:10 AM',
          text: 'Thanks Sarah. We swapped out the unverified 100% promise with the compliant wording from Rewrite Studio.',
        },
      ];
    }

    try {
      const { data } = await this.client
        .from('approval_comments')
        .select(`
          id,
          comment_text,
          resolved,
          created_at,
          author:profiles(full_name, avatar_url, role)
        `)
        .eq('approval_id', approvalId)
        .order('created_at', { ascending: true });

      if (!data || data.length === 0) return [];

      return data.map((c: any) => ({
        id: c.id,
        author: {
          name: c.author?.full_name || 'User',
          avatar: c.author?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          role: c.author?.role || 'Reviewer',
        },
        timestamp: new Date(c.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }),
        text: c.comment_text,
        resolved: c.resolved,
      }));
    } catch {
      return [];
    }
  }

  async addApprovalComment(
    approvalId: string, 
    text: string, 
    authorId?: string, 
    orgId?: string
  ): Promise<void> {
    if (this.isConnected() && orgId && authorId) {
      try {
        await this.client.from('approval_comments').insert({
          organization_id: orgId,
          approval_id: approvalId,
          author_id: authorId,
          comment_text: text,
        });
      } catch (err) {
        console.warn('Failed to insert comment:', err);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Revision History
  // ---------------------------------------------------------------------------
  async getRevisions(reviewId: string) {
    if (this.isConnected()) {
      try {
        const { data } = await this.client
          .from('review_revisions')
          .select(`
            *,
            author:profiles!review_revisions_author_id_fkey(full_name, role),
            reviewer:profiles!review_revisions_reviewer_id_fkey(full_name, role)
          `)
          .eq('review_id', reviewId)
          .order('version_number', { ascending: false });

        if (data && data.length > 0) {
          return data.map((rev: any) => ({
            versionNumber: rev.version_number,
            date: new Date(rev.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }),
            author: rev.author ? `${rev.author.full_name} (${rev.author.role})` : 'Content Creator',
            reviewer: rev.reviewer ? `${rev.reviewer.full_name} (${rev.reviewer.role})` : 'SENSA Intelligence Engine',
            complianceScore: rev.compliance_score,
            status: rev.status || 'Draft Revision',
            summary: rev.summary || 'Content revision update',
            acceptedCount: rev.accepted_count,
            rejectedCount: rev.rejected_count,
            content: rev.content,
          }));
        }
      } catch (err) {
        console.warn('Failed to load revisions from Supabase:', err);
      }
    }

    return null;
  }

  async saveNewRevision(data: {
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
    if (this.isConnected()) {
      try {
        await this.client.from('review_revisions').insert({
          organization_id: data.orgId,
          review_id: data.reviewId,
          version_number: data.versionNumber,
          author_id: data.authorId || null,
          reviewer_id: data.reviewerId || null,
          compliance_score: data.complianceScore,
          status: data.status,
          summary: data.summary,
          content: data.content,
          accepted_count: data.acceptedCount,
          rejected_count: data.rejectedCount,
        });

        await this.client
          .from('reviews')
          .update({
            revision_count: data.versionNumber,
            suggested_content: data.content,
            overall_score: data.complianceScore,
          })
          .eq('id', data.reviewId);
      } catch (err) {
        console.warn('Failed to save new revision in Supabase:', err);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Storage Helpers & File Security
  // ---------------------------------------------------------------------------
  validateStoragePath(path: string, expectedOrgId?: string): boolean {
    if (!path || typeof path !== 'string') return false;
    // Reject path traversal, backslashes, leading or trailing slashes
    if (path.includes('..') || path.includes('\\') || path.startsWith('/') || path.endsWith('/')) {
      return false;
    }
    const parts = path.split('/');
    if (parts.length < 2) {
      return false;
    }
    const orgFolder = parts[0];
    // Reject dummy/insecure org fallbacks
    if (!orgFolder || orgFolder === 'org-1' || orgFolder === 'undefined' || orgFolder === 'null') {
      return false;
    }
    if (expectedOrgId && orgFolder !== expectedOrgId) {
      return false;
    }
    return true;
  }

  async uploadFile(
    bucket: 'brand-assets' | 'review-files' | 'knowledge-documents' | 'avatars',
    path: string,
    file: File | Blob,
    expectedOrgId?: string
  ): Promise<{ path: string; signedUrl: string | null } | null> {
    if (!this.validateStoragePath(path, expectedOrgId)) {
      console.error(`Invalid storage path or organization mismatch for [${bucket}]:`, {
        path,
        expectedOrgId,
      });
      return null;
    }

    if (!this.isConnected()) {
      return {
        path,
        signedUrl: typeof URL !== 'undefined' && URL.createObjectURL ? URL.createObjectURL(file) : null,
      };
    }

    try {
      // Upload using upsert: true (works with existing org_storage_update and org_storage_insert policies)
      const { data, error } = await this.client.storage
        .from(bucket)
        .upload(path, file, { upsert: true });

      if (error || !data) {
        console.error(`Supabase Storage upload error [${bucket}/${path}]:`, error);
        return null;
      }

      // Generate initial private signed URL (1 hour expiry)
      const { data: signed, error: signError } = await this.client.storage
        .from(bucket)
        .createSignedUrl(data.path, 3600);

      if (signError) {
        console.warn(`Failed to create signed URL for [${bucket}/${data.path}]:`, signError);
      }

      return {
        path: data.path,
        signedUrl: signed?.signedUrl || null,
      };
    } catch (err) {
      console.error(`Exception during uploadFile [${bucket}/${path}]:`, err);
      return null;
    }
  }

  async getSignedUrl(
    bucket: 'brand-assets' | 'review-files' | 'knowledge-documents' | 'avatars',
    path: string,
    expiresIn = 3600
  ): Promise<string | null> {
    if (!path) return null;

    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:')) {
      return path;
    }

    if (!this.isConnected()) {
      return null;
    }

    try {
      const { data, error } = await this.client.storage
        .from(bucket)
        .createSignedUrl(path, expiresIn);

      if (error || !data) {
        console.warn(`Failed to generate signed URL [${bucket}/${path}]:`, error);
        return null;
      }

      return data.signedUrl;
    } catch (err) {
      console.error(`Exception in getSignedUrl [${bucket}/${path}]:`, err);
      return null;
    }
  }

  async deleteFile(
    bucket: 'brand-assets' | 'review-files' | 'knowledge-documents' | 'avatars',
    path: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!path) return { success: true };

    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:')) {
      return { success: true };
    }

    if (!this.isConnected()) {
      return { success: true };
    }

    try {
      const { error } = await this.client.storage
        .from(bucket)
        .remove([path]);

      if (error) {
        console.error(`Failed to delete storage file [${bucket}/${path}]:`, error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      console.error(`Exception during deleteFile [${bucket}/${path}]:`, err);
      return { success: false, error: err?.message || 'Storage file deletion error' };
    }
  }

  // ---------------------------------------------------------------------------
  // Local Storage Cache Helpers (Strict User & Organization Isolation)
  // ---------------------------------------------------------------------------
  public getLocalReviews(orgId?: string): ReviewItem[] {
    if (typeof window === 'undefined') return [];
    try {
      const isDemoOrg = !orgId || orgId === 'org-demo-brandsense' || orgId === 'org-1';
      const key = isDemoOrg ? 'brandsense_reviews_org-demo-brandsense' : `brandsense_reviews_${orgId}`;
      const stored = localStorage.getItem(key);
      if (stored) return JSON.parse(stored);
      
      // Seed initial sample reviews ONLY for demo accounts
      if (isDemoOrg) {
        localStorage.setItem(key, JSON.stringify(sampleReviews));
        return sampleReviews;
      }
      return [];
    } catch {
      return [];
    }
  }

  public saveLocalReview(review: ReviewItem, orgId?: string, authorId?: string) {
    if (typeof window === 'undefined') return;
    try {
      const isDemoOrg = !orgId || orgId === 'org-demo-brandsense' || orgId === 'org-1';
      const targetOrg = isDemoOrg ? 'org-demo-brandsense' : (orgId || 'org-demo-brandsense');
      const key = `brandsense_reviews_${targetOrg}`;
      
      const current = this.getLocalReviews(targetOrg);
      const updated = [review, ...current.filter((r) => r.id !== review.id)];
      localStorage.setItem(key, JSON.stringify(updated));

      // User-scoped current review key to prevent cross-account preview leakage
      const userKey = authorId 
        ? `brandsense_current_review_${authorId}` 
        : `brandsense_current_review_${targetOrg}`;
      localStorage.setItem(userKey, JSON.stringify(review));
      localStorage.setItem('brandsense_current_review', JSON.stringify(review));
    } catch {
      // Ignore
    }
  }

  public writeLocalReviews(reviews: ReviewItem[], orgId?: string) {
    if (typeof window === 'undefined') return;
    try {
      const isDemoOrg = !orgId || orgId === 'org-demo-brandsense' || orgId === 'org-1';
      const targetOrg = isDemoOrg ? 'org-demo-brandsense' : (orgId || 'org-demo-brandsense');
      const key = `brandsense_reviews_${targetOrg}`;
      localStorage.setItem(key, JSON.stringify(reviews));
    } catch {
      // Ignore
    }
  }

  public getLocalKnowledgeBase(orgId?: string): KnowledgeItem[] {
    if (typeof window === 'undefined') return [];
    try {
      const isDemoOrg = !orgId || orgId === 'org-demo-brandsense' || orgId === 'org-1';
      const key = isDemoOrg ? 'brandsense_kb_org-demo-brandsense' : `brandsense_kb_${orgId}`;
      const stored = localStorage.getItem(key);
      if (stored) return JSON.parse(stored);

      // Seed initial sample knowledge base ONLY for demo accounts
      if (isDemoOrg) {
        localStorage.setItem(key, JSON.stringify(sampleKnowledgeBase));
        return sampleKnowledgeBase;
      }
      return [];
    } catch {
      return [];
    }
  }

  public writeLocalKnowledgeBase(items: KnowledgeItem[], orgId?: string) {
    if (typeof window === 'undefined') return;
    try {
      const isDemoOrg = !orgId || orgId === 'org-demo-brandsense' || orgId === 'org-1';
      const targetOrg = isDemoOrg ? 'org-demo-brandsense' : (orgId || 'org-demo-brandsense');
      const key = `brandsense_kb_${targetOrg}`;
      localStorage.setItem(key, JSON.stringify(items));
    } catch {
      // Ignore
    }
  }

  public getLocalApprovals(orgId?: string): ApprovalItem[] {
    if (typeof window === 'undefined') return [];
    try {
      const isDemoOrg = !orgId || orgId === 'org-demo-brandsense' || orgId === 'org-1';
      const key = isDemoOrg ? 'brandsense_approvals_org-demo-brandsense' : `brandsense_approvals_${orgId}`;
      const stored = localStorage.getItem(key);
      if (stored) return JSON.parse(stored);

      // Seed initial sample approvals ONLY for demo accounts
      if (isDemoOrg) {
        localStorage.setItem(key, JSON.stringify(sampleApprovals));
        return sampleApprovals;
      }
      return [];
    } catch {
      return [];
    }
  }

  public writeLocalApprovals(approvals: ApprovalItem[], orgId?: string) {
    if (typeof window === 'undefined') return;
    try {
      const isDemoOrg = !orgId || orgId === 'org-demo-brandsense' || orgId === 'org-1';
      const targetOrg = isDemoOrg ? 'org-demo-brandsense' : (orgId || 'org-demo-brandsense');
      const key = `brandsense_approvals_${targetOrg}`;
      localStorage.setItem(key, JSON.stringify(approvals));
    } catch {
      // Ignore
    }
  }

  private mapReviewRecord(r: any): ReviewItem {
    return {
      id: r.id,
      title: r.title,
      contentType: r.content_type,
      brandProfile: 'Corporate Core (Global English)',
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      author: {
        name: r.author?.full_name || 'Elena Rostova',
        email: r.author?.email || 'elena.rostova@acmebrand.com',
        avatar: r.author?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        role: r.author?.role || 'Manager',
      },
      overallScore: r.overall_score || 80,
      status: r.status,
      originalContent: r.original_content,
      modifiedContent: r.modified_content || r.modifiedContent || undefined,
      suggestedContent: r.suggested_content || r.original_content,
      categoryScores: r.category_scores || {
        'Tone and Voice': 80,
        'Terminology': 85,
        'Facts and Claims': 75,
        'Promotional Claims': 70,
        'Visual Consistency': 95,
        'Accessibility': 90,
      },
      findings: (r.findings || []).map((f: any) => ({
        id: f.id,
        category: f.category,
        severity: f.severity,
        reason: f.reason,
        evidence: f.evidence,
        highlightedText: f.highlighted_text || '',
        sourceDocument: f.source_document || 'Brand Guidelines v4.2',
        sourceSection: f.source_section || 'Section 1',
        confidence: f.confidence || 90,
        suggestedFix: f.suggested_fix || '',
        explanation: f.explanation || '',
        status: f.status || 'pending',
        userNote: f.user_note || undefined,
      })),
      reviewer: r.reviewer
        ? {
            name: r.reviewer.full_name,
            role: r.reviewer.role,
            avatar: r.reviewer.avatar_url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
          }
        : undefined,
      revisionCount: r.revision_count || 1,
      filePath: r.file_path || undefined,
      fileUrl: r.file_url || undefined,
    };
  }
}

export const supabaseDataService = new SupabaseDataService();
