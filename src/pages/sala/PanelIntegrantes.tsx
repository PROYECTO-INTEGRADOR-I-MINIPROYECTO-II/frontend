import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import type { Integrante } from '../../realtime/tipos';
import { IconoPixel } from '../../utils/retro/PixelIcon';
import type { Tablero } from './useTablero';

// Inicial en un círculo: mientras no haya foto en el tiempo real (la API de presencia solo entrega uid y username).
// No se puede seleccionar: es una imagen, no texto.
export function Avatar({ nombre, className = '' }: { nombre: string; className?: string }) {
  return (
    <span aria-hidden="true" className={`grid shrink-0 select-none place-items-center rounded-full border-2 border-texto font-pixel uppercase ${className}`}>
      {[...nombre][0] ?? '?'}
    </span>
  );
}

// Menú de una persona (estilo Discord), en línea bajo ella: al abrirlo la fila crece en vez de flotar (y de forzar scroll en la columna). Se abre con Enter o clic, se recorre con las flechas, Esc lo cierra y devuelve el foco.
function Menu({ opciones, alCerrar, clara }: { opciones: { texto: string; alElegir: () => void }[]; alCerrar: () => void; clara: boolean }) {
  const raiz = useRef<HTMLUListElement>(null);
  useEffect(() => {
    raiz.current?.querySelector<HTMLElement>('button')?.focus();
    const fuera = (e: PointerEvent) => !raiz.current?.contains(e.target as Node) && alCerrar();
    document.addEventListener('pointerdown', fuera);
    return () => document.removeEventListener('pointerdown', fuera);
  }, [alCerrar]);

  function alTeclear(e: KeyboardEvent) {
    const items = [...(raiz.current?.querySelectorAll<HTMLElement>('button') ?? [])];
    const k = items.indexOf(document.activeElement as HTMLElement);
    if (e.key === 'Escape' || e.key === 'Tab') {
      e.preventDefault();
      e.stopPropagation();
      alCerrar();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      items[(k + 1) % items.length]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      items[(k - 1 + items.length) % items.length]?.focus();
    } else if (e.key === 'Home') items[0]?.focus();
    else if (e.key === 'End') items[items.length - 1]?.focus();
  }

  return (
    <ul ref={raiz} role="menu" onKeyDown={alTeclear} className="mb-1 ml-12 mr-2 mt-1 border-2 border-texto bg-fondo p-1">
      {opciones.map((o) => (
        <li key={o.texto} role="none">
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              o.alElegir();
              alCerrar();
            }}
            className={`block w-full px-2 py-2 text-left ${clara ? 'text-xs' : 'text-[10px] leading-4'} hover:bg-texto hover:text-fondo focus-visible:bg-texto focus-visible:text-fondo`}
          >
            {o.texto}
          </button>
        </li>
      ))}
    </ul>
  );
}

// Columna de integrantes conectados, con quién es anfitrión y quién eres tú. Enter sobre una persona abre su menú para anclarla al tablero.
export default function PanelIntegrantes({ integrantes, anfitrionUid, miUid, tablero, clara }: { integrantes: Integrante[]; anfitrionUid: string; miUid?: string; tablero: Tablero; clara: boolean }) {
  const [abierto, setAbierto] = useState<string | null>(null);
  const disparador = useRef<HTMLButtonElement | null>(null);
  const cerrar = () => {
    setAbierto(null);
    disparador.current?.focus(); // el foco vuelve a la persona que abrió el menú
  };
  const fuente = clara ? 'font-sans text-sm' : 'font-pixel text-[11px] leading-5';

  return (
    <ul aria-label="Integrantes conectados" className={`grid content-start gap-1 overflow-y-auto overflow-x-hidden p-3 ${fuente}`}>
      {integrantes.length === 0 && <li className="p-2 text-texto-secundario">Nadie conectado todavía.</li>}
      {integrantes.map((i) => {
        const punto = tablero.indiceDe(i.uid);
        const anclado = tablero.anclas[i.uid] === punto && punto >= 0;
        const roles = [i.uid === anfitrionUid && 'Anfitrión', i.uid === miUid && 'Tú'].filter(Boolean).join(' · ');
        return (
          <li key={i.uid} className="relative">
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={abierto === i.uid}
              onClick={(e) => {
                disparador.current = e.currentTarget;
                setAbierto(abierto === i.uid ? null : i.uid);
              }}
              className="flex w-full items-center gap-3 p-2 text-left hover:bg-primario-suave focus-visible:bg-primario-suave"
            >
              <Avatar nombre={i.username} className="size-9 text-[11px]" />
              <span className="min-w-0 flex-1">
                <span className="block truncate">{i.username}</span>
                {roles && <span className="block text-acento-claro">{roles}</span>}
              </span>
              {anclado && (
                <>
                  <IconoPixel nombre="ancla" className="shrink-0 text-acento-claro" />
                  <span className="sr-only">Anclado en el punto {punto + 1}</span>
                </>
              )}
            </button>
            {abierto === i.uid && (
              <Menu
                alCerrar={cerrar}
                clara={clara}
                opciones={
                  anclado
                    ? [{ texto: 'Quitar ancla', alElegir: () => tablero.quitar(i.uid) }, ...(punto !== 0 ? [{ texto: 'Anclar en el punto 1', alElegir: () => tablero.anclar(i.uid, 0) }] : [])]
                    : [
                        { texto: `Anclar en el punto ${punto + 1}`, alElegir: () => tablero.anclar(i.uid, punto) },
                        ...(punto !== 0 ? [{ texto: 'Anclar en el punto 1', alElegir: () => tablero.anclar(i.uid, 0) }] : []),
                      ]
                }
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}
