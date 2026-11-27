import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../../api/base';
import type { Sala } from '../../api/salas';
import Dashboard from './Dashboard';

const listarSalas = vi.fn();
const editarSala = vi.fn();
const eliminarSala = vi.fn();
vi.mock('../../api/salas', async (original) => ({
  ...(await original<typeof import('../../api/salas')>()),
  listarSalas: () => listarSalas(),
  editarSala: (...a: unknown[]) => editarSala(...a),
  eliminarSala: (id: string) => eliminarSala(id),
}));

const sala: Sala = { id: 'abc', nombre: 'Cálculo', descripcion: 'Parcial', uid: 'u', creado: '2026-11-19T10:00:00.000Z' };
const abrirTarjeta = async () => {
  render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>,
  );
  await userEvent.click(await screen.findByRole('button', { name: /detalles de la sala/ }));
};

beforeEach(() => {
  listarSalas.mockReset().mockResolvedValue([sala]);
  editarSala.mockReset();
  eliminarSala.mockReset();
});

describe('Editar y eliminar desde «Mis salas» (US-07)', () => {
  it('editar guarda el nombre nuevo, lo muestra y lo confirma', async () => {
    editarSala.mockResolvedValue({ ...sala, nombre: 'Cálculo II' });
    await abrirTarjeta();
    await userEvent.click(screen.getByRole('button', { name: 'Editar la sala Cálculo' }));
    const dialogo = screen.getByRole('dialog', { name: 'Editar sala' });
    const nombre = within(dialogo).getByLabelText('Nombre');
    expect(nombre).toHaveValue('Cálculo');
    await userEvent.clear(nombre);
    await userEvent.type(nombre, 'Cálculo II');
    await userEvent.click(within(dialogo).getByRole('button', { name: 'Guardar' }));
    expect(editarSala).toHaveBeenCalledWith('abc', 'Cálculo II', 'Parcial');
    expect(await screen.findByRole('heading', { name: 'Cálculo II' })).toBeInTheDocument();
    expect(screen.getByText('Cambios guardados en «Cálculo II».')).toBeInTheDocument();
  });

  it('si no puede guardar muestra el motivo, conserva lo escrito y deja reintentar', async () => {
    editarSala.mockRejectedValue(new ApiError('Solo el anfitrión puede editar o eliminar la sala.', 403, 'FORBIDDEN'));
    await abrirTarjeta();
    await userEvent.click(screen.getByRole('button', { name: 'Editar la sala Cálculo' }));
    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }));
    expect(await screen.findByText('Solo el anfitrión puede editar o eliminar la sala.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeEnabled();
    expect(screen.getByLabelText('Nombre')).toHaveValue('Cálculo');
  });

  it('eliminar pide dos clics y quita la sala de la lista', async () => {
    eliminarSala.mockResolvedValue(undefined);
    await abrirTarjeta();
    await userEvent.click(screen.getByRole('button', { name: 'Eliminar la sala Cálculo' }));
    expect(eliminarSala).not.toHaveBeenCalled();
    expect(screen.getByText(/Se borrará el chat/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Clic de nuevo para eliminar' }));
    expect(eliminarSala).toHaveBeenCalledWith('abc');
    expect(await screen.findByText('Sala «Cálculo» eliminada.')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Cálculo' })).not.toBeInTheDocument();
  });

  it('Esc desarma el borrado', async () => {
    await abrirTarjeta();
    await userEvent.click(screen.getByRole('button', { name: 'Eliminar la sala Cálculo' }));
    await userEvent.keyboard('{Escape}');
    expect(screen.getByRole('button', { name: 'Eliminar la sala Cálculo' })).toHaveTextContent('Eliminar sala');
    expect(eliminarSala).not.toHaveBeenCalled();
  });
});
