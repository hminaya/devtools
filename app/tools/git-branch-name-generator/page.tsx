import type { Metadata } from 'next';
import GitBranchGenerator from '../../../components/tools/GitBranchGenerator/GitBranchGenerator';

export const metadata: Metadata = {
  title: 'Git Branch Name Generator - Clean git Branch Names',
  description: 'Convert a feature description into a clean, git-safe branch name. Optional prefix (feat, fix, chore, etc.) and ticket id. Includes copy-paste checkout and push commands.',
  alternates: {
    canonical: '/tools/git-branch-name-generator',
  },
  openGraph: {
    url: 'https://www.developers.do/tools/git-branch-name-generator',
    title: 'Git Branch Name Generator',
    description: 'Create clean kebab-case git branch names with a prefix and optional ticket id.',
    images: [{ url: '/og/tools/git-branch-name-generator.png', width: 1200, height: 630, alt: 'Git Branch Name Generator tool preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/git-branch-name-generator.png'],
  },
};

export default function GitBranchGeneratorPage() {
  return <GitBranchGenerator />;
}