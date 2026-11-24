import type { Metadata } from 'next';
import { Banda } from '@/components/Banda';
import { leerAjustes } from '@/lib/ajustes';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Política de privacidad',
  alternates: { canonical: '/privacidad' },
};

export default async function Privacidad() {
  const a = await leerAjustes();
  return (
    <>
    <Banda titulo="Política de privacidad" corta />
    <div className="contenedor" style={{ marginTop: 24 }}>
      <div className="texto">
        <p>
          {a.nombre} publica resultados de loterías y chances de Colombia con fines informativos. No pedimos registro
          ni guardamos datos personales de quienes visitan el sitio.
        </p>
        <h2>Cookies y publicidad</h2>
        <p>
          Este sitio puede mostrar anuncios de Google AdSense. Google y sus socios usan cookies para mostrar anuncios
          según tus visitas a este y otros sitios. Puedes desactivar los anuncios personalizados en{' '}
          <a href="https://adssettings.google.com" target="_blank" rel="noopener">
            la configuración de anuncios de Google
          </a>
          . Más información en{' '}
          <a href="https://policies.google.com/technologies/ads?hl=es" target="_blank" rel="noopener">
            cómo usa Google las cookies en publicidad
          </a>
          .
        </p>
        <h2>Enlaces a otros sitios</h2>
        <p>
          Algunas imágenes y botones llevan a grupos de WhatsApp o a otras páginas. Lo que pase en esos sitios se rige
          por sus propias políticas.
        </p>
        <h2>Exactitud de los resultados</h2>
        <p>
          Los resultados se toman de fuentes públicas y se actualizan pocos minutos después de cada sorteo. Pueden
          tener errores: antes de cobrar un premio, confírmalo con la lotería o el operador oficial.
        </p>
        {a.correo && (
          <>
            <h2>Contacto</h2>
            <p>
              Escríbenos a <a href={`mailto:${a.correo}`}>{a.correo}</a>.
            </p>
          </>
        )}
      </div>
    </div>
    </>
  );
}
