import { useEffect, type KeyboardEvent } from 'react';
import type { Integrante } from '../../realtime/tipos';
import { IconoPixel } from '../../utils/retro/PixelIcon';
import { columnasDe, type Flecha } from './anclas';
import { Avatar } from './PanelIntegrantes';
import type { Tablero as EstadoTablero } from './useTablero';

const FLECHAS = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];

// Un punto del tablero: la persona que lo ocupa. Se llega con Tab; Enter (o clic) ancla o quita el ancla, y las flechas la mueven de punto.
function Punto({ i, persona, anfitrionUid, anclada, grande = false, t }: { i: number; persona: Integrante; anfitrionUid: string; anclada: boolean; grande?: boolean; t: EstadoTablero }) {
  function alTeclear(e: KeyboardEvent) {
    if (!FLECHAS.includes(e.key)) return;
    e.preventDefault();
    t.mover(i, e.key as Flecha);
  }
  return (
    <button
      type="button"
      id={`punto-${i}`}
      onClick={() => (anclada ? t.quitar(persona.uid) : t.anclar(persona.uid, i))}
      onKeyDown={alTeclear}
      aria-pressed={anclada}
      aria-describedby="ayuda-puntos"
      aria-label={`Punto ${i + 1}: ${persona.nombre || persona.username}${persona.uid === anfitrionUid ? ', anfitrión' : ''}${anclada ? ', anclado' : ''}`}
      className="relative grid size-full min-h-16 place-items-center rounded-2xl border-2 border-texto bg-fondo hover:bg-primario-suave focus-visible:bg-primario-suave"
    >
      <Avatar nombre={persona.nombre || persona.username} foto={persona.foto} className={grande ? 'size-20 text-xl' : 'size-12 text-sm'} />
      <span className="absolute bottom-2 left-3 right-3 flex items-center gap-2">
        <span className="truncate">{persona.nombre || persona.username}</span>
        {persona.uid === anfitrionUid && <span className="shrink-0 text-acento-claro">Anfitrión</span>}
      </span>
      {anclada && <IconoPixel nombre="ancla" className="absolute right-2 top-2 text-acento-claro" />}
    </button>
  );
}

// Centro de la sala, solo para ti: el diseño (Cuadrícula, Orador o Presentación) se elige en la cabecera y aquí fijas a las personas en sus puntos con las anclas.
// El video y la pantalla compartida llegan después; por ahora cada punto muestra a su persona.
export default function Tablero({ t, anfitrionUid, clara, compacto }: { t: EstadoTablero; anfitrionUid: string; clara: boolean; compacto: boolean }) {
  const fuente = clara ? 'font-sans text-sm' : 'font-pixel text-[11px] leading-5';
  const { puntos, diseno, anclas } = t;
  const n = puntos.length;

  // Tras mover con las flechas, el foco sigue a la persona a su nuevo punto.
  useEffect(() => {
    if (t.foco === null) return;
    document.getElementById(`punto-${t.foco}`)?.focus();
    t.limpiarFoco();
  }, [t, t.foco]);

  const punto = (i: number, grande = false) => <Punto i={i} persona={puntos[i]} anfitrionUid={anfitrionUid} anclada={anclas[puntos[i].uid] === i} grande={grande} t={t} />;

  return (
    <section aria-label="Tablero de la sala" className={`flex min-h-0 min-w-0 flex-1 flex-col ${compacto ? 'p-2' : 'p-3'} ${fuente}`}>
      <div className="min-h-0 flex-1">
        {n === 0 && <p className="grid size-full place-items-center font-sans text-sm text-texto-secundario">Esperando a las personas de la sala…</p>}
        {n > 0 && diseno === 'cuadricula' && (
          <ul className="grid size-full auto-rows-fr gap-3" style={{ gridTemplateColumns: `repeat(${columnasDe(n)}, minmax(0, 1fr))` }}>
            {puntos.map((p, i) => <li key={p.uid} className="min-h-0">{punto(i)}</li>)}
          </ul>
        )}

        {n > 0 && diseno === 'orador' && (
          <ul className="flex size-full flex-col gap-3">
            <li className="min-h-0 flex-[3]">{punto(0, true)}</li>
            {n > 1 && (
              <li className="min-h-0 flex-1">
                <ul className="flex size-full gap-3">
                  {puntos.slice(1).map((p, k) => <li key={p.uid} className="min-w-0 flex-1">{punto(k + 1)}</li>)}
                </ul>
              </li>
            )}
          </ul>
        )}

        {n > 0 && diseno === 'presentacion' && (
          <div className="flex size-full flex-col gap-3 lg:flex-row">
            {/* Pendiente (otro sprint): ver la presentación en pantalla completa con un botón (Fullscreen API). Es especialmente útil en el teléfono. */}
            <div className="grid min-h-0 flex-1 place-items-center border-2 border-dashed border-texto p-4 text-center font-sans text-sm text-texto-secundario">
              Aquí se verá la pantalla compartida (Sprint 3).
            </div>
            <ul className="flex shrink-0 gap-3 overflow-auto lg:w-44 lg:flex-col">
              {puntos.map((p, i) => <li key={p.uid} className="h-24 w-36 shrink-0 lg:h-28 lg:w-auto">{punto(i)}</li>)}
            </ul>
          </div>
        )}
      </div>

      <p id="ayuda-puntos" className={compacto ? 'sr-only' : 'mt-3 text-center font-sans text-xs leading-4 text-texto-secundario'}>
        Enter ancla o quita el ancla del punto; las flechas lo mueven. Este diseño es solo tuyo.
      </p>
      <p role="status" aria-live="polite" className="sr-only">{t.anuncio}</p>
    </section>
  );
}
