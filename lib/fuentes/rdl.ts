// Fuente A: resultadodelaloteria.com/colombia/<ruta>
// Publica el último resultado de cada juego, su horario y los premios secos.
import { parse, type HTMLElement } from 'node-html-parser';
import { leerFechaES } from '../fechas';
import type { Balota, Resultado, Seco } from '../tipos';
import { limpio, signoNormal, soloDigitos, traerHTML } from './comun';

export const RDL_BASE = 'https://resultadodelaloteria.com/colombia/';

const COLORES: Record<string, string> = {
  white: 'blanco', black: 'negro', red: 'rojo', green: 'verde', blue: 'azul', yellow: 'amarillo',
};

export type LecturaRDL = {
  resultado: Omit<Resultado, 'juego'> | null;
  /** Frase del horario tal como la publica la fuente ("juega de lunes a sábado a las 11:00 a. m."). */
  horarioTexto: string | null;
  titulo: string | null;
};

function balotasDe(cont: HTMLElement | null): Balota[] {
  if (!cont) return [];
  return cont
    .querySelectorAll('.ball')
    .filter((b) => !b.classList.contains('quinta-ball'))
    .map((b) => {
      const color = b.getAttribute('data-color');
      const bal: Balota = { n: limpio(b.text) };
      if (color) bal.color = COLORES[color] ?? color;
      if (b.classList.contains('super')) bal.super = true;
      return bal;
    })
    .filter((b) => b.n !== '');
}

export function leerRDL(html: string, tipo: string): LecturaRDL {
  const root = parse(html);
  const titulo = limpio(root.querySelector('h1')?.text) || null;
  const hero = root.querySelector('.result-hero');
  if (!hero) return { resultado: null, horarioTexto: null, titulo };

  const pills = hero.querySelectorAll('.result-meta .pill').map((p) => limpio(p.text));
  const fecha = pills.map(leerFechaES).find(Boolean) ?? null;
  const sorteo = pills.map((p) => /sorteo\s+(\d+)/i.exec(p)?.[1]).find(Boolean) ?? null;

  const resumen = limpio(hero.querySelector('.result-summary')?.text);
  const horarioTexto = /juegan?\s+(.+?\.\s?m\.)(?:\s+El próximo|\s*$)/i.exec(resumen)?.[1] ?? null;

  const balls = balotasDe(hero.querySelector('.balls'));
  const quinta = limpio(hero.querySelector('.quinta-ball')?.text) || null;
  const serie = soloDigitos(hero.querySelectorAll('.serie-balls .ball').map((b) => b.text).join('')) || null;
  const signo = signoNormal(limpio(hero.querySelector('.tag-signo')?.text));

  if (!fecha || balls.length === 0) return { resultado: null, horarioTexto, titulo };

  let numero: string;
  let balotas: Balota[] | null = null;
  if (tipo === 'chance' || tipo === 'loteria') {
    numero = soloDigitos(balls.map((b) => b.n).join(''));
  } else {
    balotas = balls;
    numero = balls.map((b) => (b.color ? `${b.n} ${b.color}` : b.n)).join(tipo === 'colorloto' ? ', ' : '-');
  }

  // Baloto Revancha: tarjeta aparte con <h2>Revancha</h2>
  let revancha: Balota[] | null = null;
  if (tipo === 'baloto') {
    const card = root.querySelectorAll('section.card').find((s) => limpio(s.querySelector('h2')?.text) === 'Revancha');
    const r = balotasDe(card?.querySelector('.balls') ?? null);
    revancha = r.length ? r : null;
  }

  // Premios secos (solo loterías)
  let secos: Seco[] | null = null;
  if (tipo === 'loteria') {
    const h2 = root.querySelectorAll('h2').find((h) => /premios secos/i.test(h.text));
    const tabla = h2?.parentNode?.querySelector('table');
    if (tabla) {
      secos = tabla
        .querySelectorAll('tbody tr')
        .map((tr) => tr.querySelectorAll('td').map((td) => limpio(td.text)))
        .filter((c) => c.length >= 3 && /\d/.test(c[1]))
        .map(([premio, numero, serie]) => ({ premio: premio.replace(/'$/, ' millones'), numero, serie }));
      if (!secos.length) secos = null;
    }
  }

  return {
    titulo,
    horarioTexto,
    resultado: {
      fecha,
      sorteo,
      numero,
      serie: tipo === 'loteria' ? serie : null,
      quinta: tipo === 'chance' ? quinta : null,
      signo: tipo === 'chance' ? signo : null,
      balotas,
      revancha,
      secos,
      fuente: 'rdl',
    },
  };
}

export async function consultarRDL(ruta: string, tipo: string): Promise<LecturaRDL> {
  return leerRDL(await traerHTML(RDL_BASE + ruta), tipo);
}
