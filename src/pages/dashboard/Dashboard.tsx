import { useEffect, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ApiError } from '../../api/base';
import { eliminarSala, type Sala } from '../../api/salas';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { PuntosAnimados } from '../../utils/retro/RetroWindow';
import Boton from '../../utils/ui/Boton';
import Mensaje from '../../utils/ui/Mensaje';
import DialogoCrearSala from './DialogoCrearSala';
import DialogoUnirse from './DialogoUnirse';
import TarjetaSala from './TarjetaSala';
import { useSalas } from './useSalas';

type Aviso = { tipo: 'exito' | 'error'; texto: string };

// «Mis salas» (US-06, 07, 08): las salas que creó la persona, crear una (y entrar como anfitrión), unirse a otra con su ID, copiar el ID,
// editarlas y eliminarlas.
export default function Dashboard() {
  useDocumentTitle('Mis salas');
  const { estado, recargar, cambiar } = useSalas();
  const [creando, setCreando] = useState(false);
  const [uniendose, setUniendose] = useState(false);
  const [editando, setEditando] = useState<Sala | null>(null);
  const [eliminando, setEliminando] = useState<string | null>(null);
  // Un aviso puede venir de la sala (p. ej. al eliminarla desde dentro).
  const llegada = (useLocation().state as { aviso?: string } | null)?.aviso;
  const [aviso, setAviso] = useState<Aviso | null>(llegada ? { tipo: 'exito', texto: llegada } : null);
  const contenedorUnirse = useRef<HTMLSpanElement>(null);
  const navegar = useNavigate();
  const contenedorCrear = useRef<HTMLSpanElement>(null); // Boton no reenvía ref: se busca su <button> para devolverle el foco

  // Los avisos son temporales: se retiran solos para no acumular ruido.
  useEffect(() => {
    if (!aviso) return;
    const t = window.setTimeout(() => setAviso(null), 5000);
    return () => window.clearTimeout(t);
  }, [aviso]);

  // Cada tarjeta lleva un número (1–9): pulsarlo intenta entrar a esa sala. Solo actúa fuera de campos y de diálogos, y sin
  // modificadores, para no interferir al escribir ni con atajos del navegador (WCAG 2.1.4).
  const salas = estado.fase === 'lista' ? estado.salas : [];
  const conDialogo = creando || uniendose || editando !== null;
  useEffect(() => {
    if (conDialogo) return;
    const alTeclear = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey || !/^[1-9]$/.test(e.key)) return;
      const el = e.target as Element | null;
      if (el?.closest('input, textarea, select, [contenteditable], [role=dialog]')) return;
      const sala = salas[Number(e.key) - 1];
      if (sala) navegar(`/salas/${encodeURIComponent(sala.id)}`);
    };
    document.addEventListener('keydown', alTeclear);
    return () => document.removeEventListener('keydown', alTeclear);
  }, [conDialogo, salas, navegar]);

  function cerrarDialogo() {
    setCreando(false);
    window.setTimeout(() => contenedorCrear.current?.querySelector('button')?.focus(), 0); // el foco vuelve a quien abrió el diálogo
  }

  // Crear una sala lleva directo a ella, como anfitrión (US-06): la Sala indica «Eres el anfitrión» y ahí está su ID para compartir.
  function alCrear(sala: Sala) {
    navegar(`/salas/${encodeURIComponent(sala.id)}`);
  }

  function cerrarUnirse() {
    setUniendose(false);
    window.setTimeout(() => contenedorUnirse.current?.querySelector('button')?.focus(), 0);
  }

  function alEditada(sala: Sala) {
    cambiar((lista) => lista.map((s) => (s.id === sala.id ? { ...s, ...sala } : s)));
    setEditando(null);
    setAviso({ tipo: 'exito', texto: `Cambios guardados en «${sala.nombre}».` });
  }

  async function eliminar(sala: Sala) {
    setEliminando(sala.id);
    try {
      await eliminarSala(sala.id);
      cambiar((lista) => lista.filter((s) => s.id !== sala.id));
      setAviso({ tipo: 'exito', texto: `Sala «${sala.nombre}» eliminada.` });
      contenedorCrear.current?.querySelector('button')?.focus(); // la tarjeta con el foco ya no existe
    } catch (err) {
      setAviso({ tipo: 'error', texto: err instanceof ApiError ? err.message : 'No pudimos eliminar la sala. Intenta de nuevo.' });
    }
    setEliminando(null);
  }

  async function copiar(sala: Sala) {
    try {
      await navigator.clipboard.writeText(sala.id);
      setAviso({ tipo: 'exito', texto: `ID de «${sala.nombre}» copiado.` });
    } catch {
      setAviso({ tipo: 'error', texto: 'No pudimos copiar el ID. Selecciónalo y cópialo a mano.' });
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-5 py-10">
      <div className="flex flex-col items-center gap-4 text-center">
        <div>
          <h1 className="font-pixel text-sm leading-6">Mis salas</h1>
          <p className="mt-2 text-sm text-texto-secundario">Las salas que creaste. Pulsa su número para entrar; haz clic en su ID para copiarlo y compartirlo.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <span ref={contenedorUnirse}>
            <Boton onClick={() => setUniendose(true)} aria-haspopup="dialog">Unirse</Boton>
          </span>
          <span ref={contenedorCrear}>
            <Boton variante="primario" onClick={() => setCreando(true)} aria-haspopup="dialog">
              <Plus aria-hidden="true" className="size-4" />
              Crear sala
            </Boton>
          </span>
        </div>
      </div>

      {/* Región viva: los avisos («Sala creada», «ID copiado») se anuncian sin mover el foco. */}
      <Mensaje tipo={aviso?.tipo ?? 'exito'} className={aviso ? `mt-5 border-2 px-4 py-3 ${aviso.tipo === 'error' ? 'border-error' : 'border-exito'}` : 'sr-only'}>
        {aviso?.texto}
      </Mensaje>

      <div className="mt-6">
        {estado.fase === 'cargando' && (
          <p role="status" className="border-2 border-borde px-4 py-10 text-center font-pixel text-[11px] leading-5 text-texto-secundario">
            Cargando tus salas<PuntosAnimados />
          </p>
        )}

        {estado.fase === 'error' && (
          <div className="border-2 border-error px-4 py-8 text-center">
            <Mensaje tipo="error" titulo="No pudimos cargar tus salas">{estado.mensaje}</Mensaje>
            <Boton onClick={recargar} className="mt-5">Reintentar</Boton>
          </div>
        )}

        {estado.fase === 'lista' && estado.salas.length === 0 && (
          <div className="border-2 border-dashed border-texto px-4 py-12 text-center">
            <p className="font-pixel text-[11px] leading-5">Aún no tienes salas</p>
            <p className="mx-auto mt-3 max-w-sm text-sm text-texto-secundario">Crea la primera y comparte su ID para que otras personas entren cuando quieras.</p>
          </div>
        )}

        {estado.fase === 'lista' && estado.salas.length > 0 && (
          <ul className="grid gap-4" aria-label="Tus salas">
            {estado.salas.map((s, i) => (
              <TarjetaSala key={s.id} sala={s} numero={i < 9 ? i + 1 : undefined} alCopiar={copiar} alEditar={setEditando} alEliminar={eliminar} eliminando={eliminando === s.id} />
            ))}
          </ul>
        )}
      </div>

      {creando && <DialogoCrearSala alCerrar={cerrarDialogo} alCrear={alCrear} />}
      {editando && <DialogoCrearSala editar={editando} alCerrar={() => setEditando(null)} alCrear={alEditada} />}
      {uniendose && <DialogoUnirse alCerrar={cerrarUnirse} />}
    </div>
  );
}
