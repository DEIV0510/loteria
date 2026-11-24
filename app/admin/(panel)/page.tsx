import { turnosDelDia } from '@/lib/agenda';
import { filas } from '@/lib/db';
import { fechaLarga, hora12, hoyISO, mayus } from '@/lib/fechas';
import { JUEGOS, juego } from '@/lib/juegos';
import { resultadosDelDia } from '@/lib/resultados';
import { BotonRevisar, FormResultado } from './FormResultado';

export const dynamic = 'force-dynamic';

function horaCorta(iso: string) {
  return new Date(iso).toLocaleString('es-CO', { timeZone: 'America/Bogota', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }).replace(/.$/, '');
}

export default async function PanelResultados() {
  const ahora = Date.now();
  const hoy = hoyISO(ahora);
  const [res, bitacora, [rev]] = await Promise.all([
    resultadosDelDia(hoy),
    filas<{ cuando: string; tipo: string; detalle: string }>('SELECT cuando, tipo, detalle FROM bitacora ORDER BY id DESC LIMIT 40'),
    filas<{ m: number | null }>('SELECT MAX(ultima) AS m FROM revisiones'),
  ]);
  const porJuego = new Map(res.map((r) => [r.juego, r]));
  const turnos = turnosDelDia(hoy);
  const extra = res.filter((r) => !turnos.some((t) => t.juego.slug === r.juego));
  const listos = turnos.filter((t) => porJuego.has(t.juego.slug)).length + extra.length;
  const minimos = JUEGOS.map((j) => ({
    slug: j.slug,
    nombre: j.nombre,
    tipo: j.tipo,
    astro: j.familia === 'Astro',
    quinta: j.tipo === 'chance' && j.familia !== 'Astro' && !j.slug.startsWith('cash') && !j.slug.startsWith('play'),
  }));

  return (
    <div className="panel">
      <div>
        <h1>Resultados de hoy</h1>
        <p className="ayuda">
          {mayus(fechaLarga(hoy))} · {listos} de {turnos.length} con resultado
        </p>
      </div>

      <div className="caja">
        <p className="ayuda">
          El robot busca cada resultado apenas pasa la hora del sorteo, en dos fuentes. Última revisión:{' '}
          <b>{rev?.m ? horaCorta(new Date(Number(rev.m)).toISOString()) : 'todavía ninguna'}</b>. Si algo tarda, usa este botón o
          escríbelo a mano tocando el sorteo.
        </p>
        <BotonRevisar />
      </div>

      <div className="sorteos">
        {turnos.map((t) => {
          const r = porJuego.get(t.juego.slug);
          const jugado = t.ms <= ahora;
          return (
            <details key={t.juego.slug} className="sorteo">
              <summary>
                <span className="hora">{hora12(t.hora)}</span>
                <span className="nombre">
                  {t.juego.nombre}
                  {r && <span className="origen">{r.manual ? 'Escrito a mano' : 'Robot'}</span>}
                </span>
                {r ? (
                  <span className="valor">
                    {r.numero}
                    {r.serie ? ` · ${r.serie}` : ''}
                  </span>
                ) : (
                  <span className={`valor falta${jugado ? ' espera' : ''}`}>{jugado ? 'Esperando' : 'Más tarde'}</span>
                )}
              </summary>
              <div className="editor">
                <FormResultado
                  juegos={minimos}
                  fijo={t.juego.slug}
                  fecha={hoy}
                  puedeBorrar={!!r}
                  valores={r ? { numero: r.numero, serie: r.serie, quinta: r.quinta, signo: r.signo, sorteo: r.sorteo } : undefined}
                />
              </div>
            </details>
          );
        })}
        {extra.map((r) => (
          <details key={r.juego} className="sorteo">
            <summary>
              <span className="hora">—</span>
              <span className="nombre">
                {juego(r.juego)?.nombre ?? r.juego}
                <span className="origen">Fuera del horario habitual</span>
              </span>
              <span className="valor">{r.numero}</span>
            </summary>
            <div className="editor">
              <FormResultado juegos={minimos} fijo={r.juego} fecha={hoy} puedeBorrar valores={r} />
            </div>
          </details>
        ))}
      </div>

      <div className="caja">
        <h2>Cargar otro resultado</h2>
        <p className="ayuda">Para un sorteo de otro día o uno extraordinario.</p>
        <FormResultado juegos={minimos} fecha={hoy} />
      </div>

      <details className="caja">
        <summary style={{ cursor: 'pointer', fontWeight: 700 }}>Actividad reciente</summary>
        <div className="bitacora">
          {bitacora.length === 0 && <p className="ayuda">Sin actividad todavía.</p>}
          {bitacora.map((b, i) => (
            <div key={i}>
              <time>{horaCorta(String(b.cuando))}</time>
              <span style={{ color: b.tipo === 'error' ? '#b3261e' : undefined }}>{String(b.detalle)}</span>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}
