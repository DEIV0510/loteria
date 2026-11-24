// Ajustes del sitio que el dueño cambia desde el panel.
import { filas, q } from './db';

export type Ajustes = {
  nombre: string;
  lema: string;
  whatsappUrl: string;
  whatsappTexto: string;
  whatsappActivo: boolean;
  adsenseCliente: string; // ca-pub-XXXXXXXXXXXXXXXX
  correo: string;
};

export const AJUSTES_BASE: Ajustes = {
  nombre: 'Resultados al Día',
  lema: 'Loterías y chances de Colombia',
  whatsappUrl: '',
  whatsappTexto: 'Únete al grupo de resultados',
  whatsappActivo: false,
  adsenseCliente: '',
  correo: '',
};

const CLAVES: Record<keyof Ajustes, string> = {
  nombre: 'nombre',
  lema: 'lema',
  whatsappUrl: 'whatsapp_url',
  whatsappTexto: 'whatsapp_texto',
  whatsappActivo: 'whatsapp_activo',
  adsenseCliente: 'adsense_cliente',
  correo: 'correo',
};

export async function leerAjustes(): Promise<Ajustes> {
  const r = await filas<{ clave: string; valor: string }>('SELECT clave, valor FROM ajustes');
  const m = new Map(r.map((x) => [String(x.clave), String(x.valor)]));
  const a = { ...AJUSTES_BASE };
  for (const [k, col] of Object.entries(CLAVES) as [keyof Ajustes, string][]) {
    const v = m.get(col);
    if (v === undefined) continue;
    if (k === 'whatsappActivo') a.whatsappActivo = v === '1';
    else (a[k] as string) = v;
  }
  return a;
}

export async function guardarAjustes(cambios: Partial<Ajustes>) {
  for (const [k, v] of Object.entries(cambios) as [keyof Ajustes, unknown][]) {
    const col = CLAVES[k];
    if (!col || v === undefined) continue;
    const valor = typeof v === 'boolean' ? (v ? '1' : '0') : String(v);
    await q('INSERT INTO ajustes (clave, valor) VALUES (?, ?) ON CONFLICT(clave) DO UPDATE SET valor = excluded.valor', [col, valor]);
  }
}

export async function leerAjusteInterno(clave: string): Promise<string | null> {
  const r = await filas<{ valor: string }>('SELECT valor FROM ajustes WHERE clave = ?', [clave]);
  return r[0] ? String(r[0].valor) : null;
}

export async function guardarAjusteInterno(clave: string, valor: string) {
  await q('INSERT INTO ajustes (clave, valor) VALUES (?, ?) ON CONFLICT(clave) DO UPDATE SET valor = excluded.valor', [clave, valor]);
}

/** "ca-pub-123…" -> "pub-123…" (para ads.txt). */
export function pubId(cliente: string): string | null {
  const m = /ca-(pub-\d{10,20})/.exec(cliente.trim());
  return m ? m[1] : null;
}
