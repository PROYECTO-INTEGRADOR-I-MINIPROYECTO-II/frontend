import { io, type Socket } from 'socket.io-client';
import { API_URL } from '../api/base';
import { auth } from '../firebase';

// Conexión de tiempo real con la API. El ID token se pide en cada (re)conexión, así que un token renovado nunca llega vencido.
export function conectarTiempoReal(): Socket {
  return io(API_URL || undefined, {
    auth: (enviar) => {
      auth.currentUser
        ?.getIdToken()
        .then((token) => enviar({ token }))
        .catch(() => enviar({}));
      if (!auth.currentUser) enviar({});
    },
  });
}
