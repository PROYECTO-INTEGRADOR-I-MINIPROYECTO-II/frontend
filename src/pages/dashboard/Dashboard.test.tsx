import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../../api/base';
import type { Sala } from '../../api/salas';
import Dashboard from './Dashboard';

const listarSalas = vi.fn();
const crearSala = vi.fn();
vi.mock('../../api/salas', async (original) => ({
  ...(await original<typeof import('../../api/salas')>()),
  listarSalas: () => listarSalas(),
  crearSala: (...a: unknown[]) => crearSala(...a),
}));

const sala = (n: number): Sala => ({ id: `id${n}`, nombre: `Sala ${n}`, descripcion: '', uid: 'u', creado: '2026-11-19T10:00:00.000Z' });
const dibujar = () =>
  render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/salas/:id" element={<p>Dentro de la sala</p>} />
      </Routes>
    </MemoryRouter>,
  );

beforeEach(() => {
  listarSalas.mockReset();
  crearSala.mockReset();
});

describe('Dashboard «Mis salas» (US-06)', () => {
  it('muestra el estado de carga y luego el mensaje amigable si no hay salas', async () => {
    listarSalas.mockResolvedValue([]);
    dibujar();
    expect(screen.getByText(/Cargando tus salas/)).toBeInTheDocument();
    expect(await screen.findByText('Aún no tienes salas')).toBeInTheDocument();
  });

  it('lista las salas con su nombre e ID', async () => {
    listarSalas.mockResolvedValue([sala(1), sala(2)]);
    dibujar();
    expect(await screen.findByRole('heading', { name: 'Sala 1' })).toBeInTheDocument();
    expect(screen.getByText('id2')).toBeInTheDocument();
  });

  it('si falla la carga muestra el error y permite reintentar', async () => {
    listarSalas.mockRejectedValueOnce(new ApiError('Sin conexión.', undefined, 'NETWORK')).mockResolvedValueOnce([sala(1)]);
    dibujar();
    expect(await screen.findByRole('alert')).toHaveTextContent('Sin conexión.');
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(await screen.findByRole('heading', { name: 'Sala 1' })).toBeInTheDocument();
  });

  it('copiar el ID lo copia y lo anuncia', async () => {
    listarSalas.mockResolvedValue([sala(1)]);
    const escribir = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: escribir } });
    dibujar();
    await userEvent.click(await screen.findByRole('button', { name: /Copiar el ID/ }));
    expect(escribir).toHaveBeenCalledWith('id1');
    expect(await screen.findByText(/copiado/)).toBeInTheDocument();
  });

  it('una tecla del 1 al 9 entra a esa sala; si no existe, no hace nada', async () => {
    listarSalas.mockResolvedValue([sala(1), sala(2)]);
    dibujar();
    await screen.findByRole('heading', { name: 'Sala 2' });
    await userEvent.keyboard('9');
    expect(screen.queryByText('Dentro de la sala')).not.toBeInTheDocument();
    await userEvent.keyboard('2');
    expect(await screen.findByText('Dentro de la sala')).toBeInTheDocument();
  });

  it('crear una sala lleva a ella (como anfitrión)', async () => {
    listarSalas.mockResolvedValue([]);
    crearSala.mockResolvedValue(sala(7));
    dibujar();
    await userEvent.click(await screen.findByRole('button', { name: /Crear sala/ }));
    await userEvent.type(screen.getByLabelText('Nombre'), 'Sala 7');
    await userEvent.click(screen.getAllByRole('button', { name: 'Crear sala' }).at(-1)!);
    await waitFor(() => expect(screen.getByText('Dentro de la sala')).toBeInTheDocument());
    expect(crearSala).toHaveBeenCalledWith('Sala 7', '');
  });
});
