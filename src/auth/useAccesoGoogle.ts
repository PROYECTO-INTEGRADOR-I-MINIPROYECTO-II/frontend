import { useCallback, useEffect, useState } from 'react';
import { GoogleAuthProvider, linkWithPopup, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase';
import { refrescarSesion } from './useSession';

// Contrato del acceso con Google (iniciar sesión, crear cuenta y vincular). La interfaz solo conoce este resultado. Los errores de
// Firebase se traducen a un motivo:
//   auth/popup-closed-by-user, auth/cancelled-popup-request → cancelado · auth/popup-blocked → bloqueado
//   auth/account-exists-with-different-credential, auth/credential-already-in-use → cuenta-existente · auth/network-request-failed → red
export type MotivoErrorGoogle = 'cancelado' | 'bloqueado' | 'cuenta-existente' | 'red' | 'no-disponible';
/** Lo que Google entrega de la cuenta: con él se rellena el perfil (la foto puede faltar; el apellido puede venir vacío). */
export interface PerfilGoogle {
  nombres: string;
  apellidos: string;
  foto: string | null;
  correo: string;
}
/** `username`: el que ya tiene la cuenta (null si aún no lo ha elegido: hay que pedirlo). */
export type ResultadoGoogle = { estado: 'espera' } | { estado: 'exito'; perfil: PerfilGoogle; username: string | null } | { estado: 'error'; motivo: MotivoErrorGoogle };

const MOTIVOS: Record<string, MotivoErrorGoogle> = {
  'auth/popup-closed-by-user': 'cancelado',
  'auth/cancelled-popup-request': 'cancelado',
  'auth/popup-blocked': 'bloqueado',
  'auth/account-exists-with-different-credential': 'cuenta-existente',
  'auth/credential-already-in-use': 'cuenta-existente',
  'auth/network-request-failed': 'red',
};

/** Abre la ventana de Google (con `vincular`, añade Google a la cuenta que ya tiene sesión) y pide el perfil a la API. */
async function acceder(vincular: boolean): Promise<ResultadoGoogle> {
  try {
    const proveedor = new GoogleAuthProvider();
    if (vincular && auth.currentUser) await linkWithPopup(auth.currentUser, proveedor);
    else await signInWithPopup(auth, proveedor);
  } catch (err) {
    return { estado: 'error', motivo: MOTIVOS[(err as { code?: string }).code ?? ''] ?? 'no-disponible' };
  }
  const user = await refrescarSesion();
  if (!user) return { estado: 'error', motivo: 'no-disponible' };
  return { estado: 'exito', username: user.username, perfil: { nombres: user.nombres, apellidos: user.apellidos, foto: user.foto, correo: user.correo ?? '' } };
}

export function useAccesoGoogle(activo: boolean, vincular = false) {
  const [resultado, setResultado] = useState<ResultadoGoogle>({ estado: 'espera' });
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    if (!activo) return;
    setResultado({ estado: 'espera' });
    let vigente = true;
    void acceder(vincular).then((r) => vigente && setResultado(r));
    return () => {
      vigente = false;
    };
  }, [activo, intento, vincular]);

  const reintentar = useCallback(() => setIntento((n) => n + 1), []);
  return { resultado, reintentar };
}
