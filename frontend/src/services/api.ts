// api.ts — Capa de servicios del frontend.
// Centraliza TODAS las llamadas HTTP al backend: los componentes no hacen
// fetch directo, le piden a estas funciones.

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

// Wrapper de fetch: arma la URL, manda el JSON y traduce los errores HTTP
// a excepciones con el mensaje que devuelve el backend.
async function pedir<T>(ruta: string, opciones: RequestInit = {}): Promise<T> {
  const respuesta = await fetch(`${API_URL}${ruta}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opciones,
  });

  if (!respuesta.ok) {
    // El backend responde { message: '...' } en los errores
    const detalle = await respuesta.json().catch(() => null);
    throw new Error(detalle?.message ?? `Error ${respuesta.status}`);
  }

  // El DELETE devuelve 204 sin body
  if (respuesta.status === 204) {
    return undefined as T;
  }

  return respuesta.json() as Promise<T>;
}

// Genera el CRUD completo para una entidad de clave simple.
// Sirve para usuarios, clases, partidas, tiendas, personajes y objetos.
function crudDe<T>(recurso: string) {
  return {
    obtenerTodos: () => pedir<T[]>(`/${recurso}`),
    obtenerPorId: (id: number) => pedir<T>(`/${recurso}/${id}`),
    crear: (datos: Partial<T>) =>
      pedir<T>(`/${recurso}`, { method: 'POST', body: JSON.stringify(datos) }),
    actualizar: (id: number, datos: Partial<T>) =>
      pedir<T>(`/${recurso}/${id}`, { method: 'PUT', body: JSON.stringify(datos) }),
    eliminar: (id: number) =>
      pedir<void>(`/${recurso}/${id}`, { method: 'DELETE' }),
  };
}

export const api = {
  usuarios: crudDe<import('../interfaces').Usuario>('usuarios'),
  clases: crudDe<import('../interfaces').Clase>('clases'),
  partidas: crudDe<import('../interfaces').Partida>('partidas'),
  tiendas: crudDe<import('../interfaces').Tienda>('tiendas'),
  personajes: crudDe<import('../interfaces').Personaje>('personajes'),
  objetos: crudDe<import('../interfaces').Objeto>('objetos'),
};
