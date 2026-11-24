import { Tarjeta } from './Tarjeta';
import { ultimos } from '@/lib/resultados';
import type { Juego } from '@/lib/tipos';

/** Último resultado de cada juego de la lista, más reciente primero. */
export async function Listado({ juegos }: { juegos: Juego[] }) {
  const u = await ultimos();
  const items = juegos
    .map((j) => ({ j, r: u.get(j.slug) }))
    .filter((x) => x.r)
    .sort((a, b) => b.r!.fecha.localeCompare(a.r!.fecha) || a.j.nombre.localeCompare(b.j.nombre));
  return (
    <div className="rejilla">
      {items.map(({ j, r }) => (
        <Tarjeta key={j.slug} juego={j} r={r!} conFecha />
      ))}
    </div>
  );
}
