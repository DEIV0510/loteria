'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { guardarAjustes } from '@/lib/ajustes';
import { anotar } from '@/lib/db';
import { enlaceValido, formatoValido, guardarEspacio, guardarMedio, IMAGENES, leerEspacios, posicionValida, type IdImagen } from '@/lib/espacios';
import { guardarPremio } from '@/lib/premios';
import { LOTERIAS } from '@/lib/juegos';
import { validaISO } from '@/lib/fechas';
import { juego } from '@/lib/juegos';
import { refrescarSitio } from '@/lib/refrescar';
import { borrarResultado, guardarResultado } from '@/lib/resultados';
import { correrRobot } from '@/lib/robot';
import { abrirSesion, cambiarClave, cerrarSesion, exigirSesion, intentoPermitido, verificarClave } from '@/lib/sesion';
import type { Balota } from '@/lib/tipos';

export type Estado = { ok: boolean; msg: string } | null;

const txt = (f: FormData, k: string) => String(f.get(k) ?? '').trim();

// ——— Acceso ———
export async function entrar(_: Estado, f: FormData): Promise<Estado> {
  if (!(await intentoPermitido())) return { ok: false, msg: 'Demasiados intentos. Espera 15 minutos.' };
  if (!(await verificarClave(txt(f, 'clave')))) {
    await anotar('acceso', 'Clave incorrecta en el panel');
    return { ok: false, msg: 'Clave incorrecta.' };
  }
  await abrirSesion();
  redirect('/admin');
}

export async function salir() {
  await cerrarSesion();
  redirect('/admin/entrar');
}

// ——— Espacios ———
const TIPOS_IMAGEN = ['image/webp', 'image/jpeg', 'image/png', 'image/gif', 'image/avif'];

export async function guardarEspacioAccion(_: Estado, f: FormData): Promise<Estado> {
  await exigirSesion();
  const id = txt(f, 'id') as IdImagen;
  if (!IMAGENES.some((e) => e.id === id)) return { ok: false, msg: 'Imagen desconocida.' };
  const posicion = txt(f, 'posicion');
  if (!posicionValida(posicion)) return { ok: false, msg: 'Elige dónde va la imagen.' };
  const fmt = txt(f, 'formato');
  const formato = formatoValido(fmt) ? fmt : 'libre';
  const enlace = txt(f, 'enlace');
  const texto = txt(f, 'texto').slice(0, 140);
  const activo = f.get('activo') === 'on';
  const quitar = f.get('quitar') === '1';
  const archivo = f.get('imagen');

  let imagen: string | null | undefined = quitar ? null : undefined;
  if (archivo instanceof File && archivo.size > 0) {
    if (!TIPOS_IMAGEN.includes(archivo.type)) return { ok: false, msg: 'La imagen debe ser JPG, PNG, WebP o GIF.' };
    if (archivo.size > 1_900_000) return { ok: false, msg: 'La imagen pesa más de 1,9 MB. Usa una más liviana.' };
    const ancho = Math.round(Number(f.get('ancho')) || 0) || null;
    const alto = Math.round(Number(f.get('alto')) || 0) || null;
    imagen = await guardarMedio(new Uint8Array(await archivo.arrayBuffer()), archivo.type, ancho, alto);
  }
  const tieneImagen = imagen === undefined ? !!(await leerEspacios()).find((e) => e.id === id)?.imagen : !!imagen;
  if (activo && !tieneImagen) return { ok: false, msg: 'Para encenderlo, sube primero una imagen.' };
  if (activo && !enlaceValido(enlace)) return { ok: false, msg: 'Pon un enlace completo, por ejemplo https://chat.whatsapp.com/…' };
  if (enlace && !enlaceValido(enlace)) return { ok: false, msg: 'El enlace no es válido. Debe empezar por https://' };

  await guardarEspacio({ id, posicion, formato, imagen, enlace, texto, activo });
  await anotar('espacio', `${id} (${posicion}): ${activo ? 'encendida' : 'apagada'} → ${enlace || '(sin enlace)'}`);
  refrescarSitio();
  return { ok: true, msg: activo ? 'Guardado. Ya se ve en la página.' : 'Guardado. Está apagada: no se muestra.' };
}

