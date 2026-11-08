import { useEffect, useState, type FormEvent } from 'react';
import { analizarNombre, NOMBRE_MAX_TOTAL } from '../../../../auth/validaciones';
import type { EstadoCampo } from '../../../../hooks/useEstadoCampo';
import type { EstadoFoto } from '../../../../utils/ui/SelectorFoto';
import type { Indicador } from '../../../../utils/ui/IndicadoresPerfil';

export interface InicialPerfil {
  username: string;
  nombres: string;
  apellidos: string;
  foto: string | null;
}
export type DatosPerfil = InicialPerfil;

interface Estados {
  nombres: EstadoCampo;
  apellidos: EstadoCampo;
  foto: EstadoFoto;
}

// Estado y validación de la vista de perfil: nombres, apellidos y foto (el username se cambia en su propia vista).
// Al completar el perfil el nombre puede quedar en blanco: se usa el username (el nombre que tiene la cuenta recién creada). Al editarlo,
// los campos traen escritos los valores actuales y el nombre es obligatorio. Aún sin Firebase ni API (Sprint 1): `alGuardar` solo simula guardar.
export function useFormularioPerfil({ inicial, modo, alGuardar, alBorrador }: { inicial: InicialPerfil; modo: 'completar' | 'editar'; alGuardar: (d: DatosPerfil) => void; alBorrador?: (d: DatosPerfil) => void }) {
  const opcional = modo === 'completar';
  const [nombres, setNombres] = useState(opcional && inicial.nombres === inicial.username ? '' : inicial.nombres);
  const nombreFinal = nombres.trim() || (opcional ? inicial.username : '');
  const [apellidos, setApellidos] = useState(inicial.apellidos);
  const [foto, setFoto] = useState<string | null>(inicial.foto);
  const [estados, setEstados] = useState<Estados>({ nombres: 'vacio', apellidos: 'vacio', foto: 'sin' });
  const [errorNombres, setErrorNombres] = useState<string | undefined>();
  const [aviso, setAviso] = useState('');
  const alEstado = <K extends keyof Estados>(campo: K) => (e: Estados[K]) => setEstados((s) => (s[campo] === e ? s : { ...s, [campo]: e }));

  // Cuánto cabe en cada campo del nombre: el total entre nombres y apellidos es NOMBRE_MAX_TOTAL.
  const resto = (otro: string) => NOMBRE_MAX_TOTAL - (otro.trim() ? otro.trim().length + 1 : 0);
  const analizarNombres = (v: string) => analizarNombre(v, resto(apellidos));
  const analizarApellidos = (v: string) => analizarNombre(v, resto(nombres));

  // Resumen: nombre vacío o inválido es error; apellido y foto vacíos son «E» (opcional vacío); «…» mientras se comprueba el username.
  const indicadores: Indicador[] = [
    { nombre: 'Nombre', estado: estados.nombres === 'escribiendo' ? 'ok' : estados.nombres === 'vacio' && opcional ? 'vacio' : 'error' },
    { nombre: 'Apellido', estado: estados.apellidos === 'escribiendo' ? 'ok' : estados.apellidos === 'vacio' ? 'vacio' : 'error' },
    { nombre: 'Foto', estado: estados.foto === 'ok' ? 'ok' : estados.foto === 'sin' ? 'vacio' : 'error' },
  ];
  const hayErrores = indicadores.some((i) => i.estado === 'error');

  useEffect(() => setErrorNombres(undefined), [nombres]);

  // Lo escrito se recuerda por si se va a «Cambiar username» y se regresa.
  useEffect(() => alBorrador?.({ username: inicial.username, nombres: nombreFinal, apellidos, foto: foto?.startsWith('blob:') ? null : foto }), [alBorrador, inicial.username, nombreFinal, apellidos, foto]);

  function enviar(e: FormEvent) {
    e.preventDefault();
    const mensaje =
      !nombreFinal.trim() ? 'Escribe tu nombre.' : estados.nombres === 'invalido' || estados.apellidos === 'invalido' ? 'Revisa tu nombre y apellidos: hay algo que corregir.' : undefined;
    setErrorNombres(mensaje);
    if (mensaje) {
      setAviso('');
      document.getElementById('campo-nombres')?.focus();
      return;
    }
    alGuardar({ username: inicial.username, nombres: nombreFinal.trim(), apellidos: apellidos.trim(), foto });
    setAviso(modo === 'editar' ? 'Cambios guardados (simulado hasta el Sprint 1).' : '');
  }

  return {
    valores: { nombres, apellidos, nombreFinal },
    cambiar: { nombres: setNombres, apellidos: setApellidos },
    analizarNombres,
    analizarApellidos,
    alEstado: { nombres: alEstado('nombres'), apellidos: alEstado('apellidos'), foto: alEstado('foto') },
    alFoto: setFoto,
    indicadores,
    hayErrores,
    errorNombres,
    aviso,
    enviar,
  };
}

export type FormularioPerfil = ReturnType<typeof useFormularioPerfil>;
