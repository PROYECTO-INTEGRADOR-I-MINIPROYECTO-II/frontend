import { useEffect, useRef, useState } from 'react';
import { Check, Lock, LockOpen } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import LedMarquee from './LedMarquee';

const led = 'flex items-center justify-center gap-4 font-pixel text-xl font-semibold tracking-widest text-led md:text-2xl';

// Campo que funciona como botón de inicio de sesión: letrero en reposo, candado animado al apuntarlo y check al pulsarlo.
export default function LedLoginField() {
  const navigate = useNavigate();
  const [done, setDone] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function go(e: React.MouseEvent) {
    e.preventDefault();
    if (done) return;
    setDone(true);
    timer.current = window.setTimeout(() => navigate('/login'), 900);
  }

  const fade = 'absolute inset-0 transition-opacity duration-300';
  return (
    <Link
      to="/login"
      onClick={go}
      className={`group relative block h-14 w-full overflow-hidden rounded-2xl border bg-superficie transition-shadow duration-300 md:h-16 ${
        done ? 'led-glow border-led' : 'border-led/55 led-glow-soft hover:led-glow hover:border-led focus-visible:led-glow'
      }`}
    >
      <div
        aria-hidden="true"
        className={`${fade} ${done ? 'opacity-0' : 'group-hover:opacity-0 group-focus-visible:opacity-0'}`}
      >
        <LedMarquee />
      </div>

      <div
        aria-hidden="true"
        className={`${fade} ${led} led-mask ${done ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100'}`}
      >
        <span className="led-flicker relative size-7">
          {done ? (
            <Check className="absolute inset-0 size-7" strokeWidth={3} />
          ) : (
            <>
              <Lock className="lock-closed absolute inset-0 size-7" strokeWidth={2.5} />
              <LockOpen className="lock-open absolute inset-0 size-7" strokeWidth={2.5} />
            </>
          )}
        </span>
        <span className="led-flicker">INICIA SESIÓN</span>
        {/* Matriz de LEDs y líneas de barrido tipo CRT. */}
        <div className="led-dots absolute inset-0" />
        <div className="crt-scan absolute inset-0" />
      </div>
      <span className="sr-only">Inicia sesión</span>
      <span role="status" className="sr-only">{done ? 'Abriendo inicio de sesión' : ''}</span>
    </Link>
  );
}
