import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

// Campo de formulario único del producto: etiqueta (tipografía pixel), entrada, ayuda y error enlazados con aria-describedby.
// El error se marca con aria-invalid y borde rojo; la ayuda y el error se leen al enfocar el campo.
// Las contraseñas llevan un botón a la derecha de la etiqueta para mostrarlas u ocultarlas (aria-pressed).
interface Props {
  id: string;
  etiqueta: string;
  tipo: 'email' | 'password' | 'text';
  valor: string;
  onCambio: (v: string) => void;
  error?: string;
  ayuda?: string;
  autoComplete: string;
  /** Nombre accesible del botón de revelar (por defecto «Mostrar contraseña»). */
  etiquetaMostrar?: string;
}

export default function CampoTexto({ id, etiqueta, tipo, valor, onCambio, error, ayuda, autoComplete, etiquetaMostrar = 'Mostrar contraseña' }: Props) {
  const [visible, setVisible] = useState(false);
  const esClave = tipo === 'password';
  const describedBy = [error && `${id}-error`, ayuda && `${id}-ayuda`].filter(Boolean).join(' ') || undefined;
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="block font-monokuro text-[11px] leading-5">{etiqueta}</label>
        {esClave && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-pressed={visible}
            aria-label={etiquetaMostrar}
            title={visible ? 'Ocultar' : 'Mostrar'}
            className="-my-1 p-1 hover:text-acento-claro"
          >
            {visible ? <EyeOff aria-hidden="true" className="size-4" /> : <Eye aria-hidden="true" className="size-4" />}
          </button>
        )}
      </div>
      <input
        id={id}
        type={esClave && visible ? 'text' : tipo}
        value={valor}
        onChange={(e) => onCambio(e.target.value)}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`mt-1 w-full border-2 bg-fondo px-3 py-2 text-texto ${error ? 'border-error' : 'border-texto'}`}
      />
      {error && <p id={`${id}-error`} className="mt-1 text-xs text-error">{error}</p>}
      {ayuda && <p id={`${id}-ayuda`} className="mt-1 text-xs text-texto-secundario">{ayuda}</p>}
    </div>
  );
}
