// Cifras más calientes y más frías por posición en los últimos sorteos.
// Caliente = la cifra que más salió en esa posición; fría = la que menos (puede ser 0 veces).
import type { FilaResultado } from './tipos';

export type Posicion = { digito: string; veces: number };
export type Pronostico = {
  sorteos: number;
  cifras: number;
  calientes: Posicion[];
  frios: Posicion[];
};

export function pronostico(filas: FilaResultado[], cuantos = 30): Pronostico | null {
  const usables = filas.filter((f) => /^\d{3,4}$/.test(f.numero));
  if (usables.length < 10) return null;
  // La cantidad de cifras más común (4 en casi todos; 3 en Cash Three).
  const largos = new Map<number, number>();
  for (const f of usables) largos.set(f.numero.length, (largos.get(f.numero.length) ?? 0) + 1);
  const cifras = [...largos.entries()].sort((a, b) => b[1] - a[1])[0][0];
  const base = usables.filter((f) => f.numero.length === cifras).slice(0, cuantos); // ya vienen del más nuevo al más viejo

  const calientes: Posicion[] = [];
  const frios: Posicion[] = [];
  for (let p = 0; p < cifras; p++) {
    const veces = Array(10).fill(0) as number[];
    const ultimaVez = Array(10).fill(Infinity) as number[]; // índice del sorteo más reciente en que salió
    base.forEach((f, i) => {
      const d = Number(f.numero[p]);
      veces[d]++;
      if (ultimaVez[d] === Infinity) ultimaVez[d] = i;
    });
    const orden = [...Array(10).keys()];
    // Empates en calientes: gana la que salió más recientemente.
    const cal = [...orden].sort((a, b) => veces[b] - veces[a] || ultimaVez[a] - ultimaVez[b])[0];
    // Empates en fríos: gana la que lleva más tiempo sin salir.
    const fri = [...orden].sort((a, b) => veces[a] - veces[b] || ultimaVez[b] - ultimaVez[a])[0];
    calientes.push({ digito: String(cal), veces: veces[cal] });
    frios.push({ digito: String(fri), veces: veces[fri] });
  }
  return { sorteos: base.length, cifras, calientes, frios };
}
