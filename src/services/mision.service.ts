import { EntityManager } from '@mikro-orm/core';
import { Mision } from '../entities/Mision.entity';

// Mision tiene CLAVE COMPUESTA TRIPLE (idPartida, numSesion, numMision):
// pertenece a una Sesion (que ya tiene clave doble) + su propio numero.
export class MisionService {
  private em: EntityManager;

  constructor(em: EntityManager) {
    this.em = em;
  }

  async obtenerTodos() {
    return await this.em.find(Mision, {}, { populate: ['sesion'] });
  }

  async obtenerPorClave(idPartida: number, numSesion: number, numMision: number) {
    return await this.em.findOne(
      Mision,
      { sesion: { partida: { idPartida }, numSesion }, numMision },
      { populate: ['sesion'] }
    );
  }

  async crear(data: any) {
    // El body debe traer: sesion { partida, numSesion }, numMision y los datos propios
    const mision = this.em.create(Mision, data);
    await this.em.flush();
    return mision;
  }

  async actualizar(idPartida: number, numSesion: number, numMision: number, data: any) {
    const mision = await this.obtenerPorClave(idPartida, numSesion, numMision);
    if (!mision) return null;

    this.em.assign(mision, data);
    await this.em.flush();
    return mision;
  }

  async eliminar(idPartida: number, numSesion: number, numMision: number) {
    const mision = await this.obtenerPorClave(idPartida, numSesion, numMision);
    if (!mision) return false;

    await this.em.removeAndFlush(mision);
    return true;
  }
}
