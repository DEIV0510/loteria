import type { Metadata } from 'next';
import { Listado } from '@/components/Listado';
import { CHANCES } from '@/lib/juegos';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Resultados de chances de hoy',
  description: 'Último resultado de cada chance de Colombia: Dorado, Chontico, Astro, Paisita, Culona, Sinuano, Caribeña y más.',
  alternates: { canonical: '/chances' },
};

export default function Chances() {
  return (
    <div className="contenedor">
      <header className="juego-cabeza" style={{ paddingTop: 26 }}>
        <h1>Chances</h1>
        <p className="sub">Último resultado de cada chance</p>
      </header>
      <section className="seccion">
        <Listado juegos={CHANCES} />
      </section>
    </div>
  );
}
