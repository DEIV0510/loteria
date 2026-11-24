import type { FilaResultado } from '@/lib/tipos';

export function Cifras({ numero, tam }: { numero: string; tam?: 'grande' | 'chica' }) {
  return (
    <span className={`cifras${tam ? ` ${tam}` : ''}`} aria-label={numero}>
      {numero.split('').map((c, i) => (
        <span key={i} className="cifra" aria-hidden="true">
          {c}
        </span>
      ))}
    </span>
  );
}

export function Balotas({ r, tam, revancha }: { r: FilaResultado; tam?: 'grande'; revancha?: boolean }) {
  const lista = (revancha ? r.revancha : r.balotas) ?? [];
  return (
    <span className={`balotas${tam ? ` ${tam}` : ''}`} aria-label={lista.map((b) => b.n).join(' ')}>
      {lista.map((b, i) => (
        <span key={i} className={`balota${b.super ? ' super' : ''}`} data-color={b.color} title={b.color ?? (b.super ? 'Superbalota' : undefined)} aria-hidden="true">
          {b.n}
        </span>
      ))}
    </span>
  );
}

/** Número del resultado: cifras para chances y loterías, balotas para Baloto, MiLoto y ColorLoto. */
export function Numero({ r, tam }: { r: FilaResultado; tam?: 'grande' | 'chica' }) {
  if (r.balotas?.length) return <Balotas r={r} tam={tam === 'grande' ? 'grande' : undefined} />;
  return <Cifras numero={r.numero} tam={tam} />;
}
