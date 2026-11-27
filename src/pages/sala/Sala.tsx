import { useEffect, useRef, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { auth } from '../../firebase';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useFuentePropia } from '../../hooks/useFuentePropia';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { IconoPixel } from '../../utils/retro/PixelIcon';
import BotonFuente from '../../utils/ui/BotonFuente';
import Boton from '../../utils/ui/Boton';
import Mensaje from '../../utils/ui/Mensaje';
import BotonSalir from './BotonSalir';
import SelectorVista from './SelectorVista';
import Divisor from './Divisor';
import InfoSala from './InfoSala';
import PanelChat from './PanelChat';
import PanelIntegrantes from './PanelIntegrantes';
import Tablero from './Tablero';
import { useSala } from './useSala';
import { useTablero } from './useTablero';

type Pestana = 'chat' | 'integrantes';

// Anchos de las columnas laterales (px): valor de partida y límites. El centro nunca baja de CENTRO_MIN.
const IZQ = { def: 312, min: 240, max: 440 };
const DER = { def: 384, min: 280, max: 560 };
const CENTRO_MIN = 360;
// Teléfono horizontal (poca altura y, a veces, poco ancho): columnas más estrechas y un centro más pequeño.
const IZQ_C = { def: 200, min: 160, max: 300 };
const DER_C = { def: 260, min: 200, max: 380 };
const CENTRO_MIN_C = 280;
const SEPARADOR = 16; // las dos líneas arrastrables (0,5 rem cada una + holgura)
const MINIMIZADA = 56;
const MINIMIZADA_COMPACTA = 28; // teléfono horizontal: la mitad
const CLAVE_ANCHOS = 'synk:sala:anchos';
const CLAVE_CONTRASTE = 'synk:sala:bajo-contraste';

// Modo de bajo contraste (solo esta vista): fondo gris oscuro suave y texto gris claro en vez de negro y blanco puros. Sigue cumpliendo
// el contraste mínimo de WCAG AA (≥ 4,5:1): el texto secundario sobre este fondo da más de 6:1.
const BAJO_CONTRASTE = {
  '--color-fondo': '#1c1c21',
  '--color-superficie': '#222228',
  '--color-primario-suave': '#2a2a31',
  '--color-texto': '#d4d4d8',
  '--color-texto-secundario': '#a1a1aa',
  '--color-borde': '#52525b',
} as React.CSSProperties;

const leerJson = <T,>(clave: string, por: T): T => {
  try {
    return { ...por, ...JSON.parse(localStorage.getItem(clave) ?? '{}') };
  } catch {
    return por;
  }
};
const guardar = (clave: string, valor: unknown) => {
  try {
    localStorage.setItem(clave, typeof valor === 'string' ? valor : JSON.stringify(valor));
  } catch {
    /* sin almacenamiento: dura solo esta visita */
  }
};
const limitar = (v: number, min: number, max: number) => Math.min(Math.max(v, min), Math.max(min, max));

