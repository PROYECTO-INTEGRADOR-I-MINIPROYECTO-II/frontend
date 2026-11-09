import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSession, type Usuario } from '../../auth/useSession';
import { sugerirUsername } from '../../auth/validaciones';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useLoginPanel } from '../main/footer/loginPanelContext';
import Inicio from '../inicio/Inicio';

// /registro/username (elegir el username) y /perfil (editar el perfil): muestran la portada con el panel abierto en esa vista, que vive
// en el pie. Elegir el username es obligatorio antes de usar nada privado (lo exige RutaPrivada); editar solo existe con la cuenta completa.
export default function PerfilRuta({ modo }: { modo: 'completar' | 'editar' }) {
  // Se decide una sola vez, cuando la sesión termina de cargar: al guardar el perfil la sesión cambia y esta ruta no debe volver a
  // redirigir (pisaría la navegación). undefined = aún cargando.
  const { cargando, user: actual } = useSession();
  const { pathname } = useLocation();
  const [user, setUser] = useState<Usuario | null | undefined>();
  useEffect(() => {
    if (!cargando) setUser((u) => (u === undefined ? actual : u));
  }, [cargando, actual]);
  const { abrirPerfil, abrirUsername } = useLoginPanel();
  useDocumentTitle(modo === 'editar' ? 'Editar perfil' : 'Completa tu perfil');

  useEffect(() => {
    if (!user) return; // cargando o sin sesión
    // Sin username: elegirlo (US-02). Con username: editar el perfil.
    if (modo === 'completar') {
      abrirUsername({ username: sugerirUsername(user.nombres, user.apellidos), nombres: user.nombres, apellidos: user.apellidos, foto: user.foto }, user.correo);
    } else {
      abrirPerfil('editar', { username: user.username ?? '', nombres: user.nombres, apellidos: user.apellidos, foto: user.foto }, user.correo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (user === null) return <Navigate to="/login" replace state={{ desde: pathname }} />;
  if (modo === 'completar' && user?.username) return <Navigate to="/perfil" replace />;
  return <Inicio />;
}
