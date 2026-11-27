// Catálogo de juegos. Horarios en hora de Colombia, tomados de la fuente A
// (resultadodelaloteria.com) y comprobados con scripts/sondear-fuentes.ts.
import type { Horario, Juego, TipoJuego } from './tipos';

const N = null;
/** Todos los días a la misma hora. */
const todos = (h: string): Horario => [h, h, h, h, h, h, h];
/** De lunes a sábado. */
const lunSab = (h: string): Horario => [N, h, h, h, h, h, h];
/** Lunes a viernes / sábado / domingo con horas distintas (null = no juega). */
const sem = (lv: string, s: string | null, d: string | null): Horario => [d, lv, lv, lv, lv, lv, s];
/** Días sueltos: {1: '22:30'} = lunes 10:30 p. m. */
const dias = (m: Partial<Record<0 | 1 | 2 | 3 | 4 | 5 | 6, string>>): Horario =>
  [0, 1, 2, 3, 4, 5, 6].map((d) => m[d as 0] ?? N) as Horario;

function j(
  slug: string,
  nombre: string,
  tipo: TipoJuego,
  horario: Horario,
  rdl: string | null,
  al: string | null,
  familia?: string,
  canal?: string,
): Juego {
  return { slug, nombre, tipo, horario, fuentes: { rdl, al }, familia, canal };
}

