import Joi from 'joi';

const numSesion = Joi.number().integer().positive();
// FK a Partida
const partida = Joi.number().integer().positive();
const duracionSesion = Joi.number().integer().min(1);
const cantJugadores = Joi.number().integer().min(0);
// 1 = en curso, 2 = finalizada
const estadoSesion = Joi.number().integer().valid(1, 2).messages({
  'any.only': 'estadoSesion debe ser 1 (en curso) o 2 (finalizada)',
});

export const crearSesionSchema = Joi.object({
  partida: partida.required(),
  numSesion: numSesion.required(),
  duracionSesion: duracionSesion.required(),
  cantJugadores: cantJugadores.optional(),
  estadoSesion: estadoSesion.required(),
});

export const actualizarSesionSchema = Joi.object({
  duracionSesion,
  cantJugadores,
  estadoSesion,
}).min(1);

// La URL es /api/sesiones/:idPartida/:numSesion (clave compuesta)
export const sesionParamsSchema = Joi.object({
  idPartida: Joi.number().integer().positive().required(),
  numSesion: Joi.number().integer().positive().required(),
});
