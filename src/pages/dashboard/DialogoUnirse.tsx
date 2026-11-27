import { useState, type FormEvent } from 'react';
import LedPassphraseField from '../../utils/led/LedPassphraseField';
import Boton from '../../utils/ui/Boton';
import Dialogo from '../../utils/ui/Dialogo';
import { useEntrarSala } from '../sala/useEntrarSala';

// Unirse a una sala con su ID (US-08), con el mismo campo de la portada. El error sale bajo el campo y no se pierde lo escrito.
export default function DialogoUnirse({ alCerrar }: { alCerrar: () => void }) {
  const [texto, setTexto] = useState('');
  const { error, limpiarError, conectando, entrar } = useEntrarSala(setTexto);

  function enviar(e: FormEvent) {
    e.preventDefault();
    void entrar(texto).then(() => document.getElementById('unirse-id')?.focus());
  }

  return (
    <>
      <div aria-hidden="true" className="fixed inset-0 z-20 bg-black/65" />
      <Dialogo
        titulo="Unirse a una sala"
        onCerrar={() => !conectando && alCerrar()}
        modal
        className="fixed left-1/2 top-1/2 z-30 max-h-[calc(100dvh-2rem)] w-[min(32rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto"
      >
        <form onSubmit={enviar} noValidate className="grid grid-cols-[minmax(0,1fr)] gap-5 p-4 sm:p-6">
          <p id="unirse-ayuda" className="text-sm text-texto-secundario">Pega el ID que te compartió quien creó la sala.</p>
          <div>
            <label htmlFor="unirse-id" className="mb-2 block font-pixel text-[11px] leading-5">ID de la sala</label>
            <LedPassphraseField
              id="unirse-id"
              value={texto}
              onChange={(v) => {
                setTexto(v);
                limpiarError();
              }}
              describedBy={error ? 'unirse-error unirse-ayuda' : 'unirse-ayuda'}
              invalido={Boolean(error)}
            />
          </div>
          {error && <p id="unirse-error" role="alert" className="text-sm text-error">{error}</p>}
          <p role="status" className={conectando ? 'font-pixel text-[11px] leading-5' : 'sr-only'}>{conectando ? 'Conectando a la Sala…' : ''}</p>
          <div className="flex flex-wrap justify-end gap-3">
            <Boton onClick={alCerrar} disabled={conectando}>Cancelar</Boton>
            <Boton type="submit" variante="primario" disabled={conectando} aria-busy={conectando || undefined}>
              {conectando ? 'Entrando…' : 'Entrar'}
            </Boton>
          </div>
        </form>
      </Dialogo>
    </>
  );
}
