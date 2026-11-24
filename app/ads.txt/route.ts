// ads.txt para AdSense: se arma solo con el código ca-pub que se pone en el panel.
import { leerAjustes, pubId } from '@/lib/ajustes';

export const dynamic = 'force-dynamic';

export async function GET() {
  const pub = pubId((await leerAjustes()).adsenseCliente);
  const cuerpo = pub ? `google.com, ${pub}, DIRECT, f08c47fec0942fa0\n` : '';
  return new Response(cuerpo, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  });
}
