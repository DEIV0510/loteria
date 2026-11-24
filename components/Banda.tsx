import Link from 'next/link';

/** Encabezado verde de las páginas internas. Con `solapa`, el contenido de abajo se monta encima. */
export function Banda({
  titulo,
  sub,
  migas,
  corta,
  children,
}: {
  titulo: string;
  sub?: React.ReactNode;
  migas?: { href?: string; texto: string }[];
  corta?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <section className={`banda${corta ? ' corta' : ''}`}>
      <div className="contenedor">
        {migas && (
          <nav className="migas" aria-label="Ruta">
            {migas.map((m, i) => (
              <span key={i}>
                {i > 0 && ' / '}
                {m.href ? <Link href={m.href}>{m.texto}</Link> : m.texto}
              </span>
            ))}
          </nav>
        )}
        <h1>{titulo}</h1>
        {sub && <p className="sub">{sub}</p>}
        {children}
      </div>
    </section>
  );
}
