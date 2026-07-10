import type { Metadata } from 'next';
import VibeCheck from '../../../components/tools/VibeCheck/VibeCheck';

export const metadata: Metadata = {
  title: 'Vibe Check - AI Code Review Prompt Builder',
  description:
    'Generate copy-ready prompts for reviewing vibe-coded apps. Build AI prompts for security review, production readiness, testing, refactoring, threat modeling, and hidden assumptions.',
  alternates: {
    canonical: '/tools/vibe-check',
  },
  openGraph: {
    url: 'https://www.developers.do/tools/vibe-check',
    title: 'Vibe Check - AI Code Review Prompt Builder',
    description:
      'Create practical prompts for checking security, tests, maintainability, and production readiness in vibe-coded apps.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Developer Tools Dashboard' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og-image.png'],
  },
};

export default function VibeCheckPage() {
  return <VibeCheck />;
}
