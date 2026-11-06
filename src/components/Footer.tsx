import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-texto text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 md:flex-row md:items-center md:gap-8">
        <nav aria-label="Pie de página" className="flex flex-col gap-3 md:flex-row md:gap-8">
          <Link to="/estado" className="font-semibold hover:underline">Estado del sistema</Link>
          <Link to="/ayuda" className="font-semibold hover:underline">Ayuda</Link>
          <Link to="/accesibilidad" className="font-semibold hover:underline">Accesibilidad</Link>
        </nav>
        <p className="text-sm text-slate-300">Proyecto Integrador I · Univalle 2026</p>
      </div>
    </footer>
  );
}
