import { useCallback, useEffect, useState } from 'react';
import fotoDePrueba from '../assets/imagen-prueba.png';

// Contrato del acceso con Google (iniciar sesión y crear cuenta). La interfaz solo conoce este resultado; en el Sprint 1 se sustituye
// `simular` por signInWithPopup de Firebase y se mapean sus errores a un motivo:
//   auth/popup-closed-by-user → cancelado · auth/popup-blocked → bloqueado
//   auth/account-exists-with-different-credential → cuenta-existente · auth/network-request-failed → red
export type MotivoErrorGoogle = 'cancelado' | 'bloqueado' | 'cuenta-existente' | 'red' | 'no-disponible';
/** Lo que Google entrega de la cuenta: con él se rellena el perfil (la foto puede faltar; el apellido puede venir vacío). */
export interface PerfilGoogle {
  nombres: string;
  apellidos: string;
  foto: string | null;
  correo: string;
}
export type ResultadoGoogle = { estado: 'espera' } | { estado: 'exito'; perfil: PerfilGoogle } | { estado: 'error'; motivo: MotivoErrorGoogle };

const ESPERA_MS = 2600; // tiempo de la espera simulada: deja ver cómo se arma el icono

// Mientras no haya Firebase: con ?google=… se fuerza un resultado para probar cada vista
// (espera = se queda esperando; exito; exito-foto = la cuenta trae foto; exito-sin-apellido; cancelado; bloqueado; cuenta-existente; red).
// Sin parámetro falla con «no-disponible».
function simular(forzado: string | null): ResultadoGoogle {
  if (forzado === 'exito') return { estado: 'exito', perfil: { nombres: 'Juan Carlos', apellidos: 'Pérez Gómez', foto: null, correo: 'juan.carlos@gmail.com' } };
  if (forzado === 'exito-foto') return { estado: 'exito', perfil: { nombres: 'Juan Carlos', apellidos: 'Pérez Gómez', foto: fotoDePrueba, correo: 'juan.carlos@gmail.com' } };
  if (forzado === 'exito-sin-apellido') return { estado: 'exito', perfil: { nombres: 'Sofía', apellidos: '', foto: null, correo: 'sofia@gmail.com' } };
  if (forzado === 'cancelado' || forzado === 'bloqueado' || forzado === 'cuenta-existente' || forzado === 'red') {
    return { estado: 'error', motivo: forzado };
  }
  return { estado: 'error', motivo: 'no-disponible' };
}

export function useAccesoGoogle(activo: boolean) {
  const [resultado, setResultado] = useState<ResultadoGoogle>({ estado: 'espera' });
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    if (!activo) return;
    setResultado({ estado: 'espera' });
    const forzado = new URLSearchParams(window.location.search).get('google');
    if (forzado === 'espera') return;
    const t = window.setTimeout(() => setResultado(simular(forzado)), ESPERA_MS);
    return () => window.clearTimeout(t);
  }, [activo, intento]);

  const reintentar = useCallback(() => setIntento((n) => n + 1), []);
  return { resultado, reintentar };
}
