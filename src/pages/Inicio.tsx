import { FormEvent, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CallPreview from '../components/CallPreview';
import ChatPreview from '../components/ChatPreview';
import LedPassphraseField from '../components/LedPassphraseField';
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
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-5 py-16">
      <h1 className="sr-only">Entrar a una Sala</h1>

      <div className="w-full max-w-2xl">
      {user ? (
        <form onSubmit={submit} className="w-full" noValidate>
          <label htmlFor="passphrase" className="sr-only">Passphrase de la Sala</label>
          <p id="phrase-ayuda" className="mb-4 text-center text-sm text-texto-secundario">
            Escribe el código → ingresa a la sala
          </p>
          <div className="flex items-stretch gap-3">
            <div className="min-w-0 flex-1">
              <LedPassphraseField
                id="passphrase"
                value={phrase}
                onChange={(v) => {
                  setPhrase(v);
                  setError('');
                }}
                describedBy={error ? 'phrase-error phrase-ayuda' : 'phrase-ayuda'}
              />
            </div>
            {/* Enter en el campo también envía el formulario. */}
            <button
              type="submit"
              aria-label="Entrar a la Sala"
              className="led-text led-glow-soft group relative grid size-14 shrink-0 place-items-center rounded-2xl border border-led/55 bg-superficie text-led transition-shadow duration-300 hover:led-glow hover:border-led focus-visible:led-glow focus-visible:border-led focus-visible:outline-none md:size-16"
            >
              <ArrowRight aria-hidden="true" className="size-8 transition-transform group-hover:translate-x-0.5" strokeWidth={3} />
              <span aria-hidden="true" className="led-dots pointer-events-none absolute inset-0 rounded-2xl" />
              <span aria-hidden="true" className="crt-scan absolute inset-0 rounded-2xl" />
            </button>
          </div>
          {error && (
            <p id="phrase-error" role="alert" className="mt-3 text-center text-error">
              {error}
            </p>
          )}
        </form>
      ) : (
        <div className="w-full">
          <p className="mb-4 text-center text-sm text-texto-secundario">
            Inicia sesión para entrar a una Sala con su passphrase.
          </p>
          <LedLoginField />
        </div>
      )}
      </div>

      <div className="mt-14 flex w-full flex-wrap items-start justify-center gap-x-6 gap-y-2">
        <div className="w-full max-w-[560px] flex-1 basis-[420px]">
          <CallPreview />
        </div>
        <div className="flex w-full max-w-[560px] flex-1 basis-[360px] justify-center">
          <ChatPreview />
        </div>
      </div>
    </div>
  );
}
