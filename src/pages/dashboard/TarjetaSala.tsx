import { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Sala } from '../../api/salas';
import EtiquetaTecla from '../../utils/retro/EtiquetaTecla';
import { IconoPixel } from '../../utils/retro/PixelIcon';
import TextoBrillo from '../../utils/retro/TextoBrillo';

const FECHA = new Intl.DateTimeFormat('es', { dateStyle: 'medium' });

const BOTON = 'grid size-10 shrink-0 place-items-center border-2 border-texto';
const BOTON_SECUNDARIO = `${BOTON} bg-fondo text-texto hover:bg-texto hover:text-fondo focus-visible:bg-texto focus-visible:text-fondo`;
const BOTON_PRIMARIO = `${BOTON} bg-texto text-fondo hover:bg-fondo hover:text-texto focus-visible:bg-fondo focus-visible:text-texto`;

// Una sala propia. Plegada muestra lo esencial: su número de acceso rápido (la tecla que entra a ella, en morado), el nombre, su ID
// (clicable: se copia) y dos botones, ampliar y entrar. Desplegada añade lo demás: descripción, fecha de creación y opciones.
export default function TarjetaSala({ sala, numero, nueva, alCopiar }: { sala: Sala; numero?: number; nueva: boolean; alCopiar: (sala: Sala) => void }) {
  const [abierta, setAbierta] = useState(false);
  const idDetalle = useId();
  return (
    <li className={`border-2 bg-fondo ${nueva ? 'border-acento-claro' : 'border-texto'}`}>
      <div className="flex items-center gap-3 p-3 sm:gap-4 sm:p-4">
        {/* Hueco fijo: con o sin atajo los nombres quedan alineados. Sin número (a partir de la décima) se llega con Tab. */}
        <span className="w-14 shrink-0"><EtiquetaTecla tecla={numero ? String(numero) : 'TAB'} /></span>
        <div className="min-w-0 flex-1 text-center">
          <h2 className="break-words font-pixel text-sm leading-6 sm:text-base sm:leading-7">
            <TextoBrillo texto={sala.nombre} />
          </h2>
          {nueva && <p className="font-pixel text-[11px] leading-5 text-acento-claro">Nueva</p>}
          <p className="mt-1 flex flex-wrap items-baseline justify-center gap-x-2 text-xs text-texto-secundario">
            ID:
            <button
              type="button"
              onClick={() => alCopiar(sala)}
              title="Copiar el ID"
              aria-label={`Copiar el ID de la sala ${sala.nombre}: ${sala.id}`}
              className="break-all text-center underline underline-offset-4 hover:text-acento-claro focus-visible:text-acento-claro"
            >
              {sala.id}
            </button>
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => setAbierta((a) => !a)}
            aria-expanded={abierta}
            aria-controls={idDetalle}
            aria-label={`${abierta ? 'Ocultar' : 'Mostrar'} los detalles de la sala ${sala.nombre}`}
            className={BOTON_SECUNDARIO}
          >
            <IconoPixel nombre={abierta ? 'flechaArriba' : 'flechaAbajo'} />
          </button>
          <Link to={`/salas/${encodeURIComponent(sala.id)}`} aria-label={`Entrar a la sala ${sala.nombre}`} aria-keyshortcuts={numero ? String(numero) : undefined} className={BOTON_PRIMARIO}>
            <IconoPixel nombre="flechaDerecha" />
          </Link>
        </div>
      </div>

      {/* Detalle plegable: crece en vertical; plegado queda inerte (sin foco ni lectura de pantalla). */}
      <div id={idDetalle} inert={!abierta} className={`grid motion-safe:transition-[grid-template-rows] motion-safe:duration-200 ${abierta ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <div className="grid gap-3 border-t border-borde px-3 py-4 text-sm sm:px-4">
            {sala.descripcion && <p className="break-words text-texto-secundario">{sala.descripcion}</p>}
            <p className="text-xs text-texto-secundario">Creada el {FECHA.format(new Date(sala.creado))}</p>
            {/* Aún sin definir (qué opciones y en qué sprint): se deja el lugar, en gris. */}
            <p aria-disabled="true" className="cursor-not-allowed font-pixel text-[11px] leading-5 text-texto-secundario/60">Opciones de la sala (próximamente)</p>
          </div>
        </div>
      </div>
    </li>
  );
}
