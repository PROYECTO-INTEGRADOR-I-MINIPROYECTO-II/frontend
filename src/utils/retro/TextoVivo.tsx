import type { ReactNode } from 'react';

// Texto clicable con subrayado fijo. Dentro de un elemento con la clase `group`, al apuntarlo o enfocarlo el texto
// «se anima» en bucle por pasos (ver .vivo en index.css): alterna de blanco a morado o se eleva sobre la línea.
export default function TextoVivo({ children }: { children: ReactNode }) {
  return (
    <span className="vivo">
      <span className="vivo-t">{children}</span>
    </span>
  );
}
