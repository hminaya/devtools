import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';
import { TOOLS } from '../config/tools';
import { BASE_URL, LAST_MODIFIED, TOOL_CATEGORIES, getInternalCategoryTools } from '../config/seo';

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
  }));

  const categoryRoutes = TOOL_CATEGORIES
    .filter((category) => getInternalCategoryTools(category.name).length > 0)
    .map((category) => ({
      url: `${BASE_URL}/tools/${category.slug}`,
      lastModified: categoryLastModified(category.name),
    }));

  return [
    {
      url: BASE_URL,
      lastModified: LAST_MODIFIED,
    },
    {
      url: `${BASE_URL}/privacy-policy`,
      lastModified: new Date('2025-03-08'),
    },
    {
      url: `${BASE_URL}/terms-of-use`,
      lastModified: new Date('2025-03-08'),
    },
    ...categoryRoutes,
    ...toolRoutes,
  ];
}
