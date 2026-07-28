import Joi from 'joi';

const nombreUsuario = Joi.string().trim().min(2).max(50).required().messages({
  'string.min': 'El nombre debe tener al menos {#limit} caracteres',
  'string.max': 'El nombre no puede superar {#limit} caracteres',
  'any.required': 'El nombre es requerido',
});

const nickname = Joi.string().trim().min(3).max(50).required().messages({
  'string.min': 'El nickname debe tener al menos {#limit} caracteres',
  'string.max': 'El nickname no puede superar {#limit} caracteres',
  'any.required': 'El nickname es requerido',
});

const contrasena = Joi.string().min(6).max(100).required().messages({
  'string.min': 'La contraseña debe tener al menos {#limit} caracteres',
  'any.required': 'La contraseña es requerida',
});

export const registroSchema = Joi.object({
  nombreUsuario,
  nickname,
  contrasena,
  imagen: Joi.string().trim().max(255).allow('').optional(),
  rol: Joi.string().valid('jugador', 'anfitrion').required().messages({
    'any.only': 'El rol debe ser "jugador" o "anfitrion"',
    'any.required': 'El rol es requerido',
  }),
});

export const loginSchema = Joi.object({
  nickname: Joi.string().trim().required().messages({ 'any.required': 'El nickname es requerido' }),
  contrasena: Joi.string().required().messages({ 'any.required': 'La contraseña es requerida' }),
});
