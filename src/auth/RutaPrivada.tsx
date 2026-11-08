import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import Mensaje from '../utils/ui/Mensaje';
import { useSession } from './useSession';

// Guardián de las rutas privadas (Panel, Salas, Mi perfil). Sin sesión lleva a /login; con sesión pero sin identificador (perfil
// incompleto) lleva de vuelta a /registro/username, y no se puede entrar a nada privado hasta completarlo (US-02). Recuerda la ruta
// pedida en `state.desde` para volver a ella al terminar.
export default function RutaPrivada({ children }: { children: ReactNode }) {
  const { cargando, user } = useSession();
  const { pathname } = useLocation();
  // Mientras Firebase restaura la sesión no se sabe si hay alguien: no se redirige (si no, recargar una ruta privada mandaría a /login).
  if (cargando) return <Mensaje tipo="info" className="p-8 text-center">Cargando tu sesión…</Mensaje>;
  if (!user) return <Navigate to="/login" replace state={{ desde: pathname }} />;
  if (!user.username) return <Navigate to="/registro/username" replace state={{ desde: pathname }} />;
  return <>{children}</>;
}
