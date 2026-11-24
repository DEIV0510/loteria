import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Tarjeta } from '@/components/Tarjeta';
import { turnosDelDia } from '@/lib/agenda';
import { Banda } from '@/components/Banda';
import { fechaCorta, fechaLarga, fechaSlug, hoyISO, mayus, slugAFecha, sumarDias } from '@/lib/fechas';
import { JUEGOS } from '@/lib/juegos';
import { resultadosDelDia } from '@/lib/resultados';

export const revalidate = 60;

export function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ fecha: string }> };

function resolver(p: string): string | null {
  if (p === 'hoy') return hoyISO();
  if (p === 'ayer') return sumarDias(hoyISO(), -1);
  return slugAFecha(p);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = (await params).fecha;
  const fecha = resolver(p);
  if (!fecha) return {};
  return {
    title: `Resultados de loterías y chances del ${fechaLarga(fecha)}`,
    description: `Todos los resultados de chances y loterías de Colombia del ${fechaLarga(fecha)}.`,
    alternates: { canonical: `/resultados/${fechaSlug(fecha)}` },
  };
}

export default async function ResultadosDelDia({ params }: Props) {
  const p = (await params).fecha;
  const fecha = resolver(p);
  if (!fecha || fecha > hoyISO()) notFound();
  const res = await resultadosDelDia(fecha);
  const porJuego = new Map(res.map((r) => [r.juego, r]));
  const horas = new Map(turnosDelDia(fecha).map((t) => [t.juego.slug, t.hora]));
  const orden = (slug: string) => horas.get(slug) ?? '99:99';

  const grupos = [
    { titulo: 'Chances', juegos: JUEGOS.filter((j) => j.tipo === 'chance') },
    { titulo: 'Loterías', juegos: JUEGOS.filter((j) => j.tipo === 'loteria') },
    { titulo: 'Baloto, MiLoto y ColorLoto', juegos: JUEGOS.filter((j) => j.tipo !== 'chance' && j.tipo !== 'loteria') },
  ]
    .map((g) => ({ ...g, juegos: g.juegos.filter((j) => porJuego.has(j.slug)).sort((a, b) => orden(a.slug).localeCompare(orden(b.slug))) }))
    .filter((g) => g.juegos.length);

  const antes = sumarDias(fecha, -1);
  const despues = sumarDias(fecha, 1);

  return (
    <>
    <Banda titulo={`Resultados del ${fechaCorta(fecha)}`} sub={`${mayus(fechaLarga(fecha))} · ${res.length} sorteos con resultado`} corta>
      <nav className="pasos" aria-label="Otros días">
        <Link href={`/resultados/${fechaSlug(antes)}`}>← {fechaCorta(antes)}</Link>
        {despues <= hoyISO() ? <Link href={despues === hoyISO() ? '/' : `/resultados/${fechaSlug(despues)}`}>{despues === hoyISO() ? 'Hoy' : fechaCorta(despues)} →</Link> : <span />}
      </nav>
    </Banda>
    <div className="contenedor">
      {grupos.length === 0 && <p className="vacio" style={{ marginTop: 20 }}>No hay resultados guardados para este día.</p>}
      {grupos.map((g) => (
        <section key={g.titulo} className="seccion">
          <div className="seccion-cabeza">
            <h2>{g.titulo}</h2>
          </div>
          <div className="rejilla">
            {g.juegos.map((j) => (
              <Tarjeta key={j.slug} juego={j} r={porJuego.get(j.slug)!} hora={horas.get(j.slug)} />
            ))}
          </div>
        </section>
      ))}
    </div>
    </>
  );
}
