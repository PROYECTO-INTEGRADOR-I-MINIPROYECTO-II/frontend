import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import TextoVivo from '../../../utils/retro/TextoVivo';
import CuentaEnlace from './CuentaEnlace';
import LoginPanel from './LoginPanel';
import { useLoginPanel } from './loginPanelContext';
import univalleLogo from '../../../assets/univalle-logo.png';


const ENLACES = [
  { to: '/estado', texto: 'Estado del sistema' },
  { to: '/ayuda', texto: 'Ayuda' },
  { to: '/accesibilidad', texto: 'Accesibilidad' },
  { to: '/ajustes', texto: 'Ajustes' },
];

function Etiqueta() {
  return (
    <span className="flex items-center gap-3 text-texto-secundario">
      <img src={univalleLogo} alt="" aria-hidden="true" className="h-10 w-auto motion-safe:animate-flotar [image-rendering:pixelated]" />
      <span>
        Proyecto Integrador I
        <br />
        Univalle 2026
      </span>
    </span>
  );
}

// Panel inferior fijo al estilo Monokuro. En pantallas anchas muestra los enlaces repartidos;
// en pantallas angostas los guarda en un menú que se despliega hacia arriba.
export default function Footer() {
  const ref = useRef<HTMLElement>(null);
  const [abierto, setAbierto] = useState(false);
  const { pathname } = useLocation();
  const panel = useLoginPanel();

  // El panel va fijo sobre el borde inferior; publica su alto para que el contenido deje ese espacio libre.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const publish = () => document.documentElement.style.setProperty('--footer-h', `${el.offsetHeight}px`);
    publish();
    const obs = new ResizeObserver(publish);
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => setAbierto(false), [pathname]);
  // Al abrir el panel de inicio de sesión, el menú del pie (móvil) se cierra para no encimarse.
  useEffect(() => {
    if (panel.abierto) setAbierto(false);
  }, [panel.abierto]);

  useEffect(() => {
    if (!abierto) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setAbierto(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [abierto]);

  return (
    <footer ref={ref} className="fixed inset-x-0 bottom-0 z-10 bg-fondo">
      <div className="px-5 pb-4 sm:px-8">
        <div className="relative border-t border-texto/80 pt-3 font-pixel text-[11px] leading-5">
          {/* Ancho: enlaces repartidos en toda la fila. */}
          <nav aria-label="Pie de página" className="hidden md:block">
            <ul className="flex items-center justify-between gap-6">
              <li><CuentaEnlace /></li>

              {ENLACES.map((e) => (
                <li key={e.to}><Link to={e.to} className="group"><TextoVivo>{e.texto}</TextoVivo></Link></li>
              ))}
              
              <li><Etiqueta /></li>
            </ul>
          </nav>

          {/* Angosto: botón de menú y etiqueta; el panel se despliega hacia arriba. */}
          <div className="flex items-center justify-between gap-4 md:hidden">
            <button
              type="button"
              aria-expanded={abierto}
              aria-controls="menu-pie"
              onClick={() => setAbierto((a) => !a)}
              className="inline-flex items-center gap-2 rounded-lg border border-borde px-3 py-2 hover:bg-primario-suave"
            >
              {abierto ? <X aria-hidden="true" className="size-5" /> : <Menu aria-hidden="true" className="size-5" />}
              Menú
            </button>
            <Etiqueta />
          </div>
          <nav
            id="menu-pie"
            aria-label="Pie de página"
            hidden={!abierto}
            className="absolute inset-x-0 bottom-full -mx-5 border-t border-texto/80 bg-fondo px-5 py-2 sm:-mx-8 sm:px-8 md:hidden"
          >
            <ul>
              <li className="border-b border-borde"><CuentaEnlace className="block py-3" /></li>
              {ENLACES.map((e) => (
                <li key={e.to} className="border-b border-borde last:border-0">
                  <Link to={e.to} className="group block py-3">
                    <TextoVivo>{e.texto}</TextoVivo>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <LoginPanel />
        </div>
      </div>
    </footer>
  );
}
