import { useSyncExternalStore } from 'react';

// Preferencia «Pausar animaciones» (WCAG 2.2.2). Se guarda en el navegador y se refleja en
// <html data-animaciones="pausadas">, que el CSS usa para detener todo lo que se mueve.
const CLAVE = 'synk:animaciones-pausadas';
const oyentes = new Set<() => void>();

function leer(): boolean {
  try {
    return localStorage.getItem(CLAVE) === '1';
  } catch {
    return false;
  }
}

let pausadas = leer();

function aplicar() {
  document.documentElement.toggleAttribute('data-animaciones-pausadas', pausadas);
  document.documentElement.dataset.animaciones = pausadas ? 'pausadas' : 'activas';
}
aplicar();

export function fijarPausadas(valor: boolean) {
  pausadas = valor;
  try {
    localStorage.setItem(CLAVE, valor ? '1' : '0');
  } catch {
    /* sin almacenamiento: la preferencia dura solo esta visita */
  }
  aplicar();
  oyentes.forEach((f) => f());
}

export function usePausadas(): boolean {
  return useSyncExternalStore(
    (f) => {
      oyentes.add(f);
      return () => oyentes.delete(f);
    },
    () => pausadas,
  );
}

export const sistemaReduce = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ¿Hay que mostrar el estado final sin animar? Sí si la persona lo pidió aquí o en su sistema.
export const sinMovimiento = () => pausadas || sistemaReduce();
