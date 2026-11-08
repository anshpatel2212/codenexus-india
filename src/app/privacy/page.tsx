import Link from 'next/link';
import { BrandSenseLogo } from '@/components/ui/BrandSenseLogo';

export default function PrivacyPage() {
  return (
    <div className="bs-app-shell min-h-screen font-sans text-[#20364A]">
      <nav
        className="h-[82px] flex items-center justify-between px-6 sm:px-10"
        aria-label="Privacy policy navigation"
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
            Privacy Policy
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-[#4F6576]">
            At BrandSense, we believe brand governance starts with trust.
            This Privacy Policy explains how information is handled when
            you use our platform to review content, manage brand guidelines,
            collaborate with teams, and access AI-powered recommendations.
          </p>

          <p className="mt-2 text-xs text-[#718393]">
            Last updated: November 2026
          </p>

          <div className="mt-8 space-y-7 text-sm leading-relaxed text-[#263B4D]">

            <section>
              <h2 className="text-base font-bold text-[#20364A]">
                1. Information We Collect
              </h2>

              <p className="mt-1.5">
                Depending on how you use BrandSense, the platform may
                process the following information:
              </p>

              <ul className="mt-3 ml-5 list-disc space-y-2">
                <li>
                  <strong>Account Information:</strong> Name, email address,
                  organisation, role, and authentication information.
                </li>
                <li>
                  <strong>Brand Materials:</strong> Brand guidelines,
                  approved facts, terminology, messaging rules, and
                  reusable brand assets.
                </li>
                <li>
                  <strong>Submitted Content:</strong> Text, documents,
                  images, and other supported content submitted for review.
                </li>
                <li>
                  <strong>Review Information:</strong> AI-generated findings,
                  suggested corrections, comments, approval decisions,
                  and revision history.
                </li>
                <li>
                  <strong>Usage Information:</strong> Relevant activity,
                  application interactions, and technical information
                  required to operate and improve the platform.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-[#20364A]">
                2. How We Use Your Information
              </h2>

              <p className="mt-1.5">
                Information processed through BrandSense is used to:
              </p>

              <ul className="mt-3 ml-5 list-disc space-y-2">
                <li>Authenticate users and manage their workspaces.</li>
                <li>Evaluate content against approved brand guidelines.</li>
                <li>Identify inconsistent tone, terminology, messaging, and claims.</li>
                <li>Provide explanations and suggested corrections.</li>
                <li>Support team collaboration and approval workflows.</li>
                <li>Maintain review history and governance insights.</li>
                <li>Improve platform reliability, security, and performance.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-[#20364A]">
                3. AI Processing and External Services
              </h2>

              <p className="mt-1.5">
                BrandSense uses AI-powered functionality to analyse submitted
                content and generate recommendations. Depending on the
                configured implementation, submitted content and relevant
                brand context may be processed by third-party AI providers
                or other external services.
              </p>

              <p className="mt-2">
                Such processing is subject to the applicable provider's
                privacy and data-handling practices. Users should be aware
                of external processing before submitting confidential
                materials.
              </p>

              <p className="mt-2">
                AI-generated findings are intended to assist human reviewers.
                Important brand decisions and publication approvals
                should remain under authorised human control.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-[#20364A]">
                4. Confidentiality and Data Security
              </h2>

              <p className="mt-1.5">
                We recognise that brand guidelines, internal documents,
                approved messaging, and organisational assets may contain
                confidential information.
              </p>

              <p className="mt-2">
                BrandSense is designed around responsible access management
                and user data isolation. Access to organisational information
                should be restricted according to assigned permissions
                and workspace roles.
              </p>

              <p className="mt-2">
                We aim to protect information against unauthorised access,
                disclosure, alteration, and loss through appropriate
                technical and organisational safeguards.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-[#20364A]">
                5. Data Sharing and Access
              </h2>

              <p className="mt-1.5">
                BrandSense does not intend to make private workspace
                information publicly accessible.
              </p>

              <p className="mt-2">
                Information may be accessible to authorised members
                of the same organisation according to their assigned
                roles and permissions.
              </p>

              <p className="mt-2">
                Information may also be processed by infrastructure,
                hosting, storage, or AI service providers when required
                to deliver platform functionality.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-[#20364A]">
                6. Data Retention and Deletion
              </h2>

              <p className="mt-1.5">
                Information may be retained for as long as necessary
                to provide the platform's services, maintain review
                history, support collaboration, and meet applicable
                operational or legal requirements.
              </p>

              <p className="mt-2">
                Users should be provided with appropriate mechanisms
                to request access, correction, or deletion of their
                personal information, subject to applicable requirements
                and platform capabilities.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-[#20364A]">
                7. Your Privacy Controls
              </h2>

              <p className="mt-1.5">
                Depending on your account permissions and available
                platform functionality, you may be able to:
              </p>

              <ul className="mt-3 ml-5 list-disc space-y-2">
                <li>Access and update your account information.</li>
                <li>Manage your workspace and assigned permissions.</li>
                <li>Control who can access your organisational content.</li>
                <li>Request deletion of eligible information.</li>
                <li>Sign out and terminate your active session.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-[#20364A]">
                8. Human Oversight
              </h2>

              <p className="mt-1.5">
                BrandSense is designed to support human decision-making,
                not replace it. AI-generated suggestions and flagged
                issues should be reviewed by authorised individuals
                before important publication or approval decisions.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-[#20364A]">
                9. Changes to This Policy
              </h2>

              <p className="mt-1.5">
                We may update this Privacy Policy as BrandSense evolves,
                new features are introduced, or applicable privacy
                requirements change. Updated versions will be made
                available through the platform.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-[#20364A]">
                10. Contact Us
              </h2>

              <p className="mt-1.5">
                If you have questions, concerns, or requests regarding
                this Privacy Policy or the handling of your information,
                please contact the BrandSense team through the
                organisation's designated support channel.
              </p>
            </section>

          </div>

          <div className="mt-9 border-t border-[#DCE5EA] pt-6">
            <p className="text-xs leading-relaxed text-[#718393]">
              BrandSense — Make Every Message Matter.
              <br />
              Built for consistent, trustworthy, and responsible brand
              communication.
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