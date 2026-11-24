import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import { Espacio } from '@/components/Espacio';
import { Marca, WhatsApp } from '@/components/Iconos';
import { leerAjustes } from '@/lib/ajustes';
import { leerEspacios } from '@/lib/espacios';
import { BALOTAS, CHANCES, LOTERIAS } from '@/lib/juegos';

export async function generateMetadata(): Promise<Metadata> {
  const a = await leerAjustes();
  return {
    title: { default: `${a.nombre}: resultados de loterías y chances de Colombia hoy`, template: `%s | ${a.nombre}` },
    description: 'Resultados de hoy de todos los chances y loterías de Colombia, actualizados minutos después de cada sorteo.',
    openGraph: { siteName: a.nombre, locale: 'es_CO', type: 'website' },
    alternates: { canonical: '/' },
  };
}

const MENU = [
  { href: '/', texto: 'Hoy' },
  { href: '/chances', texto: 'Chances' },
  { href: '/loterias', texto: 'Loterías' },
  { href: '/baloto', texto: 'Baloto' },
  { href: '/resultados/ayer', texto: 'Ayer' },
  { href: '/buscar', texto: 'Buscar número' },
];

export default async function LayoutSitio({ children }: { children: React.ReactNode }) {
  const [a, espacios] = await Promise.all([leerAjustes(), leerEspacios()]);
  const barra = a.whatsappActivo && a.whatsappUrl;
  const anio = new Date().getFullYear();

  return (
    <>
      {a.adsenseCliente && (
        <Script
          id="adsense"
          async
          strategy="afterInteractive"
          crossOrigin="anonymous"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(a.adsenseCliente)}`}
        />
      )}
      <header className="cabecera">
        <div className="contenedor">
          <Link href="/" className="marca">
            <Marca className="marca-icono" />
            <span className="marca-nombre">{a.nombre}</span>
          </Link>
          <nav className="menu" aria-label="Principal">
            {MENU.map((m) => (
              <Link key={m.href} href={m.href}>
                {m.texto}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <nav className="menu-movil" aria-label="Secciones">
        {MENU.map((m) => (
          <Link key={m.href} href={m.href}>
            {m.texto}
          </Link>
        ))}
      </nav>

      <Espacio e={espacios.get('encabezado')} />

      <main>{children}</main>

      <Espacio e={espacios.get('abajo')} />

      <footer className="pie" style={barra ? ({ '--barra-alto': '72px' } as React.CSSProperties) : undefined}>
        <div className="contenedor">
          <div className="directorio">
            <div>
              <h3>Chances</h3>
              <ul>
                {CHANCES.map((j) => (
                  <li key={j.slug}>
                    <Link href={`/${j.slug}`}>{j.nombre}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3>Loterías</h3>
              <ul>
                {LOTERIAS.map((j) => (
                  <li key={j.slug}>
                    <Link href={`/${j.slug}`}>{j.nombre.replace('Lotería ', '')}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3>Más juegos</h3>
              <ul style={{ columns: 1 }}>
                {BALOTAS.map((j) => (
                  <li key={j.slug}>
                    <Link href={`/${j.slug}`}>{j.nombre}</Link>
                  </li>
                ))}
                <li>
                  <Link href="/resultados/ayer">Resultados de ayer</Link>
                </li>
                <li>
                  <Link href="/buscar">Buscar un número</Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="legal">
            <p>
              Resultados con fines informativos. Antes de cobrar un premio, confírmalo con la lotería o el operador
              oficial. Juego prohibido para menores de 18 años.
            </p>
            <p>
              © {anio} {a.nombre} · <Link href="/privacidad">Privacidad</Link>
              {a.correo && (
                <>
                  {' '}· <a href={`mailto:${a.correo}`}>{a.correo}</a>
                </>
              )}
            </p>
          </div>
        </div>
      </footer>

      {barra && (
        <div className="barra-wa">
          <a href={a.whatsappUrl} target="_blank" rel="noopener">
            <WhatsApp />
            {a.whatsappTexto || 'Únete al grupo de WhatsApp'}
          </a>
        </div>
      )}
    </>
  );
}
