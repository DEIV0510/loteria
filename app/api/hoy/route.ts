// La portada pregunta aquí cada 40 s si hay algo nuevo. De paso despierta al robot.
import { despertarRobot } from '@/lib/refrescar';
import { marcaDeCambio } from '@/lib/resultados';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET() {
  let nuevos = 0;
  try {
    const r = await despertarRobot(9_000);
    nuevos = r?.nuevos.length ?? 0;
  } catch {
    /* si las fuentes fallan, igual se responde con lo que hay */
  }
  const marca = await marcaDeCambio();
  return Response.json(
    { marca, nuevos, ahora: new Date().toISOString() },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
