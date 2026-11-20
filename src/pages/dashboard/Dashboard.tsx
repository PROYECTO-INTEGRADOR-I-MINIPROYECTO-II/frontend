import { useEffect, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Sala } from '../../api/salas';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { PuntosAnimados } from '../../utils/retro/RetroWindow';
import Boton from '../../utils/ui/Boton';
import Mensaje from '../../utils/ui/Mensaje';
import DialogoCrearSala from './DialogoCrearSala';
import TarjetaSala from './TarjetaSala';
import { useSalas } from './useSalas';

type Aviso = { tipo: 'exito' | 'error'; texto: string };

// «Mis salas» (US-06): las salas que creó la persona, crear una nueva y copiar su ID para invitar. Entrar a una sala llega en el Sprint 3.
export default function Dashboard() {
  useDocumentTitle('Mis salas');
  const { estado, recargar, agregar } = useSalas();
  const [creando, setCreando] = useState(false);
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const [nuevaId, setNuevaId] = useState<string | null>(null);
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
  useEffect(() => {
    if (creando) return;
    const alTeclear = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey || !/^[1-9]$/.test(e.key)) return;
      const el = e.target as Element | null;
      if (el?.closest('input, textarea, select, [contenteditable], [role=dialog]')) return;
      const sala = salas[Number(e.key) - 1];
      if (sala) navegar(`/salas/${encodeURIComponent(sala.id)}`);
    };
    document.addEventListener('keydown', alTeclear);
    return () => document.removeEventListener('keydown', alTeclear);
  }, [creando, salas, navegar]);

  function cerrarDialogo() {
    setCreando(false);
    window.setTimeout(() => contenedorCrear.current?.querySelector('button')?.focus(), 0); // el foco vuelve a quien abrió el diálogo
  }

  function alCrear(sala: Sala) {
    agregar(sala);
    setNuevaId(sala.id);
    setAviso({ tipo: 'exito', texto: `Sala «${sala.nombre}» creada. Copia su ID para invitar a otras personas.` });
    cerrarDialogo();
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
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-pixel text-sm leading-6">Mis salas</h1>
          <p className="mt-2 text-sm text-texto-secundario">Las salas que creaste. Pulsa su número para entrar; haz clic en su ID para copiarlo y compartirlo.</p>
        </div>
        <span ref={contenedorCrear}>
          <Boton variante="primario" onClick={() => setCreando(true)} aria-haspopup="dialog">
            <Plus aria-hidden="true" className="size-4" />
            Crear sala
          </Boton>
        </span>
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
              <TarjetaSala key={s.id} sala={s} numero={i < 9 ? i + 1 : undefined} nueva={s.id === nuevaId} alCopiar={copiar} />
            ))}
          </ul>
        )}
      </div>

      {creando && <DialogoCrearSala alCerrar={cerrarDialogo} alCrear={alCrear} />}
    </div>
  );
}
