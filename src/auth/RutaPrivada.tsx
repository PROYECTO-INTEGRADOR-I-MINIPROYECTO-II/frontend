import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSession } from './useSession';

// Guardián de las rutas privadas (Panel, Salas, Mi perfil). Sin sesión lleva a /login; con sesión pero sin identificador (perfil
// incompleto) lleva de vuelta a /registro/username, y no se puede entrar a nada privado hasta completarlo (US-02). Recuerda la ruta
// pedida en `state.desde` para volver a ella al terminar.
export default function RutaPrivada({ children }: { children: ReactNode }) {
  const { user } = useSession();
  const { pathname } = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ desde: pathname }} />;
  if (!user.username) return <Navigate to="/registro/username" replace state={{ desde: pathname }} />;
  return <>{children}</>;
}
