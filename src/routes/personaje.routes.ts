import { Router } from 'express';
import { PersonajeController } from '../controllers/personaje.controller';
import { PersonajeService } from '../services/personaje.service';
import { EntityManager } from '@mikro-orm/core';
import { validate, idParamSchema } from '../middlewares/validate';
import { crearPersonajeSchema, actualizarPersonajeSchema } from '../schemas/personaje.schema';

export function crearPersonajeRouter(em: EntityManager): Router {
  const router = Router();

  // Instanciamos las capas inyectando las dependencias
  const personajeService = new PersonajeService(em);
  const personajeController = new PersonajeController(personajeService);

  // Vinculamos los endpoints HTTP con los métodos del controlador
  router.get('/', (req, res) => personajeController.obtenerTodos(req, res));
  router.get(
    '/:id',
    validate({ schema: idParamSchema, ubicacion: 'params' }),
    (req, res) => personajeController.obtenerPorId(req, res)
  );
  router.post(
    '/',
    validate({ schema: crearPersonajeSchema }),
    (req, res) => personajeController.crear(req, res)
  );
  router.put(
    '/:id',
    validate({ schema: idParamSchema, ubicacion: 'params' }),
    validate({ schema: actualizarPersonajeSchema }),
    (req, res) => personajeController.actualizar(req, res)
  );
  router.delete(
    '/:id',
    validate({ schema: idParamSchema, ubicacion: 'params' }),
    (req, res) => personajeController.eliminar(req, res)
  );

  return router;
}
