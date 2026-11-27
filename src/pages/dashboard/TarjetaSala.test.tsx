import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import type { Sala } from '../../api/salas';
import TarjetaSala from './TarjetaSala';

const sala: Sala = { id: 'abc123', nombre: 'Estudio de cálculo', descripcion: 'Repaso del parcial', uid: 'u1', creado: '2026-11-19T10:00:00.000Z' };
const dibujar = (numero?: number, alCopiar = vi.fn()) =>
  render(
    <MemoryRouter>
      <ul>
        <TarjetaSala sala={sala} numero={numero} alCopiar={alCopiar} alEditar={() => {}} alEliminar={() => {}} />
      </ul>
    </MemoryRouter>,
  );

describe('TarjetaSala', () => {
  it('muestra el nombre, el ID y un enlace para entrar a la sala', () => {
    dibujar(1);
    expect(screen.getByRole('heading', { name: 'Estudio de cálculo' })).toBeInTheDocument();
    expect(screen.getByText('abc123')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Entrar a la sala Estudio de cálculo/ })).toHaveAttribute('href', '/salas/abc123');
  });

  it('declara el atajo numérico y, sin número, no declara ninguno', () => {
    const { unmount } = dibujar(3);
    expect(screen.getByRole('link', { name: /Entrar/ })).toHaveAttribute('aria-keyshortcuts', '3');
    unmount();
    dibujar(undefined);
    expect(screen.getByRole('link', { name: /Entrar/ })).not.toHaveAttribute('aria-keyshortcuts');
  });

  it('al pulsar el ID se pide copiarlo', async () => {
    const alCopiar = vi.fn();
    dibujar(1, alCopiar);
    await userEvent.click(screen.getByRole('button', { name: /Copiar el ID/ }));
    expect(alCopiar).toHaveBeenCalledWith(sala);
  });

  it('el detalle empieza plegado y se despliega con su botón', async () => {
    dibujar(1);
    const boton = screen.getByRole('button', { name: /detalles de la sala/ });
    expect(boton).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(boton);
    expect(boton).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Repaso del parcial')).toBeVisible();
  });
});
