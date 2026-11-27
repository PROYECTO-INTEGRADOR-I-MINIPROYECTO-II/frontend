import { act, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import SalaEliminada from './SalaEliminada';

describe('Sala eliminada (US-07)', () => {
  beforeEach(() => void vi.useFakeTimers());
  afterEach(() => void vi.useRealTimers());

  it('avisa y vuelve a «Mis salas» a los 5 segundos', async () => {
    render(
      <MemoryRouter initialEntries={['/salas/x']}>
        <Routes>
          <Route path="/salas/x" element={<SalaEliminada nombre="Cálculo" />} />
          <Route path="/dashboard" element={<p>Mis salas</p>} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('El anfitrión eliminó «Cálculo».');
    expect(screen.getByRole('link', { name: 'Volver ahora' })).toHaveAttribute('href', '/dashboard');
    expect(screen.getByText('Volviendo en 5…')).toBeInTheDocument();
    for (let i = 0; i < 5; i++) await act(async () => void (await vi.advanceTimersByTimeAsync(1000)));
    expect(screen.getByText('Mis salas')).toBeInTheDocument();
  });
});
