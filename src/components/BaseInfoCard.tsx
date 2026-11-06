import { useCallback, useEffect, useState } from 'react';
import { BaseInfo, fetchBase } from '../api/base';

type State =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; data: BaseInfo };

export default function BaseInfoCard() {
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
          message: err instanceof Error ? err.message : 'No pudimos conectar con el servidor.',
        });
      });
    return () => controller.abort();
  }, [attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return (
    <section aria-live="polite" className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-slate-500">Dato desde Firestore</h2>
      {state.status === 'loading' && <p className="text-slate-600">Cargando…</p>}
      {state.status === 'error' && (
        <div role="alert">
          <p className="mb-3 text-red-700">{state.message}</p>
          <button
            type="button"
            onClick={retry}
            className="rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-700 focus:outline-2 focus:outline-offset-2 focus:outline-slate-900"
          >
            Reintentar
          </button>
        </div>
      )}
      {state.status === 'success' && (
        <p className="text-xl text-slate-900">{state.data.mensaje}</p>
      )}
    </section>
  );
}
