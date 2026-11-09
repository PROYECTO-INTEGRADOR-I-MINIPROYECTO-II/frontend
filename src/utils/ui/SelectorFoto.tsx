import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { PixelIcon } from '../retro/PixelIcon';

// Foto de perfil: un círculo con las iniciales (en Geist) o la foto. Al apuntarlo o enfocarlo se tiñe del color de acento y las
// iniciales dan paso a una cámara pixel art; al pulsarlo se elige una imagen. Sirve igual si la cuenta de Google ya trae foto o no.
// Valida el tipo y el peso. La vista previa es un blob:; `fotoParaApi` lo convierte en la imagen que se envía a la API.
export type EstadoFoto = 'sin' | 'ok' | 'error';
const TIPOS = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_MB = 2;

const FOTO_MAX_PX = 256; // lado mayor de la foto enviada
const FOTO_MAX_CHARS = 100_000; // tope de la API

/** Foto lista para la API: un blob: (vista previa) se reduce a 256 px y pasa a data:image/webp;base64 (o jpeg); una URL https o null se envía tal cual. */
export async function fotoParaApi(url: string | null): Promise<string | null> {
  if (!url?.startsWith('blob:')) return url;
  const imagen = await createImageBitmap(await (await fetch(url)).blob());
  const escala = Math.min(1, FOTO_MAX_PX / Math.max(imagen.width, imagen.height));
  const lienzo = document.createElement('canvas');
  lienzo.width = Math.max(1, Math.round(imagen.width * escala));
  lienzo.height = Math.max(1, Math.round(imagen.height * escala));
  lienzo.getContext('2d')?.drawImage(imagen, 0, 0, lienzo.width, lienzo.height);
  imagen.close();
  // Si el navegador no sabe webp devuelve png: se usa jpeg. Si aun así pasa del tope de la API, se baja la calidad hasta que quepa.
  let tipo = 'image/webp';
  let datos = lienzo.toDataURL(tipo, 0.85);
  if (!datos.startsWith('data:image/webp')) {
    tipo = 'image/jpeg';
    datos = lienzo.toDataURL(tipo, 0.85);
  }
  for (let calidad = 0.7; datos.length > FOTO_MAX_CHARS && calidad > 0.1; calidad -= 0.15) datos = lienzo.toDataURL(tipo, calidad);
  return datos;
}

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
