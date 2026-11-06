import { CircleAlert, CircleCheck, Loader2, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiError, BaseInfo, fetchBase } from '../api/base';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

type State =
  | { status: 'loading' }
  | { status: 'error'; message: string; apiReached: boolean }
  | { status: 'success'; data: BaseInfo };

function Row({ ok, label }: { ok: boolean; label: string }) {
  const Icon = ok ? CircleCheck : RefreshCw;
  return (
    <li className={`flex items-center gap-2 ${ok ? 'text-texto' : 'text-error'}`}>
      <Icon aria-hidden="true" className={ok ? 'text-exito' : ''} />
      {label} — {ok ? 'conectada' : 'sin respuesta'}
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
  const apiOk = state.status === 'success' || (state.status === 'error' && state.apiReached);
  const dbOk = state.status === 'success';

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <nav aria-label="Ruta de navegación" className="text-sm text-texto-secundario">
        <Link to="/" className="hover:underline">Inicio</Link> / Estado del sistema
      </nav>
      <h1 className="mt-3 text-4xl font-bold md:text-5xl">Estado del sistema</h1>
      <p className="mt-3 max-w-3xl text-texto-secundario">
        Esta página comprueba que la aplicación web, la API y la base de datos están conectadas. El dato de abajo viene
        de Firestore a través de la API.
      </p>

      <section aria-labelledby="dato" className="mt-8 rounded-2xl border border-slate-200 bg-superficie p-6 md:p-8">
        <h2 id="dato" className="text-2xl font-medium">Dato desde Firestore</h2>

        <div aria-live="polite" className="mt-5">
          {state.status === 'loading' && (
            <p className="flex items-center gap-2 text-texto-secundario">
              <Loader2 aria-hidden="true" className="animate-spin text-primario" />
              Cargando…
            </p>
          )}

          {state.status === 'error' && (
            <div className="rounded-lg border border-error bg-error-suave p-4">
              <p className="flex items-center gap-2 font-semibold">
                <CircleAlert aria-hidden="true" className="text-error" />
                No pudimos conectar con la base de datos
              </p>
              <p className="mt-1 pl-8 text-sm">
                {state.message} Si el problema sigue, revisa tu conexión.
              </p>
            </div>
          )}

          {state.status === 'success' && (
            <>
              <div className="rounded-lg border border-exito bg-exito-suave p-4">
                <p className="flex items-center gap-2 font-semibold">
                  <CircleCheck aria-hidden="true" className="text-exito" />
                  Conexión correcta
                </p>
                <p className="mt-1 pl-8 text-sm">La aplicación, la API y Firestore responden.</p>
              </div>
              <div className="mt-4 rounded-lg bg-fondo p-5">
                <p className="font-display text-2xl text-primario">«{state.data.mensaje}»</p>
                {state.data.actualizado && (
                  <p className="mt-2 text-sm text-texto-secundario">
                    Actualizado:{' '}
                    {new Date(state.data.actualizado).toLocaleString('es-CO', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        {state.status !== 'loading' && (
          <button type="button" onClick={retry} className={`mt-5 ${state.status === 'error' ? 'btn-primario' : 'btn-secundario'}`}>
            {state.status === 'error' ? 'Reintentar' : 'Recargar dato'}
          </button>
        )}

        {state.status !== 'loading' && (
          <ul className="mt-5 space-y-2">
            <Row ok label="Aplicación web (Vercel)" />
            <Row ok={apiOk} label="API (Render)" />
            <Row ok={dbOk} label="Base de datos (Firestore)" />
          </ul>
        )}
      </section>
    </div>
  );
}
