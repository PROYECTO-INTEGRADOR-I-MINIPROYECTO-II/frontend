import { DISENOS, type Diseno } from './anclas';

// «Vista:» y un botón con la inicial del diseño del tablero (C = Cuadrícula, O = Orador, P = Presentación). Cada clic pasa al siguiente
// diseño; al apuntarlo o enfocarlo, un globo muestra su nombre completo. El nombre accesible dice el diseño actual y el que viene.
export default function SelectorVista({ diseno, alCambiar, compacto = false }: { diseno: Diseno; alCambiar: (d: Diseno) => void; compacto?: boolean }) {
  const i = DISENOS.findIndex((d) => d.valor === diseno);
  const actual = DISENOS[i];
  const siguiente = DISENOS[(i + 1) % DISENOS.length];
  return (
    <div className="flex items-center gap-2">
      <span aria-hidden="true" className="hidden font-pixel text-[11px] leading-5 min-[420px]:inline">Vista:</span>
      <div className="group relative">
        <button
          type="button"
          onClick={() => alCambiar(siguiente.valor)}
          aria-label={`Vista: ${actual.nombre}. Pulsa para cambiar a ${siguiente.nombre}.`}
          className={`grid place-items-center border-2 border-texto font-pixel text-[11px] leading-5 hover:bg-texto hover:text-fondo focus-visible:bg-texto focus-visible:text-fondo ${compacto ? 'size-8' : 'size-10'}`}
        >
          {actual.nombre[0]}
        </button>
        {/* Globo con el nombre completo (solo visual: el nombre accesible ya lo dice). */}
        <span role="presentation" className="pointer-events-none absolute left-1/2 top-full z-30 mt-1 hidden -translate-x-1/2 whitespace-nowrap border-2 border-texto bg-fondo px-2 py-1 font-pixel text-[11px] leading-5 group-focus-within:block group-[:hover]:block">
          {actual.nombre}
        </span>
      </div>
    </div>
  );
}
