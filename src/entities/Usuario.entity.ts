import { Entity, type Opt, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'usuarios' })
export class Usuario {
  // "Opt" le avisa a TypeScript que este campo es OPCIONAL al crear:
  // el id lo asigna MySQL (auto_increment), no se manda en em.create().
  @PrimaryKey({ type: 'number' })
  idUsuario!: number & Opt;

  @Property({ type: 'string', length: 50 })
  nombreUsuario!: string;

  @Property({ type: 'string', length: 100 })
  contrasena!: string;

  @Property({ type: 'string', length: 255 })
  imagen!: string;

  @Property({ type: 'string', length: 50, unique: true })
  nickname!: string;
}
