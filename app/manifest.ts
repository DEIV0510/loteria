import type { MetadataRoute } from 'next';
import { leerAjustes } from '@/lib/ajustes';

export const revalidate = 3600;

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const a = await leerAjustes();
  return {
    name: a.nombre,
    short_name: a.nombre.length > 14 ? 'Resultados' : a.nombre,
    description: 'Resultados de loterías y chances de Colombia, al momento.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f3f1ea',
    theme_color: '#111317',
    lang: 'es-CO',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  };
}
