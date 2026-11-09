// Iconos pixel con los que se enmascara una contraseña. Cada posición del campo usa un icono distinto (nunca se repite mientras
// haya iconos sin usar): el icono depende solo de la posición, no del carácter, así que no revela nada de la contraseña.

// En el orden de iconos.json: el icono i es la letra «a» + i de la fuente (y U+E000 + i), y la casilla i de la hoja de sprites.
const NOMBRES = ['calavera', 'corazón', 'sonrisa', 'estrella', 'luna', 'ojo', 'llave', 'rayo', 'espada', 'poción', 'fantasma', 'murciélago', 'moneda', 'dado', 'candado', 'reloj'] as const;

export const CANTIDAD_ICONOS = NOMBRES.length;

/**
 * Un orden nuevo y aleatorio de los 16 iconos (Fisher-Yates). Se crea una vez por campo y no cambia mientras el campo existe: así
 * cada posición conserva su icono al escribir y al mostrar u ocultar la contraseña. Usa `crypto.getRandomValues` (no `Math.random`):
 * el azar es solo estético, pero así no depende de un generador predecible.
 */
export function crearOrden(): number[] {
  const orden = Array.from({ length: CANTIDAD_ICONOS }, (_, i) => i);
  const azar = crypto.getRandomValues(new Uint32Array(CANTIDAD_ICONOS));
  for (let i = orden.length - 1; i > 0; i--) {
    const j = azar[i] % (i + 1);
    [orden[i], orden[j]] = [orden[j], orden[i]];
  }
  return orden;
}

/** Icono (0 a 15) de una posición del campo según su orden. Los primeros 16 son todos distintos; después el ciclo se repite, sin que
 *  nunca queden iguales dos iconos contiguos (el último de un ciclo y el primero del siguiente son distintos). */
export const iconoDe = (orden: readonly number[], posicion: number): number => orden[posicion % orden.length];

/** El carácter de la fuente IconosPixel16 para un icono (zona de uso privado: no se confunde con texto). */
export const glifo = (icono: number): string => String.fromCharCode(0xe000 + icono);
