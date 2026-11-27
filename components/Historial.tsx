import Link from 'next/link';
import { fechaLarga, fechaMedia, fechaSlug, mayus } from '@/lib/fechas';
import type { FilaResultado, Juego } from '@/lib/tipos';

/**
 * Últimos sorteos. Cabe entero en el celular sin deslizar de lado:
 * fecha corta con el sorteo debajo, número y serie/quinta en columnas propias.
 */
export function Historial({ juego, filas }: { juego: Juego; filas: FilaResultado[] }) {
  const extra = juego.tipo === 'loteria' ? 'Serie' : filas.some((f) => f.signo) ? 'Signo' : filas.some((f) => f.quinta) ? 'Quinta' : null;
  const balotas = juego.tipo !== 'chance' && juego.tipo !== 'loteria';
  return (
    <div className="tabla-envoltura historial">
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>{balotas ? 'Balotas' : 'Número'}</th>
            {extra && <th>{extra}</th>}
          </tr>
        </thead>
        <tbody>
          {filas.map((f) => (
            <tr key={f.fecha}>
              <td>
                <Link href={`/${juego.slug}/${fechaSlug(f.fecha)}`}>
                  <span className="fecha-larga">{mayus(fechaLarga(f.fecha))}</span>
                  <span className="fecha-media">{fechaMedia(f.fecha)}</span>
                </Link>
                {f.sorteo && <small className="historial-sorteo num">Sorteo {f.sorteo}</small>}
              </td>
              <td className={`cifra-td${balotas ? ' balotas-td' : ''}`}>{f.numero}</td>
              {extra && <td className="cifra-td extra-td">{(extra === 'Serie' ? f.serie : extra === 'Signo' ? f.signo : f.quinta) ?? '—'}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
