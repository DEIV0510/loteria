import Link from 'next/link';
import { fechaLarga, fechaSlug, mayus } from '@/lib/fechas';
import type { FilaResultado, Juego } from '@/lib/tipos';

export function Historial({ juego, filas }: { juego: Juego; filas: FilaResultado[] }) {
  const extra = juego.tipo === 'loteria' ? 'Serie' : filas.some((f) => f.signo) ? 'Signo' : filas.some((f) => f.quinta) ? 'Quinta' : null;
  const balotas = juego.tipo !== 'chance' && juego.tipo !== 'loteria';
  return (
    <div className="tabla-envoltura">
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>{balotas ? 'Balotas' : 'Número'}</th>
            {extra && <th>{extra}</th>}
            <th>Sorteo</th>
          </tr>
        </thead>
        <tbody>
          {filas.map((f) => (
            <tr key={f.fecha}>
              <td>
                <Link href={`/${juego.slug}/${fechaSlug(f.fecha)}`}>
                  {mayus(fechaLarga(f.fecha))}
                </Link>
              </td>
              <td className="cifra-td">{f.numero}</td>
              {extra && <td className="num">{extra === 'Serie' ? f.serie : extra === 'Signo' ? f.signo : f.quinta}</td>}
              <td className="num" style={{ color: 'var(--muted)' }}>
                {f.sorteo ?? '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
