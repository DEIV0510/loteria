import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Espacios } from '@/components/Espacio';
import { ResultadoGrande } from '@/components/ResultadoGrande';
import { Secos } from '@/components/Secos';
import { enPosicion, leerEspacios } from '@/lib/espacios';
import { Banda } from '@/components/Banda';
import { fechaCorta, fechaLarga, fechaSlug, slugAFecha } from '@/lib/fechas';
import { juego as buscarJuego } from '@/lib/juegos';
import { filas } from '@/lib/db';
import { leerPremios } from '@/lib/premios';
import { resultado } from '@/lib/resultados';

export const revalidate = 300;

export function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ juego: string; fecha: string }> };

async function vecinos(juego: string, fecha: string) {
  const [antes] = await filas<{ fecha: string }>('SELECT fecha FROM resultados WHERE juego = ? AND fecha < ? ORDER BY fecha DESC LIMIT 1', [juego, fecha]);
  const [despues] = await filas<{ fecha: string }>('SELECT fecha FROM resultados WHERE juego = ? AND fecha > ? ORDER BY fecha ASC LIMIT 1', [juego, fecha]);
  return { antes: antes ? String(antes.fecha) : null, despues: despues ? String(despues.fecha) : null };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await params;
  const j = buscarJuego(p.juego);
  const fecha = slugAFecha(p.fecha);
  if (!j || !fecha) return {};
  const r = await resultado(j.slug, fecha);
  if (!r) return {};
  return {
    title: `${j.nombre} del ${fechaLarga(fecha)}`,
    description: `Resultado de ${j.nombre} del ${fechaLarga(fecha)}: ${r.numero}${r.serie ? ` serie ${r.serie}` : ''}${r.quinta ? `, quinta ${r.quinta}` : ''}${r.signo ? `, signo ${r.signo}` : ''}.`,
    alternates: { canonical: `/${j.slug}/${p.fecha}` },
  };
}

export default async function PaginaFecha({ params }: Props) {
  const p = await params;
  const j = buscarJuego(p.juego);
  const fecha = slugAFecha(p.fecha);
  if (!j || !fecha) notFound();
  const [r, espacios, v, premios] = await Promise.all([resultado(j.slug, fecha), leerEspacios(), vecinos(j.slug, fecha), leerPremios()]);
  if (!r) notFound();

  return (
    <>
      <Banda
        titulo={j.nombre}
        sub={`Resultado del ${fechaLarga(fecha)}`}
        migas={[{ href: '/', texto: 'Inicio' }, { href: `/${j.slug}`, texto: j.nombre }, { texto: fechaCorta(fecha) }]}
      />
      <div className="contenedor solapa">
        <ResultadoGrande juego={j} r={r} premio={premios[j.slug]} />
        <nav className="pasos" aria-label="Otras fechas">
          {v.antes ? <Link href={`/${j.slug}/${fechaSlug(v.antes)}`}>← {fechaLarga(v.antes)}</Link> : <span />}
          {v.despues ? <Link href={`/${j.slug}/${fechaSlug(v.despues)}`}>{fechaLarga(v.despues)} →</Link> : <Link href={`/${j.slug}`}>Último resultado →</Link>}
        </nav>
      </div>

      <Espacios lista={enPosicion(espacios, 'debajo')} />

      <div className="contenedor">
        {r.secos && r.secos.length > 0 && (
          <section className="seccion">
            <div className="seccion-cabeza">
              <h2>Premios secos</h2>
            </div>
            <Secos secos={r.secos} />
          </section>
        )}
        <section className="seccion">
          <div className="seccion-cabeza">
            <h2>Ese día</h2>
            <Link href={`/resultados/${fechaSlug(fecha)}`}>Todos los resultados del {fechaLarga(fecha)}</Link>
          </div>
        </section>
      </div>
    </>
  );
}
