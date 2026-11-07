import { useEffect, useRef } from 'react';
import { SPRITES } from '../../utils/sprites/sprites';

// Cuadrícula aleatoria de sprites sobre todo el fondo. Se dibuja dos veces en canvas: una capa casi apagada
// y otra más visible que solo se deja ver dentro de un radio alrededor del cursor (máscara radial por CSS).
const CELDA = 96; // px
const RADIO = 190; // px del halo
const OP_BASE = 0.07;
const OP_LUZ = 0.4;
const CASILLAS = 900; // tabla aleatoria; cada celda (col, fila) toma la suya por índice

interface Casilla {
  img: number; // índice en SPRITES, o -1 si la celda queda vacía
  tam: number;
  rot: number;
  dx: number;
  dy: number;
}

function sortear(): Casilla[] {
  return Array.from({ length: CASILLAS }, () => ({
    img: Math.random() < 0.3 ? -1 : Math.floor(Math.random() * SPRITES.length),
    tam: 38 + Math.random() * 22,
    rot: ((Math.random() * 2 - 1) * 20 * Math.PI) / 180,
    dx: (Math.random() * 2 - 1) * 8,
    dy: (Math.random() * 2 - 1) * 8,
  }));
}

export default function FondoSprites() {
  const base = useRef<HTMLCanvasElement>(null);
  const luz = useRef<HTMLCanvasElement>(null);
  const raiz = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cb = base.current;
    const cl = luz.current;
    const el = raiz.current;
    if (!cb || !cl || !el) return;

    const casillas = sortear();
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
          const cas = casillas[(f * 53 + k) % CASILLAS];
          if (cas.img < 0) continue;
          const im = imgs[cas.img];
          if (!im.complete || !im.naturalWidth) continue;
          const asp = im.naturalHeight / im.naturalWidth;
          const ancho = asp > 1 ? cas.tam / asp : cas.tam;
          const alto = ancho * asp;
          ctx.save();
          ctx.translate(k * CELDA + CELDA / 2 + cas.dx, f * CELDA + CELDA / 2 + cas.dy);
          ctx.rotate(cas.rot);
          ctx.drawImage(im, -ancho / 2, -alto / 2, ancho, alto);
          ctx.restore();
        }
      }
    }
    const todo = () => {
      if (!vivo) return;
      dibujar(cb, OP_BASE);
      dibujar(cl, OP_LUZ);
    };

    todo();
    imgs.forEach((i) => i.addEventListener('load', todo));
    window.addEventListener('resize', todo);

    // El halo sigue al cursor (una actualización por fotograma como máximo).
    let marco = 0;
    const mover = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
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
  }, []);

  return (
    <div ref={raiz} aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden [--luz:0]">
      <canvas ref={base} className="absolute inset-0 size-full" />
      <canvas
        ref={luz}
        className="absolute inset-0 size-full transition-opacity duration-300"
        style={{
          opacity: 'var(--luz)',
          maskImage: `radial-gradient(circle ${RADIO}px at var(--mx, -999px) var(--my, -999px), #000 0%, transparent 100%)`,
          WebkitMaskImage: `radial-gradient(circle ${RADIO}px at var(--mx, -999px) var(--my, -999px), #000 0%, transparent 100%)`,
        }}
      />
    </div>
  );
}
