import { Lock } from 'lucide-react';

const items = Array.from({ length: 6 });

function Item() {
  return (
    <span className="flex shrink-0 items-center gap-4 px-6">
      <Lock aria-hidden="true" className="size-6" strokeWidth={2.5} />
      INICIA SESIÓN
      <span className="px-2 opacity-60">·</span>
    </span>
  );
}

// Letrero LED decorativo (aria-hidden): el mensaje accesible es el texto que acompaña al campo.
export default function LedMarquee() {
  return (
    <div
      aria-hidden="true"
      className="led-mask pointer-events-none absolute inset-0 overflow-hidden rounded-2xl font-pixel text-xl font-semibold tracking-widest text-led md:text-2xl"
    >
      {/* Con movimiento reducido: un solo letrero quieto y centrado. */}
      <div className="hidden h-full items-center justify-center motion-reduce:flex">
        <Item />
      </div>
      <div className="flex h-full w-max animate-led items-center motion-reduce:hidden">
        {[0, 1].map((g) => (
          <div key={g} className="flex shrink-0 items-center">
            {items.map((_, i) => (
              <Item key={i} />
            ))}
          </div>
        ))}
      </div>
      {/* Rejilla de puntos: simula la matriz de LEDs. */}
      <div className="led-dots absolute inset-0" />
    </div>
  );
}
