-- ==============================================================================
-- BRANDSense Supabase Rollback: 05_onboarding_trigger_rollback.sql
-- Description: Rollback script to revert public.handle_new_user_onboarding()
-- to its previous minimal placeholder state.
--
-- IMPORTANT NOTICE REGARDING SIGNUP BEHAVIOR & DATA INTEGRITY:
-- 1. Effect on New Signups:
--    Reverting this function to the minimal placeholder state causes future
--    signups to succeed in auth.users without creating corresponding records in
--    public.organizations, public.brand_profiles, or public.profiles.
--    Users registered while this rollback is active will not have an associated
--    organization or profile until manually provisioned or until the onboarding
--    migration is re-applied.
-- 2. Effect on Existing Data:
--    This rollback script ONLY reverts the trigger function definition.
--    It does NOT automatically delete, modify, or revert data that was created
--    while the 05_onboarding_trigger migration was active.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user_onboarding()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
    user_full_name TEXT;
    org_name TEXT;
BEGIN
    -- Reverted to previous minimal placeholder implementation
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

    -- Minimal placeholder return (no organization or profile created)
    RETURN NEW;
END;
$$;

-- Preserve Function Ownership & Revoke Direct Execution
ALTER FUNCTION public.handle_new_user_onboarding() OWNER TO postgres;

REVOKE ALL ON FUNCTION public.handle_new_user_onboarding() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_user_onboarding() FROM anon;
REVOKE ALL ON FUNCTION public.handle_new_user_onboarding() FROM authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user_onboarding() FROM service_role;
