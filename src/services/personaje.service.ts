import { EntityManager } from '@mikro-orm/core';
import { Personaje } from '../entities/Personaje.entity';

export class PersonajeService {
  private em: EntityManager;

  constructor(em: EntityManager) {
    this.em = em;
  }

  async obtenerTodos() {
    // Trae tambien la clase, el jugador (con su usuario) y la partida
    return await this.em.find(Personaje, {}, { populate: ['clase', 'jugador', 'partida'] });
  }

  async obtenerPorId(id: number) {
    return await this.em.findOne(
      Personaje,
      { idPersonaje: id },
      { populate: ['clase', 'jugador', 'partida'] }
    );
  }

  async crear(data: any) {
    // El body debe traer: clase (idClase), jugador (idUsuario del jugador)
    // y partida (idPartida) ademas de los datos propios
    const personaje = this.em.create(Personaje, data);
    await this.em.flush();
    return personaje;
  }

  async actualizar(id: number, data: any) {
    const personaje = await this.obtenerPorId(id);
    if (!personaje) return null;

    this.em.assign(personaje, data);
    await this.em.flush();
    return personaje;
  }

  async eliminar(id: number) {
    const personaje = await this.obtenerPorId(id);
    if (!personaje) return false;

    await this.em.removeAndFlush(personaje);
    return true;
  }
}
