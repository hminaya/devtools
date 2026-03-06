import type { Metadata } from 'next';
import NotFoundRecovery from '../components/not-found/NotFoundRecovery';

export const metadata: Metadata = {
  title: '404 | Developer Tools',
  description: 'Page not found. Explore matching developer tools or browse the latest additions.',
};

export default function NotFound() {
  return <NotFoundRecovery />;
}
