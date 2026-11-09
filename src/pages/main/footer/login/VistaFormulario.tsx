import type { ReactNode } from 'react';
import CampoTexto from '../../../../utils/ui/CampoTexto';
import CampoUsername from './CampoUsername';
import Mensaje from '../../../../utils/ui/Mensaje';
import type { FormularioAcceso } from './useFormularioAcceso';

// Formulario de acceso: iniciar sesión manual (correo y contraseña) o crear cuenta (username, correo, contraseña y confirmación).
// Crear la cuenta no pide más: el nombre nace igual al username y se personaliza después, en la vista de perfil.
// Las acciones son opciones numeradas, la primera es el envío; Enter dentro de un campo también envía.
export default function VistaFormulario({ registro, form, opciones }: { registro: boolean; form: FormularioAcceso; opciones: ReactNode }) {
  const { base, valores, cambiar, errores } = form;
  return (
    <form ref={form.formulario} onSubmit={form.enviar} noValidate className="grid gap-4 p-4">
      {registro && <CampoUsername u={form.username} selectorFuente />}
      <CampoTexto id={`${base}-correo`} etiqueta="Correo" tipo="email" valor={valores.correo} onCambio={cambiar.correo} error={errores.correo} autoComplete="email" />
      <CampoTexto
        id={`${base}-clave`}
        etiqueta="Contraseña"
        tipo="password"
        valor={valores.clave}
        onCambio={cambiar.clave}
        error={errores.clave}
        ayuda={registro ? 'Mínimo 8 caracteres.' : undefined}
        autoComplete={registro ? 'new-password' : 'current-password'}
      />
      {registro && (
        <CampoTexto id={`${base}-confirmar`} etiqueta="Confirmar contraseña" etiquetaMostrar="Mostrar confirmación de contraseña" tipo="password" valor={valores.confirmar} onCambio={cambiar.confirmar} error={errores.confirmar} autoComplete="new-password" />
      )}
      <Mensaje tipo="info">{form.aviso}</Mensaje>
      <Mensaje tipo="error">{form.errorGeneral}</Mensaje>
      <hr className="border-t border-texto/80" />
      <div className="grid gap-1">{opciones}</div>
    </form>
  );
}
