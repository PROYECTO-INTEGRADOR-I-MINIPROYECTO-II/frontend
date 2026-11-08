import { auth } from '../firebase';

export interface BaseInfo {
  mensaje: string;
  actualizado?: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    /** Código de la API (p. ej. USERNAME_TAKEN): es para el código, nunca se muestra. */
    readonly code?: string,
    /** Campo del formulario al que se refiere el error. */
    readonly campo?: string,
  ) {
    super(message);
  }
}

export const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

export async function fetchBase(signal?: AbortSignal): Promise<BaseInfo> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/base`, { signal });
  } catch (err) {
    if (signal?.aborted) throw err;
    throw new ApiError('No pudimos conectar con el servidor. Revisa tu conexión e intenta de nuevo.');
  }
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(body?.error?.message ?? `Error ${res.status} al consultar la API.`, res.status);
  }
  // Una respuesta 200 que no es JSON (p. ej. el index.html de la propia web cuando VITE_API_URL no apunta a la API) no debe llegar
  // como un error de parseo: se explica en palabras y cuenta como «la API no respondió».
  try {
    return await res.json();
  } catch {
    throw new ApiError('El servidor respondió algo que no esperábamos. Intenta de nuevo en un momento.');
  }
}

// Llamada a la API con la sesión: añade el ID token si hay alguien dentro y traduce `{error:{code,message,campo}}` a ApiError.
// Una respuesta 204 devuelve undefined.
export async function api<T = unknown>(ruta: string, { method = 'GET', body }: { method?: string; body?: unknown } = {}): Promise<T> {
  const token = await auth.currentUser?.getIdToken();
  let res: Response;
  try {
    res = await fetch(`${API_URL}${ruta}`, {
      method,
      headers: { ...(body !== undefined && { 'Content-Type': 'application/json' }), ...(token && { Authorization: `Bearer ${token}` }) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError('No pudimos conectar con el servidor. Revisa tu conexión e intenta de nuevo.', undefined, 'NETWORK');
  }
  if (!res.ok) {
    const e = (await res.json().catch(() => null))?.error;
    throw new ApiError(e?.message ?? 'Algo salió mal. Intenta de nuevo en un momento.', res.status, e?.code, e?.campo);
  }
  return res.status === 204 ? (undefined as T) : res.json();
}
