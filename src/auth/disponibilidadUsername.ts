import { api } from '../api/base';

// ¿Está libre este username? Consulta a la API mientras se escribe; es solo una ayuda: la unicidad real la garantiza el servidor
// al registrar (transacción). Si la consulta falla lanza el error y el campo sigue sin bloquearse (ver useEstadoCampo).
export async function comprobarDisponibilidad(username: string): Promise<boolean> {
  const { disponible } = await api<{ disponible: boolean }>(`/api/usernames/${encodeURIComponent(username)}/disponible`);
  return disponible;
}
