import Link from 'next/link';
import { BrandSenseLogo } from '@/components/ui/BrandSenseLogo';

export default function TermsPage() {
  return (
    <div className="bs-app-shell min-h-screen font-sans text-[#263B4D]">
      <nav className="h-[82px] flex items-center justify-between px-6 sm:px-10">
        <BrandSenseLogo />
        <Link href="/signup" className="text-sm font-semibold text-[#416F89] hover:text-[#20364A]">
          ← Back to sign up
        </Link>
      </nav>

      <main className="max-w-3xl mx-auto px-5 pb-16">
        <div className="bs-glass rounded-3xl border border-white p-7 sm:p-10">
          <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#718494]">
            BrandSense
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#20364A]">
            Terms of Service
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[#81909C]">
            This demo workspace is provided for evaluation purposes. By creating an account you
            agree to use BrandSense responsibly and to keep your sign-in details confidential.
          </p>

          <div className="mt-8 space-y-6 text-sm leading-relaxed text-[#526B7C]">
            <section>
              <h2 className="text-base font-bold text-[#20364A]">Account access</h2>
              <p className="mt-1.5">
                Accounts are personal to the registered user. Do not share your password or use
                another person&apos;s account without permission.
              </p>
            </section>
            <section>
              <h2 className="text-base font-bold text-[#20364A]">Acceptable use</h2>
              <p className="mt-1.5">
                Content submitted for review must be lawful and owned or licensed by your
                organisation. BrandSense may retain review history to support governance and audit
                trails.
              </p>
            </section>
            <section>
              <h2 className="text-base font-bold text-[#20364A]">Contact</h2>
              <p className="mt-1.5">
                Questions about these terms can be directed to your workspace administrator.
              </p>
            </section>
          </div>

          <Link
            href="/signup"
            className="mt-8 inline-flex items-center justify-center rounded-xl bg-[#20364A] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#416F89]"
          >
            Return to sign up
          </Link>
        </div>
      </main>
    </div>
  );
}
