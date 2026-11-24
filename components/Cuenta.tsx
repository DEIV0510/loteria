'use client';
import { useEffect, useState } from 'react';

function texto(ms: number, ahora: number) {
  const d = ms - ahora;
  if (d <= 0) return 'jugando ahora';
  const min = Math.round(d / 60000);
  if (min < 1) return 'en menos de 1 min';
  if (min < 60) return `en ${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h >= 24) {
    const dias = Math.round(h / 24);
    return dias === 1 ? 'en 1 día' : `en ${dias} días`;
  }
  return m ? `en ${h} h ${m} min` : `en ${h} h`;
}

/** "en 25 min": se actualiza solo cada 20 segundos. */
export function Cuenta({ ms, inicial }: { ms: number; inicial: number }) {
  const [ahora, setAhora] = useState(inicial);
  useEffect(() => {
    setAhora(Date.now());
    const t = setInterval(() => setAhora(Date.now()), 20000);
    return () => clearInterval(t);
  }, []);
  return <span suppressHydrationWarning>{texto(ms, ahora)}</span>;
}
