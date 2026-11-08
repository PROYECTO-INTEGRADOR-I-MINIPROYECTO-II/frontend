import { FormEvent, useEffect, useRef, useState } from 'react';
import { DoodleAvatar, PersonaAvatar, type Persona } from './ChatAvatar';
import { PEOPLE } from './CallPreview';
import { sinMovimiento } from '../../../hooks/useAnimaciones';
import imagenPrueba from '../../../assets/imagen-prueba.png';
import { useSession } from '../../../auth/useSession';

type Reaccion = { emoji: string; por: Persona };
type Item =
  | { id: number; kind: 'sys'; text: string }
  | { id: number; kind: 'msg'; who: Persona; text?: string; image?: boolean; typed: number; reactions: Reaccion[] }
  | { id: number; kind: 'user'; text: string; reactions: Reaccion[] };

const REACCIONES: Reaccion[] = [
  { emoji: '❤️', por: 'SR' },
  { emoji: '👍', por: 'JD' },
  { emoji: '😮', por: 'JG' },
  { emoji: '🔥', por: 'SC' },
];

type Paso =
  | { tipo: 'msg'; who: Persona; text: string }
  | { tipo: 'img'; who: Persona }
  | { tipo: 'sys'; text: string };

// Guion de la demo (chat-animation-script): los personajes de la llamada conversan.
const GUION: Paso[] = [
  { tipo: 'msg', who: 'SC', text: '¿Puedes mandar imágenes?!' },
  { tipo: 'img', who: 'SC' },
  { tipo: 'msg', who: 'SR', text: 'Así es, Chanty. Y además los chats se guardan' },
  { tipo: 'sys', text: 'JD acaba de ingresar! (2:00 PM)' },
  { tipo: 'msg', who: 'JD', text: 'Pues qué bien, porque acabo de entrar 😎' },
  { tipo: 'msg', who: 'JG', text: 'Sí, y entrar a una reunión es lo más rápido del mundo B)' },
];

const MAX_ITEMS = 12;
const reducido = sinMovimiento;

function ImagenPrueba() {
  return <img src={imagenPrueba} alt="Imagen de prueba: una foca" className="mt-1 w-48 ring-2 ring-texto" />;
}

function Reacciones({ lista }: { lista: Reaccion[] }) {
  if (!lista.length) return null;
  return (
    <ul className="mt-1 flex flex-wrap gap-1.5" aria-label="Reacciones">
      {lista.map((r) => (
        <li
          key={r.emoji}
          aria-label={`${r.emoji} de ${r.por}`}
          title={r.por}
          className="chat-pop flex items-center gap-1 border border-texto bg-fondo px-1.5 py-0.5 text-xs"
        >
          <span aria-hidden="true">{r.emoji}</span>
          <span aria-hidden="true" style={{ color: PEOPLE[r.por] }}>{r.por}</span>
        </li>
      ))}
    </ul>
  );
}

