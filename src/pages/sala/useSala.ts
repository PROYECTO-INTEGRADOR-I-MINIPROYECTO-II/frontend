import { useCallback, useEffect, useRef, useState } from 'react';
import type { Socket } from 'socket.io-client';
import { conectarTiempoReal } from '../../realtime/cliente';
import type { Integrante, Mensaje, Sala } from '../../realtime/tipos';

export type EstadoSala =
  | { fase: 'conectando' }
  | { fase: 'error'; mensaje: string }
  | { fase: 'lista'; sala: Sala; integrantes: Integrante[]; mensajes: Mensaje[]; conectado: boolean };

type Respuesta<T> = T & { error?: { code: string; message: string } };
const SIN_RESPUESTA = 'El servidor tardó demasiado en responder. Intenta de nuevo.';

// Estar dentro de una sala: conecta, se une, mantiene integrantes y mensajes al día y permite escribir. Al salir de la página se sale de la
// sala y se corta la conexión. Si la conexión se cae, el cliente reintenta solo y se vuelve a unir. La API aún no entrega el historial:
// solo se ven los mensajes desde que se entra.
export function useSala(id: string) {
  const [estado, setEstado] = useState<EstadoSala>({ fase: 'conectando' });
  const socket = useRef<Socket | null>(null);

  useEffect(() => {
    setEstado({ fase: 'conectando' });
    const s = conectarTiempoReal();
    socket.current = s;
    let vigente = true;
    const fallo = (mensaje: string) => vigente && setEstado({ fase: 'error', mensaje });

    const unirse = () =>
      s.timeout(8000).emit('sala:unirse', { id }, (err: Error | null, res?: Respuesta<{ sala: Sala }>) => {
        if (!vigente) return;
        if (err) return fallo(SIN_RESPUESTA);
        if (res?.error || !res?.sala) return fallo(res?.error?.message ?? 'No pudimos entrar a la sala.');
        const sala = res.sala;
        // Al reconectar se conserva lo que ya se veía; la presencia llega en seguida por `sala:presencia`.
        setEstado((e) => (e.fase === 'lista' ? { ...e, sala, conectado: true } : { fase: 'lista', sala, integrantes: [], mensajes: [], conectado: true }));
      });

    s.on('connect', unirse);
    s.on('disconnect', () => setEstado((e) => (e.fase === 'lista' ? { ...e, conectado: false } : e)));
    s.on('connect_error', (err: Error & { data?: { message?: string } }) => {
      // Una caída de red con la sala ya abierta se reintenta sola; solo se muestra error si aún no se había entrado.
      setEstado((e) => (e.fase === 'lista' ? { ...e, conectado: false } : { fase: 'error', mensaje: err.data?.message ?? 'No pudimos conectar con el servidor. Revisa tu conexión.' }));
    });
    s.on('sala:presencia', (p: { salaId: string; usuarios: Integrante[] }) => {
      if (p.salaId !== id) return;
      setEstado((e) => (e.fase === 'lista' ? { ...e, integrantes: p.usuarios } : e));
    });
    s.on('mensaje:nuevo', (m: Mensaje) => {
      if (m.salaId !== id) return;
      setEstado((e) => (e.fase === 'lista' && !e.mensajes.some((x) => x.id === m.id) ? { ...e, mensajes: [...e.mensajes, m] } : e));
    });

    return () => {
      vigente = false;
      s.emit('sala:salir', { id });
      s.disconnect();
      socket.current = null;
    };
  }, [id]);

  /** Envía un mensaje; devuelve el motivo si no se pudo (null = enviado). */
  const enviar = useCallback(
    (texto: string) =>
      new Promise<string | null>((resolver) => {
        const s = socket.current;
        if (!s?.connected) return resolver('Sin conexión con la sala. Espera a que se restablezca.');
        s.timeout(8000).emit('mensaje:enviar', { salaId: id, texto }, (err: Error | null, res?: Respuesta<object>) => {
          resolver(err ? SIN_RESPUESTA : (res?.error?.message ?? null));
        });
      }),
    [id],
  );

  return { estado, enviar };
}
