import { useMemo } from 'react';

// Sprites pixel art (blanco y negro) de objetos de reuniones virtuales.
const modulos = import.meta.glob('../../../assets/sprites/*.png', { eager: true, import: 'default' }) as Record<string, string>;
// Proporción alto/ancho de cada sprite, para calcular el espacio que ocupa sin esperar a que cargue la imagen.
const ASPECTO: Record<string, number> = {
  'sprite_01.png': 1.369,
  'sprite_02.png': 1.673,
  'sprite_03.png': 0.787,
  'sprite_04.png': 0.769,
  'sprite_05.png': 0.83,
  'sprite_06.png': 1.622,
  'sprite_07.png': 0.784,
  'sprite_08.png': 0.89,
  'sprite_09.png': 0.509,
  'sprite_10.png': 1.066,
  'sprite_11.png': 1.714,
  'sprite_12.png': 1.02,
  'sprite_13.png': 1.225,
  'sprite_14.png': 1.404,
  'sprite_15.png': 0.374,
  'sprite_16.png': 0.989,
  'sprite_17.png': 1.406,
  'sprite_18.png': 1.044,
};
const SPRITES = Object.entries(modulos).map(([ruta, src]) => ({ src, aspecto: ASPECTO[ruta.split('/').pop() ?? ''] ?? 1 }));

const ANCHO_PISTA = 3000; // px; debe superar el ancho de pantalla para que el bucle no deje huecos
const CANTIDAD = 28;
const ALTO = 190; // px aproximados del panel superior

interface Colocado {
  src: string;
  alto: number;
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
  // Radio que envuelve al sprite aun rotado (la rotación llega a ±28°).
  const radio = (w: number, h: number) => Math.hypot(w, h) * 0.5;
  for (let i = 0; i < CANTIDAD; i++) {
    const { src, aspecto } = barajados[i % barajados.length];
    for (let intento = 0; intento < 150; intento++) {
      const size = rnd(50, 130);
      const alto = size * aspecto;
      const left = rnd(0, ANCHO_PISTA - size);
      const top = rnd(-alto * 0.3, ALTO - alto * 0.7);
      const r = radio(size, alto);
      const cx = left + size / 2;
      const cy = top + alto / 2;
      const libre = puestos.every((o) => {
        const ocx = o.left + o.size / 2;
        const dx = Math.min(Math.abs(cx - ocx), ANCHO_PISTA - Math.abs(cx - ocx));
        return Math.hypot(dx, cy - (o.top + o.alto / 2)) > r + radio(o.size, o.alto);
      });
      if (libre) {
        puestos.push({ src, alto, left, top, size, rot: rnd(-28, 28), blur: rnd(1, 3), op: rnd(0.22, 0.45) });
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