// ——— Resultados ———
const SIGNOS = ['Aries', 'Tauro', 'Géminis', 'Cáncer', 'Leo', 'Virgo', 'Libra', 'Escorpio', 'Sagitario', 'Capricornio', 'Acuario', 'Piscis'];
const COLORES = ['amarillo', 'azul', 'rojo', 'verde', 'blanco', 'negro'];

export async function guardarResultadoAccion(_: Estado, f: FormData): Promise<Estado> {
  await exigirSesion();
  const j = juego(txt(f, 'juego'));
  const fecha = txt(f, 'fecha');
  if (!j) return { ok: false, msg: 'Elige el sorteo.' };
  if (!validaISO(fecha)) return { ok: false, msg: 'La fecha no es válida.' };
  const sorteo = txt(f, 'sorteo').replace(/\D/g, '') || null;
  const crudo = txt(f, 'numero');

  let numero = crudo.replace(/\D/g, '');
  let serie: string | null = null;
  let quinta: string | null = null;
  let signo: string | null = null;
  let balotas: Balota[] | null = null;

  if (j.tipo === 'chance') {
    const cifras = j.slug.startsWith('cash-three') ? 3 : 4;
    if (numero.length !== cifras) return { ok: false, msg: `El número de ${j.nombre} tiene ${cifras} cifras.` };
    quinta = txt(f, 'quinta').replace(/\D/g, '').slice(0, 1) || null;
    signo = txt(f, 'signo') || null;
    if (signo && !SIGNOS.includes(signo)) return { ok: false, msg: 'Signo no válido.' };
  } else if (j.tipo === 'loteria') {
    if (numero.length !== 4) return { ok: false, msg: 'El número de la lotería tiene 4 cifras.' };
    serie = txt(f, 'serie').replace(/\D/g, '') || null;
    if (!serie || serie.length !== 3) return { ok: false, msg: 'La serie tiene 3 cifras.' };
  } else if (j.tipo === 'colorloto') {
    // "1 blanco, 3 blanco, 4 verde, 6 rojo, 7 negro, 7 rojo"
    const partes = crudo.toLowerCase().split(',').map((p) => p.trim()).filter(Boolean);
    balotas = partes.map((p) => {
      const [n, color] = p.split(/\s+/);
      return { n: n.replace(/\D/g, ''), color };
    });
    if (balotas.length !== 6 || balotas.some((b) => !b.n || !COLORES.includes(b.color ?? ''))) {
      return { ok: false, msg: 'Escribe 6 balotas así: 1 blanco, 3 blanco, 4 verde, 6 rojo, 7 negro, 7 rojo' };
    }
    numero = balotas.map((b) => `${b.n} ${b.color}`).join(', ');
  } else {
    // Baloto (5 + superbalota) o MiLoto (5): "04-05-20-21-22-15"
    const ns = crudo.split(/[^0-9]+/).filter(Boolean).map((n) => n.padStart(2, '0'));
    const esperadas = j.tipo === 'baloto' ? 6 : 5;
    if (ns.length !== esperadas) return { ok: false, msg: `Escribe ${esperadas} números separados por guion, por ejemplo 04-05-20-21-22${j.tipo === 'baloto' ? '-15' : ''}` };
    balotas = ns.map((n, i) => (j.tipo === 'baloto' && i === 5 ? { n, super: true } : { n }));
    numero = ns.join('-');
  }

  const r = await guardarResultado(
    { juego: j.slug, fecha, sorteo, numero, serie, quinta, signo, balotas, revancha: null, secos: null, fuente: 'manual' },
    { manual: true },
  );
  await anotar('manual', `${j.nombre} ${fecha}: ${numero}${serie ? ` serie ${serie}` : ''} (${r})`);
  refrescarSitio();
  return { ok: true, msg: `${j.nombre}: ${numero} guardado. El robot ya no lo cambia.` };
}

