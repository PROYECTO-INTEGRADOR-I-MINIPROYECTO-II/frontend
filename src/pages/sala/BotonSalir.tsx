import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconoPixel } from '../../utils/retro/PixelIcon';

const TEXTO = 'Clic de nuevo para salir';
const ESPERA_MS = 3500;

// Salir en dos pasos, para no irse de la sala por un clic suelto: el primero cambia el botón a «Clic de nuevo para salir» y abre 3,5 s
// para confirmar; las letras pasan de una en una del color del texto a gris y, cuando se apagan todas, el botón vuelve a ser la X. Funciona
// igual en bajo contraste (los colores salen de los de la vista) y con «Pausar animaciones» (cambia el color sin transición).
export default function BotonSalir({ destino = '/dashboard', compacto = false, alArmar }: { destino?: string; compacto?: boolean; alArmar?: (armado: boolean) => void }) {
  const navegar = useNavigate();
  const [apagadas, setApagadas] = useState<number | null>(null); // null = sin armar; n = letras ya grises
  const armado = apagadas !== null;
  const reloj = useRef<number | null>(null);
  const letras = [...TEXTO];
  useEffect(() => alArmar?.(armado), [armado, alArmar]);

  const parar = () => {
    if (reloj.current !== null) window.clearInterval(reloj.current);
    reloj.current = null;
  };
  useEffect(() => parar, []);

  function pulsar() {
    if (armado) {
      parar();
      return navegar(destino);
    }
    setApagadas(0);
    reloj.current = window.setInterval(() => {
      setApagadas((n) => {
        if (n === null) return n;
        if (n + 1 >= letras.length) {
          parar();
          return null; // se acabó el tiempo: vuelve a la X
        }
        return n + 1;
      });
    }, ESPERA_MS / letras.length);
  }

  return (
    <>
      <button
        type="button"
        onClick={pulsar}
        aria-label={armado ? 'Pulsa de nuevo para salir de la sala' : 'Salir de la sala'}
                className={`flex shrink-0 items-center justify-center gap-2 border-2 border-texto bg-fondo px-2 font-pixel text-[11px] leading-5 hover:bg-texto hover:text-fondo focus-visible:bg-texto focus-visible:text-fondo ${compacto ? 'h-8' : 'h-10'} ${armado ? 'whitespace-nowrap px-3' : compacto ? 'w-8' : 'w-10'}`}
      >
        {armado ? (
          <span aria-hidden="true">
            {letras.map((c, i) => (
              <span key={i} className={`whitespace-pre transition-colors duration-300 ${i < (apagadas ?? 0) ? 'text-[color-mix(in_srgb,var(--color-texto)_38%,var(--color-fondo))]' : ''}`}>
                {c}
              </span>
            ))}
          </span>
        ) : (
          <IconoPixel nombre="equis" />
        )}
      </button>
      <span role="status" className="sr-only">{armado ? 'Pulsa de nuevo para salir de la sala.' : ''}</span>
    </>
  );
}
