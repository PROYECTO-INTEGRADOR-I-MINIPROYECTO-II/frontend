// Sprites pixel art (blanco y negro) de objetos de reuniones virtuales.
const modulos = import.meta.glob('../../assets/sprites/*.png', { eager: true, import: 'default' }) as Record<string, string>;
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
export const SPRITES = Object.entries(modulos).map(([ruta, src]) => ({ src, aspecto: ASPECTO[ruta.split('/').pop() ?? ''] ?? 1 }));

