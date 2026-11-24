'use client';
import { useEffect, useState } from 'react';

const dos = (n: number) => String(n).padStart(2, '0');

/** Cuenta regresiva en vivo (horas : minutos : segundos) hasta el próximo sorteo. */
export function Reloj({ ms, inicial }: { ms: number; inicial: number }) {
  const [ahora, setAhora] = useState(inicial);
  useEffect(() => {
    setAhora(Date.now());
    const t = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const d = Math.max(0, ms - ahora);
  if (d === 0) return <span className="reloj-ya">Jugando ahora</span>;
  const s = Math.floor(d / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const seg = s % 60;
  return (
    <span className="reloj" role="timer" aria-label={`Faltan ${h} horas y ${m} minutos`} suppressHydrationWarning>
      <span className="bloque">
        <b suppressHydrationWarning>{dos(h)}</b>
        <small>horas</small>
      </span>
      <i>:</i>
      <span className="bloque">
        <b suppressHydrationWarning>{dos(m)}</b>
        <small>min</small>
      </span>
      <i>:</i>
      <span className="bloque">
        <b suppressHydrationWarning>{dos(seg)}</b>
        <small>seg</small>
      </span>
    </span>
  );
}
