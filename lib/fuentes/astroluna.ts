// Fuente B: astroluna.co/<ruta>
// Publica una tabla con los últimos resultados (hasta 100) de chances y loterías.
import { parse } from 'node-html-parser';
import { leerFechaES } from '../fechas';
import type { Resultado } from '../tipos';
import { limpio, signoNormal, soloDigitos, traerHTML } from './comun';

export const AL_BASE = 'https://www.astroluna.co/';

export type FilaAL = Omit<Resultado, 'juego'>;

export function leerAL(html: string, tipo: string): FilaAL[] {
  const root = parse(html);
  const tabla = root.querySelector('#tabla-resultados');
  if (!tabla) return [];
  const cabeza = tabla.querySelectorAll('thead th').map((th) => limpio(th.text).toLowerCase());
  const esSigno = cabeza.some((c) => c.startsWith('signo'));
  const filas: FilaAL[] = [];
  for (const tr of tabla.querySelectorAll('tbody tr')) {
    const td = tr.querySelectorAll('td').map((c) => limpio(c.text));
    if (td.length < 2) continue;
    const fecha = leerFechaES(td[0]);
    const numero = soloDigitos(td[1]);
    if (!fecha || numero.length < 3) continue;
    const extra = td[2] ?? '';
    // Astro Sol: la columna dice «Serie/Quinta» pero trae el signo. Se decide por el contenido.
    const signo = tipo === 'chance' ? signoNormal(extra) : null;
    filas.push({
      fecha,
      numero,
      sorteo: null,
      serie: tipo === 'loteria' ? soloDigitos(extra) || null : null,
      quinta: tipo === 'chance' && !esSigno && !signo ? soloDigitos(extra) || null : null,
      signo: esSigno || signo ? signo ?? signoNormal(extra) : null,
      balotas: null,
      revancha: null,
      secos: null,
      fuente: 'al',
    });
  }
  return filas;
}

export async function consultarAL(ruta: string, tipo: string): Promise<FilaAL[]> {
  return leerAL(await traerHTML(AL_BASE + ruta), tipo);
}
