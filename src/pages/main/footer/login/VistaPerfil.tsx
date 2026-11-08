import { useEffect, type ReactNode } from 'react';
import { iniciales, nombreCompleto } from '../../../../auth/validaciones';
import CampoDestacado from '../../../../utils/ui/CampoDestacado';
import IndicadoresPerfil from '../../../../utils/ui/IndicadoresPerfil';
import Mensaje from '../../../../utils/ui/Mensaje';
import NombreVisto from '../../../../utils/ui/NombreVisto';
import SelectorFoto from '../../../../utils/ui/SelectorFoto';
import { useFormularioPerfil, type DatosPerfil, type InicialPerfil } from './useFormularioPerfil';

// Vista de perfil: personalizar la cuenta recién creada (foto, nombre y apellido) o, después, editar el perfil .
// De arriba abajo: resumen de estado, foto grande, el nombre completo tal como lo verán los demás, y los campos separados por líneas.
// Mientras haya un ✗ la confirmación queda en gris. Al completarlo el nombre puede quedar en blanco (se usa el username), así que se puede confirmar ya.
export default function VistaPerfil({
  modo,
  inicial,
  alGuardar,
  alBloquear,
  alBorrador,
  opciones,
}: {
  modo: 'completar' | 'editar';
  inicial: InicialPerfil;
  alGuardar: (d: DatosPerfil) => void;
  /** Avisa de si la confirmación debe estar bloqueada (hay datos con error). */
  alBloquear: (bloqueada: boolean) => void;
  alBorrador?: (d: DatosPerfil) => void;
  opciones: ReactNode;
}) {
  const f = useFormularioPerfil({ inicial, modo, alGuardar, alBorrador });
  const { valores, cambiar } = f;
  useEffect(() => alBloquear(f.hayErrores), [f.hayErrores, alBloquear]);
  useEffect(() => () => alBloquear(false), [alBloquear]);

  return (
    <form onSubmit={f.enviar} noValidate className="grid gap-3 p-4">
      <IndicadoresPerfil items={f.indicadores} />
      <SelectorFoto iniciales={iniciales(valores.nombreFinal, valores.apellidos)} fotoInicial={inicial.foto} onEstado={f.alEstado.foto} onUrl={f.alFoto}>
        <NombreVisto texto={nombreCompleto(valores.nombreFinal, valores.apellidos)} />
      </SelectorFoto>

      <hr className="border-t border-texto/80" />
      <CampoDestacado
        id="campo-nombres"
        etiqueta="Nombre/s"
        selectorFuente
        valor={valores.nombres}
        onCambio={cambiar.nombres}
        analizar={f.analizarNombres}
        ayuda={modo === 'completar' ? 'Si dejas tu nombre en blanco usaremos tu username como nombre a mostrar.' : undefined}
        error={f.errorNombres}
        onEstado={f.alEstado.nombres}
        autoComplete="given-name"
      />
      <hr className="border-t border-texto/80" />
      <CampoDestacado
        id="campo-apellidos"
        etiqueta="Apellido/s (opcional)"
        selectorFuente
        valor={valores.apellidos}
        onCambio={cambiar.apellidos}
        analizar={f.analizarApellidos}
        onEstado={f.alEstado.apellidos}
        autoComplete="family-name"
      />
      <Mensaje tipo="info" className="text-center">{f.aviso}</Mensaje>

      {/* Las acciones quedan fijas al fondo del panel si hay scroll. */}
      <div className="sticky bottom-0 -mx-4 -mb-4 grid gap-0.5 border-t border-texto/80 bg-fondo px-4 pb-2 pt-2">{opciones}</div>
    </form>
  );
}