// Demo visual: NO está basada en la vista real del chat de una Sala; solo ilustra la idea (ver README).
// Chat de demostración: guion con efecto de escritura y, al terminar, un campo para escribir como en un chat real.
export default function ChatPreview() {
  const { user } = useSession();
  const [items, setItems] = useState<Item[]>([]);
  const [listo, setListo] = useState(false);
  const [texto, setTexto] = useState('');
  const nextId = useRef(1);
  const timers = useRef<number[]>([]);
  const log = useRef<HTMLDivElement>(null);

  const wait = (ms: number) =>
    new Promise<void>((resolve) => {
      timers.current.push(window.setTimeout(resolve, ms));
    });

  useEffect(() => {
    const instantaneo = reducido();
    const patch = (id: number, f: (i: Item) => Item) => setItems((prev) => prev.map((i) => (i.id === id ? f(i) : i)));

    // La demostración corre sola: la promesa se descarta a propósito (los temporizadores se cancelan al desmontar).
    void (async () => {
      await wait(instantaneo ? 0 : 900);
      for (const paso of GUION) {
        const id = nextId.current++;
        if (paso.tipo === 'sys') {
          setItems((p) => [...p, { id, kind: 'sys', text: paso.text }]);
        } else if (paso.tipo === 'img') {
          setItems((p) => [...p, { id, kind: 'msg', who: paso.who, image: true, typed: 0, reactions: [] }]);
        } else {
          setItems((p) => [...p, { id, kind: 'msg', who: paso.who, text: paso.text, typed: instantaneo ? paso.text.length : 0, reactions: [] }]);
          if (!instantaneo) {
            for (let n = 1; n <= paso.text.length; n++) {
              await wait(32);
              patch(id, (i) => (i.kind === 'msg' ? { ...i, typed: n } : i));
            }
          }
        }
        await wait(instantaneo ? 0 : 900);
      }
      setListo(true);
    })();

    const t = timers.current;
    return () => t.forEach(window.clearTimeout);
  }, []);

  // Mantiene el último mensaje visible sin mover la página.
  useEffect(() => {
    const el = log.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [items]);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    const limpio = texto.trim();
    if (!limpio) return;
    setTexto('');
    const id = nextId.current++;
    setItems((p) => [...p, { id, kind: 'user', text: limpio, reactions: [] }].slice(-MAX_ITEMS) as Item[]);
    for (const r of REACCIONES) {
      await wait(reducido() ? 0 : 650);
      setItems((p) => p.map((i) => (i.id === id && i.kind === 'user' ? { ...i, reactions: [...i.reactions, r] } : i)));
    }
  }

  const nombre = user?.username ?? 'you';

  return (
    <section
      aria-label="Vista previa del chat de una Sala"
      className="flex h-[23.6rem] w-full max-w-[560px] flex-col overflow-hidden border-2 border-texto bg-fondo text-left"
    >
      <div aria-hidden="true" className="border-b-2 border-texto px-4 py-3 text-center font-monokuro text-xs leading-5">Chat de los devs</div>
      <div ref={log} className="flex flex-1 flex-col gap-1 overflow-y-auto p-4 [scrollbar-color:#3f3f46_transparent] [scrollbar-width:thin]" role="log" aria-live="off">
        {items.map((it, idx) => {
          if (it.kind === 'sys') {
            return (
              <p key={it.id} className="chat-pop my-2 text-center text-xs text-texto-secundario">
                {it.text}
              </p>
            );
          }
          const prev = items[idx - 1];
          const agrupado = it.kind === 'msg' && prev?.kind === 'msg' && prev.who === it.who;
          const color = it.kind === 'msg' ? PEOPLE[it.who] : '#a1a1aa';
          const autor = it.kind === 'msg' ? it.who : nombre;
          return (
            <div key={it.id} className={`chat-pop flex gap-3 ${agrupado ? "" : "mt-2"}`}>
              <div className="w-10 shrink-0">
                {!agrupado && (it.kind === 'msg' ? <PersonaAvatar who={it.who} /> : <DoodleAvatar />)}
              </div>
              <div className="min-w-0 flex-1">
                {!agrupado && (
                  <p className="text-sm font-semibold" style={{ color }}>
                    {autor}
                  </p>
                )}
                {it.kind === 'msg' && it.image && <ImagenPrueba />}
                {it.text !== undefined && (
                  <p className="break-words text-sm text-texto">
                    <span className="sr-only">{it.text}</span>
                    <span aria-hidden="true">{it.kind === 'msg' ? it.text.slice(0, it.typed) : it.text}</span>
                    {it.kind === 'msg' && it.typed < it.text.length && (
                      <span aria-hidden="true" className="chat-caret ml-px inline-block h-3.5 w-1.5 translate-y-0.5 bg-texto" />
                    )}
                  </p>
                )}
                <Reacciones lista={it.reactions} />
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={enviar} className="border-t-2 border-texto p-3">
        <label htmlFor="chat-demo" className="sr-only">Mensaje de prueba</label>
        <input
          id="chat-demo"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          disabled={!listo}
          maxLength={140}
          autoComplete="off"
          placeholder={listo ? `Escribe como ${nombre}…` : 'Mensaje…'}
          className="w-full border-2 border-texto bg-fondo px-3 py-2 text-sm text-texto placeholder:text-texto-secundario disabled:cursor-not-allowed"
        />
      </form>
    </section>
  );
}
