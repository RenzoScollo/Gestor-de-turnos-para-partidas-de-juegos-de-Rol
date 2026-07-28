import Joi from 'joi';

const nombreClase = Joi.string().trim().min(2).max(50);
const descripcionClase = Joi.string().trim().min(10).max(2000);

export const crearClaseSchema = Joi.object({
  nombreClase: nombreClase.required(),
  descripcionClase: descripcionClase.required(),
});

export const actualizarClaseSchema = Joi.object({
  nombreClase,
  descripcionClase,
}).min(1);
