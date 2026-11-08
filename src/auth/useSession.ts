import { useMemo, useSyncExternalStore } from 'react';
import { analizarNombre, analizarUsername, CORREO, NOMBRE_MAX_TOTAL } from './validaciones';

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
  /** La cuenta está vinculada con Google (se creó con Google o se vinculó después). */
  google?: boolean;
  /** Se creó con Google: Google es su único método de acceso (no tiene contraseña), así que no se puede desvincular. */
  creadaConGoogle?: boolean;
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
const MAX_BYTES = 100_000; // tope de lo que se acepta leer o escribir en el almacenamiento
const crudo = () => {
  try {
    return localStorage.getItem(CLAVE);
  } catch {
    return null;
  }
};

// ---- Protección contra «storage poisoning» --------------------------------------------------------------------------------
// El almacenamiento del navegador lo puede editar cualquiera (la consola, una extensión, otra pestaña), así que lo que se lee no es
// de fiar, y lo que se escribe viene de campos del usuario. Por eso todo pasa por `limpiarUsuario`, que no copia el objeto: construye
// uno nuevo con solo los campos conocidos, de tipo correcto, con forma y largo válidos; si algo no cuadra, se descarta todo.
// Esto es solo para la sesión simulada: con Firebase y la API (Sprint 1) la sesión sale del ID token verificado, no de aquí.
const SIN_CONTROL = /\p{Cc}/gu;
const texto = (v: unknown, max: number): string | null => (typeof v === 'string' && v.length <= max ? v.replace(SIN_CONTROL, '') : null);
const nombreValido = (v: unknown): string | null => {
  const t = texto(v, NOMBRE_MAX_TOTAL);
  return t !== null && analizarNombre(t).tipo !== 'invalido' ? t : null;
};
// Una foto es nula o una dirección que el navegador puede mostrar sin riesgo: https, una imagen incrustada o un recurso del propio sitio.
const fotoValida = (v: unknown): string | null | undefined => {
  if (v === null || v === undefined) return null;
  const t = texto(v, MAX_BYTES);
  if (t === null) return undefined;
  const ok = /^https:\/\/[^\s"'<>]+$/.test(t) || /^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(t) || (t.startsWith('/') && !t.startsWith('//') && !/[\s"'<>\\]/.test(t));
  return ok ? t : undefined;
};

export function limpiarUsuario(v: unknown): Usuario | null {
  if (typeof v !== 'object' || v === null || Array.isArray(v)) return null;
  const o = v as Record<string, unknown>;
  const username = o.username === null ? null : typeof o.username === 'string' && analizarUsername(o.username).tipo === 'ok' ? o.username : undefined;
  const nombres = nombreValido(o.nombres);
  const apellidos = nombreValido(o.apellidos);
  const foto = fotoValida(o.foto);
  const correo = o.correo === undefined ? undefined : texto(o.correo, 254);
  if (username === undefined || nombres === null || apellidos === null || foto === undefined || correo === null) return null;
  if (correo !== undefined && !CORREO.test(correo)) return null;
  return { username, nombres, apellidos, foto, ...(correo !== undefined && { correo }), google: o.google === true, creadaConGoogle: o.creadaConGoogle === true };
}

// La sesión se vuelve a leer cuando se guarda o se cierra, así el pie y las rutas reaccionan sin recargar.
export function useSession(): Session {
  const guardado = useSyncExternalStore(suscribir, crudo);
  return useMemo(() => {
    if (import.meta.env.VITE_DEMO_SESION === 'true') return { user: { username: 'demo', nombres: 'Demo', apellidos: 'Usuario', foto: null } };
    if (!guardado || guardado.length > MAX_BYTES) return { user: null };
    try {
      return { user: limpiarUsuario(JSON.parse(guardado)) }; // un valor alterado o con otra forma se trata como sin sesión
    } catch {
      return { user: null };
    }
  }, [guardado]);
}

export function guardarSesionDemo(usuario: Usuario) {
  const limpio = limpiarUsuario(usuario);
  if (!limpio) return; // datos que no pasan la validación nunca se guardan
  try {
    const serializado = JSON.stringify(limpio);
    // NOSONAR (S8475): `limpio` salió de `limpiarUsuario` (campos conocidos, tipo, forma y largo validados); el análisis de Sonar no sigue esa validación.
    if (serializado.length <= MAX_BYTES) localStorage.setItem(CLAVE, serializado); // NOSONAR
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
