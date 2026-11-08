import { useCallback, useState } from 'react';
import { comprobarDisponibilidad } from '../../../../auth/disponibilidadUsername';
import { analizarUsername, normalizarUsername } from '../../../../auth/validaciones';
import type { EstadoCampo } from '../../../../hooks/useEstadoCampo';

// Estado compartido del campo de username (registro manual, elegir username tras Google y editar el perfil): su valor, el estado que
// reporta el campo mientras se escribe (comprobación de disponibilidad) y la validación al enviar.
/** `actual`: el username que ya es de esta persona (al editar el perfil): cuenta como libre. */
export function useCampoUsername(id: string, inicial = '', actual?: string) {
  const [valor, setValor] = useState(inicial);
  const [estado, setEstado] = useState<EstadoCampo>('vacio');
  const [error, setError] = useState<string | undefined>();

  const cambiar = (v: string) => {
    setValor(v);
    setError(undefined);
  };
  const alEstado = useCallback((e: EstadoCampo) => setEstado(e), []);

  /** Valida al enviar: true si se puede continuar; si no, muestra el error y lleva el foco al campo. */
  function validar(): boolean {
    let mensaje: string | undefined;
    // «sin-comprobar»: la consulta falló; se deja continuar y el servidor confirma la unicidad al enviar.
    if (estado === 'vacio') mensaje = 'Escribe tu username.';
    else if (estado === 'verificando' || estado === 'escribiendo') mensaje = 'Espera un momento: estamos comprobando tu username.';
    else if (estado !== 'disponible' && estado !== 'sin-comprobar') mensaje = analizarUsername(valor.trim()).mensaje ?? 'Ese username ya está en uso. Prueba con otro.';
    setError(mensaje);
    if (mensaje) document.getElementById(id)?.focus();
    return !mensaje;
  }

  const verificar = (v: string) => (actual && normalizarUsername(v) === normalizarUsername(actual) ? Promise.resolve(true) : comprobarDisponibilidad(v));

  /** Para errores que vienen del servidor (p. ej. username ocupado al enviar): se muestran junto al campo y con el foco. */
  function ponerError(mensaje: string) {
    setError(mensaje);
    document.getElementById(id)?.focus();
  }

  return { id, valor, cambiar, estado, alEstado, error, validar, ponerError, verificar };
}

export type CampoUsernameEstado = ReturnType<typeof useCampoUsername>;
