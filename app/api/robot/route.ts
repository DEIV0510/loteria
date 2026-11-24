// Para un cron externo (GitHub Actions, cron-job.org o Vercel Cron):
//   GET /api/robot  con  Authorization: Bearer <CRON_SECRET>   (o ?clave=<CRON_SECRET>)
import { timingSafeEqual } from 'node:crypto';
import { despertarRobot } from '@/lib/refrescar';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function autorizado(req: Request): boolean {
  const secreto = process.env.CRON_SECRET;
  if (!secreto) return false;
  const url = new URL(req.url);
  const dado = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? url.searchParams.get('clave') ?? '';
  const a = Buffer.from(dado);
  const b = Buffer.from(secreto);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(req: Request) {
  if (!autorizado(req)) return new Response('No autorizado', { status: 401 });
  const r = await despertarRobot(45_000, true);
  return Response.json(r ?? { corrio: false }, { headers: { 'Cache-Control': 'no-store' } });
}
