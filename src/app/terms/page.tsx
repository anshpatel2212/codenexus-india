import Link from 'next/link';
import { BrandSenseLogo } from '@/components/ui/BrandSenseLogo';

export default function TermsPage() {
  return (
    <div className="bs-app-shell min-h-screen font-sans text-[#20364A]">
      <nav
        className="h-[82px] flex items-center justify-between px-6 sm:px-10"
        aria-label="Legal terms navigation"
      >
        <BrandSenseLogo />

        <Link
          href="/signup"
          className="text-sm font-semibold text-[#416F89] hover:text-[#20364A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#416F89] rounded"
        >
          ← Back to sign up
        </Link>
      </nav>

      <main className="max-w-3xl mx-auto px-5 pb-16">
        <div className="bs-glass rounded-3xl border border-white p-7 sm:p-10 shadow-card">

          <p className="text-xs font-bold uppercase tracking-wider text-[#4F6576]">
            BrandSense
          </p>

          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#20364A]">
            Terms of Service
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-[#4F6576]">
            Welcome to BrandSense. These Terms of Service govern your
            access to and use of our AI-powered brand governance platform.
            By creating an account or using BrandSense, you agree to
            these terms.
          </p>

          <p className="mt-2 text-xs text-[#718393]">
            Last updated: November 2026
          </p>

          <div className="mt-8 space-y-7 text-sm leading-relaxed text-[#263B4D]">

            <section>
              <h2 className="text-base font-bold text-[#20364A]">
                1. About BrandSense
              </h2>

              <p className="mt-1.5">
                BrandSense is an intelligent brand governance platform
                designed to help organisations maintain consistent,
                accurate, and trustworthy brand communication.
              </p>

              <p className="mt-2">
                The platform provides tools for reviewing content,
                checking brand guidelines, identifying inconsistencies,
                suggesting corrections, and supporting team-based
                review and approval workflows.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-[#20364A]">
                2. Account Registration and Security
              </h2>

              <ul className="mt-2 ml-5 list-disc space-y-2">
                <li>
                  You must provide accurate and complete information
                  when creating an account.
                </li>
                <li>
                  You are responsible for maintaining the confidentiality
                  of your login credentials.
                </li>
                <li>
                  You must not share account access without proper
                  authorisation.
                </li>
                <li>
                  You must notify the appropriate administrator if
                  you suspect unauthorised access to your account.
                </li>
                <li>
                  Access to organisational workspaces is subject to
                  assigned roles and permissions.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-[#20364A]">
                3. Acceptable Use
              </h2>

              <p className="mt-1.5">
                You agree to use BrandSense responsibly and only for
                lawful purposes.
              </p>

              <p className="mt-2">You must not:</p>

              <ul className="mt-2 ml-5 list-disc space-y-2">
                <li>
                  Upload illegal, harmful, deceptive, or unauthorised
                  content.
                </li>
                <li>
                  Attempt to access another user's account or private
                  organisational information.
                </li>
                <li>
                  Circumvent authentication, access controls, or
                  workspace permissions.
                </li>
                <li>
                  Upload content that infringes intellectual property
                  or privacy rights.
                </li>
                <li>
                  Attempt to disrupt, damage, or exploit the platform
                  or its infrastructure.
                </li>
                <li>
                  Use BrandSense to generate or distribute discriminatory
                  or misleading content.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-[#20364A]">
                4. User Content and Brand Materials
              </h2>

              <p className="mt-1.5">
                You or your organisation retain ownership of the content
                and materials you submit to BrandSense, subject to
                applicable third-party rights.
              </p>

              <p className="mt-2">
                This may include:
              </p>

              <ul className="mt-2 ml-5 list-disc space-y-2">
                <li>Brand guidelines and identity documents.</li>
                <li>Approved facts, terminology, and messaging rules.</li>
                <li>Logos, images, and other brand assets.</li>
                <li>Documents, text, and other submitted content.</li>
                <li>Comments, feedback, and review-related information.</li>
              </ul>

              <p className="mt-2">
                You confirm that you have the necessary rights and
                permissions to upload and process the materials
                submitted through your account.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-[#20364A]">
                5. AI-Powered Features
              </h2>

              <p className="mt-1.5">
                BrandSense uses artificial intelligence to analyse
                submitted content, identify potential brand guideline
                violations, explain findings, and recommend corrections.
              </p>

              <p className="mt-2">
                You acknowledge that:
              </p>

              <ul className="mt-2 ml-5 list-disc space-y-2">
                <li>
                  AI-generated results may contain inaccuracies or
                  incomplete information.
                </li>
                <li>
                  AI recommendations are suggestions and should be
                  reviewed by authorised individuals.
                </li>
                <li>
                  BrandSense does not guarantee that every brand
                  inconsistency or unsupported claim will be detected.
                </li>
                <li>
                  Users remain responsible for reviewing and approving
                  content before publication.
                </li>
                <li>
                  AI functionality may depend on third-party models
                  and external service availability.
                </li>
              </ul>

              <p className="mt-2">
                BrandSense is designed to assist human decision-making,
                not replace authorised human judgement.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-[#20364A]">
                6. Review and Approval Workflows
              </h2>

              <p className="mt-1.5">
                BrandSense may provide collaboration features that
                allow creators, managers, and authorised reviewers
                to comment on content, request revisions, and approve
                submissions.
              </p>

              <p className="mt-2">
                Users are responsible for ensuring that approvals
                are provided by appropriately authorised individuals.
                An AI-generated recommendation or automated check
                does not constitute final organisational approval.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-[#20364A]">
                7. Data Privacy and Confidentiality
              </h2>

              <p className="mt-1.5">
                We recognise that organisational brand guidelines,
                internal documents, and approved messaging may contain
                confidential information.
              </p>

              <p className="mt-2">
                Users must ensure that they are authorised to submit
                confidential materials to the platform and its
                configured service providers.
              </p>

              <p className="mt-2">
                The collection, processing, storage, and handling
                of personal information are described in our
                Privacy Policy.
              </p>

              <p className="mt-2">
                We encourage users to review the Privacy Policy
                before submitting personal or confidential information.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-[#20364A]">
                8. Intellectual Property
              </h2>

              <p className="mt-1.5">
                BrandSense's platform, interface, software, design,
                branding, and original technology remain the
                intellectual property of their respective owners.
              </p>

              <p className="mt-2">
                These terms do not transfer ownership of BrandSense
                intellectual property or the brand materials
                uploaded by users.
              </p>

              <p className="mt-2">
                Users must respect applicable copyright, trademark,
                licensing, and other intellectual property rights.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-[#20364A]">
                9. Platform Availability and Limitations
              </h2>

              <p className="mt-1.5">
                We aim to provide a reliable and accessible platform.
                However, uninterrupted availability cannot be guaranteed.
              </p>

              <p className="mt-2">
                Features may occasionally be unavailable due to
                maintenance, technical issues, infrastructure
                limitations, or external service interruptions.
              </p>

              <p className="mt-2">
                Certain features and integrations may evolve as
                BrandSense continues to develop.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-[#20364A]">
                10. Account Suspension and Termination
              </h2>

              <p className="mt-1.5">
                Access to BrandSense may be restricted or suspended
                where necessary to protect platform security, enforce
                these terms, address misuse, or comply with applicable
                legal requirements.
              </p>

              <p className="mt-2">
                Users may request account closure through the
                appropriate account administrator or designated
                support channel.
              </p>

              <p className="mt-2">
                Any applicable data retention or deletion requirements
                will be handled in accordance with the Privacy Policy
                and applicable law.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-[#20364A]">
                11. Limitation of Responsibility
              </h2>

              <p className="mt-1.5">
                BrandSense provides content review and brand governance
                assistance. It does not guarantee legal compliance,
                factual accuracy, marketing performance, or complete
                prevention of brand-related errors.
              </p>

              <p className="mt-2">
                Organisations and users remain responsible for their
                published content, business decisions, and final
                approval processes.
              </p>

              <p className="mt-2">
                Nothing in these terms excludes or limits any
                liability that cannot legally be excluded or limited
                under applicable law.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-[#20364A]">
                12. Changes to These Terms
              </h2>

              <p className="mt-1.5">
                We may update these Terms of Service as the platform
                evolves or applicable requirements change.
                Updated terms will be made available through
                the platform.
              </p>

              <p className="mt-2">
                Continued use of BrandSense after updated terms
                become effective will be subject to applicable
                notice and acceptance requirements.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-[#20364A]">
                13. Contact and Support
              </h2>

              <p className="mt-1.5">
                If you have questions about these Terms of Service,
                your account, or the use of BrandSense, please
                contact your workspace administrator or the
                BrandSense support team through the designated
                support channel.
              </p>
            </section>

          </div>

          <div className="mt-9 border-t border-[#DCE5EA] pt-6">
            <p className="text-xs leading-relaxed text-[#718393]">
              BrandSense — Make Every Message Matter.
              <br />
              Intelligent brand governance. Consistent communication.
              Human-controlled decisions.
            </p>
          </div>

          <Link
            href="/signup"
            className="mt-7 inline-flex items-center justify-center rounded-lg bg-[#20364A] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#416F89] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#416F89]"
          >
            Return to sign up
          </Link>

        </div>
      </main>
    </div>
  );
}