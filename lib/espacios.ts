// Espacios de imagen + enlace que el dueño maneja desde el celular.
import { randomBytes } from 'node:crypto';
import { filas, q } from './db';

export const ESPACIOS = [
  { id: 'encabezado', nombre: 'Encabezado', ayuda: 'Arriba de todo, debajo del nombre del sitio' },
  { id: 'debajo', nombre: 'Debajo del encabezado', ayuda: 'Justo antes de los resultados de hoy' },
  { id: 'mitad', nombre: 'Mitad de la página', ayuda: 'Entre los chances y las loterías' },
  { id: 'abajo', nombre: 'Final de la página', ayuda: 'Antes del pie de página' },
] as const;

export type IdEspacio = (typeof ESPACIOS)[number]['id'];

export type Espacio = {
  id: IdEspacio;
  imagen: string | null; // id del medio
  enlace: string;
  texto: string; // texto alternativo de la imagen
  activo: boolean;
  actualizado: string | null;
  ancho: number | null;
  alto: number | null;
};

export async function leerEspacios(): Promise<Map<IdEspacio, Espacio>> {
  const r = await filas<Record<string, unknown>>(
    `SELECT e.*, m.ancho, m.alto FROM espacios e LEFT JOIN medios m ON m.id = e.imagen`,
  );
  const m = new Map<IdEspacio, Espacio>();
  for (const base of ESPACIOS) {
    m.set(base.id, { id: base.id, imagen: null, enlace: '', texto: '', activo: false, actualizado: null, ancho: null, alto: null });
  }
  for (const x of r) {
    const id = String(x.id) as IdEspacio;
    if (!m.has(id)) continue;
    m.set(id, {
      id,
      imagen: (x.imagen as string) ?? null,
      enlace: String(x.enlace ?? ''),
      texto: String(x.texto ?? ''),
      activo: Number(x.activo) === 1,
      actualizado: (x.actualizado as string) ?? null,
      ancho: x.ancho == null ? null : Number(x.ancho),
      alto: x.alto == null ? null : Number(x.alto),
    });
  }
  return m;
}

export async function guardarEspacio(e: { id: IdEspacio; imagen?: string | null; enlace: string; texto: string; activo: boolean }) {
  const ahora = new Date().toISOString();
  const previo = (await filas<{ imagen: string | null }>('SELECT imagen FROM espacios WHERE id = ?', [e.id]))[0];
  const imagen = e.imagen === undefined ? (previo?.imagen ?? null) : e.imagen;
  await q(
    `INSERT INTO espacios (id, imagen, enlace, texto, activo, actualizado) VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET imagen = excluded.imagen, enlace = excluded.enlace, texto = excluded.texto,
       activo = excluded.activo, actualizado = excluded.actualizado`,
    [e.id, imagen, e.enlace, e.texto, e.activo ? 1 : 0, ahora],
  );
  // La imagen anterior ya no se usa en ningún espacio: se borra.
  if (previo?.imagen && previo.imagen !== imagen) {
    await q('DELETE FROM medios WHERE id = ? AND id NOT IN (SELECT imagen FROM espacios WHERE imagen IS NOT NULL)', [previo.imagen]);
  }
}

export async function guardarMedio(datos: Uint8Array, tipo: string, ancho: number | null, alto: number | null): Promise<string> {
  const id = randomBytes(10).toString('hex');
  await q('INSERT INTO medios (id, tipo, datos, ancho, alto, creado) VALUES (?, ?, ?, ?, ?, ?)', [
    id, tipo, datos, ancho, alto, new Date().toISOString(),
  ]);
  return id;
}

export async function leerMedio(id: string): Promise<{ tipo: string; datos: Uint8Array } | null> {
  if (!/^[a-f0-9]{20}$/.test(id)) return null;
  const r = await filas<{ tipo: string; datos: ArrayBuffer | Uint8Array }>('SELECT tipo, datos FROM medios WHERE id = ?', [id]);
  if (!r[0]) return null;
  const d = r[0].datos;
  return { tipo: String(r[0].tipo), datos: d instanceof Uint8Array ? d : new Uint8Array(d) };
}

/** Enlace válido: http(s), wa.me, chat.whatsapp.com… o tel:. */
export function enlaceValido(u: string): boolean {
  const t = u.trim();
  if (!t) return false;
  if (/^tel:\+?\d{7,15}$/.test(t)) return true;
  try {
    const url = new URL(t);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}
