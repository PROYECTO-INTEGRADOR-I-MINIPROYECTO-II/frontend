import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';

// Botón único del producto (marco recto, tipografía pixel). Con `to` se dibuja como enlace con el mismo aspecto.
//   primario: relleno blanco (la acción principal) · secundario: solo marco · peligro: acciones destructivas.
// Al apuntarlo o enfocarlo invierte colores. Ejemplo: <Boton variante="secundario" onClick={…}>Reintentar</Boton>
type Variante = 'primario' | 'secundario' | 'peligro';
type Tamano = 'normal' | 'grande';

const BASE = 'inline-flex items-center justify-center gap-3 border-2 font-pixel text-xs leading-5';
const VARIANTES: Record<Variante, string> = {
  primario: 'border-texto bg-texto text-fondo hover:bg-fondo hover:text-texto focus-visible:bg-fondo focus-visible:text-texto',
  secundario: 'border-texto bg-fondo text-texto hover:bg-texto hover:text-fondo focus-visible:bg-texto focus-visible:text-fondo',
  peligro: 'border-error bg-fondo text-error hover:bg-error hover:text-fondo focus-visible:bg-error focus-visible:text-fondo',
};
const TAMANOS: Record<Tamano, string> = { normal: 'px-6 py-3', grande: 'w-full px-4 py-4' };

interface Comun {
  variante?: Variante;
  tamano?: Tamano;
  /** Muestra el texto en minúsculas (solo visual; el DOM conserva el original). */
  minusculas?: boolean;
  className?: string;
  children: ReactNode;
}
type ComoBoton = Comun & Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof Comun> & { to?: undefined };
type ComoEnlace = Comun & { to: string };

export default function Boton(props: ComoBoton | ComoEnlace) {
  const { variante = 'secundario', tamano = 'normal', minusculas = false, className = '', children } = props;
  const clases = `${BASE} ${VARIANTES[variante]} ${TAMANOS[tamano]} ${minusculas ? 'lowercase' : ''} ${className}`;
  if (props.to !== undefined) {
    return <Link to={props.to} className={clases}>{children}</Link>;
  }
  const { variante: _v, tamano: _t, minusculas: _m, className: _c, children: _h, to: _to, ...resto } = props;
  return (
    <button type="button" {...resto} className={clases}>
      {children}
    </button>
  );
}
