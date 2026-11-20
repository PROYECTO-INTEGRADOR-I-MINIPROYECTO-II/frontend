import type { Sala } from '../api/salas';

// Contratos de tiempo real con la API (Socket.IO): ver «Tiempo real» en el README del backend.
export type { Sala };
export interface Integrante {
  uid: string;
  username: string;
}
export interface Mensaje {
  id: string;
  salaId: string;
  /** null en los mensajes de una cuenta eliminada. */
  uid: string | null;
  autor: string;
  texto: string;
  creado: string;
}
export const MENSAJE_MAX = 1000;
