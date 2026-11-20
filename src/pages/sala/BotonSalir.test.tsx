import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import BotonSalir from './BotonSalir';

const dibujar = (alArmar?: (a: boolean) => void) =>
  render(
    <MemoryRouter initialEntries={['/salas/x']}>
      <Routes>
        <Route path="/salas/x" element={<BotonSalir alArmar={alArmar} />} />
        <Route path="/dashboard" element={<p>Mis salas</p>} />
      </Routes>
    </MemoryRouter>,
  );

describe('BotonSalir (salir en dos pasos)', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('un solo clic no sale: pide confirmar y lo anuncia', async () => {
    const alArmar = vi.fn();
    dibujar(alArmar);
    await userEvent.click(screen.getByRole('button', { name: 'Salir de la sala' }));
    expect(screen.getByRole('button', { name: 'Pulsa de nuevo para salir de la sala' })).toHaveTextContent('Click de nuevo para salir');
    expect(screen.getByRole('status')).toHaveTextContent('Pulsa de nuevo para salir');
    expect(screen.queryByText('Mis salas')).not.toBeInTheDocument();
    expect(alArmar).toHaveBeenLastCalledWith(true);
  });

  it('el segundo clic dentro de los 3,5 s sale al panel', async () => {
    dibujar();
    await userEvent.click(screen.getByRole('button', { name: 'Salir de la sala' }));
    await userEvent.click(screen.getByRole('button', { name: /Pulsa de nuevo/ }));
    expect(screen.getByText('Mis salas')).toBeInTheDocument();
  });

  it('pasado el plazo vuelve a ser la X y no sale', async () => {
    const alArmar = vi.fn();
    dibujar(alArmar);
    await userEvent.click(screen.getByRole('button', { name: 'Salir de la sala' }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3600);
    });
    expect(screen.getByRole('button', { name: 'Salir de la sala' })).toBeInTheDocument();
    expect(alArmar).toHaveBeenLastCalledWith(false);
    expect(screen.queryByText('Mis salas')).not.toBeInTheDocument();
  });
});
