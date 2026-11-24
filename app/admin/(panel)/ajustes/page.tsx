import { leerAjustes } from '@/lib/ajustes';
import { FormAjustes, FormClave } from './Formularios';

export const dynamic = 'force-dynamic';

export default async function PanelAjustes() {
  const a = await leerAjustes();
  return (
    <div className="panel">
      <h1>Ajustes</h1>
      <FormAjustes a={a} />
      <FormClave />
    </div>
  );
}
