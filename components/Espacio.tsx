import type { Espacio as TEspacio } from '@/lib/espacios';

/**
 * Imágenes con enlace de un lugar de la página. Si no hay ninguna encendida no se muestra nada.
 * Una sola ocupa todo el ancho; dos o más van lado a lado.
 * Cada una sale en su formato: 16:9, 1:1 o como se subió.
 */
export function Espacios({ lista, primero, enHero }: { lista: TEspacio[]; primero?: boolean; enHero?: string }) {
  if (!lista.length) return null;
  const clase = `${enHero ? `espacio-hero ${enHero}` : 'contenedor'} espacio${lista.length > 1 ? ' varias' : ''}`;
  return (
    <div className={clase}>
      {lista.map((e) => {
        const externo = !e.enlace.startsWith('/');
        return (
          <a
            key={e.id}
            href={e.enlace}
            target={externo ? '_blank' : undefined}
            rel={externo ? 'noopener sponsored' : undefined}
            aria-label={e.texto || 'Abrir enlace'}
            className={`formato-${e.formato}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/medios/${e.imagen}`}
              alt={e.texto || ''}
              width={e.ancho ?? undefined}
              height={e.alto ?? undefined}
              loading={primero ? 'eager' : 'lazy'}
              decoding="async"
            />
          </a>
        );
      })}
    </div>
  );
}
