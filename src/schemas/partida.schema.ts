import Joi from 'joi';

const nombre = Joi.string().trim().min(2).max(100);
const estado = Joi.boolean();
const limiteJugadores = Joi.number().integer().min(1).max(20).messages({
  'number.min': 'La partida necesita al menos {#limit} jugador',
  'number.max': 'La partida no puede tener mas de {#limit} jugadores',
});
// Vacia = partida publica
const contrasena = Joi.string().max(100).allow('');
// FK a Anfitrion: se manda el idUsuario del anfitrion
const anfitrion = Joi.number().integer().positive().messages({
  'number.base': 'anfitrion debe ser el idUsuario del anfitrion',
});

export const crearPartidaSchema = Joi.object({
  nombre: nombre.required(),
  estado: estado.optional(),
  limiteJugadores: limiteJugadores.required(),
  contrasena: contrasena.required(),
  anfitrion: anfitrion.required(),
});

export const actualizarPartidaSchema = Joi.object({
  nombre,
  estado,
  limiteJugadores,
  contrasena,
  anfitrion,
}).min(1);
