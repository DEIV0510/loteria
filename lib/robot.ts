// El robot: revisa las fuentes solo para los sorteos que ya debieron salir y aún no están.
import { ultimoTurno } from './agenda';
import { anotar, filas, q, soltarCandado, tomarCandado } from './db';
import { consultarAL } from './fuentes/astroluna';
import { consultarRDL } from './fuentes/rdl';
import { JUEGOS } from './juegos';
import { guardarResultado } from './resultados';
import type { Juego, Resultado } from './tipos';

const MIN = 60_000;

export type Reporte = {
  corrio: boolean;
  revisados: string[];
  nuevos: { juego: string; fecha: string; numero: string }[];
  errores: string[];
  ms: number;
};

type Estado = { ultimaFecha: string | null; tieneSecos: boolean; revisado: number };

async function estados(): Promise<Map<string, Estado>> {
  const res = await filas<{ juego: string; f: string; secos: string | null }>(
    `SELECT r.juego, r.fecha AS f, r.secos FROM resultados r
     JOIN (SELECT juego, MAX(fecha) AS f FROM resultados GROUP BY juego) u ON u.juego = r.juego AND u.f = r.fecha`,
  );
  const rev = await filas<{ juego: string; ultima: number }>('SELECT juego, ultima FROM revisiones');
  const m = new Map<string, Estado>();
  for (const j of JUEGOS) m.set(j.slug, { ultimaFecha: null, tieneSecos: false, revisado: 0 });
  for (const r of res) {
    const e = m.get(String(r.juego));
    if (e) {
      e.ultimaFecha = String(r.f);
      e.tieneSecos = !!r.secos;
    }
  }
  for (const r of rev) {
    const e = m.get(String(r.juego));
    if (e) e.revisado = Number(r.ultima);
  }
  return m;
}

/** ¿Toca revisar este juego ahora? Devuelve la prioridad (menor = más urgente) o null. */
function prioridad(j: Juego, e: Estado, ahora: number): number | null {
  const desde = ahora - e.revisado;
  if (!j.horario.some(Boolean)) {
    // Sorteos sin fecha fija: una vez cada 6 horas basta.
    return desde > 360 * MIN ? 900 : null;
  }
  const t = ultimoTurno(j, ahora);
  if (!t) return null;
  const pasado = ahora - t.ms;
  const tengo = e.ultimaFecha !== null && e.ultimaFecha >= t.fecha;

  if (tengo) {
    // Loterías: los premios secos a veces se publican después del número mayor.
    if (j.tipo === 'loteria' && !e.tieneSecos && e.ultimaFecha === t.fecha && pasado < 20 * 60 * MIN) {
      return desde > 15 * MIN ? 500 : null;
    }
    return null;
  }
  if (pasado < 2 * MIN) return null; // todavía se está jugando
  if (pasado > 48 * 60 * MIN) return desde > 360 * MIN ? 800 : null; // festivo o fuente caída: de vez en cuando
  const cada = pasado < 45 * MIN ? 1 * MIN : pasado < 3 * 60 * MIN ? 4 * MIN : 20 * MIN;
  return desde >= cada ? pasado / MIN : null;
}

/** Busca el resultado más reciente de un juego en la fuente A y, si no sirve, en la B. */
async function consultar(j: Juego, ultimaFecha: string | null, errores: string[]): Promise<Resultado | null> {
  const esNuevo = (r: Resultado | null) => !!r && (!ultimaFecha || r.fecha > ultimaFecha);
  let a: Resultado | null = null;
  if (j.fuentes.rdl) {
    try {
      const l = await consultarRDL(j.fuentes.rdl, j.tipo);
      if (l.resultado) a = { ...l.resultado, juego: j.slug };
    } catch (e) {
      errores.push(`${j.slug} rdl: ${(e as Error).message}`);
    }
  }
  if (esNuevo(a)) return a;
  if (j.fuentes.al) {
    try {
      const f = (await consultarAL(j.fuentes.al, j.tipo))[0];
      const b = f ? { ...f, juego: j.slug } : null;
      if (esNuevo(b)) return b;
    } catch (e) {
      errores.push(`${j.slug} al: ${(e as Error).message}`);
    }
  }
  // Nada nuevo: se devuelve lo de la fuente A por si trae datos extra (premios secos, sorteo).
  return a;
}

