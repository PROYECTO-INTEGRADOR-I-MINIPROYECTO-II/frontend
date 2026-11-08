import { useEffect, useRef, useState } from 'react';
import { PixelIcon } from '../../../../utils/retro/PixelIcon';
import { BarraRetro, PuntosAnimados } from '../../../../utils/retro/RetroWindow';

// Transición tras el primer «Confirmar»: «Creando tu cuenta…» con la barra de progreso y, al terminar, «Cuenta creada» con un visto.
// Dura unos 3 s (la cuenta real tarda lo que tarde la API; esto es el mínimo para que se aprecie) y sigue sola a la vista de perfil.
const CREANDO_MS = 1800;
const CREADA_MS = 1300;

export default function VistaCreando({ alTerminar }: { alTerminar: () => void }) {
  const [creada, setCreada] = useState(false);
  const fin = useRef(alTerminar);
  fin.current = alTerminar;

  useEffect(() => {
    const t1 = window.setTimeout(() => setCreada(true), CREANDO_MS);
    const t2 = window.setTimeout(() => fin.current(), CREANDO_MS + CREADA_MS);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  return (
    <div data-primero tabIndex={-1} role="status" className="grid justify-items-center gap-5 p-8 outline-none">
      <div className="grid h-24 place-items-center">
        {creada ? (
          <svg aria-hidden="true" viewBox="0 0 22 22" className="size-24 fill-exito">
            <PixelIcon nombre="visto" x={11} y={11} escala={2} />
          </svg>
        ) : (
          <p className="font-pixel text-xs leading-5">
            Creando tu cuenta
            <PuntosAnimados sinVacio intervalo={350} />
          </p>
        )}
      </div>
      <div className="w-full">
        <BarraRetro modo={creada ? 'ok' : 'cargando'} label={creada ? 'Cuenta creada' : 'Creando tu cuenta'} />
      </div>
      <p className="min-h-5 font-pixel text-xs leading-5">{creada ? 'Cuenta creada' : ''}</p>
      <span className="sr-only">{creada ? 'Tu cuenta fue creada. Ahora puedes personalizar tu perfil.' : 'Creando tu cuenta.'}</span>
    </div>
  );
}
