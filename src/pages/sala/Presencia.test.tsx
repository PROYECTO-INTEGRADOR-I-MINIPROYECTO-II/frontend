import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Novedad } from '../../realtime/tipos';
import { Anunciador, AvisoPresencia } from './Presencia';

const novedad = (n: number, tipo: Novedad['tipo'], nombre: string, uid = 'u2', creado = new Date().toISOString()): Novedad => ({ n, tipo, nombre, uid, creado, texto: tipo === 'mensaje' ? 'Hola' : undefined });

describe('Anuncios de la sala (S3-C09)', () => {
  it('anuncia mensajes (autor, hora y texto), entradas y salidas, sin repetir los mensajes propios', () => {
    render(<Anunciador miUid="yo" novedades={[novedad(1, 'mensaje', 'Ana'), novedad(2, 'entra', 'Marta'), novedad(3, 'sale', 'Luis'), novedad(4, 'mensaje', 'Yo mismo', 'yo')]} />);
    const registro = screen.getByRole('log', { name: 'Avisos de la sala' });
    expect(registro).toHaveAttribute('aria-live', 'polite');
    expect(registro).toHaveTextContent(/Ana, .*\d.*: Hola/);
    expect(registro).toHaveTextContent('Marta entró a la sala.');
    expect(registro).toHaveTextContent('Luis salió de la sala.');
    expect(registro).not.toHaveTextContent('Yo mismo');
  });

  it('el aviso visual muestra lo recién ocurrido y no repite lo viejo', () => {
    const { unmount } = render(<AvisoPresencia ultima={novedad(1, 'entra', 'Marta')} />);
    expect(screen.getByText(/entra Marta/)).toBeInTheDocument();
    unmount();
    render(<AvisoPresencia ultima={novedad(2, 'entra', 'Marta', 'u2', '2026-01-01T00:00:00.000Z')} />);
    expect(screen.queryByText(/entra Marta/)).not.toBeInTheDocument();
  });
});
