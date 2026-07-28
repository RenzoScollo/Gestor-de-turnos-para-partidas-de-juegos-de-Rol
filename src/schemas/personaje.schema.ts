import Joi from 'joi';

const nombreFicticio = Joi.string().trim().min(2).max(100);
const raza = Joi.string().trim().min(2).max(50);
const xp = Joi.number().integer().min(0);
const nivel = Joi.number().integer().min(1);
const dinero = Joi.number().integer().min(0);
// FKs: se mandan como los ids de las entidades relacionadas
const clase = Joi.number().integer().positive();
const jugador = Joi.number().integer().positive().messages({
  'number.base': 'jugador debe ser el idUsuario del jugador',
});
const partida = Joi.number().integer().positive();

export const crearPersonajeSchema = Joi.object({
  nombreFicticio: nombreFicticio.required(),
  raza: raza.required(),
  xp: xp.optional(),
  nivel: nivel.optional(),
  dinero: dinero.optional(),
  clase: clase.required(),
  jugador: jugador.required(),
  partida: partida.required(),
});

export const actualizarPersonajeSchema = Joi.object({
  nombreFicticio,
  raza,
  xp,
  nivel,
  dinero,
  clase,
  jugador,
  partida,
}).min(1);
