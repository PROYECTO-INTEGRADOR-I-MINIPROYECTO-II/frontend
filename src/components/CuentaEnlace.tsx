import { UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSession } from '../auth/useSession';

const ETIQUETA = 'Iniciar sesión';

// Entrada de cuenta del pie: icono «Cuenta» con sesión; sin sesión, el texto «Iniciar sesión»
// con una ondulación por letra (en pasos, de poca amplitud) para que se distinga del resto.
export default function CuentaEnlace({ className = '' }: { className?: string }) {
  const { user } = useSession();

  if (user) {
    return (
      <Link to="/perfil" className={`inline-flex items-center gap-2 ${className}`}>
        <UserRound aria-hidden="true" className="size-5" />
        Cuenta
      </Link>
    );
  }

  return (
    <Link to="/login" className={className}>
      <span className="sr-only">{ETIQUETA}</span>
      <span aria-hidden="true" className="inline-flex text-[color-mix(in_srgb,var(--color-acento)_60%,white)]">
        {[...ETIQUETA].map((c, i) => (
          <span
            key={i}
            className="inline-block whitespace-pre motion-safe:animate-letra"
            style={{ animationDelay: `${i * 90}ms` }}
          >
            {c}
          </span>
        ))}
      </span>
    </Link>
  );
}
