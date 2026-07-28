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
  // La entity exige estos 3 campos (NOT NULL, sin default en la base), asi
  // que si no vienen en el body hay que rellenarlos aca: un personaje
  // arranca en nivel 1, sin xp ni dinero.
  xp: xp.optional().default(0),
  nivel: nivel.optional().default(1),
  dinero: dinero.optional().default(0),
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
