import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import type { Analisis } from '../../auth/validaciones';
import { alternarFuenteCampos, useFuenteCampos } from '../../hooks/useFuenteCampos';
import { FUENTE_CLASE, interlineadoPara, tamanoPara } from './tamanoTexto';
import { useEstadoCampo, type EstadoCampo } from '../../hooks/useEstadoCampo';
import { PuntosAnimados } from '../retro/RetroWindow';

// Campo destacado (username, nombres y apellidos): sin cuadro, texto grande y centrado en Press Start 2P y cursor propio (como el campo LED de la portada).
// Cuando el texto no cabe en una línea baja de línea y se hace más pequeño por tramos (nunca se sale del campo); por eso es un
// <textarea> de una línea que crece, donde Enter no inserta saltos sino que envía el formulario.
// Se valida mientras se escribe: un carácter o formato no válido pone el texto en rojo con su explicación; al hacer una pausa,
// el texto pulsa entre gris y blanco mientras se comprueba si está libre, y si lo está queda blanco con un leve brillo.
// El cursor parpadea en el campo activo y en los campos vacíos (al centro); un campo con texto que no está activo no lo muestra. Con `selectorFuente`, un botón a la derecha de la etiqueta alterna la tipografía de
// todos los campos destacados entre Press Start 2P (activado) y Geist (más clara). Con `verificar` comprueba la disponibilidad (username).
interface Props {
  id: string;
  etiqueta: string;
  valor: string;
  onCambio: (v: string) => void;
  /** Reglas que se aplican mientras se escribe. */
  analizar: (v: string) => Analisis;
  /** Consulta si el valor está libre (true = libre); sin esto no hay comprobación de unicidad. */
  verificar?: (v: string) => Promise<boolean>;
  mensajeOcupado?: (v: string) => string;
  /** Texto verde cuando el valor está libre (solo con `verificar`). */
  textoDisponible?: string;
  /** Error que llega de fuera (p. ej. al enviar el formulario con el campo vacío). */
  error?: string;
  ayuda?: string;
  /** Avisa del estado para que el formulario sepa si puede enviar (p. ej. no si está ocupado). */
  onEstado?: (e: EstadoCampo) => void;
  /** Muestra el botón «Aa» que cambia la tipografía de los campos destacados. */
  selectorFuente?: boolean;
  autoComplete?: string;
}

const CLASE_ESTADO: Record<EstadoCampo, string> = {
  vacio: 'text-texto',
  escribiendo: 'text-texto',
  verificando: 'username-verificando',
  disponible: 'username-valido',
  invalido: 'text-error',
  corto: 'text-error',
  ocupado: 'text-error',
  'sin-comprobar': 'text-texto',
};
const ES_ERROR = (e: EstadoCampo) => e === 'invalido' || e === 'corto' || e === 'ocupado';

