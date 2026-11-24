import Link from 'next/link';

export default function NoEncontrado() {
  return (
    <div className="contenedor">
      <header className="juego-cabeza" style={{ paddingTop: 40 }}>
        <h1>No encontramos esa página</h1>
        <p className="sub">Puede que el sorteo o la fecha no existan.</p>
      </header>
      <p style={{ marginTop: 20 }}>
        <Link href="/" className="boton">
          Ver los resultados de hoy
        </Link>
      </p>
    </div>
  );
}
