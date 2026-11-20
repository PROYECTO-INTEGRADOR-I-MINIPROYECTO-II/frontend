import type { Integrante } from '../../realtime/tipos';

// Anclas del tablero. Es una preferencia de cada cliente (nadie más ve cómo tienes organizado tu tablero). Cada diseño tiene tantos
// puntos como integrantes; una persona anclada ocupa siempre su punto aunque otras entren o salgan, y las demás llenan los libres.
export type Diseno = 'cuadricula' | 'orador' | 'presentacion';
export const DISENOS: { valor: Diseno; nombre: string }[] = [
  { valor: 'cuadricula', nombre: 'Cuadrícula' },
  { valor: 'orador', nombre: 'Orador' },
  { valor: 'presentacion', nombre: 'Presentación' },
];

export type Anclas = Record<string, number>;
export type Flecha = 'ArrowLeft' | 'ArrowRight' | 'ArrowUp' | 'ArrowDown';

/** Columnas de la cuadrícula según cuántas personas hay. */
export const columnasDe = (n: number) => (n <= 1 ? 1 : n <= 4 ? 2 : 3);

/** Quién ocupa cada punto: primero los anclados en el suyo; el resto, en orden (el anfitrión primero), en los libres. */
export function colocar(integrantes: Integrante[], anclas: Anclas, anfitrionUid: string): Integrante[] {
  const n = integrantes.length;
  const puntos: (Integrante | null)[] = Array(n).fill(null);
  const resto: Integrante[] = [];
  const base = [...integrantes].sort((a, b) => Number(b.uid === anfitrionUid) - Number(a.uid === anfitrionUid));
  for (const i of base) {
    const p = anclas[i.uid];
    if (Number.isInteger(p) && p >= 0 && p < n && !puntos[p]) puntos[p] = i;
    else resto.push(i);
  }
  return puntos.map((p) => p ?? resto.shift()!);
}

/** Punto al que lleva una flecha desde el punto `i` en cada diseño (null = no hay a dónde ir). */
export function vecino(diseno: Diseno, i: number, tecla: Flecha, n: number): number | null {
  let destino: number;
  if (diseno === 'cuadricula') {
    const c = columnasDe(n);
    if (tecla === 'ArrowRight') destino = i % c < c - 1 ? i + 1 : -1;
    else if (tecla === 'ArrowLeft') destino = i % c > 0 ? i - 1 : -1;
    else destino = tecla === 'ArrowDown' ? i + c : i - c;
  } else if (diseno === 'orador') {
    // Punto 1 grande arriba y los demás en una fila debajo: hacia abajo desde el grande va al primero de la fila, y hacia arriba
    // desde la fila, al grande.
    if (tecla === 'ArrowUp') destino = i > 0 ? 0 : -1;
    else if (tecla === 'ArrowLeft') destino = i - 1;
    else destino = i + 1;
  } else {
    // Presentación: todos en una tira junto a la pantalla compartida.
    destino = tecla === 'ArrowLeft' || tecla === 'ArrowUp' ? i - 1 : i + 1;
  }
  return destino >= 0 && destino < n ? destino : null;
}
