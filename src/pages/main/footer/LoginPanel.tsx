import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { api, ApiError } from '../../../api/base';
import { auth } from '../../../firebase';
import { cerrarSesion, refrescarSesion, useSession } from '../../../auth/useSession';
import { sugerirUsername } from '../../../auth/validaciones';
import { useAccesoGoogle } from '../../../auth/useAccesoGoogle';
import { fotoParaApi } from '../../../utils/ui/SelectorFoto';
import Dialogo from '../../../utils/ui/Dialogo';
import OpcionNumerada from '../../../utils/retro/OpcionNumerada';
import { useLoginPanel, type FasePanel } from './loginPanelContext';
import PalabraGoogle from './login/PalabraGoogle';
import { useFormularioAcceso } from './login/useFormularioAcceso';
import VistaElegir from './login/VistaElegir';
import VistaFormulario from './login/VistaFormulario';
import VistaGoogle from './login/VistaGoogle';
import VistaPerfil from './login/VistaPerfil';
import VistaCreando from './login/VistaCreando';
import VistaUsername from './login/VistaUsername';
import type { DatosPerfil, InicialPerfil } from './login/useFormularioPerfil';

const TITULOS: Record<FasePanel, string> = {
  elegir: 'Iniciar sesión',
  manual: 'Iniciar sesión',
  registro: 'Crear cuenta',
  google: 'Continuar con Google',
  username: 'Elige tu username',
  creando: 'Creando tu cuenta',
  perfil: 'Completa tu perfil', // en modo «editar» se muestra «Editar perfil»
  editarUsername: 'Editar username',
  vincular: 'Vincular con Google',
};

// Colocación del panel: centrado en móvil; desde 768 px (md) pegado al pie, sobre «Iniciar sesión». Las clases md: anulan las de centrado.
const COLOCACION =
  'fixed left-1/2 top-1/2 z-20 max-h-[calc(100dvh-2rem)] w-[min(24rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 ' +
  'md:absolute md:bottom-full md:left-0 md:top-auto md:max-h-[calc(100dvh-var(--footer-h,0px)-1rem)] md:w-[min(24rem,calc(100vw-2.5rem))] md:translate-x-0 md:translate-y-0';

const numerar = (o: Omit<Opcion, 'tecla'>[]): Opcion[] => o.map((x, i) => ({ ...x, tecla: String(i + 1) }));

interface Opcion {
  tecla: string;
  contenido: ReactNode;
  accion?: () => void;
  enviar?: boolean; // la opción es el botón de envío del formulario
  primero?: boolean; // recibe el foco al entrar a la vista
}

