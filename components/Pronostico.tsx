import type { Pronostico as TPronostico } from '@/lib/pronostico';

const ORDINAL = ['1.ª', '2.ª', '3.ª', '4.ª'];

function Fila({ titulo, nota, numero, posiciones, frio }: { titulo: string; nota: string; numero: string; posiciones: { digito: string; veces: number }[]; frio?: boolean }) {
  return (
    <div className={`pronostico${frio ? ' frio' : ''}`}>
      <div className="pronostico-cabeza">
        <span className="pronostico-titulo">{titulo}</span>
        <span className="pronostico-nota">{nota}</span>
      </div>
      <div className="pronostico-cifras" role="img" aria-label={`${titulo}: ${numero}`}>
        {posiciones.map((p, i) => (
          <span key={i} className="pronostico-pos" aria-hidden="true">
            <span className={`bola${frio ? ' blanca' : ''}`}>{p.digito}</span>
            <small>
              {ORDINAL[i]} cifra
              <br />
              {p.veces === 0 ? 'no salió' : `${p.veces} ${p.veces === 1 ? 'vez' : 'veces'}`}
            </small>
          </span>
        ))}
      </div>
    </div>
  );
}

/** Las 4 cifras más calientes y las 4 más frías de los últimos sorteos. */
export function Pronostico({ p }: { p: TPronostico }) {
  const caliente = p.calientes.map((x) => x.digito).join('');
  const frio = p.frios.map((x) => x.digito).join('');
  return (
    <div className="pronosticos">
      <Fila titulo={`Pronóstico 1 · ${caliente}`} nota="Cifras más calientes" numero={caliente} posiciones={p.calientes} />
      <Fila titulo={`Pronóstico 2 · ${frio}`} nota="Cifras más frías" numero={frio} posiciones={p.frios} frio />
      <p className="pronostico-aviso">
        Calculado con lo que más y lo que menos salió en cada posición en los últimos {p.sorteos} sorteos. Es solo
        estadística: no garantiza premios.
      </p>
    </div>
  );
}
