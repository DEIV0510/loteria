import type { Metadata } from 'next';
import { Banda } from '@/components/Banda';
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
    <>
      <Banda titulo="Chances" sub="Último resultado de cada chance" corta />
      <div className="contenedor">
        <section className="seccion">
          <Listado juegos={CHANCES} />
        </section>
      </div>
    </>
  );
}
