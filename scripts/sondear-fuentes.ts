// Revisa cada juego en las dos fuentes y muestra horario + último resultado.
// Uso: npx tsx scripts/sondear-fuentes.ts [salida.json]
import { writeFileSync } from 'node:fs';
import { JUEGOS } from '../lib/juegos';
import { consultarRDL } from '../lib/fuentes/rdl';
import { consultarAL } from '../lib/fuentes/astroluna';
import { leerHorario } from '../lib/horario-texto';

const pausa = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const out: unknown[] = [];
  for (const j of JUEGOS) {
    const fila: Record<string, unknown> = { slug: j.slug, nombre: j.nombre };
    if (j.fuentes.rdl) {
      try {
        const r = await consultarRDL(j.fuentes.rdl, j.tipo);
        const parsed = r.horarioTexto ? leerHorario(r.horarioTexto) : null;
        fila.rdl = { titulo: r.titulo, horarioTexto: r.horarioTexto, ultimo: r.resultado };
        fila.horarioFuente = parsed;
        fila.horarioCoincide = JSON.stringify(parsed) === JSON.stringify(j.horario);
      } catch (e) {
        fila.rdl = { error: String(e) };
      }
      await pausa(600);
    }
    if (j.fuentes.al) {
      try {
        const filas = await consultarAL(j.fuentes.al, j.tipo);
        fila.al = { filas: filas.length, ultimo: filas[0] ?? null };
      } catch (e) {
        fila.al = { error: String(e) };
      }
      await pausa(600);
    }
    const a = (fila.rdl as { ultimo?: { fecha: string; numero: string } } | undefined)?.ultimo;
    const b = (fila.al as { ultimo?: { fecha: string; numero: string } } | undefined)?.ultimo;
    const marca = !a || !b ? '·' : a.fecha === b.fecha ? (a.numero === b.numero ? 'OK' : 'DIFIERE') : 'fechas distintas';
    console.log(
      `${j.slug.padEnd(26)} rdl=${a ? `${a.fecha} ${a.numero}` : '—'.padEnd(15)}  al=${b ? `${b.fecha} ${b.numero}` : '—'}  ${marca}  horario=${fila.horarioCoincide === false ? 'REVISAR' : 'ok'}`,
    );
    out.push(fila);
  }
  if (process.argv[2]) writeFileSync(process.argv[2], JSON.stringify(out, null, 2));
}

main();
