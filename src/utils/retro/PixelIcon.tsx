// Iconos pixel art dibujados con rectángulos SVG a partir de un mapa de bits (# = píxel encendido).
// Se usan dentro de un <svg>: devuelven un <g> centrado en (x, y), con cada píxel de `escala` unidades.
// Flechas: se dibuja la de la derecha y las demás salen de ella (transpuesta = abajo, volteada = arriba).
const FLECHA_DERECHA = [
  '...........',
  '......##...',
  '.......##..',
  '........##.',
  '.........##',
  '###########',
  '.........##',
  '........##.',
  '.......##..',
  '......##...',
  '...........',
];
const transponer = (f: readonly string[]) => [...f[0]].map((_, c) => f.map((fila) => fila[c]).join(''));
const FLECHA_ABAJO = transponer(FLECHA_DERECHA);
const FLECHA_ARRIBA = [...FLECHA_ABAJO].reverse();

const ICONOS = {
  flechaDerecha: FLECHA_DERECHA,
  flechaAbajo: FLECHA_ABAJO,
  flechaArriba: FLECHA_ARRIBA,
  microfono: [
    '....###....',
    '...#####...',
    '...#####...',
    '...#####...',
    '#..#####..#',
    '#..#####..#',
    '.#.#####.#.',
    '..#######..',
    '.....#.....',
    '.....#.....',
    '...#####...',
  ],
  camara: [
    '...........',
    '...........',
    '#######....',
    '#.....#..##',
    '#.....#.#.#',
    '#.....###.#',
    '#.....#.#.#',
    '#.....#..##',
    '#######....',
    '...........',
    '...........',
  ],
  presentar: [
    '...........',
    '###########',
    '#.........#',
    '#....#....#',
    '#...###...#',
    '#..#.#.#..#',
    '#....#....#',
    '###########',
    '.....#.....',
    '..#######..',
    '...........',
  ],
  chat: [
    '...........',
    '.#########.',
    '#.........#',
    '#.........#',
    '#..#.#.#..#',
    '#.........#',
    '#.........#',
    '.#########.',
    '..##.......',
    '..#........',
    '...........',
  ],
  colgar: [
    '...........',
    '...........',
    '..#######..',
    '.#########.',
    '###.....###',
    '###.....###',
    '###.....###',
    '...........',
    '...........',
    '...........',
    '...........',
  ],
  fotoCamara: [
    '...........',
    '...###.....',
    '###########',
    '#.........#',
    '#...###...#',
    '#..#...#..#',
    '#..#...#..#',
    '#...###...#',
    '#.........#',
    '###########',
    '...........',
  ],
  visto: [
    '...........',
    '........##.',
    '.......###.',
    '......###..',
    '##...###...',
    '###.###....',
    '.#####.....',
    '..###......',
    '...#.......',
    '...........',
    '...........',
  ],
  equis: [
    '...........',
    '.##.....##.',
    '..##...##..',
    '...##.##...',
    '....###....',
    '...##.##...',
    '..##...##..',
    '.##.....##.',
    '...........',
    '...........',
    '...........',
  ],
  letraE: [
    '...........',
    '...........',
    '...#####...',
    '...##......',
    '...##......',
    '...####....',
    '...##......',
    '...##......',
    '...#####...',
    '...........',
    '...........',
  ],
  puntos: [
    '...........',
    '...........',
    '...........',
    '...........',
    '...........',
    '..##.##.##.',
    '..##.##.##.',
    '...........',
    '...........',
    '...........',
    '...........',
  ],
} as const;

export type NombreIcono = keyof typeof ICONOS;

export function PixelIcon({ nombre, x, y, escala = 2, className }: { nombre: NombreIcono; x: number; y: number; escala?: number; className?: string }) {
  const filas = ICONOS[nombre];
  const lado = filas.length * escala;
  return (
    <g className={className} transform={`translate(${x - lado / 2} ${y - lado / 2})`} shapeRendering="crispEdges" aria-hidden="true">
      {filas.flatMap((fila, r) =>
        [...fila.matchAll(/#+/g)].map((m) => (
          <rect key={`${r}-${m.index}`} x={m.index! * escala} y={r * escala} width={m[0].length * escala} height={escala} />
        )),
      )}
    </g>
  );
}

/** Un icono pixel suelto (fuera de un <svg> propio): toma el color del texto y mide 11 píxeles × `escala`. */
export function IconoPixel({ nombre, escala = 2, className }: { nombre: NombreIcono; escala?: number; className?: string }) {
  const lado = ICONOS[nombre].length * escala;
  return (
    <svg width={lado} height={lado} viewBox={`0 0 ${lado} ${lado}`} fill="currentColor" aria-hidden="true" focusable="false" className={className}>
      <PixelIcon nombre={nombre} x={lado / 2} y={lado / 2} escala={escala} />
    </svg>
  );
}
