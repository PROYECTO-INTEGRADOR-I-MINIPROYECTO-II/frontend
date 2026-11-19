import { useId, useState, type ReactNode } from 'react';
import { validarCorreo } from '../../../../auth/validaciones';
import CampoTexto from '../../../../utils/ui/CampoTexto';

// Escribir el correo nuevo. Se valida aquí (formato, que sea distinto del actual) y se pasa a la vista de confirmación; el servidor
// comprueba al aplicarlo que no lo use otra cuenta. `inicial` conserva lo escrito si se vuelve desde la confirmación.
export default function VistaCorreo({ inicial, actual, error, alContinuar, opciones }: { inicial: string; actual: string; error?: string; alContinuar: (correo: string) => void; opciones: ReactNode }) {
  const id = useId();
  const [valor, setValor] = useState(inicial);
  const [errorCampo, setErrorCampo] = useState<string | undefined>(error);
  function enviar() {
    const limpio = valor.trim();
    const mensaje = validarCorreo(limpio) ?? (limpio.toLowerCase() === actual.toLowerCase() ? 'Ese ya es tu correo. Escribe uno distinto.' : undefined);
    setErrorCampo(mensaje);
    if (mensaje) return document.getElementById(`${id}-correo`)?.focus();
    alContinuar(limpio);
  }
  return (
    <form onSubmit={(e) => { e.preventDefault(); enviar(); }} noValidate className="grid gap-4 p-4">
      <p className="text-center text-sm text-texto-secundario">Este es el correo con el que inicias sesión. Hoy es <span className="break-all text-texto">{actual}</span>.</p>
      <CampoTexto
        id={`${id}-correo`}
        etiqueta="Correo nuevo"
        tipo="email"
        valor={valor}
        onCambio={(v) => { setValor(v); setErrorCampo(undefined); }}
        error={errorCampo}
        autoComplete="email"
      />
      <hr className="border-t border-texto/80" />
      <div className="grid gap-1">{opciones}</div>
    </form>
  );
}
