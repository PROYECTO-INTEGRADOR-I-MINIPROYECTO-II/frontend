import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mensaje, Sala } from '../../realtime/tipos';
import { useSala } from './useSala';

// Socket de mentira: guarda los oyentes y responde a los eventos que el hook emite con las respuestas que cada prueba define.
type Oyente = (...a: unknown[]) => void;
const falso = {
  oyentes: new Map<string, Oyente>(),
  respuestas: new Map<string, unknown>(),
  emitidos: [] as [string, unknown][],
  connected: true,
  desconectado: false,
  demorarEntrada: false,
  entradas: [] as ((err: Error | null, res?: unknown) => void)[],
};
const socket = {
  on: (e: string, f: Oyente) => void falso.oyentes.set(e, f),
  emit: (e: string, p: unknown) => void falso.emitidos.push([e, p]),
  timeout: () => ({
    emit: (e: string, p: unknown, cb: (err: Error | null, res?: unknown) => void) => {
      falso.emitidos.push([e, p]);
      if (e === 'sala:unirse' && falso.demorarEntrada) falso.entradas.push(cb);
      else cb(null, falso.respuestas.get(e));
    },
  }),
  disconnect: () => void (falso.desconectado = true),
  get connected() {
    return falso.connected;
  },
};
vi.mock('../../realtime/cliente', () => ({ conectarTiempoReal: () => socket }));
const mensajesAnteriores = vi.fn();
vi.mock('../../api/salas', () => ({ mensajesAnteriores: (...a: unknown[]) => mensajesAnteriores(...a) }));

const sala: Sala = { id: 'S1', nombre: 'Mi sala', descripcion: '', uid: 'u1', creado: '2026-11-19T10:00:00.000Z' };
const mensaje = (id: string, creado = '2026-11-19T18:31:00.000Z'): Mensaje => ({ id, salaId: 'S1', uid: 'u1', autor: 'ana', texto: id, creado });
const responderEntrada = (indice: number, respuesta: unknown, error: Error | null = null) => act(() => falso.entradas[indice](error, respuesta));
const disparar = (evento: string, ...args: unknown[]) => act(() => falso.oyentes.get(evento)?.(...args));

