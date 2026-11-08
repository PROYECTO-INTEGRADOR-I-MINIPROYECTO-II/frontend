import { UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSession } from '../../../auth/useSession';
import TextoOndulante from '../../../utils/retro/TextoOndulante';
import { useLoginPanel } from './loginPanelContext';

// Entrada de cuenta del pie: icono «Cuenta» con sesión; sin sesión, el texto «Iniciar sesión» (con ondulación por letra)
// que abre el panel de inicio de sesión sobre el pie.
export default function CuentaEnlace({ className = '' }: { className?: string }) {
  const { user } = useSession();
  const { abierto, alternar } = useLoginPanel();

  if (user) {
    return (
      <Link to="/perfil" className={`inline-flex items-center gap-2 ${className}`}>
        <UserRound aria-hidden="true" className="size-5" />
        Cuenta
      </Link>
    );
  }

  return (
    <button
      type="button"
      data-login-opener
      aria-haspopup="dialog"
      aria-expanded={abierto}
      aria-controls="panel-login"
      onClick={alternar}
      className={`group text-left ${className}`}
    >
      <TextoOndulante
        texto="Iniciar sesión"
        className="text-acento-claro transition-colors group-hover:text-texto group-focus-visible:text-texto"
      />
    </button>
  );
}
