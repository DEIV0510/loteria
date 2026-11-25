import Link from 'next/link';
import { fechaCorta, hora12 } from '@/lib/fechas';
import { textoPremio } from '@/lib/premios';
import type { FilaResultado, Juego } from '@/lib/tipos';
import { Cifras, Numero } from './Numero';
import { Detalles } from './Tarjeta';

/** Una lotería en grande: número, serie en bolas, sorteo y premio mayor. */
export function DestacadoLoteria({
  juego,
  r,
  premio,
  rotulo,
}: {
  juego: Juego;
  r: FilaResultado;
  premio?: number;
  rotulo: string;
}) {
  const p = textoPremio(premio);
  return (
    <Link href={`/${juego.slug}`} className="destacado">
      <span className="destacado-rotulo">
        <span>{rotulo}</span>
        <span>{fechaCorta(r.fecha)}</span>
      </span>
      <span className="destacado-nombre">{juego.nombre}</span>
      <span className="destacado-numeros">
        <Numero r={r} tam="grande" cae />
        {r.serie && (
          <span className="serie">
            <span className="serie-rotulo">Serie</span>
            <Cifras numero={r.serie} tam="serie" />
          </span>
        )}
      </span>
      <span className="destacado-pie">
        {r.sorteo && <span className="num">Sorteo {r.sorteo}</span>}
        <span className="ver">Ver historial →</span>
      </span>
      {p && (
        <span className="premio">
          Premio mayor <b className="num">{p}</b>
        </span>
      )}
    </Link>
  );
}

/** El último chance que salió hoy. */
export function DestacadoChance({ juego, r, hora, nuevo }: { juego: Juego; r: FilaResultado; hora: string | null; nuevo: boolean }) {
  return (
    <Link href={`/${juego.slug}`} className="destacado">
      <span className="destacado-rotulo">
        <span>{nuevo ? 'Acaba de salir' : 'Último resultado'}</span>
        {hora && <span className="num">{hora12(hora)}</span>}
      </span>
      <span className="destacado-nombre">{juego.nombre}</span>
      <Numero r={r} tam="grande" cae />
      <span className="destacado-pie">
        <Detalles r={r} />
        <span className="ver">Ver historial →</span>
      </span>
    </Link>
  );
}
