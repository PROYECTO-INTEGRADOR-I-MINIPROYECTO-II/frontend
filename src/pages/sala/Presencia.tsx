import { useEffect, useRef, useState } from 'react';
import type { Novedad } from '../../realtime/tipos';

const HORA = new Intl.DateTimeFormat('es', { timeStyle: 'short' });

/** Lo que dice el lector de pantalla: cada mensaje en orden autor, hora y texto; las entradas y salidas, con el nombre. */
export const fraseDe = (n: Novedad) =>
  n.tipo === 'mensaje' ? `${n.nombre}, ${HORA.format(new Date(n.creado))}: ${n.texto}` : `${n.nombre} ${n.tipo === 'entra' ? 'entró a' : 'salió de'} la sala.`;

// Región viva única de la sala: anuncia sin mover el foco, esté o no a la vista el chat. Los mensajes propios no se repiten.
export function Anunciador({ novedades, miUid }: { novedades: Novedad[]; miUid?: string }) {
  const recientes = novedades.filter((n) => n.uid !== miUid || n.tipo !== 'mensaje').slice(-5);
  return (
    <div role="log" aria-label="Avisos de la sala" aria-live="polite" className="sr-only">
      {recientes.map((n) => (
        <p key={n.n}>{fraseDe(n)}</p>
      ))}
    </div>
  );
}

const DURA_AVISO_MS = 3000;

// Aviso pixel sobre el tablero, como una notificación de juego: dura unos segundos. Es decorativo (el anuncio lo hace `Anunciador`).
export function AvisoPresencia({ ultima }: { ultima?: Novedad }) {
  const [visible, setVisible] = useState<Novedad | null>(null);
  useEffect(() => {
    // Al volver a montarse (cambio de pestaña) no se repite un aviso viejo.
    const resta = ultima ? DURA_AVISO_MS - (Date.now() - Date.parse(ultima.creado)) : 0;
    if (!ultima || resta <= 0) return setVisible(null);
    setVisible(ultima);
    const t = window.setTimeout(() => setVisible(null), resta);
    return () => window.clearTimeout(t);
  }, [ultima?.n]);
  if (!visible) return null;
  return (
    <p aria-hidden="true" className="aviso-presencia pointer-events-none absolute inset-x-0 top-2 z-20 mx-auto w-fit max-w-[90%] truncate bg-texto px-3 py-2 font-pixel text-[11px] uppercase leading-5 text-fondo">
      ▓ {visible.tipo === 'entra' ? 'entra' : 'sale'} {visible.nombre} ▓
    </p>
  );
}

// Para el destello de la lista: quién entró hace poco y quién acaba de salir (se queda un momento desvaneciéndose).
export function usePresenciaReciente(novedades: Novedad[]) {
  const [entraron, setEntraron] = useState<Set<string>>(new Set());
  const [salieron, setSalieron] = useState<{ uid: string; nombre: string }[]>([]);
  const vista = useRef(0);
  const relojes = useRef<number[]>([]);

  useEffect(() => {
    for (const n of novedades) {
      if (n.n <= vista.current) continue;
      vista.current = n.n;
      const uid = n.uid;
      if (!uid || n.tipo === 'mensaje') continue;
      if (n.tipo === 'entra') {
        setSalieron((s) => s.filter((x) => x.uid !== uid));
        setEntraron((s) => new Set(s).add(uid));
        relojes.current.push(window.setTimeout(() => setEntraron((s) => new Set([...s].filter((x) => x !== uid))), 2500));
      } else {
        setSalieron((s) => [...s.filter((x) => x.uid !== uid), { uid, nombre: n.nombre }]);
        relojes.current.push(window.setTimeout(() => setSalieron((s) => s.filter((x) => x.uid !== uid)), 1500));
      }
    }
  }, [novedades]);
  useEffect(() => () => relojes.current.forEach((t) => window.clearTimeout(t)), []);

  return { entraron, salieron };
}
