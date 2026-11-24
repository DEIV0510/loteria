'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const P = [
  { href: '/admin', texto: 'Resultados' },
  { href: '/admin/espacios', texto: 'Imágenes' },
  { href: '/admin/ajustes', texto: 'Ajustes' },
];

export function Pestanas() {
  const ruta = usePathname();
  return (
    <nav className="panel-pestanas" aria-label="Panel">
      {P.map((p) => (
        <Link key={p.href} href={p.href} aria-current={ruta === p.href ? 'page' : undefined}>
          {p.texto}
        </Link>
      ))}
    </nav>
  );
}
