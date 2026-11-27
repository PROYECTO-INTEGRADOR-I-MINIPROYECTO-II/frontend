import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Boton from '../../utils/ui/Boton';

const SEGUNDOS = 5;

// La sala se eliminó con la persona dentro (US-07): aviso y vuelta a «Mis salas» con cuenta atrás, o al instante con el botón.
export default function SalaEliminada({ nombre }: { nombre: string }) {
  const [quedan, setQuedan] = useState(SEGUNDOS);
  const navegar = useNavigate();

  useEffect(() => {
    if (quedan <= 0) return void navegar('/dashboard', { replace: true });
    const t = window.setTimeout(() => setQuedan((q) => q - 1), 1000);
    return () => window.clearTimeout(t);
  }, [quedan, navegar]);

  return (
    <main className="grid min-h-dvh place-items-center bg-fondo p-5 text-center text-texto">
      <div className="max-w-sm border-2 border-error p-6">
        <h1 className="font-pixel text-sm leading-6 text-error">Sala eliminada</h1>
        {/* Se anuncia una vez; la cuenta atrás no, para no repetirla cada segundo. */}
        <p role="alert" className="mt-4 text-sm">El anfitrión eliminó «{nombre}».<span className="sr-only"> Volverás a «Mis salas» en unos segundos.</span></p>
        <p aria-hidden="true" className="mt-4 font-pixel text-[11px] leading-5 text-texto-secundario">Volviendo en {quedan}…</p>
        <Boton to="/dashboard" variante="primario" className="mt-5">Volver ahora</Boton>
      </div>
    </main>
  );
}
