// api.ts — Capa de servicios del frontend.
// Centraliza TODAS las llamadas HTTP al backend: los componentes no hacen
// fetch directo, le piden a estas funciones.

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

// --- Token JWT ---
// Se guarda en localStorage para que la sesion sobreviva al recargar.
const CLAVE_TOKEN = 'token';

export function guardarToken(token: string): void {
  localStorage.setItem(CLAVE_TOKEN, token);
}

export function obtenerToken(): string | null {
  return localStorage.getItem(CLAVE_TOKEN);
}

export function borrarToken(): void {
  localStorage.removeItem(CLAVE_TOKEN);
}

// Wrapper de fetch: arma la URL, manda el JSON + el token y traduce los
// errores HTTP a excepciones con el mensaje que devuelve el backend.
async function pedir<T>(ruta: string, opciones: RequestInit = {}): Promise<T> {
  const token = obtenerToken();

  const respuesta = await fetch(`${API_URL}${ruta}`, {
    ...opciones,
    headers: {
      'Content-Type': 'application/json',
      // Todas las rutas de la API exigen estar autenticado
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opciones.headers,
    },
  });

  if (!respuesta.ok) {
    // El backend responde { message: '...' } en los errores
    const detalle = await respuesta.json().catch(() => null);
    if (respuesta.status === 401) {
      borrarToken(); // token vencido: obligamos a loguear de nuevo
      throw new Error(detalle?.message ?? 'Sesion expirada, volve a iniciar sesion');
    }
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

  // --- Entidades con CLAVE COMPUESTA ---
  // La URL lleva todas las partes de la clave, no un solo id.

  sesiones: {
    obtenerTodos: () => pedir<import('../interfaces').Sesion[]>('/sesiones'),
    obtenerPorClave: (idPartida: number, numSesion: number) =>
      pedir<import('../interfaces').Sesion>(`/sesiones/${idPartida}/${numSesion}`),
    crear: (datos: Record<string, unknown>) =>
      pedir<import('../interfaces').Sesion>('/sesiones', {
        method: 'POST',
        body: JSON.stringify(datos),
      }),
    eliminar: (idPartida: number, numSesion: number) =>
      pedir<void>(`/sesiones/${idPartida}/${numSesion}`, { method: 'DELETE' }),
  },

  misiones: {
    obtenerTodos: () => pedir<import('../interfaces').Mision[]>('/misiones'),
    crear: (datos: Record<string, unknown>) =>
      pedir<import('../interfaces').Mision>('/misiones', {
        method: 'POST',
        body: JSON.stringify(datos),
      }),
    eliminar: (idPartida: number, numSesion: number, numMision: number) =>
      pedir<void>(`/misiones/${idPartida}/${numSesion}/${numMision}`, { method: 'DELETE' }),
  },
};
