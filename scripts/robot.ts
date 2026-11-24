// Corre una pasada del robot desde la terminal.
// Uso: npx tsx --env-file-if-exists=.env.local scripts/robot.ts [--todos]
import { correrRobot } from '../lib/robot';

correrRobot({ todos: process.argv.includes('--todos'), presupuestoMs: 120_000 }).then((r) => {
  console.log(JSON.stringify(r, null, 2));
  process.exit(0);
});
