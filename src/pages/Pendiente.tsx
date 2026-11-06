import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

interface Props {
  titulo: string;
  descripcion: string;
  sprint: string;
}

// Pantalla del mapa del sitio cuya funcionalidad se implementa en un sprint posterior.
export default function Pendiente({ titulo, descripcion, sprint }: Props) {
  useDocumentTitle(titulo);

  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <h1 className="text-4xl font-bold">{titulo}</h1>
      <p className="mt-3 text-texto-secundario">{descripcion}</p>
      <p className="mt-6 rounded-lg bg-primario-suave p-4 text-primario-hover">
        Esta pantalla estará disponible en el {sprint}.
      </p>
      <Link to="/" className="btn-secundario mt-6">Ir al inicio</Link>
    </div>
  );
}
