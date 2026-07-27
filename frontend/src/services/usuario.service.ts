// usuario.service.ts — Logica de usuarios contra la API.
// Aca vive lo especifico del registro/login, que el CRUD generico no cubre.
import type { Usuario } from '../interfaces';
import { api } from './api';

export type TipoUsuario = 'jugador' | 'anfitrion';

export const usuarioService = {
  obtenerTodos(): Promise<Usuario[]> {
    return api.usuarios.obtenerTodos();
  },

  // Registro: crea el Usuario en la base.
  // OJO: Jugador y Anfitrion son tablas separadas (ver interfaces.ts). Cuando
  // el backend exponga /api/jugadores y /api/anfitriones habra que dar de alta
  // tambien la fila del rol; por ahora solo se crea el Usuario.
  async registrar(
    nombreUsuario: string,
    nickname: string,
    contrasena: string,
    _tipo: TipoUsuario
  ): Promise<Usuario> {
    return api.usuarios.crear({ nombreUsuario, nickname, contrasena, imagen: '' });
  },

  // Login provisorio: trae los usuarios y compara aca.
  // Cuando este la autenticacion con JWT, esto se reemplaza por un
  // POST /api/auth/login y el backend devuelve el token.
  async login(nickname: string, contrasena: string): Promise<Usuario | null> {
    const usuarios = await api.usuarios.obtenerTodos();
    const encontrado = usuarios.find(
      (u) => u.nickname === nickname && u.contrasena === contrasena
    );
    return encontrado ?? null;
  },
};
