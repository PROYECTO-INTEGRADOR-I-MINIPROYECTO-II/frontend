import { useMemo, useSyncExternalStore } from 'react';

// Sesión simulada: el Sprint 1 la reemplaza por Firebase Auth y la API. Mientras tanto vive en el navegador para poder recorrer los
// flujos: al crear la cuenta se guarda aquí (y «Cerrar sesión» en Editar perfil la borra) y el pie muestra «Cuenta».
//   · VITE_DEMO_SESION=true en .env: sesión con perfil completo.
//   · localStorage 'synk:sesion-demo' con un usuario; con `username: null` simula una cuenta creada (p. ej. con Google) cuyo
//     perfil falta por completar: no puede entrar a rutas privadas y se le lleva a /registro/username.
export interface Usuario {
  /** null = el perfil aún no está completo (falta elegir el username). */
  username: string | null;
  nombres: string;
  apellidos: string;
  foto: string | null;
  correo?: string;
}
export interface Session {
  user: Usuario | null;
}

const CLAVE = 'synk:sesion-demo';
const oyentes = new Set<() => void>();
const avisar = () => oyentes.forEach((f) => f());
const suscribir = (f: () => void) => {
  oyentes.add(f);
  return () => void oyentes.delete(f);
};
const crudo = () => {
  try {
    return localStorage.getItem(CLAVE);
  } catch {
    return null;
  }
};

// La sesión se vuelve a leer cuando se guarda o se cierra, así el pie y las rutas reaccionan sin recargar.
export function useSession(): Session {
  const guardado = useSyncExternalStore(suscribir, crudo);
  return useMemo(() => {
    if (import.meta.env.VITE_DEMO_SESION === 'true') return { user: { username: 'demo', nombres: 'Demo', apellidos: 'Usuario', foto: null } };
    try {
      return { user: guardado ? (JSON.parse(guardado) as Usuario) : null };
    } catch {
      return { user: null };
    }
  }, [guardado]);
}

export function guardarSesionDemo(usuario: Usuario) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(usuario));
  } catch {
    /* sin almacenamiento: la sesión simulada dura solo esta visita */
  }
  avisar();
}

export function cerrarSesionDemo() {
  try {
    localStorage.removeItem(CLAVE);
  } catch {
    /* nada que borrar */
  }
  avisar();
}
