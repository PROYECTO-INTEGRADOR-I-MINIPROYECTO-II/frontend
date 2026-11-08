import type { ReactNode } from 'react';
import CampoUsername from './CampoUsername';
import { useCampoUsername } from './useCampoUsername';

// Elegir el username: tras el acceso con Google (la cuenta de Google ya existe, falta este dato obligatorio), si la cuenta aún no
// lo tiene, o al cambiarlo desde «Editar perfil» (`actual`: el username vigente cuenta como libre). Llega con una sugerencia a partir del nombre, pero hay que confirmarla: no se puede saltar este paso (US-02).
export default function VistaUsername({ inicial, actual, intro, alConfirmar, opciones }: { inicial: string; actual?: string; intro: string; alConfirmar: (username: string) => void; opciones: ReactNode }) {
  const u = useCampoUsername('campo-username', inicial, actual);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (u.validar()) alConfirmar(u.valor.trim());
      }}
      noValidate
      className="grid gap-4 p-4"
    >
      <p className="text-center text-sm text-texto-secundario">{intro}</p>
      <CampoUsername u={u} selectorFuente />
      <hr className="border-t border-texto/80" />
      <div className="grid gap-1">{opciones}</div>
    </form>
  );
}
