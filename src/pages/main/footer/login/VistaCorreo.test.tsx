import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import VistaCorreo from './VistaCorreo';

const dibujar = (alContinuar = vi.fn()) => {
  render(<VistaCorreo inicial="" actual="ana@correo.com" alContinuar={alContinuar} opciones={<button type="submit">Continuar</button>} />);
  return alContinuar;
};

describe('VistaCorreo (US-04: cambiar el correo)', () => {
  it('un correo mal formado muestra el error y no continúa', async () => {
    const alContinuar = dibujar();
    await userEvent.type(screen.getByLabelText('Correo nuevo'), 'mal{Enter}');
    expect(screen.getByLabelText('Correo nuevo')).toHaveAttribute('aria-invalid', 'true');
    expect(alContinuar).not.toHaveBeenCalled();
  });

  it('el mismo correo (aunque cambien las mayúsculas) se rechaza con un mensaje claro', async () => {
    const alContinuar = dibujar();
    await userEvent.type(screen.getByLabelText('Correo nuevo'), 'ANA@correo.com{Enter}');
    expect(screen.getByText('Ese ya es tu correo. Escribe uno distinto.')).toBeInTheDocument();
    expect(alContinuar).not.toHaveBeenCalled();
  });

  it('un correo distinto y válido pasa a la confirmación', async () => {
    const alContinuar = dibujar();
    await userEvent.type(screen.getByLabelText('Correo nuevo'), ' nueva@correo.com {Enter}');
    expect(alContinuar).toHaveBeenCalledWith('nueva@correo.com');
  });
});
