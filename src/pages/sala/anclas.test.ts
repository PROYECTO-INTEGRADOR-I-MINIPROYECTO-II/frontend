import { describe, expect, it } from 'vitest';
import type { Integrante } from '../../realtime/tipos';
import { colocar, columnasDe, vecino } from './anclas';

const gente = (...nombres: string[]): Integrante[] => nombres.map((n) => ({ uid: n, username: n }));

describe('colocar', () => {
  it('sin anclas pone primero al anfitrión y luego al resto en orden', () => {
    const r = colocar(gente('ana', 'beto', 'carla'), {}, 'carla');
    expect(r.map((i) => i.uid)).toEqual(['carla', 'ana', 'beto']);
  });

  it('una persona anclada ocupa su punto aunque lleguen otras', () => {
    const r = colocar(gente('ana', 'beto', 'carla'), { beto: 2 }, 'ana');
    expect(r.map((i) => i.uid)).toEqual(['ana', 'carla', 'beto']);
  });

  it('ignora anclas fuera de rango o repetidas', () => {
    const r = colocar(gente('ana', 'beto'), { ana: 9, beto: -1 }, 'ana');
    expect(r.map((i) => i.uid).sort()).toEqual(['ana', 'beto']);
    const dos = colocar(gente('ana', 'beto'), { ana: 1, beto: 1 }, 'x');
    expect(dos).toHaveLength(2);
    expect(new Set(dos.map((i) => i.uid)).size).toBe(2);
  });
});

describe('vecino', () => {
  it('cuadrícula: las flechas se mueven por filas y columnas y no se salen', () => {
    // 4 personas → 2 columnas
    expect(columnasDe(4)).toBe(2);
    expect(vecino('cuadricula', 0, 'ArrowRight', 4)).toBe(1);
    expect(vecino('cuadricula', 1, 'ArrowRight', 4)).toBeNull();
    expect(vecino('cuadricula', 0, 'ArrowDown', 4)).toBe(2);
    expect(vecino('cuadricula', 0, 'ArrowUp', 4)).toBeNull();
    expect(vecino('cuadricula', 2, 'ArrowLeft', 4)).toBeNull();
  });

  it('orador: desde el grande hacia abajo va al primero de la fila y desde la fila hacia arriba, al grande', () => {
    expect(vecino('orador', 0, 'ArrowDown', 3)).toBe(1);
    expect(vecino('orador', 2, 'ArrowUp', 3)).toBe(0);
    expect(vecino('orador', 1, 'ArrowRight', 3)).toBe(2);
    expect(vecino('orador', 2, 'ArrowRight', 3)).toBeNull();
  });

  it('presentación: una tira en orden', () => {
    expect(vecino('presentacion', 0, 'ArrowDown', 3)).toBe(1);
    expect(vecino('presentacion', 1, 'ArrowLeft', 3)).toBe(0);
    expect(vecino('presentacion', 0, 'ArrowUp', 3)).toBeNull();
  });
});
