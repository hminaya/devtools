import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Use - Developer Tools Dashboard',
  description: 'Terms of use for the Developer Tools Dashboard.',
  alternates: {
    canonical: '/terms-of-use',
  },
  openGraph: {
    url: 'https://developers.do/terms-of-use',
    title: 'Terms of Use - Developer Tools Dashboard',
    description: 'Terms of use for the Developer Tools Dashboard.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Developer Tools Dashboard' }],
  },
};

export default function TermsOfUsePage() {
  return (
    <div className="p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Terms of Use</h1>
        <p className="text-slate-600 mb-8">Last updated: March 8, 2025</p>

        <div className="space-y-6 text-slate-700">
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Acceptance</h2>
            <p>
              By using this website, you agree to these Terms of Use. If you do not agree, do not
              use the site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Use of the Tools</h2>
            <p>
              The tools are provided for general informational and productivity purposes. You are
              responsible for how you use the output and for complying with applicable laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">No Warranty</h2>
            <p>
              The site and tools are provided &quot;as is&quot; without warranties of any kind.
              We do not guarantee accuracy, reliability, or availability.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, we are not liable for any damages arising
              from your use of the site or tools.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Changes</h2>
            <p>
              We may update these terms at any time by posting a revised version on this page.
              Continued use of the site means you accept the updated terms.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
