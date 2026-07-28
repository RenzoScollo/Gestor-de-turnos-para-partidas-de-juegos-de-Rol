import Joi from 'joi';

// Los mensajes en español son mas utiles para el equipo/profesor que los
// default de Joi en ingles.
const nombreUsuario = Joi.string().trim().min(2).max(50).messages({
  'string.min': 'El nombre debe tener al menos {#limit} caracteres',
  'string.max': 'El nombre no puede superar {#limit} caracteres',
});

const nickname = Joi.string().trim().min(3).max(50).messages({
  'string.min': 'El nickname debe tener al menos {#limit} caracteres',
  'string.max': 'El nickname no puede superar {#limit} caracteres',
});

const contrasena = Joi.string().min(6).max(100).messages({
  'string.min': 'La contraseña debe tener al menos {#limit} caracteres',
  'string.max': 'La contraseña no puede superar {#limit} caracteres',
});

const imagen = Joi.string().trim().max(255).allow('').messages({
  'string.max': 'La imagen no puede superar {#limit} caracteres',
});

export const crearUsuarioSchema = Joi.object({
  nombreUsuario: nombreUsuario.required(),
  nickname: nickname.required(),
  contrasena: contrasena.required(),
  imagen: imagen.optional(),
});

export const actualizarUsuarioSchema = Joi.object({
  nombreUsuario,
  nickname,
  contrasena,
  imagen,
}).min(1);
