import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '../../api/base';
import { listarSalas, type Sala } from '../../api/salas';

export type EstadoSalas = { fase: 'cargando' } | { fase: 'error'; mensaje: string } | { fase: 'lista'; salas: Sala[] };

// Salas propias de la sesión: carga al entrar, permite reintentar si falla y añadir una recién creada sin volver a pedirlas.
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

  const agregar = (sala: Sala) => setEstado((e) => (e.fase === 'lista' ? { fase: 'lista', salas: [sala, ...e.salas] } : { fase: 'lista', salas: [sala] }));

  return { estado, recargar: cargar, agregar };
}
