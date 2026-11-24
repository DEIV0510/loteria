// Acceso al panel: una sola cuenta de administrador con clave.
import { createHmac, randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { guardarAjusteInterno, leerAjusteInterno } from './ajustes';
import { q } from './db';

const scrypt = promisify(scryptCb) as (p: string, s: Buffer, n: number) => Promise<Buffer>;
const COOKIE = 'panel';
const DURACION_S = 60 * 60 * 24 * 30; // 30 días: el dueño entra desde su celular

async function secreto(): Promise<string> {
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET;
  let s = await leerAjusteInterno('secreto_sesion');
  if (!s) {
    s = randomBytes(32).toString('hex');
    await guardarAjusteInterno('secreto_sesion', s);
  }
  return s;
}

async function firmar(datos: string) {
  return createHmac('sha256', await secreto()).update(datos).digest('base64url');
}

export async function hashClave(clave: string): Promise<string> {
  const sal = randomBytes(16);
  const h = await scrypt(clave, sal, 32);
  return `${sal.toString('hex')}:${h.toString('hex')}`;
}

async function claveCorrecta(clave: string, guardado: string): Promise<boolean> {
  const [salHex, hHex] = guardado.split(':');
  if (!salHex || !hHex) return false;
  const h = await scrypt(clave, Buffer.from(salHex, 'hex'), 32);
  const esperado = Buffer.from(hHex, 'hex');
  return esperado.length === h.length && timingSafeEqual(esperado, h);
}

/** true si la clave es válida. La primera vez usa ADMIN_PASSWORD y la guarda cifrada. */
export async function verificarClave(clave: string): Promise<boolean> {
  const guardado = await leerAjusteInterno('clave_hash');
  if (guardado) return claveCorrecta(clave, guardado);
  const inicial = process.env.ADMIN_PASSWORD;
  if (!inicial || clave.length === 0) return false;
  const a = Buffer.from(clave);
  const b = Buffer.from(inicial);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  await guardarAjusteInterno('clave_hash', await hashClave(inicial));
  return true;
}

export async function cambiarClave(nueva: string) {
  await guardarAjusteInterno('clave_hash', await hashClave(nueva));
  // Invalida las demás sesiones
  await guardarAjusteInterno('sesion_version', String(Date.now()));
}

async function version(): Promise<string> {
  return (await leerAjusteInterno('sesion_version')) ?? '0';
}

export async function abrirSesion() {
  const exp = Math.floor(Date.now() / 1000) + DURACION_S;
  const datos = `${exp}.${await version()}`;
  const valor = `${datos}.${await firmar(datos)}`;
  (await cookies()).set(COOKIE, valor, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: DURACION_S,
  });
}

export async function cerrarSesion() {
  (await cookies()).delete(COOKIE);
}

export async function haySesion(): Promise<boolean> {
  const v = (await cookies()).get(COOKIE)?.value;
  if (!v) return false;
  const partes = v.split('.');
  if (partes.length !== 3) return false;
  const [exp, ver, firma] = partes;
  const esperado = await firmar(`${exp}.${ver}`);
  const a = Buffer.from(firma);
  const b = Buffer.from(esperado);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  if (Number(exp) * 1000 < Date.now()) return false;
  return ver === (await version());
}

/** Para páginas y acciones del panel: sin sesión, al formulario de entrada. */
export async function exigirSesion() {
  if (!(await haySesion())) redirect('/admin/entrar');
}

/** Freno a los intentos de clave: máximo 8 por cada 15 minutos. */
export async function intentoPermitido(): Promise<boolean> {
  const ventana = Math.floor(Date.now() / (15 * 60 * 1000));
  const nombre = `intentos-${ventana}`;
  await q(
    `INSERT INTO candados (nombre, hasta) VALUES (?, 1)
     ON CONFLICT(nombre) DO UPDATE SET hasta = candados.hasta + 1`,
    [nombre],
  );
  const r = await q('SELECT hasta FROM candados WHERE nombre = ?', [nombre]);
  await q("DELETE FROM candados WHERE nombre LIKE 'intentos-%' AND nombre <> ?", [nombre]);
  return Number(r.rows[0]?.hasta ?? 0) <= 8;
}
