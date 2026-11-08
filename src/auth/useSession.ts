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

let secuencia = 0; // cada petición de perfil lleva un número: una respuesta vieja (otra petición o cierre de sesión) se descarta

/** Vuelve a pedir el perfil a la API (tras crear la cuenta, guardar cambios, vincular…), actualiza la sesión y lo devuelve (null = sin sesión). */
export async function refrescarSesion(): Promise<Usuario | null> {
  const fb = auth.currentUser;
  const n = ++secuencia;
  if (!fb) {
    poner({ cargando: false, user: null });
    return null;
  }
  let user: Usuario | null;
  try {
    const y = await api<Yo>('/api/usuarios/yo');
    user = { username: y.username, nombres: y.nombres, apellidos: y.apellidos, foto: y.foto, correo: y.correo, google: y.proveedores.includes('google.com'), creadaConGoogle: !y.proveedores.includes('password') };
  } catch {
    user = estado.user; // un fallo de la API (red, 5xx) no cierra la sesión: se conserva lo que había y se deja de «cargar»
  }
  if (n !== secuencia || auth.currentUser?.uid !== fb.uid) return estado.user; // llegó tarde: ya hay algo más reciente
  poner({ cargando: false, user });
  return user;
}

export async function cerrarSesion() {
  await signOut(auth);
}

onAuthStateChanged(auth, () => void refrescarSesion()); // sin usuario también pasa por aquí: sube la secuencia y descarta lo pendiente

export function useSession(): Session {
  return useSyncExternalStore(suscribir, () => estado);
}
