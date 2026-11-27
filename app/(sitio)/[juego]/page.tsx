import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Banda } from '@/components/Banda';
import { Cuenta } from '@/components/Cuenta';
import { EnVivo } from '@/components/EnVivo';
import { Espacios } from '@/components/Espacio';
import { Historial } from '@/components/Historial';
import { Pronostico } from '@/components/Pronostico';
import { ResultadoGrande } from '@/components/ResultadoGrande';
import { Secos } from '@/components/Secos';
import { horarioPartes, proximoTurno, ultimoTurno } from '@/lib/agenda';
import { enPosicion, leerEspacios } from '@/lib/espacios';
import { fechaLarga, hora12, hoyISO, mayus, sumarDias } from '@/lib/fechas';
import { JUEGOS, juego as buscarJuego } from '@/lib/juegos';
import { leerPremios } from '@/lib/premios';
import { pronostico } from '@/lib/pronostico';
import { historial, marcaDeCambio } from '@/lib/resultados';

export const revalidate = 60;

export function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ juego: string }> };

const SECCION = { chance: ['Chances', '/chances'], loteria: ['Loterías', '/loterias'] } as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const j = buscarJuego((await params).juego);
  if (!j) return {};
  const [u] = await historial(j.slug, 1);
  return {
    title: `${j.nombre}: resultado de hoy`,
    description: u
      ? `Resultado de ${j.nombre} del ${fechaLarga(u.fecha)}: ${u.numero}${u.serie ? ` serie ${u.serie}` : ''}. Últimos sorteos, horario y próximo sorteo.`
      : `Resultado de ${j.nombre} de hoy, horario y últimos sorteos.`,
    alternates: { canonical: `/${j.slug}` },
  };
}

export default async function PaginaJuego({ params }: Props) {
  const j = buscarJuego((await params).juego);
  if (!j) notFound();
  const ahora = Date.now();
  const [filas, espacios, marca, premios] = await Promise.all([historial(j.slug, 30), leerEspacios(), marcaDeCambio(), leerPremios()]);
  const pron = j.tipo === 'chance' || j.tipo === 'loteria' ? pronostico(filas, 30) : null;
  const ultimo = filas[0] ?? null;
  const turno = ultimoTurno(j, ahora);
  const proximo = proximoTurno(j, ahora);
  const falta = turno && (!ultimo || ultimo.fecha < turno.fecha) && ahora - turno.ms < 48 * 3600 * 1000;
  const hoy = hoyISO(ahora);
  const familia = j.familia ? JUEGOS.filter((x) => x.familia === j.familia && x.slug !== j.slug) : [];
  const seccion = j.tipo === 'chance' || j.tipo === 'loteria' ? SECCION[j.tipo] : null;

  return (
    <>
      <Banda
        titulo={j.nombre}
        sub={ultimo ? `Resultado del ${fechaLarga(ultimo.fecha)}` : undefined}
        migas={[{ href: '/', texto: 'Inicio' }, ...(seccion ? [{ href: seccion[1], texto: seccion[0] }] : []), { texto: j.nombre }]}
      />
      <div className="contenedor solapa">
        {falta && (
          <p className="aviso-espera">
            El sorteo del {turno.fecha === hoy ? 'día de hoy' : fechaLarga(turno.fecha)} ({hora12(turno.hora)}) todavía no
            se publica. Esta página se actualiza sola apenas salga.
          </p>
        )}

        <Espacios lista={enPosicion(espacios, 'sorteo-sobre')} enHero="sobre" primero />

        {ultimo ? (
          <ResultadoGrande juego={j} r={ultimo} premio={premios[j.slug]} />
        ) : (
          <p className="vacio">Aún no tenemos resultados de este sorteo.</p>
        )}

        <Espacios lista={enPosicion(espacios, 'sorteo-bajo')} enHero="bajo" primero />

        <div className="ficha">
          <div>
            <span>Horario</span>
            {horarioPartes(j).length ? (
              horarioPartes(j).map((p) => (
                <b key={p.dias} style={{ fontWeight: 600 }}>
                  {p.dias} · {p.hora}
                </b>
              ))
            ) : (
              <b style={{ fontWeight: 600 }}>Sorteos extraordinarios, sin fecha fija</b>
            )}
          </div>
          {proximo && (
            <div>
              <span>Próximo sorteo</span>
              <b style={{ fontWeight: 600 }}>
                {proximo.fecha === hoy ? 'Hoy' : proximo.fecha === sumarDias(hoy, 1) ? 'Mañana' : mayus(fechaLarga(proximo.fecha))} · {hora12(proximo.hora)}
              </b>
              <span style={{ textTransform: 'none', letterSpacing: 0, fontSize: '0.88rem' }}>
                <Cuenta ms={proximo.ms} inicial={ahora} />
              </span>
            </div>
          )}
          <div>
            <span>Actualización</span>
            <span style={{ textTransform: 'none', letterSpacing: 0, fontSize: '0.94rem', color: 'var(--ink)' }}>
              <EnVivo marca={marca} revisado={new Date(ahora).toISOString()} />
            </span>
          </div>
        </div>
      </div>

      <Espacios lista={enPosicion(espacios, 'debajo')} />

      <div className="contenedor">
        {ultimo?.secos && ultimo.secos.length > 0 && (
          <section className="seccion">
            <div className="seccion-cabeza">
              <h2>Premios secos</h2>
              <span className="nota">Sorteo {ultimo.sorteo ?? ''} · {fechaLarga(ultimo.fecha)}</span>
            </div>
            <Secos secos={ultimo.secos} />
          </section>
        )}

        {filas.length > 1 && (
          <section className="seccion">
            <div className="seccion-cabeza">
              <h2>Últimos {filas.length} sorteos</h2>
            </div>
            <Historial juego={j} filas={filas} />
          </section>
        )}

        {pron && (
          <section className="seccion" aria-labelledby="t-pronostico">
            <div className="seccion-cabeza">
              <h2 id="t-pronostico">Pronóstico para el próximo sorteo</h2>
            </div>
            <p className="seccion-sub">Basado en los últimos {pron.sorteos} resultados</p>
            <Pronostico p={pron} />
          </section>
        )}

        {familia.length > 0 && (
          <section className="seccion">
            <div className="seccion-cabeza">
              <h2>Otros sorteos de {j.familia}</h2>
            </div>
            <div className="pasos" style={{ justifyContent: 'flex-start', flexWrap: 'wrap' }}>
              {familia.map((f) => (
                <Link key={f.slug} href={`/${f.slug}`}>
                  {f.nombre}
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
