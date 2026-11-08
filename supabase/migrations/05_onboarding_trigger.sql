-- ==============================================================================
-- BRANDSense Supabase Migration: 05_onboarding_trigger.sql
-- Description: Complete, hardened user onboarding trigger function.
--
-- Verified Live Database Schema:
-- 1. public.organizations:
--    id (UUID), name (TEXT), tier (TEXT DEFAULT 'Enterprise Plan'), created_at (TIMESTAMPTZ)
--    (No 'slug' column)
-- 2. public.profiles:
--    id (UUID), organization_id (UUID), email (TEXT), full_name (TEXT),
--    role (TEXT), avatar_url (TEXT), department (TEXT), created_at (TIMESTAMPTZ)
--    (No 'name' or 'updated_at' column)
-- 3. public.brand_profiles:
--    id (UUID), organization_id (UUID), name (TEXT), description (TEXT),
--    is_default (BOOLEAN), tone_pillars (JSONB), created_at (TIMESTAMPTZ)
--    (No 'updated_at' column)
-- 4. public.invitations:
--    id (UUID), organization_id (UUID), email (TEXT), role (TEXT),
--    invited_by (UUID), token_hash (TEXT UNIQUE), status (TEXT),
--    expires_at (TIMESTAMPTZ), created_at (TIMESTAMPTZ)
--    (Backend stores raw 40-char secrets.token_hex(20); exact equality match)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user_onboarding()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
    raw_invite_token TEXT;
    target_org_id UUID;
    target_role TEXT;
    user_full_name TEXT;
    org_name TEXT;
    default_brand_id UUID;
BEGIN
    -- 0. Email Validation: NEW.email must be present and non-empty
    IF NEW.email IS NULL OR pg_catalog.length(pg_catalog.btrim(NEW.email, E' \t\n\r')) = 0 THEN
        RAISE EXCEPTION 'Registration rejected: A valid email address is required.';
    END IF;

    -- Extract optional invitation token and user metadata safely
    raw_invite_token := NEW.raw_user_meta_data->>'invitation_token';
    
    -- COALESCE and NULLIF are standard SQL language constructs
    user_full_name := COALESCE(
        NULLIF(pg_catalog.btrim(NEW.raw_user_meta_data->>'full_name', E' \t\n\r'), ''),
        NULLIF(pg_catalog.btrim(NEW.raw_user_meta_data->>'name', E' \t\n\r'), ''),
        pg_catalog.split_part(NEW.email, '@', 1)
    );
    
    org_name := COALESCE(
        NULLIF(pg_catalog.btrim(NEW.raw_user_meta_data->>'organisation', E' \t\n\r'), ''),
        NULLIF(pg_catalog.btrim(NEW.raw_user_meta_data->>'org_name', E' \t\n\r'), ''),
        'BrandSense Workspace'
    );

    -- =========================================================================
    -- INVITATION PATH: Token Provided (Non-NULL)
    -- =========================================================================
    IF raw_invite_token IS NOT NULL THEN

        -- HARDENING 1 & 2: Strict format validation against exactly 40 lowercase hex chars.
        -- Rejects malformed tokens, including whitespace-only, uppercase, shortened,
        -- extended, and whitespace-padded tokens.
        IF raw_invite_token !~ '^[0-9a-f]{40}$' THEN
            RAISE EXCEPTION 'Registration rejected: Invitation token is malformed. Expected a 40-character lowercase hexadecimal string.';
        END IF;

        -- HARDENING 3: Atomic claim comparing token_hash = raw_invite_token directly.
        -- Do not trim the token before comparison.
        -- 1. Exact Token Equality: Direct match against raw 40-char token_hash.
        -- 2. Concurrency-Safe: Acquires an exclusive row lock, preventing double-claims.
        -- 3. Status Integrity: Matches status = 'pending'.
        -- 4. Expiration: Enforces expires_at > now().
        -- 5. Identity Protection: Case-insensitively validates against the invited email address.
        UPDATE public.invitations
        SET status = 'accepted'
        WHERE token_hash = raw_invite_token
          AND status = 'pending'
          AND expires_at > pg_catalog.now()
          AND pg_catalog.lower(email) = pg_catalog.lower(NEW.email)
        RETURNING organization_id, role INTO target_org_id, target_role;

        -- SECURITY GUARD 1: Immediately detect unsuccessful invitation claim via IF NOT FOUND.
        -- ABORT the transaction immediately. NEVER fall through to creating an organization!
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Registration rejected: Invitation token is invalid, expired, already claimed, or was issued to a different email address.';
        END IF;

        -- SECURITY GUARD 2: Separately reject a NULL target_org_id after a successful invitation match
        IF target_org_id IS NULL THEN
            RAISE EXCEPTION 'Registration rejected: Invitation record is invalid (missing organization_id).';
        END IF;

        -- SECURITY GUARD 3: Explicitly reject NULL or unauthorized organization roles
        IF target_role IS NULL OR target_role NOT IN ('Admin', 'Creator', 'Manager', 'Reviewer') THEN
            RAISE EXCEPTION 'Registration rejected: Invitation contains an invalid or unauthorized organization role: %', target_role;
        END IF;

    -- =========================================================================
    -- FRESH WORKSPACE PATH: Strictly NULL Token
    -- =========================================================================
    ELSE
        -- 1. Create exactly ONE organization using verified live columns: id, name, tier, created_at
        INSERT INTO public.organizations (name, tier)
        VALUES (org_name, 'Enterprise Plan')
        RETURNING id INTO target_org_id;

        -- The initial creator of a fresh workspace is always designated as Admin
        target_role := 'Admin';

        -- 2. Create the initial default Brand Profile using verified live columns:
        -- id, organization_id, name, description, is_default, tone_pillars, created_at
        INSERT INTO public.brand_profiles (
            organization_id,
            name,
            description,
            is_default,
            tone_pillars
        ) VALUES (
            target_org_id,
            'Corporate Core (Global English)',
            'Standard institutional guidelines governing global commercial and corporate communications.',
            true,
            '["Authoritative", "Measured", "Compliant", "Inclusive"]'::jsonb
        )
        RETURNING id INTO default_brand_id;

    END IF;

    -- =========================================================================
    -- COMMON: Create Profile Record in public.profiles (verified live columns):
    -- id, organization_id, email, full_name, role, avatar_url, department, created_at
    -- =========================================================================
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

-- Preserve Function Ownership & Revoke Direct Execution
-- Trigger functions are invoked by the database engine on AFTER INSERT ON auth.users.
-- They must not be exposed to direct execution by API clients or any role.
ALTER FUNCTION public.handle_new_user_onboarding() OWNER TO postgres;

REVOKE ALL ON FUNCTION public.handle_new_user_onboarding() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_user_onboarding() FROM anon;
REVOKE ALL ON FUNCTION public.handle_new_user_onboarding() FROM authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user_onboarding() FROM service_role;
