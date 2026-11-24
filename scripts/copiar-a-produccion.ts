// Copia los resultados de la base local (data/loteria.db) a la de producción (Turso).
// No pisa nada: solo agrega lo que falta.
// Uso: npx tsx --env-file=.env.produccion scripts/copiar-a-produccion.ts
import { createClient, type InStatement } from '@libsql/client';
import { db } from '../lib/db';

async function main() {
  if (!process.env.TURSO_DATABASE_URL) throw new Error('Falta TURSO_DATABASE_URL (usa --env-file=.env.produccion)');
  const remota = await db(); // crea las tablas si no existen
  const local = createClient({ url: 'file:data/loteria.db' });
  const { rows } = await local.execute('SELECT * FROM resultados ORDER BY fecha');
  console.log(`Local: ${rows.length} resultados`);

  const cols = ['juego', 'fecha', 'sorteo', 'numero', 'serie', 'quinta', 'signo', 'balotas', 'revancha', 'secos', 'fuente', 'manual', 'creado', 'actualizado'];
  const sql = `INSERT OR IGNORE INTO resultados (${cols.join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`;
  for (let i = 0; i < rows.length; i += 300) {
    const lote: InStatement[] = rows.slice(i, i + 300).map((r) => ({
      sql,
      args: cols.map((c) => (r[c] === undefined ? null : r[c])) as never,
    }));
    await remota.batch(lote, 'write');
    process.stdout.write(`\r${Math.min(i + 300, rows.length)} / ${rows.length}`);
  }
  const t = await remota.execute('SELECT COUNT(*) AS n, COUNT(DISTINCT juego) AS j, MAX(fecha) AS max FROM resultados');
  console.log(`\nProducción: ${t.rows[0].n} resultados de ${t.rows[0].j} juegos (último ${t.rows[0].max})`);
  local.close();
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
