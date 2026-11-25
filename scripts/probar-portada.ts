// Muestra qué iría arriba en la portada a distintas horas (solo para pruebas).
// Uso: npx tsx scripts/probar-portada.ts 2026-11-24T08:00 2026-11-24T12:30 2026-11-24T23:30
import { portada } from '../lib/vista';

async function main() {
  for (const h of process.argv.slice(2)) {
    const ms = Date.parse(`${h}:00-05:00`);
    const p = await portada(ms);
    let arriba = 'nada';
    if (p.principal?.modo === 'loterias') {
      const lista = p.principal.loterias.map((x) => `${x.juego.nombre} ${x.resultado.numero}-${x.resultado.serie} (${p.premios[x.juego.slug]} M)`);
      arriba = `LOTERÍAS ${p.principal.fecha}: ${lista.join(' | ')}`;
    } else if (p.principal?.modo === 'chance') {
      arriba = `CHANCE: ${p.principal.item.juego.nombre} ${p.principal.item.resultado!.numero}`;
    }
    console.log(`${h}  ->  ${arriba}   / rejilla: ${p.salieron.length}`);
  }
  process.exit(0);
}
main();
