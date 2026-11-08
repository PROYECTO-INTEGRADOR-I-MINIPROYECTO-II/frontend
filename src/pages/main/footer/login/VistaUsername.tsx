import { useState, type ReactNode } from 'react';
import CampoUsername from './CampoUsername';
import { useCampoUsername } from './useCampoUsername';

// Elegir el username: tras el acceso con Google (la cuenta de Google ya existe, falta este dato obligatorio), si la cuenta aún no
// lo tiene, o al cambiarlo desde «Editar perfil» (`actual`: el username vigente cuenta como libre). Llega con una sugerencia a partir del nombre, pero hay que confirmarla: no se puede saltar este paso (US-02).
export default function VistaUsername({ inicial, actual, intro, alConfirmar, opciones }: { inicial: string; actual?: string; intro: string; alConfirmar: (username: string) => Promise<void>; opciones: ReactNode }) {
  const u = useCampoUsername('campo-username', inicial, actual);
  const [enviando, setEnviando] = useState(false);
  // Si el servidor lo rechaza (ocupado, no válido…), el motivo sale junto al campo y con el foco, sin borrar lo escrito.
  async function enviar() {
    if (enviando || !u.validar()) return;
    setEnviando(true);
    try {
      await alConfirmar(u.valor.trim());
    } catch (err) {
      u.ponerErrorApi(err, 'No pudimos guardar tu username. Intenta de nuevo en un momento.');
    } finally {
      setEnviando(false);
    }
  }
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void enviar();
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
