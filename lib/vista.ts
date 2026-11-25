// Arma lo que muestra la portada: qué salió hoy, qué falta y lo último de cada lotería.
import { turnosDelDia } from './agenda';
import { hoyISO, sumarDias } from './fechas';
import { JUEGOS, juego } from './juegos';
import { leerPremios } from './premios';
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
  const [delDia, ult, premios] = await Promise.all([resultadosDelDia(hoy), ultimos(), leerPremios()]);
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

  // Lo que va arriba, en grande (pedido del dueño):
  //  1) si hoy ya jugaron loterías, todas las de hoy, una debajo de otra;
  //  2) si no, pero ya salieron chances hoy, el último chance;
  //  3) si hoy no ha salido nada, las loterías del último día que jugaron.
  // Las loterías van de mayor a menor premio (la "principal" primero).
  const porPremio = (a: { juego: Juego }, b: { juego: Juego }) =>
    (premios[b.juego.slug] ?? 0) - (premios[a.juego.slug] ?? 0) || a.juego.nombre.localeCompare(b.juego.nombre);
  const loteriasHoy = listos
    .filter((i) => i.juego.tipo === 'loteria')
    .map((i) => ({ juego: i.juego, resultado: i.resultado! }))
    .sort(porPremio);
  let principal: { modo: 'loterias'; fecha: string; loterias: { juego: Juego; resultado: FilaResultado }[] } | { modo: 'chance'; item: ItemHoy } | null = null;
  if (loteriasHoy.length) {
    principal = { modo: 'loterias', fecha: hoy, loterias: loteriasHoy };
  } else if (listos.length) {
    principal = { modo: 'chance', item: listos[0] };
  } else if (loterias.length) {
    const fecha = loterias[0].resultado!.fecha;
    principal = {
      modo: 'loterias',
      fecha,
      loterias: loterias.filter((x) => x.resultado!.fecha === fecha).map((x) => ({ juego: x.juego, resultado: x.resultado! })).sort(porPremio),
    };
  }
  // La rejilla de "Ya salieron" no repite lo que ya va arriba.
  const arriba = new Set(
    principal?.modo === 'loterias' ? principal.loterias.map((x) => x.juego.slug) : principal ? [principal.item.juego.slug] : [],
  );
  const salieron = listos.filter((i) => !arriba.has(i.juego.slug));

  return { hoy, listos, salieron, esperando, pendientes, loterias, balotas, principal, premios, total: items.length };
}
