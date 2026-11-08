import type { ReactNode } from 'react';
import googlePixel from '../../../../assets/google-pixel.png';
import Boton from '../../../../utils/ui/Boton';
import type { FasePanel } from '../loginPanelContext';

// Primera vista del panel: ¿iniciar sesión de forma manual o con Google? `opciones` son las opciones numeradas de la vista.
export default function VistaElegir({ irA, opciones }: { irA: (f: FasePanel) => void; opciones: ReactNode }) {
  return (
    <div className="grid gap-4 p-4">
      <p className="text-center font-pixel text-[11px] leading-5">¿Cómo quieres iniciar sesión?</p>
      <Boton tamano="grande" data-primero onClick={() => irA('manual')}>Manual</Boton>
      <Boton tamano="grande" onClick={() => irA('google')}>
        {/* Icono pixel art de 24×24 celdas, mostrado 1:1 para que cada celda sea un píxel nítido. */}
        <img src={googlePixel} alt="" aria-hidden="true" width={24} height={24} className="size-6 [image-rendering:pixelated]" />
        Google
      </Boton>
      <hr className="border-t border-texto/80" />
      {opciones}
    </div>
  );
}
