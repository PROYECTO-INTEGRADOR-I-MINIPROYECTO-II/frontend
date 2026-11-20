import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Integrante } from '../../realtime/tipos';
import { colocar, DISENOS, vecino, type Anclas, type Diseno, type Flecha } from './anclas';

interface Guardado {
  diseno: Diseno;
  anclas: Anclas;
}
const clave = (salaId: string) => `synk:tablero:${salaId}`;

function leer(salaId: string): Guardado {
  try {
    const g = JSON.parse(localStorage.getItem(clave(salaId)) ?? 'null');
    if (g && DISENOS.some((d) => d.valor === g.diseno) && g.anclas && typeof g.anclas === 'object') return g;
  } catch {
    /* sin almacenamiento o dato dañado: se empieza de cero */
  }
  return { diseno: 'cuadricula', anclas: {} };
}

// Cómo tiene cada persona su tablero (diseño y anclas): es solo suyo, se recuerda en este navegador por sala y no se envía a nadie.
// `anuncio` es lo último que pasó, redactado para leerse en voz alta (región viva); `foco` es el punto que debe recibir el foco tras mover.
export function useTablero(salaId: string, integrantes: Integrante[], anfitrionUid: string) {
  const [g, setG] = useState<Guardado>(() => leer(salaId));
  const [anuncio, setAnuncio] = useState('');
  const [foco, setFoco] = useState<number | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(clave(salaId), JSON.stringify(g));
    } catch {
      /* sin almacenamiento: dura solo esta visita */
    }
  }, [salaId, g]);

  const puntos = useMemo(() => colocar(integrantes, g.anclas, anfitrionUid), [integrantes, g.anclas, anfitrionUid]);
  const indiceDe = useCallback((uid: string) => puntos.findIndex((p) => p.uid === uid), [puntos]);
  const nombreDe = (uid: string) => integrantes.find((i) => i.uid === uid)?.username ?? 'Esa persona';

  const cambiarDiseno = (diseno: Diseno) => {
    setG((x) => ({ ...x, diseno }));
    setAnuncio(`Diseño: ${DISENOS.find((d) => d.valor === diseno)?.nombre}.`);
  };

  /** Ancla a `uid` en el punto `punto` (el que estaba ahí, si estaba anclado, ocupa el que quedó libre). */
  const anclar = (uid: string, punto: number) => {
    const desde = indiceDe(uid);
    const quien = puntos[punto];
    setG((x) => {
      const anclas = { ...x.anclas, [uid]: punto };
      if (quien && quien.uid !== uid && x.anclas[quien.uid] !== undefined) anclas[quien.uid] = desde;
      return { ...x, anclas };
    });
    setAnuncio(`${nombreDe(uid)} anclado en el punto ${punto + 1}.`);
  };

  const quitar = (uid: string) => {
    setG((x) => {
      const { [uid]: _quitado, ...anclas } = x.anclas;
      return { ...x, anclas };
    });
    setAnuncio(`Ancla de ${nombreDe(uid)} quitada.`);
  };

  /** Con el foco en un punto, una flecha mueve ahí a su persona (y la ancla). */
  const mover = (punto: number, tecla: Flecha) => {
    const destino = vecino(g.diseno, punto, tecla, puntos.length);
    if (destino === null) return setAnuncio('No hay otro punto en esa dirección.');
    anclar(puntos[punto].uid, destino);
    setFoco(destino);
  };

  return { diseno: g.diseno, anclas: g.anclas, puntos, cambiarDiseno, anclar, quitar, mover, indiceDe, anuncio, foco, limpiarFoco: () => setFoco(null) };
}

export type Tablero = ReturnType<typeof useTablero>;
