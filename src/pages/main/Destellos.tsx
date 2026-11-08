import { useCallback, useEffect, useState, type CSSProperties } from 'react';
import { SPRITES } from '../../utils/sprites/sprites';

// Destellos del fondo: unos iconos aparecen en un punto al azar de la pantalla, suben de opacidad hasta `opacidad` (la misma que el halo
// del cursor, para no restar contraste al texto que pasa por encima) y vuelven a 0, sin parar. Cada uno es un sprite al azar, dura un
// tiempo distinto y, al terminar, salta a otro punto. No hay cuadrícula: el punto se elige libremente, siempre a DISTANCIA_MIN px o
// más de cualquier elemento visible de la página (texto, imágenes, bordes, fondos, controles) y de los otros destellos.
// No se aplica en móvil (menos de 768 px). Con «Pausar animaciones» o «reducir movimiento» no se mueve nada y no se ve ninguno (la opacidad
// base es 0).
export const DESTELLOS = 15; // cuántos hay a la vez (si el espacio libre es menor, se crean menos)
const DISTANCIA_MIN = 32; // px de separación mínima con cualquier elemento de la página
const PANTALLA_ANCHA = '(min-width: 768px)'; // el efecto solo se aplica desde tablet y escritorio (md); en móvil el contenido ocupa todo el ancho
const DISTANCIA_ENTRE = 72; // px mínimos entre los centros de dos destellos
const BORDE = 8; // px que se dejan libres en el borde de la pantalla
const DURACION_MIN = 2.4; // s por ciclo (sube y baja)
const DURACION_MAX = 4.4;
const RETRASO_MAX = 2.5; // s, para que no arranquen todos juntos
const INTENTOS = 300; // posiciones que se prueban antes de rendirse (si la pantalla está llena, hay menos destellos)

interface Destello {
  x: number;
  y: number;
  sprite: number;
  duracion: number;
  retraso: number;
}
interface Caja {
  izq: number;
  arr: number;
  der: number;
  aba: number;
}

// Azar para algo solo decorativo; se usa crypto en lugar de Math.random para no depender de un generador predecible.
const azar = (n: number): number => crypto.getRandomValues(new Uint32Array(1))[0] % n;
const entre = (min: number, max: number): number => min + (azar(1000) / 1000) * (max - min);

// ---- Qué hay en la página -----------------------------------------------------------------------------------------------------------
// Se recorre la página y se anota la caja de todo lo que se ve: elementos con fondo, imagen o borde, imágenes, vídeos, lienzos, SVG,
// controles de formulario y cada línea de texto. El resultado se guarda unos instantes, porque lo consultan todos los destellos.
const alfa = (color: string): number => {
  if (color === 'transparent') return 0;
  const barra = color.match(/\/\s*([\d.]+%?)\s*\)/); // color(srgb 0 0 0 / .5), oklab(... / .5)
  if (barra) return barra[1].endsWith('%') ? parseFloat(barra[1]) / 100 : parseFloat(barra[1]);
  const rgba = color.match(/^rgba\((.+)\)$/);
  if (rgba) return parseFloat(rgba[1].split(',')[3] ?? '1');
  return 1;
};

const pinta = (e: Element, cs: CSSStyleDeclaration): boolean => {
  if (['IMG', 'VIDEO', 'CANVAS', 'INPUT', 'TEXTAREA', 'SELECT', 'svg'].includes(e.tagName)) return true;
  if (alfa(cs.backgroundColor) > 0.05 || cs.backgroundImage !== 'none') return true;
  return ['Top', 'Right', 'Bottom', 'Left'].some((l) => parseFloat(cs.getPropertyValue(`border-${l.toLowerCase()}-width`)) > 0 && cs.getPropertyValue(`border-${l.toLowerCase()}-style`) !== 'none');
};

// Lo que un contenedor con `overflow` distinto de visible oculta no se ve, así que no cuenta: el texto del letrero LED, por ejemplo, corre
// dentro de un recuadro y su caja real se extiende mucho más allá de él (hacia los lados, donde sí hay sitio libre).
const recortar = (r: Caja, area: Caja): Caja | null => {
  const c = { izq: Math.max(r.izq, area.izq), arr: Math.max(r.arr, area.arr), der: Math.min(r.der, area.der), aba: Math.min(r.aba, area.aba) };
  return c.der > c.izq && c.aba > c.arr ? c : null;
};

