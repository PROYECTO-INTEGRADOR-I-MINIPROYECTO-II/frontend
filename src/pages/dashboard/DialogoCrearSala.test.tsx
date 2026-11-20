import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../../api/base';
import DialogoCrearSala from './DialogoCrearSala';

const crearSala = vi.fn();
vi.mock('../../api/salas', async (original) => ({ ...(await original<typeof import('../../api/salas')>()), crearSala: (...a: unknown[]) => crearSala(...a) }));

const dibujar = () => {
  const alCerrar = vi.fn();
  const alCrear = vi.fn();
  render(<DialogoCrearSala alCerrar={alCerrar} alCrear={alCrear} />);
  return { alCerrar, alCrear };
};

beforeEach(() => {
  crearSala.mockReset();
});

describe('DialogoCrearSala (US-06)', () => {
  it('abre con el foco en el nombre', () => {
    dibujar();
    expect(screen.getByLabelText('Nombre')).toHaveFocus();
  });

  it('no deja crear sin nombre y lo explica junto al campo', async () => {
    dibujar();
    await userEvent.click(screen.getByRole('button', { name: 'Crear sala' }));
    expect(screen.getByText('Escribe el nombre de la sala.')).toBeInTheDocument();
    expect(screen.getByLabelText('Nombre')).toHaveAttribute('aria-invalid', 'true');
    expect(crearSala).not.toHaveBeenCalled();
  });

  it('rechaza nombres de más de 80 caracteres', async () => {
    dibujar();
    await userEvent.click(screen.getByLabelText('Nombre'));
    await userEvent.paste('x'.repeat(81));
    await userEvent.click(screen.getByRole('button', { name: 'Crear sala' }));
    expect(screen.getByText(/no puede superar 80 caracteres/)).toBeInTheDocument();
    expect(crearSala).not.toHaveBeenCalled();
  });

  it('crea la sala con el nombre y la descripción recortados y la entrega', async () => {
    const sala = { id: 'z1', nombre: 'Café', descripcion: 'Charla', uid: 'u', creado: '2026-01-01T00:00:00.000Z' };
    crearSala.mockResolvedValue(sala);
    const { alCrear } = dibujar();
    await userEvent.type(screen.getByLabelText('Nombre'), '  Café  ');
    await userEvent.type(screen.getByLabelText(/Descripción/), ' Charla ');
    await userEvent.click(screen.getByRole('button', { name: 'Crear sala' }));
    expect(crearSala).toHaveBeenCalledWith('Café', 'Charla');
    expect(alCrear).toHaveBeenCalledWith(sala);
  });

  it('si la API rechaza el nombre, el motivo sale junto al campo y se conserva lo escrito', async () => {
    crearSala.mockRejectedValue(new ApiError('El nombre no es válido.', 400, 'VALIDATION_ERROR', 'nombre'));
    dibujar();
    await userEvent.type(screen.getByLabelText('Nombre'), 'Algo');
    await userEvent.click(screen.getByRole('button', { name: 'Crear sala' }));
    expect(await screen.findByText('El nombre no es válido.')).toBeInTheDocument();
    expect(screen.getByLabelText('Nombre')).toHaveValue('Algo');
  });

  it('un fallo general se muestra como aviso y deja intentar de nuevo', async () => {
    crearSala.mockRejectedValue(new ApiError('No pudimos conectar con el servidor.', undefined, 'NETWORK'));
    dibujar();
    await userEvent.type(screen.getByLabelText('Nombre'), 'Algo');
    await userEvent.click(screen.getByRole('button', { name: 'Crear sala' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos conectar con el servidor.');
    expect(screen.getByRole('button', { name: 'Crear sala' })).toBeEnabled();
  });

  it('Esc cierra el diálogo', async () => {
    const { alCerrar } = dibujar();
    await userEvent.keyboard('{Escape}');
    expect(alCerrar).toHaveBeenCalled();
  });
});
