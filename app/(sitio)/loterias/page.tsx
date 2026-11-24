import type { Metadata } from 'next';
import { Listado } from '@/components/Listado';
import { BALOTAS, LOTERIAS } from '@/lib/juegos';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Resultados de las loterías de Colombia',
  description: 'Número ganador, serie y premios secos del último sorteo de cada lotería de Colombia.',
  alternates: { canonical: '/loterias' },
};

export default function Loterias() {
  return (
    <div className="contenedor">
      <header className="juego-cabeza" style={{ paddingTop: 26 }}>
        <h1>Loterías</h1>
        <p className="sub">Número ganador y serie del último sorteo</p>
      </header>
      <section className="seccion">
        <Listado juegos={LOTERIAS} />
      </section>
      <section className="seccion">
        <div className="seccion-cabeza">
          <h2>Baloto, MiLoto y ColorLoto</h2>
        </div>
        <Listado juegos={BALOTAS} />
      </section>
    </div>
  );
}