export async function borrarResultadoAccion(f: FormData) {
  await exigirSesion();
  const j = juego(txt(f, 'juego'));
  const fecha = txt(f, 'fecha');
  if (!j || !validaISO(fecha)) return;
  await borrarResultado(j.slug, fecha);
  await anotar('manual', `Borrado ${j.nombre} ${fecha}`);
  refrescarSitio();
}

export async function revisarAhora(_: Estado): Promise<Estado> {
  await exigirSesion();
  const r = await correrRobot({ presupuestoMs: 40_000, sinEspera: true });
  revalidatePath('/admin');
  if (!r.corrio) return { ok: false, msg: 'El robot ya está revisando. Intenta en un minuto.' };
  if (r.nuevos.length) refrescarSitio();
  const errores = r.errores.length ? ` · ${r.errores.length} fuente(s) no respondieron` : '';
  if (!r.revisados.length) return { ok: true, msg: 'Todo al día: no falta ningún sorteo que ya se haya jugado.' };
  return {
    ok: true,
    msg: r.nuevos.length
      ? `Listo: ${r.nuevos.length} resultado(s) nuevo(s)${errores}.`
      : `Revisé ${r.revisados.length} sorteo(s); aún no publican nada nuevo${errores}.`,
  };
}

// ——— Ajustes ———
export async function guardarAjustesAccion(_: Estado, f: FormData): Promise<Estado> {
  await exigirSesion();
  const nombre = txt(f, 'nombre').slice(0, 40);
  const whatsappUrl = txt(f, 'whatsappUrl');
  const whatsappActivo = f.get('whatsappActivo') === 'on';
  const adsenseCliente = txt(f, 'adsenseCliente');
  const correo = txt(f, 'correo');
  if (!nombre) return { ok: false, msg: 'El sitio necesita un nombre.' };
  if (whatsappUrl && !enlaceValido(whatsappUrl)) return { ok: false, msg: 'El enlace de WhatsApp no es válido.' };
  if (whatsappActivo && !whatsappUrl) return { ok: false, msg: 'Para encender el botón de WhatsApp pon el enlace del grupo.' };
  if (adsenseCliente && !/^ca-pub-\d{10,20}$/.test(adsenseCliente)) return { ok: false, msg: 'El código de AdSense se ve así: ca-pub-1234567890123456' };
  if (correo && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(correo)) return { ok: false, msg: 'El correo no es válido.' };
  await guardarAjustes({
    nombre,
    whatsappUrl,
    whatsappTexto: txt(f, 'whatsappTexto').slice(0, 60) || 'Únete al grupo de resultados',
    whatsappActivo,
    adsenseCliente,
    correo,
  });
  await anotar('ajustes', 'Ajustes del sitio actualizados');
  refrescarSitio();
  return { ok: true, msg: 'Ajustes guardados.' };
}

export async function guardarPremiosAccion(_: Estado, f: FormData): Promise<Estado> {
  await exigirSesion();
  for (const l of LOTERIAS) {
    const v = txt(f, `premio-${l.slug}`).replace(/D/g, '');
    await guardarPremio(l.slug, v ? Number(v) : null);
  }
  await anotar('ajustes', 'Premios mayores actualizados');
  refrescarSitio();
  return { ok: true, msg: 'Premios guardados. Ya se ven en la página.' };
}

export async function cambiarClaveAccion(_: Estado, f: FormData): Promise<Estado> {
  await exigirSesion();
  const actual = txt(f, 'actual');
  const nueva = txt(f, 'nueva');
  if (!(await verificarClave(actual))) return { ok: false, msg: 'La clave actual no es correcta.' };
  if (nueva.length < 8) return { ok: false, msg: 'La clave nueva debe tener al menos 8 caracteres.' };
  if (nueva !== txt(f, 'repetir')) return { ok: false, msg: 'Las claves nuevas no coinciden.' };
  await cambiarClave(nueva);
  await abrirSesion();
  await anotar('acceso', 'Clave del panel cambiada');
  return { ok: true, msg: 'Clave cambiada. Las otras sesiones se cerraron.' };
}
