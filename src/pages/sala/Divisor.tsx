import { useRef, type KeyboardEvent, type PointerEvent } from 'react';

// Línea entre dos columnas que se arrastra para cambiar el ancho de una de ellas (con puntero, táctil o teclado: flechas ±16 px,
// Inicio y Fin van al mínimo y al máximo). `lado` dice qué columna cambia: «izq» crece al arrastrar a la derecha; «der», a la izquierda.
// `valor` es el ancho de la columna en píxeles; quien lo usa limita el rango (min, max) y lo guarda.
const PASO = 16;

export default function Divisor({ lado, valor, min, max, etiqueta, deshabilitado = false, alCambiar }: { lado: 'izq' | 'der'; valor: number; min: number; max: number; etiqueta: string; deshabilitado?: boolean; alCambiar: (px: number) => void }) {
  const inicio = useRef<{ x: number; ancho: number } | null>(null);
  const signo = lado === 'izq' ? 1 : -1;

  if (deshabilitado) return <div aria-hidden="true" className="w-0.5 bg-texto" />;

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={etiqueta}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={Math.round(valor)}
      tabIndex={0}
      onPointerDown={(e: PointerEvent<HTMLDivElement>) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        inicio.current = { x: e.clientX, ancho: valor };
      }}
      onPointerMove={(e) => {
        if (inicio.current) alCambiar(inicio.current.ancho + signo * (e.clientX - inicio.current.x));
      }}
      onPointerUp={() => (inicio.current = null)}
      onPointerCancel={() => (inicio.current = null)}
      onKeyDown={(e: KeyboardEvent) => {
        const mas = lado === 'izq' ? 'ArrowRight' : 'ArrowLeft';
        const menos = lado === 'izq' ? 'ArrowLeft' : 'ArrowRight';
        if (e.key === mas) alCambiar(valor + PASO);
        else if (e.key === menos) alCambiar(valor - PASO);
        else if (e.key === 'Home') alCambiar(min);
        else if (e.key === 'End') alCambiar(max);
        else return;
        e.preventDefault();
      }}
      className="group relative z-10 -mx-1 w-3 shrink-0 cursor-col-resize touch-none focus-visible:outline-none"
    >
      {/* Línea visible: fina en reposo y más gruesa y morada al apuntarla, arrastrarla o enfocarla. */}
      <span aria-hidden="true" className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-texto group-hover:w-1 group-hover:bg-acento-claro group-focus-visible:w-1 group-focus-visible:bg-acento-claro" />
    </div>
  );
}
