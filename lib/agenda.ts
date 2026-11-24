// Cuándo juega cada sorteo.
import { diaSemana, hoyISO, instante, sumarDias } from './fechas';
import { JUEGOS } from './juegos';
import type { Juego } from './tipos';

export type Turno = { juego: Juego; fecha: string; hora: string; ms: number };

/** Sorteos programados para una fecha, ordenados por hora. */
export function turnosDelDia(fecha: string): Turno[] {
  const d = diaSemana(fecha);
  return JUEGOS.filter((j) => j.horario[d])
    .map((j) => ({ juego: j, fecha, hora: j.horario[d]!, ms: instante(fecha, j.horario[d]!) }))
    .sort((a, b) => a.ms - b.ms || a.juego.nombre.localeCompare(b.juego.nombre));
}

/** Último sorteo programado que ya debió jugarse (hasta 8 días atrás). */
export function ultimoTurno(j: Juego, ahora = Date.now()): Turno | null {
  const hoy = hoyISO(ahora);
  for (let i = 0; i <= 8; i++) {
    const f = sumarDias(hoy, -i);
    const h = j.horario[diaSemana(f)];
    if (!h) continue;
    const ms = instante(f, h);
    if (ms <= ahora) return { juego: j, fecha: f, hora: h, ms };
  }
  return null;
}

/** Próximo sorteo de un juego (hoy o en los próximos 8 días). */
export function proximoTurno(j: Juego, ahora = Date.now()): Turno | null {
  const hoy = hoyISO(ahora);
  for (let i = 0; i <= 8; i++) {
    const f = sumarDias(hoy, i);
    const h = j.horario[diaSemana(f)];
    if (!h) continue;
    const ms = instante(f, h);
    if (ms > ahora) return { juego: j, fecha: f, hora: h, ms };
  }
  return null;
}

/** Texto del horario: "Lunes a sábado 11:00 a. m. · Domingo 12:00 p. m." */
export function horarioLegible(j: Juego): string {
  return horarioPartes(j)
    .map((p) => `${p.dias} ${p.hora}`)
    .join(' · ') || 'Sorteos extraordinarios, sin fecha fija';
}

/** Horario agrupado por hora: [{dias: 'Lunes a sábado', hora: '11:00 a. m.'}, …] */
export function horarioPartes(j: Juego): { dias: string; hora: string }[] {
  const nombres = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const orden = [1, 2, 3, 4, 5, 6, 0];
  const porHora = new Map<string, number[]>();
  for (const d of orden) {
    const h = j.horario[d];
    if (h) porHora.set(h, [...(porHora.get(h) ?? []), d]);
  }
  const partes = [...porHora.entries()].map(([h, ds]) => {
    const pos = ds.map((d) => orden.indexOf(d));
    const seguido = pos.every((p, i) => i === 0 || p === pos[i - 1] + 1);
    let dias: string;
    if (ds.length === 7) dias = 'todos los días';
    else if (seguido && ds.length >= 3) dias = `${nombres[ds[0]]} a ${nombres[ds.at(-1)!]}`;
    else if (ds.length === 1) dias = `${nombres[ds[0]]}`;
    else dias = `${ds.slice(0, -1).map((d) => nombres[d]).join(', ')} y ${nombres[ds.at(-1)!]}`;
    return { dias: dias[0].toUpperCase() + dias.slice(1), hora: hora12(h), primero: pos[0] };
  });
  return partes.sort((a, b) => a.primero - b.primero).map(({ dias, hora }) => ({ dias, hora }));
}

function hora12(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number);
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'p. m.' : 'a. m.'}`;
}
