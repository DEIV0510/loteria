'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const CADA_MS = 40_000;

function hora(iso: string) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Bogota' });
}

/**
 * Pregunta al servidor cada 40 s si hay resultados nuevos y, si los hay, refresca la página
 * sin recargarla. Esa misma consulta despierta al robot cuando toca revisar las fuentes.
 */
export function EnVivo({ marca, revisado, sinPunto }: { marca: string; revisado: string; sinPunto?: boolean }) {
  const router = useRouter();
  const ultima = useRef(marca);
  const [visto, setVisto] = useState(revisado);

  useEffect(() => {
    ultima.current = marca;
  }, [marca]);

  useEffect(() => {
    let vivo = true;
    let t: ReturnType<typeof setTimeout>;
    async function consultar() {
      if (document.visibilityState === 'visible') {
        try {
          const r = await fetch('/api/hoy', { cache: 'no-store' });
          if (r.ok) {
            const d = (await r.json()) as { marca: string; ahora: string };
            if (!vivo) return;
            setVisto(d.ahora);
            if (d.marca && d.marca !== ultima.current) {
              ultima.current = d.marca;
              router.refresh();
            }
          }
        } catch {
          /* sin señal: se reintenta en la próxima vuelta */
        }
      }
      if (vivo) t = setTimeout(consultar, CADA_MS);
    }
    t = setTimeout(consultar, 3000);
    const alVolver = () => {
      if (document.visibilityState === 'visible') {
        clearTimeout(t);
        consultar();
      }
    };
    document.addEventListener('visibilitychange', alVolver);
    return () => {
      vivo = false;
      clearTimeout(t);
      document.removeEventListener('visibilitychange', alVolver);
    };
  }, [router]);

  return (
    <span>
      {!sinPunto && <span className="punto latiendo" aria-hidden="true" />}
      Se actualiza solo{visto ? <> · revisado <span suppressHydrationWarning>{hora(visto)}</span></> : null}
    </span>
  );
}
