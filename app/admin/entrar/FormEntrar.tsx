'use client';
import { useActionState } from 'react';
import { entrar } from '../acciones';

export function FormEntrar() {
  const [estado, accion, cargando] = useActionState(entrar, null);
  return (
    <form action={accion} style={{ display: 'grid', gap: 14 }}>
      <div className="campo">
        <label htmlFor="clave">Clave</label>
        <input id="clave" name="clave" type="password" autoComplete="current-password" required autoFocus />
      </div>
      {estado && !estado.ok && <p className="mensaje error">{estado.msg}</p>}
      <button className="boton" type="submit" disabled={cargando} style={{ minHeight: 48 }}>
        {cargando ? 'Entrando…' : 'Entrar'}
      </button>
    </form>
  );
}
