import { useFuenteCampos } from '../../hooks/useFuenteCampos';
import { FUENTE_CLASE, interlineadoPara, tamanoPara } from './tamanoTexto';

// El nombre completo tal como lo verán los demás: grande, centrado y en la tipografía de los campos; si es largo, baja de línea y
// reduce la letra por tramos. Es solo una vista previa de lo escrito en los campos (por eso no se anuncia a los lectores de pantalla).
export default function NombreVisto({ texto }: { texto: string }) {
  const clara = useFuenteCampos() === 'clara';
  const tam = tamanoPara([...texto].length, clara);
  return (
    <p
      aria-hidden="true"
      className={`${clara ? FUENTE_CLASE.clara : FUENTE_CLASE.pixel} min-h-8 text-center [overflow-wrap:anywhere]`}
      style={{ fontSize: tam, lineHeight: `${interlineadoPara(tam, clara)}px` }}
    >
      {texto}
    </p>
  );
}
