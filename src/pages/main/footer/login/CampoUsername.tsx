import { analizarUsername, USERNAME_MAX, USERNAME_MIN } from '../../../../auth/validaciones';
import CampoDestacado from '../../../../utils/ui/CampoDestacado';
import { MENSAJE_OCUPADO, type CampoUsernameEstado } from './useCampoUsername';

// El campo de username ya configurado (reglas, comprobación de disponibilidad, textos). Lo usan el registro, la vista de elegir
// username y el modo editar del perfil.
export default function CampoUsername({ u, selectorFuente = false }: { u: CampoUsernameEstado; selectorFuente?: boolean }) {
  return (
    <CampoDestacado
      id={u.id}
      etiqueta="Username"
      selectorFuente={selectorFuente}
      valor={u.valor}
      onCambio={u.cambiar}
      analizar={analizarUsername}
      verificar={u.verificar}
      mensajeOcupado={() => MENSAJE_OCUPADO}
      textoDisponible="Username disponible"
      error={u.error}
      onEstado={u.alEstado}
      ayuda={`Es único en Synk: ${USERNAME_MIN} a ${USERNAME_MAX} caracteres, sin espacios. No se puede repetir. En las Salas se mostrará tu nombre y apellidos, no el username.`}
      autoComplete="username"
    />
  );
}
