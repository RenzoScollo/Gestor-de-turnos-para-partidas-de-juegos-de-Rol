import Joi from 'joi';

const numInventario = Joi.number().integer().positive();
// FK a Personaje
const personaje = Joi.number().integer().positive();
const cantidadEspacio = Joi.number().integer().min(1).max(200);

export const crearInventarioSchema = Joi.object({
  personaje: personaje.required(),
  numInventario: numInventario.required(),
  cantidadEspacio: cantidadEspacio.required(),
});

export const actualizarInventarioSchema = Joi.object({
  cantidadEspacio,
}).min(1);

// La URL es /api/inventarios/:idPersonaje/:numInventario (clave compuesta)
export const inventarioParamsSchema = Joi.object({
  idPersonaje: Joi.number().integer().positive().required(),
  numInventario: Joi.number().integer().positive().required(),
});
