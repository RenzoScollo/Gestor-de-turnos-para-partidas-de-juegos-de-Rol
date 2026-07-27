import { EntityManager } from '@mikro-orm/core';
import { PersonajeSesion } from '../entities/PersonajeSesion.entity';

// Tabla de union Personaje/Sesion (historial de asistencia).
// CLAVE COMPUESTA TRIPLE: (idPersonaje) + (idPartida, numSesion) de la sesion.
export class PersonajeSesionService {
  private em: EntityManager;

  constructor(em: EntityManager) {
    this.em = em;
  }

  async obtenerTodos() {
    return await this.em.find(PersonajeSesion, {}, { populate: ['personaje', 'sesion'] });
  }

  async obtenerPorClave(idPersonaje: number, idPartida: number, numSesion: number) {
    return await this.em.findOne(
      PersonajeSesion,
      { personaje: { idPersonaje }, sesion: { partida: { idPartida }, numSesion } },
      { populate: ['personaje', 'sesion'] }
    );
  }

  async crear(data: any) {
    // El body debe traer: personaje (idPersonaje), sesion { partida, numSesion } y dioKarma
    const registro = this.em.create(PersonajeSesion, data);
    await this.em.flush();
    return registro;
  }

  async actualizar(idPersonaje: number, idPartida: number, numSesion: number, data: any) {
    const registro = await this.obtenerPorClave(idPersonaje, idPartida, numSesion);
    if (!registro) return null;

    this.em.assign(registro, data);
    await this.em.flush();
    return registro;
  }

  async eliminar(idPersonaje: number, idPartida: number, numSesion: number) {
    const registro = await this.obtenerPorClave(idPersonaje, idPartida, numSesion);
    if (!registro) return false;

    await this.em.removeAndFlush(registro);
    return true;
  }
}
