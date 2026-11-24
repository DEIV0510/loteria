'use client';
import { useActionState, useState } from 'react';
import { borrarResultadoAccion, guardarResultadoAccion, revisarAhora } from '../acciones';

type JuegoMin = { slug: string; nombre: string; tipo: string; astro: boolean; quinta: boolean };
type Valores = { numero?: string; serie?: string | null; quinta?: string | null; signo?: string | null; sorteo?: string | null };

const SIGNOS = ['Aries', 'Tauro', 'Géminis', 'Cáncer', 'Leo', 'Virgo', 'Libra', 'Escorpio', 'Sagitario', 'Capricornio', 'Acuario', 'Piscis'];

export function FormResultado({
  juegos,
  fijo,
  fecha,
  valores,
  puedeBorrar,
}: {
  juegos: JuegoMin[];
  fijo?: string;
  fecha: string;
  valores?: Valores;
  puedeBorrar?: boolean;
}) {
  const [estado, accion, cargando] = useActionState(guardarResultadoAccion, null);
  const [slug, setSlug] = useState(fijo ?? '');
  const j = juegos.find((x) => x.slug === slug);
  const v = valores ?? {};

  return (
    <form action={accion} style={{ display: 'grid', gap: 12 }}>
      {fijo ? (
        <input type="hidden" name="juego" value={fijo} />
      ) : (
        <div className="fila-campos">
          <div className="campo">
            <label htmlFor="n-juego">Sorteo</label>
            <select id="n-juego" name="juego" value={slug} onChange={(e) => setSlug(e.target.value)} required>
              <option value="">Elige…</option>
              {juegos.map((x) => (
                <option key={x.slug} value={x.slug}>
                  {x.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="campo">
            <label htmlFor="n-fecha">Fecha</label>
            <input id="n-fecha" type="date" name="fecha" defaultValue={fecha} required />
          </div>
        </div>
      )}
      {fijo && <input type="hidden" name="fecha" value={fecha} />}

      {j && (
        <>
          <div className="campo">
            <label>
              {j.tipo === 'colorloto'
                ? 'Balotas (número y color, separadas por coma)'
                : j.tipo === 'baloto'
                  ? '5 balotas y la superbalota, con guion'
                  : j.tipo === 'miloto'
                    ? '5 balotas, con guion'
                    : 'Número'}
            </label>
            {j.tipo === 'chance' || j.tipo === 'loteria' ? (
              <input
                className="cifras-input"
                name="numero"
                inputMode="numeric"
                pattern="[0-9]{3,4}"
                maxLength={4}
                defaultValue={v.numero}
                placeholder={j.slug.startsWith('cash-three') ? '000' : '0000'}
                required
                autoComplete="off"
              />
            ) : (
              <input
                type="text"
                name="numero"
                defaultValue={v.numero}
                placeholder={j.tipo === 'colorloto' ? '1 blanco, 3 blanco, 4 verde, 6 rojo, 7 negro, 7 rojo' : '04-05-20-21-22-15'}
                required
                autoComplete="off"
              />
            )}
          </div>
          <div className="fila-campos">
            {j.tipo === 'loteria' && (
              <div className="campo">
                <label>Serie</label>
                <input name="serie" inputMode="numeric" pattern="[0-9]{3}" maxLength={3} defaultValue={v.serie ?? ''} required autoComplete="off" />
              </div>
            )}
            {j.quinta && (
              <div className="campo">
                <label>Quinta</label>
                <input name="quinta" inputMode="numeric" pattern="[0-9]" maxLength={1} defaultValue={v.quinta ?? ''} autoComplete="off" />
              </div>
            )}
            {j.astro && (
              <div className="campo">
                <label>Signo</label>
                <select name="signo" defaultValue={v.signo ?? ''} required>
                  <option value="">Elige…</option>
                  {SIGNOS.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="campo">
              <label>N.º de sorteo (opcional)</label>
              <input name="sorteo" inputMode="numeric" defaultValue={v.sorteo ?? ''} autoComplete="off" />
            </div>
          </div>
        </>
      )}

      {estado && <p className={`mensaje${estado.ok ? '' : ' error'}`}>{estado.msg}</p>}

      <div className="acciones">
        <button className="boton" type="submit" disabled={cargando || !j}>
          {cargando ? 'Guardando…' : 'Guardar resultado'}
        </button>
        {puedeBorrar && fijo && (
          <button
            className="boton claro"
            type="submit"
            formAction={borrarResultadoAccion}
            formNoValidate
            onClick={(e) => {
              if (!confirm('¿Borrar este resultado? El robot lo volverá a buscar.')) e.preventDefault();
            }}
          >
            Borrar
          </button>
        )}
      </div>
    </form>
  );
}

export function BotonRevisar() {
  const [estado, accion, cargando] = useActionState(revisarAhora, null);
  return (
    <form action={accion} style={{ display: 'grid', gap: 10 }}>
      <button className="boton acento" type="submit" disabled={cargando} style={{ minHeight: 48 }}>
        {cargando ? 'Revisando las fuentes…' : 'Revisar fuentes ahora'}
      </button>
      {estado && <p className={`mensaje${estado.ok ? '' : ' error'}`}>{estado.msg}</p>}
    </form>
  );
}
