// Test unitario: validaciones de Joi para Usuario.
import { crearUsuarioSchema, actualizarUsuarioSchema } from './usuario.schema';

describe('crearUsuarioSchema', () => {
  it('acepta datos validos', async () => {
    const datos = {
      nombreUsuario: 'Renzo Scollo',
      nickname: 'RenzoDM',
      contrasena: 'clave1234',
    };

    await expect(crearUsuarioSchema.validateAsync(datos)).resolves.toMatchObject(datos);
  });

  it('rechaza un nickname demasiado corto', async () => {
    const datos = { nombreUsuario: 'Renzo', nickname: 'ab', contrasena: 'clave1234' };

    await expect(crearUsuarioSchema.validateAsync(datos)).rejects.toThrow(
      /nickname/i
    );
  });

  it('rechaza una contraseña demasiado corta', async () => {
    const datos = { nombreUsuario: 'Renzo', nickname: 'RenzoDM', contrasena: '123' };

    await expect(crearUsuarioSchema.validateAsync(datos)).rejects.toThrow(
      /contraseña/i
    );
  });

  it('descarta campos que no pidio el schema (stripUnknown lo hace validate(), pero el schema solo no lo hace)', async () => {
    // Sin stripUnknown explicito, Joi por defecto RECHAZA propiedades desconocidas
    const datos = {
      nombreUsuario: 'Renzo',
      nickname: 'RenzoDM',
      contrasena: 'clave1234',
      esAdmin: true, // no existe en el modelo
    };

    await expect(crearUsuarioSchema.validateAsync(datos)).rejects.toThrow();
  });
});

describe('actualizarUsuarioSchema', () => {
  it('exige al menos un campo', async () => {
    await expect(actualizarUsuarioSchema.validateAsync({})).rejects.toThrow();
  });

  it('acepta actualizar un solo campo', async () => {
    await expect(
      actualizarUsuarioSchema.validateAsync({ nickname: 'NuevoNick' })
    ).resolves.toEqual({ nickname: 'NuevoNick' });
  });
});
