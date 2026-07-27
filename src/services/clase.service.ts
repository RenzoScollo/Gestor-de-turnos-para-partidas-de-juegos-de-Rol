import { EntityManager } from '@mikro-orm/core';
import { Clase } from '../entities/Clase.entity';

export class ClaseService {
  private em: EntityManager;

  constructor(em: EntityManager) {
    this.em = em;
  }

  async obtenerTodos() {
    return await this.em.find(Clase, {});
  }

  async obtenerPorId(id: number) {
    return await this.em.findOne(Clase, { idClase: id });
  }

  async crear(data: any) {
    const clase = this.em.create(Clase, data);
    await this.em.flush();
    return clase;
  }

  async actualizar(id: number, data: any) {
    const clase = await this.obtenerPorId(id);
    if (!clase) return null;

    this.em.assign(clase, data);
    await this.em.flush();
    return clase;
  }

  async eliminar(id: number) {
    const clase = await this.obtenerPorId(id);
    if (!clase) return false;

    await this.em.removeAndFlush(clase);
    return true;
  }
}
