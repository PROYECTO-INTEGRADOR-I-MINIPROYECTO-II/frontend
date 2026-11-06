import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CallPreview from '../components/CallPreview';
import LedLoginField from '../components/LedLoginField';
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

      {user ? (
        <form onSubmit={submit} className="w-full" noValidate>
          <label htmlFor="passphrase" className="sr-only">Passphrase de la Sala</label>
          <input
            id="passphrase"
            type="text"
            value={phrase}
            onChange={(e) => {
              setPhrase(e.target.value);
              setError('');
            }}
            aria-describedby={error ? 'phrase-error' : undefined}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="luna-roble-café-río"
            className="w-full rounded-2xl border border-borde bg-superficie px-6 py-5 text-center text-2xl text-texto placeholder:text-texto-secundario/70 md:text-3xl"
          />
          {error && (
            <p id="phrase-error" role="alert" className="mt-3 text-center text-error">
              {error}
            </p>
          )}
          <div className="mt-5 flex justify-center">
            <button type="submit" className="btn-primario">Entrar a la Sala</button>
          </div>
        </form>
      ) : (
        <div className="w-full">
          <p className="mb-4 text-center text-sm text-texto-secundario">
            Inicia sesión para entrar a una Sala con su passphrase.
          </p>
          <LedLoginField />
        </div>
      )}

      <div className="mt-14 w-full">
        <CallPreview />
      </div>
    </div>
  );
}