export const JUEGOS: Juego[] = [
  // Chances
  j('antioquenita-dia', 'Antioqueñita Día', 'chance', sem('10:00', '10:00', '12:00'), 'antioquenita-dia', 'antioquenita-dia', 'Antioqueñita', 'Teleantioquia'),
  j('antioquenita-tarde', 'Antioqueñita Tarde', 'chance', todos('16:00'), 'antioquenita-tarde', 'antioquenita-tarde', 'Antioqueñita', 'Teleantioquia'),
  j('astro-sol', 'Super Astro Sol', 'chance', lunSab('16:00'), 'astro-sol', 'astro-sol', 'Astro', 'Canal Uno'),
  j('astro-luna', 'Super Astro Luna', 'chance', [ '20:30', '22:50', '22:50', '22:50', '22:50', '22:50', '22:42' ], 'astro-luna', 'resultado', 'Astro', 'Canal Uno'),
  j('cafeterito-tarde', 'Cafeterito Tarde', 'chance', lunSab('12:00'), 'cafeterito-tarde', 'cafeterito-tarde', 'Cafeterito', 'Canal Uno'),
  j('cafeterito-noche', 'Cafeterito Noche', 'chance', todos('20:00'), 'cafeterito-noche', 'cafeterito-noche', 'Cafeterito', 'Canal Uno'),
  j('caribena-dia', 'Caribeña Día', 'chance', todos('14:30'), 'caribena-dia', 'caribena-dia', 'Caribeña', 'Telecaribe'),
  j('caribena-noche', 'Caribeña Noche', 'chance', sem('22:30', '22:30', '20:30'), 'caribena-noche', 'caribena-noche', 'Caribeña', 'Telecaribe'),
  j('chontico-dia', 'Chontico Día', 'chance', todos('13:00'), 'chontico-dia', 'chontico-dia', 'Chontico', 'Telepacífico'),
  j('chontico-noche', 'Chontico Noche', 'chance', sem('19:00', '22:00', '20:00'), 'chontico-noche', 'chontico-noche', 'Chontico', 'Telepacífico'),
  j('culona-dia', 'Culona Día', 'chance', todos('14:30'), 'culona-dia', 'culona-dia', 'Culona', 'Canal TRO'),
  j('culona-noche', 'Culona Noche', 'chance', sem('20:30', '20:30', '20:00'), 'culona-noche', 'culona-noche', 'Culona', 'Canal TRO'),
  j('dorado-manana', 'Dorado Mañana', 'chance', lunSab('10:56'), 'dorado-manana', 'dorado-manana', 'Dorado', 'Canal Uno'),
  j('dorado-tarde', 'Dorado Tarde', 'chance', lunSab('15:30'), 'dorado-tarde', 'dorado-tarde', 'Dorado', 'Canal Uno'),
  j('dorado-noche', 'Dorado Noche', 'chance', sem('22:05', '22:15', '19:25'), 'dorado-noche', 'dorado-noche', 'Dorado', 'Canal Uno'),
  j('fantastica-dia', 'Fantástica Día', 'chance', lunSab('13:00'), 'fantastica-dia', 'fantastica-dia', 'Fantástica', 'Telecaribe'),
  j('fantastica-noche', 'Fantástica Noche', 'chance', sem('20:30', '20:30', '20:40'), 'fantastica-noche', 'fantastica-noche', 'Fantástica', 'Telecaribe'),
  j('motilon-tarde', 'Motilón Tarde', 'chance', todos('15:00'), 'motilon-tarde', 'motilon-dia', 'Motilón', 'Canal TRO'),
  j('motilon-noche', 'Motilón Noche', 'chance', todos('21:00'), 'motilon-noche', 'motilon-noche', 'Motilón', 'Canal TRO'),
  j('paisita-dia', 'Paisita Día', 'chance', sem('13:00', '13:00', '14:00'), 'paisita-dia', 'paisita-dia', 'Paisita', 'Teleantioquia'),
  j('paisita-noche', 'Paisita Noche', 'chance', sem('18:00', '18:00', '20:00'), 'paisita-noche', 'paisita-noche', 'Paisita', 'Teleantioquia'),
  j('paisita-3', 'Paisita 3', 'chance', dias({ 6: '22:00' }), 'paisita-3', 'paisita-tres', 'Paisita', 'Teleantioquia'),
  j('pijao-de-oro', 'Pijao de Oro', 'chance', sem('14:00', '21:00', '20:00'), 'pijao-de-oro', 'pijao-oro', 'Pijao', 'Canal Uno'),
  j('saman', 'Samán de la Suerte', 'chance', sem('13:00', '13:00', '19:00'), 'saman', 'saman', 'Samán', 'Canal Uno'),
  j('sinuano-dia', 'Sinuano Día', 'chance', todos('14:30'), 'sinuano-dia', 'sinuano', 'Sinuano', 'Telecaribe'),
  j('sinuano-noche', 'Sinuano Noche', 'chance', sem('22:30', '22:30', '20:30'), 'sinuano-noche', 'sinuano-noche', 'Sinuano', 'Telecaribe'),
  j('cash-three-dia', 'Cash Three Día', 'chance', todos('12:30'), 'cash-3-dia', null, 'Cash Three'),
  j('cash-three-noche', 'Cash Three Noche', 'chance', todos('19:00'), 'cash-3-noche', 'cash-three-noche', 'Cash Three'),
  j('play-four-dia', 'Play Four Día', 'chance', todos('12:30'), 'play-4-dia', null, 'Play Four'),
  j('play-four-noche', 'Play Four Noche', 'chance', todos('19:00'), 'play-4-noche', 'play-four-noche', 'Play Four'),

  // Loterías
  j('loteria-de-cundinamarca', 'Lotería de Cundinamarca', 'loteria', dias({ 1: '22:30' }), 'loteria-de-cundinamarca', 'cundinamarca', undefined, 'Canal Uno'),
  j('loteria-del-tolima', 'Lotería del Tolima', 'loteria', dias({ 1: '22:30' }), 'loteria-del-tolima', 'tolima'),
  j('loteria-de-la-cruz-roja', 'Lotería de la Cruz Roja', 'loteria', dias({ 2: '22:55' }), 'loteria-de-la-cruz-roja', 'cruz-roja', undefined, 'Canal Uno'),
  j('loteria-del-huila', 'Lotería del Huila', 'loteria', dias({ 2: '22:30' }), 'loteria-del-huila', 'huila'),
  j('loteria-de-manizales', 'Lotería de Manizales', 'loteria', dias({ 3: '22:30' }), 'loteria-de-manizales', 'manizales', undefined, 'Telecafé'),
  j('loteria-del-meta', 'Lotería del Meta', 'loteria', dias({ 3: '22:30' }), 'loteria-del-meta', 'meta', undefined, 'Canal Trece'),
  j('loteria-del-valle', 'Lotería del Valle', 'loteria', dias({ 3: '22:30' }), 'loteria-del-valle', 'valle', undefined, 'Telepacífico'),
  j('loteria-de-bogota', 'Lotería de Bogotá', 'loteria', dias({ 4: '23:15' }), 'loteria-de-bogota', 'bogota', undefined, 'Canal Uno'),
  j('loteria-del-quindio', 'Lotería del Quindío', 'loteria', dias({ 4: '22:30' }), 'loteria-del-quindio', 'quindio', undefined, 'Telecafé'),
  j('loteria-de-medellin', 'Lotería de Medellín', 'loteria', dias({ 5: '23:00' }), 'loteria-de-medellin', 'medellin', undefined, 'Teleantioquia'),
  j('loteria-de-risaralda', 'Lotería de Risaralda', 'loteria', dias({ 5: '23:00' }), 'loteria-de-risaralda', 'risaralda', undefined, 'Telecafé'),
  j('loteria-de-santander', 'Lotería de Santander', 'loteria', dias({ 5: '23:00' }), 'loteria-de-santander', 'santander', undefined, 'Canal TRO'),
  j('loteria-de-boyaca', 'Lotería de Boyacá', 'loteria', dias({ 6: '22:42' }), 'loteria-de-boyaca', 'boyaca', undefined, 'Canal Trece'),
  j('loteria-del-cauca', 'Lotería del Cauca', 'loteria', dias({ 6: '23:00' }), 'loteria-del-cauca', 'cauca', undefined, 'Telepacífico'),
  j('extra-de-colombia', 'Extra de Colombia', 'loteria', [N, N, N, N, N, N, N], 'extra-de-colombia', null, undefined, 'Canal Uno'),

  // Juegos de balotas
  j('baloto', 'Baloto', 'baloto', dias({ 1: '23:00', 3: '23:00', 6: '23:00' }), 'baloto', null, undefined, 'Canal Uno'),
  j('miloto', 'MiLoto', 'miloto', dias({ 1: '22:00', 2: '22:00', 4: '22:00', 5: '22:00' }), 'miloto', null, undefined, 'Canal Uno'),
  j('colorloto', 'ColorLoto', 'colorloto', dias({ 1: '23:40', 4: '23:00' }), 'colorloto', null, undefined, 'Canal Uno'),
];

export const POR_SLUG = new Map(JUEGOS.map((g) => [g.slug, g]));

export function juego(slug: string): Juego | undefined {
  return POR_SLUG.get(slug);
}

export const CHANCES = JUEGOS.filter((g) => g.tipo === 'chance');
export const LOTERIAS = JUEGOS.filter((g) => g.tipo === 'loteria');
export const BALOTAS = JUEGOS.filter((g) => g.tipo === 'baloto' || g.tipo === 'miloto' || g.tipo === 'colorloto');
