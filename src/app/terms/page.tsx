import Link from 'next/link';
import { BrandSenseLogo } from '@/components/ui/BrandSenseLogo';

export default function TermsPage() {
  return (
<<<<<<< HEAD
    <div className="bs-app-shell min-h-screen font-sans text-[#263B4D]">
      <nav className="h-[82px] flex items-center justify-between px-6 sm:px-10">
        <BrandSenseLogo />
        <Link href="/signup" className="text-sm font-semibold text-[#416F89] hover:text-[#20364A]">
=======
    <div className="bs-app-shell min-h-screen font-sans text-[#20364A]">
      <nav className="h-[82px] flex items-center justify-between px-6 sm:px-10" aria-label="Legal terms navigation">
        <BrandSenseLogo />
        <Link href="/signup" className="text-sm font-semibold text-[#416F89] hover:text-[#20364A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#416F89] rounded">
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
          ← Back to sign up
        </Link>
      </nav>

      <main className="max-w-3xl mx-auto px-5 pb-16">
<<<<<<< HEAD
        <div className="bs-glass rounded-3xl border border-white p-7 sm:p-10">
          <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#718494]">
=======
        <div className="bs-glass rounded-3xl border border-white p-7 sm:p-10 shadow-card">
          <p className="text-xs font-bold uppercase tracking-wider text-[#4F6576]">
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
            BrandSense
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#20364A]">
            Terms of Service
          </h1>
<<<<<<< HEAD
          <p className="mt-3 text-sm leading-relaxed text-[#81909C]">
=======
          <p className="mt-3 text-sm leading-relaxed text-[#4F6576]">
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
            This demo workspace is provided for evaluation purposes. By creating an account you
            agree to use BrandSense responsibly and to keep your sign-in details confidential.
          </p>

<<<<<<< HEAD
          <div className="mt-8 space-y-6 text-sm leading-relaxed text-[#526B7C]">
=======
          <div className="mt-8 space-y-6 text-sm leading-relaxed text-[#263B4D]">
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
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
<<<<<<< HEAD
            className="mt-8 inline-flex items-center justify-center rounded-xl bg-[#20364A] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#416F89]"
=======
            className="mt-8 inline-flex items-center justify-center rounded-lg bg-[#20364A] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#416F89] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#416F89]"
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
          >
            Return to sign up
          </Link>
        </div>
      </main>
    </div>
  );
}
