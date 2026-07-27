import { EntityManager } from '@mikro-orm/core';
import { Objeto } from '../entities/Objeto.entity';

export class ObjetoService {
  private em: EntityManager;

  constructor(em: EntityManager) {
    this.em = em;
  }

  async obtenerTodos() {
    // Un objeto puede estar en una tienda O en un inventario (o en ninguno)
    return await this.em.find(Objeto, {}, { populate: ['tienda', 'inventario'] });
  }

  async obtenerPorId(id: number) {
    return await this.em.findOne(
      Objeto,
      { idObjeto: id },
      { populate: ['tienda', 'inventario'] }
    );
  }

  async crear(data: any) {
    const objeto = this.em.create(Objeto, data);
    await this.em.flush();
    return objeto;
  }

  async actualizar(id: number, data: any) {
    const objeto = await this.obtenerPorId(id);
    if (!objeto) return null;

    this.em.assign(objeto, data);
    await this.em.flush();
    return objeto;
  }

  async eliminar(id: number) {
    const objeto = await this.obtenerPorId(id);
    if (!objeto) return false;

    await this.em.removeAndFlush(objeto);
    return true;
  }
}
