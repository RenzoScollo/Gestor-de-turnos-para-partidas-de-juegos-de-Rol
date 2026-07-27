import { EntityManager } from '@mikro-orm/core';
import { Inventario } from '../entities/Inventario.entity';

// Inventario tiene CLAVE COMPUESTA (idPersonaje, numInventario).
export class InventarioService {
  private em: EntityManager;

  constructor(em: EntityManager) {
    this.em = em;
  }

  async obtenerTodos() {
    return await this.em.find(Inventario, {}, { populate: ['personaje'] });
  }

  async obtenerPorClave(idPersonaje: number, numInventario: number) {
    return await this.em.findOne(
      Inventario,
      { personaje: { idPersonaje }, numInventario },
      { populate: ['personaje'] }
    );
  }

  async crear(data: any) {
    // El body debe traer: personaje (idPersonaje), numInventario y cantidadEspacio
    const inventario = this.em.create(Inventario, data);
    await this.em.flush();
    return inventario;
  }

  async actualizar(idPersonaje: number, numInventario: number, data: any) {
    const inventario = await this.obtenerPorClave(idPersonaje, numInventario);
    if (!inventario) return null;

    this.em.assign(inventario, data);
    await this.em.flush();
    return inventario;
  }

  async eliminar(idPersonaje: number, numInventario: number) {
    const inventario = await this.obtenerPorClave(idPersonaje, numInventario);
    if (!inventario) return false;

    await this.em.removeAndFlush(inventario);
    return true;
  }
}
