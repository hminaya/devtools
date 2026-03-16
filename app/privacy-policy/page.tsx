import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - Developer Tools Dashboard',
  description: 'Privacy policy for the Developer Tools Dashboard.',
  openGraph: {
    url: 'https://developers.do/privacy-policy',
    title: 'Privacy Policy - Developer Tools Dashboard',
    description: 'Privacy policy for the Developer Tools Dashboard.',
    images: [{ url: 'https://developers.do/favicon.png' }],
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
        <p className="text-slate-600 mb-8">Last updated: March 8, 2025</p>

        <div className="space-y-6 text-slate-700">
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Overview</h2>
            <p>
              This website runs entirely in your browser. The tools do not send the content you
              enter to any server. We do not collect or store user-generated data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Analytics</h2>
            <p>
              We use Google Analytics to understand aggregate usage of the site. Analytics are
              controlled by your consent choice:
            </p>
            <ul className="mt-3 space-y-2 list-disc list-inside">
              <li><strong>Accept All</strong> — full analytics with cookies for cross-session tracking.</li>
              <li><strong>Keep Anonymized</strong> — cookieless, anonymized analytics. No personal data or cookies are set. Aggregate usage data is collected.</li>
              <li><strong>Reject All</strong> — analytics storage is denied. No cookies are set.</li>
            </ul>
            <p className="mt-3">
              You can change your preference at any time using the{' '}
              <strong>Cookie Preferences</strong> link in the footer. Analytics data is processed
              by Google in accordance with their{' '}
              <a
                className="text-slate-900 underline"
                href="https://policies.google.com/privacy"
                rel="noreferrer"
                target="_blank"
              >
                privacy policy
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Cookies</h2>
            <p>
              Google Analytics cookies are only set if you choose <strong>Accept All</strong>.
              Your consent preference is stored in <code>localStorage</code> on your device.
              The developer tools themselves do not require cookies to function.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Third-Party Links</h2>
            <p>
              This site may link to third-party resources. We are not responsible for the privacy
              practices of those sites.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Changes</h2>
            <p>
              We may update this policy from time to time. Changes will be posted on this page with
              an updated date.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