/**
 * Corre una pasada. `presupuestoMs` limita el tiempo (funciones serverless).
 * `todos` revisa todos los juegos sin mirar horarios (útil para el panel).
 */
export async function correrRobot(
  opciones: { presupuestoMs?: number; todos?: boolean; solo?: string[]; sinEspera?: boolean } = {},
): Promise<Reporte> {
  const inicio = Date.now();
  const presupuesto = opciones.presupuestoMs ?? 25_000;
  const reporte: Reporte = { corrio: false, revisados: [], nuevos: [], errores: [], ms: 0 };

  if (!(await tomarCandado('robot', Math.ceil(presupuesto / 1000) + 15))) {
    reporte.ms = Date.now() - inicio;
    return reporte;
  }
  reporte.corrio = true;
  try {
    const ahora = Date.now();
    const est = await estados();
    // Desde el panel: no esperar el intervalo entre revisiones de cada juego.
    if (opciones.sinEspera) for (const e of est.values()) e.revisado = 0;
    let cola = JUEGOS.map((j) => ({ j, p: opciones.todos ? 0 : prioridad(j, est.get(j.slug)!, ahora) }))
      .filter((x) => x.p !== null)
      .sort((a, b) => (a.p as number) - (b.p as number))
      .map((x) => x.j);
    if (opciones.solo) cola = cola.filter((j) => opciones.solo!.includes(j.slug));

    for (const j of cola) {
      if (Date.now() - inicio > presupuesto) break;
      const e = est.get(j.slug)!;
      reporte.revisados.push(j.slug);
      const r = await consultar(j, e.ultimaFecha, reporte.errores);
      await q(
        `INSERT INTO revisiones (juego, ultima, estado) VALUES (?, ?, ?)
         ON CONFLICT(juego) DO UPDATE SET ultima = excluded.ultima, estado = excluded.estado`,
        [j.slug, Date.now(), r ? `fuente ${r.fuente}: ${r.fecha} ${r.numero}` : 'sin respuesta'],
      );
      if (!r) continue;
      if (e.ultimaFecha && r.fecha < e.ultimaFecha) continue;
      const que = await guardarResultado(r);
      if (que === 'nuevo' || que === 'actualizado') {
        reporte.nuevos.push({ juego: j.slug, fecha: r.fecha, numero: r.numero });
        await anotar('resultado', `${j.nombre} ${r.fecha}: ${r.numero}${r.serie ? ` serie ${r.serie}` : ''} (${que}, fuente ${r.fuente})`);
      }
    }
    if (reporte.errores.length) await anotar('error', reporte.errores.join(' | '));
  } finally {
    await soltarCandado('robot');
    reporte.ms = Date.now() - inicio;
  }
  return reporte;
}

/** Carga el historial (hasta 100 sorteos por juego) desde la fuente B y lo último de la A. */
export async function cargarHistorial(log: (s: string) => void = () => {}) {
  for (const j of JUEGOS) {
    let n = 0;
    if (j.fuentes.al) {
      try {
        for (const f of await consultarAL(j.fuentes.al, j.tipo)) {
          const r = await guardarResultado({ ...f, juego: j.slug });
          if (r === 'nuevo') n++;
        }
      } catch (e) {
        log(`${j.slug} al: ${(e as Error).message}`);
      }
      await new Promise((r) => setTimeout(r, 500));
    }
    if (j.fuentes.rdl) {
      try {
        const l = await consultarRDL(j.fuentes.rdl, j.tipo);
        if (l.resultado) {
          const r = await guardarResultado({ ...l.resultado, juego: j.slug });
          if (r === 'nuevo') n++;
        }
      } catch (e) {
        log(`${j.slug} rdl: ${(e as Error).message}`);
      }
      await new Promise((r) => setTimeout(r, 500));
    }
    log(`${j.nombre}: ${n} nuevos`);
  }
}
