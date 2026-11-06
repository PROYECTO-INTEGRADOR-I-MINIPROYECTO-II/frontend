import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import Logo from './Logo';

const links = [{ to: '/ayuda', label: 'Ayuda' }];

export default function Header() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="border-b border-slate-200 bg-superficie">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link to="/" aria-label="Synk, ir al inicio" onClick={close}>
          <Logo />
        </Link>

        <button
          type="button"
          className="rounded-lg p-2 md:hidden"
          aria-expanded={open}
          aria-controls="menu-principal"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          <span className="sr-only">{open ? 'Cerrar menú' : 'Abrir menú'}</span>
        </button>

        <nav
          id="menu-principal"
          aria-label="Principal"
          className={`${open ? 'flex' : 'hidden'} absolute inset-x-0 top-[73px] z-10 flex-col gap-3 border-b border-slate-200 bg-superficie p-5 md:static md:flex md:flex-row md:items-center md:border-0 md:p-0`}
        >
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={close}
              className="px-3 py-2 font-semibold text-texto-secundario hover:text-primario aria-[current=page]:text-primario"
            >
              {l.label}
            </NavLink>
          ))}
          <Link to="/login" onClick={close} className="btn-secundario">
            Ingresar
          </Link>
          <Link to="/registro" onClick={close} className="btn-primario">
            Crear cuenta
          </Link>
        </nav>
      </div>
    </header>
  );
}
