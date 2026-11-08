import { useEffect, useState, type ReactNode } from 'react';
import { sinMovimiento } from '../../hooks/useAnimaciones';

const reducido = sinMovimiento;

// Ventana sencilla al estilo Monokuro: marco blanco, barra de título con borde y cuerpo negro.
export function RetroWindow({ heading, title, children }: { heading: string; title: ReactNode; children: ReactNode }) {
  return (
    <section aria-labelledby="ventana-titulo" className="w-full max-w-2xl border-2 border-texto bg-fondo">
      {/* El encabezado accesible es el h1; la barra visible puede llevar un título más rico (p. ej. la ruta). */}
      <h1 id="ventana-titulo" className="sr-only">{heading}</h1>
      <div className="border-b-2 border-texto px-4 py-3 text-center font-pixel text-xs leading-5">{title}</div>
      <div className="px-6 py-8 sm:px-10">{children}</div>
    </section>
  );
}

// Puntos que aparecen de a uno (decorativo). Por defecto: 1, 2, 3 y en el cuarto paso se borran para repetir.
// Con `sinVacio` el ciclo es 1, 2, 3 y vuelve a empezar (para textos como «Username...» que no deben quedarse sin puntos).
export function PuntosAnimados({ sinVacio = false, intervalo = 420 }: { sinVacio?: boolean; intervalo?: number }) {
  const [paso, setPaso] = useState(0);
  const quieto = reducido();
  const pasos = sinVacio ? 3 : 4;
  useEffect(() => {
    if (quieto) return;
    const t = window.setInterval(() => setPaso((p) => (p + 1) % pasos), intervalo);
    return () => window.clearInterval(t);
  }, [quieto, pasos, intervalo]);
  const n = sinVacio ? paso + 1 : paso;
  return (
    <span aria-hidden="true" className="inline-block w-[3ch] text-left">
      {quieto ? '...' : '.'.repeat(n)}
    </span>
  );
}

const CELDAS = 20;

// Barra de progreso retro de celdas. Cargando: indeterminada (avanza por pasos y reinicia). Al terminar queda llena.
export function BarraRetro({ modo, label }: { modo: 'cargando' | 'ok' | 'error'; label: string }) {
  const [llenas, setLlenas] = useState(0);
  const quieto = reducido();
  useEffect(() => {
    if (modo !== 'cargando' || quieto) return;
    const t = window.setInterval(() => setLlenas((n) => (n + 1) % (CELDAS + 1)), 160);
    return () => window.clearInterval(t);
  }, [modo, quieto]);

  const n = modo === 'cargando' ? (quieto ? 6 : llenas) : CELDAS;
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={modo === 'cargando' ? undefined : 100}
      className={`flex gap-[3px] border-2 p-[3px] ${modo === 'error' ? 'border-error text-error' : 'border-texto text-texto'}`}
    >
      {Array.from({ length: CELDAS }, (_, i) => (
        <span key={i} className={`h-4 flex-1 ${i < n ? 'bg-current' : 'bg-transparent'}`} />
      ))}
    </div>
  );
}