export default function CampoDestacado({ id, etiqueta, valor, onCambio, analizar, verificar, mensajeOcupado, textoDisponible, error, ayuda, onEstado, selectorFuente = false, autoComplete }: Props) {
  const { estado, mensaje } = useEstadoCampo(valor, { analizar, verificar, mensajeOcupado });
  const idMensaje = useId();
  const area = useRef<HTMLTextAreaElement>(null);
  const marca = useRef<HTMLSpanElement>(null); // marca invisible en el espejo, justo donde está el cursor
  const [enfocado, setEnfocado] = useState(false);
  const conClic = useRef(false); // el foco viene de un clic: se respeta el lugar pulsado
  const [sel, setSel] = useState(0);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const clara = useFuenteCampos() === 'clara';
  const cursor = enfocado || valor === '';
  const caret = enfocado ? sel : valor.length;
  const tam = tamanoPara([...valor].length, clara);
  const interlineado = interlineadoPara(tam, clara);
  const fuente = clara ? FUENTE_CLASE.clara : FUENTE_CLASE.pixel;
  useEffect(() => onEstado?.(estado), [estado, onEstado]);

  const sincronizar = () => setSel(area.current?.selectionStart ?? valor.length);

  // El campo crece con las líneas. El cursor propio se coloca donde cae una marca invisible dentro de un espejo del texto
  // (mismas medidas, fuente y centrado), así sigue al texto aunque haya varias líneas.
  useLayoutEffect(() => {
    const t = area.current;
    const m = marca.current;
    if (!t || !m) return;
    t.style.height = 'auto';
    t.style.height = `${t.scrollHeight + 2}px`; // + el borde inferior
    // El centro del cursor no puede pasar del borde del campo (si la línea ocupa todo el ancho, quedaría medio fuera).
    const mitad = Math.max(4, tam / 2) / 2;
    setPos({ x: Math.min(Math.max(m.offsetLeft, mitad), t.clientWidth - mitad), y: m.offsetTop });
  }, [valor, caret, tam, clara, enfocado]);

  const visible = mensaje ?? error;
  const invalido = ES_ERROR(estado) || (!mensaje && !!error);
  // El texto toma el estilo de su estado; el cursor solo cambia a rojo si es inválido (no pulsa ni brilla).
  const claseTexto = !mensaje && error ? 'text-error' : CLASE_ESTADO[estado];
  const ayudaId = `${id}-ayuda`;
  const describedBy = [visible && idMensaje, ayuda && ayudaId].filter(Boolean).join(' ') || undefined;

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="block font-pixel text-[11px] leading-5">
          {etiqueta}
          {estado === 'verificando' && <PuntosAnimados sinVacio intervalo={350} />}
        </label>
        {selectorFuente && (
          <button
            type="button"
            onClick={alternarFuenteCampos}
            aria-pressed={!clara}
            aria-label="Usar tipografía pixel en el campo"
            title={clara ? 'Cambiar a la tipografía pixel (Press Start 2P)' : 'Cambiar a la tipografía clara (Geist)'}
            className="border border-texto/80 px-2 leading-5 text-texto hover:text-acento-claro aria-pressed:bg-texto aria-pressed:text-fondo aria-pressed:hover:text-fondo"
          >
            {/* Muestra la tipografía activa: Press Start 2P (relleno) o Geist (solo marco). */}
            <span aria-hidden="true" className={clara ? 'font-sans text-sm font-medium' : 'font-pixel text-[11px]'}>Aa</span>
          </button>
        )}
      </div>
      <div className={`relative mt-2 ${invalido ? 'text-error' : estado === 'disponible' ? 'text-exito' : 'text-texto'}`}>
        <textarea
          ref={area}
          id={id}
          rows={1}
          value={valor}
          maxLength={64}
          onChange={(e) => {
            onCambio(e.target.value.replace(/[\r\n]+/g, ' ')); // un solo renglón lógico: nunca hay saltos de línea
            sincronizar();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
          onMouseDown={() => {
            conClic.current = true;
          }}
          onMouseUp={() => {
            conClic.current = false;
          }}
          onSelect={sincronizar}
          onFocus={(e) => {
            // Un campo que ya trae texto se enfoca con el cursor al final: por teclado o por programa el navegador deja el cursor al
            // inicio o todo el texto seleccionado; con un clic se respeta donde se pulsó.
            const t = e.currentTarget;
            const alFinal = () => {
              if (conClic.current || document.activeElement !== t || !t.value) return;
              if (t.selectionStart === 0 && (t.selectionEnd === 0 || t.selectionEnd === t.value.length)) {
                t.setSelectionRange(t.value.length, t.value.length);
                sincronizar();
              }
            };
            alFinal();
            requestAnimationFrame(alFinal); // por si el navegador fija la selección después del evento
            setEnfocado(true);
            sincronizar();
          }}
          onBlur={() => setEnfocado(false)}
          autoComplete={autoComplete}
          autoCapitalize="none"
          spellCheck={false}
          aria-invalid={invalido || undefined}
          aria-describedby={describedBy}
          style={{ fontSize: tam, lineHeight: `${interlineado}px` }}
          className={`${fuente} ${claseTexto} block w-full resize-none overflow-hidden border-b-2 border-transparent bg-transparent py-2 text-center caret-transparent [overflow-wrap:anywhere] focus:border-foco focus:outline-none`}
        />
        <div
          aria-hidden="true"
          style={{ fontSize: tam, lineHeight: `${interlineado}px` }}
          className={`${fuente} invisible absolute inset-x-0 top-0 whitespace-pre-wrap py-2 text-center [overflow-wrap:anywhere]`}
        >
          {valor.slice(0, caret)}
          <span ref={marca} className="inline-block w-0 align-top" style={{ height: interlineado }} />
          {valor.slice(caret)}
        </div>
        {cursor && <span
            aria-hidden="true"
            className="cursor-campo pointer-events-none absolute bg-current"
            style={{
              left: pos.x - Math.max(4, tam / 2) / 2,
              top: pos.y + (interlineado - Math.round(tam * 1.25)) / 2,
              width: Math.max(4, tam / 2),
              height: Math.round(tam * 1.25),
            }}
          />}
      </div>

      {/* Región viva: lo que se escribe aquí se anuncia con amabilidad (sin interrumpir mientras se teclea). */}
      <div aria-live="polite" className="min-h-0">
        {visible && <p id={idMensaje} className="mt-1 text-center text-xs text-error">{visible}</p>}
        {!visible && estado === 'disponible' && textoDisponible && <p className="mt-1 text-center text-xs text-exito">{textoDisponible}</p>}
        {!visible && estado === 'sin-comprobar' && <p className="mt-1 text-center text-xs text-texto-secundario">No pudimos comprobarlo; lo confirmaremos al crear la cuenta.</p>}
        {estado === 'verificando' && <span className="sr-only">Verificando disponibilidad.</span>}
      </div>
      {ayuda && <p id={ayudaId} className="mt-1 text-center text-xs text-texto-secundario">{ayuda}</p>}
    </div>
  );
}
