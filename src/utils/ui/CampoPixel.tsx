import { useState } from 'react';
import { useFuenteCampos, type FuenteCampos } from '../../hooks/useFuenteCampos';
import BotonFuente from './BotonFuente';

// Campo de texto rectangular con la tipografía elegida en Ajustes (Press Start 2P de fábrica) y, junto a la etiqueta, el botón «Aa» que la
// cambia solo en ESTE campo. Es el campo para formularios con
// cuadro (nombre y descripción de una sala…); con `multilinea` es un área de texto. Etiqueta, ayuda y error van enlazados con
// aria-describedby; el error pone el borde en rojo y aria-invalid.
interface Props {
  id: string;
  etiqueta: string;
  valor: string;
  onCambio: (v: string) => void;
  error?: string;
  ayuda?: string;
  multilinea?: boolean;
  filas?: number;
  autoComplete?: string;
}

const FUENTE = { pixel: 'font-pixel text-[11px] leading-6', clara: 'font-sans text-base leading-6' } as const;

export default function CampoPixel({ id, etiqueta, valor, onCambio, error, ayuda, multilinea = false, filas = 3, autoComplete = 'off' }: Props) {
  const porDefecto = useFuenteCampos();
  const [propia, setPropia] = useState<FuenteCampos | null>(null);
  const clara = (propia ?? porDefecto) === 'clara';
  const describedBy = [error && `${id}-error`, ayuda && `${id}-ayuda`].filter(Boolean).join(' ') || undefined;
  const clase = `mt-1 w-full border-2 bg-fondo px-3 py-2 text-texto ${clara ? FUENTE.clara : FUENTE.pixel} ${error ? 'border-error' : 'border-texto'}`;
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="block font-pixel text-[11px] leading-5">{etiqueta}</label>
        <BotonFuente clara={clara} onAlternar={() => setPropia(clara ? 'pixel' : 'clara')} />
      </div>
      {multilinea ? (
        <textarea id={id} rows={filas} value={valor} onChange={(e) => onCambio(e.target.value)} aria-invalid={error ? true : undefined} aria-describedby={describedBy} className={`${clase} resize-y`} />
      ) : (
        <input id={id} type="text" value={valor} onChange={(e) => onCambio(e.target.value)} autoComplete={autoComplete} aria-invalid={error ? true : undefined} aria-describedby={describedBy} className={clase} />
      )}
      {error && <p id={`${id}-error`} className="mt-1 text-xs text-error">{error}</p>}
      {ayuda && <p id={`${id}-ayuda`} className="mt-1 text-xs text-texto-secundario">{ayuda}</p>}
    </div>
  );
}