// Panel de acceso que sube desde el pie, sobre «Iniciar sesión». Vistas: elegir método, manual, crear cuenta, Google, elegir username,
// creando la cuenta y perfil. La cuenta se crea con el primer «Confirmar» (username, correo y contraseña, o username tras Google); el
// perfil (foto, nombre y apellido) se personaliza después y ya no es parte de la creación.
// Este archivo solo coordina: cada vista vive en login/, el diálogo es utils/ui/Dialogo y las reglas en auth/validaciones.
export default function LoginPanel() {
  const { abierto, fase, cerrar, irA } = useLoginPanel();
  const registro = fase === 'registro';
  const { perfil, irAUsername, irACreando, irAPerfil, irAEditarUsername } = useLoginPanel();
  const { user } = useSession();
  // Lo escrito en «Editar perfil» se recuerda por si se pasa a «Cambiar username» y se regresa.
  const borrador = useRef<InicialPerfil | null>(null);
  const guardarBorrador = useCallback((d: InicialPerfil) => {
    borrador.current = d;
  }, []);
  const navegar = useNavigate();
  const { state, pathname } = useLocation();
  const desde = (state as { desde?: string } | null)?.desde;
  const avisoAlCambiar = useRef(''); // aviso a mostrar al llegar a la siguiente vista (cambiar de vista borra los avisos)
  const [errorCuenta, setErrorCuenta] = useState(''); // error de desvincular, se muestra en el perfil
  const [perfilBloqueado, setPerfilBloqueado] = useState(false); // hay datos con error: la confirmación queda en gris

  // Crear la cuenta con correo: la API la registra, se inicia sesión con ella y se pide el perfil. La cuenta nace con el nombre igual al
  // username; luego se personaliza. Los errores (correo repetido, username ocupado…) los muestra el formulario junto a su campo.
  async function crearCuentaManual({ username, correo, clave }: { username: string; correo: string; clave: string }) {
    await api('/api/auth/registro', { method: 'POST', body: { nombres: username, apellidos: '', username, correo, clave } });
    try {
      await signInWithEmailAndPassword(auth, correo, clave);
    } catch {
      // La cuenta ya existe: se lleva a iniciar sesión (el correo queda escrito) en vez de mostrar un error de registro.
      avisoAlCambiar.current = 'Tu cuenta se creó. Inicia sesión para entrar.';
      return irA('manual');
    }
    await refrescarSesion();
    irACreando({ username, nombres: username, apellidos: '', foto: null }, correo);
  }
  // Iniciar sesión con correo y contraseña: si va bien, entra al Panel (o a la ruta que se había pedido).
  async function iniciarSesion({ correo, clave }: { correo: string; clave: string }) {
    await signInWithEmailAndPassword(auth, correo, clave);
    if (!(await refrescarSesion())) throw new Error('sin perfil'); // la API no respondió: mejor avisar que dejar en un limbo
    cerrar(false);
    navegar(desde ?? '/dashboard');
  }
  const form = useFormularioAcceso(registro, crearCuentaManual, iniciarSesion);
  const { limpiarAvisos } = form;
  // Cerrar el panel. Si se abrió desde el enlace directo /perfil, se vuelve a la portada para que «Cuenta» pueda abrirlo de nuevo.
  function cerrarPanel(devolverFoco?: boolean) {
    cerrar(devolverFoco);
    if (pathname === '/perfil') navegar('/', { replace: true });
  }
  // Desvincular Google: la API lo quita de la cuenta, que sigue con su correo y contraseña. El icono del resumen vuelve a gris.
  // Si no se puede (es su único método de acceso) se explica en el perfil.
  async function desvincular() {
    setErrorCuenta('');
    try {
      await api('/api/usuarios/yo/proveedores/google', { method: 'DELETE' });
      await auth.currentUser?.reload();
      await refrescarSesion();
    } catch (err) {
      return setErrorCuenta(err instanceof ApiError ? err.message : 'No pudimos desvincular Google. Intenta de nuevo en un momento.');
    }
    irAPerfil('editar', { ...perfil.inicial, ...(borrador.current ?? {}), username: perfil.inicial.username }, perfil.correo);
  }
  // Cerrar sesión: vuelve a la portada y cierra la sesión de Firebase, desde donde se puede crear otra cuenta.
  function salir() {
    borrador.current = null;
    cerrar(false);
    navegar('/'); // primero la ruta: si no, RutaPrivada vería la sesión vacía en /perfil y mandaría a /login
    window.setTimeout(() => void cerrarSesion(), 50); // da tiempo a que la navegación se aplique antes de cerrar la sesión
  }
  // Envía el formulario de la vista actual.
  const enviarForm = () => document.querySelector<HTMLFormElement>('#panel-login form')?.requestSubmit();
  const google = useAccesoGoogle();
  // Ir a la vista de Google abre ya la ventana de Google: tiene que ser dentro del gesto de la persona (clic o tecla), no en un efecto.
  const abrirGoogle = (vincular = false) => {
    irA(vincular ? 'vincular' : 'google');
    google.iniciar(vincular);
  };

  // Al abrir o cambiar de vista se limpian los avisos; lo escrito se conserva.
  useEffect(() => {
    if (abierto) limpiarAvisos();
    setErrorCuenta('');
  }, [abierto, fase, limpiarAvisos]);

  // Un acceso correcto con Google: si la cuenta ya tiene username entra (al Panel o a la ruta pedida); si no, lleva a elegirlo (con uno
  // sugerido); lo que Google entrega se usará para el perfil.
  const resultadoGoogle = google.resultado;
  useEffect(() => {
    if (resultadoGoogle.estado !== 'exito') return;
    if (fase === 'vincular') {
      // Vincular: la sesión ya se refrescó y se vuelve a «Editar perfil», donde el icono de Google pasa a color.
      irAPerfil('editar', { ...perfil.inicial, ...(borrador.current ?? {}), username: perfil.inicial.username }, perfil.correo);
      return;
    }
    if (fase !== 'google') return;
    if (resultadoGoogle.username) {
      cerrar(false);
      navegar(desde ?? '/dashboard');
      return;
    }
    const { nombres, apellidos, foto, correo } = resultadoGoogle.perfil;
    irAUsername({ username: sugerirUsername(nombres, apellidos), nombres, apellidos, foto }, correo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fase, resultadoGoogle]);

  if (!abierto) return null;

  // Opciones numeradas de cada vista: de aquí salen lo que se dibuja y las teclas, para que nunca queden desincronizadas.
  const opciones: Record<FasePanel, Opcion[]> = {
    elegir: [{ tecla: '1', contenido: 'No tengo cuenta :(', accion: () => irA('registro') }],
    manual: [
      { tecla: '1', contenido: 'Confirmar', enviar: true },
      { tecla: '2', contenido: <>Iniciar con <PalabraGoogle /></>, accion: () => abrirGoogle() },
      { tecla: '3', contenido: 'No tengo cuenta :(', accion: () => irA('registro') },
    ],
    registro: [
      { tecla: '1', contenido: 'Confirmar', enviar: true },
      { tecla: '2', contenido: <>Crear con <PalabraGoogle /></>, accion: () => abrirGoogle() },
      { tecla: '3', contenido: 'Ya tengo cuenta', accion: () => irA('elegir') },
    ],
    google:
      google.resultado.estado === 'error'
        ? [
            { tecla: '1', contenido: 'Intentar de nuevo', accion: () => google.iniciar(false), primero: true },
            { tecla: '2', contenido: 'Iniciar manualmente', accion: () => irA('manual') },
          ]
        : google.resultado.estado === 'exito'
          ? [{ tecla: '1', contenido: 'Cerrar', accion: () => cerrar(), primero: true }]
          : [{ tecla: '1', contenido: 'Cancelar', accion: () => irA('elegir'), primero: true }],
    username: [
      { tecla: '1', contenido: 'Confirmar', enviar: true },
      { tecla: '2', contenido: 'Volver atrás', accion: () => irA('elegir') },
    ],
    vincular:
      google.resultado.estado === 'error'
        ? [
            { tecla: '1', contenido: 'Intentar de nuevo', accion: () => google.iniciar(true), primero: true },
            { tecla: '2', contenido: 'Volver atrás', accion: () => irAPerfil('editar', { ...perfil.inicial, ...(borrador.current ?? {}), username: perfil.inicial.username }, perfil.correo) },
          ]
        : [{ tecla: '1', contenido: 'Cancelar', accion: () => irAPerfil('editar', { ...perfil.inicial, ...(borrador.current ?? {}), username: perfil.inicial.username }, perfil.correo), primero: true }],
    editarUsername: [
      { tecla: '1', contenido: 'Guardar', enviar: true },
      { tecla: '2', contenido: 'Volver atrás', accion: () => irAPerfil('editar', { ...perfil.inicial, ...(borrador.current ?? {}), username: perfil.inicial.username }, perfil.correo) },
    ],
    creando: [],
    perfil:
      perfil.modo === 'editar'
        ? numerar([
            { contenido: 'Guardar', enviar: true },
            { contenido: 'Cancelar', accion: () => cerrarPanel() },
            // Vincular o desvincular Google. Una cuenta creada con Google no se puede desvincular (Firebase no deja quitar el único
            // método de acceso, y esa cuenta no tiene contraseña): ahí no hay opción y el icono del resumen indica que está vinculada.
            ...(!user?.google
              ? [{ contenido: <>Vincular con <PalabraGoogle /></>, accion: () => abrirGoogle(true) }]
              : user.creadaConGoogle
                ? []
                : [{ contenido: <>Desvincular de <PalabraGoogle /></>, accion: desvincular }]),
            { contenido: 'Cambiar username', accion: () => irAEditarUsername({ ...perfil.inicial, ...(borrador.current ?? {}), username: perfil.inicial.username }, perfil.correo) },
            { contenido: 'Cerrar sesión', accion: salir },
          ])
        : [{ tecla: '1', contenido: 'Confirmar', enviar: true }], // la cuenta ya existe: no hay «volver atrás»
  };
  const lista = (f: FasePanel, deshabilitadas: string[] = []) =>
    opciones[f].map((o) => (
      <OpcionNumerada key={o.tecla} tecla={o.tecla} tipo={o.enviar ? 'submit' : 'button'} primero={o.primero} deshabilitada={deshabilitadas.includes(o.tecla)} onElegir={o.accion}>
        {o.contenido}
      </OpcionNumerada>
    ));

  // Guardar el perfil en la API (la foto elegida se reduce antes de enviarla). Al personalizarlo por primera vez se entra al Panel
  // (o a la ruta que se había pedido) y se cierra el panel. Si falla, el error sube al formulario.
  async function guardarPerfil(d: DatosPerfil) {
    await api('/api/usuarios/yo', { method: 'PATCH', body: { nombres: d.nombres, apellidos: d.apellidos, foto: await fotoParaApi(d.foto) } });
    await refrescarSesion();
    if (perfil.modo === 'completar') {
      cerrar(false);
      navegar(desde ?? '/dashboard');
    }
  }

  // La tecla de una opción numerada solo actúa con el foco fuera de un campo y sin modificadores (WCAG 2.1.4).
  function alTeclear(e: KeyboardEvent<HTMLDivElement>) {
    const t = e.target as HTMLElement;
    if (e.ctrlKey || e.metaKey || e.altKey || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
    const opcion = opciones[fase].find((o) => o.tecla === e.key);
    if (!opcion) return;
    e.preventDefault();
    if (opcion.enviar && fase === 'perfil' && perfilBloqueado) return; // bloqueada: hay datos con error
    if (opcion.enviar) enviarForm();
    else opcion.accion?.();
  }

  return (
    <>
      {/* Capa oscura que atenúa la página detrás del panel; un clic en ella cierra el panel (lo gestiona Dialogo).
          En escritorio termina sobre el pie, que queda sin atenuar porque el panel sale conectado a él. */}
      <div aria-hidden="true" className="fixed inset-0 bg-black/65 motion-safe:animate-telon md:bottom-[var(--footer-h,0px)]" />
      <Dialogo
        id="panel-login"
        titulo={fase === 'perfil' && perfil.modo === 'editar' ? 'Editar perfil' : TITULOS[fase]}
        modal
        onCerrar={cerrarPanel}
        onTecla={alTeclear}
        reenfocar={fase === 'google' || fase === 'vincular' ? `${fase}-${google.resultado.estado}` : fase}
        ignorarClic="[data-login-opener]"
        className={`${COLOCACION} overflow-y-auto font-sans text-sm leading-6 tracking-normal motion-safe:animate-panel`}
      >
        {fase === 'elegir' && <VistaElegir irA={(f) => (f === 'google' ? abrirGoogle() : irA(f))} opciones={lista('elegir')} />}
        {(fase === 'manual' || registro) && <VistaFormulario registro={registro} form={form} opciones={lista(fase, form.enviando ? ['1'] : [])} />}
        {fase === 'google' && <VistaGoogle resultado={google.resultado} opciones={lista('google')} />}
        {fase === 'vincular' && <VistaGoogle vincular resultado={google.resultado} opciones={lista('vincular')} />}
        {fase === 'username' && <VistaUsername key={perfil.clave} inicial={perfil.inicial.username} intro="Tu cuenta está lista. Elige tu username: es el nombre de usuario único con el que te identificas en Synk." alConfirmar={async (username) => {
          await api('/api/usuarios/yo/username', { method: 'PUT', body: { username } });
          await refrescarSesion();
          irACreando({ ...perfil.inicial, username, nombres: perfil.inicial.nombres || username }, perfil.correo);
        }} opciones={lista('username')} />}
        {fase === 'editarUsername' && (
          <VistaUsername
            key={perfil.clave}
            inicial={perfil.inicial.username}
            actual={perfil.inicial.username}
            intro="Cambia el nombre de usuario único con el que te identificas en Synk. Tu nombre para mostrar no cambia."
            alConfirmar={async (username) => {
              await api('/api/usuarios/yo/username', { method: 'PUT', body: { username } });
              await refrescarSesion();
              irAPerfil('editar', { ...perfil.inicial, ...(borrador.current ?? {}), username }, perfil.correo);
            }}
            opciones={lista('editarUsername')}
          />
        )}
        {fase === 'creando' && <VistaCreando key={perfil.clave} alTerminar={() => irAPerfil('completar', perfil.inicial, perfil.correo)} />}
        {fase === 'perfil' && <VistaPerfil key={perfil.clave} modo={perfil.modo} google={!!user?.google} inicial={perfil.inicial} alGuardar={guardarPerfil} alBorrador={guardarBorrador} alBloquear={setPerfilBloqueado} errorExterno={errorCuenta} opciones={lista('perfil', perfilBloqueado ? ['1'] : [])} />}
      </Dialogo>
    </>
  );
}
