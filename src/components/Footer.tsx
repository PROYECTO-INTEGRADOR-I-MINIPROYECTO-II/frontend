import { Link } from 'react-router-dom';

const tab = 'underline underline-offset-4 hover:text-texto-secundario';

// Fila inferior al estilo Monokuro: línea fina, enlaces subrayados repartidos y etiqueta tenue.
export default function Footer() {
  return (
    <footer className="mx-auto w-full max-w-5xl px-5 pb-6">
      <div className="border-t border-texto/80 pt-3 font-pixel text-base">
        <nav aria-label="Pie de página">
          <ul className="flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
            <li><Link to="/estado" className={tab}>Estado del sistema</Link></li>
            <li><Link to="/accesibilidad" className={tab}>Accesibilidad</Link></li>
            <li className="text-texto-secundario">Proyecto Integrador I · Univalle 2026</li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
