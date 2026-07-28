import Joi from 'joi';

// FK a Personaje
const personaje = Joi.number().integer().positive();
// FK compuesta a Sesion(idPartida, numSesion)
const sesion = Joi.object({
  partida: Joi.number().integer().positive().required(),
  numSesion: Joi.number().integer().positive().required(),
});
const dioKarma = Joi.boolean();
// Posicion en la ronda de turnos de esa sesion (1, 2, 3...)
const orden = Joi.number().integer().positive().messages({
  'number.base': 'orden debe ser un numero (la posicion en la ronda de turnos)',
  'number.positive': 'orden debe ser positivo',
});

export const crearPersonajeSesionSchema = Joi.object({
  personaje: personaje.required(),
  sesion: sesion.required(),
  dioKarma: dioKarma.required(),
  orden: orden.required(),
});

export const actualizarPersonajeSesionSchema = Joi.object({
  dioKarma,
  orden,
}).min(1);

// La URL es /api/personaje-sesion/:idPersonaje/:idPartida/:numSesion (clave triple)
export const personajeSesionParamsSchema = Joi.object({
  idPersonaje: Joi.number().integer().positive().required(),
  idPartida: Joi.number().integer().positive().required(),
  numSesion: Joi.number().integer().positive().required(),
});
