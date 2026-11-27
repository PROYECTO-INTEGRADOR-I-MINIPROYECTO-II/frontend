import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from 'react';
import { MENSAJE_MAX, type Mensaje, type Novedad } from '../../realtime/tipos';
import { IconoPixel } from '../../utils/retro/PixelIcon';

const HORA = new Intl.DateTimeFormat('es', { timeStyle: 'short' });
const SIN_ENTRADAS: Novedad[] = [];

type Linea = { clave: string; creado: string; mensaje?: Mensaje; entrada?: Novedad };

interface Props {
  mensajes: Mensaje[];
  /** Quiénes fueron entrando mientras se estaba dentro: una línea con la hora; no se guarda. */
  entradas?: Novedad[];
  miUid?: string;
  conectado: boolean;
  enviar: (texto: string) => Promise<string | null>;
  clara: boolean;
  hayMas?: boolean;
  anteriores?: 'cargando' | 'error' | null;
  cargarAnteriores?: () => void;
}

// Chat de la sala: mensajes en orden (autor, hora, texto) y el campo para escribir; Enter envía. Baja solo al llegar algo nuevo, salvo
// que se estén leyendo mensajes anteriores: entonces aparece la barra de «mensajes nuevos». Los anuncios al lector de pantalla los hace
// la sala (así también se oyen con el chat plegado), por eso este registro no se anuncia solo.
export default function PanelChat({ mensajes, entradas = SIN_ENTRADAS, miUid, conectado, enviar, clara, hayMas, anteriores, cargarAnteriores }: Props) {
  const fuente = clara ? 'font-sans text-sm' : 'font-pixel text-[11px] leading-5';
  const [texto, setTexto] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [nuevos, setNuevos] = useState(0);
  const lista = useRef<HTMLOListElement>(null);
  const alFinal = useRef(true);
  const alto = useRef(0);
  const ultimaY = useRef(0);
  const previos = useRef<{ ids: Set<string>; primero?: string; ultimo?: Mensaje }>({ ids: new Set() });

  const bajar = () => {
    const el = lista.current;
    if (el) el.scrollTop = el.scrollHeight;
    alFinal.current = true;
    setNuevos(0);
  };

  useLayoutEffect(() => {
    const el = lista.current;
    const antes = previos.current;
    const ultimo = mensajes.at(-1);
    const seCargaronAnteriores = antes.primero !== undefined && mensajes[0]?.id !== antes.primero && ultimo?.id === antes.ultimo?.id;
    if (el) {
      // Al añadir arriba se mantiene a la vista lo que se estaba leyendo.
      if (seCargaronAnteriores) el.scrollTop += el.scrollHeight - alto.current;
      else if (alFinal.current) el.scrollTop = el.scrollHeight;
    }
    if (antes.ultimo && !alFinal.current && !seCargaronAnteriores) {
      const llegados = mensajes.filter((m) => !antes.ids.has(m.id) && m.creado >= antes.ultimo!.creado && m.uid !== miUid).length;
      if (llegados) setNuevos((n) => n + llegados);
    }
    previos.current = { ids: new Set(mensajes.map((m) => m.id)), primero: mensajes[0]?.id, ultimo };
  }, [mensajes, miUid]);

  useEffect(() => {
    const el = lista.current;
    if (el && alFinal.current) el.scrollTop = el.scrollHeight;
  }, [entradas]);

  useLayoutEffect(() => {
    alto.current = lista.current?.scrollHeight ?? 0;
  });

  // El control que se pulsa desaparece al cargar: el foco pasa antes a la lista para no perderse.
  const pedirAnteriores = () => {
    lista.current?.focus({ preventScroll: true });
    cargarAnteriores?.();
  };

  // Si la lista cambia de tamaño (un aviso arriba, el teclado del celular) y se estaba al final, se sigue al final.
  useEffect(() => {
    const el = lista.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const o = new ResizeObserver(() => {
      if (alFinal.current) el.scrollTop = el.scrollHeight;
    });
    o.observe(el);
    return () => o.disconnect();
  }, []);

  async function alEnviar(e: FormEvent) {
    e.preventDefault();
    const limpio = texto.trim();
    if (!limpio || enviando) return;
    setError(null);
    setEnviando(true);
    const motivo = await enviar(limpio);
    setEnviando(false);
    setError(motivo);
    if (!motivo) {
      setTexto('');
      bajar();
    }
  }

  const lineas: Linea[] = [
    ...mensajes.map((m) => ({ clave: m.id, creado: m.creado, mensaje: m })),
    ...entradas.map((n) => ({ clave: `entrada-${n.n}`, creado: n.creado, entrada: n })),
  ].sort((a, b) => a.creado.localeCompare(b.creado));
  const aviso = 'list-none text-center text-xs';

  return (
    <div className={`flex min-h-0 flex-1 flex-col ${fuente}`}>
      <ol
        ref={lista}
        role="log"
        aria-live="off"
        aria-label="Mensajes de la sala"
        tabIndex={0}
        onScroll={(e) => {
          const el = e.currentTarget;
          // Solo cuenta como «leyendo arriba» si la persona sube: que la lista encoja no lo es.
          if (el.scrollHeight - el.scrollTop - el.clientHeight < 24) {
            alFinal.current = true;
            setNuevos(0);
          } else if (el.scrollTop < ultimaY.current) {
            alFinal.current = false;
          }
          ultimaY.current = el.scrollTop;
        }}
        className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3 [overflow-anchor:none]"
      >
        {anteriores === 'cargando' ? (
          <li className={`${aviso} text-texto-secundario`}><span role="status">Cargando anteriores…</span></li>
        ) : anteriores === 'error' ? (
          <li className={`${aviso} text-error`}>
            <span role="alert">No pudimos cargarlos. </span>
            <button type="button" onClick={pedirAnteriores} className="underline underline-offset-4">Reintentar</button>
          </li>
        ) : (
          hayMas && (
            <li className={aviso}>
              <button type="button" onClick={pedirAnteriores} className="text-texto-secundario underline underline-offset-4 hover:text-acento-claro focus-visible:text-acento-claro">
                <span aria-hidden="true">· · · </span>ver anteriores<span aria-hidden="true"> · · ·</span>
              </button>
            </li>
          )
        )}
        {lineas.length === 0 && <li className="grid flex-1 place-items-center px-4 text-center font-sans text-xs text-texto-secundario">Aún no hay mensajes. Escribe el primero.</li>}
        {lineas.map(({ clave, mensaje: m, entrada }) =>
          m ? (
            <li key={clave}>
              <p className="flex items-baseline gap-2">
                <span className={`${clara ? 'font-semibold' : ''} ${m.uid === miUid ? 'text-acento-claro' : ''}`}>{m.autor}</span>
                <time dateTime={m.creado} className="text-xs text-texto-secundario">{HORA.format(new Date(m.creado))}</time>
              </p>
              <p className="mt-1 break-words whitespace-pre-wrap">{m.texto}</p>
            </li>
          ) : (
            <li key={clave} className="text-center text-xs text-texto-secundario">
              <span aria-hidden="true">&gt; </span>
              {entrada!.nombre} entra · <time dateTime={entrada!.creado}>{HORA.format(new Date(entrada!.creado))}</time>
            </li>
          ),
        )}
      </ol>
      {nuevos > 0 && (
        <button type="button" onClick={bajar} className="w-full bg-texto px-3 py-2 text-center font-pixel text-[11px] uppercase leading-5 text-fondo">
          <span aria-hidden="true">▼ </span>
          {nuevos} {nuevos === 1 ? 'mensaje nuevo' : 'mensajes nuevos'}
        </button>
      )}
      <form onSubmit={alEnviar} noValidate className="border-t-2 border-texto p-3">
        <label htmlFor="mensaje" className="sr-only">Escribe un mensaje</label>
        <div className="flex items-stretch gap-2">
          <input
            id="mensaje"
            value={texto}
            onChange={(e) => {
              setTexto(e.target.value);
              setError(null);
            }}
            maxLength={MENSAJE_MAX}
            autoComplete="off"
            placeholder="Mensaje…"
            aria-describedby={error ? 'mensaje-error' : undefined}
            aria-invalid={error ? true : undefined}
            className={`min-w-0 flex-1 border-2 bg-fondo px-3 py-2 ${fuente} ${error ? 'border-error' : 'border-texto'}`}
          />
          {/* Solo el icono (avión de papel); su nombre accesible es «Enviar mensaje». */}
          <button
            type="submit"
            aria-label="Enviar mensaje"
            disabled={!conectado || enviando || !texto.trim()}
            aria-busy={enviando || undefined}
            className="grid w-11 shrink-0 place-items-center border-2 border-texto bg-texto text-fondo hover:bg-fondo hover:text-texto focus-visible:bg-fondo focus-visible:text-texto disabled:cursor-not-allowed disabled:border-borde disabled:bg-fondo disabled:text-texto-secundario/60"
          >
            <IconoPixel nombre="enviar" />
          </button>
        </div>
        <p role="status" className={enviando ? 'mt-2 text-xs text-texto-secundario' : 'sr-only'}>{enviando ? 'Enviando…' : ''}</p>
        {error && (
          <p className="mt-2 text-xs text-error">
            <span id="mensaje-error" role="alert">No se envió. {error} </span>
            <button type="submit" disabled={!conectado} className="underline underline-offset-4 disabled:opacity-50">Reintentar</button>
          </p>
        )}
      </form>
    </div>
  );
}
