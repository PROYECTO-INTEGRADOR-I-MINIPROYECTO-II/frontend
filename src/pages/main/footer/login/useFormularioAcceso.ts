import { useCallback, useId, useRef, useState, type FormEvent } from 'react';
import { ApiError } from '../../../../api/base';
import { validarClave, validarConfirmacion, validarCorreo } from '../../../../auth/validaciones';
import { useCampoUsername } from './useCampoUsername';

export type Campo = 'correo' | 'clave' | 'confirmar';
export type Errores = Partial<Record<Campo, string>>;

// Estado y validación del formulario de acceso: iniciar sesión manual (correo y contraseña) y crear cuenta (+ username y confirmación).
// Lo escrito se conserva al cambiar de vista. Al crear una cuenta válida llama a `alRegistrar` con los datos (async: crea la cuenta
// en la API); si falla, el error se muestra junto a su campo, con el foco, sin borrar lo escrito.
export function useFormularioAcceso(registro: boolean, alRegistrar: (d: { username: string; correo: string; clave: string }) => Promise<void>) {
  const base = useId();
  const formulario = useRef<HTMLFormElement>(null);
  const username = useCampoUsername('campo-username-registro');
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [errores, setErrores] = useState<Errores>({});
  const [aviso, setAviso] = useState('');
  const [errorGeneral, setErrorGeneral] = useState('');
  const [enviando, setEnviando] = useState(false);

  const limpiarAvisos = useCallback(() => {
    setErrores({});
    setAviso('');
    setErrorGeneral('');
  }, []);

  // Al editar un campo se quita su error de envío (si lo hubo); se vuelve a validar al enviar o, en el username, mientras se escribe.
  const alCambiar = (campo: Campo, poner: (v: string) => void) => (v: string) => {
    poner(v);
    setErrores((e) => (e[campo] ? { ...e, [campo]: undefined } : e));
  };

  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (enviando) return;
    setErrorGeneral('');
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
    if (registro) return registrar();
    setAviso('Datos válidos. Falta conectar con Firebase (Sprint 1): todavía no se abre ninguna sesión.');
  }

  // Crea la cuenta. Los errores de la API llevan el campo: cada uno se muestra junto al suyo (sin códigos para la persona).
  async function registrar() {
    setEnviando(true);
    setAviso('Creando cuenta…');
    try {
      await alRegistrar({ username: username.valor.trim(), correo: correo.trim(), clave });
      setClave('');
      setConfirmar('');
    } catch (err) {
      setAviso('');
      const e = err instanceof ApiError ? err : null;
      const mensaje = e?.message ?? 'No pudimos crear tu cuenta. Intenta de nuevo en un momento.';
      if (e?.code === 'EMAIL_TAKEN') {
        setErrores({ correo: 'Ese correo ya tiene una cuenta. Usa «Ya tengo cuenta» para iniciar sesión.' });
        document.getElementById(`${base}-correo`)?.focus();
      } else if (e?.campo === 'username') username.ponerError(mensaje);
      else if (e?.campo === 'correo' || e?.campo === 'clave') {
        setErrores({ [e.campo]: mensaje });
        document.getElementById(`${base}-${e.campo}`)?.focus();
      } else setErrorGeneral(mensaje);
    } finally {
      setEnviando(false);
    }
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
    errorGeneral,
    enviando,
    enviar,
    enviarForm: () => formulario.current?.requestSubmit(),
    limpiarAvisos,
  };
}

export type FormularioAcceso = ReturnType<typeof useFormularioAcceso>;
