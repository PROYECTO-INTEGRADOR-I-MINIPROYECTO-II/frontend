import { useEffect, useState, type ReactNode } from 'react';

const reducido = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Ventana sencilla al estilo Monokuro: marco blanco, barra de título con borde y cuerpo negro.
export function RetroWindow({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section aria-labelledby="ventana-titulo" className="w-full max-w-2xl border-2 border-texto bg-fondo">
      <h1
        id="ventana-titulo"
        className="border-b-2 border-texto px-4 py-3 text-center font-monokuro text-xs leading-5 lowercase"
      >
        {title}
      </h1>
      <div className="px-6 py-8 sm:px-10">{children}</div>
    </section>
  );
}

// Tres puntos que aparecen de a uno y, en el cuarto paso, se borran para repetir (decorativo).
export function PuntosAnimados() {
  const [paso, setPaso] = useState(0);
  const quieto = reducido();
  useEffect(() => {
    if (quieto) return;
    const t = window.setInterval(() => setPaso((p) => (p + 1) % 4), 420);
    return () => window.clearInterval(t);
  }, [quieto]);
  return (
    <span aria-hidden="true" className="inline-block w-[3ch] text-left">
      {quieto ? '...' : '.'.repeat(paso)}
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

// Botón con el lenguaje de la ventana: marco recto, tipografía pixel e inversión de colores al apuntar.
export function BotonRetro({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="border-2 border-texto bg-fondo px-6 py-3 font-monokuro text-xs lowercase text-texto transition-none hover:bg-texto hover:text-fondo focus-visible:bg-texto focus-visible:text-fondo"
    >
      {children}
    </button>
  );
}
