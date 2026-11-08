import { normalizarUsername } from './validaciones';

// ¿Está libre este username? Simulado hasta el Sprint 1, cuando se reemplaza por una consulta a la API. Aun así, la unicidad
// real solo la puede garantizar el servidor al registrar (transacción, US-01): esta consulta es una ayuda mientras se escribe.
// Se compara en forma canónica (sin distinguir mayúsculas).
const OCUPADOS = ['ana', 'demo', 'root'];
const LATENCIA_MS = 400;

export function comprobarDisponibilidad(username: string): Promise<boolean> {
  return new Promise((resolver) => {
    window.setTimeout(() => resolver(!OCUPADOS.includes(normalizarUsername(username))), LATENCIA_MS);
  });
}