// Cabecera de un panel lateral (escritorio): título y botón, solo con su icono, para minimizarlo (la tipografía se cambia desde la cabecera de la sala).
// Minimizado queda en el centro vertical de la columna: el icono y, debajo, el rótulo girado de abajo hacia arriba (se lee con la cabeza
// inclinada a la izquierda), sin líneas.
function CabeceraPanel({ titulo, lado, minimizado, alAlternar, cuenta, clara, compacto }: { titulo: string; lado: 'izq' | 'der'; minimizado: boolean; alAlternar: () => void; cuenta?: number; clara: boolean; compacto: boolean }) {
  // La flecha apunta hacia donde se pliega el panel (o desde donde vuelve).
  const hacia = (lado === 'izq') === !minimizado ? 'flechaIzquierda' : 'flechaDerecha';
  const rotulo = `${titulo}${cuenta !== undefined ? ` (${cuenta})` : ''}`;
  const fuente = clara ? 'font-sans text-sm font-medium' : 'font-pixel text-[11px] leading-5';
  const boton = (
    <button type="button" onClick={alAlternar} aria-expanded={!minimizado} aria-label={`${minimizado ? 'Mostrar' : 'Ocultar'} ${titulo.toLowerCase()}`} className={`grid place-items-center hover:text-acento-claro focus-visible:text-acento-claro ${compacto && minimizado ? 'size-6' : 'size-8'}`}>
      <IconoPixel nombre={hacia} />
    </button>
  );
  if (minimizado) {
    return (
      <div className={`flex min-h-0 flex-1 flex-col items-center justify-center ${compacto ? 'gap-2 py-1' : 'gap-4 py-3'}`}>
        {boton}
        <span className={`rotate-180 [writing-mode:vertical-rl] ${fuente}`}>{rotulo}</span>
      </div>
    );
  }
  return (
    <div className={`flex items-center justify-between gap-2 border-b-2 border-texto px-3 ${compacto ? 'py-1' : 'py-2'}`}>
      <h2 className={`min-w-0 truncate ${fuente}`}>{titulo}</h2>
      {boton}
    </div>
  );
}

