import { PixelIcon, type NombreIcono } from '../retro/PixelIcon';

// Resumen del perfil: una fila de círculos, uno por dato, sin rótulos (los mensajes bajo cada campo dicen qué corregir).
//   ✓ válido · ✗ con error (incluye un dato obligatorio vacío) · E gris: opcional vacío · … gris: comprobando.
// Es solo un resumen visual; el estado se lee por lista y no se anuncia solo (los campos ya anuncian sus propios mensajes).
export type EstadoIndicador = 'ok' | 'error' | 'vacio' | 'espera';
export interface Indicador {
  nombre: string;
  estado: EstadoIndicador;
}

const ASPECTO: Record<EstadoIndicador, { borde: string; relleno: string; icono: NombreIcono; texto: string }> = {
  ok: { borde: 'border-exito', relleno: 'fill-exito', icono: 'visto', texto: 'válido' },
  error: { borde: 'border-error', relleno: 'fill-error', icono: 'equis', texto: 'con error' },
  vacio: { borde: 'border-texto-secundario', relleno: 'fill-texto-secundario', icono: 'letraE', texto: 'vacío (opcional)' },
  espera: { borde: 'border-texto-secundario', relleno: 'fill-texto-secundario', icono: 'puntos', texto: 'comprobando' },
};

export default function IndicadoresPerfil({ items }: { items: Indicador[] }) {
  return (
    <ul aria-label="Resumen del perfil" className="flex justify-center gap-6">
      {items.map((i) => {
        const a = ASPECTO[i.estado];
        return (
          <li key={i.nombre}>
            <span aria-hidden="true" className={`grid size-7 place-items-center rounded-full border-2 ${a.borde}`}>
              <svg viewBox="0 0 22 22" className={`size-5 ${a.relleno}`}>
                <PixelIcon nombre={a.icono} x={11} y={11} escala={2} />
              </svg>
            </span>
            <span className="sr-only">{`${i.nombre}: ${a.texto}`}</span>
          </li>
        );
      })}
    </ul>
  );
}
