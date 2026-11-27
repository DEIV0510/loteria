// Completa el signo del Super Astro Sol con la tabla de la fuente B (solo donde falta).
// Uso: npx tsx --env-file=.env.produccion scripts/completar-signos.ts [--aplicar]
import { filas, q } from '../lib/db';
import { consultarAL } from '../lib/fuentes/astroluna';
import { JUEGOS } from '../lib/juegos';

async function main() {
  const aplicar = process.argv.includes('--aplicar');
  for (const j of JUEGOS.filter((x) => x.familia === 'Astro' && x.fuentes.al)) {
    const tabla = await consultarAL(j.fuentes.al!, j.tipo);
    const base = new Map((await filas<{ fecha: string; numero: string; signo: string | null }>('SELECT fecha, numero, signo FROM resultados WHERE juego = ?', [j.slug])).map((r) => [r.fecha, r]));
    let n = 0;
    for (const t of tabla) {
      const b = base.get(t.fecha);
      if (!b || b.signo || !t.signo || b.numero !== t.numero) continue;
      n++;
      if (aplicar) await q('UPDATE resultados SET signo = ? WHERE juego = ? AND fecha = ? AND signo IS NULL', [t.signo, j.slug, t.fecha]);
    }
    console.log(`${j.slug}: ${n} signos ${aplicar ? 'guardados' : 'por completar'}`);
  }
  process.exit(0);
}
main();
