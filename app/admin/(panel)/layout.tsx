import Link from 'next/link';
import { leerAjustes } from '@/lib/ajustes';
import { exigirSesion } from '@/lib/sesion';
import { salir } from '../acciones';
import { Pestanas } from './Pestanas';

export default async function LayoutPanel({ children }: { children: React.ReactNode }) {
  await exigirSesion();
  const a = await leerAjustes();
  return (
    <>
      <header className="panel-barra">
        <div className="contenedor">
          <Link href="/" className="titulo" target="_blank">
            {a.nombre} ↗
          </Link>
          <form action={salir}>
            <button type="submit">Salir</button>
          </form>
        </div>
      </header>
      <Pestanas />
      <main>{children}</main>
    </>
  );
}
