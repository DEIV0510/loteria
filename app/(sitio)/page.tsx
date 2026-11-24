import Link from 'next/link';
import { Cuenta } from '@/components/Cuenta';
import { EnVivo } from '@/components/EnVivo';
import { Espacio } from '@/components/Espacio';
import { Tarjeta } from '@/components/Tarjeta';
import { Buscador } from '@/components/Buscador';
import { leerEspacios } from '@/lib/espacios';
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
  const primeros = p.listos.slice(0, VISIBLES);
  const resto = p.listos.slice(VISIBLES);
  // "Nuevo" = el sorteo se jugó hace menos de 30 minutos.
  const esNuevo = (ms: number | null) => ms !== null && ahora - ms < NUEVO_MS;

  return (
    <>
      <div className="contenedor">
        <section className="portada-cabeza">
          <h1>Resultados de hoy</h1>
          <p className="fecha-hoy">{fechaLarga(p.hoy)}</p>
          <div className="estado-vivo">
            <EnVivo marca={marca} revisado={new Date(ahora).toISOString()} />
            <span className="num">
              {p.listos.length} de {p.total} sorteos con resultado
            </span>
          </div>
          {proximo && proximo.ms && (
            <p className="proximo">
              Próximo: <strong>{proximo.juego.nombre}</strong> · {hora12(proximo.hora!)} ·{' '}
              <Cuenta ms={proximo.ms} inicial={ahora} />
            </p>
          )}
        </section>
      </div>

      <Espacio e={espacios.get('debajo')} />

      <div className="contenedor">
        <section className="seccion" id="hoy" aria-labelledby="t-salieron">
          <div className="seccion-cabeza">
            <h2 id="t-salieron">Ya salieron</h2>
            <span className="nota">Lo más reciente primero</span>
          </div>
          {p.listos.length === 0 ? (
            <p className="vacio">Todavía no hay resultados hoy. El primer sorteo es a las 10:00 a. m.</p>
          ) : (
            <>
              <div className="rejilla">
                {primeros.map((i) => (
                  <Tarjeta key={i.juego.slug} juego={i.juego} r={i.resultado!} hora={i.hora} nueva={esNuevo(i.ms)} />
                ))}
              </div>
              {resto.length > 0 && (
                <details className="mas">
                  <summary>Ver los {p.listos.length} resultados de hoy</summary>
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

      <Espacio e={espacios.get('mitad')} />

      <div className="contenedor">
        <section className="seccion" aria-labelledby="t-loterias">
          <div className="seccion-cabeza">
            <h2 id="t-loterias">Loterías de la semana</h2>
            <Link href="/loterias">Ver las {p.loterias.length}</Link>
          </div>
          <div className="rejilla">
            {p.loterias.slice(0, LOTERIAS_VISIBLES).map(({ juego, resultado }) => (
              <Tarjeta key={juego.slug} juego={juego} r={resultado!} conFecha />
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
