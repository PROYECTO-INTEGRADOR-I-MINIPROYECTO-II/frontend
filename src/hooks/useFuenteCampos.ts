import { useSyncExternalStore } from 'react';

// Tipografía POR DEFECTO de los campos de texto (destacados y con cuadro): Press Start 2P («pixel») o Geist («clara», más legible).
// Se elige en Ajustes y se recuerda en el navegador. Cada campo puede cambiarla solo para sí con su botón «Aa» (no se guarda).
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

export function fijarFuenteCampos(fuente: FuenteCampos) {
  if (fuente === actual) return;
  actual = fuente;
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
