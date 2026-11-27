import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiError } from '../../api/base';
import { obtenerSala, validarIdSala } from '../../api/salas';

// Unirse con un ID (US-08), igual desde la portada y desde «Mis salas»: recorta y valida, comprueba que la sala exista antes de
// navegar y deja el error junto al campo. `alRecortar` devuelve al campo el texto ya sin espacios.
export function useEntrarSala(alRecortar: (id: string) => void) {
  const [error, setError] = useState('');
  const [conectando, setConectando] = useState(false);
  const enCurso = useRef(false);
  const navegar = useNavigate();

  async function entrar(texto: string) {
    if (enCurso.current) return;
    const { id, error } = validarIdSala(texto);
    alRecortar(id);
    if (error) return setError(error);
    setError('');
    enCurso.current = true;
    setConectando(true);
    try {
      await obtenerSala(id);
      navegar(`/salas/${encodeURIComponent(id)}`, { state: { entraste: true } });
    } catch (err) {
      const api = err instanceof ApiError ? err : null;
      setError(api?.status === 404 ? 'Sala no encontrada. Revisa que el ID esté completo, con sus mayúsculas y minúsculas.' : (api?.message ?? 'No pudimos conectar. Intenta de nuevo.'));
      enCurso.current = false;
      setConectando(false);
    }
  }

  return { error, limpiarError: () => setError(''), conectando, entrar };
}
