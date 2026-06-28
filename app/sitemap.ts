import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';
import { TOOLS } from '../config/tools';
import { BASE_URL, LAST_MODIFIED, TOOL_CATEGORIES } from '../config/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const toLastModified = (updatedAt: string) => new Date(updatedAt);
  const categoryLastModified = (categoryName: string) => {
    const timestamps = TOOLS
      .filter((tool) => tool.category === categoryName)
      .map((tool) => toLastModified(tool.updatedAt).getTime());

    return timestamps.length > 0 ? new Date(Math.max(...timestamps)) : LAST_MODIFIED;
  };

  const toolRoutes = TOOLS.filter((tool) => !tool.external).map((tool) => ({
    url: `${BASE_URL}${tool.route}`,
    lastModified: toLastModified(tool.updatedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  const categoryRoutes = TOOL_CATEGORIES.map((category) => ({
    url: `${BASE_URL}/tools/${category.slug}`,
    lastModified: categoryLastModified(category.name),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${BASE_URL}/privacy-policy`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: `${BASE_URL}/terms-of-use`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    ...categoryRoutes,
    ...toolRoutes,
  ];
}
