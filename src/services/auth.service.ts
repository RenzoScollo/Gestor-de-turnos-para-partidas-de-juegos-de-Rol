import { EntityManager } from '@mikro-orm/core';
import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { Usuario } from '../entities/Usuario.entity';
import { Jugador } from '../entities/Jugador.entity';
import { Anfitrion } from '../entities/Anfitrion.entity';

// Los dos niveles de acceso que pide la catedra
export type Rol = 'jugador' | 'anfitrion';

// Lo que viaja DENTRO del token
export interface PayloadToken {
  idUsuario: number;
  roles: Rol[];
}

export interface RespuestaAuth {
  usuario: { idUsuario: number; nombreUsuario: string; nickname: string; roles: Rol[] };
  token: string;
}

const SALT_ROUNDS = 10;

function secreto(): string {
  const valor = process.env.JWT_SECRET;
  if (!valor) {
    throw new Error('Falta la variable JWT_SECRET en el archivo .env');
  }
  return valor;
}

export class AuthService {
  private em: EntityManager;

  constructor(em: EntityManager) {
    this.em = em;
  }

  // ---------- Utilidades de contrasena y token ----------

  static async hashear(contrasena: string): Promise<string> {
    return await bcrypt.hash(contrasena, SALT_ROUNDS);
  }

  static async comparar(plana: string, hasheada: string): Promise<boolean> {
    return await bcrypt.compare(plana, hasheada);
  }

  static generarToken(payload: PayloadToken): string {
    const expiresIn = process.env.JWT_EXPIRES_IN ?? '2h';
    return jwt.sign(payload, secreto(), { expiresIn } as SignOptions);
  }

  static verificarToken(token: string): PayloadToken {
    try {
      return jwt.verify(token, secreto()) as PayloadToken;
    } catch {
      throw new Error('Token invalido o expirado');
    }
  }

  // ---------- Roles ----------

  // Un usuario puede ser jugador, anfitrion o AMBOS (son tablas separadas)
  async rolesDe(idUsuario: number): Promise<Rol[]> {
    const roles: Rol[] = [];
    if (await this.em.findOne(Jugador, { usuario: { idUsuario } })) {
      roles.push('jugador');
    }
    if (await this.em.findOne(Anfitrion, { usuario: { idUsuario } })) {
      roles.push('anfitrion');
    }
    return roles;
  }

  // ---------- Registro y login ----------

  async registrar(datos: {
    nombreUsuario: string;
    nickname: string;
    contrasena: string;
    imagen?: string;
    rol: Rol;
  }): Promise<RespuestaAuth> {
    if (!datos.nickname || !datos.contrasena) {
      throw new Error('Nickname y contrasena son obligatorios');
    }

    const existente = await this.em.findOne(Usuario, { nickname: datos.nickname });
    if (existente) {
      throw new Error('Ese nickname ya esta en uso');
    }

    // NUNCA se guarda la contrasena en texto plano
    const usuario = this.em.create(Usuario, {
      nombreUsuario: datos.nombreUsuario,
      nickname: datos.nickname,
      contrasena: await AuthService.hashear(datos.contrasena),
      imagen: datos.imagen ?? '',
    });
    await this.em.flush();

    // Alta en la tabla del rol elegido
    if (datos.rol === 'jugador') {
      this.em.create(Jugador, { usuario, estado: true });
    } else {
      this.em.create(Anfitrion, { usuario, cantPartidasActuales: 0, karma: 0 });
    }
    await this.em.flush();

    const roles: Rol[] = [datos.rol];
    return {
      usuario: {
        idUsuario: usuario.idUsuario,
        nombreUsuario: usuario.nombreUsuario,
        nickname: usuario.nickname,
        roles,
      },
      token: AuthService.generarToken({ idUsuario: usuario.idUsuario, roles }),
    };
  }

  async login(nickname: string, contrasena: string): Promise<RespuestaAuth> {
    if (!nickname || !contrasena) {
      throw new Error('Nickname y contrasena son obligatorios');
    }

    const usuario = await this.em.findOne(Usuario, { nickname });
    // Mismo mensaje si no existe o si la clave esta mal: no le damos pistas a nadie
    if (!usuario || !(await AuthService.comparar(contrasena, usuario.contrasena))) {
      throw new Error('Credenciales invalidas');
    }

    const roles = await this.rolesDe(usuario.idUsuario);
    return {
      usuario: {
        idUsuario: usuario.idUsuario,
        nombreUsuario: usuario.nombreUsuario,
        nickname: usuario.nickname,
        roles,
      },
      token: AuthService.generarToken({ idUsuario: usuario.idUsuario, roles }),
    };
  }

  async obtenerPerfil(idUsuario: number) {
    const usuario = await this.em.findOne(Usuario, { idUsuario });
    if (!usuario) return null;

    return {
      idUsuario: usuario.idUsuario,
      nombreUsuario: usuario.nombreUsuario,
      nickname: usuario.nickname,
      imagen: usuario.imagen,
      roles: await this.rolesDe(idUsuario),
    };
  }
}
