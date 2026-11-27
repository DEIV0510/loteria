import Link from 'next/link';
import { Fragment } from 'react';
import { Buscador } from '@/components/Buscador';
import { Cinta } from '@/components/Cinta';
import { Cuenta } from '@/components/Cuenta';
import { EnVivo } from '@/components/EnVivo';
import { DestacadoChance, DestacadoLoteria } from '@/components/Destacado';
import { Espacios } from '@/components/Espacio';
import { Reloj } from '@/components/Reloj';
import { Tarjeta } from '@/components/Tarjeta';
import { enPosicion, leerEspacios } from '@/lib/espacios';
import { fechaLarga, hora12 } from '@/lib/fechas';
import { marcaDeCambio } from '@/lib/resultados';
import { portada, type ItemHoy } from '@/lib/vista';

export const revalidate = 30;

const VISIBLES = 8;
const FALTAN_VISIBLES = 6;
const LOTERIAS_VISIBLES = 6;
const NUEVO_MS = 30 * 60 * 1000;

function Pendiente({ i, ahora }: { i: ItemHoy; ahora: number }) {
  return (
    <Link href={`/${i.juego.slug}`} className="fila">
      <span className="fila-hora num">{hora12(i.hora!)}</span>
      <span>{i.juego.nombre}</span>
      <span className="fila-estado">
        <Cuenta ms={i.ms!} inicial={ahora} />
      </span>
    </Link>
  );
}

