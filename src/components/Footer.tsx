import { useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import univalleLogo from '../assets/univalle-logo.png';

const tab = 'underline underline-offset-4 hover:text-texto-secundario';

// Fila inferior al estilo Monokuro: línea fina, enlaces subrayados repartidos y etiqueta tenue.
export default function Footer() {
  const ref = useRef<HTMLElement>(null);

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

  return (
    <footer ref={ref} className="fixed inset-x-0 bottom-0 z-10 bg-fondo">
      <div className="mx-auto w-full max-w-5xl px-5 pb-4">
      <div className="border-t border-texto/80 pt-3 font-pixel text-base">
        <nav aria-label="Pie de página">
          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 sm:justify-between">
            <li><Link to="/estado" className={tab}>Estado del sistema</Link></li>
            <li><Link to="/ayuda" className={tab}>Ayuda</Link></li>
            <li><Link to="/accesibilidad" className={tab}>Accesibilidad</Link></li>
            <li className="flex items-center gap-3 text-texto-secundario">
              <img src={univalleLogo} alt="" aria-hidden="true" className="h-10 w-auto [image-rendering:pixelated]" />
              <span>
                Proyecto Integrador I
                <br />
                Univalle 2026
              </span>
            </li>
          </ul>
        </nav>
      </div>
      </div>
    </footer>
  );
}
