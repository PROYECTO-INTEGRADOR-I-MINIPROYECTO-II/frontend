import type { ReactNode } from 'react';

// Aviso al usuario. Los errores se anuncian al instante (role="alert"); el resto de forma amable (role="status").
// Sin contenido sigue en el DOM como región viva vacía, para que lo que se escriba después se anuncie.
type Tipo = 'error' | 'exito' | 'info';
const COLOR_TITULO: Record<Tipo, string> = { error: 'text-error', exito: 'text-exito', info: 'text-texto' };

export default function Mensaje({
  tipo,
  titulo,
  className = '',
  children,
}: {
  tipo: Tipo;
  titulo?: ReactNode;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div role={tipo === 'error' ? 'alert' : 'status'} className={className}>
      {titulo && <p className={COLOR_TITULO[tipo]}>{titulo}</p>}
      {children && <div className={titulo ? 'mt-2 text-sm text-texto-secundario' : 'text-xs text-texto-secundario'}>{children}</div>}
    </div>
  );
}
