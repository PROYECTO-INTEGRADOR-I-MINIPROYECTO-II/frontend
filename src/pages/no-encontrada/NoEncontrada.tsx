import Boton from '../../utils/ui/Boton';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export default function NoEncontrada() {
  useDocumentTitle('Página no encontrada');

  return (
    <div className="mx-auto max-w-3xl px-5 py-20 text-center">
      <p className="font-display text-7xl font-bold text-primario" aria-hidden="true">404</p>
      <h1 className="mt-4 text-4xl font-bold">Página no encontrada</h1>
      <p className="mt-3 text-texto-secundario">
        La dirección que abriste no existe o la Sala ya no está disponible. Revisa que esté bien escrita.
      </p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Boton to="/" variante="primario">Ir al inicio</Boton>
        <Boton to="/dashboard">Ir al Panel</Boton>
      </div>
    </div>
  );
}
