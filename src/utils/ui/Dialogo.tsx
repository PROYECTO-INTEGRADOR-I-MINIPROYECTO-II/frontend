import { useEffect, useId, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { X } from 'lucide-react';

// Ventana de diálogo con barra de título y botón de cierre. Resuelve lo que todo diálogo necesita:
// foco al primer control al abrir (un campo, un área de texto o un elemento con data-primero), Esc para cerrar, cierre al pulsar fuera
// y nombre accesible. La barra de título queda fija arriba si el contenido hace scroll. Con `modal` (cuando hay una capa oscura detrás) el foco queda dentro: Tab y Shift+Tab dan la vuelta y
// Esc siempre sale, así que no es una trampa de teclado. Quien lo use decide cuándo se monta y dónde se coloca (className).
interface Props {
  id?: string;
  titulo: string;
  onCerrar: (devolverFoco?: boolean) => void;
  /** Teclas propias del contenido: recibe las que el diálogo no consume. */
  onTecla?: (e: KeyboardEvent<HTMLDivElement>) => void;
  /** Cuando cambia (p. ej. otra vista dentro del mismo diálogo), el foco vuelve al primer control. */
  reenfocar?: unknown;
  /** Selector de los controles que abren el diálogo: pulsarlos no cuenta como «fuera». */
  ignorarClic?: string;
  /** El resto de la página queda inactivo mientras está abierto (aria-modal y foco atrapado). */
  modal?: boolean;
  className?: string;
  children: ReactNode;
}

export default function Dialogo({ id, titulo, onCerrar, onTecla, reenfocar, ignorarClic, modal = false, className = '', children }: Props) {
  const idTitulo = useId();
  const raiz = useRef<HTMLDivElement>(null);

  useEffect(() => {
    raiz.current?.querySelector<HTMLElement>('input, textarea, [data-primero]')?.focus();
  }, [reenfocar]);

  // Un clic fuera lo cierra sin quitarle el foco a lo que se pulsó.
  useEffect(() => {
    const alPulsar = (e: PointerEvent) => {
      const t = e.target as Element;
      if (raiz.current?.contains(t) || (ignorarClic && t.closest(ignorarClic))) return;
      onCerrar(false);
    };
    document.addEventListener('pointerdown', alPulsar);
    return () => document.removeEventListener('pointerdown', alPulsar);
  }, [onCerrar, ignorarClic]);

  function alTeclear(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onCerrar();
      return;
    }
    if (modal && e.key === 'Tab' && raiz.current) {
      const enfocables = [...raiz.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])')].filter(
        (el) => el.offsetParent !== null,
      );
      const primero = enfocables[0];
      const ultimo = enfocables[enfocables.length - 1];
      if (primero && ultimo) {
        if (e.shiftKey && document.activeElement === primero) {
          e.preventDefault();
          ultimo.focus();
        } else if (!e.shiftKey && document.activeElement === ultimo) {
          e.preventDefault();
          primero.focus();
        }
      }
      return;
    }
    onTecla?.(e);
  }

  return (
    <div ref={raiz} id={id} role="dialog" aria-modal={modal || undefined} aria-labelledby={idTitulo} onKeyDown={alTeclear} className={`border-2 border-texto bg-fondo ${className}`}>
      <div className="sticky top-0 z-10 flex items-center justify-between border-b-2 border-texto bg-fondo px-4 py-3 font-pixel text-[11px] leading-5">
        <h2 id={idTitulo}>{titulo}</h2>
        <button type="button" onClick={() => onCerrar()} aria-label="Cerrar" className="-m-1 p-1 hover:text-acento-claro">
          <X aria-hidden="true" className="size-4" />
        </button>
      </div>
      {children}
    </div>
  );
}
