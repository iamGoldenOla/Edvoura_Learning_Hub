import { MetadataRoute } from 'next';
import { supabaseAdmin } from '@/utils/supabase/admin';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://edvouralearninghub.com';

  const defaultRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/dash/student/quiz-bank`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
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
        priority: 0.7,
      }));

      return [...defaultRoutes, ...dynamicRoutes];
    }
  } catch (e) {
    console.error('[SITEMAP GENERATION ERROR]', e);
  }

  return defaultRoutes;
}
