-- ==============================================================================
-- BRANDSense Supabase Migration: 02_security_functions_and_triggers.sql
-- Description: Security helpers, role functions, automated onboarding triggers,
-- and privilege escalation protection.
-- ==============================================================================

-- 1. Helper function: Get Current User's Organization ID
CREATE OR REPLACE FUNCTION public.current_org_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
    SELECT organization_id 
    FROM public.profiles 
    WHERE id = auth.uid()
    LIMIT 1;
$$;

-- 2. Helper function: Get Current User's Role
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
    SELECT role 
    FROM public.profiles 
    WHERE id = auth.uid()
    LIMIT 1;
$$;

-- 3. Trigger: Automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$;

-- Apply updated_at trigger across mutable tables
DO $$
DECLARE
    tbl text;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY[
        'organizations', 'profiles', 'brand_profiles', 
        'knowledge_items', 'reviews', 'findings', 
        'approvals', 'approval_comments', 'conversations'
    ]) LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS tr_%I_updated_at ON public.%I;
            CREATE TRIGGER tr_%I_updated_at
                BEFORE UPDATE ON public.%I
                FOR EACH ROW
                EXECUTE FUNCTION public.handle_updated_at();
        ', tbl, tbl, tbl, tbl);
    END LOOP;
END;
$$;

-- 4. Trigger: Guard against role and organization escalation on profiles
CREATE OR REPLACE FUNCTION public.prevent_profile_privilege_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    acting_role TEXT;
BEGIN
    -- Allow service-role or trigger execution
    IF current_setting('role', true) = 'service_role' OR auth.uid() IS NULL THEN
        RETURN NEW;
    END IF;

    acting_role := public.current_user_role();

    -- Organization ID can never be changed directly by user update
    IF NEW.organization_id <> OLD.organization_id THEN
        RAISE EXCEPTION 'Changing organization membership directly is strictly prohibited.';
    END IF;

    -- Only an Admin in the same organization can change another member's role
    IF NEW.role <> OLD.role THEN
        IF acting_role <> 'Admin' THEN
            RAISE EXCEPTION 'Privilege escalation rejected: only organization Admins may change roles.';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_prevent_profile_escalation ON public.profiles;
CREATE TRIGGER tr_prevent_profile_escalation
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_profile_privilege_escalation();

-- 5. Automated Onboarding Trigger: Runs when auth.users is created
CREATE OR REPLACE FUNCTION public.handle_new_user_onboarding()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    raw_invite_token TEXT;
    invited_record RECORD;
    target_org_id UUID;
    target_role TEXT;
    user_full_name TEXT;
    org_name TEXT;
    default_brand_id UUID;
BEGIN
    raw_invite_token := NEW.raw_user_meta_data->>'invitation_token';
    user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1));
    org_name := COALESCE(NEW.raw_user_meta_data->>'organisation', NEW.raw_user_meta_data->>'org_name', 'Acme Enterprise Holdings');

    -- Check if registering through an invitation token
    IF raw_invite_token IS NOT NULL AND length(trim(raw_invite_token)) > 0 THEN
        SELECT * INTO invited_record
        FROM public.invitations
        WHERE token = raw_invite_token 
          AND status = 'pending'
          AND expires_at > now()
        LIMIT 1;

        IF FOUND THEN
            target_org_id := invited_record.organization_id;
            target_role := invited_record.role;

            -- Mark invitation as accepted
            UPDATE public.invitations
            SET status = 'accepted'
            WHERE id = invited_record.id;
        END IF;
    END IF;

    -- If no valid invitation was found, create a new Organization and make user the Admin
    IF target_org_id IS NULL THEN
        INSERT INTO public.organizations (name, slug)
        VALUES (org_name, lower(regexp_replace(org_name, '[^a-zA-Z0-9]', '-', 'g')) || '-' || substring(gen_random_uuid()::text from 1 for 6))
        RETURNING id INTO target_org_id;

        target_role := 'Admin';

        -- Create default Brand Profile for the new organization
        INSERT INTO public.brand_profiles (organization_id, name, description, is_default, tone_pillars)
        VALUES (
            target_org_id,
            'Corporate Core (Global English)',
            'Core authoritative and measured enterprise communication pillars',
            true,
            '["Authoritative", "Measured", "Compliant", "Inclusive"]'::jsonb
        )
        RETURNING id INTO default_brand_id;
    END IF;

    -- Insert user profile
    INSERT INTO public.profiles (
        id,
        organization_id,
        email,
        full_name,
        role,
        avatar_url,
        department
    ) VALUES (
        NEW.id,
        target_org_id,
        NEW.email,
        user_full_name,
        target_role,
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
        COALESCE(NEW.raw_user_meta_data->>'department', 'Brand & Global Marketing')
    );

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user_onboarding();

