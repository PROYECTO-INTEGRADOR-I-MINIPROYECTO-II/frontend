import { UserRound } from 'lucide-react';
import { useSession } from '../../../auth/useSession';
import { sugerirUsername } from '../../../auth/validaciones';
import TextoOndulante from '../../../utils/retro/TextoOndulante';
import { useLoginPanel } from './loginPanelContext';

// Entrada de cuenta del pie. Con sesión, «Cuenta» abre el panel en «Editar perfil» (o en elegir username si falta) sin cambiar de ruta,
// así se puede abrir y cerrar las veces que se quiera; sin sesión, el texto «Iniciar sesión» (con ondulación por letra) abre el panel de acceso.
export default function CuentaEnlace({ className = '' }: { className?: string }) {
  const { cargando, user } = useSession();
  const { abierto, alternar, cerrar, abrirPerfil, abrirUsername } = useLoginPanel();

  if (cargando) return null; // aún no se sabe si hay sesión: evita mostrar «Iniciar sesión» un instante a quien sí la tiene

  if (user) {
    const abrirCuenta = () => {
      if (abierto) return cerrar();
      const datos = { nombres: user.nombres, apellidos: user.apellidos, foto: user.foto };
      if (user.username) abrirPerfil('editar', { username: user.username, ...datos }, user.correo);
      else abrirUsername({ username: sugerirUsername(user.nombres, user.apellidos), ...datos }, user.correo);
    };
    return (
      <button
        type="button"
        data-login-opener
        aria-haspopup="dialog"
        aria-expanded={abierto}
        aria-controls="panel-login"
        onClick={abrirCuenta}
        className={`inline-flex items-center gap-2 text-left ${className}`}
      >
        <UserRound aria-hidden="true" className="size-5" />
        Cuenta
      </button>
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
