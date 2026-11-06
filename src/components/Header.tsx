import { Link } from 'react-router-dom';
import Logo from './Logo';

export default function Header() {
  return (
    <header className="flex flex-col items-center gap-2 px-5 pb-2 pt-8">
      <Link to="/" aria-label="Synk, ir al inicio">
        <Logo />
      </Link>
      <nav aria-label="Principal">
        <Link to="/ayuda" className="text-sm text-texto-secundario underline underline-offset-4 hover:text-texto">
          Ayuda
        </Link>
      </nav>
    </header>
  );
}
