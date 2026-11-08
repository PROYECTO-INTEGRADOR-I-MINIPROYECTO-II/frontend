import { Link } from 'react-router-dom';
import TextoVivo from '../../utils/retro/TextoVivo';
import { RetroWindow } from '../../utils/retro/RetroWindow';
import { fijarPausadas, sistemaReduce, usePausadas } from '../../hooks/useAnimaciones';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export default function Ajustes() {
  useDocumentTitle('Ajustes');
  const pausadas = usePausadas();
  const delSistema = sistemaReduce();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-5 py-16">
      <RetroWindow
        heading="Ajustes"
        title={
          <nav aria-label="Ruta de navegación">
            <ol className="flex items-center justify-center gap-2">
              <li><Link to="/" className="group"><TextoVivo>Inicio</TextoVivo></Link></li>
              <li aria-hidden="true">/</li>
              <li aria-current="page">Ajustes</li>
            </ol>
          </nav>
        }
      >
        <div className="flex items-start justify-between gap-6">
          <div>
            <p id="pausa-titulo" className="font-semibold">Pausar animaciones</p>
            <p id="pausa-ayuda" className="mt-1 text-sm text-texto-secundario">
              Detiene el letrero, el fondo del encabezado, la llamada y el chat de la portada. Cada uno queda en su
              estado final; el chat se muestra completo y sigues pudiendo escribir en él.
            </p>
            {delSistema && !pausadas && (
              <p className="mt-2 text-sm text-texto-secundario">
                Tu sistema ya pide reducir el movimiento, así que las animaciones están detenidas aunque esto esté apagado.
              </p>
            )}
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={pausadas}
            aria-labelledby="pausa-titulo"
            aria-describedby="pausa-ayuda"
            onClick={() => fijarPausadas(!pausadas)}
            className="relative h-8 w-16 shrink-0 border-2 border-texto font-monokuro text-[10px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-texto"
          >
            <span
              aria-hidden="true"
              className={`absolute inset-y-0 w-1/2 bg-texto ${pausadas ? 'right-0' : 'left-0'}`}
            />
            <span aria-hidden="true" className={`relative flex h-full items-center ${pausadas ? 'justify-start pl-2' : 'justify-end pr-2'}`}>
              {pausadas ? 'SÍ' : 'NO'}
            </span>
          </button>
        </div>
      </RetroWindow>
    </div>
  );
}
