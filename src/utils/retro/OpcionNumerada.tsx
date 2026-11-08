import type { ReactNode } from 'react';
import TextoVivo from './TextoVivo';

// Opción al estilo de los juegos de texto: «[1]» a la izquierda (siempre en el morado de acento, sin cambiar al apuntar) y el texto
// centrado. La tecla solo actúa con el foco dentro del panel y fuera de un campo (lo gestiona el contenedor), así que no interfiere
// al escribir (WCAG 2.1.4); Tab + Enter también sirve. tipo="submit" la hace el botón de envío del formulario.
// `deshabilitada`: se ve en gris y no hace nada, pero sigue enfocable (aria-disabled) para que se pueda leer que está bloqueada;
// quien la use debe explicar cerca por qué (p. ej. con los mensajes de error de los campos).
export default function OpcionNumerada({
  tecla,
  onElegir,
  tipo = 'button',
  primero = false,
  deshabilitada = false,
  children,
}: {
  tecla: string;
  onElegir?: () => void;
  tipo?: 'button' | 'submit';
  primero?: boolean;
  deshabilitada?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type={tipo}
      onClick={deshabilitada ? (e) => e.preventDefault() : tipo === 'button' ? onElegir : undefined}
      aria-keyshortcuts={tecla}
      aria-disabled={deshabilitada || undefined}
      data-primero={primero ? '' : undefined}
      className={`relative block w-full py-1 text-center font-pixel text-[11px] leading-5 ${deshabilitada ? 'cursor-not-allowed text-texto-secundario/60' : 'group'}`}
    >
      <span
        aria-hidden="true"
        className={`absolute left-0 top-1 ${deshabilitada ? 'text-texto-secundario/60' : 'text-acento-claro'}`}
      >
        [{tecla}]
      </span>
      {deshabilitada ? <span className="inline-block pb-[3px] underline decoration-1 underline-offset-4">{children}</span> : <TextoVivo>{children}</TextoVivo>}
    </button>
  );
}
