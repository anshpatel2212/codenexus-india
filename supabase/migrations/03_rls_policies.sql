-- ==============================================================================
-- BRANDSense Supabase Migration: 03_rls_policies.sql
-- Description: Enable RLS on all 12 tables and apply rigorous role-based and
-- multi-tenant policies. Zero data leaks between organizations.
-- ==============================================================================

-- 1. Enable RLS on all 12 tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- 2. Organizations Policies
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "org_select_policy" ON public.organizations;
CREATE POLICY "org_select_policy" ON public.organizations
    FOR SELECT TO authenticated
    USING (id = public.current_org_id());

DROP POLICY IF EXISTS "org_admin_update_policy" ON public.organizations;
CREATE POLICY "org_admin_update_policy" ON public.organizations
    FOR UPDATE TO authenticated
    USING (id = public.current_org_id() AND public.current_user_role() = 'Admin')
    WITH CHECK (id = public.current_org_id() AND public.current_user_role() = 'Admin');

-- -----------------------------------------------------------------------------
-- 3. Profiles Policies
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "profiles_org_select" ON public.profiles;
CREATE POLICY "profiles_org_select" ON public.profiles
    FOR SELECT TO authenticated
    USING (organization_id = public.current_org_id());

DROP POLICY IF EXISTS "profiles_self_update" ON public.profiles;
CREATE POLICY "profiles_self_update" ON public.profiles
    FOR UPDATE TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "profiles_admin_update" ON public.profiles;
CREATE POLICY "profiles_admin_update" ON public.profiles
    FOR UPDATE TO authenticated
    USING (organization_id = public.current_org_id() AND public.current_user_role() = 'Admin')
    WITH CHECK (organization_id = public.current_org_id() AND public.current_user_role() = 'Admin');

-- -----------------------------------------------------------------------------
-- 4. Brand Profiles Policies
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "brand_profiles_select" ON public.brand_profiles;
CREATE POLICY "brand_profiles_select" ON public.brand_profiles
    FOR SELECT TO authenticated
    USING (organization_id = public.current_org_id());

DROP POLICY IF EXISTS "brand_profiles_write" ON public.brand_profiles;
CREATE POLICY "brand_profiles_write" ON public.brand_profiles
    FOR ALL TO authenticated
    USING (organization_id = public.current_org_id() AND public.current_user_role() IN ('Admin', 'Manager'))
    WITH CHECK (organization_id = public.current_org_id() AND public.current_user_role() IN ('Admin', 'Manager'));

-- -----------------------------------------------------------------------------
-- 5. Knowledge Base Items Policies
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "knowledge_items_select" ON public.knowledge_items;
CREATE POLICY "knowledge_items_select" ON public.knowledge_items
    FOR SELECT TO authenticated
    USING (organization_id = public.current_org_id());

DROP POLICY IF EXISTS "knowledge_items_write" ON public.knowledge_items;
CREATE POLICY "knowledge_items_write" ON public.knowledge_items
    FOR ALL TO authenticated
    USING (organization_id = public.current_org_id() AND public.current_user_role() IN ('Admin', 'Manager'))
    WITH CHECK (organization_id = public.current_org_id() AND public.current_user_role() IN ('Admin', 'Manager'));

-- -----------------------------------------------------------------------------
-- 6. Reviews Policies
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "reviews_select_policy" ON public.reviews;
CREATE POLICY "reviews_select_policy" ON public.reviews
    FOR SELECT TO authenticated
    USING (
        organization_id = public.current_org_id() AND (
            public.current_user_role() IN ('Admin', 'Manager')
            OR author_id = auth.uid()
            OR (public.current_user_role() = 'Reviewer' AND (reviewer_id = auth.uid() OR reviewer_id IS NULL))
        )
    );

DROP POLICY IF EXISTS "reviews_insert_policy" ON public.reviews;
CREATE POLICY "reviews_insert_policy" ON public.reviews
    FOR INSERT TO authenticated
    WITH CHECK (
        organization_id = public.current_org_id()
        AND (author_id = auth.uid() OR author_id IS NULL)
    );

DROP POLICY IF EXISTS "reviews_update_policy" ON public.reviews;
CREATE POLICY "reviews_update_policy" ON public.reviews
    FOR UPDATE TO authenticated
    USING (
        organization_id = public.current_org_id() AND (
            public.current_user_role() IN ('Admin', 'Manager')
            OR author_id = auth.uid()
            OR (public.current_user_role() = 'Reviewer' AND (reviewer_id = auth.uid() OR reviewer_id IS NULL))
        )
    )
    WITH CHECK (organization_id = public.current_org_id());

-- -----------------------------------------------------------------------------
-- 7. Findings Policies
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "findings_select_policy" ON public.findings;
CREATE POLICY "findings_select_policy" ON public.findings
    FOR SELECT TO authenticated
    USING (organization_id = public.current_org_id());

