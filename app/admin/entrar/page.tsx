import { redirect } from 'next/navigation';
import { leerAjustes } from '@/lib/ajustes';
import { haySesion } from '@/lib/sesion';
import { FormEntrar } from './FormEntrar';

export default async function Entrar() {
  if (await haySesion()) redirect('/admin');
  const a = await leerAjustes();
  return (
    <main className="entrar">
      <div className="caja">
        <div>
          <h1 style={{ fontSize: '1.3rem' }}>{a.nombre}</h1>
          <p className="ayuda">Panel de administración</p>
        </div>
        <FormEntrar />
      </div>
    </main>
  );
}
