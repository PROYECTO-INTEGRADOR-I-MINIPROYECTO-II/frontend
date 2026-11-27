import { useCallback, useEffect, useRef, useState } from 'react';
import type { Socket } from 'socket.io-client';
import { mensajesAnteriores } from '../../api/salas';
import { conectarTiempoReal } from '../../realtime/cliente';
import type { Integrante, Mensaje, Novedad, Sala } from '../../realtime/tipos';

export type EstadoSala =
  | { fase: 'conectando' }
  | { fase: 'error'; mensaje: string }
  /** El anfitrión la eliminó estando dentro (US-07). */
  | { fase: 'eliminada'; nombre: string }
  | {
      fase: 'lista';
      sala: Sala;
      integrantes: Integrante[];
      mensajes: Mensaje[];
      conectado: boolean;
      /** Quedan mensajes más antiguos sin cargar (US-11). */
      hayMas: boolean;
      anteriores: 'cargando' | 'error' | null;
      novedades: Novedad[];
    };

type Respuesta<T> = T & { error?: { code: string; message: string } };
const SIN_RESPUESTA = 'El servidor tardó demasiado en responder. Intenta de nuevo.';
const MAX_NOVEDADES = 200;

const unirMensajes = (...grupos: Mensaje[][]) =>
  [...new Map(grupos.flat().map((m) => [m.id, m])).values()].sort((a, b) => a.creado.localeCompare(b.creado) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));

const nombreDe = (i: Integrante) => i.nombre || i.username;

