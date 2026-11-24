import Link from 'next/link';
import { fechaCorta, hora12 } from '@/lib/fechas';
import type { FilaResultado, Juego } from '@/lib/tipos';
import { Numero } from './Numero';

/** Detalles cortos bajo el número: quinta, serie, signo, sorteo. */
export function Detalles({ r }: { r: FilaResultado }) {
  return (
    <>
      {r.quinta && (
        <span>
          Quinta <b>{r.quinta}</b>
        </span>
      )}
      {r.serie && (
        <span>
          Serie <b className="num">{r.serie}</b>
        </span>
      )}
      {r.signo && <b>{r.signo}</b>}
      {r.sorteo && <span className="num">Sorteo {r.sorteo}</span>}
    </>
  );
}

export function Tarjeta({
  juego,
  r,
  hora,
  conFecha,
  nueva,
}: {
  juego: Juego;
  r: FilaResultado;
  hora?: string | null;
  conFecha?: boolean;
  nueva?: boolean;
}) {
  return (
    <Link href={`/${juego.slug}`} className={`tarjeta${nueva ? ' nueva' : ''}`}>
      <span className="tarjeta-cabeza">
        <span className="tarjeta-nombre">{juego.nombre}</span>
        <span className="tarjeta-hora num">
          {conFecha ? fechaCorta(r.fecha) : hora ? hora12(hora) : ''}
        </span>
      </span>
      <Numero r={r} />
      <span className="tarjeta-pie">
        {nueva && <span className="marca-nueva">Nuevo</span>}
        <Detalles r={r} />
      </span>
    </Link>
  );
}
