// Arma lo que muestra la portada: qué salió hoy, qué falta y lo último de cada lotería.
import { turnosDelDia } from './agenda';
import { hoyISO, sumarDias } from './fechas';
import { JUEGOS, juego } from './juegos';
import { resultadosDelDia, ultimos } from './resultados';
import type { FilaResultado, Juego } from './tipos';

export type ItemHoy = {
  juego: Juego;
  hora: string | null; // "HH:MM" programada hoy
  ms: number | null;
  resultado: FilaResultado | null;
  estado: 'listo' | 'esperando' | 'pendiente';
};

export async function portada(ahora = Date.now()) {
  const hoy = hoyISO(ahora);
  const [delDia, ult] = await Promise.all([resultadosDelDia(hoy), ultimos()]);
  const porJuego = new Map(delDia.map((r) => [r.juego, r]));

  const items: ItemHoy[] = turnosDelDia(hoy).map((t) => {
    const r = porJuego.get(t.juego.slug) ?? null;
    return {
      juego: t.juego,
      hora: t.hora,
      ms: t.ms,
      resultado: r,
      estado: r ? 'listo' : t.ms <= ahora ? 'esperando' : 'pendiente',
    };
  });
  // Resultados de hoy que no estaban en el horario (sorteos movidos por festivo, extras…)
  for (const r of delDia) {
    if (items.some((i) => i.juego.slug === r.juego)) continue;
    const j = juego(r.juego);
    if (j) items.push({ juego: j, hora: null, ms: null, resultado: r, estado: 'listo' });
  }

  const listos = items
    .filter((i) => i.estado === 'listo')
    .sort((a, b) => (b.ms ?? 0) - (a.ms ?? 0));
  const esperando = items.filter((i) => i.estado === 'esperando').sort((a, b) => (a.ms ?? 0) - (b.ms ?? 0));
  const pendientes = items.filter((i) => i.estado === 'pendiente').sort((a, b) => (a.ms ?? 0) - (b.ms ?? 0));

  // Loterías: el último sorteo de cada una (la semana en curso), más reciente primero.
  const loterias = JUEGOS.filter((j) => j.tipo === 'loteria')
    .map((j) => ({ juego: j, resultado: ult.get(j.slug) ?? null }))
    .filter((x) => x.resultado && x.resultado.fecha >= sumarDias(hoy, -8))
    .sort((a, b) => (b.resultado!.fecha.localeCompare(a.resultado!.fecha)) || a.juego.nombre.localeCompare(b.juego.nombre));

  const balotas = JUEGOS.filter((j) => j.tipo === 'baloto' || j.tipo === 'miloto' || j.tipo === 'colorloto')
    .map((j) => ({ juego: j, resultado: ult.get(j.slug) ?? null }));

  return { hoy, listos, esperando, pendientes, loterias, balotas, total: items.length };
}
