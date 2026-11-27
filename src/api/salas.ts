import type { Mensaje } from '../realtime/tipos';
import { api } from './base';

// Sala privada creada por la persona con sesión (US-06). Su `id` es el identificador privado que se comparte para invitar.
export interface Sala {
  id: string;
  nombre: string;
  descripcion: string;
  uid: string;
  creado: string;
}

export const NOMBRE_SALA_MAX = 80;
export const DESCRIPCION_SALA_MAX = 500;

/** Salas propias, de la más reciente a la más antigua. */
export const listarSalas = () => api<{ salas: Sala[] }>('/api/salas').then((r) => r.salas);

export const crearSala = (nombre: string, descripcion: string) => api<Sala>('/api/salas', { method: 'POST', body: { nombre, descripcion } });

const rutaSala = (id: string) => `/api/salas/${encodeURIComponent(id)}`;

/** Consulta una sala por su ID, propia o ajena (US-08). Responde 404 si no existe. */
export const obtenerSala = (id: string) => api<Sala>(rutaSala(id));

/** Solo el anfitrión (US-07): cualquier otra persona recibe 403. */
export const editarSala = (id: string, nombre: string, descripcion: string) => api<Sala>(rutaSala(id), { method: 'PATCH', body: { nombre, descripcion } });
export const eliminarSala = (id: string) => api<void>(rutaSala(id), { method: 'DELETE' });

/** Página de mensajes anteriores al más antiguo que ya se tiene (US-11), de antiguo a reciente. */
export const mensajesAnteriores = (id: string, antes: string, antesId: string) =>
  api<{ mensajes: Mensaje[]; hayMas: boolean }>(`${rutaSala(id)}/mensajes?${new URLSearchParams({ antes, antesId })}`);

/** Recorta y valida un ID escrito o pegado (US-08). Distingue mayúsculas de minúsculas: no se transforma. */
export function validarIdSala(texto: string): { id: string; error?: string } {
  const id = texto.trim();
  if (!/^[A-Za-z0-9]{1,128}$/.test(id)) return { id, error: 'Escribe el ID de la sala: solo letras y números, sin espacios.' };
  return { id };
}
