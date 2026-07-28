import Joi from 'joi';

// FK a Personaje
const personaje = Joi.number().integer().positive();
// FK compuesta a Sesion(idPartida, numSesion)
const sesion = Joi.object({
  partida: Joi.number().integer().positive().required(),
  numSesion: Joi.number().integer().positive().required(),
});
const dioKarma = Joi.boolean();

export const crearPersonajeSesionSchema = Joi.object({
  personaje: personaje.required(),
  sesion: sesion.required(),
  dioKarma: dioKarma.required(),
});

export const actualizarPersonajeSesionSchema = Joi.object({
  dioKarma: dioKarma.required(),
});

// La URL es /api/personaje-sesion/:idPersonaje/:idPartida/:numSesion (clave triple)
export const personajeSesionParamsSchema = Joi.object({
  idPersonaje: Joi.number().integer().positive().required(),
  idPartida: Joi.number().integer().positive().required(),
  numSesion: Joi.number().integer().positive().required(),
});
