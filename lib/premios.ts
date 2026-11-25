// Premio mayor de cada lotería. Valores de partida tomados el 25-nov-2026 de la página
// de referencia del cliente (loteriasdehoy.co); el dueño los cambia desde el panel.
import { filas, q } from './db';

export const PREMIOS_BASE: Record<string, number> = {
  'loteria-de-cundinamarca': 10_000,
  'loteria-del-tolima': 3_500,
  'loteria-de-la-cruz-roja': 10_000,
  'loteria-del-huila': 2_000,
  'loteria-de-manizales': 3_000,
  'loteria-del-meta': 1_800,
  'loteria-del-valle': 9_000,
  'loteria-de-bogota': 12_000,
  'loteria-del-quindio': 2_000,
  'loteria-de-medellin': 16_000,
  'loteria-de-risaralda': 2_333,
  'loteria-de-santander': 6_000,
  'loteria-de-boyaca': 15_000,
  'loteria-del-cauca': 8_000,
  'extra-de-colombia': 14_000,
};

/** Premio mayor en millones de pesos por lotería (lo del panel manda sobre los valores de partida). */
export async function leerPremios(): Promise<Record<string, number>> {
  const r = await filas<{ clave: string; valor: string }>("SELECT clave, valor FROM ajustes WHERE clave LIKE 'premio:%'");
  const m = { ...PREMIOS_BASE };
  for (const x of r) {
    const n = Number(x.valor);
    const slug = String(x.clave).slice('premio:'.length);
    if (Number.isFinite(n) && n > 0) m[slug] = n;
    else delete m[slug];
  }
  return m;
}

export async function guardarPremio(slug: string, millones: number | null) {
  await q('INSERT INTO ajustes (clave, valor) VALUES (?, ?) ON CONFLICT(clave) DO UPDATE SET valor = excluded.valor', [
    `premio:${slug}`,
    millones && millones > 0 ? String(millones) : '0',
  ]);
}

/** 10000 -> "$10.000 millones" */
export function textoPremio(millones: number | undefined | null): string | null {
  if (!millones) return null;
  return `$${millones.toLocaleString('es-CO')} millones`;
}
