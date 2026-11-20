import { useEffect, useRef, useState, type FormEvent } from 'react';
import { MENSAJE_MAX, type Mensaje } from '../../realtime/tipos';
import { IconoPixel } from '../../utils/retro/PixelIcon';

const HORA = new Intl.DateTimeFormat('es', { timeStyle: 'short' });

// Chat de la sala: mensajes en un registro (role="log", se anuncia lo nuevo sin interrumpir) y el campo para escribir. Enter envía.
// Si ya estabas leyendo mensajes anteriores, uno nuevo no te mueve del lugar.
export default function PanelChat({ mensajes, miUid, conectado, enviar, clara }: { mensajes: Mensaje[]; miUid?: string; conectado: boolean; enviar: (texto: string) => Promise<string | null>; clara: boolean }) {
  const fuente = clara ? 'font-sans text-sm' : 'font-pixel text-[11px] leading-5';
  const [texto, setTexto] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const lista = useRef<HTMLOListElement>(null);
  const alFinal = useRef(true);

  useEffect(() => {
    const el = lista.current;
    if (el && alFinal.current) el.scrollTop = el.scrollHeight;
  }, [mensajes]);

  async function alEnviar(e: FormEvent) {
    e.preventDefault();
    const limpio = texto.trim();
    if (!limpio || enviando) return;
    setEnviando(true);
    const motivo = await enviar(limpio);
    setEnviando(false);
    setError(motivo);
    if (!motivo) {
      setTexto('');
      alFinal.current = true;
    }
  }

  return (
    <div className={`flex min-h-0 flex-1 flex-col ${fuente}`}>
      <ol
        ref={lista}
        role="log"
        aria-label="Mensajes de la sala"
        tabIndex={0}
        onScroll={(e) => {
          const el = e.currentTarget;
          alFinal.current = el.scrollHeight - el.scrollTop - el.clientHeight < 24;
        }}
        className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3"
      >
        {mensajes.length === 0 && <li className="grid flex-1 place-items-center px-4 text-center font-sans text-xs text-texto-secundario">Aún no hay mensajes. Escribe el primero.</li>}
        {mensajes.map((m) => (
          <li key={m.id}>
            <p className="flex items-baseline gap-2">
              <span className={`${clara ? 'font-semibold' : ''} ${m.uid === miUid ? 'text-acento-claro' : ''}`}>{m.autor}</span>
              <time dateTime={m.creado} className="text-xs text-texto-secundario">{HORA.format(new Date(m.creado))}</time>
            </p>
            <p className="mt-1 break-words whitespace-pre-wrap">{m.texto}</p>
          </li>
        ))}
      </ol>
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
        {error && <p id="mensaje-error" role="alert" className="mt-2 text-xs text-error">{error}</p>}
      </form>
    </div>
  );
}
