import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Estado from './pages/Estado';
import Inicio from './pages/Inicio';
import Login from './pages/Login';
import NoEncontrada from './pages/NoEncontrada';
import Pendiente from './pages/Pendiente';

// Mapa del sitio (Figma, Sprint 0). Las pantallas sin lógica todavía son marcadores del sprint que las implementa.
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Inicio />} />
        <Route path="login" element={<Login />} />
        <Route path="registro" element={<Pendiente titulo="Crear cuenta" descripcion="Regístrate con tu correo o con Google." sprint="Sprint 1" />} />
        <Route path="registro/username" element={<Pendiente titulo="Elige tu username" descripcion="Último paso para completar tu registro con Google." sprint="Sprint 1" />} />
        <Route path="dashboard" element={<Pendiente titulo="Mis Salas" descripcion="Aquí verás las Salas que has creado y podrás unirte a otra por ID." sprint="Sprint 2" />} />
        <Route path="salas/:id" element={<Pendiente titulo="Sala" descripcion="Video, chat y pantalla compartida de tu Sala." sprint="Sprint 3" />} />
        <Route path="perfil" element={<Pendiente titulo="Mi perfil" descripcion="Edita tu nombre, avatar y username, o elimina tu cuenta." sprint="Sprint 2" />} />
        <Route path="estado" element={<Estado />} />
        <Route path="ayuda" element={<Pendiente titulo="Ayuda" descripcion="Cómo crear una Sala, unirte y usar los controles." sprint="Sprint 6" />} />
        <Route path="accesibilidad" element={<Pendiente titulo="Declaración de accesibilidad" descripcion="Nuestro compromiso con WCAG 2.2 nivel AA." sprint="Sprint 6" />} />
        <Route path="*" element={<NoEncontrada />} />
      </Route>
    </Routes>
  );
}
