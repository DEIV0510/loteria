import type { Espacio as TEspacio } from '@/lib/espacios';

/** Imagen con enlace que el dueño pone desde el panel. No se muestra si está apagada o vacía. */
export function Espacio({ e }: { e: TEspacio | undefined }) {
  if (!e || !e.activo || !e.imagen || !e.enlace) return null;
  const externo = !e.enlace.startsWith('/');
  return (
    <div className="contenedor espacio">
      <a
        href={e.enlace}
        target={externo ? '_blank' : undefined}
        rel={externo ? 'noopener sponsored' : undefined}
        aria-label={e.texto || 'Abrir enlace'}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/api/medios/${e.imagen}`}
          alt={e.texto || ''}
          width={e.ancho ?? undefined}
          height={e.alto ?? undefined}
          loading={e.id === 'encabezado' || e.id === 'debajo' ? 'eager' : 'lazy'}
          decoding="async"
        />
      </a>
    </div>
  );
}
