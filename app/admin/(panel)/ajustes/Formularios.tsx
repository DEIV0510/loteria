'use client';
import { useActionState } from 'react';
import type { Ajustes } from '@/lib/ajustes';
import { cambiarClaveAccion, guardarAjustesAccion } from '../../acciones';

export function FormAjustes({ a }: { a: Ajustes }) {
  const [estado, accion, cargando] = useActionState(guardarAjustesAccion, null);
  return (
    <form action={accion} className="caja">
      <h2>Sitio</h2>
      <div className="campo">
        <label htmlFor="nombre">Nombre del sitio</label>
        <input id="nombre" type="text" name="nombre" defaultValue={a.nombre} maxLength={40} required />
      </div>
      <div className="campo">
        <label htmlFor="correo">Correo de contacto (aparece en el pie)</label>
        <input id="correo" type="email" name="correo" defaultValue={a.correo} placeholder="contacto@tusitio.com" />
      </div>

      <h2 style={{ marginTop: 8 }}>Botón fijo de WhatsApp</h2>
      <p className="ayuda">Una barra verde abajo de la pantalla, siempre visible, que lleva a tu grupo.</p>
      <div className="campo">
        <label htmlFor="wa">Enlace del grupo</label>
        <input id="wa" type="url" name="whatsappUrl" defaultValue={a.whatsappUrl} placeholder="https://chat.whatsapp.com/…" inputMode="url" />
      </div>
      <div className="campo">
        <label htmlFor="wat">Texto del botón</label>
        <input id="wat" type="text" name="whatsappTexto" defaultValue={a.whatsappTexto} maxLength={60} />
      </div>
      <label className="interruptor">
        Mostrar el botón
        <input type="checkbox" name="whatsappActivo" defaultChecked={a.whatsappActivo} />
      </label>

      <h2 style={{ marginTop: 8 }}>Google AdSense</h2>
      <p className="ayuda">
        Cuando Google apruebe el sitio, pega aquí tu código de editor. Los anuncios y el archivo ads.txt se activan solos.
      </p>
      <div className="campo">
        <label htmlFor="ads">Código de editor</label>
        <input id="ads" type="text" name="adsenseCliente" defaultValue={a.adsenseCliente} placeholder="ca-pub-0000000000000000" autoComplete="off" />
      </div>

      {estado && <p className={`mensaje${estado.ok ? '' : ' error'}`}>{estado.msg}</p>}
      <div className="acciones">
        <button className="boton" type="submit" disabled={cargando}>
          {cargando ? 'Guardando…' : 'Guardar ajustes'}
        </button>
      </div>
    </form>
  );
}

export function FormClave() {
  const [estado, accion, cargando] = useActionState(cambiarClaveAccion, null);
  return (
    <form action={accion} className="caja">
      <h2>Cambiar clave</h2>
      <div className="campo">
        <label htmlFor="actual">Clave actual</label>
        <input id="actual" type="password" name="actual" autoComplete="current-password" required />
      </div>
      <div className="campo">
        <label htmlFor="nueva">Clave nueva (mínimo 8 caracteres)</label>
        <input id="nueva" type="password" name="nueva" autoComplete="new-password" minLength={8} required />
      </div>
      <div className="campo">
        <label htmlFor="repetir">Repite la clave nueva</label>
        <input id="repetir" type="password" name="repetir" autoComplete="new-password" minLength={8} required />
      </div>
      {estado && <p className={`mensaje${estado.ok ? '' : ' error'}`}>{estado.msg}</p>}
      <div className="acciones">
        <button className="boton claro" type="submit" disabled={cargando}>
          {cargando ? 'Cambiando…' : 'Cambiar clave'}
        </button>
      </div>
    </form>
  );
}
