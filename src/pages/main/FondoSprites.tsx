import { useEffect, useRef, useState } from 'react';
import { SPRITES } from '../../utils/sprites/sprites';
import { useLoginPanel } from './footer/loginPanelContext';
import Destellos from './Destellos';

// Cuadrícula aleatoria de sprites sobre todo el fondo, con dos efectos que se pueden combinar (constante EFECTO):
//  · 'halo': una capa en canvas que solo se deja ver dentro de un radio alrededor del cursor (máscara radial por CSS).
//  · 'destellos': unos iconos (sprite y punto al azar, lejos de cualquier elemento de la página) suben hasta OP_LUZ de opacidad y vuelven
//    a 0, sin parar (Destellos). No usan la cuadrícula.
const EFECTO = 'destellos' as 'halo' | 'destellos' | 'ambos';
const HALO = EFECTO !== 'destellos';
const DESTELLOS_ON = EFECTO !== 'halo';
const CELDA = 96; // px
const RADIO = 190; // px del halo
const OP_BASE = 0.0;
const OP_LUZ = 0.25;
const CAJA = 48; // cada sprite se ajusta a una caja cuadrada fija, centrada en su celda
const CASILLAS = 900; // tabla aleatoria; cada celda (col, fila) toma la suya por índice

// Cada celda toma un sprite al azar (o queda vacía); posición y tamaño de la caja son fijos, sin giros.
function sortear(): number[] {
  return Array.from({ length: CASILLAS }, () => (Math.random() < 0.3 ? -1 : Math.floor(Math.random() * SPRITES.length)));
}

export default function FondoSprites() {
  const [casillas] = useState(sortear); // la misma cuadrícula para el halo y los destellos
  const base = useRef<HTMLCanvasElement>(null);
  const luz = useRef<HTMLCanvasElement>(null);
  const raiz = useRef<HTMLDivElement>(null);
  // Con el panel de acceso abierto (y la página atenuada) el halo del cursor se apaga y no reacciona al ratón.
  const { abierto } = useLoginPanel();
  const bloqueado = useRef(abierto);
  useEffect(() => {
    bloqueado.current = abierto;
    if (abierto) raiz.current?.style.setProperty('--luz', '0');
  }, [abierto]);

  useEffect(() => {
    const cb = base.current; // null si la capa base está apagada (OP_BASE = 0)
    const cl = luz.current;
    const el = raiz.current;
    if (!cl || !el) return;

    const imgs = SPRITES.map(({ src }) => {
      const i = new Image();
      i.src = src;
      return i;
    });
    let vivo = true;

    function dibujar(c: HTMLCanvasElement, opacidad: number) {
      const ctx = c.getContext('2d');
      if (!ctx) return;
      const dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const h = window.innerHeight;
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.imageSmoothingEnabled = false;
      ctx.globalAlpha = opacidad;
      const cols = Math.ceil(w / CELDA);
      const filas = Math.ceil(h / CELDA);
      for (let f = 0; f < filas; f++) {
        for (let k = 0; k < cols; k++) {
          const idx = casillas[(f * 53 + k) % CASILLAS];
          if (idx < 0) continue;
          const im = imgs[idx];
          if (!im.complete || !im.naturalWidth) continue;
          const esc = CAJA / Math.max(im.naturalWidth, im.naturalHeight);
          const ancho = im.naturalWidth * esc;
          const alto = im.naturalHeight * esc;
          ctx.drawImage(im, k * CELDA + (CELDA - ancho) / 2, f * CELDA + (CELDA - alto) / 2, ancho, alto);
        }
      }
    }
    const todo = () => {
      if (!vivo) return;
      if (cb) dibujar(cb, OP_BASE);
      dibujar(cl, OP_LUZ);
    };

    todo();
    imgs.forEach((i) => i.addEventListener('load', todo));
    window.addEventListener('resize', todo);

    // El halo sigue al cursor (una actualización por fotograma como máximo).
    let marco = 0;
    const mover = (e: PointerEvent) => {
      if (e.pointerType === 'touch' || bloqueado.current) return;
      cancelAnimationFrame(marco);
      marco = requestAnimationFrame(() => {
        el.style.setProperty('--mx', `${e.clientX}px`);
        el.style.setProperty('--my', `${e.clientY}px`);
        el.style.setProperty('--luz', '1');
      });
    };
    const salir = () => el.style.setProperty('--luz', '0');
    window.addEventListener('pointermove', mover);
    document.documentElement.addEventListener('pointerleave', salir);

    return () => {
      vivo = false;
      cancelAnimationFrame(marco);
      window.removeEventListener('resize', todo);
      window.removeEventListener('pointermove', mover);
      document.documentElement.removeEventListener('pointerleave', salir);
    };
  }, [casillas]);

  return (
    <div ref={raiz} data-fondo aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden [--luz:0]">
      {OP_BASE > 0 && <canvas ref={base} className="absolute inset-0 size-full" />}
      {HALO && (
        <canvas
          ref={luz}
          className="absolute inset-0 size-full transition-opacity duration-300"
          style={{
            opacity: 'var(--luz)',
            maskImage: `radial-gradient(circle ${RADIO}px at var(--mx, -999px) var(--my, -999px), #000 0%, transparent 100%)`,
            WebkitMaskImage: `radial-gradient(circle ${RADIO}px at var(--mx, -999px) var(--my, -999px), #000 0%, transparent 100%)`,
          }}
        />
      )}
      {DESTELLOS_ON && <Destellos caja={CAJA} opacidad={OP_LUZ} />}
    </div>
  );
}
