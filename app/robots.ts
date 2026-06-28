import type { MetadataRoute } from 'next';
import { BASE_URL } from '../config/seo';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: [
          'OAI-SearchBot',
          'ChatGPT-User',
          'PerplexityBot',
          'Perplexity-User',
          'ClaudeBot',
          'Claude-User',
          'Claude-SearchBot',
          'Google-Extended',
        ],
        allow: '/',
      },
      {
        userAgent: 'GPTBot',
        allow: '/',
      },
      {
        userAgent: '*',
        allow: '/',
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
