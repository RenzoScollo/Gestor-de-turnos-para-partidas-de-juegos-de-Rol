import { EntityManager } from '@mikro-orm/core';
import { Tienda } from '../entities/Tienda.entity';

export class TiendaService {
  private em: EntityManager;

  constructor(em: EntityManager) {
    this.em = em;
  }

  async obtenerTodos() {
    // populate: ['clase'] trae la clase orientada (si tiene), no solo su id
    return await this.em.find(Tienda, {}, { populate: ['clase'] });
  }

  async obtenerPorId(id: number) {
    return await this.em.findOne(Tienda, { idTienda: id }, { populate: ['clase'] });
  }

  async crear(data: any) {
    const tienda = this.em.create(Tienda, data);
    await this.em.flush();
    return tienda;
  }

  async actualizar(id: number, data: any) {
    const tienda = await this.obtenerPorId(id);
    if (!tienda) return null;

    this.em.assign(tienda, data);
    await this.em.flush();
    return tienda;
  }

  async eliminar(id: number) {
    const tienda = await this.obtenerPorId(id);
    if (!tienda) return false;

    await this.em.removeAndFlush(tienda);
    return true;
  }
}
