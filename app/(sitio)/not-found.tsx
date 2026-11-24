import Link from 'next/link';
import { Banda } from '@/components/Banda';

export default function NoEncontrado() {
  return (
    <>
    <Banda titulo="No encontramos esa página" sub="Puede que el sorteo o la fecha no existan." corta />
    <div className="contenedor">
      <p style={{ marginTop: 24 }}>
        <Link href="/" className="boton">
          Ver los resultados de hoy
        </Link>
      </p>
    </div>
    </>
  );
}
