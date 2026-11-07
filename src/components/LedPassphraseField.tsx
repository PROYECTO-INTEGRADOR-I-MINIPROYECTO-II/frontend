import { useLayoutEffect, useRef, useState } from 'react';

interface Props {
  id: string;
  value: string;
  onChange: (value: string) => void;
  describedBy?: string;
}

const texto = 'font-pixel text-xl font-semibold uppercase tracking-widest md:text-2xl';

// Campo de passphrase con estética LED. El cursor es propio (mismo tamaño vacío o escribiendo):
// se mide el texto con dos spans ocultos para colocarlo donde está la selección del campo real.
export default function LedPassphraseField({ id, value, onChange, describedBy }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const full = useRef<HTMLSpanElement>(null);
  const pre = useRef<HTMLSpanElement>(null);
  const [focused, setFocused] = useState(false);
  const [sel, setSel] = useState(0);
  const [x, setX] = useState(0);

  const syncSel = () => setSel(input.current?.selectionStart ?? value.length);

  useLayoutEffect(() => {
    if (!input.current || !full.current || !pre.current) return;
    const limit = input.current.clientWidth / 2 - 24; // px-6
    const pos = -full.current.offsetWidth / 2 + pre.current.offsetWidth;
    setX(Math.max(-limit, Math.min(limit, pos)));
  }, [value, sel, focused]);

  return (
    <div className="relative">
      <input
        ref={input}
        id={id}
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setSel(e.target.selectionStart ?? e.target.value.length);
        }}
        onSelect={syncSel}
        onFocus={() => {
          setFocused(true);
          syncSel();
        }}
        onBlur={() => setFocused(false)}
        aria-describedby={describedBy}
        autoComplete="off"
        autoCapitalize="none"
        spellCheck={false}
        className={`led-text led-glow-soft h-14 w-full rounded-2xl border border-led/55 bg-superficie px-6 text-center text-led caret-transparent transition-shadow duration-300 focus:led-glow focus:border-led focus:outline-none md:h-16 ${texto}`}
      />
      <span ref={full} aria-hidden="true" className={`invisible absolute whitespace-pre ${texto}`}>{value}</span>
      <span ref={pre} aria-hidden="true" className={`invisible absolute whitespace-pre ${texto}`}>{value.slice(0, sel)}</span>

      {(focused || value === '') && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 grid place-items-center">
          <span className="led-cursor h-6 w-1.5 bg-led md:h-7" style={{ transform: `translateX(${x}px)` }} />
        </div>
      )}
      <div aria-hidden="true" className="led-dots pointer-events-none absolute inset-0 rounded-2xl" />
      <div aria-hidden="true" className="crt-scan absolute inset-0 rounded-2xl" />
    </div>
  );
}
