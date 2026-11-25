import { textoPremio } from '@/lib/premios';
import type { FilaResultado, Juego } from '@/lib/tipos';
import { Balotas, Cifras, Numero } from './Numero';

export function ResultadoGrande({ juego, r, premio }: { juego: Juego; r: FilaResultado; premio?: number }) {
  const p = textoPremio(premio);
  return (
    <div className="resultado-grande">
      <span className="destacado-numeros">
        <Numero r={r} tam="grande" cae />
        {r.serie && (
          <span className="serie">
            <span className="serie-rotulo">Serie</span>
            <Cifras numero={r.serie} tam="serie" />
          </span>
        )}
      </span>
      <div className="datos">
        {r.quinta && (
          <div className="dato">
            <span>Quinta</span>
            <b>{r.quinta}</b>
          </div>
        )}
        {r.signo && (
          <div className="dato">
            <span>Signo</span>
            <b>{r.signo}</b>
          </div>
        )}
        {r.sorteo && (
          <div className="dato">
            <span>Sorteo</span>
            <b>{r.sorteo}</b>
          </div>
        )}
        {juego.tipo === 'baloto' && r.balotas && (
          <div className="dato">
            <span>Superbalota</span>
            <b>{r.balotas.find((b) => b.super)?.n ?? '—'}</b>
          </div>
        )}
        {juego.canal && (
          <div className="dato">
            <span>Transmisión</span>
            <b style={{ fontSize: '1rem', paddingTop: 4 }}>{juego.canal}</b>
          </div>
        )}
      </div>
      {p && (
        <span className="premio">
          Premio mayor <b className="num">{p}</b>
        </span>
      )}
      {r.revancha && (
        <div className="dato">
          <span>Revancha</span>
          <Balotas r={r} revancha />
        </div>
      )}
    </div>
  );
}
