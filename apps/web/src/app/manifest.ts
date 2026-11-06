import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Edvoura Learning Hub',
    short_name: 'Edvoura',
    description: 'Premier K-12 Online Tutoring & Interactive Learning Platform',
    start_url: '/',
    display: 'standalone',
    background_color: '#FFFFFF',
    theme_color: '#F5C518',
    icons: [
      {
        src: '/icon.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
      },
      {
        src: '/favicon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      {
        src: '/favicon.ico',
        sizes: '32x32',
        type: 'image/x-icon',
      },
    ],
  };
}
