// usuario.service.ts — Operaciones sobre usuarios (rutas protegidas).
// El registro y el login viven en auth.service.ts.
import type { Usuario } from '../interfaces';
import { api } from './api';

export const usuarioService = {
  obtenerTodos(): Promise<Usuario[]> {
    return api.usuarios.obtenerTodos();
  },

  obtenerPorId(id: number): Promise<Usuario> {
    return api.usuarios.obtenerPorId(id);
  },

  actualizar(id: number, datos: Partial<Usuario>): Promise<Usuario> {
    return api.usuarios.actualizar(id, datos);
  },

  eliminar(id: number): Promise<void> {
    return api.usuarios.eliminar(id);
  },
};
