import type { FilaResultado } from '@/lib/tipos';

type Tam = 'grande' | 'chica';

/** Cifras como bolas de lotería. `cae` las anima como si salieran de la tómbola. */
export function Cifras({ numero, tam, cae }: { numero: string; tam?: Tam; cae?: boolean }) {
  return (
    <span className={`bolas${tam ? ` ${tam}` : ''}${cae ? ' cae' : ''}`} aria-label={numero} role="img">
      {numero.split('').map((c, i) => (
        <span key={i} className="bola" style={{ '--i': i } as React.CSSProperties} aria-hidden="true">
          {c}
        </span>
      ))}
    </span>
  );
}

export function Balotas({ r, tam, revancha, cae }: { r: FilaResultado; tam?: Tam; revancha?: boolean; cae?: boolean }) {
  const lista = (revancha ? r.revancha : r.balotas) ?? [];
  return (
    <span
      className={`bolas${tam ? ` ${tam}` : ''}${cae ? ' cae' : ''}`}
      role="img"
      aria-label={lista.map((b) => (b.color ? `${b.n} ${b.color}` : b.n)).join(', ')}
    >
      {lista.map((b, i) => (
        <span
          key={i}
          className={`bola${b.color ? '' : b.super ? ' super' : ' blanca'}`}
          data-color={b.color}
          title={b.color ?? (b.super ? 'Superbalota' : undefined)}
          style={{ '--i': i } as React.CSSProperties}
          aria-hidden="true"
        >
          {b.n}
        </span>
      ))}
    </span>
  );
}

/** Número del resultado: bolas verdes para chances y loterías, balotas para Baloto, MiLoto y ColorLoto. */
export function Numero({ r, tam, cae }: { r: FilaResultado; tam?: Tam; cae?: boolean }) {
  if (r.balotas?.length) return <Balotas r={r} tam={tam} cae={cae} />;
  return <Cifras numero={r.numero} tam={tam} cae={cae} />;
}
