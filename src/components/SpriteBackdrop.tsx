import { useMemo } from 'react';

// Sprites pixel art (blanco y negro) de objetos de reuniones virtuales.
const modulos = import.meta.glob('../assets/sprites/*.png', { eager: true, import: 'default' }) as Record<string, string>;
const SPRITES = Object.values(modulos);

const ANCHO_PISTA = 3000; // px; debe superar el ancho de pantalla para que el bucle no deje huecos
const CANTIDAD = 28;
const ALTO = 190; // px aproximados del panel superior

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

// Reparte los sprites por la pista con tamaño, rotación y desenfoque aleatorios (distinto en cada carga).
// Cada posición se prueba contra las ya colocadas (con la pista como círculo, sin cruzar el borde) para evitar que se solapen.
function generar(): Colocado[] {
  const barajados = [...SPRITES].sort(() => Math.random() - 0.5);
  const puestos: Colocado[] = [];
  for (let i = 0; i < CANTIDAD; i++) {
    for (let intento = 0; intento < 150; intento++) {
      const size = rnd(50, 130);
      const left = rnd(0, ANCHO_PISTA - size);
      const top = rnd(-size * 0.3, ALTO - size * 0.7);
      const r = size * 0.72;
      const cx = left + size / 2;
      const cy = top + size / 2;
      const libre = puestos.every((o) => {
        const ro = o.size * 0.72;
        const dx = Math.min(Math.abs(cx - (o.left + o.size / 2)), ANCHO_PISTA - Math.abs(cx - (o.left + o.size / 2)));
        const dy = cy - (o.top + o.size / 2);
        return Math.hypot(dx, dy) > r + ro;
      });
      if (libre) {
        puestos.push({ src: barajados[i % barajados.length], left, top, size, rot: rnd(-180, 180), blur: rnd(1, 3), op: rnd(0.22, 0.45) });
        break;
      }
    }
  }
  return puestos;
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
            top: s.top,
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
