// auth.service.ts — Registro, login y manejo del token JWT.
import { API_URL, guardarToken, borrarToken, obtenerToken } from './api';

export type Rol = 'jugador' | 'anfitrion';

export interface UsuarioAutenticado {
  idUsuario: number;
  nombreUsuario: string;
  nickname: string;
  roles: Rol[];
}

interface RespuestaAuth {
  usuario: UsuarioAutenticado;
  token: string;
}

// Las rutas de auth son publicas: no mandan token.
async function pedirAuth(ruta: string, cuerpo: unknown): Promise<RespuestaAuth> {
  const respuesta = await fetch(`${API_URL}/auth${ruta}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cuerpo),
  });

  const datos = await respuesta.json().catch(() => null);
  if (!respuesta.ok) {
    throw new Error(datos?.message ?? `Error ${respuesta.status}`);
  }
  return datos as RespuestaAuth;
}

export const authService = {
  async registrar(
    nombreUsuario: string,
    nickname: string,
    contrasena: string,
    rol: Rol
  ): Promise<UsuarioAutenticado> {
    const { usuario, token } = await pedirAuth('/registro', {
      nombreUsuario,
      nickname,
      contrasena,
      rol,
    });
    guardarToken(token);
    return usuario;
  },

  async login(nickname: string, contrasena: string): Promise<UsuarioAutenticado> {
    const { usuario, token } = await pedirAuth('/login', { nickname, contrasena });
    guardarToken(token);
    return usuario;
  },

  cerrarSesion(): void {
    borrarToken();
  },

  haySesion(): boolean {
    return obtenerToken() !== null;
  },

  // Recupera la sesion al recargar la pagina, usando el token guardado
  async perfil(): Promise<UsuarioAutenticado | null> {
    const token = obtenerToken();
    if (!token) return null;

    const respuesta = await fetch(`${API_URL}/auth/perfil`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!respuesta.ok) {
      borrarToken(); // token vencido o invalido
      return null;
    }
    return (await respuesta.json()) as UsuarioAutenticado;
  },
};
