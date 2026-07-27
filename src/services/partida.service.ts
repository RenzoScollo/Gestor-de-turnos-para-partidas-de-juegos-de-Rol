import { EntityManager } from '@mikro-orm/core';
import { Partida } from '../entities/Partida.entity';

export class PartidaService {
  private em: EntityManager;

  constructor(em: EntityManager) {
    this.em = em;
  }

  async obtenerTodos() {
    // populate: ['anfitrion'] trae tambien los datos del anfitrion, no solo su id
    return await this.em.find(Partida, {}, { populate: ['anfitrion'] });
  }

  async obtenerPorId(id: number) {
    return await this.em.findOne(Partida, { idPartida: id }, { populate: ['anfitrion'] });
  }

  async crear(data: any) {
    // El body debe traer "anfitrion" con el idUsuario del anfitrion (la relacion)
    const partida = this.em.create(Partida, data);
    await this.em.flush();
    return partida;
  }

  async actualizar(id: number, data: any) {
    const partida = await this.obtenerPorId(id);
    if (!partida) return null;

    this.em.assign(partida, data);
    await this.em.flush();
    return partida;
  }

  async eliminar(id: number) {
    const partida = await this.obtenerPorId(id);
    if (!partida) return false;

    await this.em.removeAndFlush(partida);
    return true;
  }
}
