import { MetadataRoute } from 'next';
import { supabaseAdmin } from '@/utils/supabase/admin';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://edvouralearninghub.com';

  const coreMarketingRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/online-tutoring-uzbekistan`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  try {
    const { data: seoPages } = await supabaseAdmin
      .from('seo_landing_pages')
      .select('slug, region_code, grade_band, last_regenerated_at');

    if (seoPages && seoPages.length > 0) {
      const dynamicRoutes: MetadataRoute.Sitemap = seoPages.map((page) => ({
        url: `${baseUrl}/practice/${page.slug.replace('practice-', '').replace(/-/g, '/')}`,
        lastModified: new Date(page.last_regenerated_at || Date.now()),
        changeFrequency: 'weekly',
        priority: 0.8,
      }));

      return [...coreMarketingRoutes, ...dynamicRoutes];
    }
  } catch (e) {
    console.error('[SITEMAP GENERATION ERROR]', e);
  }

  return coreMarketingRoutes;
}
