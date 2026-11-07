import { useMemo } from 'react';

// Sprites pixel art (blanco y negro) de objetos de reuniones virtuales.
const modulos = import.meta.glob('../assets/sprites/*.png', { eager: true, import: 'default' }) as Record<string, string>;
const SPRITES = Object.values(modulos);

const ANCHO_PISTA = 3000; // px; debe superar el ancho de pantalla para que el bucle no deje huecos
const CANTIDAD = 16;

interface Colocado {
  src: string;
  left: number;
  top: number;
  size: number;
  rot: number;
  blur: number;
  op: number;
}

const rnd = (min: number, max: number) => min + Math.random() * (max - min);

// Reparte los sprites a lo largo de la pista con posición, tamaño, rotación y desenfoque aleatorios (distinto en cada carga).
function generar(): Colocado[] {
  const barajados = [...SPRITES].sort(() => Math.random() - 0.5);
  const paso = ANCHO_PISTA / CANTIDAD;
  return Array.from({ length: CANTIDAD }, (_, i) => ({
    src: barajados[i % barajados.length],
    left: i * paso + rnd(-paso * 0.25, paso * 0.25),
    top: rnd(-15, 75),
    size: rnd(44, 120),
    rot: rnd(-28, 28),
    blur: rnd(1, 3),
    op: rnd(0.22, 0.45),
  }));
}

// Fondo decorativo del panel superior: franja de sprites desenfocados que se desplaza en horizontal.
export default function SpriteBackdrop() {
  const colocados = useMemo(generar, []);
  const grupo = (clave: string) => (
    <div key={clave} className="relative h-full shrink-0" style={{ width: ANCHO_PISTA }}>
      {colocados.map((s, i) => (
        <img
          key={i}
          src={s.src}
          alt=""
          className="absolute h-auto [image-rendering:pixelated] mix-blend-screen"
          style={{
            left: s.left,
            top: `${s.top}%`,
            width: s.size,
            opacity: s.op,
            filter: `blur(${s.blur}px)`,
            transform: `rotate(${s.rot}deg)`,
          }}
        />
      ))}
    </div>
  );

  return (
    <div aria-hidden="true" className="sprite-fade pointer-events-none absolute inset-0 overflow-hidden">
      <div className="motion-safe:animate-sprites flex h-full w-max">
        {grupo('a')}
        {grupo('b')}
      </div>
    </div>
  );
}
