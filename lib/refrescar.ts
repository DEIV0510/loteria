import { revalidatePath } from 'next/cache';
import { correrRobot, type Reporte } from './robot';

/** Tras un cambio de datos, todas las páginas públicas se regeneran en la próxima visita. */
export function refrescarSitio() {
  revalidatePath('/', 'layout');
}

let ultimoIntento = 0;

/**
 * Lo llaman las visitas (vía /api/hoy) y el cron. Un freno en memoria evita que cada
 * visita toque la base; el candado en la base evita dos robots a la vez.
 */
export async function despertarRobot(presupuestoMs: number, forzar = false): Promise<Reporte | null> {
  const ahora = Date.now();
  if (!forzar && ahora - ultimoIntento < 25_000) return null;
  ultimoIntento = ahora;
  const r = await correrRobot({ presupuestoMs });
  if (r.nuevos.length) refrescarSitio();
  return r;
}
