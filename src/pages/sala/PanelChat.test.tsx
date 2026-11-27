import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Mensaje } from '../../realtime/tipos';
import PanelChat from './PanelChat';

const msg = (id: string, autor: string, texto: string, uid: string | null = 'u2'): Mensaje => ({ id, salaId: 's', uid, autor, texto, creado: '2026-11-19T18:31:00.000Z' });

describe('PanelChat', () => {
  it('sin mensajes invita a escribir el primero', () => {
    render(<PanelChat mensajes={[]} miUid="u1" conectado enviar={vi.fn()} clara={false} />);
    expect(screen.getByText('Aún no hay mensajes. Escribe el primero.')).toBeInTheDocument();
  });

  it('muestra los mensajes en un registro con su autor', () => {
    render(<PanelChat mensajes={[msg('1', 'ana', 'Hola'), msg('2', 'yo', 'Buenas', 'u1')]} miUid="u1" conectado enviar={vi.fn()} clara />);
    const registro = screen.getByRole('log', { name: 'Mensajes de la sala' });
    expect(registro).toHaveTextContent('Hola');
    expect(registro).toHaveTextContent('Buenas');
  });

  it('Enter envía el mensaje recortado y vacía el campo', async () => {
    const enviar = vi.fn().mockResolvedValue(null);
    render(<PanelChat mensajes={[]} miUid="u1" conectado enviar={enviar} clara />);
    await userEvent.type(screen.getByLabelText('Escribe un mensaje'), '  Hola a todos  {Enter}');
    expect(enviar).toHaveBeenCalledWith('Hola a todos');
    expect(screen.getByLabelText('Escribe un mensaje')).toHaveValue('');
  });

  it('el botón de enviar está desactivado sin texto o sin conexión', async () => {
    const { rerender } = render(<PanelChat mensajes={[]} miUid="u1" conectado enviar={vi.fn()} clara />);
    expect(screen.getByRole('button', { name: 'Enviar mensaje' })).toBeDisabled();
    await userEvent.type(screen.getByLabelText('Escribe un mensaje'), 'Hola');
    expect(screen.getByRole('button', { name: 'Enviar mensaje' })).toBeEnabled();
    rerender(<PanelChat mensajes={[]} miUid="u1" conectado={false} enviar={vi.fn()} clara />);
    expect(screen.getByRole('button', { name: 'Enviar mensaje' })).toBeDisabled();
  });

  it('si no se pudo enviar, muestra el motivo y conserva el texto', async () => {
    const enviar = vi.fn().mockResolvedValue('Sin conexión con la sala.');
    render(<PanelChat mensajes={[]} miUid="u1" conectado enviar={enviar} clara />);
    await userEvent.type(screen.getByLabelText('Escribe un mensaje'), 'Hola{Enter}');
    expect(await screen.findByRole('alert')).toHaveTextContent('Sin conexión con la sala.');
    expect(screen.getByLabelText('Escribe un mensaje')).toHaveValue('Hola');
  });

  it('si se están leyendo mensajes de arriba, avisa de los nuevos sin mover la lista (US-10)', async () => {
    const props = { miUid: 'u1', conectado: true, enviar: vi.fn(), clara: true };
    const { rerender } = render(<PanelChat {...props} mensajes={[msg('1', 'ana', 'Hola')]} />);
    const lista = screen.getByRole('log');
    Object.defineProperties(lista, { scrollHeight: { configurable: true, value: 500 }, clientHeight: { configurable: true, value: 100 } });
    lista.scrollTop = 400;
    fireEvent.scroll(lista);
    lista.scrollTop = 50;
    fireEvent.scroll(lista);
    rerender(<PanelChat {...props} mensajes={[msg('1', 'ana', 'Hola'), msg('2', 'ana', '¿Siguen?')]} />);
    expect(lista.scrollTop).toBe(50);
    await userEvent.click(screen.getByRole('button', { name: '1 mensaje nuevo' }));
    expect(lista.scrollTop).toBe(500);
    expect(screen.queryByRole('button', { name: /mensaje nuevo/ })).not.toBeInTheDocument();
  });

  it('que la lista encoja no cuenta como estar leyendo arriba: sigue los mensajes nuevos', () => {
    const props = { miUid: 'u1', conectado: true, enviar: vi.fn(), clara: true };
    const { rerender } = render(<PanelChat {...props} mensajes={[msg('1', 'ana', 'Hola')]} />);
    const lista = screen.getByRole('log');
    const medidas = (clientHeight: number) => Object.defineProperties(lista, { scrollHeight: { configurable: true, value: 500 }, clientHeight: { configurable: true, value: clientHeight } });
    medidas(100);
    lista.scrollTop = 400;
    fireEvent.scroll(lista);
    medidas(60); // aparece un aviso encima
    fireEvent.scroll(lista);
    rerender(<PanelChat {...props} mensajes={[msg('1', 'ana', 'Hola'), msg('2', 'ana', '¿Siguen?')]} />);
    expect(screen.queryByRole('button', { name: /mensaje nuevo/ })).not.toBeInTheDocument();
    expect(lista.scrollTop).toBe(500);
  });

  it('muestra quién fue entrando, en orden con los mensajes', () => {
    const entrada = { n: 1, tipo: 'entra' as const, uid: 'u3', nombre: 'Marta', creado: '2026-11-19T18:32:00.000Z' };
    render(<PanelChat mensajes={[msg('1', 'ana', 'Hola')]} entradas={[entrada]} miUid="u1" conectado enviar={vi.fn()} clara />);
    expect(screen.getByRole('log')).toHaveTextContent(/Hola.*Marta entra/);
  });
});
