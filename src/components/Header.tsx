import { Link } from 'react-router-dom';
import Logo from './Logo';

export default function Header() {
  return (
    <header className="flex flex-col items-center gap-4 px-5 pb-2 pt-8">
      <Link to="/" aria-label="Synk, ir al inicio">
        <Logo />
      </Link>
      <p className="rounded-full border border-borde bg-primario-suave px-4 py-1.5 font-retro text-xs font-medium uppercase tracking-[0.2em] text-texto">
        Salas y chat en tiempo real
      </p>
      <hr className="mt-2 w-full max-w-[calc(64rem-2.5rem)] border-t border-texto/80" />
    </header>
  );
}
