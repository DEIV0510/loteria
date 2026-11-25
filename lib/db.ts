// Base de datos libSQL: archivo local en desarrollo, Turso en producción.
import { createClient, type Client, type InArgs, type ResultSet } from '@libsql/client';
import { mkdirSync } from 'node:fs';

let cliente: Client | null = null;
let listo: Promise<void> | null = null;

const ESQUEMA = [
  `CREATE TABLE IF NOT EXISTS resultados (
    juego TEXT NOT NULL,
    fecha TEXT NOT NULL,
    sorteo TEXT,
    numero TEXT NOT NULL,
    serie TEXT,
    quinta TEXT,
    signo TEXT,
    balotas TEXT,
    revancha TEXT,
    secos TEXT,
    fuente TEXT NOT NULL,
    manual INTEGER NOT NULL DEFAULT 0,
    creado TEXT NOT NULL,
    actualizado TEXT NOT NULL,
    PRIMARY KEY (juego, fecha)
  )`,
  `CREATE INDEX IF NOT EXISTS idx_resultados_fecha ON resultados (fecha)`,
  `CREATE INDEX IF NOT EXISTS idx_resultados_numero ON resultados (numero)`,
  `CREATE TABLE IF NOT EXISTS revisiones (
    juego TEXT PRIMARY KEY,
    ultima INTEGER NOT NULL,
    estado TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS ajustes (clave TEXT PRIMARY KEY, valor TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS espacios (
    id TEXT PRIMARY KEY,
    imagen TEXT,
    enlace TEXT,
    texto TEXT,
    activo INTEGER NOT NULL DEFAULT 0,
    actualizado TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS medios (
    id TEXT PRIMARY KEY,
    tipo TEXT NOT NULL,
    datos BLOB NOT NULL,
    ancho INTEGER,
    alto INTEGER,
    creado TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS bitacora (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cuando TEXT NOT NULL,
    tipo TEXT NOT NULL,
    detalle TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS candados (nombre TEXT PRIMARY KEY, hasta INTEGER NOT NULL)`,
];

function crear(): Client {
  const url = process.env.TURSO_DATABASE_URL;
  if (url) return createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
  // En Vercel el disco es de solo lectura y se borra: sin Turso el sitio saldría vacío.
  if (process.env.VERCEL) {
    throw new Error('Falta la base de datos: agrega TURSO_DATABASE_URL y TURSO_AUTH_TOKEN en Vercel.');
  }
  mkdirSync('data', { recursive: true });
  return createClient({ url: 'file:data/loteria.db' });
}

async function preparar(c: Client) {
  await c.batch(ESQUEMA, 'write');
  // Columnas agregadas después de la primera versión.
  const cols = await c.execute('PRAGMA table_info(espacios)');
  if (!cols.rows.some((r) => r.name === 'posicion')) {
    await c.execute('ALTER TABLE espacios ADD COLUMN posicion TEXT');
  }
}

export async function db(): Promise<Client> {
  if (!cliente) cliente = crear();
  if (!listo) {
    listo = preparar(cliente).catch((e) => {
      listo = null;
      throw e;
    });
  }
  await listo;
  return cliente;
}

/** libSQL entra en pánico (y tumba el proceso) con parámetros sueltos: siempre array u objeto. */
function args(a?: InArgs | unknown): InArgs {
  if (a == null) return [];
  if (Array.isArray(a)) return a.map((v) => (v === undefined ? null : v)) as InArgs;
  if (typeof a === 'object') return a as InArgs;
  return [a] as InArgs;
}

export async function q(sql: string, a?: InArgs): Promise<ResultSet> {
  const c = await db();
  return c.execute({ sql, args: args(a) });
}

export async function filas<T>(sql: string, a?: InArgs): Promise<T[]> {
  const r = await q(sql, a);
  return r.rows as unknown as T[];
}

export async function anotar(tipo: string, detalle: string) {
  try {
    await q('INSERT INTO bitacora (cuando, tipo, detalle) VALUES (?, ?, ?)', [new Date().toISOString(), tipo, detalle.slice(0, 500)]);
    // Conserva solo lo último
    await q('DELETE FROM bitacora WHERE id <= (SELECT MAX(id) - 400 FROM bitacora)');
  } catch {
    /* la bitácora nunca debe romper nada */
  }
}

/** Candado simple entre procesos: true si lo tomamos. */
export async function tomarCandado(nombre: string, segundos: number): Promise<boolean> {
  const ahora = Date.now();
  const r = await q(
    `INSERT INTO candados (nombre, hasta) VALUES (?, ?)
     ON CONFLICT(nombre) DO UPDATE SET hasta = excluded.hasta WHERE candados.hasta < ?`,
    [nombre, ahora + segundos * 1000, ahora],
  );
  return r.rowsAffected > 0;
}

export async function soltarCandado(nombre: string) {
  await q('UPDATE candados SET hasta = 0 WHERE nombre = ?', [nombre]);
}
