-- ==============================================================================
-- BRANDSense Supabase Migration: 04_storage_and_indexes.sql
-- Description: Create 4 private Storage buckets with RLS policies, performance
-- multi-tenant indexes, and pgvector cosine search index.
-- ==============================================================================

-- 1. Create Private Storage Buckets in storage.buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('brand-assets', 'brand-assets', false, 52428800, ARRAY['image/png', 'image/jpeg', 'image/svg+xml', 'application/pdf']),
    ('review-files', 'review-files', false, 52428800, ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/png', 'image/jpeg']),
    ('knowledge-documents', 'knowledge-documents', false, 104857600, ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']),
    ('avatars', 'avatars', false, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET 
    public = false,
    file_size_limit = EXCLUDED.file_size_limit;

-- 2. Storage Objects RLS Policies
-- Objects are structured as: <bucket>/<organization_id>/<file_name>
-- Ensures absolute tenant isolation in object storage.

DROP POLICY IF EXISTS "storage_org_read_policy" ON storage.objects;
CREATE POLICY "storage_org_read_policy" ON storage.objects
    FOR SELECT TO authenticated
    USING (
        bucket_id IN ('brand-assets', 'review-files', 'knowledge-documents', 'avatars')
        AND (
            (storage.foldername(name))[1] = public.current_org_id()::text
            OR bucket_id = 'avatars'
        )
    );

DROP POLICY IF EXISTS "storage_org_insert_policy" ON storage.objects;
CREATE POLICY "storage_org_insert_policy" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id IN ('brand-assets', 'review-files', 'knowledge-documents', 'avatars')
        AND (
            (storage.foldername(name))[1] = public.current_org_id()::text
            OR bucket_id = 'avatars'
        )
    );

DROP POLICY IF EXISTS "storage_org_delete_policy" ON storage.objects;
CREATE POLICY "storage_org_delete_policy" ON storage.objects
    FOR DELETE TO authenticated
    USING (
        bucket_id IN ('brand-assets', 'review-files', 'knowledge-documents', 'avatars')
        AND (
            (storage.foldername(name))[1] = public.current_org_id()::text
            OR (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
        )
        AND public.current_user_role() IN ('Admin', 'Manager')
    );

-- 3. High-Performance Multi-Tenant Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_organization_id ON public.profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_brand_profiles_org_id ON public.brand_profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_items_org_type ON public.knowledge_items(organization_id, type);
CREATE INDEX IF NOT EXISTS idx_knowledge_items_status ON public.knowledge_items(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_reviews_org_status ON public.reviews(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_reviews_author ON public.reviews(author_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer ON public.reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_findings_review_id ON public.findings(review_id);
CREATE INDEX IF NOT EXISTS idx_findings_org_id ON public.findings(organization_id);
CREATE INDEX IF NOT EXISTS idx_approvals_review_id ON public.approvals(review_id);
CREATE INDEX IF NOT EXISTS idx_approvals_org_status ON public.approvals(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_approval_comments_app_id ON public.approval_comments(approval_id);
CREATE INDEX IF NOT EXISTS idx_review_revisions_review_ver ON public.review_revisions(review_id, version_number DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_org_user ON public.conversations(organization_id, user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON public.invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_org_email ON public.invitations(organization_id, email);

-- 4. Vector similarity index for knowledge retrieval (SENSA AI RAG)
CREATE INDEX IF NOT EXISTS idx_knowledge_items_embedding ON public.knowledge_items 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- 5. Helper Function: Semantic search for Brand Guidelines and Claims
CREATE OR REPLACE FUNCTION public.match_knowledge_items (
    query_embedding vector(1536),
    match_threshold float,
    match_count int,
    p_organization_id uuid
)
RETURNS TABLE (
    id uuid,
    title text,
    content text,
    type text,
    category text,
    similarity float
)
LANGUAGE sql STABLE
AS $$
    SELECT
        k.id,
        k.title,
        k.content,
        k.type,
        k.category,
        1 - (k.embedding <=> query_embedding) AS similarity
    FROM public.knowledge_items k
    WHERE k.organization_id = p_organization_id
      AND k.status = 'Active'
      AND (k.embedding IS NOT NULL)
      AND (1 - (k.embedding <=> query_embedding)) > match_threshold
    ORDER BY k.embedding <=> query_embedding
    LIMIT match_count;
$$;

