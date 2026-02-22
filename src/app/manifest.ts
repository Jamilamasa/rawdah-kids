import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Rawdah Kids',
    short_name: 'Rawdah Kids',
    description: 'Your Islamic learning adventure!',
    start_url: '/',
    display: 'standalone',
    background_color: '#D8F3DC',
    theme_color: '#2D6A4F',
    icons: [
      {
        src: '/icon',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}
