import { useId, useState, type FormEvent } from 'react';
import { ApiError } from '../../api/base';
import { crearSala, DESCRIPCION_SALA_MAX, editarSala, NOMBRE_SALA_MAX, type Sala } from '../../api/salas';
import Boton from '../../utils/ui/Boton';
import CampoPixel from '../../utils/ui/CampoPixel';
import Dialogo from '../../utils/ui/Dialogo';
import Mensaje from '../../utils/ui/Mensaje';

// Crear una sala (US-06) o, con `editar`, cambiar la propia (US-07): nombre obligatorio y descripción opcional. Los errores salen junto
// a su campo; si la API rechaza el envío se conserva lo escrito. La sala guardada se entrega a quien lo abrió (`alCrear`).
export default function DialogoCrearSala({ alCerrar, alCrear, editar }: { alCerrar: () => void; alCrear: (sala: Sala) => void; editar?: Sala }) {
  const idDescripcion = useId();
  const [nombre, setNombre] = useState(editar?.nombre ?? '');
  const [descripcion, setDescripcion] = useState(editar?.descripcion ?? '');
  const [errores, setErrores] = useState<{ nombre?: string; descripcion?: string; general?: string }>({});
  const [creando, setCreando] = useState(false);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (creando) return;
    const n = nombre.trim();
    const d = descripcion.trim();
    const nuevos: typeof errores = {};
    if (!n) nuevos.nombre = 'Escribe el nombre de la sala.';
    else if ([...n].length > NOMBRE_SALA_MAX) nuevos.nombre = `El nombre no puede superar ${NOMBRE_SALA_MAX} caracteres.`;
    if ([...d].length > DESCRIPCION_SALA_MAX) nuevos.descripcion = `La descripción no puede superar ${DESCRIPCION_SALA_MAX} caracteres.`;
    setErrores(nuevos);
    if (nuevos.nombre || nuevos.descripcion) {
      document.getElementById(nuevos.nombre ? 'sala-nombre' : idDescripcion)?.focus();
      return;
    }
    setCreando(true);
    try {
      alCrear(editar ? await editarSala(editar.id, n, d) : await crearSala(n, d));
    } catch (err) {
      const api = err instanceof ApiError ? err : null;
      if (api?.campo === 'nombre' || api?.campo === 'descripcion') {
        setErrores({ [api.campo]: api.message });
        document.getElementById(api.campo === 'nombre' ? 'sala-nombre' : idDescripcion)?.focus();
      } else {
        setErrores({ general: api?.message ?? `No pudimos ${editar ? 'guardar los cambios' : 'crear la sala'}. Intenta de nuevo en un momento.` });
      }
      setCreando(false);
    }
  }

  return (
    <>
      <div aria-hidden="true" className="fixed inset-0 z-20 bg-black/65" />
      <Dialogo
        titulo={editar ? 'Editar sala' : 'Crear sala'}
        onCerrar={() => !creando && alCerrar()}
        modal
        className="fixed left-1/2 top-1/2 z-30 max-h-[calc(100dvh-2rem)] w-[min(32rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto"
      >
        <form onSubmit={enviar} noValidate className="grid gap-5 p-4 sm:p-6">
          {!editar && <p className="text-sm text-texto-secundario">Tu sala es privada: solo entra quien tenga su ID. Podrás compartirlo desde «Mis salas».</p>}
          <CampoPixel
            id="sala-nombre"
            etiqueta="Nombre"
            valor={nombre}
            onCambio={(v) => {
              setNombre(v);
              setErrores((x) => ({ ...x, nombre: undefined, general: undefined }));
            }}
            error={errores.nombre}
            ayuda={`Hasta ${NOMBRE_SALA_MAX} caracteres.`}
          />
          <CampoPixel
            id={idDescripcion}
            etiqueta="Descripción (opcional)"
            multilinea
            valor={descripcion}
            onCambio={(v) => {
              setDescripcion(v);
              setErrores((x) => ({ ...x, descripcion: undefined, general: undefined }));
            }}
            error={errores.descripcion}
            ayuda={`${[...descripcion].length}/${DESCRIPCION_SALA_MAX} caracteres.`}
          />
          <Mensaje tipo="error">{errores.general}</Mensaje>
          <div className="flex flex-wrap justify-end gap-3">
            <Boton onClick={alCerrar} disabled={creando}>Cancelar</Boton>
            <Boton type="submit" variante="primario" disabled={creando} aria-busy={creando || undefined}>
              {editar ? (creando ? 'Guardando…' : errores.general ? 'Reintentar' : 'Guardar') : creando ? 'Creando…' : 'Crear sala'}
            </Boton>
          </div>
        </form>
      </Dialogo>
    </>
  );
}