DROP POLICY IF EXISTS "findings_insert_policy" ON public.findings;
CREATE POLICY "findings_insert_policy" ON public.findings
    FOR INSERT TO authenticated
    WITH CHECK (organization_id = public.current_org_id());

DROP POLICY IF EXISTS "findings_update_policy" ON public.findings;
CREATE POLICY "findings_update_policy" ON public.findings
    FOR UPDATE TO authenticated
    USING (organization_id = public.current_org_id())
    WITH CHECK (organization_id = public.current_org_id());

-- -----------------------------------------------------------------------------
-- 8. Approvals Policies
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "approvals_select_policy" ON public.approvals;
CREATE POLICY "approvals_select_policy" ON public.approvals
    FOR SELECT TO authenticated
    USING (organization_id = public.current_org_id());

DROP POLICY IF EXISTS "approvals_insert_policy" ON public.approvals;
CREATE POLICY "approvals_insert_policy" ON public.approvals
    FOR INSERT TO authenticated
    WITH CHECK (organization_id = public.current_org_id());

DROP POLICY IF EXISTS "approvals_decision_update_policy" ON public.approvals;
CREATE POLICY "approvals_decision_update_policy" ON public.approvals
    FOR UPDATE TO authenticated
    USING (
        organization_id = public.current_org_id() 
        AND public.current_user_role() IN ('Admin', 'Manager', 'Reviewer')
    )
    WITH CHECK (
        organization_id = public.current_org_id() 
        AND public.current_user_role() IN ('Admin', 'Manager', 'Reviewer')
    );

-- -----------------------------------------------------------------------------
-- 9. Approval Comments Policies
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "approval_comments_select" ON public.approval_comments;
CREATE POLICY "approval_comments_select" ON public.approval_comments
    FOR SELECT TO authenticated
    USING (organization_id = public.current_org_id());

DROP POLICY IF EXISTS "approval_comments_insert" ON public.approval_comments;
CREATE POLICY "approval_comments_insert" ON public.approval_comments
    FOR INSERT TO authenticated
    WITH CHECK (
        organization_id = public.current_org_id()
        AND author_id = auth.uid()
    );

DROP POLICY IF EXISTS "approval_comments_update" ON public.approval_comments;
CREATE POLICY "approval_comments_update" ON public.approval_comments
    FOR UPDATE TO authenticated
    USING (
        organization_id = public.current_org_id()
        AND (author_id = auth.uid() OR public.current_user_role() IN ('Admin', 'Manager', 'Reviewer'))
    )
    WITH CHECK (organization_id = public.current_org_id());

-- -----------------------------------------------------------------------------
-- 10. Review Revisions Policies
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "review_revisions_select" ON public.review_revisions;
CREATE POLICY "review_revisions_select" ON public.review_revisions
    FOR SELECT TO authenticated
    USING (organization_id = public.current_org_id());

DROP POLICY IF EXISTS "review_revisions_insert" ON public.review_revisions;
CREATE POLICY "review_revisions_insert" ON public.review_revisions
    FOR INSERT TO authenticated
    WITH CHECK (organization_id = public.current_org_id());

-- -----------------------------------------------------------------------------
-- 11. Conversations Policies (Isolated to owner in organization)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "conversations_owner_policy" ON public.conversations;
CREATE POLICY "conversations_owner_policy" ON public.conversations
    FOR ALL TO authenticated
    USING (organization_id = public.current_org_id() AND user_id = auth.uid())
    WITH CHECK (organization_id = public.current_org_id() AND user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- 12. Messages Policies
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "messages_owner_policy" ON public.messages;
CREATE POLICY "messages_owner_policy" ON public.messages
    FOR ALL TO authenticated
    USING (
        organization_id = public.current_org_id()
        AND EXISTS (
            SELECT 1 FROM public.conversations c 
            WHERE c.id = messages.conversation_id AND c.user_id = auth.uid()
        )
    )
    WITH CHECK (
        organization_id = public.current_org_id()
        AND EXISTS (
            SELECT 1 FROM public.conversations c 
            WHERE c.id = messages.conversation_id AND c.user_id = auth.uid()
        )
    );

-- -----------------------------------------------------------------------------
-- 13. Invitations Policies
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "invitations_admin_all" ON public.invitations;
CREATE POLICY "invitations_admin_all" ON public.invitations
    FOR ALL TO authenticated
    USING (organization_id = public.current_org_id() AND public.current_user_role() = 'Admin')
    WITH CHECK (organization_id = public.current_org_id() AND public.current_user_role() = 'Admin');

DROP POLICY IF EXISTS "invitations_token_lookup" ON public.invitations;
CREATE POLICY "invitations_token_lookup" ON public.invitations
    FOR SELECT TO anon, authenticated
    USING (status = 'pending' AND expires_at > now());

