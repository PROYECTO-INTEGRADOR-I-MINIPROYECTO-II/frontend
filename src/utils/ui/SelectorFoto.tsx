import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { PixelIcon } from '../retro/PixelIcon';

// Foto de perfil: un círculo con las iniciales (en Geist) o la foto. Al apuntarlo o enfocarlo se tiñe del color de acento y las
// iniciales dan paso a una cámara pixel art; al pulsarlo se elige una imagen. Sirve igual si la cuenta de Google ya trae foto o no.
// Valida el tipo y el peso; la subida real (API) llega en el Sprint 1.
export type EstadoFoto = 'sin' | 'ok' | 'error';
const TIPOS = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_MB = 2;

interface Props {
  iniciales: string;
  /** Foto que ya existe (p. ej. la de la cuenta de Google). */
  fotoInicial?: string | null;
  onEstado?: (e: EstadoFoto) => void;
  /** Avisa de la foto elegida (URL de vista previa) o null si no hay. */
  onUrl?: (url: string | null) => void;
  /** Va entre el círculo y la ayuda (p. ej. el nombre completo). */
  children?: ReactNode;
}

export default function SelectorFoto({ iniciales, fotoInicial = null, onEstado, onUrl, children }: Props) {
  const id = useId();
  const archivo = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState<string | null>(fotoInicial);
  const [error, setError] = useState('');
  const propia = useRef<string | null>(null); // URL creada aquí (se libera al cambiar o al salir)

  useEffect(() => onEstado?.(error ? 'error' : url ? 'ok' : 'sin'), [url, error, onEstado]);
  useEffect(() => onUrl?.(url), [url, onUrl]);
  useEffect(() => () => {
    if (propia.current) URL.revokeObjectURL(propia.current);
  }, []);

  function alElegir(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = ''; // permite volver a elegir el mismo archivo
    if (!f) return;
    if (!TIPOS.includes(f.type)) return setError('Usa una imagen JPG, PNG o WebP.');
    if (f.size > MAX_MB * 1024 * 1024) return setError(`La imagen pesa más de ${MAX_MB} MB. Elige una más liviana.`);
    if (propia.current) URL.revokeObjectURL(propia.current);
    propia.current = URL.createObjectURL(f);
    setError('');
    setUrl(propia.current);
  }

  return (
    <div className="grid justify-items-center gap-1.5">
      <button
        type="button"
        onClick={() => archivo.current?.click()}
        aria-label={url ? 'Cambiar foto de perfil' : 'Elegir foto de perfil'}
        aria-describedby={`${id}-ayuda`}
        className="group relative grid size-28 place-items-center overflow-hidden rounded-full border-2 border-texto bg-fondo text-texto hover:border-acento-claro focus-visible:border-acento-claro"
      >
        {url ? (
          <img src={url} alt="" className="size-full object-cover" />
        ) : (
          <span aria-hidden="true" className="font-sans text-4xl font-semibold">{iniciales || '?'}</span>
        )}
        {/* Al apuntar o enfocar: el círculo se tiñe de acento y aparece la cámara. */}
        <span aria-hidden="true" className="absolute inset-0 hidden place-items-center bg-acento group-hover:grid group-focus-visible:grid">
          <svg viewBox="0 0 22 22" className="size-14 fill-texto">
            <PixelIcon nombre="fotoCamara" x={11} y={11} escala={2} />
          </svg>
        </span>
      </button>
      <input ref={archivo} type="file" accept={TIPOS.join(',')} onChange={alElegir} tabIndex={-1} aria-hidden="true" className="sr-only" />
      {children}
      <p id={`${id}-ayuda`} className="text-xs text-texto-secundario">Pulsa el círculo para elegir una imagen (JPG, PNG o WebP, hasta {MAX_MB} MB).</p>
      <div aria-live="polite">{error && <p className="text-center text-xs text-error">{error}</p>}</div>
    </div>
  );
}
