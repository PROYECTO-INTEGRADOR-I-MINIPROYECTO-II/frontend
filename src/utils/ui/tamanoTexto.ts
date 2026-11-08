// Tamaño de letra según la cantidad de caracteres, para textos que bajan de línea y se hacen más pequeños en vez de desbordarse.
// [hasta N caracteres, píxeles]. Press Start 2P se ve mejor en múltiplos de 8.
export const TAMANOS_TEXTO = {
  pixel: [[18, 16], [30, 12], [44, 10], [Infinity, 8]],
  clara: [[22, 20], [40, 16], [Infinity, 14]],
} as const;

export const FUENTE_CLASE = { pixel: 'font-monokuro', clara: 'font-sans font-medium' } as const;

export const tamanoPara = (largo: number, clara: boolean) => (clara ? TAMANOS_TEXTO.clara : TAMANOS_TEXTO.pixel).find(([max]) => largo <= max)![1];
export const interlineadoPara = (tam: number, clara: boolean) => (clara ? Math.round(tam * 1.5) : tam * 2);
