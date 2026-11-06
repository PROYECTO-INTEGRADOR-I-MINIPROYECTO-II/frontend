import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CallPreview from '../components/CallPreview';
import LedMarquee from '../components/LedMarquee';
import { useSession } from '../auth/useSession';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function Inicio() {
  useDocumentTitle('Entrar a una Sala');
  const { user } = useSession();
  const navigate = useNavigate();
  const [phrase, setPhrase] = useState('');
  const [error, setError] = useState('');

  function submit(e: FormEvent) {
    e.preventDefault();
    const clean = phrase.trim();
    if (!clean) {
      setError('Escribe la passphrase de la Sala.');
      return;
    }
    navigate(`/salas/${encodeURIComponent(clean)}`);
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-5 py-16">
      <h1 className="sr-only">Entrar a una Sala</h1>

      <form onSubmit={submit} className="w-full" noValidate>
        <label htmlFor="passphrase" className="sr-only">Passphrase de la Sala</label>
        {/* Sin sesión el campo está deshabilitado y un letrero LED decorativo lo cubre. */}
        <div className="relative">
        <input
          id="passphrase"
          type="text"
          value={phrase}
          onChange={(e) => {
            setPhrase(e.target.value);
            setError('');
          }}
          disabled={!user}
          aria-describedby={user ? (error ? 'phrase-error' : undefined) : 'phrase-ayuda'}
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          placeholder={user ? 'luna-roble-café-río' : undefined}
          className="w-full rounded-2xl border border-borde bg-superficie px-6 py-5 text-center text-2xl text-texto placeholder:text-texto-secundario/70 disabled:cursor-not-allowed disabled:select-none md:text-3xl"
        />
        {!user && <LedMarquee />}
        </div>

        {error && (
          <p id="phrase-error" role="alert" className="mt-3 text-center text-error">
            {error}
          </p>
        )}

        {user ? (
          <div className="mt-5 flex justify-center">
            <button type="submit" className="btn-primario">Entrar a la Sala</button>
          </div>
        ) : (
          <div className="mt-5 flex flex-col items-center gap-3">
            <p id="phrase-ayuda" className="text-sm text-texto-secundario">
              Inicia sesión para entrar a una Sala con su passphrase.
            </p>
            <Link to="/login" className="btn-primario">Ingresar</Link>
          </div>
        )}
      </form>

      <div className="mt-14 w-full">
        <CallPreview />
      </div>
    </div>
  );
}
