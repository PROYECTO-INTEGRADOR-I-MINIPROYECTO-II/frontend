import { Route, Routes } from 'react-router-dom';
import RutaPrivada from './auth/RutaPrivada';
import Layout from './pages/main/Layout';
import Ajustes from './pages/ajustes/Ajustes';
import Estado from './pages/estado/Estado';
import Inicio from './pages/inicio/Inicio';
import Login from './pages/login/Login';
import NoEncontrada from './pages/no-encontrada/NoEncontrada';
import PerfilRuta from './pages/perfil/PerfilRuta';
import Pendiente from './pages/pendiente/Pendiente';

// Mapa del sitio (Figma, Sprint 0). Las pantallas sin lógica todavía son marcadores del sprint que las implementa.
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Inicio />} />
        <Route path="login" element={<Login fase="elegir" />} />
        <Route path="registro" element={<Login fase="registro" />} />
        <Route path="registro/username" element={<PerfilRuta modo="completar" />} />
        <Route path="dashboard" element={<RutaPrivada><Pendiente titulo="Mis Salas" descripcion="Aquí verás las Salas que has creado y podrás unirte a otra por ID." sprint="Sprint 2" /></RutaPrivada>} />
        <Route path="salas/:id" element={<RutaPrivada><Pendiente titulo="Sala" descripcion="Video, chat y pantalla compartida de tu Sala." sprint="Sprint 3" /></RutaPrivada>} />
        <Route path="perfil" element={<RutaPrivada><PerfilRuta modo="editar" /></RutaPrivada>} />
        <Route path="ajustes" element={<Ajustes />} />
        <Route path="estado" element={<Estado />} />
        <Route path="ayuda" element={<Pendiente titulo="Ayuda" descripcion="Cómo crear una Sala, unirte y usar los controles." sprint="Sprint 6" />} />
        <Route path="accesibilidad" element={<Pendiente titulo="Declaración de accesibilidad" descripcion="Nuestro compromiso con WCAG 2.2 nivel AA." sprint="Sprint 6" />} />
        <Route path="*" element={<NoEncontrada />} />
      </Route>
    </Routes>
  );
}
