// Lectura y escritura de resultados.
import { filas, q } from './db';
import type { FilaResultado, Resultado } from './tipos';

type Cruda = Record<string, unknown>;

function json<T>(v: unknown): T | null {
  if (typeof v !== 'string' || !v) return null;
  try {
    return JSON.parse(v) as T;
  } catch {
    return null;
  }
}

function aFila(r: Cruda): FilaResultado {
  return {
    juego: String(r.juego),
    fecha: String(r.fecha),
    sorteo: (r.sorteo as string) ?? null,
    numero: String(r.numero),
    serie: (r.serie as string) ?? null,
    quinta: (r.quinta as string) ?? null,
    signo: (r.signo as string) ?? null,
    balotas: json(r.balotas),
    revancha: json(r.revancha),
    secos: json(r.secos),
    fuente: String(r.fuente),
    manual: Number(r.manual) === 1,
    creado: String(r.creado),
    actualizado: String(r.actualizado),
  };
}

const s = (v: unknown) => (v == null || v === '' ? null : JSON.stringify(v));

/**
 * Guarda un resultado. Lo que el administrador cargó a mano no lo pisa el robot.
 * Devuelve 'nuevo' | 'actualizado' | 'igual' | 'protegido'.
 */
export async function guardarResultado(r: Resultado, opciones: { manual?: boolean } = {}) {
  const manual = opciones.manual ? 1 : 0;
  const ahora = new Date().toISOString();
  const previo = (await filas<Cruda>('SELECT * FROM resultados WHERE juego = ? AND fecha = ?', [r.juego, r.fecha]))[0];

  if (previo && Number(previo.manual) === 1 && !manual) return 'protegido' as const;

  if (previo) {
    const antes = aFila(previo);
    const cambia =
      antes.numero !== r.numero ||
      (r.serie ?? null) !== antes.serie ||
      (r.quinta ?? null) !== antes.quinta ||
      (r.signo ?? null) !== antes.signo ||
      (r.sorteo && r.sorteo !== antes.sorteo) ||
      (r.secos?.length ?? 0) > (antes.secos?.length ?? 0) ||
      (r.revancha && !antes.revancha) ||
      Number(previo.manual) !== manual;
    if (!cambia) return 'igual' as const;
    await q(
      `UPDATE resultados SET sorteo = COALESCE(?, sorteo), numero = ?, serie = ?, quinta = ?, signo = ?,
        balotas = COALESCE(?, balotas), revancha = COALESCE(?, revancha), secos = COALESCE(?, secos),
        fuente = ?, manual = ?, actualizado = ?
       WHERE juego = ? AND fecha = ?`,
      [r.sorteo ?? null, r.numero, r.serie ?? null, r.quinta ?? null, r.signo ?? null,
        s(r.balotas), s(r.revancha), s(r.secos), r.fuente, manual, ahora, r.juego, r.fecha],
    );
    return 'actualizado' as const;
  }

  await q(
    `INSERT INTO resultados (juego, fecha, sorteo, numero, serie, quinta, signo, balotas, revancha, secos, fuente, manual, creado, actualizado)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [r.juego, r.fecha, r.sorteo ?? null, r.numero, r.serie ?? null, r.quinta ?? null, r.signo ?? null,
      s(r.balotas), s(r.revancha), s(r.secos), r.fuente, manual, ahora, ahora],
  );
  return 'nuevo' as const;
}

export async function borrarResultado(juego: string, fecha: string) {
  await q('DELETE FROM resultados WHERE juego = ? AND fecha = ?', [juego, fecha]);
}

export async function resultadosDelDia(fecha: string): Promise<FilaResultado[]> {
  return (await filas<Cruda>('SELECT * FROM resultados WHERE fecha = ?', [fecha])).map(aFila);
}

export async function resultado(juego: string, fecha: string): Promise<FilaResultado | null> {
  const r = await filas<Cruda>('SELECT * FROM resultados WHERE juego = ? AND fecha = ?', [juego, fecha]);
  return r[0] ? aFila(r[0]) : null;
}

/** Último resultado de cada juego. */
export async function ultimos(): Promise<Map<string, FilaResultado>> {
  const r = await filas<Cruda>(
    `SELECT r.* FROM resultados r
     JOIN (SELECT juego, MAX(fecha) AS f FROM resultados GROUP BY juego) u
       ON u.juego = r.juego AND u.f = r.fecha`,
  );
  return new Map(r.map((x) => [String(x.juego), aFila(x)]));
}

export async function historial(juego: string, limite = 30, antesDe?: string): Promise<FilaResultado[]> {
  const r = antesDe
    ? await filas<Cruda>('SELECT * FROM resultados WHERE juego = ? AND fecha < ? ORDER BY fecha DESC LIMIT ?', [juego, antesDe, limite])
    : await filas<Cruda>('SELECT * FROM resultados WHERE juego = ? ORDER BY fecha DESC LIMIT ?', [juego, limite]);
  return r.map(aFila);
}

/** Busca un número de 3 o 4 cifras en chances y loterías desde una fecha. */
export async function buscarNumero(numero: string, desde: string): Promise<FilaResultado[]> {
  const n = numero.replace(/\D/g, '');
  if (n.length < 2 || n.length > 4) return [];
  const r = await filas<Cruda>(
    `SELECT * FROM resultados
     WHERE fecha >= ? AND balotas IS NULL AND (numero = ? OR substr(numero, -?) = ?)
     ORDER BY fecha DESC, juego LIMIT 200`,
    [desde, n, n.length, n],
  );
  return r.map(aFila);
}

/** Fechas con resultado de un juego (para el mapa del sitio y la navegación). */
export async function fechasDe(juego: string, limite = 400): Promise<string[]> {
  const r = await filas<{ fecha: string }>('SELECT fecha FROM resultados WHERE juego = ? ORDER BY fecha DESC LIMIT ?', [juego, limite]);
  return r.map((x) => String(x.fecha));
}

export async function fechasConResultados(limite = 120): Promise<string[]> {
  const r = await filas<{ fecha: string }>('SELECT DISTINCT fecha FROM resultados ORDER BY fecha DESC LIMIT ?', [limite]);
  return r.map((x) => String(x.fecha));
}

/** Momento (ISO) del último resultado guardado o cambiado: sirve para saber si hay algo nuevo. */
export async function marcaDeCambio(): Promise<string> {
  const r = await filas<{ m: string | null }>('SELECT MAX(actualizado) AS m FROM resultados');
  return String(r[0]?.m ?? '');
}
