// Convierte la frase de horario de la fuente en un horario semanal.
// "de lunes a viernes a las 10:50 p. m., los sábados a las 10:42 p. m. y los domingos a las 8:30 p. m."
import type { Horario } from './tipos';

const DIA: Record<string, number> = {
  domingo: 0, domingos: 0, lunes: 1, martes: 2, miercoles: 3, jueves: 4, viernes: 5, sabado: 6, sabados: 6,
};

function sinTildes(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function a24(h: number, m: number, ap: string) {
  let hh = h % 12;
  if (ap === 'p') hh += 12;
  return `${String(hh).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function diasDe(expr: string): number[] {
  const e = sinTildes(expr).replace(/^[,\s]*(y\s+)?/, '').trim();
  if (/todos los dias/.test(e)) return [0, 1, 2, 3, 4, 5, 6];
  const rango = /de (\w+) a (\w+)/.exec(e);
  if (rango && rango[1] in DIA && rango[2] in DIA) {
    const out: number[] = [];
    for (let d = DIA[rango[1]]; ; d = (d + 1) % 7) {
      out.push(d);
      if (d === DIA[rango[2]]) break;
    }
    return out;
  }
  return (e.match(/[a-z]+/g) ?? []).filter((w) => w in DIA).map((w) => DIA[w]);
}

export function leerHorario(texto: string): Horario | null {
  const h: Horario = [null, null, null, null, null, null, null];
  const re = /(.*?)a las? (\d{1,2}):(\d{2})\s*([ap])\.?\s?m\.?/gi;
  let m: RegExpExecArray | null;
  let algo = false;
  while ((m = re.exec(texto))) {
    const dias = diasDe(m[1]);
    for (const d of dias) {
      h[d] = a24(Number(m[2]), Number(m[3]), m[4].toLowerCase());
      algo = true;
    }
  }
  return algo ? h : null;
}