// Al reconectar se recupera el historial y se conserva el chat que ya se veía. Los eventos pueden llegar antes del ack de entrada.
export function useSala(id: string) {
  const [estado, setEstado] = useState<EstadoSala>({ fase: 'conectando' });
  const socket = useRef<Socket | null>(null);
  const actual = useRef(estado);
  actual.current = estado;
  const contador = useRef(0);

  useEffect(() => {
    setEstado({ fase: 'conectando' });
    const s = conectarTiempoReal();
    socket.current = s;
    let vigente = true;
    let intento = 0;
    let entrando = false;
    let eliminada = false;
    let pendientes: Mensaje[] = [];
    let salaActualizada: Sala | undefined;
    /** Quiénes había en la última presencia recibida; null hasta la primera (los que ya estaban no «entran»). */
    let presentes: Map<string, Integrante> | null = null;
    const novedad = (n: Omit<Novedad, 'n'>): Novedad => ({ ...n, n: ++contador.current });
    const limpiarEntrada = () => {
      intento++;
      entrando = false;
      pendientes = [];
      salaActualizada = undefined;
    };
    const fallo = (mensaje: string) => {
      limpiarEntrada();
      if (vigente) setEstado({ fase: 'error', mensaje });
    };
    // Si ya se estaba dentro, se avisa y se vuelve a «Mis salas»; si aún se estaba entrando, es un error de entrada.
    const quitada = () => {
      eliminada = true;
      limpiarEntrada();
      if (vigente) setEstado((e) => (e.fase === 'lista' ? { fase: 'eliminada', nombre: e.sala.nombre } : e.fase === 'eliminada' ? e : { fase: 'error', mensaje: 'La sala ya no existe.' }));
    };

    const unirse = () => {
      if (!vigente || eliminada) return;
      limpiarEntrada();
      entrando = true;
      const turno = intento;
      s.timeout(8000).emit('sala:unirse', { id }, (err: Error | null, res?: Respuesta<{ sala: Sala; mensajes?: Mensaje[]; hayMas?: boolean }>) => {
        if (!vigente || turno !== intento) return;
        if (err) return fallo(SIN_RESPUESTA);
        // Al reconectar, «no existe» significa que la borraron mientras no había conexión.
        if (res?.error?.code === 'NOT_FOUND' && actual.current.fase === 'lista') return quitada();
        if (res?.error || !res?.sala) return fallo(res?.error?.message ?? 'No pudimos entrar a la sala.');
        const sala = salaActualizada ?? res.sala;
        const mensajes = unirMensajes(res.mensajes ?? [], pendientes);
        const hayMas = res.hayMas ?? false;
        limpiarEntrada();
        setEstado((e) => {
          if (e.fase !== 'lista') return { fase: 'lista', sala, integrantes: [], mensajes, conectado: true, hayMas, anteriores: null, novedades: [] };
          // Si mientras no había conexión llegó más de una página, entre lo viejo y lo nuevo quedaría un hueco: se deja solo lo nuevo.
          const vistos = new Set(e.mensajes.map((m) => m.id));
          const hueco = hayMas && e.mensajes.length > 0 && !mensajes.some((m) => vistos.has(m.id));
          return { ...e, sala, conectado: true, mensajes: hueco ? mensajes : unirMensajes(e.mensajes, mensajes), hayMas: hueco ? true : e.hayMas };
        });
      });
    };

    s.on('connect', unirse);
    s.on('disconnect', () => {
      if (!vigente) return;
      limpiarEntrada();
      setEstado((e) => (e.fase === 'lista' ? { ...e, conectado: false } : e));
    });
    s.on('connect_error', (err: Error & { data?: { message?: string } }) => {
      if (!vigente || eliminada) return;
      limpiarEntrada();
      // Una caída de red con la sala ya abierta se reintenta sola; solo se muestra error si aún no se había entrado.
      setEstado((e) => (e.fase === 'lista' ? { ...e, conectado: false } : { fase: 'error', mensaje: err.data?.message ?? 'No pudimos conectar con el servidor. Revisa tu conexión.' }));
    });
    s.on('sala:presencia', (p: { salaId: string; usuarios: Integrante[] }) => {
      if (!vigente || p.salaId !== id) return;
      const ahora = new Map(p.usuarios.map((u) => [u.uid, u]));
      const creado = new Date().toISOString();
      const cambios = presentes
        ? [
            ...p.usuarios.filter((u) => !presentes!.has(u.uid)).map((u) => novedad({ tipo: 'entra', uid: u.uid, nombre: nombreDe(u), creado })),
            ...[...presentes.values()].filter((u) => !ahora.has(u.uid)).map((u) => novedad({ tipo: 'sale', uid: u.uid, nombre: nombreDe(u), creado })),
          ]
        : [];
      presentes = ahora;
      setEstado((e) => (e.fase === 'lista' ? { ...e, integrantes: p.usuarios, novedades: [...e.novedades, ...cambios].slice(-MAX_NOVEDADES) } : e));
    });
    s.on('mensaje:nuevo', (m: Mensaje) => {
      if (!vigente || eliminada || m.salaId !== id) return;
      if (entrando) pendientes.push(m);
      const aviso = novedad({ tipo: 'mensaje', uid: m.uid, nombre: m.autor, texto: m.texto, creado: m.creado });
      setEstado((e) => {
        if (e.fase !== 'lista' || e.mensajes.some((x) => x.id === m.id)) return e;
        return { ...e, mensajes: unirMensajes(e.mensajes, [m]), novedades: [...e.novedades, aviso].slice(-MAX_NOVEDADES) };
      });
    });
    s.on('sala:actualizada', ({ sala }: { sala: Sala }) => {
      if (!vigente || eliminada || sala.id !== id) return;
      if (entrando) salaActualizada = sala;
      setEstado((e) => (e.fase === 'lista' ? { ...e, sala } : e));
    });
    s.on('sala:eliminada', ({ salaId }: { salaId: string }) => {
      if (!vigente || salaId !== id) return;
      quitada();
    });

    return () => {
      vigente = false;
      limpiarEntrada();
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

  /** Trae la página anterior a lo más antiguo que se ve (US-11). */
  const cargarAnteriores = useCallback(async () => {
    const e = actual.current;
    if (e.fase !== 'lista' || e.anteriores === 'cargando' || !e.hayMas || !e.mensajes[0]) return;
    const primero = e.mensajes[0];
    setEstado((x) => (x.fase === 'lista' ? { ...x, anteriores: 'cargando' } : x));
    try {
      const pagina = await mensajesAnteriores(id, primero.creado, primero.id);
      setEstado((x) => (x.fase === 'lista' && x.sala.id === id ? { ...x, mensajes: unirMensajes(pagina.mensajes, x.mensajes), hayMas: pagina.hayMas, anteriores: null } : x));
    } catch {
      setEstado((x) => (x.fase === 'lista' ? { ...x, anteriores: 'error' } : x));
    }
  }, [id]);

  /** Refleja un cambio hecho desde esta pantalla sin esperar al evento de tiempo real. */
  const actualizarSala = useCallback((sala: Sala) => setEstado((e) => (e.fase === 'lista' && e.sala.id === sala.id ? { ...e, sala: { ...e.sala, ...sala } } : e)), []);

  return { estado, enviar, cargarAnteriores, actualizarSala };
}
