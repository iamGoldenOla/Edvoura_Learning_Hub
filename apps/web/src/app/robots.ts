import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://edvouralearninghub.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/practice',
          '/practice/*',
          '/services',
          '/about',
          '/pricing',
          '/contact',
          '/blog',
          '/careers',
          '/login',
          '/signup',
          '/favicon.ico',
          '/icon.svg',
          '/manifest.json',
        ],
        disallow: [
          '/api/*',
          '/dash/*',
          '/_next/*',
          '/auth/callback',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/practice/*',
          '/services',
          '/about',
          '/pricing',
          '/contact',
        ],
        disallow: [
          '/api/*',
          '/dash/*',
          '/_next/*',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
