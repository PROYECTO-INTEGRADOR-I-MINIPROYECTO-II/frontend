export interface BaseInfo {
  mensaje: string;
  actualizado?: string;
}

const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

export async function fetchBase(signal?: AbortSignal): Promise<BaseInfo> {
  const res = await fetch(`${API_URL}/api/base`, { signal });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error?.message ?? `Error ${res.status} al consultar la API.`);
  }
  return res.json();
}
