import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

// Marcador del Sprint 1. La creación de cuenta vive aquí y no en la portada.
export default function Login() {
  useDocumentTitle('Ingresar');

  return (
    <div className="mx-auto max-w-md px-5 py-16 text-center">
      <h1 className="text-4xl font-semibold tracking-tight">Ingresar</h1>
      <p className="mt-3 text-texto-secundario">Entra a tu cuenta para ver tus Salas.</p>
      <p className="mt-6 rounded-xl bg-primario-suave p-4 text-texto-secundario">
        El formulario estará disponible en el Sprint 1.
      </p>
      <p className="mt-8 text-texto-secundario">
        ¿No tienes cuenta?{' '}
        <Link to="/registro" className="text-texto underline underline-offset-4">Crear cuenta</Link>
      </p>
    </div>
  );
}
