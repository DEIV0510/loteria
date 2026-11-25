import { leerEspacios, POSICIONES } from '@/lib/espacios';
import { FormEspacio } from './FormEspacio';

export const dynamic = 'force-dynamic';

export default async function PanelEspacios() {
  const lista = await leerEspacios();
  return (
    <div className="panel">
      <div>
        <h1>Imágenes con enlace</h1>
        <p className="ayuda">
          Sube la imagen, pega el enlace (grupo de WhatsApp, otra página…), elige dónde va y enciéndela. Si dos imágenes
          van en el mismo lugar, salen una al lado de la otra. Si las apagas todas, la página muestra solo los resultados.
        </p>
        <p className="ayuda" style={{ marginTop: 6 }}>
          Medidas: una sola, horizontal 1200 × 300 px. Dos juntas, cuadradas 600 × 600 px.
        </p>
      </div>
      {lista.map((x, i) => (
        <FormEspacio
          key={x.id}
          id={x.id}
          nombre={`Imagen ${i + 1}`}
          posicion={x.posicion}
          posiciones={POSICIONES.map((p) => ({ id: p.id, nombre: p.nombre, ayuda: p.ayuda }))}
          imagen={x.imagen}
          enlace={x.enlace}
          texto={x.texto}
          activo={x.activo}
        />
      ))}
    </div>
  );
}
