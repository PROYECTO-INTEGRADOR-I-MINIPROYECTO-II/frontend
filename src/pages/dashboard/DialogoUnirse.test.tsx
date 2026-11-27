import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../../api/base';
import DialogoUnirse from './DialogoUnirse';

const obtenerSala = vi.fn();
vi.mock('../../api/salas', async (original) => ({
  ...(await original<typeof import('../../api/salas')>()),
  obtenerSala: (id: string) => obtenerSala(id),
}));

const dibujar = () =>
  render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route path="/dashboard" element={<DialogoUnirse alCerrar={() => {}} />} />
        <Route path="/salas/:id" element={<p>Dentro de la sala</p>} />
      </Routes>
    </MemoryRouter>,
  );
const campo = () => screen.getByLabelText('ID de la sala');

beforeEach(() => {
  obtenerSala.mockReset();
});

describe('Unirse a una sala (US-08)', () => {
  it('recorta los espacios, respeta las mayúsculas y entra si la sala existe', async () => {
    obtenerSala.mockResolvedValue({});
    dibujar();
    await userEvent.type(campo(), '  AbC123  {Enter}');
    expect(obtenerSala).toHaveBeenCalledWith('AbC123');
    expect(await screen.findByText('Dentro de la sala')).toBeInTheDocument();
  });

  it.each(['', '   ', 'abc 123', 'abc-123'])('con «%s» avisa sin consultar al servidor', async (texto) => {
    dibujar();
    if (texto) await userEvent.type(campo(), texto);
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));
    expect(screen.getByRole('alert')).toHaveTextContent('solo letras y números, sin espacios');
    expect(campo()).toHaveAttribute('aria-invalid', 'true');
    expect(obtenerSala).not.toHaveBeenCalled();
  });

  it('si no existe lo dice junto al campo y conserva lo escrito', async () => {
    obtenerSala.mockRejectedValue(new ApiError('La sala no existe. Revisa el ID.', 404, 'NOT_FOUND'));
    dibujar();
    await userEvent.type(campo(), 'noExiste{Enter}');
    expect(await screen.findByRole('alert')).toHaveTextContent('Sala no encontrada');
    expect(campo()).toHaveValue('noExiste');
    expect(screen.queryByText('Dentro de la sala')).not.toBeInTheDocument();
  });

  it('mientras consulta muestra «Conectando a la Sala…» y no deja enviar dos veces', async () => {
    obtenerSala.mockReturnValue(new Promise(() => {}));
    dibujar();
    await userEvent.type(campo(), 'abc{Enter}{Enter}');
    expect(screen.getByText('Conectando a la Sala…')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Entrando…' })).toBeDisabled();
    expect(obtenerSala).toHaveBeenCalledTimes(1);
  });
});
