'use client';
import { useActionState, useRef, useState } from 'react';
import { guardarEspacioAccion } from '../../acciones';

const MAX_ANCHO = 1600;

/** Achica la foto en el celular antes de subirla (los GIF se suben tal cual para no perder la animación). */
async function preparar(archivo: File): Promise<{ archivo: File; ancho: number; alto: number }> {
  const url = URL.createObjectURL(archivo);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const ancho = img.naturalWidth;
    const alto = img.naturalHeight;
    if (archivo.type === 'image/gif' || (ancho <= MAX_ANCHO && archivo.size < 400_000 && archivo.type === 'image/webp')) {
      return { archivo, ancho, alto };
    }
    const escala = Math.min(1, MAX_ANCHO / ancho);
    const w = Math.round(ancho * escala);
    const h = Math.round(alto * escala);
    const lienzo = document.createElement('canvas');
    lienzo.width = w;
    lienzo.height = h;
    lienzo.getContext('2d')!.drawImage(img, 0, 0, w, h);
    const blob = await new Promise<Blob | null>((ok) => lienzo.toBlob(ok, 'image/webp', 0.86));
    if (!blob) return { archivo, ancho, alto };
    return { archivo: new File([blob], 'imagen.webp', { type: 'image/webp' }), ancho: w, alto: h };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function FormEspacio(p: {
  id: string;
  nombre: string;
  ayuda: string;
  imagen: string | null;
  enlace: string;
  texto: string;
  activo: boolean;
}) {
  const [estado, accion, cargando] = useActionState(guardarEspacioAccion, null);
  const [vista, setVista] = useState<string | null>(p.imagen ? `/api/medios/${p.imagen}` : null);
  const [preparando, setPreparando] = useState(false);
  const [quitar, setQuitar] = useState(false);
  const entrada = useRef<HTMLInputElement>(null);
  const ancho = useRef<HTMLInputElement>(null);
  const alto = useRef<HTMLInputElement>(null);

  async function alElegir(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setPreparando(true);
    try {
      const listo = await preparar(f);
      const dt = new DataTransfer();
      dt.items.add(listo.archivo);
      if (entrada.current) entrada.current.files = dt.files;
      if (ancho.current) ancho.current.value = String(listo.ancho);
      if (alto.current) alto.current.value = String(listo.alto);
      setVista(URL.createObjectURL(listo.archivo));
      setQuitar(false);
    } catch {
      setVista(URL.createObjectURL(f));
    } finally {
      setPreparando(false);
    }
  }

  return (
    <form action={accion} className="caja">
      <input type="hidden" name="id" value={p.id} />
      <input type="hidden" name="ancho" ref={ancho} />
      <input type="hidden" name="alto" ref={alto} />
      <input type="hidden" name="quitar" value={quitar ? '1' : '0'} />
      <div className="caja-cabeza">
        <div>
          <h2>{p.nombre}</h2>
          <p className="ayuda">{p.ayuda}</p>
        </div>
      </div>

      <div className="vista-previa">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {vista && !quitar ? <img src={vista} alt="" /> : <span>Sin imagen</span>}
      </div>

      <div className="acciones">
        <label className="subir" style={{ flex: 1 }}>
          {preparando ? 'Preparando…' : vista && !quitar ? 'Cambiar imagen' : 'Subir imagen'}
          <input ref={entrada} type="file" name="imagen" accept="image/jpeg,image/png,image/webp,image/gif" onChange={alElegir} />
        </label>
        {vista && !quitar && (
          <button
            type="button"
            className="boton claro"
            onClick={() => {
              setQuitar(true);
              if (entrada.current) entrada.current.value = '';
            }}
          >
            Quitar
          </button>
        )}
      </div>

      <div className="campo">
        <label htmlFor={`enlace-${p.id}`}>Enlace al tocar la imagen</label>
        <input id={`enlace-${p.id}`} type="url" name="enlace" defaultValue={p.enlace} placeholder="https://chat.whatsapp.com/…" inputMode="url" autoComplete="off" />
      </div>
      <div className="campo">
        <label htmlFor={`texto-${p.id}`}>Descripción corta (opcional)</label>
        <input id={`texto-${p.id}`} type="text" name="texto" defaultValue={p.texto} placeholder="Grupo de resultados en WhatsApp" maxLength={140} />
      </div>
      <label className="interruptor">
        Mostrar en la página
        <input type="checkbox" name="activo" defaultChecked={p.activo} />
      </label>

      {estado && <p className={`mensaje${estado.ok ? '' : ' error'}`}>{estado.msg}</p>}
      <div className="acciones">
        <button className="boton" type="submit" disabled={cargando || preparando}>
          {cargando ? 'Guardando…' : 'Guardar'}
        </button>
      </div>
    </form>
  );
}
