// Fechas y horas en Colombia (UTC-5, sin horario de verano).
// Una "fecha" es siempre un texto ISO "AAAA-MM-DD" en hora de Bogotá.

const OFFSET_MS = 5 * 60 * 60 * 1000;

export const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
] as const;

export const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'] as const;

/** Reloj de Bogotá: un Date cuyos campos UTC son la hora local de Colombia. */
export function relojBogota(ms = Date.now()): Date {
  return new Date(ms - OFFSET_MS);
}

export function hoyISO(ms = Date.now()): string {
  return relojBogota(ms).toISOString().slice(0, 10);
}

export function sumarDias(fecha: string, dias: number): string {
  const d = new Date(`${fecha}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

/** Día de la semana (0 = domingo) de una fecha ISO. */
export function diaSemana(fecha: string): number {
  return new Date(`${fecha}T12:00:00Z`).getUTCDay();
}

/** Instante real (ms) de una fecha + "HH:MM" de Bogotá. */
export function instante(fecha: string, hhmm: string): number {
  return Date.parse(`${fecha}T${hhmm}:00Z`) + OFFSET_MS;
}

export function fechaLarga(fecha: string): string {
  const [a, m, d] = fecha.split('-').map(Number);
  return `${DIAS[diaSemana(fecha)]} ${d} de ${MESES[m - 1]} de ${a}`;
}

export function fechaCorta(fecha: string): string {
  const [, m, d] = fecha.split('-').map(Number);
  return `${d} de ${MESES[m - 1]}`;
}

/** "2026-11-24" -> "24-de-noviembre-de-2026" (para las URL). */
export function fechaSlug(fecha: string): string {
  const [a, m, d] = fecha.split('-').map(Number);
  return `${d}-de-${MESES[m - 1]}-de-${a}`;
}

/** "24-de-noviembre-de-2026" -> "2026-11-24" (null si no es válida). */
export function slugAFecha(slug: string): string | null {
  const m = /^(\d{1,2})-de-([a-z]+)-de-(\d{4})$/.exec(slug);
  if (!m) return null;
  const mes = MESES.indexOf(m[2] as (typeof MESES)[number]);
  if (mes < 0) return null;
  const iso = `${m[3]}-${String(mes + 1).padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  return validaISO(iso) ? iso : null;
}

export function validaISO(fecha: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return false;
  const d = new Date(`${fecha}T12:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === fecha;
}

/** Lee fechas en español: "24 de noviembre de 2026", "martes 24 noviembre 2026". */
export function leerFechaES(texto: string): string | null {
  const t = texto.toLowerCase().normalize('NFC');
  const m = /(\d{1,2})\s+(?:de\s+)?([a-záéíóú]+)\s+(?:de\s+|del\s+)?(\d{4})/.exec(t);
  if (!m) return null;
  const mes = MESES.indexOf(m[2] as (typeof MESES)[number]);
  if (mes < 0) return null;
  const iso = `${m[3]}-${String(mes + 1).padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  return validaISO(iso) ? iso : null;
}

/** "13:05" -> "1:05 p. m." */
export function hora12(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const sufijo = h >= 12 ? 'p. m.' : 'a. m.';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${sufijo}`;
}

/** Hora actual de Bogotá como "HH:MM". */
export function horaActual(ms = Date.now()): string {
  return relojBogota(ms).toISOString().slice(11, 16);
}

/** Primera letra en mayúscula ("martes 24…" -> "Martes 24…"). */
export function mayus(s: string): string {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

/** "2026-11-24" -> "Mar 24 nov 2026" (para tablas en el celular). */
export function fechaMedia(fecha: string): string {
  const [a, m, d] = fecha.split('-').map(Number);
  const dia = DIAS[diaSemana(fecha)].slice(0, 3);
  return `${dia[0].toUpperCase()}${dia.slice(1)} ${d} ${MESES[m - 1].slice(0, 3)} ${a}`;
}
