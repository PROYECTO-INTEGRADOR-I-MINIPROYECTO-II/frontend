import type { ReactNode } from 'react';

// Opciones avanzadas: las acciones delicadas de la cuenta (cambiar el username o el correo, eliminarla). Ninguna actúa al instante:
// cada una lleva a su vista y, antes de aplicarse, a una de confirmación que explica las consecuencias.
export default function VistaAvanzadas({ opciones }: { opciones: ReactNode }) {
  return (
    <div className="grid gap-4 p-4">
      <p className="text-center text-sm text-texto-secundario">Estos cambios afectan a tu cuenta. Antes de aplicarlos te explicaremos qué pasará.</p>
      <hr className="border-t border-texto/80" />
      <div className="grid gap-1">{opciones}</div>
    </div>
  );
}
