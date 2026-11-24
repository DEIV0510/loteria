import type { MetadataRoute } from 'next';
import { fechaSlug } from '@/lib/fechas';
import { JUEGOS } from '@/lib/juegos';
import { filas } from '@/lib/db';
import { fechasConResultados } from '@/lib/resultados';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
  const ahora = new Date();
  const fijas = ['', '/chances', '/loterias', '/buscar', '/resultados/ayer'].map((p) => ({
    url: `${base}${p}`,
    lastModified: ahora,
    changeFrequency: 'hourly' as const,
    priority: p === '' ? 1 : 0.8,
  }));
  const juegos = JUEGOS.map((j) => ({ url: `${base}/${j.slug}`, lastModified: ahora, changeFrequency: 'hourly' as const, priority: 0.9 }));
  const dias = (await fechasConResultados(60)).map((f) => ({ url: `${base}/resultados/${fechaSlug(f)}`, changeFrequency: 'monthly' as const, priority: 0.5 }));
  const porFecha = (
    await filas<{ juego: string; fecha: string }>('SELECT juego, fecha FROM resultados ORDER BY fecha DESC LIMIT 5000')
  ).map((r) => ({ url: `${base}/${r.juego}/${fechaSlug(String(r.fecha))}`, changeFrequency: 'yearly' as const, priority: 0.4 }));
  return [...fijas, ...juegos, ...dias, ...porFecha];
}
