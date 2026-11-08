import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import type { InicialPerfil } from './login/useFormularioPerfil';

// Vistas del panel:
//   elegir: ¿manual o Google? · manual: iniciar sesión con correo y contraseña · registro: crear cuenta (username, correo y contraseña)
//   google: espera del acceso con Google · username: elegir el username (tras Google, o si la cuenta no lo tiene aún)
//   creando: transición «creando tu cuenta» · perfil: personalizar (foto, nombre y apellido) o, después, editar el perfil
//   editarUsername: cambiar el username desde «Editar perfil» · vincular: vincular la cuenta con Google desde «Editar perfil».
export type FasePanel = 'elegir' | 'manual' | 'registro' | 'google' | 'username' | 'creando' | 'perfil' | 'editarUsername' | 'vincular';

/** Datos del perfil en curso, compartidos por las vistas username, creando y perfil. */
export interface PerfilPanel {
  /** «completar»: recién creada la cuenta, a personalizar; «editar»: con la cuenta ya existente. */
  modo: 'completar' | 'editar';
  inicial: InicialPerfil;
  /** Correo de la cuenta que se crea (o el de Google). */
  correo?: string;
  /** Cambia con cada entrada para reiniciar los campos de la vista. */
  clave: number;
}
const PERFIL_INICIAL: PerfilPanel = { modo: 'completar', inicial: { username: '', nombres: '', apellidos: '', foto: null }, clave: 0 };

interface Valor {
  abierto: boolean;
  fase: FasePanel;
  abrir: (fase?: FasePanel) => void;
  cerrar: (devolverFoco?: boolean) => void;
  alternar: () => void;
  irA: (fase: FasePanel) => void;
  perfil: PerfilPanel;
  /** Con el panel ya abierto: pasa a una vista que lleva datos de perfil. */
  irAUsername: (inicial: InicialPerfil, correo?: string) => void;
  irACreando: (datos: InicialPerfil, correo?: string) => void;
  irAPerfil: (modo: PerfilPanel['modo'], inicial: InicialPerfil, correo?: string) => void;
  irAEditarUsername: (inicial: InicialPerfil, correo?: string) => void;
  /** Abre el panel directamente en esas vistas (desde una ruta). */
  abrirUsername: (inicial: InicialPerfil, correo?: string) => void;
  abrirPerfil: (modo: PerfilPanel['modo'], inicial: InicialPerfil, correo?: string) => void;
}

const Contexto = createContext<Valor | null>(null);

// Estado del panel de acceso que sube desde el pie. Lo comparten el pie, el campo LED de la portada y las rutas /login, /registro,
// /registro/username y /perfil.
export function LoginPanelProvider({ children }: { children: ReactNode }) {
  const [abierto, setAbierto] = useState(false);
  const [fase, setFase] = useState<FasePanel>('elegir');
  const [perfil, setPerfil] = useState<PerfilPanel>(PERFIL_INICIAL);
  const opener = useRef<HTMLElement | null>(null);

  const abrir = useCallback((f: FasePanel = 'elegir') => {
    // Recuerda qué abrió el panel para devolverle el foco al cerrarlo.
    const el = document.activeElement;
    const vale = el instanceof HTMLElement && el !== document.body && el.tagName !== 'MAIN';
    opener.current = vale ? el : (document.querySelector('[data-login-opener]') as HTMLElement | null);
    setFase(f);
    setAbierto(true);
  }, []);

  const cerrar = useCallback((devolverFoco = true) => {
    setAbierto(false);
    const el = opener.current;
    opener.current = null;
    // Tras el cierre, el foco vuelve al control que lo abrió (si sigue en pantalla).
    if (devolverFoco) window.setTimeout(() => el?.isConnected && el.focus(), 0);
  }, []);

  const con = useCallback((f: FasePanel, modo: PerfilPanel['modo'], inicial: InicialPerfil, correo?: string) => {
    setPerfil((p) => ({ modo, inicial, correo, clave: p.clave + 1 }));
    setFase(f);
  }, []);
  const irAUsername = useCallback((i: InicialPerfil, c?: string) => con('username', 'completar', i, c), [con]);
  const irACreando = useCallback((d: InicialPerfil, c?: string) => con('creando', 'completar', d, c), [con]);
  const irAPerfil = useCallback((m: PerfilPanel['modo'], i: InicialPerfil, c?: string) => con('perfil', m, i, c), [con]);
  const irAEditarUsername = useCallback((i: InicialPerfil, c?: string) => con('editarUsername', 'editar', i, c), [con]);
  const abrirUsername = useCallback((i: InicialPerfil, c?: string) => { irAUsername(i, c); abrir('username'); }, [irAUsername, abrir]);
  const abrirPerfil = useCallback((m: PerfilPanel['modo'], i: InicialPerfil, c?: string) => { irAPerfil(m, i, c); abrir('perfil'); }, [irAPerfil, abrir]);

  const valor = useMemo<Valor>(
    () => ({ abierto, fase, abrir, cerrar, alternar: () => (abierto ? cerrar() : abrir('elegir')), irA: setFase, perfil, irAUsername, irACreando, irAPerfil, irAEditarUsername, abrirUsername, abrirPerfil }),
    [abierto, fase, abrir, cerrar, perfil, irAUsername, irACreando, irAPerfil, irAEditarUsername, abrirUsername, abrirPerfil],
  );
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useLoginPanel(): Valor {
  const v = useContext(Contexto);
  if (!v) throw new Error('useLoginPanel debe usarse dentro de LoginPanelProvider');
  return v;
}
