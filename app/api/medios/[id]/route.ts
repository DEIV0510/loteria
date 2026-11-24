import { leerMedio } from '@/lib/espacios';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const m = await leerMedio(id);
  if (!m) return new Response('No encontrado', { status: 404 });
  return new Response(Buffer.from(m.datos), {
    headers: {
      'Content-Type': m.tipo,
      // Cada imagen nueva recibe otro id, así que se puede guardar para siempre.
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
