import { Link } from 'react-router-dom';
import { useSession } from '../../../auth/useSession';
import TextoVivo from '../../../utils/retro/TextoVivo';

// «Mis salas» del pie (Panel). Sin sesión se ve en gris y no lleva a ningún lado (aria-disabled, enfocable para poder leer por qué);
// con sesión es un enlace a /dashboard. Mientras se restaura la sesión se muestra como inactivo para que el pie no salte.
export default function MisSalasEnlace({ className = '' }: { className?: string }) {
  const { cargando, user } = useSession();
  if (!cargando && user) {
    return (
      <Link to="/dashboard" className={`group ${className}`}>
        <TextoVivo>Mis salas</TextoVivo>
      </Link>
    );
  }
  return (
    <span aria-disabled="true" tabIndex={0} title="Inicia sesión para ver tus salas" className={`cursor-not-allowed text-texto-secundario/60 ${className}`}>
      <span className="vivo after:hidden">Mis salas</span>
      <span className="sr-only"> (disponible al iniciar sesión)</span>
    </span>
  );
}
