export type TipoJuego = 'chance' | 'loteria' | 'baloto' | 'miloto' | 'colorloto';

/** Horario semanal: índice 0 = domingo … 6 = sábado; valor "HH:MM" (24 h) o null si no juega. */
export type Horario = [
  string | null, string | null, string | null, string | null,
  string | null, string | null, string | null,
];

export type Juego = {
  slug: string;
  nombre: string;
  tipo: TipoJuego;
  horario: Horario;
  canal?: string;
  /** Rutas del juego en cada fuente (null = esa fuente no lo publica). */
  fuentes: { rdl: string | null; al: string | null };
  /** Para agrupar en la portada (Dorado Mañana/Tarde/Noche -> "Dorado"). */
  familia?: string;
};

export type Seco = { premio: string; numero: string; serie: string };
export type Balota = { n: string; color?: string; super?: boolean };

/** Un resultado tal como lo entrega una fuente (o lo escribe el administrador). */
export type Resultado = {
  juego: string;
  fecha: string; // AAAA-MM-DD
  sorteo?: string | null;
  numero: string; // "1004", "04-05-20-21-22-15"…
  serie?: string | null; // loterías
  quinta?: string | null; // chances con quinta cifra
  signo?: string | null; // Astro
  balotas?: Balota[] | null; // Baloto, MiLoto, ColorLoto
  revancha?: Balota[] | null; // Baloto Revancha
  secos?: Seco[] | null; // premios secos de las loterías
  fuente: string; // 'rdl' | 'al' | 'manual'
};

export type FilaResultado = Resultado & {
  manual: boolean;
  creado: string; // ISO UTC
  actualizado: string; // ISO UTC
};
