import type { Metadata } from 'next';
import Link from 'next/link';
import { Banda } from '@/components/Banda';
import { Buscador } from '@/components/Buscador';
import { fechaMedia, fechaSlug, hoyISO, sumarDias } from '@/lib/fechas';
import { juego } from '@/lib/juegos';
import { buscarNumero } from '@/lib/resultados';

export const metadata: Metadata = {
  title: 'Buscar un número en chances y loterías',
  description: 'Busca si tu número salió en algún chance o lotería de Colombia en los últimos 90 días.',
  alternates: { canonical: '/buscar' },
};

type Props = { searchParams: Promise<{ n?: string }> };

/** Resalta las cifras que coinciden (el final del número). */
function Marcado({ numero, buscado }: { numero: string; buscado: string }) {
  if (!numero.endsWith(buscado)) return <>{numero}</>;
  const corte = numero.length - buscado.length;
  return (
    <>
      {numero.slice(0, corte)}
      <span className="acierto">{numero.slice(corte)}</span>
    </>
  );
}

export default async function Buscar({ searchParams }: Props) {
  const n = ((await searchParams).n ?? '').replace(/\D/g, '').slice(0, 4);
  const desde = sumarDias(hoyISO(), -90);
  const res = n.length >= 2 ? await buscarNumero(n, desde) : [];
  const exactos = res.filter((r) => r.numero === n);

  return (
    <>
    <Banda titulo="Buscar un número" sub="Chances y loterías de los últimos 90 días" corta />
    <div className="contenedor">
      <section className="seccion">
        <Buscador valor={n} />
      </section>
      {n.length >= 2 && (
        <section className="seccion">
          <div className="seccion-cabeza">
            <h2>
              {res.length === 0 ? `El ${n} no ha salido` : `${res.length} ${res.length === 1 ? 'vez' : 'veces'}`}
            </h2>
            {res.length > 0 && n.length === 4 && <span className="nota">{exactos.length} con las 4 cifras</span>}
            {res.length > 0 && n.length < 4 && <span className="nota">Terminados en {n}</span>}
          </div>
          {res.length > 0 && (
            <div className="tabla-envoltura">
              <table>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Sorteo</th>
                    <th>Número</th>
                  </tr>
                </thead>
                <tbody>
                  {res.map((r) => {
                    const j = juego(r.juego);
                    if (!j) return null;
                    return (
                      <tr key={`${r.juego}-${r.fecha}`}>
                        <td>{fechaMedia(r.fecha)}</td>
                        <td>
                          <Link href={`/${j.slug}/${fechaSlug(r.fecha)}`}>{j.nombre}</Link>
                        </td>
                        <td className="cifra-td">
                          <Marcado numero={r.numero} buscado={n} />
                          {r.serie ? <span style={{ color: 'var(--muted)', fontWeight: 400, letterSpacing: 0 }}> · serie {r.serie}</span> : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
    </>
  );
}
