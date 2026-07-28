import Joi from 'joi';

const claseTienda = Joi.string().trim().min(2).max(50);
const nombre = Joi.string().trim().min(2).max(100);
// FK opcional a Clase: una tienda puede no estar orientada a ninguna clase
const clase = Joi.number().integer().positive().allow(null);

export const crearTiendaSchema = Joi.object({
  claseTienda: claseTienda.required(),
  nombre: nombre.required(),
  clase: clase.optional(),
});

export const actualizarTiendaSchema = Joi.object({
  claseTienda,
  nombre,
  clase,
}).min(1);
