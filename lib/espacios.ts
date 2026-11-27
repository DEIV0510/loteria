// Imágenes con enlace que el dueño maneja desde el celular.
// Hay 6; en cada una elige dónde va. Si dos caen en el mismo lugar, se ven lado a lado.
import { randomBytes } from 'node:crypto';
import { filas, q } from './db';

export const POSICIONES = [
  { id: 'arriba', nombre: 'Arriba de todo', ayuda: 'Debajo del menú, antes de los resultados' },
  { id: 'sobre-resultado', nombre: 'Encima del resultado', ayuda: 'En la parte verde, justo encima del último resultado (en la portada y en la página de cada sorteo)' },
  { id: 'bajo-resultado', nombre: 'Debajo del resultado', ayuda: 'Justo debajo del último resultado; el reloj del próximo sorteo baja un poco (en la portada y en la página de cada sorteo)' },
  { id: 'debajo', nombre: 'Debajo de las loterías', ayuda: 'Justo después de los resultados principales (recomendado)' },
  { id: 'mitad', nombre: 'Mitad de la página', ayuda: 'Entre los chances y las loterías de la semana' },
  { id: 'final', nombre: 'Final de la página', ayuda: 'Antes del pie de página' },
] as const;

export type Posicion = (typeof POSICIONES)[number]['id'];

export const IMAGENES = [
  { id: 'imagen-1', posicion: 'debajo' },
  { id: 'imagen-2', posicion: 'debajo' },
  { id: 'imagen-3', posicion: 'arriba' },
  { id: 'imagen-4', posicion: 'final' },
  { id: 'imagen-5', posicion: 'sobre-resultado' },
  { id: 'imagen-6', posicion: 'bajo-resultado' },
] as const;

export const FORMATOS = [
  { id: '16-9', nombre: 'Horizontal 16:9', ayuda: 'Ideal 1280 × 720 px' },
  { id: '1-1', nombre: 'Cuadrada 1:1', ayuda: 'Ideal 1080 × 1080 px' },
  { id: 'libre', nombre: 'Como la subí', ayuda: 'Se muestra entera, sin recortar' },
] as const;

export type Formato = (typeof FORMATOS)[number]['id'];

export function formatoValido(f: string): f is Formato {
  return FORMATOS.some((x) => x.id === f);
}

export type IdImagen = (typeof IMAGENES)[number]['id'];

export type Espacio = {
  id: IdImagen;
  posicion: Posicion;
  formato: Formato;
  imagen: string | null; // id del medio
  enlace: string;
  texto: string; // texto alternativo de la imagen
  activo: boolean;
  actualizado: string | null;
  ancho: number | null;
  alto: number | null;
};

export function posicionValida(p: string): p is Posicion {
  return POSICIONES.some((x) => x.id === p);
}

export async function leerEspacios(): Promise<Espacio[]> {
  const r = await filas<Record<string, unknown>>(
    `SELECT e.*, m.ancho, m.alto FROM espacios e LEFT JOIN medios m ON m.id = e.imagen`,
  );
  const guardados = new Map(r.map((x) => [String(x.id), x]));
  return IMAGENES.map((base) => {
    const x = guardados.get(base.id);
    const pos = String(x?.posicion ?? '');
    const fmt = String(x?.formato ?? '');
    return {
      id: base.id,
      posicion: posicionValida(pos) ? pos : base.posicion,
      formato: formatoValido(fmt) ? fmt : 'libre',
      imagen: (x?.imagen as string) ?? null,
      enlace: String(x?.enlace ?? ''),
      texto: String(x?.texto ?? ''),
      activo: Number(x?.activo) === 1,
      actualizado: (x?.actualizado as string) ?? null,
      ancho: x?.ancho == null ? null : Number(x.ancho),
      alto: x?.alto == null ? null : Number(x.alto),
    };
  });
}

/** Las imágenes encendidas (con foto y enlace) de un lugar de la página. */
export function enPosicion(lista: Espacio[], p: Posicion): Espacio[] {
  return lista.filter((e) => e.posicion === p && e.activo && e.imagen && e.enlace);
}

export async function guardarEspacio(e: {
  id: IdImagen;
  posicion: Posicion;
  formato: Formato;
  imagen?: string | null;
  enlace: string;
  texto: string;
  activo: boolean;
}) {
  const ahora = new Date().toISOString();
  const previo = (await filas<{ imagen: string | null }>('SELECT imagen FROM espacios WHERE id = ?', [e.id]))[0];
  const imagen = e.imagen === undefined ? (previo?.imagen ?? null) : e.imagen;
  await q(
    `INSERT INTO espacios (id, posicion, formato, imagen, enlace, texto, activo, actualizado) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET posicion = excluded.posicion, formato = excluded.formato, imagen = excluded.imagen, enlace = excluded.enlace,
       texto = excluded.texto, activo = excluded.activo, actualizado = excluded.actualizado`,
    [e.id, e.posicion, e.formato, imagen, e.enlace, e.texto, e.activo ? 1 : 0, ahora],
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
