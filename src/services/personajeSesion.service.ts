import { EntityManager } from '@mikro-orm/core';
import { PersonajeSesion } from '../entities/PersonajeSesion.entity';
import { Sesion } from '../entities/Sesion.entity';

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
    // El body trae: personaje (idPersonaje), sesion { partida, numSesion }, dioKarma, orden.
    // sesion es una CLAVE COMPUESTA: si se le pasa el objeto {partida, numSesion}
    // tal cual a em.create(), MikroORM intenta CREAR una Sesion nueva (y falla,
    // porque le faltan sus campos NOT NULL). getReference() la trata como lo
    // que es: una referencia a la Sesion que YA existe.
    const { sesion, ...resto } = data;
    const sesionRef = this.em.getReference(Sesion, sesion);
    const registro = this.em.create(PersonajeSesion, { ...resto, sesion: sesionRef });
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