beforeEach(() => {
  falso.oyentes.clear();
  falso.respuestas.clear();
  falso.emitidos.length = 0;
  falso.connected = true;
  falso.desconectado = false;
  falso.demorarEntrada = false;
  falso.entradas.length = 0;
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

  it('mezcla historial y mensajes recibidos antes del ack, sin duplicados y con desempate por ID', () => {
    falso.demorarEntrada = true;
    const { result } = renderHook(() => useSala('S1'));
    disparar('connect');
    const antiguo = mensaje('antiguo', '2026-11-19T18:30:00.000Z');
    const a = mensaje('A');
    const z = mensaje('Z');
    const minuscula = mensaje('a');
    disparar('mensaje:nuevo', minuscula);
    disparar('mensaje:nuevo', z);
    disparar('mensaje:nuevo', { ...mensaje('otra'), salaId: 'otra' });
    responderEntrada(0, { sala, mensajes: [z, antiguo, a] });
    expect(result.current.estado).toMatchObject({ fase: 'lista', mensajes: [antiguo, a, z, minuscula] });
    disparar('mensaje:nuevo', antiguo);
    expect(result.current.estado).toMatchObject({ mensajes: [antiguo, a, z, minuscula] });
  });

  it('recupera un mensaje enviado sin conexión exactamente una vez y conserva el chat anterior', () => {
    const anterior = mensaje('anterior', '2026-11-19T18:29:00.000Z');
    const sinConexion = mensaje('sin-conexion', '2026-11-19T18:30:00.000Z');
    const nuevo = mensaje('nuevo');
    falso.respuestas.set('sala:unirse', { sala, mensajes: [anterior] });
    const { result } = renderHook(() => useSala('S1'));
    disparar('connect');
    disparar('disconnect');
    falso.demorarEntrada = true;
    disparar('connect');
    disparar('mensaje:nuevo', nuevo);
    responderEntrada(0, { sala, mensajes: [sinConexion, nuevo] });
    disparar('mensaje:nuevo', sinConexion);
    expect(result.current.estado).toMatchObject({ fase: 'lista', conectado: true, mensajes: [anterior, sinConexion, nuevo] });
  });

  it('ignora acknowledgements anteriores tras desconectar y vacía los mensajes pendientes', () => {
    falso.demorarEntrada = true;
    const { result } = renderHook(() => useSala('S1'));
    disparar('connect');
    disparar('mensaje:nuevo', mensaje('pendiente'));
    disparar('disconnect');
    disparar('connect');
    responderEntrada(0, { sala, mensajes: [mensaje('obsoleto')] });
    expect(result.current.estado.fase).toBe('conectando');
    responderEntrada(1, { sala, mensajes: [] });
    expect(result.current.estado).toMatchObject({ fase: 'lista', mensajes: [] });
  });

  it('no conserva mensajes pendientes de una entrada fallida', () => {
    falso.demorarEntrada = true;
    const { result } = renderHook(() => useSala('S1'));
    disparar('connect');
    disparar('mensaje:nuevo', mensaje('pendiente'));
    responderEntrada(0, undefined, new Error('timeout'));
    expect(result.current.estado.fase).toBe('error');
    disparar('connect');
    responderEntrada(1, { sala });
    expect(result.current.estado).toMatchObject({ fase: 'lista', mensajes: [] });
  });

  it('aplica actualizaciones solo a esta sala, incluso antes del ack', () => {
    falso.demorarEntrada = true;
    const { result } = renderHook(() => useSala('S1'));
    disparar('connect');
    const actualizada = { ...sala, nombre: 'Nuevo nombre', descripcion: 'Nueva descripción' };
    disparar('sala:actualizada', { sala: actualizada });
    disparar('sala:actualizada', { sala: { ...sala, id: 'otra' } });
    responderEntrada(0, { sala });
    expect(result.current.estado).toMatchObject({ fase: 'lista', sala: actualizada });
    const final = { ...actualizada, nombre: 'Final' };
    disparar('sala:actualizada', { sala: final });
    disparar('sala:actualizada', { sala: { ...sala, id: 'otra' } });
    expect(result.current.estado).toMatchObject({ sala: final });
  });

  it.each([false, true])('la eliminación de esta sala la cierra y un ack tardío no la reabre (abierta: %s)', (abierta) => {
    falso.demorarEntrada = true;
    const { result } = renderHook(() => useSala('S1'));
    disparar('connect');
    if (abierta) {
      responderEntrada(0, { sala });
      disparar('disconnect');
      disparar('connect');
    }
    disparar('sala:eliminada', { salaId: 'otra' });
    expect(result.current.estado.fase).toBe(abierta ? 'lista' : 'conectando');
    disparar('sala:eliminada', { salaId: 'S1' });
    responderEntrada(abierta ? 1 : 0, { sala });
    disparar('sala:actualizada', { sala });
    disparar('connect');
    // Dentro de la sala se avisa y se vuelve a «Mis salas» (US-07); entrando, es un error de entrada.
    expect(result.current.estado).toEqual(abierta ? { fase: 'eliminada', nombre: 'Mi sala' } : { fase: 'error', mensaje: 'La sala ya no existe.' });
    expect(falso.entradas).toHaveLength(abierta ? 2 : 1);
  });

  it('al cambiar de sala ignora callbacks y eventos del socket anterior', () => {
    falso.demorarEntrada = true;
    const { result, rerender } = renderHook(({ id }) => useSala(id), { initialProps: { id: 'S1' } });
    disparar('connect');
    const mensajeAnterior = falso.oyentes.get('mensaje:nuevo')!;
    const eliminacionAnterior = falso.oyentes.get('sala:eliminada')!;
    rerender({ id: 'S2' });
    disparar('connect');
    responderEntrada(1, { sala: { ...sala, id: 'S2' } });
    responderEntrada(0, { sala, mensajes: [mensaje('obsoleto')] });
    act(() => {
      mensajeAnterior(mensaje('tardio'));
      eliminacionAnterior({ salaId: 'S1' });
    });
    expect(result.current.estado).toMatchObject({ fase: 'lista', sala: { id: 'S2' }, mensajes: [] });
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

  it('anota quién entra y quién sale, pero no a quienes ya estaban', () => {
    falso.respuestas.set('sala:unirse', { sala });
    const { result } = renderHook(() => useSala('S1'));
    disparar('connect');
    const ana = { uid: 'u1', username: 'ana', nombre: 'Ana' };
    const marta = { uid: 'u2', username: 'marta', nombre: 'Marta' };
    disparar('sala:presencia', { salaId: 'S1', usuarios: [ana] });
    disparar('sala:presencia', { salaId: 'S1', usuarios: [ana, marta] });
    disparar('sala:presencia', { salaId: 'S1', usuarios: [ana] });
    expect(result.current.estado).toMatchObject({
      novedades: [
        { tipo: 'entra', nombre: 'Marta' },
        { tipo: 'sale', nombre: 'Marta' },
      ],
    });
  });

  it('carga la página anterior desde el mensaje más antiguo, sin duplicados (US-11)', async () => {
    falso.respuestas.set('sala:unirse', { sala, mensajes: [mensaje('b', '2026-11-19T18:00:00.000Z')], hayMas: true });
    mensajesAnteriores.mockResolvedValueOnce({ mensajes: [mensaje('a', '2026-11-19T17:00:00.000Z'), mensaje('b', '2026-11-19T18:00:00.000Z')], hayMas: false });
    const { result } = renderHook(() => useSala('S1'));
    disparar('connect');
    await act(() => result.current.cargarAnteriores());
    expect(mensajesAnteriores).toHaveBeenCalledWith('S1', '2026-11-19T18:00:00.000Z', 'b');
    const e = result.current.estado;
    expect(e).toMatchObject({ hayMas: false, anteriores: null });
    expect(e.fase === 'lista' && e.mensajes.map((m) => m.id)).toEqual(['a', 'b']);
  });

  it('si no puede cargar los anteriores lo marca y conserva el chat', async () => {
    falso.respuestas.set('sala:unirse', { sala, mensajes: [mensaje('b')], hayMas: true });
    mensajesAnteriores.mockRejectedValueOnce(new Error('sin red'));
    const { result } = renderHook(() => useSala('S1'));
    disparar('connect');
    await act(() => result.current.cargarAnteriores());
    expect(result.current.estado).toMatchObject({ anteriores: 'error', hayMas: true, mensajes: [{ id: 'b' }] });
  });
});