function leerPagina(): Caja[] {
  const cajas: Caja[] = [];
  const pantalla: Caja = { izq: 0, arr: 0, der: window.innerWidth, aba: window.innerHeight };
  const raiz = document.getElementById('root') ?? document.body;

  // Zona visible de un elemento y de lo que contiene: la pantalla, recortada por él y por sus ancestros que ocultan el desbordamiento.
  const zonas = new Map<Element, Caja | null>();
  const zonaDe = (e: Element): Caja | null => {
    if (zonas.has(e)) return zonas.get(e) ?? null;
    const padre = e === raiz || !e.parentElement ? pantalla : zonaDe(e.parentElement);
    const cs = getComputedStyle(e);
    let zona = padre;
    if (zona && e !== raiz && (cs.overflowX !== 'visible' || cs.overflowY !== 'visible')) {
      const r = e.getBoundingClientRect();
      zona = recortar({ izq: r.left, arr: r.top, der: r.right, aba: r.bottom }, zona);
    }
    zonas.set(e, zona);
    return zona;
  };
  const anotar = (r: DOMRect, zona: Caja | null) => {
    if (!zona || r.width <= 0 || r.height <= 0) return;
    const c = recortar({ izq: r.left, arr: r.top, der: r.right, aba: r.bottom }, zona);
    if (c) cajas.push(c);
  };

  for (const e of raiz.querySelectorAll('*')) {
    if (e.closest('[data-fondo]') || (e.closest('svg') && e.tagName !== 'svg')) continue; // el fondo no cuenta; de un SVG cuenta su caja entera
    const cs = getComputedStyle(e);
    if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) < 0.05) continue;
    if (pinta(e, cs)) anotar(e.getBoundingClientRect(), e.parentElement ? zonaDe(e.parentElement) : pantalla);
    for (const n of e.childNodes) {
      if (n.nodeType === Node.TEXT_NODE && n.textContent?.trim()) {
        const r = document.createRange();
        r.selectNodeContents(n);
        const zona = zonaDe(e);
        for (const linea of r.getClientRects()) anotar(linea, zona);
      }
    }
  }
  return cajas;
}

let guardada: { cuando: number; cajas: Caja[] } | null = null;
const pagina = (): Caja[] => {
  const ahora = performance.now();
  if (!guardada || ahora - guardada.cuando > 400) guardada = { cuando: ahora, cajas: leerPagina() };
  return guardada.cajas;
};

const libre = (x: number, y: number, caja: number, cajas: Caja[]): boolean => {
  const izq = x - DISTANCIA_MIN;
  const arr = y - DISTANCIA_MIN;
  const der = x + caja + DISTANCIA_MIN;
  const aba = y + caja + DISTANCIA_MIN;
  return cajas.every((c) => c.der <= izq || c.izq >= der || c.aba <= arr || c.arr >= aba);
};

interface Props {
  /** Opacidad máxima del destello (0 a 1). */
  opacidad: number;
  /** Lado, en px, de la caja cuadrada en la que se ajusta cada sprite. */
  caja: number;
}

export default function Destellos({ opacidad, caja }: Props) {
  const [destellos, setDestellos] = useState<Destello[]>([]);
  const [ancha, setAncha] = useState(() => window.matchMedia(PANTALLA_ANCHA).matches);
  useEffect(() => {
    const m = window.matchMedia(PANTALLA_ANCHA);
    const cambiar = () => setAncha(m.matches);
    m.addEventListener('change', cambiar);
    return () => m.removeEventListener('change', cambiar);
  }, []);

  // Un punto al azar, lejos de todo y de los demás destellos, con un sprite al azar. Si no hay sitio, null.
  const elegir = useCallback(
    (otros: Destello[], previo?: Destello): Destello | null => {
      const cajas = pagina();
      // clientWidth y clientHeight excluyen las barras de desplazamiento (innerWidth las incluye).
      const ancho = document.documentElement.clientWidth - caja - 2 * BORDE;
      const alto = document.documentElement.clientHeight - caja - 2 * BORDE;
      if (ancho <= 0 || alto <= 0) return null;
      for (let intento = 0; intento < INTENTOS; intento++) {
        const x = BORDE + azar(Math.floor(ancho));
        const y = BORDE + azar(Math.floor(alto));
        if (otros.some((o) => Math.hypot(o.x - x, o.y - y) < DISTANCIA_ENTRE) || !libre(x, y, caja, cajas)) continue;
        return { x, y, sprite: azar(SPRITES.length), duracion: previo?.duracion ?? entre(DURACION_MIN, DURACION_MAX), retraso: previo ? 0 : entre(0, RETRASO_MAX) };
      }
      return null;
    },
    [caja],
  );

  useEffect(() => {
    if (!ancha) {
      setDestellos([]); // en móvil no hay destellos
      return;
    }
    const crear = () => {
      guardada = null; // la página puede haber cambiado de tamaño o de contenido
      const lista: Destello[] = [];
      for (let i = 0; i < DESTELLOS; i++) {
        const d = elegir(lista);
        if (d) lista.push(d);
      }
      setDestellos(lista);
    };
    crear();
    window.addEventListener('resize', crear);
    return () => window.removeEventListener('resize', crear);
  }, [elegir, ancha]);

  // Al terminar un ciclo (opacidad 0) el destello salta a otro punto y otro sprite; el siguiente ciclo empieza ya allí.
  const mover = (i: number) =>
    setDestellos((prev) => {
      const nuevo = elegir(
        prev.filter((_, j) => j !== i),
        prev[i],
      );
      return nuevo ? prev.map((d, j) => (j === i ? nuevo : d)) : prev;
    });

  return (
    <>
      {destellos.map((d, i) => (
        <img
          key={i}
          alt=""
          src={SPRITES[d.sprite].src}
          draggable={false}
          onAnimationIteration={() => mover(i)}
          className="destello absolute"
          style={
            {
              left: d.x,
              top: d.y,
              width: caja,
              height: caja,
              objectFit: 'contain',
              imageRendering: 'pixelated',
              '--op': opacidad,
              '--dur': `${d.duracion.toFixed(2)}s`,
              '--retraso': `${d.retraso.toFixed(2)}s`,
            } as CSSProperties
          }
        />
      ))}
    </>
  );
}
