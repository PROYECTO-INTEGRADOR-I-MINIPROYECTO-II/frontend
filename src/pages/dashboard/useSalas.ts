import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '../../api/base';
import { listarSalas, type Sala } from '../../api/salas';

export type EstadoSalas = { fase: 'cargando' } | { fase: 'error'; mensaje: string } | { fase: 'lista'; salas: Sala[] };

// Salas propias de la sesión: carga al entrar y permite reintentar si falla.
export function useSalas() {
  const [estado, setEstado] = useState<EstadoSalas>({ fase: 'cargando' });

  const cargar = useCallback(() => {
    let vigente = true;
    setEstado({ fase: 'cargando' });
    listarSalas()
      .then((salas) => vigente && setEstado({ fase: 'lista', salas }))
      .catch((err) => vigente && setEstado({ fase: 'error', mensaje: err instanceof ApiError ? err.message : 'No pudimos cargar tus salas. Intenta de nuevo.' }));
    return () => {
      vigente = false;
    };
  }, []);

  useEffect(() => cargar(), [cargar]);

  // Cambios hechos aquí mismo: se reflejan al instante, sin volver a pedir la lista.
  const cambiar = useCallback((f: (salas: Sala[]) => Sala[]) => setEstado((e) => (e.fase === 'lista' ? { ...e, salas: f(e.salas) } : e)), []);

  return { estado, recargar: cargar, cambiar };
}
