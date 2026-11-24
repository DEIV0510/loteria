import type { FilaResultado, Juego } from '@/lib/tipos';
import { Balotas, Numero } from './Numero';

export function ResultadoGrande({ juego, r }: { juego: Juego; r: FilaResultado }) {
  return (
    <div className="resultado-grande">
      <Numero r={r} tam="grande" />
      <div className="datos">
        {r.quinta && (
          <div className="dato">
            <span>Quinta</span>
            <b>{r.quinta}</b>
          </div>
        )}
        {r.serie && (
          <div className="dato">
            <span>Serie</span>
            <b>{r.serie}</b>
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
      {r.revancha && (
        <div className="dato">
          <span>Revancha</span>
          <Balotas r={r} revancha />
        </div>
      )}
    </div>
  );
}
