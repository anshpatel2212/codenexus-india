import Link from 'next/link';
import { BrandSenseLogo } from '@/components/ui/BrandSenseLogo';

export default function PrivacyPage() {
  return (
    <div className="bs-app-shell min-h-screen font-sans text-[#20364A]">
      <nav className="h-[82px] flex items-center justify-between px-6 sm:px-10" aria-label="Privacy policy navigation">
        <BrandSenseLogo />
        <Link href="/signup" className="text-sm font-semibold text-[#416F89] hover:text-[#20364A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#416F89] rounded">
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
            This demo stores account and session data locally in your browser so you can explore
            the BrandSense experience. No data is transmitted to an external service.
          </p>

          <div className="mt-8 space-y-6 text-sm leading-relaxed text-[#263B4D]">
            <section>
              <h2 className="text-base font-bold text-[#20364A]">What we store</h2>
              <p className="mt-1.5">
                Your name, email address, organisation, role, and a hashed password are stored in
                your browser&apos;s local storage. Your session is stored alongside them.
              </p>
            </section>
            <section>
              <h2 className="text-base font-bold text-[#20364A]">How it is used</h2>
              <p className="mt-1.5">
                Account data is used only to sign you in and personalise your workspace. It is not
                shared with third parties in this demo environment.
              </p>
            </section>
            <section>
              <h2 className="text-base font-bold text-[#20364A]">Your controls</h2>
              <p className="mt-1.5">
                Signing out clears your session. Clearing your browser storage removes your local
                account data entirely.
              </p>
            </section>
          </div>

          <Link
            href="/signup"
            className="mt-8 inline-flex items-center justify-center rounded-lg bg-[#20364A] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#416F89] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#416F89]"
          >
            Return to sign up
          </Link>
        </div>
      </main>
    </div>
  );
}
