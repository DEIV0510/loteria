// Llena la base con los últimos ~100 resultados de cada juego.
// Uso: npx tsx --env-file-if-exists=.env.local scripts/cargar-historial.ts
import { cargarHistorial } from '../lib/robot';
import { filas } from '../lib/db';

async function main() {
  await cargarHistorial((s) => console.log(s));
  const [t] = await filas<{ n: number; j: number; min: string; max: string }>(
    'SELECT COUNT(*) AS n, COUNT(DISTINCT juego) AS j, MIN(fecha) AS min, MAX(fecha) AS max FROM resultados',
  );
  console.log(`\nTotal: ${t.n} resultados de ${t.j} juegos (${t.min} a ${t.max})`);
}

main();
