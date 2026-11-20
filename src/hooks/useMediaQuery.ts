import { useSyncExternalStore } from 'react';

// true mientras se cumple la media query (se actualiza al girar el aparato o cambiar el tamaño). Sirve para montar UNA sola variante de
// un diseño en vez de dos ocultas con CSS (que duplicarían ids y controles).
export function useMediaQuery(consulta: string): boolean {
  return useSyncExternalStore(
    (aviso) => {
      const m = window.matchMedia(consulta);
      m.addEventListener('change', aviso);
      return () => m.removeEventListener('change', aviso);
    },
    () => window.matchMedia(consulta).matches,
    () => false,
  );
}
