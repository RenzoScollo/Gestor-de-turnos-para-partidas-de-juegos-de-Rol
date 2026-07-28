import { EntityManager } from '@mikro-orm/core';
import { Objeto } from '../entities/Objeto.entity';
import { Inventario } from '../entities/Inventario.entity';

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
    // inventario es CLAVE COMPUESTA y OPCIONAL: si vino, getReference() lo
    // trata como una referencia al Inventario existente (no como datos para
    // crear un Inventario nuevo, que fallaria por faltarle cantidadEspacio).
    const { inventario, ...resto } = data;
    const inventarioRef = inventario ? this.em.getReference(Inventario, inventario) : null;
    const objeto = this.em.create(Objeto, { ...resto, inventario: inventarioRef });
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
