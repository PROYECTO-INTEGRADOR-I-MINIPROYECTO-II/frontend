import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Sala } from '../../realtime/tipos';
import { useSala } from './useSala';

// Socket de mentira: guarda los oyentes y responde a los eventos que el hook emite con las respuestas que cada prueba define.
type Oyente = (...a: unknown[]) => void;
const falso = {
  oyentes: new Map<string, Oyente>(),
  respuestas: new Map<string, unknown>(),
  emitidos: [] as [string, unknown][],
  connected: true,
  desconectado: false,
};
const socket = {
  on: (e: string, f: Oyente) => void falso.oyentes.set(e, f),
  emit: (e: string, p: unknown) => void falso.emitidos.push([e, p]),
  timeout: () => ({
    emit: (e: string, p: unknown, cb: (err: Error | null, res?: unknown) => void) => {
      falso.emitidos.push([e, p]);
      cb(null, falso.respuestas.get(e));
    },
  }),
  disconnect: () => void (falso.desconectado = true),
  get connected() {
    return falso.connected;
  },
};
vi.mock('../../realtime/cliente', () => ({ conectarTiempoReal: () => socket }));

const sala: Sala = { id: 'S1', nombre: 'Mi sala', descripcion: '', uid: 'u1', creado: '2026-11-19T10:00:00.000Z' };
const disparar = (evento: string, ...args: unknown[]) => act(() => falso.oyentes.get(evento)?.(...args));

beforeEach(() => {
  falso.oyentes.clear();
  falso.respuestas.clear();
  falso.emitidos.length = 0;
  falso.connected = true;
  falso.desconectado = false;
});

describe('useSala', () => {
  it('empieza conectando y, al conectar, se une a la sala y queda lista', () => {
    falso.respuestas.set('sala:unirse', { sala });
    const { result } = renderHook(() => useSala('S1'));
    expect(result.current.estado.fase).toBe('conectando');
    disparar('connect');
    expect(falso.emitidos).toContainEqual(['sala:unirse', { id: 'S1' }]);
    expect(result.current.estado).toMatchObject({ fase: 'lista', sala, integrantes: [], mensajes: [], conectado: true });
  });

  it('una sala que no existe deja el error del servidor', () => {
    falso.respuestas.set('sala:unirse', { error: { code: 'NOT_FOUND', message: 'La sala no existe. Revisa el ID.' } });
    const { result } = renderHook(() => useSala('nada'));
    disparar('connect');
    expect(result.current.estado).toEqual({ fase: 'error', mensaje: 'La sala no existe. Revisa el ID.' });
  });

  it('actualiza integrantes con la presencia y añade los mensajes nuevos sin duplicarlos', () => {
    falso.respuestas.set('sala:unirse', { sala });
    const { result } = renderHook(() => useSala('S1'));
    disparar('connect');
    disparar('sala:presencia', { salaId: 'S1', usuarios: [{ uid: 'u1', username: 'ana' }] });
    disparar('sala:presencia', { salaId: 'otra', usuarios: [] }); // de otra sala: se ignora
    const m = { id: 'm1', salaId: 'S1', uid: 'u1', autor: 'ana', texto: 'Hola', creado: '2026-11-19T18:31:00.000Z' };
    disparar('mensaje:nuevo', m);
    disparar('mensaje:nuevo', m);
    const e = result.current.estado;
    expect(e.fase === 'lista' && e.integrantes).toEqual([{ uid: 'u1', username: 'ana' }]);
    expect(e.fase === 'lista' && e.mensajes).toHaveLength(1);
  });

  it('si se cae la conexión con la sala abierta, la marca desconectada y no la cierra; al volver se une otra vez', () => {
    falso.respuestas.set('sala:unirse', { sala });
    const { result } = renderHook(() => useSala('S1'));
    disparar('connect');
    disparar('disconnect');
    expect(result.current.estado).toMatchObject({ fase: 'lista', conectado: false });
    disparar('connect');
    expect(result.current.estado).toMatchObject({ fase: 'lista', conectado: true });
  });

  it('un error de conexión antes de entrar muestra el motivo', () => {
    const { result } = renderHook(() => useSala('S1'));
    disparar('connect_error', Object.assign(new Error('x'), { data: { message: 'Inicia sesión para continuar.' } }));
    expect(result.current.estado).toEqual({ fase: 'error', mensaje: 'Inicia sesión para continuar.' });
  });

  it('enviar entrega el texto a la sala y devuelve null si salió bien o el motivo si no', async () => {
    falso.respuestas.set('sala:unirse', { sala });
    const { result } = renderHook(() => useSala('S1'));
    disparar('connect');
    falso.respuestas.set('mensaje:enviar', { mensaje: {} });
    await expect(result.current.enviar('Hola')).resolves.toBeNull();
    expect(falso.emitidos).toContainEqual(['mensaje:enviar', { salaId: 'S1', texto: 'Hola' }]);
    falso.respuestas.set('mensaje:enviar', { error: { code: 'VALIDATION_ERROR', message: 'Mensaje inválido.' } });
    await expect(result.current.enviar('Hola')).resolves.toBe('Mensaje inválido.');
    falso.connected = false;
    await expect(result.current.enviar('Hola')).resolves.toMatch(/Sin conexión/);
  });

  it('al salir de la página sale de la sala y corta la conexión', () => {
    falso.respuestas.set('sala:unirse', { sala });
    const { unmount } = renderHook(() => useSala('S1'));
    unmount();
    expect(falso.emitidos).toContainEqual(['sala:salir', { id: 'S1' }]);
    expect(falso.desconectado).toBe(true);
  });
});
