import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';
import { TOOLS } from '../config/tools';

const BASE_URL = 'https://developers.do';

export default function sitemap(): MetadataRoute.Sitemap {
  const toolRoutes = TOOLS.filter((tool) => !tool.external).map((tool) => ({
    url: `${BASE_URL}${tool.route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...toolRoutes,
  ];
}
