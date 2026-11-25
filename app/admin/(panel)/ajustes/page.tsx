import { leerAjustes } from '@/lib/ajustes';
import { LOTERIAS } from '@/lib/juegos';
import { leerPremios } from '@/lib/premios';
import { FormAjustes, FormClave, FormPremios } from './Formularios';

export const dynamic = 'force-dynamic';

export default async function PanelAjustes() {
  const [a, premios] = await Promise.all([leerAjustes(), leerPremios()]);
  return (
    <div className="panel">
      <h1>Ajustes</h1>
      <FormAjustes a={a} />
      <FormPremios loterias={LOTERIAS.map((l) => ({ slug: l.slug, nombre: l.nombre, millones: premios[l.slug] ?? null }))} />
      <FormClave />
    </div>
  );
}
