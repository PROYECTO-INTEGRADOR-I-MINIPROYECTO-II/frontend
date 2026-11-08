import type { CSSProperties } from 'react';
import googlePixel from '../../assets/google-pixel.png';

const FILAS = 24; // el icono es de 24×24 celdas

// Icono de Google pixel art ampliado, partido en líneas horizontales que ya están a su altura final y entran una vez solo en
// horizontal (las pares desde la izquierda, las impares desde la derecha) hasta formar el icono, por pasos y sin repetir
// (ver .google-fila en index.css). Sin animación queda armado.
// El contenedor padre debe tener overflow-hidden para recortar las líneas fuera de su área.
export default function GoogleAnimado({ escala = 5 }: { escala?: number }) {
  const lado = FILAS * escala;
  return (
    <div aria-hidden="true" style={{ width: lado, height: lado }}>
      {Array.from({ length: FILAS }, (_, i) => (
        <span
          key={i}
          className="google-fila"
          style={
            {
              width: lado,
              height: escala,
              backgroundImage: `url(${googlePixel})`,
              backgroundSize: `${lado}px ${lado}px`,
              backgroundPosition: `0 ${-i * escala}px`,
              '--dx': `${i % 2 === 0 ? -260 : 260}px`,
              '--retraso': `${i * 35}ms`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
