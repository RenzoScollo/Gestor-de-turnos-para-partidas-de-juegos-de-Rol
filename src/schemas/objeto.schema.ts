import Joi from 'joi';

const valor = Joi.number().integer().min(0);
const descripcion = Joi.string().trim().min(5).max(2000);
const nombre = Joi.string().trim().min(2).max(100);
const nivelObjeto = Joi.number().integer().min(1);
const tipoObjeto = Joi.string().trim().min(2).max(50);
const posicion = Joi.number().integer().min(0);
// FK opcional a Tienda
const tienda = Joi.number().integer().positive().allow(null);
// FK compuesta opcional a Inventario(idPersonaje, numInventario)
const inventario = Joi.object({
  personaje: Joi.number().integer().positive().required(),
  numInventario: Joi.number().integer().positive().required(),
}).allow(null);

export const crearObjetoSchema = Joi.object({
  valor: valor.required(),
  descripcion: descripcion.required(),
  nombre: nombre.required(),
  nivelObjeto: nivelObjeto.required(),
  tipoObjeto: tipoObjeto.required(),
  posicion: posicion.optional(),
  tienda: tienda.optional(),
  inventario: inventario.optional(),
});

export const actualizarObjetoSchema = Joi.object({
  valor,
  descripcion,
  nombre,
  nivelObjeto,
  tipoObjeto,
  posicion,
  tienda,
  inventario,
}).min(1);
