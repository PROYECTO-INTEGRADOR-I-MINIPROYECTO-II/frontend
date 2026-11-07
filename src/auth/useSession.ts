// Marcador de la sesión: el Sprint 1 lo reemplaza por Firebase Auth.
// Para probar el estado «con sesión» en el rework: VITE_DEMO_SESION=true en .env
export interface Session {
  user: { username: string } | null;
}

export function useSession(): Session {
  return { user: import.meta.env.VITE_DEMO_SESION === 'true' ? { username: 'demo' } : null };
}
