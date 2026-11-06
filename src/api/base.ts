export interface BaseInfo {
  mensaje: string;
  actualizado?: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
  }
}

const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

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
  return res.json();
}
