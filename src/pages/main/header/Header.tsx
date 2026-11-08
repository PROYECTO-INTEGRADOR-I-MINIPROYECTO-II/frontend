import { Link } from 'react-router-dom';
import Logo from './Logo';
import SpriteBackdrop from './SpriteBackdrop';

export default function Header() {
  return (
    <header className="relative bg-fondo flex flex-col items-center gap-4 px-5 pb-2 pt-8 sm:px-8">
      <SpriteBackdrop />
      <Link to="/" aria-label="Synk, ir al inicio" className="group relative rounded-xl">
        <Logo />
      </Link>
      <p className="relative rounded-full border border-borde bg-primario-suave px-4 py-1.5 font-sans text-xs font-medium uppercase tracking-[0.2em] text-texto">
        Salas y chat en tiempo real
      </p>
      <hr className="relative mt-2 w-full border-t border-texto/80" />
    </header>
  );
}
