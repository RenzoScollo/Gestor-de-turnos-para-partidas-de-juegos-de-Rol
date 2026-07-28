import Joi from 'joi';

const numMision = Joi.number().integer().positive();
// FK compuesta a Sesion(idPartida, numSesion)
const sesion = Joi.object({
  partida: Joi.number().integer().positive().required(),
  numSesion: Joi.number().integer().positive().required(),
});
const descripcion = Joi.string().trim().min(5).max(2000);
const dineroTotal = Joi.number().integer().min(0);
const xpTotal = Joi.number().integer().min(0);
const xpOtorgadoJugadores = Joi.number().integer().min(0);
const dineroOtorgadoAJugadores = Joi.number().integer().min(0);
const asistenciaGrupoGrande = Joi.number().integer().min(0);
const estado = Joi.boolean();

export const crearMisionSchema = Joi.object({
  sesion: sesion.required(),
  numMision: numMision.required(),
  descripcion: descripcion.required(),
  dineroTotal: dineroTotal.required(),
  xpTotal: xpTotal.required(),
  xpOtorgadoJugadores: xpOtorgadoJugadores.optional(),
  dineroOtorgadoAJugadores: dineroOtorgadoAJugadores.optional(),
  asistenciaGrupoGrande: asistenciaGrupoGrande.optional(),
  estado: estado.optional(),
});

export const actualizarMisionSchema = Joi.object({
  descripcion,
  dineroTotal,
  xpTotal,
  xpOtorgadoJugadores,
  dineroOtorgadoAJugadores,
  asistenciaGrupoGrande,
  estado,
}).min(1);

// La URL es /api/misiones/:idPartida/:numSesion/:numMision (clave triple)
export const misionParamsSchema = Joi.object({
  idPartida: Joi.number().integer().positive().required(),
  numSesion: Joi.number().integer().positive().required(),
  numMision: Joi.number().integer().positive().required(),
});
