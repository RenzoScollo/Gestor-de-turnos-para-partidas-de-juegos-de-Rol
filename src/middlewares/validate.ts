import { type Request, type Response, type NextFunction } from 'express';
import Joi, { type Schema, type ValidationError } from 'joi';

type Ubicacion = 'body' | 'params' | 'query';

interface OpcionesValidacion {
  schema: Schema;
  ubicacion?: Ubicacion; // por defecto 'body'
}

// Middleware generico: valida req[ubicacion] contra el schema de Joi.
// Si es invalido, corta con 400 y el listado de errores; si es valido,
// reemplaza req[ubicacion] por la version saneada (stripUnknown saca
// campos que no pidio el schema, asi nadie manda de mas).
export function validate({ schema, ubicacion = 'body' }: OpcionesValidacion) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const datos = req[ubicacion as keyof Request];
      const valor = await schema.validateAsync(datos, { abortEarly: false, stripUnknown: true });
      req[ubicacion] = valor;
      next();
    } catch (error) {
      const err = error as ValidationError;
      const detalles = err?.details?.map((d) => d.message.replace(/"/g, '')) ?? ['Datos invalidos'];
      res.status(400).json({ message: detalles[0], errores: detalles });
    }
  };
}

// Reutilizable para las rutas con un solo :id numerico (ej. /clases/:id)
export const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.base': 'El id debe ser numerico',
    'number.integer': 'El id debe ser un entero',
    'number.positive': 'El id debe ser positivo',
    'any.required': 'El id es requerido',
  }),
});
