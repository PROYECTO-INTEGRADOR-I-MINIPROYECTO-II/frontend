import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import CampoClave from './CampoClave';
import { crearOrden } from './iconosClave';

// Campo de formulario único del producto: etiqueta (tipografía pixel), entrada, ayuda y error enlazados con aria-describedby.
// El error se marca con aria-invalid y borde rojo; la ayuda y el error se leen al enfocar el campo.
// Las contraseñas llevan un botón a la derecha de la etiqueta para mostrarlas u ocultarlas (aria-pressed); ocultas se dibujan con
// un icono pixel distinto por carácter (CampoClave) en lugar de puntos.
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

// Con la contraseña revelada el texto va más grande (los iconos miden 16 px y Geist a 16 px se ve menor). Chrome no deja que un
// <input> sea más bajo que la línea normal de su fuente, así que el campo de contraseña tiene altura fija (`h-10`) para que no
// salte al mostrar u ocultar.
const CLASE_CAMPO = (error: boolean, clave: boolean, revelada: boolean) =>
  `w-full border-2 bg-fondo px-3 py-2 text-texto ${clave ? 'h-10' : ''} ${revelada ? 'text-[1.05rem]' : ''} ${error ? 'border-error' : 'border-texto'}`;

export default function CampoTexto({ id, etiqueta, tipo, valor, onCambio, error, ayuda, autoComplete, etiquetaMostrar = 'Mostrar contraseña' }: Props) {
  const [visible, setVisible] = useState(false);
  const [orden] = useState(() => (tipo === 'password' ? crearOrden() : [])); // un orden de iconos por campo, estable al mostrar u ocultar
  const esClave = tipo === 'password';
  const describedBy = [error && `${id}-error`, ayuda && `${id}-ayuda`].filter(Boolean).join(' ') || undefined;
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="block font-pixel text-[11px] leading-5">{etiqueta}</label>
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
      {esClave && !visible ? (
        // Oculta: un icono distinto por cada carácter, en lugar de puntos.
        <CampoClave id={id} valor={valor} onCambio={onCambio} autoComplete={autoComplete} invalido={!!error} describedBy={describedBy} className={CLASE_CAMPO(!!error, true, false)} orden={orden} />
      ) : (
        <input
          id={id}
          type={esClave ? 'text' : tipo}
          value={valor}
          onChange={(e) => onCambio(e.target.value)}
          autoComplete={autoComplete}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`mt-1 ${CLASE_CAMPO(!!error, esClave, esClave)}`}
        />
      )}
      {error && <p id={`${id}-error`} className="mt-1 text-xs text-error">{error}</p>}
      {ayuda && <p id={`${id}-ayuda`} className="mt-1 text-xs text-texto-secundario">{ayuda}</p>}
    </div>
  );
}
