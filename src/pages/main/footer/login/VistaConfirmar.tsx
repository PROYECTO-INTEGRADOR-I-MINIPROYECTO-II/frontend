import type { ReactNode } from 'react';
import Mensaje from '../../../../utils/ui/Mensaje';

// Confirmación de una acción delicada: qué se va a hacer, qué consecuencias tiene y, abajo, aceptar o no. Mientras se aplica
// (`enviando`) se anuncia el progreso; si falla, el motivo sale aquí mismo y las opciones siguen disponibles.
export default function VistaConfirmar({ resumen, consecuencias, enviando, textoEnviando, error, opciones }: { resumen: ReactNode; consecuencias: ReactNode[]; enviando: boolean; textoEnviando: string; error: string; opciones: ReactNode }) {
  return (
    <div className="grid gap-3 p-4" aria-busy={enviando}>
      <p className="text-center text-texto">{resumen}</p>
      <div>
        <p className="font-pixel text-[11px] leading-5">¿Qué pasará?</p>
        <ul className="mt-2 grid list-disc gap-1.5 pl-5 text-sm text-texto-secundario">
          {consecuencias.map((c, i) => <li key={i}>{c}</li>)}
        </ul>
      </div>
      <Mensaje tipo="info" className="text-center">{enviando ? textoEnviando : ''}</Mensaje>
      <Mensaje tipo="error" className="text-center">{error}</Mensaje>
      <hr className="border-t border-texto/80" />
      <div className="grid gap-1">{opciones}</div>
    </div>
  );
}
