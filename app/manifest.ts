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
    background_color: '#f3faf6',
    theme_color: '#05532a',
    lang: 'es-CO',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  };
}