// La sala (anfitrión y participantes): escritorio en 3 columnas (integrantes, tablero, chat) con las laterales minimizables y de ancho
// ajustable; móvil en vertical, con el tablero arriba y, debajo, Chat o Integrantes en pestañas. Sin encabezado ni pie del sitio.
export default function Sala() {
  const { id = '' } = useParams();
  const { estado, enviar } = useSala(id);
  // Quien llega por «Unirse» recibe la confirmación (US-08).
  const llegaUniendose = Boolean((useLocation().state as { entraste?: boolean } | null)?.entraste);
  const [bienvenida, setBienvenida] = useState(false);
  useDocumentTitle(estado.fase === 'lista' ? estado.sala.nombre : 'Sala');
  const integrantes = estado.fase === 'lista' ? estado.integrantes : [];
  const tablero = useTablero(id, integrantes, estado.fase === 'lista' ? estado.sala.uid : '');
  const [izqMin, setIzqMin] = useState(false);
  const [derMin, setDerMin] = useState(false);
  const [anchos, setAnchos] = useState(() => leerJson(CLAVE_ANCHOS, { izq: IZQ.def, der: DER.def, izqC: IZQ_C.def, derC: DER_C.def }));
  const [anchoTotal, setAnchoTotal] = useState(0);
  const [bajoContraste, setBajoContraste] = useState(() => {
    try {
      return localStorage.getItem(CLAVE_CONTRASTE) === '1';
    } catch {
      return false;
    }
  });
  const [pestana, setPestana] = useState<Pestana>('chat');
  const [plegado, setPlegado] = useState(false); // móvil vertical: el panel de abajo está plegado
  // Tipografía de las tres columnas, juntas: la de Ajustes hasta que se cambia con el «Aa» de la cabecera (solo para esta visita).
  const [clara, alternarFuente] = useFuentePropia();
  const [info, setInfo] = useState(false);
  const botonInfo = useRef<HTMLButtonElement>(null);
  const [saliendo, setSaliendo] = useState(false); // «Click de nuevo para salir» está abierto
  const contenedor = useRef<HTMLDivElement>(null);
  // Teléfono horizontal: poca altura. Usa el diseño de escritorio (3 columnas), en versión compacta, aunque el ancho sea menor de 768.
  const compacto = useMediaQuery('(orientation: landscape) and (max-height: 500px)');
  const escritorio = useMediaQuery('(min-width: 768px)') || compacto; // md de Tailwind
  const ancho900 = useMediaQuery('(min-width: 900px)');
  const minimizada = compacto ? MINIMIZADA_COMPACTA : MINIMIZADA;
  const miUid = auth.currentUser?.uid;

  const dentro = estado.fase === 'lista';
  useEffect(() => {
    if (!dentro || !llegaUniendose) return;
    setBienvenida(true);
    const t = window.setTimeout(() => setBienvenida(false), 4000);
    return () => window.clearTimeout(t);
  }, [dentro, llegaUniendose]);

  useEffect(() => guardar(CLAVE_ANCHOS, anchos), [anchos]);
  // Ancho disponible para las columnas (cambia al girar el teléfono o redimensionar la ventana).
  useEffect(() => {
    const el = contenedor.current;
    if (!el) return;
    const medir = () => setAnchoTotal(el.clientWidth);
    medir();
    const o = new ResizeObserver(medir);
    o.observe(el);
    return () => o.disconnect();
  }, [escritorio, estado.fase]);
  useEffect(() => guardar(CLAVE_CONTRASTE, bajoContraste ? '1' : '0'), [bajoContraste]);

  // Anchos en píxeles de las dos columnas en este modo (normal o compacto), cada una dentro de su rango. Si no queda al menos `lim.centro`
  // para el tablero, se encogen (primero el chat, luego integrantes) hasta sus mínimos; plegadas ocupan `minimizada`.
  const lim = compacto ? { izq: IZQ_C, der: DER_C, centro: CENTRO_MIN_C } : { izq: IZQ, der: DER, centro: CENTRO_MIN };
  const guardadoIzq = compacto ? anchos.izqC : anchos.izq;
  const guardadoDer = compacto ? anchos.derC : anchos.der;
  let izqPx = izqMin ? minimizada : limitar(guardadoIzq, lim.izq.min, lim.izq.max);
  let derPx = derMin ? minimizada : limitar(guardadoDer, lim.der.min, lim.der.max);
  if (anchoTotal > 0) {
    let exceso = izqPx + derPx + SEPARADOR + lim.centro - anchoTotal;
    if (exceso > 0 && !derMin) {
      const r = Math.min(exceso, derPx - lim.der.min);
      derPx -= r;
      exceso -= r;
    }
    if (exceso > 0 && !izqMin) izqPx -= Math.min(exceso, izqPx - lim.izq.min);
  }
  // Cambia el ancho de una columna dentro de su rango y sin dejar el centro por debajo de lo mínimo.
  const ancho = (lado: 'izq' | 'der', px: number) => {
    const r = lado === 'izq' ? lim.izq : lim.der;
    const otra = lado === 'izq' ? derPx : izqPx;
    const tope = Math.min(r.max, (anchoTotal || Infinity) - otra - SEPARADOR - lim.centro);
    const valor = Math.round(limitar(px, r.min, tope));
    setAnchos((a) => ({ ...a, [compacto ? (lado === 'izq' ? 'izqC' : 'derC') : lado]: valor }));
  };

  if (estado.fase !== 'lista') {
    return (
      <main className="grid min-h-dvh place-items-center p-5 text-center">
        {estado.fase === 'conectando' ? (
          <Mensaje tipo="info" titulo={<span className="font-pixel text-[11px] leading-5">Conectando a la Sala…</span>} />
        ) : (
          <div className="max-w-sm border-2 border-error p-6">
            <Mensaje tipo="error" titulo="No pudimos entrar a la sala">{estado.mensaje}</Mensaje>
            <Boton to="/dashboard" className="mt-5">Volver a mis salas</Boton>
          </div>
        )}
      </main>
    );
  }

  const { sala, mensajes, conectado } = estado;
  const esAnfitrion = sala.uid === miUid;
  const panelIntegrantes = (clara: boolean) => <PanelIntegrantes integrantes={integrantes} anfitrionUid={sala.uid} miUid={miUid} tablero={tablero} clara={clara} />;
  const panelChat = (clara: boolean) => <PanelChat mensajes={mensajes} miUid={miUid} conectado={conectado} enviar={enviar} clara={clara} />;
  const centrada = escritorio && !compacto;
  const pequeno = compacto || !escritorio; // botones de 32 px en teléfono
  const botonIcono = `grid ${pequeno ? 'size-8' : 'size-10'} place-items-center border-2 border-texto hover:bg-texto hover:text-fondo focus-visible:bg-texto focus-visible:text-fondo`;

  return (
    <div className="flex h-dvh flex-col bg-fondo text-texto" style={bajoContraste ? BAJO_CONTRASTE : undefined}>
      {/* Barra de la sala. Escritorio: nombre e ID centrados. Teléfono horizontal: nombre e ID en una línea, a la izquierda. Teléfono vertical:
          a la izquierda, con el ID bajo el nombre. A la derecha, la vista del tablero, bajo contraste y salida. */}
      <header className={centrada ? 'grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-b-2 border-texto px-3 py-2' : `flex items-center gap-3 border-b-2 border-texto ${compacto ? 'px-2 py-1' : 'px-3 py-2'}`}>
        {centrada && <span aria-hidden="true" />}
        <div className={centrada ? 'min-w-0 text-center' : compacto ? 'flex min-w-0 flex-1 items-baseline gap-3' : 'min-w-0 flex-1'}>
          <h1 className={`truncate font-pixel text-[11px] leading-5 ${compacto ? 'max-w-[45%] shrink-0' : ''}`}>{sala.nombre}</h1>
          <p className="min-w-0 truncate text-xs text-texto-secundario">{esAnfitrion ? 'Eres el anfitrión' : 'Participante'} · ID: {sala.id}</p>
        </div>
        <div className={`flex shrink-0 items-center gap-2 ${centrada ? 'justify-end' : ''}`}>
          {/* Con «salir» armado, en pantallas estrechas se ocultan la tipografía, la vista y la información para que quepa el aviso; el botón de contraste se queda. */}
          {!(saliendo && !ancho900) && (
            <>
              <BotonFuente clara={clara} onAlternar={alternarFuente} />
              <SelectorVista diseno={tablero.diseno} alCambiar={tablero.cambiarDiseno} compacto={pequeno} />
            </>
          )}
          <button type="button" onClick={() => setBajoContraste((b) => !b)} aria-pressed={bajoContraste} aria-label="Modo de bajo contraste" title={bajoContraste ? 'Volver al contraste normal' : 'Modo de bajo contraste: fondo y texto más suaves'} className={`${botonIcono} aria-pressed:bg-texto aria-pressed:text-fondo`}>
            <IconoPixel nombre="contraste" />
          </button>
          {!(saliendo && !ancho900) && (
            <button ref={botonInfo} type="button" onClick={() => setInfo(true)} aria-haspopup="dialog" aria-label="Información de la sala" title="Información de la sala" className={botonIcono}>
              <IconoPixel nombre="info" />
            </button>
          )}
          <BotonSalir compacto={pequeno} alArmar={setSaliendo} />
        </div>
      </header>
      <p role="status" className={bienvenida ? 'border-b-2 border-exito px-3 py-2 text-center text-sm text-exito' : 'sr-only'}>{bienvenida ? `Entraste a «${sala.nombre}».` : ''}</p>
      <Mensaje tipo="error" className={conectado ? 'sr-only' : 'border-b-2 border-error px-3 py-2 text-center'}>
        {!conectado && 'Se perdió la conexión. Reconectando…'}
      </Mensaje>

      {escritorio ? (
        // Escritorio: 3 columnas con una línea arrastrable entre cada par.
        <div ref={contenedor} className="grid min-h-0 flex-1" style={{ gridTemplateColumns: `${izqPx}px 0.5rem minmax(0, 1fr) 0.5rem ${derPx}px` }}>
          <aside aria-label="Integrantes" className="flex min-h-0 min-w-0 flex-col">
            <CabeceraPanel titulo="Integrantes" lado="izq" minimizado={izqMin} alAlternar={() => setIzqMin((m) => !m)} cuenta={integrantes.length} clara={clara} compacto={compacto} />
            {!izqMin && panelIntegrantes(clara)}
          </aside>
          <div className="flex justify-center"><Divisor lado="izq" valor={izqPx} min={lim.izq.min} max={lim.izq.max} etiqueta="Cambiar el ancho de la columna de integrantes" deshabilitado={izqMin} alCambiar={(px) => ancho('izq', px)} /></div>
          <Tablero t={tablero} anfitrionUid={sala.uid} clara={clara} compacto={compacto} />
          <div className="flex justify-center"><Divisor lado="der" valor={derPx} min={lim.der.min} max={lim.der.max} etiqueta="Cambiar el ancho de la columna del chat" deshabilitado={derMin} alCambiar={(px) => ancho('der', px)} /></div>
          <aside aria-label="Chat" className="flex min-h-0 min-w-0 flex-col">
            <CabeceraPanel titulo="Chat" lado="der" minimizado={derMin} alAlternar={() => setDerMin((m) => !m)} clara={clara} compacto={compacto} />
            {/* Minimizado se desmonta solo la vista: el chat sigue recibiendo en el estado de la sala. */}
            {!derMin && panelChat(clara)}
          </aside>
        </div>
      ) : (
        // Móvil vertical: tablero arriba; abajo, Chat o Integrantes, que se pliega con la flecha del inicio de la barra.
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex min-h-0 flex-[2] flex-col"><Tablero t={tablero} anfitrionUid={sala.uid} clara={clara} compacto={false} /></div>
          <div className={`flex min-h-0 flex-col border-t-2 border-texto ${plegado ? '' : 'flex-[3]'}`}>
            {/* Barra: flecha de plegar, pestañas y «Aa». La pestaña elegida va en morado; plegado, el morado pasa a la flecha y la pestaña queda blanca. */}
            <div className={`flex items-stretch border-b-2 border-texto ${clara ? 'font-sans text-sm font-medium' : 'font-pixel text-[11px] leading-5'}`}>
              <button
                type="button"
                onClick={() => setPlegado((p) => !p)}
                aria-expanded={!plegado}
                aria-controls={`panel-${pestana}`}
                aria-label={plegado ? 'Desplegar el panel' : 'Plegar el panel'}
                className={`grid w-11 place-items-center ${plegado ? 'text-acento-claro' : 'hover:text-acento-claro'}`}
              >
                <IconoPixel nombre={plegado ? 'flechaArriba' : 'flechaAbajo'} />
              </button>
              <div role="tablist" aria-label="Chat o integrantes" className="grid min-w-0 flex-1 grid-cols-2">
                {(['chat', 'integrantes'] as const).map((p) => (
                  <button
                    key={p}
                    role="tab"
                    type="button"
                    id={`pestana-${p}`}
                    aria-selected={pestana === p}
                    aria-controls={`panel-${p}`}
                    onClick={() => {
                      setPestana(p);
                      setPlegado(false);
                    }}
                    className={`py-3 ${pestana === p && !plegado ? 'text-acento-claro' : 'hover:text-acento-claro'}`}
                  >
                    {p === 'chat' ? 'Chat' : `Integrantes (${integrantes.length})`}
                  </button>
                ))}
              </div>
            </div>
            {!plegado && (
              <div role="tabpanel" id={`panel-${pestana}`} aria-labelledby={`pestana-${pestana}`} className="flex min-h-0 flex-1 flex-col overflow-y-auto">
                {pestana === 'chat' ? panelChat(clara) : panelIntegrantes(clara)}
              </div>
            )}
          </div>
        </div>
      )}
      {info && (
        <InfoSala
          sala={sala}
          esAnfitrion={esAnfitrion}
          integrantes={integrantes.length}
          alCerrar={() => {
            setInfo(false);
            window.setTimeout(() => botonInfo.current?.focus(), 0); // el foco vuelve al botón que abrió el popup
          }}
        />
      )}
    </div>
  );
}
