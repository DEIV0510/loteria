// Consulta SQL rápida a la base (solo lectura en la práctica).
// Uso: npx tsx --env-file-if-exists=.env.local scripts/consulta.ts "SELECT ..."
import { filas } from '../lib/db';

filas(process.argv[2] ?? 'SELECT COUNT(*) AS n FROM resultados')
  .then((r) => {
    console.table(r);
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
