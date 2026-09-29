// no sabe nada de Express (HTTP). Solo aplica reglas y habla con la BD.
import { EntityManager } from '@mikro-orm/core';
import { Anfitrion } from '../entities/Anfitrion.entity';
import { Usuario } from '../entities/Usuario.entity';
import { Partida } from '../entities/Partida.entity';
import type { ActualizarAnfitrionDTO, AnfitrionPublicoDTO, CrearAnfitrionDTO } from '../types/anfitrion.dto';

// error  personalizado: el Usuario no existe en la BD
export class UsuarioNoEncontradoError extends Error {
  constructor(id: number) {
    super(`No existe ningún usuario con id ${id}`);
    this.name = 'UsuarioNoEncontradoError';
  }
}

// error personalizado: ese Usuario ya es Anfitrion
export class AnfitrionYaExisteError extends Error {
  constructor(id: number) {
    super(`El usuario ${id} ya está registrado como anfitrión`);
    this.name = 'AnfitrionYaExisteError';
  }
}

export class AnfitrionService {
  private em: EntityManager;

  constructor(em: EntityManager) {
    this.em = em;
  }

  // trae todos los anfitriones con los datos de su Usuario
  async obtenerTodos(): Promise<AnfitrionPublicoDTO[]> {
    const anfitriones = await this.em.find(Anfitrion, {}, { populate: ['usuario'] });
    if (anfitriones.length === 0) return [];

    // Performance optimization: fetch all active game counts in a single query
    // Using Knex to be dialect and naming-strategy agnostic while avoiding raw SQL issues.
    const anfitrionIds = anfitriones.map((a) => a.usuario.idUsuario);

    // Fallback if no anfitriones
    if (anfitrionIds.length === 0) return [];

    const knex = (this.em.getConnection() as any).getKnex();
    // Assuming table name is 'partidas' and column is 'idUsuarioAnfitrion' (based on entity definition)
    // Actually we can use the property name through the entity manager to be safer, or just use knex with known columns
    const countsResult = await knex('partidas')
      .select('idUsuarioAnfitrion as anfitrion')
      .count('* as count')
      .whereIn('idUsuarioAnfitrion', anfitrionIds)
      .where('estado', 1) // true
      .groupBy('idUsuarioAnfitrion');

    const countsMap = new Map();
    for (const row of countsResult as any) {
      countsMap.set(row.anfitrion, Number(row.count));
    }

    return anfitriones.map((a) => ({
      idUsuario: a.usuario.idUsuario,
      cantPartidasActuales: countsMap.get(a.usuario.idUsuario) || 0,
      karma: a.karma,
      nombreUsuario: a.usuario.nombreUsuario,
      nickname: a.usuario.nickname,
      imagen: a.usuario.imagen,
    }));
  }

  // busca un anfitrion por el idUsuario
  async obtenerPorId(idUsuario: number): Promise<AnfitrionPublicoDTO | null> {
    const anfitrion = await this.em.findOne(Anfitrion, idUsuario as any, { populate: ['usuario'] });
    return anfitrion ? this.aAnfitrionPublico(anfitrion) : null;
  }

  // registra a un Usuario existente como Anfitrion
  async crearAnfitrion(data: CrearAnfitrionDTO): Promise<AnfitrionPublicoDTO> {
    // regla 1: el Usuario debe existir antes de registrarlo como Anfitrion
    const usuario = await this.em.findOne(Usuario, { idUsuario: data.idUsuario });
    if (!usuario) {
      throw new UsuarioNoEncontradoError(data.idUsuario);
    }

    // regla 2: no puede registrarse dos veces como Anfitrion
    const anfitrionExistente = await this.em.findOne(Anfitrion, data.idUsuario as any);
    if (anfitrionExistente) {
      throw new AnfitrionYaExisteError(data.idUsuario);
    }

    const anfitrion = this.em.create(Anfitrion, {
      usuario,
      cantPartidasActuales: data.cantPartidasActuales,
      karma: data.karma,
    });

    await this.em.flush();
    return this.aAnfitrionPublico(anfitrion);
  }

  // actualiza karma o cantPartidasActuales
  async actualizarAnfitrion(idUsuario: number, data: ActualizarAnfitrionDTO): Promise<AnfitrionPublicoDTO | null> {
    const anfitrion = await this.em.findOne(Anfitrion, idUsuario as any, { populate: ['usuario'] });
    if (!anfitrion) return null;

    this.em.assign(anfitrion, data);
    await this.em.flush();
    return this.aAnfitrionPublico(anfitrion);
  }

  // quita el rol de Anfitrion (no borra el Usuario!!!!!!!!!!!!)
  async eliminarAnfitrion(idUsuario: number): Promise<boolean> {
    const anfitrion = await this.em.findOne(Anfitrion, idUsuario as any);
    if (!anfitrion) return false;

    await this.em.removeAndFlush(anfitrion);
    return true;
  }

  // convierte la entidad al DTO público
  private async aAnfitrionPublico(a: Anfitrion): Promise<AnfitrionPublicoDTO> {
    return {
      idUsuario: a.usuario.idUsuario,
      cantPartidasActuales: await this.em.count(Partida, { anfitrion: a, estado: true }),
      karma: a.karma,
      nombreUsuario: a.usuario.nombreUsuario,
      nickname: a.usuario.nickname,
      imagen: a.usuario.imagen,
    };
  }
}
