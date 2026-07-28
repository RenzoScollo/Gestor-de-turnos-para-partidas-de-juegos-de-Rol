import { EntityManager } from '@mikro-orm/core';
import { Sesion } from '../entities/Sesion.entity';
import { PersonajeSesion } from '../entities/PersonajeSesion.entity';
import { Partida } from '../entities/Partida.entity';

// El gestor de turnos: quien juega ahora dentro de una Sesion, y como se
// pasa el turno al siguiente personaje. El orden de la ronda esta en
// PersonajeSesion.orden (1, 2, 3... segun se inscribieron a la sesion).
export class TurnoService {
  private em: EntityManager;

  constructor(em: EntityManager) {
    this.em = em;
  }

  // Solo el anfitrion DUEÑO de la partida puede manejar sus turnos.
  async esAnfitrionDePartida(idPartida: number, idUsuarioSolicitante: number): Promise<boolean> {
    const partida = await this.em.findOne(Partida, {
      idPartida,
      anfitrion: { usuario: { idUsuario: idUsuarioSolicitante } },
    });
    return partida !== null;
  }

  // La ronda de esa sesion, ordenada por posicion de turno.
  private async rondaDe(idPartida: number, numSesion: number): Promise<PersonajeSesion[]> {
    return await this.em.find(
      PersonajeSesion,
      { sesion: { partida: { idPartida }, numSesion } },
      { populate: ['personaje'], orderBy: { orden: 'ASC' } }
    );
  }

  async obtenerTurnoActual(idPartida: number, numSesion: number): Promise<Sesion | null> {
    return await this.em.findOne(
      Sesion,
      { partida: { idPartida }, numSesion },
      { populate: ['turnoActual'] }
    );
  }

  // Arranca la ronda: el turno pasa al personaje con orden = 1.
  async iniciarTurno(idPartida: number, numSesion: number): Promise<Sesion | null> {
    const sesion = await this.em.findOne(Sesion, { partida: { idPartida }, numSesion });
    if (!sesion) return null;

    const ronda = await this.rondaDe(idPartida, numSesion);
    if (ronda.length === 0) {
      throw new Error('La sesion no tiene personajes anotados para iniciar el turno');
    }

    sesion.turnoActual = ronda[0].personaje;
    await this.em.flush();
    return sesion;
  }

  // Pasa el turno al siguiente personaje segun "orden". Si el actual era
  // el ultimo, vuelve al primero (ronda circular).
  async avanzarTurno(idPartida: number, numSesion: number): Promise<Sesion | null> {
    const sesion = await this.em.findOne(
      Sesion,
      { partida: { idPartida }, numSesion },
      { populate: ['turnoActual'] }
    );
    if (!sesion) return null;

    const ronda = await this.rondaDe(idPartida, numSesion);
    if (ronda.length === 0) {
      throw new Error('La sesion no tiene personajes anotados para avanzar el turno');
    }

    if (!sesion.turnoActual) {
      // Todavia no se inicio el turno: avanzar = iniciar en el primero.
      sesion.turnoActual = ronda[0].personaje;
    } else {
      const idActual = sesion.turnoActual.idPersonaje;
      const indiceActual = ronda.findIndex((r) => r.personaje.idPersonaje === idActual);
      const siguienteIndice = indiceActual === -1 ? 0 : (indiceActual + 1) % ronda.length;
      sesion.turnoActual = ronda[siguienteIndice].personaje;
    }

    await this.em.flush();
    return sesion;
  }
}
