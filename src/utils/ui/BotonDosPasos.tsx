import { useEffect, useState } from 'react';
import Boton from './Boton';

const ESPERA_MS = 6000;

// Confirmación en dos pasos para una acción destructiva (como «Salir»): el primer clic cambia el rótulo y explica qué pasará; solo el
// segundo la ejecuta. Esc, salir del botón o dejar pasar el plazo lo devuelven a su estado seguro.
export default function BotonDosPasos({ texto, armado, ayuda, ocupado, textoOcupado, nombre, alConfirmar, className = '' }: {
  texto: string;
  armado: string;
  ayuda: string;
  ocupado?: boolean;
  textoOcupado?: string;
  /** Nombre accesible cuando el rótulo visible no basta (p. ej. varias salas en la lista). */
  nombre?: string;
  alConfirmar: () => void;
  className?: string;
}) {
  const [listo, setListo] = useState(false);

  useEffect(() => {
    if (!listo) return;
    const t = window.setTimeout(() => setListo(false), ESPERA_MS);
    return () => window.clearTimeout(t);
  }, [listo]);

  return (
    <span className="contents">
      <Boton
        variante="peligro"
        className={`!px-4 !py-2 ${listo ? '!bg-error !text-fondo' : ''} ${className}`}
        aria-label={ocupado || listo ? undefined : nombre}
        disabled={ocupado}
        aria-busy={ocupado || undefined}
        onBlur={() => setListo(false)}
        onKeyDown={(e) => {
          // Esc solo desarma: no cierra además el popup que contenga el botón.
          if (e.key !== 'Escape' || !listo) return;
          e.preventDefault();
          e.stopPropagation();
          setListo(false);
        }}
        onClick={() => {
          if (!listo) return setListo(true);
          setListo(false);
          alConfirmar();
        }}
      >
        {ocupado ? (textoOcupado ?? texto) : listo ? armado : texto}
      </Boton>
      <span role="status" className={listo ? 'w-full text-xs text-error' : 'sr-only'}>
        {listo ? ayuda : ''}
      </span>
    </span>
  );
}
