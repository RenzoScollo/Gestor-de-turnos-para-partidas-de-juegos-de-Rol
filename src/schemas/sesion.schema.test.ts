// Test unitario: validaciones de Joi para Sesion (entidad de clave compuesta).
import { crearSesionSchema, sesionParamsSchema } from './sesion.schema';

describe('crearSesionSchema', () => {
  const base = { partida: 1, numSesion: 1, duracionSesion: 120, cantJugadores: 3 };

  it('acepta estadoSesion 1 (en curso) o 2 (finalizada)', async () => {
    await expect(
      crearSesionSchema.validateAsync({ ...base, estadoSesion: 1 })
    ).resolves.toMatchObject({ estadoSesion: 1 });

    await expect(
      crearSesionSchema.validateAsync({ ...base, estadoSesion: 2 })
    ).resolves.toMatchObject({ estadoSesion: 2 });
  });

  it('rechaza cualquier estadoSesion fuera de {1, 2}', async () => {
    await expect(
      crearSesionSchema.validateAsync({ ...base, estadoSesion: 99 })
    ).rejects.toThrow(/estadoSesion/);
  });

  it('exige la FK a partida', async () => {
    const { partida, ...sinPartida } = base;
    await expect(
      crearSesionSchema.validateAsync({ ...sinPartida, estadoSesion: 1 })
    ).rejects.toThrow();
  });
});

describe('sesionParamsSchema (URL de clave compuesta)', () => {
  it('acepta ids positivos', async () => {
    await expect(
      sesionParamsSchema.validateAsync({ idPartida: 3, numSesion: 1 })
    ).resolves.toEqual({ idPartida: 3, numSesion: 1 });
  });

  it('rechaza un numSesion no numerico', async () => {
    await expect(
      sesionParamsSchema.validateAsync({ idPartida: 3, numSesion: 'abc' })
    ).rejects.toThrow(/numSesion/);
  });

  it('rechaza ids negativos o cero', async () => {
    await expect(
      sesionParamsSchema.validateAsync({ idPartida: -1, numSesion: 1 })
    ).rejects.toThrow();
  });
});
