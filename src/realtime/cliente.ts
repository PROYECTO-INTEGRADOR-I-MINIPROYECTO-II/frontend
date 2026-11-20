import { io, type Socket } from 'socket.io-client';
import { API_URL } from '../api/base';
import { auth } from '../firebase';

// El tiempo real es un servicio aparte de la API (S2-C07); sin VITE_REALTIME_URL se usa la URL de la API.
const REALTIME_URL = (import.meta.env.VITE_REALTIME_URL || API_URL).replace(/\/$/, '');

// Conexión de tiempo real. El ID token se pide en cada (re)conexión, así que un token renovado nunca llega vencido.
export function conectarTiempoReal(): Socket {
  return io(REALTIME_URL || undefined, {
    auth: (enviar) => {
      auth.currentUser
        ?.getIdToken()
        .then((token) => enviar({ token }))
        .catch(() => enviar({}));
      if (!auth.currentUser) enviar({});
    },
  });
}
