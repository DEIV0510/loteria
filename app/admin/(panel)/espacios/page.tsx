import { ESPACIOS, leerEspacios } from '@/lib/espacios';
import { FormEspacio } from './FormEspacio';

export const dynamic = 'force-dynamic';

export default async function PanelEspacios() {
  const e = await leerEspacios();
  return (
    <div className="panel">
      <div>
        <h1>Imágenes con enlace</h1>
        <p className="ayuda">
          Sube una imagen, pega el enlace (grupo de WhatsApp, otra página…) y enciéndela. Quien toque la imagen va a ese
          enlace. Medida recomendada: 1200 × 300 px, horizontal.
        </p>
      </div>
      {ESPACIOS.map((base) => {
        const x = e.get(base.id)!;
        return (
          <FormEspacio
            key={base.id}
            id={base.id}
            nombre={base.nombre}
            ayuda={base.ayuda}
            imagen={x.imagen}
            enlace={x.enlace}
            texto={x.texto}
            activo={x.activo}
          />
        );
      })}
    </div>
  );
}
