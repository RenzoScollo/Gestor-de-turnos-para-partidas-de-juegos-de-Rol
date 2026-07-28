import { Router } from 'express';
import { PersonajeSesionController } from '../controllers/personajeSesion.controller';
import { PersonajeSesionService } from '../services/personajeSesion.service';
import { EntityManager } from '@mikro-orm/core';
import { validate } from '../middlewares/validate';
import {
  crearPersonajeSesionSchema,
  actualizarPersonajeSesionSchema,
  personajeSesionParamsSchema,
} from '../schemas/personajeSesion.schema';

export function crearPersonajeSesionRouter(em: EntityManager): Router {
  const router = Router();

  const personajeSesionService = new PersonajeSesionService(em);
  const personajeSesionController = new PersonajeSesionController(personajeSesionService);

  // Clave compuesta triple: la URL lleva las tres partes
  router.get('/', (req, res) => personajeSesionController.obtenerTodos(req, res));
  router.get(
    '/:idPersonaje/:idPartida/:numSesion',
    validate({ schema: personajeSesionParamsSchema, ubicacion: 'params' }),
    (req, res) => personajeSesionController.obtenerPorClave(req, res)
  );
  router.post(
    '/',
    validate({ schema: crearPersonajeSesionSchema }),
    (req, res) => personajeSesionController.crear(req, res)
  );
  router.put(
    '/:idPersonaje/:idPartida/:numSesion',
    validate({ schema: personajeSesionParamsSchema, ubicacion: 'params' }),
    validate({ schema: actualizarPersonajeSesionSchema }),
    (req, res) => personajeSesionController.actualizar(req, res)
  );
  router.delete(
    '/:idPersonaje/:idPartida/:numSesion',
    validate({ schema: personajeSesionParamsSchema, ubicacion: 'params' }),
    (req, res) => personajeSesionController.eliminar(req, res)
  );

  return router;
}
