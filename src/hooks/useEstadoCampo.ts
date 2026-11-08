import { useEffect, useRef, useState } from 'react';
import type { Analisis } from '../auth/validaciones';

// Estado de un campo destacado mientras se escribe. Lo sintáctico se juzga al instante; tras una pausa de escribir se avisa si es
// muy corto o, si el campo tiene `verificar`, se consulta si está libre. La comprobación dura como mínimo MIN_VERIFICANDO_MS aunque
// la API responda antes, para que se alcance a ver, y nunca se reutiliza un resultado anterior: cada edición obliga a comprobar de nuevo.
//   vacio · escribiendo (válido; sin `verificar` se queda aquí) · invalido · corto (tras la pausa) · verificando · disponible · ocupado
export type EstadoCampo = 'vacio' | 'escribiendo' | 'invalido' | 'corto' | 'verificando' | 'disponible' | 'ocupado';
const PAUSA_MS = 700;
const MIN_VERIFICANDO_MS = 1500;

interface Opciones {
  analizar: (valor: string) => Analisis;
  /** Consulta si el valor está libre (true = libre). Sin esto no hay comprobación de unicidad. */
  verificar?: (valor: string) => Promise<boolean>;
  mensajeOcupado?: (valor: string) => string;
}

type Tardio = { valor: string; estado: 'corto' | 'verificando' | 'disponible' | 'ocupado' };
const esperar = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));

export function useEstadoCampo(valor: string, opciones: Opciones): { estado: EstadoCampo; mensaje?: string } {
  const ref = useRef(opciones);
  ref.current = opciones; // las reglas pueden depender de otros campos: siempre se usan las del último render
  const analisis = opciones.analizar(valor);
  const [tardio, setTardio] = useState<Tardio | null>(null);

  useEffect(() => {
    setTardio(null); // cualquier edición descarta lo que se sabía del texto anterior
    const limpio = valor.trim();
    const { tipo } = ref.current.analizar(limpio);
    const comprueba = tipo === 'ok' && !!ref.current.verificar;
    if (tipo !== 'corto' && !comprueba) return;
    let vigente = true;
    const t = window.setTimeout(async () => {
      if (tipo === 'corto') return setTardio({ valor, estado: 'corto' });
      setTardio({ valor, estado: 'verificando' });
      const [libre] = await Promise.all([ref.current.verificar!(limpio), esperar(MIN_VERIFICANDO_MS)]);
      if (vigente) setTardio({ valor, estado: libre ? 'disponible' : 'ocupado' });
    }, PAUSA_MS);
    return () => {
      vigente = false;
      window.clearTimeout(t);
    };
  }, [valor]);

  if (analisis.tipo === 'vacio') return { estado: 'vacio' };
  if (analisis.tipo === 'invalido') return { estado: 'invalido', mensaje: analisis.mensaje };
  // El resultado tardío solo vale para el texto con el que se pidió (si se sigue escribiendo, vuelve a «escribiendo»).
  const t = tardio?.valor === valor ? tardio.estado : null;
  if (t === 'corto') return { estado: 'corto', mensaje: analisis.mensaje };
  if (t === 'ocupado') return { estado: 'ocupado', mensaje: opciones.mensajeOcupado?.(valor) ?? 'Ya está en uso.' };
  return { estado: t ?? 'escribiendo' };
}
