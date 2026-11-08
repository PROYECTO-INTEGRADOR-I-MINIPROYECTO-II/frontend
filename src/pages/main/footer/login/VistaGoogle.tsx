import type { ReactNode } from 'react';
import googleRojo from '../../../../assets/google-pixel-rojo.png';
import type { MotivoErrorGoogle, ResultadoGoogle } from '../../../../auth/useAccesoGoogle';
import GoogleAnimado from '../../../../utils/retro/GoogleAnimado';
import Mensaje from '../../../../utils/ui/Mensaje';

// Por qué falló, en palabras que explican qué hacer (WCAG 3.3.1). El título es siempre el mismo.
const DETALLE: Record<MotivoErrorGoogle, string> = {
  cancelado: 'Cerraste la ventana de Google antes de elegir una cuenta.',
  bloqueado: 'Tu navegador bloqueó la ventana de Google. Permite las ventanas emergentes de este sitio.',
  'cuenta-existente': 'Ese correo ya tiene una cuenta con contraseña. Inicia manualmente para continuar.',
  red: 'Revisa tu conexión e inténtalo de nuevo.',
  'no-disponible': 'El acceso con Google se conectará en el Sprint 1.',
};

// Vista de Google: mientras se espera, el icono se arma desde líneas horizontales (overflow-hidden recorta las que entran desde
// fuera del panel); si falla, el icono pasa a rojo y se inclina, con el mensaje; si sale bien, queda armado.
export default function VistaGoogle({ resultado, opciones }: { resultado: ResultadoGoogle; opciones: ReactNode }) {
  return (
    <div className="grid justify-items-center gap-4 overflow-hidden p-6">
      {resultado.estado === 'error' ? (
        <img src={googleRojo} alt="" aria-hidden="true" width={120} height={120} className="google-error" />
      ) : (
        <GoogleAnimado />
      )}

      {resultado.estado === 'espera' && <p role="status" className="sr-only">Conectando con Google. Elige tu cuenta en la ventana de Google.</p>}
      {resultado.estado === 'exito' && (
        <Mensaje tipo="exito" titulo="Acceso con Google correcto" className="text-center">
          Falta conectar con Firebase (Sprint 1): todavía no se abre ninguna sesión.
        </Mensaje>
      )}
      {resultado.estado === 'error' && (
        <Mensaje tipo="error" titulo="No hemos podido iniciar tu sesión" className="text-center">
          {DETALLE[resultado.motivo]}
        </Mensaje>
      )}

      <hr className="w-full border-t border-texto/80" />
      <div className="w-full">{opciones}</div>
    </div>
  );
}
