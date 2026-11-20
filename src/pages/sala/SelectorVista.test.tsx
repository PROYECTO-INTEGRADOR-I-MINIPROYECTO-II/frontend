import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import type { Diseno } from './anclas';
import SelectorVista from './SelectorVista';

function Prueba() {
  const [d, setD] = useState<Diseno>('cuadricula');
  return <SelectorVista diseno={d} alCambiar={setD} />;
}

describe('SelectorVista', () => {
  it('muestra la inicial del diseño y su nombre completo en el globo', () => {
    render(<Prueba />);
    const boton = screen.getByRole('button', { name: /Vista: Cuadrícula/ });
    expect(boton).toHaveTextContent('C');
    expect(screen.getByRole('presentation')).toHaveTextContent('Cuadrícula');
  });

  it('cada clic pasa al siguiente diseño y da la vuelta: C → O → P → C', async () => {
    render(<Prueba />);
    const letra = () => screen.getByRole('button', { name: /^Vista:/ }).textContent;
    await userEvent.click(screen.getByRole('button', { name: /^Vista:/ }));
    expect(letra()).toBe('O');
    await userEvent.click(screen.getByRole('button', { name: /^Vista:/ }));
    expect(letra()).toBe('P');
    await userEvent.click(screen.getByRole('button', { name: /^Vista:/ }));
    expect(letra()).toBe('C');
  });

  it('el nombre accesible dice el diseño actual y el siguiente', async () => {
    render(<Prueba />);
    expect(screen.getByRole('button', { name: 'Vista: Cuadrícula. Pulsa para cambiar a Orador.' })).toBeInTheDocument();
  });
});
