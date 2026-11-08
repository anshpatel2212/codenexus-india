-- ==============================================================================
-- BRANDSense Supabase Migration: seed.sql
-- Description: Seed initial default organization, brand profile, knowledge items,
-- and default taxonomy.
-- ==============================================================================

DO $$
DECLARE
    demo_org_id UUID;
    demo_brand_id UUID;
BEGIN
    -- Check if demo org already exists
    SELECT id INTO demo_org_id FROM public.organizations WHERE slug = 'acme-enterprise-holdings' LIMIT 1;

    IF demo_org_id IS NULL THEN
        INSERT INTO public.organizations (name, slug, tier)
        VALUES ('Acme Enterprise Holdings', 'acme-enterprise-holdings', 'Enterprise Plan')
        RETURNING id INTO demo_org_id;
    END IF;

    -- Brand Profile
    SELECT id INTO demo_brand_id FROM public.brand_profiles WHERE organization_id = demo_org_id AND name = 'Corporate Core (Global English)' LIMIT 1;

    IF demo_brand_id IS NULL THEN
        INSERT INTO public.brand_profiles (organization_id, name, description, is_default, tone_pillars)
        VALUES (
            demo_org_id,
            'Corporate Core (Global English)',
            'Standard institutional guidelines governing global commercial and corporate communications.',
            true,
            '["Authoritative", "Measured", "Compliant", "Inclusive"]'::jsonb
        )
        RETURNING id INTO demo_brand_id;
    END IF;

    -- Knowledge Items
    IF NOT EXISTS (SELECT 1 FROM public.knowledge_items WHERE organization_id = demo_org_id AND title = 'Brand Voice & Lexicon Guidelines (2026 Edition)') THEN
        INSERT INTO public.knowledge_items (organization_id, brand_profile_id, type, title, content, category, tags, status, file_format, file_size)
        VALUES 
        (demo_org_id, demo_brand_id, 'guideline', 'Brand Voice & Lexicon Guidelines (2026 Edition)', 'Comprehensive handbook detailing authoritative, measured, and principled corporate voice pillars. Outlines tone spectrum from B2B technical whitepapers to social thought leadership.', 'Tone and Voice', ARRAY['Core Voice', 'B2B', 'Editorial', 'Tone'], 'Active', 'PDF', '4.2 MB'),
        (demo_org_id, demo_brand_id, 'fact', 'Audited SOC2 Type II & ISO 27001 Certification Dates', 'SOC2 Type II recertified on July 14, 2026 by Ernst & Young LLP. ISO/IEC 27001:2022 surveillance audit successfully completed August 2026. Zero non-conformities reported.', 'Security & Certifications', ARRAY['Security', 'SOC2', 'ISO27001', 'Audits'], 'Active', NULL, NULL),
        (demo_org_id, demo_brand_id, 'terminology', 'Product Family Nomenclature & Capitalization Standard', 'Always format “BrandSense” as single CamelCase word with no spaces. Child modules are separated by registered brand names: “BrandSense Content Hub™”, “BrandSense RuleEngine™”, “BrandSense SENSA™”.', 'Trademarks & Naming', ARRAY['Trademarks', 'Naming', 'Products'], 'Active', NULL, NULL),
        (demo_org_id, demo_brand_id, 'banned', 'Disruptive / Miracle / Magic (Hyperbolic Buzzwords)', 'Banned in all external investor, customer, and partner materials. Dilutes institutional authority and creates misleading technological capabilities expectations.', 'Restricted Vocabulary', ARRAY['Banned', 'Hyperbole', 'Trust'], 'Active', NULL, NULL),
        (demo_org_id, demo_brand_id, 'phrase', 'Mandatory Human-in-the-Loop Disclosure', '“AI-generated assistance. Final publication decisions and editorial authority remain with authorized enterprise personnel.”', 'Responsible AI Policy', ARRAY['Mandatory', 'AI Ethics', 'Legal'], 'Active', NULL, NULL),
        (demo_org_id, demo_brand_id, 'disclaimer', 'Financial ROI Performance Disclaimer (*Study Citation)', '*Results based on a 2025 audited cohort study of 42 enterprise accounts over 180 consecutive operating days. Individual outcomes and efficiency metrics may vary based on deployment scale.', 'Financial & Claims', ARRAY['Legal', 'Disclaimer', 'ROI', 'FTC'], 'Active', NULL, NULL);

        -- Update replacement for banned item
        UPDATE public.knowledge_items 
        SET replacement = 'Streamlined / Enterprise-grade / Advanced Governance'
        WHERE organization_id = demo_org_id AND type = 'banned';
    END IF;

END $$;

