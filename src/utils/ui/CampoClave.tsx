import { useCallback, useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from 'react';
import hoja from '../../assets/iconos/hoja-iconos-16.png';
import { CANTIDAD_ICONOS, glifo, iconoDe } from './iconosClave';

// Campo de contraseña que, en lugar de puntos o asteriscos, dibuja un icono pixel por cada carácter escrito (siempre uno distinto).
// El <input type="password"> real sigue ahí, con su texto invisible: conserva el teclado, el autocompletado, los gestores de
// contraseñas y los lectores de pantalla («campo protegido»). Los iconos y el cursor son solo dibujo (aria-hidden).
// Modo 'fuente': usa la fuente IconosPixel16. Modo 'sprites': la hoja de sprites como máscara CSS (mismo aspecto, sin declarar otra fuente).
export const MODO_ICONOS: 'fuente' | 'sprites' = 'fuente';

const TAM = 16; // un píxel del icono = un píxel de pantalla: sin borrosidad
const SEP = 2;
const PASO = TAM + SEP;

interface Props {
  id: string;
  valor: string;
  onCambio: (v: string) => void;
  autoComplete: string;
  invalido?: boolean;
  describedBy?: string;
  className: string;
  /** Orden (aleatorio) de los iconos de este campo; ver crearOrden. */
  orden: readonly number[];
}

function Icono({ i }: { i: number }) {
  if (MODO_ICONOS === 'fuente') {
    return <span className="block size-4 shrink-0 font-iconos text-[16px] leading-4">{glifo(i)}</span>;
  }
  const mascara = { maskImage: `url(${hoja})`, WebkitMaskImage: `url(${hoja})`, maskSize: `${TAM * CANTIDAD_ICONOS}px ${TAM}px`, WebkitMaskSize: `${TAM * CANTIDAD_ICONOS}px ${TAM}px`, maskPosition: `-${i * TAM}px 0`, WebkitMaskPosition: `-${i * TAM}px 0`, imageRendering: 'pixelated' } as const;
  return <span className="block size-4 shrink-0 bg-current" style={mascara} />;
}

export default function CampoClave({ id, valor, onCambio, autoComplete, invalido, describedBy, className, orden }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const zona = useRef<HTMLDivElement>(null);
  const [foco, setFoco] = useState(false);
  const [caret, setCaret] = useState(valor.length);
  const [cabe, setCabe] = useState(20); // cuántos iconos caben en el ancho del campo

  useLayoutEffect(() => {
    const z = zona.current;
    if (!z) return;
    const medir = () => setCabe(Math.max(1, Math.floor((z.clientWidth + SEP) / PASO)));
    medir();
    const o = new ResizeObserver(medir);
    o.observe(z);
    return () => o.disconnect();
  }, []);

  const sincronizar = useCallback(() => setCaret(input.current?.selectionStart ?? 0), []);
  useEffect(() => {
    if (!foco) return;
    document.addEventListener('selectionchange', sincronizar); // flechas, inicio, fin, clic y selección
    return () => document.removeEventListener('selectionchange', sincronizar);
  }, [foco, sincronizar]);

  // Ventana de iconos: se ven los últimos que caben (o los que rodean al cursor si se movió hacia atrás).
  const n = valor.length;
  const c = Math.min(caret, n);
  const inicio = Math.min(Math.max(0, n - cabe), c);
  const visibles = Math.min(cabe, n - inicio);

  // Un clic coloca el cursor según los iconos que se ven (los puntos reales del campo miden otra cosa).
  function alPulsar(e: MouseEvent<HTMLInputElement>) {
    const t = e.currentTarget;
    const z = zona.current;
    if (!z || t.selectionStart !== t.selectionEnd) return;
    const rel = Math.round((e.clientX - z.getBoundingClientRect().left) / PASO);
    const idx = Math.max(0, Math.min(n, inicio + rel));
    t.setSelectionRange(idx, idx);
    setCaret(idx);
  }

  return (
    <div className="relative mt-1">
      <input
        ref={input}
        id={id}
        type="password"
        value={valor}
        onChange={(e) => {
          onCambio(e.target.value);
          setCaret(e.target.selectionStart ?? e.target.value.length);
        }}
        onFocus={() => setFoco(true)}
        onBlur={() => setFoco(false)}
        onClick={alPulsar}
        autoComplete={autoComplete}
        aria-invalid={invalido ? true : undefined}
        aria-describedby={describedBy}
        className={`${className} clave-oculta`}
      />
      {/* Misma caja interior que el campo (borde de 2 px y relleno horizontal de 0,75 rem). */}
      <div ref={zona} aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-[calc(2px+0.75rem)] right-[calc(2px+0.75rem)] flex items-center overflow-hidden text-texto">
        <div className="relative flex h-4" style={{ gap: SEP }}>
          {Array.from({ length: visibles }, (_, k) => (
            <Icono key={inicio + k} i={iconoDe(orden, inicio + k)} />
          ))}
          {foco && <span className="cursor-campo absolute top-0 h-4 w-[2px] bg-current" style={{ left: (c - inicio) * PASO - SEP / 2 - 1 }} />}
        </div>
      </div>
    </div>
  );
}
