// Pixel art 16×20, monocromático: monograma «UV» sobre un escudo. Marcador propio, no es el escudo oficial.
const GRID = [
  '################',
  '#..............#',
  '#..............#',
  '#..#..#..#..#..#',
  '#..#..#..#..#..#',
  '#..#..#..#..#..#',
  '#..#..#...##...#',
  '#..#..#...##...#',
  '#..####...##...#',
  '#..............#',
  '#..............#',
  '#.############.#',
  '#..............#',
  '.#............#.',
  '..#..........#..',
  '...#........#...',
  '....#......#....',
  '.....#....#.....',
  '......#..#......',
  '.......##.......',
];

export default function UnivalleIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 20"
      width="32"
      height="40"
      shapeRendering="crispEdges"
      fill="currentColor"
      className="shrink-0"
    >
      {GRID.flatMap((row, y) =>
        [...row].map((c, x) => (c === '#' ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" /> : null)),
      )}
    </svg>
  );
}