export default async function Inicio() {
  const ahora = Date.now();
  const [p, espacios, marca] = await Promise.all([portada(ahora), leerEspacios(), marcaDeCambio()]);
  const proximo = p.pendientes[0];
  // Arriba van las loterías del día (o el último chance); el resto, en la rejilla.
  const principal = p.principal;
  const primeros = p.salieron.slice(0, VISIBLES);
  const resto = p.salieron.slice(VISIBLES);
  // "Nuevo" = el sorteo se jugó hace menos de 30 minutos.
  const esNuevo = (ms: number | null) => ms !== null && ahora - ms < NUEVO_MS;
  const rotuloLoteria = (fecha: string) => (fecha === p.hoy ? 'Lotería de hoy' : 'Última lotería');

  return (
    <>
      <section className="hero">
        <div className="contenedor hero-grid">
          <div className="hero-texto">
            <p className="hero-fecha">{fechaLarga(p.hoy)}</p>
            <h1>Resultados de hoy</h1>
            <div className="hero-vivo">
              <span className="en-vivo">
                <span className="punto latiendo" aria-hidden="true" />
                En vivo
              </span>
              <span className="num">
                {p.listos.length} de {p.total} sorteos ya salieron
              </span>
            </div>
            <div className="hero-vivo" style={{ fontSize: '0.84rem' }}>
              <EnVivo marca={marca} revisado={new Date(ahora).toISOString()} sinPunto />
            </div>
          </div>

          <Espacios lista={enPosicion(espacios, 'sobre-resultado')} enHero="sobre" primero />

          {principal && (
            <div className="destacados">
              {principal.modo === 'loterias' ? (
                principal.loterias.map((x, i) => (
                  <Fragment key={x.juego.slug}>
                    <DestacadoLoteria
                      juego={x.juego}
                      r={x.resultado}
                      premio={p.premios[x.juego.slug]}
                      rotulo={rotuloLoteria(principal.fecha)}
                    />
                    {i === 0 && <Espacios lista={enPosicion(espacios, 'entre-loterias')} enHero="entre" primero />}
                  </Fragment>
                ))
              ) : (
                <DestacadoChance
                  juego={principal.item.juego}
                  r={principal.item.resultado!}
                  hora={principal.item.hora}
                  nuevo={esNuevo(principal.item.ms)}
                />
              )}
            </div>
          )}

          <Espacios lista={enPosicion(espacios, 'bajo-resultado')} enHero="bajo" primero />

          {proximo && proximo.ms && (
            <div className="proximo-caja">
              <span className="rotulo">Próximo sorteo</span>
              <span className="quien">
                {proximo.juego.nombre} <span>· {hora12(proximo.hora!)}</span>
              </span>
              <Reloj ms={proximo.ms} inicial={ahora} />
            </div>
          )}
        </div>
      </section>

      <Cinta items={p.listos} />

      <Espacios lista={enPosicion(espacios, 'debajo')} primero />

      <div className="contenedor">
        <section className="seccion" id="hoy" aria-labelledby="t-salieron">
          <div className="seccion-cabeza">
            <h2 id="t-salieron">{p.salieron.length && principal?.modo === 'loterias' && principal.fecha === p.hoy ? 'Chances de hoy' : 'Ya salieron'}</h2>
            <span className="nota">Lo más reciente primero</span>
          </div>
          {p.listos.length === 0 ? (
            <p className="vacio">Todavía no hay resultados hoy. El primer sorteo es a las 10:00 a. m.</p>
          ) : primeros.length === 0 ? (
            <p className="vacio">Por ahora es el único resultado de hoy. Los demás aparecen aquí apenas se jueguen.</p>
          ) : (
            <>
              <div className="rejilla">
                {primeros.map((i) => (
                  <Tarjeta key={i.juego.slug} juego={i.juego} r={i.resultado!} hora={i.hora} nueva={esNuevo(i.ms)} />
                ))}
              </div>
              {resto.length > 0 && (
                <details className="mas">
                  <summary>Ver los otros {resto.length} resultados de hoy</summary>
                  <div className="rejilla">
                    {resto.map((i) => (
                      <Tarjeta key={i.juego.slug} juego={i.juego} r={i.resultado!} hora={i.hora} />
                    ))}
                  </div>
                </details>
              )}
            </>
          )}
        </section>

        {(p.esperando.length > 0 || p.pendientes.length > 0) && (
          <section className="seccion" aria-labelledby="t-faltan">
            <div className="seccion-cabeza">
              <h2 id="t-faltan">Faltan hoy</h2>
              <span className="nota num">{p.esperando.length + p.pendientes.length} sorteos</span>
            </div>
            <div className="lista">
              {p.esperando.map((i) => (
                <Link key={i.juego.slug} href={`/${i.juego.slug}`} className="fila">
                  <span className="fila-hora num">{hora12(i.hora!)}</span>
                  <span>{i.juego.nombre}</span>
                  <span className="fila-estado espera">
                    <span className="punto espera latiendo" aria-hidden="true" />
                    Esperando
                  </span>
                </Link>
              ))}
              {p.pendientes.slice(0, FALTAN_VISIBLES).map((i) => (
                <Pendiente key={i.juego.slug} i={i} ahora={ahora} />
              ))}
            </div>
            {p.pendientes.length > FALTAN_VISIBLES && (
              <details className="mas">
                <summary>Ver los otros {p.pendientes.length - FALTAN_VISIBLES} de hoy</summary>
                <div className="lista">
                  {p.pendientes.slice(FALTAN_VISIBLES).map((i) => (
                    <Pendiente key={i.juego.slug} i={i} ahora={ahora} />
                  ))}
                </div>
              </details>
            )}
          </section>
        )}
      </div>

      <Espacios lista={enPosicion(espacios, 'mitad')} />

      <div className="contenedor">
        <section className="seccion" aria-labelledby="t-loterias">
          <div className="seccion-cabeza">
            <h2 id="t-loterias">Loterías de la semana</h2>
            <Link href="/loterias">Ver las {p.loterias.length}</Link>
          </div>
          <div className="rejilla">
            {p.loterias.slice(0, LOTERIAS_VISIBLES).map(({ juego, resultado }) => (
              <Tarjeta key={juego.slug} juego={juego} r={resultado!} conFecha premio={p.premios[juego.slug]} />
            ))}
          </div>
        </section>

        <section className="seccion" aria-labelledby="t-balotas">
          <div className="seccion-cabeza">
            <h2 id="t-balotas">Baloto, MiLoto y ColorLoto</h2>
          </div>
          <div className="rejilla">
            {p.balotas
              .filter((b) => b.resultado)
              .map(({ juego, resultado }) => (
                <Tarjeta key={juego.slug} juego={juego} r={resultado!} conFecha />
              ))}
          </div>
        </section>

        <section className="seccion">
          <Buscador />
        </section>
      </div>
    </>
  );
}
