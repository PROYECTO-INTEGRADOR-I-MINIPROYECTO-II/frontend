import { useEffect, useRef, useState } from 'react';
import type { Sala } from '../../realtime/tipos';
import Boton from '../../utils/ui/Boton';
import BotonDosPasos from '../../utils/ui/BotonDosPasos';
import Dialogo from '../../utils/ui/Dialogo';

// Información de la sala (el botón «i» de la cabecera): su nombre completo y su ID, que se pueden leer y copiar aunque la cabecera los corte
// en pantallas estrechas. Lo ve cualquier integrante: ya conoce el ID (es con lo que entró). El anfitrión además puede editarla o eliminarla.
export default function InfoSala({ sala, esAnfitrion, integrantes, alCerrar, alEditar, alEliminar, eliminando, error }: {
  sala: Sala;
  esAnfitrion: boolean;
  integrantes: number;
  alCerrar: () => void;
  alEditar?: () => void;
  alEliminar?: () => void;
  eliminando?: boolean;
  error?: string;
}) {
  const [aviso, setAviso] = useState('');
  const reloj = useRef<number | null>(null);
  useEffect(() => () => void (reloj.current !== null && window.clearTimeout(reloj.current)), []);

  async function copiar() {
    let texto = 'ID copiado.';
    try {
      await navigator.clipboard.writeText(sala.id);
    } catch {
      texto = 'No pudimos copiar el ID. Selecciónalo y cópialo a mano.';
    }
    setAviso(texto);
    if (reloj.current !== null) window.clearTimeout(reloj.current);
    reloj.current = window.setTimeout(() => setAviso(''), 4000);
  }

  return (
    <>
      <div aria-hidden="true" className="fixed inset-0 z-30 bg-black/65" />
      <Dialogo
        titulo="Información de la sala"
        onCerrar={alCerrar}
        modal
        className="fixed left-1/2 top-1/2 z-40 max-h-[calc(100dvh-2rem)] w-[min(26rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto bg-fondo text-texto"
      >
        <div className="grid gap-5 p-4 sm:p-6">
          <div>
            <p className="font-pixel text-[11px] leading-5 text-texto-secundario">Nombre</p>
            <p className="mt-1 break-words text-lg font-semibold">{sala.nombre}</p>
            {sala.descripcion && <p className="mt-1 break-words text-sm text-texto-secundario">{sala.descripcion}</p>}
          </div>
          <div>
            <p className="font-pixel text-[11px] leading-5 text-texto-secundario">ID de la sala</p>
            <code className="mt-1 block select-all break-all border-2 border-borde px-3 py-2 text-sm">{sala.id}</code>
            <Boton onClick={copiar} data-primero="" className="mt-3 !px-4 !py-2">Copiar ID</Boton>
            <p role="status" className="mt-2 min-h-5 text-xs text-exito">{aviso}</p>
          </div>
          <p className="text-xs text-texto-secundario">
            {esAnfitrion ? 'Eres el anfitrión.' : 'Eres participante.'} {integrantes} {integrantes === 1 ? 'persona conectada' : 'personas conectadas'}.
          </p>
          {/* Solo el anfitrión ve las acciones sobre la sala (US-07). */}
          {esAnfitrion && alEditar && alEliminar && (
            <div className="flex flex-wrap items-center gap-3 border-t-2 border-borde pt-4">
              <Boton className="!px-4 !py-2" onClick={alEditar}>Editar</Boton>
              <BotonDosPasos
                texto="Eliminar sala"
                armado="Clic de nuevo para eliminar"
                ayuda="Se borrará el chat y saldrán quienes estén dentro. Esc cancela."
                ocupado={eliminando}
                textoOcupado="Eliminando…"
                alConfirmar={alEliminar}
              />
              {error && <p role="alert" className="w-full text-xs text-error">{error}</p>}
            </div>
          )}
        </div>
      </Dialogo>
    </>
  );
}
