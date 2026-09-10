import { EntityManager, LockMode } from '@mikro-orm/core';
import { Clase } from '../entities/Clase.entity';
import { Tienda } from '../entities/Tienda.entity';
import type { ActualizarClaseDTO, ClasePublicaDTO, CrearClaseDTO } from '../types/clase.dto';

export class ClaseConTiendasError extends Error {
  constructor() {
    super('La clase tiene tiendas vinculadas. Quitá o cambiá su clase antes de eliminarla.');
    this.name = 'ClaseConTiendasError';
  }
}

export class ClaseService {
  private em: EntityManager;

  constructor(em: EntityManager) {
    this.em = em;
  }

  async obtenerTodos(): Promise<ClasePublicaDTO[]> {
    const clases = await this.em.find(Clase, {});
    return clases.map((c) => this.aClasePublica(c));
  }

  async obtenerPorId(id: number): Promise<ClasePublicaDTO | null> {
    const clase = await this.em.findOne(Clase, { idClase: id });
    return clase ? this.aClasePublica(clase) : null;
  }

  async crearClase(data: CrearClaseDTO): Promise<ClasePublicaDTO> {
    const clase = this.em.create(Clase, data);
    await this.em.flush();
    return this.aClasePublica(clase);
  }

  async actualizarClase(id: number, data: ActualizarClaseDTO): Promise<ClasePublicaDTO | null> {
    const clase = await this.em.findOne(Clase, { idClase: id });
    if (!clase) return null;

    this.em.assign(clase, data);
    await this.em.flush();
    return this.aClasePublica(clase);
  }

  async eliminarClase(id: number): Promise<boolean> {
    return this.em.transactional(async em => {
      // La FK nullable puede tener ON DELETE SET NULL: no depender de ella para
      // impedir una desvinculación implícita. El bloqueo serializa nuevas referencias.
      const clase = await em.findOne(Clase, { idClase: id }, { lockMode: LockMode.PESSIMISTIC_WRITE });
      if (!clase) return false;
      if (await em.count(Tienda, { clase: { idClase: id } })) throw new ClaseConTiendasError();
      await em.removeAndFlush(clase);
      return true;
    });
  }

  private aClasePublica(c: Clase): ClasePublicaDTO {
    return {
      idClase: c.idClase,
      nombreClase: c.nombreClase,
      descripcionClase: c.descripcionClase,
    };
  }
}
