import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Sala } from '../../realtime/tipos';
import InfoSala from './InfoSala';

const sala: Sala = { id: 'Bk4qz5SnvNM3PDTxYu2n', nombre: 'Repaso de física cuántica avanzada', descripcion: 'Parcial', uid: 'u1', creado: '2026-11-19T10:00:00.000Z' };

describe('InfoSala', () => {
  it('muestra el nombre completo, el ID, la descripción y el rol', () => {
    render(<InfoSala sala={sala} esAnfitrion integrantes={2} alCerrar={() => {}} />);
    expect(screen.getByRole('dialog', { name: 'Información de la sala' })).toBeInTheDocument();
    expect(screen.getByText('Repaso de física cuántica avanzada')).toBeInTheDocument();
    expect(screen.getByText(sala.id)).toBeInTheDocument();
    expect(screen.getByText(/Eres el anfitrión/)).toBeInTheDocument();
    expect(screen.getByText(/2 personas conectadas/)).toBeInTheDocument();
  });

  it('el foco entra en «Copiar ID», que copia el ID y lo anuncia', async () => {
    const escribir = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: escribir } });
    render(<InfoSala sala={sala} esAnfitrion={false} integrantes={1} alCerrar={() => {}} />);
    expect(screen.getByRole('button', { name: 'Copiar ID' })).toHaveFocus();
    await userEvent.click(screen.getByRole('button', { name: 'Copiar ID' }));
    expect(escribir).toHaveBeenCalledWith(sala.id);
    expect(await screen.findByText('ID copiado.')).toBeInTheDocument();
    expect(screen.getByText(/1 persona conectada/)).toBeInTheDocument();
  });

  it('Esc cierra el popup', async () => {
    const alCerrar = vi.fn();
    render(<InfoSala sala={sala} esAnfitrion integrantes={1} alCerrar={alCerrar} />);
    await userEvent.keyboard('{Escape}');
    expect(alCerrar).toHaveBeenCalled();
  });
});
