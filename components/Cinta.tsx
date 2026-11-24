import Link from 'next/link';
import type { ItemHoy } from '@/lib/vista';

/** Cinta que corre con los resultados del día (se detiene al pasar el dedo o el ratón). */
export function Cinta({ items }: { items: ItemHoy[] }) {
  if (items.length < 3) return null;
  const vuelta = items.map((i) => (
    <Link key={i.juego.slug} href={`/${i.juego.slug}`}>
      <span>{i.juego.nombre}</span>
      <b>{i.resultado!.numero}</b>
    </Link>
  ));
  return (
    <div className="cinta" aria-label="Resultados de hoy">
      <div className="cinta-pista" style={{ '--duracion': `${Math.max(30, items.length * 5)}s` } as React.CSSProperties}>
        {vuelta}
        <span aria-hidden="true" style={{ display: 'contents' }}>
          {items.map((i) => (
            <Link key={`b-${i.juego.slug}`} href={`/${i.juego.slug}`} tabIndex={-1}>
              <span>{i.juego.nombre}</span>
              <b>{i.resultado!.numero}</b>
            </Link>
          ))}
        </span>
      </div>
    </div>
  );
}
