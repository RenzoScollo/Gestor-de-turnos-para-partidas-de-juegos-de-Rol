import { EntityManager } from '@mikro-orm/core';
import { Sesion } from '../entities/Sesion.entity';

// Sesion tiene CLAVE COMPUESTA (idPartida, numSesion): para identificar una
// sesion hacen falta LOS DOS valores, por eso los metodos reciben ambos.
export class SesionService {
  private em: EntityManager;

  constructor(em: EntityManager) {
    this.em = em;
  }

  async obtenerTodos() {
    return await this.em.find(Sesion, {}, { populate: ['partida'] });
  }

  async obtenerPorClave(idPartida: number, numSesion: number) {
    return await this.em.findOne(
      Sesion,
      { partida: { idPartida }, numSesion },
      { populate: ['partida'] }
    );
  }

  async crear(data: any) {
    // El body debe traer: partida (idPartida), numSesion y los datos propios
    const sesion = this.em.create(Sesion, data);
    await this.em.flush();
    return sesion;
  }

  async actualizar(idPartida: number, numSesion: number, data: any) {
    const sesion = await this.obtenerPorClave(idPartida, numSesion);
    if (!sesion) return null;

    this.em.assign(sesion, data);
    await this.em.flush();
    return sesion;
  }

  async eliminar(idPartida: number, numSesion: number) {
    const sesion = await this.obtenerPorClave(idPartida, numSesion);
    if (!sesion) return false;

    await this.em.removeAndFlush(sesion);
    return true;
  }
}
