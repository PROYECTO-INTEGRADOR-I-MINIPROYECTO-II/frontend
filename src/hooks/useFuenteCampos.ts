import { useSyncExternalStore } from 'react';

// Tipografía de los campos destacados (username, nombres y apellidos): Press Start 2P («pixel») o Geist («clara», más legible).
// Se recuerda en el navegador y la comparten todos los campos, así que cambiarla en uno cambia los demás.
export type FuenteCampos = 'pixel' | 'clara';
const CLAVE = 'synk:campos-fuente';
const oyentes = new Set<() => void>();

function leer(): FuenteCampos {
  try {
    return localStorage.getItem(CLAVE) === 'clara' ? 'clara' : 'pixel';
  } catch {
    return 'pixel';
  }
}
let actual: FuenteCampos = leer();

export function alternarFuenteCampos() {
  actual = actual === 'clara' ? 'pixel' : 'clara';
  try {
    localStorage.setItem(CLAVE, actual);
  } catch {
    /* sin almacenamiento: dura solo esta visita */
  }
  oyentes.forEach((f) => f());
}

export function useFuenteCampos(): FuenteCampos {
  return useSyncExternalStore(
    (f) => {
      oyentes.add(f);
      return () => oyentes.delete(f);
    },
    () => actual,
  );
}
