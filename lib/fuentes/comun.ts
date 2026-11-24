// Utilidades compartidas por los lectores de fuentes.

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36';

export async function traerHTML(url: string, ms = 12000): Promise<string> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(url, {
      headers: { 'user-agent': UA, 'accept-language': 'es-CO,es;q=0.9' },
      signal: ctrl.signal,
      cache: 'no-store',
    });
    if (!r.ok) throw new Error(`HTTP ${r.status} en ${url}`);
    return await r.text();
  } finally {
    clearTimeout(t);
  }
}

export function limpio(s: string | undefined | null): string {
  return (s ?? '').replace(/\s+/g, ' ').trim();
}

export function soloDigitos(s: string): string {
  return s.replace(/\D/g, '');
}

const SIGNOS: Record<string, string> = {
  aries: 'Aries', tauro: 'Tauro', geminis: 'Géminis', cancer: 'Cáncer', leo: 'Leo', virgo: 'Virgo',
  libra: 'Libra', escorpion: 'Escorpio', escorpio: 'Escorpio', sagitario: 'Sagitario',
  capricornio: 'Capricornio', acuario: 'Acuario', piscis: 'Piscis',
};

/** Normaliza el nombre del signo ("Escorpion" -> "Escorpio", "geminis" -> "Géminis"). */
export function signoNormal(s: string | null | undefined): string | null {
  if (!s) return null;
  const k = s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
  return SIGNOS[k] ?? null;
}
