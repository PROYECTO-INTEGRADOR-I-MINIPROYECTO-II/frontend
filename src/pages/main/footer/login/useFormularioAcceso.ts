import { useCallback, useId, useRef, useState, type FormEvent } from 'react';
import { validarClave, validarConfirmacion, validarCorreo } from '../../../../auth/validaciones';
import { useCampoUsername } from './useCampoUsername';

export type Campo = 'correo' | 'clave' | 'confirmar';
export type Errores = Partial<Record<Campo, string>>;

// Estado y validación del formulario de acceso: iniciar sesión manual (correo y contraseña) y crear cuenta (+ username y confirmación).
// Lo escrito se conserva al cambiar de vista. Al crear una cuenta válida llama a `alRegistrar` con los datos, y la cuenta se crea;
// aún sin Firebase (Sprint 1).
export function useFormularioAcceso(registro: boolean, alRegistrar: (d: { username: string; correo: string }) => void) {
  const base = useId();
  const formulario = useRef<HTMLFormElement>(null);
  const username = useCampoUsername('campo-username-registro');
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [errores, setErrores] = useState<Errores>({});
  const [aviso, setAviso] = useState('');

  const limpiarAvisos = useCallback(() => {
    setErrores({});
    setAviso('');
  }, []);

  // Al editar un campo se quita su error de envío (si lo hubo); se vuelve a validar al enviar o, en el username, mientras se escribe.
  const alCambiar = (campo: Campo, poner: (v: string) => void) => (v: string) => {
    poner(v);
    setErrores((e) => (e[campo] ? { ...e, [campo]: undefined } : e));
  };

  function enviar(e: FormEvent) {
    e.preventDefault();
    const er: Errores = {
      correo: validarCorreo(correo),
      clave: validarClave(clave, registro),
      confirmar: registro ? validarConfirmacion(confirmar, clave) : undefined,
    };
    setErrores(er);
    // El username es el primer campo del registro: si tiene un problema, ahí va el foco.
    const usernameBien = registro ? username.validar() : true;
    const primero = (['correo', 'clave', 'confirmar'] as Campo[]).find((k) => er[k]);
    if (!usernameBien) {
      setAviso('');
      return;
    }
    if (primero) {
      setAviso('');
      document.getElementById(`${base}-${primero}`)?.focus();
      return;
    }
    if (registro) return alRegistrar({ username: username.valor.trim(), correo: correo.trim() });
    setAviso('Datos válidos. Falta conectar con Firebase (Sprint 1): todavía no se abre ninguna sesión.');
  }

  return {
    base,
    formulario,
    username,
    valores: { correo, clave, confirmar },
    cambiar: {
      correo: alCambiar('correo', setCorreo),
      clave: alCambiar('clave', setClave),
      confirmar: alCambiar('confirmar', setConfirmar),
    },
    errores,
    aviso,
    enviar,
    enviarForm: () => formulario.current?.requestSubmit(),
    limpiarAvisos,
  };
}

export type FormularioAcceso = ReturnType<typeof useFormularioAcceso>;
