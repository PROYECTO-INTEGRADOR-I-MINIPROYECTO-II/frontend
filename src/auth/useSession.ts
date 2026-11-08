import { useSyncExternalStore } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { api } from '../api/base';
import { auth } from '../firebase';

export interface Usuario {
  /** null = el perfil aún no está completo (falta elegir el username). */
  username: string | null;
  nombres: string;
  apellidos: string;
  foto: string | null;
  correo?: string;
  /** La cuenta está vinculada con Google (se creó con Google o se vinculó después). */
  google?: boolean;
  /** Se creó con Google: Google es su único método de acceso (no tiene contraseña), así que no se puede desvincular. */
  creadaConGoogle?: boolean;
}
export interface Session {
  /** true hasta saber si hay sesión (Firebase restaura la sesión y se pide el perfil): mientras tanto nada debe redirigir. */
  cargando: boolean;
  user: Usuario | null;
}

interface Yo {
  username: string | null;
  nombres: string;
  apellidos: string;
  foto: string | null;
  correo: string;
  proveedores: string[];
}

let estado: Session = { cargando: true, user: null };
const oyentes = new Set<() => void>();
const poner = (s: Session) => {
  estado = s;
  oyentes.forEach((f) => f());
};
const suscribir = (f: () => void) => {
  oyentes.add(f);
  return () => void oyentes.delete(f);
};

/** Vuelve a pedir el perfil a la API (tras crear la cuenta, guardar cambios, vincular…) y actualiza la sesión. */
export async function refrescarSesion() {
  if (!auth.currentUser) return poner({ cargando: false, user: null });
  let user: Usuario | null = null;
  try {
    const y = await api<Yo>('/api/usuarios/yo');
    user = { username: y.username, nombres: y.nombres, apellidos: y.apellidos, foto: y.foto, correo: y.correo, google: y.proveedores.includes('google.com'), creadaConGoogle: !y.proveedores.includes('password') };
  } catch {
    /* sin perfil no hay sesión útil: se trata como sin sesión */
  }
  if (auth.currentUser) poner({ cargando: false, user }); // si mientras tanto cerró sesión, no se resucita
}

export async function cerrarSesion() {
  await signOut(auth);
}

onAuthStateChanged(auth, (fb) => (fb ? void refrescarSesion() : poner({ cargando: false, user: null })));

export function useSession(): Session {
  return useSyncExternalStore(suscribir, () => estado);
}
