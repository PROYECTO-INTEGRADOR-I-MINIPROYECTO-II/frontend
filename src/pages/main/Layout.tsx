import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Footer from './footer/Footer';
import Header from './header/Header';

export default function Layout() {
  const { pathname } = useLocation();
  const main = useRef<HTMLElement>(null);
  const first = useRef(true);

  // Al cambiar de ruta, el foco pasa al contenido para lectores de pantalla y teclado.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    main.current?.focus();
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col pb-[var(--footer-h,0px)]">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-20 focus:rounded-lg focus:bg-primario focus:px-4 focus:py-2 focus:text-black"
      >
        Saltar al contenido
      </a>
      <Header />
      <main id="contenido" ref={main} tabIndex={-1} className="flex flex-1 flex-col outline-none">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
