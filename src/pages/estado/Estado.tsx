import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import TextoVivo from '../../utils/retro/TextoVivo';
import { ApiError, BaseInfo, fetchBase } from '../../api/base';
import { BarraRetro, PuntosAnimados, RetroWindow } from '../../utils/retro/RetroWindow';
import Boton from '../../utils/ui/Boton';
import Mensaje from '../../utils/ui/Mensaje';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

type State =
  | { status: 'loading' }
  | { status: 'error'; message: string; apiReached: boolean }
  | { status: 'success'; data: BaseInfo };

type Check = 'pendiente' | 'ok' | 'error';

const ETIQUETA: Record<Check, { tag: string; texto: string }> = {
  pendiente: { tag: '..', texto: 'comprobando' },
  ok: { tag: 'OK', texto: 'conectada' },
  error: { tag: '!!', texto: 'sin respuesta' },
};

function Fila({ estado, label }: { estado: Check; label: string }) {
  const { tag, texto } = ETIQUETA[estado];
  return (
    <li className={`flex items-center gap-3 ${estado === 'error' ? 'text-error' : 'text-texto'}`}>
      <span aria-hidden="true" className={`inline-block w-9 border-2 border-current py-0.5 text-center text-[10px] leading-4 ${estado === 'ok' ? 'bg-texto text-fondo' : ''}`}>
        {tag}
      </span>
      <span>
        {label} — {texto}
      </span>
    </li>
  );
}

export default function Estado() {
  useDocumentTitle('Estado del sistema');
  const [state, setState] = useState<State>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: 'loading' });
    fetchBase(controller.signal)
      .then((data) => setState({ status: 'success', data }))
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setState({
          status: 'error',
          message: err instanceof Error ? err.message : 'No pudimos conectar con la base de datos.',
          // Un 503 significa que la API respondió pero Firestore no.
          apiReached: err instanceof ApiError && err.status !== undefined,
        });
      });
    return () => controller.abort();
  }, [attempt]);

  const retry = () => setAttempt((n) => n + 1);
  const cargando = state.status === 'loading';
  const apiOk: Check = cargando ? 'pendiente' : state.status === 'success' || state.apiReached ? 'ok' : 'error';
  const dbOk: Check = cargando ? 'pendiente' : state.status === 'success' ? 'ok' : 'error';

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center gap-6 px-5 py-10">
      <RetroWindow
        heading="Estado del sistema"
        title={
          <nav aria-label="Ruta de navegación">
            <Link to="/" className="group"><TextoVivo>Inicio</TextoVivo></Link> /{' '}
            <span aria-current="page">Estado del sistema</span>
          </nav>
        }
      >
        <h2 className="sr-only">Dato desde Firestore</h2>
        <div aria-live="polite" className="text-center text-sm leading-6">
          {state.status === 'loading' && (
            <p>
              <span className="sr-only">Cargando desde Firestore</span>
              <span aria-hidden="true">Cargando desde Firestore</span>
              <PuntosAnimados />
            </p>
          )}
          {state.status === 'success' && (
            <>
              <p>Conexión correcta</p>
              <p className="mt-4 text-2xl text-acento">«{state.data.mensaje}»</p>
              {state.data.actualizado && (
                <p className="mt-2 text-sm text-texto-secundario">
                  Actualizado:{' '}
                  {new Date(state.data.actualizado).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              )}
            </>
          )}
          {state.status === 'error' && (
            <Mensaje tipo="error" titulo="No pudimos conectar con la base de datos">
              {state.message} Si el problema sigue, revisa tu conexión.
            </Mensaje>
          )}
        </div>

        <div className="mt-6">
          <BarraRetro
            modo={cargando ? 'cargando' : state.status === 'success' ? 'ok' : 'error'}
            label="Progreso de la comprobación"
          />
        </div>

        <ul className="mt-5 space-y-3 font-pixel text-xs leading-6">
          <Fila estado="ok" label="Aplicación web (Vercel)" />
          <Fila estado={apiOk} label="API (Render)" />
          <Fila estado={dbOk} label="Base de datos (Firestore)" />
        </ul>

        {!cargando && (
          <div className="mt-8 flex justify-center">
            <Boton minusculas onClick={retry}>{state.status === 'error' ? 'Reintentar' : 'Recargar dato'}</Boton>
          </div>
        )}
      </RetroWindow>
    </div>
  );
}
