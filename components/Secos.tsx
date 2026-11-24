import type { Seco } from '@/lib/tipos';

export function Secos({ secos }: { secos: Seco[] }) {
  return (
    <details className="mas" style={{ marginTop: 0 }}>
      <summary>Ver los {secos.length} premios secos</summary>
      <div className="tabla-envoltura">
        <table>
          <thead>
            <tr>
              <th>Premio</th>
              <th>Número</th>
              <th>Serie</th>
            </tr>
          </thead>
          <tbody>
            {secos.map((s, i) => (
              <tr key={i}>
                <td>{s.premio}</td>
                <td className="cifra-td">{s.numero}</td>
                <td className="num">{s.serie}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
