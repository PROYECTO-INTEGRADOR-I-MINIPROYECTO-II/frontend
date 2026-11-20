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
