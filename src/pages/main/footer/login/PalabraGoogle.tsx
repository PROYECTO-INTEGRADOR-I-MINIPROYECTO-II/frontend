import TextoOndulante from '../../../../utils/retro/TextoOndulante';

// Colores del logo de Google, letra por letra: G azul, o roja, o amarilla, g azul, l verde, e roja.
const COLOR_GOOGLE = ['text-g-azul', 'text-g-rojo', 'text-g-amarillo', 'text-g-azul', 'text-g-verde', 'text-g-rojo'];

// La palabra «Google» con la ondulación por letra y los colores de su logo; el resto del texto de la opción es blanco como las demás.
export default function PalabraGoogle() {
  return <TextoOndulante texto="Google" linea={false} claseLetra={(i) => COLOR_GOOGLE[i]} />;
}
