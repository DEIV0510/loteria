// Completa el número de sorteo que falta en el historial (lo que entró por la fuente B no lo trae).
// Cada sorteo es el anterior + 1, así que se cuenta desde el número conocido más cercano,
// pero SOLO cuando las fechas van seguidas según el horario del juego (si falta un día, se detiene).
// También revisa la fuente A para completar sorteo/signo del último resultado.
// Uso: npx tsx --env-file=.env.produccion scripts/completar-sorteos.ts            (solo muestra)
//      npx tsx --env-file=.env.produccion scripts/completar-sorteos.ts --aplicar  (guarda)
import { filas, q } from '../lib/db';
import { diaSemana, sumarDias } from '../lib/fechas';
import { consultarRDL } from '../lib/fuentes/rdl';
import { JUEGOS } from '../lib/juegos';
import type { Juego } from '../lib/tipos';

const APLICAR = process.argv.includes('--aplicar');

type Fila = { fecha: string; sorteo: string | null; signo: string | null; numero: string; manual: number };

function vecina(j: Juego, fecha: string, paso: 1 | -1): string | null {
  for (let i = 1; i <= 8; i++) {
    const f = sumarDias(fecha, paso * i);
    if (j.horario[diaSemana(f)]) return f;
  }
  return null;
}

/** Recorre en un sentido y devuelve {fecha: sorteo} para las filas sin número. */
function contar(j: Juego, lista: Fila[], paso: 1 | -1, conflictos: string[]): Map<string, string> {
  const nuevos = new Map<string, string>();
  let ancla: { fecha: string; sorteo: number } | null = null;
  for (const f of lista) {
    const conocido = f.sorteo && /^\d+$/.test(f.sorteo) ? Number(f.sorteo) : null;
    if (ancla && vecina(j, ancla.fecha, paso) === f.fecha) {
      const esperado: number = ancla.sorteo + paso;
      if (conocido === null) {
        nuevos.set(f.fecha, String(esperado));
        ancla = { fecha: f.fecha, sorteo: esperado };
        continue;
      }
      if (conocido !== esperado) conflictos.push(`${j.slug} ${f.fecha}: tiene ${conocido}, contando daría ${esperado}`);
    }
    ancla = conocido === null ? null : { fecha: f.fecha, sorteo: conocido };
  }
  return nuevos;
}

async function main() {
  const conflictos: string[] = [];
  let total = 0;
  for (const j of JUEGOS) {
    if (j.tipo !== 'chance' && j.tipo !== 'loteria') continue;

    // 1) Último resultado: lo que diga la fuente A para esa misma fecha.
    if (j.fuentes.rdl) {
      try {
        const a = (await consultarRDL(j.fuentes.rdl, j.tipo)).resultado;
        const [u] = await filas<Fila>('SELECT fecha, sorteo, signo, numero, manual FROM resultados WHERE juego = ? AND fecha = ?', [j.slug, a?.fecha ?? '']);
        if (a && u && Number(u.manual) !== 1 && u.numero === a.numero) {
          const sorteo = !u.sorteo && a.sorteo ? a.sorteo : null;
          const signo = !u.signo && a.signo && j.familia === 'Astro' ? a.signo : null;
          if (sorteo || signo) {
            console.log(`${j.slug} ${a.fecha}: fuente A →${sorteo ? ` sorteo ${sorteo}` : ''}${signo ? ` signo ${signo}` : ''}`);
            if (APLICAR) await q('UPDATE resultados SET sorteo = COALESCE(sorteo, ?), signo = COALESCE(signo, ?) WHERE juego = ? AND fecha = ?', [sorteo, signo, j.slug, a.fecha]);
            total++;
          }
        } else if (a && u && u.numero !== a.numero) {
          conflictos.push(`${j.slug} ${a.fecha}: número distinto en la fuente A (${a.numero}) y en la base (${u.numero})`);
        }
      } catch (e) {
        console.log(`${j.slug}: fuente A no respondió (${(e as Error).message})`);
      }
    }

    // 2) Historial: contar hacia atrás y hacia adelante desde los números conocidos.
    const lista = await filas<Fila>('SELECT fecha, sorteo, signo, numero, manual FROM resultados WHERE juego = ? ORDER BY fecha DESC', [j.slug]);
    const atras = contar(j, lista, -1, conflictos);
    const adelante = contar(j, [...lista].reverse(), 1, conflictos);
    const todos = new Map([...adelante, ...atras]);
    for (const [fecha, s] of adelante) if (atras.has(fecha) && atras.get(fecha) !== s) conflictos.push(`${j.slug} ${fecha}: hacia atrás ${atras.get(fecha)}, hacia adelante ${s}`);
    if (!todos.size) continue;
    const sin = lista.filter((f) => !f.sorteo).length;
    console.log(`${j.slug}: completa ${todos.size} de ${sin} sin sorteo`);
    total += todos.size;
    if (APLICAR) {
      for (const [fecha, s] of todos) {
        await q('UPDATE resultados SET sorteo = ? WHERE juego = ? AND fecha = ? AND (sorteo IS NULL OR sorteo = \'\')', [s, j.slug, fecha]);
      }
    }
  }
  console.log(`\n${total} cambios${APLICAR ? ' guardados' : ' (sin guardar: usa --aplicar)'}`);
  if (conflictos.length) console.log(`\nConflictos (${conflictos.length}):\n${conflictos.join('\n')}`);
  process.exit(0);
}
main();
